# ES6模块教程


在前端开发的进化历程中，模块化 一直是一个核心问题。早期我们用全局变量、命名空间、立即执行函数（IIFE）来组织代码，但都存在依赖管理复杂、命名冲突等问题。
直到 ES6（ECMAScript 2015） 正式引入了 模块化语法，才为 JavaScript 带来了原生的模块方案。

<!--more-->

## 为什么要使用模块？

避免全局污染：每个模块都有自己的作用域。

方便维护：模块化让代码按功能拆分，结构更清晰。

可复用性：一次定义，多处引入。

按需加载：结合现代打包工具，可实现 Tree Shaking，减小体积。

## 基本语法

### 1. 导出（export）

在一个文件中，可以导出函数、变量、类等。

```js {title="math.js"}
export const PI = 3.14159;

export function add(x, y) {
  return x + y;
}

export class Calculator {
  multiply(a, b) {
    return a * b;
  }
}
```

### 2. 导入（import）

在另一个文件中引用：

```js {title="app.js"}
import { PI, add, Calculator } from './math.js';

console.log(PI); // 3.14159
console.log(add(2, 3)); // 5
console.log(new Calculator().multiply(2, 4)); // 8
```

## 默认导出（default export）

每个模块可以有一个默认导出，常用于导出“模块的主要功能”。

```js {title="logger.js"}
export default function log(message) {
  console.log(`[Log]: ${message}`);
}
```

导入时可自定义名称：

```js {title="app.js"}
import log from './logger.js';
log('Hello ES6 Modules!');
```

## 导出与导入的别名（alias）

使用`as`关键字可以给导入或导出改名：

```js {title="math.js"}
export { add as sum, PI as piValue };
```

```js {title="app.js"}
import { sum, piValue } from './math.js';
```

## 模块聚合（Re-export）

当有多个模块时，可以通过 “中转站” 来统一导出。

```js {title="index.js"}
export _ from './math.js';
export _ from './logger.js';
```

这样使用者只需要：

```js
import { add, PI, default as log } from './index.js';
```

## 动态导入（`import()`）

ES2020 引入了 动态导入，返回一个 Promise，适合按需加载。

```js
async function loadModule() {
  const { add } = await import('./math.js');
  console.log(add(10, 20));
}
loadModule();
```

## 与 CommonJS 的区别

| 特点     | ES6 模块             | CommonJS                     |
| -------- | -------------------- | ---------------------------- |
| 语法     | `import` / `export`  | `require` / `module.exports` |
| 加载方式 | 静态（编译时解析）   | 动态（运行时加载）           |
| 是否异步 | 支持异步加载         | 同步加载                     |
| 适用场景 | 浏览器、Node.js(ESM) | Node.js 传统环境             |

{{< admonition type=tip title="提示" open=true >}}
提示：在 Node.js 中使用 ES6 模块，需要在 package.json 中设置`"type": "module"`。
{{< /admonition >}}

## 最佳实践

一个文件一个模块，职责单一。

默认导出用于主要功能，命名导出用于辅助功能。

避免循环依赖，拆分公共逻辑。

在生产项目中，配合 Webpack / Rollup / Vite 等打包工具使用，享受 Tree Shaking。

## 总结

ES6 模块化给 JavaScript 带来了真正的“官方标准”，彻底摆脱了依赖混乱的问题。掌握 export、import、default、动态导入 等语法后，你的前端项目将更清晰、更高效。


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/es6%E6%A8%A1%E5%9D%97%E6%95%99%E7%A8%8B/  

