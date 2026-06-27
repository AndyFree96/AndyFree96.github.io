# 用PowerShell玩转文件处理


PowerShell 是一个功能强大的自动化脚本平台，不仅可以管理系统和服务，还可以轻松高效地处理各种文件操作。无论你是系统管理员、开发者，还是数据分析师，掌握 PowerShell 的文件处理能力都能让你的工作事半功倍。本文将带你系统性地了解如何用 PowerShell 玩转文件处理，从基础操作到进阶技巧，让你轻松驾驭文件的读取、修改、管理与批处理任务。

<!--more-->

{{< admonition type=note title="注意" open=true >}}
文中用到的示例文件可在[Github](https://github.com/AndyFree96/pwsh/tree/main/1/files)下载
{{< /admonition >}}

## 快速查看与读取文件内容

### 查看文件内容

```powershell
Get-Content .\1.txt
```

![](/images/202507/1/1.png)

支持按行读取文本文件，适合日志查看、配置文件处理等。

### 读取特定行数

读取前 2 行：

```powershell
Get-Content .\1.txt -TotalCount 2
```

![](/images/202507/1/2.png)

读取最后 2 行：

```powershell
Get-Content .\1.txt -Tail 2
```

![](/images/202507/1/3.png)

### 按关键字过滤内容

列出文件中包含关键字 "summer" 的行：

```powershell
Get-Content .\1.txt | Select-String -Pattern "summer"
```

![](/images/202507/1/4.png)

或者

```powersehll
Get-Content .\1.txt | Select-String -Pattern "summer"

```

![](/images/202507/1/5.png)

## 创建与写入文件

### 创建文件

```powershell
New-Item .\newfile.txt
```

### 写入内容

```powershell
Set-Content .\newfile.txt "Hello, PowerShell!"
```

![](/images/202507/1/6.png)

### 追加内容

```powershell
Add-Content .\newfile.txt "Awesome!!!"
```

![](/images/202507/1/7.png)

## 复制、移动与重命名文件

### 复制文件

复制`newfile.txt`文件到`helloworld.txt`：

```powershell
Copy-Item .\newfile.txt .\helloworld.txt
```

### 移动文件

将`helloworld.txt`移动到`archive`目录：

```powershell
move-item .\helloworld.txt .\archive\
```

### 重命名文件

将`newfile.txt`重命名为`newfile2.txt`：

```powershell
Rename-Item .\newfile.txt .\newfile2.txt
```

## 删除文件与目录

### 删除文件

删除`newfile2.txt`文件：

```powershell
Remove-Item .\newfile2.txt
```

### 删除目录

删除`archive`目录：

```powershell
Remove-Item .\archive\ -Recurse
```

## 批量处理文件

我们先创建 10 个文件，并写入一些内容：

```powershell
1..10 | ForEach-Object {
  $fileName = "demo$_.log"
  "This is log file number $_" | Set-Content -Path $fileName
}
```

### 获取所有`.log`文件

```powershell
Get-ChildItem -Path .\ -Filter *.log
```

### 批量重命名文件

将所有`.log`文件名中的`demo`替换为`access_log_`：

```powershell
Get-ChildItem -Path .\ -Filter *.log | ForEach-Object {
  Rename-Item $_ -NewName $_.Name.Replace("demo", "access_log_")
}
```

### 按修改时间排序

```powershell
Get-ChildItem | Sort-Object LastWriteTime -Descending
```

### 合并多个文件为一个

```powershell
Get-ChildItem -Path .\ -Filter *.log | Sort-Object LastAccessTime | ForEach-Object {Get-Content $_} | Set-Content access_log.log
```

## 压缩与解压文件

### 压缩为 ZIP 文件

```powershell
Compress-Archive -Path .\*.log -DestinationPath .\log.zip
```

### 解压 ZIP 文件

```powershell
Expand-Archive -Path .\log.zip -DestinationPath .\unzipped_logs
```

![](/images/202507/1/8.png)

## 按文件内容查找文件

查找文件内容中包含关键字"summer"文件名：

```powershell
Get-ChildItem -Path .\ -Filter *.txt | Where-Object { Select-String -Path $_.FullName -Pattern "summer"}
```

![](/images/202507/1/9.png)

如果需要显示行内容和行号，可以使用如下命令：

```powershell
 Get-ChildItem -Path .\ -Filter *.txt | ForEach-Object {
  Select-String -Path $_.FullName -Pattern "summer"
}
```

![](/images/202507/1/10.png)

PowerShell 是处理文件的利器，无论是自动化任务、系统维护，还是数据处理，只需几行脚本就能完成复杂的操作。掌握以上这些技巧，不仅能提升你的工作效率，也能让你更加得心应手地管理系统资源。

如果你还没有开始使用 PowerShell，现在就是最好的时机。动手试试吧——你会发现，文件操作原来也可以这么有趣！


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: https://andyfree96.github.io/%E7%94%A8powershell%E7%8E%A9%E8%BD%AC%E6%96%87%E4%BB%B6%E5%A4%84%E7%90%86/  

