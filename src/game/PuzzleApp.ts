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
		public step:number;
		public time:number;

		constructor(){
			this.score = 0;
			this.step = 0;
			this.time = 0;
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
		private pyp:Sprite;

		private foreground:Sprite; // 处理idle的情况
		private processStatus:Sprite;

		private bottom:Sprite;
		private resultPane:Image; // 结果面板

		private mouseDownPoint:Laya.Point;

		private startTime:number;
		private usedTime:number;
		private stepNum:number;
		private static IDLE:number = 1;
		private static PLAY:number = 2;
		private static SUCCESS:number = 3;
		private gameState:number; // 0 idle 1 play 2 success


		private skins:string[];
		private ladderConfig:Object[];

		private currentStatus:PuzzleStatus;
		private completedStatus:PuzzleStatus;

		// running state
		private step:Laya.TextInput;
		private time:Laya.TextInput;
		private remain:Laya.TextInput;

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

			this.skins = ["res/add.png", "res/user.png", "res/star.png", "res/play01.png", "res/btn01.png", "res/input.png", "res/dialog.png"];

			this.ladderConfig = [{"text":"3 X 3", "img":"res/btn01.png", "order":3},
				 {"text":"4 X 4", "img":"res/btn01.png", "order":4}, 
				 {"text":"5 X 5", "img":"res/btn01.png", "order":5}];

			this.bgColors = ["#758796", "#495d73", "#87797f", "#5c4d54", "#839187", "#59685d"];
			
			this.img = new Laya.Sprite();
			// this.img.on(Laya.Event.LOADED, this, this.showImg);
			this.imgId = Math.floor(Math.random() * 100) % 3;
			this.changeImg(this.imgs[this.imgId]);
			
			this.mode = 0;
			this.gameState = PuzzleApp.IDLE;
			// this.showLadderList();
			Laya.loader.load(this.imgs.concat(this.skins), Handler.create(this, e => {
				this.paintUI();
				this.gotoIdleState();
				this.uiSkinLoaded();
			}));

			// wx api
			Laya.timer.frameOnce(3, this, e =>{
				
			})
		}
		
		/**
		 * 资源加载完成之后再绘制，否则可能出现Laya.stage
		 */
		private paintUI():void {
			this.paintBg();

			this.pyp = new Sprite();
			this.pyp.graphics.loadImage("res/yhy.png", 0, 0, GameConfig.WIDTH * 0.8, 100);
			this.pyp.pivot((GameConfig.WIDTH*0.8)>>1, 37);
			this.pyp.pos(GameConfig.WIDTH>>1, 100);
			Laya.stage.addChild(this.pyp);

			this.mainPanel.pivot(256, 256);
			this.mainPanel.pos(GameConfig.WIDTH>>1, 500);
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
			this.foreground.visible = true;
			if(this.bottom) {
				// this.bottom.removeChildren();
			}
			this.mainPanel.removeChildren();
			let record:Record = new Record();
			record.emptyIndex = 0;
			record.imageId = Math.floor(Math.random() * 100) % 3;
			record.order = 3;
			for(let i = 0; i < record.order * record.order; i++) {
				record.ids.push(i);
			}

			this.handleRecord(record);

			this.showLadderList();

			this.showBottomPanel(8);

			Laya.timer.once(3000, this, this.idleHandle, [20]);
		}

		private paintBg():void {
			this.background = new Sprite();
			this.background.width = GameConfig.WIDTH;
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
			this.background.graphics.drawRect(0, 0, GameConfig.WIDTH, height, c);
			this.background.graphics.drawRect(0, Laya.stage.height * 0.8, GameConfig.WIDTH, Laya.stage.height*0.2, c2);
		}

		private addForground():void {
				// add foreground
			this.foreground = new Sprite();
			this.foreground.width = GameConfig.WIDTH;
			this.foreground.height = Laya.stage.height * 0.7;
			this.foreground.zOrder = GameConfig.UI_Z_ORDER;
			// this.foreground.graphics.drawRect(0, 0, this.foreground.width, this.foreground.height, "#0");
			// this.foreground.alpha = 0.3;
			Laya.stage.addChild(this.foreground);
		}

		private showResultPane():void {
			if (this.resultPane == null) {
				this.resultPane = new Image();
			}


		}
		/**
		 * 1 选择难度；
		 * 2 每个难度对应 3，4，5 介的维度
		 * 3 crazy 采用图片的5个维度
		 */
		private showLadderList():void {
				 for (var index = 0; index < this.ladderConfig.length; index++) {
					 let element = this.ladderConfig[index];
					 var button:Button = new Button(element["img"], element["text"]);
					 button.stateNum = 1;
					 button.size(100, 34);
					 button.sizeGrid = "0,14,0,14,0";
					//  button.loadImage();
					 button.pivot(50, 20);
					 button.labelBold = true;
					 button.labelSize = 30;

					 button.pos(GameConfig.WIDTH>>1, (Laya.stage.height>>1)  - 100 + index * 60);
					 console.log("add button:" + element["text"]);
					 button.on(Laya.Event.CLICK, this, this.gotoPlay, [element["order"]]);

					 this.foreground.addChild(button);
				 }
		}

		/**
		 * 选择难度，给用户显示目标，但不打乱
		 * @param order 
		 */
		private gotoPlay(order:number, pyp:boolean = true):void {
			this.usedTime = 0;
			this.stepNum = 0;
			this.stopIdle();
			this.mainPanel.removeChildren();
			this.foreground.removeChildren();
			this.pyp.visible = pyp;
			this.foreground.visible = true;
			this.processStatus.visible = false;

			this.isCustom = false;
			// 开始游戏 根据参数生成
			// if (order < 0) {
			// 	this.mode = 1;
			// }else {
			// 	this.mode = 1;
			// }

			this.makePuzzle(Math.abs(order));
			this.currentStatus.numMode(this.mode);
			this.renderStatus(this.currentStatus);

			if (this.bottom != null) {
				this.bottom.removeChildren();
			}
			this.addCustomButton();
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
				this.foreground.visible = false;
				this.currentStatus.shuffleCount(100);
				this.bindEvent();
				this.currentStatus.freeMove = false;	
					
				this.renderStatus(this.currentStatus);
				this.changeState(PuzzleApp.PLAY);
			});

			timeLine.play(0, false);

			// var t:Test = new Test();
			// t.postShowFriends();

			// 现实下面的按钮
			this.showBottomPanel();
		}
		private isCustom:boolean;
		private addCustomButton():void {
			this.isCustom = false;	
			let start:Button = new Button("res/play01.png", "自定义");
			start.pivot(185>>1, 45>>1);
			start.pos(GameConfig.WIDTH>>1, this.bottom.height/3);
			start.stateNum = 1;
			start.on(Laya.Event.CLICK, this, e => {
				let btn = <Button>e.target;
				this.currentStatus.numMode(1);
				btn.label = "点击将目标和0进行位置交换";
				btn.mouseEnabled = false;
				this.foreground.visible = false;
				this.currentStatus.freeMove = true;
				this.isCustom = true;
				this.bindEvent();
				console.log("start custom");
			});
			// start.on(Laya.Event.MOUSE_DOWN, this, e =>{
			// 	start.loadImage("res/play02.png");
			// });
			// start.on(Laya.Event.MOUSE_UP, this, e => {
			// 	start.loadImage("res/play01.png");

			// 	this.startPlay();
			// });
			// this.bottom.graphics.drawRect(0, 0, 400, 100, "#ff0000");
			this.bottom.addChild(start);
		}

		/**
		 * 添加开始按钮
		 */
		private addStartButton():void {
			let start:Sprite = new Sprite();
			start.loadImage("res/play01.png");
			start.pivot(185>>1, 45>>1);
			start.pos(GameConfig.WIDTH>>1, this.bottom.height*0.67);
			start.on(Laya.Event.MOUSE_DOWN, this, e =>{
				start.loadImage("res/play02.png");
			});
			start.on(Laya.Event.MOUSE_UP, this, e => {
				start.loadImage("res/play01.png");

				this.startPlay();
			});
			// this.bottom.graphics.drawRect(0, 0, 400, 100, "#ff0000");
			this.bottom.addChild(start);
		}

		/**
		 * 1 用时；2 用了多少步；3 排行先进行难度排行，然后进行时间排行，最后才是步数排行
		 */
		private addProgressStatus():void {
			// add progressStatus
			if (this.processStatus == null) {
				this.processStatus = new Sprite();

				this.processStatus.width = GameConfig.WIDTH;
				this.processStatus.height = 200;
				this.processStatus.pivot(GameConfig.WIDTH>>1, 100);
				this.processStatus.pos(GameConfig.WIDTH>>1, 100);
				this.background.addChild(this.processStatus);
			}else {
				this.processStatus.removeChildren();
			}

			this.processStatus.visible = true;

			var stepLabel:Label = new Label("步数：");
			stepLabel.pos(40, 50);
			this.applyFontStyle(stepLabel);

			var timeLabel:Label = new Label("时间：");
			timeLabel.pos(40, 100);
			this.applyFontStyle(timeLabel);

			var remainStep:Label = new Label("估计剩余步数：");
			remainStep.pos(GameConfig.WIDTH>>1, 50);
			this.applyFontStyle(remainStep);

			var step:Laya.TextInput = this.step = new Laya.TextInput("0");
			step.pos(145, 50);
			step.editable = false;
			this.applyFontStyle(step, true);

			var time:Laya.TextInput = this.time = new Laya.TextInput("0");
			time.pos(145, 100);
			this.applyFontStyle(time, true);

			var remain:Laya.TextInput = this.remain = new Laya.TextInput("0");
			remain.pos((GameConfig.WIDTH>>1) + 200, 50);
			this.applyFontStyle(remain, true);

			this.processStatus.addChild(stepLabel);
			this.processStatus.addChild(timeLabel);
			this.processStatus.addChild(remainStep);
			this.processStatus.addChild(step);
			this.processStatus.addChild(time);
			this.processStatus.addChild(remain);
		}

		private applyFontStyle(label:Label, isInput:boolean = false):void {
			if(isInput) {
				let t = <Laya.TextInput>label;
				t.skin = "res/input.png";
				t.sizeGrid = "0, 14, 0, 14, 0";
			}

			label.fontSize = 30;
			label.align = "center";
			label.height = 30;
			label.width = 150;
			
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
			switch(state) {
				case PuzzleApp.PLAY:{
					this.pyp.visible = false;
					this.addProgressStatus();
				}break;
				case PuzzleApp.IDLE:{
					this.pyp.visible = true;
					this.processStatus.visible = false;
				}break;
				case PuzzleApp.SUCCESS:{
					this.pyp.visible = false;
					this.processStatus.visible = true;
				}break;
			}


			console.log("change to game state:" + state);
		}

		

		/**
		 * 对游戏进行存档
		 */
		private saveRecord(score:number, time:number, step:number):void {
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
			ladder.step = step;
			ladder.time = time;

			Db.saveJson("score", ladder);
		}

		private handleRecord(record:Object):void {
			let order:number = record["order"];
			let emptyIndex:number = record["emptyIndex"];
			let imgId:number = record["imageId"];
			let ids:[number] = record["ids"];

			this.imgId = imgId;
			this.mainPanel.graphics.clear();
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
			console.log("ui skin loaded");
		}

		/**
		 * 切换是显示数字还是图片
		 */
		private numberOrImageMode():void {
				this.mode = 1 - this.mode;
				this.currentStatus.numMode(this.mode);
				this.mainPanel.repaint();
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
			// btn.off(Laya.Event.CLICK, this, this.movePiece);

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
				this.step.text = "" + this.stepNum;
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
					p.off(Laya.Event.MOUSE_DOWN, this, this.mouseDownHandler);
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
			this.remain.text = "" + Math.abs(progress/5);
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
			// this.stepNum = path.length - 1;
			this.autoPath(delay, path, 1);
		}

		/**
		 * 解决拼图问题，点击按钮进入下一步
		 * @param delay 
		 * @param currentStatus 
		 * @param completedStatus 
		 */
		private solvedPath:PuzzleStatus[];
		private solvedIndex:number;
		private puzzleSolve(currentStatus:PuzzleStatus, completedStatus:PuzzleStatus):void {
			var index = 0;
			var path:PuzzleStatus[] = this.findPath(currentStatus, completedStatus);
			// this.stepNum = path.length - 1;
			// this.autoPath(delay, path, 1);
			this.solvedPath = path;
			this.solvedIndex = 1;
		}

		private nextStep():void {
			if(this.solvedIndex >= this.solvedPath.length) {
				this.currentStatus = this.completedStatus.copy();
				return;
			}

			this.renderStatus(this.solvedPath[this.solvedIndex++]);
			// this.autoPath(delay, e, i + 1);

			this.stepNum++;
			if (this.step != null) {
				this.step.text = "" + this.stepNum;
			}
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

			this.stepNum++;
			if (this.step != null) {
				this.step.text = "" + this.stepNum;
			}
		}

		private clearAuto():void {
			Laya.timer.clear(this, this.autoGO);
		}

		private loop():void {
			// 如果在idle模式下，随机打乱，或者随机移动
			if (this.gameState == PuzzleApp.PLAY) {
				// check success	
				if (this.currentStatus.equals(this.completedStatus)) {
					Laya.Tween.to(this.currentStatus.pieceArray[0], {alpha:1}, 500, Laya.Ease.linearOut, Handler.create(this, e=>{
						this.currentStatus.setEmptyVisible(true);
					}));

					this.mainPanel.repaint();
					this.usedTime = (new Date().getTime() - this.startTime) / 1000;
					this.usedTime = Math.floor(this.usedTime);
					this.bindEvent(false);
					this.changeState(PuzzleApp.SUCCESS);
					Laya.timer.once(250, this, e => {
						
						this.showSuccess(true);
					})
					
					
				}else {
					this.usedTime = (new Date().getTime() - this.startTime) / 1000;
					this.usedTime = Math.floor(this.usedTime);
					let seconds = this.usedTime % 3600;
					let hours =  (this.usedTime - seconds) / 3600;
					let s = seconds % 60;
					let min = (seconds - s ) / 60;

					this.time.text = (hours > 9 ? hours : "0" + hours) + ":" + 
						(min > 9 ? min : "0" + min) + ":" + 
						(s > 9 ? s : "0" + s);
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
			this.processStatus.removeChildren();
			let prefix = "";

			if (this.resultPane == null) {
				this.resultPane = new Image("res/dialog.png");
				this.resultPane.sizeGrid = "18,18, 18, 18, 0";
				this.resultPane.size(GameConfig.WIDTH, 300);
				this.resultPane.pivot(GameConfig.WIDTH>>1, 150);
				this.resultPane.pos(GameConfig.WIDTH>>1, 150);
				// this.foreground.addChild(this.resultPane);
				
				
			}else {

			}

			let scoreNum:number = Ladder.calculate(this.currentStatus.matrixOrder, this.usedTime, this.stepNum);
			let isBreak:boolean = false;

			if (isAuto) {
				prefix = `AI完成`;
			}else {
				prefix = `太棒了！`;
				
			}

			if (this.usedTime > ladder.time) {
				this.saveRecord(scoreNum, this.usedTime, this.stepNum);
				prefix = "打破记录";
				isBreak = true;
			}

			let width = this.resultPane.width;
			let label:Label = this.createLabelForSuccess(`${prefix}`, this.processStatus, width>>1, 50, 40);
			label.pivot(label.width>>1, label.height>>1);
			this.createLabelForSuccess(`使用：${this.usedTime}秒 ${this.stepNum}步`, this.processStatus, width>>1, 100, 30);
			// this.createLabelForSuccess(`移动：${this.stepNum}步`, this.resultPane, width>>2, 150, 30, "left");
			// this.createLabelForSuccess(`总得分：${scoreNum}`, this.resultPane, width>>2, 200, 30, "left");

			if (!isBreak) {
				this.createLabelForSuccess(`最长记录： ${ladder.time}秒 ${ladder.step}步`, this.processStatus, width>>1,
							150, 30, "center");
			}

			// add step
			this.foreground.visible = true;

			this.showBottomPanel(3);
		}

		private createLabelForSuccess(text:string, parent:Sprite, x:number, y:number, fontSize:number = 30, align:string = "center"):Label {
			var best:Label = new Label();
			best.fontSize = fontSize;
			best.width = GameConfig.WIDTH;
			best.align = align;
			best.color = GameConfig.BLACK;
			best.pivot(GameConfig.WIDTH>>1, 15);
			best.text = text;
			best.pos(x, y);
			parent.addChild(best);

			return best;
		}

		private showBottomPanel(flag:number = 4):void {
			if (this.bottom == null) {
				this.bottom = new Sprite();
				this.bottom.pivot(GameConfig.WIDTH>>1, Laya.stage.height * 0.1);
				this.bottom.width = GameConfig.WIDTH;
				this.bottom.height = Laya.stage.height * 0.2;
				// this.bottom.graphics.drawRect(0, 0, GameConfig.WIDTH, 200, "#ff0000");
				this.bottom.pos(GameConfig.WIDTH>>1, Laya.stage.height - 100);
				Laya.stage.addChild(this.bottom);
			}else {
				this.bottom.removeChildren();
				this.bottom.visible = true;
			}
			this.bottom.zOrder = GameConfig.UI_Z_ORDER - 1;

			if (flag == 3) { // 完成的时候可以选择 回到开始 或者重头来一次
				var idle:Sprite = new Sprite();
				idle.loadImage("res/home01.png");
				idle.pivot(28, 30);
				idle.pos((GameConfig.WIDTH>>1) - 200, Laya.stage.height * 0.1);
				idle.on(Laya.Event.CLICK, this, e => {
					this.clearAuto();
					this.gotoIdleState();
				});
				this.bottom.addChild(idle);


				var tryAgain:Sprite = new Sprite();
				tryAgain.loadImage("res/top01.png");
				tryAgain.pivot(28, 30);
				tryAgain.pos((GameConfig.WIDTH>>1) + 200, Laya.stage.height * 0.1);
				tryAgain.on(Laya.Event.CLICK, this, e => {
					this.gotoPlay(this.currentStatus.matrixOrder, false);
					this.startPlay();
				});
				this.bottom.addChild(tryAgain);
			}


// //==========================自动拼图============================
			if (flag == 4) { // 拼图过程中只能选择自动
				var auto:Button = new Button("res/btn01.png", "AI");
				auto.sizeGrid = "0, 14, 0, 14, 0";
				auto.width = 100;
				auto.height = 40;
				auto.pivot(50, 20);
				auto.pos((GameConfig.WIDTH>>1), Laya.stage.height * 0.1);
				auto.on(Laya.Event.CLICK, this, this.aiSolvedHandler);
				this.bottom.addChild(auto);
			}

			if (flag == 8) { // 数字或者图片模式
				var auto:Button = new Button("res/btn01.png", "数字");
				auto.sizeGrid = "0, 14, 0, 14, 0";
				auto.width = 100;
				auto.height = 40;
				auto.pivot(50, 20);
				auto.pos((GameConfig.WIDTH>>1), Laya.stage.height * 0.1);
				auto.on(Laya.Event.CLICK, this, e => {
					this.numberOrImageMode();
					let txt = this.mode == 0 ? "数字" : "图片";
					e.target.label = txt;
				});
				this.bottom.addChild(auto);
			}

		}

		private aiSolvedHandler(e:any):void {
			this.usedTime = 0;
			this.stepNum = 0;
			this.bindEvent(false);
			if (this.isCustom) {
				this.puzzleSolve(this.currentStatus, this.completedStatus);
				e.target.label = "下一步";
				e.target.off(Laya.Event.CLICK, this, this.aiSolvedHandler);
				e.target.on(Laya.Event.CLICK, this, e => {
					this.nextStep();
				});
			}else {
				this.testPuzzle(1000, this.currentStatus, this.completedStatus);
			}
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