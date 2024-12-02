import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from './axiosSetup';

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 验证会话是否有效
    axios.get('http://127.0.0.1:8000/api/session-check')
      .then(response => {
        if (response.status === 200 && response.data.authenticated) {
            console.log("User is authenticated");  // 确认身份验证
            setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Session Check Error:", error);
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  console.log("驗證狀態",isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
