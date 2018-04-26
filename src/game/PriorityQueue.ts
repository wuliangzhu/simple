/**
* name 
*/
module game{
	export class PriorityQueue<T>{
		public static OrderedDescending:number = 1;
		public static OrderedSame:number = 0;
		public static OrderedAscending:number = -1;

		constructor(){
			this.init();
		}

			/// 队列数据
		public data:T[];
		public comparator:Function;
	/// 尾元素位置
		get tailIndex():number{
			return this.data.length - 1;
		}


		get count():number {
			return this.data.length - 1;
		}

		private init():void {
			this.data = [null];
		}

		public static queueWithComparator(handler:Function):PriorityQueue<any> {
			return this.queueWithData(null, handler);
		}

		public static queueWithData(data:any[], comparator:Function):PriorityQueue<any> {
			var instance:PriorityQueue<any> = new PriorityQueue<any>();
			if (data) {
				instance.data = data.slice(0, data.length);
			}
			instance.comparator = comparator;

			return instance;
		}

		public enQueue(element:T):void {
			// 添加到末尾
			this.data.push(element);
			
			// 上游元素以维持堆有序
			this.swimIndex(this.tailIndex);
		}

		public deQueue():T {
			if (this.count == 0) {
				return null;
			}
			// 取根元素
			var element:T = this.data[1];
			// 交换队首和队尾元素
			this.swapIndexA(1, this.tailIndex);

			this.data.pop();
			
			if (this.data.length > 1) {
				// 下沉刚刚交换上来的队尾元素，维持堆有序状态
				this.sinkIndex(1);
			}
			return element;
		}

		/// 交换元素
		public swapIndexA(indexA:number, indexB:number):void {
			var temp:T = this.data[indexA];
			this.data[indexA] = this.data[indexB];
			this.data[indexB] = temp;
		}

		/// 上游，传入需要上游的元素位置，以及允许上游的最顶位置
		public swimIndex(index:number):void {
			// 暂存需要上游的元素
			var temp = this.data[index];
			
			// parent的位置为本元素位置的1/2
			for (let parentIndex = Math.floor(index / 2); parentIndex >= 1; parentIndex = Math.floor(parentIndex/2)) {
				// 上游条件是本元素大于parent，否则不上游
				if (this.comparator(temp, this.data[parentIndex]) != PriorityQueue.OrderedDescending) {
					break;
				}
				// 把parent拉下来
				this.data[index] = this.data[parentIndex];
				// 上游本元素
				index = parentIndex;
			}
			// 本元素进入目标位置
			this.data[index] = temp;
		}

		/// 下沉，传入需要下沉的元素位置，以及允许下沉的最底位置
		public sinkIndex(index:number):void {
			// 暂存需要下沉的元素
			var temp:T = this.data[index];
			
			// maxChildIndex指向最大的子结点，默认指向左子结点，左子结点的位置为本结点位置*2
			for (let maxChildIndex = index * 2; maxChildIndex <= this.tailIndex; maxChildIndex *= 2) {
				// 如果存在右子结点，并且左子结点比右子结点小
				if (maxChildIndex < this.tailIndex && (this.comparator(this.data[maxChildIndex], this.data[maxChildIndex + 1]) == PriorityQueue.OrderedAscending)) {
					// 指向右子结点
					maxChildIndex = maxChildIndex + 1;
				}
				// 下沉条件是本元素小于child，否则不下沉
				if (this.comparator(temp, this.data[maxChildIndex]) != PriorityQueue.OrderedAscending) {
					break;
				}
				// 否则
				// 把最大子结点元素上游到本元素位置
				this.data[index] = this.data[maxChildIndex];
				// 标记本元素需要下沉的目标位置，为最大子结点原位置
				index = maxChildIndex;
			}
			// 本元素进入目标位置
			this.data[index] = temp;
		}

		public fetchData():T[] {
			return this.data.slice(-1, this.tailIndex);
		}

		public clearData():void {
			this.data = [];
		}

		public logDataWithMessage():string {
			let str:string = "";
			this.data.forEach(e =>{
				str += "," + e
			})
			console.log(str)

			return str;
		}

	}
}