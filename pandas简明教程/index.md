# Pandas简明教程


众所周知，Pandas 是最受欢迎的 Python 数据科学与分析库。Numpy 用于较低级别的科学计算。Pandas 构建于 Numpy 之上，专为实际数据分析而设计。本文总结了一些常见、方便的功能。话不多说，让我们开始吧！

<!--more-->

## 数据集

数据是数据科学与分析的“命根子”，我们需要从数据中寻找答案，从数据中发现模式……如果没有数据的话，就无从谈起。数据获取的方式有很多种，这里分享一些提供数据的平台。

pandas-videos：https://github.com/justmarkham/pandas-videos

![pandas-videos上的数据集](/images/202101/1/4.png)

UCI Machine Learning Reposity：https://archive.ics.uci.edu/datasets

![UCI Machine Learning Reposity](/images/202101/1/3.png)

## 导入数据

任何的数据分析工作都是从导入数据开始，[Pandas](https://pandas.pydata.org/pandas-docs/stable/)提供了很多导入数据的方法。

```Python
pd.read_csv(filename) # From a CSV file
pd.read_table(filename) # From a delimited text file (like TSV)
pd.read_excel(filename) # From an Excel file
pd.read_sql(query, connection_object) # Reads from a SQL table/database
pd.read_json(json_string) # Reads from a JSON formatted string, URL or file
pd.read_html(url) # Parses an html URL, string or file and extract tables to a list of dataframes
pd.read_clipboard() # Takes the contents of your clipboard and passes it to read_table()
pd.DataFrame(dict) # From a dict, keys for columns names, values for data as lists
```

不妨举个例子，我们想分析一下 IMDB 高分电影，经过一番搜索，发现 https://raw.githubusercontent.com/justmarkham/pandas-videos/master/data/imdb_1000.csv 上的数据就不错，
若想把它导入，使用`pd.read_csv`方法就行啦！

具体来说，就是：

```Python
dataURL = 'https://raw.githubusercontent.com/justmarkham/pandas-videos/master/data/imdb_1000.csv'
df = pd.read_csv(dataURL)
df.head() # Prints first 5 rows of the DataFrame
```

![前5行数据](/images/202101/1/1.png)

关于上述导入数据方法的更多详细内容，请查看[IO Tools](http://pandas.pydata.org/pandas-docs/stable/io.html#)。

## 探索数据

一旦将数据导入到 DataFrame 中之后，就可以用以下方法来了解数据的情况。

```Python
df.index # Index Description
df.columns # Columns in the DataFrame
df.shape # Prints number of row and columns in DataFrame
df.head(n) # Prints first n rows of the DataFrame
df.tail(n) # Prints last n rows of the DataFrame
df.info() # Index, DataType and Memory information
df.describe() # Summary statistics for numerical columns
s.value_counts(dropna=False) # Views unique values and counts
df.apply(pd.Series.value_counts) # Unique value and counts for all columns
df.mean() # Returns the mean of all columns
df.corr() # Returns the correlation between columns in a DataFrame
df.count() # Returns the number of non-null values in each DataFrame column
df.max() # Returns the highest value in each column
df.min() # Returns the lowest value in each column
df.median() # Returns the median of each column
df.std() # Returns the standard deviation of each column
df.idxmax() # Index of the lowest value
df.idxmin() # Index of the highest value
```

举个例子，在导入 IMDB 高分电影数据后统计一下每种电影类型的频数，我们就可以用:

```Python
df['genre'].value_counts()
```

![每种电影类型的频数](/images/202101/1/2.png)

## 选择

通常，我们可能需要选择单个元素或者数据的某个子集来进行深入分析。那么，这些方法就会大显身手：

```Python
df[col] # Returns column with label col as Series
df[[col1, col2]] # Returns columns as a new DataFrame
s.iloc[0] # Selection by position (selects first element)
s.loc[0] # Selection by index (selects element as index 0)
df.iloc[0, :] # First row
df.iloc[0, 0] # First element of first column
df.iat[0, 0] # First element of first column. Access a single value for row/column pair by integer position
df.at[row_label, col_label] # Access a single value for row/column label pair
```

更多内容，请查看[Indexing and Selecting Data](http://pandas.pydata.org/pandas-docs/stable/indexing.html)。

## 数据清理

实际上，我们拿到数据后，往往需要清理它。以下就是一些非常有用的方法：

```Python
df.columns = ['a', 'b', 'c'] # Renames columns
pd.isnull() # Checks for null values, return Boolean Array
pd.notnull() # Opposite of pd.isnull()
df.dropna() # Drops all rows that contain null values
df.dropna(axis=1) # Drops all columns that contain null values
df.dropna(axis=1, thresh=n) # Drops all rows hava less than non null values
df.fillna(x) # Replaces all null values with x
s.fillna(s.mean()) # Replaces all null values with the mean
s.astype(float) # Converts the datatype of the series to float
s.replace(1, 'one') # Replaces all values equal to 1 with 'one'
s.replace([1, 3], ['one', 'three']) # Replace all 1 with 'one' and 3 with 'three'
df.rename(columns=lambda x: x + 1) # Mass renaming of columns
df.rename(columns={'old_name': 'new_name'}) # Selective renaming
df.set_index('column_one') # Changes the index
df.rename(index=lambda x: x + 1) # Mass renaming of index
df.drop(labels) # Drop specified labels from rows or columns
df.drop_duplicates(subset) # Return DataFrame with duplicate rows removed, optionally only considering certain columns
```

更多内容，请查看[Working with missing data](http://pandas.pydata.org/pandas-docs/stable/missing_data.html)。

## 过滤，排序和分组

一些对数据过滤、排序和分组的方法：

```Python
df[df[col] > 0.5] # Rows where the col column is greater than 0.5
df[(df[col] > 0.5) & (df[col] < 0.7)] # Rows where 0.5 < col < 0.7
df.sort_values(col1) # Sorts values by col1 in ascending order
df.sort_values(col2, ascending=False) # Sorts values by col2 in descending order
df.sort_values([col1, col2], ascending=[True, False]) # Sorts values by col1 in ascending order then col2 in descending order
df.groupby(col) # Returns a groupby object for values from one column
df.groupby([col1,col2]) # Returns a groupby object values from multiple columns
df.groupby(col1)[col2].mean() # Returns the mean of the values in col2, grouped by the values in col1 (mean can be replaced with almost any function from the statistics section)
df.pivot_table(index=col1, values= col2,col3], aggfunc=mean) # Creates a pivot table that groups by col1 and calculates the mean of col2 and col3
df.groupby(col1).agg(np.mean) # Finds the average across all columns for every unique column 1 group
df.apply(np.mean) # Applies a function across each column
df.apply(np.max, axis=1) # Applies a function across each row
```

更多内容，请查看[Group By: split-apply-combine](http://pandas.pydata.org/pandas-docs/stable/groupby.html)。

## 导出数据

最后，当需要将分析结果导出时，也有几种方便的发方：

```Python
df.to_csv(filename) # Writes to a CSV file
df.to_excel(filename) # Writes to an Excel file
df.to_sql(table_name, connectiion_object) # Writes to a SQL table
df.to_json(filename) # Writes to a file in JSON format
df.to_html(filename) # Saves as an HTML table
df.to_clipboard() # Writes to the clipboard
```

详情请查看[IO Tools](http://pandas.pydata.org/pandas-docs/stable/io.html#)。

## 连接和合并

合并两个 DataFrame 的方法：

```Python
pd.concat([df1, df2], axis=1) # Adds the columns in df1 to the end of df2
pd.merge(df11, df2) # SQL-style merges
df1.append(df2) # Adds the rows in df1 to the end of df2 (columns should be identical)
df1.join(df2,on=col1,how='inner') # SQL-style joins
```

更多内容，请查看[Merge, join, and concatenate](http://pandas.pydata.org/pandas-docs/stable/merging.html)。

## 创建测试对象

通用用于测试代码段。

```Python
pd.DataFrame(np.random.rand(20,5)) # 5 columns and 20 rows of random floats
pd.Series(my_list) # Create a series from an iterable my_list
df.index = pd.data_range('1900/1/30', periods=df.shape[0]) # Add a date index
```

## bitly_usagov 数据集分析

或许我们可以从一个实例（来源于书籍《Python for Data Analysis》）出发，当作一个小练习。选用的是`bitly_usagov`数据集。

该数据集可以在：https://github.com/wesm/pydata-book 处找到。

### 导入数据

假如将数据下载到了本地，我们可以尝试将其导入并得到 DataFrame 对象，便于之后的分析工作。

```Python
import pandas as pd

file_path = '../../Datasets/bitly_usagov/example.txt' # Local file path
df = pd.read_json(file_path, lines=True)
df.info()
```

![用info方法查看数据](/images/202101/1/5.png)

### 对时区计数

`df`对象有一列名为`tz`，表示的是时区。我们可以对所有数据的时区进行统计，

```Python
tz_counts = df['tz'].value_counts()
tz_counts.head(10)
```

![](/images/202101/1/6.png)

我们可以将结果可视化，但在此之前，可以将未知或者缺失的时区补上一个替代值。

`fillna`函数可以替换缺失值（NA），而未知值（空字符串）则可以通过布尔数组索引进行替换：

```Python
clean_tz = df['tz'].fillna('Missing')
clean_tz[clean_tz == ''] = 'Unknown'
tz_counts = clean_tz.value_counts()
```

之后，我们可以用`seaborn`包创建水平柱状图：

![](/images/202101/1/7.png)

`df`对象名为`a`的列中含有浏览器、设备、应用程序的相关信息，我们可以简单地将浏览器信息提取出来：

```Python
df.a.str.split(' ').str.get(0).head(10)
```

![](/images/202101/1/8.png)

类似地，我们也可以将浏览器的统计信息可视化：

![](/images/202101/1/9.png)

## 参考

- https://paulovasconcellos.com.br/28-useful-pandas-functions-you-might-not-know-de42c59db085
- https://elitedatascience.com/python-cheat-sheet
- https://www.dataquest.io/blog/pandas-cheat-sheet/
- http://pandas.pydata.org/pandas-docs/stable/10min.html


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/pandas%E7%AE%80%E6%98%8E%E6%95%99%E7%A8%8B/  

