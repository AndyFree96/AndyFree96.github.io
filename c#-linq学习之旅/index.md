# C# LINQ学习之旅：从集合操作到声明式编程

在C#的发展过程中，有一个非常重要的转折点，那便是从「如何操作数据」转向「描述想要什么数据」。在LINQ出现之前，我们通常需要通过循环、条件判断、临时变量等方式完成数据查询。例如：

```c#
List<User> result = new();

foreach (var user in users)
{
    if (user.Age > 18)
    {
        result.Add(user);
    }
}
```

而LINQ提供了一种完全不同的思考方式：

```c#
var result = users.Where(x => x.Age > 18);
```

我们不再关注如何遍历集合，而关于我需要哪些数据，这就是LINQ带来的核心变化：从**命令式编程(Imperative Programming)**转向**声明式编程(Declarative Programming)**，本文将记录了学习LINQ的过程。

<!--more-->

## 为什么需要LINQ？

传统C#开发中，不同数据源有不同的操作方式：

| 数据源    | 查询方式    |
| :------ | :------- |
| 内存集合   | foreach |
| SQL数据库 | SQL     |
| XML    | XPath   |
| 对象模型   | 方法调用    |

LINQ的出现统一了数据查询方式。

![图1 不同数据源都支持LINQ](/images/202607/32/LINQContentImage-1024x663.png "图1 不同数据源都支持LINQ")

## 什么是LINQ？

LINQ(Language Integrated Query，语言集成查询)，它不是一个单独的库，而是一组语言特性和标准查询操作。

## LINQ的两种写法

LINQ提供两种语法—— **查询表达式(Query Syntax)** 和 **方法语法(Method Syntax)**。

### 查询表达式

类似SQL：

```c#
var result = from user in users where user.age > 18 select user;
```

优点是接近SQL，对复杂查询比较直观。缺点是功能有限，最终还是转换成方法调用。

### 方法语法

```c#
var result = users.Where(user => user.age > 18).Select(user => user.Name);
```

LINQ查询表达式只是方法的语法糖。

## LINQ的核心：扩展方法 + Lambda表达式

LINQ的核心是扩展方法(Extension Method)和Lambda表达式(Lambda Expression)这两个语言特性的结合。

### 扩展方法

例如：

```c#
public static IEnumerable<T>
Where<T>(
    this IEnumerable<T> source,
    Func<T,bool> predicate)
```

所以`users.Where(...)`，实际上是`Enumerable.Where(users, ...)`。

### Lambda表达式

例如：

```c#
x => x.Age > 18
```

等价：

```c#
bool Check(User x) {
  return x.Age > 18;
}
```

所以`user.Where(x => x.Age > 18)`本质上是把一个判断函数传递给`Where`。

## LINQ常用操作分类

### Filter 过滤

| 方法          | 说明       | 示例                             |
| :----------- | :-------- | :------------------------------ |
| `Where`     | 根据条件过滤元素 | `users.Where(x => x.Age > 18)` |
| `OfType<T>` | 按类型过滤    | `objects.OfType<string>()`     |


### Projection 投影/转换

| 方法           | 说明            | 示例                                |
| :------------ | :------------- | :--------------------------------- |
| `Select`     | 一对一转换         | `users.Select(x => x.Name)`       |
| `SelectMany` | 展开嵌套集合（一对多转换） | `users.SelectMany(x => x.Orders)` |


### Sorting 排序

| 方法                  | 说明       | 示例                                    |
| :------------------- | :-------- | :------------------------------------- |
| `OrderBy`           | 升序排序     | `users.OrderBy(x => x.Age)`           |
| `OrderByDescending` | 降序排序     | `users.OrderByDescending(x => x.Age)` |
| `ThenBy`            | 第二排序条件   | `.ThenBy(x => x.Name)`                |
| `ThenByDescending`  | 第二排序条件降序 | `.ThenByDescending(x => x.Score)`     |
| `Reverse`           | 反转序列     | `list.Reverse()`                      |


### Grouping 分组

| 方法         | 说明               | 示例                                  |
| :---------- | :---------------- | :----------------------------------- |
| `GroupBy`  | 根据 Key 分组        | `users.GroupBy(x => x.Department)`  |
| `ToLookup` | 创建 Key-Value 查询表 | `users.ToLookup(x => x.Department)` |


### Joining 连接

| 方法          | 说明        | 类似 SQL            |
| :----------- | :--------- | :----------------- |
| `Join`      | 内连接两个集合   | INNER JOIN        |
| `GroupJoin` | 分组连接      | LEFT JOIN + GROUP |
| `Zip`       | 按位置合并两个集合 | -                 |

### Set Operations 集合操作

| 方法          | 说明     | 示例                   |
| :----------- | :------ | :-------------------- |
| `Distinct`  | 去重     | `numbers.Distinct()` |
| `Union`     | 并集（去重） | `a.Union(b)`         |
| `Intersect` | 交集     | `a.Intersect(b)`     |
| `Except`    | 差集     | `a.Except(b)`        |

### Element Operations 元素获取

| 方法                   | 说明       | 无结果行为   |
| :-------------------- | :-------- | :------- |
| `First`              | 获取第一个元素  | 抛异常     |
| `FirstOrDefault`     | 获取第一个元素  | 返回默认值   |
| `Last`               | 获取最后元素   | 抛异常     |
| `LastOrDefault`      | 获取最后元素   | 返回默认值   |
| `Single`             | 获取唯一元素   | 0个或多个异常 |
| `SingleOrDefault`    | 获取唯一元素   | 返回默认值   |
| `ElementAt`          | 根据索引获取   | 越界异常    |
| `ElementAtOrDefault` | 根据索引获取   | 返回默认值   |
| `DefaultIfEmpty`     | 空集合提供默认值 | -       |


### Quantifier Operations 条件判断

| 方法         | 说明          | 示例                       |
| :---------- | :----------- | :------------------------ |
| `Any`      | 是否存在满足条件的数据 | `users.Any(x=>x.Age>18)` |
| `All`      | 是否全部满足条件    | `users.All(x=>x.Active)` |
| `Contains` | 是否包含元素      | `list.Contains(id)`      |


### Aggregation 聚合统计

| 方法          | 说明      | 示例                       |
| :----------- | :------- | :------------------------ |
| `Count`     | 数量统计    | `users.Count()`          |
| `LongCount` | 长整型数量统计 | `items.LongCount()`      |
| `Sum`       | 求和      | `orders.Sum(x=>x.Price)` |
| `Average`   | 平均值     | `scores.Average()`       |
| `Min`       | 最小值     | `scores.Min()`           |
| `Max`       | 最大值     | `scores.Max()`           |
| `Aggregate` | 自定义聚合   | 字符串拼接                    |


### Partitioning 分页/截取

| 方法          | 说明       | 示例                    |
| :----------- | :-------- | :--------------------- |
| `Take`      | 获取前 N 个  | `.Take(10)`           |
| `TakeLast`  | 获取最后 N 个 | `.TakeLast(10)`       |
| `Skip`      | 跳过前 N 个  | `.Skip(10)`           |
| `SkipLast`  | 跳过最后 N 个 | `.SkipLast(10)`       |
| `TakeWhile` | 满足条件持续获取 | `.TakeWhile(x=>x<10)` |
| `SkipWhile` | 满足条件持续跳过 | `.SkipWhile(x=>x<10)` |


### Generation 生成

| 方法         | 说明     | 示例                         |
| :---------- | :------ | :-------------------------- |
| `Empty<T>` | 创建空集合  | `Enumerable.Empty<User>()` |
| `Range`    | 创建整数序列 | `Enumerable.Range(1,10)`   |
| `Repeat`   | 重复生成元素 | `Enumerable.Repeat("A",5)` |


### Conversion 转换

| 方法             | 说明              | 示例                       |
| :-------------- | :--------------- | :------------------------ |
| `ToList`       | 转换为 List        | `.ToList()`              |
| `ToArray`      | 转换为数组           | `.ToArray()`             |
| `ToDictionary` | 转换为字典           | `.ToDictionary(x=>x.Id)` |
| `ToHashSet`    | 转换为 HashSet     | `.ToHashSet()`           |
| `Cast<T>`      | 强制类型转换          | `.Cast<User>()`          |
| `AsEnumerable` | 转换为 IEnumerable | `.AsEnumerable()`        |
| `AsQueryable`  | 转换为 IQueryable  | `.AsQueryable()`         |


### Equality Operations 序列比较

| 方法              | 说明             | 示例                   |
| :--------------- | :-------------- | :-------------------- |
| `SequenceEqual` | 判断两个序列内容是否完全一致 | `a.SequenceEqual(b)` |


### Concatenation 连接

| 方法       | 说明     | 区别  |
| :-------- | :------ | :--- |
| `Concat` | 连接两个序列 | 不去重 |
| `Union`  | 合并集合   | 去重  |

## 推荐

[LINQ实战](https://book.douban.com/subject/3810446/)

## 参考

[C# LINQ](https://www.csharptutorial.net/csharp-linq/)

[DOTNET Tutorials LINQ](https://dotnettutorials.net/course/linq/)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/c%23-linq%E5%AD%A6%E4%B9%A0%E4%B9%8B%E6%97%85/  

