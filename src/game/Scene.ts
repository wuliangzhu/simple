/**
* 1 负责地图加载；
* 2 负责接收用户输入
* 3 监听到game_init 就进行地图加载，默认是 scene_default.json
* 4 object 默认坐标是 左下角的坐标.地图编辑器貌似给的是左上角的坐标，所以需要修正额外加上 TileH
* 5 所有物体之间的碰撞都是通过object的 skillId来进行处理的
*/
module game{
	import TiledMap = Laya.TiledMap;
	import Layer = Laya.MapLayer;
	import Stage     = Laya.Stage;

	import Rectangle = Laya.Rectangle;
	import WebGL     = Laya.WebGL;

	import GridSprite = Laya.GridSprite;


	export class Scene{
		private static DEFAULT_SCENE:string = "res/binaryland.json";
		public map:TiledMap;
		public layer:Layer; // 显示层
		public skill:Layer; // 可以交互的层
		public player:Layer; // 玩家层

		public sceneName:string;
		/**地图视角坐标 */
		private viewX:number;
		private viewY:number;
		private width:number;
		private height:number;

		private mapW:number;
		private mapH:number;

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

		/**
		 * 返回目标所有的技能
		 */
		public getSkillId(col:number, row:number):number {
			var ret:number[] = [];

			let id = this.skill.getTileData(col, row)
			var skillId:number = this.map.getTileProperties(0, id - 1, "skillId");

			console.log("check skillId " + skillId);

			return skillId;
		}	

		/**
		 * 判断是否可以通过
		 */
		public canPass(col:number, row:number):boolean {
			var ret:number[] = [];

			let id = this.layer.getTileData(col, row)
			var skillId:number = this.map.getTileProperties(0, id - 1, "skillId");
			console.log("check pass " + skillId)

			return skillId == 0;
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

			this.mapW = this.map.width;
			this.mapH = this.map.height;

			EventBus.bus.event(Event.GAME_ENTER_SCENE, this);

			this.layer = this.map.getLayerByIndex(0);
			this.skill = this.map.getLayerByIndex(1);
		}

		private moveViewPoint(dx:number, dy:number):void {
			console.log(`map ${this.viewX} ${this.viewY} ${this.mapW} ${this.width}`)
			if(this.viewX < 0 || this.viewY < 0 || this.viewX >= this.mapW - this.width
			|| this.viewY >= this.mapH - this.height) {
				return;
			}
			this.viewX = this.viewX + dx;
			this.viewY = this.viewY + dy;
			if (this.viewX <= 0) {
				this.viewX = 0;
			}

			if (this.viewY <= 0) {
				this.viewY = 0;
			}

			if (this.viewX >= this.mapW - this.width) {
				this.viewX = this.mapW - this.width;
			}

			if (this.viewY >= this.mapH - this.height) {
				this.viewY = this.mapH - this.height;
			}

			this.map.moveViewPort(this.viewX, this.viewY);
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