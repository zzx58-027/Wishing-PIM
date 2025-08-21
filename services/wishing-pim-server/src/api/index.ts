// Alova.js 统一管理服务请求

import { createAlova } from "alova";
import adapterFetch from "alova/fetch";
import { createServerTokenAuthentication } from "alova/client";
import { getContext } from "hono/context-storage";

const honoCtx = getContext<{ Bindings: Env }>();

import {
  getUserToken,
  userTokenKVPath as pooleFTPUserToken,
} from "./methods/poole-ftp";
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
          honoCtx.env.KV.put(pooleFTPUserToken, userToken);
        } catch (error) {
          throw error;
        }
      },
    },
    assignToken: async (method) => {
      method.config.headers.Authorization = `Bearer ${await honoCtx.env.KV.get(
        pooleFTPUserToken
      )}`;
    },
  });

export const poole_ftp_alova = createAlova({
  baseURL: "https://poolelighting.ftpstream.com/api/1.0",
  requestAdapter: adapterFetch(),
  // responded: (response) => response.json(),
  responded: onResponseRefreshToken((response, method) => {
    return response.json();
  }),
  beforeRequest: onAuthRequired((method) => {}),
});
