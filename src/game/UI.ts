/**
* name 
*/
module game{
	export class UI{
		constructor(){

		}

		public init():void {
			EventBus.bus.on(Event.GAME_INIT, this, () => {
				console.log("ui init");
			});
		}
	}
}