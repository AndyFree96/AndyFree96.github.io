# 深入解析CSS


&lt;!-- - **2022/11/10 更新**: 增加**背景、阴影和混合模式**
- **2022/11/14 更新**: 增加**选择器**和**预处理器** --&gt;

- **2023/11/23 更新**: 增加 4 个练习**项目**——Parallax scroll animation、Voyage Slider、App Menu With Lock Screen 和 Old Film Effect
- **2023/12/13 更新**: 增加练习**项目**——Polaroid Camera
&lt;!--more--&gt;

## 准备

随书代码: https://github.com/CSSInDepth/css-in-depth

Node.js: https://nodejs.org/en/

Visual Studio Code: https://code.visualstudio.com/

Git: https://git-scm.com/

## 层叠、优先级和继承

### 层叠

当声明冲突时，层叠会依据三种条件解决冲突。

1. **样式表的来源**: 样式是从哪里来的，包括你的样式和浏览器默认样式。
2. **选择器优先级**: 哪些选择器比另一些选择器更重要。
3. **源码顺序**: 样式在样式表里的声明顺序。

![](/images/202402/2/1.png)

选择器和声明块一起构成了**规则集**（ruleset）。一个规则集也简称一个**规则**。

**@规则**（at-rules）是指用`@`符号开头的语法，比如`@import`规则或者`@media`查询。

#### 样式表的来源

自己的样式表属于作者样式表，除此之外还有用户代理样式表，即浏览器默认样式。用户代理样式表优先级低，自己的样式会覆盖它们。

标记了`!important`的声明会被当作更高优先级的来源，因此总体的优先级按照由高到低排列如下所示:

1. 作者的`!important`
2. 作者
3. 用户代理

#### 理解优先级

如果无法用来源解决冲突声明，浏览器会尝试检查它们的**优先级**。

浏览器将优先级分为两部分: HTML 的行内样式和选择器样式。

优先级的规则如下：

- 如果选择器的 ID 数量更多，则它会胜出。
- 如果 ID 数量一致，那么拥有更多类的选择器胜出。
- 如果以上两次比较都一致，那么拥有最多标签名的选择器胜出。

&gt; 伪类选择器（如`:hover`）和属性选择器（如`[type=&#34;input&#34;]`）与一个类选择器的优先级相同。通用选择器（`*`）和组合器（`&gt;`、`&#43;`、`~`）对优先级没有影响。

我们可以用优先级标记来比较不同选择器的优先级:

![](/images/202402/2/2.png)

**通常最好让优先级尽可能低，这样当需要覆盖一些样式时，才能有选择空间。**

#### 源码顺序

如果两个声明的来源和优先级相同，其中一个声明在样式表中出现比较晚，或者位于页面较晚引入的样式表中，则该声明胜出。

#### 两条经验法则

1. **在选择器中不要使用 ID**。就算只用一个 ID，也会大幅度提升优先级。但需要覆盖整个选择器时，通常找不到另一个有意义的 ID，于是就会复制原来的选择器，然后加上另一个类，以区别想要覆盖的选择器。
2. **不要使用`!important`**。它比 ID 更难覆盖，一旦用了它，想要覆盖原先的声明，就需要加上一个`!important`，而且依然要处理优先级的问题。

### 继承

只有特定的属性能被继承，通常是我们希望被继承的那些。它们主要是跟文本相关的属性:

- color
- font
- font-family
- font-size
- font-weight
- font-variant
- font-style
- line-height
- letter-spacing
- text-align
- text-indent
- text-transform
- white-space
- word-spacing

列表属性也可以被继承:

- list-style
- list-style-type
- list-style-position
- list-style-image

活用开发者工具了解具体情况:

![](/images/202402/2/3.png)

### 特殊值

有两个特殊值可以赋给任意属性，用户控制层叠: `inherit`和`initial`。

### 简写属性

https://developer.mozilla.org/zh-CN/docs/Web/CSS/Shorthand_properties

## 相对单位

相对单位会根据外部因素发生变化。例如，`2em`的具体值会更具它作用到的元素（有时甚至是根据属性）而变化。

### 相对单位的好处

**响应式**: 能够根据浏览器窗口的大小有不同的“响应”。

### em 和 rem

在 CSS 中，`1em`等于当前元素的字号，其准确值取决于作用的元素。

浏览器会根据相对单位的值计算出绝对值，称作计算值（computed value）。

#### 使用 em 定义字号

如果声明`font-size: 1.2em`，这个`font-size`是根据继承的字号来计算的。

```CSS
body {
  font-size: 16px;
}

.slogan {
  font-size: 1.2em; /* 19.2px */
  padding: 1.2em; /* 23.04px */
}
```

字体缩小问题

![](/images/202402/2/4.png)

```CSS
body {
  font-size: 16px;
}

ul {
  font-size: .8em;
}
```

会导致嵌套的列表字体越来越小。纠正方法如下:

```CSS
ul {
  font-size: .8em;
}

ul ul {
  font-size: 1em;
}
```

#### 使用 rem 设置字号

根节点有一个伪类选择器（`:root`），可以用来选中它自己。这等价于类型选择器`html`，但`html`的优先级相当于一个类名，而不是标签。

`rem`是 root em 的缩写。rem 不是相当于当前元素，而是相对于根元素的单位。

```CSS
:root {
  font-size: 1em; /* 使用浏览器的默认字号(16px) */
}

ul {
  font-size: .8rem; /* 12.8px */
}
```

提示: 拿不准的时候，用 rem 设置字号，用 px 设置边框，用 em 设置其他大部分属性。

通过这种策略，可以轻松构建响应式面板:

![](/images/202402/2/5.png)

```CSS
.panel {
  padding: 1em;
  border-radius: 0.5em;
  border: 1px solid #999;
}

.panel &gt; h2 {
  margin-top: 0;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}
```

使用媒体查询改变根元素的字号。这样就可以基于不同用户的屏幕尺寸，渲染出不同大小的面板。

```CSS
:root {
  font-size: 0.75em;
}

@media (min-width: 800px) {
  /* 宽度800px以上 */
  :root {
    font-size: 0.875em;
  }
}

@media (min-width: 1200px) {
  /* 宽度1200px以上 */
  :root {
    font-size: 1em;
  }
}
```

充分体现了使用`em`的优势。

### 视口的相对单位

**视口**: 浏览器窗口中网页可见部分的边框区域。不包括浏览器的地址栏、工具栏、状态栏。

- vh: 视口高度的 1/100
- vw: 视口宽度的 1/100
- vmin: 视口宽、高中较小一方的 1/100
- vmax: 视口宽、高中较大一方的 1/100

#### 使用 vw 定义字号

给一个元素加上`font-size: 2vw`在一个 1200px 的显示器上计算值为 24px。在一个 768px 宽的平板上，计算值约为 15px。这样做的好处在于元素能够在这两种大小之间平滑地过渡，

这意味着不会在某个断点突然开始改变。当视口大小改变时，元素会逐渐过渡。

#### 使用 calc()定义字号

calc()函数内可以对两个及其以上的值进行基本运算。支持的运算包括加减乘除。

```CSS
:root {
  font-size: calc(0.5em &#43; 1vw);
}
```

https://gist.github.com/basham/2175a16ab7c60ce8e001

### 自定义属性(即 CSS 变量)

定义一个自定义属性:

```CSS
:root {
  --main-font: Helvetica, Arial, sans-serif;
}

p {
  font-family: var(--main-font);
}
```

变量名用两个连字符用来和 CSS 属性区分。

变量必须在一个声明块内声明。这里用了`:root`选择器，所以可以在整个网页使用。

var()函数接受第二个参数，它指定了备用值。如果第一个参数指定的变量未定义，那么就会使用第二个值。

若 var()函数算出来的是一个非法值，对应的属性就会设置为其初始值。

#### 动态改变自定义属性

自定义属性的声明能够层叠和继承：可以再多个选择器中定义相同的变量，这个变量在网页的不同地方有不同的值。

如下所示:

```HTML
&lt;!DOCTYPE html&gt;
&lt;html lang=&#34;en&#34;&gt;
  &lt;head&gt;
    &lt;meta charset=&#34;UTF-8&#34; /&gt;
    &lt;meta http-equiv=&#34;X-UA-Compatible&#34; content=&#34;IE=edge&#34; /&gt;
    &lt;meta name=&#34;viewport&#34; content=&#34;width=device-width, initial-scale=1.0&#34; /&gt;
    &lt;title&gt;导航&lt;/title&gt;
    &lt;link rel=&#34;stylesheet&#34; href=&#34;style.css&#34; /&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;header class=&#34;page-header&#34;&gt;
      &lt;h1 class=&#34;title&#34; id=&#34;page-title&#34;&gt;Wombat Coffe Roasters&lt;/h1&gt;
      &lt;nav&gt;
        &lt;ul class=&#34;nav&#34; class=&#34;main-nav&#34;&gt;
          &lt;li&gt;&lt;a href=&#34;/&#34;&gt;Home&lt;/a&gt;&lt;/li&gt;
          &lt;li&gt;&lt;a href=&#34;/coffees&#34;&gt;Coffes&lt;/a&gt;&lt;/li&gt;
          &lt;li&gt;&lt;a href=&#34;/brewers&#34;&gt;Brewers&lt;/a&gt;&lt;/li&gt;
          &lt;li&gt;
            &lt;a href=&#34;/specials&#34; class=&#34;featured&#34;&gt;Specials&lt;/a&gt;
          &lt;/li&gt;
        &lt;/ul&gt;
      &lt;/nav&gt;
    &lt;/header&gt;
    &lt;main&gt;
      &lt;div class=&#34;panel&#34;&gt;&lt;/div&gt;
      &lt;div class=&#34;panel dark&#34;&gt;&lt;/div&gt;
    &lt;/main&gt;
  &lt;/body&gt;
&lt;/html&gt;
```

```CSS
:root {
  font-size: calc(0.5em &#43; 0.5vw);
  --bg-color: #368;
}

h1 {
  font-family: sans-serif;
}

##page-title {
  font-family: sans-serif;
}

.title {
  font-family: monospace;
}

.panel {
  width: 5em;
  height: 5em;
  background-color: var(--bg-color);
  margin: 1em;
}

.dark {
  --bg-color: #000;
}

```

#### 使用 JavaScript 改变自定义属性

```JavaScript
const rootElement = document.documentElement;
const styles = getComputedStyle(rootElement);
const bgColor = styles.getPropertyValue(&#34;--bg-color&#34;);
console.log(String(bgColor).trim());
rootElement.style.setProperty(&#34;--bg-color&#34;, &#34;red&#34;);
```

### 盒模型

#### 调整盒模型

在 CSS 中可以使用`box-sizing`属性调整盒模型的行为。其默认值为`content-box`，任何指定的宽或高都只会设置内容盒子的大小。将其值设为`border-box`后，`height`和`width`属性会设置内容、内边距以及边框的大小总和。

![](/images/202402/2/6.png)

#### 全局设置 border-box

通用选择器`*`可以选中页面上所有元素，并用两个选择器选中网页的所有伪元素。

```CSS
*,
::before,
::after {
  box-sizing: border-box;
}
```

如果用了第三方组件，使用上述方式可能会破坏其中一些组件的布局。我们可以利用继承改一下修改盒模型的方式。

```CSS
:root {
  box-sizing: border-box;
}

*,
::before,
::after {
  box-sizing: inherit;
}
```

### 元素高度的问题

通常最好避免给元素指定明确的高度。普通文档流是为限定的宽度和无限的高度设计的。内容会填满视口的高度，然后在必要的时候折行。因此，容器的高度由内容天然地决定，而不是容器自己决定。

&gt; 普通文档流——指的是网页元素的默认布局行为。行内元素跟随文字的方向从左到右排列，当到达容器边缘时会换行。块级元素会占据完整的一行，前后都有换行。

#### 控制溢出行为

当明确设置一个元素的高度时，内容可能会溢出。当内容在限定区域放不下渲染到父元素外面时，就会发生这种现象。

用 overflow 属性可以控制溢出内容的行为，该属性支持以下 4 个值。

- visible（默认值）——所有内容可见，即使溢出容器边缘。
- hidden——溢出容器内边距边缘的内容被裁剪，无法看见。
- scroll——容器出现滚动条。
- auto——只有内容溢出时容器才会出现滚动条。

#### 百分比高度的备选方案

用百分比指定高度存在问题。百分比参考的事元素容器块的大小，但是容器的高度通常是由子元素的高度决定的。这样会造成死循环，浏览器处理不了，因此它会忽略这个声明。想要让百分比高度生效，必须给父元素明确定义一个高度。

**CSS 表格布局**

给容器设置`display: table`，给每一列设置`display: table-cell`。这里没有`table-row`元素，因为 CSS 表格不像 HTML 表格那样必须有行元素。

不像`block`的元素，默认情况下，显示为`table`的元素宽度不会扩展到 100%，因此需要明确指定宽度。但外边距不会作用于`table-cell`元素。

可以用表格元素`border-spacing`属性来定义单元格的间距。该属性接受两个长度值: 水平间距和垂直间距。可以给容器加上`border-spacing: 1.5em 0`，但这会产生一个副作用: 这个值也会作用于表格的外边缘。如此一来就无法和头部左右对齐。

我们可以使用负外边距解决这个问题，但这需要给整个表格包裹一层新的容器。代码如下:

```HTML
&lt;!DOCTYPE html&gt;
&lt;html lang=&#34;en&#34;&gt;
  &lt;head&gt;
    &lt;meta charset=&#34;UTF-8&#34; /&gt;
    &lt;meta http-equiv=&#34;X-UA-Compatible&#34; content=&#34;IE=edge&#34; /&gt;
    &lt;meta name=&#34;viewport&#34; content=&#34;width=device-width, initial-scale=1.0&#34; /&gt;
    &lt;title&gt;盒模型&lt;/title&gt;
    &lt;link rel=&#34;stylesheet&#34; href=&#34;style.css&#34; /&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;header&gt;
      &lt;h1&gt;Franklin Running Club&lt;/h1&gt;
    &lt;/header&gt;
    &lt;div class=&#34;wrapper&#34;&gt;
      &lt;div class=&#34;container&#34;&gt;
        &lt;main class=&#34;main&#34;&gt;
          &lt;p&gt;
            The Franklin Running Club meets at 6:00pm every Thursday at the town
            square. Runs are three to five miles, at your own pace.
          &lt;/p&gt;
        &lt;/main&gt;
        &lt;aside class=&#34;sidebar&#34;&gt;
          &lt;div class=&#34;widget&#34;&gt;&lt;/div&gt;
          &lt;div class=&#34;widget&#34;&gt;&lt;/div&gt;
        &lt;/aside&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/body&gt;
&lt;/html&gt;

```

样式设置如下:

```CSS
:root {
  box-sizing: border-box;
}

*,
::before,
::after {
  box-sizing: inherit;
}

.wrapper {
  margin-left: -1.5em;
  margin-right: -1.5em;
}

.container {
  display: table;
  border-spacing: 1.5em 0;
  width: 100%;
}

body {
  background-color: #eee;
  font-family: Helvetica, Arial, sans-serif;
}

header {
  color: #fff;
  background-color: #0072b0;
  border-radius: 0.5em;
}

main {
  display: block;
}

.main {
  display: table-cell;
  width: 70%;
  background-color: #fff;
  border-radius: 0.5em;
}

.sidebar {
  display: table-cell;
  margin-left: 1.5em;
  width: calc(30% - 1.5em);
  padding: 1.5em;
  background-color: #fff;
  border-radius: 0.5em;
}
```

**Flexbox**

还可以用 Flexbox 实现两列等高布局。Flexbox 不需要一个额外的 div 包裹元素，它默认会产生等高的元素，也不需要使用负外边距。

```CSS
:root {
  box-sizing: border-box;
}

*,
::before,
::after {
  box-sizing: inherit;
}

.container {
  display: flex;
}

body {
  background-color: #eee;
  font-family: Helvetica, Arial, sans-serif;
}

header {
  color: #fff;
  background-color: #0072b0;
  border-radius: 0.5em;
}

main {
  display: block;
}

.main {
  width: 70%;
  background-color: #fff;
  border-radius: 0.5em;
}

.sidebar {
  width: 30%;
  padding: 1.5em;
  margin-left: 1.5em;
  background-color: #fff;
  border-radius: 0.5em;
}

```

弹性容器（Flex Container）子元素默认等高。

#### 使用 min-height 和 max-height

可以用这两个属性指定最小或最大值，而不是明确定义高度，这样元素就可以再这些界限内自动决定高度。

可以用`min-height`指定一个最小高度，而不指定它的明确高度。这意味着元素至少等于指定的高度，如果内容太多，浏览器就会允许元素自己扩展高度，以免内容溢出。

`max-height`允许元素自然地增加到一个特定界限。如果到达这个界限，元素就不再增高，内容会溢出。

还有类似属性`min-width`和`max-width`。

#### 垂直居中

给块级元素设置`vertical-align: middle`后，通常不能垂直居中，因为浏览器会忽略这个声明。

`vertical-align`声明只会影响行内元素或`table-cell`元素。

**垂直居中指南**

![](/images/202402/2/7.png)

http://howtocenterincss.com/

### 负外边距

https://www.educba.com/negative-margin-css/

### 外边距折叠

在没有其他 CSS 的影响下，所以相邻的顶部和底部外边距都会折叠。

&gt; 只有上下外边距会产生折叠，左右外边距不会折叠。

如下方法可以防止外边距折叠：

![](/images/202402/2/8.png)

### 容器内的元素间距

**猫头鹰选择器**

```CSS
body * &#43; * {
  margin-top: 1.5em;
}
```

## 理解浮动

### 浮动的设计初衷

**浮动**能将一个元素（通常是一张图片）拉到容器的一侧，这样文档流就能包围它。

![](/images/202402/2/9.png)

浮动元素会被移除正常文档流，并被拉到容器边缘。文档流会重新排列，但是它会包围浮动元素此刻所占据的空间。

如果让多个元素向同侧浮动，它们就会挨着排列。

### 容器折叠和清楚浮动

#### 理解容器折叠

```HTML
&lt;!doctype html&gt;
&lt;head&gt;
  &lt;style&gt;
    :root {
      box-sizing: border-box;
    }

    *,
    ::before,
    ::after {
      box-sizing: inherit;
    }

    body {
      background-color: #eee;
      font-family: Helvetica, Arial, sans-serif;
    }

    body * &#43; * {
      margin-top: 1.5em;
    }

    header {
      padding: 1em 1.5em;
      color: #fff;
      background-color: #0072b0;
      border-radius: .5em;
      margin-bottom: 1.5em;
    }

    .main {
      padding: 0 1.5em;
      background-color: #fff;
      border-radius: .5em;
    }

    .container {
      max-width: 1080px;
      margin: 0 auto;
    }

    .media {
      float: left;
      width: 50%;
      padding: 1.5em;
      background-color: #eee;
      border-radius: 0.5em;
    }
  &lt;/style&gt;
&lt;/head&gt;

&lt;body&gt;
  &lt;div class=&#34;container&#34;&gt;
    &lt;header&gt;
      &lt;h1&gt;Franklin Running Club&lt;/h1&gt;
    &lt;/header&gt;

    &lt;main class=&#34;main clearfix&#34;&gt;
      &lt;h2&gt;Running tips&lt;/h2&gt;

      &lt;div&gt;
        &lt;div class=&#34;media&#34;&gt;
          &lt;img class=&#34;media-image&#34; src=&#34;runner.png&#34;&gt;
          &lt;div class=&#34;media-body&#34;&gt;
            &lt;h4&gt;Strength&lt;/h4&gt;
            &lt;p&gt;
              Strength training is an important part of
              injury prevention. Focus on your core&amp;mdash;
              especially your abs and glutes.
            &lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div class=&#34;media&#34;&gt;
          &lt;img class=&#34;media-image&#34; src=&#34;shoes.png&#34;&gt;
          &lt;div class=&#34;media-body&#34;&gt;
            &lt;h4&gt;Cadence&lt;/h4&gt;
            &lt;p&gt;
              Check your stride turnover. The most efficient
              runners take about 180 steps per minute.
            &lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div class=&#34;media&#34;&gt;
          &lt;img class=&#34;media-image&#34; src=&#34;shoes.png&#34;&gt;
          &lt;div class=&#34;media-body&#34;&gt;
            &lt;h4&gt;Change it up&lt;/h4&gt;
            &lt;p&gt;
              Don&#39;t run the same every time you hit the
              road. Vary your pace, and vary the distance
              of your runs.
            &lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div class=&#34;media&#34;&gt;
          &lt;img class=&#34;media-image&#34; src=&#34;runner.png&#34;&gt;
          &lt;div class=&#34;media-body&#34;&gt;
            &lt;h4&gt;Focus on form&lt;/h4&gt;
            &lt;p&gt;
              Run tall but relaxed. Your feet should hit
              the ground beneath your hips, not out in
              front of you.
            &lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;

      &lt;/div&gt;
    &lt;/main&gt;
  &lt;/div&gt;
&lt;/body&gt;

```

效果如下：

![](/images/202402/2/10.png)

容器白色的背景没有延伸到媒体盒子后面。这是因为浮动元素不同于普通文档流的元素，它们的高度不会加到父元素上。

一个解决的办法是使用和浮动配套的`clear`属性。将一个元素放在主容器末尾，并对其使用`clear`，这会让容器扩展到浮动元素下面。

```HTML
&lt;main class=&#34;main&#34;&gt;
  ...
  &lt;div style=&#34;clear: both;&#34;&gt;&lt;/div&gt;
&lt;/main&gt;
```

因为空`div`本身没有浮动，所以容器就会扩展，直到包含它。

#### 理解清除浮动

&gt; 伪元素——特殊的选择器，可以选中文档的特定部分。伪元素以双冒号开头，大部分浏览器为了向后兼容也支持单冒号形式。

```CSS
.clearfix::after {
  display: block;
  content: &#34; &#34;;
  clear: both;
}
```

要给包含浮动的元素清除浮动。

https://learningnow.com.tw/css-float/

## Flexbox

### Flexbox 的原则

给元素添加`display: flex`，该元素就变成了一个弹性容器（`Flex Container`），它的直接子元素就变成了弹性子元素（`Flex Item`）。弹性子元素默认是在同一行按照从左到右的顺序并排排列。

![](/images/202402/2/11.png)

### 弹性子元素的大小

`flex`属性控制弹性子元素在主轴方向上的大小（宽度）。

```CSS
.column-main {
  flex: 2;
}

.column-sidebar {
  flex: 1;
}
```

`flex`属性是三个不同大小属性的简写：`flex-grow`、`flex-shrink`和`flex-basis`。

`flex: 2`等价于`flex: 2 1 0%`，也可以分别声明:

```CSS
.column-main {
  flex-grow: 2;
  flex-shrink: 1;
  flex-basis: 0%;
}
```

#### 使用`flex-basis`属性

`flex-basis`定义了元素大小的基准值，即一个初始的主尺寸。`flex-basis`属性可以设置为任意的 width 值，包括 px、em、百分比。它的初始值是`auto`，此时浏览器会检查元素是否设置了`width`属性值。如果有，则使用`width`的值作为`flex-basis`的值；如果没有，则用元素内容自身的大小。使用`flex-basis`的值不是 auto，width 属性会被忽略。

![](/images/202402/2/12.png)

#### 使用`flex-grow`属性

每个弹性子元素的`flex-basis`值计算出来后，它们（加上子元素之间的外边距）加起来会占据一定的宽度。加起来的宽度不一定正好填满弹性容器的宽度，多出来的留白会按照 flex-grow 的值分配每个弹性子元素。

flex-grow 的值为非负数。若一个弹性子元素的值 flex-grow 值为 0，那么它的宽度不会超过 flex-basis 的值；如果某个弹性子元素的 flex-grow 非 0，那么这些元素会增长到所有的剩余空间被分配完。

![](/images/202402/2/13.png)

#### 使用`flex-shrink`属性

计算出弹性子元素的初始主尺寸后，它们的累加值可能会超出弹性容器的可用宽度。如果不用`flex-shrink`，就会导致溢出。

![](/images/202402/2/14.png)

![](/images/202402/2/15.png)

### 弹性方向

![](/images/202402/2/16.png)

### 对齐、间距等细节

通常情况下，创建一个弹性盒子方法如下:

- 选择一个容器及其子元素，给容器设置`display: flex`
- 如有必要，给容器设置`flex-direction`
- 给弹性子元素设置外边距和/或 flex 值，用来控制它们的大小

#### 理解弹性容器的属性

弹性容器的属性:

![](/images/202402/2/17.png)

![](/images/202402/2/18.png)

弹性子元素的属性:

![](/images/202402/2/19.png)

## 网格布局

### 网页布局开启新纪元

和 Flexbox 类似，设置为`display: grid`的元素成为一个网格容器。它的子元素变成网格元素。

```CSS
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-gap: 0.5em;
}

.grid &gt; * {
  background-color: darkgray;
  color: white;
  padding: 2em;
  border-radius: 0.5em;
}
```

`grid-template-columns`和`grid-template-rows`定义了网格每列每行的大小。使用了一个新单位`fr`，代表每一列（或每一行）的分数单位（fraction unit）。

这个单位和 Flexbox 中`flex-grow`因子的表现一样。

### 网络剖析

![](/images/202402/2/20.png)

repeat()函数，在声明多个网格轨道时提供了简写方式。`grid-template-rows: repeat(4, auto);`定义了四个水平网格轨道。轨道大小设置为`auto`，轨道会根据自身内容扩展。

用`repeat()`符号还可以定义不同的重复模式，比如`repeat(3, 2fr, 1fr)`会重复三遍这个模式，从而定义 6 个网格轨道。

可以给网格线或网格区域命名。

### 显式和隐式网格

使用`grid-template-*`属性定义网格轨道时，创建的是显式网格。

可以给网格容器设置`grid-auto-columns`和`grid-auto-rows`为隐式网格轨道指定一个大小。

### 对齐

![](/images/202402/2/21.png)

CSS Grid 网格布局教程: https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html

最强大的 CSS 布局 —— Grid 布局: https://juejin.cn/post/6854573220306255880

## 定位和层叠上下文

`position`属性可以用来构建下拉菜单、模态框以及现代 Web 应用程序的一些基本效果。

`position`属性的初始值是`static`。如果把它改成其他值，就说元素被定位了。若元素使用了静态定位，那么就说它未被定位。

定位将元素彻底从文档流中移走，允许将元素放在屏幕的任意位置。

### 固定定位

给一个元素设置`position: fixed`就能将元素放在视口的任意位置。这需要搭配四种属性一起使用：`top`、`right`、`bottom`和`left`。

这些属性的值决定了固定定位的元素与浏览器视口边缘的距离。

### 绝对定位

绝对定位不是相对视口，而是相对最近的祖先定位元素。

&gt; 如果祖先元素都没有定位，那么绝对定位的元素会基于初始包含块来定位。初始包含块和视口一样大，固定在网页的顶部。

### 相对定位

相对定位会让元素从原来的位置移走。

### 层叠上下文和`z-index`

拥有较高`z-index`的元素出现在拥有较低`z-index`的元素前面。拥有负数`z=index`的元素出现在静态元素后面。

## 响应式设计

响应式设计的三大原则:

1. 移动优先。在实现桌面布局之前先构建移动版的布局。
2. @media 规则。使用该样式规则，可以为不同大小的视口定制样式。通常叫作媒体查询，写的样式只有在特定条件下才会生效。
3. 流式布局。这种方式允许容器根据视口宽度缩放尺寸。

### 移动优先

构建桌面版之前要先构建移动端布局。

移动端布局一般是很朴素的设计。主要关注的是内容，在大屏上，可以把页面的大块区域拿来做头部、主图和菜单。在移动设备上，用户通常有更明确的目标。

&gt; 做响应式设计时，要确保 HTML 包含各种屏幕尺寸所需的全部内容。可以对每个屏幕尺寸应用不同的 CSS，但必须共享同一份 HTML。

断点（breakpoint）：一个特殊的临界值。屏幕尺寸到达这个值时，网页的样式会发生改变，以便给当前屏幕尺寸提供最佳的布局。

视口`meta`标签。该 HTML 标签告知移动设备，已特意将网页适配了小屏设备。如果不加该标签，移动浏览器会假定网页不是响应式的，并且会尝试模拟桌面浏览器，那之前的移动端设计就白做了。

为了避免这种情况，我们将`meta`标签包含进去。

```HTML
  &lt;head&gt;
    &lt;meta charset=&#34;UTF-8&#34; /&gt;
    &lt;meta name=&#34;viewport&#34; content=&#34;width=device-width, initial-scale=1&#34; /&gt;
    &lt;title&gt;Wombat Coffee Roasters&lt;/title&gt;
    &lt;link rel=&#34;stylesheet&#34; href=&#34;./style.css&#34; /&gt;
  &lt;/head&gt;
```

`meta`标签的`content`属性里包含两个选项。首先，它告诉浏览器当解析 CSS 时将设备宽度作为假定宽度，而不是一个全屏的桌面浏览器宽度。其次，当页面加载时，它使用`initial-scale`将缩放比设置为 100%。

&gt; 现代浏览器的开发者工具提供了模拟移动浏览器的功能。

Using the viewport meta tag to control layout on mobile browsers: https://udn.realityripple.com/docs/Mozilla/Mobile/Viewport_meta_tag

### 媒体查询

媒体查询允许某些样式只在页面满足特定条件时才生效。这样就可以根据屏幕大小定制样式。可以针对小屏设备定义一套样式，针对中等屏幕设备定义另一套样式，针对大屏幕设备再定义一套样式，这样就可以让页面的内容拥有多种布局。

媒体查询使用`@media`规则选择满足条件的设备。一条简单的媒体查询如下所示:

```CSS
@media (min-width: 560px) {
  .title &gt; h1 {
    font-size: 2.25rem;
  }
}
```

在最外层的大括号内可以定义任意的样式规则。`@media`规则会对条件进行见检查，只有满足所有的条件时，才会让这些样式应用到页面上。上例中浏览器会检查`min-width: 560px`。只有当设备的视口宽度大于等于 560px 时，才会给标题设置`2.25rem`的字号，否则将会被忽略。

在媒体查询里更适合用 em，如:

```CSS
.title &gt; h1 {
  color: #333;
  text-transform: uppercase;
  font-size: 1.5rem;
  margin: 0.2em 0;
}

@media (min-width: 35em) {
  .title &gt; h1 {
    font-size: 2.25rem;
  }
}
```

#### 媒体查询的类型

可以进一步将两个条件用`and`关键字联合起来组成一个媒体查询，如下所示:

```
@media (min-width: 20em) and (max-width: 35em) {...}
```

这种联合媒体查询只在设备同时满足两个条件时生效。若设备只需满足多个条件之一，可以用逗号分隔:

```
@media (max-width: 20em), (min-width: 35em) {...}
```

还有一些别的媒体特征，参考: https://developer.mozilla.org/en-US/docs/Web/CSS/@media

#### 给网页添加断点

在任何媒体查询之前，最先写的是移动端样式，然后设置越来越大的断点。

![](/images/202402/2/22.png)

### 流式布局

流式布局（Fluid Layout），有时被称作液体布局（Liquid Layout），指的是使用的容器随视口宽度而变化。它和固定布局相反，固定布局的列都是用 px 或 em 单位定义。固定容器（例如，设定了`width: 800px`的元素）在小屏上会超出视口范围，导致需要水平滚动条，而流式容器会自动缩小以适应视口。

### 响应式图片

创建不同分辨率的图片副本，利用媒体查询发送合适的图片。或者使用`srcset`提供对应的图片。

The anatomy of responsive images: https://jakearchibald.com/2015/anatomy-of-responsive-images/

### 推荐

RWD 是什么？: https://welly.tw/serp-rank-optimization/what-is-rwd-and-how-to-use

The Beginner&#39;s Guide to Responsive Web Design: https://kinsta.com/blog/responsive-web-design/

## 模块化 CSS

### 基础样式: 打好基础

每个样式表的开头都要写一些给整个页面使用的通用规则。这些规则通常被称为基础样式，其他样式是构建在这些基础样式之上的。

```CSS
:root {
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

body {
  font-family: Helvetica, Arial, sans-serif;
}
```

[normalize.css](https://github.com/necolas/normalize.css/)库，可以协助消除不同客户端浏览器上的不一致。

## 模式库

## 背景、阴影和混合模式

### 渐变

`background`属性还有很多功能等着我们去探索，实际上，它是以下八个属性的简写。

- `background-image`: 指定一个文件或生成的颜色渐变作为背景图片
- `background-position`: 设置背景图片的初始位置
- `background-size`: 指定元素内背景图片的渲染尺寸
- `background-repeat`: 决定在需要填充整个元素时，是否平铺图片
- `background-origin`: 决定背景相对于元素的边框盒、内边距框盒（初始值）或内容盒子来定位
- `background-clip`: 指定背景是否应该填充边框盒（初始值）、内边距框盒或内容盒子
- `background-attachment`: 指定背景图片是随着元素上下滚动（初始值），还是固定在视口区域。使用`fixed`值会对页面性能产生负面影响
- `background-color`: 指定纯色背景，渲染到背景图片下方

使用简写属性`background`可以设置指定的值，同时把其他属性重置为初始值。因此，在需要用到多个属性时，可以考虑用单独的值。

`background-image`可以接受一个图片 URL 路径，例如`background-image: url(coffee-beans.jpg)`。也可以接受一个渐变函数，例如一个从白色过渡到蓝色的渐变。

#### 线性渐变

```CSS
.fade {
  height: 200px;
  width: 400px;
  background-image: linear-gradient(to right, white, blue);
}
```

`linear-gradient`函数使用三个参数来定义行为: 角度、起始颜色和终止颜色。上例的角度是`to right`（也可以是`to left`、`to top`、`to bottom`，或者是`to bottom right`），意思是渐变从元素的左侧开始平滑过渡到右侧。也可以使用其他的颜色表示方法，比如`#0000ff`、`rgb(0,0,255)`或者`transparent`关键字。

可以用确切的单位（比如度）更精确地控制角度。值`0deg`代表垂直向上，更大的值会颜色顺时针变化，`90deg`代表向右渐变。

度是最常用的单位，还有一些其他单位可用来表示角度:

- rad: 弧度，完整的圆是 2Π
- turn: 代表环绕圆周的圈数
- gad: 百分度，一个完整的圆是 400 百分度

可以定义包含多个颜色的渐变，其中每个颜色可以称为**颜色节点**（Color Stop）。下面例子包含三个颜色节点的渐变:

```CSS
.fade {
  height: 200px;
  width: 400px;
  background-image: linear-gradient(90deg, red, white, blue);
}
```

![](/images/202402/2/24.png)

一个渐变可以接受任意数量的颜色节点，节点之间用逗号分隔。渐变会自动均匀地平铺这些颜色节点。本例中，最左侧（0%）从红色开始，过渡到中间（50%）的白色，到最右侧的蓝色（100%）。我们也可以在渐变函数中为每个颜色节点明确指定位置。

```CSS
.fade {
  height: 200px;
  width: 400px;
  background-image: linear-gradient(90deg, red 0%, white 50%, blue 100%);
}

```

使用`repeating-linear-gradient()`可以实现重复渐变，对于重复渐变最好使用特定的长度而不是百分比，因为设置的值决定了要重复图片大小。

条纹进度条示例:

```CSS
.fade {
  height: 1em;
  width: 400px;
  background-image: repeating-linear-gradient(
    -45deg,
    #57b,
    #57b 10px,
    #148 10px,
    #148 20px
  );
  border-radius: 0.3em;
}

```

![](/images/202402/2/25.png)

更多例子，请看 Stripes in CSS: https://css-tricks.com/stripes-css/

#### 径向渐变

线性渐变是从元素的一端开始，沿着直线过渡到另一端。而径向渐变不同，它是从一个点，全方位向外扩展。

```CSS
.fade {
  height: 200px;
  width: 400px;
  background-image: radial-gradient(white, blue);
}
```

![](/images/202402/2/26.png)

更多例子:

![](/images/202402/2/27.png)

若想深入研究一下，可看 Using CSS gradients: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Images/Using_CSS_gradients

### 阴影

阴影是另一种可以为网页增加立体感的特效。有两个属性可以常见阴影，`box-shadow`为元素盒子生成阴影，`text-shadow`为渲染后的文字生成阴影。

![](/images/202402/2/28.png)

模糊半径用来控制阴影边缘模糊区域的大小（可以简单理解为模糊程度），可以为阴影生成一个更柔和、有点透明的边缘。扩展半径用来控制阴影的大小，设置为正值可以使阴影全方位变大，设置负值则会变小。

#### 使用渐变和阴影形成立体感

新建一个网页和样式表，添加如下内容:

```HTML
&lt;button class=&#34;butotn&#34;&gt;Sign up now&lt;/button&gt;
```

```CSS
.button {
  padding: 1em;
  border: 0;
  font-size: 0.8rem;
  color: white;
  border-radius: 0.5em;
  background-image: linear-gradient(to bottom, #57b, #148);
  box-shadow: 0.1em 0.1em 0.5em #124;
}

.button:active {
  box-shadow: inset 0 0 0.5em #124, inset 0 0.5em 1em rgba(0, 0, 0, 0.4);
}

```

上面的样式增加了一个`inset`关键字，这样可以让阴影出现在元素边框的内部，而非之前的外部。同时定义了不止一个阴影，用逗号分隔。通过这种方式可以添加多个阴影。

### 混合模式

多数情况下，不论是使用真正的图片还是渐变，元素一般只用一张背景图片。但某些情况下可能会想要用两张或者更多的背景图片，CSS 支持这么做。

`background-image`属性可以接受任意数量的值，相互之间用逗号分开。

```CSS
.blend {
  background-image: url(./bear.jpg), linear-gradient(to bottom, #57b, #148);
}
```

使用多个背景图片时，排在前面的图片会渲染到排序靠后图片的上面。在此例中，bear.jpg 会遮盖在线性渐变之上，渐变就会不可见。若我们使用两张背景图片，那么一般是希望第二章图片可以透视显示。这时就可以用**混合模式**（Blend Mode）。

示例:

```HTML
    &lt;div class=&#34;blend&#34;&gt;&lt;/div&gt;
```

```CSS
.blend {
  min-height: 80vh;
  background-image: url(./bear.jpg), url(./bear.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: -30vw, 30vw;
  background-blend-mode: multiply; /* 应用混合模式 */
}
```

![](/images/202402/2/29.png)

大部分背景相关的属性可以接受多个值，以逗号分隔。`background-position`就使用了两个值，第一个值用到第一张背景图片上，第二个值用到第二章背景图片上。

`background-size`和`background-repeat`属性也可以接受多个值，若只设置一个值，就会应用到所有背景图片上。

`background-size`属性接受两个关键字值，分别是`cover`和`contain`。使用`cover`值可以调整背景图片的大小，让其填满整个元素，这样会导致图片的边缘被裁剪掉一部分；使用`contain`值可以保证整个背景图片可见，这可能导致元素的一些地方不会被背景图片覆盖。该属性也可以接受长度值，用来明确设置背景图片的宽度和高度。

修改混合模式的其他值可以看到不同效果，例如:

- 使用某种颜色或者渐变为图片着色
- 为图片添加某种纹理效果，比如划痕或者老胶片放映时的颗粒感等
- 缓和、加深或减小图片的对比度，使图片上的文字更具可读性
- 在图片上覆盖一条文字横幅，但让图片完整显示

#### 为图片着色

通过使用混合模式，我们可以将一张全彩的图片着色成单一色相的图片。

```CSS
.blend {
  min-height: 80vh;
  background-image: url(&#34;./bear.jpg&#34;);
  background-color: #148;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-blend-mode: luminosity; /* 使用明度混合模式 */
}

```

![](/images/202402/2/30.png)

`background-blend-mode`不仅会合并多个背景图片，还会合并`background-color`。明度混合模式将前景层（大熊图片）的明度，与背景层（蓝色背景色图层）的色相饱和度混合。

即最终使用背景色图层的颜色，但明暗程度来自大熊图片。

混合模式的类型如下图所示:

![](/images/202402/2/31.png)

#### 为图片添加纹理

纹理图片以重复平铺的方式覆盖在大熊图片上方。

```CSS
.blend {
  min-height: 80vh;
  background-image: url(&#34;./scratches.png&#34;), url(&#34;./bear.jpg&#34;);
  background-size: 200px, cover;
  background-repeat: repeat, no-repeat;
  background-position: center, center;
  background-blend-mode: soft-light; /* 使用柔光混合模式 */
}
```

![](/images/202402/2/32.png)

#### 使用融合混合模式

`background-blend-mode`属性可以实现多张图片的混合，但只能局限于元素的背景颜色或者背景图片使用。还有一个属性`mix-blend-mode`，可以融合多个元素。不仅可以混合图片，还可以把元素的文本和边框与容器的背景图片混合在一起。

```CSS
.blend {
  background-image: url(&#34;./bear.jpg&#34;);
  background-size: cover;
  background-position: center;
  padding: 5em 0 10em;
}

.blend &gt; h1 {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 6rem;
  text-align: center;
  mix-blend-mode: hard-light;
  background-color: #c33;
  color: #808080;
  border: 0.1em solid #ccc;
  border-width: 0.1em 0;
}

```

![](/images/202402/2/33.png)

## 对比、颜色和间距

### 对比最重要

对比是设计中的一种手段，通过突出某物来达到吸引注意力的目的。

## 排版

随着 Web 字体的兴起，使用`@font-face`规则，告诉浏览器去哪里找到并下载自定义字体，供页面使用。

## 过渡

Web 是个生动的媒介，可以做如元素淡出、菜单滑入、颜色从一种变成另一种，实现这些效果最简单的方式是过渡（Transitions）。

### 从这边到那边

过渡是通过一系列`transition-*`属性来实现的。如果某个元素设置了过渡，那么当它的属性值发生变化时，并不是直接变成新值，而是使用过渡效果。

先看一个示例，最开始是个蓝绿色方角按钮，鼠标悬停时，过渡成一个红色圆角按钮:

```HTML
    &lt;button&gt;Hover over me&lt;/button&gt;
```

```CSS
button {
  background-color: hsl(180, 50%, 20%);
  border: 0;
  color: white;
  font-size: 1rem;
  padding: 0.3em 1em;
  transition-property: all;
  transition-duration: 0.5s;
}

button:hover {
  background-color: hsl(0, 50%, 50%);
  border-radius: 1em;
}
```

`transition-property`属性可以指定哪些属性使用过渡。关键字`all`表示所有的属性变化都使用过渡。`transition-duration`属性代表过渡到最终值之前需要多长时间，本例是 0.5 秒。

也可以使用简写属性`transition`，该简写属性接受四个参数值，分别代表四个过渡属性`transition-property`、`transition-duration`、`transition-timing-function`和`transition-delay`。

![](/images/202402/2/34.png)

第一个值设置了哪些属性需要过渡，初始值是关键字 all，表示所有属性都生效。如果只有某个属性需要过渡，在这里指定属性即可。例如: `transition-property: color`将只应用在元素的颜色上，其他属性会立刻发生变化。也可以设置多个值，比如: `transition-property: color, font-size`。

第二个值是持续时间，用秒或者毫秒表示。

第三个值是定时函数，用来控制属性的中间值如何计算，实际上控制的是过渡过程中变化率如何加速或者减速。定时函数可以是一个关键字值，比如`linear`或者`ease-in`，也可以是自定义函数。

最后一个值是延迟时间，允许开发者在属性值改变之后过渡生效之前设置一个等待周期。

如果需要为两个不同的属性分别设置不同的过渡，可以添加多个过渡规则，以逗号分隔:

```CSS
transition: border-radius 0.3s linear, background-color 0.6s ease;
```

等价于以下代码:

```CSS
transition-property: border-radius, background-color;
transition-duration: 0.3s, 0.6s;
transition-timing-function: linear, ease;
```

### 定时函数

定时函数用来说明如何移动。是以恒定的速度移动？还是开始慢，后面快？

我们可以用 linear、ease-in 和 ease-out 等关键字来描述移动过程。

linear 过渡，值以固定的速度改变；ease-in 过渡，变化速度开始时慢，然后一直加速，直到过渡完成；ease-out 是减速，开始时快速变化，结束时比较慢。

![](/images/202402/2/35.png)

## 变换

### 旋转、平移、缩放和倾斜

基本的变换规则如下:

```

transform: rotate(90deg);

```

这条规则应用到元素上后，会让元素向右（顺时针）旋转 90 度。变换函数`rotate()`用来指定元素如何变换。其他变换函数如下:

- 旋转（Rotate）: 元素围绕一个轴心转动一定角度
- 平移（Translate）: 元素上下左右各个方向移动
- 缩放（Scale）: 缩小或放大元素
- 倾斜（Skew）: 使元素变形，顶边滑向一个方向，底边滑向相反的方向

![](/images/202402/2/23.png)

每种变换都使用相应的函数作为`transform`属性的值。使用变换的时候元素可能会被移动到页面上的新位置，但它不会脱离文档流。其初始位置不会被其他元素占用。

变换不能作用在 span 或 a 这样的行内元素上。若确实需要，要么改变元素的 display 属性，替换掉`inline`（比如`inline-block`），要么把元素改为弹性子元素或网格项目。

#### 更改变换基点

变换是围绕基点（Point of origin）发生的。基点是旋转的轴心，也是缩放或倾斜开始的地方。这意味着元素的基点是固定在某个位置上，元素的剩余部分围绕基点变换（translate 是个例外，因为平移过程中元素整体移动）。

默认情况下，基点就是元素的中心，可以通过`transform-origin`属性改变基点位置。

例如:

```

transform-origin: right center;
transform-origin: 100% 50%;

```

以上两句等价。

#### 使用多重变换

可以对`transform`属性指定多个值，用空格隔开。变换的每个值从右向左按顺序执行，例如: `transform: rotate(15deg) translate(15px, 0)`，元素会先向右平移 15px，然后顺时针旋转 15 度。

### 在运动中变换

变换本身不具备太多实用性。当和动作结合起来使用的时候，变换就会有用多了。

&gt; SVG——可缩放矢量图形（Scalable Vector Graphics）的简称。这是一种基于 XML 的图片格式，使用向量定义图片。由于图片是使用数学计算来定义的，所以可以放大或缩小到任意尺寸。

## 动画

**关键帧**（keyframe）是指动画过程中某个特定时刻。我们定义一些关键帧，浏览器负责填充或者插入这些关键帧之间的帧图像。

![](/images/202402/2/36.png)

从原理上看，过渡和关键帧动画类似: 我们定义第一帧（起始点）和最后一帧（结束点），浏览器计算所有中间值，使得元素可以在这些值之间平滑变换。但使用关键帧动画，我们就不在局限于两个点，而是想加多少就加多少。浏览器负责填充一个个点与点之间的值，直到最后一个关键帧，最终生成一系列无缝衔接的过渡。

### 关键帧

CSS 中的动画包括两部分: 用来定义动画的`@keyframes`规则和为元素添加动画的`animation`属性。

先创建一个简单的动画来熟悉以下语法:

```CSS
@keyframes over-and-back {
  0% {
    background-color: hsl(0, 50%, 50%);
    transform: translate(0);
  }

  50% {
    transform: translate(50px);
  }

  100% {
    background-color: hsl(270, 50%, 50%);
    transform: translate(0);
  }
}

.box {
  width: 100px;
  height: 100px;
  background-color: green;
  animation: over-and-back 1.5s linear 3;
}

```

```HTML
&lt;!DOCTYPE html&gt;
&lt;html lang=&#34;en&#34;&gt;
  &lt;head&gt;
    &lt;meta charset=&#34;UTF-8&#34; /&gt;
    &lt;meta http-equiv=&#34;X-UA-Compatible&#34; content=&#34;IE=edge&#34; /&gt;
    &lt;meta name=&#34;viewport&#34; content=&#34;width=device-width, initial-scale=1.0&#34; /&gt;
    &lt;title&gt;动画&lt;/title&gt;
    &lt;link rel=&#34;stylesheet&#34; href=&#34;./style.css&#34; /&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;div class=&#34;box&#34;&gt;&lt;/div&gt;
  &lt;/body&gt;
&lt;/html&gt;

```

## 选择器

### 基础选择器

- tagname——标签选择器。该选择器匹配目标元素的标签名。其优先级是`0,0,1`。例如: p、h1、strong。
- `.class`——类选择器。该选择器匹配 class 属性中有指定类名的元素。其优先级是`0,1,0`。例如: `.media`、`.nav-menu`。
- `#id`——ID 选择器。该选择器匹配拥有指定 ID 属性的元素。其优先级是`1,0,0`。例如: `#sidebar`。
- `*`——通用选择器。该选择器匹配所有元素。其优先级是`0,0,0`。

### 组合器

组合器将多个基础选择器连接起来组成一个复杂选择器。

- 后代组合器（空格）——匹配的目标元素的其他元素的后代。例如: `.nav-menu li`。
- 子组合器（`&gt;`）——匹配的目标元素紧跟在其他元素后面。例如: `.parent &gt; .child`。
- 相邻兄弟组合器（`&#43;`）——匹配的目标元素紧跟在其他元素后面。例如: `p &#43; h1`。
- 通用兄弟组合器（`~`）——匹配所有跟随在指定元素之后的兄弟元素。

多个基础选择器可以连起来（不使用空格或者其他组合器）组成一个复合选择器（例如: `h1.page-header`）。复合选择器选中的元素将匹配其全部基础选择器。例如，`.dropdown.is-active`能选中`&lt;div class=&#34;dropdown is-active&#34;&gt;...&lt;/div&gt;`，当无法选中`&lt;div class=&#34;dropdown&#34;&gt;&lt;/div&gt;`。

### 伪类选择器

伪类选择器用于选中某个特定状态的元素。这种状态可能是由于用户交互，也可能是由于元素相对于其父级或兄弟元素的位置。其优先级等于一个类选择器`(0, 1, 0)`。

- `:first-child`——匹配的元素是其父元素的第一个子元素。
- `:last-child`——匹配的元素是其父元素的最后一个子元素。
- `:only-child`——匹配的元素是其父元素的唯一一个子元素（无兄弟元素）。

CSS Pseudo-classes: https://www.w3schools.com/css/css_pseudo_classes.asp

### 伪元素选择器

伪元素匹配在文档中没有直接对应 HTML 元素的特定部分。伪元素选择器可能只匹配元素的一部分，甚至向 HTML 标记中未定义的地方插入内容。

此类选择器以双冒号开头，大多数浏览器也支持单冒号的语法以便向后兼容。伪元素选择器的优先级与元素选择器`(0, 0, 1)`相等。

- `::before`——创建一个伪元素，使其成为匹配元素的第一个子元素。该元素默认是行内元素，可用于插入文字、图片或其他形状。必须指定 content 属性才能让元素出现。例如: `.menu::before`。
- `::after`——创建一个伪元素，使其成为匹配元素的最后一个子元素。元素默认是行内元素，可用于插入文字、图片或其他形状。必须指定 content 属性才能让元素出现。例如: `.menu::after`。
- `::first-letter`——用于指定匹配元素的第一个文本字符的样式。例如: `h2::first-letter`。
- `::first-line`——用于指定匹配元素的第一行文本的样式。
- `::selection`——用于指定用户使用鼠标高亮选择的任意文本的样式。通常用于改变选中文本的`background-color`。只有少数属性可以用，包括`color`、`background-color`、`cursor`、`text-decoration`。

### 属性选择器

属性选择器用于根据 HTML 属性匹配元素。其优先级与一个类选择器`(0,1,0)`相等。

- `[attr]`——匹配的元素拥有指定属性 attr，无论属性值是什么，例如: `input[disabled]`。
- `[attr=&#34;value&#34;]`——匹配的元素拥有指定属性 attr，且属性值等于指定的字符串值，例如: `input[type=&#34;radio&#34;]`。
- `[attr^=&#34;value&#34;]`——“开头”属性选择器。该选择器匹配的元素拥有指定属性 attr，且属性值的开头是指定的字符串值，例如: `a[href^=&#34;https&#34;]`。
- `[attr$=&#34;value&#34;]`——“结尾”属性选择器。该选择器匹配的元素拥有指定属性 attr，且属性值的结尾是指定的字符串值，例如: `a[href$=&#34;.pdf&#34;]`。
- `[attr*=&#34;value&#34;]`——“包含”属性选择器。该选择器匹配的元素拥有指定属性 attr，且属性值包含指定的字符串值，例如: `[class*=&#34;sprite-&#34;]`。
- `[attr~=&#34;value&#34;]`——“空格分隔的列表”属性选择器。该选择器匹配的元素拥有指定属性 attr，且属性值是一个空格分隔的值列表，列表中的某个值等于指定字符串值，例如: `a[rel=&#34;author&#34;]`。
- `[attr|=&#34;value&#34;]`——匹配的元素拥有指定属性 attr，且属性值要么等于指定的字符串值，要么以该字符串开头且紧跟着一个连字符。例如: `[lang|=&#34;es&#34;]`。

## 预处理器

预处理器的原理是把我们写的源文件转译成输出文件，即常规 CSS 样式表。对浏览器而言，最终输出的是常规 CSS，所以预处理器不会向语言添加任何新特性。但对于开发者来说，预处理器提供了许多便利。

比较流行的预处理器有 Sass 和 Less。

### Sass

#### 搭建环境

使用`npm init -y`初始化一个新的 npm 项目。

使用`npm install --save-dev node-sass`安装`node-sass`包。

Sass 支持两种语法: Sass 和 SCSS。它们的语言特性一样，但 Sass 语法去掉了所有的大括号和分号，严格使用缩进来表示代码结构。SCSS 语法使用大括号和分号，因此看起来更像 CSS。

在项目目录下新建 sass 和 build 子目录，我们把源文件放在 sass 目录，生成的 CSS 文件将在 build 目录中。

在`package.json`中添加一条命令:

```

&#34;scripts&#34;: {
&#34;sass&#34;: &#34;node-sass sass/index.scss build/styles.css&#34;
},

```

之后运行`npm run sass`，可以看到在 build 目录中生成了 styles.css 文件。

#### 理解 Sass 的核心特性

##### 变量

在 Sass 中可以使用变量，在`index.scss`中添加如下代码:

```Scss
// 定义变量
$brand-blue: #0086b3;

a:link {
  // 使用变量
  color: $brand-blue;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  color: black;
}

.page-heading {
  font-size: 1.6rem;
  // 使用变量
  color: $brand-blue;
}
```

运行`npm run sass`命令，输出文件`build/styles.css`内容如下:

```CSS
a:link {
  color: #0086b3; }

body {
  font-family: Arial, Helvetica, sans-serif;
  color: black; }

.page-heading {
  font-size: 1.6rem;
  color: #0086b3; }
```

变量已经被替换为了十六进制颜色值，浏览器可以直接加载。

##### 行内计算

Sass 支持使用`&#43;`、`-`、`*`、`/`和`%`（模运算）进行行内计算，如此一来，我们就可以从一个初始值获得多个值。

```Scss
$padding-left: 3em;

.note-author {
  padding-left: $padding-left;
  font-weight: bold;
}

.note-body {
  padding-left: $padding-left * 2;
}

```

使用`npm run sass`编译后生成如下结果:

```CSS
.note-author {
  padding-left: 3em;
  font-weight: bold; }

.note-body {
  padding-left: 6em; }
```

`.note-body`中的`padding-left`属性成功计算得到。

##### 嵌套选择器

Sass 允许在代码块内嵌套选择器，可以使用嵌套把有关联的代码分到一组:

```Scss
.site-nav {
  display: flex;

  &gt; li {
    margin-top: 0;

    // &amp;符号表示将插入外层选择器的位置
    &amp;.is-active {
      display: block;
    }
  }
}

```

编译如下:

```CSS
.site-nav {
  display: flex;
}
.site-nav &gt; li {
  margin-top: 0;
}
.site-nav &gt; li.is-active {
  display: block;
}

```

默认情况下，外层的`.site-nav`选择器会自动添加到编译代码的每个选择器前面，拼接的位置会插入一个空格。使用`&amp;`符号代表外层选择器要插入的位置。

也可以在声明块内嵌套媒体查询用以避免重复书写相同选择器:

```Scss
html {
  font-size: 1rem;

  @media (min-width: 45em) {
    font-size: 1.25rem;
  }
}

```

编译结果如下:

```CSS
html {
  font-size: 1rem;
}
@media (min-width: 45em) {
  html {
    font-size: 1.25rem;
  }
}

```

这样一来，若修改选择器就不必再去媒体查询中修改对应的选择器。

##### 局部文件(@import)

局部文件允许我们将样式分割成多个独立的文件，Sass 将会把这些文件拼接在一起生成一个文件。

新建`sass/button.scss`文件，添加如下内容:

```Scss
.button {
  padding: 1em 1.25em;
  background-color: #265559;
  color: #333;
}
```

在`sass/index.scss`文件中引入:

```Scss
@import &#34;button&#34;;

html {
  font-family: Arial, Helvetica, sans-serif;
}

```

编译结果如下:

```CSS
.button {
  padding: 1em 1.25em;
  background-color: #265559;
  color: #333;
}

html {
  font-family: Arial, Helvetica, sans-serif;
}
```

局部文件会被编译，然后插入到`@import`规则指定的地方。

##### 混入

混入（mixin）是一小段 CSS 代码块，可以在样式表任意地方复用。如果有一段特定的字体样式在多个地方需要使用，使用混入就比较合适。

混入用`@mixin`规则来定义，用`@include`规则来调用。

清除浮动:

```Scss
@mixin clearfix {
  &amp;::before {
    display: table;
    content: &#34; &#34;;
  }

  &amp;::after {
    clear: both;
  }
}

.media {
  @include clearfix;
  background-color: #eee;
}

```

预处理器会提取 mixin 中的代码，替换到`@include`规则所在位置。

```CSS
.media {
  background-color: #eee;
}
.media::before {
  display: table;
  content: &#34; &#34;;
}
.media::after {
  clear: both;
}

```

需要注意的是，最终编译生成的代码中没有了 clearfix。混入的内容只会添加到样式表中用到了它的地方。

我们还可以定义带参数的混入:

```Scss
@mixin alert-variant($color, $bg-color) {
  padding: 0.3em 0.5em;
  border: 1px solid $color;
  color: $color;
  background-color: $bg-color;
}

.alert-info {
  @include alert-variant(blue, lightblue);
}

.alert-danger {
  @include alert-variant(red, pink);
}

```

每次调用混入，都可以传递不同的值。这些值指定为对应的两个变量，最终输出的 CSS 如下:

```CSS
.alert-info {
  padding: 0.3em 0.5em;
  border: 1px solid blue;
  color: blue;
  background-color: lightblue;
}

.alert-danger {
  padding: 0.3em 0.5em;
  border: 1px solid red;
  color: red;
  background-color: pink;
}

```

##### 扩展

Sass 还支持`@extend`规则。和 mixin 类似，但编译方式有所不同。对于扩展，Sass 不会多次复制相同的声明，而是把选择器组合在一起，这样它们就会包含同样的规则。

```Scss
.message {
  padding: 0.3em 0.5em;
  border-radius: 0.5em;
}

.message-info {
  @extend .message;
  color: blue;
  background-color: lightblue;
}

.message-danger {
  @extend .message;
  color: red;
  background-color: pink;
}

```

`.message`包含的规则被扩展到另外两个规则集中。

```CSS
.message,
.message-info,
.message-danger {
  padding: 0.3em 0.5em;
  border-radius: 0.5em;
}

.message-info {
  color: blue;
  background-color: lightblue;
}

.message-danger {
  color: red;
  background-color: pink;
}

```

使用`mixin`还是`extend`，需要具体情况具体分析。通常情况下，可能更倾向用`mixin`，只有需要减少 HTML 中填写的类名数量时才考虑使用`@extend`。

##### 颜色处理

Sass 还有一个特性就是颜色处理函数，如果需要两个同类的颜色（比如，同一种颜色的深浅版本），可以用如下代码来生成:

```Scss
$green: #63a53c;

// 加深10%
$green-dark: darken($green, 10%);
$green-light: lighten($green, 10%);

// 调整透明度
$green-transparent: rgba($green, 0.5);
```

通过这些函数，可以实现修改一个变量，同时修改相关联的其他颜色值。这样就不必把所有颜色都存到变量中，可以在需要的属性中直接修改，如下代码所示:

```Scss
.page-header {
  color: $green;
  background-color: lighten($green, 10%);
}
```

更多操作，可阅读[A visual guide to Sass &amp; Compass Color Functions](http://jackiebalzer.com/color)一文。

##### 循环

针对某个值使用循环，可以生成一系列细小的变化。通过`@for`规则即可:

```Scss
// 从2到4迭代$index值
@for $index from 2 to 5 {
  // 在选择器中使用变量
  .nav-links &gt; li:nth-child(#{$index}) {
    // 变量乘以一个时间值
    transition-delay: (0.1s * $index) - 0.1s;
  }
}

```

这样把代码输出了好几次，每次变量`$index`的值都会增加。在选择器中用`#{}`语法使用变量。

### PostCSS

PostCSS 是另一种类型的预处理器。它编译源文件并输出一个处理过的 CSS 文件，这和 Sass 或者 Less 一样，但 PostCSS 是依靠插件工作的。若没有安装插件，输出文件就是没有任何变化的源文件副本。

#### 搭建环境

使用`npm init -y`初始化一个新的 npm 项目。

使用`npm install --save-dev gulp`安装`gulp`包。

#### Autoprefixer

PostCSS 中最重要的插件可能就是 Autoprefixer，这个插件可以将相关的所有浏览器前缀都添加到 CSS 中。

为了使用`Autoprefixer`，我们使用命令`npm install --save-dev gulp-atuoprefixer`进行安装。

之后在项目根目录创建一个名为`gulpfile.js`的文件，添加如下内容:

```JavaScript
const gulp = require(&#34;gulp&#34;);
const autoprefixer = require(&#34;gulp-autoprefixer&#34;);

gulp.task(&#34;prefix&#34;, () =&gt; {
  gulp
    .src(&#34;./css/*.css&#34;)
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gulp.dest(&#34;./dist&#34;));
});

```

新建`css`目录，在其中的`index.css`文件中添加如下内容:

```CSS
.fullscreen a {
  display: flex;
}
```

在`package.json`文件中加入以下内容:

```JSON
  &#34;scripts&#34;: {
    &#34;gulp&#34;: &#34;gulp prefix&#34;
  },
  &#34;browserslist&#34;: [
    &#34;last 99 versions&#34;
  ],
```

打开命令行执行`npm run gulp`。可以看到生成了一个新目录`dist`，其中有一个名为`index.css`的文件，内容如下:

```CSS
.fullscreen a {
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
}
```

#### cssnext

cssnext 是另一款非常流行的 PostCSS 插件。这款插件模拟那些还没有受所有浏览器支持的最新 CSS 语法。

#### cssnano

cssnano 是基于 PostCSS 的压缩工具。可以从代码中剥离无关的空格，使代码体积尽可能变小，但同时依然保持相同的语法含义。

#### PreCSS

PreCSS 是一款 PostCSS 插件包，提供了类似于 Sass 的特性，其中包含了`$`变量、行内计算、循环和混入等。

更多 PostCSS 插件，请看[PostCSS Plugins](https://github.com/postcss/postcss/blob/main/docs/plugins.md)。

## 项目

要想完全掌握书上内容还得不断练习回顾，以下为推荐练习项目。

Parallax scroll animation: https://codepen.io/isladjan/pen/abdyPBw

Voyage Slider | GSAP: https://codepen.io/dev_loop/pen/MWKbJmO

App Menu With Lock Screen: https://codepen.io/Hyperplexed/details/vYpXNJd

Old Film Effect - Pure CSS Animation: https://codepen.io/josetxu/pen/yLjwOwQ

[How I recreated a Polaroid camera with CSS gradients only](https://dev.to/fossheim/how-i-recreated-a-polaroid-camera-with-css-gradients-only-4la5)

## 参考

《深入解析 CSS》


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: https://andyfree96.github.io/%E6%B7%B1%E5%85%A5%E8%A7%A3%E6%9E%90css/  

