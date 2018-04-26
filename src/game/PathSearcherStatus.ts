/**
* name 
*/
module game{
	export interface PathSearcherStatus{
		/// 父状态
		 parentStatus:PathSearcherStatus;

		/// 此状态的唯一标识
		 statusIdentifier():string;

		/// 取所有邻近状态(子状态)，排除父状态。每一个状态都需要给parentStatus赋值。
		 childStatus():PathSearcherStatus[];

	}

}