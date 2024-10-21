import { EntryTable } from "./EntryTable"
import { MddChart } from "./MddChart"
import { RiskTable } from "./RiskTable";
import { StockChart } from "./StockChart";

export function RsiRsult({rsiData}){
    // 檢查 rsiData 是否存在，如果不存在則返回一個 loading 或提示訊息
    if (!rsiData) {
        return <div>please enter paramter</div>;
    }
    console.log('debug',rsiData)
    return(
        <div>
            <EntryTable tradeData={rsiData.trade_data}></EntryTable>
            <MddChart performance_data={rsiData.performance_data}></MddChart>
            <StockChart chartData={rsiData.chart_data}></StockChart>
            <RiskTable performanceData={rsiData.performance_data}></RiskTable>
        </div>
    )
}