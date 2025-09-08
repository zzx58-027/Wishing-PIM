bun create cloudflare@latest -- --type openapi

异常处理： 可以在句柄方法中引发自定义异常，以发出特定的错误条件。Chanfana 提供了 ApiException、InputValidationException 和 NotFoundException 等基本异常类，您可以使用或扩展它们来创建自己的特定于 API 的异常。可以将这些异常配置为自动生成适当的错误响应和错误响应的 OpenAPI 架构定义。

OpenAPI 路由方法：get（）、post（）、put（）、delete（）、patch（）、all（）、on（）、route（） 方法被扩展为处理 OpenAPIRoute 类并自动注册它们以进行 OpenAPI 文档和验证。