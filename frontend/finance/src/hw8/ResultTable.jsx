import React, { useState } from "react";
import { Card, Collapse, Button } from "react-bootstrap";
import DataTable from "react-data-table-component";

const ResultTable = ({ data }) => {
  const [activeCollapse, setActiveCollapse] = useState(null); // 控制展开的部分

  const toggleCollapse = (key) => {
    setActiveCollapse((prev) => (prev === key ? null : key));
  };

  const tableConfigs = {
    dividend_prices: {
      title: "股利法 計算數據",
      columns: [
        { name: "股利發放年度", selector: (row) => row.Column0, sortable: true },
        { name: "現金股利盈餘", selector: (row) => row.Column1, sortable: true },
        { name: "現金股利公積", selector: (row) => row.Column2, sortable: true },
        { name: "現金股利合計", selector: (row) => row.Column3, sortable: true },
        { name: "股票股利盈餘", selector: (row) => row.Column4, sortable: true },
        { name: "股票股利公積", selector: (row) => row.Column5, sortable: true },
        { name: "股票股利合計", selector: (row) => row.Column6, sortable: true },
        { name: "股利合計", selector: (row) => row.Column7, sortable: true },
      ],
      rows: data.data.dividend_prices,
    },
    stock_prices: {
      title: "高低價法 計算數據",
      columns: [
        { name: "年份", selector: (row) => row.Column0, sortable: true },
        { name: "最高價", selector: (row) => row.Column1, sortable: true },
        { name: "最低價", selector: (row) => row.Column2, sortable: true },
        { name: "均價", selector: (row) => row.Column3, sortable: true },
        { name: "收盤價", selector: (row) => row.Column4, sortable: true },
      ],
      rows: data.data.stock_prices,
    },
    per: {
      title: "本益比法 計算數據",
      columns: [
        { name: "年份", selector: (row) => row.Column0, sortable: true },
        { name: "每股盈餘", selector: (row) => row.Column1, sortable: true },
        { name: "最高本益比", selector: (row) => row.Column2, sortable: true },
        { name: "最低本益比", selector: (row) => row.Column3, sortable: true },
        { name: "平均本益比", selector: (row) => row.Column4, sortable: true },
      ],
      rows: data.data.per,
    },
    pbr: {
      title: "本淨比法 計算數據",
      columns: [
        { name: "年份", selector: (row) => row.Column0, sortable: true },
        { name: "每股淨值", selector: (row) => row.Column1, sortable: true },
        { name: "最高本淨比", selector: (row) => row.Column2, sortable: true },
        { name: "最低本淨比", selector: (row) => row.Column3, sortable: true },
        { name: "平均本淨比", selector: (row) => row.Column4, sortable: true },
      ],
      rows: data.data.pbr,
    },
  };

  return (
    <div>
      {Object.keys(tableConfigs).map((key) => {
        const config = tableConfigs[key];
        const isActive = activeCollapse === key;

        return (
          <Card className="mb-3" key={key}>
            <Card.Header>
              <Button
                variant="link"
                onClick={() => toggleCollapse(key)}
                aria-expanded={isActive}
                className="w-100 text-start"
              >
                {isActive ? `▲ ${config.title}` : `▼ ${config.title}`}
              </Button>
            </Card.Header>
            <Collapse in={isActive}>
              <div>
                <Card.Body>
                  <DataTable
                    columns={config.columns}
                    data={config.rows}
                    pagination
                    highlightOnHover
                    striped
                  />
                </Card.Body>
              </div>
            </Collapse>
          </Card>
        );
      })}
    </div>
  );
};

export default ResultTable;
