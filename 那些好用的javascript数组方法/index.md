# 那些好用的JavaScript数组方法


在用 JavaScript 编程时，我们会经常用到数组对象，本文我们就来盘点一下那些好用的数组方法吧！😁

<!--more-->

为了方便演示，我们先创建两个数组：

```JavaScript
const a = ['JavaScript', 'Php', 'Python', 'Ruby', 'C++', 'Node.js', 'Java', 'C++'];

const b = [1, 3, 8, 16, 32, 48, 5];
```

## `every()`

首先，我们想知道数组`a`中的所有元素长度都是大于 4 的吗？对于这个数组的而言，结果是显然的。我们可以用如下的`for`循环得到问题的答案，

```JavaScript
let result = true;
for (let i = 0; i < a.length; i++>){
    if (a[i].length <= 4){
        result = false;
        break
    }
}
console.log(result);
```

结果如下：

![](/images/202402/4/1.png)

但用`for`循环的方式多少显得有些麻烦，我们可以更加简洁地得到结果，那就是使用`every()`方法。

```JavaScript
a.every(word => word.length > 4);
```

![](/images/202402/4/2.png)

通过传入一个箭头函数，就将问题解决啦，而且代码变得简洁清晰多了 😉。

## `some()`

接下来，我们想知道数组`b`中是否有大于 10 的元素呢？看起来这问题似乎有点傻，但......

![](/images/202402/4/3.png)

如果数组`b`中有 1 万个元素呢？

我们同样可以使用`for`循环得到问题的答案：

```JavaScript
let result = false;

for (let i = 0; i < b.length; i++){
    if (b[i] > 10){
        result = true;
        break;
    }
}

console.log(result);
```

我们还可以用`some()`方法，

```JavaScript
b.some(elem => elem > 10);
```

![](/images/202402/4/4.png)

如上所示，我们总是可以通过`every()`方法检测数组中所有元素都满足某种要求，而通过`some()`方法检测数组中是否有某个元素满足某种要求。

## `filter()`

我们已经知道数组`a`中并不是所有元素的长度都是大于 4 的，那么具体是哪些元素的长度大于 4 呢？有没有什么办法可以把它们都找到呢？

老规矩，我们依旧可以用`for`循环。

```JavaScript
let words = [];
for (let i = 0; i < a.length; i++){
    if (a[i].length > 4){
        words.push(a[i]);
    }
}
console.log(words);
```

![](/images/202402/4/5.png)

但我们还是推荐更加简短的`filter()`方法，

```JavaScript
a.filter(word => word.length > 4);
```

结果如下：

![](/images/202402/4/6.png)

## `map()`

接下来，我们来做另外一件事，那就是给数组`a`中的每个元素后追加一个字符串“ is awesome!”，我们可以怎么做呢？——用`map()`方法。

```JavaScript
a.map(word => word + " is awesome!");
```

![](/images/202402/4/7.png)

## `forEach()`

如果我们想将数组`a`中长度大于 4 的元素每每追加一个字符串“ is awesome!”并依次打印输出怎么做？

首先我们可以用`filter()`方法进行筛选，然后用`map()`方法进行追加，最后用`forEach()`方法进行迭代打印输出。

```JavaScript
a.filter(word => word.length > 4).map(word => word + " is awesome!").forEach(word => console.log(word));
```

![](/images/202402/4/8.png)

现在你可能发现了`map()`和`filter()`方法返回一个数组的好处了吧！😋

## `reduce()`

如果想将数组`b`进行求和运算该怎么做呢？——用`reduce()`方法。

`reduce()`方法的原型如下：

```JavaScript
array.reduce(reducer [, initialValue])
```

`reducer`为一个回调函数，以及可选初始化参数`initialValue`。`reduce()`方法会在每个数组元素上调用`reducer()`函数，`reducer()`函数返回一个累积的值，这个值在下一次调用`reducer()`函数时作为参数传入。

`reducer()`函数的原型如下：

```JavaScript
function reducer(accumulator, currentValue, currentIndex, array){}
```

回到给数组`b`进行求和的问题，代码如下：

```JavaScript
b.reduce((accu, curr) => accu + curr);
```

![](/images/202402/4/9.png)

## `includes()`

假如我们想知道数组中是否包含某个元素怎么整？比如，数组`a`包含`Julia`吗？

当然，我们可以用之前学到过的`some()`方法，

```JavaScript
a.some(word => word === 'Julia');
```

但还是推荐使用`includes()`方法：

```JavaScript
a.includes('Julia');
```

![](/images/202402/4/10.png)

无它，简明而已！

## `find()`

`filter()`可以帮我们找到数组`b`中所有大于 8 的元素，但有时候我们要的不是所有，而是第一个。此时我们可以用`find()`方法。

```JavaScript
b.find(elem => elem > 8);
```

![](/images/202402/4/11.png)

## `findIndex()`

如果你对第一个元素（详见`find()`方法）不感兴趣，而是迫切想知道满足某条件的第一个元素的下标，那么可以用`findIndex()`方法。

```JavaScript
b.findIndex(elem => elem > 8);
```

![](/images/202402/4/12.png)

## 总结

本文介绍了 9 个能让我们代码更加简洁的数组方法，分别是`every()`，`some()`，`filter()`，`map()`，`forEach()`，`reduce()`，`includes()`，`find()`和`findIndex()`，希望能让给你带来一点启发。

## 推荐

最后，推荐几个网站！

JavaScript Tutorial: https://www.javascripttutorial.net/

MDN Web Docs: https://developer.mozilla.org/en-US/

感兴趣的同学可以去瞅瞅 😍。

## 参考

https://www.w3schools.com/jsref/jsref_obj_array.asp


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E9%82%A3%E4%BA%9B%E5%A5%BD%E7%94%A8%E7%9A%84javascript%E6%95%B0%E7%BB%84%E6%96%B9%E6%B3%95/  

