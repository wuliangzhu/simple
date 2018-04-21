/**
* name 
*/
module game{
	export class Event{

		/**
		 * 游戏生命周期
		 */
		static GAME_INIT:string = "game_init";
		static GAME_PAUSE:string = "game_pause";
		static GAME_RESUME:string = "game_resume";
		static GAME_EXIT:string = "game_exit";

		/**
		 * 游戏循环事件
		 */
		static GAME_LOOP:string = "game_loop";
		/**
		 * 进入场景的时候调用
		 */
		static GAME_CHANGE_SCENE:string = "game_change_scene";
		static GAME_ENTER_SCENE:string = "game_enter_scene";
		static MOVE_VIEW_POINT:string = "move_view_point";
		/**
		 * 离开场景的时候调用
		 */
		static GAME_EXIT_SCENE:string = "game_exit_scene";

		/**
		 * 负责处理用户移动
		 */
		static PLAYER_MOVE:string = "player_move";

		/**
		 * 负责处理用户输入
		 */
		static PLAYER_INPUT:string = "player_input"
	}
}