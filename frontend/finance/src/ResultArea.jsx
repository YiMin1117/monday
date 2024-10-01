import React from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

const ResultArea = ({ chartOptions, chartOptionsForSpread }) => {
  return (
    <div>
      <div>
        {chartOptions ? (
          <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={chartOptions} />
        ) : (
          <p>請輸入參數後查看股票對數價格圖表</p>
        )}
      </div>
      
      <div>
        {chartOptionsForSpread ? (
          <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={chartOptionsForSpread} />
        ) : (
          <p>請輸入參數後查看Spread圖表</p>
        )}
      </div>
    </div>
  );
};

export default ResultArea;
