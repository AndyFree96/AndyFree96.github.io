# 用Rust从零写一个文本处理CLI

学习一门语言，不一定要从读完一本教材开始。一个范围清楚、可以逐步扩展的小项目，也能把语法、标准库和工程习惯串起来。作为一名Rust新手，本文记录了借助AI从一个简单的文本处理需求出发，用 Rust 写一个命令行工具 `textkit`。我们先统计文本，再增加搜索、过滤和替换；随着功能变多，再把代码拆成模块、统一错误处理，并用 `clap` 管理命令行参数。每一步都围绕一个可运行的结果展开，完整代码在[Github](https://github.com/AndyFree96/textkit)上可看到。
<!--more-->

## 先确定要做什么

`textkit` 读取 UTF-8 文本文件，提供四项功能：

```text
textkit stats <file>
textkit search <file> <keyword>
textkit filter <file> <keyword> [--mode <contains|exclude|starts-with>]
textkit replace <file> <pattern> <replacement>
```

本文采用“先实现需求，遇到问题再研究语法和源码”的学习方式。这样学到的 `String`、借用、迭代器和错误处理，都能立刻在一个具体问题里找到位置。

开始前请安装 Rust 工具链。用 Cargo 创建项目：

```powershell
cargo new textkit
cd textkit
```

## 从文件统计开始

先统计行数、单词数、字符数和字节数。文件读取可能失败，因此要显式处理 `Result`：

```rust
use std::{env, fs, process};

fn main() {
    let Some(path) = env::args().nth(1) else {
        eprintln!("Usage: textkit <file>");
        process::exit(1);
    };

    let content = fs::read_to_string(&path).unwrap_or_else(|error| {
        eprintln!("Failed to read {path}: {error}");
        process::exit(1);
    });

    println!("File: {path}");
    println!("Lines: {}", content.lines().count());
    println!("Words: {}", content.split_whitespace().count());
    println!("Characters: {}", content.chars().count());
    println!("Bytes: {}", content.len());
}
```

运行程序时，`--` 后面的参数会传给程序本身：

```powershell
cargo run -- .\Cargo.toml
```

这里有几个值得留意的细节：

- `String` 拥有字符串数据；`&str` 是对字符串内容的借用。
- `content.lines()`、`split_whitespace()` 和 `chars()` 都返回迭代器，可以直接继续调用 `count()`。
- `chars().count()` 统计 Unicode 标量值，不是用户感知的字素簇；`len()` 统计 UTF-8 字节数。中文字符通常占多个字节。
- `lines()` 不会把末尾换行符额外算作一行。统计口径应当明确，后续测试也应按这个约定编写。

例如，文件内容是 `Rust is fast.\n你好` 时，统计结果是：

```text
Lines: 2
Words: 4
Characters: 16
Bytes: 20
```

`split_whitespace()` 按空白分隔单词，因此 `Rust`、`is`、`fast.` 和 `你好` 共四个词。`Rust is fast.` 有 13 个 Unicode 标量值，`你好` 有 2 个，合计 15？还要注意中间的换行符也属于内容，所以总字符数是 16；UTF-8 字节数则是 13 个 ASCII 字节、1 个换行字节和 6 个中文字符字节，共 20。

测试输入和输出前，最好自己先按所选口径算一遍。这样测试不只是“代码给出一个数字”，也能确认我们对字符、换行和单词的定义是一致的。

可以再检查两类错误：

```powershell
# 缺少文件参数
cargo run

# 文件不存在
cargo run -- .\missing.txt
```

前者应该显示用法，后者应该显示读取错误，并以非零状态结束。`process::exit(1)` 中的 `1` 是给 shell 和其他调用程序看的失败状态；成功运行通常以 `0` 结束。

### `String`、借用与错误值

读取整个文件后，`content` 是拥有数据的 `String`。当函数只需要查看文本时，通常接收 `&str`，而不是拿走或复制整个字符串：

```rust
let name: String = String::from("textkit");
let borrowed: &str = &name;
println!("{borrowed}");
println!("{name}");
```

`borrowed` 只是借用 `name` 的内容，因此打印借用值之后仍可继续使用 `name`。这是后面搜索和过滤函数使用 `&str` 的基础。

`fs::read_to_string` 返回 `Result<String, std::io::Error>`，因为磁盘读取不是必然成功的操作。`Ok(content)` 表示读取成功，`Err(error)` 带有失败原因。上面的 `unwrap_or_else` 在成功时取出内容，在失败时打印错误并退出。小程序可以这样处理；随着函数增多，我们会把错误向上传递，避免每处都直接结束进程。

此时的程序把参数解析、文件读取和统计逻辑都放在 `main` 中。功能少时这样足够直接；加入新命令后，我们再把职责拆开。

## 把搜索逻辑变成可复用函数

搜索指定关键字，返回匹配行的行号和内容。新建 `src/lib.rs`，把算法放进库函数：

```rust
pub fn search_lines<'a>(content: &'a str, keyword: &str) -> Vec<(usize, &'a str)> {
    if keyword.is_empty() {
        return Vec::new();
    }

    content
        .lines()
        .enumerate()
        .filter(|(_, line)| line.contains(keyword))
        .map(|(index, line)| (index + 1, line))
        .collect()
}
```

`enumerate()` 给每一行附上从零开始的索引，输出给用户时再加一，转换为常见的行号。`filter` 保留匹配行，`map` 整理结果，`collect` 收集到 `Vec`。

返回类型中的生命周期 `'a` 表明，结果里的行切片借用自 `content`，不会复制每一行；因此结果也不能比原始文本活得更久。空关键字在这里约定为“不匹配任何行”，避免空字符串匹配每一行这一容易意外的行为。搜索区分大小写。

生命周期标注看起来特殊，但这里表达的关系很直接：函数返回的行切片来自 `content`，而不是来自 `keyword`。因此，调用方必须保证原文还存在，才能继续使用搜索结果。生命周期参数不是运行时计时器，也不会改变字符串内容；它只是让编译器检查引用是否可能悬空。

为什么返回 `Vec<(usize, &str)>`，而不是 `Vec<String>`？搜索只读取原文，并不修改匹配行。返回切片可以避免为每个结果重新分配字符串。`Vec` 本身需要存储结果项，但每个 `&str` 只是指向原文中的一段内容。

#### 将搜索接入命令行

先添加一个 `search` 分支。此阶段仍然用标准库手动解析参数，目标是看清命令行参数如何到达业务函数：

```rust
use std::{env, fs, process};
use textkit::search_lines;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.get(1).map(String::as_str) == Some("search") {
        if args.len() != 4 {
            eprintln!("Usage: textkit search <file> <keyword>");
            process::exit(1);
        }

        let content = read_file(&args[2]);
        let results = search_lines(&content, &args[3]);
        for (line_number, line) in &results {
            println!("{line_number}: {line}");
        }
        println!("Found {} matching lines.", results.len());
    } else if args.len() == 2 {
        run_stats(&args[1]);
    } else {
        eprintln!("Usage: textkit <file> | search <file> <keyword>");
        process::exit(1);
    }
}

fn read_file(path: &str) -> String {
    fs::read_to_string(path).unwrap_or_else(|error| {
        eprintln!("Failed to read {path}: {error}");
        process::exit(1);
    })
}

fn run_stats(path: &str) {
    let content = read_file(path);
    println!("File: {path}");
    println!("Lines: {}", content.lines().count());
    println!("Words: {}", content.split_whitespace().count());
    println!("Characters: {}", content.chars().count());
    println!("Bytes: {}", content.len());
}
```

假设 `sample.txt` 内容如下：

```text
Rust is fast.
Python is readable.
I am learning Rust.
Go is also interesting.
```

运行：

```powershell
cargo run -- search .\sample.txt Rust
```

输出：

```text
1: Rust is fast.
3: I am learning Rust.
Found 2 matching lines.
```

`env::args()` 返回整个参数列表，其中第 0 项通常是程序路径，`args[1]` 才是用户输入的第一个参数。`cargo run --` 的 `--` 是 Cargo 的分隔符，不会传给 `textkit`；后面的 `search` 才是 `textkit` 的第一个参数。

`use textkit::search_lines;` 能工作，是因为同一 Cargo package 中的 `src/lib.rs` 会被构建为库，二进制目标可以直接依赖它。随着命令增加，这种“参数检查、文件读取、打印、算法都写在一个文件”的方式会显得拥挤；现在先把搜索逻辑单独测试，再继续扩展。

先为函数写单元测试，验证命中、未命中和空关键字：

```rust
#[cfg(test)]
mod tests {
    use super::search_lines;

    #[test]
    fn finds_matching_lines() {
        let results = search_lines("Rust is fast.\nGo is fun.\nI like Rust.", "Rust");
        assert_eq!(results, vec![(1, "Rust is fast."), (3, "I like Rust.")]);
    }

    #[test]
    fn empty_keyword_matches_nothing() {
        assert!(search_lines("Hello\nWorld", "").is_empty());
    }
}
```

如果项目中还没有 `lib.rs`，Cargo 会在创建它之后自动识别库目标。测试代码通常放在实现文件底部的 `#[cfg(test)]` 模块中。`#[cfg(test)]` 表示这部分只在运行测试时编译；`#[test]` 标记一个测试函数。

还可以补上“没有任何匹配项”的测试：

```rust
#[test]
fn returns_empty_when_no_match() {
    let results = search_lines("Hello\nWorld", "Rust");
    assert!(results.is_empty());
}
```

运行 `cargo test`。单元测试直接验证函数行为，反馈快，也能把边界约定固定下来。必要时可以用 `cargo test finds_matching_lines` 只运行某一个测试。

再手动检查几种命令行边界：

```powershell
# 没有匹配行
cargo run -- search .\sample.txt Java

# 文件不存在
cargo run -- search .\missing.txt Rust

# 参数不完整
cargo run -- search .\sample.txt
```

没有匹配项是一次成功的搜索，只是结果为空；文件不存在和参数不完整则是错误。把“空结果”和“执行失败”区分开，命令行使用起来会更可预期。

## 在搜索之上增加行过滤

过滤和搜索共享遍历文本行的方式，区别在于匹配规则。用枚举表达模式，比在业务代码中散落字符串判断更清楚：

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FilterMode {
    Contains,
    Exclude,
    StartsWith,
}

pub fn filter_lines<'a>(
    content: &'a str,
    keyword: &str,
    mode: FilterMode,
) -> Vec<(usize, &'a str)> {
    if keyword.is_empty() {
        return Vec::new();
    }

    content
        .lines()
        .enumerate()
        .filter(|(_, line)| match mode {
            FilterMode::Contains => line.contains(keyword),
            FilterMode::Exclude => !line.contains(keyword),
            FilterMode::StartsWith => line.starts_with(keyword),
        })
        .map(|(index, line)| (index + 1, line))
        .collect()
}
```

现在可以保留包含关键字的行、排除包含关键字的行，或只保留以关键字开头的行。每一种模式都应有测试，尤其要覆盖空关键字和无匹配结果。这里仍沿用空关键字不返回结果的约定。

例如，输入仍是 `sample.txt`：

```powershell
# 默认保留包含 Rust 的行
cargo run -- filter .\sample.txt Rust

# 排除包含 Rust 的行
cargo run -- filter .\sample.txt Rust --exclude

# 只保留以 Rust 开头的行
cargo run -- filter .\sample.txt Rust --starts-with
```

对前面那份示例文件，排除模式只留下不含 `Rust` 的行：

```text
2: Python is readable.
4: Go is also interesting.
Filtered 2 lines.
```

`StartsWith` 检查的是行首，不会自动忽略前导空格；`Contains` 和 `Exclude` 也都是区分大小写的。这些规则看似细小，却会直接影响用户对结果的理解，所以最好在帮助信息或文档里明确，并用测试固定下来。

在使用 `clap` 之前，选项可以先按位置参数处理。对应的 `main` 分支需要检查参数数量，并把 `--exclude`、`--starts-with` 映射为枚举：

```rust
let mode = match args.get(4).map(String::as_str) {
    None => FilterMode::Contains,
    Some("--exclude") => FilterMode::Exclude,
    Some("--starts-with") => FilterMode::StartsWith,
    Some(_) => return usage_error(),
};
```

这段逻辑假设已经有统一的用法错误出口，例如：

```rust
fn usage_error() -> ! {
    eprintln!("Usage: textkit filter <file> <keyword> [--exclude|--starts-with]");
    std::process::exit(1);
}
```

返回类型 `!`（never type）表示这个函数不会把控制权正常交还给调用方：它总会退出进程。因此可以在需要返回 `()` 的分支里调用它。等使用 `clap` 后，参数数量和未知选项的错误就交由解析器处理，不再需要这段手动检查代码。

这里的 `FilterMode` 是业务类型。调用方传入枚举后，`filter_lines` 不必知道 CLI 上具体写的是哪个字符串。

可将测试放在 `filter.rs`：

```rust
#[cfg(test)]
mod tests {
    use super::{filter_lines, FilterMode};

    const CONTENT: &str =
        "Rust is fast.\nPython is readable.\nRust is safe.\nGo is interesting.";

    #[test]
    fn keeps_lines_containing_keyword() {
        assert_eq!(
            filter_lines(CONTENT, "Rust", FilterMode::Contains),
            vec![(1, "Rust is fast."), (3, "Rust is safe.")]
        );
    }

    #[test]
    fn excludes_lines_containing_keyword() {
        assert_eq!(
            filter_lines(CONTENT, "Rust", FilterMode::Exclude),
            vec![(2, "Python is readable."), (4, "Go is interesting.")]
        );
    }

    #[test]
    fn keeps_lines_starting_with_keyword() {
        assert_eq!(
            filter_lines(CONTENT, "Rust", FilterMode::StartsWith),
            vec![(1, "Rust is fast."), (3, "Rust is safe.")]
        );
    }

    #[test]
    fn empty_keyword_returns_no_lines() {
        assert!(filter_lines(CONTENT, "", FilterMode::Contains).is_empty());
    }
}
```

### 看懂 `filter`、`map` 和闭包

过滤逻辑的核心是这段迭代器链：

```rust
content
    .lines()
    .enumerate()
    .filter(|(_, line)| match mode {
        FilterMode::Contains => line.contains(keyword),
        FilterMode::Exclude => !line.contains(keyword),
        FilterMode::StartsWith => line.starts_with(keyword),
    })
    .map(|(index, line)| (index + 1, line))
    .collect()
```

可以把它拆成几个步骤理解：

1. `lines()` 依次产生每一行的 `&str`。
2. `enumerate()` 把每行变成 `(索引, 行内容)`，索引从 0 开始。
3. `filter(...)` 接收一个闭包，对每项返回 `true` 或 `false`，决定保留还是丢弃。
4. `map(...)` 把保留项转换成最终形式，将索引加一作为行号。
5. `collect()` 消费迭代器并收集结果。此处函数返回类型告诉编译器要收集成 `Vec`。

闭包 `|(_, line)| ...` 是匿名函数参数。`_` 表示该位置的索引暂时不用；后面的 `line` 是当前行。迭代器适合这种“逐项变换”的流程，若刚开始不习惯，也可以先写 `for` 循环，再逐步替换为迭代器写法。

### 将过滤命令接到程序

在手动解析参数的阶段，过滤命令通常是 `textkit filter <file> <keyword> [option]`。解析完成后，读取文件、调用 `filter_lines`，再逐行打印结果。注意读取文件前应先检查参数数量和模式，避免访问不存在的 `args[index]`：

```rust
if args.get(1).map(String::as_str) == Some("filter") {
    if args.len() != 4 && args.len() != 5 {
        return usage_error();
    }

    let mode = match args.get(4).map(String::as_str) {
        None => FilterMode::Contains,
        Some("--exclude") => FilterMode::Exclude,
        Some("--starts-with") => FilterMode::StartsWith,
        Some(_) => return usage_error(),
    };

    let content = read_file(&args[2]);
    let results = filter_lines(&content, &args[3], mode);
    for (line_number, line) in &results {
        println!("{line_number}: {line}");
    }
    println!("Filtered {} lines.", results.len());
}
```

先只实现最常用的包含模式，再添加排除和前缀模式，有助于把问题分成小块。最后运行 `cargo test`，并手动回归搜索命令，确认增加分支没有破坏已有行为。

## 实现文本替换

替换需要产生新字符串，因此返回值不再借用输入，而是拥有替换后的内容。同时返回替换次数，方便命令行给出结果摘要：

```rust
pub fn replace_text(content: &str, pattern: &str, replacement: &str) -> (String, usize) {
    if pattern.is_empty() {
        return (content.to_owned(), 0);
    }

    let count = content.match_indices(pattern).count();
    let result = content.replace(pattern, replacement);
    (result, count)
}
```

空模式在这里约定为不执行替换。`match_indices` 与 `replace` 都按不重叠匹配处理：例如在 `"aaaa"` 中查找 `"aa"`，匹配两次，替换结果也对应两处。测试时别只检查结果字符串，也要检查次数、未命中、空模式和 Unicode 文本。

替换函数返回 `(String, usize)`：第一个值是新的文本，第二个值是发生替换的次数。`content` 仍然是借用传入的；生成的 `result` 则拥有新的字符串。因此调用后原文仍然可用：

```rust
let original = String::from("Rust is fast.");
let (result, count) = replace_text(&original, "Rust", "Go");

println!("{original}"); // Rust is fast.
println!("{result}");   // Go is fast.
println!("{count}");    // 1
```

`replace` 会将所有匹配项替换，而不是只替换第一次。查找模式按字面文本处理，并非正则表达式。区分清楚“字面替换”和“正则替换”，可以避免用户误以为 `.`、`*` 等字符有特殊含义。

建议为替换逻辑至少写以下测试：

```rust
#[cfg(test)]
mod tests {
    use super::replace_text;

    #[test]
    fn replaces_every_match_and_counts_them() {
        assert_eq!(
            replace_text("Rust is fast. Rust is fun.", "Rust", "Go"),
            ("Go is fast. Go is fun.".to_owned(), 2)
        );
    }

    #[test]
    fn returns_original_when_pattern_is_absent() {
        assert_eq!(
            replace_text("Hello World", "Rust", "Go"),
            ("Hello World".to_owned(), 0)
        );
    }

    #[test]
    fn empty_pattern_does_not_change_text() {
        assert_eq!(replace_text("Hello", "", "Rust"), ("Hello".to_owned(), 0));
    }

    #[test]
    fn supports_unicode_text() {
        assert_eq!(
            replace_text("你好，Rust！Rust 很棒。", "Rust", "Go"),
            ("你好，Go！Go 很棒。".to_owned(), 2)
        );
    }
}
```

`match_indices()` 会迭代不重叠的匹配位置和切片，`count()` 得到匹配次数；`replace()` 用同样的不重叠规则构造结果。比如 `"aaaa"` 中的 `"aa"` 会匹配两次而不是三次，计数与替换结果保持一致。

命令行接入时，参数顺序为 `replace <file> <pattern> <replacement>`。读取文件后调用函数，将新文本写到标准输出，并报告替换次数：

```rust
let content = read_file(file_path);
let (result, count) = replace_text(&content, pattern, replacement);
print!("{result}");
println!("\nReplacements: {count}");
```

此例只把结果打印出来，并不会覆盖输入文件。若要原地修改文件，应另行设计备份、临时文件和写入失败时的处理策略，避免把演示性命令误认为安全的文件编辑器。

以包含两次 `Rust` 的文件为例，命令会输出替换后的完整文本，随后给出次数：

```text
Go is fast. Go is safe.
Replacements: 2
```

如果 `pattern` 没有出现，原文本保持不变，次数为 0。这仍然是一次成功的命令，因为搜索和替换都已正确执行，只是没有找到目标。

可以这样手动验收：

```powershell
# 没有匹配项
cargo run -- replace .\sample.txt Java Go

# 替换成中文文本
cargo run -- replace .\sample.txt Rust Rust语言

# 参数不完整，应显示用法或 CLI 错误
cargo run -- replace .\sample.txt Rust
```

到这里，统计、搜索、过滤和替换已经各自有了独立算法。接下来要解决的是代码组织和命令行接口。

## 按职责组织项目

把实现拆分到不同模块后，项目结构可以是：

```text
textkit/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── cli.rs
│   ├── error.rs
│   ├── stats.rs
│   ├── search.rs
│   ├── filter.rs
│   └── replace.rs
└── tests/
    └── cli.rs
```

`stats.rs`、`search.rs`、`filter.rs` 和 `replace.rs` 各自实现一个功能；`lib.rs` 声明模块并导出公共 API；`cli.rs` 定义命令行输入；`main.rs` 负责把输入交给业务逻辑；集成测试从程序外部验证命令和输出。

这不是 Rust 强制要求的目录结构，而是按职责拆分的一种选择。初期只有几行统计代码时，放在 `main.rs` 更容易上手；当一个文件需要同时处理多个命令、错误和打印时，再拆分能让每个模块更容易阅读和单独测试。模块也不必一开始就拆得很细，按功能边界逐渐整理即可。

可以把当前的 `src/lib.rs` 整理为一个模块入口：

```rust
pub mod error;
pub mod filter;
pub mod replace;
pub mod search;
pub mod stats;

pub use error::TextkitError;
pub use filter::{filter_lines, FilterMode};
pub use replace::replace_text;
pub use search::search_lines;
pub use stats::{count_text, FileStats};
```

`pub mod stats;` 让模块可从库外访问；`pub fn count_text` 让函数可从模块外访问。`pub use` 将常用类型和函数从 crate 根部重新导出，调用方可以写 `use textkit::count_text;`，而不必写 `use textkit::stats::count_text;`。导出哪些 API 是库的设计选择，不需要把所有内部细节都公开。

#### 把统计结果表示为结构体

原型里直接打印四个值很方便；现在统计逻辑由库提供，应该让它返回可复用的数据。新建 `src/stats.rs`：

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct FileStats {
    pub lines: usize,
    pub words: usize,
    pub characters: usize,
    pub bytes: usize,
}

pub fn count_text(content: &str) -> FileStats {
    FileStats {
        lines: content.lines().count(),
        words: content.split_whitespace().count(),
        characters: content.chars().count(),
        bytes: content.len(),
    }
}
```

`FileStats` 把相关结果放在一起，调用方能通过 `stats.words` 等字段访问。`usize` 适合表示集合长度和计数。`derive` 自动为这个结构体实现常见 trait：`Debug` 方便调试，`Clone`/`Copy` 使这个只包含计数的值易于复制，`PartialEq`/`Eq` 让测试可以比较整个结构体。

之后入口层只负责格式化输出：

```rust
let stats = count_text(&content);
println!("Lines: {}", stats.lines);
println!("Words: {}", stats.words);
println!("Characters: {}", stats.characters);
println!("Bytes: {}", stats.bytes);
```

这样统计逻辑和显示格式各自独立。以后 GUI 或其他程序也可以调用 `count_text`，而不必解析命令行输出。

为统计函数添加测试：

```rust
#[cfg(test)]
mod tests {
    use super::{count_text, FileStats};

    #[test]
    fn counts_ascii_and_unicode_text() {
        assert_eq!(
            count_text("Rust is fast.\n你好"),
            FileStats { lines: 2, words: 4, characters: 16, bytes: 20 }
        );
    }

    #[test]
    fn empty_text_has_zero_counts() {
        assert_eq!(
            count_text(""),
            FileStats { lines: 0, words: 0, characters: 0, bytes: 0 }
        );
    }
}
```

当一个函数返回的值变多时，使用具名字段通常比返回 `(usize, usize, usize, usize)` 更容易理解。调用方不需要记住元组第 3 项代表什么。

文件读取和参数校验会失败。业务函数不应在错误发生时直接结束整个进程；让它们返回 `Result`，在程序入口统一报告错误，会更容易测试和扩展。可以定义项目错误类型，并通过 `From` 让 `?` 自动转换 I/O 错误：

```rust
use std::{error::Error, fmt, io};

#[derive(Debug)]
pub enum TextkitError {
    Io(io::Error),
    InvalidArguments(String),
}

impl fmt::Display for TextkitError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(error) => write!(f, "I/O error: {error}"),
            Self::InvalidArguments(message) => write!(f, "Invalid arguments: {message}"),
        }
    }
}

impl Error for TextkitError {}

impl From<io::Error> for TextkitError {
    fn from(error: io::Error) -> Self {
        Self::Io(error)
    }
}
```

例如，返回 `Result<String, TextkitError>` 的读取函数可以写成：

```rust
fn read_file(path: &std::path::Path) -> Result<String, TextkitError> {
    Ok(std::fs::read_to_string(path)?)
}
```

读取失败时，`?` 会提前返回，并通过 `From<io::Error>` 转换错误类型。最终由 `main` 统一打印错误和设置非零退出码。

这里的错误类型有两种情况：`Io` 表示文件读取等系统操作失败；`InvalidArguments` 表示调用方式不符合程序约定。实现 `Display` 后，可以用 `{error}` 生成用户可读文本；实现 `Error` 后，`TextkitError` 也可以作为标准错误类型使用。`From<io::Error>` 是 `?` 完成自动转换的关键。

在入口统一处理错误，可以采用下面的模式：

```rust
fn main() {
    if let Err(error) = run() {
        eprintln!("Error: {error}");
        std::process::exit(1);
    }
}

fn run() -> Result<(), TextkitError> {
    // 解析命令、读取文件、调用业务函数
    Ok(())
}
```

`run()` 用 `Result<(), TextkitError>` 表示可能失败但没有返回业务数据。函数内部用 `?` 逐层返回错误，最外层 `main` 决定如何展示错误以及何时退出。这样核心函数不需要知道进程退出策略，也更容易从测试中调用。

## 用 `clap` 定义命令行接口

手动读取 `env::args()` 有助于理解参数，但子命令和选项变多后，校验、帮助信息和错误提示都需要自己维护。引入 `clap` 的 derive 功能：

```powershell
cargo add clap --features derive
```

在 `cli.rs` 中用结构体和枚举描述命令：

```rust
use clap::{Args, Parser, Subcommand, ValueEnum};
use std::path::PathBuf;

#[derive(Debug, Parser)]
#[command(name = "textkit", version, about = "A lightweight text processing toolkit")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Debug, Subcommand)]
pub enum Commands {
    /// Count lines, words, characters, and bytes.
    Stats(FileArgs),
    /// Search for lines containing a keyword.
    Search(SearchArgs),
    /// Filter lines by a keyword.
    Filter(FilterArgs),
    /// Replace all occurrences of a pattern.
    Replace(ReplaceArgs),
}

#[derive(Debug, Args)]
pub struct FileArgs {
    pub file: PathBuf,
}

#[derive(Debug, Args)]
pub struct SearchArgs {
    pub file: PathBuf,
    pub keyword: String,
}

#[derive(Debug, Args)]
pub struct FilterArgs {
    pub file: PathBuf,
    pub keyword: String,
    #[arg(long, value_enum, default_value_t = CliFilterMode::Contains)]
    pub mode: CliFilterMode,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, ValueEnum)]
pub enum CliFilterMode {
    Contains,
    Exclude,
    StartsWith,
}

#[derive(Debug, Args)]
pub struct ReplaceArgs {
    pub file: PathBuf,
    pub pattern: String,
    pub replacement: String,
}
```

`Parser` 负责解析入口参数，`Subcommand` 定义子命令，`Args` 组织参数，`ValueEnum` 将枚举映射为命令行可用值。`StartsWith` 默认对应 `starts-with`。过滤模式的参数与业务层的 `FilterMode` 分开定义，避免算法模块依赖 `clap`。

`FileArgs` 是一个可复用的参数组：统计命令只需要文件路径，其他命令则各有自己的参数结构。`PathBuf` 拥有一个路径值，适合保存在解析结果中；调用文件 API 时再借用成 `&Path`。路径不是普通文本，使用路径类型可以让标准库按当前操作系统的路径规则处理它。

### 用 derive 宏生成帮助和参数校验

`#[derive(Parser)]` 会根据结构体字段生成解析器。比如 `SearchArgs` 有两个必填字段，因此调用时必须提供文件和关键字；少传参数、给枚举传入未知值时，`clap` 会返回错误并显示用法。`--help` 和 `--version` 也会自动生成：

```powershell
cargo run -- --help
cargo run -- filter --help
cargo run -- filter .\sample.txt Rust --mode unknown
```

过滤参数的声明：

```rust
#[arg(long, value_enum, default_value_t = CliFilterMode::Contains)]
pub mode: CliFilterMode,
```

表示这是一个长选项 `--mode`，其值从 `CliFilterMode` 中选择；没有提供时使用 `Contains`。枚举变体的 CLI 拼法默认为 kebab-case，所以 `StartsWith` 对应 `starts-with`。完整用法如下：

```text
textkit filter <FILE> <KEYWORD> --mode <contains|exclude|starts-with>
```

因为 `--mode` 有默认值，过滤时也可以省略它：

```powershell
cargo run -- filter .\sample.txt Rust
cargo run -- filter .\sample.txt Rust --mode exclude
cargo run -- filter .\sample.txt Rust --mode starts-with
```

于是过滤命令可以这样调用：

```powershell
cargo run -- filter .\sample.txt Rust
cargo run -- filter .\sample.txt Rust --mode exclude
cargo run -- filter .\sample.txt Rust --mode starts-with
```

在 `src/lib.rs` 注册 `pub mod cli;` 后，`main.rs` 可以通过 `Cli::parse()` 获取 `Commands`，再将每个变体交给相应函数。下面给出一个完整的调度示例，展示参数解析、路径读取、业务函数调用和错误出口如何连接：

```rust
use std::{fs, path::Path, process};

use clap::Parser;
use textkit::cli::{Cli, CliFilterMode, Commands};
use textkit::{
    count_text, filter_lines, replace_text, search_lines, FilterMode, TextkitError,
};

fn main() {
    if let Err(error) = run(Cli::parse()) {
        eprintln!("Error: {error}");
        process::exit(1);
    }
}

fn run(cli: Cli) -> Result<(), TextkitError> {
    match cli.command {
        Commands::Stats(args) => {
            let content = read_file(&args.file)?;
            let stats = count_text(&content);
            println!("File: {}", args.file.display());
            println!("Lines: {}", stats.lines);
            println!("Words: {}", stats.words);
            println!("Characters: {}", stats.characters);
            println!("Bytes: {}", stats.bytes);
        }
        Commands::Search(args) => {
            let content = read_file(&args.file)?;
            let results = search_lines(&content, &args.keyword);
            for (line_number, line) in &results {
                println!("{line_number}: {line}");
            }
            println!("Found {} matching lines.", results.len());
        }
        Commands::Filter(args) => {
            let mode = match args.mode {
                CliFilterMode::Contains => FilterMode::Contains,
                CliFilterMode::Exclude => FilterMode::Exclude,
                CliFilterMode::StartsWith => FilterMode::StartsWith,
            };
            let content = read_file(&args.file)?;
            let results = filter_lines(&content, &args.keyword, mode);
            for (line_number, line) in &results {
                println!("{line_number}: {line}");
            }
            println!("Filtered {} lines.", results.len());
        }
        Commands::Replace(args) => {
            let content = read_file(&args.file)?;
            let (result, count) =
                replace_text(&content, &args.pattern, &args.replacement);
            print!("{result}");
            println!("\nReplacements: {count}");
        }
    }

    Ok(())
}

fn read_file(path: &Path) -> Result<String, TextkitError> {
    Ok(fs::read_to_string(path)?)
}
```

这里的 `match` 覆盖了 `Commands` 枚举的所有变体。若以后添加新命令而忘了在这里处理，编译器会提示匹配不完整。`?` 则让文件读取错误直接返回到 `main` 的统一错误处理处。

阅读 `run` 时可以沿着一次调用跟下来：`Cli::parse()` 把参数转为 `Commands::Search(args)`；`match` 进入搜索分支；`read_file` 返回文本或错误；`search_lines` 返回匹配项；循环负责打印。算法函数没有直接读文件或打印，这使它可以单独测试，也能在别的界面复用。

过滤 CLI 的 `CliFilterMode` 到业务层 `FilterMode` 的转换看起来有些重复，但它划清了依赖边界：`filter.rs` 不需要引用 `clap`。以后即使 CLI 参数库变了，过滤算法也不必跟着修改。

在本教程前面的阶段，CLI 使用的是 `textkit <file>`，而 `clap` 阶段采用明确的 `textkit stats <file>` 子命令。这个调整让四项功能拥有一致的入口，也让 `--help` 更容易列出所有操作。完成迁移后，统计命令用法变为：

```powershell
cargo run -- stats .\sample.txt
```

参数定义、命令分发和文本算法各司其职；文件路径也使用 `PathBuf`/`Path`，而不是把路径当作普通文本拼接处理。

## 用两层测试验证程序

单元测试验证算法本身；集成测试则启动真正的可执行程序，检查参数、输出和退出状态。Cargo 会在集成测试构建时提供二进制路径：

```rust
use std::process::Command;

#[test]
fn help_lists_all_commands() {
    let output = Command::new(env!("CARGO_BIN_EXE_textkit"))
        .arg("--help")
        .output()
        .expect("failed to run textkit");

    assert!(output.status.success());
    let stdout = String::from_utf8(output.stdout).unwrap();
    for name in ["stats", "search", "filter", "replace"] {
        assert!(stdout.contains(name));
    }
}
```

这个测试不只是在函数内验证帮助文本，而是像用户一样启动 `textkit --help`。因此它能同时覆盖 `clap` 参数定义、程序入口和最终输出。类似地，搜索算法的单元测试通过了，并不代表文件路径一定传对、命令分支一定选对，所以两种测试解决的问题不同。

还应覆盖正常搜索、统计 Unicode 文本、替换次数、缺失文件和非法过滤模式。测试文件放在系统临时目录，或使用 `tempfile` 等测试依赖创建；避免测试依赖某个本地固定路径。断言应检查用户能观察到的行为，例如标准输出、标准错误和退出码。

### 隔离 CLI 测试文件

若每个测试都手动拼接临时文件名，需要处理唯一性和清理。可以使用 `tempfile` 管理生命周期，并用 `assert_cmd`、`predicates` 更简洁地启动程序和检查结果：

```powershell
cargo add --dev assert_cmd predicates tempfile
```

在 `tests/cli.rs` 中可以定义两个辅助函数：

```rust
use assert_cmd::Command;
use std::fs;
use tempfile::NamedTempFile;

fn create_test_file(content: &str) -> NamedTempFile {
    let file = NamedTempFile::new().expect("failed to create temporary file");
    fs::write(file.path(), content).expect("failed to write temporary file");
    file
}

fn textkit() -> Command {
    Command::cargo_bin("textkit").expect("textkit binary should be built for integration tests")
}
```

`NamedTempFile` 在离开作用域后会清理临时文件。`Command::cargo_bin("textkit")` 会找到 Cargo 为集成测试构建的程序。下面用这些辅助函数覆盖主要命令：

```rust
#[test]
fn help_lists_all_subcommands() {
    textkit()
        .arg("--help")
        .assert()
        .success()
        .stdout(predicates::str::contains("stats"))
        .stdout(predicates::str::contains("search"))
        .stdout(predicates::str::contains("filter"))
        .stdout(predicates::str::contains("replace"));
}

#[test]
fn stats_counts_unicode_characters_and_bytes() {
    let file = create_test_file("Rust is fast.\n你好");

    textkit()
        .args(["stats", file.path().to_str().unwrap()])
        .assert()
        .success()
        .stdout(predicates::str::contains("Lines: 2"))
        .stdout(predicates::str::contains("Words: 4"))
        .stdout(predicates::str::contains("Characters: 16"))
        .stdout(predicates::str::contains("Bytes: 20"));
}

#[test]
fn search_prints_matching_lines_and_count() {
    let file = create_test_file("Rust is fast.\nPython is readable.\nI like Rust.\n");

    textkit()
        .args(["search", file.path().to_str().unwrap(), "Rust"])
        .assert()
        .success()
        .stdout(predicates::str::contains("1: Rust is fast."))
        .stdout(predicates::str::contains("3: I like Rust."))
        .stdout(predicates::str::contains("Found 2 matching lines."));
}

#[test]
fn replace_prints_result_and_number_of_replacements() {
    let file = create_test_file("Rust is fast. Rust is safe.");

    textkit()
        .args(["replace", file.path().to_str().unwrap(), "Rust", "Go"])
        .assert()
        .success()
        .stdout(predicates::str::contains("Go is fast. Go is safe."))
        .stdout(predicates::str::contains("Replacements: 2"));
}
```

还要检查失败路径。测试故意传入不存在的路径，并检查退出状态和错误输出；非法枚举值则由 `clap` 拒绝：

```rust
#[test]
fn missing_file_returns_error() {
    let directory = tempfile::tempdir().unwrap();
    let missing = directory.path().join("missing.txt");

    textkit()
        .args(["stats", missing.to_str().unwrap()])
        .assert()
        .failure()
        .stderr(predicates::str::contains("I/O error"));
}

#[test]
fn unknown_filter_mode_is_rejected() {
    let file = create_test_file("Rust\nGo");

    textkit()
        .args([
            "filter",
            file.path().to_str().unwrap(),
            "Rust",
            "--mode",
            "unknown",
        ])
        .assert()
        .failure();
}

#[test]
fn missing_required_arguments_are_rejected() {
    textkit().arg("search").assert().failure();
}
```

`success()` 和 `failure()` 检查进程退出码；`stdout(...)`、`stderr(...)` 检查用户实际看到的内容。只断言关键片段通常比要求整段输出完全一致更稳健，之后调整说明文字时也不必改动无关测试。

如果暂时不想增加测试依赖，标准库的 `std::process::Command` 也足够：用 `.output()` 捕获输出，再检查 `output.status.success()` 和转换为字符串的 `stdout`/`stderr`。第三方库只是让这类断言更清楚，并不是写集成测试的前提。

### 按层次运行检查

日常开发可以先运行最窄范围的检查，再跑全量检查：

```powershell
# 只运行库中的单元测试
cargo test --lib

# 只运行 CLI 集成测试
cargo test --test cli

# 按测试名称筛选
cargo test unknown_filter_mode_is_rejected

# 运行全部检查
cargo fmt --check
cargo test
cargo clippy --all-targets -- -D warnings
cargo build
```

`cargo fmt --check` 检查格式但不修改文件；`cargo clippy` 提示常见问题；`-D warnings` 将警告视为错误，便于在提交前处理。开发时也可以用 `cargo fmt` 自动格式化。测试失败时先阅读实际值和预期值，确认边界定义和实现是否一致，不要为了让测试变绿而直接删除断言。

完成后手动浏览 CLI 帮助并回归四个命令：

```powershell
cargo run -- --help
cargo run -- stats .\sample.txt
cargo run -- search .\sample.txt Rust
cargo run -- filter .\sample.txt Rust --mode exclude
cargo run -- replace .\sample.txt Rust Go
```

## 总结

`textkit` 从一个文件统计脚本，逐渐变成结构清晰、可测试的命令行程序。过程中接触到的 Rust 基础概念都服务于实际需求：借用避免复制文本行，迭代器组合处理文本，`Result` 和 `?` 传递错误，模块边界组织代码，测试固定行为，`clap` 负责可靠地解析用户输入。这类项目的价值不在于功能有多复杂，而在于每次只增加一项能力，同时让代码和验证方式跟着需求一起成长。把需求拆成小步骤，先得到可运行的版本，再逐步改善结构，是一条踏实的 Rust 入门路径。


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E7%94%A8rust%E4%BB%8E%E9%9B%B6%E5%86%99%E4%B8%80%E4%B8%AA%E6%96%87%E6%9C%AC%E5%A4%84%E7%90%86cli/  

