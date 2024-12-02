import React from 'react';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { NavBar } from '../NavBar';

const HomePage = () => {
 const data = [
    {
      category: '基本面分析',
      items: [
        { name: '股票定價策略', path: '/pricing-strategy' },
        { name: '本益比河流圖', path: '/pe-flow-chart' },
        { name: '通膨分析', path: '/inflation-analysis' },
      ],
    },
    {
      category: '技術面分析',
      items: [{ name: '天花板地板線', path: '/ceiling-floor' }],
    },
    {
      category: '其他分析',
      items: [
        { name: '熱門個股研究報告', path: '/stock-research' },
        { name: '熱門個股新聞', path: '/stock-news' },
        { name: '法說會與投資建議', path: '/investment-advice' },
      ],
    },
  ];

  const columns = [
    {
      name: '分類',
      selector: row => row.category,
      sortable: true,
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
      },
    },
    {
      name: '功能',
      cell: row => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {row.items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              style={{
                padding: '10px 15px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '16px',
                color: 'blue',
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      ),
    },
  ];

  const customStyles = {
    rows: {
      style: {
        fontSize: '16px', // 調整表格字體大小
      },
    },
    headCells: {
      style: {
        fontSize: '18px', // 調整表頭字體大小
        fontWeight: 'bold',
      },
    },
  };

  return (
    <div className="bg-neutral-400 p-5 flex flex-col justify-center pt-16">
      <NavBar></NavBar>
      <div className="p-5">
      <h2 className="text-2xl font-bold mb-4"></h2>
        <DataTable
            columns={columns}
            data={data}
            noHeader
            striped
            highlightOnHover
            customStyles={customStyles}
        />
      </div>
    </div>
  );
};

export default HomePage;
