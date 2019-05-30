/**
* name 
*/
module game{
	import Texture = laya.resource.Texture;
	import Image = laya.ui.Image;

	export class PuzzleStatus implements AStarSearcherStatus{
		public parentStatus:PathSearcherStatus;
		// public data:number[]; // 矩阵数据
		public emptyIndex:number;

		// 评估函数
		public gValue:number;
		public hValue:number;
		public fValue:number;

		public children:PuzzleStatus[];

		/// 矩阵阶数
		public matrixOrder:number;

		/// 方块数组，按从上到下，从左到右，顺序排列
		public pieceArray:PuzzlePiece[];

		public freeMove:boolean;

		public constructor(){
			this.freeMove = false;
		}
		public static statusWithMatrixOrder(matrixOrder:number, image:Laya.Texture):PuzzleStatus{
			if (matrixOrder < 3 || !image) {
        		return null;
			}
			
			var status:PuzzleStatus = new PuzzleStatus();
			status.matrixOrder = matrixOrder;
			status.pieceArray = [];
			let max = matrixOrder * matrixOrder;
			// for (let i = 0; i < max; i++) {
			// 	status.pieceArray.push(0);
			// }
			status.emptyIndex = -1;
			
			let pieceImageWidth:number = image.sourceWidth / matrixOrder;
			let pieceImageHeight:number = image.sourceHeight / matrixOrder;
			let texture:Texture = image;
			var ID:number = 0;
			for (let row = 0; row < matrixOrder; row ++) {
				for (let col = 0; col < matrixOrder; col ++) {
					// 切割图片
					let textureRef:Texture = Texture.createFromTexture(texture, col * pieceImageWidth, row * pieceImageHeight, pieceImageWidth, pieceImageHeight);
					let imgRef:Image = new Image();
					imgRef.source = textureRef;
					
					var piece:PuzzlePiece = PuzzlePiece.pieceWithID(ID, textureRef);
					
					ID = ID + 1;
					status.pieceArray.push(piece);
				}
			}
			return status;
		}

		public numMode(mode:number){
			if(mode == 1) {
				this.pieceArray.forEach(e => {
					e.showNum();
				});
			}else {
				this.pieceArray.forEach(e => {
					e.clearNum();
				});
			}
		}
		/**
		 * 如果出现有数字不相等的就是不同
		 */
		public equals(node:PuzzleStatus):boolean {
			for(let i in this.pieceArray) {
				if (this.pieceArray[i].ID != node.pieceArray[i].ID) {
					return false;
				}
			}
			return true;
		}

		public statusIdentifier():string{
			var ret:string = "";
			this.pieceArray.forEach(e =>{
				ret += e.ID + "_";
			});

			return ret;
		}

		public setEmptyVisible(flag:boolean):void {
			let i = this.emptyIndex;
			this.pieceArray[i].visible = flag;
		}

		public shuffleCount(count:number):void {
			if (this.freeMove) { // 如果是随意移动模式就不再进行随机打乱
				return;
			}
			// 记录前置状态，避免来回移动
			// 前两个状态的空格位置
			let ancestorIndex:number = -1;
			// 前一个状态的空格位置
			let parentIndex:number = -1;
			while (count > 0) {
				let targetIndex:number = -1;
				switch (Math.floor(Math.random()*100) % 4) {
					case 0:
						targetIndex = this.up();
						break;
					case 1:
						targetIndex = this.down();
						break;
					case 2:
						targetIndex = this.left();
						break;
					case 3:
						targetIndex = this.right();
						break;
					default:
						break;
				}
				
				if (targetIndex != -1 && targetIndex != ancestorIndex) {
					this.moveToIndex(targetIndex);
					ancestorIndex = parentIndex;
					parentIndex = targetIndex;
					count --;
				}
			}
		}

		public copy():PuzzleStatus{
			var ret:PuzzleStatus = new PuzzleStatus();
			// ret.pieceArray = [];
			// for(let i in this.pieceArray){
			// 	ret.pieceArray.push()
			// }
			ret.pieceArray = this.pieceArray.slice(0, this.pieceArray.length);
			ret.emptyIndex = this.emptyIndex;
			ret.matrixOrder = this.matrixOrder;

			return ret;
		}

		public row(index:number):number {
			return Math.floor(index / this.matrixOrder);
		}

		public col(index:number):number {
			return index % this.matrixOrder;
		}

		// public exchange(emptyIndex:number, index:number):void {
		// 	let v:number = this.data[emptyIndex];
		// 	this.data[emptyIndex] = this.data[index];
		// 	this.data[index] = v;
		// }

		public moveToIndex(index:number):void {
			if (index < 0 || index >= this.pieceArray.length || this.emptyIndex < 0 || this.emptyIndex >= this.pieceArray.length) {
				console.log("error");
			}
			let temp:PuzzlePiece = this.pieceArray[this.emptyIndex];
			this.pieceArray[this.emptyIndex] = this.pieceArray[index];
			this.pieceArray[index] = temp;
			
			this.emptyIndex = index;
		}

		public up():number {
			if (this.row(this.emptyIndex) == 0) {
				return -1;
			}

			return this.emptyIndex - this.matrixOrder;
		}

		public down():number {
			if (this.row(this.emptyIndex) == this.matrixOrder - 1) {
				return -1;
			}

			return this.emptyIndex + this.matrixOrder;
		}

		public left():number {
			if (this.col(this.emptyIndex) == 0) {
				return -1;
			}

			return this.emptyIndex - 1;
		}

		public right():number {
			if (this.col(this.emptyIndex) == this.matrixOrder - 1) {
				return -1;
			}

			return this.emptyIndex + 1;
		}

				/// 空格是否能移动到某个位置
		public canMoveToIndex(index:number):boolean{
			if (this.freeMove) {
				return true;
			}
			// 能移动的条件是
			// 1.没有超出边界
			// 2.空格和目标位置处于同一行或同一列 且相邻
			let canRow:boolean = (this.row(this.emptyIndex) == this.row(index)) && 
						(Math.abs(this.col(this.emptyIndex) - this.col(index)) == 1);
			let canCol:boolean = (this.col(this.emptyIndex) == this.col(index)) && 
						(Math.abs(this.row(this.emptyIndex) - this.row(index)) == 1);
			
			return (canRow || canCol);
		}

		public childStatus():PathSearcherStatus[] {
			var  nodes:PuzzleStatus[] = [];
			let targetIndex = -1;
			if ((targetIndex = this.up()) != -1) {
				this.addChildStatusIndex(targetIndex, nodes);
			}
			if ((targetIndex = this.down()) != -1) {
				this.addChildStatusIndex(targetIndex, nodes);
			}
			if ((targetIndex = this.left()) != -1) {
				this.addChildStatusIndex(targetIndex, nodes);
			}
			if ((targetIndex = this.right()) != -1) {
				this.addChildStatusIndex(targetIndex, nodes);
			}
			return nodes;
		}

		public addChildStatusIndex(index:number, data:PuzzleStatus[]):void {
			// 排除父状态
			if (this.parentStatus != null && (<PuzzleStatus>this.parentStatus).emptyIndex == index) {
				// console.log(`是父节点，所以不能添加 `)
				return;
			}
			if (!this.canMoveToIndex(index)) {
				// console.log(`不相邻，所以不能添加 ${this.emptyIndex} -> ${index}`);
				return;
			}

			var node:PuzzleStatus = this.copy();
			node.moveToIndex(index);
			// console.log(`create child(${this.emptyIndex}-> ${index}) -> ${node.statusIdentifier()}`);
			data.push(node);
			node.parentStatus = this;
		}

		/// 估算从当前状态到目标状态的代价
		public estimateToTargetStatus(targetStatus:PathSearcherStatus):number {	
			let target:PuzzleStatus = <PuzzleStatus>targetStatus;
			// 计算每一个方块距离它正确位置的距离
			// 曼哈顿距离
			var manhattanDistance:number = 0;
			for (let index = 0; index < this.pieceArray.length; ++ index) {
				// 略过空格
				if (index == this.emptyIndex) {
					continue;
				}
				
				let currentID:number = this.pieceArray[index].ID;
				let targetID:number = target.pieceArray[index].ID;
				
				manhattanDistance +=
					Math.abs(this.row(currentID) - this.row(targetID)) +
					Math.abs(this.col(currentID) - this.col(targetID));
			}
			
			// 增大权重
			return 5 * manhattanDistance;
		}
	}

}