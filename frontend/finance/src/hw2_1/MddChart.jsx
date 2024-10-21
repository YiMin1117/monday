import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export function MddChart({performance_data}){
    const { acc_ret, dd, new_high }=performance_data;
    // 整理資料格式，準備給 Highcharts 繪製圖表
    const accRetData = acc_ret.map((value, index) => [index, value]);
    const ddData = dd.map((value, index) => [index, value]);
    const newHighData = new_high
        .map((value, index) => (value === 1 ? [index, acc_ret[index]] : null))
        .filter((point) => point !== null);
    const options = {
        chart: {
            type: 'line',
            zoomType: 'x',
        },
        title: {
            text: '報酬率 & MDD走勢圖',
        },
        xAxis: {
            title: {
            text: '時間',
            },
            labels: {
            formatter: function () {
                return ` ${this.value}`;
            },
            },
        },
        yAxis: {
            title: {
            text: '價值',
            },
            plotLines: [
            {
                value: 1,
                color: 'red',
                width: 1,
                zIndex: 5,
                dashStyle: 'Dash',
            },
            ],
        },
        series: [
            {
            name: '利潤 (acc_ret)',
            data: accRetData,
            color: '#2b908f',
            tooltip: {
                valueDecimals: 2,
            },
            },
            {
            name: '最大回撤 (dd)',
            data: ddData,
            color: '#f45b5b',
            tooltip: {
                valueDecimals: 2,
            },
            },
            
        ],
        tooltip: {
            shared: true,
            crosshairs: true,
        },
        };
    return <HighchartsReact highcharts={Highcharts} options={options} />;
    
}