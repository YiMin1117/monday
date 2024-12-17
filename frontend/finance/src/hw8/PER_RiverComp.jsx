import React, { useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsStock from "highcharts/modules/stock";
import DataTable from "react-data-table-component";
import { TextField, Button, CircularProgress, Box, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { NavBar } from "../NavBar";

// 初始化 Highcharts Stock 模組
HighchartsStock(Highcharts);

const PERRiverChart = () => {
  const [searchParams, setSearchParams] = useState({
    stockCode: "", // 股票代碼
    timeUnit: "month", // 時間單位 (默認為 "月")
  });

  const [loading, setLoading] = useState(false); // 資料載入狀態
  const [latestPrice, setLatestPrice] = useState(0); // 最新價格

  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "bar",
      height: 400,
    },
    title: {
      text: "本益比河流圖結果",
    },
    xAxis: {
      categories: ["價格區間"],
    },
    yAxis: {
      title: {
        text: "價格",
      },
      min: 0,
      max: 2000, // 預設值，後續會根據數據動態更新
    },
    plotOptions: {
        series: {
          stacking: "normal", // 堆疊區段
        },
    },
    series: [
      { name: "昂貴價區間", data: [0], color: "red" },
      { name: "合理到昂貴價區間", data: [0], color: "#FF5353" },
      { name: "便宜到合理價區間", data: [0], color: "#59FF59" },
      { name: "便宜價區間", data: [0], color: "#FFFF4F" },
      { name: "最新價格", type: "line", data: [0], color: "black", lineWidth: 3 },
    ],
  });

  const [klineChartOptions, setKlineChartOptions] = useState({
    chart: {
      type: "candlestick",
      height: 500,
    },
    title: {
      text: "K線圖與河流圖",
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "時間",
      },
    },
    yAxis: {
        title: {
          text: "價格",
        },
    },
    rangeSelector: {
        enabled: true, // 啟用範圍選擇器
        inputEnabled: true, // 是否顯示開始、結束日期選擇框
        selected: 1, // 預設選擇的範圍（0 為全部）
      },
      scrollbar: {
        enabled: true, // 啟用滾動條
    },
    tooltip: {
        shared: true,
        usehtml: true,
        formatter: function () {
          let tooltip = `<b>${Highcharts.dateFormat("%Y-%m-%d", this.x)}</b><br/>`;
          this.points.forEach((point) => {
            if (point.series.type === "candlestick") {
              tooltip += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <br/>
                          開盤: <b>${point.point.open}</b><br/>
                          最高: <b>${point.point.high}</b><br/>
                          最低: <b>${point.point.low}</b><br/>
                          收盤: <b>${point.point.close}</b><br/>`;
            } else {
              tooltip += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${point.y.toFixed(2)}</b><br/>`;
            }
          });
          return tooltip;
        },
      },
      series: [
        {
          type: "candlestick",
          name: "K線",
          data: [], // 預設無數據
        },
        {
          type: "line",
          name: "15X",
          data: [],
          color: "blue",
          lineWidth: 1,
        },
        {
          type: "line",
          name: "17.4X",
          data: [],
          color: "green",
          lineWidth: 1,
        },
        {
          type: "line",
          name: "19.8X",
          data: [],
          color: "orange",
          lineWidth: 1,
        },
        {
          type: "line",
          name: "22.2X",
          data: [],
          color: "red",
          lineWidth: 1,
        },
        {
          type: "line",
          name: "24.6X",
          data: [],
          color: "purple",
          lineWidth: 1,
        },
        {
          type: "line",
          name: "27X",
          data: [],
          color: "pink",
          lineWidth: 1,
        },
      ],
  });




  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/per_river/get_data/", {
        stockCode: searchParams.stockCode,
        timeUnit: searchParams.timeUnit,
      });
      const data = response.data;
      console.log(data)
      // 計算最大價格區間的 max 值，乘上 1.2 寬度係數
      const maxPrice = Math.max(data.NewPrice, data.expensive) * 1.2;
  
      // 更新圖表和數據
      setLatestPrice(data.NewPrice);
      setChartOptions({
        ...chartOptions,
        yAxis: {
            ...chartOptions.yAxis,
            max: maxPrice, // 動態計算 max 值
        },
        series: [
          {
            name: "昂貴價區間",
            data: data.up_expensive, // 昂貴價區間對應的數據
            color: "red",
          },
          {
            name: "合理到昂貴價區間",
            data: data.reasonable_expensive, // 合理到昂貴價區間
            color: "#FF5353",
          },
          {
            name: "便宜到合理價區間",
            data: data.cheap_reasonable, // 便宜到合理價區間
            color: "#59FF59",
          },
          {
            name: "便宜價區間",
            data: data.down_cheap, // 便宜價區間
            color: "#FFFF4F",
          },
          {
            name: "最新價格",
            type: "line",
            data: [data.NewPrice], // 最新價格（單點數據）
            color: "black",
            lineWidth: 3,
            marker: {
              radius: 6, // 圓點大小
            },
          },
        ],
      });
        // 更新 K 線圖與河流圖
    
        setKlineChartOptions({
            ...klineChartOptions,
            series: [
                {
                type: "candlestick",
                name: "K線",
                data: data.Kline.map((k) => [
                    new Date(k[0]).getTime(), // 時間戳記
                    parseFloat(k[2]), // 開盤價
                    parseFloat(k[3]), // 最高價
                    parseFloat(k[4]), // 最低價
                    parseFloat(k[5]), // 收盤價
                ]),
                },
                {
                type: "line",
                name: data.PER_rate[0],
                data: data.data1.map((d) => [new Date(d[0]).getTime(), parseFloat(d[1])]),
                color: "blue",
                lineWidth: 1,
                },
                {
                type: "line",
                name: data.PER_rate[1],
                data: data.data2.map((d) => [new Date(d[0]).getTime(), parseFloat(d[1])]),
                color: "green",
                lineWidth: 1,
                },
                {
                type: "line",
                name: data.PER_rate[2],
                data: data.data3.map((d) => [new Date(d[0]).getTime(), parseFloat(d[1])]),
                color: "orange",
                lineWidth: 1,
                },
                {
                type: "line",
                name: data.PER_rate[3],
                data: data.data4.map((d) => [new Date(d[0]).getTime(), parseFloat(d[1])]),
                color: "red",
                lineWidth: 1,
                },
                {
                type: "line",
                name: data.PER_rate[4],
                data: data.data5.map((d) => [new Date(d[0]).getTime(), parseFloat(d[1])]),
                color: "purple",
                lineWidth: 1,
                },
                {
                type: "line",
                name:data.PER_rate[5],
                data: data.data6.map((d) => [new Date(d[0]).getTime(), parseFloat(d[1])]),
                color: "pink",
                lineWidth: 1,
                },
            ],
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box sx={{ padding: 4 }}>
      <NavBar></NavBar>  
      <Box sx={{margin:5}}></Box>
      {/* 搜尋欄 */}
      <Typography variant="h4" textAlign="center" gutterBottom>
        本益比河流圖
      </Typography>
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 3 }}
      >
        {/* 股票代碼輸入框 */}
        <TextField
          label="搜尋股票代號及名稱"
          variant="outlined"
          value={searchParams.stockCode}
          onChange={(e) => handleSearchChange("stockCode", e.target.value)}
          sx={{ width: 300, mr: 2 }}
        />

        {/* 時間單位選擇 */}
        <FormControl sx={{ minWidth: 150, mr: 2 }}>
          <InputLabel id="time-unit-label">時間單位</InputLabel>
          <Select
            labelId="time-unit-label"
            value={searchParams.timeUnit}
            onChange={(e) => handleSearchChange("timeUnit", e.target.value)}
          >
            <MenuItem value="month">月</MenuItem>
            <MenuItem value="quarter">季</MenuItem>
            <MenuItem value="year">年</MenuItem>
          </Select>
        </FormControl>

        {/* 搜尋按鈕 */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ height: "100%" }}
        >
          搜尋
        </Button>
      </Box>

      {/* 最新價格 */}
      <Typography variant="h5" textAlign="center" gutterBottom>
        最新價格: {latestPrice}
      </Typography>

      {/* 加載動畫 */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      
      {!loading && (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      )}

      {/* K線圖 */}
      {!loading && (
        <HighchartsReact highcharts={Highcharts} options={klineChartOptions} />
      )}

    </Box>
  );
};

export default PERRiverChart;
