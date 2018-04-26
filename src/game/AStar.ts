/**
* A*算法，利用广度搜索，加上评价函数进行索索
*/
module game{
	import PriorityQueue = game.PriorityQueue;

	import Texture = laya.resource.Texture;
	import Image = laya.ui.Image;

	
	export class AStar{
		constructor(){

		}
		public startStatus:PuzzleStatus;
		public targetStatus:PuzzleStatus;

		public equalComparator(node1:PuzzleStatus, node2:PuzzleStatus):boolean{
			return node1.equals(node2);
		}

		public constructPathWithStatus(status:PathSearcherStatus, isLast:boolean):Array<any> {
			var path:Array<any> = [];
			if (!status) {
				return path;
			}
			
			do {
				if (isLast) {
					path.unshift(status);
				}
				else {
					path.push(status);
				}
				status = status.parentStatus;
			} while (status);

			return path;
		}

		public search():PuzzleStatus[] {
			if (!this.startStatus || !this.targetStatus || !this.equalComparator) {
				return null;
			}

			var path:Array<PuzzleStatus> = [];

			this.startStatus.gValue = 0;
			
			// 关闭堆，存放已搜索过的状态
			let close:{[key:string]:PuzzleStatus} = {};
			// 开放队列，存放由已搜索过的状态所扩展出来的未搜索状态
			// 使用优先队列
			var open:PriorityQueue<any> = PriorityQueue.queueWithComparator(function(obj1:PuzzleStatus, obj2:PuzzleStatus) {
				if (obj1.fValue == obj2.fValue) {
					return PriorityQueue.OrderedSame;
				}
				// f值越小，优先级越高
				return obj1.fValue < obj2.fValue ? PriorityQueue.OrderedDescending : PriorityQueue.OrderedAscending;
			});
			
			open.enQueue(this.startStatus);
			
			while (open.count > 0) {
				// 出列
				var status:PuzzleStatus = open.deQueue();
				
				// 排除已经搜索过的状态
				let statusIdentifier:string = status.statusIdentifier();
				if (close[statusIdentifier]) {
					continue;
				}
				close[statusIdentifier] = status;
				
				// 如果找到目标状态
				if (this.equalComparator(this.targetStatus, status)) {
					path = this.constructPathWithStatus(status,true);
					break;
				}
				
				// console.log(`start add childstatus: ${status.statusIdentifier()}`);
				// 否则，扩展出子状态
				var childStatus:AStarSearcherStatus[] = <AStarSearcherStatus[]>status.childStatus();
				// console.log(`end add childstatus: has ${childStatus.length} child`);
				// 对各个子状进行代价估算
				childStatus.forEach(obj => {
					// 子状态的实际代价比本状态大1
					obj.gValue = status.gValue + 1;
					// 估算到目标状态的代价
					obj.hValue = obj.estimateToTargetStatus(this.targetStatus);
					// 总价=已知代价+未知估算代价
					obj.fValue = obj.gValue + obj.hValue;
					// console.log(`fvalue === ${obj.fValue} @ ${obj.statusIdentifier()}`);
					// 入列
					open.enQueue(obj);
				});
			}
			let counter:number = 0;
			for (let k in close) {
				counter = counter + 1;
			}
			// console.log(`总共搜索:${counter} 个状态`);
			return path;
		}

	}
}