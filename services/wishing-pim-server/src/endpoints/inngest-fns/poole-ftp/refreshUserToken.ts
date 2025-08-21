import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

import { INNGEST_EVENTS } from "../../../configs";
import { inngest } from "../../../inngest/client";

type AppContext = Context<{ Bindings: Env }>;

const fetchInngestEventResult = async ({
  inngestBaseURL,
  inngestSigningKey,
  inngestEventID,
}: {
  inngestBaseURL: string;
  inngestEventID: string;
  inngestSigningKey: string;
}) => {
  const response = await fetch(
    inngestBaseURL + `/v1/events/${inngestEventID}/runs`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${inngestSigningKey}`,
      },
    }
  );
  const json = await response.json();
  console.log("zzx58:", json, inngestEventID)
  return json["data"];
};

export default class RefreshUserToken extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP", "Inngest"],
    summary: "Refresh Poole-FTP user token.",
    request: {},
    responses: {
      "200": {
        description: "Poole-FTP userToken refresh event sent.",
        content: {
          "application/json": {
            schema: z.object({
              userToken: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const { ids } = await inngest.send({
      name: INNGEST_EVENTS.POOLE_FTP.REFRESH_USER_TOKEN,
      data: {},
    });
    const userToken = await fetchInngestEventResult({
      inngestBaseURL: c.env.INNGEST_BASE_URL,
      inngestSigningKey: c.env.INNGEST_SIGNING_KEY,
      inngestEventID: ids[0],
    });
    return {
      userToken,
    };
  }
}
