/**
* 1 游戏初始化；
* 2 游戏场景管理
* 3 游戏核心逻辑处理
*    a 事件发送
*    b 基础游戏流程
* 4 worker.js 是背景工作线程，负责一些后台工作
*/
module game{
	import WebGL = Laya.WebGL;
	import Stage = Laya.Stage;
	import Browser = Laya.Browser;

	export class GameEngine{
		private static instane:GameEngine;

		private ui:UI;
		private scene:Scene;

		private worker:any;
		constructor(){

		}

		public static init():void {
			let app:Function = GameConfig.appClass;
			app();

			let engine:GameEngine = new GameEngine();
			engine.initStage();

			// init the ui and scene
			engine.initGame();

			GameEngine.instane = engine;

			// game init finished
			EventBus.bus.event(Event.GAME_INIT);
		}

		private destroy():void {

		}
		/**
		 * 初始化显示背景
		 */
		private initStage():void {
			Laya.init(1100, 800, WebGL);

			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#2326ff";
		}

		/**
		 * 初始化游戏组件
		 */
		private initGame():void {
			this.ui = new UI();
			this.ui.init();

			this.scene = new Scene();
			this.scene.init();


			this.initBackgroundWorker((oEvent:MessageEvent) => {
				let data = oEvent.data;
				console.log("worker call back:" + data);
				// TODO:
			});

			// init the frame loop 多久更新一次滚动
			Laya.timer.frameLoop(2, this, this.frameUpdate);
		}

		private frameUpdate():void{
			// update logic

			// scroll map 应该属于 App范畴
			// EventBus.bus.event(Event.MOVE_VIEW_POINT, [GameConfig.SCENE_SCROLL_SPEED, 0]);
		}

		/**
		 * 启动一个背景线程进行代码处理
		 * 需要进行后台处理的，可以放在workerjs中
		 * 处理完毕会调用callback方法
		 */
		private initBackgroundWorker(callback:Function):void {
			this.worker = new Laya.Browser.window.Worker("worker.js");

			this.worker.onmessage = callback;
		}
	}
}