self.addEventListener('message', function (e/*MessageEvent*/) {
   // var data = e.data;
   // var ret = data[0] + data[1]
    self.postMessage("worker success->" + e.data);
}, false);