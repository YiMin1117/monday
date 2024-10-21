import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

export function StockChart({chartData}){
    if (!chartData) return <div>Loading...</div>;
    const { candle_data, buy_orders, sell_orders } = chartData;
    // 燭台數據處理
    const ohlcData = candle_data.map(item => [
        item.timestamp, // 使用時間戳
        item.open,
        item.high,
        item.low,
        item.close,
    ]);
     // 成交量數據處理
    const volumeData = candle_data.map(item => [
        item.timestamp,
        item.volume,
    ]);

    // 買入標記處理
    const buyMarkers = buy_orders.map(order => ({
        x: order.date, // 使用時間戳
        title: 'B',
        text: `Buy: ${order.price}`,
    }));

    // 賣出標記處理
    const sellMarkers = sell_orders.map(order => ({
        x: order.date, // 使用時間戳
        title: 'S',
        text: `Sell: ${order.price}`,
    }));
    const options = {
        title: {
          text: 'Stock Chart',
        },
        xAxis: {
          type: 'datetime', // 確保 x 軸顯示為時間
        },
        series: [
          {
            type: 'candlestick',
            name: 'OHLC',
            data: ohlcData,
          },
          {
            type: 'column',
            name: 'Volume',
            data: volumeData,
            yAxis: 1,
          },
          {
            type: 'flags',
            name: 'Buy Signals',
            data: buyMarkers,
            color: '#00FF00',
            shape: 'circlepin',
          },
          {
            type: 'flags',
            name: 'Sell Signals',
            data: sellMarkers,
            color: '#FF0000',
            shape: 'circlepin',
          },
        ],
        yAxis: [
          {
            title: {
              text: 'OHLC',
            },
            height: '85%',
            lineWidth: 2,
            resize: {
                enabled: true, // 允許用戶在圖表中手動調整Y軸
            },
          },
          {
            title: {
              text: 'Volume',
            },
            top: '85%',
            height: '15%',
            offset: 0,
            lineWidth: 2,
          },
        ],
        plotOptions: {
            candlestick: {
              color: 'red',        // 下跌時的蠟燭顏色
              upColor: 'green',    // 上漲時的蠟燭顏色
              lineColor: 'red',    // 下跌蠟燭的線條顏色
              upLineColor: 'green' // 上漲蠟燭的線條顏色
            },
        },
    };
    
    return <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={options} />;
}