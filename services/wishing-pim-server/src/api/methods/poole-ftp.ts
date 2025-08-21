import { Context } from "hono";
import { createAlova } from "alova";
import adapterFetch from "alova/fetch";
import { z } from "zod";
import { createServerTokenAuthentication } from "alova/client";

const userTokenKVPath = "/services/poole-ftp/user_token";

// 全局变量存储当前上下文，用于 Alova 钩子中访问
let honoCtx: Context<{ Bindings: Env }> | null = null;
// 创建 pooleFTP 中间件工厂函数
export const pooleFTPServiceMiddleware = () => {
  return async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
    honoCtx = c;
    await next();
  };
};

// ---

// 创建认证配置，使用延迟初始化避免循环依赖
const { onAuthRequired, onResponseRefreshToken } =
  createServerTokenAuthentication({
    refreshTokenOnSuccess: {
      metaMatches: {
        getUserToken: true,
      },
      isExpired: (response, method) => {
        return response.status === 401;
      },
      handler: async (response, method) => {
        try {
          const { session_id: userToken } = await getUserToken();
          await honoCtx.env.KV.put(userTokenKVPath, userToken);
        } catch (error) {
          throw error;
        }
        return response.json();
      },
    },
    // 通常，我们会在beforeRequest附加 token 到请求信息中。在 Token 认证拦截器中提供了assignToken回调函数用于附加 token，
    // 它会过滤访客请求和登录请求，并在请求前触发，也可以达到统一维护身份认证代码的目的。
    // Notice!!! 只会过滤 访客 和 登录 请求, 因此前面 getUserToken 的请求没有被过滤, 因为它并不是 访客和登录请求 !!
    assignToken: async (method) => {
      // 如果是 getUserToken 请求，跳过 token 添加（因为它本身就是用来获取 token 的）
      if (method.meta?.getUserToken) {
        return;
      }
      const token = await honoCtx.env.KV.get(userTokenKVPath);
      method.config.headers.Authorization = `Bearer ${token}`;
    },
  });

// 单例 Alova 实例，避免重复创建导致策略机制失效
const pooleFTPAlova = createAlova({
  baseURL: "https://poolelighting.ftpstream.com/api/1.0",
  requestAdapter: adapterFetch(),
  // 因为内部操作有异步, 所以不要忘记传递 async 环境给 createServerTokenAuthentication.
  beforeRequest: onAuthRequired(async (method) => {}),
  responded: onResponseRefreshToken(async (response, method) => {
    return response.json();
  }),
});

// ---

export const getUserToken = () => {
  const method = pooleFTPAlova.Get<{ session_id: string }>("/session/login", {
    headers: {
      Authorization: `Basic ${honoCtx.env.POOLE_FTP_LOGIN_BASIC_AUTH}`,
    },
  });
  method.meta = {
    getUserToken: true,
  };
  return method;
};

// Zod schema 定义
export const PooleFTPFileSchema = z.object({
  type: z.string(),
  name: z.string(),
  size: z.number(),
  time: z.number(),
  perm: z.number(),
  owner: z.number(),
});
// 从 Zod schema 推导出 TypeScript 类型
type PooleFTPFile = z.infer<typeof PooleFTPFileSchema>;
// 获取 getFilesList 方法 await 解析后的成功返回类型
export type GetFilesListAwaitedResultType = Awaited<
  ReturnType<typeof getFilesList>
>;
export const getFilesList = (path: string) => {
  const method = pooleFTPAlova.Post(
    "/files/list",
    { path },
    {
      // 当响应数据需要再调用transform转换，那就需要在转换函数参数中指定类型，然后它的返回值类型将会作为响应数据类型。
      transform(rawData: { files: PooleFTPFile[] }, headers) {
        return rawData.files.map((file) => ({
          ...file,
          doc_type: path.split("/").at(-1) || "/",
          doc_full_path:
            path === "/" ? `/${file.name}` : `${path}/${file.name}`,
        }));
      },
    }
  );
  return method;
};

export const getFilesDownloadUrl = (files: string[]) => {
  const method = pooleFTPAlova.Post(
    "/files/download",
    { files },
    {
      transform(rawData: { link: string }, headers) {
        let file_name =
          files.length === 1
            ? files[0].split("/").at(-1)
            : `Poole-FTP Files Download - ${files[0]
                .split("/")
                .slice(0, -1)
                .join("/")}.zip`;
        return {
          download_url: rawData.link,
          file_name,
        };
      },
    }
  );
  return method;
};
