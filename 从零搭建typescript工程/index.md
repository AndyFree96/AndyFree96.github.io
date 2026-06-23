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

### 4.1 安装ESLint

```bash
npm install eslint -D
npx eslint --init
```

推荐配置：

- TypeScript
- Node.js
- JSON

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

### 4.3 ESLint + Prettier协同

```bash
npm install eslint-config-prettier -D
```

## 5. 测试

推荐使用Vitest。

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

`package.json`

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

Husky (Git hooks)

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

- ❌ 代码无法复用
- ❌ 每个项目都要独立配置一套 TypeScript / ESLint / 构建工具
- ❌ 依赖管理混乱

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

✔ 优势

- 代码复用（shared 包）
- 类型统一（types 包）
- 依赖统一管理
- 版本一致性
- 更适合团队开发

❌ 不适合场景

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

[使用pnpm构建高效Monorepo：从零到一的完整指南](https://blog.csdn.net/duduanwang/article/details/155460239)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BAtypescript%E5%B7%A5%E7%A8%8B/  

