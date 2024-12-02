import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { NavBar } from '../NavBar';
import TrackResult from './TrackResult';
import { chart } from 'highcharts';

const TracklistPage = () => {
  const [trackList, setTrackList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartOptions, setChartOptions] = useState({});

  // 從後端 API 獲取追蹤列表
  useEffect(() => {
    const fetchTrackList = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/track/get_track_list/');
        if (response.ok) {
          const data = await response.json();
          setTrackList(data.tracks); // 假設後端返回的格式為 { tracks: [...] }
        } else {
          console.error('Failed to fetch track list');
        }
      } catch (error) {
        console.error('Error fetching track list:', error);
      }
    };

    fetchTrackList();
  }, []);

  // 定義 DataTable 的欄位
  const columns = [
    
    {
      name: 'Stock1',
      selector: (row) => row.stock1,
      sortable: true,
    },
    {
      name: 'Stock2',
      selector: (row) => row.stock2,
      sortable: true,
    },
    {
      name: 'Start Date',
      selector: (row) => row.start_date,
      sortable: true,
    },
    {
      name: 'End Date',
      selector: (row) => row.end_date,
      sortable: true,
    },
    {
      name: 'Window Size',
      selector: (row) => row.window_size,
      sortable: true,
    },
    {
      name: 'n * Std',
      selector: (row) => row.n_times,
      sortable: true,
    },
    {
      name: 'Track Date',
      selector: (row) => new Date(row.track_date * 1000).toLocaleDateString(),
      sortable: true,
    },
    {
      name: 'Action',
      cell: (row) => (
        <div>
          <button
            className="bg-red-500 text-white px-2 py-1 rounded mr-2"
            onClick={() => {
                console.log('Filename:', row.filename);
                handleUntrack(row.filename);
            }}
          >
            Untrack
          </button>
          <button
            className="bg-green-500 text-white px-2 py-1 rounded"
            onClick={() => {
                console.log('Filename:', row.filename);
                handleResults(row.filename);
            }}
          >
            Results
          </button>
        </div>
      ),
    },
  ];

  const handleUntrack = async (filename) => {
    const confirmed = window.confirm(`Are you sure you want to untrack: ${filename}?`);
    if (confirmed) {
      try {
        const response = await fetch('http://127.0.0.1:8000/track/delete_track/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename }), // 傳遞 filename 到後端
        });
  
        if (response.ok) {
          alert(`Untrack successful for ${filename}!`);
          // 更新前端列表
          setTrackList((prev) => prev.filter((track) => track.filename !== filename));
        } else {
          const errorData = await response.json();
          alert(`Failed to untrack: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error untracking file:', error);
        alert('An error occurred while trying to untrack the file.');
      }
    }
  };

  // 處理 Results 操作
  const handleResults = async (filename) => {
    //console.log('hihi',filename)
    try {
      const response = await fetch(`http://127.0.0.1:8000/track/get_track_data/?filename=${filename}`);
      if (response.ok) {
        const data = await response.json();
        setChartOptions({
          title: { text: `${data.input_parameters.stock1} vs ${data.input_parameters.stock2} 股票比較` },
          xAxis: { categories: data.timestamps },
          yAxis: { title: { text: 'Price (USD)' } },
          series: [
            // 第一隻股票的價格走勢
            {
              name: data.input_parameters.stock1,
              data: data.stock1_prices,
              type: 'line',
              color: 'blue',
            },
            // 第二隻股票的價格走勢
            {
              name: data.input_parameters.stock2,
              data: data.stock2_prices,
              type: 'line',
              color: 'purple',
            },
            // 第一隻股票的交易信號
            {
              type: 'scatter',
              name: `${data.input_parameters.stock1} 信號`,
              data: data.signals.map((signal) => ({
                x: data.timestamps.indexOf(signal.timestamp), // X 軸對應的時間索引
                y: signal.stock1_price, // Y 軸為 Stock1 的價格
                marker: {
                  symbol: signal.type === 'Entry' ? 'triangle' : 'triangle-down', // 上三角或下三角
                  fillColor: signal.action.includes('Buy Stock1') ? 'red' : 'green', // Buy 為綠色，Sell 為紅色
                },
                tooltip: {
                  pointFormat: `<b>${signal.type}</b>: ${signal.action}<br>Price: ${signal.stock1_price}`,
                },
              })),
            },
            // 第二隻股票的交易信號
            {
              type: 'scatter',
              name: `${data.input_parameters.stock2} 信號`,
              data: data.signals.map((signal) => ({
                x: data.timestamps.indexOf(signal.timestamp), // X 軸對應的時間索引
                y: signal.stock2_price, // Y 軸為 Stock2 的價格
                marker: {
                  symbol: signal.type === 'Entry' ? 'triangle' : 'triangle-down', // 上三角或下三角
                  fillColor: signal.action.includes('Buy Stock2') ? 'red' : 'green', // Buy 為綠色，Sell 為紅色
                },
                tooltip: {
                  pointFormat: `<b>${signal.type}</b>: ${signal.action}<br>Price: ${signal.stock2_price}`,
                },
              })),
            },
          ],
        });
        
        
      
        setIsModalOpen(true);
      } else {
        console.error('Failed to fetch track data');
      }
    } catch (error) {
      console.error('Error fetching track data:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  console.log(chartOptions)
  return (
    <div className="bg-neutral-400 p-5 flex flex-col justify-center pt-16">
        <NavBar></NavBar>
        <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">Monitor Tool</h2>
        <DataTable
            title="Track List"
            columns={columns}
            data={trackList}
            pagination
            highlightOnHover
            striped
        />
        <TrackResult isOpen={isModalOpen} onClose={closeModal} chartOptions={chartOptions}></TrackResult>
        </div>
    </div>
  );
};

export default TracklistPage;
