# csv2源码剖析


&gt; 纸上得来终觉浅，绝知此事要躬行。——陆游《冬夜读书示子聿》

[csv2](https://github.com/p-ranav/csv2)是一个轻量级 C&#43;&#43; 库，用于将 CSV 文件解析为 C&#43;&#43; 中的 STL 容器。该库的主要功能是高效地处理 CSV 数据，简化了处理 CSV 文件的代码编写过程。以下是它的主要特性：

1. 简单易用：通过使用 STL 容器（如 std::vector 和 std::tuple），使得开发者能够轻松将 CSV 文件的内容转换为标准 C&#43;&#43; 数据结构。
2. 依赖少：该库只有 C&#43;&#43;17 标准库的依赖，因此不需要额外的第三方库。
3. 高效解析：该库采用高效的解析机制，支持处理大型 CSV 文件。
4. 轻量级：代码库很小，适用于嵌入式或对依赖库要求较高的项目。

&lt;!--more--&gt;

## 准备

项目源代码地址为[p-ranav/csv2](https://github.com/p-ranav/csv2) v1.0。

阅读工具为 CLion。

## 剖析

整个项目包含 4 个文件，分别是: `reader.hpp`、`mio.hpp`、`writer.hpp`和`parameters.hpp`。

[.c vs .cc vs. .cpp vs .hpp vs .h vs .cxx](https://stackoverflow.com/questions/5171502/c-vs-cc-vs-cpp-vs-hpp-vs-h-vs-cxx): 由于历史渊源，造成头文件和源代码文件有些不同的命名方式，但本质而言没有什么区别。

### reader.hpp

reader.hpp 文件中主要定义了一个名为`Reader`的类。数据部分主要有:

![](/images/202410/16/6.png)

紧接着定义了两个方法: `mmap`和`parse`，分别从文件和字符串内容解析内容。

从文件中解析内容:

```C&#43;&#43;
#include &#34;csv2/reader.hpp&#34;
#include &lt;string&gt;

using namespace std;

int main(){
	csv2::Reader&lt;csv2::delimiter&lt;&#39;,&#39;&gt;,
            csv2::quote_character&lt;&#39;&#34;&#39;&gt;,
            csv2::first_row_is_header&lt;true&gt;,
            csv2::trim_policy::trim_whitespace&gt; csv;


    std::string content = &#34;Name, Age\nPeter, 12\nLucy, 78&#34;;
    if(csv.parse(content)){
        const auto header = csv.header();
        for (const auto row: csv) {
            for (const auto cell: row) {
                // Do something with cell value
                std::string value;
                cell.read_value(value);
                cout &lt;&lt; value &lt;&lt; &#34; &#34;;
            }
            cout &lt;&lt; &#34;\n&#34;;
        }
    }
}

```

从字符串中解析内容:

```C&#43;&#43;
#include &#34;csv2/reader.hpp&#34;
#include &lt;string&gt;

using namespace std;

int main(){
	csv2::Reader&lt;csv2::delimiter&lt;&#39;,&#39;&gt;,
            csv2::quote_character&lt;&#39;&#34;&#39;&gt;,
            csv2::first_row_is_header&lt;true&gt;,
            csv2::trim_policy::trim_whitespace&gt; csv;

    if(csv.mmap(&#34;demo.csv&#34;)){
        const auto header = csv.header();
        for (const auto row: csv) {
            for (const auto cell: row) {
                // Do something with cell value
                std::string value;
                cell.read_value(value);
                cout &lt;&lt; value &lt;&lt; &#34; &#34;;
            }
            cout &lt;&lt; &#34;\n&#34;;
        }
    }
}

```

`parse`方法中使用了[知识点 10](#point-10)。

reader.hpp 中还定义了`Cell`、`Row`、`RowIterator`等类。

![](/images/202410/16/7.png)

为了方便在之后的类中使用 RowIterator、Row 和 CellIterator，文件中加了 forward-declaration，如上图所示。

#### Cell

Cell 类的数据部分定义如下:

![](/images/202410/16/8.png)

其中的`buffer_`指向 memory-mapped buffer，可参考[知识点 4](#point-4)，我们可以简单的将其理解为指向数据内容的一个指针。

主要包括两个方法: `read_raw_value`和`read_value`，两个方法稍有区别，前者处理无转义字符，后者处理有转义字符。

#### Row

Row 类的数据部分定义如下:

![](/images/202410/16/9.png)

和 Cell 类的定义大同小异。Row 类中还定义了另一个类 CellIterator:

```C&#43;&#43;
class CellIterator {
      friend class Row;
      const char *buffer_;
      size_t buffer_size_;
      size_t start_;
      size_t current_;
      size_t end_;

    public:
      CellIterator(const char *buffer, size_t buffer_size, size_t start, size_t end)
          : buffer_(buffer), buffer_size_(buffer_size), start_(start), current_(start_), end_(end) {
      }

      CellIterator &amp;operator&#43;&#43;() {
        current_ &#43;= 1;
        return *this;
      }

      Cell operator*() {
        bool escaped{false};
        class Cell cell;
        cell.buffer_ = buffer_;
        cell.start_ = current_;
        cell.end_ = end_;

        size_t last_quote_location = 0;
        bool quote_opened = false;
        for (auto i = current_; i &lt; end_; i&#43;&#43;) {
          current_ = i;
          if (buffer_[i] == delimiter::value &amp;&amp; !quote_opened) {
            // actual delimiter
            // end of cell
            cell.end_ = current_;
            cell.escaped_ = escaped;
            return cell;
          } else {
            if (buffer_[i] == quote_character::value) {
              if (!quote_opened) {
                // first quote for this cell
                quote_opened = true;
                last_quote_location = i;
              } else {
                escaped = (last_quote_location == i - 1);
                last_quote_location &#43;= (i - last_quote_location) * size_t(!escaped);
                quote_opened = escaped || (buffer_[i &#43; 1] != delimiter::value);
              }
            }
          }
        }
        cell.end_ = current_ &#43; 1;
        return cell;
      }

      bool operator!=(const CellIterator &amp;rhs) { return current_ != rhs.current_; }
    };
```

CellIterator 中定义了自增操作符、取值操作符和不等操作符。Iterator 必须实现这三个操作符:

```C&#43;&#43;
#include &lt;iostream&gt;

using namespace std;

// forward-declaration to allow use in Iter
class IntVector;

class Iter
{
    public:
    Iter (const IntVector* p_vec, int pos)
        : _pos( pos )
        , _p_vec( p_vec )
    { }

    // these three methods form the basis of an iterator for use with
    // a range-based for loop
    bool
    operator!= (const Iter&amp; other) const
    {
        return _pos != other._pos;
    }

    // this method must be defined after the definition of IntVector
    // since it needs to use it
    int operator* () const;

    const Iter&amp; operator&#43;&#43; ()
    {
        &#43;&#43;_pos;
        // although not strictly necessary for a range-based for loop
        // following the normal convention of returning a value from
        // operator&#43;&#43; is a good idea.
        return *this;
    }

    private:
    int _pos;
    const IntVector *_p_vec;
};

class IntVector
{
    public:
    IntVector ()
    {
    }

    int get (int col) const
    {
        return _data[ col ];
    }
    Iter begin () const
    {
        return Iter( this, 0 );
    }

    Iter end () const
    {
        return Iter( this, 100 );
    }

    void set (int index, int val)
    {
        _data[ index ] = val;
    }

    private:
   int _data[ 100 ];
};

int
Iter::operator* () const
{
     return _p_vec-&gt;get( _pos );
}

// sample usage of the range-based for loop on IntVector
int main()
{
    IntVector v;
    for ( int i = 0; i &lt; 100; i&#43;&#43; )
    {
        v.set( i , i );
    }
    for ( int i : v ) { cout &lt;&lt; i &lt;&lt; endl; }
}
```

C&#43;&#43; 11 range-based for loops: https://www.cprogramming.com/c&#43;&#43;11/c&#43;&#43;11-ranged-for-loop.html

还定义了`begin`和`end`两个方法用于返回`RowIterator`。

#### RowIterator

RowIterator 的定义和 CellIterator 的定义大致相同。

### mio.hpp

mio.hpp 相比与其他三个文件的代码多了不少，也复杂了许多。文件一开始定义了`template &lt;access_mode AccessMode, typename ByteT&gt; struct basic_mmap`结构体，然后围绕这个结构体声明了一系列操作符:

![](/images/202410/16/11.png)

其定义在行号 1058 处:

![](/images/202410/16/12.png)

之后定义了 5 个工厂方法，方便构建`mmap`、`mmap_source`以及`mmap_sink`对象:

![](/images/202410/16/13.png)

然后在 587 处开始定义了字符串相关的工具函数:

![](/images/202410/16/14.png)

在 684 处开始定义了与 Windows 平台相关的`open_file_helper`函数。

![](/images/202410/16/15.png)

然后定义了`template &lt;typename String&gt; file_handle_type open_file`，`inline size_t query_file_size`和`inline mmap_context memory_map`函数，以及`struct mmap_context`结构体。之后，实现了许多在`template &lt;access_mode AccessMode, typename ByteT&gt; struct basic_mmap`声明的方法。

最后定义了`template &lt;access_mode AccessMode, typename ByteT&gt; class basic_shared_mmap`类。

### writer.hpp

writer.hpp 中包含将数据导出的功能。主要定义了两个方法:`write_row`和`write_rows`，代表写入一行和写入多行。

例如，将数据写入到文件中:

```C&#43;&#43;
#include &lt;csv2/reader.hpp&gt;
#include &lt;csv2/parameters.hpp&gt;
#include &lt;csv2/mio.hpp&gt;
#include &lt;csv2/writer.hpp&gt;
#include &lt;iostream&gt;
#include &lt;ostream&gt;
#include &lt;vector&gt;
#include &lt;string&gt;

using namespace csv2;
using namespace std;

int main() {
	std::ofstream out(&#34;info.csv&#34;);
	csv2::Writer&lt;csv2::delimiter&lt;&#39;,&#39;&gt;, std::ofstream&gt; writer(out);
	std::vector&lt;std::string&gt; header = { &#34;Name&#34;, &#34;Age&#34; };
	writer.write_row(header);
	writer.write_rows(content);
}
```

![](/images/202410/16/10.png)

### parameters.hpp

首先，为了组织代码引入了`trim_policy`命名空间。 包含了`no_trimming`、`trim_characters`两个结构体，以及`using trim_whitespace = trim_characters&lt;&#39; &#39;, &#39;\t&#39;&gt;;`一句，于是给空白符`&#39; &#39;`和`&#39;\t&#39;`新的使用方式——`trim_whitespace`。需要注意的是，该标识符在`trim_policy`命名空间中。

![](/images/202410/16/3.png)

此外，还包含`delimiter`、`quote_character`以及`first_row_is_header`三个结构体，和之前不同的是它们在`csv2`命令空间中。

整个文件的结构体里面的方法或数据都是`static`的，表示我们可以用`delimiter&lt;&#39;:&#39;&gt;::value`的方式直接获取里面的数据，而不用实例化（实例化从逻辑上好像也有一些问题，同样是用`:`作为分隔符却实例化了两个不同的对象，有点奇怪）。

关于可变参数模板可看[知识点 5](#point-5)。

pair 的使用: https://cplusplus.com/reference/utility/pair/pair/

## 知识点

### 1. CMake 项目添加第三方库

在 CMakeLists.txt 中添加如下语句:

![](/images/202410/16/1.png)

即可将三方库的头文件包含进来。

### 2. Static Const 使用

mio.hpp 中有如下一段代码:

```C&#43;&#43;
/**
 * Determines the operating system&#39;s page allocation granularity.
 *
 * On the first call to this function, it invokes the operating system specific syscall
 * to determine the page size, caches the value, and returns it. Any subsequent call to
 * this function serves the cached value, so no further syscalls are made.
 */
inline size_t page_size() {
  static const size_t page_size = [] {
#ifdef _WIN32
    SYSTEM_INFO SystemInfo;
    GetSystemInfo(&amp;SystemInfo);
    return SystemInfo.dwAllocationGranularity;
#else
    return sysconf(_SC_PAGE_SIZE);
#endif
  }();
  return page_size;
}

```

`page_size()`内部的匿名函数只会运行一次，得益于`static const`声明，这样可以避免重复调用`sysconf()`函数（如注释所述）。

https://www.tutorialspoint.com/static-const-vs-hashdefine-vs-enum

### 3. static_assert

mio.hpp 中有`static_assert`的写法。

![](/images/202410/16/2.png)

static_assert declaration: https://en.cppreference.com/w/cpp/language/static_assert

Understanding static_assert in C&#43;&#43; 11: https://www.geeksforgeeks.org/understanding-static_assert-c-11/

### &lt;div id=&#34;point-4&#34;&gt;4. mmap&lt;/div&gt;

mio.hpp 中的`memory_map`函数使用了`mmap`。

[Use the mmap Function to Write to the Memory in C](https://www.delftstack.com/howto/c/use-mmap-function-to-write-to-the-memory-in-c/)

Shared Memory: https://kuafu1994.github.io/MoreOnMemory/sharedMemory.html

mapread.c 和 mapwrite.c: https://gist.github.com/marcetcheverry/991042

Memory Mapped I/O: https://www.cs.uleth.ca/~holzmann/C/system/mmap.html

#### 存储映射 I/O

存储映射 I/O（Memory-Mapped I/O）能将一个磁盘文件映射到存储空间的一个缓冲区上，当从缓冲区中取数据时，就相当于读文件中的相应字节。与此类似，将数据存入缓冲区时，相应字节就自动写入文件。如此一来，就可以在不调用 read 和 write 的情况下执行 I/O。——《UNIX 环境高级编程》14.8 节

探索内存原理的内存映射文件: https://zhuanlan.zhihu.com/p/429987335

File Mapping in C&#43;&#43; Applications: https://www.geeksforgeeks.org/file-mapping-in-cpp-applications/

File Mapping: https://learn.microsoft.com/en-us/windows/win32/memory/file-mapping

Mapping files into virtual memory in C on windows: https://stackoverflow.com/questions/68368291/mapping-files-into-virtual-memory-in-c-on-windows

示例代码:

```C&#43;&#43;
#include &lt;cstdio&gt;
#include &lt;windows.h&gt;
#include &lt;iostream&gt;

using namespace std;

int main(int argc, char* argv[]) {
	const TCHAR* lpFileName = TEXT(&#34;hello.txt&#34;);
	HANDLE hFile;
	HANDLE hMap;
	LPVOID lpBasePtr;
	LARGE_INTEGER liFileSize;

	hFile = CreateFile(lpFileName,
		GENERIC_READ,                          // dwDesiredAccess
		0,                                     // dwShareMode
		NULL,                                  // lpSecurityAttributes
		OPEN_EXISTING,                         // dwCreationDisposition
		FILE_ATTRIBUTE_NORMAL,                 // dwFlagsAndAttributes
		0);                                    // hTemplateFile
	if (hFile == INVALID_HANDLE_VALUE) {
		fprintf(stderr, &#34;CreateFile failed with error %d\n&#34;, GetLastError());
		return 1;
	}

	if (!GetFileSizeEx(hFile, &amp;liFileSize)) {
		fprintf(stderr, &#34;GetFileSize failed with error %d\n&#34;, GetLastError());
		CloseHandle(hFile);
		return 1;
	}

	if (liFileSize.QuadPart == 0) {
		fprintf(stderr, &#34;File is empty\n&#34;);
		CloseHandle(hFile);
		return 1;
	}

	hMap = CreateFileMapping(
		hFile,
		NULL,                          // Mapping attributes
		PAGE_READONLY,                 // Protection flags
		0,                             // MaximumSizeHigh
		0,                             // MaximumSizeLow
		NULL);                         // Name
	if (hMap == 0) {
		fprintf(stderr, &#34;CreateFileMapping failed with error %d\n&#34;, GetLastError());
		CloseHandle(hFile);
		return 1;
	}

	lpBasePtr = MapViewOfFile(
		hMap,
		FILE_MAP_READ,         // dwDesiredAccess
		0,                     // dwFileOffsetHigh
		0,                     // dwFileOffsetLow
		0);                    // dwNumberOfBytesToMap
	if (lpBasePtr == NULL) {
		fprintf(stderr, &#34;MapViewOfFile failed with error %d\n&#34;, GetLastError());
		CloseHandle(hMap);
		CloseHandle(hFile);
		return 1;
	}

	// Display file content as ASCII charaters
	char* ptr = (char*)lpBasePtr;
	LONGLONG i = liFileSize.QuadPart;
	while (i-- &gt; 0) {
		fputc(*ptr&#43;&#43;, stdout);
	}

	UnmapViewOfFile(lpBasePtr);
	CloseHandle(hMap);
	CloseHandle(hFile);

	printf(&#34;\nDone\n&#34;);
}
```

### &lt;div id=&#34;point-5&#34;&gt;5. 可变参数模板&lt;/div&gt;

在 parameters.hpp 中使用了可变参数模板（Variadic Template Function）。

[C&#43;&#43;11 – Variadic Template Function | Tutorial &amp; Examples](https://thispointer.com/c11-variadic-template-function-tutorial-examples/)

```C&#43;&#43;

template&lt;typename T&gt;
void logging(T t){
    cout &lt;&lt; t;
    cout &lt;&lt; &#34;\nLast Call\n&#34;;
}

template&lt;typename T, typename ... Args&gt;
void logging(T first, Args... args){
    cout &lt;&lt; first &lt;&lt; &#34;, &#34;;
    logging(args...);
}
```

### 6. `#pragma once`

[What does `#pragma` once mean in C?](https://stackoverflow.com/questions/5776910/what-does-pragma-once-mean-in-c)

截至到 2023 年为止，主流的编译器都支持`#pragma once`。

### 7. `__has_include()`

根据[Source file inclusion](https://en.cppreference.com/w/cpp/preprocessor/include)的描述，`__has_include()`可以用来检测某个头文件是否存在，但此时并没有将其引入。

### 8. `defined(identifier)`

reader.hpp 中有`#if defined(identifier)`一句。

![](/images/202410/16/4.png)

[`#if`, `#elif`, `#else`, and `#endif` directives](https://learn.microsoft.com/en-us/cpp/preprocessor/hash-if-hash-elif-hash-else-and-hash-endif-directives-c-cpp?view=msvc-170)

### 9. 模板默认参数

reader.hpp 有默认模板参数的写法:

![](/images/202410/16/5.png)

在 C&#43;&#43; 17 之前，如果不用任何模板参数且正常使用 Reader 类的话，需要使用如下语法:

```C&#43;&#43;
Reader&lt;&gt; reader;
```

将 CMakeLists.txt 中的 C&#43;&#43;版本由 14

```
set(CMAKE_CXX_STANDARD 14)
```

改为 17

```
set(CMAKE_CXX_STANDARD 17)
```

即可用如下轻便的语法使用 Reader。

```C&#43;&#43;
Reader reader;
```

### &lt;div id=&#34;point-10&#34;&gt;10. std::forward&lt;/div&gt;

https://cplusplus.com/reference/utility/forward/

通过使用`std::forward`函数可以根据实参调用不同的函数，如下面例子所示:

```C&#43;&#43;
#include &lt;utility&gt;      // std::forward
#include &lt;iostream&gt;     // std::cout

// function with lvalue and rvalue reference overloads:
void overloaded (const int&amp; x) {std::cout &lt;&lt; &#34;[lvalue]&#34;;}
void overloaded (int&amp;&amp; x) {std::cout &lt;&lt; &#34;[rvalue]&#34;;}

// function template taking rvalue reference to deduced type:
template &lt;class T&gt; void fn (T&amp;&amp; x) {
  overloaded (x);                   // always an lvalue
  overloaded (std::forward&lt;T&gt;(x));  // rvalue if argument is rvalue
}

int main () {
  int a;

  std::cout &lt;&lt; &#34;calling fn with lvalue: &#34;;
  fn (a);
  std::cout &lt;&lt; &#39;\n&#39;;

  std::cout &lt;&lt; &#34;calling fn with rvalue: &#34;;
  fn (0);
  std::cout &lt;&lt; &#39;\n&#39;;

  return 0;
}
```

### 11. std::string

https://cplusplus.com/reference/string/string/

string::erase 可用于清除指定位置的字符。

string::reserve 可用于指定 string 存储空间的大小。

string::push_back 可将字符存入 string 中。

## 最后

项目中涉及到的存储映射 I/O ，若要想彻底弄清楚机制，可能需要补充一些操作系统方面的知识。


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: https://andyfree96.github.io/csv2%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

