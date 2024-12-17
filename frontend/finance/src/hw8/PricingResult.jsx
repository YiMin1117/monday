import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import ResultTable from "./ResultTable";

const PricingResultChart = ({ data,formData }) => {
  const [calculatedData, setCalculatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null); // 假設目前價格為40.33
  const{stockNameOrId} = formData;

  useEffect(() => {
    // 獲取即時價格
    const fetchCurrentPrice = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/stock_pricising/current_prices/?stock=${stockNameOrId}`);
          setCurrentPrice(response.data.currentPrice); // 更新即時價格
          console.log("現在最新價格",currentPrice)
          console.log("更新時間",response.data.lastUpdateTime)
        } catch (error) {
          console.error("無法獲取即時價格", error);
        }
      };

    const fetchCalculatedData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/stock_pricising/pricising_calculate/",
          data
        );
        setCalculatedData(response.data);
        console.log("計算後:",response.data)
        setLoading(false);
      } catch (error) {
        setError("無法計算結果，請稍後再試");
        setLoading(false);
      }
    };

    fetchCalculatedData();
    fetchCurrentPrice();
  }, [data,stockNameOrId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!calculatedData) return <div>尚無資料</div>;

  // 整理 Highcharts 數據格式
  const categories = [
    "股利法",
    "高低價法",
    "本淨比法",
    "本益比法",
  ];

  const cheapPrices = [
    calculatedData.data.dividend_based["便宜價"],
    calculatedData.data.stock_price_based["便宜價"],
    calculatedData.data["pbr(本淨比)_based"]["便宜價"],
    calculatedData.data["per(本益比)_based"]["便宜價"],
  ];

  const cheapToFairPrices = [
    calculatedData.data.dividend_based["合理價"] - calculatedData.data.dividend_based["便宜價"],
    calculatedData.data.stock_price_based["合理價"] - calculatedData.data.stock_price_based["便宜價"],
    calculatedData.data["pbr(本淨比)_based"]["合理價"] - calculatedData.data["pbr(本淨比)_based"]["便宜價"],
    calculatedData.data["per(本益比)_based"]["合理價"] - calculatedData.data["per(本益比)_based"]["便宜價"],
  ];

  const fairToExpensivePrices = [
    calculatedData.data.dividend_based["昂貴價"] - calculatedData.data.dividend_based["合理價"],
    calculatedData.data.stock_price_based["昂貴價"] - calculatedData.data.stock_price_based["合理價"],
    calculatedData.data["pbr(本淨比)_based"]["昂貴價"] - calculatedData.data["pbr(本淨比)_based"]["合理價"],
    calculatedData.data["per(本益比)_based"]["昂貴價"] - calculatedData.data["per(本益比)_based"]["合理價"],
  ];

// 計算最大價格
    const maxPrice = Math.max(
        ...[
        calculatedData.data.dividend_based["昂貴價"],
        calculatedData.data.stock_price_based["昂貴價"],
        calculatedData.data["pbr(本淨比)_based"]["昂貴價"],
        calculatedData.data["per(本益比)_based"]["昂貴價"],
        currentPrice, // 包括目前價格，確保它在範圍內
        ]
    ) * 1.2; // 加 20% 預留空間
  
  // 動態計算昂貴區間的數據
  const expensivePrices = [
    maxPrice - calculatedData.data.dividend_based["昂貴價"],
    maxPrice - calculatedData.data.stock_price_based["昂貴價"],
    maxPrice - calculatedData.data["pbr(本淨比)_based"]["昂貴價"],
    maxPrice - calculatedData.data["per(本益比)_based"]["昂貴價"],
  ];
  

  const options = {
    chart: {
      type: "bar",
    },
    title: {
      text: "股票定價結果",
    },
    xAxis: {
      categories,
      title: {
        text: "定價方法",
      },
    },
    yAxis: {
      title: {
        text: "價格區間",
      },
      max:maxPrice,
      plotLines: [
        {
          color: "black",
          width: 2,
          value: currentPrice,
          zIndex: 5, // 畫目前價格線
          label: {
            text: `最新價格: ${currentPrice}`,
            align: "left",
            style: {
              color: "black",
            },
          },
        },
      ],
    },
    legend: {
      reversed: true,
    },
    plotOptions: {
      series: {
        stacking: "normal",
      },
    },
    tooltip: {
        formatter: function () {
          const category = this.series.name; // 獲取區間名稱 (例如 "便宜價區間")
          const startPrice = this.point.stackY - this.point.y; // 起始價格
          const endPrice = this.point.stackY; // 結束價格
          return `<b>${this.x} - ${category}</b><br>
                  From: ${startPrice.toFixed(2)}<br>
                  To: ${endPrice.toFixed(2)}`;
        },
      },
    series: [
      {
        name: "昂貴區間",
        data: expensivePrices,
        color: "darkred",
      },
      {
        name: "合理到昂貴價區間",
        data: fairToExpensivePrices,
        color: "red",
      },
      {
        name: "便宜到合理價區間",
        data: cheapToFairPrices,
        color: "green",
      },
      {
        name: "便宜價區間",
        data: cheapPrices,
        color: "yellow",
      },
    ],
  };

  return (
    <div className="container mt-4">
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Current_Prices</h5>
          <p className="card-text" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {currentPrice !== null ? `最新價格: ${currentPrice}` : "nope數據"}
          </p>
        </div>
      </div>
      <HighchartsReact highcharts={Highcharts} options={options} />
      <div className="mb-4">
      </div>
      <ResultTable data={data}></ResultTable>
    </div>
  );
};

export default PricingResultChart;
