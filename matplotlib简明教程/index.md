# Matplotlib简明教程


在数据科学和分析领域，图表不仅是展示数据的工具，更是讲故事的语言。Matplotlib 是 Python 中历史最悠久且功能最全面的绘图库。无论你是想画一个简单的折线图，还是需要定制复杂的多图布局，Matplotlib 都能满足你的需求。这篇文章将带你快速上手，学会用代码**画出**数据的价值。

<!--more-->

创建图与图表是很多分析项目中的一个重要步骤，它通常是项目开始时探索性数据分析（EDA）的一部分，或者在项目报告阶段向其他人介绍你的数据分析结果时使用。

![](/images/202104/1/0.jpg)

matplotlib 是一个绘图库，创建的图形可达到出版的质量要求。它可以创建常用的统计图，包括条形图、箱线图、折线图、散点图和直方图等等图形。matplotlib 提供了对图形各个部分进行定制的功能。例如，它可以设置图形的形状和大小、x 轴与 y 轴的范围和标度、x 轴和 y 轴的刻度线和标签、图例以及图形的标题。更多关于定制图形的信息请查看：https://matplotlib.org/users/beginner.html 。

下面，我们就开始学习一些常见图形的绘制，使用的数据来自[The Complete Pokemon Dataset](https://www.kaggle.com/rounakbanik/pokemon)。

先将数据导入，

```Python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

plt.style.use('ggplot')
%matplotlib inline

data = pd.read_csv('../../Datasets/pokemon.csv')
data.head()
```

![数据前5行](/images/202104/1/1.png)

数据每一列的含义如下，

![字段含义](/images/202104/1/2.png)

## 条形图

假如我们想查看一下每一代 Pokemon 的数量，并用条形图显示出来，该怎么办呢？

```Python
generation = data['generation'].value_counts()
plt.bar(generation.index, generation.values)
```

可以看到如下结果：

![每一代Pokemon数量](/images/202104/1/3.png)

如果我们想添加轴标签和标题的话，加上如下内容即可：

```Python
plt.xlabel('generation')
plt.ylabel('count')
plt.title('Generation and Count')
```

![](/images/202104/1/4.png)

为了方便起见，我们也可以为每个条加上数值标签，

```Python
for x,y in enumerate(generation.values):
    plt.text(x+1,y,'%s' % y,ha='center')
```

![](/images/202104/1/5.png)

[matplotlib.pyplot.bar](https://matplotlib.org/api/_as_gen/matplotlib.pyplot.bar.html)函数详情：

```Python
matplotlib.pyplot.bar(x, height, width=0.8, bottom=None, *, align='center', data=None, **kwargs)
```

- x: 指定图形横轴坐标
- height: 指定条形图的高度
- width: 指定条形图的宽度
- color: 指定条形图前景色
- edgecolor: 设置条形图边界颜色
- linewidth: 设置条形图边界宽度

更多内容请查看：https://matplotlib.org/api/_as_gen/matplotlib.pyplot.bar.html

知道了上述参数的含义之后，我们就可以对之前的图形进行小小的改动啦！

```Python
generation = data['generation'].value_counts()
plt.bar(generation.index, generation.values, facecolor='orange',edgecolor='green', linewidth=2)
plt.xlabel('generation')
plt.ylabel('count')
plt.title('Generation and Count')

for x,y in enumerate(generation.values):
    plt.text(x+1,y,'%s' % y,ha='center')
```

![](/images/202104/1/12.png)

## 箱线图

箱线图一般用来展示数据的分布（如上下四分位数、中位数等），同时，也可以用来反映数据的异常情况。

```Python
box = data[['defense','attack','hp']]
plt.boxplot(box.values)
plt.setp(plt.gca(),xticklabels=['defense','attack','hp'])
```

![](/images/202104/1/6.png)

[matplotlib.pyplot.boxplot](https://matplotlib.org/api/_as_gen/matplotlib.pyplot.boxplot.html)函数详情：

```Python
matplotlib.pyplot.boxplot(x, notch=None, sym=None, vert=None, whis=None, positions=None, widths=None, patch_artist=None, bootstrap=None, usermedians=None, conf_intervals=None, meanline=None, showmeans=None, showcaps=None, showbox=None, showfliers=None, boxprops=None, labels=None, flierprops=None, medianprops=None, meanprops=None, capprops=None, whiskerprops=None, manage_xticks=True, autorange=False, zorder=None)
```

- x: 指定绘图的数据
- notch: 是否是凹口的形式展示箱线图，默认为非凹口
- sym: 指定异常点的形状
- vert: 是否需要将图形垂直摆放，默认为垂直摆放
- whis: 指定上下须与上下四分位数的距离，默认为 1.5 倍的四分位差
- positions: 指定图形的位置，默认为[0,1,2……]
- widths: 指定图形的宽度，默认为 0.5
- patch_artist: 是否填充箱体的颜色
- meanline: 是否用线表示均值，默认用点表示
- showmeans: 是否显示均值，默认不显示
- showcaps: 是否显示图形顶端和末端的两条线，默认显示
- showbox: 是否显示图形的箱体，默认显示
- showfliers: 是否显示异常值，默认显示
- boxprops: 设置箱体的属性，如边框色、填充色等
- labels: 指定箱线图的标签
- filerprops: 设置异常值的属性，如异常点的形状、大小等
- medianprops: 设置中位数的属性，如线的类型、粗细等
- meanprops: 设置均值的属性，如点的大小、颜色等
- capprops: 设置图形顶端和末端线条的属性，如颜色、粗细等
- whiskerprops: 设置须得属性，如颜色、粗细等

更多内容请查看：https://matplotlib.org/api/_as_gen/matplotlib.pyplot.boxplot.html

## 折线图

我们不妨查看一下每一代 Pokemon 攻击力的走势，

```Python
generation_attack = data.pivot('name', 'generation', 'attack').fillna(0)
for col in generation_attack.columns:
    gene = generation_attack[generation_attack[col] > 0][col].sort_values()
    plt.plot(range(gene.shape[0]),gene.values,label=col)
plt.legend()
plt.ylabel('Attack')
```

![](/images/202104/1/7.png)

[matplotlib.pyplot.plot](https://matplotlib.org/api/_as_gen/matplotlib.pyplot.plot.html)函数详情：

```Python
matplotlib.pyplot.plot(*args, scalex=True, scaley=True, data=None, **kwargs)
```

- x: x 轴数据
- y: y 轴数据
- fmt: 格式化字符串

更多内容请查看：https://matplotlib.org/api/_as_gen/matplotlib.pyplot.plot.html

## 散点图

将防御力和攻击力用散点图绘制出来，

```Python
plt.scatter(data['attack'], data['defense'])
plt.xlabel('attck')
plt.ylabel('defense')
```

![](/images/202104/1/8.png)

[matplotlib.pyplot.scatter](https://matplotlib.org/api/_as_gen/matplotlib.pyplot.scatter.html)函数详情：

```Python
matplotlib.pyplot.scatter(x, y, s=None, c=None, marker=None, cmap=None, norm=None, vmin=None, vmax=None, alpha=None, linewidths=None, verts=None, edgecolors=None)
```

- x: 指定数据横坐标
- y: 指定数据纵坐标
- s: 指定标记大小
- c: 指定标记颜色
- marker: 设置标记样式
- alpha: 设置透明度
- linewidths: 设置标记边缘的线宽
- edgecolors: 设置标记边缘的颜色

更多内容请查看：https://matplotlib.org/api/_as_gen/matplotlib.pyplot.scatter.html

## 直方图

将防御力的分布用直方图绘制，

```Python
plt.hist(data['defense'],bins=25)
plt.xlabel('Defense')
plt.ylabel('Frequency')
```

![](/images/202104/1/9.png)

[matplotlib.pyplot.hist](https://matplotlib.org/api/_as_gen/matplotlib.pyplot.hist.html)函数详情：

```Python
matplotlib.pyplot.hist(x, bins=None, range=None, density=None, weights=None, cumulative=False, bottom=None, histtype='bar', align='mid', orientation='vertical', rwidth=None, log=False, color=None, label=None, stacked=False, normed=None)
```

- x: 指定每个 bin 分布的数据，对应 x 轴
- bins: 指定 bin 的个数
- range: 指定 bin 的分布范围
- density: 是否将得到的直方图归一化
- cumulative: 是否绘制累积频数图
- bottom: 指定每个 bin 底部的基线位置
- histtype: 指定直方图类型
- align: 设置直方图的绘制方式，默认为 mid
- orientation: 指定方向，水平或垂直
- log: 是否使用对数刻度
- label: 设置图形的标签说明
- stacked: 是否将图形堆叠

更多内容请查看：https://matplotlib.org/api/_as_gen/matplotlib.pyplot.hist.html

## 饼图

接下来，我们可以看一下幻之宝可梦所占的比例，

```Python
color = ["aqua", "orange"]
leg = [data[data['is_legendary'] == 0].shape[0],data[data['is_legendary'] == 1].shape[0]]
legPie = plt.pie(leg,labels=['Non Legendary', 'Legendary'],colors=color,shadow=True,
                autopct='%1.1f%%',startangle=45,explode=(0,0.1))
```

![](/images/202104/1/10.png)

[matplotlib.pyplot.pie](https://matplotlib.org/api/_as_gen/matplotlib.pyplot.pie.html)函数详情：

```Python
matplotlib.pyplot.pie(x, explode=None, labels=None, colors=None, autopct=None, pctdistance=0.6, shadow=False, labeldistance=1.1, startangle=None, radius=None, counterclock=True, wedgeprops=None, textprops=None, center=(0, 0), frame=False, rotatelabels=False)
```

- x: 指定绘图的数据
- explode: 指定饼图某些部分突出显示
- labels: 指定饼图的标签说明
- colors: 指定饼图的填充色
- autopct: 设置百分比格式
- pctdistance: 设置百分比标签与圆心的距离
- shadow: 是否添加阴影效果
- labeldistance: 设置各扇形标签与圆心的距离
- startangle: 设置饼图的初始摆放角度
- radius: 设置饼图的半径大小
- counterclock: 是否让饼图按逆时针显示
- wedgeprops: 设置饼图内外边界属性，如边界线的粗细、颜色等
- textprops: 设置饼图中文本的属性，如字体大小、颜色等
- center: 指定饼图的中心位置
- frame: 是否要显示饼图背后的图框
- rotatelabels: 是否要让扇形标签跟着扇形角度旋转

更多内容请查看：https://matplotlib.org/api/_as_gen/matplotlib.pyplot.pie.html

如果感觉意犹未尽的话，可以到：https://matplotlib.org/gallery/index.html

![](/images/202104/1/11.png)

学习各种图的绘制。

万一这都满足不了你对可视化的追求的话，可以参考[10 Useful Python Data Visualization Libraries for Any Discipline](https://blog.modeanalytics.com/python-data-visualization-libraries/)，进行学习。

## 绘制 NAB 球员出手位置

接下来，我们将提取 NBA 球员投篮数据，然后用`matplotlib`和`seaborn`绘制出手位置图。

首先我们导入需要用到的包：

```Python
import requests
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

%matplotlib inline
```

NBA 有一个官方统计网站`https://stats.nba.com/`，可以在该网站到查到各种统计数据。
为了获取到`James Harden`在`2018-2019`赛季的投篮数据，可以使用以下地址：

```Python
player_id = "201935"
shot_chart_url = "https://stats.nba.com/stats/shotchartdetail?CFID=33&CFPARAMS=2018-19&ContextFilter=&ContextMeasure=FGA&DateFrom=&DateTo=&GameID=&GameSegment=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerID="+ player_id + "&PlusMinus=N&Position=&Rank=N&RookieYear=&Season=2018-19&SeasonSegment=&SeasonType=Regular+Season&TeamID=0&VsConference=&VsDivision=&mode=Advanced&showDetails=0&showShots=1&showZones=0&PlayerPosition="
```

其中`player_id`指的是球员的 ID，比如`James Harden`的 ID 就是`201935`。

每个球员的 ID 都可以在`https://stats.nba.com/`查到，比如`Kobe Bryant`, 搜索`Kobe Bryant`

![](/images/202104/2/1.png)

地址栏中的`977`就是他的球员 ID

![](/images/202104/2/2.png)

接下来，我们可以使用[Requests](https://requests.readthedocs.io/en/latest/)包请求上述地址获取到数据：

```Pyhton
headers = {'User-Agent': "Mozilla"}
response = requests.get(shot_chart_url, headers=headers)
```

请求返回的数据是 JSON 格式的，可以用`Pandas`创建一个`DataFrame`对象，方便后续处理。

```Python
column_names = response.json()['resultSets'][0]['headers']
shots = response.json()['resultSets'][0]['rowSet']

shot_df = pd.DataFrame(shots, columns=column_names)

from IPython.display import display
with pd.option_context('display.max_columns', None):
    display(shot_df.head())
```

![](/images/202104/2/3.png)

以上便是`James Harden`在`2018-2019`赛季常规赛的投篮数据。其中`LOC_X`,`LOC_Y`就是出手位置，可以用散点图将其绘制出来：

```Python
sns.set_style("white")
sns.set_color_codes()
plt.figure(figsize=(12,11))
plt.scatter(shot_df.LOC_X, shot_df.LOC_Y, alpha=0.3)
plt.show()
```

![](/images/202104/2/4.png)

为了更加直观，我们用以下代码把球场绘制出来：

```Python
from matplotlib.patches import Circle, Rectangle, Arc

def draw_court(ax=None, color='black', lw=2, outer_lines=False):
    if ax is None:
        ax = plt.gca()

    hoop = Circle((0, 0), radius=7.5, linewidth=lw, color=color, fill=False)

    backboard = Rectangle((-30, -7.5), 60, -1, linewidth=lw, color=color)

    outer_box = Rectangle((-80, -47.5), 160, 190, linewidth=lw, color=color,
                          fill=False)

    inner_box = Rectangle((-60, -47.5), 120, 190, linewidth=lw, color=color,
                          fill=False)


    top_free_throw = Arc((0, 142.5), 120, 120, theta1=0, theta2=180,
                         linewidth=lw, color=color, fill=False)

    bottom_free_throw = Arc((0, 142.5), 120, 120, theta1=180, theta2=0,
                            linewidth=lw, color=color, linestyle='dashed')

    restricted = Arc((0, 0), 80, 80, theta1=0, theta2=180, linewidth=lw,
                     color=color)

    corner_three_a = Rectangle((-220, -47.5), 0, 140, linewidth=lw,
                               color=color)
    corner_three_b = Rectangle((220, -47.5), 0, 140, linewidth=lw, color=color)

    three_arc = Arc((0, 0), 475, 475, theta1=22, theta2=158, linewidth=lw,
                    color=color)

    center_outer_arc = Arc((0, 422.5), 120, 120, theta1=180, theta2=0,
                           linewidth=lw, color=color)
    center_inner_arc = Arc((0, 422.5), 40, 40, theta1=180, theta2=0,
                           linewidth=lw, color=color)

    court_elements = [hoop, backboard, outer_box, inner_box, top_free_throw,
                      bottom_free_throw, restricted, corner_three_a,
                      corner_three_b, three_arc, center_outer_arc,
                      center_inner_arc]

    if outer_lines:

        outer_lines = Rectangle((-250, -47.5), 500, 470, linewidth=lw,
                                color=color, fill=False)
        court_elements.append(outer_lines)

    for element in court_elements:
        ax.add_patch(element)

    return ax

```

绘制球场

```Python
plt.figure(figsize=(12, 11))
draw_court(outer_lines=True)
plt.xlim(-300, 300)
plt.ylim(-100, 500)
plt.show()
```

![](/images/202104/2/5.png)

将出手位置也加进去

```Python
plt.figure(figsize=(12, 11))
plt.scatter(shot_df.LOC_X, shot_df.LOC_Y, alpha=0.3)
draw_court(outer_lines=True)
plt.xlim(300,-300)
plt.show()
```

![](/images/202104/2/6.png)

使用`Seaborn`的`jointplot`绘制图像

```Python
joint_shot_chart = sns.jointplot(shot_df.LOC_X, shot_df.LOC_Y, space=0, alpha=0.5)
joint_shot_chart.fig.set_size_inches(12,11)

ax = joint_shot_chart.ax_joint
draw_court(ax)

ax.set_xlim(-250, 250)
ax.set_ylim(422.5, -47.5)


ax.set_xlabel("")
ax.set_ylabel("")
ax.tick_params(labelbottom="off", labelleft="off")
```

![](/images/202104/2/7.png)

从中可以看到其出手位置的分布情况。

值得注意的是，`shot_df`中有一列`SHOT_MADE_FLAG`代表的是是否投中（1 为投中，0 为未投中），我们可以查看一下投中出手位置的分布：

```Python
made_df = shot_df[shot_df['SHOT_MADE_FLAG']==1]

joint_shot_chart = sns.jointplot(made_df.LOC_X, made_df.LOC_Y, space=0, alpha=0.5, color='r')
joint_shot_chart.fig.set_size_inches(12,11)

ax = joint_shot_chart.ax_joint
draw_court(ax)

ax.set_xlim(-250, 250)
ax.set_ylim(422.5, -47.5)


ax.set_xlabel("")
ax.set_ylabel("")
ax.tick_params(labelbottom="off", labelleft="off")
```

![](/images/202104/2/8.png)

## 参考

- https://liam.page/2014/09/11/matplotlib-tutorial-zh-cn/
- https://blog.csdn.net/ScarlettYellow/article/details/80458797
- https://wizardforcel.gitbooks.io/matplotlib-user-guide/content/
- https://blog.csdn.net/qq_34337272/article/details/79555544
- https://matplotlib.org/tutorials/index.html
- [How to Create NBA Shot Charts in Python](http://savvastjortjoglou.com/nba-shot-sharts.html)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: https://andyfree96.github.io/matplotlib%E7%AE%80%E6%98%8E%E6%95%99%E7%A8%8B/  

