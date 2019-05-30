
declare module wx{
    function getOpenDataContext():any;
    /**
     * KVData
        属性
        string key
        数据的 key

        string value
        数据的 value
     * @param data 属性 KVDataList KV[], success fail complete
     */
    function setUserCloudStorage(data:any):void;
    function getUserCloudStorage(data:any):any

    /**
     * 返回UserGameData[]
     * string avatarUrl
        用户的微信头像 url

        string nickname
        用户的微信昵称

        string openid
        用户的 openid

        Array.<KVData> KVDataList
     * @param data keyList	Array.<string>	就是你要获取哪些key
     */
    function getFriendCloudStorage(data:any):void
    /**
     * 显示当前页面的转发按钮
     * 属性
     * withShareTicket 是否使用带 shareTicket 的转发详情
     * success fail complete [function]
     * @param data 
     */
    function showShareMenu(data:Object):void;

    /**
     * 
     */
    function getSystemInfoSync():any;

    /**
     * 使用 Canvas 内容作为转发图片
        如果不指定转发图片，默认会显示一个小程序的 logo。如果希望转发的时候显示 Canvas 的内容，可以使用 Canvas.toTempFilePath() 或 Canvas.toTempFilePathSync() 来生成一张本地图片，然后把图片路径传给 imageUrl 参数。

        转发出来的消息卡片中，图片的最佳显示比例是 5：4。

        wx.onShareAppMessage(function () {
        return {
            title: '转发标题',
            imageUrl: canvas.toTempFilePathSync({
            destWidth: 500,
            destHeight: 400
            })
        }
        })
     * 被动转发
        用户点击右上角菜单中的“转发”选项后，会触发转发事件，如果小游戏通过 wx.onShareAppMessage() 监听了这个事件，可通过返回自定义转发参数来修改转发卡片的内容，否则使用默认内容。

        wx.onShareAppMessage(function () {
        // 用户点击了“转发”按钮
        return {
            title: '转发标题'
        }
        })
     * @param para 
     */
    function onShareAppMessage(para:any):void;

    /**
     * 
        游戏内可通过 wx.shareAppMessage()接口直接调起转发界面，与被动转发类似，可以自定义转发卡片内容。

        wx.shareAppMessage({
        title: '转发标题'
        })
     ** @param para 主动转发
     */
    function shareAppMessage(para:any):void
} 