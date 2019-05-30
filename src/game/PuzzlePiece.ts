/**
* name 
*/
module game{
	import Image = Laya.Image;
	import Texture = Laya.Texture;

	export class PuzzlePiece extends Laya.Sprite{
		// 显示用的图片
		public ID:number;
		private image:Texture;
		public tileBg:Image;

		constructor(){
			super();
		}

		public static pieceWithID(ID:number, image:Texture):PuzzlePiece {
			var piece:PuzzlePiece = new PuzzlePiece();

			piece.ID = ID;
			// piece.
			// 设置黑边
			// piece.
			// piece.layer.borderColor = [UIColor whiteColor].CGColor;
			piece.image = image;

			piece.width = image.width;
			piece.height = image.height;
			piece.graphics.loadImage("res/tile.png", 0, 0, piece.width + 2, piece.height + 2);
			
			piece.graphics.drawTexture(image);

			return piece;
		}

		public showNum():void {
			this.graphics.clear();
			this.graphics.loadImage("res/tile.png", 0, 0, this.width, this.height);
			
			// this.graphics.drawRect(0, 0, this.width, this.height, "#ff0000");
			this.graphics.fillText("" + this.ID, this.width>>1, (this.height>>1) - 30, "60px Arial", "#ffffff",  "center");
		}

		public clearNum():void {
			this.graphics.clear();
			this.graphics.loadImage("res/tile.png", 0, 0, this.width + 2, this.height + 2);
			this.graphics.drawTexture(this.image, 1, 1);
		}
	}
}