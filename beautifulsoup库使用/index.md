# BeautifulSoup库使用


`BeautifulSoup`是啥？它是一个可以从 HTML 或 XML 文件中提取数据的 Python 库。它能通过我们喜欢的转换器实现文档导航，查找和修改。

&lt;!--more--&gt;

## 安装 BeautifulSoup

可以通过`pip`来安装，包的名字的是`beautifulsoup4`。

```Python
pip install -i https://pypi.douban.com/simple beautifulsoup4
```

## 安装解析器

`BeautifulSoup`除了支持 Python 标准库中的 HTML 解析器之外，还支持一些第三方的解析器，比如[lxml](https://lxml.de)。可以按下列方式来安装 lxml：

```Python
pip install -i https://pypi.douban.com/simple lxml
```

另一个可供选择的解析器是纯 Python 实现的[html5lib](https://github.com/html5lib/html5lib-python)，可以按下列方式来安装 html5lib：

```Python
pip install -i https://pypi.douban.com/simple html5lib
```

下表列出了主要的解析器以及它们的优缺点：

![](/images/202110/2/1.png)

## 如何使用

将一段文档传入`BeautifulSoup`的构造方法就能得到一个文档对象，可以传入一段字符串或一个文件句柄。

```Python
from bs4 import BeautifulSoup

soup = BeautifulSoup(open(&#34;index.html&#34;))

suop = BeautifulSoup(&#34;&lt;html&gt;data&lt;/html&gt;&#34;)
```

如果手动指定解析器的话，`BeautifulSoup`会选择指定的解析器来解析文档。

## 对象的种类

`BeautifulSoup`将复杂的 HTML 文档转换成一个复杂的树形结构，每个节点都是 Python 对象，所有对象可以归纳为 4 中：`Tag`，`NavigableString`，`BeautifulSoup`，`Comment`。

### Tag

`Tag`对象与 XML 或 HTML 文档中的 tag 相同：

```Python
from bs4 import BeautifulSoup

soup = BeautifulSoup(&#39;&lt;b class=&#34;boldest&#34;&gt;Extremely bold&lt;/b&gt;&#39;)
tag = soup.b
type(tag)
# &lt;class &#39;bs4.element.Tag&#39;&gt;
```

`Tag`有很多方法和属性，比如遍历文档树和搜索文档树。现在介绍一下 tag 中最重要的属性：`name`和`attributes`。

#### Name

每个 tag 都有自己的名字，通过`.name`来获取：

```Python
tag.name
# &#39;b&#39;
```

如果改变 tag 的 name 将会影响所有通过当前`BeautifulSoup`对象生成的 HTML 文档：

```Python
tag.name = &#34;blockquote&#34;
tag
# &lt;blockquote class=&#34;boldest&#34;&gt;Extremely bold&lt;/blockquote&gt;

tag.name = &#34;ironman&#34;
tag
# &lt;ironman class=&#34;boldest&#34;&gt;Extremely bold&lt;/ironman&gt;
```

#### Attributes

一个 tag 可能有很多个属性。tag `&lt;b class=&#34;boldest&#34;&gt;`有一个名为`class`的属性，值为`boldest`。tag 的属性的操作方法与字典相同：

```Python
tag[&#39;class&#39;]

# [&#39;boldest&#39;]
```

也可以直接`.`取属性，比如：`.attrs`：

```Python
tag.attrs

# {&#39;class&#39;: [&#39;boldest&#39;]}
```

tag 的属性可以被添加，删除或修改，和字典一样。

```Python
In [13]: tag[&#39;class&#39;]
Out[13]: [&#39;boldest&#39;]

In [14]: tag[&#39;class&#39;] = &#39;verybold&#39;

In [15]: tag[&#39;id&#39;] = 1

In [16]: tag
Out[16]: &lt;ironman class=&#34;verybold&#34; id=&#34;1&#34;&gt;Extremely bold&lt;/ironman&gt;

In [17]: del tag[&#39;class&#39;]

In [18]: del tag[&#39;id&#39;]

In [19]: tag
Out[19]: &lt;ironman&gt;Extremely bold&lt;/ironman&gt;

In [20]: tag[&#39;class&#39;]
KeyError

In [21]: tag.get(&#39;class&#39;)
```

#### 多值属性

HTML 定义了一系列可以包含多个值的属性。最常见的多值属性是`class`（一个 tag 可以有多个 CSS 的`class`）。在`BeautifulSoup`中多值属性的返回类型是 list：

```Python
In [22]: css_soup = BeautifulSoup(&#39;&lt;p class=&#34;body strikeout&#34;&gt;&lt;/p&gt;&#39;)

In [23]: css_soup.p[&#39;class&#39;]
Out[23]: [&#39;body&#39;, &#39;strikeout&#39;]
```

如果某个属性看起来好像有多个值，但在任何版本的 HTML 定义中都没有被定义为多值属性，那么`BeautifulSoup`会将这个属性作为字符串返回

```Python
In [25]: id_soup = BeautifulSoup(&#39;&lt;p id=&#34;my id&#34;&gt;&lt;/p&gt;&#39;)

In [26]: id_soup.p[&#39;id&#39;]
Out[26]: &#39;my id&#39;
```

### NavigableString

字符串常被包含在 tag 内。`BeautifulSoup`用`NavigableString`类来包装 tag 中的字符串：

```Python
In [27]: tag
Out[27]: &lt;ironman&gt;Extremely bold&lt;/ironman&gt;

In [28]: tag.string
Out[28]: &#39;Extremely bold&#39;

In [29]: type(tag.string)
Out[29]: bs4.element.NavigableString
```

NavigableString 对象支持[遍历文档树](https://www.crummy.com/software/BeautifulSoup/bs4/doc.zh/#id15)和[搜索文档树](https://www.crummy.com/software/BeautifulSoup/bs4/doc.zh/#id24)中定义的大部分属性, 并非全部。

### BeautifulSoup

`BeautifulSoup`对象表示的是整个文档的内容。大部分时候，可以把它当作`Tag`对象，它支持[遍历文档树](https://www.crummy.com/software/BeautifulSoup/bs4/doc.zh/#id15)和[搜索文档树](https://www.crummy.com/software/BeautifulSoup/bs4/doc.zh/#id24)中定义的大部分方法。

### Comment

`Tag`，`NavigableString`，`BeautifulSoup`几乎覆盖了 html 和 xml 中的所有内容，但是还有一些特殊对象。

```Python
In [30]: markup = &#34;&lt;b&gt;&lt;!--Hey, buddy. Want to buy a used parser?--&gt;&lt;/b&gt;&#34;

In [31]: soup = BeautifulSoup(markup, &#39;lxml&#39;)

In [32]: comment = soup.b.string

In [34]: type(comment)
Out[34]: bs4.element.Comment
```

`Comment`对象是一个特殊类型的`NavigableString`对象。 `soup = BeautifulSoup(markup, &#39;lxml&#39;)`中的`lxml`用于指定解析器。

## 搜索文档树

`BeautifulSoup`定义了很多搜索方法，这里着重介绍 2 个：`find_all()`和`select()`。

以“爱丽丝”文档作为例子：

```Python
In [40]: html_doc = &#34;&#34;&#34;
    ...: &lt;html&gt;&lt;head&gt;&lt;title&gt;The Dormouse&#39;s story&lt;/title&gt;&lt;/head&gt;
    ...:
    ...: &lt;p class=&#34;title&#34;&gt;&lt;b&gt;The Dormouse&#39;s story&lt;/b&gt;&lt;/p&gt;
    ...:
    ...: &lt;p class=&#34;story&#34;&gt;Once upon a time there were three little sisters; and their names were
    ...: &lt;a href=&#34;http://example.com/elsie&#34; class=&#34;sister&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
    ...: &lt;a href=&#34;http://example.com/lacie&#34; class=&#34;sister&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt; and
    ...: &lt;a href=&#34;http://example.com/tillie&#34; class=&#34;sister&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;;
    ...: and they lived at the bottom of a well.&lt;/p&gt;
    ...:
    ...: &lt;p class=&#34;story&#34;&gt;...&lt;/p&gt;
    ...: &#34;&#34;&#34;

In [41]: from bs4 import BeautifulSoup

In [42]: soup = BeautifulSoup(html_doc, &#39;lxml&#39;)
```

使用`find_all()`类似的方法可以查找到想要查找的文档内容。

### 过滤器

在介绍`find_all()`方法之前，先介绍一下过滤器的类型，这些过滤器贯穿整个搜索的 API。过滤器可以被用在 tag 的 name 中，节点的属性中，字符串中或它们的混合中。

#### 字符串

最简单的过滤器是字符串。在搜索方法中传入也给字符串参数，`BeautifulSoup`会查找与字符串完整匹配的内容，下面的例子用于查找文档中所有`&lt;b&gt;`标签：

```Python
In [43]: soup.find_all(&#39;b&#39;)
Out[43]: [&lt;b&gt;The Dormouse&#39;s story&lt;/b&gt;]
```

#### 正则表达式

如果传入正则表达式作为参数，`BeautifulSoup`会通过正则表达式的`match()`来匹配内容。下例中找出所有以 b 开头的标签，这意味着`&lt;body&gt;`和`&lt;b&gt;`标签都应该被找到：

```Python
In [44]: import re

In [45]: for tag in soup.find_all(re.compile(&#39;^b&#39;)):
    ...:     print(tag.name)
    ...:
# body
# b
```

#### 列表

如果传入列表参数`BeautifulSoup`会将领与列表中任一元素匹配的内容返回。下列代码将会找到文档中所有`&lt;a&gt;`和`&lt;b&gt;`标签：

```Python
In [46]: soup.find_all([&#39;a&#39;,&#39;b&#39;])
Out[46]:
[&lt;b&gt;The Dormouse&#39;s story&lt;/b&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]
```

#### True

`True`可以匹配任何值，以下代码查找到所有的 tag，但不会返回字符串节点：

```Python
In [47]: for tag in soup.find_all(True):
    ...:     print(tag.name)
    ...:

# html
# head
# title
# body
# p
# b
# p
# a
# a
# a
p
```

#### 方法

如果没有合适的过滤器，还可以定义一个方法，方法只接受一个元素参数，如果这个方法返回`True`表示当前元素匹配并且被找到，若不是则返回`False`。

下列方法检验了当前元素，如果包含`class`属性却不包含`id`属性则返回`True`：

```Python
def has_class_but_no_id(tag):
    return tag.has_attr(&#39;class&#39;) and not tag.has_attr(&#39;id&#39;)
```

将该方法作为参数传入`find_all()`方法将得到所有`&lt;p&gt;`标签：

```Python
In [66]: soup.find_all(has_class_but_no_id)
Out[66]:
[&lt;p class=&#34;title&#34;&gt;&lt;b&gt;The Dormouse&#39;s story&lt;/b&gt;&lt;/p&gt;,
 &lt;p class=&#34;story&#34;&gt;Once upon a time there were three little sisters; and their names were
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt; and
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;;
 and they lived at the bottom of a well.&lt;/p&gt;,
 &lt;p class=&#34;story&#34;&gt;...&lt;/p&gt;]
```

返回结果中只有`&lt;p&gt;`标签没有`&lt;a&gt;`标签，因为`&lt;a&gt;`标签还定义了`id`，没有返回`&lt;html&gt;`和`&lt;head&gt;`，因为`&lt;html&gt;`和`&lt;head&gt;`中没有定义`class`属性。

下面代码找到所有被文字包含的节点内容：

```Python
In [68]: from bs4 import NavigableString

def surrounded_by_strings(tag):
    return isinstance(tag.next_element, NavigableString) and isinstance(tag.previous_element, NavigableString)

In [70]: for tag in soup.find_all(surrounded_by_strings):
    ...:     print(tag.name)
    ...:
# p
# a
# a
# a
# p
```

### find_all()

```Python
find_all(name, attrs, recursive, text, **kwargs)
```

`find_all()`方法搜索当前 tag 的所有 tag 子节点，并判断是否符合过滤器的条件。

#### name 参数

`name`参数可以查找所有名字为`name`的 tag，字符串对象会被自动忽略掉。

例如：

```Python
In [72]: soup.find_all(&#34;title&#34;)
Out[72]: [&lt;title&gt;The Dormouse&#39;s story&lt;/title&gt;]
```

`name`参数的值可以是任一类型的过滤器，字符串、正则表达式、列表、方法或是`True`。

#### keyword 参数

如果一个指定名字的参数不是搜索内置的参数名，搜索时会把该参数当作指定名字 tag 的属性来搜索。如果包含一个名字为`id`参数，`BeautifulSoup`会搜索每个 tag 的`id`属性。

```Python
In [73]: soup.find_all(id=&#34;link2&#34;)
Out[73]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;]
```

如果传入`href`参数，`BeautifulSoup`会搜索每个 tag 的`href`属性：

```Python
In [76]: soup.find_all(href=re.compile(&#39;elsie&#39;))
Out[76]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;]
```

搜索指定名字的属性时可以使用的参数值包括：字符串、正则表达式、列表、True。

下例在文档中查找所有包含`id`属性的 tag，无论`id`的值是什么：

```Python
In [77]: soup.find_all(id=True)
Out[77]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]
```

使用多个指定名字的参数可以同时过滤 tag 的多个属性：

```Python
In [78]: soup.find_all(href=re.compile(&#34;elsie&#34;), id=&#39;link1&#39;)
Out[78]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;]
```

有些 tag 属性在搜索时不能使用，比如 HTML5 中的`data-*`属性：

```Python
In [79]: data_soup = BeautifulSoup(&#39;&lt;div data-foo=&#34;value&#34;&gt;foo!&lt;/div&gt;&#39;, &#39;lxml&#39;)

In [80]: data_soup.find_all(data-foo=&#34;value&#34;)
  File &#34;&lt;ipython-input-80-a766c8a0cac6&gt;&#34;, line 1
    data_soup.find_all(data-foo=&#34;value&#34;)
                      ^
SyntaxError: keyword can&#39;t be an expression
```

可以通过`find_all()`方法`attrs`参数定义一个字典参数来搜索包含特殊属性的 tag：

```Python
In [81]: data_soup.find_all(attrs={&#39;data-foo&#39;:&#39;value&#39;})
Out[81]: [&lt;div data-foo=&#34;value&#34;&gt;foo!&lt;/div&gt;]
```

#### 按 CSS 搜索

可以通过`class_`参数搜索指定 CSS 类名的 tag：

```Python
In [82]: soup.find_all(&#39;a&#39;, class_=&#34;sister&#34;)
Out[82]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]
```

`class_`参数同样接受不同类型的过滤器，字符串，正则表达式，方法或`True`。

#### text 参数

通过`text`参数可以搜索文档中的字符串内容。与`name`参数的可选值一样，`text`参数接受字符串，正则表达式，列表，`True`，方法。

```Python
In [83]: soup.find_all(text=&#39;Elsie&#39;)
Out[83]: [&#39;Elsie&#39;]

In [84]: soup.find_all(text=[&#39;Tillie&#39;,&#39;Elsie&#39;,&#39;Lacie&#39;])
Out[84]: [&#39;Elsie&#39;, &#39;Lacie&#39;, &#39;Tillie&#39;]

In [85]: soup.find_all(text=re.compile(&#39;Dormouse&#39;))
Out[85]: [&#34;The Dormouse&#39;s story&#34;, &#34;The Dormouse&#39;s story&#34;]

def is_the_only_string_within_a_tag(s):
    &#34;&#34;&#34;Return True if this string is the only child of its parent tag.&#34;&#34;&#34;
    return (s == s.parent.string)

In [87]: soup.find_all(text=is_the_only_string_within_a_tag)
Out[87]:
[&#34;The Dormouse&#39;s story&#34;,
 &#34;The Dormouse&#39;s story&#34;,
 &#39;Elsie&#39;,
 &#39;Lacie&#39;,
 &#39;Tillie&#39;,
 &#39;...&#39;]
```

虽然`text`参数用于搜索字符串，还可以与其它参数混合使用来过滤 tag。`BeautifulSoup`会找到`.string`属性与`text`参数值相符的 tag。以下代码用来搜索内容中包含`Elsie`的`&lt;a&gt;`标签：

```Python
In [88]: soup.find_all(&#39;a&#39;, text=&#34;Elsie&#34;)
Out[88]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;]
```

#### limit 参数

`find_all()`方法返回全部的搜索结构，如果文档树很大那么搜索会很慢。如果我们不需要全部结果，可以使用`limit`参数限制返回结果的数量。当搜索结果的数量达到`limit`的限制时，就停止搜索返回结果。

```Python
In [89]: soup.find_all(&#39;a&#39;)
Out[89]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]

In [90]: soup.find_all(&#39;a&#39;,limit=2)
Out[90]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;]
```

#### recursive 参数

调用 tag 的`find_all()`方法时，`BeautifulSoup`会检索当前 tag 的所有子孙节点，如果只想搜索 tag 的直接子节点，可以使用参数`recursive=False`。

有如下文档：

```Python
&lt;html&gt;
 &lt;head&gt;
  &lt;title&gt;
   The Dormouse&#39;s story
  &lt;/title&gt;
 &lt;/head&gt;
...
```

是否使用`recursive`参数的结果：

```Python
In [95]: soup.html.find_all(&#39;title&#39;)
Out[95]:
[&lt;title&gt;
    The Dormouse&#39;s story
   &lt;/title&gt;]

In [96]: soup.html.find_all(&#39;title&#39;, recursive=False)
Out[96]: []
```

### 像调用 find_all()一样调用 tag

`find_all()`几乎是`BeautifulSoup`中最常见的搜索方法，所以定义了它的简写方法。`BeautifulSoup`对象和`Tag`对象可以被当作一个方法来使用，这个方法的执行结果与调用这个对象的`find_all()`方法相同。

下面两行代码是等价的：

```Python
soup.find_all(&#34;a&#34;)
soup(&#34;a&#34;)
```

以下两行代码也是等价的：

```Python
soup.title.find_all(text=True)
soup.title(text=True)
```

### CSS 选择器

`BeautifulSoup`支持大部分的 CSS 选择器，在`Tag`或`BeautifulSoup`对象的`select()`方法中传入字符串参数即可使用 CSS 选择器的语法找到 tag：

```Python
In [1]: from bs4 import BeautifulSoup

In [2]: html_doc = &#34;&#34;&#34;
   ...: &lt;html&gt;&lt;head&gt;&lt;title&gt;The Dormouse&#39;s story&lt;/title&gt;&lt;/head&gt;
   ...: &lt;body&gt;
   ...: &lt;p class=&#34;title&#34;&gt;&lt;b&gt;The Dormouse&#39;s story&lt;/b&gt;&lt;/p&gt;
   ...:
   ...: &lt;p class=&#34;story&#34;&gt;Once upon a time there were three little sisters; and their names were
   ...: &lt;a href=&#34;http://example.com/elsie&#34; class=&#34;sister&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
   ...: &lt;a href=&#34;http://example.com/lacie&#34; class=&#34;sister&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt; and
   ...: &lt;a href=&#34;http://example.com/tillie&#34; class=&#34;sister&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;;
   ...: and they lived at the bottom of a well.&lt;/p&gt;
   ...:
   ...: &lt;p class=&#34;story&#34;&gt;...&lt;/p&gt;
   ...: &#34;&#34;&#34;

In [3]: soup = BeautifulSoup(html_doc, &#39;lxml&#39;)

In [4]: soup.select(&#39;title&#39;)
Out[4]: [&lt;title&gt;The Dormouse&#39;s story&lt;/title&gt;]

In [5]: soup.select(&#39;p:nth-of-type(3)&#39;)
Out[5]: [&lt;p class=&#34;story&#34;&gt;...&lt;/p&gt;]
```

通过 tag 标签逐层查找：

```Python
In [6]: soup.select(&#39;body a&#39;)
Out[6]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]

In [7]: soup.select(&#39;html head title&#39;)
Out[7]: [&lt;title&gt;The Dormouse&#39;s story&lt;/title&gt;]
```

找到某个 tag 标签下的直接子标签：

```Python
In [8]: soup.select(&#39;head &gt; title&#39;)
Out[8]: [&lt;title&gt;The Dormouse&#39;s story&lt;/title&gt;]

In [9]: soup.select(&#39;p &gt; a&#39;)
Out[9]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]

```

找到兄弟节点标签：

```Python
In [14]: soup.select(&#39;#link1 ~ .sister&#39;)
Out[14]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]

In [15]: soup.select(&#39;#link1 &#43; .sister&#39;)
Out[15]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;]
```

通过 CSS 的类名查找：

```Python
In [16]: soup.select(&#39;.sister&#39;)
Out[16]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]

In [17]: soup.select(&#39;[class~=sister]&#39;)
Out[17]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]
```

通过 tag 的 id 查找：

```Python
In [18]: soup.select(&#39;#link1&#39;)
Out[18]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;]

In [19]: soup.select(&#39;a#link2&#39;)
Out[19]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;]
```

通过是否存在某个属性来查找：

```Python
In [20]: soup.select(&#39;a[href]&#39;)
Out[20]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]
```

通过属性的值来查找：

```Python
In [21]: soup.select(&#39;a[href=&#34;http://example.com/elsie&#34;]&#39;)
Out[21]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;]

In [22]: soup.select(&#39;a[href^=&#34;http://example.com/&#34;]&#39;)
Out[22]:
[&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/lacie&#34; id=&#34;link2&#34;&gt;Lacie&lt;/a&gt;,
 &lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]

In [23]: soup.select(&#39;a[href$=&#34;tillie&#34;]&#39;)
Out[23]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/tillie&#34; id=&#34;link3&#34;&gt;Tillie&lt;/a&gt;]

In [24]: soup.select(&#39;a[href*=&#34;.com/el&#34;]&#39;)
Out[24]: [&lt;a class=&#34;sister&#34; href=&#34;http://example.com/elsie&#34; id=&#34;link1&#34;&gt;Elsie&lt;/a&gt;]
```

更多有关 CSS 选择器的内容，请参考[CSS 选择器参考手册](https://www.w3school.com.cn/cssref/css_selectors.ASP)。

## 爬取豆瓣电影 TOP250 海报

接下来，通过爬取豆瓣电影 TOP250 海报实践一下。访问[豆瓣电影 Top 250](https://movie.douban.com/top250)

![](/images/202110/2/3.png)

可以看到每部电影左侧都配有一张海报，我们的目的就是下载这些海报到本地。

多看几页，就会发现每个页面的 URL 和页号是有关系的。

![](/images/202110/2/4.png)

URL 中`start`这个参数的值等于`(页号 - 1) * 25`。接下来，再审查一下元素

![](/images/202110/2/5.png)

可以发现海报的地址包含在`class`值为`pic`的`div`元素下，我们可以用`BeautifulSoup`的`select()`方法获取到`img`元素，再提取`src`属性。代码如下所示：

```Python
from urllib.request import urlopen
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from urllib.request import Request
import os

BASE_URL = &#34;https://movie.douban.com/top250?start={page_id}&amp;filter=&#34;
user_agent = UserAgent()


def get_content(url):
    &#34;&#34;&#34;
    根据url发送请求
    :param url: 请求url
    :return: 响应内容
    &#34;&#34;&#34;
    headers = {
        &#39;User-Agent&#39;: user_agent.random

    }
    request = Request(url, headers=headers)
    response = urlopen(request)
    return response.read()


def parse_html(html):
    &#34;&#34;&#34;
    解析HTML
    :param html: HTML文档字符串
    :return:
    &#34;&#34;&#34;
    soup = BeautifulSoup(html, &#39;lxml&#39;)
    items = soup.select(&#34;.pic img&#34;)
    for item in items:
        yield item.get(&#34;src&#34;)


def save_image(image_url, file_name, folder=&#39;images&#39;):
    &#34;&#34;&#34;
    保存图片
    :param image_url: 图片地址
    :param file_name: 文件名
    :param folder: 保存目录
    &#34;&#34;&#34;
    image = get_content(image_url)
    if not os.path.exists(folder):
        os.mkdir(folder)
    file_name = &#34;{}/{}.jpg&#34;.format(folder, file_name)
    with open(file_name, &#39;wb&#39;) as f_obj:
        f_obj.write(image)
    print(&#34;保存:&#34;, file_name)


def main():
    total = 0
    for i in range(20):
        url = BASE_URL.format(page_id=i * 25)
        html = get_content(url).decode(&#39;utf-8&#39;)
        for image in parse_html(html):
            print(&#34;下载:&#34;, image)
            save_image(image, total)
            total &#43;= 1

if __name__ == &#39;__main__&#39;:
    main()

```

运行结果如下：

![](/images/202110/2/6.png)

最后，可以将所有的海报拼接起来：

```Python
import math
import PIL.Image as Image

def merge_images(folder, size=1000):
    &#34;&#34;&#34;
    将folder目录下的图片按尺寸size拼接
    :param folder: 图片
    :param size: 尺寸
    &#34;&#34;&#34;
    images_count = len(os.listdir(folder))
    each_size = int(math.sqrt(size * size / images_count)) - 1
    lines_count = int(size / each_size)
    final_image = Image.new(&#39;RGB&#39;, (size, size), &#39;white&#39;)
    row, column = 0, 0
    for i in range(images_count):
        image_path = &#34;{}/{}.jpg&#34;.format(folder, i)
        try:
            image = Image.open(image_path)
        except IOError as e:
            print(image_path, &#34;出错啦！！！&#34;)
        else:
            image = image.resize((each_size, each_size))
            final_image.paste(image, (row * each_size, column * each_size))
            column &#43;= 1
            if column == lines_count:
                column = 0
                row &#43;= 1

    final_image.save(&#34;{}/{}.jpg&#34;.format(folder, &#34;final_image&#34;)))
```

得到：

![](/images/202110/2/7.jpg)

## 总结

本文我们介绍了`BeautifulSoup`库的一些内容，它可以将 HTML/XML 文档进行解析，得到一个文档树

![](/images/202110/2/2.png)

树中的每个节点都是`BeautifulSoup`四种对象中的一种。可以用`find_all()`或`select()`找到我们需要查找的节点。之后，可以通过节点的属性或者方法获取到我们需要的信息。

## 参考

- https://www.crummy.com/software/BeautifulSoup/bs4/doc.zh/


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/beautifulsoup%E5%BA%93%E4%BD%BF%E7%94%A8/  

