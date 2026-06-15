# 机器视觉算法与应用


## 1. 简介 (Introduction)

![](/images/202606/5/d068b02bd5746849ceffae9b0b92c79f_MD5.jpeg)

开发机器视觉系统的团队需要++机械工程、电子工程、光学工程及软件工程多方面的经验++。

<!--more-->

## 2. 图像采集 (Image Acquistion)

本章将讲述为了得到被测物图像而需要的硬件部件，只有得到图像才可以使用第3张的算法进行分析。照明使得被测物的基本特征可见，镜头使得在传感器上得到清晰的图像，传感器将图像转换为视频信号。最后，相机与计算机接口（图像采集卡、USB或Ethernet网络）接收信号并将其转为在计算机内存的图像。

### 2.1 照明 (Illumination)

机器视觉中的照明目的是使被测物的重要特征显现，并抑制不需要的特征。为达到该目的，需要需要考虑光和被测物之间的交互作用。其中一个重要的因素就是光源和被测物的光谱组成。我们可以用单色光照射彩色物体以增强被测物相应特征的对比度。此外，**照明的角度**可以用于增强某些特征。

#### 2.1.1 电磁辐射 (Electromagnetic Radiation)

光是一定波长范围内的电磁辐射。人眼可见的波长范围为380~780nm。比此波长短的电磁辐射称作紫外线（UV）。更短的电磁辐射为X射线和伽马射线。比可见光波长长的电磁辐射称作红外线（IR）。比红外更长的电测辐射为微波和无线电波。

![](/images/202606/5/0582f5491a05ae6aeb01a9b17e18860b_MD5.jpeg)

#### 2.1.2 光源类型 (Type of Light Sources)

- 白炽灯：相对较亮，可工作在低电压。缺点是放热严重、寿命短，不能用作闪光灯。
- 氙灯：可产生非常亮的白光。缺点是供电复杂且昂贵。
- 荧光灯：有点价格便宜，照明面积大。缺点是寿命短、老化快，光谱分布不均匀，在有些频率下有尖峰。
- 发光二极管（LED）是一种通过电致发光的半导体，能产生类似单色光的非常窄的光谱的光。优点是寿命长、功耗小、发热小。缺点是环境温度越高，LED的性能越差，寿命越短。

#### 2.1.3 光与被测物间的相互作用 (Interaction of Light and Matter)

![](/images/202606/5/6eea0682aff0143ec9d72e94922cb506_MD5.jpeg)

发生在**金属或绝缘材料（如玻璃或塑料）表面的反射使光线产生部分偏振**。偏振的产生源于漫反射和镜面反射，但实际上主要是由镜面反射决定的。

通常黑色的物体能吸收大量的光。吸收就是入射光在物理内部被转换成热。假定落在一个物体上的光为$I$，反射光为$R$，透射光为$T$，吸收为$A$。更具能量守恒定律$ I = R + T + A$。

除镜面反射外，上述各个特性均取决于投射到物体的光的波长。**不透明物体特有的颜色就是由与波长相关的漫反射以及吸收决定的。而透明物体的颜色是与波长相关的透射决定的。**

> 漫反射的意思是：光被物体表明“打散”，往各个方向乱弹，这样你从任何角度都能看到它。

> 物体之所以只吸收某些颜色、反射某些颜色，是因为它内部的结构“只对特定颜色的光有反应”。物体不是“空的”，里面有原子，原子里面有电子。电子不是随便动 的，它们只愿意对某些特定“音调”的光产生反应。当某种颜色光照过来，如果这个颜色的能量刚好符合电子“能接收的频率”，电子就会把光的能量吃掉，变成自己的能量（振动、发热等），这就叫吸收。被吸收的光不会再出来，我们眼睛就看不到它。例如，一个绿色的物体。**主要吸收**非绿色光，但不是100%吸收。绿色光只是反射更多。所以我们会看到绿色增强。

![](/images/202606/5/0568f16b7668e35e9208bfd975c00271_MD5.jpeg)

#### 2.1.4 利用照明的光谱 (Using the Spectral Composition of the Illumination)

彩色物体反射了一部分光谱，其他部分被吸收。我们可以利用这一特性来增强我们需要的特征。比如使用合适的照明光源使其光谱正好是希望看到的波长范围被物体反射，不希望看到的波长范围被吸收。如果绿色背景上面的红色被测物需要增强，就可以使用红色照明，这时红色物体会更明亮，同时绿色物体会变得暗淡。

由于CCD和CMOS传感器对于红外光比较敏感，我们也常用红外光来增强某些特征。

滤光片在机器视觉中非常有用。由于CCD和CMOS传感器对于红外光比较敏感。因此，**IR截止滤光片**（IR cut filter，不让红外光通过）通常用来避免图像过亮和颜色变化。反过来，如果被测物是红外照明的，使用**红外透过滤光片**（IR pass filter）抑制可见光部分而让红外光通过将非常有助于得到好的图像。

另外一种非常有用的滤光片就是偏振片（polrizing filter）。可以通过偏振片抑制金属和绝缘体表面反射时光线会产生部分偏振。

![](/images/202606/5/693997553318234bf34c354213f0db19_MD5.jpeg)

#### 2.1.5 利用照明的方向性 (Using the Directional Properties of hte Illumination)

在有效利用照明中光谱成分的同时，照明的方向性通常也可以用在机器视觉中来增强被测物的必要特征。

谈到反向性，有两种效果。一方面，光源可以是**漫射（diffuse）或直射的(directed)**。漫射时，光在各个方向的强度几乎是一样的。

https://www.baslerweb.cn/zh-cn/shop/light-dome-50od-blue/

![](/images/202606/5/519223c95b960a8d6a0a7937b1123578_MD5.jpeg)

通过切换[苏州嘉励](https://www.jialiauto.com/sy)官网中英文语言选项，diffuse指的是应该就是中文语境下的无影光。

直射时，光源发出的光集中在非常窄的空间范围内。在特定情况下，光源仅发出单向平行光，称作平行光照明。平行光照明与远心镜头（见2.2.4节）的原理是相同的。

<span style="background:#fff88f">通过下图就可以理解什么是漫射啦！</span>

[Machine Vision Systems: Types, Functions and Applications](https://www.iqsdirectory.com/articles/machine-vision-system.html)

![](/images/202606/5/c3ab8fec44504431233a80f4879b078c_MD5.jpeg)

[LEARN HOW TO CHOOSE A LIGHT SOURCE TO TAKE ADVANTAGE OF THE CHARACTERISTICS THAT CREATE CONTRAST.](https://digitaledition.qualitymag.com/march-2021/vs-machine-vision-101/)

![](/images/202606/5/8c5978924867d94d8df26532db8fdd29_MD5.jpeg)

<span style="background:#d4b106">推荐阅读</span>[A PRACTICAL GUIDE TO MACHINE VISION LIGHTING](https://advancedillumination.com/a-practical-guide-to-machine-vision-lighting/)、[Lighting Technique: Diffuse Illumination](https://advancedillumination.com/lighting-education/lighting-technique-diffuse-illumination/)以及[Machine vision system introduction](https://flexbitautomation.com/machine-vision-system-introduction/)。

另一方面，光源与相机和被测物的相对位置也是非常重要的。如果光源与相机位于被测物的同一侧，我们称作正面光（front light），通常也叫入射光（incident light）。如果光源与相机
位于被测物量测，此时的光称作背光（back light），特别是当被测物是透明物体时，称作透射光（transmitted light）。

![](/images/202606/5/208e98508bafe8156f812e61ad73ab80_MD5.jpeg)

如果光源与被测物成一定角度，使得绝大部分光反射到相机，我们称作明场照明（bright-field illumination）；如果光源位置使得大部分光没有反射到相机，仅仅将照射到被测物体的特定部分的光反射到相机，我们称此种照明为暗场照明（dark-field illumination）。

##### 2.1.5.1 明场漫射正面照明 (Diffuse Bright-Field Front Light Illumination)

![](/images/202606/5/a612568e7d810647159e6ec799673c3d_MD5.jpeg)
常用于防止产生阴影，并用于减少或防止镜面反射。也可以用于透过被测物体的透明包装。

##### 2.1.5.2 明场直接正面照明 (Directed Bright-Field Front Light Illumination)

![](/images/202606/5/40d847bd4ff73ee4092e8b49fb9f9d1c_MD5.jpeg)

##### 2.1.5.3 暗场直接正面照明 (Directed Dark-Field Front Light Illumination)

![](/images/202606/5/84bf528de41f9104991bf059a8395f4d_MD5.jpeg)

如图2.11所示，环形光与物体表面呈非常小的角度，这样可以突出被测物的缺口和凸起，所以像划痕、纹理或雕刻文字等倍增强，看得更加清晰。

##### 2.1.5.4 明场漫射背光照明 (Diffuse Bright-Field Back Light Illumination)

![](/images/202606/5/5e871ca6db3d2ae691563a80d5802f71_MD5.jpeg)

##### 2.1.5.5 明场平行光背光照明 (Telecentric Bright-Field Back Light Illumination)

为了解决上述相机一侧的被测物某些部分也被照亮的问题，可以使用平行照明构造的直接明场背光照明。对于透视镜头，由于照明光源是平行光，光线在图像上是一个小点。因此，平行背光照明需要使用远心镜头配合，且照明与镜头位置需要仔细调整。这种照明会使被测物轮廓非常锐利，此外，由于使用远心镜头，图像也没有投射变形，所以这种照明常用于测量应用。

### 2.2 镜头 (Lenses)

镜头是一种光学设备用于聚集光线在数字传感器上成像，以得到被测物的细节。

#### 2.2.1 针孔相机 (Pinhole Cameras)

如果忽略光的波的特性，我们可以将光看作在同类介质中直线传播的光线。

![](/images/202606/5/7a1f329d98af66478f37329223caf91e_MD5.jpeg)

像的高度$y^{\prime}$：
$$y^{\prime} = y\frac{c}{a} \tag{2.2}$$
其中$y$为物体高度，$a$为物体到投影中心的距离，$c$为像平面到投影中心的距离。$c$被称为相机常数或主距。

#### 2.2.2 高斯光学 (Gaussian Optics)

针孔相机这种简单模型不能很对真实的镜头建模。因为只有极少量光线能够到达像平面。必须用非常长的曝光时间以得到亮度足够的图像。

> 针孔相机只有一个极小的孔，光几乎进不来，所以成像非常暗；真实镜头是用透镜把大量光线“收集并汇聚”到像面上的，亮度完全不是一个量级（一扇窗）。

**镜头是用来“收集光线”的**。曝光 = 让传感器“接光多久 + 接多少光”。

### 2.3 相机 (Cameras)

### 2.4 相机-计算机接口 (Camera-Computer Interfaces)

## 3. 机器视觉算法 (Machine Vision Algorithms)

为了突出感兴趣物体，光源经常是至关重要的。
为了在恰当时刻用正确的曝光来拍摄一副图像，带有外触发功能的图像卡和摄像机就是解决问题的关键。
为了获取清晰且没有畸变的图像，镜头就变得很重要。

### 3.1 基本数据结构 (Fundamental Data Structures)

### 3.2 图像增强 (Image Enhancement)

尽管我们尽力来选择最佳的硬件设置，但是有时图像还是不够好。

### 3.3 几何变换 (Geometric Transformations)

在许多应用中，并不能保证被测物在图像中总是处于同样的位置和方向。所以，检测算法必须能够应对这种位置的变化。因此，首先要解决的问题就是检测出被测物的物质和方向，即被测物的位姿。

本节中我们先假设位姿已知。此时，调整物体到检测所需位姿的最简单方法就是对ROI的位姿进行适当的调整。

#### 3.3.4 极坐标变换 (Polar Transformations)

极坐标变换通常被用来矫正图像中的圆形物体或被包含在圆环中的物体。

![](/images/202606/5/e88f426323eae1f234bc4a421450ac15_MD5.jpeg)

### 3.4 图像分割 (Image Segmentation)

为得到图像中的物体信息，必须进行图像分割，即提取图像中与感兴趣物体相对应的那些区域。描述得更正式些，分割操作以一幅图像作为输入而返回一个或多个区域或亚像素轮廓作为输出。

### 3.5 特征提取 (Feature Extraction)

### 3.6 形态学 (Morphology)

### 3.7 边缘提取 (Edge Extraction)

### 3.8 几何基元的分割和拟合 (Segmentation and Fitting of Geometric Primitives)

### 3.9 摄像机标定 (Camera Calibration)

### 3.10 三维重构 (3D Reconstruction)

### 3.11 模板匹配 (Template Matching)

### 3.12 三维物体识别 (3D Object Recognition)

### 3.13 手眼标定 (Hand-Eye Calibration)

### 3.14 光学字符识别 (Optical Character Recognition)

### 3.15 分类 (Classification)

## 4. 机器视觉应用 (Machine Vision Applications)

### 4.1 半导体晶片切割 (Wafer Diciing)

### 4.2 序列号读取 (Reading of Serial Numbers)

### 4.3 锯片检测 (Inspection of Saw Blades)

### 4.4 印刷检测 (Print Inspection)

### 4.5 BGA封装检查 (Inspection of Ball Grid Arrays)

### 4.6 表面检测 (Surface Inspection)

### 4.7 火花塞测量 (Measurement of Spark Plugs)

### 4.8 模制品披峰检测 (Molding Flash Detection)

### 4.9 冲孔板检查 (Inspection of Punched Sheets)

### 4.10 使用双目立体视觉系统进行三维平面重构 (3D Plane Reconstruction with Stereo)

### 4.11 电阻姿态检验 (Pose Verification of Resistors)

### 4.12 非织造布分类 (Classification of Non-Woven Fabrics)

### 4.13 表面比对 (Surface Comparison)

### 4.14 三维取放 (3D Pick-and-Place)

## 参考

[机器视觉算法与应用](https://book.douban.com/subject/34790232/)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E6%9C%BA%E5%99%A8%E8%A7%86%E8%A7%89%E7%AE%97%E6%B3%95%E4%B8%8E%E5%BA%94%E7%94%A8/  

