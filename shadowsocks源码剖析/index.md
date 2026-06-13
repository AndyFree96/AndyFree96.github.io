# Shadowsocks源码剖析


## 前言

很多人第一次接触 Shadowsocks，只把它当作一个代理工具。但是从源码角度看，Shadowsocks 是一个非常适合学习网络编程的项目。它代码量不大，却包含了现代网络服务端开发中的很多核心思想：

- Socks5 协议解析
- Socket 编程
- 非阻塞 IO
- Reactor 事件模型
- epoll/kqueue/select
- 状态机设计
- TCP Relay 转发
- UDP Relay
- 加密通信

阅读 Shadowsocks 源码，可以帮助我们理解一个代理程序从建立连接，到数据转发，再到连接关闭的完整过程。本文以 Python 版 Shadowsocks 为例，分析它内部的设计。

<!--more-->

## Shadowsocks整体架构

Shadowsocks分为本地端和服务端。

整体流程：

```
    Browser
        |
        |
 Socks5 Proxy
        |
        |
   sslocal
        |
   Encrypt
        |
        |
  ssserver
        |
        |
   Internet
```

本地代理负责：

1. 接收客户端请求
2. 解析 Socks5 协议
3. 创建远程连接
4. 加密数据
5. 转发流量

服务端负责：

1. 接收加密数据
2. 解密
3. 访问目标服务器
4. 返回数据

源码入口：

```bash
python -m shadowsocks.local -c config.json
```

对应`shadowsocks/local.py`。`config.json`内容如下：

```json
{
  "server": "127.0.0.1",
  "server_port": 8388,
  "local_address": "127.0.0.1",
  "local_port": 1080,
  "password": "123",
  "method": "aes-256-cfb",
  "dns": "8.8.8.8"
}
```

## 程序入口：local.py

启动流程如下：

```python
@shell.exception_handle(self_=False, exit_code=1)
def main():
    shell.check_python()

    # fix py2exe
    if hasattr(sys, "frozen") and sys.frozen in \
            ("windows_exe", "console_exe"):
        p = os.path.dirname(os.path.abspath(sys.executable))
        os.chdir(p)

    config = shell.get_config(True)
    daemon.daemon_exec(config)

    logging.info("starting local at %s:%d" %
                 (config['local_address'], config['local_port']))

    dns_resolver = asyncdns.DNSResolver()
    tcp_server = tcprelay.TCPRelay(config, dns_resolver, True)
    udp_server = udprelay.UDPRelay(config, dns_resolver, True)
    loop = eventloop.EventLoop()
    dns_resolver.add_to_loop(loop)
    tcp_server.add_to_loop(loop)
    udp_server.add_to_loop(loop)

    def handler(signum, _):
        logging.warn('received SIGQUIT, doing graceful shutting down..')
        tcp_server.close(next_tick=True)
        udp_server.close(next_tick=True)
    signal.signal(getattr(signal, 'SIGQUIT', signal.SIGTERM), handler)

    def int_handler(signum, _):
        sys.exit(1)
    signal.signal(signal.SIGINT, int_handler)

    daemon.set_user(config.get('user', None))
    loop.run()

if __name__ == '__main__':
    main()
```

执行`main()`时，会初始化事件循环：

```python
loop = eventloop.EventLoop()

loop.run()
```

这里是整个程序的核心。Shadowsocks没有采用一个连接一个线程这种传统模型。而是采用一个事件循环管理多个socket，即Reactor模型。

## Reactor事件模型

### 传统阻塞模型

最简单的TCP服务：

```
accept()

创建线程

recv()

处理数据
```

结构：

```
client1
   |
thread1
   |
recv()


client2
   |
thread2
   |
recv()
```

连接少的时候没问题。

但是连接数量增加：

- 线程数量增加
- 上下文切换增加
- 内存消耗增加

### Reactor模型

Reactor的思想：不要主动等待数据，把socket注册给事件中心。当数据来了，通知我。

结构：

```
              EventLoop

                  |
        +---------+---------+
        |                   |
       fd1                 fd2

        |                   |

      READ               WRITE
```

核心循环：

```python
while True:

    events = poll()

    for fd,event in events:

        handle(fd,event)
```

## EventLoop源码分析

EventLoop定义在`shadowsocks/eventloop.py`中。Shadowsocks根据系统选择不同IO模型。

如果是Linux系统：

```python
select.epoll()
```

如果是Mac系统：

```
select.kqueue()
```

其他：

```
select.select()
```

核心代码类似：

```python
events = self._impl.poll(timeout)
```

这里的`poll`并不是普通的轮询，它会进入操作系统等待。例如`epoll`：

```
没有事件
      |
      |
    阻塞等待
      |
      |
socket可读
      |
      |
返回事件
```

所以CPU不会一直空转。

## fd和socket的关系

源码中会看到很多`fd`，那么`fd`是什么？Linux中：

> 一切皆文件。

创建`socket`:

```python
sock = socket.socket()
```

底层实际上返回：

```
fd = 5
```

操作系统维护：

```
fd 5
 |
 +--- socket
        |
        +--- IP地址
        +--- 端口
        +--- 缓冲区
```

`epoll`监听的其实就是`fd`。例如：

```python
epoll.register(fd)
```

注册是不是Python对象，而是文件描述符。

## SOCKS5协议解析

使用Shadowsocks时，我们通常会在浏览器配置代理：

![图1 浏览器代理配置](/images/202606/1/2.png '图1 浏览器代理配置')

但浏览器的通信请求会很多，为了方便查看交互过程，我们可以使用如下命令：

```bash
curl --socks5 127.0.0.1:1080 http://www.baidu.com
```

交互过程如下：

![图2 交互过程](/images/202606/1/1.png '图2 交互过程')

整个过程如[理解socks5协议的工作过程和协议细节](https://wiyi.org/socks5-protocol-in-deep.html)所述可分为3个阶段：握手阶段、请求阶段、Relay阶段。

### 协商阶段

在这个阶段，客户端（如：浏览器、curl）向Socks5服务器发起请求，格式如下：

```
# 数字表示字节数
+----+----------+----------+
|VER | NMETHODS | METHODS  |
+----+----------+----------+
| 1  |    1     | 1 to 255 |
+----+----------+----------+
```

VER: 协议版本，Socks5为`0x05`

NMETHODS: 支持认证的方法数量

METHODS: 对应NMETHODS，NMETHODS的值为多少，METHODS就有多少字节。

- X'00' NO AUTHENTICATION REQUIRED
- X'01' GSSAPI
- X'02' USERNAME/PASSWORD
- X'03' to X'7F' IANA ASSIGNED
- X'80' to X'FE' RESERVED FOR PRIVATE METHODS
- X'FF' NO ACCEPTABLE METHODS

如图2所示，请求报文是`05 02 00 01`，说明支持2种认证方法，分别是`00` NO AUTHENTICATION REQUIRED和`01` GSSAPI。

Socks5服务器需要选中一个METHOD返回给客户端，格式如下：

```
# 数字表示字节数
+----+--------+
|VER | METHOD |
+----+--------+
| 1  |   1    |
+----+--------+
```

如图2所示，返回报文是`05 00`，表示无认证。

### 请求阶段

顺利通过协商阶段后，客户端向Socks5服务器发起请求，格式如下：

```
# 数字表示字节数
+----+-----+-------+------+----------+----------+
|VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
+----+-----+-------+------+----------+----------+
| 1  |  1  | X'00' |  1   | Variable |    2     |
+----+-----+-------+------+----------+----------+
```

- VER 版本号，Socks5的固定值为`0x05`
- CMD
  - `0x01`表示CONNECT请求
  - `0x02`表示BIND请求
  - `0x03`表示UDP转发
- RSV 保留字段，值为`0x00`
- ATYP 目标地址类型，DST.ADDR的数据对应这个字段的类型。
  - `0x01`表示IPv4地址，DST.ADDR为4个字节
  - `0x03`表示域名，DST.ADDR是一个可变长度的域名
  - `0x04`表示IPv6地址，DST.ADDR为16个字节长度
- DST.ADDR 一个可变长度的值
- DST.PORT 目标端口，固定2个字节

如图2所示，请求报文是`05 01 00 01 24 98 2c 84 00 50`，表示该请求是Socks5的CONNECT请求，IPv4地址为`24 98 2c 84`，即`35.152.44.132`，目标端口为`00 50`,即`80`。

Socks5服务器收到客户端的请求后，需要返回一个响应，结构如下：

```
# 数字表示字节数
+----+-----+-------+------+----------+----------+
|VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
+----+-----+-------+------+----------+----------+
| 1  |  1  | X'00' |  1   | Variable |    2     |
+----+-----+-------+------+----------+----------+
```

- VER 版本号，Socks5的固定值为`0x05`
- REP 请求结果,内容取值如下
  - X'00' succeeded
  - X'01' general SOCKS server failure
  - X'02' connection not allowed by ruleset
  - X'03' Network unreachable
  - X'04' Host unreachable
  - X'05' Connection refused
  - X'06' TTL expired
  - X'07' Command not supported
  - X'08' Address type not supported
  - X'09' to X'FF' unassigned
- RSV 保留字段
- ATYPE 同请求的ATYPE
- BND.ADDR 绑定的地址
- BND.PORT 绑定的端口DST.PORT

如图2所示，响应报文是`05 00 00 01 00 00 00 00 10 10`，表示成功，绑定的IPv4地址为`00 00 00 00`，即本机IP地址，绑定端口为`10 10`,即`4112`（其实是Relay Server的地址和端口）。

### Relay阶段

Relay阶段已经完全脱离Socks5协议。Socks5到`05 00 00 01 00 00 00 00 10 10`就结束了。之后发生的是：普通TCP socket上的自定义协议数据流。

在 Socks5 + Shadowsocks 这套结构里，“Relay 阶段”本质上不是 Socks5 协议的一部分，而是Socks5 之后真正开始转发数据的阶段。

可以把它理解成一句话：

> Socks5 负责“帮你把连接建立好”，Relay 阶段就是 Socks5 连接建立完成之后，把两端 socket 当管道，做加密/解密 + 双向转发的持续数据搬运过程。

## 为什么需要状态机？

网络连接不是一步完成。一个连接可能经历：

```
INIT
 |
SOCKS5握手
 |
解析目标地址
 |
连接远程服务器
 |
数据转发
 |
关闭
```

因为网络程序本质上不是“函数调用流程”，而是“异步事件流”，状态机是用来把这种混乱的时间顺序“结构化”的工具。状态机将流程拆成“阶段”：

```
STAGE_INIT = 0
STAGE_ADDR = 1
STAGE_UDP_ASSOC = 2
STAGE_DNS = 3
STAGE_CONNECTING = 4
STAGE_STREAM = 5
STAGE_DESTROYED = -1
```

每次事件来了：

```python
if stage == STAGE_REQUEST:
    解析目标地址

elif stage == STAGE_STREAM:
    转发数据
```

如果没有状态机，可能就会写出这种代码：

```python
def handle(sock):

    data = sock.recv()

    if not remote:
        remote = connect()

    if not handshake_done:
        parse_socks5()

    send(remote, data)
```

- 逻辑混乱：握手 / 连接 / 转发混在一起
- 无法处理“半包”：TCP可能只收到 Socks5 的 1 byte
- 无法处理异步 connect：`connect`还没完成就`recv`

## TCP Relay数据转发

连接建立后，数据流：

```
Browser
   |
   |
 Local Proxy
   |
   |
 Encrypt
   |
   |
 Remote Server
   |
   |
 Target
```

本地收到数据，加密后发送：

```python
data = sock.recv()
cipher.encrypt(data)
remote.send(data)
```

反方向：

```
remote
   |
decrypt
   |
client
```

## 补充

### 切换到最新代码

如要切换Shadowsocks到最新代码，可依次执行下列命令：

```bash
git clone https://github.com/shadowsocks/shadowsocks

cd shadowsocks

git branch -a

git checkout remotes/origin/master
```

### 调试

若想在VS Code中调试，可以新建.vscode/launch.json文件，添加如下内容：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "shadowsocks-local",
      "type": "debugpy",
      "request": "launch",
      "module": "shadowsocks.local",
      "console": "integratedTerminal",
      "args": ["-c", "config.json"]
    }
  ]
}
```

但最推荐的调试方式是：print + 日志 + 抓包（可能比单步调试更适合网络项目）。由于经常要修改print + 日志输出的内容。我们可以使用[nodemon](https://nodemon.io/)进行代码热重载。添加配置文件`nodemonlocal.json`：

```json
{
  "watch": ["shadowsocks"],
  "ext": "py",
  "exec": "python -m shadowsocks.local -c config.json"
}
```

在终端执行如下命令即可：

```bash
nodemon --config nodemonlocal.json
```

## 总结

阅读 Shadowsocks 源码最大的价值，不是学习如何实现一个代理，而是理解一个高性能网络程序如何工作。

从一个 socket 开始：

- 创建连接
- 注册事件
- Reactor分发
- 状态机推进
- 数据转发
- 关闭连接

一个几千行代码的项目，完整展示了现代网络服务端的设计思想。

## 推荐

[SOCKS Protocol Version 5](https://datatracker.ietf.org/doc/html/rfc1928)

[理解socks5协议的工作过程和协议细节](https://wiyi.org/socks5-protocol-in-deep.html)

[写给非专业人士看的 Shadowsocks 简介](https://vc2tea.com/whats-shadowsocks/)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/shadowsocks%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

