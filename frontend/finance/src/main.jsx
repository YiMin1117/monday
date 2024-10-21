import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import FinancePage from './hw1_pair/FinancePage.jsx';  // 使用默認導出
import RsiPage from './hw2_1/RsiPage.jsx';
import { BackTrader } from './hw2_2/BackTrader.jsx';

// 設置路由，根路徑指向 
const router = createBrowserRouter([
  {
    path: "/",
    element: <FinancePage />,  // 根路徑直接渲染
  },
  {
    path: "rsi",
    element: <RsiPage />,
  },
  {
    path: "backtrader",
    element: <BackTrader />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
