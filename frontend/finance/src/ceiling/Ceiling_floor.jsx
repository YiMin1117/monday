import React, { useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsStock from "highcharts/modules/stock";
import { NavBar } from "../NavBar";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

// 初始化 Highcharts Stock 模組
HighchartsStock(Highcharts);

// 方法三解析支撐與阻力線的工具函數
const parseSupportResistanceSequential = (support, resistance) => {
  const halfLength = support.length / 2;
  const support1 = support.slice(0, halfLength);
  const support5 = support.slice(halfLength);

  const resistance95 = resistance.slice(0, halfLength);
  const resistance99 = resistance.slice(halfLength);

  return { support1, support5, resistance95, resistance99 };
};

const SupportResistanceChart = () => {
  const [searchParams, setSearchParams] = useState({
    stockCode: "",
    startDate: "2019-01-01",
    maLength: 20,
    maType: "sma",
    method: "method1",
  });

  const [loading, setLoading] = useState(false); // 載入狀態
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "candlestick",
      height: 600,
      zoomType: "x", // 啟用放大縮小
    },
    rangeSelector: {
      enabled: true, // 顯示篩選時間工具
      selected: 4,
      buttons: [
        { type: "month", count: 1, text: "1m" },
        { type: "month", count: 3, text: "3m" },
        { type: "month", count: 6, text: "6m" },
        { type: "year", count: 1, text: "1y" },
        { type: "all", text: "All" },
      ],
    },
    navigator: { enabled: true },
    scrollbar: { enabled: true },
    title: { text: "天花板地板線" },
    xAxis: { type: "datetime" },
    yAxis: [
      { title: { text: "價格" }, height: "70%", lineWidth: 2 },
      { title: { text: "成交量" }, top: "75%", height: "25%", offset: 0, lineWidth: 2 },
    ],
    tooltip: {
      shared: true, // 啟用共享 tooltip
      split: false, // 不分離，集中顯示
    },
    series: [],
  });

  const handleSearchChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/support_resistance/calculate/",
        {
          stockCode: searchParams.stockCode,
          startDate: searchParams.startDate,
          maLength: searchParams.maLength,
          maType: searchParams.maType,
          method: searchParams.method,
        }
      );

      const data = response.data;

      // 解析支撐線與阻力線
      let supportSeries = [];
      let resistanceSeries = [];
      if (searchParams.method === "method3") {
        const { support1, support5, resistance95, resistance99 } =
          parseSupportResistanceSequential(data.support, data.resistance);

        supportSeries = [
          {
            name: "支撐線 1%",
            data: support1,
            type: "line",
            color: "#006400",
            lineWidth: 2,
            dashStyle: "ShortDash",
            marker: { enabled: false },
          },
          {
            name: "支撐線 5%",
            data: support5,
            type: "line",
            color: "#90EE90",
            lineWidth: 2,
            marker: { enabled: false },
          },
        ];
        resistanceSeries = [
          {
            name: "阻力線 95%",
            data: resistance95,
            type: "line",
            color: "orange",
            lineWidth: 2,
            marker: { enabled: false },
          },
          {
            name: "阻力線 99%",
            data: resistance99,
            type: "line",
            color: "red",
            lineWidth: 2,
            dashStyle: "ShortDot",
            marker: { enabled: false },
          },
        ];
      } else {
        supportSeries = [
          {
            name: "支撐線",
            data: data.support,
            type: "line",
            color: "green",
            lineWidth: 2,
            marker: { enabled: false },
          },
        ];
        resistanceSeries = [
          {
            name: "阻力線",
            data: data.resistance,
            type: "line",
            color: "red",
            lineWidth: 2,
            marker: { enabled: false },
          },
        ];
      }

      // 更新圖表數據
      setChartOptions({
        ...chartOptions,
        series: [
          ...supportSeries, // 動態支撐線
          ...resistanceSeries, // 動態阻力線
          {
            name: "移動平均線",
            data: data.ma,
            type: "line",
            color: "blue",
            lineWidth: 2,
            marker: { enabled: false },
          },
          {
            name: "K線",
            type: "candlestick",
            data: data.Kline,
            upColor: "green",
            color: "red",
          },
          {
            name: "成交量",
            type: "column",
            data: data.volume.map(([x, y]) => ({
              x,
              y,
              color: data.annotations_labels.some((flag) => flag.x === x) ? "orange" : "gray",
            })),
            yAxis: 1,
          },
          {
            type: "flags",
            name: "突破訊號",
            data: data.annotations_labels,
            onSeries: "K線",
            shape: "flag",
            width: 16,
            tooltip: {
              pointFormat: '<b>{point.title}</b>: {point.text}<br/>',
            },
          },
        ],
      });
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <NavBar></NavBar>
      <Box sx={{ margin: 5 }}></Box>
      <Typography variant="h4" textAlign="center" gutterBottom>
        天花板地板線
      </Typography>
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <TextField
          label="股票代號&名稱"
          variant="outlined"
          value={searchParams.stockCode}
          onChange={(e) => handleSearchChange("stockCode", e.target.value)}
          required
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="歷史資料起始日"
          type="date"
          value={searchParams.startDate}
          onChange={(e) => handleSearchChange("startDate", e.target.value)}
          required
          sx={{ minWidth: 200 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="ma-length-label">MA長度</InputLabel>
          <Select
            labelId="ma-length-label"
            value={searchParams.maLength}
            onChange={(e) => handleSearchChange("maLength", e.target.value)}
          >
            {[10, 20, 50, 100, 200].map((length) => (
              <MenuItem key={length} value={length}>
                {length}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="ma-type-label">MA類型</InputLabel>
          <Select
            labelId="ma-type-label"
            value={searchParams.maType}
            onChange={(e) => handleSearchChange("maType", e.target.value)}
          >
            <MenuItem value="sma">SMA</MenuItem>
            <MenuItem value="wma">WMA</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="method-label">計算方式</InputLabel>
          <Select
            labelId="method-label"
            value={searchParams.method}
            onChange={(e) => handleSearchChange("method", e.target.value)}
          >
            <MenuItem value="method1">方法一</MenuItem>
            <MenuItem value="method2">方法二</MenuItem>
            <MenuItem value="method3">方法三</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" sx={{ height: "100%" }}>
          搜尋
        </Button>
      </Box>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && <HighchartsReact highcharts={Highcharts} options={chartOptions} />}
    </Box>
  );
};

export default SupportResistanceChart;
