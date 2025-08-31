# 如何调试Vue项目


在开发 Vue 应用的过程中，调试是确保项目稳定性和高效性的关键步骤。无论是开发环境中的小问题，还是生产环境中的复杂 bug，合理的调试方法都能大大提升开发效率并减少错误发生的概率。本文将深入探讨 Vue 项目调试的常见技巧与工具，从基础的调试方法到进阶的技术方案，为开发者提供一个系统化的调试框架。通过合理的调试策略，开发者能够快速定位问题，并对症下药，确保项目的顺利进行。

<!--more-->

## 调试准备

相关环境

- 编辑器: VSCode
- Node 版本: 20.10.0
- 包管理器: cnpm 9.2.0

## 创建项目

参考[Vue 官方文档](https://vuejs.org/guide/quick-start.html)，使用`cnpm`快速创建项目:

```bash
cnpm create vue@latest

```

![](/images/202503/1/1.png)

## 运行项目

在终端运行如下命令，启动项目:

```bash
npm run dev
```

![](/images/202503/1/2.png)

此时我们可以使用 Vue DevTools 工具进行调试，或者配置 VSCode 进行调试。

## VSCode 调试

创建调试配置文件`.vscode/launch.json`，添加一个调试配置:

![](/images/202503/1/3.png)

`.vscode/launch.json`内容如下:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

![](/images/202503/1/4.png)

点击调试按钮，即可启动调试。

![](/images/202503/1/5.png)

## 推荐

[如何优雅的调试 Vue 项目？](https://blog.csdn.net/Cyj1414589221/article/details/136627666)

[Debugging Magic with Vue Devtools](https://vueschool.io/articles/vuejs-tutorials/debugging-magic-with-vue-devtools/)

[Decoding 14 Vue.js errors: A Vue.js debugging guide](https://www.zipy.ai/blog/vue-js-errors)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E5%A6%82%E4%BD%95%E8%B0%83%E8%AF%95vue%E9%A1%B9%E7%9B%AE/  

