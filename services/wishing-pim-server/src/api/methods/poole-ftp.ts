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
  const method = poole_ftp_alova.Post<{ files: PooleFTPFile[] }>(
    "/files/list",
    {
      path,
    }
  );
  return method;
};

export const getFilesDownloadUrl = (files: string[]) => {
  const method = poole_ftp_alova.Post<{ link: string }>("/files/download", {
    files,
  });
  return method;
};
