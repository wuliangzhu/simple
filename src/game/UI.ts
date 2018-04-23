/**
* name 
*/
module game{
	import Sprite = Laya.Sprite;
	import Event = Laya.Event;

	class Button{
		public actionId:number;
		public x:number;
		public y:number;

		public url:string;
		constructor(id:number, url:string, x:number, y:number){
			this.actionId = id;
			this.url = url;

			this.x = x;
			this.y = y;
		}
	}
	export class UI extends Laya.Sprite{
		private buttons:Array<Button> = [];
		constructor(){
			super();
			let base:number = Laya.stage.height - 20;
			this.addButton(1, "res/add.png", 50, base - 100);
			this.addButton(2, "res/add.png", 50, base - 20)
			this.addButton(3, "res/add.png", 10, base - 60);
			this.addButton(4, "res/add.png", 90, base - 60);
		}

		public init():void {
			EventBus.bus.on(game.Event.GAME_INIT, this, () => {
				console.log("ui init");
				this.x = 0;
				this.y = 0;
				this.width = Laya.stage.width;
				this.height = Laya.stage.height;

				for(let v of this.buttons) {
					let sprite:Sprite = new Sprite();

					sprite.pivot(16, 16);
					sprite.x = v.x;
					sprite.y = v.y;
					
					sprite.loadImage(v.url);
					sprite.name = `op_${v.actionId}`;

					sprite.mouseEnabled = true;

					sprite.on(Event.MOUSE_DOWN, this, this.mouseDown, [sprite.name]);
					sprite.on(Event.MOUSE_OVER, this, this.mouseDown, [sprite.name]);


					sprite.on(Event.MOUSE_UP, this, this.mouseUp, [sprite.name]);
					sprite.on(Event.MOUSE_OUT, this, this.mouseUp, [sprite.name]);

					sprite.zOrder = 100;
					this.addChild(sprite);
				}
			});

			this.zOrder = GameConfig.UI_Z_ORDER;
			Laya.stage.addChild(this);
		}

		private addButton(actionId:number, url:string, x:number, y:number):void {
			let btn:Button = new Button(actionId, url, x, y);
			this.buttons.push(btn);
		}

		private mouseDown(name:string):void {
			let arr:string[] = name.split("_");
			let id:number = parseInt(arr[1]);

			var e:string = "";
			KeyStates.states[id - 1] = 1;
			switch(id) {
				case 1:e = game.Event.INPUT_UP;break;
				case 2:e = game.Event.INPUT_DOWN;break;
				case 3:e = game.Event.INPUT_LEFT;break;
				case 4:e = game.Event.INPUT_RIGHT;break;
				default:break;
			}

			if (e.length > 0) {
				EventBus.bus.event(game.Event.PLAYER_INPUT, e);
			}
		}

		private mouseUp(name:string):void {
			let arr:string[] = name.split("_");
			let id:number = parseInt(arr[1]);

			var e:string = "";
			KeyStates.states[id - 1] = 0;
		}
	}
}