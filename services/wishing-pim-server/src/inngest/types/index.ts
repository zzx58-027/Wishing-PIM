import { EventSchemas } from "inngest";
export const schemas = new EventSchemas().fromUnion<FuncsUnionType>();

type FuncsUnionType =
  | ExtractOrderItems
  | ConvertPDF2Img
  | ExtractMainFromPDF
  | GetParsedResultByMinerU
  | PooleFTP_RefreshUserToken;

// ---

type ExtractOrderItems = {
  name: "pdf.extract.to_order_items";
  data: {};
};

type ConvertPDF2Img = {
  name: "pdf.convert.to_img";
  data: {};
};

type ExtractMainFromPDF = {
  name: "pdf.extract.to_main_bbox";
  data: {};
};

type GetParsedResultByMinerU = {
  name: "pdf.parse.to_zipped_result";
  data: {};
};

// ---

type PooleFTP_RefreshUserToken = {
  name: "poole-ftp.refresh.to_user_token";
  data: {};
};
