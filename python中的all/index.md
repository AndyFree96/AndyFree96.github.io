# Python中的all：模块公开API设计的关键工具


在Python项目中，我们经常会看到类似这样的代码：

```python
__all__ = [
    "Field",
    "FormRequest",
    "Item",
    "Request",
    "Selector",
    "Spider",
    "__version__",
    "version_info",
]
```

很多初学者会疑惑：

- `__all__`是做什么的？
- 为什么需要它？
- 和`_xxx`命名有什么区别？
- 大型项目为什么经常使用？

本文将从基础语法到工程实践，深入理解 Python 的`__all__`。

<!--more-->

> [!info]+
> 上面所列代码来自[scrapy](https://github.com/scrapy/scrapy/blob/master/scrapy/__init__.py)。

## 什么是`__all__`？

`__all__`是Python模块中的一个特殊变量，用来定义：当使用`from xxx import *`时，哪些成员会被导入。

例如：

```python {name="math_utils.py"}
__all__ = ["add", "VERSION"]

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b


VERSION = "1.0.0"
_debug = True
```

其他地方：

```python {name="main.py"}
from math_utils import *

print(add(5, 3)) # 可以
print(subtract(5, 3)) # 不存在
print(VERSION) # 可以
print(_debug) # 不存在
```

`__all__`明确告诉Python，这个模块对外公开的内容只有`add`和`VERSION`。

## 没有`__all__`会发生什么？

如果没有定义`__all__`：

```python {name="math_utils.py"}
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b


VERSION = "1.0.0"
_debug = True
```

执行`from math_utils import *`。Python默认规则会导入所有不以下划线`_`开头的名字。因此`add`、`substract`和`VERSION`都会被导入，而`_debug`不会。所以很多Python项目会使用`_name`表示内部成员。

## `__all__`与`_xxx`的区别

`_xxx`只是一个命名约定。++表示这个东西是内部实现的，不建议外部使用++。

例如：

```python {name="camera.py"}
class Camera:
    def start(self):
        pass


class _CameraWorker:
    def run(self):
        pass
```

但是Python不禁止`from camera import _CameraWorker`依然可以。而`__all__`，是真正控制`from camera import *`导出的列表。

## `__all__`可以暴露内部成员吗？

可以。例如：

```python {name="calculate.py"}
__all__ = ["_calculate"]


def _calculate():
    return 100

```

```python {name="main.py"}
from calculate import *

_calculate() #可以
```

```__all__`优先级高于`_`规则。

## 为什么大型项目需要`__all__`

小项目可能感觉不到价值。但在大型工程中，一个模块可能包含：

```python {name="camera.py"}
class Camera:
    def start(self):
        pass


class _CameraWorker:
    def run(self):
        pass

class CameraFactory:
    def create_camera(self):
        pass

class CameraLogger:
    def log(self, message):
        pass

def _test_camera():
    pass

def _debug():
    pass
```

如果没有管理，用户不知道哪些是稳定API，哪些只是内部实现。例如：`from camera import *`可能导入几十个东西。这会导致命名污染、API不稳定、重构困难等问题。而使用：

```python {name="camera.py"}
__all__ = [ "Camera", "CameraFactory" ]
```

模块边界清晰。

## 在包中的作用

Python项目经常这样组织：

{{< file-tree >}}
- name: vision
  type: dir
  children:
    - name: __init__.py
      type: file
    - name: camera.py
      type: file
    - name: calibration.py
      type: file
    - name: matcher.py
      type: file
{{< /file-tree >}}

```python {name="camera.py"}
__all__ = [ "Camera" ]

class Camera:
    def start(self):
        pass

class CameraDebugTool:
    def debug(self):
        pass

```

然后：

```python {name="vision/__init__.py"}
from .camera import Camera 
from .calibration import Calibration 

__all__ = [ "Camera", "Calibration" ]
```

外部使用时：

```python
from vision import Camera

```

而不用：

```python
from vision.camera import Camera
```

这就是典型的[Facade](https://refactoring.guru/design-patterns/facade)设计。

## 工程实践建议

`__all__`看似只是一个列表，但在大型项目中，它实际上承担的是：++模块 API 设计、依赖隔离、架构演进的作用++。

以下是工程中使用`__all__` 的核心原则：

- 明确模块边界
- 只暴露稳定 API
- 隐藏内部实现
- 减少模块耦合
- 保护未来重构空间
- 让包结构更加清晰
- 把它当作 API 设计工具，而不是语法技巧

好的 Python 工程，不只是写功能，更重要的是设计清晰的模块出口。

## 总结

`__all__`的核心思想：

> 明确模块边界，控制公开接口。

它不是权限系统，也不是安全机制。它更像是一份**模块API清单**。在简单脚本中可以不用。在大型Python工程中，建议使用。合理设计`__all__`可以让代码：

- 更容易维护
- 更容易扩展
- 更少依赖内部实现

## 推荐

[Python Docs Modules](https://docs.python.org/3/tutorial/modules.html#importing-from-a-package)

[What does `__all__` mean in Python?](https://stackoverflow.com/questions/44834/what-does-all-mean-in-python)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/python%E4%B8%AD%E7%9A%84all/  

