# Launch-Editor源码剖析：快速打开编辑器的实现原理


在阅读 Vite 源码的过程中，我注意到一个有趣的依赖 —— launch-editor。起初只是随手点开，结果却发现它正是支撑起「浏览器报错信息 → 一键跳转到编辑器」这一开发体验的核心工具。其实，我们在使用 Vite、Vue CLI 等工具的时候，不止一次用过这个功能：报错时点击链接，代码编辑器立刻打开到对应的文件和行号。背后的关键实现，正是 launch-editor。

<!--more-->

{{< admonition >}}
Vite 提交号为: `3676da5bc5b2b69b28619b8521fca94d30468fe5`。`launch-editor-middleware`版本为`2.10.0`，`launch-editor`版本为`2.10.0`。
{{< /admonition >}}

`vite`项目的`vite/packages/vite/src/node/server/index.ts`文件中有这么一句：

```ts
// open in editor support
middlewares.use('/__open-in-editor', launchEditorMiddleware());
```

也就是使用了`launch-editor-middleware`中间件，它会监听`/__open-in-editor`路径，并将请求转发给`launch-editor`模块。启动了 vite 应用后，我们在浏览器中如下访问：

`http://locahost:5173/__open-in-editor?file=package.json:9`

`launch-editor-middleware`模块的源码位于`vite/packages/vite/node_modules/launch-editor-middleware/index.js`，它主要做了两件事：

1. 解析请求参数，获取文件路径和行号
2. 调用`launch-editor`模块，打开编辑器并跳转到相应的文件和行号

`index.js`具体代码如下：

```js {title="index.js"}
const url = require('url');
const path = require('path');
const launch = require('launch-editor');

module.exports = (specifiedEditor, srcRoot, onErrorCallback) => {
  if (typeof specifiedEditor === 'function') {
    onErrorCallback = specifiedEditor;
    specifiedEditor = undefined;
  }

  if (typeof srcRoot === 'function') {
    onErrorCallback = srcRoot;
    srcRoot = undefined;
  }

  srcRoot = srcRoot || process.cwd();

  return function launchEditorMiddleware(req, res) {
    const { file } = url.parse(req.url, true).query || {};
    if (!file) {
      res.statusCode = 500;
      res.end(
        `launch-editor-middleware: required query param "file" is missing.`
      );
    } else {
      launch(path.resolve(srcRoot, file), specifiedEditor, onErrorCallback);
      res.end();
    }
  };
};
```

`launch-editor-middleware`使用的`launch-editor`包位于`vite/node_modules/.pnpm/launch-editor@2.10.0/node_modules/launch-editor`。

我很好奇的是`launch-editor`是如何确定用哪个编辑器打开文件和行号的呢？答案可以在`vite/node_modules/.pnpm/launch-editor@2.10.0/node_modules/launch-editor/guess.js`中找到。

```js {title="guess.js"}
const path = require('path');
const shellQuote = require('shell-quote');
const childProcess = require('child_process');

// Map from full process name to binary that starts the process
// We can't just re-use full process name, because it will spawn a new instance
// of the app every time
const COMMON_EDITORS_MACOS = require('./editor-info/macos');
const COMMON_EDITORS_LINUX = require('./editor-info/linux');
const COMMON_EDITORS_WIN = require('./editor-info/windows');

module.exports = function guessEditor(specifiedEditor) {
  if (specifiedEditor) {
    return shellQuote.parse(specifiedEditor);
  }

  if (process.env.LAUNCH_EDITOR) {
    return [process.env.LAUNCH_EDITOR];
  }

  if (process.versions.webcontainer) {
    return [process.env.EDITOR || 'code'];
  }

  // We can find out which editor is currently running by:
  // `ps x` on macOS and Linux
  // `Get-Process` on Windows
  try {
    if (process.platform === 'darwin') {
      const output = childProcess
        .execSync('ps x -o comm=', {
          stdio: ['pipe', 'pipe', 'ignore'],
        })
        .toString();
      const processNames = Object.keys(COMMON_EDITORS_MACOS);
      const processList = output.split('\n');
      for (let i = 0; i < processNames.length; i++) {
        const processName = processNames[i];
        // Find editor by exact match.
        if (processList.includes(processName)) {
          return [COMMON_EDITORS_MACOS[processName]];
        }
        const processNameWithoutApplications = processName.replace(
          '/Applications',
          ''
        );
        // Find editor installation not in /Applications.
        if (output.indexOf(processNameWithoutApplications) !== -1) {
          // Use the CLI command if one is specified
          if (processName !== COMMON_EDITORS_MACOS[processName]) {
            return [COMMON_EDITORS_MACOS[processName]];
          }
          // Use a partial match to find the running process path.  If one is found, use the
          // existing path since it can be running from anywhere.
          const runningProcess = processList.find((procName) =>
            procName.endsWith(processNameWithoutApplications)
          );
          if (runningProcess !== undefined) {
            return [runningProcess];
          }
        }
      }
    } else if (process.platform === 'win32') {
      const output = childProcess
        .execSync(
          'powershell -NoProfile -Command "' +
            '[Console]::OutputEncoding=[Text.Encoding]::UTF8;' +
            'Get-CimInstance -Query \\"select executablepath from win32_process where executablepath is not null\\" | % { $_.ExecutablePath }' +
            '"',
          {
            stdio: ['pipe', 'pipe', 'ignore'],
          }
        )
        .toString();
      const runningProcesses = output.split('\r\n');
      for (let i = 0; i < runningProcesses.length; i++) {
        const fullProcessPath = runningProcesses[i].trim();
        const shortProcessName = path.basename(fullProcessPath);

        if (COMMON_EDITORS_WIN.indexOf(shortProcessName) !== -1) {
          return [fullProcessPath];
        }
      }
    } else if (process.platform === 'linux') {
      // --no-heading No header line
      // x List all processes owned by you
      // -o comm Need only names column
      const output = childProcess
        .execSync('ps x --no-heading -o comm --sort=comm', {
          stdio: ['pipe', 'pipe', 'ignore'],
        })
        .toString();
      const processNames = Object.keys(COMMON_EDITORS_LINUX);
      for (let i = 0; i < processNames.length; i++) {
        const processName = processNames[i];
        if (output.indexOf(processName) !== -1) {
          return [COMMON_EDITORS_LINUX[processName]];
        }
      }
    }
  } catch (ignoreError) {
    // Ignore...
  }

  // Last resort, use old skool env vars
  if (process.env.VISUAL) {
    return [process.env.VISUAL];
  } else if (process.env.EDITOR) {
    return [process.env.EDITOR];
  }

  return [null];
};
```

如果用户调用函数时显式指定了编辑器`specifiedEditor`，则直接使用该编辑器。如果没有指定，则尝试使用环境变量`LAUNCH_EDITOR`。如果当前运行在[StackBlitz WebContainer](https://stackblitz.com/edit/webcontainers-akbduvna?file=index.js)这类环境中，就优先使用`EDITOR`环境变量，否则默认用`code`（VS Code 的命令函启动命令）。

如果以上情况都不满足，会根据`process.platform`来判断当前系统，分别进行处理。这里主要看在 Windows 系统下的处理方式：

```js {title="guess.js"}
const output = childProcess
  .execSync(
    'powershell -NoProfile -Command "' +
      '[Console]::OutputEncoding=[Text.Encoding]::UTF8;' +
      'Get-CimInstance -Query \\"select executablepath from win32_process where executablepath is not null\\" | % { $_.ExecutablePath }' +
      '"',
    {
      stdio: ['pipe', 'pipe', 'ignore'],
    }
  )
  .toString();
const runningProcesses = output.split('\r\n');
for (let i = 0; i < runningProcesses.length; i++) {
  const fullProcessPath = runningProcesses[i].trim();
  const shortProcessName = path.basename(fullProcessPath);

  if (COMMON_EDITORS_WIN.indexOf(shortProcessName) !== -1) {
    return [fullProcessPath];
  }
}
```

`powershell -NoProfile -Command`调用 PowerShell 执行一段命令，不加载用户配置文件（`-NoProfile`，保证执行环境干净）。

`[Console]::OutputEncoding=[Text.Encoding]::UTF8;`设置控制台输出为`UTF-8`编码，避免中文或路径中的特殊字符乱码。

`Get-CimInstance -Query "select executablepath from win32_process where executablepath is not null" | % { $_.ExecutablePath }"`查询所有正在运行的进程，取出它们的`ExecutablePath`属性。

![](/images/202509/1/1.png)

得到的输出是一堆路径，如上图所示。`const runningProcesses = output.split('\r\n')`按行分割成数组，每个元素就是一个进程的完整路径。

```js {title="guess.js"}
for (let i = 0; i < runningProcesses.length; i++) {
  const fullProcessPath = runningProcesses[i].trim();
  const shortProcessName = path.basename(fullProcessPath);

  if (COMMON_EDITORS_WIN.indexOf(shortProcessName) !== -1) {
    return [fullProcessPath];
  }
}
```

`path.basename(fullProcessPath)`只取出文件名，例如`Code.exe`,`atom.exe`等。`COMMON_EDITORS_WIN`是一个数组，里面包含了常见的编辑器。具体如下：

```js {title="windows.js"}
module.exports = [
  'Brackets.exe',
  'Code.exe',
  'Code - Insiders.exe',
  'VSCodium.exe',
  'Cursor.exe',
  'atom.exe',
  'sublime_text.exe',
  'notepad++.exe',
  'clion.exe',
  'clion64.exe',
  'idea.exe',
  'idea64.exe',
  'phpstorm.exe',
  'phpstorm64.exe',
  'pycharm.exe',
  'pycharm64.exe',
  'rubymine.exe',
  'rubymine64.exe',
  'webstorm.exe',
  'webstorm64.exe',
  'goland.exe',
  'goland64.exe',
  'rider.exe',
  'rider64.exe',
];
```

如果发现运行中的进程里有匹配的，就直接返回它的完整路径，方便后面去调用。最后，如果以上都不满足，则返回`null`，表示没有找到合适的编辑器。至此，我们知道了是如何确定用哪个编辑器。那么不同编辑器又是如何打开文件并跳转到相应的行号的呢？答案就在`vite/node_modules/.pnpm/launch-editor@2.10.0/node_modules/launch-editor/get-args.js`中。

```js {title="get-args.js"}
const path = require('path');

// normalize file/line numbers into command line args for specific editors
module.exports = function getArgumentsForPosition(
  editor,
  fileName,
  lineNumber,
  columnNumber = 1
) {
  const editorBasename = path.basename(editor).replace(/\.(exe|cmd|bat)$/i, '');
  switch (editorBasename) {
    case 'atom':
    case 'Atom':
    case 'Atom Beta':
    case 'subl':
    case 'sublime':
    case 'sublime_text':
    case 'wstorm':
    case 'charm':
    case 'zed':
      return [`${fileName}:${lineNumber}:${columnNumber}`];
    case 'notepad++':
      return ['-n' + lineNumber, '-c' + columnNumber, fileName];
    case 'vim':
    case 'mvim':
      return [`+call cursor(${lineNumber}, ${columnNumber})`, fileName];
    case 'joe':
    case 'gvim':
      return ['+' + `${lineNumber}`, fileName];
    case 'emacs':
    case 'emacsclient':
      return [`+${lineNumber}:${columnNumber}`, fileName];
    case 'rmate':
    case 'mate':
    case 'mine':
      return ['--line', lineNumber, fileName];
    case 'code':
    case 'Code':
    case 'code-insiders':
    case 'Code - Insiders':
    case 'codium':
    case 'cursor':
    case 'vscodium':
    case 'VSCodium':
      return ['-r', '-g', `${fileName}:${lineNumber}:${columnNumber}`];
    case 'appcode':
    case 'clion':
    case 'clion64':
    case 'idea':
    case 'idea64':
    case 'phpstorm':
    case 'phpstorm64':
    case 'pycharm':
    case 'pycharm64':
    case 'rubymine':
    case 'rubymine64':
    case 'webstorm':
    case 'webstorm64':
    case 'goland':
    case 'goland64':
    case 'rider':
    case 'rider64':
      return ['--line', lineNumber, '--column', columnNumber, fileName];
  }

  if (process.env.LAUNCH_EDITOR) {
    return [fileName, lineNumber, columnNumber];
  }

  // For all others, drop the lineNumber until we have
  // a mapping above, since providing the lineNumber incorrectly
  // can result in errors or confusing behavior.
  return [fileName];
};
```

每个编辑器的命令行参数都不太一样，这里只是列出了一些常见的编辑器的命令行参数。比如，对于 VS Code，它需要`-r -g`选项，以及`fileName:lineNumber:columnNumber`格式的参数。


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/launch-editor%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

