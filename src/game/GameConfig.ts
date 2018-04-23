/**
* name 
*/
module game{
	export class GameConfig{
		public static UI_Z_ORDER:number = 100;
		public static SCENE_SCROLL_SPEED:number = 2;
		public static appClass:Function = function(){
			GameApp.startApp();
		};

		constructor(){

		}
	}
}