/**
* 1 负责地图加载；
* 2 负责接收用户输入
* 3 监听到game_init 就进行地图加载，默认是 scene_default.json
*/
module game{
	import TiledMap = Laya.TiledMap;
	import Layer = Laya.MapLayer;
	import Stage     = Laya.Stage;

	import Rectangle = Laya.Rectangle;
	import WebGL     = Laya.WebGL;


	export class Scene{
		private static DEFAULT_SCENE:string = "res/first.json";
		public map:TiledMap;
		public layer:Layer;
		public sceneName:string;
		/**地图视角坐标 */
		private viewX:number;
		private viewY:number;
		private width:number;
		private height:number;

		constructor(){

		}

		public init():void {
			this.width = Laya.stage.width;
			this.height = Laya.stage.height;
			this.viewX = 0;
			this.viewY = 0;

			EventBus.bus.on(Event.GAME_INIT, this, () => {
				this.loadScene(Scene.DEFAULT_SCENE);
			})

			EventBus.bus.on(Event.GAME_CHANGE_SCENE, this, file => {
				this.loadScene(file);
			})

			EventBus.bus.on(Event.MOVE_VIEW_POINT, this, this.moveViewPoint);
			console.log("init finished");
		}

		private loadScene(sceneFile:string):void {
			this.map = new TiledMap();
			this.map.createMap(sceneFile, new Rectangle(0, 0, this.width, this.height), 
						new Laya.Handler(this, this.completeHandler, [sceneFile], false));

			Laya.stage.on(Laya.Event.CLICK, this, this.clickHandler);
		}

		private completeHandler(sceneFile:string):void {
			console.log(`${sceneFile} load map completed!!`)
			this.sceneName = sceneFile;

			EventBus.bus.event(Event.GAME_ENTER_SCENE, this);

			this.layer = this.map.getLayerByIndex(0);
		}

		private moveViewPoint(dx:number, dy:number):void {
			this.viewX = this.viewX + dx;
			this.viewY = this.viewY + dy;

			this.map.changeViewPort(this.viewX, this.viewY, this.width, this.height)
		}

		private clickHandler = function(e){
			console.log("click:" + e.target)
			
			var x = Laya.stage.mouseX;
			var y = Laya.stage.mouseY;
			var col = Math.floor(x / 32);
			var row = Math.floor(y / 32);

			console.log("tile is:" + x + "," + y + "->" + col + "," + row);

			var a = this.layer.getTileData(col, row);
			/**
			 * 1 tileset 是分组的，每个组属性单独存放；
			 * 2 第一个参数就是tileset的组id，第二个参数是地图快id
			 */
			var b = this.map.getTileProperties(0, a-1, "isPass");

			console.log("the custom attribute is:" + a + "-" + b)
		}
	}
}