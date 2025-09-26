// 利用 JS ESM 机制 全局缓存 pooleFTP_Token, 避免重复请求获取 token.
let pooleFTP_Token: string | null = null;
// 利用 JS ESM 机制实现单例, 因为需要异步, class 的实现方式相较之下比较复杂.
let pooleFTP_AxiosClient: AxiosInstance | null = null;

const pooleFTP_Config = {
  userTokenKV_Path: "/services/poole-ftp/user_token",
  baseURL: "https://poolelighting.ftpstream.com/api/1.0/",
  endpoints: {
    getUserToken: "session/login",
    getFilesList: "files/list",
    getFilesDownloadUrl: "files/download",
  },
};

/**
 * @field docType: 结合实际服务文件路径管理形式, 根据请求路径设定文件的类型, 主要表示文件来源.
 * @filed docFullPath: 业务实用字段.
 * @description 使用 zod 进行定义, 因为需要供 OpenAPI 使用, OpenAPI schema 需要为值类型.
 * 另外因 chanfana 3.0^TM 因此需要 zod3 而不是 zod4.
 */
export const PooleFTP_FileZodObj = z.object({
  type: z.string(), // file (f) or folder (d)
  name: z.string(),
  size: z.number(),
  time: z.number(),
  perm: z.number(),
  owner: z.number(),
  // // Extra useful attrs.
  docType: z.string(),
  docFullPath: z.string(),
});
export type PooleFTP_FileSchema = zodType.infer<typeof PooleFTP_FileZodObj>;

export class PooleFTP_Client {
  private axiosClient: AxiosInstance | null = null;
  private pQueue: PQueueType | null = null;
  private cEnv: Env | null = null;
  constructor(cEnv: Env) {
    this.cEnv = cEnv;

    // 利用 JS ESM 机制实现单例, 因为需要异步, class 的实现方式相较之下比较复杂.
    this.axiosClient = getPooleFTP_AxiosInstance(cEnv);

    this.pQueue = new PQueue({
      // 并发数可以设置得高一些，因为速度主要由 interval/intervalCap 限制
      // concurrency 防止系统或应用同时处理过多任务而导致内存溢出、CPU 饱和。
      concurrency: 27,
      // 时间窗口长度
      interval: 1580,
      // 在 interval 时间窗口的长度中, 最多执行多少次任务.
      // intervalCap 防止在短时间内向外部服务（如 API）发送过多请求而导致被服务器限流。
      intervalCap: 5,
    });
  }
  static async getUserToken(cEnv: Env) {
    const { session_id: userToken } = await fetch(
      pooleFTP_Config.baseURL + pooleFTP_Config.endpoints.getUserToken,
      {
        headers: {
          Authorization: `Basic ${cEnv.POOLE_FTP_LOGIN_BASIC_AUTH}`,
        },
      }
    ).then<{ session_id: string }>((resp) => resp.json());
    return userToken;
  }
  async getFilesList(path: string) {
    try {
      const rawFilesList = await this.axiosClient
        .post<{
          files: Omit<PooleFTP_FileSchema, "docType" | "docFullPath">[];
        }>(pooleFTP_Config.endpoints.getFilesList, {
          path,
        })
        .then((resp) => resp.data.files);
      return rawFilesList.map((file) => {
        return {
          ...file,
          // 如果 path 是空字符串 ""，split("/") 会返回 [""]，.at(-1) 将取到 ""，最终结果为 doc_type: "" || "/"（即 "/"）。
          doc_type: path.split("/").at(-1) || "/",
          doc_full_path:
            path === "/" ? `/${file.name}` : `${path}/${file.name}`,
        };
      });
    } catch (e) {
      // throw e;
      throw new NotFoundException(
        "Resource not found. Please validate input parameters and target resource existence."
      );
    }
  }
  async getFilesDownloadUrl(filePathList: string[]) {
    try {
      return await this.axiosClient
        .post<{ link: string }>(pooleFTP_Config.endpoints.getFilesDownloadUrl, {
          files: filePathList,
        })
        .then((resp) => resp.data.link);
    } catch (e) {
      // throw e
      throw new NotFoundException(
        `File not found. Please validate input parameters and URL resource existence. ${e}`
      );
    }
  }
  async downloadFiles(downloadURL: string) {
    try {
      // 原生 fetch 版本
      // return fetch(downloadURL, {
      //   headers: {
      //     Authorization: `Bearer ${pooleFTP_Token}`,
      //   }
      // })
      // Axios 版本
      const resp = await this.axiosClient.get(downloadURL, {
        responseType: "stream",
      });
      return resp;
    } catch (e) {
      // throw e;
      throw new NotFoundException(
        // Resource 统称代替 File/Files 的单复数准确性问题.
        `Resource not found. Please validate input parameters and URL resource existence. ${e}`
      );
    }
  }
  /**
   *
   * @param path
   * @deprecated 没有速率限制, 容易被 ban, 因此弃用.
   * @description 同步深度递归 Synchronously
   * @description 因为涉及缓存等概念, 所以聚合搜索需要结合 cf-do, 但是本类更类似工具, 需要便于使用, 因此将创建新 CF-DO Class. 遍历获取可以集成在本类中.
   * @description "/": 566.7 KB; 28.6 s;
   * @description serverless(0.05vCPU, 0.125GB, 3req/d, 23000ms/req): 21537ms; 47.53MB; 0.0106 CNY/M, 120 CU/M;
   */
  async getFilesRecursively(path = "/") {
    // 从根路径开始, 遍历获取所有文件, 文件夹的 type 为 d, 文件为 f
    const items = await this.getFilesList(path);
    let result = [];
    const files = items.filter((item) => item.type === "f");
    result.push(...files);
    const folders = items.filter((file) => file.type === "d");
    for (const folder of folders) {
      const subFiles = await this.getFilesRecursively(folder.doc_full_path);
      result.push(...subFiles);
    }
    return result;
  }
  /**
   *
   * @param path
   * @deprecated cf-worker 限制了 fetch 请求数量为 50, paid plan 为 1000. 因此本函数无法在 cf-worker 环境下使用, 考虑使用外部 serverless 函数.
   * @description "/": 566.7 KB; 28.6 s;
   * @description 这个内部递归调用也会在其内部将自己的 getFilesList 操作再次放入并发队列中. 这确保了所有目录列表操作都受到并发队列的控制.
   */
  async getFilesRecursivelyWithConcurrentQueue(path = "/") {
    // const items = await this.getFilesList(path);
    const items = await this.pQueue.add(() => this.getFilesList(path));
    let result = [];
    if (items) {
      const files = items.filter((item) => item.type === "f");
      result.push(...files);
      const folders = items.filter((file) => file.type === "d");
      // 创建所有子文件夹的并发请求 Promise 数组
      const recursivePromises = folders.map((folder) => {
        // 对每个文件夹，调用递归函数并返回一个 Promise
        return this.getFilesRecursivelyWithConcurrentQueue(
          folder.doc_full_path
        );
      });
      // 等待所有子文件夹的递归请求完成
      const subFiles = await Promise.all(recursivePromises);
      // 将所有子文件夹的文件合并到结果中
      result.push(...subFiles.flat());
      return result;
    }
  }

  // External Serverless Func
  async getAllFiles() {
    const getAllFilesUrl =
      "https://pooleftursively-ypljwqpoeo.cn-beijing.fcapp.run/";
    const resp = await this.axiosClient.get(getAllFilesUrl, {
      headers: {
        Authorization: `Basic ${this.cEnv.ALI_FC_BASIC_AUTH}`,
      },
    });
    return resp.data;
  }
}

// 利用 JS ESM 机制实现单例, 因为需要异步, class 的实现方式相较之下比较复杂.
export const getPooleFTP_AxiosInstance = (cEnv: Env) => {
  if (!pooleFTP_AxiosClient) {
    pooleFTP_AxiosClient = axios.create({
      baseURL: pooleFTP_Config.baseURL,
      timeout: 10000,
    });
    pooleFTP_AxiosClient.interceptors.request.use(async (config) => {
      // 如果应用的 token 为空, 则从 KV 获取 token.
      if (!pooleFTP_Token) {
        const token = await cEnv.KV.get(pooleFTP_Config.userTokenKV_Path);
        if (token) pooleFTP_Token = token;
        // 如果 KV 上的 token 为空, 则请求获取新 token.
        if (!token) pooleFTP_Token = await PooleFTP_Client.getUserToken(cEnv);
      }
      config.headers.Cookie = `token=${pooleFTP_Token}`;
      return config;
    });
    pooleFTP_AxiosClient.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        console.log(error);
        if (error.response?.status === 401) {
          // 走到报错环节, 说明 KV 上的 token 过期, 获取新 token.
          pooleFTP_Token = await PooleFTP_Client.getUserToken(cEnv);
          error.config.headers.Cookie = `token=${pooleFTP_Token}`;
          return pooleFTP_AxiosClient?.request(error.config);
        }
        throw error;
      }
    );
  }
  return pooleFTP_AxiosClient;
};
