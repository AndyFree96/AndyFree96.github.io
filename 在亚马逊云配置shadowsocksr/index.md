# 在亚马逊云配置ShadowsocksR


在当今互联网环境中，保护网络隐私和确保数据安全变得尤为重要。ShadowsocksR（SSR）作为一种高效的代理工具，凭借其出色的加密性能和灵活的配置，成为了许多人突破网络限制、保护隐私的首选工具。本文将详细介绍如何在亚马逊云（AWS）平台上配置 ShadowsocksR，帮助你轻松搭建一个稳定的代理服务，以便在全球范围内实现安全的网络访问。

&lt;!--more--&gt;

## 创建实例

要使用亚马逊云服务，需要注册一个账号。去亚马逊云官网：https://amazonaws-china.com/cn 进行注册。

注册成功后，再次访问上述网站

![](/images/202008/1/1.png)

选择 AWS 管理控制台，输入账号、密码进行登录。

登录后，右上角选择一个合适的地区

![](/images/202008/1/2.png)

然后，在左上角的服务中选择 EC2

![](/images/202008/1/3.png)

新打开的页面中，有一个启动实例的选项

![](/images/202008/1/4.png)

点击启动实例，进入到 Amazon 系统映像选择，这里我选择的是`Ubuntu Server 16.04 LTS`（记得选免费套餐）。

![](/images/202008/1/5.png)

点击选择选项，进入到选择实例类型选项，仍然选择免费套餐

![](/images/202008/1/6.png)

点击审核和启动。接下来是核查实例启动，直接点击启动即可。

![](/images/202008/1/7.png)

然后会出现一个，选择现有密钥对或创建新密钥对的弹窗。这里我选择创建新密钥对

![](/images/202008/1/8.png)

之后点击下载密码对，会下载一个扩展名为`pem`的文件，这里我的密钥对名称是`viljw`，所以下载的文件名为`viljw.pem`。下载后，启动实例。

回到 EC2 首页，可以看到创建的实例已经启动了

![](/images/202008/1/9.png)

点击正在运行的实例，就可以看到公有 DNS，公有 IP，实例状态等等信息。

![](/images/202008/1/10.png)

## 使用 XShell 连接

打开 Xshell，选择工具选项中的用户密钥管理者

![](/images/202008/1/11.png)

在弹出的对话框中导入之前下载的`pem`文件

![](/images/202008/1/12.png)

导入成功后，新建连接，输入名称（随便填），协议 SSH，主机（EC2 实例的公有 IP），端口 22

![](/images/202008/1/13.png)

上述信息填完后，不要点击确定，点击用户身份验证选项

![](/images/202008/1/14.png)

方法选择`Public Key`，用户名填`ubuntu`（根据之前的选择的 EC2 实例映像类型），点击确定即可连接成功。

![](/images/202008/1/15.png)

## 修改 EC2 防火墙配置

亚马逊云 EC2 防火墙入站配置默认只开启了 22 端口的流量，为了之后 ShadowsocksR 的使用，我们可以更改该配置，把协议和端口范围都改成全部或只开启某个特定端口。

在实例列表中，有一个安全组项，选择该选项进入防火墙配置

![](/images/202008/1/16.png)

点击编辑

![](/images/202008/1/17.png)

如下编辑入站规则，并保存。

![](/images/202008/1/18.png)

## 安装 ShadowsocksR

打开 Xshell 连接上亚马逊云服务器。依次输入以下命令：

```Python
sudo -i

wget –no-check-certificate https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks-all.sh

chmod &#43;x shadowsocks-all.sh

./shadowsocks-all.sh 2&gt;&amp;1 | tee shadowsocks-all.log
```

选择选项 2.`ShadowsocksR`，输入密码和端口，其他的选项默认就好。安装脚本运行结束后，会显示如下内容

![](/images/202008/1/19.png)

接下来，我们更改一下配置文件。输入命令：

```Python
vim /etc/shadowsocks-r/config.json
```

按键盘上的字母`i`进行编辑文件。进行如下更改：

```Python
&#34;protocol&#34;:&#34;origin&#34;
# 改为
&#34;protocol&#34;:&#34;auth_sha1_v4&#34;

&#34;obfs&#34;:&#34;plain&#34;
# 改为
&#34;obfs&#34;:&#34;tls1.2_ticket_auth&#34;
```

按键盘左上角的`Esc`键，输入`:wq`保存更改并退出编辑。

重启 ShadowsocksR：

```Python
/etc/init.d/shadowsocks-r restart
```

下载客户端：

[ShadowsocksR for Windows](https://github.com/shadowsocksrr/shadowsocksr-csharp/releases)

[ShadowsocksR for Android](https://github.com/shadowsocksrr/shadowsocksr-android/releases)

下载并安装好后，启动`ShadowsocksR`，填写好相关信息。

![](/images/202008/1/20.png)

打开浏览器访问谷歌：https://www.google.com/

![](/images/202008/1/21.png)

可以正常访问说明配置成功！

如果想了解更多 Shadowsocks 的使用，请看[ShadowSocksR(SSR)功能详细介绍及使用教程](https://www.quchao.net/ShadowsocksR.html)。

## 参考

- https://coderschool.cn/2755.html
- https://greycoder.com/using-shadowsocksr-to-bypass-the-chinese-firewall/


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E5%9C%A8%E4%BA%9A%E9%A9%AC%E9%80%8A%E4%BA%91%E9%85%8D%E7%BD%AEshadowsocksr/  

