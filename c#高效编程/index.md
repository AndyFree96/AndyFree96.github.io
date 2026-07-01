# C#高效编程 改进C#代码的50个行之有效的办法 第2版 (Bill Wagner)


在软件开发过程中，写出“能运行”的代码并不难，真正困难的是写出一段**容易理解、容易维护、容易扩展，并且能够长期稳定运行的代码**。随着项目规模不断扩大，代码往往会经历这样的变化。

最初，一个类可能只有几十行。逻辑简单，修改起来非常直接；但随着需求不断增加，功能不断堆叠，代码开始出现越来越多的问题：

- 一个方法越来越长，承担了太多职责；
- 类之间的依赖越来越复杂，修改地方可能影响多个模块；
- 重复代码不断出现，导致维护成本增加；
- 异常处理、资源释放、性能优化等细节容易被忽略；
- 新成员接手代码时，需要花费大量时间理解历史逻辑。

这些问题并不是因为开发者能力不足，而是因为**代码质量需要持续演进**。C# 作为一门成熟的面向对象语言，提供了大量语言特性帮助我们编写更优雅、更安全的代码，例如泛型、委托、Lambda、LINQ、异步编程、特性(Attribute)、模式匹配等。但如果只是掌握语法，而没有形成良好的编程习惯，很容易写出“看起来能工作，但长期维护困难”的代码。

[《C# 高效编程：改进 C# 代码的 50 个有效办法 第2版》](https://book.douban.com/subject/5360961/)这本书并不是单纯讲解 C# 语法，而是从工程实践角度，总结了大量能够改善代码质量的技巧和原则。

这些建议覆盖了多个方面：

- 如何正确设计类型和接口；
- 如何减少代码耦合；
- 如何利用 C# 特性提升表达能力；
- 如何处理异常、资源和状态；
- 如何编写更高性能、更可靠的程序。

接下来，我会结合书中的实践建议，并加入自己在项目开发中的理解，对这些技巧进行整理，希望能够帮助自己，也帮助更多 C# 开发者写出更加健壮、优雅的代码。

<!--more-->

## 第1章 C#语言习惯

为何程序已经可以正常工作了，还要继续修改呢？答案是==我们还能让程序变得更好==[secondary]。如果我们总是墨守成规，那么将永远体会不到新技术带来的优化。++本章将讨论那些在C#中应该改变的旧习惯，以及与其对应的推荐的新做法。++

### 条目1 使用属性而不是可访问属性的数据成员

属性允许将数据成员作为公共接口的一部分暴露出去，同时仍提供面向对象环境下所需要的封装。属性这个语言元素可让我们像访问数据成员一样使用，但底层依旧使用方法实现。

在以后可能会产生新的需求或行为场景中，属性更容易修改。例如，很快就有想法，客户对象的名称不应该为空白。若使用了共有属性来封装`Name`，那么只要修改一处即可。

```c# {hl_lines=["10-13"]}
public class Customer
{
    private string name;
    public string Name
    {
        get { return name; }

        set
        {
            if (string.IsNullOrEmpty(value))
            {
                throw new ArgumentException("Name cannot be blank", "Name");
            }

            name = value;
        }
    }
}
```

若是使用了公有的数据成员，那么就需要每一个设置客户名称的代码并逐一修复，将花费大量时间。由于属性是使用方法来实现的，所以添加++多线程支持++也非常简单。

```c# {hl_lines=[3,"9-11","20-23"]}
public class Customer
{
    private readonly object syncHandle = new();

    private string name;
    public string Name
    {
        get {
            lock (syncHandle) {
                return name;
            }
        }

        set
        {
            if (string.IsNullOrEmpty(value))
            {
                throw new ArgumentException("Name cannot be blank", "Name");
            }
            lock (syncHandle)
            {
                name = value;
            }
        }
    }
}
```

属性用于方法的所有语言特性。例如，++属性可以是虚的（virtual），允许子类重写（override）属性的读写逻辑。++

```c#
public class Animal
{
    public virtual string Name { get; set; }
}

public class Dog: Animal
{
    public override string Name
    {
        get
        {
            return "Dog: " + base.Name;
        }

        set
        {
            base.Name = value;
        }
    }
}
```

属性为什么可以是虚的？因为属性本质上不是字段。

```c#
public string Name { get;set;}
```

编译后类似：

```c#
private string _name;


public string get_Name()
{
    return _name;
}


public void set_Name(string value)
{
    _name = value;
}
```

所以`animal.Name`,调用的是`animal.get_Name()`。

还++可以将属性声明为抽象的（abstract）++。意思是这个属性没有实现（没有getter/setter），必须由子类强制实现。

```c#
public abstract class Animal
{
    public abstract string Name { get; set; }

}

public class Dog: Animal
{
    private string _name;

    public override string Name { get => _name; set => _name = value; }
}
```

和 virtual 属性的区别：

| 特性             | virtual 属性 | abstract 属性 |
| ---------------- | ------------ | ------------- |
| 是否有默认实现   | ✔ 有         | ✘ 没有        |
| 子类是否必须重写 | ❌ 不必须    | ✔ 必须        |
| 是否能实例化基类 | ✔ 可以       | ❌ 不可以     |
| 设计意图         | “可选覆盖”   | “必须实现”    |

++若类型需要包含并暴露出可索引的功能，那么可以使用索引器（indexer）++。它让对象像数组一样，通过参数访问内部数据。

```c#
public class MyCollection
{
    private string[] _data = new string[10];

    public string this[int index]
    {
        get { return _data[index]; }
        set { _data[index] = value; }
    }
}

// 使用
var c = new MyCollection();
c[0] = "hello";
Console.WriteLine(c[0]);
```

编译后的本质是：

```c#
get_Item(int index)
set_Item(int index, string value)
```

只是C#提供了语法糖：

```c#
c[0]
```

索引器不仅仅是`[int]`，可以是任意参数组合。

```c#
public class Matrix
{
    private int[,] _data = new int[10, 10];

    public int this[int x, int y]
    {
        set { _data[x, y] = value; }

        get { return _data[x, y]; }
    }
}

// 使用
var matrix = new Matrix();
matrix[1, 2] = 100;
Console.WriteLine(matrix[1, 2]);
```

支持不同类型参数。

```c#
public class ConfigStore
{
    private Dictionary<string, string> _dict = new();

    public string this[string key]
    {
        get { return _dict[key]; }

        set { _dict[key] = value; }
    }
}

// 使用
var config = new ConfigStore();
config["ip"] = "127.0.0.1";
Console.WriteLine(config["ip"]);
```

属性访问就像是访问一个数据字段，因此不要与访问数据有太过明显的性能差别。属性访问器不要执行长时间的计算，或进行跨应用程序的调用（例如数据库查询等），或是其他与调用者期待不符的耗时操作。

> [!TIP] 本条目作者想表达的是
> 无论何时需要在类型的公有或保护接口中暴露数据，都应该使用属性。也应该使用索引器暴露序列或字典。所有的数据成员都应该是私有的，没有例外。

### 条目8 推荐使用查询语法而不是循环

程序逻辑的表达由命令式（Imperative）转为声明式（Declarative）核心意思是：

> 从“告诉计算机一步一步怎么做”，变成“告诉计算机我想要什么结果，由系统决定怎么实现”。

#### 命令式: 描述过程 (How)

命令式变成关注控制流程。

```c#
int[] foo = new int[100];
for (int num = 0; num < foo.Length; num++)
{
    foo[num] = num * num;
}
```

控制了执行步骤。

#### 声明式: 描述结果 (What)

```c#
int[] foo = [.. (from n in Enumerable.Range(0, 100) select n * n)];
```

表达的是目标状态，而不是实现过程。

> [!TIP] 本条目作者想表达的是
> 查询语法要比传统的命令式循环结构更加清晰地表达我们的意图。

## 第2章 .NET资源管理

### 条目12 推荐使用初始化器而不是赋值语句

随着时间推移，成员变量增加，构造函数个数也会不停增加。预防的办法就是，在声明变量时（静态和实例变量）就进行初始化，而不是在每个构造函数中进行。

```c#
public class MyClass {
  private List<string> labels = new();
}
```

++初始化器生成的代码会在构造函数代码运行前执行++。初始化器将在执行基类构造函数之前执行，其顺序与类中成员变量声明的顺序保持一致。

```c#
namespace Item12
{

    public class Animal {
        private string name = InitName();
        private string type = InitType();

        public Animal() {
            Console.WriteLine("Animal构造函数");
        }

        private static string InitName()
        {
            Console.WriteLine("Animal字段初始化Name执行");
            return "A";
        }

        private static string InitType()
        {
            Console.WriteLine("Animal字段初始化Type执行");
            return "B";
        }
    }

    public class Dog : Animal {
        private int age = InitAge();

        public Dog()
        {
            Console.WriteLine("Dog构造函数");
        }

        private static int InitAge()
        {
            Console.WriteLine("Dog字段初始化Age执行");
            return 10;
        }
    }


    internal class Program
    {
        static void Main(string[] args)
        {
            Animal animal = new Dog();
        }
    }
}

```

结果如下：

![初始化器和构造函数执行顺序](/images/202606/3/1.png '初始化器和构造函数执行顺序')

如下3种情况应该避免使用初始化器。

1. 想要初始化对象为0或`null`时。
2. 需要对同一个变量执行不同的初始化方式。
3. 将初始化代码放在构造函数中方便异常处理。初始化器无法用`try`包裹。对象初始化器执行的过程中发生的所有异常都会被传递到对象之外。在类的内部无法尝试修复。

综上，若是所有的构造函数都要将某个成员变量初始化成同一个值，那么应该使用初始化器语法。

### 条目13 正确地初始化静态成员变量

若只是为了给某个静态成员分配空间，不妨使用初始化器语法。若是要以更复杂的逻辑来初始化静态成员变量，则可以使用静态构造函数。

```c#
namespace Item13
{
    class Test
    {
        private static int a = InitA();

        private static int b = InitB();


        static Test()
        {
            Console.WriteLine("Static Constructor");
        }


        public static void Run()
        {
            Console.WriteLine("Run");
        }


        static int InitA()
        {
            Console.WriteLine("Init A");
            return 1;
        }


        static int InitB()
        {
            Console.WriteLine("Init B");
            return 2;
        }
    }

    internal class Program
    {
        static void Main(string[] args)
        {

            Test.Run();
        }
    }
}

```

结果如下：

![静态初始化器和静态构造函数执行顺序](/images/202606/3/2.png '静态初始化器和静态构造函数执行顺序')

## 第3章 使用C#表达设计

## 第4章 使用框架

## 第5章 C#中的动态编程

## 第6章 杂项

## 推荐

[LINQ实战](https://book.douban.com/subject/3810446/)

## 参考

[C#高效编程 改进C#代码的50个行之有效的办法(第2版)](https://book.douban.com/subject/5360961/)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:9613/c%23%E9%AB%98%E6%95%88%E7%BC%96%E7%A8%8B/  

