import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SearchArea =({ onSearch, onAddTrack }) =>{
  const [stock1, setStock1] = useState('GLD');
  const [stock2, setStock2] = useState('AAPL');
  const [startDate, setStartDate] = useState(new Date('2021-01-01'));
  const [endDate, setEndDate] = useState(new Date('2024-01-01'));
  const [nStd, setNStd] = useState(2);
  const [windowSize, setWindowSize] = useState(200);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ stock1, stock2, startDate, endDate, nStd, windowSize });
  
  };
  const handleAddTrack = () => {
    if (validateForm()) {
      onAddTrack({
        stock1,
        stock2,
        startDate,
        endDate,
        nStd: parseFloat(nStd),
        windowSize: parseInt(windowSize, 10),
      });
    }
  };

  const validateForm = () => {
    if (!stock1 || !stock2) {
      alert('請輸入股票代碼');
      return false;
    }
    if (!startDate || !endDate || startDate >= endDate) {
      alert('請確認日期範圍正確');
      return false;
    }
    if (nStd <= 0 || windowSize <= 0) {
      alert('n * std 和 Window Size 必須大於 0');
      return false;
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4  ">
      <h2 className="text-2xl font-bold text-center mb-4">Distance Method</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Stock1</label>
          <input
            value={stock1}
            onChange={(e) => setStock1(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Stock2</label>
          <input
            value={stock2}
            onChange={(e) => setStock2(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">n * std</label>
          <input
            type="number"
            value={nStd}
            onChange={(e) => setNStd(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Window Size</label>
          <input
            type="number"
            value={windowSize}
            onChange={(e) => setWindowSize(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleAddTrack}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Track
        </button>
      </div>
    </form>
  );
};


export default SearchArea