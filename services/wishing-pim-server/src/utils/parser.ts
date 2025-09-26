// XML Parser
import { XMLParser } from "fast-xml-parser";
const xmlParser = new XMLParser();
export const parseXML = (text: string) => xmlParser.parse(text);