/**
* name 
* 1 拼图操作界面；
* 2 图片选择界面；
*/
 module game{
	import Sprite = Laya.Sprite;
	import Button = Laya.Button;
	import Image = Laya.Image;

	export class PuzzleApp{
		static instance:PuzzleApp;
		private imgs:string[];
		private imgsStatus:{[key:string]:number};
		private imgId:number;
		private mode:number; // 0 number 1 image
		private img:Laya.Sprite;

		// ui
		private mainPanel:Sprite;

		private skins:string[];

		private currentStatus:PuzzleStatus;
		private completedStatus:PuzzleStatus;

		constructor(){
			game.EventBus.bus.once(Event.GAME_INIT, this, this.init);

			game.EventBus.bus.on(Event.GAME_LOOP, this, this.loop);

			game.EventBus.bus.on(Event.PLAYER_INPUT, this, this.handleInput);

			// EventBus.bus.on(Event.GAME_ENTER_SCENE, this, this.enterScene);
		}

		public static startApp():void {
			PuzzleApp.instance = new PuzzleApp();
			PuzzleApp.instance.config();
		}

		private config():void {
			game.GameConfig.NEED_MAP = false;
			game.GameConfig.NEED_LOOP = false;
			game.GameConfig.NEED_WORKER = false;
		}

		public init():void {
			console.log("game app init");
			this.mainPanel = new Sprite();
			this.imgs = ["res/img/img001.png", "res/img/img002.png", "res/img/img003.png"];
			this.imgsStatus = {};

			this.skins = ["res/add.png", "res/user.png", "res/star.png", "../laya/assets/comp/button.png"];
			Laya.loader.load(this.skins, Handler.create(this, this.uiSkinLoaded));
			
			this.img = new Laya.Sprite();
			// this.img.on(Laya.Event.LOADED, this, this.showImg);

			this.changeImg(this.imgs[0]);
			this.imgId = 0;
			this.mode = 0;

			this.mainPanel.pivot(256, 256);
			this.mainPanel.pos(300, 300);
			Laya.stage.addChild(this.mainPanel);

			// load the 存档，如果有就加载:order emptyIndex [ids]
			let record = Db.loadJson("puzzle");
			if (record) {
				let order:number = record["order"];
				let emptyIndex:number = record["emptyIndex"];
				let ids:[number] = record["ids"];
				let imgId = record["imageId"];

				let caller = this;
				this.mainPanel.graphics.loadImage(this.imgs[imgId],0, 0, 0, 0, function(){
					caller.handleRecord(record);
				});

				
			}
			
		}

		/**
		 * 对游戏进行存档
		 */
		private saveRecord():void {
			let record:Object = {}
			record["order"] = this.currentStatus.matrixOrder;
			record["emptyIndex"] = this.currentStatus.emptyIndex;
			record["imageId"] = this.imgId;
			record["ids"] = [];
			for (let piece of this.currentStatus.pieceArray) {
				record["ids"].push(piece.ID);
			}

			Db.saveJson("puzzle", record);
		}

		private handleRecord(record:Object):void {
			let order:number = record["order"];
			let emptyIndex:number = record["emptyIndex"];
			let imgId:number = record["imageId"];
			let ids:[number] = record["ids"];

			this.imgId = imgId;
			this.mainPanel.graphics.loadImage(this.imgs[this.imgId]);

			this.makePuzzle(order);

			this.currentStatus.emptyIndex = emptyIndex;
			// 把currentStatus 移动到 存档状态
			let old:PuzzleStatus = this.currentStatus.copy();
			for (let i in ids) {
				old.pieceArray[i] = this.currentStatus.pieceArray[ids[i]];
			}

			this.currentStatus = old;

			this.renderStatus(this.currentStatus);
		}

		/**
		 * button 默认是 三态，所以需要3张图，图小就会分割成小的
		 * 
		 */
		private uiSkinLoaded():void {
			console.log("ui skin loaded")
			var button:Button = new Button(this.skins[3]);
			// button.width = 32;
			// button.height = 32;
			button.pos(Laya.stage.width - 100, Laya.stage.height - 40);
			button.label = "换图";
			button.on(Laya.Event.CLICK, this, e => {
				this.imgId = this.imgId + 1;
				this.imgId = this.imgId % this.imgs.length;
				this.changeImg(this.imgs[this.imgId]);
			})
			Laya.stage.addChild(button);

			var button2:Button = new Button(this.skins[3]);
			// button.width = 32;
			// button.height = 32;
			button2.pos(Laya.stage.width - 180, Laya.stage.height - 40);
			button2.label = "开始拼图";
			button2.on(Laya.Event.CLICK, this, e => {
				// this.changeImg(this.imgs[this.imgId]);
				this.makePuzzle(5);
			});
			Laya.stage.addChild(button2);

			var button3:Button = new Button(this.skins[3]);
			// button.width = 32;
			// button.height = 32;
			button3.pos(Laya.stage.width - 260, Laya.stage.height - 40);
			button3.label = "打乱";
			button3.on(Laya.Event.CLICK, this, e => {
				this.currentStatus.shuffleCount(20);
				this.renderStatus(this.currentStatus);
			});
			Laya.stage.addChild(button3);

			//==========================自动拼图============================
			var button4:Button = new Button(this.skins[3]);
			// button.width = 32;
			// button.height = 32;
			button4.pos(Laya.stage.width - 340, Laya.stage.height - 40);
			button4.label = "自动";
			button4.on(Laya.Event.CLICK, this, e => {
				this.testPuzzle(this.currentStatus, this.completedStatus);
				
			});
			Laya.stage.addChild(button4);

			//==========================自动拼图============================
			var button5:Button = new Button(this.skins[3]);
			// button.width = 32;
			// button.height = 32;
			button5.pos(Laya.stage.width - 420, Laya.stage.height - 40);
			button5.label = "显示数字";
			button5.on(Laya.Event.CLICK, this, e => {
				this.mode = 1 - this.mode;
				if (this.mode == 1) {
					e.target.label = "隐藏数字";
				}else {
					e.target.label = "显示数字";
				}

				this.currentStatus.numMode(this.mode);
				this.mainPanel.repaint();
				
			});
			Laya.stage.addChild(button5);
		}

		/**
		 *  切换使用哪一张图
		 */
		private changeImg(path:string):void {
			this.mainPanel.graphics.clear();
			this.mainPanel.removeChildren();
			this.mainPanel.graphics.loadImage(path);
		}

		/**
		 * 通过ID 与 empty进行交换
		 * @param e 
		 */
		private movePiece(e):void {
			let t:PuzzlePiece = <PuzzlePiece>e.target;
			let i:number = this.currentStatus.pieceArray.indexOf(t);
			if (this.currentStatus.canMoveToIndex(i)) {
				this.currentStatus.moveToIndex(i);
				this.renderStatus(this.currentStatus);

				this.saveRecord();
			}
			
		}
		/**
		 * 利用图片分割，生成操作块
		 */
		private makePuzzle(order:number):void {
			var texture:Laya.Texture = Laya.loader.getRes(this.imgs[this.imgId]);
			this.currentStatus = PuzzleStatus.statusWithMatrixOrder(order, texture);
			this.completedStatus = this.currentStatus.copy();

			var pieces:PuzzlePiece[] = this.currentStatus.pieceArray;
			this.mainPanel.graphics.clear();
			for (let i = 0; i < pieces.length; i++) {
				let c = i % this.currentStatus.matrixOrder;
				let r = (i - c)/ this.currentStatus.matrixOrder;

				let p:PuzzlePiece = pieces[i];
				// p.scale(0.5, 0.5);
				if (i == 0) {
					// p. = true;
				}	
				p.pos(((p.width) + 1) * c, ((p.height) + 1) * r);

				p.on(Laya.Event.CLICK, this, this.movePiece);
				
				this.mainPanel.addChild(p);
			}
			console.log("current status:" + this.currentStatus.statusIdentifier());
			this.currentStatus.emptyIndex = 0;
			this.completedStatus = this.currentStatus.copy();
			
			console.log("shuffle after status:" + this.currentStatus.statusIdentifier())
		}

		private renderStatus(status:PuzzleStatus):void {
			var pieces:PuzzlePiece[] = status.pieceArray;
			this.mainPanel.graphics.clear();
			for (let i = 0; i < pieces.length; i++) {
				let c = i % status.matrixOrder;
				let r = (i - c)/ status.matrixOrder;

				let p:PuzzlePiece = pieces[i];
				// p.scale(0.5, 0.5);
				// if (i == 0) {
				// 	p.gray = true;
				// }	
				let x = ((p.width + 1)) * c;
				let y = ((p.height + 1)) * r;
				Laya.Tween.to(p, {"x":x, "y":y}, 250, Laya.Ease.linearNone);
			}
		}

		private testPuzzle(currentStatus:PuzzleStatus, completedStatus:PuzzleStatus):void {
			var searcher:AStar = new AStar();
			searcher.startStatus = currentStatus.copy();
			searcher.targetStatus = completedStatus.copy();
			// searcher.equalComparator = function(){

			// }
			// searcher setEqualComparator:^BOOL(PuzzleStatus *status1, PuzzleStatus *status2) {
			// 	return [status1 equalWithStatus:status2];
			// }];
			// 开始搜索
			var time:Date = new Date();
			var path:PuzzleStatus[] = searcher.search();
			var pathCount:number = path.length;
			console.log("耗时：秒" + (time.getMilliseconds() - new Date().getMilliseconds()));
			console.log("需要移动：数量->" + pathCount);
			var index = 0;
			
			for (let i = 1; i < path.length; i++) {
				Laya.timer.once(1000 * (i-1), this, e =>{
					this.renderStatus(path[i]);
				});
			}
		}

		public loop():void {

		}

		public handleInput(key):void {

		}

	}
}