import './axiosSetup'; // 确保拦截器和超时逻辑在项目启动时加载
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import FinancePage from './hw1_pair/FinancePage.jsx';
import RsiPage from './hw2_1/RsiPage.jsx';
import { BackTrader } from './hw2_2/BackTrader.jsx';
import AuthApp from './LoginPage.jsx';
import ProtectedRoute from './ProtectedRoute';
import TracklistPage from './hw1_pair/TracklistPage.jsx';
import HomePage from './hw8/HomePage.jsx';
import PricingStrategy from './hw8/PricingStrategy.jsx';
import PERRiver from './hw8/PER_RiverComp.jsx';
import Ceiling_floor from './ceiling/ceiling_floor.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthApp />,
  },
  {
    path: "finance",
    element: (
      //<ProtectedRoute>
        <FinancePage />
      //</ProtectedRoute>
    ),
  },
  {
    path: "tracklist",
    element: (
      //<ProtectedRoute>
        <TracklistPage />
      //</ProtectedRoute>
    ),
  },
  {
    path: "rsi",
    element: (
      //<ProtectedRoute>
        <RsiPage />
      //</ProtectedRoute>
    ),
  },
  {
    path: "backtrader",
    element: (
      //<ProtectedRoute>
        <BackTrader />
      //</ProtectedRoute>
    ),
  },
  {
    path: "homepage",
    element: (
      //<ProtectedRoute>
        <HomePage />
      //</ProtectedRoute>
    ),
  },
  {
    path: "pricing-strategy",
    element: (
      //<ProtectedRoute>
        <PricingStrategy />
      //</ProtectedRoute>
    ),
  },
  {
    path: "pe-flow-chart",
    element: (
      //<ProtectedRoute>
        <PERRiver></PERRiver>
      //</ProtectedRoute>
    ),
  },
  {
    path: "ceiling-floor",
    element: (
      //<ProtectedRoute>
        <Ceiling_floor></Ceiling_floor>
      //</ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
