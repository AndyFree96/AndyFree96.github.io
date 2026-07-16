# NETworkManager源码剖析：一个网络管理工具的实现细节


在 GitHub 闲逛时，我偶然发现了[NETworkManager](https://borntoberoot.net/NETworkManager/)这个开源项目。作为一款网络管理和故障排查工具，它已经积累了超过 8.5k Star，足以说明社区对它的认可。更让我感兴趣的是，这个项目采用 C# + WPF 进行开发，与我当前正在深入学习和实践的技术栈高度契合。因此，我产生了一个想法：通过深入分析 NETworkManager 的源码，探索一个成熟的 WPF 桌面应用是如何进行架构设计、模块划分以及工程实践的。接下来，我将以 NETworkManager 为切入点，逐步拆解它在 WPF UI 设计、MVVM 架构、依赖注入、配置管理、网络通信、异步编程以及工程化实践 等方面的实现，希望能够从优秀的开源项目中学习桌面应用开发的最佳实践。

<!--more-->

```bash
git clone --recurse-submodules https://github.com/BornToBeRoot/NETworkManager.git
```

将项目Clone到本地，整个解决方案结构如下：

![图1 NETworkManager项目整体结构](/images/202607/15/1.png '图1 NETworkManager项目整体结构')

解决方案下包含了多个子项目，说明将实现逻辑进行了合理拆分，进行了模块化设计。

## 1. NETworkManager启动时，到底发生了什么？

WPF应用生命周期大致如下：

```mermaid
flowchart TD
    A[Application_Startup] --> B[创建Window]
    B --> C[用户正常使用]
    C --> D[Application_Exit]
    D --> E[程序结束]
```

在Visual Studio 2026按F5调试启动后，首先映入眼帘的是启动画面窗口：

![图2 NETworkManager启动画面窗口](/images/202607/15/2.png '图2 NETworkManager启动画面窗口')

接着就会出现隐私政策设置界面：

![图3 隐私政策设置界面](/images/202607/15/3.png '图3 隐私政策设置界面')

点击“继续”后就进入到了主界面(仪表盘)：

![图4 NETworkManager主界面](/images/202607/15/4.png '图4 NETworkManager主界面')

NETworkManager项目的`App.xaml.cs`中包含了软件启动时的逻辑，里面主要包含了`Application_Startup`、`OnSessionEnding`、`Application_Exit`和`Save`等4个方法。

### Application_Startup

设置了全局异常捕获：

```c#
AppDomain.CurrentDomain.UnhandledException += (_, args) =>
{
    Log.Fatal("Unhandled exception occured!");

    Log.Fatal($"Exception raised by: {args.ExceptionObject}");
};
```

等待旧进程退出：

```c#
if (CommandLineManager.Current.RestartPid != -1)
{
    Log.Info(
        $"Waiting for another NETworkManager process with Pid {CommandLineManager.Current.RestartPid} to exit...");

    var processList = Process.GetProcesses();
    var process = processList.FirstOrDefault(x => x.Id == CommandLineManager.Current.RestartPid);
    process?.WaitForExit();

    Log.Info($"NETworkManager process with Pid {CommandLineManager.Current.RestartPid} has been exited.");
}
```

单实例检测：

```c#
_mutex = new Mutex(true, "{" + Guid + "}");
```

防止用户点击两次exe，两个程序运行。第一次创建`Mutex`成功，第二次创建`Mutex`失败。于是：

```c#
var mutexIsAcquired = _mutex.WaitOne(TimeSpan.Zero, true);

Log.Info($"Mutex value for {Guid} is {mutexIsAcquired}");

// Release mutex
if (mutexIsAcquired)
    _mutex.ReleaseMutex();

// If another instance is running, bring it to the foreground
if (!mutexIsAcquired && !SettingsManager.Current.Window_MultipleInstances)
{
    // Bring the already running application into the foreground
    Log.Info(
        "Another NETworkManager process is already running. Trying to bring the window to the foreground...");
    SingleInstance.PostMessage(SingleInstance.HWND_BROADCAST, SingleInstance.WM_SHOWME, IntPtr.Zero,
        IntPtr.Zero);

    // Close the application
    _singleInstanceClose = true;
    Shutdown();

    return;
}

```

接下来会显示启动画面窗口和主窗口：

```c#
// Show splash screen
if (SettingsManager.Current.SplashScreen_Enabled)
{
    Log.Info("Show SplashScreen while application is loading...");
    new SplashScreen(@"SplashScreen.png").Show(true, true);
}

// Show main window
Log.Info("Set StartupUri to MainWindow.xaml...");
StartupUri = new Uri("MainWindow.xaml", UriKind.Relative);
```

启动流程如下：

```mermaid
flowchart TD
    A[Application_Startup] --> B[启动日志]
    B --> C[异常捕获]
    C --> D[检查旧实例]
    D --> E[加载Policy]
    E --> F[加载Settings]
    F --> G[升级配置]
    G --> H[初始化语言]
    H --> I[单实例检测]
    I --> J[启动后台任务]
    J --> K[调整线程池]
    K --> L[SplashScreen]
    L --> M[MainWindow]
```

`Policy`从exe所在目录的`config.json`加载，而LocalSettings从`用户家目录\\AppData\\Local\\NETworkManager\\Settings.json`文件加载，Settings从`用户家目录\\Documents\\NETworkManager\\Settings\\Settings.json`文件加载。

### Application_Exit

`Application_Exit`会在应用退出时调用，主要调用了`Save`，在退出时保存程序设置和配置文件。

### Save

`Save`如果检测到更改，会保存应用程序设置和配置文件数据。

### OnSessionEnding

`OnSessionEnding`会在Windows注销或者Windows关机时被调用。

## 2. 日志保存在什么位置？

NETworkerManager使用的是[log4net](https://logging.apache.org/log4net/index.html)日志库。在项目的根目录下有一个`log4net.config`文件用于配置日志：

```xml
<log4net>
    <root>
        <!-- Log level: ALL, DEBUG, INFO, WARN, ERROR, FATAL, OFF -->
        <level value="INFO"/>
        <appender-ref ref="console"/>
        <appender-ref ref="file"/>
    </root>
    <appender name="console" type="log4net.Appender.ConsoleAppender">
        <layout type="log4net.Layout.PatternLayout">
            <conversionPattern value="%date [%thread] %-5level %logger - %message%newline"/>
        </layout>
    </appender>
    <appender name="file" type="log4net.Appender.RollingFileAppender">
        <file value="${LocalAppData}\\NETworkManager\NETworkManager.log"/>
        <appendToFile value="true"/>
        <rollingStyle value="Size"/>
        <maxSizeRollBackups value="5"/>
        <maximumFileSize value="10MB"/>
        <staticLogFileName value="true"/>
        <layout type="log4net.Layout.PatternLayout">
            <conversionPattern value="%date [%thread] %-5level %logger - %message%newline"/>
        </layout>
    </appender>
</log4net>
```

日志保存在`${LocalAppData}\\NETworkManager`目录中。

## 3. 仪表盘界面中的IP地址是如何获取的？

如图4所示，仪表盘界面中的IPv4、IPv6以及DNS地址是如何获取的呢？`ViewModels/NetworkConnectionWidgetViewModel.cs`可以找到答案，调用了`CheckConnectionComputerAsync`、`CheckConnectionRouterAsync`以及`CheckConnectionInternetAsync`分别获取图4所示的计算机、网关/路由、Internet的IPv4、IPv6地址和DNS信息。

NETworkManager代码非常规范，值得我们学习。以`CheckConnectionComputerAsync`为例，整个函数的逻辑按块进行组织并附上了注释例如`// Init variables`、`//  Detect local IPv4 address`等，读者一看注释便知接下来的代码块功能是什么，大大降低的读者的心智负担。另外，函数、变量的命名也十分清晰，一看便知其作用。

```c#
    /// <summary>
    /// Checks the computer connection.
    /// </summary>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    private Task CheckConnectionComputerAsync(CancellationToken ct)
    {
        return Task.Run(async () =>
        {
            Log.Debug("CheckConnectionComputerAsync - Checking local connection...");

            // Init variables
            IsComputerIPv4Checking = true;
            ComputerIPv4 = "";
            ComputerIPv4State = ConnectionState.None;

            IsComputerIPv6Checking = true;
            ComputerIPv6 = "";
            ComputerIPv6State = ConnectionState.None;

            IsComputerDNSChecking = true;
            ComputerDNS = "";
            ComputerDNSState = ConnectionState.None;

            // Detect local IPv4 address
            Log.Debug("CheckConnectionComputerAsync - Detecting local IPv4 address...");

            var detectedLocalIPv4Address =
                await NetworkInterface.DetectLocalIPAddressBasedOnRoutingAsync(
                    IPAddress.Parse(SettingsManager.Current.Dashboard_PublicIPv4Address));

            if (detectedLocalIPv4Address == null)
            {
                Log.Debug("CheckConnectionComputerAsync - Local IPv4 address detection via routing failed, trying network interfaces...");

                detectedLocalIPv4Address = await NetworkInterface.DetectLocalIPAddressFromNetworkInterfaceAsync(
                    AddressFamily.InterNetwork);
            }

            if (detectedLocalIPv4Address != null)
            {
                Log.Debug("CheckConnectionComputerAsync - Local IPv4 address detected: " + detectedLocalIPv4Address);

                ComputerIPv4 = detectedLocalIPv4Address.ToString();
                ComputerIPv4State = string.IsNullOrEmpty(ComputerIPv4) ? ConnectionState.Critical : ConnectionState.OK;
            }
            else
            {
                Log.Debug("CheckConnectionComputerAsync - Local IPv4 address not detected.");

                ComputerIPv4 = "-/-";
                ComputerIPv4State = ConnectionState.Critical;
            }

            IsComputerIPv4Checking = false;

            if (ct.IsCancellationRequested)
                ct.ThrowIfCancellationRequested();

            // Detect local IPv6 address
            Log.Debug("CheckConnectionComputerAsync - Detecting local IPv6 address...");

            var detectedLocalIPv6Address =
                await NetworkInterface.DetectLocalIPAddressBasedOnRoutingAsync(
                    IPAddress.Parse(SettingsManager.Current.Dashboard_PublicIPv6Address));

            if (detectedLocalIPv6Address == null)
            {
                Log.Debug("CheckConnectionComputerAsync - Local IPv6 address detection via routing failed, trying network interfaces...");

                detectedLocalIPv6Address = await NetworkInterface.DetectLocalIPAddressFromNetworkInterfaceAsync(
                    AddressFamily.InterNetworkV6);
            }

            if (detectedLocalIPv6Address != null)
            {
                Log.Debug("CheckConnectionComputerAsync - Local IPv6 address detected: " + detectedLocalIPv6Address);

                ComputerIPv6 = detectedLocalIPv6Address.ToString();
                ComputerIPv6State = string.IsNullOrEmpty(ComputerIPv6) ? ConnectionState.Critical : ConnectionState.OK;
            }
            else
            {
                Log.Debug("CheckConnectionComputerAsync - Local IPv6 address not detected.");

                ComputerIPv6 = "-/-";
                ComputerIPv6State = ConnectionState.Critical;
            }

            IsComputerIPv6Checking = false;

            if (ct.IsCancellationRequested)
                ct.ThrowIfCancellationRequested();

            // Try to resolve local DNS based on IPv4
            if (ComputerIPv4State == ConnectionState.OK)
            {
                Log.Debug("CheckConnectionComputerAsync - Resolving local DNS based on IPv4...");

                var dnsResult = await DNSClient.GetInstance().ResolvePtrAsync(IPAddress.Parse(ComputerIPv4));

                if (!dnsResult.HasError)
                {
                    Log.Debug("CheckConnectionComputerAsync - Local DNS based on IPv4 resolved: " + dnsResult.Value);

                    ComputerDNS = dnsResult.Value;
                    ComputerDNSState = ConnectionState.OK;
                }
                else
                {
                    Log.Debug("CheckConnectionComputerAsync - Local DNS based on IPv4 not resolved.");
                }
            }
            else
            {
                Log.Debug("CheckConnectionComputerAsync - Local DNS based on IPv4 not resolved due to invalid IPv4 address.");
            }

            // Try to resolve local DNS based on IPv6 if IPv4 failed
            if (string.IsNullOrEmpty(ComputerDNS) && ComputerIPv6State == ConnectionState.OK)
            {
                Log.Debug("CheckConnectionComputerAsync - Resolving local DNS based on IPv6...");

                var dnsResult = await DNSClient.GetInstance().ResolvePtrAsync(IPAddress.Parse(ComputerIPv6));

                if (!dnsResult.HasError)
                {
                    Log.Debug("CheckConnectionComputerAsync - Local DNS based on IPv6 resolved: " + dnsResult.Value);

                    ComputerDNS = dnsResult.Value;
                    ComputerDNSState = ConnectionState.OK;
                }
                else
                {
                    Log.Debug("CheckConnectionComputerAsync - Local DNS based on IPv6 not resolved.");
                }
            }
            else
            {
                Log.Debug("CheckConnectionComputerAsync - Local DNS based on IPv6 not resolved due to IPv4 DNS resolved or invalid IPv6 address");
            }

            if (string.IsNullOrEmpty(ComputerDNS))
            {
                ComputerDNS = "-/-";
                ComputerDNSState = ConnectionState.Critical;
            }

            IsComputerDNSChecking = false;

            Log.Debug("CheckConnectionComputerAsync - Local connection check completed.");
        }, ct);
    }
```

为获取IPv4地址，准备了两种方式：一种是`DetectLocalIPAddressBasedOnRoutingAsync`创建UDP套接字确定本机IP，另一种是`DetectLocalIPAddressFromNetworkInterfaceAsync`配合`Microsoft.PowerShell.SDK`，用C#实现了类似Windows `ipconfig /all` + PowerShell `Get-NetConnectionProfile`的效果。

## 4. 网络接口选项中的接口带宽是如何测出来的？

![图5 接口带宽界面](/images/202607/15/5.png '图5 接口带宽界面')

如图5所示，网络接口选项中包含了一个接口带宽界面，其中的速度是如何得到的？`NETworkManager.Models/Network/BandwidthMeter.cs`中`BandwidthMeter`的`Update`方法可以找到答案。

```c#
IPInterfaceStatistics stats;

try
{
    // IPStatistics covers both IPv4 and IPv6 traffic on the interface.
    stats = _networkInterface.GetIPStatistics();
}
catch (NetworkInformationException)
{
    // Transient failure (e.g. adapter going down) - skip this tick.
    return;
}

var totalBytesSent = stats.BytesSent;
var totalBytesReceived = stats.BytesReceived;
```

`System.Net.NetworkInformation.NetworkInterface`类的`GetIPStatistics`方法可以获取到一些统计信息，其中就包括已发送的字节数和已接收的字节数。为了得到速度，可以计算在`t`时间段内发送字节数和接收字节数的差异与`t`的比值。

```c#
var elapsedSeconds = _stopwatch.Elapsed.TotalSeconds;
_stopwatch.Restart();

// T时刻发送的字节数是_previousBytesSent
// T+elapsedSeconds时刻发送的字节数是totalBytesSent
var deltaSent = Math.Max(0, totalBytesSent - _previousBytesSent);
// T时刻接收的字节数是_previousBytesReceived
// T+elapsedSeconds时刻发送的字节数是totalBytesReceived
var deltaReceived = Math.Max(0, totalBytesReceived - _previousBytesReceived);

var byteSentSpeed = elapsedSeconds > 0 ? (long)(deltaSent / elapsedSeconds) : 0;
var byteReceivedSpeed = elapsedSeconds > 0 ? (long)(deltaReceived / elapsedSeconds) : 0;
```

`BandwidthMeter`中有一个`_timer`定时器，默认每隔1秒就会调用1次`Update`函数。该类还定义了一个`UpdateSpeed`事件，而`NETworkManager/ViewModels/NetworkInterfaceViewModel.cs`的`NetworkInterfaceViewModel`订阅了该事件：

```c#
_bandwidthMeter.UpdateSpeed += BandwidthMeter_UpdateSpeed;
```

这意味着每隔1秒`BandwidthMeter_UpdateSpeed`方法就会被调用1次。`BandwidthMeter_UpdateSpeed`主要包含了一些图表数据更新的逻辑，这就是为什么我们可以看到图表的曲线一直在刷新变化。这里的图表看起来比较精美，用的是[LiveCharts2](https://livecharts.dev/)，一个现代化的 .NET 数据可视化图表库。

## 5. NETworkManager是如何管理众多功能页面的？

## 6. 语言切换,如何做到不用修改代码？

## 7. 软件如何实现自动更新？



---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/networkmanager%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

