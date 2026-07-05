# LevelDB源码剖析：Google如何设计一个高性能嵌入式数据库


<!--more-->

## 0. 准备工作

执行以下命令将LevelDB项目克隆到本地：

```bash
git clone --recurse-submodules https://github.com/google/leveldb.git
```

LevelDB本身是一个Key-Value存储引擎，并没有提供`main`入口函数。为了方便调试，参考[reading-source-code-of-leveldb-1.23](https://github.com/SmartKeyerror/reading-source-code-of-leveldb-1.23)中的做法。在项目根目录下，新建`debug/leveldb_debug.cc`文件：

```cpp {title="debug/leveldb_debug.cc"}
#include <iostream>
#include <string>

#include "leveldb/db.h"

using namespace std;

int main() {
  leveldb::DB* db;
  leveldb::Options options;

  options.create_if_missing = true;

  leveldb::Status status = leveldb::DB::Open(options, "./leveldb_test", &db);

  if (!status.ok()) {
    cerr << status.ToString() << endl;
  }

  leveldb::WriteOptions writeOptions;

  db->Put(writeOptions, "hello", "world");
  string value;
  db->Get(leveldb::ReadOptions(), "hello", &value);
  cout << "Keyword value : " << value << endl;
  db->Put(writeOptions, "hello1", "nice");

  if (!status.ok()) {
    cerr << status.ToString() << endl;
  }

  return 0;
}

```

并在`CMakeLists.txt`中增加下图所示内容：

![图1 CMakeLists.txt文件](/images/202606/12/1.jpeg '图1 CMakeLists.txt文件')

## 1. 整体架构——一张图看懂LevelDB

## 2. 数据写入流程——一次Put()到底发生了什么？

## 3. MemTable——内存中的有序表是如何实现的？

## 4. SkipList——为什么不用红黑树？

## 5. WAL——崩溃恢复的第一道防线

## 6. SSTable——磁盘数据是如何组织的？

## 7. Block——Restart Point的设计思想

## 8. Bloom Filter——如何避免无效磁盘访问？

## 9. VersionSet与Manifest——元数据如何管理？

## 10. Compaction——LSM Tree的核心机制

## 11. Iterator——多路归并遍历的实现

## 12. 读取流程——一次Get()都经历了什么？

## 13. LRUCache——缓存是如何设计的？

## 14. 恢复流程——数据库重启时发生了什么？

## 15. 总结

## 推荐

## 参考

[Just For Fun](https://selfboot.cn/archives/)

[Ying](https://izualzhy.cn/archive.html?tag=leveldb)

[leveldb-handbook](https://leveldb-handbook.readthedocs.io/zh/latest/index.html)

[reading-source-code-of-leveldb-1.23](https://github.com/SmartKeyerror/reading-source-code-of-leveldb-1.23)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/leveldb%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/  

