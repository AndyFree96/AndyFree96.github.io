# uv完全指南：下一代Python包管理器


Python诞生于1991年，经过30多年发展，已经成为：

- AI领域首选语言
- 数据科学事实标准
- Web开发重要生态
- 自动化脚本核心语言

但Python工程化一直存在一个问题：

> 代码开发体验优秀，但项目管理体验长期落后。

特别是在依赖管理方面。

<!--more-->

## 为什么需要uv？

Python 生态发展多年，已经形成了一套成熟的开发流程：

- pip：安装 Python 包
- venv：创建虚拟环境
- pip-tools：管理依赖版本
- poetry：项目管理与打包
- conda：科学计算环境管理

但是在实际项目中，经常会遇到一些问题：

### 安装速度慢

传统的`pip install numpy`安装时需要：解析依赖、下载包、安装包、写入环境。当项目依赖比较多时，速度会明显下降。

### 虚拟环境管理繁琐

通常流程:

```bash
python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt
```

步骤较多。

### Python版本管理困难

例如项目A使用`Python 3.10`、`FastAPI 0.100`，项目B使用`Python 3.12`、`Django 5`，需要额外管理Python版本。

为了解决这些问题，Astral推出了：

> uv——一个极快的Python包管理器和项目管理工具。

它使用Rust编写，目标是成为Python世界中的：

- npm
- cargo
- go modules

## 安装uv

### macOS/Linux

推荐：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

安装完成：

```bash
uv --version # uv 0.11.26
```

### Windows

PowerShell：

```bash
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

验证：

```bash
uv --version # uv 0.11.26 (396ef7ce4 2026-06-30 x86_64-pc-windows-msvc)
```

## uv管理Python版本

uv不仅管理包，也可以管理Python。查看可用版本：

```bash
uv python list
```

![图1 uv列出Python版本](/images/202607/5/1.png '图1 uv列出Python版本')

安装Python：

```bash
uv python install 3.12
```

指定Python：

```bash
uv python pin 3.12
```

生成`.python-version`，内容`3.12`，之后项目默认使用`Python 3.12`。

## 创建Python项目

```bash
uv init demo

cd demo
```

生成：

{{< file-tree folderSlash=true level=3 >}}

- name: demo
  type: dir
  children:
  - name: pyproject.toml
    type: file
  - name: README.md
    type: file
  - name: main.py
    type: file
  - name: .python-version
    type: file
  - name: .gitignore
    type: file
  - name: .uv.lock
    type: file
    {{< /file-tree >}}

其中`pyproject.toml`类似`package.json`，用于描述项目。

## 使用uv创建虚拟环境

执行：

```bash
uv venv
```

生成`.venv`。

Linux激活：

```bash
source .venv/bin/activate
```

Windows激活：

```bash
.venv\Scripts\activate
```

也可以直接运行：

```bash
uv run python main.py
```

uv会自动：

1. 创建环境
2. 安装依赖
3. 执行程序

无需手动activate。

## 安装Python依赖

### 添加依赖

例如安装`requests`：

```bash
uv add requests
```

执行后`pyproject.toml`和`uv.lock`都会更新。

```toml {title="pyproject.toml"}
dependencies = [
    "requests>=2.34.2",
]
```

### 安装开发依赖

```bash
uv add --dev ruff
uv add --dev pytest
```

```toml {title="pyproject.toml"}
[dependency-groups]
dev = [
    "pytest>=9.1.1",
    "ruff>=0.15.20",
]

```

## 常用命令总结

| 命令              | 作用           |
| :---------------- | :------------- |
| uv init           | 创建项目       |
| uv add            | 添加依赖       |
| uv remove         | 删除依赖       |
| uv sync           | 同步环境       |
| uv run            | 运行程序       |
| uv venv           | 创建虚拟环境   |
| uv python install | 安装Python     |
| uv python pin     | 固定Python版本 |
| uv pip install    | 兼容pip操作    |

## Python开发流程推荐

```bash
uv init project

cd project

uv python pin 3.12

uv add fastapi

uv add --dev pytest ruff

uv run pytest
```

## 参考

https://docs.astral.sh/uv/


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/uv%E5%AE%8C%E5%85%A8%E6%8C%87%E5%8D%97/  

