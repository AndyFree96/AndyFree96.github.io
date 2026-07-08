# PowerShell脚本实践指南


在软件开发、系统运维和DevOps 等领域，有一个永远存在的问题：**大量重复性的工作正在消耗工程师的时间**。每天登录服务器、检查日志、修改配置、部署应用、整理数据、生成报告……这些事情单次并不复杂，但重复几十次、几百次之后，就变成了巨大的时间成本。PowerShell（pwsh）就是解决这类问题的工具之一。它不仅是一门脚本语言，更是一套现代化自动化平台。本文将从基础语法开始，一直到脚本工程实践，全面介绍如何使用 pwsh 构建可靠、高效的自动化工具。

<!--more-->

## 什么是PowerShell？

PowerShell最初由微软设计，用于Windows系统管理。后来发展为跨平台自动化工具，Linux/MacOS等系统现在也支持PowerShell。现代PowerShell启动可以使用`pwsh`，因此很多人把新版本PowerShell简称为`pwsh`。

[查看版本](https://andyfree96.github.io/%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8Bpowershell%E7%9A%84%E7%89%88%E6%9C%AC/)：

```pwsh
$PSVersionTable
```

![图1 查看pwsh版本](/images/202606/17/1.png '图1 查看pwsh版本')

## 为什么选择PowerShell？

传统脚本依赖文本处理：

```bash
ls | grep log | awk
```

而pwsh处理的是对象。例如：

![图2 查看PowerToys进程信息](/images/202606/17/2.png '图2 查看PowerToys进程信息')

拿到的是一个完整的对象。这意味着我们不用正则解析、字符串切割、手动提取字段。其次，pwsh具有丰富的系统API，可以直接访问文件系统、注册表、网络、服务、进程等资源。

## PowerShell基础语法

PowerShell的设计目标不是替代CMD，而是提供一种面向对象的自动化语言。它的最大特点：

> [!IMPORTANT]
> 命令输出的是对象，而不是文本。

### 命令结构

PowerShell的命令通常叫做++Cmdlet++。格式：

```pwsh
Verb-Noun
```

例如：

```pwsh
Get-Process
```

`Get`表示动作，`Process`对象。常见的动词有：

| 动词    | 含义 |
| :------ | :--- |
| Get     | 获取 |
| Set     | 设置 |
| New     | 创建 |
| Remove  | 删除 |
| Start   | 启动 |
| Stop    | 停止 |
| Test    | 测试 |
| Convert | 转换 |
| Export  | 导出 |

例如：

```pwsh
Get-Service
Start-Service
Stop-Service
Remove-Item
```

### 查看帮助

PowerShell内置帮助：

```pwsh
Get-Help Get-Process
```

查看所有命令：

```pwsh
Get-Command
```

查找：

```pwsh
Get-Comamnd "*service*"
```

### 变量

PowerShell变量以`$`开头。

创建：

```pwsh
$name = "Tom"
```

使用：

```pwsh
$name
```

![图3 变量输出](/images/202606/17/3.png '图3 变量输出')

## 数据类型

PowerShell支持自动类型推断。

![图4 自动类型推断](/images/202606/17/4.png '图4 自动类型推断')

我们也可以指定类型：

```pwsh
[int]$age = 22
[string]$name = "Bob"
[bool]$enable = $true
```

### 字符串

需要注意的是，++双引号++字符串会解析变量，而++单引号++字符串原样输出。

![图5 双引号字符串与单引号字符串区别](/images/202606/17/5.png '图5 双引号字符串与单引号字符串区别]')

用`+`可对字符串进行拼接：

```pwsh
"Hello" + $name
```

字符串包含一系列方法，例如：

```pwsh
$name = "PowerShell"
$name.Length
$name.toUpper()
$name.Contains("Shell")
```

### 数组

创建：

```pwsh
$list = @(
    "a"
    "b"
    "c"
)
```

访问：

```pwsh
$list[0]
```

查看长度：

```pwsh
$list.Length
```

遍历：

```pwsh
foreach($item in $list)
{
    $item
}
```

### 哈希表(字典)

创建：

```pwsh
$user = @{
    Name="Tom"
    Age=20
}
```

读取：

```pwsh
$user.Name
$user["Name"]
```

添加键值对：

```pwsh
$user.Email = "a@test.com"
```

### 对象

如果需要创建对象：

```pwsh
$user = [PSCustomObject]@{

    Name="Tom"
    Age=20

}
```

访问：

```pwsh
$user.Name
```

## 管道

经典命令：

```pwsh
Get-Service
```

过滤出正在运行的服务：

```pwsh
Get-Service | Where-Object Status -eq Running
```

我们只想要输出对象的`Name`和`Status`属性：

```pwsh
Get-Service | Where-Object Status -eq Running | Select-Object Name,Status
```

将结果导出到文件中：

```pwsh
Get-Service | Where-Object Status -eq Running | Select-Object Name,Status | Export-Csv services.csv
```

几个命令就完成了查询 → 筛选 → 转换 → 导出。

## 条件控制

### if

```pwsh
$age=20

if($age -ge 18)
{
    "Adult"
}
else
{
    "Child"
}

```

比较符：

| 符号 | 含义     |
| ---- | -------- |
| -eq  | 等于     |
| -ne  | 不等     |
| -gt  | 大于     |
| -lt  | 小于     |
| -ge  | 大于等于 |
| -le  | 小于等于 |

### switch

类似其他编程语言：

```pwsh
$status="ok"

switch($status)
{
    "ok" {
        "正常"
    }

    "error" {
        "错误"
    }
}
```

## 循环

### foreach

```pwsh
foreach($i in 1..5)
{
    $i
}
```

### for

```pwsh
for($i = 0; $i -lt 5; $i++)
{
    $i
}
```

### while

```pwsh
$i = 0
while ($i -lt 5) {
  $i++
  Write-Host $i
}
```

## 函数

新建`hello.ps1`脚本，添加如下内容：

```pwsh {title="hello.ps1"}
function SayHello {
  param($name)

  "Hello $name"
}
```

pwsh在`hello.ps1`所在目录输入：

```pwsh
. .\hello.ps1
```

> [!IMPORTANT]
> 前面有一个点，叫点源加载。作用是把ps1中函数加载到当前环境。

之后就可以像其他命令一样正常使用`SayHello`：

```pwsh
SayHello "Anthony"
```

## 脚本参数化

我们写脚本的使用，尽量让其参数化，脚本更具灵活性。

```pwsh {title="copy.ps1"}
param( [string]$Source, [string]$Target )

Copy-Item $Source $Target
```

执行：

```pwsh
.\copy.ps1 -Source C:\Data -Target D:\Backup
```

## 错误处理

```pwsh
try {
  Get-Item test.txt
} catch {
  Write-Error $_
} finally {
  "Finished"
}
```

## 日志系统

实现一个简单的日志输出函数：

```pwsh {title="log.ps1"}
function Log {
  param($msg)

  "$( Get-Date ) $msg" | Tee-Object app.log -Append
}
```

使用：

```pwsh
. .\log.ps1

Log "Backup Start"
```

![图6 使用日志输出函数](/images/202606/17/6.png '图6 使用日志输出函数')

## 文件自动化

遍历：

```pwsh
Get-ChildItem *.log
```

批量删除：

```pwsh
Remove-Item *.tmp
```

移动：

```pwsh
Move-Item *.log archive/
```

更多关于文件的操作可阅读[用PowerShell玩转文件处理](https://andyfree96.github.io/%E7%94%A8powershell%E7%8E%A9%E8%BD%AC%E6%96%87%E4%BB%B6%E5%A4%84%E7%90%86/)。

## 网络自动化

测试连接：

```pwsh
Test-Connection baidu.com
```

发送HTTP请求：

```pwsh
Invoke-WebRequest https://www.baidu.com
```

## 示例

让我们创建一个用于判断文件内容是否一样的脚本`FileHashTools.ps1`：

```pwsh {title="FileHashTools.ps1"}
function Test-SameFileHash {

    param(
        [Parameter(Mandatory)]
        [string]$File1,

        [Parameter(Mandatory)]
        [string]$File2
    )


    if(
        !(Test-Path $File1) -or
        !(Test-Path $File2)
    ){
        return $false
    }


    $hash1 = (
        Get-FileHash `
        -Path $File1 `
        -Algorithm SHA256
    ).Hash


    $hash2 = (
        Get-FileHash `
        -Path $File2 `
        -Algorithm SHA256
    ).Hash


    return $hash1 -eq $hash2
}
```

## 总结

PowerShell不只是Windows命令行。它是一套自动化语言、系统管理工具。从简单的`Get-Process`到复杂的自动化脚本需要逐步积累。当你开始用脚本解决重复问题时，你就进入了真正的自动化时代。

## 推荐

[PowerShell](https://github.com/fleschutz/PowerShell): 600+免费脚本供我们使用学习。


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:7953/powershell%E8%84%9A%E6%9C%AC%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/  

