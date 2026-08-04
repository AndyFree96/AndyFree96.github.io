# Polly使用指南：.NET应用程序可靠性设计


在现代软件系统中，应用程序越来越依赖外部资源HTTP API、微服务、数据库、消息队列、第三方服务。然而，分布式系统中失败是不可避免的。比如：网络短暂不可用、服务响应变慢、请求量突然增加、第三方API限流。如果应用程序没有任何保护机制，一个简单的异常都可能导致整个系统不可用。因此，在高可靠系统设计中，需要引入弹性(Resilience)设计模式。.NET生态中，最流行的弹性处理库就是——[Polly](https://www.pollydocs.org/)。
<!--more-->

## 什么是Polly？

Polly是一个用于.NET的弹性与瞬态故障处理库。它帮助开发者为应用程序添加各种可靠性策略：

- Retry(重试)
- Circuit Breaker(熔断)
- Hedging(请求对冲)
- Timeout(超时)
- Rate Limiter(限流)
- Fallback(降级)

简单理解：Polly就是在业务代码和外部资源之间增加一层可靠性保护。

结构如下：

![图1 整体结构](/images/202608/4/1.png "图1 整体结构")

使用以下命令添加`Polly`包：

```pwsh
dotnet add package Polly
dotnet add package Polly.RateLimiting
dotnet add package System.Threading.RateLimiting
```

## Retry 重试

Retry的核心思想是当一次操作失败时，不立即认为系统不可用，而是尝试重新执行。

```c#
using Polly;

class Program
{
    static async Task Main(string[] args)
    {
        int count = 0;

        var retryPipeline = new ResiliencePipelineBuilder().AddRetry(new()
        {
            MaxRetryAttempts = 3,
            Delay = TimeSpan.FromSeconds(1),
            OnRetry = retry =>
            {
                Console.WriteLine($"第{retry.AttemptNumber + 1}次失败，准备重试");
                return ValueTask.CompletedTask;
            }
        }).Build();

        await retryPipeline.ExecuteAsync(async token =>
        {
            count++;
            
            Console.WriteLine($"执行第{count}次请求");

            if (count < 3)
            {
                throw new Exception("服务器异常");
            }
            
            Console.WriteLine("请求成功");
        });
    }
}
```

## Circuit Breaker 熔断

Circuit Breaker类似电路保险丝。当发现服务持续失败，暂停访问，让系统恢复。

```c#
using Polly;

class Program
{
    static async Task Main(string[] args)
    {
        int requestCount = 0;

        var pipeline = new ResiliencePipelineBuilder().AddCircuitBreaker(new()
        {
            FailureRatio = 1.0, // 失败比例
            MinimumThroughput = 3, // 最少请求数量
            SamplingDuration = TimeSpan.FromSeconds(10), // 统计窗口
            BreakDuration = TimeSpan.FromSeconds(5), // 熔断持续时间
            OnOpened = openedArgs =>
            {
                Console.WriteLine(">>> Circuit Open熔断开始");
                return ValueTask.CompletedTask;
            },
            OnClosed = closedArgs =>
            {
                Console.WriteLine(">>> Circuit Closed恢复正常");
                return ValueTask.CompletedTask;
            },
            OnHalfOpened = halfOpenedArgs =>
            {
                Console.WriteLine(">>> Circuit Half Open尝试恢复");
                return ValueTask.CompletedTask;
            }
        }).Build();

        for (int i = 0; i < 10; i++)
        {
            try
            {
                await pipeline.ExecuteAsync(token =>
                {
                    requestCount++;
                    
                    Console.WriteLine($"请求 {requestCount}");

                    if (requestCount <= 3)
                    {
                        throw new Exception("服务异常");
                    }
                    
                    Console.WriteLine("服务返回成功");
                    return ValueTask.CompletedTask;
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"异常: {ex.Message}");
            }
            await Task.Delay(1000);
        }
    }
}
```

![图2 Circuit Breaker执行结果](/images/202608/4/2.png "图2 Circuit Breaker执行结果")


| 参数                | 决定什么        |
| :----------------- | :----------- |
| FailureRatio      | 失败多少比例触发熔断  |
| MinimumThroughput | 至少多少请求才开始判断 |
| SamplingDuration  | 统计失败率的时间窗口  |
| BreakDuration     | 熔断后多久尝试恢复   |

四个参数共同决定了Circuit Breaker的灵敏度。


## Hedging 请求对冲

Hedging同一个请求发送多个副本，使用最快返回的结果。

```c#
using System.Threading.RateLimiting;
using Polly;
using Polly.Hedging;
using Polly.RateLimiting;

class Program
{
    static async Task Main(string[] args)
    { 
        var serverIndex = 0;
        
       var pipeline = new ResiliencePipelineBuilder<string>().AddHedging(new HedgingStrategyOptions<string>()
       {
           MaxHedgedAttempts = 1,
           Delay = TimeSpan.FromMilliseconds(500),
           OnHedging = hegingArgs =>
           {
               Console.WriteLine($"发起备用请求");
               return default;
           }
       }).Build();

       var result = await pipeline.ExecuteAsync<string>(async token =>
       {
           serverIndex++;

           if (serverIndex == 1)
           {
               return await ServerA(token);
           }
           else
           {
               return await ServerB(token);
           }
           
       });
       
       Console.WriteLine($"最终结果: {result}");
    }

    static async Task<string> ServerA(CancellationToken token)
    {
        Console.WriteLine("Server A开始");
        
        await Task.Delay(3000, token);
        
        Console.WriteLine("Server A完成");
        
        return "Server A";
    }

    static async Task<string> ServerB(CancellationToken token)
    {
        Console.WriteLine("Server B开始");
        
        await Task.Delay(500, token);
        
        Console.WriteLine("Server B完成");
        
        return "Server B";
    }
}
```

![图3 Hedging执行结果](/images/202608/4/4.png "图3 Hedging执行结果")


## Timeout 超时

Timeout限制一个操作最多执行多久。例如，HTTP请求最多等待3秒，超时则取消。

```c#
using Polly;

class Program
{
    static async Task Main(string[] args)
    {
        var timeout = new ResiliencePipelineBuilder().AddTimeout(TimeSpan.FromSeconds(2)).Build();

        try
        {
            await timeout.ExecuteAsync(async token =>
            {
                Console.WriteLine("开始请求");

                await Task.Delay(5000, token);

                Console.WriteLine("请求完成");
            });

        } catch(Exception ex)
        {
            Console.WriteLine($"发生异常: {ex.Message}");
        }
    }
}
```

## Rate Limiter 限流

Rate Limiter控制单位时间内允许执行的请求数量。例如，每秒最多100个请求，超过则拒绝请求。

```c#
using System.Threading.RateLimiting;
using Polly;
using Polly.RateLimiting;

namespace PollyDemo2;

class Program
{
    static async Task Main(string[] args)
    {
        var pipeline = new ResiliencePipelineBuilder().AddRateLimiter(new RateLimiterStrategyOptions()
        {
            DefaultRateLimiterOptions = new ConcurrencyLimiterOptions()
            {
                PermitLimit = 1
            },
            OnRejected = rejectedArgs =>
            {
              Console.WriteLine("限流中");
              return default;
            }
        }).Build();

        var tasks = Enumerable.Range(0, 10)
            .Select(i =>
                pipeline.ExecuteAsync(async token =>
                {
                    Console.WriteLine($"请求{i}开始");

                    await Task.Delay(1000);

                    Console.WriteLine($"请求{i}完成");

                }).AsTask())
            .ToArray();


        await Task.WhenAll(tasks);
        
    }
}
```


## Fallback 降级

Fallback主方案失败后，使用备用方案。例如，调用天气API，返回天气。如果天气API异常，返回默认天气。

```c#
using Polly;
using Polly.Fallback;

class Program
{
    static async Task Main(string[] args)
    {
        var pipeline = new ResiliencePipelineBuilder<string>().AddFallback(new FallbackStrategyOptions<string>()
        {
            ShouldHandle = new PredicateBuilder<string>().Handle<Exception>(),
            FallbackAction = fallbackArgs =>
            {
                Console.WriteLine("服务失败，执行降级");

                return Outcome.FromResultAsValueTask("默认天气：晴天");
            }
        }).Build();

        var result = await pipeline.ExecuteAsync<string>(token =>
        {
            Console.WriteLine("调用天气API");
            throw new Exception("天气服务异常");
        });
        
        Console.WriteLine(result);
    }
}
```

![图4 Fallback执行结果](/images/202608/4/3.png "图4 Fallback执行结果")


## 六大策略对比

| 策略              | 作用       | 解决问题   |
| :--------------- | :-------- | :------ |
| Retry           | 失败重新尝试   | 瞬态故障   |
| Circuit Breaker | 暂停访问异常服务 | 防止雪崩   |
| Timeout         | 限制执行时间   | 防止无限等待 |
| Rate Limiter    | 限制请求数量   | 防止过载   |
| Fallback        | 提供备用方案   | 保证功能可用 |
| Hedging         | 多个请求竞争   | 降低延迟   |

## 总结

可靠的软件不是避免失败，而是在失败发生时优雅地恢复。

---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/polly%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97/  

