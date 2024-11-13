# TCP/IP网络编程


- **2024/1/17 更新**: 增加**进程间通信**

&lt;!--more--&gt;

## 理解网络编程和套接字

### 理解网络编程和套接字

网络编程中接受连接请求的套接字创建过程如下:

1. 调用`socket`函数创建套接字
2. 调用`bind`函数分配 IP 地址和端口号
3. 调用`listen`函数转为可接收请求和状态
4. 调用`accpet`函数受理连接请求

客户端程序只有“调用 socket 函数创建套接字”和“调用 connect 函数向服务器发送连接请求”两个步骤。

### 基于 Linux 的文件操作

对 Linux 而言，socket 操作与文件操作没有区别，socket 被认为是文件的一种，因此在网络数据传输过程中自然可以使用文件 I/O 的相关函数。Windows 和 Linux 不同，区分二者。

文件描述符只不过是为了方便称呼操作系统创建的文件或套接字而赋予的数而已。文件描述符有时也称为句柄，但“句柄”主要是 Windows 中的术语。

在项目中，为了给基本数据类型赋予别名，一般会添加大量的`typedef`声明。为了与程序员定义的新数据类型加以区分，操作系统定义的数据类型会添加后缀`_t`，例如`size_t`、`ssize_t`等。

文件描述符从 3 开始由小到大顺序编号，因为 0、1、2 分配给标准 I/O 的描述符。

![](/images/202402/3/1.png)

### 基于 Windows 平台的实现

Windows 套接字（简称 Winsock）大部分是参考 BSD 系列的 UNIX 套接字设计的。

为了在 Windows 基础上开发网络程序，需要做如下准备。

- 导入头文件`winsock2.h`
- 链接`ws2_32.lib`库

![](/images/202402/3/2.png)

Winsock 编程时必须首先调用`WSAStartup`函数，设置程序中用到的 Winsock 版本，并初始化相应版本的库。

注销该库使用如下函数:

```C&#43;&#43;
##include &lt;iostream&gt;
##include &lt;WinSock2.h&gt;

int main()
{
	WSADATA wsaData;
	if (WSAStartup(MAKEWORD(2, 2), &amp;wsaData) != 0) {
		std::cout &lt;&lt; &#34;WSAStartup ERROR!&#34; &lt;&lt; std::endl;
	}
	WSACleanup();
	return 0;
}
```

## 套接字类型与协议设置

协议是计算机对话使用的通信规则。

```C
##include &lt;sys/socket.h&gt;

int socket(int domain, int type, int protocol);

// 成功返回文件描述符，失败时返回-1
```

- `domain`套接字使用的协议族信息
- `type`套接字数据传输类型信息
- `protocol`计算机间通信中使用的协议信息

### 协议族

套接字通信中的协议有一些分类，通过`socket`函数的第一个参数传递套接字中使用的协议分类信息。

![](/images/202402/3/3.png)

### 套接字类型

套接字类型指的是套接字的数据传输方式，通过`socket`函数的第二个参数传递，只有这样才能决定创建的套接字的数据传输方式。为什么通过第一个参数传递了协议族信息，还要决定数据传输方式？这是因为决定了协议族并不能同时决定数据传输方式，换而言之，`socket`函数第一个参数`PF_INET`协议族中也存在多种数据传输方式。

#### 面向连接的套接字（SOCK_STREAM）

可靠的、按序传递的、基于字节的面向连接的数据传输方式的套接字。（传送带传输，收和发套接字都有缓存，多次`write`可能只需要一次`read`，即二者的次数可以不等，传输的数据不存在数据边界）

#### 面向消息的套接字（SOCK_DGRAM）

不可靠的、不按序传递的、以数据的高速传递为目的的套接字（摩托车传输，发一次得收一次，传输的数据存在数据边界）。

### 协议的最终选择

`socket`函数的前两个参数传递了协议族的信息和套接字数据传输方式，这些信息还不足以决定采用的协议吗？为什么还需要传递第 3 个参数？

前两个参数即可创建所需套接字。所以大部分情况下可以向第三个参数传递 0，除非遇到以下情况:

&gt; 同一个协议族中存在多个传输方式相同的协议

数据传输方式相同，但协议不同。此时需要通过第三个参数具体指定协议信息。

比如，创建“IPv4 协议族面向连接的套接字”。

参数`PF_INET`指 IPv4 网络协议族，`SOCK_STREAM`是面向连接的数据传输。满足这两个条的协议只有`IPPROTO_TCP`，这种套接字称为 TCP 套接字。

```C&#43;&#43;
int tcp_socket = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP);
```

再比如，创建“IPv4 协议族面向消息的套接字”。

满足上述条件的协议只有`IPPROTO_UDP`，这种套接字称为 UDP 套接字。

```C&#43;&#43;
int udp_socket = socket(PF_INET, SOCKET_STREAM, IPPROTO_UDP);
```

## 地址族与数据序列

### 分配给套接字的 IP 地址和端口号

IP 是 Internet Protocol（网络协议）的简写，是为收发网络数据而分配给计算机的值。端口号并非赋予计算机的值，而是为区分程序中创建的套接字而分配给套接字的序号。

#### 网络地址（Internet Address）

为让计算机连接到网络并收发数据，需向其分配 IP 地址。IP 地址分为两类。

- IPv4（Internet Protocol version 4） 4 字节地址族
- IPv6（Internet Protocol version 6） 16 字节地址族

![](/images/202402/3/4.png)

网络地址（网络 ID）是为区分网络而设置的一部分 IP 地址。传输数据时，并非一开始就浏览所有 4 字节 IP 地址，进而找到目标主机；而是仅浏览 4 字节 IP 地址的网络地址，向把数据传到网络。网络（构成网络的路由器（Router）或交换机（Switch））接到数据后，浏览传输数据的主机地址（主机 ID）并将数据传给目标计算机。

![](/images/202402/3/5.png)

&gt; 构建网络需要一种物理设备完成外网与本网主机之间的数据交换，这种设备便是路由器或交换机。它们也是一种计算机，只不过为了特殊目的而设计运行的，因而有了别名。我们可在自己的计算机中安装适当的软件，也可以将其作为交换机。交换机的功能比路由器简单一些，实际差别不大。

#### 网络地址分类与主机地址边界

只需通过 IP 地址的第一个字节即可判断网络地址占用的字节数:

![](/images/202402/3/6.png)

#### 用于区分套接字的端口号

计算机中一般配有 NIC（Network Interface Card，网络接口卡）数据传输设备。通过 NIC 向计算机内部传输数据时会用到 IP。操作系统负责把传递到内部的数据适当分配给套接字，这时就要利用端口号。也就是说，通过 NIC 收到的数据内有端口号，操作系统参考此端口号把数据传输给相应端口的套接字。

![](/images/202402/3/7.png)

端口号是在同意操作系统内为区分不同套接字而设置的，因此无法将一个端口号分配给不同套接字。端口号由 16 位构成，可分配的端口号范围是 0~65535。但 0~1023 是知名端口号（Wll-known PORT），一般分配给特定应用程序。TCP 套接字和 UDP 套接字不会公用端口号，所以允许重复。

**数据传输目标地址同时包含 IP 地址和端口号，只有这样，数据才会被传输到最终的目的应用程序（应用程序套接字）。**

### 地址信息的表示

#### 表示 IPv4 地址的结构体

```C&#43;&#43;
struct sockaddr_in {
  sa_family_t sin_family; // 地址族(Address Family)
  uint16_t sin_port; // 16位TCP/UDP端口号
  struct in_addr sin_addr; // 32位IP地址
  char sin_zero[8]; // 不使用
}
```

`in_addr`定义如下:

```C&#43;&#43;
struct in_addr {
  In_addr_t s_addr; // 32位IPv4地址
};
```

![](/images/202402/3/8.png)

#### 结构体`sockaddr_in`的成员分析

### 网络字节序与地址转换

#### 字节序（Order）与网络字节序

CPU 向内存保存数据的方式有两种:

- 大端序（Big Endian）: 高位字节放到低位地址
- 小端序（Little Endian）: 高位字节放到高位地址

主流的 Intel 系列 CPU 以小端序方式保存数据。

在通过网络传输数据时约定统一的方式，称为网络字节序（Network Byte Order），非常简单——统一为大端序。即，先把数据数组转化为大端序格式再进行网络传输。

#### 字节序转换（Endian Conversions）

![](/images/202402/3/9.png)

&gt; 除了向`sockaddr_in`结构体变量填充数据外，其他情况无需考虑字节序问题。

### 网络地址的初始化与分配

#### 将字符串信息转换为网络字节序的整数型

使用`inet_addr`函数可以将字符串形式的 IP 地址转换为 32 为整型数据。

```C&#43;&#43;
##include&lt;arpa/inet.h&gt;

in_addr_t inet_addr(const char* string);

// 成功返回32位大端序整型值，失败时返回INADDR_NONE。

char* inet_ntoa(struct in_addr adr);

// 成功返回转换的字符串地址值，失败时返回-1
```

## 基于 TCP 的服务器端/客户端(1)

### 实现基于 TCP 的服务器端/客户端

#### TCP 服务器端的默认函数调用顺序

![](/images/202402/3/10.png)

#### 进入等待连接请求状态

我们已调用`bind`函数给套接字分配了地址，接下来就要通过`listen`函数进入等待连接请求状态。只有调用了`listen`函数，客户端才能进入可发出连接请求的状态。这时客户端才能调用`connect`函数（若提前调用将发生错误）。

```C&#43;&#43;
##include &lt;sys/socket.h&gt;

int listen(int sock, int backlog);

// 成功返回0，失败返回-1
// sock 希望进入等待连接状态的套接字文件描述符，传递的描述符套接字参数成为服务器端套接字（监听套接字）
// backlog 连接请求等待队列的长度，若为5，则队列长度为5，表示最多使5个连接请求进入队列
```

![](/images/202402/3/11.png)

#### 受理客户端连接请求

服务器端套接字是做门卫的。如果与客户端的数据交换使用门卫，那谁来守门呢？因此需要另外一个套接字，但没必要亲自创建。`accpet`函数将自动创建套接字，并连接到发起请求的客户端。

```C&#43;&#43;
##include &lt;sys/socket.h&gt;

int accpet(int sock, struct sockaddr* addr, socklen_t* addrlen);

// 成功时返回创建的套接字文件描述符，失败返回-1
// sock 服务器套接字的文件描述符
// addr 保存发起连接请求的客户端地址信息的变量地址值，调用函数后向传递来的地址变量参数填充客户端地址信息
// addrlen 第二个参数addr结构体的长度，但是存有长度的变量地址。函数调用完成后，该变量即被填入客户端地址长度
```

![](/images/202402/3/12.png)

#### TCP 客户端的默认函数调用顺序

![](/images/202402/3/13.png)

服务器调用`listen`函数后创建连接请求等待队列，之后客户端即可请求连接。通过如下函数即可发起请求连接:

```C&#43;&#43;
##include &lt;sys/socket.h&gt;

int connect(int sock, struct sockaddr* servaddr, socklen_t addrlen);

// 成功时返回0，失败时返回-1
// sock 客户端套接字文件描述符
// servaddr 保存目标服务器端地址信息的变量地址值
// addrlen 以字节为单位传递已传递给第二个结构体参数servaddr的地址变量长度
```

客户端调用`connect`函数后，发生以下情况之一才会返回（完成函数调用）。

- 服务器端接收连接请求
- 发生断网等异常情况而中断连接请求

接收连接并不意味着服务器端调用`accpet`函数，其实是服务器端把连接请求信息记录到等待队列。因此`connect`函数返回后并不立即进行数据交换。

&gt; 客户端套接字何时、何地、如何分配地址呢？调用`connect`函数时。操作系统，准确地说是在内核中。IP 用主机的 IP，端口随机。客户端的 IP 地址和端口在调用`connect`函数时自动分配，无需调用`bind`函数进行分配。

#### 基于 TCP 和服务器端/客户端函数调用关系

![](/images/202402/3/14.png)

服务器端创建套接字后连续调用`bind`和`listen`函数进入等待状态，客户端通过调用`connect`函数发起连接请求。客户端只能等到服务器端调用`listen`函数后才能调`connect`函数。客户端调用`connect`函数前，服务器端有可能率先调用`accpet`函数。此时服务器端在调用`accpet`函数时进入阻塞状态，直到客户端调用`connect`函数为止。

### 实现迭代服务器端/客户端

#### 实现迭代服务器端

插入循环语句反复调用`accept`函数。

![](/images/202402/3/15.png)

从上图可看出，调用`accept`函数后紧接着调用 I/O 相关的`read`和`write`函数，之后调用`close`函数。这并非针对服务器端套接字，而是针对`accept`函数调用时创建的套接字。

调用`close`函数就意味着结束了针对某一客户端的服务。此时如果还想服务于其他客户端，就要重新调用`accpet`函数。同一时刻只能服务于一个客户端，学完进程和线程后，就可以编写同时服务多个客户端的服务器了。

#### 迭代回声服务器/客户端

![](/images/202402/3/16.png)

### 基于 Windows 的实现

#### 基于 Windows 的回声服务器端

```C&#43;&#43;

##include &lt;iostream&gt;
##include &lt;cstdlib&gt;
##include &lt;cstring&gt;
##include &lt;winsock2.h&gt;
##include &lt;cstdio&gt;

##define BUF_SIZE 1024

void ErrorHandling(const char* message);

int main(int argc, char* argv[])
{
	WSADATA wsaData;
	SOCKET hServerSocket, hClientSocket;
	char message[BUF_SIZE];
	int strlen, i;
	int clientAddrSize;

	SOCKADDR_IN serverAddr, clientAddr;
	if (argc != 2) {
		printf(&#34;Usage : %s &lt;port&gt;\n&#34;, argv[0]);
		exit(1);
	}

	if (WSAStartup(MAKEWORD(2, 2), &amp;wsaData) != 0)
		ErrorHandling(&#34;WSAStartup() error!&#34;);
	hServerSocket = socket(PF_INET, SOCK_STREAM, 0);
	if (hServerSocket == INVALID_SOCKET) ErrorHandling(&#34;socket() error!&#34;);
	memset(&amp;serverAddr, 0, sizeof(serverAddr));
	serverAddr.sin_family = AF_INET;
	serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);
	serverAddr.sin_port = htons(atoi(argv[1]));

	if (bind(hServerSocket, (sockaddr*)&amp;serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
		ErrorHandling(&#34;bind() error!&#34;);
	}

	if (listen(hServerSocket, 5) == SOCKET_ERROR) {
		ErrorHandling(&#34;listen() error!&#34;);
	}

	clientAddrSize = sizeof(clientAddr);

	for (i = 0; i &lt; 5; i&#43;&#43;) {
		hClientSocket = accept(hServerSocket, (sockaddr*)&amp;clientAddr, &amp;clientAddrSize);
		if (hClientSocket == -1) ErrorHandling(&#34;accept() error!&#34;);
		else std::cout &lt;&lt; &#34;Connected client &#34; &lt;&lt; i &#43; 1 &lt;&lt; &#34;\n&#34;;
		while ((strlen = recv(hClientSocket, message, BUF_SIZE, 0)) != 0) {
			send(hClientSocket, message, strlen, 0);
		}


		closesocket(hClientSocket);
	}
	closesocket(hServerSocket);
	WSACleanup();

	return 0;
}


void ErrorHandling(const char* message) {
	fputs(message, stderr);
	fputc(&#39;\n&#39;, stderr);
	exit(1);
}
```

#### 基于 Windows 的回声客户端

```C&#43;&#43;
##include &lt;iostream&gt;
##include &lt;cstdlib&gt;
##include &lt;cstring&gt;
##include &lt;winSock2.h&gt;
##include &lt;cstdio&gt;

##pragma warning(disable:4996)
##define BUF_SIZE 1024

void ErrorHandling(const char* message);

int main(int argc, char* argv[])
{
	WSADATA wsaData;
	SOCKET hSocket;
	char message[BUF_SIZE];
	int strLen;
	SOCKADDR_IN serverAddr;

	if (argc != 3) {
		printf(&#34;Usage : %s &lt;IP&gt; &lt;port&gt;\n&#34;, argv[0]);
		exit(1);
	}

	if (WSAStartup(MAKEWORD(2, 2), &amp;wsaData) != 0)
		ErrorHandling(&#34;WSAStartup() error!&#34;);

	hSocket = socket(PF_INET, SOCK_STREAM, 0);
	if (hSocket == INVALID_SOCKET) ErrorHandling(&#34;socket() error&#34;);
	memset(&amp;serverAddr, 0, sizeof(serverAddr));
	serverAddr.sin_family = AF_INET;
	serverAddr.sin_addr.s_addr = inet_addr(argv[1]);
	serverAddr.sin_port = htons(atoi(argv[2]));

	if (connect(hSocket, (sockaddr*)&amp;serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
		ErrorHandling(&#34;connect() error!&#34;);
	}

	while (1)
	{
		fputs(&#34;Input message (Q to quit): &#34;, stdout);
		fgets(message, BUF_SIZE, stdin);
		if (!strcmp(message, &#34;q\n&#34;) || !strcmp(message, &#34;Q\n&#34;)) break;
		send(hSocket, message, strlen(message), 0);
		strLen = recv(hSocket, message, BUF_SIZE - 1, 0);
		message[strLen] = 0;
		printf(&#34;Message from server : %s&#34;, message);
	}
	closesocket(hSocket);
	WSACleanup();
	return 0;
}

void ErrorHandling(const char* message) {
	fputs(message, stderr);
	fputc(&#39;\n&#39;, stderr);
	exit(1);
}
```

## 基于 TCP 的服务器端/客户端(2)

### 回声客户端的完美实现

```C
##include &lt;stdio.h&gt;
##include &lt;stdlib.h&gt;
##include &lt;string.h&gt;
##include &lt;unistd.h&gt;
##include &lt;arpa/inet.h&gt;
##include &lt;sys/socket.h&gt;

##define BUF_SIZE 1024

void error_handling(char *message);

int main(int argc, char *argv[])
{
  int sock;
  char message[BUF_SIZE];
  int str_len, recv_len, recv_cnt;
  struct sockaddr_in serv_addr;
  if (argc != 3)
  {
    printf(&#34;Usage : %s &lt;IP&gt; &lt;port&gt; \n&#34;, argv[0]);
    exit(1);
  }

  sock = socket(PF_INET, SOCK_STREAM, 0);
  if (sock == -1)
  {
    error_handling(&#34;socket() error&#34;);
  }

  memset(&amp;serv_addr, 0, sizeof(serv_addr));
  serv_addr.sin_family = AF_INET;
  serv_addr.sin_addr.s_addr = inet_addr(argv[1]);
  serv_addr.sin_port = htons(atoi(argv[2]));

  if (connect(sock, (struct sockaddr *)&amp;serv_addr, sizeof(serv_addr)) == -1)
  {
    error_handling(&#34;connect() error&#34;);
  }
  else
  {
    puts(&#34;connected....&#34;);
  }

  while (1)
  {
    fputs(&#34;Input message (Q to quit): &#34;, stdout);
    fgets(message, BUF_SIZE, stdin);
    if (!strcmp(message, &#34;q\n&#34;) || !strcmp(message, &#34;Q\n&#34;))
    {
      break;
    }

    str_len = write(sock, message, strlen(message));
    recv_len = 0;
    while (recv_len &lt; str_len)
    {
      recv_cnt = read(sock, &amp;message[recv_len], BUF_SIZE - 1);
      if (recv_cnt == -1)
      {
        error_handling(&#34;read() error&#34;);
      }
      recv_len &#43;= recv_cnt;
    }
    message[recv_len] = 0;
    printf(&#34;Message from server : %s&#34;, message);
  }

  close(sock);

  return 0;
}

void error_handling(char *message)
{
  fputs(message, stderr);
  fputc(&#39;\n&#39;, stderr);
  exit(1);
}
```

### TCP 原理

#### TCP 套接字中的 I/O 缓冲

TCP 套接字的数据收发无边界。服务器端即使调用 1 次`write`函数传输 40 字节的数据，客户端也有可能通过 4 次`read`函数调用每次读取 10 字节。`write`函数调用后并非立即传输数据，`read`函数调用后也并非马上接收数据。`write`函数调用瞬间，数据将移至输出缓冲；`read`函数调用瞬间，从输入缓冲读取数据。

![](/images/202402/3/17.png)

如上图所示，调用`write`函数时，数据将移到输出缓冲，在适当的时候（不管是分别传送还是一次性传送）传向对方的输入缓冲。这时对方将调用`read`函数从输入缓冲读取数据。这些 I/O 缓冲特性可整理如下。

- I/O 缓冲在每个 TCP 套接字中单独存在
- I/O 缓冲在创建套接字时自动生成
- 即使关闭套接字也会继续传递输出缓冲中遗留的数据
- 关闭套接字将丢失输入缓冲中的数据

不会发生超过输入缓冲大小的数据传输，因为 TCP 会控制数据流。TCP 中有滑动窗口（Sliding Window）协议。数据收发也是如此，TCP 不会因为缓冲溢出而丢失数据。

#### TCP 内部工作原理 1：与对方套接字的连接

TCP 套接字从创建到消失分为以下 3 步。

- 与对方套接字建立连接
- 与对方套接字进行数据交换
- 断开与对方套接字的连接

连接过程中实际交换的信息格式如下:

![](/images/202402/3/18.png)

该过程又称 Tree-way handhshaking（三次握手）。

#### TCP 内部工作原理 2：与对方主机的数据交换

![](/images/202402/3/19.png)

ACK 号 -&gt; SEQ 号 &#43; 传递字节数 &#43; 1

#### TCP 内部工作原理 3：断开与套接字的连接

![](/images/202402/3/20.png)

数据包内的 FIN 表示断开连接。即双方各发送 1 次 FIN 消息后断开连接。该过程经历了 4 个阶段，因此又称四次握手（Four-way handshaking）。

### 基于 Windows 实现

服务器端`op_server.c`

```C&#43;&#43;
##include &lt;cstdio&gt;
##include &lt;cstdlib&gt;
##include &lt;iostream&gt;
##include &lt;WinSock2.h&gt;
##include &lt;cstring&gt;

##define BUF_SIZE 1024
##define OPZS 4

void ErrorHandling(const char* message);
int calculate(int opnum, int opnds[], char op);

int main(int argc, char* argv[]) {
	WSADATA wsData;
	SOCKET serverSocket, clientSocket;
	SOCKADDR_IN serverAddr, clientAddr;
	char opinfo[BUF_SIZE];
	int clientAddrSize, i;
	int result, opndCount;
	int recvCount, recvLen;


	if (argc != 2) {
		printf(&#34;Usage : %s &lt;port&gt;\n&#34;, argv[0]);
		exit(1);
	}

	if (WSAStartup(MAKEWORD(2, 2), &amp;wsData) != 0) ErrorHandling(&#34;WSAStartup() error!&#34;);

	serverSocket = socket(PF_INET, SOCK_STREAM, 0);
	if (serverSocket == INVALID_SOCKET) ErrorHandling(&#34;socket() error!&#34;);
	memset(&amp;serverAddr, 0, sizeof(serverAddr));
	serverAddr.sin_family = PF_INET;
	serverAddr.sin_port = htons(atoi(argv[1]));
	serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);

	if (bind(serverSocket, (SOCKADDR*)&amp;serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
		ErrorHandling(&#34;bind() error!&#34;);

	if (listen(serverSocket, 5) == SOCKET_ERROR)
		ErrorHandling(&#34;listen() error!&#34;);

	clientAddrSize = sizeof(clientAddr);

	for (i = 0; i &lt; 5; i&#43;&#43;) {
		opndCount = 0;
		clientSocket = accept(serverSocket, (SOCKADDR*)&amp;clientAddr, &amp;clientAddrSize);
		recv(clientSocket, (char*)&amp;opndCount, 1, 0);
		recvLen = 0;
		while ((opndCount * OPZS &#43; 1) &gt; recvLen) {
			recvCount = recv(clientSocket, opinfo, BUF_SIZE - 1, 0);
			recvLen &#43;= recvCount;
		}
		result = calculate(opndCount, (int*)opinfo, opinfo[recvLen - 1]);
		send(clientSocket, (char*)&amp;result, sizeof(result), 0);
		closesocket(clientSocket);

	}

	closesocket(serverSocket);
	WSACleanup();
	return 0;
}


void ErrorHandling(const char* message) {
	fputs(message, stderr);
	fputc(&#39;\n&#39;, stderr);
	exit(1);
}

int calculate(int opnum, int opnds[], char op) {
	int result = opnds[0], i;
	switch (op) {
	case &#39;&#43;&#39;:
		for (i = 1; i &lt; opnum; i&#43;&#43;) result &#43;= opnds[i];
		break;
	case &#39;-&#39;:
		for (i = 1; i &lt; opnum; i&#43;&#43;) result -= opnds[i];
		break;

	case &#39;*&#39;:
		for (i = 1; i &lt; opnum; i&#43;&#43;) result *= opnds[i];
		break;
	}
	return result;
}
```

客户端`op_client.c`

```C&#43;&#43;
##include &lt;iostream&gt;
##include &lt;WinSock2.h&gt;
##include &lt;cstdlib&gt;
##include &lt;cstdio&gt;

##pragma warning(disable:4996)

##define BUF_SIZE 1024
##define RLT_SIZE 4
##define OPSZ 4

void ErrorHandling(const char* message);

int main(int argc, char* argv[])
{
	WSADATA wsData;
	SOCKET hSocket;
	char opmsg[BUF_SIZE];
	int result, opndCount, i;
	SOCKADDR_IN serverAddr;


	if (argc != 3) {
		printf(&#34;Usage : %s &lt;IP&gt; &lt;port&gt;\n&#34;, argv[0]);
		exit(1);
	}

	if (WSAStartup(MAKEWORD(2, 2), &amp;wsData) != 0) {
		ErrorHandling(&#34;WSAStartup() error!&#34;);
	}

	hSocket = socket(PF_INET, SOCK_STREAM, 0);
	if (hSocket == INVALID_SOCKET) ErrorHandling(&#34;socket() error!&#34;);
	memset(&amp;serverAddr, 0, sizeof(serverAddr));
	serverAddr.sin_addr.s_addr = inet_addr(argv[1]);
	serverAddr.sin_family = AF_INET;
	serverAddr.sin_port = htons(atoi(argv[2]));

	if (connect(hSocket, (SOCKADDR*)&amp;serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
		ErrorHandling(&#34;socket() error!&#34;);
	else
		puts(&#34;Connected ......&#34;);

	fputs(&#34;Operand count : &#34;, stdout);
	scanf(&#34;%d&#34;, &amp;opndCount);
	opmsg[0] = (char)opndCount;

	for (i = 0; i &lt; opndCount; i&#43;&#43;) {
		printf(&#34;Operand %d : &#34;, i &#43; 1);
		scanf(&#34;%d&#34;, (int*)&amp;opmsg[i * OPSZ &#43; 1]);
	}

	fgetc(stdin);
	fputs(&#34;Operator : &#34;, stdout);
	scanf(&#34;%c&#34;, &amp;opmsg[opndCount * OPSZ &#43; 1]);
	send(hSocket, opmsg, opndCount * OPSZ &#43; 2, 0);
	recv(hSocket, (char*)&amp;result, RLT_SIZE, 0);
	printf(&#34;Operation result : %d \n&#34;, result);
	closesocket(hSocket);
	WSACleanup();
	return 0;
}

void ErrorHandling(const char* message) {
	fputs(message, stderr);
	fputc(&#39;\n&#39;, stderr);
	exit(1);
}

```

### 推荐

File Transfer using TCP Socket in C: https://idiotdeveloper.com/file-transfer-using-tcp-socket-in-c/

## 基于 UDP 的服务器端/客户端

### 理解 UDP

#### UDP 内部工作原理

![](/images/202402/3/21.png)

### 实现基于 UDP 的服务器端/客户端

#### UDP 中的服务器端和客户端没有连接

UDP 服务器端和客户端不像 TCP 那样在连接状态下交换数据，因此与 TCP 不同，无需经过连接过程。即，不必调用 TCP 连接过程中调用的`listen`函数和`accept`函数。UDP 中只有创建套接字的过程和数据交换过程。

#### UDP 服务器端和客户端均只需 1 个套接字

TCP 中，套接字之间应该是一对一的关系。若要向 10 个客户端提供服务，则除了守门的服务器套接字外，还需要 10 个服务器端套接字。但在 UDP 中，不管是服务器端还是客户端都只需要 1 个套接字。

只需 1 个 UDP 套接字就可以向任意主机传输数据（类似收发信件的邮筒）。只需 1 个 UDP 套接字就能和多台主机通信。

### 基于 Windows 实现

```C&#43;&#43;
##include &lt;winsock2.h&gt;

int sendto(SOCKET s, const char* buf, int len, int flags, const struct sockaddr* to, int tolen);
// 成功返回传输的字节数，失败返回SOCKET_ERROR

int recvfrom(SOCKET s, char* buf, int len, int flag, struct sockaddr* from, int* fromlen);
// 成功返回接收的字节数，失败返回SOCKET_ERROR
```

## 优雅地断开套接字连接

### 基于 TCP 的半关闭

#### 套接字和流（Stream）

两台主机通过套接字建立连接后进入可交换数据的状态，又称“流形成的状态”。也就是把建立套接字后可交换数据的状态看作一种流。此处的流可以比作水流。水朝着一个方向流动，同样，在套接字的流中，数据也只能向一个方向流动。为了进行双向通信，就需要如下图所示的 2 个流。

![](/images/202402/3/22.png)

一旦两台主机建立了套接字连接，每个主机机会拥有单独的输入流和输出流。其中一个主机的输入流与一台主机的输出流相连，而输出流则与另一主机的输入流相连。优雅地断开连接方式指的是只断开其中一个流，而非同时断开两个流。Linux 的`close`和 Windows 的`closesocket`函数将同时断开这两个流，因此不够优雅。

#### 针对优雅断开的`shutdown`函数

`shutdown`函数可以用来关闭其中 1 个流。

```C&#43;&#43;
##include &lt;sys/socket.h&gt;

int shutdown(int sock, int howto);

// 成功返回0，失败返回-1
```

调用上述函数时，第二个参数决定断开连接的方式，其可能值如下:

- `SHUT_RD`: 断开输入流
- `SHUT_WR`: 断开输出流
- `SHUT_RDWR`: 同时断开 I/O 流

### 基于 Windows 的实现

Windows 平台调用的`shutdown`函数传递的参数略有不同。

```C&#43;&#43;
##include &lt;winsock2.h&gt;

int shutdown(SOCKET sock, int howto);

// 成功返回0，失败返回SOCKET_ERROR
// sock 要断开的套接字句柄
// howto 断开方式的信息
```

调用上述函数时，第二个参数的可能值如下:

- `SD_RECEIVE`: 断开输入流
- `SD_SEND`: 断开输出流
- `SD_BOTH`: 同时断开 I/O 流

服务器端`file_server_win.cpp`:

```C&#43;&#43;
##include &lt;WinSock2.h&gt;
##include &lt;cstdio&gt;
##include &lt;cstdlib&gt;

##pragma warning(disable:4996)
##define BUF_SIZE 30

void ErrorHandling(const char* message);

int main(int argc, char* argv[]) {
	WSADATA wsaData;
	SOCKET serverSocket, clientSocket;
	FILE* fp;
	char buf[BUF_SIZE];
	int readCount;
	SOCKADDR_IN serverAddr, clientAddr;
	int clientAddrSize;

	if (argc != 2) {
		printf(&#34;Usage : %s &lt;port&gt;\n&#34;, argv[0]);
		exit(1);
	}

	if (WSAStartup(MAKEWORD(2, 2), &amp;wsaData) != 0) ErrorHandling(&#34;WSAStartup() error!&#34;);

	fp = fopen(&#34;file_server_win.cpp&#34;, &#34;rb&#34;);
	serverSocket = socket(PF_INET, SOCK_STREAM, 0);
	memset(&amp;serverAddr, 0, sizeof(serverAddr));
	serverAddr.sin_family = AF_INET;
	serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);
	serverAddr.sin_port = htons(atoi(argv[1]));

	bind(serverSocket, (SOCKADDR*)&amp;serverAddr, sizeof(serverAddr));
	listen(serverSocket, 5);

	clientAddrSize = sizeof(clientAddr);
	clientSocket = accept(serverSocket, (SOCKADDR*)&amp;clientAddr, &amp;clientAddrSize);

	while (true) {
		readCount = fread((void*)buf, 1, BUF_SIZE, fp);
		if (readCount &lt; BUF_SIZE) {
			send(clientSocket, (char*)&amp;buf, readCount, 0);
			break;
		}
		send(clientSocket, (char*)&amp;buf, BUF_SIZE, 0);
	}

	shutdown(clientSocket, SD_SEND);
	recv(clientSocket, (char*)buf, BUF_SIZE, 0);
	printf(&#34;Message from client : %s \n&#34;, buf);
	fclose(fp);
	closesocket(clientSocket);
	closesocket(serverSocket);
	WSACleanup();
	return 0;
}


void ErrorHandling(const char* message) {
	fputs(message, stderr);
	fputc(&#39;\n&#39;, stderr);
	exit(1);
}
```

客户端`file_client_win.cpp`:

```C&#43;&#43;
##include &lt;iostream&gt;
##include &lt;WinSock2.h&gt;
##include &lt;cstdlib&gt;
##include &lt;cstdio&gt;

##pragma warning(disable:4996)

##define BUF_SIZE 30

void ErrorHandling(const char* message);

int main(int argc, char* argv[])
{
	WSADATA wsData;
	SOCKET hSocket;
	char buf[BUF_SIZE];
	int readCount;
	SOCKADDR_IN serverAddr;
	FILE* fp;


	if (argc != 3) {
		printf(&#34;Usage : %s &lt;IP&gt; &lt;port&gt;\n&#34;, argv[0]);
		exit(1);
	}

	if (WSAStartup(MAKEWORD(2, 2), &amp;wsData) != 0) {
		ErrorHandling(&#34;WSAStartup() error!&#34;);
	}

	fp = fopen(&#34;receive.dat&#34;, &#34;wb&#34;);


	hSocket = socket(PF_INET, SOCK_STREAM, 0);
	if (hSocket == INVALID_SOCKET) ErrorHandling(&#34;socket() error!&#34;);
	memset(&amp;serverAddr, 0, sizeof(serverAddr));
	serverAddr.sin_addr.s_addr = inet_addr(argv[1]);
	serverAddr.sin_family = AF_INET;
	serverAddr.sin_port = htons(atoi(argv[2]));

	if (connect(hSocket, (SOCKADDR*)&amp;serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
		ErrorHandling(&#34;socket() error!&#34;);
	else
		puts(&#34;Connected ......&#34;);

	while ((readCount = recv(hSocket, buf, BUF_SIZE, 0)) != 0)
	{
		fwrite((void*)buf, 1, readCount, fp);
	}

	puts(&#34;Received file data&#34;);
	send(hSocket, &#34;Thank you&#34;, 10, 0);
	fclose(fp);
	closesocket(hSocket);
	WSACleanup();
	return 0;
}

void ErrorHandling(const char* message) {
	fputs(message, stderr);
	fputc(&#39;\n&#39;, stderr);
	exit(1);
}

```

## 域名及网络地址

## 套接字的多种可选项

## 多进程服务器端

### 进程概念及应用

#### 并发服务器的的实现方法

- 多进程服务器: 通过创建多个进程提供服务
- 多路复用服务器: 通过绑定并统一管理 I/O 对象提供服务
- 多线程服务器: 通过生成与客户端等量的线程提供服务

第一种方法: 多进程服务器。不适合在 Windows 平台下（Windows 不支持），因此将重点放在 Linux 平台。

#### 理解进程（Process）

定义如下:

**占用内存空间的正在运行的程序**

#### 进程 ID

无论进程是如何创建的，所有进程都会从操作系统分配到 ID。此 ID 称为进程 ID，其值为大于 2 的整数。1 要分配给操作系统启动后（用于协助操作系统）首个进程，因此用户进程无法得到 ID 值 1。

![ps命令结果](/images/202402/3/23.png)

通过 ps 命令可以查看当前运行的所有进程。

#### 通过调用 fork 函数创建进程

```C&#43;&#43;
##include &lt;unistd.h&gt;

pid_t fork(void);

// 成功返回进程ID，失败返回-1
```

`fork`函数将创建调用的进程副本。即并非根据完全不同的程序创建进程，而是复制正在运行的、调用`fork`函数的进程。两个进程都将执行`fork`函数调用后的语句（准确说是在`fork`函数返回后）。但因为通过同一个进程、复制相同的内存空间，之后的程序流要根据`fork`函数的返回值加以区分。`fork`函数的特点如下:

- 父进程: `fork`函数返回子进程 ID
- 子进程: `fork`函数返回 0

这里的父进程（Parent Process）指的是原进程，即调用`fork`函数的主体，而子进程（Child Process）是通过父进程调用`fork`函数复制出的进程。

![](/images/202402/3/24.png)

从上图可以看到，父进程调用`fork`函数的同时复制出子进程，并分别得到`fork`函数的返回值。在父进程和子进程中`gval`和`lval`互不影响。因此`fork`函数调用后分成了完全不同的进程，只是二者共享同一代码而已。

```C&#43;&#43;
##include &lt;stdio.h&gt;
##include &lt;unistd.h&gt;

int gval = 10;

int main(int argc, char* argv[]){
	pid_t pid;
	int lval = 20;
	gval&#43;&#43;, lval&#43;=5;

	pid = fork();
	if (pid == 0)
		gval &#43;= 2, lval &#43;= 2;
	else
		gval -= 2, lval -= 2;
	if (pid == 0)
		printf(&#34;Child Proc : [%d, %d] \n&#34;, gval, lval);
	else
		printf(&#34;Parent Proc : [%d, %d] \n&#34;, gval, lval);
	return 0;
}
```

![](/images/202402/3/25.png)

### 进程和僵尸进程

进程销毁和进程创建同等重要。如果未认真进程销毁，它们将变成僵尸进程。

#### 僵尸（Zombie）进程

进程完成工作后（执行完`main`函数中的程序后）应被销毁，但有时这些进程将变成僵尸进程，占用系统中的重要资源。这种状态下的进程称作“僵尸进程”，也是给系统带来负担的原因之一。

#### 产生僵尸进程的原因

调用`fork`函数产生子进程的终止方式:

- 传递参数并调用`exit`函数
- `main`函数中执行`return`语句并返回值

向`exit`函数传递的参数值和`main`函数的`return`语句返回的值都会传递给操作系统。而操作系统不会销毁子进程，直到把这些值传递给产生该子进程的父进程。处在这种状态下的进程就是僵尸进，将子进程变成僵尸进程的正是操作系统。那么如何销毁僵尸进程呢？向父进程传递`exit`函数的参数值或`return`的返回值即可。如何向父进程传递这些值呢？操作系统不会主动传递给父进程，只有父进程主动发起请求（函数调用）时，操作系统才会传递该值。换言之，如果父进程未主动要求获得子进程的结束状态值，操作系统将一直保存，并让子进程长时间处于僵尸进程状态。

```C&#43;&#43;
##include &lt;stdio.h&gt;
##include &lt;unistd.h&gt;

int main(int argc, char* argv[]){

	pid_t pid = fork();
	if (pid == 0) puts(&#34;Child Process&#34;);
	else {
		printf(&#34;Child Process ID : %d \n&#34;, pid);
		sleep(30); // Sleep 30 sec
	}
	if (pid == 0)
		puts(&#34;End Child Process&#34;);
	else
		puts(&#34;End Parent Process&#34;);
	return 0;
}
```

![](/images/202402/3/26.png)

#### 销毁僵尸进程 1：利用 wait 函数

为了销毁子进程，父进程应主动请求获取子进程的返回值。发起请求的方法有两种，其中之一就是调用如下函数。

```C&#43;&#43;
##include &lt;sys/wait.h&gt;

pid_t wait(int* statloc);
// 成功返回终止的子进程ID，失败返回-1
```

调用此函数时如果已有子进程终止，那么子进程终止时传递的返回值（`exit`函数的参数值、`main`函数的`return`返回值）将保存到该函数的参数所指内存空间。但函数参数指向的单元中还包含其他信息，因此需要通过下列宏进行分离。

- `WIFEXITED`子进程正常终止时返回真（True）
- `WEXITSTATUS`返回子进程的返回值

向`wait`函数传递变量`status`的地址时，调用`wait`函数后应编写如下代码:

```C&#43;&#43;
if (WIFEXITED(status)) // 是正常终止吗？
{
	puts(&#34;Normal termination!&#34;);
	printf(&#34;Child pass num: %d&#34;, WEXITSTATUS(status)); // 返回值是多少？
}

```

根据上述内容编写示例，此示例不会再让子进程变成僵尸进程。

```C&#43;&#43;
##include &lt;stdio.h&gt;
##include &lt;stdlib.h&gt;
##include &lt;unistd.h&gt;
##include &lt;sys/wait.h&gt;

int main(int argc, char* argv[]){
  int status;
  pid_t pid = fork();
  if (pid == 0) {
    return 3;
  } else {
    printf(&#34;Child PID %d \n&#34;, pid);
    pid = fork();
    if (pid == 0) {
      exit(7);
    }
    else {
      printf(&#34;Child PID %d \n&#34;, pid);
      wait(&amp;status);
      if (WIFEXITED(status)){
        printf(&#34;Child send one : %d\n&#34;, WEXITSTATUS(status));
      }
      wait(&amp;status);
      if (WIFEXITED(status)){
        printf(&#34;Child send two : %d\n&#34;, WEXITSTATUS(status));
      }
      sleep(30);
    }
  }
  return 0;
}
```

![](/images/202402/3/27.png)

调用`wait`函数时，如果没有已终止的子进程，那么程序将阻塞（Blocking）直到有子进程终止，因此需谨慎调用该函数。

#### 销毁僵尸进程 2：使用 waitpid 函数

`wait`函数会引起程序阻塞，可以考虑调用`waitpid`函数。这是防止僵尸进程的第二种方法，也是防止阻塞的方法。

```C&#43;&#43;
##include &lt;sys/wait.h&gt;

pid_t waitpid(pid_t pid, int* statloc, int options);
// 成功返回终止的子进程ID（或0），失败返回-1
// pid 等待终止的目标子进程ID，若传递-1，则与wait函数相同，可以等待任意子进程终止
// statloc 与wait函数的statloc参数具有相同含义
// options 传递头文件sys/wait.h中声明的常量WNOHANG，即使没有终止的子进程也不会进入阻塞状态，而是返回0并退出函数
```

示例如下:

```C&#43;&#43;
##include &lt;stdio.h&gt;
##include &lt;stdlib.h&gt;
##include &lt;unistd.h&gt;
##include &lt;sys/wait.h&gt;

int main(int argc, char *argv[])
{
  int status;
  pid_t pid = fork();
  if (pid == 0)
  {
    sleep(15);
    return 24;
  }
  else
  {
    while (!waitpid(-1, &amp;status, WNOHANG))
    {
      sleep(3);
      puts(&#34;Sleep 3sec.&#34;);
    }

    if (WIFEXITED(status))
    {
      printf(&#34;Child send %d \n&#34;, WEXITSTATUS(status));
    }
  }
  return 0;
}
```

![](/images/202402/3/28.png)

### 信号处理

我们已经直到子进程的创建及销毁方法，但还有一个问题没解决。

&gt; 子进程究竟何时终止？调用`waitpid`函数后要无休止地等待吗？

父进程往往与子进程一样繁忙，因此不能只调用`waitpid`函数以等待子进程终止。

#### 向操作系统求助

子进程终止的识别主体是操作系统。如果操作系统能把子进程终止的消息告诉正忙于工作的父进程，将有助于构建高效的程序。

此时父进程暂时放下工作，处理子进程终止相关事宜。为了实现该想法，引入信号处理（Signal Handling）机制。此处的“信号”是在特定时间发生时由操作系统向进程发送的消息。为了响应该消息，执行与消息相关的自定义操作的过程“处理”或“信号处理”。

#### 信号与 signal 函数

信号注册函数，请求操作系统当子进程结束时调用某函数。

```C&#43;&#43;
##include &lt;signal&gt;

void (*signal(int signo, void(*func)(int)))(int)
```

上述函数的返回值类型为函数指针。第一个参数为特殊情况信息，第二个参数为特殊情况下将要调用的函数的地址值（指针）。发生第一个参数代表的情况时，调用第二个参数所指的函数。可以在`signal`函数中注册的部分特殊情况和对应常数如下:

- `SIGALRM`: 已到通过调用`alarm`函数注册的时间
- `SIGNIT`: 输入`CTRL &#43; C`
- `SIGCHLD`: 子进程终止

比如，编写调用`signal`函数完成“子进程终止则调用 myChild 函数”的请求，语句如下:

```C
signal(SIGCHILD, myChild);
```

以上就是信号注册过程。注册好信号后，发生注册信号时（注册的情况发生时），操作系统将调用该信号对应的函数。

先介绍`alarm`函数。

```C
##include &lt;unistd.h&gt;

unsigned int alarm(unsigned int seconds);

// 返回0或者以秒为单位的距SIGALRM信号发生所剩时间
```

如果调用该函数的同时向它传递一个正整型函数，相应时间后（以秒为单位）将产生 SIGALRM 信息。若向该函数传递 0，则之前对 SIGALRM 信号预约将取消。如果通过该函数预约信号后为指定该信号对应的处理函数，则（通过调用`signal`函数）终止进程，不做任何处理。

示例如下:

```C
##include &lt;signal.h&gt;
##include &lt;unistd.h&gt;
##include &lt;stdio.h&gt;

void timeout(int sig)
{
  if (sig == SIGALRM)
    puts(&#34;Time out!&#34;);
  alarm(2);
}

void keycontrol(int sig)
{
  if (sig == SIGINT)
    puts(&#34;CTRL &#43; C pressed&#34;);
}

int main(int argc, char *argv[])
{
  int i;
  signal(SIGALRM, timeout);
  signal(SIGINT, keycontrol);
  alarm(2);
  for (i = 0; i &lt; 3; i&#43;&#43;)
  {
    puts(&#34;wait...&#34;);
    sleep(100);
  }
  return 0;
}
```

![](/images/202402/3/29.png)

发生信号时将唤醒由于调用`sleep`函数而进入阻塞状态的进程。调用函数的主体是操作系统，但进程处于睡眠状态无法调用函数。因此，产生信号时，为了调用信号处理器 ，将唤醒由于调用`sleep`函数而进入阻塞状态的进程。而且，进程一旦被唤醒，就不会再进入睡眠状态。即使还未到`sleep`函数中规定的时间也如此。所以上述示例运行不到 10 秒就会结束，连续输入`CTRL &#43; C`可能 1 秒都不到。

#### 利用 sigaction 函数进行信号处理

`sigaction`函数类似于`signal`函数，且完全可以代替它，也更稳定。稳定的原因是`signal`函数在 UNIX 系列的不同操作系统中可能存在区别，但`sigaction`函数完全相同。

```C
##include &lt;signal.h&gt;

int sigaction(int signo, const struct sigaction* act, struct sigaction* oldact);

// 成功时返回0，失败时返回-1
// signo 与signal函数相同，传递信号信息
// act 对于与第一个参数的信号处理函数（信号处理器）信息
// oldact 通过参数获取之前注册的信号处理函数指针，若不需要则传递0
```

声明并初始化`sigaction`结构体变量以调用上述函数，该结构体定义如下:

![](/images/202402/3/30.png)

结构体的`sa_handler`成员保存信号处理函数的指针值（地址值）。

示例如下:

```C
##include &lt;signal.h&gt;
##include &lt;stdio.h&gt;
##include &lt;unistd.h&gt;

void timeout(int sig)
{
  if (sig == SIGALRM)
  {
    puts(&#34;Time out!&#34;);
  }
  alarm(2);
}

int main(int argc, char *argv[])
{
  int i;
  struct sigaction act;
  act.sa_handler = timeout;
  sigemptyset(&amp;act.sa_mask);
  act.sa_flags = 0;
  sigaction(SIGALRM, &amp;act, 0);
  alarm(2);
  for (i = 0; i &lt; 3; i&#43;&#43;)
  {
    puts(&#34;wait...&#34;);
    sleep(100);
  }
  return 0;
}
```

![](/images/202402/3/31.png)

#### 利用信号处理技术消灭僵尸进程

进程终止时将产生`SIGCHLD`信号。

```C
##include &lt;stdio.h&gt;
##include &lt;stdlib.h&gt;
##include &lt;unistd.h&gt;
##include &lt;signal.h&gt;
##include &lt;sys/wait.h&gt;

void read_childproc(int sig)
{
  int status;
  pid_t pid = waitpid(-1, &amp;status, WNOHANG);
  if (WIFEXITED(status))
  {
    printf(&#34;Removed proc id : %d\n&#34;, pid);
    printf(&#34;Child send : %d \n&#34;, WEXITSTATUS(status));
  }
}

int main(int argc, char *argv[])
{
  pid_t pid;
  struct sigaction act;
  act.sa_handler = read_childproc;
  sigemptyset(&amp;act.sa_mask);
  act.sa_flags = 0;
  sigaction(SIGCHLD, &amp;act, 0);

  pid = fork();
  if (pid == 0) // 子进程执行区域
  {
    puts(&#34;Hi! I am child process&#34;);
    sleep(10);
    return 12;
  }

  else // 父进程执行区域
  {
    printf(&#34;Child proc is : %d\n&#34;, pid);
    pid = fork();
    if (pid == 0) // 另一子进程执行区域
    {
      puts(&#34;Hi! I am child process&#34;);
      sleep(10);
      exit(24);
    }
    else
    {
      int i;
      printf(&#34;Child proc is : %d\n&#34;, pid);
      for (i = 0; i &lt; 5; i&#43;&#43;)
      {
        puts(&#34;wait...&#34;);
        sleep(5);
      }
    }
  }
  return 0;
}
```

![](/images/202402/3/32.png)

### 基于多任务的并发服务器

#### 基于进程的并发服务器模型

此前的回声服务器端每次都只能向一个客户端提供服务。因此，我们可以扩展回声服务器端，使其可以同时向国歌客户端提供服务，实现模型如下。

![](/images/202402/3/33.png)

每当有客户端请求服务（连接请求）时，回声服务器都创建子进程以提供服务。请求服务的客户端若有 5 个，则将创建 5 个子进程提供服务。过程如下:

- 第一阶段：回声服务器端（父进程）通过调用`accept`函数受理连接请求
- 第二阶段：此时获取的套接字文件描述符创建并传递给子进程
  第三阶段：子进程利用传递来的文件描述符提供服务

子进程会复制父进程拥有的所有资源，实际上根本不哦那个另外传递文件描述符的过程。

#### 实现并发服务器

```C
// echo_mpserv.c
##include &lt;stdio.h&gt;
##include &lt;stdlib.h&gt;
##include &lt;string.h&gt;
##include &lt;unistd.h&gt;
##include &lt;signal.h&gt;
##include &lt;sys/wait.h&gt;
##include &lt;arpa/inet.h&gt;
##include &lt;sys/socket.h&gt;

##define BUF_SIZE 30
void error_handling(char *message);
void read_childproc(int sig);

int main(int argc, char *argv[])
{
  int serv_sock, clnt_sock;
  struct sockaddr_in serv_adr, clnt_adr;
  pid_t pid;
  struct sigaction act;
  socklen_t adr_sz;
  int str_len, state;
  char buf[BUF_SIZE];
  if (argc != 2)
  {
    printf(&#34;Usage : %s &lt;port&gt;\n&#34;, argv[0]);
    exit(1);
  }

  act.sa_handler = read_childproc;
  sigemptyset(&amp;act.sa_mask);
  act.sa_flags = 0;
  state = sigaction(SIGCHLD, &amp;act, 0);
  serv_sock = socket(PF_INET, SOCK_STREAM, 0);
  memset(&amp;serv_adr, 0, sizeof(serv_adr));
  serv_adr.sin_family = AF_INET;
  serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
  serv_adr.sin_port = htons(atoi(argv[1]));

  if (bind(serv_sock, (struct sockaddr *)&amp;serv_adr, sizeof(serv_adr)) == -1)
  {
    error_handling(&#34;bind() error&#34;);
  }

  if (listen(serv_sock, 5) == -1)
  {
    error_handling(&#34;listen() error&#34;);
  }

  while (1)
  {
    adr_sz = sizeof(clnt_adr);
    clnt_sock = accept(serv_sock, (struct sockaddr *)&amp;clnt_adr, &amp;adr_sz);
    if (clnt_sock == -1)
    {
      continue;
    }
    else
    {
      puts(&#34;new client connected...&#34;);
    }

    pid = fork();
    if (pid == -1)
    {
      close(clnt_sock);
      continue;
    }

    if (pid == 0) // 子进程运行区域
    {
      close(serv_sock);
      while ((str_len = read(clnt_sock, buf, BUF_SIZE)) != 0)
      {
        write(clnt_sock, buf, str_len);
      }
      close(clnt_sock);
      puts(&#34;client disconnected...&#34;);
      return 0;
    }
    else
    {
      close(clnt_sock);
    }
  }
  close(serv_sock);
  return 0;
}

void read_childproc(int sig)
{
  pid_t pid;
  int status;
  pid = waitpid(-1, &amp;status, WNOHANG);
  printf(&#34;removed proc id %d \n&#34;, pid);
}

void error_handling(char *message)
{
  fputs(message, stderr);
  fputc(&#39;\n&#39;, stderr);
  exit(1);
}
```

启动服务器后，可以发现服务器可以向多个客户端提供服务。

#### 通过 fork 函数复制文件描述符

`echo_mpserv.c`中父进程将 2 个套接字（一个服务器端套接字，一个是与客户端连接的套接字）文件描述符复制给子进程。

&gt; 只复制文件描述符吗？是否也复制了套接字？

调用`fork`函数时复制父进程的所有资源，但套接字并非进程所有——严格意义上说，套接字属于操作系统——只是进程拥有代表相应套接字的文件描述符。

调用`fork`函数后，2 个文件描述符指向同一套接字。

![](/images/202402/3/34.png)

1 个套接字中存在 2 个文件描述符时，只有 2 个文件描述符都终止（销毁）后，才能销毁套接字。如果维持上图中的连接状态，即使子进程销毁了与客户端连接的套接字文件描述符，也无法完全销毁套接字（服务器端套接字同样如此）。因此，调用`fork`函数后，要将无关的套接字文件描述符关掉，如下图所示。

![](/images/202402/3/35.png)

为了将文件描述符整理成上图形式，`echo_mpserv.c`调用了`close`函数。

![](/images/202402/3/36.png)

### 分割 TCP 的 I/O 程序

#### 分割 I/O 程序的优点

已经实现的回声客户端的数据回声方式如下：

&gt; 向服务器端传输数据，并等待服务器端回复。无条件等待，直到接受完服务器端的回声数据后，才能传输下一批数据。

传输数据后需等待服务器端返回的数据，因为程序代码中重复调用了`read`和`write`函数。这么写的原因是，程序在 1 个进程中运行。现在可创建多个进程，因此可以分割数据收发过程。分割模型如下:

![](/images/202402/3/37.png)

如此实现的一个重要原因是程序实现更简单。父进程中只需编写接收数据的代码，子进程中只需编写发送数据的代码，所以会简化。

另一个好处是可以提高频繁交换数据的性能。

![](/images/202402/3/38.png)

分割 I/O 后的客户端发送数据时不必考虑接收数据的情况，因此可以连续发送数据，由此提高同一时间内传输的数据量。这种差异在网络较慢时尤为明显。

#### 回声客户端的 I/O 程序分割

```C
// echo_mpclient.c
##include &lt;stdio.h&gt;
##include &lt;stdlib.h&gt;
##include &lt;string.h&gt;
##include &lt;unistd.h&gt;
##include &lt;arpa/inet.h&gt;
##include &lt;sys/socket.h&gt;

##define BUF_SIZE 30

void error_handling(char *message);
void read_routine(int sock, char *buf);
void write_routine(int sock, char *buf);

int main(int argc, char *argv[])
{
  int sock;
  char buf[BUF_SIZE];
  pid_t pid;
  struct sockaddr_in serv_addr;
  if (argc != 3)
  {
    printf(&#34;Usage : %s &lt;IP&gt; &lt;port&gt; \n&#34;, argv[0]);
    exit(1);
  }

  sock = socket(PF_INET, SOCK_STREAM, 0);
  if (sock == -1)
  {
    error_handling(&#34;socket() error&#34;);
  }

  memset(&amp;serv_addr, 0, sizeof(serv_addr));
  serv_addr.sin_family = AF_INET;
  serv_addr.sin_addr.s_addr = inet_addr(argv[1]);
  serv_addr.sin_port = htons(atoi(argv[2]));

  if (connect(sock, (struct sockaddr *)&amp;serv_addr, sizeof(serv_addr)) == -1)
  {
    error_handling(&#34;connect() error&#34;);
  }
  else
  {
    puts(&#34;connected....&#34;);
  }

  pid = fork();
  if (pid == 0)
  {
    write_routine(sock, buf);
  }
  else
  {
    read_routine(sock, buf);
  }

  close(sock);
  return 0;
}

void error_handling(char *message)
{
  fputs(message, stderr);
  fputc(&#39;\n&#39;, stderr);
  exit(1);
}

void read_routine(int sock, char *buf)
{
  while (1)
  {
    int str_len = read(sock, buf, BUF_SIZE);
    if (str_len == 0)
    {
      return;
    }
    buf[str_len] = 0;
    printf(&#34;Message from server : %s&#34;, buf);
  }
}

void write_routine(int sock, char *buf)
{
  while (1)
  {
    fgets(buf, BUF_SIZE, stdin);
    if (!strcmp(buf, &#34;q\n&#34;) || !strcmp(buf, &#34;Q\n&#34;))
    {
      shutdown(sock, SHUT_WR);
      return;
    }
    write(sock, buf, strlen(buf));
  }
}
```

## 进程间通信

### 进程间通信的基本概念

进程间通信（Inter Process Communication）意味着两个不同进程间可以交换数据，为了完成这一点，操作系统中应提供两个进程可以同时访问的内存空间。

#### 对进程通信的基本理解

只要有两个进程可以同时访问的内存空间，就可以通过此空间交换数据。但进程具有完全独立的内存结构。连通过`fork`函数创建的子进程也不会与父进程共享内存空间。因此，进程间通信只能通过其他特殊方法完成。

#### 通过管道实现进程间通信

![](/images/202402/3/39.png)

为了完成进程间通信，需要创建管道。管道并非属于进程的资源，而是和套接字一样，属于操作系统（也就不是`fork`函数的复制对象）。所以，两个进程通过操作系统提供的内存空间进行通信。创建管道的函数如下:

```C
##include &lt;unistd.h&gt;

int pipe(int filedes[2]);
// 成功返回0，失败返回-1
// filedes[0] 通过管道接收数据时使用的文件描述符，即管道出口
// filedes[1] 通过管道传输数据时使用的文件描述符，即管道入口
```

以长度为 2 的 int 数组地址值作为参数调用上述函数时，数组中存有两个文件描述符，它们将被用作管道的出口和入口。父进程调用该函数时将创建管道，同时获取对应于出入口的文件描述符，此时父进程可以读写同一管道。由于父进程的目的是与子进程进行数据交换，因此需要将入口或出口中的 1 个文件描述符传递给子进程。

```C
// pipe1.c
##include &lt;stdio.h&gt;
##include &lt;unistd.h&gt;

##define BUF_SIZE 30

int main(int argc, char *argv[])
{
  int fds[2];
  char str[] = &#34;Who are you?&#34;;
  char buf[BUF_SIZE];
  pid_t pid;

  pipe(fds);
  pid = fork();
  if (pid == 0)
  {
    write(fds[1], str, sizeof(str));
  }
  else
  {
    read(fds[0], buf, BUF_SIZE);
    puts(buf);
  }

  return 0;
}
```

![](/images/202402/3/40.png)

上例中的通信方法如下。父子进程都可以访问管道 I/O 路径，但子进程仅用输入路径，父进程仅用输出路径。

![](/images/202402/3/41.png)

#### 通过管道进程进程间双向通信

创建 2 个进程通过 1 个管道进程双向数据交换，通信方式如下:

![](/images/202402/3/42.png)

```C
// pipe2.c
##include &lt;stdio.h&gt;
##include &lt;unistd.h&gt;

##define BUF_SIZE 30

int main(int argc, char *argv[])
{
  int fds[2];
  char str1[] = &#34;Who are you?&#34;;
  char str2[] = &#34;Thank you for your message&#34;;
  char buf[BUF_SIZE];
  pid_t pid;

  pipe(fds);
  pid = fork();
  if (pid == 0)
  {
    write(fds[1], str1, sizeof(str1));
    sleep(2);
    read(fds[0], buf, BUF_SIZE);
    printf(&#34;Child proc output : %s\n&#34;, buf);
  }
  else
  {
    read(fds[0], buf, BUF_SIZE);
    printf(&#34;Parent proc output : %s\n&#34;, buf);
    write(fds[1], str2, sizeof(str2));
    sleep(3);
  }

  return 0;
}
```

运行结果:

![](/images/202402/3/43.png)

向管道传递数据时，先读的进程会把数据取走。简而言之，数据进入管道后称为无主数据。通过`read`函数先读取数据的进程将得到数据，即使是该进程将数据传到了管道。

只用 1 个管道进行双向通信并非易事。为了实现这点，程序需要预测并控制运行流程，这在每种系统中都不同，可以视为不可能完成的任务。我们可以通过创建 2 个管道进行双向通信。各自负责不同的数据流动即可。

![](/images/202402/3/44.png)

```C
##include &lt;stdio.h&gt;
##include &lt;unistd.h&gt;

##define BUF_SIZE 30

int main(int argc, char *argv[])
{
  int fds1[2], fds2[2];
  char str1[] = &#34;Who are you?&#34;;
  char str2[] = &#34;Thank you for your message&#34;;
  char buf[BUF_SIZE];
  pid_t pid;

  pipe(fds1);
  pipe(fds2);
  pid = fork();
  if (pid == 0)
  {
    write(fds1[1], str1, sizeof(str1));
    read(fds2[0], buf, BUF_SIZE);
    printf(&#34;Child proc output : %s\n&#34;, buf);
  }
  else
  {
    read(fds1[0], buf, BUF_SIZE);
    printf(&#34;Parent proc output : %s\n&#34;, buf);
    write(fds2[1], str2, sizeof(str2));
    sleep(3);
  }

  return 0;
}
```

![](/images/202402/3/45.png)

### 运用进程间通信

#### 保存消息的回声服务器端

扩展`echo_mpserv.c`，将回声客户端传输得的字符串按序保存到文件中。

我们可以将该任务委托给另外的进程。换言之，另行创建进程，从向客户端提供服务的进程读取字符串信息。当然，该过程中需要创建用于接收数据的管道。

```C
// echo_storeserv.c
##include &lt;stdio.h&gt;
##include &lt;stdlib.h&gt;
##include &lt;string.h&gt;
##include &lt;unistd.h&gt;
##include &lt;signal.h&gt;
##include &lt;sys/wait.h&gt;
##include &lt;arpa/inet.h&gt;
##include &lt;sys/socket.h&gt;

##define BUF_SIZE 30
void error_handling(char *message);
void read_childproc(int sig);

int main(int argc, char *argv[])
{
  int serv_sock, clnt_sock;
  struct sockaddr_in serv_adr, clnt_adr;
  int fds[2];
  pid_t pid;
  struct sigaction act;
  socklen_t adr_sz;
  int str_len, state;
  char buf[BUF_SIZE];
  if (argc != 2)
  {
    printf(&#34;Usage : %s &lt;port&gt;\n&#34;, argv[0]);
    exit(1);
  }

  act.sa_handler = read_childproc;
  sigemptyset(&amp;act.sa_mask);
  act.sa_flags = 0;
  state = sigaction(SIGCHLD, &amp;act, 0);
  serv_sock = socket(PF_INET, SOCK_STREAM, 0);
  memset(&amp;serv_adr, 0, sizeof(serv_adr));
  serv_adr.sin_family = AF_INET;
  serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
  serv_adr.sin_port = htons(atoi(argv[1]));

  if (bind(serv_sock, (struct sockaddr *)&amp;serv_adr, sizeof(serv_adr)) == -1)
  {
    error_handling(&#34;bind() error&#34;);
  }

  if (listen(serv_sock, 5) == -1)
  {
    error_handling(&#34;listen() error&#34;);
  }

  pipe(fds);
  pid = fork();
  if (pid == 0)
  {
    FILE *fp = fopen(&#34;echomsg.txt&#34;, &#34;wt&#34;);
    char msgbuf[BUF_SIZE];
    int i, len;
    for (i = 0; i &lt; 10; i&#43;&#43;)
    {
      len = read(fds[0], msgbuf, BUF_SIZE);
      fwrite((void *)msgbuf, 1, len, fp);
    }
    fclose(fp);
    return 0;
  }

  while (1)
  {
    adr_sz = sizeof(clnt_adr);
    clnt_sock = accept(serv_sock, (struct sockaddr *)&amp;clnt_adr, &amp;adr_sz);
    if (clnt_sock == -1)
    {
      continue;
    }
    else
    {
      puts(&#34;new client connected...&#34;);
    }

    pid = fork();
    if (pid == -1)
    {
      close(clnt_sock);
      continue;
    }

    if (pid == 0) // 子进程运行区域
    {
      close(serv_sock);
      while ((str_len = read(clnt_sock, buf, BUF_SIZE)) != 0)
      {
        write(clnt_sock, buf, str_len);
        write(fds[1], buf, str_len);
      }
      close(clnt_sock);
      puts(&#34;client disconnected...&#34;);
      return 0;
    }
    else
    {
      close(clnt_sock);
    }
  }
  close(serv_sock);
  return 0;
}

void read_childproc(int sig)
{
  pid_t pid;
  int status;
  pid = waitpid(-1, &amp;status, WNOHANG);
  printf(&#34;removed proc id %d \n&#34;, pid);
}

void error_handling(char *message)
{
  fputs(message, stderr);
  fputc(&#39;\n&#39;, stderr);
  exit(1);
}
```

## I/O 复用

## 多种 I/O 函数

## 多播与广播

## 套接字和标准 I/O

## 关于 I/O 流分离的其他内容

## 由于 select 和 epoll

## 多线程服务器端的实现

## Windows 平台下的线程的使用

## Windows 中的线程同步

## 异步通知的 I/O 模型

## 重叠 I/O 模型

## 制作 HTTP 服务器端

## 进阶内容

## 推荐

Windows Sockets 2: https://learn.microsoft.com/en-us/windows/win32/api/_winsock/

《计算机网络 自顶向下》

## 参考

《TCP/IP 网络编程》


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/tcp-ip%E7%BD%91%E7%BB%9C%E7%BC%96%E7%A8%8B/  

