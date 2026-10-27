# psutil——用Python读取系统资源与管理进程


你有没有遇到这些问题？

- 想知道电脑当前的CPU使用率和内存占用，却不想解析操作系统命令的输出。
- 开发一个Python CLI工具，希望在运行时展示CPU、内存和磁盘状态。
- 某个程序运行越来越慢，想找出占用内存最多的进程。
- 编写自动化脚本，需要检查某个进程是否存在，或者等待进程退出。
- 希望同一份Python代码能够在Windows、Linux和macOS上运行。

这些需求看起来很普通，但如果只使用Python标准库，往往需要组合不同的系统接口，甚至通过subprocess调用操作系统命令，再自行解析文本。有没有一种更加统一的解决方案？

今天介绍的**psutil**，就是专门解决这类问题的Python第三方库。项目名称来自*Process and System Utilities*。它提供统一的Python API，用于获取系统资源信息、查询进程状态以及执行部分进程管理操作。支持Windows、Linux、macOS等多个操作系统。

项目地址：[giampaolo/psutil](https://github.com/giampaolo/psutil)

官方文档：[psutil Documentation](https://psutil.io/)

<!--more-->

## 1. psutil 能做什么？

可以把 psutil 的主要能力分成五类。

| 功能 | 常用 API | 应用场景 |
|---|---|---|
| CPU | `cpu_percent()`、`cpu_count()` | 系统负载监控 |
| 内存 | `virtual_memory()`、`swap_memory()` | 内存占用分析 |
| 磁盘 | `disk_usage()`、`disk_io_counters()` | 磁盘空间和 I/O 监控 |
| 网络 | `net_io_counters()`、`net_connections()` | 网络流量与连接分析 |
| 进程 | `process_iter()`、`Process()` | 进程查询与管理 |

对于开发者来说，最有价值的地方不仅是 API 数量多，而是它把不同操作系统上的许多系统信息封装成了统一的 Python 接口。

当然，跨平台并不意味着所有指标在所有系统上都完全一致。某些字段、权限要求和操作能力仍然取决于操作系统。

## 2. 安装与快速上手

### 2.1 安装 psutil

使用 pip：

```bash
python -m pip install psutil
```

如果你的项目使用 uv：

```bash
uv add psutil
```

### 2.2 查看系统基本信息

新建 `quick_start.py`：

```python
import psutil

print("CPU 逻辑核心数:", psutil.cpu_count())
print("CPU 物理核心数:", psutil.cpu_count(logical=False))

memory = psutil.virtual_memory()

print(f"总内存: {memory.total / 1024**3:.2f} GiB")
print(f"可用内存: {memory.available / 1024**3:.2f} GiB")
print(f"内存使用率: {memory.percent}%")

disk = psutil.disk_usage("/")

print(f"磁盘总容量: {disk.total / 1024**3:.2f} GiB")
print(f"磁盘已使用: {disk.percent}%")
```

运行：

```bash
python quick_start.py
```

![图1 查看系统基本信息](/images/202610/2/1.png "图1 查看系统基本信息")

在 Windows 上，磁盘路径应替换为有效的盘符，例如：

```python
disk = psutil.disk_usage("C:\\")
```

我们也可以很方便地查看磁盘使用情况：

```python
import psutil

total_capacity = 0
total_used = 0

for partition in psutil.disk_partitions():
    try:
        disk = psutil.disk_usage(partition.mountpoint)
        total_capacity += disk.total
        total_used += disk.used
        usage_percent = disk.used / disk.total * 100
        print(f"\t磁盘名称: {partition.mountpoint}")
        print(f"\t磁盘总容量: {disk.total / 1024**3:.2f} GiB")
        print(f"\t磁盘已使用: {disk.used / 1024**3:.2f} GiB")
        print(f"\t磁盘使用率: {usage_percent:.2f}%")
    except (PermissionError, OSError):
        continue

if total_capacity > 0:
    usage_percent = total_used / total_capacity * 100
    print(f"所有磁盘总容量: {total_capacity / 1024**3:.2f} GiB")
    print(f"所有磁盘已使用: {total_used / 1024**3:.2f} GiB")
    print(f"整体磁盘使用率: {usage_percent:.2f}%")
else:
    print("未找到可用磁盘")
```

![图2 Windows磁盘使用情况](/images/202610/2/2.png "图2 Windows磁盘使用情况")

输出中的 CPU 核心数、内存容量和磁盘容量取决于实际机器，这里不预设固定数值。

短短几行代码，就能完成一次基本的系统资源检查。

## 3. 核心 API 实战

### 3.1 监控 CPU 使用率

最直接的接口是：

```python
import psutil

usage = psutil.cpu_percent(interval=1)

print(f"CPU 使用率: {usage:.1f}%")
```

这里的 `interval=1` 表示采样间隔为 1 秒。调用会等待采样完成，然后返回这段时间内计算得到的 CPU 使用率。

如果希望查看每个逻辑 CPU 的使用率：

```python
import psutil

usage = psutil.cpu_percent(
    interval=1,
    percpu=True,
)

for index, percent in enumerate(usage):
    print(f"CPU {index}: {percent:.1f}%")
```

![图3 查看每个逻辑CPU使用率](/images/202610/2/3.png "图3 查看每个逻辑CPU使用率")


需要注意，CPU 使用率是通过一段时间内的系统计数器变化计算出来的，并不是简单读取一个永远准确的实时数值。

如果使用非阻塞模式：

```python
psutil.cpu_percent(interval=None)
```

第一次调用通常会返回没有实际参考意义的初始值，应该忽略。后续调用才适合用于计算两个采样时刻之间的 CPU 使用率。

**适用场景：** 系统监控、任务执行状态展示、长时间运行的 CLI 工具。

### 3.2 查看系统内存

```python
import psutil

memory = psutil.virtual_memory()

print(f"总内存: {memory.total / 1024**3:.2f} GiB")
print(f"已使用: {memory.used / 1024**3:.2f} GiB")
print(f"可用内存: {memory.available / 1024**3:.2f} GiB")
print(f"使用率: {memory.percent:.1f}%")
```

这里有一个值得注意的细节：**`available` 通常比 `free` 更适合用于判断系统是否面临内存压力。**

操作系统可能把暂时未使用的内存用于缓存，并在需要时回收这些资源。因此，`free` 很低，并不一定代表系统内存即将耗尽。

如果要做内存不足的预警，可以根据 `available` 或 `percent` 设计判断条件，而不是仅仅检查 `free`。

例如：

```python
import psutil

memory = psutil.virtual_memory()

if memory.percent >= 90:
    print("警告：系统内存使用率较高")

if memory.available < 1024**3:
    print("警告：系统可用内存不足 1 GiB")
```

这里的阈值只是演示值，实际系统应结合负载、机器规格和业务需求进行调整。

### 3.3 找出占用内存最多的进程

这是 psutil 非常实用的能力之一。

```python
import psutil

processes = []

for process in psutil.process_iter(
    ["pid", "name", "memory_info"]
):
    try:
        info = process.info
        memory_info = info["memory_info"]

        if memory_info is None:
            continue

        processes.append({
            "pid": info["pid"],
            "name": info["name"] or "Unknown",
            "rss": memory_info.rss,
        })

    except (psutil.NoSuchProcess, psutil.AccessDenied):
        continue

processes.sort(
    key=lambda item: item["rss"],
    reverse=True,
)

for process in processes[:10]:
    memory_mb = process["rss"] / 1024**2

    print(
        f'{process["pid"]:>7} '
        f'{memory_mb:>10.2f} MiB '
        f'{process["name"]}'
    )
```

这段代码做了四件事：

1. 遍历当前可访问的进程。
2. 获取进程 PID、名称和内存信息。
3. 按 RSS 从高到低排序。
4. 输出内存占用最高的十个进程。

其中 `RSS` 是 Resident Set Size，表示进程驻留在物理内存中的内存规模。

为什么要使用 `process_iter()`，而不是先调用 `pids()`，再逐个构造进程对象？

因为进程可能在遍历过程中启动或退出。`process_iter()` 更适合遍历当前进程，并且可以在迭代时请求需要的属性。

另外，进程可能在两次系统调用之间退出，或者因为权限不足而无法读取信息。因此，处理 `NoSuchProcess` 和 `AccessDenied` 是系统工具开发中很重要的一步。

### 3.4 检查某个进程是否存在

假设我们开发一个自动化工具，需要判断某个程序是否正在运行。

```python
import psutil

def is_process_running(name: str) -> bool:
    target = name.casefold()

    for process in psutil.process_iter(["name"]):
        try:
            process_name = process.info["name"]

            if process_name and process_name.casefold() == target:
                return True

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return False


if is_process_running("python.exe"):
    print("目标进程正在运行")
else:
    print("未发现目标进程")
```

这个示例使用不区分大小写的完整名称比较。

实际项目中需要根据操作系统、可执行文件名称和业务需求调整匹配方式。更重要的是：**发现某个进程，并不代表它一定是你要控制的那个实例。**

如果要对进程执行停止、重启等操作，应进一步确认 PID、启动参数或其他身份信息，避免误操作。

## 4. 动手实现：一个轻量级系统监控 CLI

前面介绍的 API 都很简单，但如果把它们组合起来，就可以构建一个真正有用的开发者工具。我们来实现一个迷你系统监控程序：每秒刷新一次 CPU、内存和磁盘使用率，按 `Ctrl+C` 退出。

新建 `monitor.py`：

```python
import time

import psutil


def format_bytes(size: int) -> str:
    """将字节数转换为便于阅读的单位"""
    value = float(size)

    for unit in ("B", "KiB", "MiB", "GiB", "TiB"):
        if value < 1024 or unit == "TiB":
            return f"{value:.1f} {unit}"

        value /= 1024

    return f"{value:.1f} TiB"


def main() -> None:
    # 初始化 CPU 采样状态
    psutil.cpu_percent(interval=None)

    try:
        while True:
            cpu = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()

            print(
                f"CPU: {cpu:5.1f}% | "
                f"Memory: {memory.percent:5.1f}% | "
                f"Available: {format_bytes(memory.available)}"
            )

    except KeyboardInterrupt:
        print("\n监控已结束")


if __name__ == "__main__":
    main()
```

运行：

```bash
python monitor.py
```

终端会持续显示类似这样的数据：

![图4 系统监控输出](/images/202610/2/4.png "图4 系统监控输出")


这里有几个值得注意的设计点：

- **单一职责：** `format_bytes()` 只负责格式化字节数。
- **持续采样：** 通过循环定期获取系统状态。
- **优雅退出：** 使用 `KeyboardInterrupt` 处理用户中断。
- **易于扩展：** 后续可以加入 Rich 表格、磁盘监控、进程排名和日志输出。

当前版本为了保持示例简单，每次 CPU 采样会阻塞约一秒。如果未来需要同时采集更多指标、执行后台任务或提供 Web API，就应该进一步设计采样周期、数据缓存与展示层之间的关系。

## 5. 深入一步：psutil 的设计有什么值得学习？

### 5.1 统一 API，隔离操作系统差异

不同操作系统获取进程信息的底层机制并不相同。

如果自己编写系统监控程序，就可能需要分别处理 Windows API、Linux 系统接口和 macOS 的实现细节。

psutil 把这些差异封装在库内部，让调用者使用统一的 Python API。

这是一种很典型的工程设计思路：

> 把变化留在底层适配层，把稳定的接口交给上层业务。

这种思想也适用于设备驱动封装、数据库适配器、文件系统抽象和硬件通信层。

### 5.2 `process_iter()`：不要假设进程始终存在

进程是动态资源。

你读取一个进程的信息时，它可能已经退出；你准备读取下一个属性时，也可能遇到权限限制。

因此，系统监控代码不能只考虑正常情况，还必须处理资源消失和访问失败等边界条件。

这不仅是 psutil 的使用技巧，也是编写可靠系统工具的一项基本原则。

### 5.3 系统指标不等于业务指标

CPU 使用率很高，不一定说明程序有问题。

内存使用率很高，也不一定意味着存在内存泄漏。

这些数据只是诊断线索。要分析具体问题，还需要结合进程级指标、程序日志、任务耗时、I/O 情况，以及应用本身的业务状态。

例如，发现内存持续增长后，可以进一步分析 Python 对象、堆分配、缓存和资源释放情况，而不是直接认定是内存泄漏。

### 5.4 跨平台封装也有边界

psutil 的统一接口并不能消除所有平台差异。

某些指标可能只在特定操作系统上可用；某些操作需要更高权限；容器环境中读取到的系统资源信息，也可能受到容器配置和操作系统隔离机制的影响。

因此，开发跨平台工具时，应该明确哪些能力是通用的，哪些能力需要平台适配，并对不可用的指标提供合理处理方式。

## 6. 什么时候应该使用 psutil？

| 需求 | 是否适合 |
|---|---|
| 编写跨平台系统监控工具 | 非常适合 |
| 查询进程、CPU、内存和磁盘信息 | 非常适合 |
| 开发自动化运维脚本 | 适合 |
| 分析某个 Python 函数的执行耗时 | 可以配合其他性能分析工具 |
| 分析 Python 对象的内存分配 | 通常需要 `tracemalloc` 等工具 |
| 实现专业级性能分析器 | 可以作为系统信息采集层，但不够全面 |
| 管理高权限系统服务 | 需要额外考虑权限、安全和平台差异 |

如果你的目标是获取系统和进程层面的信息，psutil 通常是一个很好的起点。

如果你的目标是分析 Python 代码内部的函数调用耗时、对象分配或者内存泄漏，则应该结合 `cProfile`、`tracemalloc` 等工具。

不同工具负责不同层次的问题，组合使用往往比试图让一个库解决所有问题更有效。

## 7. 总结

psutil 是一个很适合纳入 Python 开发者工具箱的第三方库。

它的价值不只是让我们用几行代码获取 CPU 和内存数据，更在于它展示了如何把复杂的系统能力封装成统一接口，以及如何在系统资源管理中处理动态变化、权限限制和跨平台差异。

如果准备继续学习，可以沿着这条路线深入：

1. 用 `psutil` 实现系统资源监控 CLI。
2. 使用 `Rich` 为终端添加实时表格和进度展示。
3. 使用 `Typer` 增加命令行参数与子命令。
4. 为监控逻辑编写 `pytest` 单元测试。
5. 研究 psutil 的源码，理解不同操作系统上的信息采集实现。

这样，一个小小的第三方库就能成为学习 Python、系统编程、CLI 工程化和软件设计的切入点。

---

## 8. 参考

- GitHub：[giampaolo/psutil](https://github.com/giampaolo/psutil)
- 官方文档：[psutil Documentation](https://psutil.readthedocs.io/stable/)
- 官方 API 参考：[API Reference](https://psutil.readthedocs.io/stable/#api-reference)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/python%E4%B9%8Bpsutil/  

