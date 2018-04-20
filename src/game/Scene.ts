/**
* name 
*/
module game{
	import TiledMap = Laya.TiledMap;
	import Layer = Laya.MapLayer;
	import Stage     = Laya.Stage;

	import Rectangle = Laya.Rectangle;
	import WebGL     = Laya.WebGL;


	export class Scene{
		public map:TiledMap;
		public layer:Layer;

		constructor(){

		}

		public init():void {
			Laya.init(1100, 800, WebGL);

			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#2326ff";
			this.map = new TiledMap();
			this.map.createMap("res/first.json", new Rectangle(0, 0, Laya.stage.width, Laya.stage.height), 
			new Laya.Handler(this, this.completeHandler, null, false));

			Laya.stage.on(Laya.Event.CLICK, this, this.clickHandler);

			console.log("init finished");
		}
		
		public completeHandler():void {
			console.log("load map completed!!")

			this.layer = this.map.getLayerByIndex(0);
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