# R语言ggplot2气泡地图实战


在数据可视化中，==气泡地图（Bubble Map）==[primary]是一种直观表现地理信息的方法，既能展示地理位置，也能通过气泡的大小和颜色体现数据的数量和类别。本文将带你用 R 语言 + ggplot2 从零开始绘制一张漂亮的气泡地图。

<!--more-->

气泡地图以一个地图轮廓为背景，用附着在地图上的气泡来反映数据的大小。气泡地图可以直观地反应国家或地区的相关数据指标大小和分布情况。

气泡地图的输入通常包含两部分：

- 国家或地区的坐标（经度和纬度）
- 表明气泡大小和颜色的数值变量

## 获取地图数据

我们使用`maps`包加载每个国家的边界数据。

```R
library(tidyverse)

library(maps)

UK <- map_data("world") %>% filter(region=="UK")
```

![](/images/202508/2/1.png)

加载英国每个城市的数据：

```R
data <- world.cities %>%
  filter(country.etc=="UK")
```

![](/images/202508/2/2.png)

## 绘制散点地图

加载完所需数据后，我们可以绘制散点地图。用`geom_polygon`绘制地图，用`geom_point`绘制散点。

```R
ggplot() +
  geom_polygon(data = UK, aes(x = long, y = lat, group = group),
               fill = "grey", alpha=0.3) +
  geom_point(data = data, aes(x = long, y = lat)) +
  theme_void() +
  ylim(50, 59) +
  coord_map()
```

![](/images/202508/2/3.png)

接下来，我们绘制人口量最大的 10 个城市：

```R
library(ggrepel)
ggplot() +
  geom_polygon(data = UK, aes(x = long, y = lat, group = group),
               fill = "grey", alpha=0.3) +
  geom_point(data = data, aes(x = long, y = lat, alpha = pop)) +
  geom_text_repel(data = data %>% arrange(pop) %>% tail(10),
                  aes(x = long, y = lat, label = name), size = 5) +
  geom_point(data = data %>% arrange(pop) %>% tail(10),
             aes(x = long, y = lat), color="red", size=3) +
  theme_void() +
  ylim(50, 59) +
  coord_map() +
  theme(legend.position = "none")
```

![](/images/202508/2/4.png)

这里使用`ggrepel`库来避免城市名重叠。

## 绘制气泡地图

现在我们想让每个城市的人口数与气泡的颜色和大小对应。城市的绘制顺序很重要，建议将最重要的信息显示在顶部。这可以通过在绘制图之前对数据集进行排序解决。

```R
library(viridis)
data %>%
  arrange(pop) %>%
  mutate(name=factor(name,unique(name))) %>%
  ggplot() +
  geom_polygon(data = UK, aes(x=long, y = lat, group = group), fill="grey", alpha=0.3) +
  geom_point( aes(x=long, y=lat, size=pop, color=pop), alpha=0.9) +
  scale_size_continuous(range=c(1,12)) +
  scale_color_viridis(trans="log") +
  theme_void() + ylim(50,59) + coord_map() + theme(legend.position="none")
```

![](/images/202508/2/5.png)

## 自定义气泡地图

我们可以自定义气泡地图来得到更好的效果。

```R
# Create breaks for the color scale
mybreaks <- c(0.02, 0.04, 0.08, 1, 7)

# Reorder data to show biggest cities on top
data <- data %>%
  arrange(pop) %>%
  mutate( name=factor(name, unique(name))) %>%
  mutate(pop=pop/1000000)

# Build the map
data %>%
  ggplot() +
  geom_polygon(data = UK, aes(x=long, y = lat, group = group), fill="grey", alpha=0.3) +
  geom_point(  aes(x=long, y=lat, size=pop, color=pop, alpha=pop), shape=20, stroke=FALSE) +
  scale_size_continuous(name="Population (in M)", trans="log", range=c(1,12), breaks=mybreaks) +
  scale_alpha_continuous(name="Population (in M)", trans="log", range=c(0.1, .9), breaks=mybreaks) +
  scale_color_viridis(option="magma", trans="log", breaks=mybreaks, name="Population (in M)" ) +
  theme_void() + ylim(50,59) + coord_map() +
  guides( colour = guide_legend()) +
  ggtitle("The 1000 biggest cities in the UK") +
  theme(
    legend.position = c(0.85, 0.8),
    text = element_text(color = "#22211d"),
    plot.background = element_rect(fill = "#f5f5f2", color = NA),
    panel.background = element_rect(fill = "#f5f5f2", color = NA),
    legend.background = element_rect(fill = "#f5f5f2", color = NA),
    plot.title = element_text(size= 16, hjust=0.1, color = "#4e4d47", margin = margin(b = -0.1, t = 0.4, l = 2, unit = "cm")),
  )
```

## 交互式气泡地图

最后，我们用`plotly`包绘制交互式气泡地图。

```R
# Load the plotly package
library(plotly)

# Reorder data + Add a new column with tooltip text
data <- data %>%
  arrange(pop) %>%
  mutate(name = factor(name, unique(name))) %>%
  mutate(mytext = paste(
    "City:",name,"\n","Population:", pop, sep = ""
  ))

# Make the map (static)
p <- data %>%
  ggplot() +
  geom_polygon(data = UK, aes(x=long, y = lat, group = group), fill="grey", alpha=0.3) +
  geom_point(aes(x=long, y=lat, size=pop, color=pop, text=mytext, alpha=pop) ) +
  scale_size_continuous(range=c(1,15)) +
  scale_color_viridis(option="inferno", trans="log" ) +
  scale_alpha_continuous(trans="log") +
  theme_void() +
  ylim(50,59) +
  coord_map() +
  theme(legend.position = "none")

p <- ggplotly(p, tooltip="text")
p
```

![](/images/202508/2/7.png)

## 小结

本文我们用 ggplot2 成功绘制了带有气泡的世界地图。通过改变气泡的大小、颜色和透明度，可以轻松地传达地理空间分布与数量差异。气泡地图在人口统计、销售分布、地理分析等领域都非常实用。

## 参考

https://help.aliyun.com/document_detail/55644.html

https://www.r-graph-gallery.com/330-bubble-map-with-ggplot2.html


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/r%E8%AF%AD%E8%A8%80ggplot2%E6%B0%94%E6%B3%A1%E5%9C%B0%E5%9B%BE%E5%AE%9E%E6%88%98/  

