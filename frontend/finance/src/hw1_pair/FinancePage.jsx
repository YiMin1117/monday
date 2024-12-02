import React, { useState } from 'react';
import { NavBar } from "../NavBar";
import SearchArea from './SearchArea';
import ResultArea from './ResultArea';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const  FinancePage= ()=>{
  const [chartOptions, setChartOptions] = useState(null);
  const [chartOptionsForSpread, setChartOptionsForSpread] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]); // 保存交易历史记录
  const [dailyProfitLoss, setDailyProfitLoss] = useState([]);
  const [tradeDetails,setTradeDetails]=useState([])
  const [filename, setFilename] = useState(''); // 定義 filename 狀態
  
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
        let lastProfitLoss = 0; // 用于记录最后一次关仓时的损益
        let dailyProfitLoss = [];
        let entryDate;
        let closeDate = null;
        let tradeDetails = [];
      
        for (let i = 0; i < tradeHistory.length; i += 2) {
          // 每次处理成对的交易，确保一个完整的开仓和关仓周期
          const openTrade = tradeHistory[i];
          const closeTrade = tradeHistory[i + 1];
      
          if (openTrade.type === 'Open' && closeTrade.type === 'Close') {
            // 处理开仓逻辑
            const entryPriceStock1 = openTrade.stock1Price;
            const entryPriceStock2 = openTrade.stock2Price;
            console.log('entrypriceof1:',entryPriceStock1,'entrypriceof2',entryPriceStock2)
            stock1Quantity = investedAmount / entryPriceStock1;
            stock2Quantity = investedAmount / entryPriceStock2;
            entryDate = new Date(openTrade.date);
            closeDate = new Date(closeTrade.date);
            console.log('第一章股票買幾張?:',stock1Quantity,'第二支股票買幾章?',stock2Quantity)
            // 确定买卖操作
            const stock1Action = openTrade.stock1Action.toUpperCase();
            const stock2Action = openTrade.stock2Action.toUpperCase();
            // 添加开仓交易详情到 tradeDetails 数组（不包含 percentageChange）
            tradeDetails.push({
              date: openTrade.date,
              type: openTrade.type,
              stock1Action: openTrade.stock1Action,
              stock1Price: openTrade.stock1Price,
              stock2Action: openTrade.stock2Action,
              stock2Price: openTrade.stock2Price,
              percentageChange: '-', // 空值表示没有计算百分比
            });
            // 遍历每日数据，仅在开仓后的日期内计算损益，直到关仓
            let isTradeOpen = true;
            for (let j = 0; j < stock1Data.length && isTradeOpen; j++) {
              const [timestamp, stock1LogPrice] = stock1Data[j];
              const stock2LogPrice = stock2Data[j][1];
              const currentDate = new Date(timestamp);

              // Convert logarithmic prices back to linear scale
              const stock1ClosePrice = Math.exp(stock1LogPrice);
              const stock2ClosePrice = Math.exp(stock2LogPrice);
              if (currentDate > entryDate) {
                let profitLoss = 0;
                if (stock1Action === 'SELL' && stock2Action === 'BUY') {
                  profitLoss = -(stock1Quantity * stock1ClosePrice) + (stock2Quantity * stock2ClosePrice);
                  console.log('type1','第一支股票當日價格',stock1ClosePrice,'第2支股票當日價格',stock2ClosePrice,'todaypro',profitLoss,'data',currentDate)
                } else if (stock1Action === 'BUY' && stock2Action === 'SELL') {
                  profitLoss = -(stock2Quantity * stock2ClosePrice) + (stock1Quantity * stock1ClosePrice);
                  console.log('type2','第一支股票當日價格',stock1ClosePrice,'第2支股票當日價格',stock2ClosePrice,'todaypro',profitLoss,'data',currentDate)
                }
                const nextDate = new Date(currentDate);
                nextDate.setDate(nextDate.getDate() + 1);
                const percentageChange = ((initialAmount + profitLoss) / initialAmount) * 100;
                console.log('daily pro percent',percentageChange)
                dailyProfitLoss.push({
                  date: nextDate.toISOString().split('T')[0],
                  profitLoss: profitLoss.toFixed(2),
                  percentageChange: percentageChange.toFixed(2) + '%',
                });
                
      
                // 如果达到关仓日期，保持损益状态并退出循环
                if (currentDate >= closeDate) {
                  lastProfitLoss = profitLoss;
                  isTradeOpen = false; // 关闭交易状态

                  // 添加关仓交易详情到 tradeDetails 数组（包含 percentageChange）
                  tradeDetails.push({
                    date: closeTrade.date,
                    type: closeTrade.type,
                    stock1Action: closeTrade.stock1Action,
                    stock1Price: closeTrade.stock1Price,
                    stock2Action: closeTrade.stock2Action,
                    stock2Price: closeTrade.stock2Price,
                    percentageChange: percentageChange.toFixed(2) + '%',
                  });
                }
              }
            }
          }
      
          // 保持损益状态在关仓到下一次开仓之间
          if (closeDate) {
            for (let j = 0; j < stock1Data.length; j++) {
              const [timestamp] = stock1Data[j];
              const currentDate = new Date(timestamp);
      
              // 在关仓到下一次开仓之间，维持损益不变
              if (currentDate > closeDate && (!tradeHistory[i + 2] || currentDate < new Date(tradeHistory[i + 2].date))) {
                dailyProfitLoss.push({
                  date: currentDate.toISOString().split('T')[0],
                  profitLoss: lastProfitLoss.toFixed(2),
                  percentageChange: (((initialAmount + lastProfitLoss) / initialAmount) * 100).toFixed(2) + '%',
                });
              }
            }
          }
        }
        console.log('Trade Details:', tradeDetails);
        setTradeDetails(tradeDetails)
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
          //console.log(spreadValue, "開倉賣 1")
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
          //console.log(spreadValue, "開倉賣 2")
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
              //console.log(spreadValue, "關倉!")
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
      
      //console.log(tradeHistory)
      // 计算每日的损益
      const dailyProfitLoss = calculateProfitLoss(tradeHistory, stock1Data, stock2Data);
      setDailyProfitLoss(dailyProfitLoss); // 保存每日损益数据到状态
      //console.log(dailyProfitLoss)

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
  const handleAddTrack = async (formData) => {
    const { stock1, stock2, startDate, endDate, nStd, windowSize } = formData;

    try {
      const response = await fetch('http://127.0.0.1:8000/track/add_track/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock1,
          stock2,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          n_std: nStd,
          window_size: windowSize,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Track added successfully!');
        setFilename(data.filename); // 保存生成的 JSON 文件名稱
      } else {
        alert('Failed to add track.');
      }
    } catch (error) {
      console.error('Error adding track:', error);
    }
  };

  return (
    <div className="bg-neutral-400 p-5 flex flex-col justify-center pt-16">
      <NavBar></NavBar>
      <SearchArea onSearch={handleSearch} onAddTrack={handleAddTrack} />
      <ResultArea chartOptions={chartOptions} chartOptionsForSpread={chartOptionsForSpread} tradeHistory={tradeHistory} dailyProfitLoss={dailyProfitLoss} tradeDetails={tradeDetails} />
    </div>
  );
};

export default FinancePage