# TCP/IP网络编程


- **2024/1/17 更新**: 增加**进程间通信**

<!--more-->

## 第 1 章 理解网络编程和套接字

### 理解网络编程和套接字

网络编程中接受连接请求的套接字创建过程如下:

1. 调用`socket`函数创建套接字（购买电话机）
2. 调用`bind`函数分配 IP 地址和端口号（分配电话号码）
3. 调用`listen`函数转为可接收请求和状态（连接电话线）
4. 调用`accpet`函数受理连接请求（接听电话）

客户端程序只有“调用 socket 函数创建套接字”和“调用 connect 函数向服务器发送连接请求”两个步骤。

### 基于 Linux 的文件操作

对 Linux 而言，socket 操作与文件操作没有区别，socket 被认为是文件的一种，因此在网络数据传输过程中自然可以使用文件 I/O 的相关函数。Windows 和 Linux 不同，区分二者。

文件描述符只不过是为了方便称呼操作系统创建的文件或套接字而赋予的数而已。文件描述符有时也称为句柄，但“句柄”主要是 Windows 中的术语。

在项目中，为了给基本数据类型赋予别名，一般会添加大量的`typedef`声明。为了与程序员定义的新数据类型加以区分，操作系统定义的数据类型会添加后缀`_t`，例如`size_t`、`ssize_t`等。

文件描述符从 3 开始由小到大顺序编号，因为 0、1、2 分配给标准 I/O 的描述符。

![](/images/202402/3/d9ac5694316f677dcdc6de93beaaddbf_MD5.jpeg)

在 Linux 下我们使用`read`和`write`函数对 socket 进行读取和写入。

### 基于 Windows 平台的实现

Windows 套接字（简称 Winsock）大部分是参考 BSD 系列的 UNIX 套接字设计的。

为了在 Windows 基础上开发网络程序，需要做如下准备。

- 导入头文件`winsock2.h`
- 链接`ws2_32.lib`库

![](/images/202402/3/b21e54db2bbb6f803a4dbb10777ef3e1_MD5.jpeg)

Winsock 编程时必须首先调用`WSAStartup`函数，设置程序中用到的 Winsock 版本，并初始化相应版本的库。

注销该库使用如下函数:

```C++
##include <iostream>
##include <WinSock2.h>

int main()
{
 WSADATA wsaData;
 if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
  std::cout << "WSAStartup ERROR!" << std::endl;
 }
 WSACleanup();
 return 0;
}
```

在 Windows 中使用`send`和`recv`函数进行发送和收取。

## 第 2 章 套接字类型与协议设置

协议是计算机对话使用的通信规则。简而言之，协议就是为了完成数据交换而定好的约定。

```C
##include <sys/socket.h>

int socket(int domain, int type, int protocol);

// 成功返回文件描述符，失败时返回-1
```

- `domain`套接字使用的协议族信息
- `type`套接字数据传输类型信息
- `protocol`计算机间通信中使用的协议信息

### 协议族

套接字通信中的协议有一些分类，通过`socket`函数的第一个参数传递套接字中使用的协议分类信息。

![](/images/202402/3/75b57b9ff133e37e431da732ffaabe26_MD5.jpeg)

### 套接字类型

套接字类型指的是套接字的数据传输方式，通过`socket`函数的第二个参数传递，只有这样才能决定创建的套接字的数据传输方式。为什么通过第一个参数传递了协议族信息，还要决定数据传输方式？这是因为决定了协议族并不能同时决定数据传输方式，换而言之，`socket`函数第一个参数`PF_INET`协议族中也存在多种数据传输方式。

#### 面向连接的套接字（SOCK_STREAM）

![](/images/202402/3/9a3faa092b5cf00421bc789c4d3fe6fc_MD5.jpeg)

上图的数据（糖果）传输方式特征整理如下：

- 传输过程中数据不会消失
- 按序传输数据
- 传输的数据不存在数据边界（Boundary）（比如，集满 100 个才打包一次）

> 存在数据边界意味着接收数据的次数应和传输次数相同。

传输端和接收端各有 1 名工人，意味着套接字连接必须一一对应。

可靠的、按序传递的、基于字节的面向连接的数据传输方式的套接字。（传送带传输，收和发套接字都有缓存，多次`write`可能只需要一次`read`，即二者的次数可以不等，传输的数据不存在数据边界）

#### 面向消息的套接字（SOCK_DGRAM）

![](/images/202402/3/a70da8094f1458296fed88d0b5212d8e_MD5.jpeg)

上图中摩托车快递包括（数据）传输方式如下：

- 强调快速传输而非传输顺序
- 传输的顺序可能丢失也可能损毁
- 传输的数据有数据边界
- 限制每次传输的数据大小

不可靠的、不按序传递的、以数据的高速传递为目的的套接字（摩托车传输，发一次得收一次，传输的数据存在数据边界）。

### 协议的最终选择

`socket`函数的前两个参数传递了协议族的信息和套接字数据传输方式，这些信息还不足以决定采用的协议吗？为什么还需要传递第 3 个参数？

前两个参数即可创建所需套接字。所以大部分情况下可以向第三个参数传递 0，除非遇到以下情况:

> 同一个协议族中存在多个传输方式相同的协议

数据传输方式相同，但协议不同。此时需要通过第三个参数具体指定协议信息。

比如，创建“IPv4 协议族面向连接的套接字”。

参数`PF_INET`指 IPv4 网络协议族，`SOCK_STREAM`是面向连接的数据传输。满足这两个条的协议只有`IPPROTO_TCP`，这种套接字称为 TCP 套接字。

```C++
int tcp_socket = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP);
```

再比如，创建“IPv4 协议族面向消息的套接字”。

满足上述条件的协议只有`IPPROTO_UDP`，这种套接字称为 UDP 套接字。

```C++
int udp_socket = socket(PF_INET, SOCKET_STREAM, IPPROTO_UDP);
```

## 第 3 章 地址族与数据序列

### 分配给套接字的 IP 地址和端口号

IP 是 Internet Protocol（网络协议）的简写，是为收发网络数据而分配给计算机的值。端口号并非赋予计算机的值，而是为**区分**程序中创建的**套接字**而分配给套接字的序号。

#### 网络地址（Internet Address）

为让计算机连接到网络并收发数据，需向其分配 IP 地址。IP 地址分为两类。

- IPv4（Internet Protocol version 4） 4 字节地址族
- IPv6（Internet Protocol version 6） 16 字节地址族

![](/images/202402/3/ba0b5e44179ec23bbfeae541aee00d1a_MD5.jpeg)

网络地址（网络 ID）是为区分网络而设置的一部分 IP 地址。传输数据时，并非一开始就浏览所有 4 字节 IP 地址，进而找到目标主机；而是仅浏览 4 字节 IP 地址的网络地址，向把数据传到网络。网络（构成网络的路由器（Router）或交换机（Switch））接到数据后，浏览传输数据的主机地址（主机 ID）并将数据传给目标计算机。

![](/images/202402/3/717720ccfbe784056763a16b6d4ace77_MD5.jpeg)

> 构建网络需要一种物理设备完成外网与本网主机之间的数据交换，这种设备便是路由器或交换机。它们也是一种计算机，只不过为了特殊目的而设计运行的，因而有了别名。我们可在自己的计算机中安装适当的软件，也可以将其作为交换机。交换机的功能比路由器简单一些，实际差别不大。

#### 网络地址分类与主机地址边界

只需通过 IP 地址的第一个字节即可判断网络地址占用的字节数:

![](/images/202402/3/4be9a9031760daf059eb56259af2e843_MD5.jpeg)

#### 用于区分套接字的端口号

计算机中一般配有 NIC（Network Interface Card，网络接口卡）数据传输设备。通过 NIC 向计算机内部传输数据时会用到 IP。操作系统负责把传递到内部的数据适当分配给套接字，这时就要利用端口号。也就是说，通过 NIC 收到的数据内有端口号，操作系统参考此端口号把数据传输给相应端口的套接字。

![](/images/202402/3/adb4d8c6b2871295a337082440a156f0_MD5.jpeg)

端口号是在同意操作系统内为区分不同套接字而设置的，因此无法将一个端口号分配给不同套接字。端口号由 16 位构成，可分配的端口号范围是 0~65535。但 0~1023 是知名端口号（Wll-known PORT），一般分配给特定应用程序。TCP 套接字和 UDP 套接字不会公用端口号，所以允许重复。

**数据传输目标地址同时包含 IP 地址和端口号，只有这样，数据才会被传输到最终的目的应用程序（应用程序套接字）。**

### 地址信息的表示

#### 表示 IPv4 地址的结构体

```C++
struct sockaddr_in {
  sa_family_t sin_family; // 地址族(Address Family)
  uint16_t sin_port; // 16位TCP/UDP端口号
  struct in_addr sin_addr; // 32位IP地址
  char sin_zero[8]; // 不使用
}
```

`in_addr`定义如下:

```C++
struct in_addr {
  In_addr_t s_addr; // 32位IPv4地址
};
```

![](/images/202402/3/d051ea7fb947bad7b928b0de84134acf_MD5.jpeg)

### 网络字节序与地址转换

#### 字节序（Order）与网络字节序

CPU 向内存保存数据的方式有两种:

- 大端序（Big Endian）: 高位字节放到低位地址
- 小端序（Little Endian）: 高位字节放到高位地址

主流的 Intel 系列 CPU 以小端序方式保存数据。

在通过网络传输数据时约定统一的方式，称为网络字节序（Network Byte Order），非常简单——**统一为大端序**。即，先把数据数组转化为大端序格式再进行网络传输。

#### 字节序转换（Endian Conversions）

![](/images/202402/3/c82b23d25b4ea19ece000376952f7188_MD5.jpeg)

```c
#include <stdio.h>
#include <arpa/inet.h>



int main(int argc, char *argv[]){

  unsigned short host_port = 0x1234;

  unsigned short net_port;

  unsigned long host_addr = 0x12345678;

  unsigned long net_addr;



  net_port = htons(host_port);

  net_addr = htonl(host_addr);

  printf("Host ordered port : %#x \n", host_port);

  printf("Network ordered port : %#x \n", net_port);

  printf("Host ordered address : %#lx \n", host_addr);

  printf("Network ordered address : %#lx \n", net_addr);

  return 0;

}
```

![](/images/202402/3/c52d4349940012c9bec4877a5c811fc9_MD5.jpeg)

> 数据传输采用网络字节序，传输前会进行转换，接收数据也会进行转换，这个过程是自动的。除了向`sockaddr_in`结构体变量填充数据外，其他情况无需考虑字节序问题。

### 网络地址的初始化与分配

#### 将字符串信息转换为网络字节序的整数型

使用`inet_addr`函数可以将字符串形式的 IP 地址转换为 32 为整型数据。

```C++
##include<arpa/inet.h>

in_addr_t inet_addr(const char* string);
// 成功返回32位大端序整型值，失败时返回INADDR_NONE。

int inet_aton(const char* string, struct in_addr* addr);
// 成功返回1，失败返回0

char* inet_ntoa(struct in_addr adr);
// 成功返回转换的字符串地址值，失败时返回-1
```

若用`inet_addr`函数，需要将转换后的 IP 地址代入`sockaddr_in`结构体中声明的`in_addr`结构体变量。而`inet_aton`函数则不需要此过程。若传递`in_addr`结构体变量地址，函数会自动把结果填入该结构体变量。

## 第 4 章 基于 TCP 的服务器端/客户端(1)

### 理解 TCP 和 UDP

根据数据传输方式的不同，基于网络协议的套接字一般分为 TCP 套接字和 UDP 套接字。因为 TCP 套接字是面向连接的，因此又称基于流（stream）的套接字。

**链路层**

专门定义 LAN、WAN、MAN 等网络标准。

**IP 层**

向目标传输数据需要经过哪条路径？在 IP 层解决这个问题。

IP 协议本身是面向消息、不可靠的协议。每次传输数据时会帮我们选择路径，但并不一致。如果传输中发生路径错误，则选择其他路径。但如果发生数据丢失或错误，则无法解决。

**TCP/UDP 层**

TCP 可以保证可靠的数据传输，但它发送数据以 IP 层为基础。IP 只关注 1 数据包（数据传输的基本单位）的传输过程。因此，即使传输多个数据包，每个数据包也是由 IP 层实际传输的，也就是说传输顺序以及传输本身是不可靠的。

TCP 可以在数据交换过程中确认对方已收到数据，并重传丢失的数据，从而保证了通信的可靠性。

**应用层**

上述内容是套接字通信过程中自动处理的。选择数据传输路径、数据确认过程都被隐藏到套接字内部，从而将开发者从细节中解放出来。

### 实现基于 TCP 的服务器端/客户端

#### TCP 服务器端的默认函数调用顺序

![](/images/202402/3/3ade83d343edb828972950abefd45222_MD5.jpeg)

#### 进入等待连接请求状态

我们已调用`bind`函数给套接字分配了地址，接下来就要通过`listen`函数进入等待连接请求状态。**只有调用了`listen`函数**，客户端才能进入可发出连接请求的状态。这时客户端才能调用`connect`函数（若提前调用将发生错误）。

```C++
##include <sys/socket.h>

int listen(int sock, int backlog);

// 成功返回0，失败返回-1
// sock 希望进入等待连接状态的套接字文件描述符，传递的描述符套接字参数成为服务器端套接字（监听套接字，或者说是门卫）
// backlog 连接请求等待队列的长度，若为5，则队列长度为5，表示最多使5个连接请求进入队列
```

![](/images/202402/3/0ee9e872edce692147e59388f817455a_MD5.jpeg)

#### 受理客户端连接请求

服务器端套接字是做门卫的。如果与客户端的数据交换使用门卫，那谁来守门呢？因此需要另外一个套接字，但没必要亲自创建。`accpet`函数将自动创建套接字，并连接到发起请求的客户端。

```C++
##include <sys/socket.h>

int accpet(int sock, struct sockaddr* addr, socklen_t* addrlen);

// 成功时返回创建的套接字文件描述符，失败返回-1
// sock 服务器套接字的文件描述符
// addr 保存发起连接请求的客户端地址信息的变量地址值，调用函数后向传递来的地址变量参数填充客户端地址信息
// addrlen 第二个参数addr结构体的长度，但是存有长度的变量地址。函数调用完成后，该变量即被填入客户端地址长度
```

![](/images/202402/3/5961770d7719159030e1ff26f1768cc7_MD5.jpeg)

#### TCP 客户端的默认函数调用顺序

![](/images/202402/3/4e5d794ceb5c2e4fa22b619b74812c52_MD5.jpeg)

服务器调用`listen`函数后创建连接请求等待队列，之后客户端即可请求连接。通过如下函数即可发起请求连接:

```C++
##include <sys/socket.h>

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

> 客户端套接字何时、何地、如何分配地址呢？调用`connect`函数时。操作系统，准确地说是在内核中。IP 用主机的 IP，端口随机。客户端的 IP 地址和端口在调用`connect`函数时自动分配，无需调用`bind`函数进行分配。

#### 基于 TCP 和服务器端/客户端函数调用关系

![](/images/202402/3/4bda3f6d62f915cb3d24a7b7c313e7c6_MD5.jpeg)

服务器端创建套接字后连续调用`bind`和`listen`函数进入等待状态，客户端通过调用`connect`函数发起连接请求。客户端只能等到服务器端调用`listen`函数后才能调`connect`函数。客户端调用`connect`函数前，服务器端有可能率先调用`accpet`函数。此时服务器端在调用`accpet`函数时进入阻塞状态，直到客户端调用`connect`函数为止。

### 实现迭代服务器端/客户端

#### 实现迭代服务器端

插入循环语句反复调用`accept`函数。

![](/images/202402/3/4ccd444887bbd97199bbcbacddc137db_MD5.jpeg)

从上图可看出，调用`accept`函数后紧接着调用 I/O 相关的`read`和`write`函数，之后调用`close`函数。这并非针对服务器端套接字，而是针对`accept`函数调用时创建的套接字。

调用`close`函数就意味着结束了针对某一客户端的服务。此时如果还想服务于其他客户端，就要重新调用`accpet`函数。同一时刻只能服务于一个客户端，学完进程和线程后，就可以编写同时服务多个客户端的服务器了。

#### 迭代回声服务器/客户端

![](/images/202402/3/fcbe8d276e41de657afdde3314332db5_MD5.jpeg)

### 基于 Windows 的实现

#### 基于 Windows 的回声服务器端

```C++

##include <iostream>
##include <cstdlib>
##include <cstring>
##include <winsock2.h>
##include <cstdio>

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
  printf("Usage : %s <port>\n", argv[0]);
  exit(1);
 }

 if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
  ErrorHandling("WSAStartup() error!");
 hServerSocket = socket(PF_INET, SOCK_STREAM, 0);
 if (hServerSocket == INVALID_SOCKET) ErrorHandling("socket() error!");
 memset(&serverAddr, 0, sizeof(serverAddr));
 serverAddr.sin_family = AF_INET;
 serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);
 serverAddr.sin_port = htons(atoi(argv[1]));

 if (bind(hServerSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
  ErrorHandling("bind() error!");
 }

 if (listen(hServerSocket, 5) == SOCKET_ERROR) {
  ErrorHandling("listen() error!");
 }

 clientAddrSize = sizeof(clientAddr);

 for (i = 0; i < 5; i++) {
  hClientSocket = accept(hServerSocket, (sockaddr*)&clientAddr, &clientAddrSize);
  if (hClientSocket == -1) ErrorHandling("accept() error!");
  else std::cout << "Connected client " << i + 1 << "\n";
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
 fputc('\n', stderr);
 exit(1);
}
```

#### 基于 Windows 的回声客户端

```C++
##include <iostream>
##include <cstdlib>
##include <cstring>
##include <winSock2.h>
##include <cstdio>

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
  printf("Usage : %s <IP> <port>\n", argv[0]);
  exit(1);
 }

 if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
  ErrorHandling("WSAStartup() error!");

 hSocket = socket(PF_INET, SOCK_STREAM, 0);
 if (hSocket == INVALID_SOCKET) ErrorHandling("socket() error");
 memset(&serverAddr, 0, sizeof(serverAddr));
 serverAddr.sin_family = AF_INET;
 serverAddr.sin_addr.s_addr = inet_addr(argv[1]);
 serverAddr.sin_port = htons(atoi(argv[2]));

 if (connect(hSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
  ErrorHandling("connect() error!");
 }

 while (1)
 {
  fputs("Input message (Q to quit): ", stdout);
  fgets(message, BUF_SIZE, stdin);
  if (!strcmp(message, "q\n") || !strcmp(message, "Q\n")) break;
  send(hSocket, message, strlen(message), 0);
  strLen = recv(hSocket, message, BUF_SIZE - 1, 0);
  message[strLen] = 0;
  printf("Message from server : %s", message);
 }
 closesocket(hSocket);
 WSACleanup();
 return 0;
}

void ErrorHandling(const char* message) {
 fputs(message, stderr);
 fputc('\n', stderr);
 exit(1);
}
```

## 第 5 章 基于 TCP 的服务器端/客户端(2)

上一章的问题出在客户端的：

```c
    write(sock, message, strlen(message));

    str_len = read(sock, message, BUF_SIZE - 1);
```

### 回声客户端的完美实现

```C
##include <stdio.h>
##include <stdlib.h>
##include <string.h>
##include <unistd.h>
##include <arpa/inet.h>
##include <sys/socket.h>

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
    printf("Usage : %s <IP> <port> \n", argv[0]);
    exit(1);
  }

  sock = socket(PF_INET, SOCK_STREAM, 0);
  if (sock == -1)
  {
    error_handling("socket() error");
  }

  memset(&serv_addr, 0, sizeof(serv_addr));
  serv_addr.sin_family = AF_INET;
  serv_addr.sin_addr.s_addr = inet_addr(argv[1]);
  serv_addr.sin_port = htons(atoi(argv[2]));

  if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) == -1)
  {
    error_handling("connect() error");
  }
  else
  {
    puts("connected....");
  }

  while (1)
  {
    fputs("Input message (Q to quit): ", stdout);
    fgets(message, BUF_SIZE, stdin);
    if (!strcmp(message, "q\n") || !strcmp(message, "Q\n"))
    {
      break;
    }

    str_len = write(sock, message, strlen(message));
    recv_len = 0;
    while (recv_len < str_len)
    {
      recv_cnt = read(sock, &message[recv_len], BUF_SIZE - 1);
      if (recv_cnt == -1)
      {
        error_handling("read() error");
      }
      recv_len += recv_cnt;
    }
    message[recv_len] = 0;
    printf("Message from server : %s", message);
  }

  close(sock);

  return 0;
}

void error_handling(char *message)
{
  fputs(message, stderr);
  fputc('\n', stderr);
  exit(1);
}
```

### TCP 原理

#### TCP 套接字中的 I/O 缓冲

TCP 套接字的数据收发无边界。服务器端即使调用 1 次`write`函数传输 40 字节的数据，客户端也有可能通过 4 次`read`函数调用每次读取 10 字节。`write`函数调用后并非立即传输数据，`read`函数调用后也并非马上接收数据。`write`函数调用瞬间，数据将移至输出缓冲；`read`函数调用瞬间，从输入缓冲读取数据。

![](/images/202402/3/2642f4da7d817ed71466f034b87dfd03_MD5.jpeg)

如上图所示，调用`write`函数时，数据将移到输出缓冲，在适当的时候（不管是分别传送还是一次性传送）传向对方的输入缓冲。这时对方将调用`read`函数从输入缓冲读取数据。这些 I/O 缓冲特性可整理如下。

- I/O 缓冲在每个 TCP 套接字中单独存在
- I/O 缓冲在创建套接字时自动生成
- 即使关闭套接字也会继续传递输出缓冲中遗留的数据
- 关闭套接字将丢失输入缓冲中的数据

不会发生超过输入缓冲大小的数据传输，因为 TCP 会控制数据流。TCP 中有滑动窗口（Sliding Window）协议。数据收发也是如此，TCP 不会因为缓冲溢出而丢失数据。

> write 函数和 Windows 的 send 函数并不是在完成向对方主机的数据传输时返回，而是在数据移到输出缓冲时。TCP 会保证对输出缓冲数据的传输。

#### TCP 内部工作原理 1：与对方套接字的连接

TCP 套接字从创建到消失分为以下 3 步。

- 与对方套接字建立连接
- 与对方套接字进行数据交换
- 断开与对方套接字的连接

连接过程中实际交换的信息格式如下:

![](/images/202402/3/03db63f052c38bdfbe11a22cdeba2be4_MD5.jpeg)

该过程又称 Tree-way handhshaking（三次握手）。

#### TCP 内部工作原理 2：与对方主机的数据交换

![](/images/202402/3/bdd0559f68ad5b6822030de02ff6f2f4_MD5.jpeg)

ACK 号 -> SEQ 号 + 传递字节数 + 1

#### TCP 内部工作原理 3：断开与套接字的连接

![](/images/202402/3/2767fa5ee3643cfb9e1efead4c6fb115_MD5.jpeg)

数据包内的 FIN 表示断开连接。即双方各发送 1 次 FIN 消息后断开连接。该过程经历了 4 个阶段，因此又称四次握手（Four-way handshaking）。

### 基于 Windows 实现

服务器端`op_server.c`

```C++
##include <cstdio>
##include <cstdlib>
##include <iostream>
##include <WinSock2.h>
##include <cstring>

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
  printf("Usage : %s <port>\n", argv[0]);
  exit(1);
 }

 if (WSAStartup(MAKEWORD(2, 2), &wsData) != 0) ErrorHandling("WSAStartup() error!");

 serverSocket = socket(PF_INET, SOCK_STREAM, 0);
 if (serverSocket == INVALID_SOCKET) ErrorHandling("socket() error!");
 memset(&serverAddr, 0, sizeof(serverAddr));
 serverAddr.sin_family = PF_INET;
 serverAddr.sin_port = htons(atoi(argv[1]));
 serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);

 if (bind(serverSocket, (SOCKADDR*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
  ErrorHandling("bind() error!");

 if (listen(serverSocket, 5) == SOCKET_ERROR)
  ErrorHandling("listen() error!");

 clientAddrSize = sizeof(clientAddr);

 for (i = 0; i < 5; i++) {
  opndCount = 0;
  clientSocket = accept(serverSocket, (SOCKADDR*)&clientAddr, &clientAddrSize);
  recv(clientSocket, (char*)&opndCount, 1, 0);
  recvLen = 0;
  while ((opndCount * OPZS + 1) > recvLen) {
   recvCount = recv(clientSocket, opinfo, BUF_SIZE - 1, 0);
   recvLen += recvCount;
  }
  result = calculate(opndCount, (int*)opinfo, opinfo[recvLen - 1]);
  send(clientSocket, (char*)&result, sizeof(result), 0);
  closesocket(clientSocket);

 }

 closesocket(serverSocket);
 WSACleanup();
 return 0;
}


void ErrorHandling(const char* message) {
 fputs(message, stderr);
 fputc('\n', stderr);
 exit(1);
}

int calculate(int opnum, int opnds[], char op) {
 int result = opnds[0], i;
 switch (op) {
 case '+':
  for (i = 1; i < opnum; i++) result += opnds[i];
  break;
 case '-':
  for (i = 1; i < opnum; i++) result -= opnds[i];
  break;

 case '*':
  for (i = 1; i < opnum; i++) result *= opnds[i];
  break;
 }
 return result;
}
```

客户端`op_client.c`

```C++
##include <iostream>
##include <WinSock2.h>
##include <cstdlib>
##include <cstdio>

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
  printf("Usage : %s <IP> <port>\n", argv[0]);
  exit(1);
 }

 if (WSAStartup(MAKEWORD(2, 2), &wsData) != 0) {
  ErrorHandling("WSAStartup() error!");
 }

 hSocket = socket(PF_INET, SOCK_STREAM, 0);
 if (hSocket == INVALID_SOCKET) ErrorHandling("socket() error!");
 memset(&serverAddr, 0, sizeof(serverAddr));
 serverAddr.sin_addr.s_addr = inet_addr(argv[1]);
 serverAddr.sin_family = AF_INET;
 serverAddr.sin_port = htons(atoi(argv[2]));

 if (connect(hSocket, (SOCKADDR*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
  ErrorHandling("socket() error!");
 else
  puts("Connected ......");

 fputs("Operand count : ", stdout);
 scanf("%d", &opndCount);
 opmsg[0] = (char)opndCount;

 for (i = 0; i < opndCount; i++) {
  printf("Operand %d : ", i + 1);
  scanf("%d", (int*)&opmsg[i * OPSZ + 1]);
 }

 fgetc(stdin);
 fputs("Operator : ", stdout);
 scanf("%c", &opmsg[opndCount * OPSZ + 1]);
 send(hSocket, opmsg, opndCount * OPSZ + 2, 0);
 recv(hSocket, (char*)&result, RLT_SIZE, 0);
 printf("Operation result : %d \n", result);
 closesocket(hSocket);
 WSACleanup();
 return 0;
}

void ErrorHandling(const char* message) {
 fputs(message, stderr);
 fputc('\n', stderr);
 exit(1);
}

```

### 推荐

File Transfer using TCP Socket in C: <https://idiotdeveloper.com/file-transfer-using-tcp-socket-in-c/>

## 第 6 章 基于 UDP 的服务器端/客户端

### 理解 UDP

#### UDP 内部工作原理

![](/images/202402/3/cd660fef8b97c2f2dde24447ea99cdcf_MD5.jpeg)

### 实现基于 UDP 的服务器端/客户端

#### UDP 中的服务器端和客户端没有连接

UDP 服务器端和客户端不像 TCP 那样在连接状态下交换数据，因此与 TCP 不同，无需经过连接过程。即，不必调用 TCP 连接过程中调用的`listen`函数和`accept`函数。UDP 中只有创建套接字的过程和数据交换过程。

#### UDP 服务器端和客户端均只需 1 个套接字

TCP 中，套接字之间应该是一对一的关系。若要向 10 个客户端提供服务，则除了守门的服务器套接字外，还需要 10 个服务器端套接字。但在 UDP 中，不管是服务器端还是客户端都只需要 1 个套接字。

只需 1 个 UDP 套接字就可以向任意主机传输数据（类似收发信件的邮筒）。只需 1 个 UDP 套接字就能和多台主机通信。

UDP 程序中，调用`sendto`函数传输数据前应完成对套接字的地址分配工作，因此调用`bind`函数。`bind`函数不区分 TCP 和 UDP。如果调用`sendto`函数时发现尚未分配地址信息，则在首次调用`sendto`函数时相应套接字自动分配 IP 和端口。且此时分配的地址一直保留到程序结束为止。

### 基于 Windows 实现

```C++
##include <winsock2.h>

int sendto(SOCKET s, const char* buf, int len, int flags, const struct sockaddr* to, int tolen);
// 成功返回传输的字节数，失败返回SOCKET_ERROR

int recvfrom(SOCKET s, char* buf, int len, int flag, struct sockaddr* from, int* fromlen);
// 成功返回接收的字节数，失败返回SOCKET_ERROR
```

## 第 7 章 优雅地断开套接字连接

### 基于 TCP 的半关闭

#### 套接字和流（Stream）

两台主机通过套接字建立连接后进入可交换数据的状态，又称“流形成的状态”。也就是把建立套接字后可交换数据的状态看作一种流。此处的流可以比作水流。水朝着一个方向流动，同样，在套接字的流中，数据也只能向一个方向流动。为了进行双向通信，就需要如下图所示的 2 个流。

![](/images/202402/3/730f34d041c1706160efda6b652f14cd_MD5.jpeg)
一旦两台主机建立了套接字连接，每个主机机会拥有单独的输入流和输出流。其中一个主机的输入流与一台主机的输出流相连，而输出流则与另一主机的输入流相连。优雅地断开连接方式指的是只断开其中一个流，而非同时断开两个流。Linux 的`close`和 Windows 的`closesocket`函数将同时断开这两个流，因此不够优雅。

#### 针对优雅断开的`shutdown`函数

`shutdown`函数可以用来关闭其中 1 个流。

```C++
##include <sys/socket.h>

int shutdown(int sock, int howto);

// 成功返回0，失败返回-1
```

调用上述函数时，第二个参数决定断开连接的方式，其可能值如下:

- `SHUT_RD`: 断开输入流
- `SHUT_WR`: 断开输出流
- `SHUT_RDWR`: 同时断开 I/O 流

### 基于 Windows 的实现

Windows 平台调用的`shutdown`函数传递的参数略有不同。

```C++
##include <winsock2.h>

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

```C++
##include <WinSock2.h>
##include <cstdio>
##include <cstdlib>

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
  printf("Usage : %s <port>\n", argv[0]);
  exit(1);
 }

 if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) ErrorHandling("WSAStartup() error!");

 fp = fopen("file_server_win.cpp", "rb");
 serverSocket = socket(PF_INET, SOCK_STREAM, 0);
 memset(&serverAddr, 0, sizeof(serverAddr));
 serverAddr.sin_family = AF_INET;
 serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);
 serverAddr.sin_port = htons(atoi(argv[1]));

 bind(serverSocket, (SOCKADDR*)&serverAddr, sizeof(serverAddr));
 listen(serverSocket, 5);

 clientAddrSize = sizeof(clientAddr);
 clientSocket = accept(serverSocket, (SOCKADDR*)&clientAddr, &clientAddrSize);

 while (true) {
  readCount = fread((void*)buf, 1, BUF_SIZE, fp);
  if (readCount < BUF_SIZE) {
   send(clientSocket, (char*)&buf, readCount, 0);
   break;
  }
  send(clientSocket, (char*)&buf, BUF_SIZE, 0);
 }

 shutdown(clientSocket, SD_SEND);
 recv(clientSocket, (char*)buf, BUF_SIZE, 0);
 printf("Message from client : %s \n", buf);
 fclose(fp);
 closesocket(clientSocket);
 closesocket(serverSocket);
 WSACleanup();
 return 0;
}


void ErrorHandling(const char* message) {
 fputs(message, stderr);
 fputc('\n', stderr);
 exit(1);
}
```

客户端`file_client_win.cpp`:

```C++
##include <iostream>
##include <WinSock2.h>
##include <cstdlib>
##include <cstdio>

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
  printf("Usage : %s <IP> <port>\n", argv[0]);
  exit(1);
 }

 if (WSAStartup(MAKEWORD(2, 2), &wsData) != 0) {
  ErrorHandling("WSAStartup() error!");
 }

 fp = fopen("receive.dat", "wb");


 hSocket = socket(PF_INET, SOCK_STREAM, 0);
 if (hSocket == INVALID_SOCKET) ErrorHandling("socket() error!");
 memset(&serverAddr, 0, sizeof(serverAddr));
 serverAddr.sin_addr.s_addr = inet_addr(argv[1]);
 serverAddr.sin_family = AF_INET;
 serverAddr.sin_port = htons(atoi(argv[2]));

 if (connect(hSocket, (SOCKADDR*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
  ErrorHandling("socket() error!");
 else
  puts("Connected ......");

 while ((readCount = recv(hSocket, buf, BUF_SIZE, 0)) != 0)
 {
  fwrite((void*)buf, 1, readCount, fp);
 }

 puts("Received file data");
 send(hSocket, "Thank you", 10, 0);
 fclose(fp);
 closesocket(hSocket);
 WSACleanup();
 return 0;
}

void ErrorHandling(const char* message) {
 fputs(message, stderr);
 fputc('\n', stderr);
 exit(1);
}

```

## 第 8 章 域名及网络地址

### 域名系统

DNS（Domain Name System，域名系统）是对 IP 地址和域名进行相互转换的系统，其核心是 DNS 服务器。

## 第 9 章 套接字的多种可选项

## 第 10 章 多进程服务器端

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

![](/images/202402/3/80e083338bb60d84651965a846d90f5d_MD5.jpeg)

通过 ps 命令可以查看当前运行的所有进程。

#### 通过调用 fork 函数创建进程

```C++
##include <unistd.h>

pid_t fork(void);

// 成功返回进程ID，失败返回-1
```

`fork`函数将创建调用的进程副本。即并非根据完全不同的程序创建进程，而是复制正在运行的、调用`fork`函数的进程。两个进程都将执行`fork`函数调用后的语句（准确说是在`fork`函数返回后）。但因为通过同一个进程、复制相同的内存空间，之后的程序流要根据`fork`函数的返回值加以区分。`fork`函数的特点如下:

- 父进程: `fork`函数返回子进程 ID
- 子进程: `fork`函数返回 0

这里的父进程（Parent Process）指的是原进程，即调用`fork`函数的主体，而子进程（Child Process）是通过父进程调用`fork`函数复制出的进程。

![](/images/202402/3/8375b14a87ae0a7902efe5acf1a52a87_MD5.jpeg)

从上图可以看到，父进程调用`fork`函数的同时复制出子进程，并分别得到`fork`函数的返回值。在父进程和子进程中`gval`和`lval`互不影响。因此`fork`函数调用后分成了完全不同的进程，只是二者共享同一代码而已。

```C++
##include <stdio.h>
##include <unistd.h>

int gval = 10;

int main(int argc, char* argv[]){
 pid_t pid;
 int lval = 20;
 gval++, lval+=5;

 pid = fork();
 if (pid == 0)
  gval += 2, lval += 2;
 else
  gval -= 2, lval -= 2;
 if (pid == 0)
  printf("Child Proc : [%d, %d] \n", gval, lval);
 else
  printf("Parent Proc : [%d, %d] \n", gval, lval);
 return 0;
}
```

![](/images/202402/3/af64c2d370865eb20def2ea480d5e532_MD5.jpeg)

### 进程和僵尸进程

进程销毁和进程创建同等重要。如果未认真进程销毁，它们将变成僵尸进程。

#### 僵尸（Zombie）进程

进程完成工作后（执行完`main`函数中的程序后）应被销毁，但有时这些进程将变成僵尸进程，占用系统中的重要资源。这种状态下的进程称作“僵尸进程”，也是给系统带来负担的原因之一。

#### 产生僵尸进程的原因

调用`fork`函数产生子进程的终止方式:

- 传递参数并调用`exit`函数
- `main`函数中执行`return`语句并返回值

向`exit`函数传递的参数值和`main`函数的`return`语句返回的值都会传递给操作系统。而操作系统不会销毁子进程，直到把这些值传递给产生该子进程的父进程。处在这种状态下的进程就是僵尸进，将子进程变成僵尸进程的正是操作系统。那么如何销毁僵尸进程呢？向父进程传递`exit`函数的参数值或`return`的返回值即可。如何向父进程传递这些值呢？操作系统不会主动传递给父进程，只有父进程主动发起请求（函数调用）时，操作系统才会传递该值。换言之，如果父进程未主动要求获得子进程的结束状态值，操作系统将一直保存，并让子进程长时间处于僵尸进程状态。

```C++
##include <stdio.h>
##include <unistd.h>

int main(int argc, char* argv[]){

 pid_t pid = fork();
 if (pid == 0) puts("Child Process");
 else {
  printf("Child Process ID : %d \n", pid);
  sleep(30); // Sleep 30 sec
 }
 if (pid == 0)
  puts("End Child Process");
 else
  puts("End Parent Process");
 return 0;
}
```

![](/images/202402/3/cb42e4e8d2c21256ce2ae5ed227567d6_MD5.jpeg)

#### 销毁僵尸进程 1：利用 wait 函数

为了销毁子进程，父进程应主动请求获取子进程的返回值。发起请求的方法有两种，其中之一就是调用如下函数。

```C++
##include <sys/wait.h>

pid_t wait(int* statloc);
// 成功返回终止的子进程ID，失败返回-1
```

调用此函数时如果已有子进程终止，那么子进程终止时传递的返回值（`exit`函数的参数值、`main`函数的`return`返回值）将保存到该函数的参数所指内存空间。但函数参数指向的单元中还包含其他信息，因此需要通过下列宏进行分离。

- `WIFEXITED`子进程正常终止时返回真（True）
- `WEXITSTATUS`返回子进程的返回值

向`wait`函数传递变量`status`的地址时，调用`wait`函数后应编写如下代码:

```C++
if (WIFEXITED(status)) // 是正常终止吗？
{
 puts("Normal termination!");
 printf("Child pass num: %d", WEXITSTATUS(status)); // 返回值是多少？
}

```

根据上述内容编写示例，此示例不会再让子进程变成僵尸进程。

```C++
##include <stdio.h>
##include <stdlib.h>
##include <unistd.h>
##include <sys/wait.h>

int main(int argc, char* argv[]){
  int status;
  pid_t pid = fork();
  if (pid == 0) {
    return 3;
  } else {
    printf("Child PID %d \n", pid);
    pid = fork();
    if (pid == 0) {
      exit(7);
    }
    else {
      printf("Child PID %d \n", pid);
      wait(&status);
      if (WIFEXITED(status)){
        printf("Child send one : %d\n", WEXITSTATUS(status));
      }
      wait(&status);
      if (WIFEXITED(status)){
        printf("Child send two : %d\n", WEXITSTATUS(status));
      }
      sleep(30);
    }
  }
  return 0;
}
```

![](/images/202402/3/36acb81fd92ad987b6d7e1046fe1b814_MD5.jpeg)

调用`wait`函数时，如果没有已终止的子进程，那么程序将阻塞（Blocking）直到有子进程终止，因此需谨慎调用该函数。

#### 销毁僵尸进程 2：使用 waitpid 函数

`wait`函数会引起程序阻塞，可以考虑调用`waitpid`函数。这是防止僵尸进程的第二种方法，也是防止阻塞的方法。

```C++
##include <sys/wait.h>

pid_t waitpid(pid_t pid, int* statloc, int options);
// 成功返回终止的子进程ID（或0），失败返回-1
// pid 等待终止的目标子进程ID，若传递-1，则与wait函数相同，可以等待任意子进程终止
// statloc 与wait函数的statloc参数具有相同含义
// options 传递头文件sys/wait.h中声明的常量WNOHANG，即使没有终止的子进程也不会进入阻塞状态，而是返回0并退出函数
```

示例如下:

```C++
##include <stdio.h>
##include <stdlib.h>
##include <unistd.h>
##include <sys/wait.h>

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
    while (!waitpid(-1, &status, WNOHANG))
    {
      sleep(3);
      puts("Sleep 3sec.");
    }

    if (WIFEXITED(status))
    {
      printf("Child send %d \n", WEXITSTATUS(status));
    }
  }
  return 0;
}
```

![](/images/202402/3/f01d0681df37aab5e11789fe5800d929_MD5.jpeg)

### 信号处理

我们已经直到子进程的创建及销毁方法，但还有一个问题没解决。

> 子进程究竟何时终止？调用`waitpid`函数后要无休止地等待吗？

父进程往往与子进程一样繁忙，因此不能只调用`waitpid`函数以等待子进程终止。

#### 向操作系统求助

子进程终止的识别主体是操作系统。如果操作系统能把子进程终止的消息告诉正忙于工作的父进程，将有助于构建高效的程序。

此时父进程暂时放下工作，处理子进程终止相关事宜。为了实现该想法，引入信号处理（Signal Handling）机制。此处的“信号”是在特定时间发生时由操作系统向进程发送的消息。为了响应该消息，执行与消息相关的自定义操作的过程“处理”或“信号处理”。

#### 信号与 signal 函数

信号注册函数，请求操作系统当子进程结束时调用某函数。

```C++
##include <signal>

void (*signal(int signo, void(*func)(int)))(int)
```

上述函数的返回值类型为函数指针。第一个参数为特殊情况信息，第二个参数为特殊情况下将要调用的函数的地址值（指针）。发生第一个参数代表的情况时，调用第二个参数所指的函数。可以在`signal`函数中注册的部分特殊情况和对应常数如下:

- `SIGALRM`: 已到通过调用`alarm`函数注册的时间
- `SIGNIT`: 输入`CTRL + C`
- `SIGCHLD`: 子进程终止

比如，编写调用`signal`函数完成“子进程终止则调用 myChild 函数”的请求，语句如下:

```C
signal(SIGCHILD, myChild);
```

以上就是信号注册过程。注册好信号后，发生注册信号时（注册的情况发生时），操作系统将调用该信号对应的函数。

先介绍`alarm`函数。

```C
##include <unistd.h>

unsigned int alarm(unsigned int seconds);

// 返回0或者以秒为单位的距SIGALRM信号发生所剩时间
```

如果调用该函数的同时向它传递一个正整型函数，相应时间后（以秒为单位）将产生 SIGALRM 信息。若向该函数传递 0，则之前对 SIGALRM 信号预约将取消。如果通过该函数预约信号后为指定该信号对应的处理函数，则（通过调用`signal`函数）终止进程，不做任何处理。

示例如下:

```C
##include <signal.h>
##include <unistd.h>
##include <stdio.h>

void timeout(int sig)
{
  if (sig == SIGALRM)
    puts("Time out!");
  alarm(2);
}

void keycontrol(int sig)
{
  if (sig == SIGINT)
    puts("CTRL + C pressed");
}

int main(int argc, char *argv[])
{
  int i;
  signal(SIGALRM, timeout);
  signal(SIGINT, keycontrol);
  alarm(2);
  for (i = 0; i < 3; i++)
  {
    puts("wait...");
    sleep(100);
  }
  return 0;
}
```

![](/images/202402/3/74d9bdb4388e8b5d2e9eb4c59596193b_MD5.jpeg)

发生信号时将唤醒由于调用`sleep`函数而进入阻塞状态的进程。调用函数的主体是操作系统，但进程处于睡眠状态无法调用函数。因此，产生信号时，为了调用信号处理器 ，将唤醒由于调用`sleep`函数而进入阻塞状态的进程。而且，进程一旦被唤醒，就不会再进入睡眠状态。即使还未到`sleep`函数中规定的时间也如此。所以上述示例运行不到 10 秒就会结束，连续输入`CTRL + C`可能 1 秒都不到。

#### 利用 sigaction 函数进行信号处理

`sigaction`函数类似于`signal`函数，且完全可以代替它，也更稳定。稳定的原因是`signal`函数在 UNIX 系列的不同操作系统中可能存在区别，但`sigaction`函数完全相同。

```C
##include <signal.h>

int sigaction(int signo, const struct sigaction* act, struct sigaction* oldact);

// 成功时返回0，失败时返回-1
// signo 与signal函数相同，传递信号信息
// act 对于与第一个参数的信号处理函数（信号处理器）信息
// oldact 通过参数获取之前注册的信号处理函数指针，若不需要则传递0
```

声明并初始化`sigaction`结构体变量以调用上述函数，该结构体定义如下:

![](/images/202402/3/898c2d98aaf56be8ffeab63714213308_MD5.jpeg)

结构体的`sa_handler`成员保存信号处理函数的指针值（地址值）。

示例如下:

```C
##include <signal.h>
##include <stdio.h>
##include <unistd.h>

void timeout(int sig)
{
  if (sig == SIGALRM)
  {
    puts("Time out!");
  }
  alarm(2);
}

int main(int argc, char *argv[])
{
  int i;
  struct sigaction act;
  act.sa_handler = timeout;
  sigemptyset(&act.sa_mask);
  act.sa_flags = 0;
  sigaction(SIGALRM, &act, 0);
  alarm(2);
  for (i = 0; i < 3; i++)
  {
    puts("wait...");
    sleep(100);
  }
  return 0;
}
```

![](/images/202402/3/45b9440a6ac8588ad74188c38b675cf4_MD5.jpeg)

#### 利用信号处理技术消灭僵尸进程

进程终止时将产生`SIGCHLD`信号。

```C
##include <stdio.h>
##include <stdlib.h>
##include <unistd.h>
##include <signal.h>
##include <sys/wait.h>

void read_childproc(int sig)
{
  int status;
  pid_t pid = waitpid(-1, &status, WNOHANG);
  if (WIFEXITED(status))
  {
    printf("Removed proc id : %d\n", pid);
    printf("Child send : %d \n", WEXITSTATUS(status));
  }
}

int main(int argc, char *argv[])
{
  pid_t pid;
  struct sigaction act;
  act.sa_handler = read_childproc;
  sigemptyset(&act.sa_mask);
  act.sa_flags = 0;
  sigaction(SIGCHLD, &act, 0);

  pid = fork();
  if (pid == 0) // 子进程执行区域
  {
    puts("Hi! I am child process");
    sleep(10);
    return 12;
  }

  else // 父进程执行区域
  {
    printf("Child proc is : %d\n", pid);
    pid = fork();
    if (pid == 0) // 另一子进程执行区域
    {
      puts("Hi! I am child process");
      sleep(10);
      exit(24);
    }
    else
    {
      int i;
      printf("Child proc is : %d\n", pid);
      for (i = 0; i < 5; i++)
      {
        puts("wait...");
        sleep(5);
      }
    }
  }
  return 0;
}
```

![](/images/202402/3/dec115cbb6ea7d7ac7a55b24331f30ef_MD5.jpeg)

### 基于多任务的并发服务器

#### 基于进程的并发服务器模型

此前的回声服务器端每次都只能向一个客户端提供服务。因此，我们可以扩展回声服务器端，使其可以同时向国歌客户端提供服务，实现模型如下。

![](/images/202402/3/7a671c9c26590298799a00c728ebfde8_MD5.jpeg)

每当有客户端请求服务（连接请求）时，回声服务器都创建子进程以提供服务。请求服务的客户端若有 5 个，则将创建 5 个子进程提供服务。过程如下:

- 第一阶段：回声服务器端（父进程）通过调用`accept`函数受理连接请求
- 第二阶段：此时获取的套接字文件描述符创建并传递给子进程
  第三阶段：子进程利用传递来的文件描述符提供服务

子进程会复制父进程拥有的所有资源，实际上根本不哦那个另外传递文件描述符的过程。

#### 实现并发服务器

```C
// echo_mpserv.c
##include <stdio.h>
##include <stdlib.h>
##include <string.h>
##include <unistd.h>
##include <signal.h>
##include <sys/wait.h>
##include <arpa/inet.h>
##include <sys/socket.h>

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
    printf("Usage : %s <port>\n", argv[0]);
    exit(1);
  }

  act.sa_handler = read_childproc;
  sigemptyset(&act.sa_mask);
  act.sa_flags = 0;
  state = sigaction(SIGCHLD, &act, 0);
  serv_sock = socket(PF_INET, SOCK_STREAM, 0);
  memset(&serv_adr, 0, sizeof(serv_adr));
  serv_adr.sin_family = AF_INET;
  serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
  serv_adr.sin_port = htons(atoi(argv[1]));

  if (bind(serv_sock, (struct sockaddr *)&serv_adr, sizeof(serv_adr)) == -1)
  {
    error_handling("bind() error");
  }

  if (listen(serv_sock, 5) == -1)
  {
    error_handling("listen() error");
  }

  while (1)
  {
    adr_sz = sizeof(clnt_adr);
    clnt_sock = accept(serv_sock, (struct sockaddr *)&clnt_adr, &adr_sz);
    if (clnt_sock == -1)
    {
      continue;
    }
    else
    {
      puts("new client connected...");
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
      puts("client disconnected...");
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
  pid = waitpid(-1, &status, WNOHANG);
  printf("removed proc id %d \n", pid);
}

void error_handling(char *message)
{
  fputs(message, stderr);
  fputc('\n', stderr);
  exit(1);
}
```

启动服务器后，可以发现服务器可以向多个客户端提供服务。

#### 通过 fork 函数复制文件描述符

`echo_mpserv.c`中父进程将 2 个套接字（一个服务器端套接字，一个是与客户端连接的套接字）文件描述符复制给子进程。

> 只复制文件描述符吗？是否也复制了套接字？

调用`fork`函数时复制父进程的所有资源，但套接字并非进程所有——严格意义上说，套接字属于操作系统——只是进程拥有代表相应套接字的文件描述符。

调用`fork`函数后，2 个文件描述符指向同一套接字。

![](/images/202402/3/32f76c3d18c68dbaef5fb7ae826c38aa_MD5.jpeg)

1 个套接字中存在 2 个文件描述符时，只有 2 个文件描述符都终止（销毁）后，才能销毁套接字。如果维持上图中的连接状态，即使子进程销毁了与客户端连接的套接字文件描述符，也无法完全销毁套接字（服务器端套接字同样如此）。因此，调用`fork`函数后，要将无关的套接字文件描述符关掉，如下图所示。

![](/images/202402/3/bb8ed8d26656741d49fcbcfa2965ed3c_MD5.jpeg)

为了将文件描述符整理成上图形式，`echo_mpserv.c`调用了`close`函数。

![](/images/202402/3/e46860f5f7a5b2af84953746f2f611c3_MD5.jpeg)

### 分割 TCP 的 I/O 程序

#### 分割 I/O 程序的优点

已经实现的回声客户端的数据回声方式如下：

> 向服务器端传输数据，并等待服务器端回复。无条件等待，直到接受完服务器端的回声数据后，才能传输下一批数据。

传输数据后需等待服务器端返回的数据，因为程序代码中重复调用了`read`和`write`函数。这么写的原因是，程序在 1 个进程中运行。现在可创建多个进程，因此可以分割数据收发过程。分割模型如下:

![](/images/202402/3/36d01a1a4fae08c51bd8ae3e76dd6913_MD5.jpeg)

如此实现的一个重要原因是程序实现更简单。父进程中只需编写接收数据的代码，子进程中只需编写发送数据的代码，所以会简化。

另一个好处是可以提高频繁交换数据的性能。

![](/images/202402/3/949e1b3ca033480531d4034e52a5f493_MD5.jpeg)

分割 I/O 后的客户端发送数据时不必考虑接收数据的情况，因此可以连续发送数据，由此提高同一时间内传输的数据量。这种差异在网络较慢时尤为明显。

#### 回声客户端的 I/O 程序分割

```C
// echo_mpclient.c
##include <stdio.h>
##include <stdlib.h>
##include <string.h>
##include <unistd.h>
##include <arpa/inet.h>
##include <sys/socket.h>

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
    printf("Usage : %s <IP> <port> \n", argv[0]);
    exit(1);
  }

  sock = socket(PF_INET, SOCK_STREAM, 0);
  if (sock == -1)
  {
    error_handling("socket() error");
  }

  memset(&serv_addr, 0, sizeof(serv_addr));
  serv_addr.sin_family = AF_INET;
  serv_addr.sin_addr.s_addr = inet_addr(argv[1]);
  serv_addr.sin_port = htons(atoi(argv[2]));

  if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) == -1)
  {
    error_handling("connect() error");
  }
  else
  {
    puts("connected....");
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
  fputc('\n', stderr);
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
    printf("Message from server : %s", buf);
  }
}

void write_routine(int sock, char *buf)
{
  while (1)
  {
    fgets(buf, BUF_SIZE, stdin);
    if (!strcmp(buf, "q\n") || !strcmp(buf, "Q\n"))
    {
      shutdown(sock, SHUT_WR);
      return;
    }
    write(sock, buf, strlen(buf));
  }
}
```

## 第 11 章 进程间通信

### 进程间通信的基本概念

进程间通信（Inter Process Communication）意味着两个不同进程间可以交换数据，为了完成这一点，操作系统中应提供两个进程可以同时访问的内存空间。

#### 对进程通信的基本理解

只要有两个进程可以同时访问的内存空间，就可以通过此空间交换数据。但进程具有完全独立的内存结构。连通过`fork`函数创建的子进程也不会与父进程共享内存空间。因此，进程间通信只能通过其他特殊方法完成。

#### 通过管道实现进程间通信

![](/images/202402/3/482530beaff389a5f91c9d5e4d20276a_MD5.jpeg)

为了完成进程间通信，需要创建管道。管道并非属于进程的资源，而是和套接字一样，属于操作系统（也就不是`fork`函数的复制对象）。所以，两个进程通过操作系统提供的内存空间进行通信。创建管道的函数如下:

```C
##include <unistd.h>

int pipe(int filedes[2]);
// 成功返回0，失败返回-1
// filedes[0] 通过管道接收数据时使用的文件描述符，即管道出口
// filedes[1] 通过管道传输数据时使用的文件描述符，即管道入口
```

以长度为 2 的 int 数组地址值作为参数调用上述函数时，数组中存有两个文件描述符，它们将被用作管道的出口和入口。父进程调用该函数时将创建管道，同时获取对应于出入口的文件描述符，此时父进程可以读写同一管道。由于父进程的目的是与子进程进行数据交换，因此需要将入口或出口中的 1 个文件描述符传递给子进程。

```C
// pipe1.c
##include <stdio.h>
##include <unistd.h>

##define BUF_SIZE 30

int main(int argc, char *argv[])
{
  int fds[2];
  char str[] = "Who are you?";
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

![](/images/202402/3/e0186034152fd2f4e1287a7ce3c926bd_MD5.jpeg)

上例中的通信方法如下。父子进程都可以访问管道 I/O 路径，但子进程仅用输入路径，父进程仅用输出路径。

![](/images/202402/3/1a96628ebff47987a9dbd3c6320aeda0_MD5.jpeg)

#### 通过管道进程进程间双向通信

创建 2 个进程通过 1 个管道进程双向数据交换，通信方式如下:

![](/images/202402/3/661db8f4e842908b7b988b867a673b1e_MD5.jpeg)

```C
// pipe2.c
##include <stdio.h>
##include <unistd.h>

##define BUF_SIZE 30

int main(int argc, char *argv[])
{
  int fds[2];
  char str1[] = "Who are you?";
  char str2[] = "Thank you for your message";
  char buf[BUF_SIZE];
  pid_t pid;

  pipe(fds);
  pid = fork();
  if (pid == 0)
  {
    write(fds[1], str1, sizeof(str1));
    sleep(2);
    read(fds[0], buf, BUF_SIZE);
    printf("Child proc output : %s\n", buf);
  }
  else
  {
    read(fds[0], buf, BUF_SIZE);
    printf("Parent proc output : %s\n", buf);
    write(fds[1], str2, sizeof(str2));
    sleep(3);
  }

  return 0;
}
```

运行结果:

![](/images/202402/3/181876452fbcca6784cee127caf3c8be_MD5.jpeg)

向管道传递数据时，先读的进程会把数据取走。简而言之，数据进入管道后称为无主数据。通过`read`函数先读取数据的进程将得到数据，即使是该进程将数据传到了管道。

只用 1 个管道进行双向通信并非易事。为了实现这点，程序需要预测并控制运行流程，这在每种系统中都不同，可以视为不可能完成的任务。我们可以通过创建 2 个管道进行双向通信。各自负责不同的数据流动即可。

![](/images/202402/3/f3bf94d15e9109924750da60fd117215_MD5.jpeg)

```C
##include <stdio.h>
##include <unistd.h>

##define BUF_SIZE 30

int main(int argc, char *argv[])
{
  int fds1[2], fds2[2];
  char str1[] = "Who are you?";
  char str2[] = "Thank you for your message";
  char buf[BUF_SIZE];
  pid_t pid;

  pipe(fds1);
  pipe(fds2);
  pid = fork();
  if (pid == 0)
  {
    write(fds1[1], str1, sizeof(str1));
    read(fds2[0], buf, BUF_SIZE);
    printf("Child proc output : %s\n", buf);
  }
  else
  {
    read(fds1[0], buf, BUF_SIZE);
    printf("Parent proc output : %s\n", buf);
    write(fds2[1], str2, sizeof(str2));
    sleep(3);
  }

  return 0;
}
```

![](/images/202402/3/6e3f6a36f8c19c371a197db0ad3ea1d4_MD5.jpeg)

### 运用进程间通信

#### 保存消息的回声服务器端

扩展`echo_mpserv.c`，将回声客户端传输得的字符串按序保存到文件中。

我们可以将该任务委托给另外的进程。换言之，另行创建进程，从向客户端提供服务的进程读取字符串信息。当然，该过程中需要创建用于接收数据的管道。

```C
// echo_storeserv.c
##include <stdio.h>
##include <stdlib.h>
##include <string.h>
##include <unistd.h>
##include <signal.h>
##include <sys/wait.h>
##include <arpa/inet.h>
##include <sys/socket.h>

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
    printf("Usage : %s <port>\n", argv[0]);
    exit(1);
  }

  act.sa_handler = read_childproc;
  sigemptyset(&act.sa_mask);
  act.sa_flags = 0;
  state = sigaction(SIGCHLD, &act, 0);
  serv_sock = socket(PF_INET, SOCK_STREAM, 0);
  memset(&serv_adr, 0, sizeof(serv_adr));
  serv_adr.sin_family = AF_INET;
  serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
  serv_adr.sin_port = htons(atoi(argv[1]));

  if (bind(serv_sock, (struct sockaddr *)&serv_adr, sizeof(serv_adr)) == -1)
  {
    error_handling("bind() error");
  }

  if (listen(serv_sock, 5) == -1)
  {
    error_handling("listen() error");
  }

  pipe(fds);
  pid = fork();
  if (pid == 0)
  {
    FILE *fp = fopen("echomsg.txt", "wt");
    char msgbuf[BUF_SIZE];
    int i, len;
    for (i = 0; i < 10; i++)
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
    clnt_sock = accept(serv_sock, (struct sockaddr *)&clnt_adr, &adr_sz);
    if (clnt_sock == -1)
    {
      continue;
    }
    else
    {
      puts("new client connected...");
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
      puts("client disconnected...");
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
  pid = waitpid(-1, &status, WNOHANG);
  printf("removed proc id %d \n", pid);
}

void error_handling(char *message)
{
  fputs(message, stderr);
  fputc('\n', stderr);
  exit(1);
}
```

## 第 12 章 I/O 复用

## 第 13 章 多种 I/O 函数

## 第 14 章 多播与广播

## 第 15 章 套接字和标准 I/O

## 第 16 章 关于 I/O 流分离的其他内容

## 第 17 章 优于 select 和 epoll

## 第 18 章 多线程服务器端的实现

## 第 19 章 Windows 平台下的线程的使用

## 第 20 章 Windows 中的线程同步

## 第 21 章 异步通知的 I/O 模型

## 第 22 章 重叠 I/O 模型

## 第 23 章 IOCP

## 第 24 章 制作 HTTP 服务器端

## 第 25 章 进阶内容

## 推荐

Windows Sockets 2: <https://learn.microsoft.com/en-us/windows/win32/api/_winsock/>

《计算机网络 自顶向下》

[TCP-IP-NetworkNote](https://github.com/riba2534/TCP-IP-NetworkNote): 📘《TCP/IP 网络编程》(韩-尹圣雨)学习笔记

## 参考

《TCP/IP 网络编程》


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: https://andyfree96.github.io/tcp-ip%E7%BD%91%E7%BB%9C%E7%BC%96%E7%A8%8B/  

