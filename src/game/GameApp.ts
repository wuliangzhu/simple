/**
* 游戏入口
* 1 进行事件绑定
* 2 业务逻辑的处理入口
* 3 整个游戏基于事件驱动
*/
module game{
	import GridSprite = Laya.GridSprite;
	import MapLayer = Laya.MapLayer;
	import Point = laya.maths.Point;
	import Image = Laya.Image;

	export class GameApp{
		private inputHandlers:Map<Function> = new Map<Function>();
		private static instance:GameApp;

		private left:GridSprite;
		private right:GridSprite;
		private scene:Scene;
		private isSuccess:boolean;

		// test the puzzle
		private puzzleImage:Laya.Texture;

		constructor(){
			EventBus.bus.once(Event.GAME_INIT, this, this.init);

			EventBus.bus.on(Event.GAME_LOOP, this, this.loop);

			EventBus.bus.on(Event.PLAYER_INPUT, this, this.handleInput);

			EventBus.bus.on(Event.GAME_ENTER_SCENE, this, this.enterScene);
		}

		public static startApp():void {
			GameApp.instance = new GameApp();
		}

		public init():void {
			console.log("game app init");
			this.puzzleImage = new Laya.Texture();
			this.puzzleImage.load("res/59fb23041c3ad.png");

		}

		private enterScene(scene:Scene):void {
			console.log(`enter scene: ${scene.sceneName}`)
			this.scene = scene;

			let map = scene.map;
			this.left = map.getLayerObject("player", "left");

			this.left.loadImage("res/user.png");

			this.right = map.getLayerObject("player", "right");
			
			this.right.loadImage("res/star.png");

			this.isSuccess = false;
		}
		/**
		 * 主循环基于时间事件
		 */
		public loop():void {
			console.log("game heart beat");
		}

		private handleInput(key:string):void {
			console.log("input the " + key)
			// test the puzzle
			
			var currentStatus:PuzzleStatus = PuzzleStatus.statusWithMatrixOrder(3, this.puzzleImage);
			console.log("current status:" + currentStatus.statusIdentifier());
			currentStatus.emptyIndex = 5;
			var completedStatus:PuzzleStatus = currentStatus.copy();
			currentStatus.shuffleCount(20)
			console.log("shuffle after status:" + currentStatus.statusIdentifier())

			this.testPuzzle(currentStatus, completedStatus);
			
			// if (!this.isSuccess) {
			// 	this.handlePlayer(this.left, false);
			// 	this.handlePlayer(this.right, true);
				
			// 	Laya.timer.once(500, this, this.handleInput);
			// }
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
		}

		private handlePlayer(sprite:GridSprite, isShadow:boolean) {
			let tilePos:Point = new Point();
			let ret:boolean = this.scene.layer.getTilePositionByScreenPos(sprite.x, 
				sprite.y, tilePos);
			
			if (ret) {
				tilePos.x = Math.floor(tilePos.x);
				tilePos.y = Math.floor(tilePos.y);

				if(KeyStates.isLeft()) {
					if (!isShadow) 
						this.handleTile(this.left, tilePos.x - 1, tilePos.y);
					else
						this.handleTile(sprite, tilePos.x + 1, tilePos.y);
				}else if (KeyStates.isRight()) {
					if (!isShadow)
						this.handleTile(this.left, tilePos.x + 1, tilePos.y);
					else
						this.handleTile(sprite, tilePos.x - 1, tilePos.y);
				}else if (KeyStates.isUp()) {
					this.handleTile(sprite, tilePos.x, tilePos.y - 1);
				}else if (KeyStates.isDown()) {
					this.handleTile(sprite, tilePos.x, tilePos.y + 1);
				}
				
			}else {
				console.log(` x, y error ${this.left.x} ${this.left.y}`);
			}

		}


		private handleTile(sprite:GridSprite, col:number, row:number):void {
			let pass = this.scene.canPass(col, row);
			if (pass) {
				// check skill
				let skillId = this.scene.getSkillId(col, row);
				if (skillId > 0) {
					console.log("cast the skill:" + skillId);
					if (skillId == 100) {
						Laya.timer.callLater(this, this.success);
						return;
					}
				}

				Laya.Tween.to(sprite, {x:col * 32 + 16, y: row * 32 + 16}, 500, 
				Laya.Ease.linearNone);
			}
		}

		private success():void {
			console.log("success");
			this.isSuccess = true;
			EventBus.bus.event(game.Event.GAME_SUCCESS);
		}

	}
}