import React from 'react';
import DataTable from 'react-data-table-component';

const TradeHistoryTable = ({ tradeHistory}) => {
  const columns = [
    { name: 'Date', selector: row => row.date, sortable: true },
    { name: 'Type', selector: row => row.type, sortable: true },
    { name: 'Action of stock1', selector: row => row.stock1Action, sortable: true },
    { name: 'Price of stock1', selector: row => row.stock1Price, sortable: true },
    { name: 'Action of stock2', selector: row => row.stock2Action, sortable: true },
    { name: 'Price of stock2', selector: row => row.stock2Price, sortable: true },
  ];

  return (
    <div className="mt-4">
      <DataTable
        columns={columns}
        data={tradeHistory}
        pagination
        highlightOnHover
        striped
        responsive
        noHeader
      />
    </div>
  );
};

export default TradeHistoryTable;
