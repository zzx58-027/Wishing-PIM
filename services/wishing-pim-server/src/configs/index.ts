export { INNGEST_EVENTS } from "../inngest/types";

export const pooleFTP_Config = {
  poole_ftp_api_maps: {
    login: "https://poolelighting.ftpstream.com/api/1.0/session/login",
    logout: "https://poolelighting.ftpstream.com/api/1.0/session/logout",
    get_files_list: "https://poolelighting.ftpstream.com/api/1.0/files/list",
    download_files:
      "https://poolelighting.ftpstream.com/api/1.0/files/download",
  },
  user_token_kv_path: "/poole-ftp/user_token",
};
