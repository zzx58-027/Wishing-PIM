import { EventSchemas } from "inngest";

export const fns_schemas = new EventSchemas().fromUnion<FuncsUnionType>();

/**
 * Inngest 事件名称常量
 * 统一管理所有事件名称，避免硬编码字符串，提供类型安全
 */
export const INNGEST_EVENTS = {
  // PDF 相关事件
  PDF: {
    EXTRACT_ORDER_ITEMS: "pdf/extract.to_order_items",
    CONVERT_TO_IMG: "pdf/convert.to_img",
    EXTRACT_MAIN_BBOX: "pdf/extract.to_main_bbox",
    PARSE_TO_ZIPPED_RESULT: "pdf/parse.to_zipped_result",
  },

  // Poole FTP 相关事件
  POOLE_FTP: {
    REFRESH_USER_TOKEN: "poole-ftp/refresh.to_user_token",
  },
} as const;

type FuncsUnionType =
  | ExtractOrderItems
  | ConvertPDF2Img
  | ExtractMainFromPDF
  | GetParsedResultByMinerU
  | PooleFTP_RefreshUserToken;

/**
 * 事件名称类型
 */
export type InngestEventName =
  | typeof INNGEST_EVENTS.PDF.EXTRACT_ORDER_ITEMS
  | typeof INNGEST_EVENTS.PDF.CONVERT_TO_IMG
  | typeof INNGEST_EVENTS.PDF.EXTRACT_MAIN_BBOX
  | typeof INNGEST_EVENTS.PDF.PARSE_TO_ZIPPED_RESULT
  | typeof INNGEST_EVENTS.POOLE_FTP.REFRESH_USER_TOKEN;

// ---

type ExtractOrderItems = {
  name: typeof INNGEST_EVENTS.PDF.EXTRACT_ORDER_ITEMS;
  data: {};
};

type ConvertPDF2Img = {
  name: typeof INNGEST_EVENTS.PDF.CONVERT_TO_IMG;
  data: {};
};

type ExtractMainFromPDF = {
  name: typeof INNGEST_EVENTS.PDF.EXTRACT_MAIN_BBOX;
  data: {};
};

type GetParsedResultByMinerU = {
  name: typeof INNGEST_EVENTS.PDF.PARSE_TO_ZIPPED_RESULT;
  data: {};
};

// ---

type PooleFTP_RefreshUserToken = {
  name: typeof INNGEST_EVENTS.POOLE_FTP.REFRESH_USER_TOKEN;
  data: {};
};

/**
 * 获取所有事件名称的辅助函数
 */
export function getAllEventNames(): InngestEventName[] {
  const events: InngestEventName[] = [];

  Object.values(INNGEST_EVENTS).forEach((category) => {
    Object.values(category).forEach((eventName) => {
      events.push(eventName as InngestEventName);
    });
  });

  return events;
}

/**
 * 验证事件名称是否有效
 */
export function isValidEventName(
  eventName: string
): eventName is InngestEventName {
  return getAllEventNames().includes(eventName as InngestEventName);
}
