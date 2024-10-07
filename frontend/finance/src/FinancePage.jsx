import React, { useState } from 'react';
import SearchArea from './SearchArea';
import ResultArea from './ResultArea';
import axios from 'axios';

const  FinancePage= ()=>{
  const [chartOptions, setChartOptions] = useState(null);
  const [chartOptionsForSpread, setChartOptionsForSpread] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]); // 保存交易历史记录
  const [dailyProfitLoss, setDailyProfitLoss] = useState([]);
  
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

      const calculateProfitLoss = (tradeHistory, stock1Data, stock2Data) => {
        let initialAmount = 10000; // 初始金额
        let investedAmount = initialAmount / 2; // 每只股票投资金额为 5000
        let stock1Quantity = 0;
        let stock2Quantity = 0;
        let cumulativeProfitLoss = 0;
        let dailyProfitLoss = [];
        let isTradeOpen = false;
        let entryDate;
      
        // 使用 for 循环遍历 tradeHistory 来确定开仓和关仓时间点
        for (let tradeIndex = 0; tradeIndex < tradeHistory.length; tradeIndex++) {
          const trade = tradeHistory[tradeIndex];
          const entryPriceStock1 = trade.stock1Price;
          const entryPriceStock2 = trade.stock2Price;
      
          if (trade.type === 'Open') {
            stock1Quantity = Math.floor(investedAmount / entryPriceStock1);
            stock2Quantity = Math.floor(investedAmount / entryPriceStock2);
            isTradeOpen = true;
            entryDate = new Date(trade.date); // 记录开仓日期
          }
      
          // 使用 for 循环遍历每日数据，仅在开仓后的日期内计算损益
          if (isTradeOpen) {
            for (let i = 0; i < stock1Data.length; i++) {
              const [timestamp, stock1ClosePrice] = stock1Data[i];
              const stock2ClosePrice = stock2Data[i][1];
              const currentDate = new Date(timestamp);
      
              // 确保仅从开仓后的第二天开始计算损益
              if (currentDate > entryDate) {
                // 计算当日损益，卖出股票用负号，买入股票用正号
                const profitLoss = -(stock1Quantity * stock1ClosePrice) + (stock2Quantity * stock2ClosePrice);
                cumulativeProfitLoss += profitLoss;
                const percentageChange = ((initialAmount + cumulativeProfitLoss) / initialAmount) * 100;
      
                dailyProfitLoss.push({
                  date: currentDate.toISOString().split('T')[0],
                  profitLoss: profitLoss.toFixed(2),
                  percentageChange: percentageChange.toFixed(2) + '%',
                });
      
                // 如果当前日期是关仓日期，则停止计算
                if (trade.type === 'Close' && trade.date === currentDate.toISOString().split('T')[0]) {
                  console.log('hello')
                  isTradeOpen = false;
                  break; // 立即跳出循环，停止计算损益
                }
              }
            }
          }
        }
      
        return dailyProfitLoss;
      };
      
      
      
      
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
            symbol: lastTrade === SELLSTOCK1 ? 'triangle-down' :'triangle',
            fillColor: lastTrade === SELLSTOCK1 ?'red':'green',
            lineColor: lastTrade === SELLSTOCK1 ?'red':'green',
            lineWidth: 2,
            radius: 6,
          }
          oneStock2Data.marker = {
            enabled:true,
            symbol: lastTrade === SELLSTOCK2 ? 'triangle-down' :'triangle',
            fillColor: lastTrade === SELLSTOCK2 ?'red':'green',
            lineColor: lastTrade === SELLSTOCK2 ?'red':'green',
            lineWidth: 2,
            radius: 6,
          }
          oneSpreadData.marker = {
            enabled:true,
            symbol: lastTrade === SELLSTOCK1 ? 'triangle-down' :'triangle',
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
      let tradeHistory = [];  // 用于存储交易历史记录

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
          // 记录交易数据
          tradeHistory.push({
            date: new Date(timestamp).toISOString().split('T')[0],
            type: 'Open',
            stock1Action: 'SELL',
            stock1Price: Math.exp(stock1Data[index][1]).toFixed(2),
            stock2Action: 'BUY',
            stock2Price: Math.exp(stock2Data[index][1]).toFixed(2),
          });
        } else if ((spreadValue <= lowerBandValue) && !opentrade ) {
          lastTrade = SELLSTOCK2
          TRADETYPE = lastTrade
          opentrade = true
          hasMarker = true
          console.log(spreadValue, "開倉賣 2")
          // 觸碰下標準差，
          // 记录交易数据
          tradeHistory.push({
            date: new Date(timestamp).toISOString().split('T')[0],
            type: 'Open',
            stock1Action: 'BUY',
            stock1Price: Math.exp(stock1Data[index][1]).toFixed(2),
            stock2Action: 'SELL',
            stock2Price: Math.exp(stock2Data[index][1]).toFixed(2),
          });
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
              // 记录关仓交易数据
              tradeHistory.push({
                date: new Date(timestamp).toISOString().split('T')[0],
                type: 'Close',
                stock1Action: lastTrade === SELLSTOCK1 ? 'BUY' : 'SELL',
                stock1Price: Math.exp(stock1Data[index][1]).toFixed(2),
                stock2Action: lastTrade === SELLSTOCK1 ? 'SELL' : 'BUY',
                stock2Price: Math.exp(stock2Data[index][1]).toFixed(2),
              });
            }
          }
        }
        pushSeriesData(timestamp, TRADETYPE, index, hasMarker)
      }

      setTradeHistory(tradeHistory);
      console.log(tradeHistory)
      // 计算每日的损益
      const dailyProfitLoss = calculateProfitLoss(tradeHistory, stock1Data, stock2Data);
      setDailyProfitLoss(dailyProfitLoss); // 保存每日损益数据到状态
      console.log(dailyProfitLoss)

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
      //console.log(chartOptions)
      
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
      <ResultArea chartOptions={chartOptions} chartOptionsForSpread={chartOptionsForSpread} tradeHistory={tradeHistory}/>
    </div>
  );
};

export default FinancePage