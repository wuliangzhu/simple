/**
* name 
*/
module game{
	export class EventBus extends Laya.EventDispatcher {
		public static bus:EventBus = new EventBus();

	}
}