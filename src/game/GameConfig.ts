/**
* name 
*/
module game{
	export class GameConfig{
		public static UI_Z_ORDER:number = 100;
		public static SCENE_SCROLL_SPEED:number = 2;
		public static NEED_MAP:boolean = true;
		public static NEED_LOOP:boolean = true;
		public static NEED_WORKER:boolean = true;

		public static appClass:Function = function(){
			PuzzleApp.startApp();
		};

		constructor(){

		}
	}
}