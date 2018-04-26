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
	}
}