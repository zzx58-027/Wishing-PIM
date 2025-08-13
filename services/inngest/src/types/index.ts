import { EventSchemas } from "inngest";

type FuncsUnionType =
  | PooleFTP_GetUserToken
  | PooleFTP_GetFilesList
  | PooleFTP_DownloadFiles
  | ExtractOrderItems
  | ExtractMainBBOX
  | GetParsedSpecByMinerU;

type ExtractOrderItems = {
  name: "pdf/extract_order_items";
  data: {};
};

type ExtractMainBBOX = {
  name: "pdf/extract_main_bbox";
  data: {};
};

type GetParsedSpecByMinerU = {
  name: "pdf/parse_by_mineru";
  data: {};
};

type PooleFTP_GetUserToken = {
  name: "poole-ftp.get_user_token";
  data: {
    username?: string;
    password?: string;
  };
};

type PooleFTP_GetFilesList = {
  name: "poole-ftp.get_files_list";
  data: {
    path: string;
    username?: string;
    password?: string;
  };
};

type PooleFTP_DownloadFiles = {
  name: "poole-ftp.return_files_download_link";
  data: {
    files: string[];
    username?: string;
    password?: string;
  };
};

export const schemas = new EventSchemas().fromUnion<FuncsUnionType>();
