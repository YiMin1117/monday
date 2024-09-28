import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SearchPage } from './SearchPage'
import { createBrowserRouter, RouterProvider, Route, Link } from 'react-router-dom';
import {BrowsePage} from './BrowsePage';
import { NavBar } from './NavBar';
import "./index.css"

// 設置路由，根路徑指向 FilterPage
const router = createBrowserRouter([
  {
    path: "/",
    element: <SearchPage />,  // 根路徑直接渲染 FilterPage
  },
  {
    path: "browse",
    element: <BrowsePage />,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
