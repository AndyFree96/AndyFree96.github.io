# 在Hugo中支持HDevelop语法


在使用[Hugo](https://gohugo.io/)构建技术博客时，代码高亮通常是一个“默认就能用”的能力。Hugo 默认提供了丰富的语言支持，大多数主流语言（如 Go、Python、C++、Matlab）都可以直接获得语法高亮效果。但当我阅读[机器视觉算法与应用 第2版 (Carsten Steger)](https://andyfree96.github.io/%E6%9C%BA%E5%99%A8%E8%A7%86%E8%A7%89%E7%AE%97%E6%B3%95%E4%B8%8E%E5%BA%94%E7%94%A8/)一书，将视觉领域的脚本语言——HDevelop引入到博客中时。问题出现了：Hugo默认不支持HDevelop。本文因此而写，记录了如何让Hugo支持HDevelop。

<!--more-->

## 准备环境

[Hugo](https://gohugo.io/)是开源项目。首先将源码Clone到本地并安装一些依赖包：

```bash
git clone https://github.com/gohugoio/hugo.git
cd hugo
go mod download
```

为了方便调试，这里使用的是VSCode。`.vscode/launch.json`内容如下：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug hugo",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${workspaceFolder}",
      "args": ["server", "-D", "--source", "./andyfree96"],
      "buildFlags": "-gcflags=all=-N -gcflags=all=-l"
    }
  ]
}
```

`andyfree96`是用`hugo`新建的一个示例站点，可参考[30分钟搭建完整的个人博客](https://juejin.cn/post/7458856975709143040)进行搭建。

调试需要安装[delve](https://github.com/go-delve/delve)，执行如下命令即可：

```bash
go install github.com/go-delve/delve/cmd/dlv@latest
```

但我在本机执行出现了如下提示：

```
go: downloading github.com/go-delve/delve v1.27.0 go: github.com/go-delve/delve/cmd/dlv@latest: github.com/go-delve/delve@v1.27.0: verifying module: checksum mismatch downloaded: h1:+kS/c3lq/7m2CskWmVRakaJL5+CioRjWutU5jjQkYac= sum.golang.org: h1:i66Einw/sQhm0hlbjLNUNxrwCmKdTcIqpyHVqSWAbd0= SECURITY ERROR This download does NOT match the one reported by the checksum server. The bits may have been replaced on the origin server, or an attacker may have intercepted the download attempt. For more information, see 'go help module-auth'.
```

依次执行下列命令，可正常安装：

```bash
go env -w GOPROXY=https://goproxy.cn,direct
go clean -modcache
go install github.com/go-delve/delve/cmd/dlv@latest
```

## 确定思路

经过一番浏览发现发现`markup\highlight\highlight.go`中有一个`highlight`函数：

```go
func highlight(fw hugio.FlexiWriter, code, lang string, attributes []attributes.Attribute, cfg Config) (int, int, error) {
	var lexer chroma.Lexer
	if lang != "" {
		lexer = chromalexers.Get(lang)
	}

	if lexer == nil && cfg.GuessSyntax {
		lexer = lexers.Analyse(code)
		if lexer == nil {
			lexer = lexers.Fallback
		}
		lang = strings.ToLower(lexer.Config().Name)
	}

	w := &byteCountFlexiWriter{delegate: fw}

	if lexer == nil {
		if cfg.Hl_inline {
			fmt.Fprintf(w, "<code%s>%s</code>", inlineCodeAttrs(lang), gohtml.EscapeString(code))
			return 0, 0, nil
		}

		preWrapper := getPreWrapper(lang, w)
		fmt.Fprint(w, preWrapper.Start(true, ""))
		fmt.Fprint(w, gohtml.EscapeString(code))
		fmt.Fprint(w, preWrapper.End(true))
		return preWrapper.low, preWrapper.high, nil
	}

	style := styles.Get(cfg.Style)
	if style == nil {
		style = styles.Fallback
	}
	lexer = chroma.Coalesce(lexer)

	iterator, err := lexer.Tokenise(nil, code)
	if err != nil {
		return 0, 0, err
	}

	if !cfg.Hl_inline {
		writeDivStart(w, attributes, cfg.WrapperClass)
	}

	options, err := cfg.toHTMLOptions()
	if err != nil {
		return 0, 0, err
	}

	var wrapper html.PreWrapper

	if cfg.Hl_inline {
		wrapper = startEnd{
			start: func(code bool, styleAttr string) string {
				if code {
					return fmt.Sprintf(`<code%s>`, inlineCodeAttrs(lang))
				}
				return ``
			},
			end: func(code bool) string {
				if code {
					return `</code>`
				}

				return ``
			},
		}
	} else {
		wrapper = getPreWrapper(lang, w)
	}

	options = append(options, html.WithPreWrapper(wrapper))

	formatter := html.New(options...)

	if err := formatter.Format(w, style, iterator); err != nil {
		return 0, 0, err
	}

	if !cfg.Hl_inline {
		writeDivEnd(w)
	}

	if p, ok := wrapper.(*preWrapper); ok {
		return p.low, p.high, nil
	}

	return 0, 0, nil
}
```

当看到`lexer`字样出现，马上锁定了`chromalexers.Get(lang)`这一句，其调用了`markup\highlight\chromalexers\chromalexers.go`中的`Get`函数：

```go
package chromalexers

import (
	"github.com/alecthomas/chroma/v2"
	"github.com/alecthomas/chroma/v2/lexers"
	"github.com/bep/helpers/maphelpers"
)

var lexerCache = *maphelpers.NewConcurrentMap[string, chroma.Lexer]()

// Get returns a lexer for the given language name, nil if not found.
// This is just a wrapper around chromalexers.Get that caches the result.
// Reasoning for this is that chromalexers.Get is slow in the case where the lexer is not found,
// which is a common case in Hugo.
func Get(name string) chroma.Lexer {
	l, _ := lexerCache.GetOrCreate(name, func() (chroma.Lexer, error) {
		l := lexers.Get(name)
		return l, nil
	})
	return l
}
```

`Get`其实就是获取语言对应的词法解析器(lexer)，还做了缓存处理。使用的`lexers`包通过如下命令找到在本机的路径：

```go
go list -f '{{.Dir}}' github.com/alecthomas/chroma/v2/lexers
```

或者直接在VS Code中右键->Go to Definition也可看到路径。查看`lexers.Get`函数的定义：

```go
// Get a Lexer by name, alias or file extension.
//
// Note that this if there isn't an exact match on name or alias, this will
// call Match(), so it is not efficient.
func Get(name string) chroma.Lexer {
	return GlobalLexerRegistry.Get(name)
}
```

也就是说词法解析器都是从`GlobalLexerRegistry`中拿到的，那么`GlobalLexerRegistry`又是什么？

```go
// GlobalLexerRegistry is the global LexerRegistry of Lexers.
var GlobalLexerRegistry = func() *chroma.LexerRegistry {
	reg := chroma.NewLexerRegistry()
	// index(reg)
	paths, err := fs.Glob(embedded, "embedded/*.xml")
	if err != nil {
		panic(err)
	}
	for _, path := range paths {
		reg.Register(chroma.MustNewXMLLexer(embedded, path))
	}
	return reg
}()

// LexerRegistry is a registry of Lexers.
type LexerRegistry struct {
	Lexers  Lexers
	byName  map[string]Lexer
	byAlias map[string]Lexer
}
```

也就是`GlobalLexerRegistry`中的所有解析器都是从`embedded/*.xml`文件中拿到的。以`matlab.xml`为例：

```xml
<lexer>
  <config>
    <name>Matlab</name>
    <alias>matlab</alias>
    <filename>*.m</filename>
    <mime_type>text/matlab</mime_type>
  </config>
  <rules>
    <state name="blockcomment">
      <rule pattern="^\s*%\}">
        <token type="CommentMultiline"/>
        <pop depth="1"/>
      </rule>
      <rule pattern="^.*\n">
        <token type="CommentMultiline"/>
      </rule>
      <rule pattern=".">
        <token type="CommentMultiline"/>
      </rule>
    </state>
    <state name="deffunc">
      <rule pattern="(\s*)(?:(.+)(\s*)(=)(\s*))?(.+)(\()(.*)(\))(\s*)">
        <bygroups>
          <token type="TextWhitespace"/>
          <token type="Text"/>
          <token type="TextWhitespace"/>
          <token type="Punctuation"/>
          <token type="TextWhitespace"/>
          <token type="NameFunction"/>
          <token type="Punctuation"/>
          <token type="Text"/>
          <token type="Punctuation"/>
          <token type="TextWhitespace"/>
        </bygroups>
        <pop depth="1"/>
      </rule>
      <rule pattern="(\s*)([a-zA-Z_]\w*)">
        <bygroups>
          <token type="Text"/>
          <token type="NameFunction"/>
        </bygroups>
        <pop depth="1"/>
      </rule>
    </state>
    <state name="root">
      <rule pattern="\n">
        <token type="Text"/>
      </rule>
      <rule pattern="^!.*">
        <token type="LiteralStringOther"/>
      </rule>
      <rule pattern="%\{\s*\n">
        <token type="CommentMultiline"/>
        <push state="blockcomment"/>
      </rule>
      <rule pattern="%.*$">
        <token type="Comment"/>
      </rule>
      <rule pattern="^\s*function">
        <token type="Keyword"/>
        <push state="deffunc"/>
      </rule>
      <rule pattern="(properties|persistent|enumerated|otherwise|continue|function|classdef|methods|elseif|events|switch|return|global|parfor|catch|break|while|else|spmd|case|try|end|for|if)\b">
        <token type="Keyword"/>
      </rule>
      <rule pattern="(sin|sind|sinh|asin|asind|asinh|cos|cosd|cosh|acos|acosd|acosh|tan|tand|tanh|atan|atand|atan2|atanh|sec|secd|sech|asec|asecd|asech|csc|cscd|csch|acsc|acscd|acsch|cot|cotd|coth|acot|acotd|acoth|hypot|exp|expm1|log|log1p|log10|log2|pow2|realpow|reallog|realsqrt|sqrt|nthroot|nextpow2|abs|angle|complex|conj|imag|real|unwrap|isreal|cplxpair|fix|floor|ceil|round|mod|rem|sign|airy|besselj|bessely|besselh|besseli|besselk|beta|betainc|betaln|ellipj|ellipke|erf|erfc|erfcx|erfinv|expint|gamma|gammainc|gammaln|psi|legendre|cross|dot|factor|isprime|primes|gcd|lcm|rat|rats|perms|nchoosek|factorial|cart2sph|cart2pol|pol2cart|sph2cart|hsv2rgb|rgb2hsv|zeros|ones|eye|repmat|rand|randn|linspace|logspace|freqspace|meshgrid|accumarray|size|length|ndims|numel|disp|isempty|isequal|isequalwithequalnans|cat|reshape|diag|blkdiag|tril|triu|fliplr|flipud|flipdim|rot90|find|end|sub2ind|ind2sub|bsxfun|ndgrid|permute|ipermute|shiftdim|circshift|squeeze|isscalar|isvector|ans|eps|realmax|realmin|pi|i|inf|nan|isnan|isinf|isfinite|j|why|compan|gallery|hadamard|hankel|hilb|invhilb|magic|pascal|rosser|toeplitz|vander|wilkinson)\b">
        <token type="NameBuiltin"/>
      </rule>
      <rule pattern="\.\.\..*$">
        <token type="Comment"/>
      </rule>
      <rule pattern="-|==|~=|&lt;|&gt;|&lt;=|&gt;=|&amp;&amp;|&amp;|~|\|\|?">
        <token type="Operator"/>
      </rule>
      <rule pattern="\.\*|\*|\+|\.\^|\.\\|\.\/|\/|\\">
        <token type="Operator"/>
      </rule>
      <rule pattern="\[|\]|\(|\)|\{|\}|:|@|\.|,">
        <token type="Punctuation"/>
      </rule>
      <rule pattern="=|:|;">
        <token type="Punctuation"/>
      </rule>
      <rule pattern="(?&lt;=[\w)\].])\&#39;+">
        <token type="Operator"/>
      </rule>
      <rule pattern="(\d+\.\d*|\d*\.\d+)([eEf][+-]?[0-9]+)?">
        <token type="LiteralNumberFloat"/>
      </rule>
      <rule pattern="\d+[eEf][+-]?[0-9]+">
        <token type="LiteralNumberFloat"/>
      </rule>
      <rule pattern="\d+">
        <token type="LiteralNumberInteger"/>
      </rule>
      <rule pattern="(?&lt;![\w)\].])\&#39;">
        <token type="LiteralString"/>
        <push state="string"/>
      </rule>
      <rule pattern="[a-zA-Z_]\w*">
        <token type="Name"/>
      </rule>
      <rule pattern=".">
        <token type="Text"/>
      </rule>
    </state>
    <state name="string">
      <rule pattern="[^\&#39;]*\&#39;">
        <token type="LiteralString"/>
        <pop depth="1"/>
      </rule>
    </state>
  </rules>
</lexer>
```

xml文件中定义了语言的词法规则。如果我们想要让Hugo支持HDevelop语法，那么新增一个能表述出HDevelop语法的xml文件是否就行？

## `hdevelop.xml`文件定义

在`lexers/embedded`中新增`hdevelop.xml`文件：

```xml
<lexer>
  <config>
    <name>HDevelop</name>
    <alias>hdev</alias>
    <alias>hdevelop</alias>
    <alias>halcon</alias>
    <filename>*.hdev</filename>
    <mime_type>text/x-hdevelop</mime_type>
  </config>

  <rules>

    <state name="root">

      <!-- comment -->
      <rule pattern="\*.*$">
        <token type="Comment"/>
      </rule>

      <!-- keywords -->
      <rule pattern="\b(if|else|elseif|endif|for|endfor|while|endwhile|repeat|until|break|continue|return|try|catch|throw|switch|case|default|endswitch)\b">
        <token type="Keyword"/>
      </rule>

      <!-- tuple operators -->
      <rule pattern="\b(tuple_[A-Za-z0-9_]+)\b">
        <token type="NameBuiltin"/>
      </rule>

      <!-- dev operators -->
      <rule pattern="\b(dev_[A-Za-z0-9_]+)\b">
        <token type="NameBuiltin"/>
      </rule>

      <!-- common HALCON operators -->
      <rule pattern="\b(read_image|write_image|read_region|write_region|threshold|binary_threshold|connection|union1|union2|difference|intersection|select_shape|select_shape_std|area_center|count_obj|gen_rectangle1|gen_rectangle2|gen_circle|reduce_domain|crop_domain|edges_sub_pix|edges_image|find_shape_model|find_scaled_shape_model|find_ncc_model|create_shape_model|create_ncc_model|disp_obj|clear_window|open_window|close_window|set_color|set_draw|set_line_width|disp_message|dev_display|dev_clear_window|dev_open_window|dev_close_window|dev_update_window|dev_set_color|dev_set_draw|dev_set_line_width)\b">
        <token type="NameBuiltin"/>
      </rule>

    <rule pattern="\b[a-z][A-Za-z0-9_]*(?=\s*\()">
        <token type="NameBuiltin"/>
    </rule>

      <!-- constants -->
      <rule pattern="\b(true|false)\b">
        <token type="NameBuiltinPseudo"/>
      </rule>

      <rule pattern="\$'[^']*'">
          <token type="LiteralStringInterpol"/>
      </rule>

      <rule pattern="\$&quot;[^&quot;]*&quot;">
          <token type="LiteralStringInterpol"/>
      </rule>

      <!-- strings -->
      <rule pattern="'[^']*'">
        <token type="LiteralString"/>
      </rule>


      <rule pattern="&quot;[^&quot;]*&quot;">
        <token type="LiteralString"/>
      </rule>

      <rule pattern="\|[^\|\r\n]+\|">
          <token type="NameBuiltinPseudo"/>
      </rule>

      <!-- float -->
      <rule pattern="\d+\.\d+([eE][+-]?\d+)?">
        <token type="LiteralNumberFloat"/>
      </rule>

      <!-- integer -->
      <rule pattern="\d+">
        <token type="LiteralNumberInteger"/>
      </rule>

      <!-- operators -->
      <rule pattern=":=|==|!=|&lt;=|&gt;=|&lt;|&gt;|\+|-|\*|/|=">
        <token type="Operator"/>
      </rule>



      <!-- punctuation -->
      <rule pattern="\(|\)|\[|\]|\{|\}|,|;|:">
        <token type="Punctuation"/>
      </rule>

      <rule pattern="\[">
          <token type="Punctuation"/>
          <push state="slice"/>
      </rule>

      <!-- variables -->
      <rule pattern="[A-Za-z_][A-Za-z0-9_]*">
        <token type="Name"/>
      </rule>

      <!-- whitespace -->
      <rule pattern="\s+">
        <token type="Text"/>
      </rule>

    </state>

    <state name="slice">

        <rule pattern="-?\d+">
            <token type="LiteralNumberInteger"/>
        </rule>

        <rule pattern=":">
            <token type="Punctuation"/>
        </rule>

        <rule pattern="\]">
            <token type="Punctuation"/>
            <pop depth="1"/>
        </rule>

    </state>
  </rules>

</lexer>
```

`hugo server -D`启动Hugo后，发现此时基本已经支持了HDevelop语法。但还有两个问题：

1. 代码块必须要写明`hdev {name="HDevelop"}`否则渲染出的代码块显示的是`Code`字样而不是`HDevelop`
2. 解析注释还不够完善，注释前加空白符无法辨别出来。

## 推荐

[表达式全集](https://tool.oschina.net/uploads/apidocs/jquery/regexp.html)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:9613/%E5%9C%A8hugo%E4%B8%AD%E6%94%AF%E6%8C%81hdevelop%E8%AF%AD%E6%B3%95/  

