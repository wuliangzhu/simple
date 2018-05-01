/**
* name 
* 1 拼图操作界面；
* 2 图片选择界面；
*/
 module game{
	import Sprite = Laya.Sprite;
	import Button = Laya.Button;
	import Image = Laya.Image;
	import TimeLine = Laya.TimeLine;

	class Record{
		public imageId:number;
		public emptyIndex:number;
		public order:number;
		public ids:number[];
		constructor(){
			this.imageId = 0;
			this.emptyIndex = 0;
			this.order = 3;
			this.ids = [];
		}

	}

	/**
	 * 利用orderNum*100/usedTime*stepNum 
	 */
	class Ladder{
		public score:number;

		constructor(){
			this.score = 0;
		}

		public static calculate(order:number, usedTime:number, stepNum:number):number {
			if (usedTime == 0 || stepNum == 0) {
				return -1;
			}
			let score = Math.pow(order, 4) * 12345/usedTime/stepNum;
			score = Math.ceil(score);
			if (score < 100) {
				score = 100;
			}

			return score;
		}

	}
	export class PuzzleApp{
		static instance:PuzzleApp;
		private imgs:string[];
		private imgsStatus:{[key:string]:number};
		private imgId:number;
		private mode:number; // 0 number 1 image 是显示图片，还是用数字模式
		private img:Laya.Sprite;

		// ui
		private bgColors:string[];
		private mainPanel:Sprite;
		private background:Sprite;

		private foreground:Sprite; // 处理idle的情况
		private processStatus:Label;

		private mouseDownPoint:Laya.Point;

		private startTime:number;
		private usedTime:number;
		private stepNum:number;
		private static IDLE:number = 1;
		private static PLAY:number = 2;
		private static SUCCESS:number = 3;
		private gameState:number; // 0 idle 1 play 2 success


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
			game.GameConfig.NEED_LOOP = true;
			game.GameConfig.NEED_WORKER = false;
		}

		public init():void {
			console.log("game app init " + Laya.stage.height);

			this.mainPanel = new Sprite();
			this.imgs = ["res/img/img001.png", "res/img/img002.png", "res/img/img003.png"];
			this.imgsStatus = {};

			this.skins = ["res/add.png", "res/user.png", "res/star.png", "res/play01.png"];

			this.bgColors = ["#758796", "#495d73", "#87797f", "#5c4d54", "#839187", "#59685d"];
			
			this.img = new Laya.Sprite();
			// this.img.on(Laya.Event.LOADED, this, this.showImg);
			this.imgId = Math.floor(Math.random() * 100) % 3;
			this.changeImg(this.imgs[this.imgId]);
			
			this.mode = 0;
			this.gameState = PuzzleApp.IDLE;
			// this.showLadderList();
			Laya.loader.load(this.skins);
			Laya.loader.load(this.imgs, Handler.create(this, e => {
				
			}));

			// wx api

			Laya.timer.frameOnce(3, this, e =>{
				this.paintUI();
				this.gotoIdleState();
				this.uiSkinLoaded();
			})
		}
		
		/**
		 * 资源加载完成之后再绘制，否则可能出现Laya.stage
		 */
		private paintUI():void {
			this.paintBg();

			this.mainPanel.pivot(256, 256);
			this.mainPanel.pos(300, 300);
			Laya.stage.addChild(this.mainPanel);

			// load the 存档，如果有就加载:order emptyIndex [ids]
			// this.loadRecord();

			this.addForground();

			this.addProgressStatus();
		}
		/**
		 * 1 进入随机一个页面
		 * 2 随机打乱；
		 * 3 自动还原
		 */
		private gotoIdleState() {
			this.changeState(PuzzleApp.IDLE);
			this.foreground.removeChildren();

			let record:Record = new Record();
			record.emptyIndex = 0;
			record.imageId = Math.floor(Math.random() * 100) % 3;
			record.order = 3;
			for(let i = 0; i < record.order * record.order; i++) {
				record.ids.push(i);
			}


			this.handleRecord(record);

			this.showLadderList();

			Laya.timer.once(3000, this, this.idleHandle, [20]);
		}

		private paintBg():void {
			this.background = new Sprite();
			this.background.width = Laya.stage.width;
			this.background.height = Laya.stage.height;
			this.background.pivot(this.background.width>>1, this.background.height>>1);
			this.background.pos(this.background.width>>1, this.background.height>>1);
			
			Laya.stage.addChild(this.background);

			let rand:number = Math.floor(Math.random() * 100) % 3;
		
			let i = rand << 1;
			let c:string = this.bgColors[i];
			let c2:string = this.bgColors[i + 1];

			let height = Laya.stage.height * 0.8;
			console.log(`bg pos ${Laya.stage.height} ${height}`);
			this.background.graphics.drawRect(0, 0, Laya.stage.width, height, c);
			this.background.graphics.drawRect(0, Laya.stage.height * 0.8, Laya.stage.width, Laya.stage.height*0.2, c2);
		}

		private addForground():void {
				// add foreground
			this.foreground = new Sprite();
			this.foreground.width = Laya.stage.width;
			this.foreground.height = Laya.stage.height;
			// this.foreground.graphics.drawRect(0, 0, this.foreground.width, this.foreground.height, "#0");
			// this.foreground.alpha = 0.3;
			Laya.stage.addChild(this.foreground);
		}

		/**
		 * 1 选择难度；
		 * 2 每个难度对应 3，4，5 介的维度
		 * 3 crazy 采用图片的5个维度
		 */
		private showLadderList():void {
			var config:Object[] = [{"text":"easy", "img":"res/play01.png", "order":3},
				 {"text":"normal", "img":"res/play01.png", "order":4}, 
				 {"text":"hard", "img":"res/play01.png", "order":5}];

				 for (var index = 0; index < config.length; index++) {
					 let element = config[index];
					 var button:Button = new Button(null, element["text"]);
					 button.loadImage(element["img"]);
					 button.pivot(185>>1, 45>>1);
					 button.pos(Laya.stage.width>>1, (Laya.stage.height>>1)  - 100 + index * 60);
					 console.log("add button:" + element["text"]);
					 button.on(Laya.Event.CLICK, this, this.gotoPlay, [element["order"]]);

					 this.foreground.addChild(button);
				 }
		}

		/**
		 * 选择难度，给用户显示目标，但不打乱
		 * @param order 
		 */
		private gotoPlay(order:number):void {
			this.usedTime = 0;
			this.stepNum = 0;
			this.stopIdle();
			this.mainPanel.removeChildren();
			this.foreground.removeChildren();
			// 开始游戏 根据参数生成
			this.makePuzzle(order);
			
			this.renderStatus(this.currentStatus);

			this.addStartButton();
		}

		private startPlay():void {
			// 让用户可以操作，并且去掉顶角一个，开始打乱
			let timeLine:TimeLine = new TimeLine();
			this.startTime = new Date().getTime();
			this.usedTime = 0;
			this.stepNum = 0;
			
			
			let e = this.currentStatus.pieceArray[this.currentStatus.emptyIndex];
			timeLine.addLabel("idle", 0)
				.addLabel("disEmpty", 0).to(e, {alpha:0},100, Laya.Ease.linearOut);

			timeLine.on(Laya.Event.COMPLETE, this, e => {
				this.currentStatus.setEmptyVisible(false);

				this.currentStatus.shuffleCount(100);
				this.bindEvent();
							
				this.renderStatus(this.currentStatus);
				this.changeState(PuzzleApp.PLAY);
			});

			timeLine.play(0, false);
		}

		/**
		 * 添加开始按钮
		 */
		private addStartButton():void {
			let start:Sprite = new Sprite();
			start.loadImage("res/play01.png");
			start.pivot(185>>1, 45>>1);
			start.pos(Laya.stage.width>>1, 300);
			start.on(Laya.Event.MOUSE_DOWN, this, e =>{
				start.loadImage("res/play02.png");
			});
			start.on(Laya.Event.MOUSE_UP, this, e => {
				start.loadImage("res/play01.png");

				// this.stopIdle();

				// this.foreground.visible = false;
				// // 开始游戏 直接打乱，开始玩
				// this.currentStatus.shuffleCount(100);
				// this.renderStatus(this.currentStatus);

				this.startPlay();
				this.foreground.visible = false;
			});

			this.foreground.addChild(start);
		}

		/**
		 * 1 用时；2 用了多少步；3 排行先进行难度排行，然后进行时间排行，最后才是步数排行
		 */
		private addProgressStatus():void {
			// add progressStatus
			this.processStatus = new Label("进度");
			this.processStatus.fontSize = 30;
			this.processStatus.align = "center";
			this.processStatus.width = Laya.stage.width;
			this.processStatus.height = 40;
			this.processStatus.pivot(Laya.stage.width>>1, 20);
			this.processStatus.pos(Laya.stage.width>>1, 20);
			this.background.addChild(this.processStatus);

			this.processStatus.visible = false;
		}

		private loadRecord():Ladder {
			// let record = Db.loadJson("puzzle");
			// if (record) {
			// 	let order:number = record["order"];
			// 	let emptyIndex:number = record["emptyIndex"];
			// 	let ids:[number] = record["ids"];
			// 	let imgId = record["imageId"];

			// 	let caller = this;
			// 	this.mainPanel.graphics.loadImage(this.imgs[imgId],0, 0, 0, 0, function(){
			// 		caller.handleRecord(record);
			// 	});	
			// }
			let ladder = Db.loadJson("score");

			return <Ladder>ladder;
		}

		private changeState(state:number):void {
			this.gameState = state;
			if (state != PuzzleApp.PLAY) {
				this.processStatus.visible = false;
			}else {
				this.processStatus.visible = true;
			}
			console.log("change to game state:" + state);
		}

		

		/**
		 * 对游戏进行存档
		 */
		private saveRecord(score:number):void {
			// let record:Object = {}
			// record["order"] = this.currentStatus.matrixOrder;
			// record["emptyIndex"] = this.currentStatus.emptyIndex;
			// record["imageId"] = this.imgId;
			// record["ids"] = [];
			// for (let piece of this.currentStatus.pieceArray) {
			// 	record["ids"].push(piece.ID);
			// }
			var ladder:Ladder = new Ladder();
			ladder.score = score;

			Db.saveJson("score", score);
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
			// var button:Button = new Button(this.skins[3]);
			// // button.width = 32;
			// // button.height = 32;
			// button.pos(Laya.stage.width - 100, Laya.stage.height - 40);
			// button.label = "换图";
			// button.on(Laya.Event.CLICK, this, e => {
			// 	this.imgId = this.imgId + 1;
			// 	this.imgId = this.imgId % this.imgs.length;
			// 	this.changeImg(this.imgs[this.imgId]);
			// })
			// Laya.stage.addChild(button);

			// var button2:Button = new Button(this.skins[3]);
			// // button.width = 32;
			// // button.height = 32;
			// button2.pos(Laya.stage.width - 180, Laya.stage.height - 40);
			// button2.label = "开始拼图";
			// button2.on(Laya.Event.CLICK, this, e => {
			// 	// this.changeImg(this.imgs[this.imgId]);
			// 	this.makePuzzle(5);
			// });
			// Laya.stage.addChild(button2);

			// var button3:Button = new Button(this.skins[3]);
			// // button.width = 32;
			// // button.height = 32;
			// button3.pos(Laya.stage.width - 260, Laya.stage.height - 40);
			// button3.label = "打乱";
			// button3.on(Laya.Event.CLICK, this, e => {
			// 	this.currentStatus.shuffleCount(20);
			// 	this.renderStatus(this.currentStatus);
			// });
			// Laya.stage.addChild(button3);

			//==========================自动拼图============================
			var button4:Button = new Button(this.skins[3]);
			// button.width = 32;
			// button.height = 32;
			button4.pos((Laya.stage.width>>1) + 120,  600);
			button4.label = "认输";
			button4.on(Laya.Event.CLICK, this, e => {
				this.usedTime = 0;
				this.stepNum = 0;
				this.testPuzzle(1000, this.currentStatus, this.completedStatus);
			});
			Laya.stage.addChild(button4);

			//==========================自动拼图============================
			var button5:Button = new Button(this.skins[3]);
			// button.width = 32;
			// button.height = 32;
			console.log(`button5 pos ${Laya.stage.height}`);
			button5.pos((Laya.stage.width>>1) - 120, 600);
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

		private mouseDownHandler():void {
			console.log("mouse down on move handler");
			this.mouseDownPoint = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
			Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.moveHandler);
		}
		/**
		 * 鼠标按下绑定移动事件，处理完成，取消移动事件
		 */
		
		private moveHandler(e):void {
			let btn = e.target;
			let cx = Laya.stage.mouseX;
			let cy = Laya.stage.mouseY;
			let MAX_DIST = 10;

			let dx = cx - this.mouseDownPoint.x;
			let dy = cy - this.mouseDownPoint.y;
			let adx = Math.abs(dx);
			let ady = Math.abs(dy);
			console.log("mouse move:" + dx + "," + dy);
			if (adx < MAX_DIST &&
				ady < MAX_DIST) {
				return;
			}
			console.log("start move:" + adx + "," + ady);
			Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.moveHandler);

			let emptyIndex = this.currentStatus.emptyIndex;
			let targetIndex = this.currentStatus.pieceArray.indexOf(btn);
			if (adx > ady) { // 左右为主
				
				let dcol = this.currentStatus.col(emptyIndex) - this.currentStatus.col(targetIndex);
				if (dcol/dx > 0) { // 方向相同
					this.movePiece(e);
				}

			}else { // 上下为主
				let drow = this.currentStatus.row(emptyIndex) - this.currentStatus.row(targetIndex);
				if (drow/dy > 0) { // 方向相同
					this.movePiece(e)
				}
			}
			
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
				this.stepNum++;
				// this.saveRecord();
			}
			
		}

		private bindEvent(t:boolean=true):void {
			var pieces:PuzzlePiece[] = this.currentStatus.pieceArray;

			for (let i = 0; i < pieces.length; i++) {

				let p:PuzzlePiece = pieces[i];
				if(t) {
					p.on(Laya.Event.CLICK, this, this.movePiece);
					p.on(Laya.Event.MOUSE_DOWN, this, this.mouseDownHandler);
				}else {
					p.off(Laya.Event.CLICK, this, this.movePiece);
					p.on(Laya.Event.MOUSE_DOWN, this, e => {});
				}
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
				this.mainPanel.addChild(p);
			}

			console.log("current status:" + this.currentStatus.statusIdentifier());
			this.currentStatus.emptyIndex = 0;
			this.completedStatus = this.currentStatus.copy();
			
			console.log("shuffle after status:" + this.currentStatus.statusIdentifier())
		}

		/**
		 * 1 
		 * @param status 
		 */
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

			let progress:number = status.estimateToTargetStatus(this.completedStatus);
			this.processStatus.text = "距离完成还差:" + progress + "米";
		}

		/**
		 * 寻找路径
		 * @param currentStatus 
		 * @param completedStatus 
		 */
		private findPath(currentStatus:PuzzleStatus, completedStatus:PuzzleStatus):PuzzleStatus[]{
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

			return path;
		}

		private testPuzzle(delay:number, currentStatus:PuzzleStatus, completedStatus:PuzzleStatus):void {
			var index = 0;
			var path:PuzzleStatus[] = this.findPath(currentStatus, completedStatus);
			this.stepNum = path.length - 1;
			this.autoPath(delay, path, 1);
		}

		/**
		 * 利用了递归方法进行循环调用
		 * @param delay 
		 * @param paths 
		 * @param index 
		 */
		private autoPath(delay:number, paths:PuzzleStatus[], index:number):void {
			if(index >= paths.length) {
				this.currentStatus = this.completedStatus.copy();
				return;
			}else {
				Laya.timer.once(delay, this, this.autoGO, [delay, paths, index]);
			}
		}

		private autoGO(delay:number, e:PuzzleStatus[], i:number):void {
			this.renderStatus(e[i]);
			this.autoPath(delay, e, i + 1);
		}

		private loop():void {
			// 如果在idle模式下，随机打乱，或者随机移动
			if (this.gameState == PuzzleApp.PLAY) {
				// check success	
				if (this.currentStatus.equals(this.completedStatus)) {
					this.currentStatus.setEmptyVisible(true);
					this.usedTime = (new Date().getTime() - this.startTime) / 1000;
					this.changeState(PuzzleApp.SUCCESS);
					this.showSuccess(true);
				}
			}
		}

		/**
		 * 1 本次用时  用的步数
		 * 2 最好用时 用的步数；
		 * 3 返回idle， 重新来一次
		 */
		private showSuccess(isAuto:boolean):void {
			let ladder = this.loadRecord();
			if (ladder == null) {
				ladder = new Ladder();
			}

			this.foreground.removeChildren();
			let prefix = "";

			let scoreNum:number = Ladder.calculate(this.currentStatus.matrixOrder, this.usedTime, this.stepNum);
			if (scoreNum > ladder.score) {
				this.saveRecord(scoreNum);
				prefix = "恭喜你，最新记录";
			}

			var score:Label = new Label();
			score.fontSize = 30;
			score.width = Laya.stage.width;
			score.align = "center";
			score.pivot(Laya.stage.width>>1, 15);

			if (isAuto) {
				score.text = `${prefix} 得分 ${scoreNum} 移动${this.stepNum}步, 用时 ${this.usedTime}秒`;
			}else {
				score.text = `本次是AI完成用了 ${this.stepNum}步`;
			}

			score.pos(Laya.stage.width>>1, 100);
			this.foreground.addChild(score);

			var best:Label = new Label();
			best.fontSize = 30;
			best.width = Laya.stage.width;
			best.align = "center";
			best.pivot(Laya.stage.width>>1, 15);

			best.text = `最好记录是 得分${scoreNum}  移动${this.stepNum}步 用时 ${this.usedTime}秒`;
			best.pos(Laya.stage.width>>1, 140);
			this.foreground.addChild(best);

			var idle:Sprite = new Sprite();
			idle.loadImage("res/play01.png");
			idle.pos(80, Laya.stage.height - 80);
			idle.on(Laya.Event.CLICK, this, this.gotoIdleState);
			this.foreground.addChild(idle);


			var tryAgain:Sprite = new Sprite();
			tryAgain.loadImage("res/play02.png");
			tryAgain.pos(Laya.stage.width - 180, Laya.stage.height - 80);
			tryAgain.on(Laya.Event.CLICK, this, e => {
				this.gotoPlay(this.currentStatus.matrixOrder);
			});
			this.foreground.addChild(tryAgain);

			this.foreground.visible = true;
		}

		/**
		 * 开始操作的时候，就开始清掉timer
		 */
		private stopIdle():void {
			Laya.timer.clear(this, this.shuffle);
			Laya.timer.clear(this, this.autoGO);
			Laya.timer.clear(this, this.idleHandle);
		}

		/**
		 * 休闲动作：1 随机打乱；2 顺序拼好
		 */
		private shuffleCount:number;
		private idleHandle(count:number):void {
			if (count > 0) {
				Laya.timer.once(1000, this, this.shuffle, [count - 1]);
			}else {
				// 如果随机完成，可以进行自动排序了
				this.testPuzzle(250, this.currentStatus, this.completedStatus);
			}
		}

		private shuffle(count:number):void {
			this.currentStatus.shuffleCount(1);
			this.idleHandle(count);
			this.renderStatus(this.currentStatus);
		}

		public handleInput(key):void {

		}

	}
}