let sharedCanvas = wx.getSharedCanvas()

function drawRankList (data) {
  data.forEach((item, index) => {
    console.log("item " + item);
  })
}

wx.getFriendUserGameData({
  success: res => {
    let data = res.data
    drawRankList(data)
  }
})

let context = sharedCanvas.getContext('2d')
context.fillStyle = 'red';
context.fillRect(0, 0, 100, 100);

wx.onMessage(data => {
  console.log(data)
  let context = sharedCanvas.getContext('2d')
    context.fillStyle = 'red';
    context.fillRect(0, 0, 400, 100);
    let img = wx.createImage();
    img.src = "res/play01.png";
    context.drawImage(img, 100, 100);
  /* {
    text: 'hello',
    year: 2018
  } */
})