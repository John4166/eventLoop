# eventLoop
##什么是事件循环：
eventLoop执行过程

 * 在单次的迭代中，event loop首先检查macrotask队列，如果有一个macrotask等待执行，那么执行该任务。
 * 当该任务执行完毕后（或者macrotask队列为空），event loop继续执行microtask队列。
 * 如果microtask队列有等待执行的任务，那么event loop就一直取出任务执行知道microtask为空。
 * 这里我们注意到处理microtask和macrotask的不同之处：
 * 在单次循环中，一次最多处理一个macrotask（其他的仍然驻留在队列中），然而却可以处理完所有的microtask。
 * 当microtask队列为空时，event loop检查是否需要执行UI重渲染，如果需要则重渲染UI。这样就结束了当次循环，继续从头开始检查macrotask队列。
 * 注意：两个任务队列都放置在event loop外，这表明将任务添加和任务处理行为分离

##Event loop基于两个基本原则：
*同一时间只能执行一个任务。
*任务一直执行到完成，不能被其他任务抢断。
而macrotask,microtask包括如下东西

```
macrotasks: script(整体代码),setTimeout, setInterval, setImmediate, I/O, UI rendering
microtasks: process.nextTick, Promises.then, Object.observe, MutationObserver
```


##怎么使用：
 基本来说，当我们想以同步的方式来处理异步任务时候就用 microtask（比如我们需要直接在某段代码后就去执行某个任务，就像Promise一样）。
 其他情况就直接用 macrotask。


##task任务分类：
 * 当一个task(在 macrotask 队列中)正处于执行状态，也可能会有新的事件被注册，那就会有新的 task 被创建。比如下面两个
   1.promiseA.then() 的回调就是一个 task
        promiseA 是 resolved或rejected: 那这个 task 就会放入当前事件循环回合的 microtask queue
        promiseA 是 pending: 这个 task 就会放入 事件循环的未来的某个(可能下一个)回合的 microtask queue 中
   2.setTimeout 的回调也是个 task ，它会被放入 macrotask queue 即使是 0ms 的情况
   3.microtask queue 中的 task 会在事件循环的当前回合中执行，因此 macrotask queue 中的 task 就只能等到事件循环的下一个回合中执行了
   4.click ajax setTimeout 的回调是都是 task, 同时，包裹在一个 script 标签中的js代码也是一个 task 确切说是 macrotask。



##js运行有三样东西：task(macrotasks queue)，microtask(队列queue)，stacks(栈)==current running task(当前执行任务)
所以以上脚本执行后，先按照顺序，将脚本添加入任务队列中（macrotask,miscrotask）,然后再顺序取出，先将一个macrotask压入栈，执行之，
然后再将microtask的任务全部压入栈，一次执行，完成一次eventLoop，然后再执行下一次eventLoop;<br/>

具体执行过程：
 * 1.执行script标签，script为一个task(立即执行，因为script不为null)
 ```
  macrotask:[],microtask:[],stacks[script]
 ```
 * 2.执行script task过程，遇到了setTimeout
 ```
  macrotask:[setImmediate callback,setTimeout callback],microtask:[],stacks[script]
 ```
 * 3.继续执行script task过程，遇到了promise和promise.then(stack中立即执行同步任务，异步任务then,放到microtask中)
   <br/>输出`3,4`
 ````
  macrotask:[setImmediate callback,setTimeout callback],microtask:[promise.then,process.nextTick],stacks[script(加载promise(callback)中的callback)]
````
 *4.继续执行script task,遇到了console.log(6,8)
  <br/>输出3,4,6,8
  ```
 macrotask:[setImmediate callback,setTimeout callback],microtask:[promise.then,process.nextTick],stacks[script(加载console.log(6,8))]
```
 *5.执行完script task,一次性执行完microtask的任务,但是注意,process.nextTick一定比promise.then先执行，setTimeout也比setImmediate先执行
 <br/>输出3,,4,6,8,7,5
 ```
  macrotask:[setImmediate callback,setTimeout callback],microtask:[],stacks[promise.then,process.nextTick]
```
 *6.一次eventLoop结束，执行下一次macrotask任务，
 ```
 macrotask:[setImmediate callback],microtask:[],stacks[setTimeout callback]
 ```
  <br/>输出3,,4,6,8,7,5,2
 * 7.执行setTimout
 <br/>输出3,,4,6,8,7,5,2,1
