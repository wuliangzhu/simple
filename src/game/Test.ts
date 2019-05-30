/**
* name 
*/

module game{
	export class Test{
		constructor(){

		}

		public postShowFriends():void {
			// console.log("post show friends:" + gs.testWx);
			// gs.testWx();
			if (typeof wx != "undefined") {
				let openDataContext = wx.getOpenDataContext();
				openDataContext.postMessage({
					text: 'hello',
					year: (new Date()).getFullYear()
				})
			}
			
		}
	}
}