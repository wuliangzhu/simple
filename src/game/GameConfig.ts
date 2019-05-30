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

		public static WIDTH:number = 750;
		public static HEIGHT:number = 1000;

		public static BLACK:string = "#353535";
		public static GREY:string = "#888888";
		public static RED:string = "#e64340";
		public static BLUE:string = "#09bb07";
		public static GREEN:string = "#576b95";

		public static appClass:Function = function(){
			PuzzleApp.startApp();
		};

		constructor(){

		}
	}
}