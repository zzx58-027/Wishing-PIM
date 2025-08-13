// import { config } from "dotenv";
// import { resolve } from "path";
// config({ path: resolve(import.meta.dir, "../../../.env") });
// console.log(process.env.POOLE_FTP_LOGIN_USERNAME);

import { NonRetriableError } from "inngest";
import { inngest } from "../../clients";
import { format } from "date-fns";

const api_maps = {
  login: "https://poolelighting.ftpstream.com/api/1.0/session/login",
  logout: "https://poolelighting.ftpstream.com/api/1.0/session/logout",
  get_files_list: "https://poolelighting.ftpstream.com/api/1.0/files/list",
  download_files: "https://poolelighting.ftpstream.com/api/1.0/files/download",
};

export const inn_getUserToken = inngest.createFunction(
  {
    id: "poole-ftp/get_user_token",
  },
  { event: "poole-ftp.get_user_token" },
  async ({ step, event }) => {
    const { username, password } = event.data;
    const basic_auth = btoa(`${username}:${password}`);
    const res = await step.fetch(api_maps.login, {
      method: "GET",
      headers: {
        // process.env.POOLE_FTP_LOGIN_BASIC_AUTH
        Authorization: `Basic ${basic_auth}`,
      },
    });

    return await step.run("Extract user token from response", async () => {
      // Record: 方括号表示法和点运算符 区别.
      const res_result = await res.json();
      let user_token = res_result["session_id"];
      if (!res.ok) {
        throw new Error("Login failed.", {
          cause: `${res.status} - ${res_result["message"]}.`,
        });
      }
      return user_token;
    });
  }
);

export const inn_getFilesList = inngest.createFunction(
  {
    id: "poole-ftp/get_files_list",
  },
  { event: "poole-ftp.get_files_list" },
  async ({ step, event }) => {
    const { path, username, password } = event.data;
    const user_token = await step.invoke("get-user-token", {
      function: inn_getUserToken,
      data: {
        username: username ?? process.env.POOLE_FTP_LOGIN_USERNAME,
        password: password ?? process.env.POOLE_FTP_LOGIN_PASSWORD,
      },
    });
    const res = await step.fetch(api_maps.get_files_list, {
      method: "POST",
      headers: {
        Cookie: `token=${user_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
      }),
    });
    return await step.run("Extract fetched files list.", async () => {
      const res_result = await res.json();
      if (!res.ok) {
        throw new NonRetriableError("Get files list failed.", {
          cause: `${res.status} - ${res_result["message"]}.`,
        });
      }
      return res_result["files"];
    });
  }
);

export const inn_returnFilesDownloadLink = inngest.createFunction(
  {
    id: "poole-ftp/return_files_download_link",
    retries: 2,
  },
  { event: "poole-ftp.return_files_download_link" },
  async ({ step, event }) => {
    const { files, username, password } = event.data;
    await step.run("Get file or files name", async () => {});
    const user_token = await step.invoke("get-user-token", {
      function: inn_getUserToken,
      data: {
        username: username ?? process.env.POOLE_FTP_LOGIN_USERNAME,
        password: password ?? process.env.POOLE_FTP_LOGIN_PASSWORD,
      },
    });
    const res = await step.fetch(api_maps.download_files, {
      method: "POST",
      headers: {
        Cookie: `token=${user_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files,
      }),
    });
    return await step.run("Return files download link", async () => {
      const file_name =
        files.length === 1
          ? files[0]?.split("/").at(-1)
          : `Files-Download ${format(new Date(), "yyyy-MM-dd HH:mm")}.zip`;
      const res_result = await res.json();
      if (!res.ok) {
        throw new Error(
          `Get Files Download Link Failed. Reason: ${res_result["status"]} - ${res_result["message"]}`
        );
      }
      return {
        file_name,
        link: res_result["link"],
      };
    });
  }
);

export const poole_ftp_funcs = [
  inn_getUserToken,
  inn_getFilesList,
  inn_returnFilesDownloadLink,
];
