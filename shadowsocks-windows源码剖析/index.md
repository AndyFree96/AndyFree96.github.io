# shadowsocks-windows源码剖析：一个C#网络代理客户端是如何工作的？


[shadowsocks-windows](https://github.com/shadowsocks/shadowsocks-windows)是一个经典的C#网络代理客户端项目，它将SOCKS5代理、TCP/UDP Relay、加密通信、系统代理管理以及Windows桌面应用结合在一起。本文通过问题驱动的方式阅读源码，深入分析其架构设计、网络通信模型以及C#工程实践，探索一个成熟的开源项目是如何实现高性能、稳定的网络代理能力。
<!--more-->

## 1. 启动后到底发生了什么？

## 2. 浏览器为什么会把流量发给Shadowsocks？

## 3. 本地代理收到连接后，如何知道用户想访问哪里？

## 4. Shadowsocks如何实现TCP数据转发？

## 5. Shadowsocks如何实现UDP数据转发？

## 6. 数据在哪里加密？

## 7. Shadowsocks如何支持多个客户端连接？

## 8. 用的是线程模型还是异步IO？

## 9. 加密算法如何做到可替代？

## 10. 一个配置文件如何驱动整个程序？


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/shadowsocks-windows%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

