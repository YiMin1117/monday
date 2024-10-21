import React from 'react';
import DataTable from 'react-data-table-component';

export function EntryTable ({ tradeData }){
  // 定義表格的列
  const columns = [
    { name: '買賣別', selector: row => row[1], sortable: true },
    { name: '買進日', selector: row => new Date(row[2]).toISOString().split('T')[0], sortable: true },
    { name: '買進價格', selector: row => row[3], sortable: true },
    { name: '賣出日', selector: row => new Date(row[4]).toISOString().split('T')[0], sortable: true },
    { name: '賣出價格', selector: row => row[5], sortable: true },
    { name: '買賣股數', selector: row => row[6], sortable: true },
    { name: '獲利', selector: row => (row[5] - row[3]).toFixed(2), sortable: true },
    { name: '累計獲利', selector: (row, index) => calculateCumulativeProfit(tradeData, index), sortable: true },
  ];

  // 計算累計獲利的函數
  const calculateCumulativeProfit = (data, index) => {
    let cumulativeProfit = 0;
    for (let i = 0; i <= index; i++) {
      cumulativeProfit += data[i][5] - data[i][3];
    }
    return cumulativeProfit.toFixed(2);
  };

  return (
    <div className="mt-4">
      <DataTable
        title="交易明細"
        columns={columns}
        data={tradeData}
        pagination
        highlightOnHover
        striped
      />
    </div>
  );
};


