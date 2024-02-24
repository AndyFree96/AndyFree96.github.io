# Axios教程


&lt;!--more--&gt;

![图片来自: https://unsplash.com/photos/a-man-climbing-up-the-side-of-a-mountain-85ey1vFIwkc](/images/202402/1/neom-85ey1vFIwkc-unsplash.jpg)

[Axios](https://github.com/axios/axios)是一个基于 Promise 的 HTTP 客户端，我们可以在浏览器和 Node.js 中使用它。

Axios 使向 REST 端点发送异步 HTTP 请求和执行 CRUD 操作变得更加容易。它可以在纯 JavaScript 中使用，也可以在 Vue 或者 React

之类的库中使用。

先看一个在浏览器中使用 Axios 的例子，我们发送一个请求到`https://api.github.com/users/USERNAME`，以获取到用户的一些信息。

新建一个名为 1.html 的文件，代码如下：

```HTML
&lt;!DOCTYPE html&gt;
&lt;html&gt;
    &lt;head&gt;&lt;/head&gt;
    &lt;title&gt;Axios&lt;/title&gt;
    &lt;body&gt;
        &lt;script src=&#34;https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js&#34;&gt;&lt;/script&gt;
        &lt;script src=&#34;main.js&#34;&gt;&lt;/script&gt;
    &lt;/body&gt;
&lt;/html&gt;
```

main.js 代码如下：

```JavaScript
axios.get(&#34;https://api.github.com/users/andyfree96&#34;).then(response =&gt; {
    console.log(response.data);
}).catch(error =&gt; {
    console.log(&#34;ERROR!&#34;);
});
```

启动服务器，

![](/images/202402/1/1.png)

如果您没有安装`http-server`的话，请自行安装一下。

打开浏览器，就可以看到：

![](/images/202402/1/2.png)

成功获取到用户信息。

之后的教程将在 Node.js 中使用 Axios，而不是在浏览器。

## 安装 Axios

本文使用的 Node.js 版本是：

![](/images/202402/1/3.png)

初始化一个 Node.js 应用，

```
npm init -y
```

在命令行中输入`npm i axios`安装即可。

## Axios 的响应对象

当我们发送一个请求给服务器后，它会返回一个响应。Axios 的响应对象包含如下内容：

- `data` - 服务器返回的响应主体数据
- `status` - 服务器返回的响应状态码
- `statusText` - 返回的状态信息
- `headers` - 返回的头部信息
- `config` - 请求的配置信息
- `request` - 请求对象

## Axios 的 GET 请求

我们以回调函数或者 async/await 的方式发送 Get 请求。

回调函数：

```js
const axios = require(&#34;axios&#34;);

axios.get(&#34;https://api.github.com/users/andyfree96&#34;).then((response) =&gt; {
  console.log(response.status);
  console.log(response.statusText);
  console.log(response.data);
});
```

结果如下：

![](/images/202402/1/4.png)

async/await：

```js
const axios = require(&#34;axios&#34;);

async function makeGetRequest() {
  let response = await axios.get(&#34;https://httpbin.org/get&#34;);
  let data = response.data;
  console.log(data);
  console.log(response.request._header);
}

makeGetRequest();
```

结果如下：

![](/images/202402/1/5.png)

## Axios 的 HEAD 请求

HEAD 请求是一个没有消息体的 GET 请求。

```js
const axios = require(&#34;axios&#34;);

async function makeHeadRequest() {
  let response = await axios.head(&#34;http://www.baidu.com&#34;);
  console.log(`status: ${response.status}`);
  console.log(`server : ${response.headers.server}`);
  console.log(response.headers);
}

makeHeadRequest();
```

![](/images/202402/1/6.png)

Axios 有两个基本的 API：

- `axios(config)`
- `axios(url, config)`

```js
const axios = require(&#34;axios&#34;);

async function makeRequest() {
  const config = {
    method: &#34;get&#34;,
  };
  const url = &#34;http://httpbin.org/get&#34;;
  let response = await axios(url, config);
  console.log(response.data);
}

makeRequest();
```

## Axios 自定义头部

```js
const axios = require(&#34;axios&#34;);

async function makeRequest() {
  const config = {
    method: &#34;get&#34;,
    url: &#34;http://www.baidu.com&#34;,
    headers: { &#34;User-Agent&#34;: &#34;5.js&#34; },
  };
  let response = await axios(config);
  console.log(response.request._header);
}

makeRequest();
```

这里我们自定义了一个请求头部：

```js
const config = {
  method: &#34;get&#34;,
  url: &#34;http://www.baidu.com&#34;,
  headers: { &#34;User-Agent&#34;: &#34;5.js&#34; },
};
```

![](/images/202402/1/7.png)

## Axios 的 POST 请求

```js
const axios = require(&#34;axios&#34;);

async function makePostRequest() {
  let response = await axios.post(&#34;https://httpbin.org/post&#34;);
  console.log(response.data);
}

makePostRequest();
```

![](/images/202402/1/8.png)

## 下载图片

```js
const axios = require(&#34;axios&#34;);
const fs = require(&#34;fs&#34;);

async function getImage(url) {
  const config = {
    responseType: &#34;stream&#34;,
  };
  let response = await axios.get(url, config);
  response.data.pipe(fs.createWriteStream(&#34;./image.png&#34;));
}

getImage(
  &#34;https://himg.bdimg.com/sys/portraitn/item/856f6c656f73636f74743936f939&#34;
);
```

我们在 config 对象中指明返回类型。

## 多个请求

我们可以用 Axios 一次性创建多个请求。

```js
const axios = require(&#34;axios&#34;);

async function makeRequests() {
  let [response1, response2] = await Promise.all([
    axios.get(&#34;https://api.github.com/users/andyfree96&#34;),
    axios.get(&#34;https://api.github.com/users/google&#34;),
  ]);
  console.log(response1.data.created_at);
  console.log(response2.data.created_at);
}

makeRequests();
```

![](/images/202402/1/9.png)

## JSON Server

JSON Server 是一个很棒的工具，可以让我们轻松地伪造 REST API。

我们先安装`json-server`:

```
npm i -g json-server
```

创建一个名为 employees.json 的文件，添加如下内容：

```JSON
{
  &#34;employees&#34;: [
    {
      &#34;id&#34;: 1,
      &#34;first_name&#34;: &#34;Sebastian&#34;,
      &#34;last_name&#34;: &#34;Eschweiler&#34;,
      &#34;email&#34;: &#34;sebastian@codingthesmartway.com&#34;
    },
    {
      &#34;id&#34;: 2,
      &#34;first_name&#34;: &#34;Steve&#34;,
      &#34;last_name&#34;: &#34;Palmer&#34;,
      &#34;email&#34;: &#34;steve@codingthesmartway.com&#34;
    },
    {
      &#34;id&#34;: 3,
      &#34;first_name&#34;: &#34;Ann&#34;,
      &#34;last_name&#34;: &#34;Smith&#34;,
      &#34;email&#34;: &#34;ann@codingthesmartway.com&#34;
    }
  ]
}
```

关于 JSON Server 创建 REST API 可以看下文。

Create A REST API With JSON Server: https://medium.com/codingthesmartway-com-blog/create-a-rest-api-with-json-server-36da8680136d

接下来我们可以启动 JSON Server，

```
json-server --watch employees.json
```

![](/images/202402/1/10.png)

访问`http://localhost:3000/employees`可以看到：

![](/images/202402/1/11.png)

接下来我们可以使用 Axios 添加员工，

```js
const axios = require(&#34;axios&#34;);

async function makePostRequest() {
  const params = {
    id: 4,
    first_name: &#34;Andy&#34;,
    last_name: &#34;Scott&#34;,
    email: &#34;andyfree96@126.com&#34;,
  };
  let response = await axios.post(&#34;http://localhost:3000/employees/&#34;, params);
  console.log(response.data);
}

makePostRequest();
```

获取员工,

```js
const axios = require(&#34;axios&#34;);

async function makeRequest() {
  let response = await axios.get(&#34;http://localhost:3000/employees&#34;);
  console.log(response.data);
}

makeRequest();
```

删除员工,

```js
const axios = require(&#34;axios&#34;);

async function makeDeleteRequest() {
  let response = axios.delete(&#34;http://localhost:3000/employees/4/&#34;);
  console.log(response.data);
}

makeDeleteRequest();
```

## 参考

Axios tutorial: http://zetcode.com/javascript/axios/


---

> 作者: AndyFree96  
> URL: https://andyfree96.github.io/axios%E6%95%99%E7%A8%8B/  

