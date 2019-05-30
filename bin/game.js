require("weapp-adapter.js");
require("code.js");

// var button = wx.createUserInfoButton({
//     type: 'text',
//     text: '获取用户信息',
//     style: {
//         left: 10,
//         top: 76,
//         width: 200,
//         height: 40,
//         lineHeight: 40,
//         backgroundColor: '#ff0000',
//         color: '#ffffff',
//         textAlign: 'center',
//         fontSize: 16,
//         borderRadius: 4
//     }
// })
// button.show();
// button.onTap((res) => {
//     console.log(res)
// })
wx.showShareMenu({withShareTicket:true, success:function(){
    console.log("show share menu success");
}, complete:function(){
    console.log("show share menu complete");
}});

let openDataContext = wx.getOpenDataContext();
let sharedCanvas = openDataContext.canvas;

// let canvas = wx.createCanvas()
console.log("============================");
console.log("============" + sharedCanvas);
var context = canvas.getContext('2d');
context.fillStyle = 'red';

context.fillRect(0, 0, 100, 100);
// let context = canvas.getContext('2d');
// var tst = new Laya.Sprite();
// tst.loadImage("res/play01.png");
// Laya.stage.addChild(tst);

var gs = {}
gs.testWx = function() {
    console.log("test=======================success!!");
}

// 向开放数据域发送消息
openDataContext.postMessage({
  text: 'hello',
  year: (new Date()).getFullYear()
})

let updateView = function() {
    if (updateViewImpl) {
        updateViewImpl();
    }

    requestAnimationFrame(updateView);
}

let updateViewImpl = function(){
    context.drawImage(sharedCanvas, 0, 0);
}
// 只有循环调用才能显示出来
requestAnimationFrame(updateView)
wx.onTouchEnd(function(e){
    let touches = e.touches;
    let target = e.target;
    console.log("touch end:" + target);
    if(touches.length == 1) {
        cancelAnimationFrame(updateView);
    }
});