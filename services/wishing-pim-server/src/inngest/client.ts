import { Inngest } from "inngest";
import { fns_schemas } from './types/index'
import { honoBindingsMiddleware } from "./middlewares";

export const inngest = new Inngest({
    id: "cf-ts-wishing-pim",
    schemas: fns_schemas,
    middleware: [honoBindingsMiddleware]
});