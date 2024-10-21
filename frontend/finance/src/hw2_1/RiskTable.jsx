import DataTable from 'react-data-table-component';

export function RiskTable ({ performanceData })  {
  const columns = [
    { name: '總績效', selector: row => row.total_return, sortable: true },
    { name: '交易次數', selector: row => row.total_trades, sortable: true },
    { name: '平均績效', selector: row => row.average_return, sortable: true },
    { name: '平均持有天數', selector: row => row.average_holding_days, sortable: true },
    { name: '勝率', selector: row => row.win_rate, sortable: true },
    { name: '平均獲利', selector: row => row.average_profit, sortable: true },
    { name: '平均虧損', selector: row => row.average_loss, sortable: true },
    { name: '賺賠比', selector: row => row.profit_loss_ratio, sortable: true },
    { name: '期望值', selector: row => row.expectancy, sortable: true },
    { name: '獲利平均持有天數', selector: row => row.average_profit_holding_days, sortable: true },
    { name: '虧損平均持有天數', selector: row => row.average_loss_holding_days, sortable: true },
    { name: '最大連續虧損', selector: row => row.max_consecutive_loss, sortable: true },
    { name: '最大資金回落', selector: row => row.max_drawdown, sortable: true },
  ];

  const data = [
    {
      total_return: performanceData.total_return,
      total_trades: performanceData.total_trades,
      average_return: performanceData.average_return,
      average_holding_days: performanceData.average_holding_days,
      win_rate: performanceData.win_rate,
      average_profit: performanceData.average_profit,
      average_loss: performanceData.average_loss,
      profit_loss_ratio: performanceData.profit_loss_ratio,
      expectancy: performanceData.expectancy,
      average_profit_holding_days: performanceData.average_profit_holding_days,
      average_loss_holding_days: performanceData.average_loss_holding_days,
      max_consecutive_loss: performanceData.max_consecutive_loss,
      max_drawdown: performanceData.max_drawdown,
    },
  ];

  return (
    <DataTable
      title="Performance Data Table"
      columns={columns}
      data={data}
      pagination
      highlightOnHover
      striped
    />
  );
};


