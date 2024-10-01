import React, { useState } from 'react';
import SearchArea from './SearchArea';
import ResultArea from './ResultArea';
import axios from 'axios';

const  FinancePage= ()=>{
  const [chartOptions, setChartOptions] = useState(null);
  const [chartOptionsForSpread, setChartOptionsForSpread] = useState(null);

  const calculateMovingAverage = (data, windowSize) => {
    // 0: (2) [1609689600000, -0.3428325549615625]
    // 1: (2) [1609776000000, -0.3335018769493088]...

    return data.map((_, index, array) => {
      if (index < windowSize - 1) {
        return [array[index][0], null]; // 在window大小之前，不計算移動平均
      }
      const windowData = array.slice(index - windowSize + 1, index + 1);//往前199 但不包括end
      const average =windowData.reduce((sum, point) => sum + point[1], 0) / windowSize;
      return [array[index][0], average];
    });
  };
  
  // 計算標準差
  const calculateStandardDeviation = (data, movingAvgData, windowSize) => {
    return data.map((_, index, array) => {
      if (index < windowSize - 1) {
        return [array[index][0], null]; // 在window大小之前，不計算標準差
      }
      const windowData = array.slice(index - windowSize + 1, index + 1);
      const avg = movingAvgData[index][1];
      const variance =
        windowData.reduce((sum, point) => sum + Math.pow(point[1] - avg, 2), 0) /
        windowSize;
      const stddev = Math.sqrt(variance);
      return [array[index][0], stddev];
    });
  };
  // 這個函數將來自 SearchArea 的參數應用於查詢後的結果處理
  const handleSearch = async (formData) => {
    const { stock1, stock2, startDate, endDate, nStd, windowSize } = formData;
  
    try {
      // 使用 axios 發送 GET 請求到 API 獲取數據
      const response = await axios.get('http://127.0.0.1:8000/finance/api/get-stock-data', {
        params: {
          stock1,
          stock2,
          start: startDate.toISOString().split('T')[0], // 格式化開始日期為 YYYY-MM-DD
          end: endDate.toISOString().split('T')[0],     // 格式化結束日期為 YYYY-MM-DD
          nStd,  // 這裡假設 API 支持 nStd 和 windowSize 作為參數
          windowSize,
        },
      });
  
      const stock1Data = response.data.stock1.map((point) => [
        new Date(point.Date).getTime(), // 將日期轉換為毫秒時間戳
        Math.log(point.Close),                     // 股票收盤價
      ]);
  
      const stock2Data = response.data.stock2.map((point) => [
        new Date(point.Date).getTime(), 
        Math.log(point.Close),
      ]);
      const spreadData = stock1Data.map((stock1point, index) => {
        const timestamp = stock1point[0];
        if (!stock2Data[index] || stock2Data[index][0] !== timestamp) {
          console.error(`Error: stock2Data at index ${index} is missing or timestamp mismatch`);
          return [timestamp, null];  // 如果數據不同步，返回 null
        }
        const stock1LogClose = stock1point[1];
        const stock2LogClose = stock2Data[index][1];
        const spread = stock1LogClose - stock2LogClose;
        return [timestamp, spread];
      });
      console.log(spreadData)
      // 計算移動平均
      const movingAvgData = calculateMovingAverage(spreadData, windowSize);

      // 計算標準差
      const stdDevData = calculateStandardDeviation(spreadData, movingAvgData, windowSize);
      
      // 計算正負標準差線
      const upperBand = stdDevData.map((point, index) => {
        if (point[1] === null) return [point[0], null];
        return [point[0], movingAvgData[index][1] + point[1] * nStd]; // 上標準差
      });

      const lowerBand = stdDevData.map((point, index) => {
        if (point[1] === null) return [point[0], null];
        return [point[0], movingAvgData[index][1] - point[1] * nStd]; // 下標準差
      });


      let opentrade = false;  // true 代表open
      let lastTrade ;
      const marker = [[],[],[]];    // 儲存所有標記的交易點
      const sellmark1 = 'a';
      const sellmark2 = 'b';
      function pushMarkers (marker,timestamp,lastTrade,index){
        marker[0].push({
           
            symbol: lastTrade === sellmark1 ? 'triangle-down' :'triangle-up',
            fillColor: lastTrade === sellmark1 ?'red':'green',
            lineColor: lastTrade === sellmark1 ?'red':'green',
            lineWidth: 2,
            radius: 6,
          
         
        })
        marker[1].push({
         
            symbol: lastTrade === sellmark2 ? 'triangle-down' :'triangle-up',
            fillColor: lastTrade === sellmark2 ?'red':'green',
            lineColor: lastTrade === sellmark2 ?'red':'green',
            lineWidth: 2,
            radius: 6,
          
          
        })
        marker[2].push({
          
            symbol: lastTrade === sellmark1 ? 'triangle-down' :'triangle-up',
            fillColor: lastTrade === sellmark1 ?'red':'green',
            lineColor: lastTrade === sellmark1 ?'red':'green',
            lineWidth: 2,
            radius: 6,
         
        })
      }
      // 遍歷 spread 數據並標記交易點
      spreadData.forEach((point, index) => {
        const timestamp = point[0];
        const spreadValue = point[1];
        const upperBandValue = upperBand[index] ? upperBand[index][1] : null;
        const lowerBandValue = lowerBand[index] ? lowerBand[index][1] : null;
        const movingAvgValue = movingAvgData[index] ? movingAvgData[index][1] : null;
        
        if ((spreadValue >= upperBandValue) && !opentrade) {
          lastTrade=sellmark1
          // 觸碰上標準差，
          pushMarkers(marker,timestamp,sellmark1,index)
          opentrade = true

        } else if ((spreadValue <= lowerBandValue) && !opentrade ) {
          lastTrade=sellmark2
          // 觸碰下標準差，
          pushMarkers(marker,timestamp,sellmark2,index)
          opentrade = true
        } else if ((spreadValue === movingAvgValue) && opentrade) {
          // 碰到移動平均，反向操作並關倉
          opentrade = false
          pushMarkers(marker,timestamp,lastTrade === sellmark1?sellmark2:sellmark1,index)
          console.log('碰到了中現')
  
        }
      });

      // 設置 Highcharts 圖表選項，顯示股票數據
      setChartOptions({
        rangeSelector: { selected: 1 },
        title: { text: `${stock1} vs ${stock2} 股票比較` },
        xAxis: { type: 'datetime' },
        yAxis: { title: { text: '價格 (USD)' } },
        series: [
          {
            name: stock1,
            data: stock1Data,  // 來自 API 的 stock1 數據
            marker:marker[0],
            tooltip: { valueDecimals: 2 },
          },
          {
            name: stock2,
            data: stock2Data,  // 來自 API 的 stock2 數據
            marker:marker[1],
            tooltip: { valueDecimals: 2 },
          },
        ],
        
      });
      console.log(chartOptions)
      
      setChartOptionsForSpread({
        rangeSelector: { selected: 1 },
        title: { text: `Spread (對數差值)` },
        xAxis: { type: 'datetime' },
        yAxis: { title: { text: 'Spread (對數差值)' } },  // 表示 spread 的 Y 軸
        series: [
          {
            name: 'Trade Markers',
            type: 'scatter',  // 作為散點圖顯示買賣信號
            data: spreadData,
            marker:marker[2],  
            tooltip: {
              pointFormat: '{point.name}: {point.y:.4f}',
            },
          },
          {
            name: 'Spread (對數差值)',
            data: spreadData,  // 計算得到的 spread 數據
            tooltip: { valueDecimals: 4 },
          },
          {
            name: '移動平均',
            data: movingAvgData,
            tooltip: { valueDecimals: 4 },
            color: 'blue',
          },
          {
            name: `+${nStd} 標準差`,
            data: upperBand,
            tooltip: { valueDecimals: 4 },
            color: 'red',
            dashStyle: 'Dash', // 使用虛線顯示
          },
          {
            name: `-${nStd} 標準差`,
            data: lowerBand,
            tooltip: { valueDecimals: 4 },
            color: 'red',
            dashStyle: 'Dash', // 使用虛線顯示
          },
          
        ],
      });
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // 你可以在這裡設置錯誤處理邏輯，告訴用戶請求失敗
    }
  };

  return (
    <div>
      <SearchArea onSearch={handleSearch} />
      <ResultArea chartOptions={chartOptions} chartOptionsForSpread={chartOptionsForSpread} />
    </div>
  );
};

export default FinancePage