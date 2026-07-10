# Python之Loguru日志库：替代标准logging的现代方案


日志是软件工程中最基础也是最重要的能力之一。无论是Web服务、AI应用、数据处理任务、自动化脚本、后台Worker，都离不开日志。Python标准库提供了`logging`。它功能强大，但实际工程使用中经常会遇到一些问题：

- 配置复杂
- 格式设置繁琐
- 文件滚动需要额外配置
- 多模块项目初始化麻烦

例如标准logging：

```python
import logging

logger = logging.getLogger(__name__)

logger.setLevel(logging.INFO)

handler = logging.FileHandler('app.log')

formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

handler.setFormatter(formatter)

logger.addHandler(handler)

logger.info("Application started")
```

简单记录一条日志到文件，需要很多代码。这也是为什么可以尝试用[Loguru](https://loguru.readthedocs.io/en/stable/)。

<!--more-->

![](/images/202607/7/loguru.gif)

## Loguru是什么？

Logure是一个现代Python日志库。它的核心实际理念：

> 用一个简单、开箱即用的Logger，替代Python logging复杂配置。

核心特点：

- 一个全局logger
- 无需配置Handler
- 自动格式化
- 异常捕获
- 彩色输出
- 支持结构化日志

## 安装

```bash
pip install loguru
```

示例：

```python
from loguru import logger

logger.info("Loguru installed successfully")
```

无需创建Logger、Handler以及Formatter。

## 基础使用

Loguru最简单的使用：

```python
from loguru import logger

logger.debug("Debug message")

logger.info("Application started")

logger.warning("Low memory")

logger.error("Connection failed")
```

![图1 终端输出日志](/images/202607/7/2.png '图1 终端输出日志')

## 日志级别

Loguru支持常见日志等级：

| Level    | 用途         |
| -------- | ------------ |
| TRACE    | 最详细调试   |
| DEBUG    | 调试信息     |
| INFO     | 普通运行信息 |
| SUCCESS  | 成功事件     |
| WARNING  | 警告         |
| ERROR    | 错误         |
| CRITICAL | 严重错误     |

其中`SUCCESS`是Loguru相比logging增加的等级。

## 输出到文件

项目通常要将日志输出到文件：

```python
from loguru import logger

logger.add("app.log")

logger.debug("Debug message")

logger.info("Application started")

logger.success("Operation completed successfully")

logger.warning("Low memory")

logger.error("Connection failed")
```

运行后会生成`app.log`，内容如下：

![图2 app.log日志文件内容](/images/202607/7/3.png '图2 app.log日志文件内容')

## 日志文件自动切割

生产环境日志不能无限增长。例如，每天生成一个日志文件：

```python
logger.add("logs/app.log", rotation="00:00")
```

按文件大小切割。例如，超过100MB：

```python
logger.add("logs/app.log", rotation="100 MB")
```

按时间保存。例如，每小时：

```python
logger.add("logs/app.log", rotation="1 hour")
```

## 自动删除旧日志

生产系统通常需要保留周期。例如，保留30天：

```python
logger.add("logs/app.log", retention="20 days")
```

超过时间，自动删除.

## 日志压缩

为节省磁盘空间，可对文件进行压缩：

```python
logger.add("logs/app.log", compression="zip")
```

## 异常自动记录

这是Loguru非常方便的功能。普通写法：

```python
from loguru import logger

try:
    1 / 0
except Exception:
    logger.exception("An error occurred")
```

Loguru：

```python
from loguru import logger

@logger.catch
def process(a, b):
    a / b

process(1, 0)
```

## Loguru + 多线程

```python
from loguru import logger
from concurrent.futures import ThreadPoolExecutor
import sys

def worker(i):
    logger.info("Worker {} running", i)


with ThreadPoolExecutor(4) as pool:
    pool.map(worker, range(10))
```

输出：

![图3 多线程+日志输出](/images/202607/7/4.png '图3 多线程+日志输出')

## 总结

Loguru解决了Python日志系统中大量重复配置问题。它最大的优势：

- 简单
- 开箱即用
- 文件管理方便
- 异常追踪方便


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/python%E4%B9%8Bloguru%E6%97%A5%E5%BF%97%E5%BA%93/  

