# OpenCV从入门到实战


在人工智能飞速发展的时代，计算机视觉已成为一门热门技术，而 OpenCV（Open Source Computer Vision Library）则是实现这一技术的重要工具。作为一个开源的跨平台计算机视觉与机器学习软件库，OpenCV 拥有丰富的功能，涵盖从基础的图像处理到复杂的视觉算法实现。本文将带你一步步探索 OpenCV 的世界：从简单的图像操作入门，到实现高效的计算机视觉应用，无论你是初学者还是有经验的开发者，都能找到适合你的内容。准备好了吗？让我们一起开启 OpenCV 的奇妙旅程！

<!--more-->

## 环境搭建

如何在 Visual Studio 项目中使用 OpenCV？本文将作完整介绍。

本文使用的环境是：

- Windows 10
- Visual Studio Community 2019

### 下载并解压预构建的库

截至到 2021 年 1 月 9 日的最新版本是 4.5.1 (opencv-4.5.1-vc14_vc15.exe)，该版本的 exe 文件可以在https://github.com/opencv/opencv/releases/下载，本文使用的是之前下载的4.5.0版本。

![](/images/202412/2/1.png)

当下载完成后，运行下载的.exe 文件以解压缩存档。

![](/images/202412/2/2.png)

提取结束后可以看到 F 盘下新增了一个 opencv 目录：

![](/images/202412/2/3.png)

### 添加环境变量

将`F:\opencv\build\x64\vc15\bin`目录添加到环境变量中，

![](/images/202412/2/4.png)

### 创建项目

在 Visual Studio 中创建一个新项目：

![](/images/202412/2/5.png)

这里选择的是`Console App`。

然后，将平台目标设置为 x64。因为预构建的二进制文件是为 x64 Windows 平台构建的。

![](/images/202412/2/6.png)

之后，选择菜单栏【Project】下的【项目名 Properties】：

![](/images/202412/2/7.png)

然后，找到【VC++ Directories】这一项，将其中的【Include Directories】和【Library Directories】两项的进行对应的添加。

![](/images/202412/2/8.png)

具体添加操作如下：

![](/images/202412/2/9.png)

![](/images/202412/2/10.png)

最后，找到【Linker】下的【Input】这一项，将其中的【Additional Dependencies】添加(具体操作如上图所示)`opencv_world450d.lib`。

![](/images/202412/2/11.png)

`opencv_world450d.lib`文件我们可以在`F:\opencv\build\x64\vc15\lib`目录找到。

![](/images/202412/2/12.png)

预备工作到此就结束了，接下来我们可以编写代码啦！😂

### 示例

这里我们做一个简单的示例，将一张本地的图片在窗口上显示出来，代码如下：

```C++
#include <iostream>
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc.hpp>

using namespace std;
using namespace cv;


int main()
{
	Mat image = imread("F:/avatar.jpeg");
	if (image.empty()) {
		cout << "Could not open or find the image" << endl;
		system("pause");
		return -1;
	}

	String windowName = "My Window";
	imshow(windowName, image);
	waitKey(0);
	return 0;
}
```

编译运行结果如下：

![](/images/202412/2/13.png)

想了解更多关于 OpenCV 的内容的话，请移步[OpenCV Tutorials](https://docs.opencv.org/4.5.0/d9/df8/tutorial_root.html)

OpenCV 库分为多个模块：opencv_core 模块包含库的核心功能，opencv_imgproc 模块包含主要的图像处理函数，opencv_highgui 模块提供读写图像和视频的函数以及一些用户交互函数，等等。在使用某个模块时，需要包含该模块对应的头文件。例如：

```C++
#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/highgui.hpp>
```

OpenCV 是用来处理图像的，接下来演示一下如何从文件中加载图像、在窗口中显示图像、使用处理函数再保存输出的图像。

## 加载、显示和存储图像

首先在 Visual Studio 中创建一个可以使用 OpenCV 的项目，具体可以参考[在 Visual Studio 项目中使用 OpenCV](./2.在Visual%20Studio项目中使用OpenCV.md)一文。

加载、显示图像的示例如下：

```C++
#include <opencv2/core.hpp>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <iostream>

int main()
{
	cv::Mat image;
	std::cout << "Image shape is : " << image.rows << " x " << image.cols << std::endl;
	image = cv::imread("F:/avatar.jpeg");
	if (image.empty()) {
		std::cout << "Could not open or find the image" << std::endl;
		return -1;
	}
	std::cout << "Image shape is : " << image.rows << " x " << image.cols << std::endl;
	cv::namedWindow("Window 1");
	cv::imshow("Window 2", image);
	cv::waitKey(0);
	return 0;
}
```

在 OpenCV 的 C++ API 中，所有类和函数都在命名空间 cv 内定义。我们创建了一个`Mat`对象 image，其初始化尺寸为`cols=0, rows=0`，可以通过访问 image 对象的`cols`和`rows`属性来了解其尺寸。

通过调用`imread()`函数，传入图像路径字符串，该函数会读入一个图像，解码分别配内存并返回一个`Mat`对象。

现在可以使用这副图像了，但是要先检查一下图像的读取是否正确（如果找不到文件、文件被破坏或者文件格式无法识别，就会发生错误）。可以使用`Mat`对象的`empty()`方法，如果没有分配图像数据该方法会返回`true`。

接下来将该图像显示出来，可以用 highgui 模块的函数来实现。首先定义显示图像的窗口，然后让图像在指定的窗口中显示出来。`namedWindow("Window 1")`函数会创建一个名为`Window 1`的窗口。`imshow("Window 2", image)`会创建一个名为`Window 2`的窗口，并将`image`对象在其中显示。

因为是控制台程序，`main()`函数结束时会关闭，所以我们使用了一个额外的`highgui`函数，待用户按键后再结束程序。`waitKey(0)`函数传入正数表示等待的毫秒数，0 表示永远地等待按键。

运行结果如下：

![](/images/202412/3/1.png)

可以使用`flip()`函数将图像翻转，我们用一个新的矩阵存放翻转输出结果。

```C++
cv::Mat result;
cv::flip(image, result, 1); // 0上下翻转; 正数左右翻转; 负数上下和左右翻转
```

## 绘制函数

OpenCV 提供了几个用于在图像上绘制形状和写入文本的函数。基本的形状绘制函数有`circle`，`ellipse`，`line`和`rectangle`。

我们来看一个绘制圆形的例子：

```C++
cv::circle(image, cv::Point(image.cols / 2, image.rows / 2), 65, 0, 3);
```

该函数的原型如下：

![](/images/202412/3/2.png)

又或者绘制一个矩形：

```C++
cv::rectangle(image, cv::Rect(10, 10, 25, 35), 0, 3);
```

该函数的原型如下：

![](/images/202412/3/3.png)

## `cv::Mat`

`cv::Mat`类是用来存放图像（以及其他矩阵数据）的数据结构。在所有 OpenCV 类和函数中，这个数据结构占据核心地位。

`cv::Mat`有两个组成部分：一个头部和一个数据块。头部包含了矩阵的所有相关信息（大小、通道数、数据类型），我们可以通过如`cols`、`rows`和`channels`等属性访问头部信息。数据块包含了图像所有的像素值。头部有一个指向数据块的指针，即`data`属性。`cv::Mat`有一个很重要的属性，即只有明确要求时，内存块才会被复制。

新创建的`cv::Mat`对象默认大小为 0，但也可以指定初始大小，例如：

```C++
cv::Mat image1(240, 320, CV_8U, 100);
```

需要指定每个矩阵元素的类型，这里用的是`CV_8U`，表示每个像素对应 1 字节（灰度图像），字母`U`表示无符号数；也可以用`S`表示有符号数。对于彩色图像，该用三通道类型`CV_8UC3`，也可以定义 16 位和 32 位的整数（有符号或无符号），例如`CV_16SC3`。

图像（或矩阵）的每个元素都可以包含多个值（例如彩色图像中的三个通道），因此 OpenCV 引入了一个简单的数据结构`cv::Scaler`，用于在调用函数时传递像素值。

例如创建一个彩色图像并用红色像素初始化：

```C++
// 创建一个红色图像
// 通道次序是BGR
cv::Mat image2(240, 320, CV_8UC3, cv::Scaler(0, 0, 255));
```

更多创建方式：

```C++
// 创建灰度图像
cv::Mat image3(240, 320, CV_8U, cv::Scaler(100));

// 使用cv::Size()创建图像
cv::Mat image4(cv::Size(240, 320), CV_8UC3);
```

可以随时用`create()`方法分配或重新分配图像的数据块。如果图像已被分配，原来的内容会先被释放。如果新的尺寸和类型与原来相同，就不会重新分配内存：

```C++
image4.create(200, 200, CV_8U);
```

`cv::Mat`实现了计数引用和浅复制。因此，当在两幅图像之间赋值时，图像数据并不会被复制，此时两幅图像都指向同一个内存块。

```C++
cv::Mat image4(image4);
image1 = image3;
```

如果要对图像内容做一个深复制，可以用`copyTo`方法，目标图像将会调用`create`方法。另一个生成图像副本的方法是`clone`，即创建一个完全相同的新图像：

```C++
image3.copyTo(image2);
cv::Mat image6 = image3.clone();
```

如果需要将一幅图像复制到另一幅图像中，且两者的数据类型不一定相同，那就可以使用`convertTo`方法。

```C++
image1.convertTo(image2, CV_32F, 1/255.0, 0.0);
```

## ROI

我们可以用如下方式定义一个感兴趣的区域（Region Of Interest, ROI）。

```C++
cv::Mat imageROI(image, cv::Rect(image.cols - logo.cols, image.rows - logo.rows,
    logo.cols, logo.rows));
```

之后，将`logo`复制到`imageROI`，完整代码如下：

```C++
#include <opencv2/core.hpp>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <iostream>

int main()
{
	cv::Mat image;
	std::cout << "Image shape is : " << image.rows << " x " << image.cols << std::endl;
	image = cv::imread("F:/avatar.jpeg");
	if (image.empty()) {
		std::cout << "Could not open or find the image" << std::endl;
		return -1;
	}
	cv::Mat logo;
	logo = cv::imread("F:/logo.png");
	if (logo.empty()) {
		std::cout << "Could not open or find the image" << std::endl;
		return -1;
	}
	cv::Mat imageROI(image, cv::Rect(image.cols - logo.cols, image.rows - logo.rows,
		logo.cols, logo.rows));
	logo.copyTo(imageROI);
	cv::imshow("Window 1", image);
	cv::waitKey(0);
	return 0;
}
```

运行结果：

![](/images/202412/3/4.png)

或者通过如下方式选取 ROI：

```C++
imageROI = image(cv::Range(image.rows-logo.rows, image.rows),cv::Range(image.cols-logo.cols, image.cols));
```

## 参考

- https://www.opencv-srf.com/2017/11/install-opencv-with-visual-studio.html
- https://medium.com/@subwaymatch/opencv-410-with-vs-2019-3d0bc0c81d96
- 《OpenCV 计算机视觉编程攻略 第 3 版》


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/opencv%E4%BB%8E%E5%85%A5%E9%97%A8%E5%88%B0%E5%AE%9E%E6%88%98/  

