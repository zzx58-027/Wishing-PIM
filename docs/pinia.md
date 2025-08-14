请注意，你必须在为Pinia设置的存储中返回所有状态属性，以便Pinia将它们识别为状态。换句话说，存储中不能有私有状态属性。不返回所有状态属性或使其只读将破坏SSR、devtools和其他插件。

与选项式存储相比，setup存储带来了更多的灵活性，因为你可以在存储中创建监听器并自由使用任何组合式函数。但是，请记住，在使用SSR时，使用组合式函数会变得更加复杂。

setup存储还能够依赖全局提供的属性，如路由器或路由。在应用程序级别提供的任何属性都可以像在组件中一样，使用inject()从存储中访问：

```ts
// `name` and `doubleCount` are reactive refs
// This will also extract refs for properties added by plugins
// but skip any action or non reactive (non ref/reactive) property
const { name, doubleCount } = storeToRefs(store)
// the increment action can just be destructured
const { increment } = store
```