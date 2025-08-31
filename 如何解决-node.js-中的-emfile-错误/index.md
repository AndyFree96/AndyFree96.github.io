# 如何解决 Node.js 中的 EMFILE 错误


在日常 Node.js 开发中，你有没有遇到过这样一个错误：

> Error: EMFILE: too many open files

该错误通常出现在：批量文件操作、递归复制、日志处理等场景中。为什么会出现该错误？其实是因为在操作系统中每个进程最多可以同时打开一定数量的文件或 Socket, 而当打开的文件或 Socket 超过了这个限制时，就会出现“打开文件过多”的错误，导致程序突然崩溃。这种“打开文件过多”的问题看
似简单，但如果不加处理，尤其是在批量文件处理场景下，会让我们的 Node.js 程序非常脆弱。

<!--more-->

## 错误示例

以下是一个简单示例：

```js {title="emfile.mjs"}
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'test.txt');

for (let i = 0; i < 1000000; i++) {
  fs.open(filePath, 'r', (err, fd) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`${i} 处理文件 ${filePath}`);
      fs.close(fd, (err) => {
        if (err) console.error(`关闭文件 ${filePath} 错误:`, err.code);
      });
    }
  });
}
```

当我们`node emfile.mjs`运行这个脚本时，会出现`EMFILE`错误：

![](/images/202508/4/1.png)

## 解决方案 1: 限制并发数

解决该错误的方法有很多。比如，我们可以限制每个进程同时打开的文件数量，或者限制单个文件打开的数量。

```js {title="concurrent.mjs"}
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'test.txt');

const MAX_CONCURRENT = 5;
const TIMES = 1000000;
let running = 0;
let index = 0;

function processFile(filePath) {
  if (index >= TIMES && running === 0) {
    console.log('所有文件处理完成');
    return;
  }

  while (running < MAX_CONCURRENT && index < TIMES) {
    index++;
    running++;

    fs.open(filePath, 'r', (err, fd) => {
      running--;

      if (err) {
        console.error(`打开文件 ${filePath} 错误:`, err.code);
      } else {
        console.log(`${index} 处理文件 ${filePath}`);
        fs.close(fd, (err) => {
          if (err) console.error(`关闭文件 ${filePath} 错误:`, err.code);
        });
      }

      processFile(filePath);
    });
  }
}

processFile(filePath);
```

![](/images/202508/4/2.png)

## 解决方案 2: fs-extra

我们也可以选择三方库[node-fs-extra](https://github.com/jprichardson/node-fs-extra)解决这个问题。

```js {title="fsextra.mjs"}
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'test.txt');

async function processFile(filePath) {
  for (let i = 0; i < 1000000; i++) {
    try {
      const fd = await fs.open(filePath, 'r');
      console.log(`${i} 处理文件 ${filePath}`);
      await fs.close(fd);
    } catch (err) {
      console.error(`文件 ${filePath} 错误:`, err.code);
    }
  }
  console.log('所有文件处理完成');
}

processFile(filePath);
```

![](/images/202508/4/3.png)

## 解决方案 3: fs-extra + p-limit

使用`await fs.open`和`await fs.close` 保证每个文件处理完就释放资源。上面的`for`循环是串行执行，天然避免一次性打开太多文件。如果想要提高效率，也可以用`p-limit`限制并发数，结合`fs-extra`更安全、高效。

```js {title="plimit.mjs"}
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'test.txt');

const TIMES = 1000000;
const MAX_CONCURRENT = 5;
const limit = pLimit(MAX_CONCURRENT);

async function processFile(filePath, index = 1) {
  try {
    const fd = await fs.open(filePath, 'r');
    console.log(`${index} 处理文件 ${filePath}`);
    await fs.close(fd);
  } catch (err) {
    console.error(`文件 ${filePath} 错误:`, err.code);
  }
}

async function processFiles(filePath) {
  const tasks = Array.from({ length: TIMES }, (_, index) =>
    limit(() => processFile(filePath, index))
  );
  await Promise.all(tasks);
  console.log('所有文件处理完成');
}

processFiles(filePath);
```

![](/images/202508/4/4.png)

## 总结

Node.js 开发中，打开文件过多的问题是常见的，解决的方法也有很多。比如，限制并发数、使用三方库`fs-extra`等。在实际项目中，还需要根据具体场景选择合适的解决方案。


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3-node.js-%E4%B8%AD%E7%9A%84-emfile-%E9%94%99%E8%AF%AF/  

