/**
* 实现一个key value 数据结构
*/
module game{
	export class Map<T>{
		private data:{[key:string]:T} = {};
		
		public put(key:number|string, value:T):void {
			this.data[key] = value;
		}

		public get(key:string|number):T {
			return this.data[key];
		}

		public remove(key:string):T {
			let ret = this.get(key);

			this.data[key] = null;

			return ret;
		}

		public foreach(handler:Function):void{
			for(let key in this.data) {
				handler(key, this.data[key]);
			}
		}
	}
}