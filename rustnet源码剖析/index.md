# rustnet源码剖析：从零学习Rust构建网络监控工具


学习一门语言最有效的方式或许并不是从语法手册开始，而是通过一个真实项目理解语言的奥秘。因此，我选择了[rustnet](https://github.com/domcyrus/rustnet)作为[Rust](https://rust-lang.org/)学习的入口。rustnet是一个基于Rust实现的网络监控工具，它涉及网络连接管理、数据包捕获、协议解析、异步处理，包含了大量Rust在系统编程中的典型应用场景。因此，这次源码剖析不仅仅是为了理解rustnet的实现细节，更重要的是希望通过这个项目逐渐建立Rust的使用方法和工程思维。本文将会采用问题驱动的方式，从程序入口开始，逐步探索项目架构、核心模块、关键技术实现，逐步理解Rust设计背后的理念。希望通过这次源码阅读之旅，能够从一个Rust小白的视角，逐渐掌握Rust的核心思想，并最终具备阅读和参与大型Rust项目的能力。

<!--more-->


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/rustnet%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

