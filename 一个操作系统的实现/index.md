# 一个操作系统的实现


操作系统（Operating System）是现代计算机系统的核心，它管理着硬件资源，调度应用程序运行，并为用户提供友好的交互界面。尽管我们每天都在使用各种操作系统，如 Windows、Linux、macOS 等，但其背后的设计与实现却常常被视为复杂而深奥的技术领域。然而，实现一个简单的操作系统并非遥不可及。通过深入了解操作系统的基本原理——如进程管理、内存管理、文件系统和设备驱动，我们可以循序渐进地从零开始构建一个微型操作系统。这不仅能加深对计算机系统的理解，还能让你体验到亲手编写底层代码的乐趣。在这篇文章中，我们将从最基础的引导程序开始，逐步构建一个简单的操作系统雏形。

&lt;!--more--&gt;

## 环境搭建

本节主要介绍在 Ubuntu 系统下的环境搭建。

### VirtualBox

为了使用 Ubuntu 系统，本文选择的是在虚拟机上进行安装，这里选用的软件是 VirtualBox 6.1。

![](/images/202412/7/1.png)

VirtualBox 官网：https://www.virtualbox.org

在官网将安装包下载安装好即可。

### Ubuntu

为了安装 Ubuntu 系统，需要去官网将系统的 ISO 文件下载好。

![](/images/202412/7/2.png)

ubuntu 官网：https://ubuntu.com

下载好，可以参考[VirtualBox 上 Ubuntu16.04 安装教程](https://blog.csdn.net/scene_2015/article/details/83025750)一文进行安装。

### 安装 Bochs

Bochs 是什么？一个模拟器而已。有了它，我们不再需要频繁地重启计算机，可以用来对操作系统进行调试。

如何安装呢？在 Ubuntu 下非常简单，用如下命令即可：

```
sudo apt-get install vgabios bochs bochs-x bximage
```

### NASM

除了 Bochs 我们还需要一个汇编编译器，执行如下命令即可进行安装：

```
sudo apt-get install nasm
```

## 引导程序

完成了环境搭建后，我们可以从引导程序开始。

代码如下：

```
	org 07c00h	; 程序加载到7c00处
	mov ax, cs
	mov ds, ax
	mov es, ax
	call DispStr	; 调用显示字符串例程
	jmp $		; 无限循环

DispStr:
	mov ax, BootMessage
	mov bp, ax	; ES:BP = 串地址
	mov cx, 16	; CX = 串长度
	mov ax, 1301h	; AH = 13, AL = 01
	mov bx, 000ch	; 页号为0(BH = 0), 黑底红字(BL = 0c, 高亮)
	mov dl, 0
	int 10h	; 10h号中断
	ret

BootMessage:	db &#34;Hello, OS world!&#34;
times 510-($-$$) db 0	; 用0填充剩余空间, 使生成的二进制代码恰好为512字节
dw 0xaa55		; 结束标志
```

把这段代码用 NASM 编译一下：

```
nasm boot.asm -o boot.bin
```

接下来，我们 bximage 工具生成一个磁盘映像，它既可以生成虚拟软盘，也可以生成虚拟硬盘。这里，我们创建一个软盘映像：

![](/images/202412/1/1.png)

如果想用默认值，直接回车就行。这里，我们只有一个地方没有使用默认值，那就是被问到创建硬盘还是软盘映像的时候，输入了“fd”。

完成之后，当前目录下就会多了一个 a.img 文件，

![](/images/202412/1/2.png)

便是软盘映像。所谓的映像，可以理解为原始设备的逐字节复制，也就是说，软盘的第 M 个字节对应映像文件的第 M 个字节。

接下来，我们可以把 boot.bin 文件的内容写入软盘映像，使用`dd`命令即可：

```
dd if=boot.bin of=a.img bs=512 count=1 conv=notrunc
```

![](/images/202412/1/3.png)

接下来，我们需要编写一下 Bochs 的配置文件。为什么需要配置文件？因为需要告诉 Bochs，我们希望的虚拟机是什么样的。例如，内存多大、软盘映像和硬盘映像都是哪些文件等内容。下面就是一个配置文件的例子：

```
# how much memory the emulated machine will have
megs: 32

# filename of ROM images
romimage: file=/usr/share/bochs/BIOS-bochs-latest
vgaromimage: file=/usr/share/vgabios/vgabios.bin

# what disk images will be used
floppya: 1_44=a.img, status=inserted

# choose the boot disk
boot: floppy

# where do we send long messages?
log: bochsout.txt

# disable the mouse
mouse: enabled=0

# enable key mapping, using US layout as default
keyboard_mapping: enabled=1, map=/usr/share/bochs/keymaps/x11-pc-us.map
```

将以上内容保存至名为`a.config`的文件中。之后，执行命令：

```
bochs -f a.config
```

如果输入一个不带任何参数的 bochs 命令并执行，那么 Bochs 将在当前目录顺序寻找以下文件作为默认配置文件：

- .bochsrc
- bochsrc
- bochsrc.txt

所以若我们将文件命名为 bochsrc 时，`-f a.config`是可以省略的。

假如你正在运行一个有调试功能的 Bochs，那么启动后会看到终端出现若干选项，默认选项为“6. Begin simulation”，直接回车即可启动。由于是可调试的，Bochs 并没有急于进入运转状态，而是出现一个提示符，等待你的输入，我们可以输入`c`：

![](/images/202412/1/4.png)

可以看到 Bochs 模拟器中显示了红色的“Hello, OS world!”。

除了`c`指令，还可以尝试其他调试指令：

| 行为                          | 指令           | 举例                |
| ----------------------------- | -------------- | ------------------- |
| 在某物理地址设置断点          | `b addr`       | `b 0x30400`         |
| 显示当前所有断点信息          | `info break`   | `info break`        |
| 继续执行,直到遇上断点         | `c`            | `c`                 |
| 单步执行                      | `s`            | `s`                 |
| 单步执行(遇到函数则跳过)      | `n`            | `n`                 |
| 查看寄存器信息                | `info cpu`     | `info cpu`          |
| 查看寄存器信息                | `r`            | `r`                 |
| 查看寄存器信息                | `fp`           | `fp`                |
| 查看寄存器信息                | `sreg`         | `sreg`              |
| 查看寄存器信息                | `creg`         | `creg`              |
| 查看堆栈                      | `print-stack`  | `print-stack`       |
| 查看内存物理地址内容          | `xp /nuf addr` | `xp /40bx 0x9013e`  |
| 查看线性地址内容              | `xp /nuf addr` | `xp /40bx 0x13e`    |
| 反汇编一段内存                | `u start end`  | `u 0x30400 0x3040D` |
| 反汇编执行的每一条指令        | `trace-on`     | `trace-on`          |
| 每执行一条指令就打印 CPU 信息 | `trace-reg`    | `trace-reg`         |

### 引导扇区

当计算机电源被按下后，它会先进行加电自检（POST），然后寻找启动盘，如果选择的是从软盘启动，计算机就会检查软盘的 0 面 0 磁道 1 扇区。若该扇区以`0xAA55`结束，则 BIOS 会认为它是一个引导扇区。当然，一个正确的引导扇区除了以`0xAA55`结束之外，还应该包含一段少于 512 字节的执行码。

![图7](/images/202412/1/7.png)

上图来自: https://www.ionos.com/digitalguide/server/configuration/what-is-mbr/

一旦 BIOS 发现了引导扇区，就会将这 512 字节的内容装载到内存地址`0000:7c00`处，然后跳转到`0000:7c00`处将控制权交给这段引导代码。到此为止，计算机不再由 BIOS 中固有的程序来控制，而变成由操作系统的一部分来控制。

这也就是为什么代码的第一行是`org 07c00`。这行代码就是告诉编译器，将来我们的这段代码要被加载到内存偏移地址`0x7c00`处。

### `$`和`$$`

代码中的`$`表示当前行被汇编后的地址。我们可以把生成的二进制代码文件反汇编看看：

```
ndisasm -o 0x7c00 boot.bin &gt;&gt; disboot.asm
```

打开 disboot.asm 可以看到：

![](/images/202412/1/5.png)

![](/images/202412/1/6.png)

其中有一行：

```
00007C09 EBFE   jmp short 0x7c09
```

`$`在这里的意思就是`0x7c09`。

`$$`表示什么呢？它表示一个节（section）的开始处被汇编后的地址。这里，我们的程序只有 1 个节。故`$$`实际上就表示程序被编译后的开始地址，也就是`0x7c00`。

`$-$$`表示本行距离程序开始处的相对距离。`times 510-($-$$) db 0`表示将 0 这个字节重复`510-($-$$)`遍，也就是在剩下的空间中不停地填充 0，直到程序有 510 个字节。加上结束标志`0xAA55`占用的 2 个字节，恰好是 512 字节。

## 推荐

- nasm(1) - Linux man page: https://linux.die.net/man/1/nasm
- NASM Tutorial: https://cs.lmu.edu/~ray/notes/nasmtutorial/
- Linux dd Command: https://linuxhint.com/linux_dd_command/

## 参考

- 《ORANGE&#39;S: 一个操作系统的实现》


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: https://andyfree96.github.io/%E4%B8%80%E4%B8%AA%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F%E7%9A%84%E5%AE%9E%E7%8E%B0/  

