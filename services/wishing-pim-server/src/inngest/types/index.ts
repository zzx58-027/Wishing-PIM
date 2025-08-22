import { EventSchemas } from "inngest";

/**
 * Inngest 事件定义
 * 使用更结构化的方式定义事件，包含事件名称和数据类型
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
    // 预留给未来的 FTP 相关事件
  },
} as const;

/**
 * 从事件常量中自动推导出所有事件名称的联合类型
 */
type ExtractEventNames<T> = T extends Record<string, Record<string, infer U>>
  ? U
  : never;

export type InngestEventName = ExtractEventNames<typeof INNGEST_EVENTS>;

/**
 * 事件数据类型定义
 */
export interface InngestEventData {
  // PDF 相关事件数据
  [INNGEST_EVENTS.PDF.EXTRACT_ORDER_ITEMS]: {
    fileId: string;
    filePath: string;
    userId?: string;
  };
  
  [INNGEST_EVENTS.PDF.CONVERT_TO_IMG]: {
    fileId: string;
    filePath: string;
    outputFormat?: 'png' | 'jpg';
    quality?: number;
  };
  
  [INNGEST_EVENTS.PDF.EXTRACT_MAIN_BBOX]: {
    fileId: string;
    filePath: string;
    pageNumber?: number;
  };
  
  [INNGEST_EVENTS.PDF.PARSE_TO_ZIPPED_RESULT]: {
    fileId: string;
    filePath: string;
    outputPath?: string;
  };
}

/**
 * 事件类型定义 - 使用泛型提供更好的类型安全
 */
export type InngestEvent<T extends InngestEventName = InngestEventName> = {
  name: T;
  data: T extends keyof InngestEventData ? InngestEventData[T] : Record<string, unknown>;
};

/**
 * 具体事件类型别名
 */
export type ExtractOrderItemsEvent = InngestEvent<typeof INNGEST_EVENTS.PDF.EXTRACT_ORDER_ITEMS>;
export type ConvertPDF2ImgEvent = InngestEvent<typeof INNGEST_EVENTS.PDF.CONVERT_TO_IMG>;
export type ExtractMainFromPDFEvent = InngestEvent<typeof INNGEST_EVENTS.PDF.EXTRACT_MAIN_BBOX>;
export type GetParsedResultByMinerUEvent = InngestEvent<typeof INNGEST_EVENTS.PDF.PARSE_TO_ZIPPED_RESULT>;

/**
 * 所有事件类型的联合类型
 */
export type AllInngestEvents = 
  | ExtractOrderItemsEvent
  | ConvertPDF2ImgEvent
  | ExtractMainFromPDFEvent
  | GetParsedResultByMinerUEvent;

/**
 * 事件模式定义
 */
export const fns_schemas = new EventSchemas().fromUnion<AllInngestEvents>();

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
 * 事件名称验证函数
 * 1. 运行时验证事件名称的有效性
 */
export function isValidEventName(eventName: string): eventName is InngestEventName {
  return getAllEventNames().includes(eventName as InngestEventName);
}
