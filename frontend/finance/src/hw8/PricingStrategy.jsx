import React, { useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import PricingResult from "./PricingResult";
import { NavBar } from "../NavBar";

const StockPricing = () => {
  // 用一個 state 包裝所有的參數
  const [formData, setFormData] = useState({
    stockNameOrId: "", // 股票代號或名稱
    historicalYears: "10", // 歷史幾年資料
  });
  // 狀態管理
  const [isLoading, setIsLoading] = useState(false); // 加載狀態
  const [error, setError] = useState(""); // 錯誤訊息
  const [data, setData] = useState(null); // 後端回傳的資料


  ///////////////////////////////////////////////////
  // 處理輸入變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

    // 顯示計時器的 SweetAlert
    const showTimerAlert = () => {
        let secondsElapsed = 0;
        const timerInterval = setInterval(() => {
          secondsElapsed += 1;
          Swal.update({
            html: `已執行 <strong>${secondsElapsed}</strong> 秒`,
          });
        }, 1000);
    
        Swal.fire({
          title: "正在讀取中...",
          html: "已執行 <strong>0</strong> 秒",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        });
        return timerInterval; // 返回計時器 ID，用於停止
      };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 開啟加載狀態
    setError(""); // 重置錯誤訊息
    setData(null); // 重置數據

    // 顯示計時器
    const timerInterval = showTimerAlert();

    try {
      const response = await axios.post("http://127.0.0.1:8000/stock_pricising/get_stock_data/", formData);
      console.log("後端回應資料:", response.data);
      setData(response.data); // 儲存後端返回的數據
      Swal.close(); // 請求成功後關閉提示
      Swal.fire("成功！", "數據讀取完成！", "success");
    } catch (error) {
      console.error("發送請求時出錯:", error);
      setError("無法取得資料，請稍後再試或確認輸入內容是否正確！");
      Swal.close(); // 請求失敗後關閉提示
      Swal.fire("失敗！", "數據讀取失敗，請稍後再試。", "error");
    } finally {
      setIsLoading(false); // 關閉加載狀態
    }
  };

  return (
    <div className="bg-neutral-400 p-5 flex flex-col justify-center pt-16">
      <NavBar></NavBar>
      <div className="p-5"></div>
      <h1 className="text-center mb-4  ">股票定價</h1>
      <form onSubmit={handleSubmit} className="row g-3">
        {/* 股票代號與名稱 */}
        <div className="col-md-6">
          <label htmlFor="stockNameOrId" className="form-label">
            股票代號&名稱:
          </label>
          <input
            type="text"
            id="stockNameOrId"
            name="stockNameOrId"
            value={formData.stockNameOrId}
            onChange={handleChange}
            className="form-control"
            placeholder="輸入股票代號或名稱"
            required
          />
        </div>

        {/* 歷史幾年資料 */}
        <div className="col-md-6">
          <label htmlFor="historicalYears" className="form-label">
            歷史幾年資料:
          </label>
          <select
            id="historicalYears"
            name="historicalYears"
            value={formData.historicalYears}
            onChange={handleChange}
            className="form-select"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((year) => (
              <option key={year} value={year}>
                {year} 年
              </option>
            ))}
          </select>
        </div>

        {/* 提交按鈕 */}
        <div className="col-12 text-center mb-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            搜尋
          </button>
        </div>
      </form>
      
       <PricingResult data={data} formData={formData}/>
      
    </div>
  );
};

export default StockPricing;
