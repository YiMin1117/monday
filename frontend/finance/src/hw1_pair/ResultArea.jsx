import React from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import TradeHistoryTable from './TradeHistoryTable';
import ProfitLossChart from './ProfitLossChart';
import TradeDetailsTable from './TradeDetailsTable';

const ResultArea = ({ chartOptions, chartOptionsForSpread,tradeHistory,dailyProfitLoss,tradeDetails }) => {
  return (
  <div className="flex flex-wrap justify-center gap-4 p-4 bg-gray-100">
    <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-4/5">
      {chartOptions ? (
        <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={chartOptions} />
      ) : (
        <p>請輸入參數後查看股票對數價格圖表</p>
      )}
    </div>

    <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-4/5">
      {chartOptionsForSpread ? (
        <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={chartOptionsForSpread} />
      ) : (
        <p>請輸入參數後查看Spread圖表</p>
      )}
    </div>
    <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-4/5">
      <TradeHistoryTable tradeHistory={tradeHistory} />
    </div>
    <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-4/5">
      <ProfitLossChart dailyProfitLoss={dailyProfitLoss} />
    </div>
    <div className="bg-white shadow-lg rounded-lg p-4 w-full lg:w-4/5">
      <TradeDetailsTable tradeDetails={tradeDetails} />
    </div>
  </div>


  );
};

export default ResultArea;
