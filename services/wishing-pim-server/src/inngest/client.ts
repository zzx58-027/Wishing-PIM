import { Inngest } from "inngest";
import { fns_schemas } from "../archive/types";
import { honoBindingsMiddleware } from "./middlewares";

export const inngest = new Inngest({
  id: "cf-ts-wishing-pim",
  schemas: fns_schemas,
  middleware: [honoBindingsMiddleware],
});

// export let inngestSingleton: Inngest | null = null;

// export const getInngest = (env: Env) => {
//   if (!inngestSingleton) {
//     inngestSingleton = new Inngest({
//       id: "cf-ts-wishing-pim",
//       schemas: fns_schemas,
//       middleware: [honoBindingsMiddleware],
//       baseUrl: env.INNGEST_BASE_URL,
//       eventKey: env.INNGEST_EVENT_KEY,
//     });
//   }
//   return inngestSingleton;
// };
