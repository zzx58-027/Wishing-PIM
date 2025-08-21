import { inngest } from "../../client";
import { pooleFTP_Config, INNGEST_EVENTS } from "../../../configs";

export const inngest_getUserToken = inngest.createFunction(
  {
    id: "poole-ftp/get_user_token",
  },
  { event: INNGEST_EVENTS.POOLE_FTP.REFRESH_USER_TOKEN },
  async ({ step, event, env }) => {
    const basic_auth = env.POOLE_FTP_LOGIN_BASIC_AUTH;
    const res = await step.fetch(pooleFTP_Config.poole_ftp_api_maps.login, {
      method: "GET",
      headers: {
        Authorization: `Basic ${basic_auth}`,
      },
    });

    const user_token = await step.run(
      "Extract user token from response",
      async () => {
        // Record: 方括号表示法和点运算符 区别.
        const res_result = await res.json();
        let user_token = res_result["session_id"];
        if (!res.ok) {
          throw new Error("Login failed.", {
            cause: `${res.status} - ${res_result["message"]}.`,
          });
        }
        return user_token;
      }
    );

    await step.run("Save user token to KV", async () => {
      const user_token_KV_path = pooleFTP_Config.user_token_kv_path;
      await env.KV.put(user_token_KV_path, user_token);
      return `Saved User Token to KV, path: ${user_token_KV_path}`;
      // console.log("zzx58:" + (await env.KV.get("poole-ftp/user_token")));
    });

    return user_token;
  }
);
