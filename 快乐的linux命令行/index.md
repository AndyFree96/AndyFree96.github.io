# 快乐的Linux命令行


- **2024/11/12 更新**: [推荐](#推荐)增加**CLI tools you won't be able to live without 🔧**和**40 个超有趣的 Linux 命令行彩蛋和游戏**

在现代操作系统中，图形用户界面 (GUI) 让我们与计算机的交互变得直观和简单。然而，对于许多开发者、系统管理员和技术爱好者而言，Linux 命令行仍然是最为强大且不可替代的工具。通过它，我们能够精准地控制系统资源、自动化复杂任务，并快速处理各种系统操作。与 GUI 不同，命令行的操作不依赖于鼠标或其他外部设备，只需键入一行命令，便可在数秒内完成从文件管理到网络配置、从进程控制到系统监控等一系列操作。正因为其高效、灵活和可扩展性，Linux 命令行成为了技术专家首选的工作方式之一。本文，我们将逐步探索 Linux 命令行的基础知识，了解一些常用的命令，以及如何利用这些命令高效管理系统。无论你是新手还是经验丰富的用户，掌握这些命令都会让你在 Linux 世界中如鱼得水。

<!--more-->

## 1. 文件管理

### find

#### 语法

```
find [-H] [-L] [-P] [-Olevel] [-D debugopts] [path...] [expression]
```

#### 列出当前目录

使用不带参数和选项的`find`会列出当前目录下的所有文件及目录：

```
find
```

![](/images/202410/11/1.png)

#### 搜索特定目录

通过指定目录可以让`find`命令特定目录。

```
find ~/work
```

![](/images/202410/11/2.png)

#### 在指定目录中搜索特定文件

有时，我们会想在某个指定目录下搜索特定文件名，例如：

```
sudo find /etc -name "ssh_config"
```

![](/images/202410/11/3.png)

#### 模糊搜索

如果想搜索系统中所有以`.config`为文件名结尾的文件的话，我们可以使用`*`通配符进行模糊搜索。

```
sudo find / -name "*.config"
```

![](/images/202410/11/4.png)

#### 指定搜索深度

通过`-maxdepth`和`-mindepth`选项可以分别指定搜索时的最大和最小深度。

```
sudo find / -maxdepth 2 -name "*.config"
```

![](/images/202410/11/5.png)

#### 或操作符

通过使用或操作符可以组合搜索结果，该操作符如下例中所示，用`-o`或`-or`选项表示。

```
sudo find / -maxdepth 2 -name "*.config" -o -name "ssh"
```

![](/images/202410/11/6.png)

#### 指定搜索类型

通过`-type`选项，我们可以指定搜索文件类型，例如`-type f`搜索文件，`-type d`搜索目录：

![](/images/202410/11/7.png)

#### 指定搜索文件大小

通过`-size`选项，我们可以指定搜索文件大小。比如，`-size 10k`表示搜索大小为`10k`的文件，`-size +10k`表示搜索大小超过`10k`的文件，`-size -10k`表示搜索大小少于`10k`的文件。

![](/images/202410/11/8.png)

https://man7.org/linux/man-pages/man1/find.1.html

## 2. 文档编辑

### grep

grep 是**G**lobal **R**egular **E**xpression **P**rint 的缩写，用于在指定文件中搜索字符串，它会打印匹配到的行。

#### 语法

使用语法如下：

```
grep [OPTION]... PATTERN [FILE]...
```

`PATTERN`表示搜索模式。

#### 单个文件搜索

![](/images/202410/14/1.png)

如果我们想在`log1`文件中搜索`andy`这个模式，可以使用如下命令：

```
grep andy log1
```

![](/images/202410/14/2.png)

#### 多个文件搜索

若想在多个文件进行模式搜索，可以使用如下命令：

```
grep andy log1 log2
```

![](/images/202410/14/3.png)

#### 搜索整个目录

`work`目录中只有两个文件，如果有成百上千个文件，显然不能上例一样指明目录下所有的文件名，此时我们可以使用`*`通配符来搜索整个当前目录：

```
grep andy *
```

![](/images/202410/14/4.png)

#### 按单词搜索

以上的例子没有把`andy`当作整个单词搜索，只要单词中匹配到`andy`这部分就会被搜索到。若想按单词搜索，使用`-w`选项即可。

```
grep -w andy *
```

![](/images/202410/14/5.png)

#### 忽略大小写

使用`-i`选项可以让`grep`命令忽略大小写对模式进行搜索。

```
grep -iw andy *
```

![](/images/202410/14/6.png)

#### 反转搜索

若想查看没有匹配到的行，我们可以使用`-v`选项：

```
grep -iwv andy *
```

![](/images/202410/14/7.png)

#### 按行搜索

通过`-x`选项可以让`grep`按行进行搜索：

```
grep -xi andy *
```

![](/images/202410/14/8.png)

#### 搜索子目录

目录中可能包含子目录，若想进一步在子目录进行搜索，可以使用`-r`选项：

```
grep -rwi andy *
```

![](/images/202410/14/9.png)

#### 统计匹配数

通过使用`-c`选项可以统计每个文件的匹配数。

```
grep -ci andy *
```

![](/images/202410/14/10.png)

https://man7.org/linux/man-pages/man1/grep.1.html

How To Use grep Command In Linux/UNIX: https://phoenixnap.com/kb/grep-command-linux-unix-examples

## 3. 文件传输

## 4. 磁盘管理

## 5. 磁盘维护

## 6. 网络通讯

### curl

`curl`是一个用于与远端服务器进行信息交换的命令行工具。通过`curl`命令，可以十分方便地上传或者下载数据。本文我们将介绍如何在 Ubuntu 18.04.4 LTS 上使用`curl`命令。

#### 安装

在终端中输入：

```
sudo apt update
sudo apt install curl
```

即可安装。

#### 语法

`curl`命令的语法如下：

```
curl [options...] <url>
```

`<url>`表示 URL 是必须的，而`[options...]`表示选项可以有多个或者零个。如果不带任何选项，对应 URL 的资源数据会在标准输出设备中输出。例如：

```
curl http://www.baidu.com
```

![](/images/202410/10/1.png)

如上所示，百度主页的源代码正常在屏幕上打印输出了。

#### 保存输出至文件

通常我们需要将请求的数据保存到文件中，此时可以使用`-O`或者`-o`选项。

```
curl -O https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
```

![](/images/202410/10/1.png)

`-O`选项会使用远端服务器上的文件名作为保存到本地文本的文本名。如不希望这样的话，可以`-o`选项自定义本地文件的文件名。

```
curl -o andy.js https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
```

![](/images/202410/10/3.png)

#### 下载多个文件

有时，我们会需要多个文件，除了不断运行`curl -O url1`，`curl -O url2`……命令外，我们也可以使用如下方式：

```
curl -O https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js -O https://cdn.jsdelivr.net/npm/async@3.2.0/dist/async.min.js
```

![](/images/202410/10/4.png)

#### 设置请求 User-Agent 字段

HTTP 请求报文中有一个 User-Agent 头部字段，我们可以通过使用`-A`选项对其进行设置：

```
curl -A "andyfree"
```

![](/images/202410/10/6.png)

#### 获取 HTTP 响应头

通过`-I`选项，我们可以获取到 HTTP 响应报文的头部信息。

```
curl -I https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
```

![](/images/202410/10/5.png)

#### 使用代理

为了能顺利访问到资源，有时我们需要用到代理，使用`-x`选项即可：

```
 curl -x 127.0.0.1:8100 http://httpbin.org/ip
```

![](/images/202410/10/7.png)

#### 恢复下载

在下载大文件时，由于持续时间会比较长，网络可能会因为某些原因断开，此时我们可以用`-C`选项恢复下载而不用从头下载。

```
curl -C - -O https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/20.10/ubuntu-20.10-desktop-amd64.iso
```

![](/images/202410/10/8.png)

https://curl.se/docs/manual.html

## 7. 系统管理

### ps

`ps`命令是进程状态（Process Status）的缩写，能显示 Linux 系统当前运行进程的相关信息。

#### 语法

`ps`命令的语法如下：

```
ps [options]
```

#### 当前 shell 运行的进程

不带任何选项的`ps`命令会显示当前 shell 运行的进程：

```
ps
```

![](/images/202410/12/1.png)

- `PID`指的是进程号
- `TTY`指的是用户登录的终端类型
- `TIME`指的是进程运行的时间
- `CMD`指的是启动进程的命令

#### 列出所有进程

使用`-A`或`-e`选项可以列出所有进程：

```
ps -A

ps -e
```

![](/images/202410/12/2.png)

#### 列出与特定用户相关的进程

如果想列出与特定用户相关的进程，可以使用`-u`选项。

```
ps -u user
```

例如：

```
ps -u ubuntu
```

![](/images/202410/12/3.png)

#### 显示所选列

通过`-o`选项后指定的参数可以选择想要显示的列。

![](/images/202410/12/4.png)

#### 搜索进程

配合`grep`命令，我们可以十分方便的对进程进行搜索。

```
ps -ef | grep python
```

![](/images/202410/12/5.png)

https://man7.org/linux/man-pages/man1/ps.1.html

https://www.journaldev.com/24613/linux-ps-command

https://www.geeksforgeeks.org/ps-command-in-linux-with-examples/

### uname

本节我们将介绍`uname`命令，该命令非常实用，可以打印输出系统相关信息。

#### 语法

```
uname [OPTION]...
```

可选选项如下：

- `-s`, (`--kernel-name`)：打印输出内核名称
- `-n`, (`--nodename`)：打印输出主机名（在网络中使用），此时输出和`hostname`命令一样
- `-r`, (`--kernel-release`)：打印输出内核版本
- `-v`, (`--kernel-version`)：打印输出内核版本和构建时间
- `-m`, (`--machine`)：打印输出机器硬件名称
- `-p`, (`--processor`)：打印输出处理器架构
- `-i`, (`--hardware-platform`)：打印输出硬件平台
- `-o`, (`--operating-system`)：打印输出操作系统名称
- `-a`, (`--all`)：和`-snrvmpio`打印输出信息一样

`uname`命令不带任何选项时，打印输出内核名称，和`uname -s`一样：

![](/images/202410/9/1.png)

为了方便使用，我们可以通常使用`-a`选项：

![](/images/202410/9/2.png)

其中：

- `Linux`为内核名称
- `andyfree-ubuntu`为主机名
- `4.15.0-88-generic`为内核版本
- `##88-Ubuntu SMP Tue Feb 11 20:11:34 UTC 2020`为内核版本和构建时间
- 三个`x86_64`分别为硬件名称、处理器架构和硬件平台
- `GNU/Linux`为操作系统名称

#### 更改主机名

如上图所示，本文所使用的机器的主机名为`andyfree-ubuntu`，我们可以使用`hostnamectl`命令自行更改主机名，例如：将主机名改为`lucas`：

```
sudo hostnamectl set-hostname lucas
```

![](/images/202410/9/3.png)

## 8. 系统设置

## 9. 备份压缩

## 10. 设备管理

## 推荐

快乐的 Linux 命令行: https://billie66.github.io/TLCL/

[the-art-of-command-line](https://github.com/jlevy/the-art-of-command-line): Master the command line, in one page

[Linux Commands Cheat Sheet](https://www.linuxtrainingacademy.com/linux-commands-cheat-sheet/)

[CLI tools you won't be able to live without 🔧](https://dev.to/lissy93/cli-tools-you-cant-live-without-57f6)

[40 个超有趣的 Linux 命令行彩蛋和游戏](https://www.cnblogs.com/alannever/p/12171599.html)

## 参考

linux 命令分类: https://linux265.com/course/linux-commands.html

Linux 命令大全: https://www.runoob.com/linux/linux-command-manual.html


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E5%BF%AB%E4%B9%90%E7%9A%84linux%E5%91%BD%E4%BB%A4%E8%A1%8C/  

