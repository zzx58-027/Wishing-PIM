import { Hono } from "hono";
import { fromHono } from "chanfana";
export const getOpenAPI_Instance = (app: Hono<{ Bindings: Env }>) =>
  fromHono(app, {
    docs_url: "/",
    schema: {
      servers: [
        {
          url: "http://localhost:5174",
          description: "Development server",
        },
        {
          url: "https://wishing-pim-server.8742236.workers.dev",
          description: "Production server",
        },
      ],
      tags: [
        { name: "Poole-FTP", description: "Operations related to Poole-FTP" },
        {
          name: "S3",
          description: "S3 Related Endpoints",
        },
        {
          name: "Webhooks",
          description: "General External services webhook callback handlers.",
        },
        {
          name: "Test",
          description: "Test",
        },
      ],
      info: {
        title: "Wishing-PIM OpenAPI",
        version: "1.0.0",
        description: "Documentation for Wishing-PIM.",
        contact: {
          name: "zzx58-027 (Freaky Forward.)",
          url: "https://github.com/zzx58-027",
        },
        license: {
          name: "Apache 2.0",
          url: "https://www.apache.org/licenses/LICENSE-2.0.html",
        },
      },
    },
  });
