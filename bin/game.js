require("weapp-adapter.js");
require("code.js");

var button = wx.createUserInfoButton({
    type: 'text',
    text: '获取用户信息',
    style: {
        left: 10,
        top: 76,
        width: 200,
        height: 40,
        lineHeight: 40,
        backgroundColor: '#ff0000',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        borderRadius: 4
    }
})
button.show();
button.onTap((res) => {
    console.log(res)
})

let openDataContext = wx.getOpenDataContext()
let sharedCanvas = openDataContext.canvas

let canvas = wx.createCanvas()
let context = canvas.getContext('2d')

context.drawImage(sharedCanvas, 0, 0);

