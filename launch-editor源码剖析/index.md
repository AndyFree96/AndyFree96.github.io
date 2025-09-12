# Launch-Editor源码剖析：快速打开编辑器的实现原理


在阅读 Vite 源码的过程中，我注意到一个有趣的依赖 —— launch-editor。起初只是随手点开，结果却发现它正是支撑起「浏览器报错信息 → 一键跳转到编辑器」这一开发体验的核心工具。其实，我们在使用 Vite、Vue CLI 等工具的时候，不止一次用过这个功能：报错时点击链接，代码编辑器立刻打开到对应的文件和行号。背后的关键实现，正是 launch-editor。

<!--more-->

{{< admonition >}}
Vite 提交号为: `3676da5bc5b2b69b28619b8521fca94d30468fe5`。`launch-editor-middleware`版本为`2.10.0`，`launch-editor`版本为`2.10.0`。
{{< /admonition >}}

`vite`项目的`vite/packages/vite/src/node/server/index.ts`文件中有这么一句：

```ts
// open in editor support
middlewares.use('/__open-in-editor', launchEditorMiddleware());
```

也就是使用了`launch-editor-middleware`中间件，它会监听`/__open-in-editor`路径，并将请求转发给`launch-editor`模块。启动了 vite 应用后，我们在浏览器中如下访问：

```
http://locahost:5173/__open-in-editor?file=package.json:9
```

`launch-editor-middleware`模块的源码位于`vite/packages/vite/node_modules/launch-editor-middleware/index.js`，它主要做了两件事：

1. 解析请求参数，获取报错文件路径和行号
2. 调用`launch-editor`模块，打开编辑器并跳转到相应的文件和行号


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/launch-editor%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

