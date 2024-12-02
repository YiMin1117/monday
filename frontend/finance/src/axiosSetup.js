import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post('http://127.0.0.1:8000/api/token-refresh');
        if (refreshResponse.status === 200) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        window.location.href = '/'; // 重定向到登录页面
      }
    }
    return Promise.reject(error);
  }
);

// 设置会话过期超时
let sessionTimeout;
function resetSessionTimeout() {
  clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(() => {
    axios.post("http://127.0.0.1:8000/api/logout").then(() => {
      window.location.href = '/';
    });
  }, 30 * 60 * 1000); // 30 分钟的会话超时时间
}

document.addEventListener("mousemove", resetSessionTimeout);
document.addEventListener("keypress", resetSessionTimeout);

// 初始化 session 计时
resetSessionTimeout();

export default axios;
