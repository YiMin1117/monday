import React from 'react';
import DataTable from 'react-data-table-component';

const TradeDetailsTable = ({ tradeDetails }) => {
  const columns = [
    { name: 'Date', selector: row => row.date, sortable: true },
    { name: 'Type', selector: row => row.type, sortable: true },
    { name: 'Action of AAPL', selector: row => row.stock1Action, sortable: true },
    { name: 'Price of AAPL', selector: row => row.stock1Price, sortable: true },
    { name: 'Action of GLD', selector: row => row.stock2Action, sortable: true },
    { name: 'Price of GLD', selector: row => row.stock2Price, sortable: true },
    { 
      name: 'Percentage of Profit/Loss (%)', 
      selector: row => row.percentageChange, // Use the correct field name
      sortable: true,
      right: true 
    },
  ];

  return (
    <div className="mt-4">
      <DataTable
        title="Trade History"
        columns={columns}
        data={tradeDetails}
        pagination
        highlightOnHover
        striped
      />
    </div>
  );
};

export default TradeDetailsTable;
