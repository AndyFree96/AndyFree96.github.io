# WPF UI：让WPF应用具有Fluent Design风格


WPF(Windows Presentation Foundation)自.NET Framework 3.0发布以来，一直是Windows桌面应用开发的重要技术栈。凭借XAML、数据绑定、模板化控件以及MVVM架构，WPF在企业软件、工业软件、自动化设备控制软件领域拥有大量应用。随着Windows 10、Windows 11 Fluent Design设计语言的发展，传统WPF控件逐渐显得“跟不上时代”。对于很多新项目，技术上想使用WPF的成熟生态，但是视觉体验上又希望接近Windows 11原生应用。这就是WPF UI诞生的原因之一。[WPF UI](https://wpfui.lepo.co/index.html)是一个基于WPF的现代UI框架，它为传统WPF应用提供[Fluent Design](https://en.wikipedia.org/wiki/Fluent_Design_System)风格的控件、主题以及现代化交互体检。

<!--more-->

## 开始使用

为了使用[WPF UI](https://wpfui.lepo.co/index.html)，我们需要在WPF项目中安装WPF UI NuGet包。

```pwsh
dotnet add package WPF-UI
```

接着修改`App.xaml`文件配置主题：

```xml
<Application x:Class="LepoDemo.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:ui="http://schemas.lepo.co/wpfui/2022/xaml"
             xmlns:local="clr-namespace:LepoDemo"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
         <ResourceDictionary>
             <ResourceDictionary.MergedDictionaries>
                 <ui:ThemesDictionary Theme="Dark"></ui:ThemesDictionary>
                 <ui:ControlsDictionary />
             </ResourceDictionary.MergedDictionaries>
         </ResourceDictionary>
    </Application.Resources>
</Application>

```

将`MainWindow.xaml`中`Window`替换为`ui:FluentWindow`:

```xml
<ui:FluentWindow x:Class="LepoDemo.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:ui="http://schemas.lepo.co/wpfui/2022/xaml"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:LepoDemo"
        mc:Ignorable="d"
        Width="1450"
        Height="802"
        MinWidth="900"
        Title="MainWindow" >
    <Grid>
        <ui:TitleBar
            x:Name="TitleBar"
            Title="Vision System"
            CloseWindowByDoubleClickOnIcon="True">
        </ui:TitleBar>
        
        <ui:Button
            Content="Start"
            Appearance="Primary"
            Icon="{ui:SymbolIcon Play24}" />
    </Grid>
</ui:FluentWindow>
```

`MainWindow.xaml.cs`后台代码继承`FluentWindow`：

```c#
public partial class MainWindow : FluentWindow
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

运行后，可看到一个Fluent Design风格的窗口。

![图1 带有Fluent Design风格的窗口](/images/202608/3/1.png "图1 带有Fluent Design风格的窗口")

---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/wpf-ui/  

