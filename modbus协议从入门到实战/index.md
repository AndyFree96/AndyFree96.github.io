# C#编程实践(三)：Modbus协议从入门到实战


在工业自动化领域，无论是 PLC、HMI、变频器、伺服驱动器、仪器仪表，还是机器视觉设备，你经常会看到Modbus的身影。例如：PLC与上位机通信、PLC与上位机通信、PLC与IO模块通信等等。几乎所有的工业设备都会支持Modbus。在初次接触Modbus后，产生了很多疑问：

- 什么是Modbus？
- RTU和TCP有什么区别？
- 主站和从站是什么意思？

本文将采用问题驱动的方式，带你一步步理解Modbus。

<!--more-->

## 什么是Modbus？

Modbus是一种广泛应用于工业自动化和控制系统的通信协议，由Modicon于1979年制定而成。其定义了允许不同设备交换数据的通用规则，这些规则是公开的，不依赖于特定的制造商。目前已经成为工业领域事实上的标准。在Modbus通信中，发送请求的设备称为主设备(客户机)，响应请求的设备称为从设备(服务器)。主设备向特定从设备发送读或写请求启动通信，从设备处理请求并返回响应。

![图1 主从设备通信](/images/202607/22/img_02_01.jpg "图1 主从设备通信")

## Modbus协议有哪些版本？

Modbus协议有多个版本，主要有：

- Modbus RTU(Remote Terminal Unit)：基于串口通信(如RS-232、RS-485)的协议。数据以二进制格式法案送，传输效率高，通常用于串行链路。
- Modbus ASCII：与Modbus RTU类似，但数据以ASCII码格式发送，传输效率较低，但易于调试。
- Modbus TCP/IP：基于以太网的版本，采用TCP/IP协议栈来传输Modbus数据包，适用于局域网或广域网环境。允许更灵活的网络拓扑，并支持更多设备接入。

![图2 Modbus协议版本](/images/202607/22/img_04_01.jpg "图2 Modbus协议版本")

## 为什么工业上喜欢用Modbus？

在工业应用中选择Modbus主要有5个原因：

1. 开放和免费的规范
2. 简单的协议结构，支持简单的实现和调试
3. 多厂商环境的高兼容性
4. 可灵活选择RTU或TCP通信
5. 与远程I/O的兼容性强，可扩展性好

## Modbus消息帧的格式是什么样的？

![图3 Modbus消息帧格式](/images/202607/22/figure_018.jpg "图3 Modbus消息帧格式")

Modbus消息包括以下几个部分：

- 地址域：用于标识目标设备的地址
- 功能码：定义要执行的操作，例如读取寄存器、写入数据等
- 数据域：根据功能码携带相应的数据(如寄存器地址、寄存器值)
- 校验码：用于确保数据传输的完整性



## Modbus功能码有哪些？

常用的功能码：

| 功能码 | 作用                 |
| :--- | :------------------ |
| 01  | 读 Coil             |
| 02  | 读离散输入              |
| 03  | 读 Holding Register |
| 04  | 读 Input Register   |
| 05  | 写单个 Coil           |
| 06  | 写单个 Register       |
| 15  | 写多个 Coil           |
| 16  | 写多个 Register       |


## 有哪些数据类型？

| 数据区域             | 中文    | 数据大小   | 读写  | 作用    | 功能码          |
| :---------------- | :----- | :------ | :--- | :------- | :------------ |
| Coil             | 线圈    | 1 bit  | 可读写 | 一个可以被控制的开关量输出。例如：启动电机、打开气缸、打开报警灯   | 01 / 05 / 15 |
| Discrete Input   | 离散输入  | 1 bit  | 只读  | 外部设备输入的开关状态。例如：光电开关、急停按钮   | 02           |
| Input Register   | 输入寄存器 | 16 bit | 只读  | 外部设备采集的数据。例如：温度、压力、电流   | 04           |
| Holding Register | 保持寄存器 | 16 bit | 可读写 | 可以保存并修改的数据。比如：设备参数(速度、压力设定值、报警阈值) | 03 / 06 / 16 |

## 如何使用Modbus？

最简单的方法是使用第三方库。例如：[NModbus](https://nmodbus.github.io/api/NModbus.html)、[EasyModbusTCP](https://www.nuget.org/packages/EasyModbusTCP)。

读取保持寄存器(TCP版)：

```c#
using NModbus;
using System.Net.Sockets;

namespace ModbusDemo
{
    internal class Program
    {
        static void Main(string[] args)
        {
            using var tcpClient = new TcpClient("192.168.1.10", 502);
            var factory = new ModbusFactory();
            var master = factory.CreateMaster(tcpClient);

            ushort[] values = master.ReadHoldingRegisters(slaveAddress: 1, startAddress: 0, numberOfPoints: 2);

            Console.WriteLine(values[0]);
            Console.WriteLine(values[1]);
        }
    }
}
```

读取保持寄存器(RTU版)：

```c#
using NModbus;
using NModbus.Serial;
using System.IO.Ports;

namespace ModbusDemo
{
    internal class Program
    {
        static void Main(string[] args)
        {
            SerialPort port = new("COM1")
            {
                BaudRate = 9600,
                Parity = Parity.None,
                DataBits = 8,
                StopBits = StopBits.One,
            };

            port.Open();

            var factory = new ModbusFactory();
            var master = factory.CreateRtuMaster(port);
            ushort[] data = master.ReadHoldingRegisters(1, 0, 10);
            Console.WriteLine(data[0]);
            Console.ReadLine();
        }
    }
}

```

## 机器视觉项目中如何使用Modbus？

在机器视觉软件中，Modbus经常用于与PLC进行数据交互。

典型流程如下：

![图4 机器视觉项目典型流程](/images/202607/22/1.png "图4 机器视觉项目典型流程")

| 地址                     | 含义       |
| :---------------------- | :-------- |
| Coil 00001             | 拍照触发     |
| Coil 00002             | 检测完成     |
| Coil 00003             | OK       |
| Coil 00004             | NG       |
| Holding Register 40001 | X 偏移     |
| Holding Register 40002 | Y 偏移     |
| Holding Register 40003 | 角度       |
| Holding Register 40004 | 缺陷类型     |
| Holding Register 40005 | 检测耗时(ms) |

这种方式实现简单、兼容性好，是工业视觉软件中比较常见的通信方案之一。

## 使用Modbus时常见的坑

### 1. 寄存器地址偏移

有些设备文档从`40001`开始编号，API却要求传入`0`作为起始地址；还有些设备直接使用从`1`开始的地址。一定要确认厂商文档的地址规则。

### 2. 字节序

对于`Int32`、`Float`、`Double`等跨多个寄存器的数据，不同厂商可能采用不同的寄存器顺序(高字在前/低字在前)和字节顺序，需要根据设备说明进行解析。

### 3. 串口参数不一致

波特率、数据位、停止位、校验位必须与设备配置一致，否则无法通信。

### 4. 站号配置错误

同一条RS485总线上，每个从站必须具有唯一地址。

### 5. RTU帧间隔

Modbus RTU要求报文之间保持规定的静默时间，否则部分设备可能无法正确识别报文边界。

### 6. 异常码处理

不要只判断是否收到了响应，还要检查是否为异常响应，并根据异常码进行日志记录和错误处理。

## 推荐

[Data Collection](https://docs.emqx.com/en/neuronex/latest/configuration/introduction.html)

[Modbus TCP Protocol Explained: Frame Structure, MBAP Header, and Function Codes](https://controllerstech.com/modbus-tcp-protocol-explained/)

[Modbus Protocol Explained: RTU, TCP, ASCII, Frames, Function Codes & Examples](https://scadaprotocols.com/modbus-protocol-guide/)

## 参考

[Modbus Protocol Description](https://www.modbustools.com/modbus.html)

[Modbus全面解析基础知识与关键实现要点](https://www.contec.com/cn/support/blog/2026/26030900_modbus/)

[深入解读Modbus协议](https://www.ni.com/zh-cn/shop/seamlessly-connect-to-third-party-devices-and-supervisory-system/the-modbus-protocol-in-depth.html)

[Modbus初学者教程](https://blog.redisant.cn/docs/modbus-tutorial/)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/modbus%E5%8D%8F%E8%AE%AE%E4%BB%8E%E5%85%A5%E9%97%A8%E5%88%B0%E5%AE%9E%E6%88%98/  

