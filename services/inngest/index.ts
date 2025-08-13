import { serve } from "inngest/bun";
import { inngest } from "./src/clients/";
import { poole_ftp_funcs } from "./src/funcs/poole-ftp";

console.log("App `Inn-TS` is running on: http://host.docker.internal:3001/api/inngest")


Bun.serve({
  port: 3001,
  fetch(req: Request) {
    const url = new URL(req.url);

    if (url.pathname === "/api/inngest") {
      return serve({
        client: inngest,
        functions: [...poole_ftp_funcs],
      })(req);
    }

    return new Response("Not Found", { status: 404 });
  },
});
