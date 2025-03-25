# Requests库使用


- **2024/11/06 更新**: 修改**JSON 响应内容**、**定制请求头**、**POST 请求**中的代码以及图片

我们可以使用 Python 内置的 urllib 包来请求网络资源。它用起来比较麻烦，而且缺少很多实用的高级功能。本文我们将会介绍一个更加方便的 Python 第三方库——Requests 的使用。

&lt;!--more--&gt;

## 安装 Requests

要安装`Requests`，只要在终端中运行这个简单命令即可：

```Python
pip install -i https://pypi.douban.com/simple requests
```

安装好`Requests`后，就可以开始尝试使用它啦！

## 发送请求

使用`Requests`发送网络请求非常简单。导入`Requests`模块：

```Python
import requests
```

然后获取某个网页。我们来获取 Github 的公共时间线：

```Python
r = requests.get(&#39;https://api.github.com/events&#39;)
```

现在，有了一个名为`r`的`Response`的对象。我们可以从这个对象中获取所有我们想要的信息。

## 传递 URL 参数

我们可能会想用 URL 的查询字符串传递某种数据。如果是手动构建 URL，那么数据会以键值对的形式置于 URL 中，跟在一个问号的后面。例如，`http://httpbin.org/get?key=val`。`Requests`允许我们使用`params`关键字参数，以一个字符串字典来提供这些参数。举例来说，如果想传递`key1=value1`和`key2=value2`到`http://httpbin.org/get`，那么可以使用如下代码：

```Python
import requests

payload = {&#39;name&#39;:&#39;anthony&#39;, &#39;cat&#39;:&#39;ruby&#39;}
r = requests.get(&#39;http://httpbin.org/get&#39;, params=payload)
```

打印输出该 URL，能看到 URL 已被正确编码：

```Python
print(r.url)

# http://httpbin.org/get?name=anthony&amp;cat=ruby
```

## 响应内容

我们能读取服务器响应内容。举个例子：

```Python
import requests

r = requests.get(&#34;http://httpbin.org/get&#34;)
print(r.text)
```

输出内容如下：

![](/images/202110/1/1.png)

`Requests`会自动节码来自服务器的内容。大多数 unicode 字符集都能被无缝地解码。

请求发出后，`Requests`会基于 HTTP 头部对响应的编码作出有根据的推测。当访问`r.text`时，`Requests`会使用其推测的文本编码。我们可以找出`Requests`使用了什么编码，并且能够使用`r.encoding`属性来改变它：

```Python
import requests

r = requests.get(&#34;http://httpbin.org/get&#34;)
print(r.encoding)
r.encoding = &#39;utf-8&#39;
print(r.encoding)
```

![](/images/202110/1/2.png)

如果改变了编码，每当访问`r.text`，`Requests`都将会使用`r.encoding`的新值。

## 二进制响应内容

对于非文本请求，也能以字节的方式访问请求响应体。例如，以请求返回的二进制数据创建一张图片，可以使用如下代码：

```Python
import requests
from PIL import Image
from io import BytesIO

r = requests.get(&#34;https://github.com/fluidicon.png&#34;)
im = Image.open(BytesIO(r.content))
im.show()
```

![](/images/202110/1/3.png)

## JSON 响应内容

`Requests`中有一个内置的 JSON 解码器，帮助我们处理 JSON 数据：

```Python
import requests
from pprint import pprint

payload = {&#39;name&#39;:&#34;anthony&#34;, &#39;cat&#39;:&#39;ruby&#39;}
r = requests.get(&#34;http://httpbin.org/get&#34;, params=payload)
pprint(r.json())
```

![](/images/202110/1/4.png)

## 定制请求头

如果想为请求添加 HTTP 头部，只要简单地传递一个`dict`给`headers`参数就可。

```Python
import requests
from pprint import pprint

headers = {&#39;User-Agent&#39;: &#39;anthony-agent&#39;}
r = requests.get(&#34;http://httpbin.org/get&#34;, headers=headers)
pprint(r.json())
```

如下图所示，`User-Agent`字段的值已被更改为`anthony-agent`。

![](/images/202110/1/5.png)

## POST 请求

通常，我们会想要发送一些编码为表单形式的数据——非常像一个 HTML 表单。要实现这个，只需要简单地传递一个字典给`data`参数。字典数据在发出请求时会自动编码为表单形式：

```Python
import requests

payload = {&#34;name&#34;:&#34;anthony&#34;, &#34;actor&#34;:&#34;peter&#34;}
r = requests.post(&#34;http://httpbin.org/post&#34;, data=payload)
print(r.text)
```

![](/images/202110/1/6.png)

还可以给`data`参数传入一个元组列表。在表单中多个元素使用同一 key 的时候，这种方式很有用：

```Python
import requests

payload = [(&#34;name&#34;,&#34;anthony&#34;), (&#34;actor&#34;,&#34;peter&#34;),(&#34;actor&#34;,&#39;marry&#39;)]
r = requests.post(&#34;http://httpbin.org/post&#34;, data=payload)
print(r.text)
```

![](/images/202110/1/7.png)

## 响应状态码

我们可以查看响应状态码：

```Python
import requests

r = requests.get(&#34;http://httpbin.org/get&#34;)
print(r.status_code)

# 200
```

为了方便使用，`Requests`附带了也给内置的状态码查询对象：

```Python
r.status_code == requests.codes.ok

# True
```

如果发送了一个错误请求(一个 4XX 客户端错误，或 5XX 服务器错误响应)，我们可以通过`Response.raise_for_status()`来抛出异常：

```bash
In [1]: import requests

In [2]: bad_r = requests.get(&#39;http://httpbin.org/status/404&#39;)

In [3]: bad_r.status_code
Out[3]: 404

In [4]: bad_r.raise_for_status()
---------------------------------------------------------------------------
HTTPError                                 Traceback (most recent call last)
&lt;ipython-input-4-cdf6910f7d4c&gt; in &lt;module&gt;()
----&gt; 1 bad_r.raise_for_status()

c:\python\lib\site-packages\requests\models.py in raise_for_status(self)
    927
    928         if http_error_msg:
--&gt; 929             raise HTTPError(http_error_msg, response=self)
    930
    931     def close(self):

HTTPError: 404 Client Error: NOT FOUND for url: http://httpbin.org/status/404
```

但由于我们的例子中`r`的`status_code`是 200，当我们调用`raise_for_status()`时，得到的是：

```bash
In [6]: r.raise_for_status()

# None
```

## 响应头

我们可以查看以字典形式的服务器响应头：

```bash
In [7]: r.headers
Out[7]: {&#39;Access-Control-Allow-Credentials&#39;: &#39;true&#39;, &#39;Access-Control-Allow-Origin&#39;: &#39;*&#39;, &#39;Content-Encoding&#39;: &#39;gzip&#39;, &#39;Content-Type&#39;: &#39;application/json&#39;, &#39;Date&#39;: &#39;Thu, 03 Oct 2019 07:11:16 GMT&#39;, &#39;Referrer-Policy&#39;: &#39;no-referrer-when-downgrade&#39;, &#39;Server&#39;: &#39;nginx&#39;, &#39;X-Content-Type-Options&#39;: &#39;nosniff&#39;, &#39;X-Frame-Options&#39;: &#39;DENY&#39;, &#39;X-XSS-Protection&#39;: &#39;1; mode=block&#39;, &#39;Content-Length&#39;: &#39;184&#39;, &#39;Connection&#39;: &#39;keep-alive&#39;}
```

## Cookie

如果某个响应中包含一些 cookie，可以快速访问它们：

```bash
In [19]: r = requests.get(&#39;https://www.baidu.com&#39;)

In [20]: r.cookies
Out[20]: &lt;RequestsCookieJar[Cookie(version=0, name=&#39;BDORZ&#39;, value=&#39;27315&#39;, port=None, port_specified=False, domain=&#39;.baidu.com&#39;, domain_specified=True, domain_initial_dot=True, path=&#39;/&#39;, path_specified=True, secure=False, expires=1570173564, discard=False, comment=None, comment_url=None, rest={}, rfc2109=False)]&gt;

In [21]: r.cookies[&#39;BDORZ&#39;]
Out[21]: &#39;27315&#39;
```

要想发送 cookies 到服务器，可以使用`cookies`参数：

```bash
In [27]: url = &#39;http://httpbin.org/cookies&#39;

In [28]: cookies = dict(cookies_are=&#34;working&#34;)

In [29]: r = requests.get(url, cookies=cookies)

In [30]: r.json()
Out[30]: {&#39;cookies&#39;: {&#39;cookies_are&#39;: &#39;working&#39;}}
```

## 超时

可以告诉`Requests`在经过以`timeout`参数设定的秒数时间之后停止等待响应。

```bash
&gt;&gt;&gt; requests.get(&#39;http://github.com&#39;, timeout=0.001)
Traceback (most recent call last):
  File &#34;&lt;stdin&gt;&#34;, line 1, in &lt;module&gt;
requests.exceptions.Timeout: HTTPConnectionPool(host=&#39;github.com&#39;, port=80): Request timed out. (timeout=0.001)
```

## 错误与异常

遇到网络问题(如：DNS 查询失败、拒绝连接等)时，`Requests`会抛出一个`ConnectionError`异常。

如果 HTTP 请求返回了不成功的状态码， `Response.raise_for_status()`会抛出一个`HTTPError`异常。

若请求超时，则抛出一个`Timeout`异常。

若请求超过了设定的最大重定向次数，则会抛出一个`TooManyRedirects`异常。

所有`Requests`显式抛出的异常都继承自 `requests.exceptions.RequestException` 。

## 代理

如果需要使用代理，可以通过任意请求方法提供`proxies`参数来配置单个请求：

```Python
import requests

proxies = {
    &#39;https&#39;: &#39;https://127.0.0.1:1080&#39;
}

r = requests.get(&#39;https://www.google.com&#39;, proxies=proxies)
print(r.status_code)

# 200
```

也可以通过环境变量`HTTP_PROXY`和`HTTPS_PROXY`来配置代理。

```bash
$ export HTTP_PROXY=&#34;http://10.10.1.10:3128&#34;
$ export HTTPS_PROXY=&#34;http://10.10.1.10:1080&#34;

$ python
&gt;&gt;&gt; import requests
&gt;&gt;&gt; requests.get(&#34;http://example.org&#34;)
```

## 参考

- https://requests-docs-cn.readthedocs.io/zh_CN/latest/index.html


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/requests%E5%BA%93%E4%BD%BF%E7%94%A8/  

