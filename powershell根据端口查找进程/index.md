# PowerShell根据端口查找进程


在日常开发启动后端服务时，经常会遇到类似`EADDRINUSE: address already in use :::3000`的问题。这类问题的本质是：

> 某个进程已经占用了目标端口，需要找到该进程并进行处理。

本文介绍如何使用PowerShell(pwsh)快速根据端口查找对应进程，并进一步查看、停止进程。

<!--more-->

端口(Port)操作系统用于区分网络连接的逻辑编号。

![图1 常见端口号](/images/202607/28/0030-18-common-ports-you-must-know.png '图1 常见端口号')

进程(Process)是正在运行的程序实例，每个进程都有唯一的PID(Process ID)。

## 使用Get-NetTCPConnection查找端口

PowerShell提供了`Get-NetTCPConnection`用于查询TCP连接状态。

查看指定端口：

```pwsh
Get-NetTCPConnection -LocalPort 1313
```

输出：

![图2 查看1313端口](/images/202607/28/1.png '图2 查看1313端口')

关键字段：

| 字段          | 含义             |
| :------------ | :--------------- |
| LocalPort     | 本地端口         |
| State         | 连接状态         |
| OwningProcess | 占用该端口的 PID |

这里`OwningProcess = 24456`表示PID为24456的进程占用了1313端口。

## 根据PID查看进程信息

拿到PID后：

```pwsh
Get-Process -Id 24456
```

输出：

![图3 PID为24456的进程](/images/202607/28/2.png '图3 PID为24456的进程')

说明[hugo](https://gohugo.io/)正在监听1313端口。

## 一条命令完成端口→进行查询

实际开发中，我们通常希望一步完成输入端口，直接显示占用进程。

比如查询1313：

```pwsh
Get-Process -Id (Get-NetTCPConnection -LocalPort 1313).OwningProcess
```

## 查看所有监听端口

如果不知道哪个端口冲突，可以查看系统所有监听端口：

```pwsh
Get-NetTCPConnection -State Listen
```

![图4 系统所有监听端口](/images/202607/28/3.png '图4 系统所有监听端口')

## 查看所有端口对应的进程

可以进一步组合：

```pwsh
Get-NetTCPConnection -State Listen | ForEach-Object {

    $process = Get-Process `
        -Id $_.OwningProcess `
        -ErrorAction SilentlyContinue

    [PSCustomObject]@{
        Port = $_.LocalPort
        PID = $_.OwningProcess
        Process = $process.ProcessName
    }
}
```

输出：

![图5 所有端口对应进程](/images/202607/28/4.png '图5 所有端口对应进程')

## 使用netstat方式

也可使用Window传统工具`netstat`查看端口：

```pwsh
netstat -ano | findstr 1313
```

结果：

![图6 netstat查看端口](/images/202607/28/5.png '图6 netstat查看端口')

然后：

```pwsh
tasklist /FI "PID eq 24456"
```

可查看到进程的详情。

## 根据端口直接结束进程

例如关闭占用1313端口的进程：

```pwsh
Stop-Process -Id (Get-NetTCPConnection -LocalPort 1313).OwningProcess -Force
```

执行后，端口立即释放。

## 封装为PowerShell工具函数

为了使用方便，可以封装为一个函数：

```pwsh
function Get-PortProcess {

    param(
        [Parameter(Mandatory)]
        [int]$Port
    )


    $connection = Get-NetTCPConnection `
        -LocalPort $Port `
        -ErrorAction SilentlyContinue


    if ($null -eq $connection) {

        Write-Host "No process found on port $Port"
        return
    }


    Get-Process -Id $connection.OwningProcess
}

Export-ModuleMember -Function Get-PortProcess
```

将上述内容保存为`PortProcess.psm1`文件，将其放在`$env:PSModulePath`包含的路径里。

![图7 PowerShell默认模块加载路径](/images/202607/28/6.png '图7 PowerShell默认模块加载路径')

我选择的是`C:\Users\Administrator\Documents\PowerShell\Modules`。

![图8 PortProcess.psm1文件存放路径](/images/202607/28/7.png '图8 PortProcess.psm1文件存放路径')

接着，在PowerShell Profile中引入`PortProcess`：

```pwsh
Import-Module PortProcess
```

这样每次启动PowerShell我们就可以直接用`Get-PortProcess PORT`啦！

> [!NOTE]+ 注意
> 有可能本机没有PowerShell Profile文件，可用`Test-Path $PROFILE`查验。如果返回的是`False`，使用`New-Item -Path $PROFILE -ItemType File -Force`新建即可。然后，用`notepad $PROFILE`用记事本打开该文件。

## 常用命令速查表

| 目的              | 命令                                                                   |
| :---------------- | :--------------------------------------------------------------------- |
| 查询端口          | `Get-NetTCPConnection -LocalPort PORT`                                 |
| 查询 PID 对应进程 | `Get-Process -Id PID`                                                  |
| 端口直接查进程    | `Get-Process -Id (Get-NetTCPConnection -LocalPort PORT).OwningProcess` |
| 查看所有监听端口  | `Get-NetTCPConnection -State Listen`                                   |
| netstat 查询      | `netstat -ano \| findstr :PORT`                                        |
| 结束端口进程      | `Stop-Process -Id PID -Force`                                          |


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/powershell%E6%A0%B9%E6%8D%AE%E7%AB%AF%E5%8F%A3%E6%9F%A5%E6%89%BE%E8%BF%9B%E7%A8%8B/  

