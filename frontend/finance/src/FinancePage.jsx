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
      
      let stock1Data, stock2Data, spreadData;
      let dataLength;
      let movingAvgData, stdDevData, upperBand, lowerBand;

      stock1Data = response.data.stock1.map((point) => [
        new Date(point.Date).getTime(), // 將日期轉換為毫秒時間戳
        Math.log(point.Close),                     // 股票收盤價
      ]);
  
      stock2Data = response.data.stock2.map((point) => [
        new Date(point.Date).getTime(), 
        Math.log(point.Close),
      ]);

      spreadData = stock1Data.map((stock1point, index) => {
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
      dataLength = spreadData.length;
      // 計算移動平均
      movingAvgData = calculateMovingAverage(spreadData, windowSize);
      // 計算標準差
      stdDevData = calculateStandardDeviation(spreadData, movingAvgData, windowSize);
      // 計算正負標準差線
      upperBand = stdDevData.map((point, index) => {
        if (point[1] === null) return [point[0], null];
        return [point[0], movingAvgData[index][1] + point[1] * nStd]; // 上標準差
      });
      lowerBand = stdDevData.map((point, index) => {
        if (point[1] === null) return [point[0], null];
        return [point[0], movingAvgData[index][1] - point[1] * nStd]; // 下標準差
      });


      function pushSeriesData (timestamp, lastTrade, index, hasMarker){
        let oneStock1Data = {
          x:timestamp,
          y:stock1Data[index][1],
        }
        let oneStock2Data = {
          x:timestamp,
          y:stock2Data[index][1],
        }
        let oneSpreadData = {
          x:timestamp,
          y:spreadData[index][1]
        }
        if (hasMarker){
          oneStock1Data.marker = {
            enabled:true,
            symbol: lastTrade === SELLSTOCK1 ? 'triangle-down' :'triangle-up',
            fillColor: lastTrade === SELLSTOCK1 ?'red':'green',
            lineColor: lastTrade === SELLSTOCK1 ?'red':'green',
            lineWidth: 2,
            radius: 6,
          }
          oneStock2Data.marker = {
            enabled:true,
            symbol: lastTrade === SELLSTOCK2 ? 'triangle-down' :'triangle-up',
            fillColor: lastTrade === SELLSTOCK2 ?'red':'green',
            lineColor: lastTrade === SELLSTOCK2 ?'red':'green',
            lineWidth: 2,
            radius: 6,
          }
          oneSpreadData.marker = {
            enabled:true,
            symbol: lastTrade === SELLSTOCK1 ? 'triangle-down' :'triangle-up',
            fillColor: lastTrade === SELLSTOCK1 ?'red':'green',
            lineColor: lastTrade === SELLSTOCK1 ?'red':'green',
            lineWidth: 2,
            radius: 6,
          }
        }
        stock1SeriesData.push(oneStock1Data)
        stock2SeriesData.push(oneStock2Data)
        spreadSeriesData.push(oneSpreadData)
      }


      let opentrade = false;  // true 代表open
      let lastTrade ;
      let stock1SeriesData = [], stock2SeriesData = [], spreadSeriesData = [];
      const SELLSTOCK1 = 'a', SELLSTOCK2 = 'b';
      let previousSign = null, currentSign;
      for (let index = 0; index < dataLength; index++) {
        let TRADETYPE = lastTrade;
        let hasMarker = false;
        const [timestamp, spreadValue] = spreadData[index];
        const upperBandValue = upperBand[index][1];
        const lowerBandValue = lowerBand[index][1];
        const movingAvgValue = movingAvgData[index][1];
        
        if (upperBandValue === null){
          pushSeriesData(timestamp, "", index, false)
          continue;
        }
        if ((spreadValue >= upperBandValue) && !opentrade) {
          lastTrade = SELLSTOCK1
          TRADETYPE = lastTrade
          opentrade = true
          hasMarker = true
          console.log(spreadValue, "開倉賣 1")
          // 觸碰上標準差，
        } else if ((spreadValue <= lowerBandValue) && !opentrade ) {
          lastTrade = SELLSTOCK2
          TRADETYPE = lastTrade
          opentrade = true
          hasMarker = true
          console.log(spreadValue, "開倉賣 2")
          // 觸碰下標準差，
        } else{
          currentSign = (spreadValue - movingAvgValue) > 0 ? '+' : '-';
          hasMarker = false;
          if (previousSign !== currentSign){
            previousSign = currentSign
            if (opentrade){
              opentrade = false
              TRADETYPE = lastTrade === SELLSTOCK1 ? SELLSTOCK2 : SELLSTOCK1;
              hasMarker = true
              console.log(spreadValue, "關倉!")
            }
          }
        }
        pushSeriesData(timestamp, TRADETYPE, index, hasMarker)
      }
      
      // 遍歷 spread 數據並標記交易點
      // spreadData.forEach((point, index) => {
      //   const timestamp = point[0];
      //   const spreadValue = point[1];
      //   const upperBandValue = upperBand[index] ? upperBand[index][1] : null;
      //   const lowerBandValue = lowerBand[index] ? lowerBand[index][1] : null;
      //   const movingAvgValue = movingAvgData[index] ? movingAvgData[index][1] : null;
        
      //   if ((spreadValue >= upperBandValue) && !opentrade) {
      //     lastTrade=sellmark1
      //     // 觸碰上標準差，
      //     pushMarkers(marker,timestamp,sellmark1,index)
      //     opentrade = true

      //   } else if ((spreadValue <= lowerBandValue) && !opentrade ) {
      //     lastTrade=sellmark2
      //     // 觸碰下標準差，
      //     pushMarkers(marker,timestamp,sellmark2,index)
      //     opentrade = true
      //   } else if ((spreadValue === movingAvgValue) && opentrade) {
      //     // 碰到移動平均，反向操作並關倉
      //     opentrade = false
      //     pushMarkers(marker,timestamp,lastTrade === sellmark1?sellmark2:sellmark1,index)
      //     console.log('碰到了中現')
  
      //   }
      // });

      // 設置 Highcharts 圖表選項，顯示股票數據
      setChartOptions({
        rangeSelector: { selected: 1 },
        title: { text: `${stock1} vs ${stock2} 股票比較` },
        xAxis: { type: 'datetime' },
        yAxis: { title: { text: '價格 (USD)' } },
        series: [
          {
            name: stock1,
            data: stock1SeriesData,  // 來自 API 的 stock1 數據
            tooltip: { valueDecimals: 2 },
          },
          {
            name: stock2,
            data: stock2SeriesData,  // 來自 API 的 stock2 數據
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
            name: 'Spread (對數差值)',
            data: spreadSeriesData,  // 計算得到的 spread 數據
            tooltip: { valueDecimals: 8 },
          },
          {
            name: '移動平均',
            data: movingAvgData,
            tooltip: { valueDecimals: 8 },
            color: 'blue',
          },
          {
            name: `+${nStd} 標準差`,
            data: upperBand,
            tooltip: { valueDecimals: 8 },
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