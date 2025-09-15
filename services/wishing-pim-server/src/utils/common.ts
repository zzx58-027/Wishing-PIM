import { XMLParser } from "fast-xml-parser";

export { randomUUID } from "crypto";

const xmlParser = new XMLParser();

export const parseXML = (text: string) => xmlParser.parse(text);
