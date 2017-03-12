/**
 * Created by Administrator on 2017/3/1.
 */

setImmediate(function(){
    console.log(1);
},0);

setTimeout(function(){
    console.log(2);
},0);

new Promise(function(resolve){
    //primise(A).then(B),A执行完，才执行B，所以A是同步的，就跟在外部console.log(6),执行一样
    console.log(3);
    resolve();
    console.log(4);
}).then(function(){
        console.log(5);
    });
console.log(6);
process.nextTick(function(){
    console.log(7);
});

console.log(8);

//输出 3 4 6 8 7 5 2 1




