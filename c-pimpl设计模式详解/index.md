# C++ Pimpl设计模式详解


在阅读一些大型 C++ 项目源码时，经常会看到类似下面这样的代码：

```cpp
class MyClass {
public:
  MyClass();
  ~MyClass();
private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};
```

第一次看到这种写法，很多人都会疑惑：

- 为什么真正的数据成员不放在类里面？
- 为什么要多定义一个`Impl`类？
- 为什么析构函数要放到`.cpp`中实现？
- 这样设计有什么好处？

实际上，这就是C++中非常经典的Pimpl(Pointer to Implementation)设计模式。本文将从设计思想、实现方式、优缺点以及使用场景几个方面详细介绍Pimpl。

<!--more-->

## 什么是Pimpl？

Pimpl是Pointer to Implementation的缩写，即++指向实现的指针++。它的核心思想非常简单：

> 将类的实现细节隐藏到另一个实现类(Impl)中，对外只暴露一个指向实现对象的指针。

整体结构如下：

![图1 Pimpl整体结构](/images/202607/2/1.png '图1 Pimpl整体结构')

`MyClass`负责提供接口，`Impl`负责真正的实现。这样，用户只能看到接口，而无法看到内部实现细节。

## 为什么需要Pimpl？

先来看一个普通的类。

```cpp {title="MyClass.h"}
#include <vector>
#include <string>

class MyClass {
public:
  void foo();
private:
  std::vector<std::string> data_;
};

```

这种写法看起来没有问题，但实际上存在几个缺点。

### 1. 暴露实现细节

任何包含`MyClass.h`的代码，都能知道：

- 使用了`std::vector`
- 元素类型是`std::string`

如果以后希望改成`std::list<std::string>`或者`std::unordered_map<int, std::string>`，头文件就必须修改。

### 2. 编译依赖严重

假设项目结构如下：

![图2 项目结构](/images/202607/2/2.png '图2 项目结构')

如果修改了`std::vector<std::string>`，即使只是改成`std::vector<int>`，所有包含该头文件的源文件都会重新编译。大型项目中，一个头文件可能被几千个源文件包含。因此，++一次小修改，可能导致整个项目重新编译++。

### 3. ABI不稳定

ABI(Aplication Binary Interface，应用二进制接口)可以理解为程序编译完成后的二进制层面的约定。对于动态库来说：

```cpp
class MyClass {
  int a;
  int b;
};
```

后来增加一个成员：

```cpp
class MyClass {
 int a;
 int b;
 int c;
};
```

对象大小会发生变化。已经发布的程序可能会因为对象布局变化而出现ABI不兼容的问题。

## Pimpl如何解决这些问题？

采用Pimpl后：

```cpp {title="MyClass.h"}
#pragma once

#include <memory>

class MyClass {
public:
  MyClass();
  ~MyClass();

  void foo();
private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};
```

头文件只有一个前向声明和一个智能执政。完全没有暴露任何实现细节，真正的实现会全部放在`.cpp`中。

```cpp {title="MyClass.cpp"}
#include "MyClass.h"

#include <iostream>
#include <vector>
#include <string>

class MyClass::Impl {
public:
  std::vector<std::string> data_;
  void foo() {
    std::cout << "Hello Impl" << std::endl;
  }
};

MyClass::MyClass():impl_(std::make_unique<Impl>()) {
}

MyClass::~MyClass() = default;

void MyClass::foo() {
  impl_->foo();
}
```

以后即使把`std::vector<std::string>`改成`std::unordered_map<int, std::string>`也无需修改头文件。只有`MyClass.cpp`需要重新编译。

## 为什么析构函数不能写在头文件？

很多人第一次写Pimpl都会这样：

```cpp
class MyClass {
public:
  ~MyClass2() = default;

  void foo();
private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};

```

编译器会报错：

```
error: invalid application of 'sizeof' to incomplete type 'MyClass::Impl'
```

原因在于`std::unique_ptr<T>`默认用`delete`释放对象。而执行`delete impl_`必须知道`class Impl`的完整定义。但是头文件只有`class Impl;`这个前向声明，属于不完整类型(Incomplete type)。因此，析构函数需要放到`.cpp`中实现。

```cpp {title="MyClass.h"}
~MyClass();
```

```cpp {title="MyClass.cpp"}
MyClass::~MyClass() = default;
```

此时`Impl`已经完整定义，`unique_ptr`就能正常析构。

## 为什么推荐使用`std::unique_ptr`？

早期C++常见写法：

```cpp
Impl* impl_
```

构造：

```cpp
impl_ = new Impl;
```

析构：

```cpp
delete impl_;
```

现代C++推荐`std::unique_ptr<Impl> impl_`，优点包括：自动释放资源(RAII)、异常安全等。由于`std::unique_ptr`不能复制，因此：

```cpp
MyClass a;
MyClass b = a;
```

默认无法编译。通常有三种处理方式：

### 方式一：禁止复制

```cpp
MyClass(const MyClass&) = delete;
MyClass& operator=(const MyClass&) = delete;
```

### 方式二：支持移动

```cpp
MyClass(MyClass&&) noexcept = default;
MyClass& operator=(MyClass&&) noexcept = default;
```

### 方式三：实现深拷贝

如果希望支持复制，可以自己实现：

```cpp
MyClass::MyClass(const MyClass& other)
  : impl_(std::make_unique<Impl>(*other.impl_))
{

}
```

前提是`Impl`本身支持复制。

## ABI为什么更加稳定？

对于普通类：

```cpp
class MyClass {
  int a;
  int b;
};
```

对象大小会随着成员变化而变化。而Pimpl：

```cpp
class MyClass {
  std::unique_ptr<Impl> impl_;
};
```

无论增加成员、删除成员、修改成员类型，变化都发生`Impl`内部。`MyClass`始终只有一个指针成员，因此对象布局保持不变。这也是一些大型框架使用Pimpl的重要原因之一。

## Pimpl的优缺点

优点：

- 隐藏实现细节
- 降低头文件依赖
- 减少大规模重新编译
- 提高 ABI 稳定性
- 更利于库的版本升级

缺点：

- 多了一次动态内存分配
- 每次访问成员需要一次指针间接访问
- 实现代码稍复杂
- 调试时需要跳转到`Impl`
- 对于简单的小型类，收益并不明显

## 什么时候适合使用Pimpl？

Pimpl并不是所有类都需要使用，它更适用于以下场景：

- 对外发布的 SDK 或公共库
- 需要保持 ABI 稳定的动态库
- 大型工程，减少头文件依赖和编译时间
- 类依赖大量 STL 或第三方库
- 跨平台开发，需要隐藏平台相关实现

如果只是一个普通的数据结构，例如：

```cpp
struct Point {
  int x;
  int y;
};
```

或者一个简单的业务对象，就没有必要使用Pimpl。

## 总结

Pimpl的本质可以概括为一句话：

> 把实现放到`.cpp`，把接口留在`.h`。

它最大价值体现在三个方面：

1. 隐藏实现细节，降低模块耦合。
2. 减少头文件依赖，显著缩短大型项目的编译时间。
3. 保持 ABI 稳定，方便动态库长期维护和升级

对于大型 C++ 项目而言，Pimpl 已经成为一种经典且成熟的设计模式。但它并非银弹，对于简单类或性能极其敏感的场景，应权衡额外的堆分配和间接访问成本，再决定是否采用。

## 推荐

[cppreference.com PImpl](https://en.cppreference.com/cpp/language/pimpl)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:7953/c-pimpl%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F%E8%AF%A6%E8%A7%A3/  

