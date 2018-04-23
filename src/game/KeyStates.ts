/**
* name 
*/
module game{
	export class KeyStates{
		public static UP:number = 0;
		public static DOWN:number = 1;
		public static LEFT:number = 2;
		public static RIGHT:number = 3;

		public static states:number[] = [0, 0, 0, 0]
		constructor(){

		}

		public static isUp():boolean {
			return KeyStates.states[KeyStates.UP] == 1;
		}

		public static isDown():boolean {
			return KeyStates.states[KeyStates.DOWN] == 1;
		}

		public static isLeft():boolean {
			return KeyStates.states[KeyStates.LEFT] == 1;
		}

		public static isRight():boolean {
			return KeyStates.states[KeyStates.RIGHT] == 1;
		}

		public static clearUp():void {
			KeyStates.states[KeyStates.UP] = 0;
		}

		public static clearDown():void {
			KeyStates.states[KeyStates.DOWN] = 0;
		}

		public static clearLeft():void {
			KeyStates.states[KeyStates.LEFT] = 0;
		}

		public static clearRight():void {
			KeyStates.states[KeyStates.RIGHT] = 0;
		}

		public static setUp():void {
			KeyStates.states[KeyStates.UP] = 1;
		}

		public static setDown():void {
			KeyStates.states[KeyStates.DOWN] = 1;
		}

		public static setLeft():void {
			KeyStates.states[KeyStates.LEFT] = 1;
		}

		public static setRight():void {
			KeyStates.states[KeyStates.RIGHT] = 1;
		}
	}
}