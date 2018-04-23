/**
* 1 负责地图加载；
* 2 负责接收用户输入
* 3 监听到game_init 就进行地图加载，默认是 scene_default.json
* 4 object 默认坐标是 左下角的坐标.地图编辑器貌似给的是左上角的坐标，所以需要修正额外加上 TileH
* 5 所有物体之间的碰撞都是通过object的 skillId来进行处理的
*/
var game;
(function (game) {
    var TiledMap = Laya.TiledMap;
    var Rectangle = Laya.Rectangle;
    var Scene = /** @class */ (function () {
        function Scene() {
            this.clickHandler = function (e) {
                console.log("click:" + e.target);
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
                var b = this.map.getTileProperties(0, a - 1, "isPass");
                console.log("the custom attribute is:" + a + "-" + b);
            };
        }
        Scene.prototype.init = function () {
            var _this = this;
            this.width = Laya.stage.width;
            this.height = Laya.stage.height;
            this.viewX = 0;
            this.viewY = 0;
            game.EventBus.bus.on(game.Event.GAME_INIT, this, function () {
                _this.loadScene(Scene.DEFAULT_SCENE);
            });
            game.EventBus.bus.on(game.Event.GAME_CHANGE_SCENE, this, function (file) {
                _this.loadScene(file);
            });
            game.EventBus.bus.on(game.Event.MOVE_VIEW_POINT, this, this.moveViewPoint);
            console.log("init finished");
        };
        /**
         * 返回目标所有的技能
         */
        Scene.prototype.getSkillId = function (col, row) {
            var ret = [];
            var id = this.skill.getTileData(col, row);
            var skillId = this.map.getTileProperties(0, id - 1, "skillId");
            console.log("check skillId " + skillId);
            return skillId;
        };
        /**
         * 判断是否可以通过
         */
        Scene.prototype.canPass = function (col, row) {
            var ret = [];
            var id = this.layer.getTileData(col, row);
            var skillId = this.map.getTileProperties(0, id - 1, "skillId");
            console.log("check pass " + skillId);
            return skillId == 0;
        };
        Scene.prototype.loadScene = function (sceneFile) {
            this.map = new TiledMap();
            this.map.createMap(sceneFile, new Rectangle(0, 0, this.width, this.height), new Laya.Handler(this, this.completeHandler, [sceneFile], false));
            Laya.stage.on(Laya.Event.CLICK, this, this.clickHandler);
        };
        Scene.prototype.completeHandler = function (sceneFile) {
            console.log(sceneFile + " load map completed!!");
            this.sceneName = sceneFile;
            this.mapW = this.map.width;
            this.mapH = this.map.height;
            game.EventBus.bus.event(game.Event.GAME_ENTER_SCENE, this);
            this.layer = this.map.getLayerByIndex(0);
            this.skill = this.map.getLayerByIndex(1);
        };
        Scene.prototype.moveViewPoint = function (dx, dy) {
            console.log("map " + this.viewX + " " + this.viewY + " " + this.mapW + " " + this.width);
            if (this.viewX < 0 || this.viewY < 0 || this.viewX >= this.mapW - this.width
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
        };
        Scene.DEFAULT_SCENE = "res/binaryland.json";
        return Scene;
    }());
    game.Scene = Scene;
})(game || (game = {}));
//# sourceMappingURL=Scene.js.map