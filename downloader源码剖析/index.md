# Downloader源码剖析：一个下载器的实现原理


在开发日常工作中，文件下载看似是一个再普通不过的功能，但当下载规模扩大、速度需要优化、断点续传需要保证、并发控制需要精确、甚至要处理上百 GB 的大文件时，“下载器”就迅速从普通工具变成了一个考验系统设计能力的实战项目。[Downloader](https://github.com/bezzad/Downloader) 正是这样一个值得深入研究的优秀示例。它不仅实现了多线程下载、断点续传、分块合并、速度统计等核心功能，还在架构设计、并发模型、代码组织方式上体现了 C# 在现代并发场景下的最佳实践。对于正在学习 C# 并发编程、网络 IO、上位机开发的工程师来说，它几乎是一个“天然的进阶教材”。

<!--more-->

## 概览

- `DownloadBuilder`构建器用于创建`Download`实例。
- `DownloadSerivce`下载引擎, 执行实际下载、派发事件, 被`Download`调用。
- `Download`外部任务封装, 统一 API、事件、生命周期。
- `DownloadPackage`是整个下载体系中的核心状态, 它相当于是 DownloadService 的"心脏"——负责记录任务当前的进度、文件分块、存储位置、状态等数据。
- `ChunkHub`是整个系统中"将下载任务拆解为可并行执行单元"的关键调度组件, 类似管理员的角色。
- `ConcurrentPacketBuffer<T>`是一个线程安全的"数据包缓冲队列"。
- `ConcurrentStream`是一个不断吃`Packet`, 并把它写到文件里的后台线程。

## `DownloadBuilder`

`DownloadBuilder`解耦配置构建逻辑。用户在使用下载器时往往需要传入很多参数:

- URL
- 保存路径
- 下载线程数
- 回调事件
- 缓冲区大小
- 重试策略
- 临时目录

如果这些都堆在构造函数里, 代码就会变成:

```CSharp
new Download("url", "folder", "file", config, retryCount, onProgress, onError, saveMode, ...)
```

不仅丑, 而且难以维护。通过`DownloadBuilder`, 可以这样写:

```CSharp
var download = DownloadBuilder.New()
    .WithUrl("https://example.com")
    .WithDirectory("Downloads")
    .WithFileName("file.zip")
    .WithConfiguration(config)
    .Build();
```

让配置步骤流式化, 避免构造函数爆炸, 方便默认值管理与参数验证。

> 关键思想: 封装对象创建过程, 解耦复杂配置逻辑

## `Download`

`Download`: 抽象出"下载任务"这一层语义。

开发者并不需要关心"多线程下载"、"断点续传"的底层逻辑。他们只想"启动、暂停、继续、停止、订阅事件"。于是`Download`就成了对外暴露的任务级封装:

```CSharp
await download.StartAsync();
download.Pause();
download.Resume();
```

`Downlad`自己不执行下载, 而是:

- 委托给`_downloadService`
- 对外暴露事件
- 管理生命周期

## `DownloadService`

`DownloadService`: 执行核心逻辑, 单一职责。

真正的下载过程涉及大量细节:

- 创建 HTTP 请求
- 计算分块
- 并发下载
- 写入文件流
- 更新进度
- 处理暂停/恢复/取消
- 合并文件块
- 派发事件

这些都是复杂的业务逻辑, 如果直接暴露给外层, 维护成本极高。

设计目的:

- 把所有底层实现收拢到一个服务类
- 隔离外部接口, 保证可替换性
- 可扩展(例如未来改成 FTP 下载, 只要换个 Service)

> 关键思想: 单一职责原则(SRP) + 依赖倒置原则(DIP)

## `DownloadPackage`

在整个层次结构里:

DownloadBuilder → Download → DownloadService → DownloadPackage

可以这样理解:

- `DownloadService`是下载引擎
- `DownloadPackage`是引擎内部的数据模型, 它记录了下载的"实时状态"和"元信息"

`DownloadPackage`就是任务快照(Task Snapshot), 它不是用来执行逻辑的, 而是用来保存下载任务的所有中间状态, 这样下载就可以被暂停、恢复、甚至断点续传。

在`DownloadService`内部会有一个成员(继承自`AbstractDownloadService`):

```CSharp
public DownloadPackage Package { get; set; }
```

执行下载时, `DownloadService`会:

1. 根据文件大小、线程数等配置划分多个`Chunk`
2. 把每个`Chunk`对象放入`Package.Chunks`
3. 每个线程下载自己的块并更新`Chunk.Position`
4. `Package.ReceivedBytesSize`根据所有`Chunk.Position`汇总进度
5. 当下载完成时`Package.Status`被标记为`Completed`

外层`Download`通过:

```CSharp
public long DownloadedFileSize => _downloadService?.Package?.ReceivedBytesSize ?? 0;
```

来获取进度。

## `ChunkHub`

```CSharp
/// <summary>
/// Sets the file chunks for the specified download package.
/// </summary>
/// <param name="package">The download package to set the chunks for.</param>
public void SetFileChunks(DownloadPackage package)
{
    Validate(package);
    if (package.Chunks is null)
    {
        package.Chunks = new Chunk[_chunkCount];
        for (int i = 0; i < _chunkCount; i++)
        {
            long startPosition = _startOffset + (i * _chunkSize);
            long endPosition = startPosition + _chunkSize - 1;
            package.Chunks[i] = GetChunk(i.ToString(), startPosition, endPosition);
        }
        package.Chunks.Last().End += package.TotalFileSize % _chunkCount; // add remaining bytes to last chunk
    }
    else
    {
        package.Validate();
    }
}
```

`ChunkHub.SetFileChunks(DownloadPackage package)`会:

- 读取配置, 决定块数和大小
- 在`package.Chunks`中创建`Chunk`数组
- 把最后一块字节数补齐(应对除不尽的情况)
- 若已有块(断点续传情况), 则调用`package.Validate()`校验完整性

`DownloadPackage`只保存数据(状态), `ChunkHub`负责生成与维护这些块的逻辑。

## `PauseTokenSource`和`PauseToken`

`PauseTokenSource`有点像遥控器, 可以按"暂停"、"继续"。

`PauseToken`有点像电视机, 根据信号决定是否播放。

所有电视(任务)拿的都是同一个信号源(同一个遥控器)。一按"暂停", 所有电视都停了。再按"继续", 所有电视都继续播放。

```CSharp
public class PauseTokenSource
{
    private volatile TaskCompletionSource<bool> _tcsPaused;
    public PauseToken Token => new(this);
    public bool IsPaused => _tcsPaused != null;
}
```

`_tcsPaused`一个暂停信号, 当它存在时, 说明"暂停中"。当它为`null`时, 说明"未暂停"。
`Token`用来发给电视(下载任务)的信号接收器。

当按下"暂停"按钮时:

```CSharp
public void Pause()
{
    Interlocked.CompareExchange(ref _tcsPaused, new TaskCompletionSource<bool>(), null);
}
```

如果`_tcsPaused`现在是`null`(没有暂停), 就创建一个新的`TaskCompletionSource<bool>`(表示暂停任务还没结束)。
`TaskCompletionSource`是个等待信号的容器, 还没完成的时候, 别人`await TaskCompletionSource.Task`会一直卡在那。
一旦调用`SetResult(true)`, 所有在等待的任务都会醒来。所以这里其实就是:

> 暂停 = 建立一个未完成的信号

当按下"继续"按钮时:

```CSharp
public void Resume()
{
    while (true)
    {
        TaskCompletionSource<bool> tcs = _tcsPaused;
        if (tcs == null)
            return;

        if (Interlocked.CompareExchange(ref _tcsPaused, null, tcs) == tcs)
        {
            tcs.SetResult(true);
            return;
        }
    }
}
```

取出`_tscPaused`, 把它设为`null`(说明不再暂停), 调用`tsc.SetResult(true)`唤醒所有正在等待的任务。

> 恢复 = 把信号改为完成状态, 所有挂起的任务立刻继续

任务是如何等待暂停的?

```CSharp
internal Task WaitWhilePausedAsync()
{
    return _tcsPaused?.Task ?? Task.FromResult(true);
}
```

如果`_tcsPaused`有值(说明暂停中), 就返回`_tcsPaused.Task`, 等它完成(即等待恢复信号); 返回一个"已完成的任务", 直接继续执行。

```CSharp
public record PauseToken
{
    private readonly PauseTokenSource _tokenSource;
    public bool IsPaused => _tokenSource?.IsPaused == true;

    public Task WaitWhilePausedAsync()
    {
        return IsPaused
            ? _tokenSource.WaitWhilePausedAsync()
            : Task.FromResult(true);
    }
}
```

`PauseToken`(电视机端)其实什么都不控制, 只负责"听信号":

问`IsPaused`是不是暂停中? 如果暂停，就调用`WaitWhilePausedAsync()`等待; 如果没暂停，就直接继续。

## `ConcurrentPacketBuffer<T>`

工作流:

producer threads (N) → TryAdd(packet) → Queue → consumer thread (1) → callback(packet)

写入端(TryAdd)不会自己写文件, 只会放入队列, 由消费者来消费。

多个线程同时写入(下载线程), 一个后台线程负责消费(写文件)。

## `ConcurrentStream`

它是一个"包装流", 支持多线程写入、自动分块写入、自动后台写入。

本质上它是: **一个不断吃`Packet`，并把它写到文件里的后台线程**。

它包含：

- 一个`ConcurrentPacketBuffer<Packet>`
- 一个`Watcher() `后台循环
- `writeAsync`只是往`_inputBuffer`扔包
- `Watcher`会不断从`_inputBuffer`取包，然后写入文件

```CSharp
private async Task WritePacketOnFile(Packet packet)
{
    // seek with SeekOrigin.Begin is so faster than SeekOrigin.Current
    Seek(packet.Position, SeekOrigin.Begin);
    await Stream.WriteAsync(packet.Data).ConfigureAwait(false);
    packet.Dispose();
}

```

工作流:

```
ConcurrentStream.WriteAsync()
      ↓
InputBuffer.TryAdd(Packet)
      ↓
ConcurrentStream 的 Watcher 循环 WaitTryTakeAsync() 取包
      ↓
WritePacketOnFile(packet)
      ↓
写入文件 / 内存流
```

## `SocketClient`

从源码注释即可看到：

```csharp
/// <summary>
/// Represents a client for making HTTP requests.
/// </summary>
public partial class SocketClient : IDisposable
```

该类用于发送 HTTP 请求。类的开头定义了一些`const`变量，尝试给`const`变量前增加`static`修饰符，结果发现是不允许的，详情可见[Why can't I have "public static const string S = "stuff"; in my Class?](https://stackoverflow.com/questions/408192/why-cant-i-have-public-static-const-string-s-stuff-in-my-class)。

为了高效使用网络，SocketClient 中配置了`SocketsHttpHandler`。相比于以前的`HttpClientHandler`提供了更高的性能和更多的自定义选项，尤其再多线程环境中，它的连接池管理和链接复用机制更加高效。

```csharp
private SocketsHttpHandler GetSocketsHttpHandler(RequestConfiguration config)
{
    SocketsHttpHandler handler = new() {
        AllowAutoRedirect = config.AllowAutoRedirect,
        MaxAutomaticRedirections = config.MaximumAutomaticRedirections,
        AutomaticDecompression = config.AutomaticDecompression,
        PreAuthenticate = config.PreAuthenticate,
        UseCookies = config.CookieContainer != null,
        UseProxy = config.Proxy != null,
        MaxConnectionsPerServer = 1000,
        PooledConnectionIdleTimeout = config.KeepAliveTimeout,
        PooledConnectionLifetime = Timeout.InfiniteTimeSpan,
        EnableMultipleHttp2Connections = true,
        ConnectTimeout = TimeSpan.FromMilliseconds(config.Timeout)
    };

    // Set up the SslClientAuthenticationOptions for custom certificate validation
    if (config.ClientCertificates?.Count > 0)
    {
        handler.SslOptions.ClientCertificates = config.ClientCertificates;
    }

    handler.SslOptions.EnabledSslProtocols = SslProtocols.Tls13 | SslProtocols.Tls12;
    handler.SslOptions.RemoteCertificateValidationCallback = ExceptionHelper.CertificateValidationCallBack;

    // Configure keep-alive
    if (config.KeepAlive)
    {
        handler.KeepAlivePingTimeout = config.KeepAliveTimeout;
        handler.KeepAlivePingPolicy = HttpKeepAlivePingPolicy.WithActiveRequests;
    }

    // Configure credentials
    if (config.Credentials != null)
    {
        handler.Credentials = config.Credentials;
        handler.PreAuthenticate = config.PreAuthenticate;
    }

    // Configure cookies
    if (handler.UseCookies && config.CookieContainer != null)
    {
        handler.CookieContainer = config.CookieContainer;
    }

    // Configure proxy
    if (handler.UseProxy && config.Proxy != null)
    {
        handler.Proxy = config.Proxy;
    }
    
    // Add expect header
    if (!string.IsNullOrWhiteSpace(config.Expect))
    {
        handler.Expect100ContinueTimeout = TimeSpan.FromSeconds(1);
    }
    
    return handler;
}
```

`AllowAutoRedirect`控制是否允许自动跟随 HTTP 重定向（例如 301、302 状态码）。如果设置为`true`，`HttpClient`会自动处理除雾器返回的重定向请求。如果设置为`false`，需要手动处理重定向。

`MaxAutomaticRedirections`限制`HttpClinet`在遇到重定向时最多跟随的次数。避免循环重定向或过多的重定向导致请求陷入死循环。一般情况下，默认值（50）就足够了，除非特殊场景下需要定义设置较小或较大的重定向次数。

`AutomaticDecompression`启用对 HTTP 响应内容的自动解压缩，支持`gzip`和`deflate`、`brotli`编码。启动自动解压可以减少网络带宽的使用，尤其是当服务器返回压缩数据时。默认情况下，`HttpClient`会自动解压这两种常见的编码。对于需要优化带宽的应用，启用自动解压缩是推荐的做法。

`PreAuthenticate`控制是否在请求头中自动包含认证信息（例如`Authorization`）。当`PreAuthenticate`为`true`时，`HttpClient`会在发送请求之前先发送认证信息，如果需要身份验证（例如基本认证）。如果请求需要身份认证，且希望提前处理认证，可以将此选项设置为`true`。

`UseCookies`启动或禁用 cookies 支持。当`UseCookies`为`true`时，`HttpClient`会自动处理`Set-Cookie`和`Cookie`头部，管理客户端的 cookies。如果不需要管理 cookies（例如某些无状态 API 请求），可以将其设置为`false`，以提高性能。

`UseProxy`控制是否启动代理。当`UseProxy`为`true`时，`HttpClient`会使用配置的代理服务器来发送请求。可以通过`Proxy`属性来设置代理服务器。如果在特定的网络环境中（例如公司网络）需要通过代理访问外部资源，设置`UseProxy`为`true`并配置代理服务器。

`MaxConnectionsPerServer`设置每个服务器的最大连接数。增加此值可以提高高并发请求的性能。在高并发环境中，增加此值（如设置为 1000）可以显著提高请求的处理能力。如果你的应用需要同时发送大量请求到同一个服务器，适当增加此值可以避免阻塞。

`PooledConnectionIdleTimeout`控制连接池中空闲连接的最大空闲时间。超过此时间后，连接将被关闭。此设置用于优化连接池的管理，避免长时间未使用的连接占用资源。根据实际情况设置空闲超时时间，确保连接池中不会有不必要的空闲连接。例如，若请求比较频繁，设置较长的超时时间会减少连接创建和销毁的开销。

`PooledConnectionLifetime`控制连接池中每个连接的最大生存时间。连接达到此时间后，将会被销毁。如果设置为`Timeout.InfiniteTimeSpan`，则表示连接永远不会因为超时而关闭。适用于需要长期保持连接的情况，但也可能导致连接池中的连接过多而影响性能。在需要保证连接复用且连接池容量较大的环境中，可以设置为`Timeout.InfiniteTimespan`。如果需要定期关闭过期连接，则可以设置一个适当的过期时间。

`EnableMultipleHttp2Connections`启用 HTTP/2 多连接支持。启动此选项可以允许一个服务器通过多个 HTTP/2 连接通信。HTTP/2 默认支持连接复用，但在高并发环境下，启用此选项可以进一步优化性能。如果应用程序需要支持 HTTP/2，并且在高并发请求时性能较差，可以尝试启用此选项来进一步优化。

`ConnectTimeout`设置连接超时时间，即尝试建立 TCP 连接时的最大等待时间。如果连接无法在此时间内建立，`HttpClient`将抛出`TaskCanceledException`。可以根据服务器响应的速度和网络延迟来调整此值。对于高延迟网络，可能需要增加超时，而对于低延迟本地网络，适当减少超时可以提高响应速度。

这些配置项可以帮助你根据不同的需求调整 `SocketsHttpHandler` 的行为和性能。以下是一些常见的使用场景和建议的配置：

1. **高并发请求**：增加 `MaxConnectionsPerServer`、调整 `PooledConnectionIdleTimeout` 和 `PooledConnectionLifetime`。
2. **长时间保持连接**：将 `PooledConnectionLifetime` 设置为 `Timeout.InfiniteTimeSpan`，并设置合理的 `PooledConnectionIdleTimeout`。
3. **重定向和认证控制**：使用 `AllowAutoRedirect` 和 `PreAuthenticate` 来处理重定向和认证。
4. **代理和 cookies 管理**：根据实际网络环境启用代理和 cookies 支持。
5. **性能优化**：启用 `EnableMultipleHttp2Connections`、`AutomaticDecompression` 等选项来提高带宽利用率和连接效率。

## 知识点

### Field 和 Property

[What is the difference between a field and a property?](https://stackoverflow.com/questions/295104/what-is-the-difference-between-a-field-and-a-property)

```c#
public class MyClass
{
    // this is a field.  It is private to your class and stores the actual data.
    private string _myField;

    // this is a property. When accessed it uses the underlying field,
    // but only exposes the contract, which will not be affected by the underlying field
    public string MyProperty
    {
        get
        {
            return _myField;
        }
        set
        {
            _myField = value;
        }
    }

    // This is an AutoProperty (C# 3.0 and higher) - which is a shorthand syntax
    // used to generate a private field for you
    public int AnotherProperty { get; set; }
}
```

[Understanding the Difference Between Properties and Fields in C#](https://medium.com/@jordantkay/understanding-the-difference-between-properties-and-fields-in-c-e8ed7c2a0c3b)

![](/images/202512/1/5e0a190b6e39307a1d9f8fd36c759a5f_MD5.jpeg)

### 正则表达式

`SocketClient` 类中包含了一个正则表达式的定义：

```csharp
[GeneratedRegex(@"bytes\s*((?<from>\d*)\s*-\s*(?<to>\d*)|\*)\s*\/\s*(?<size>\d+|\*)", RegexOptions.Compiled)]
private static partial Regex RangePatternRegex();

private readonly Regex _contentRangePattern = RangePatternRegex();
```

[Improve Performance With Source-Generated RegEx in .NET](https://code-maze.com/csharp-improve-performance-with-source-generated-regex/)
[Using the GeneratedRegexAttribute for your Regular Expressions](https://blog.nimblepros.com/blogs/using-generated-regex-attribute/)

可以参考如下代码进行性能测试，需要安装 BenchmarkDotNet。

在项目中执行`dotnet add package BenchmarkDotNet`命令即可。

```csharp
using System;
using System.Text.RegularExpressions;
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;

public class RegexBenchmarks
{
    private const string Pattern = @"bytes\s*((?<from>\d*)\s*-\s*(?<to>\d*)|\*)\s*\/\s*(?<size>\d+|\*)";
    private const string TestString = "bytes 0-499/1234";

    // 传统写法：运行时解析 + 编译
    private static readonly Regex OldRegex =
        new Regex(Pattern, RegexOptions.Compiled);

    // 新写法：编译时生成代码
    [GeneratedRegex(Pattern, RegexOptions.Compiled)]
    private static partial Regex NewRegex();

    [Benchmark(Baseline = true)]
    public Match OldRegexMatch()
    {
        return OldRegex.Match(TestString);
    }

    [Benchmark]
    public Match NewRegexMatch()
    {
        return NewRegex().Match(TestString);
    }
}

public class Program
{
    public static void Main(string[] args)
    {
        BenchmarkRunner.Run<RegexBenchmarks>();
    }
}

```

在终端执行`dotnet run -c release`命令即可。

## 推荐

- [HTTP Range Requests and Partial Responses With ASP.NET Core](https://khalidabuhakmeh.com/partial-range-http-requests-with-aspnet-core)
- [HTTPCLIENT CONNECTION POOLING IN .NET CORE](https://www.stevejgordon.co.uk/httpclient-connection-pooling-in-dotnet-core)
- [HTTP Headers explained](https://http.dev/headers): 丰富的 HTTP 相关资料
- [Regex Vis](https://regex-vis.com/): 正则表达式可视化工具


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: https://andyfree96.github.io/downloader%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

