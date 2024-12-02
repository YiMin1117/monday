import React, { useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

const TrackResult = ({ isOpen, onClose, chartOptions }) => {
  if (!isOpen) return null; // 如果浮動視窗未打開，則不渲染

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-5 w-3/4 h-3/4 overflow-auto">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Monitor Results</h3>
          <button className="text-gray-600 text-2xl" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="mt-4">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default TrackResult;
