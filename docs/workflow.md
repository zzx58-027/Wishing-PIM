PDF - (ConvertPDF2Img) -> Img
PDF - (ConvertPDF2Img) -> Img -> (ExtractMainFromPDF) -> Bbox_Text
PDF -> S3_url
PDF -> S3_url -> GetParsedResultByMinerU
GetParsedResultByMinerU -> ParsedResult
Value - (CF_SetValue) -> CF_KV
CF_KV - (CF_GetValue) -> Value
PooleFTP_API - (RefreshUserToken) -> Value - (CF_SetValue) -> CF_KV
CF_KV - (CF_GetValue) -> Value -> PooleFTP_API - (GetFilesList) -> JSON

