# C#中的nameof运算符


在日常 C# 开发中，我们经常需要获取变量名、属性名、方法名或类型名的字符串形式，比如：

- 抛出参数异常时提示参数名
- 日志记录字段名称
- 数据绑定、反射、序列化
- MVVM / ASP.NET 中的属性通知

在 C# 6.0 之前，这些字符串往往是硬编码的魔法字符串（Magic String），维护成本极高。而 nameof 的出现，几乎是一次“工程级”的体验升级。

<!--more-->

## 什么是 nameof

`nameof` 是 C# 6.0 引入的一个编译期运算符，用于在编译时获取一个符号（变量、属性、方法、类型等）的名称字符串。

```c#
int count = 10;
Console.WriteLine(nameof(count)); // count
```

核心特性：

- 编译时解析
- 零运行时开销
- 重构安全（重命名不会出 Bug）

## 为什么要用 nameof

先看一个例子：

```c#
void SetAge(int age)
{
    if (age < 0)
    {
        throw new ArgumentOutOfRangeException("Age cannot be negative.", "age");
    }
}
```

如果某天把参数`age`改成`userAge`：

```c#
void SetAge(int userAge)
```

那么问题来了：

- 编译不会报错
- 异常参数名仍然是字符串`age`
- IDE 重构也没有用

但如果使用`nameof`的话：

```c#
void SetAge(int userAge)
{
    if (userAge < 0)
    {
        throw new ArgumentOutOfRangeException("Age cannot be negative.", nameof(userAge));
    }
}
```

优点立刻显现：

- 参数名永远正确
- 重构自动同步
- 编译期校验

## nameof 的常见用法

### 参数校验

```c#
public void Login(string username) {
  if (username == null)
    throw new ArgumentNullException(nameof(username));
}
```

这是.NET 官方源码中最常见的 nameof 使用场景。

### 获取属性名

```c#
public class User: INotifyPropertyChanged
{
  private string _name;

  public string Name {
    get => _name;
    set
    {
      _name = value;
      OnPropertyChanged(nameof(Name));
    }
  }
}
```

相比：

```c#
OnPropertyChanged("Name");
```

`nameof`更安全、更优雅。

### 日志 & 诊断信息

```c#
_logger.Debug("Current value of {Field}", nameof(order,TotalPrice));
```

避免字段名写错、重构友好。

### 获取类型名

```c#
Console.WriteLine(nameof(List<int>)); // List
Console.WriteLine(nameof(UserService)); // UserService
```

`nameof(List<int>)`返回的是类型名，不包含泛型参数。

### 方法名 / 事件名

```c#
Console.WriteLine(nameof(DoWork));
Console.WriteLine(nameof(PropertyChanged));
```

适用于 AOP、日志以及诊断追踪。

## nameof 的一些注意点

### nameof 不会求值

```c#
int count = 10;
Console.WriteLine(nameof(count + 1)); // 编译错误
```

`nameof`只接受符号，不接受表达式。

### 支持命名空间 & 成员访问

```c#
Console.WriteLine(nameof(System.Text.StringBuilder)); // StringBuilder
Console.WriteLine(nameof(user.Name)); // Name
```

只返回最后一个标识符。

## 推荐

- https://www.bytehide.com/blog/nameof-csharp


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:7953/c%23%E4%B8%AD%E7%9A%84nameof%E8%BF%90%E7%AE%97%E7%AC%A6/  

