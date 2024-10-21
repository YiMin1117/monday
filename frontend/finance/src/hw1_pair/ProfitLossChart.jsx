import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const ProfitLossChart = ({ dailyProfitLoss = [] }) => {
  // Check if data exists before mapping
  const chartData = dailyProfitLoss && dailyProfitLoss.length > 0 
    ? dailyProfitLoss.map((point) => [new Date(point.date).getTime(), parseFloat(point.percentageChange.replace('%', ''))]) 
    : [];

  // Highcharts configuration object
  const options = {
    chart: {
      type: 'line',
      zoomType: 'x', // Allow zooming on the x-axis
    },
    title: {
      text: 'Daily Profit and Loss',
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date',
      },
    },
    yAxis: {
      title: {
        text: 'Profit/Loss',
      },
      plotLines: [
        {
          value: 0,
          color: 'red',
          width: 2,
          zIndex: 5,
          dashStyle: 'Dash', // Use a dashed line to indicate the break-even point
        },
      ],
    },
    tooltip: {
      headerFormat: '<b>{point.x:%e %b %Y}</b><br/>',
      pointFormat: 'Profit/Loss: {point.y:.2f}',
    },
    series: [
      {
        name: 'Profit/Loss',
        data: chartData,
        color: '#2b908f',
        marker: {
          enabled: true,
          radius: 1,
        },
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default ProfitLossChart;
