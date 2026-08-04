# chokidar源码剖析：一个跨平台文件监听库的设计与实现


在现代前端工程和Node.js应用开发中，文件监听是一项非常基础但又机器重要的能力。无论是：

- Vite的热更新(HMR)
- TypeScript的增量编译
- ESLint、Prettier等工具的自动检查
- IDE对文件变化的实时响应

这些功能的背后都离不开一个核心能力：**如何可靠地感知文件系统的变化？**Node.js原生提供了`fs.watch`和`fs.watchFile`用于监听文件变化，但它们在实际工程环境中存在大量问题：

- 不同操作系统行为不一致
- 高频文件变化容易产生大量重复事件
- 大规模目录监听存在性能压力
- 文件新增、删除、重命名事件处理复杂
- Linux、MacOS、Windows文件事件模型完全不同

因此，工程实践中需要一个更加稳定、统一的抽象层。[chokidar](https://github.com/paulmillr/chokidar)正是这样的背景下诞生的。它基于Node.js原生文件监听能力，并针对不同平台进行了大量优化，为开发者提供了一套简单统一的API。本文将通过源码剖析的方式，逐步拆解chokidar的实现原理。

<!--more-->

## 为什么需要chokidar？

## 番外

## 推荐

## 参考

---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/chokidar%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

