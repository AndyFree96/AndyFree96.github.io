# MongoDB权威指南 第3版 (Shannon Bradshaw / Eoin Brazil / Kristina Chodorow)


MongoDB 是当前最流行的 NoSQL 数据库之一，它采用文档模型存储数据，通过灵活的数据结构、高性能的索引机制以及完善的分布式能力，广泛应用于互联网应用、大数据处理和实时业务场景。但想真正理解 MongoDB，仅仅掌握 CRUD 操作和查询语法是不够的。MongoDB 背后涉及许多数据库核心概念：文档模型设计、BSON存储、索引原理、WiredTiger存储引擎、MVCC并发控制、副本集以及分片架构等。本文将结合[《MongoDB权威指南》](https://book.douban.com/subject/35688800/)，从使用实践逐步深入底层原理，探索 MongoDB 的设计思想以及它如何解决现代应用中的数据存储和扩展问题。

<!--more-->

## 第一部分 MongoDB入门

### 第1章 MongoDB简介

#### 1.1 易于使用

MongoDB不是关系数据库，而是++面向文档++(document-oriented)的数据库。便于扩展是MongoDB没有使用关系模型的主要原因。

通过嵌入文档和数组，面向文档的方式可以仅用一条记录来表示复杂的层次关系，与面向对象语言的开发人员思考数据的方式非常契合。

MongoDB没有预定义模式(predefined schema)：文档键值的类型和大小不是固定的。按需添加或删除字段变得更容易。

#### 1.2 易于扩展

数据快速增长，如何扩展数据库？可以归结为两种选择：纵向扩展(提高配置)和横向扩展(将数据分布到更多机器上)。MongoDB的设计采用了横向扩展。面向文档的数据模型使跨多台服务器拆分数据更容易。MongoDB会自动平衡跨集群和数据和负载，自动重新分配文档，并将读写操作路由到正确的机器上，如图1-1所示。

![图1-1 使用分片将MongoDB横向扩展至多台服务器](/images/202607/24/1-1.png "图1-1 使用分片将MongoDB横向扩展至多台服务器")

MongoDB是一个集群还是单个节点对应用程序来说都是透明的。

#### 1.3 功能丰富

MongoDB是通用型数据库，除了创建、读取、更新和删除数据外，还提供了数据管理系统的常见功能和许多其他独特的功能。

- 索引
- 聚合
- 特殊的集合和索引类型
- 文件存储

#### 1.4 性能卓越

MongoDB在其WiredTiger存储引擎中使用了机会锁，以最大限度地提高并发和吞吐量。它会使用尽可能多的RAM作为缓存，并尝试为查询自动选择正确的索引。

什么是机会锁？

机会锁的思想：假设冲突很少发生，大家先自由执行，最后提交时检查有没有别人改过。也就是先做事情，提交时检查有没有冲突。有的话，就会回滚/重试。没有，就成功修改。

### 第2章 入门指南

#### 2.1 文档

文档是MongoDB的核心概念：它是一组有序键值的集合。

#### 2.2 集合

集合就是一组文档。如果将文档比作关系数据库中的行，那么集合就相当于一张表。

#### 2.3 数据库

MongoDB使用集合对文档进行分组，使用数据库对集合进行分组。

#### 2.5 MongoDB Shell

MongoDB Shell可在[此处](https://www.mongodb.com/try/download/shell)下载安装。要启动Shell，直接在终端运行`mongosh`。Shell是一个功能齐全的JavaScript解释器，能够运行任意的JavaScript程序。

启动时，Shell会连接到MongoDB服务器端的`test`数据库，并将此数据库连接赋值给全局变量`db`。要查看`db`当前指向哪个数据库，请键入`db`并按回车键：

```bash
> db
test
```

`show dbs`可查看到所有的数据库

`use video`中的`use`用于切换数据库。

`show collections`可查看到当前数据库的所有集合。

`insertOne`函数可以将一个文档添加到集合中。

`find`和`findOne`方法可用于查询集合中的文档。

`updateOne`可以修改文档，会接受至少两个参数：第一个用于查找要更新文档的限定条件，第二个用于描述要进行更新的文档。

```js
db.movie.updateOne(
	{ title: "Star Wars: Episode IV - A New Hope" },
	{ $set: { reviews: [] } }
);
```

`deleteOne`和`deleteMany`方法会从数据库中永久删除文档。都采用一个指定删除条件的过滤文档作为参数。

```js
db.movies.deleteOne({title: "Star Wars"});
```

#### 2.7 使用MongoDB Shell

Shell可以连接到机器可以访问的任何MongoDB实例，要想连接到其他机器或端口上的MongoDB服务，需要在启动Shell时指定主机名、端口和数据库：

```bash
mongosh localhost:27017/movies
```

此时，`db`就指向了`localhost:27017`上的`movies`数据库。

使用`--nodb`参数启动Shell，那么它在启动时就不会连接任何数据库：

```bash
mongosh --nodb
```

Shell内置了帮助文档，可以输入`help`命令进行访问。

`db.help()`可以查看数据库级别的帮助信息，使用`db.foo.help()`查看集合级别的帮助信息。

MongoDB Shell可以配合[脚本](https://www.mongodb.com/docs/mongodb-shell/write-scripts/)一起使用。

### 第3章 创建、更新和删除文档

#### 3.1 插入文档

```js
db.movies.insertOne({"title": "Stand by Me"})

db.movies.drop()

db.movies.insertMany([{"title": "Ghostbusters"}, {"title": "E.T."}])
```

#### 3.2 删除文档

```js
db.movies.deleteOne({"_id": ObjectId('6a59ded8541a7ff3e944d53b')})

db.movies.deleteMany({"year": 1984}) 

db.movies.deleteMany({}) // 删除一个集合中的所有文档

db.movies.drop() // 如果想清空整个集合，可使用drop直接删除集合
```

#### 3.3 更新文档

`replaceOne`会用新文档完全替换匹配的文档。

`$set`用来设置一个字段的值。

```js
db.user.updateOne({"name": "joe"}, {"$set": {"favorite book": "Green Eggs and Ham"}})
```

`$unset`将键完全删除。

`$inc`运算符可以递增键值。

`$push`往数组里增加元素。

`$pop`从数组中删除元素。

`upsert`是一种特殊类型的更新。如果找不到与筛选条件相匹配的文档，则会以这个条件和更新文档为基础来创建一个新文档；如果找到了匹配的文档，则进行正常的更新。

`findOneAndDelete`、`findOneAndReplace`和`findOneAndUpdate`可以原子地获取已修改文档的值。

### 第4章 查询

## 第二部分 设计应用程序

### 第5章 索引

### 第6章 特殊的索引和集合类型

### 第7章 聚合框架

### 第8章 事务

### 第9章 应用程序设计

## 第三部分 复制

### 第10章 创建副本集

### 第11章 副本集的组成

### 第12章 从应用程序连接副本集

### 第13章 管理

## 第四部分 分片

### 第14章 分片简介

### 第15章 配置分片

### 第16章 选择片键

### 第17章 分片管理

## 第五部分 应用程序管理

### 第18章 了解应用程序的动态

### 第19章 MongoDB安全介绍

### 第20章 持久性

## 第六部分 服务器端管理

### 第21章 在生产环境中设置MongoDB

### 第22章 监控MongoDB

### 第23章 备份

### 第24章 部署MongoDB

## 附录B 深入MongoDB

## 推荐

[MongoDB Docs](https://www.mongodb.com/docs/)




---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/mongodb%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97/  

