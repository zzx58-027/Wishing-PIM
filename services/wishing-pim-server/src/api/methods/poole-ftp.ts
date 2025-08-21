import { poole_ftp_alova } from "../index";

export const userTokenKVPath = "/services/poole-ftp/user_token";

export const getUserToken = () => {
  const method = poole_ftp_alova.Get<{ session_id: string }>("/session/login");
  method.meta = {
    getUserToken: true,
  };
  return method;
};

type PooleFTPFile = {
  type: string;
  name: string;
  size: number;
  time: number;
  perm: number;
  owner: number;
};
export const getFilesList = (path: string) => {
  const method = poole_ftp_alova.Post(
    "/files/list",
    { path },
    {
      // 当响应数据需要再调用transform转换，那就需要在转换函数参数中指定类型，然后它的返回值类型将会作为响应数据类型。
      transform(rawData: { files: PooleFTPFile[] }, headers) {
        return rawData.files.map((file) => {
          return {
            ...file,
            doc_type: path.split("/").at(-1),
            doc_full_path: [path, file.name].join("/"),
          };
        });
      },
    }
  );
  return method;
};

export const getFilesDownloadUrl = (files: string[]) => {
  const method = poole_ftp_alova.Post(
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
