import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import { contextStorage } from 'hono/context-storage'

import { serve as inngestServe } from "inngest/hono";
import { inngest } from "./inngest/client";

import * as inngestFuncs from "./inngest/funcs";
import * as pooleFtpEndpoints from "./endpoints/poole-ftp/index";
import * as inngestEndpoints from "./endpoints/inngest-fns/index";

const app = new Hono<{ Bindings: Env }>();
app.use(
  "/*",
  cors({
    origin: "*",
  })
);
app.use(
  prettyJSON({
    space: 4,
  })
);
app.use(logger());
app.use(contextStorage())

app.on(["GET", "PUT", "POST"], "/api/inngest", (c) => {
  return inngestServe({
    client: inngest,
    functions: inngestFuncs.allFunctions,
    // signingKey: c.env.INNGEST_SIGNING_KEY,
  })(c);
});

const openapi = fromHono(app, {
  docs_url: "/",
});
openapi.post("/poole-ftp/get-files-list", pooleFtpEndpoints.GetFilesList);
openapi.post(
  "/poole-ftp/get-files-download-url",
  pooleFtpEndpoints.GetFilesDownloadUrl
);
// openapi.get(
//   "/inngest/poole-ftp/refresh-user-token",
//   inngestEndpoints
// );

export default app;
