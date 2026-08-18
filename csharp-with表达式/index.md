# C# with表达式：优雅地创建对象副本


`with`是[C# 9.0](https://devblogs.microsoft.com/dotnet/welcome-to-c-9-0/)引入的一个非常实用的特性，它让我们可以在保留原对象大部分属性的情况下，只修改少量属性并创建一个新对象。它尤其适合与`record`、不可变对象(Immutable Object)以及函数式编程风格结合使用。
<!--more-->

## 为什么需要with？

假设为门有一个用户类：

```c#
public record User {
  public string Name {get; init; }
  public int Age {get; init; }
  public string Email {get; init; }
}
```

现有有一个用户：

```c# 
var user = new User{
  Name = "Alice",
  Age = 20,
  Email = "alice@example.com"
};
```

如果我们希望创建一个年龄为21岁的新用户：

```c#
var newUser = new User{
  Name = user.Name,
  Age = 21,
  Email = user.email
};
```

代码没有问题，但存在一个明显的问题：**我们只是想修改一个属性，却需要重新填写所有属性**。可以预想到，如果属性很多，代码会变得非常繁琐。这时`with`就非常有用了。

## with的基本用法

```c#
var newUser = user with
{
  Age = 21
};
```

执行之后，原来的`user`不会发生变化。这就是`with`的方便之处，基于已有对象创建一个新的对象，同时只修改指定成员。注意：`with`并不是修改原对象，而是创建了一个新对象。

我们可以验证：

```c#
Console.WriteLine(ReferenceEquals(user, newUser)); // False
```

说明两个变量指向的是不同对象。

## with是浅拷贝

`with`并不意味着递归复制整个对象。例如：

```c#
public record User {
  public string Name {get; init; }
  public Address Address {get; init;}
}

public class Address {
  public string City {get; set;}
}
```

创建：

```c#
var user1 = new User
{
    Name = "Alice",
    Address = new Address
    {
        City = "Shanghai"
    }
};
```

然后：

```c#
var user2 = user1 with
{
    Name = "Bob"
};
```

此时：

```c#
Console.WriteLine(ReferenceEquals(user1.Address, user2.Address)); // True
```

说明两个`User`是不同对象，但它们引用的是同一个`Address`。所以，`with`默认是浅复制(Shallow Copy)，而不是深复制(Deep Copy)。

## 总结

C#的`with`表达式可以基于已有对象创建新的对象，而不是直接修改已有对象。最典型的组合是：`record` + `with`。二者结合后，可以非常自然地床见不可变对象：

```c#
var newObject = oldObject with 
{
  Property = newValue
};
```

需要记住三点：

1. `with`会创建新对象，而不是修改原对象
2. `with`默认是浅复制，不是深复制
3. `with`特别适合`record`和不可变状态


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/csharp-with%E8%A1%A8%E8%BE%BE%E5%BC%8F/  

