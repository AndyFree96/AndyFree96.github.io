# 如何查看PowerShell的版本


在使用 PowerShell 进行脚本开发或系统运维时，知道当前环境的 PowerShell 版本是非常有必要的。不同的版本在功能和兼容性上存在差异，有些模块或命令在旧版本中可能无法使用，甚至语法支持也会有变化。

本文将介绍多种查看 PowerShell 版本的方法，无论你是在使用 Windows PowerShell 5.1 还是跨平台的 PowerShell 7，都能轻松查到当前版本信息。

<!--more-->

## 为什么要查看 PowerShell 版本

以下几种情况你可能会用到 PowerShell 版本号:

- 判断是否支持某些特性（如`ConvertTo-CliXml`命令）
- 判断是否需要升级到 PowerSHell 7.x
- 在多平台上调试脚本时确认运行环境
- 排查脚本执行错误是否因版本不兼容

## 方法一：使用`$PSVersionTable`变量

```pwsh
$PSVersionTable
```

输出如下:

![](/images/202508/1/1.png)

`PSVersion`字段表示当前 PowerShell 的版本号，`PSEdition`字段表示当前 PowerShell 的版本类型。

## 方法二：使用`Get-Host`命令

另一种方法是使用`Get-Host`命令，它会返回当前 PowerShell 宿主环境的相关信息，其中包括版本号。

```pwsh
Get-Host
```

![](/images/202508/1/2.png)

`Version`字段表示当前 PowerShell 的版本号。

## 方法三：使用`$HOST`变量

当打开 PowerShell 时，`$HOST`变量会自动赋值为当前 PowerShell 宿主环境的相关信息，其中包括版本号。

```pwsh
$HOST
```

![](/images/202508/1/3.png)

`Version`字段表示当前 PowerShell 的版本号。

## PowerShell 各版本简述

| 版本                   | 平台                  | 特点                                             |
| ---------------------- | --------------------- | ------------------------------------------------ |
| Windows PowerShell 5.1 | Windows               | 最后一个 Windows PowerShell 版本，内置于 Windows |
| PowerShell 6.x         | Windows、Linux、macOS | 引入 .NET Core，支持 Linux/macOS                 |
| PowerShell 7.x         | Windows、Linux、macOS | 性能更好，兼容性更强                             |

若你还在使用 5.1，强烈建议试试 PowerShell 7，或许有不一样的体验。

## 常见问题

### Q1：我在 Windows 上用的是 PowerShell 还是 PowerShell Core？

运行`$PSVersionTable.PSEdition`命令，如果返回的是`Desktop`，则说明你正在使用 Windows PowerShell 5.1；如果返回的是`Core`，则说明你正在使用 PowerShell Core。

### Q2：是否可以同时安装 PowerShell 5.1 和 PowerShell 7？

可以，两者互不冲突。PowerShell 7 安装后使用`pwsh`命令启动，PowerShell 5.1 安装后使用`powershell`命令启动。

### Q3：如何升级 PowerShell？

去[Github PowerShell 仓库](https://github.com/PowerShell/PowerShell/releases)下载最新版安装包安装即可。

## 推荐

[Differences between Windows PowerShell 5.1 and PowerShell 7.x](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/differences-from-windows-powershell?view=powershell-7.5)

[Overview of what's new in PowerShell](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/overview?view=powershell-7.5)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8Bpowershell%E7%9A%84%E7%89%88%E6%9C%AC/  

