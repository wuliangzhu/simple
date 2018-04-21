/**
* 游戏入口
* 1 进行事件绑定
* 2 业务逻辑的处理入口
* 3 整个游戏基于事件驱动
*/
module game{
	export class GameApp{
		constructor(){
			EventBus.bus.once(Event.GAME_INIT, this, this.init);

			EventBus.bus.on(Event.GAME_LOOP, this, this.loop);
		}

		public init():void {
			console.log("game app init");
		}

		/**
		 * 主循环基于时间事件
		 */
		public loop():void {
			console.log("game heart beat");
		}
	}
}