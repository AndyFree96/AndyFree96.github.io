# Tkinter简明教程


本文我们将学习如何使用`Tkinter`包编写一些图形用户界面程序。`Tkinter`是 Python 的一个标准包，因此我们并不需要安装它。我们将从创建一个窗口开始，然后我们在其之上加入一些小组件，比如按钮，复选框等，并使用它们的一些属性。话不多说，让我们开始吧！

&lt;!--more--&gt;

## 创建一个窗口

首先，我们导入`Tkinter`包，然后创建一个窗口，最后给这个窗口设置标题。

```Python
from tkinter import *

window = Tk()
window.title(&#34;First Window&#34;)
window.mainloop()
```

结果如下：

![](/images/202410/2/1.png)

最后一行我们调用了`mainloop`函数，这个函数将让窗口等待用户与之交互，直到我们关闭它。如果忘记调用`mainloop`函数的话，将不会向用户显示任何内容（没有窗口）。

## 添加一个标签组件

为了给之前的例子增加一个标签组件，我们可以使用`Label`类：

```Python
lbl = Label(window, text=&#34;Hello&#34;)
```

我们可以通过`grid`函数设置其在窗口的位置：

```Python
lbl.grid(column=0, row=0)
```

完整代码如下所示：

```Python
from tkinter import *

window = Tk()
window.title(&#34;First Window&#34;)
lbl = Label(window, text=&#34;Hello&#34;)
lbl.grid(column=0, row=0)
window.mainloop()
```

结果如下：

![](/images/202410/2/2.png)

值得注意的是`lbl`没有调用`grid`函数的话是不会显示的。

### 设置标签字体大小

我们可以使用`font`参数设置标签字体大小：

```Python
lbl = Label(window, text=&#34;Hello&#34;, font=(&#34;Arial Bold&#34;, 50))
```

![](/images/202410/2/3.png)

`font`参数不光可以在标签组件中用，其他组件也可以使用呢！

可是，现在窗口貌似太小了，连窗口的标题都看不全，如何设置窗口大小呢？

### 设置窗口大小

我们可以用`geometry`函数来设置窗口大小：

```Python
window.geometry(&#34;350x200&#34;)
```

以上代码将会把窗口设置成 350 个像素宽，200 个像素高。

## 添加一个按钮组件

让我们给窗口增加一个按钮组件，它的创建和添加方式和标签组件差不多：

```Python
btn = Button(window, text=&#34;Click Me&#34;)
btn.grid(column=1, row=0)
```

完整代码如下所示：

```Python
from tkinter import *

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
lbl = Label(window, text=&#34;Hello&#34;)
lbl.grid(column=0, row=0)
btn = Button(window, text=&#34;Click Me&#34;)
btn.grid(column=1, row=0)
window.mainloop()
```

结果如下：

![](/images/202410/2/4.png)

### 更改按钮前景和背景颜色

我们可以用`fg`参数设置按钮或其他组件的前景色。

我们可以用`bg`参数设置按钮或其他组件的背景色。

```Python
btn = Button(window, text=&#34;Click Me&#34;, bg=&#34;orange&#34;, fg=&#34;red&#34;)
```

![](/images/202410/2/5.png)

现在，如果点击按钮，什么都不会发生，因为我们没有写处理点击事件的代码。

### 处理按钮点击事件

首先，我们编写一个当按钮点击后需要执行的函数：

```Python
def clicked():
    lbl.configure(text=&#34;Button was clicked!&#34;)
```

然后，我们注明一下点击时要调用的函数：

```Python
btn = Button(window, text=&#34;Click Me&#34;, command=clicked)
```

完整代码如下所示：

```Python
from tkinter import *

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
lbl = Label(window, text=&#34;Hello&#34;)
lbl.grid(column=0, row=0)

def clicked():
    lbl.configure(text=&#34;Button was clicked!&#34;)

btn = Button(window, text=&#34;Click Me&#34;, command=clicked)
btn.grid(column=1, row=0)
window.mainloop()
```

当我们点击按钮后，结果如下：

![](/images/202410/2/6.png)

## 添加一个文本框

在之前的例子中我们了解了如何添加一些简单组件，现在我们将通过`Tkinter`的`Entry`类获取到用户输入。我们可以这样用`Entry`类创建一个文本框：

```Python
txt = Entry(window, width=10)
```

然后可以用`grid`函数像之前那样添加到窗口中。

```Python
from tkinter import *

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
lbl = Label(window, text=&#34;Hello&#34;)
lbl.grid(column=0, row=0)
txt = Entry(window, width=10)
txt.grid(column=1, row=0)
def clicked():
    lbl.configure(text=&#34;Button was clicked!&#34;)

btn = Button(window, text=&#34;Click Me&#34;, command=clicked)
btn.grid(column=2, row=0)
window.mainloop()
```

![](/images/202410/2/7.png)

此时点击按钮，标签组件内的内容没有变化，如何将文本框中输入的信息在标签组件中显示呢？

我们可以用`get`函数获取到文本框中输入的信息，然后如下更改`clicked`函数来设置窗口大小：

```Python
def clicked():
    res = &#34;Welcome to &#34; &#43; txt.get()
    lbl.configure(text=res)
```

如果我们在文本框中输入信息并点击按钮组件，标签组件将会显示`Welcome to 文本框输入信息` 。

以下是完整代码：

```Python
from tkinter import *

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
lbl = Label(window, text=&#34;Hello&#34;)
lbl.grid(column=0, row=0)
txt = Entry(window, width=10)
txt.grid(column=1, row=0)
def clicked():
    res = &#34;Welcome to &#34; &#43; txt.get()
    lbl.configure(text=res)

btn = Button(window, text=&#34;Click Me&#34;, command=clicked)
btn.grid(column=2, row=0)
window.mainloop()
```

运行结果为：

![](/images/202410/2/8.png)

但每次我们运行代码后，我们都需要通过点击文本框来设置输入焦点才能输入信息，有什么办法可以自动设置输入焦点吗？

### 设置输入焦点

很简单，我们只需要调用`focus`函数来设置窗口大小：

```Python
txt.focus()
```

当我们运行代码后，会发现可以直接在文本框中输入信息而不需要点击文本框。

## 添加一个组合框

为了添加一个组合框，可以使用`Combobox`类：

```Python
from tkinter.ttk import *
combo = Combobox(window)
```

然后可以给组合框添加一些值。

```Python
from tkinter import *
from tkinter.ttk import *

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
combo = Combobox(window)
combo[&#39;values&#39;] = (1,2,3,4,5,&#34;Text&#34;)
combo.current(1)
combo.grid(column=0, row=0)
window.mainloop()
```

![](/images/202410/2/9.png)

如上所示，我们可以用元组设置组合框选项。

我们可以通过传递期望被选中选项的索引给`current`函数用以设置被选中的选项。

我们可以通过`get`函数获取到被选中的选项。

```Python
combo.get()
```

## 添加复选框

我们可以用`Checkbutton`类来创建一个复选框组件：

```Python
chk = Checkbutton(window, text=&#34;Choose&#34;)
```

能通过传递值设置复选框的状态：

```Python
from tkinter import *
from tkinter.ttk import *

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
chk_state = BooleanVar()
chk_state.set(True) # Set check state
chk = Checkbutton(window, text=&#34;Choose&#34;, var=chk_state)
chk.grid(column=0, row=0)
window.mainloop()
```

![](/images/202410/2/10.png)

上例我们用的是`BooleanVar`变量用来设置复选框的状态，也可以使用`IntVar`变量进行设置。

```Python
chk_state = IntVar()
chk_state.set(1) # Check
chk_state.set(0) # Uncheck
```

结果和用`BooleanVar`一样。

## 添加单选框

添加单选框可以用`Radiobutton`类创建一个文本框：

```Python
rad1 = Radiobutton(window, text=&#34;First&#34;, value=1)
```

我们需要给每个单选框设置不同的值，否则会不起作用。

```Python
from tkinter import *
from tkinter.ttk import *

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
rad1 = Radiobutton(window, text=&#34;First&#34;, value=1)
rad2 = Radiobutton(window, text=&#34;Second&#34;, value=2)
rad3 = Radiobutton(window, text=&#34;Third&#34;, value=3)
rad1.grid(column=0, row=0)
rad2.grid(column=1, row=0)
rad3.grid(column=2, row=0)
window.mainloop()
```

![](/images/202410/2/11.png)

当然，我们可以给这些单选框设置`command`参数指定一个函数，当用户点击它们时就会运行该函数。

```Python
rad1 = Radiobutton(window, text=&#34;First&#34;, value=1, command=clicked)

def clicked():
    # Do what you need
    pass
```

### 获取单选框值

为获取到选中单选框的值，我们可以将`IntVar`变量传给单选框的`variable`参数，之后用`IntVar`变量的`get`函数就可以获取到其值啦！

```Python
from tkinter import *
from tkinter.ttk import *

window = Tk()
window.title(&#34;First Window&#34;)
selected = IntVar()
lbl = Label(window, text=&#34;Show Value&#34;)
rad1 = Radiobutton(window, text=&#34;First&#34;, value=1, variable=selected)
rad2 = Radiobutton(window, text=&#34;Second&#34;, value=2, variable=selected)
rad3 = Radiobutton(window, text=&#34;Third&#34;, value=3, variable=selected)
def clicked():
    lbl.configure(text=selected.get())
btn = Button(window, text=&#34;Click Me&#34;, command=clicked)
rad1.grid(column=0, row=0)
rad2.grid(column=1, row=0)
rad3.grid(column=2, row=0)
btn.grid(column=4, row=0)
lbl.grid(column=0, row=1)
window.mainloop()
```

每次我们选中一个单选框，并点击按钮，标签框中就会显示其值：

![](/images/202410/2/12.png)

## 添加文本区

添加文本区可以用`ScrolledText`类创建一个文本框：

```Python
from tkinter import scrolledtext
txt = scrolledtext.ScrolledText(window, width=40, height=10)
```

我们需要指定一个文本区的宽度和高度，否则它会占住整个窗口：

```Python
from tkinter import *
from tkinter import scrolledtext

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
txt = scrolledtext.ScrolledText(window, width=40, height=10)
txt.grid(column=0, row=0)
window.mainloop()
```

![](/images/202410/2/13.png)

用以下方法可以在文本区中插入文本：

```Python
txt.insert(INSERT, &#34;Text goes here&#34;)
```

用以下方法可以将文本区中的文本删除：

```Python
txt.delete(1.0, END)
```

## 创建消息框

我们可以按如下方式创建一个消息框：

```Python
from tkinter import messagebox
messagebox.showinfo(&#34;Message title&#34;, &#34;Message content&#34;)
```

我们创建一个按钮，当它被点击时显示一个消息框：

```Python
from tkinter import *
from tkinter import messagebox

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
def clicked():
    messagebox.showinfo(&#34;Message title&#34;, &#34;Message content&#34;)
btn = Button(window, text=&#34;Click here&#34;, command=clicked)
btn.grid(column=0, row=0)
window.mainloop()
```

![](/images/202410/2/14.png)

## 添加 Spinbox

`Spinbox`是输入控件；与`Entry`类似，但是可以指定输入范围值。

```Python
spin = Spinbox(window, from_=0, to=100)
```

通过`from_`和`to`参数指定范围，也可以用`width`参数指定控件宽度。

```Python
from tkinter import *

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
spin = Spinbox(window, from_=0, to=100, width=5)
spin.grid(column=0, row=0)
window.mainloop()
```

![](/images/202410/2/15.png)

也可以指定某些特定的值，而不是整个范围：

```Python
from tkinter import *

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#34;350x200&#34;)
spin = Spinbox(window, values=(3,8,11), width=5)
spin.grid(column=0, row=0)
window.mainloop()
```

![](/images/202410/2/16.png)

这样，`Spinbox`控件就只会显示 3 个数字即 3，8，11。

可以用如下方式给`Spinbox`控件设置默认值：

```Python
var = IntVar()
var.set(36)
spin = Spinbox(window, from_=0, to=100, width=5, textvariable=var)
```

运行代码就可以看到 36 作为`Spinbox`控件的默认值显示了。

## 添加进度条

我们可以用`Progressbar`类创建进度条：

```Python
from tkinter.ttk import Progressbar
bar = Progressbar(window, length=200)
```

设置一下进度条的值：

```Python
bar[&#39;value&#39;] = 70
```

改变进度条的颜色可以按如下步骤进行：

```Python
from tkinter import *
from tkinter.ttk import Progressbar
from tkinter import ttk
window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#39;350x200&#39;)
style = ttk.Style()
style.theme_use(&#39;default&#39;)
style.configure(&#34;black.Horizontal.TProgressbar&#34;, background=&#39;black&#39;)
bar = Progressbar(window, length=200, style=&#39;black.Horizontal.TProgressbar&#39;)
bar[&#39;value&#39;] = 70
bar.grid(column=0, row=0)
window.mainloop()
```

![](/images/202410/2/17.png)

## 添加文件对话框

我们可以按如下方式创建一个文件对话框：

```Python
from tkinter import filedialog
file = filedialog.askopenfilename()
```

当你选择一个文件并点击打开，`file`变量将会保存该文件的路径。

如果想一次选择多个文件并打开，我们可以用：

```Python
files = filedialog.askopenfilenames()
```

用`filetypes`参数指定文件对话框的文件类型，只需在元组中指定扩展名即可。

```Python
file = filedialog.askopenfilename(filetypes = ((&#34;Text files&#34;,&#34;*.txt&#34;),(&#34;all files&#34;,&#34;*.*&#34;)))
```

`askdirectory`函数可以让我们请求目录：

```Python
dir = filedialog.askdirectory()
```

可以用`initialdir`参数指定打开的初始目录：

```Python
from tkinter import *
from tkinter import filedialog
import os

window = Tk()
window.title(&#34;First Window&#34;)
window.geometry(&#39;350x200&#39;)
def clicked():
    file = filedialog.askopenfilenames(initialdir=os.path.dirname(__file__))
btn = Button(window, text=&#34;Click Me&#34;, command=clicked)
btn.grid(column=0, row=0)
window.mainloop()
```

![](/images/202410/2/18.png)

## 参考

- https://likegeeks.com/python-gui-examples-tkinter-tutorial/


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:14625/tkinter%E7%AE%80%E6%98%8E%E6%95%99%E7%A8%8B/  

