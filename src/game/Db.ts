/**
* name 
*/
module game{
	import LocalStore = Laya.LocalStorage;
	export class Db{
		constructor(){

		}

		public static saveJson(key:string, value:Object):void {
			LocalStore.setJSON(key, value);
		}

		public static loadJson(key:string):Object {
			return LocalStore.getJSON(key);
		}

		public static saveKey(key:string, value:string):void {
			LocalStore.setJSON(key, value);
		}

		public static getValue(key:string):string {
			return LocalStore.getJSON(key);
		}

		public static setCloudJson(kv:Object):void{
			if (this.isWX()) {
				let data = [];
				for (let i in Object) {
					data.push({key:i, value:Object[i]});
				}
				let obj = Db.cloudDataObject();
				obj.KVDataList = data;
				wx.setUserCloudStorage(obj);
				// wx.setUserCloudStorage({"KVDataLIst":data, "success":function(){

				// }, "fail":function(){

				// }, "complete":function(){

				// }})
			}
		}
		public static cloudDataObject():any {
			var obj = {};
			obj["KVDataList"] = [];
			obj["success"] = function(e){
				console.log("success" + e);
			}
			obj["fail"] = function (e) {
				console.log("success" + e);
			}

			obj["complete"] = function(e) {
				console.log("success" + e);
			}

			return obj;
		}

		public static showShareMenu():void {

		}

		public static isWX():boolean {
			return typeof wx != "undefined";
		}


	}
}