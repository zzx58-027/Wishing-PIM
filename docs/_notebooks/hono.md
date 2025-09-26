- Embedding middleware directly within app.use() can limit its reusability. Therefore, we can separate our middleware into different files. To ensure we don't lose type definitions for context and next, when separating middleware, we can use createMiddleware() from Hono's factory. This also allows us to type-safely access data we've set in Context from downstream handlers.
  - `createMiddleware<{Bindings: Bindings}>(async (c, next) =>`
- 为什么引入的 Hono 既可以作为值, 又可以作为类型?
  ```ts
  import { Hono } from "hono";
  export { Hono } from "hono";
  // 
  const app = new Hono<{ Bindings: Env }>();
  const honoErrorHandleLogic = (app: Hono<{ Bindings: Env }>) => {
  ```
  - 是因为 TS 的类型/值双重导出模型. class Hono 定义了一个 值（运行时会生成一个构造函数，能 new 出实例）。同时，class 也会自动声明一个同名的类型，它表示由这个类生成的实例类型，还能带上泛型参数。
- 你可以结合 app.route, 实现组路由功能, 这可以分散 main.ts 中的路由定义, 避免路由定义过于臃肿.
  ```ts
  const book = new Hono()
  book.get('/', xxx)....
  //
  const app = new Hono()
  app.route('/book', book)
  ```
  - 还有 Grouping without changing base: `const user = new Hono().basePath('/user')`
    - 这可以在不改变 basePath 的情况下, 实现分组路由. 例如:
    ```ts
    const user = new Hono().basePath('/user')
    user.get('/:id', (c) => {
      const id = c.req.param('id')
      return c.json({ id })
    })
    ```