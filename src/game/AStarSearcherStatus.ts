/**
* name 
*/
module game{
	export interface AStarSearcherStatus extends PathSearcherStatus{
				gValue:number;
				/// 从当前状态到目标状态的估算代价
				hValue:number;
				// 总代价f = g + h
				fValue:number;
				/// 估价函数，估算从当前状态到目标状态的代价
				estimateToTargetStatus(targetStatus:PathSearcherStatus):number;
	}
}