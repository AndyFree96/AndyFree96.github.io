# 从零搭建TypeScript工程


如果你刚开始接触[TypeScript](https://www.typescriptlang.org/)，很容易停留在“写类型+tsc编译”的阶段。但在真实工程中，TypeScript从来不是一个“语言孤岛”，而是一整套工程体系。本文会带你从零搭建一个项目模板，覆盖完整工具链。

<!--more-->

## 1. 初始化项目

### 1.1 创建项目

```bash
mkdir my-ts-project
cd my-ts-project
npm init -y
```

### 1.2 安装TypeScript

```bash
npm install typescript -D
```

初始化配置：

```bash
npm tsc --init
```

### 1.3 推荐tsconfig配置

一个常用配置如下：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "rootDir": "src",
    "outDir": "dist",

    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,

    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

`tsconfig.json`是TypeScript项目的核心配置文件，它决定了TypeScript编译器(tsc)如何解析代码、如何进行类型检查、如何生成JavaScript，以及项目的模块化、目标环境等。

#### 1.3.1 整体结构

| 配置节点              | 作用                  | 示例                  |
| :----------------- | :------------------- | :------------------- |
| `compilerOptions` | TypeScript 编译选项（核心） | `{"strict":true}`   |
| `include`         | 指定需要编译的文件           | `["src/**/*"]`      |
| `exclude`         | 指定排除的文件             | `["node_modules"]`  |
| `extends`         | 继承其他配置文件            | `"./base.json"`     |
| `files`           | 明确指定编译文件列表          | `["src/main.ts"]`   |
| `references`      | 项目引用，用于大型项目拆分       | `[{path:"./core"}]` |

#### 1.3.2 compilerOptions核心配置

##### 1.3.2.1 JavaScript输出相关

| 配置                 | 作用                 | 常用值                                  | 推荐                             |
| :------------------ | :------------------ | :------------------------------------ | :------------------------------ |
| `target`           | 指定生成 JavaScript 版本 | `ES5`、`ES2015`、`ES2020`、`ES2022`     | Node.js：`ES2022`；Web：`ES2017+` |
| `module`           | 指定模块系统             | `CommonJS`、`ESNext`、`NodeNext`       | 前端：`ESNext`；Node：`NodeNext`    |
| `moduleResolution` | 模块解析策略             | `node`、`node16`、`nodenext`、`bundler` | Vite：`bundler`；Node：`NodeNext` |
| `lib`              | 指定运行环境 API 类型      | `DOM`、`ES2022`                       | 根据环境配置                         |
| `jsx`              | JSX 转换方式           | `react`、`react-jsx`、`preserve`       | React18：`react-jsx`            |
| `jsxFactory`       | JSX 工厂函数           | `React.createElement`                | React旧项目                       |
| `jsxImportSource`  | 自动 JSX 导入源         | `react`                              | React生态                        |


##### 1.3.2.2 类型检查相关

| 配置                             | 作用                  | 示例     | 推荐       |
| :------------------------------ | :------------------- | :------ | :-------- |
| `strict`                       | 开启所有严格检查            | `true` | 必开 |
| `strictNullChecks`             | 严格检查 null/undefined | `true` | 开启       |
| `strictFunctionTypes`          | 严格函数参数检查            | `true` | 开启       |
| `strictPropertyInitialization` | 检查类属性初始化            | `true` | 开启       |
| `noImplicitAny`                | 禁止隐式 any            | `true` | 开启       |
| `noImplicitThis`               | 禁止隐式 this           | `true` | 开启       |
| `alwaysStrict`                 | 输出 `"use strict"`   | `true` | 推荐       |
| `useUnknownInCatchVariables`   | catch变量默认为unknown   | `true` | 推荐       |

##### 1.3.2.3 代码质量检查

| 配置                           | 作用           | 示例      |
| :---------------------------- | :------------ | :------- |
| `noUnusedLocals`             | 禁止未使用变量      | `true`  |
| `noUnusedParameters`         | 禁止未使用参数      | `true`  |
| `noImplicitReturns`          | 要求函数所有路径返回   | `true`  |
| `noFallthroughCasesInSwitch` | 禁止 switch 穿透 | `true`  |
| `allowUnreachableCode`       | 是否允许不可达代码    | `false` |
| `exactOptionalPropertyTypes` | 严格可选属性类型     | `true`  |

##### 1.3.2.4 输出文件相关

| 配置                | 作用            | 示例          | 用途       |
| :----------------- | :------------- | :----------- | :-------- |
| `outDir`          | 输出目录          | `"./dist"`  | 生产构建     |
| `rootDir`         | 源码根目录         | `"./src"`   | 控制目录结构   |
| `sourceMap`       | 生成 sourcemap  | `true`      | 调试       |
| `inlineSourceMap` | 内联 sourcemap  | `true`      | 调试       |
| `declaration`     | 生成 `.d.ts` 文件 | `true`      | 开发 npm 包 |
| `declarationMap`  | 生成声明文件 map    | `true`      | 库调试      |
| `removeComments`  | 删除注释          | `true`      | 生产优化     |
| `newLine`         | 输出换行符         | `LF`/`CRLF` | 跨平台      |

##### 1.3.2.5 模块导入相关

| 配置                             | 作用                       | 示例     | 使用场景              |
| :------------------------------ | :------------------------ | :------ | :----------------- |
| `esModuleInterop`              | 增强 ES Module/CommonJS 兼容 | `true` | Node项目常用          |
| `allowSyntheticDefaultImports` | 允许默认导入                   | `true` | 配合esModuleInterop |
| `resolveJsonModule`            | 允许导入 JSON                | `true` | 配置文件读取            |
| `allowImportingTsExtensions`   | 允许 ts 后缀导入               | `true` | 特殊场景              |
| `verbatimModuleSyntax`         | 保持 import/export 原样      | `true` | 现代项目推荐            |


##### 1.3.2.6 路径配置

| 配置          | 作用       | 示例                    |
| :----------- | :-------- | :--------------------- |
| `baseUrl`   | 模块搜索根目录  | `"./"`                |
| `paths`     | 路径别名     | `"@/*":["src/*"]`     |
| `rootDirs`  | 多个虚拟根目录  | `["src","generated"]` |
| `typeRoots` | 指定类型声明目录 | `["./types"]`         |
| `types`     | 指定加载类型包  | `["node"]`            |

示例：

```json
{
 "compilerOptions":{
   "baseUrl":"src",
   "paths":{
     "@/*":[
       "*"
     ]
   }
 }
}
```

使用：

```ts
import User from "@/models/User"
```

##### 1.3.2.7 性能优化相关

| 配置                                        | 作用               | 效果             |
| :----------------------------------------- | :---------------- | :-------------- |
| `skipLibCheck`                            | 跳过第三方 `.d.ts` 检查 | 提高编译速度         |
| `incremental`                             | 增量编译             | 大型项目加速         |
| `tsBuildInfoFile`                         | 指定增量缓存文件         | 配合 incremental |
| `composite`                               | 支持项目引用           | 大型 Monorepo    |
| `disableSourceOfProjectReferenceRedirect` | 禁用引用跳转           | 大型项目           |

#### 1.3.3 include配置

| 配置             | 作用           |
| :-------------- | :------------ |
| `src/**/*`     | 包含 src 下所有文件 |
| `src/**/*.ts`  | 只包含 ts 文件    |
| `src/**/*.tsx` | 只包含 tsx 文件     |

示例：

```json
{
 "include":[
   "src/**/*"
 ]
}
```

#### 1.3.4 exclude配置

| 目录           | 作用    |
| :------------ | :----- |
| node_modules | 第三方代码 |
| dist         | 编译产物  |
| build        | 构建目录  |
| coverage     | 测试覆盖率 |

示例：

```json
{
 "exclude":[
   "node_modules",
   "dist"
 ]
}
```

## 2. 标准项目结构

一个可维护的TypeScript项目，一定要从结构开始规范：

{{< file-tree folderSlash=true level=3 >}}

- name: my-ts-project
  type: dir
  children:
  - name: src
    type: dir
    children:
    - name: index.ts
      type: file
    - name: modules
      type: dir
    - name: utils
      type: dir
    - name: types
      type: dir
  - name: app.ts
    type: file
- name: tests
  type: dir
- name: dist
  type: dir
- name: package.json
  type: file
- name: tsconfig.json
  type: file
  {{< /file-tree >}}

- `modules`：业务模块
- `utils`：纯函数工具
- `types`：全局类型
- `services`：外部接口调用

## 3. 开发工具链

### 3.1 运行TypeScript(开发环境)

安装：

```bash
npm install tsx -D
```

运行：

```bash
npx tsx src/index.ts
```

### 3.2 监听模式开发

```bash
npx tsx watch src/index.ts
```

## 4. 代码规范(ESLint + Prettier)

[ESLint](https://eslint.org/)主要关注代码质量——它用于发现Bug、强制执行最佳实践以及捕获常见错误。[Pettier](https://prettier.io/)则关注于代码格式化。比如：空格、换行、引号等。虽然目标不同，但在格式规则方面可能存在一些重叠。分别运行它们可能会产生冲突。例如Pettier刚修改了某种格式，此时ESLint认为这种格式不符合规则并报错。解决方案是将它们集成起来，让Pettier负责所有格式化工作，ESLint负责代码质量检测。

每个包的作用如下：

| 包                                 | 作用                                     |
| ---------------------------------- | ---------------------------------------- |
| `eslint`                           | 核心代码检查引擎                         |
| `@typescript-eslint/parser`        | 让 ESLint 能够理解 TypeScript 语法       |
| `@typescript-eslint/eslint-plugin` | 提供 TypeScript 专用的 ESLint 检查规则   |
| `prettier`                         | 代码格式化工具                           |
| `eslint-config-prettier`           | 禁用那些与 Prettier 冲突的 ESLint 规则   |
| `eslint-plugin-prettier`           | 将 Prettier 作为 ESLint 的一条规则来运行 |

### 4.1 安装ESLint

```bash
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin -D
```

ESLint 9+配置，在项目根目录下新建`eslint.config.js`文件：

```js {title="eslint.config.js"}
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  eslint.configs.recommended,

  // TypeScript规则
  ...tseslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },

  // 自定义规则
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },

  prettier,

  // 忽略
  {
    ignores: ['dist/', 'build/', 'node_modules/'],
  },
);
```

### 4.2 Prettier格式化工具

```bash
npm install prettier -D
```

`.prettierrc`文件内容如下：

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100
}
```

创建`.prettierignore`文件跳过不需要格式化的文件。

```
dist/
build/
node_modules/
package-lock.json
```

### 4.3 ESLint + Prettier集成

```bash
npm install eslint-config-prettier eslint-plugin-prettier -D
```

### 4.4 VSCode集成

安装ESLint和Prettier扩展，配置VSCode保存时格式化。在项目中增加`.vscode/settings.json`。

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript"]
}
```

### 4.5 NPM脚本

在`package.json`中添加脚本，以便手动运行代码检查。

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json}\""
  }
}
```

## 5. 测试

推荐使用[Vitest](https://vitest.dev/)。

```bash
npm install vitest -D
```

示例测试：

```ts {title="tests/sum.test.ts"}
import { describe, it, expect } from 'vitest';

function sum(a: number, b: number) {
  return a + b;
}

describe('sum function', () => {
  it('should return correct result', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

`package.json`中增加脚本：

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

## 6. 构建工具

TypeScript不负责构建，需要外部工具。

方案1：tsc (基础方案)

```bash
npx tsc
```

缺点：

- 构建慢
- 不支持现代打包能力

方案2：esbuild (高性能)

```bash
npm install esbuild -D
```

特点：

- 极速构建
- 适合中大型项目

方案3：tsup

```bash
npm install tsup -D
```

优点：

- 零配置
- 适合库开发

## 7. 调试(VSCode)

创建`.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "tsx",
      "type": "node",
      "request": "launch",
      "args": ["src/index.ts"],
      "runtimeExecutable": "tsx",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**", "${workspaceFolder}/node_modules/**"]
    }
  ]
}
```

## 8. 环境变量管理

安装dotenv：

```bash
npm install dotenv
```

使用：

```ts
import 'dotenv/config';

console.log(process.env.API_KEY);
```

## 9. Git工程规范

Husky(Git hooks)

```bash
npm install husky -D
```

commitlint (提交规范)

```bash
npm install commitlint -D
```

## 10. Monorepo工程化

当开始写多个项目时，比如：

- 后端API
- 前端Web
- 公共工具库
- 类型共享包

很快我们就会遇到一些问题：

- :x: 代码无法复用
- :x: 每个项目都要独立配置一套 TypeScript / ESLint / 构建工具
- :x: 依赖管理混乱

于是Monorepo出现了。

### 10.1 什么是Monorepo？

Monorepo（单仓库多项目）指的是++在一个 Git 仓库中管理多个项目（packages）++。[Vue.js](https://github.com/vuejs/core)就是一个典型的Monorepo。

结构通常如下：

{{< file-tree folderSlash=true level=3 >}}

- name: repo
  type: dir
  children:
  - name: apps
    type: dir
    children:
    - name: web
      type: dir
    - name: api
      type: dir
  - name: packages
    type: dir
    children:
    - name: shared
      type: dir
    - name: utils
      type: dir
    - name: types
      type: dir
- name: package.json
  type: file
- name: pnmp-workspace.yaml
  type: file
  {{< /file-tree >}}

### 10.2 为什么用用Mongorepo？

:heavy_check_mark: 优势

- 代码复用（shared 包）
- 类型统一（types 包）
- 依赖统一管理
- 版本一致性
- 更适合团队开发

:x: 不适合场景

- 只有一个小项目
- 没有复用需求
- 不准备长期维护

### 10.3 初始化Mongorepo

#### 10.3.1 安装pnpm

```bash
npm install -g pnpm
```

#### 10.3.2 初始化项目

```bash
mkdir my-monorepo
cd my-monorepo
pnpm init
```

#### 10.3.3 创建workspace

`pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 10.4 创建项目结构

{{< file-tree folderSlash=true level=3 >}}

- name: repo
  type: dir
  children:
  - name: apps
    type: dir
    children:
    - name: web
      type: dir
    - name: api
      type: dir
  - name: packages
    type: dir
    children:
    - name: shared
      type: dir
    - name: utils
      type: dir
    - name: types
      type: dir
- name: package.json
  type: file
- name: pnmp-workspace.yaml
  type: file
  {{< /file-tree >}}

### 10.5 创建共享包(shared)

```bash
mkdir -p packages/shared
cd packages/shared
pnpm init
```

示例代码：

```ts
export function formatDate(date: Date) {
  return date.toISOString();
}
```

在app中使用：

```ts
import { formatDate } from '@repo/shared';
```

### 10.6 配置 TypeScript Monorepo

根目录`tsconfig.json`：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@repo/shared": ["packages/shared/src"],
      "@repo/types": ["packages/types/src"]
    }
  }
}
```

每个包的`tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### 10.7 使用Turborepo

安装

```bash

pnpm add turbo -D
```

`turbo.json`

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {},
    "test": {}
  }
}
```

`package.json`

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```

## 推荐

[How To Create An NPM Package](https://www.totaltypescript.com/how-to-create-an-npm-package)

## 参考

[使用pnpm构建高效Monorepo：从零到一的完整指南](https://blog.csdn.net/duduanwang/article/details/155460239)

[How to Configure ESLint and Prettier for TypeScript](https://oneuptime.com/blog/post/2026-02-03-eslint-prettier-typescript/view)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BAtypescript%E5%B7%A5%E7%A8%8B/  

