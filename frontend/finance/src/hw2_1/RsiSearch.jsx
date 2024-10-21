
export function RsiSearch({formData,setFormData,setRsiData}){
  
    // 處理輸入變化的函數
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
  
    // 處理表單提交的函數
    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('Submitted Data:', formData);
      const data =  await fetchRsiData(formData);  // 確保等待 fetchRsiData 完成
      setRsiData(data);  // 將獲取到的數據設置為狀態
    };
    
    const fetchRsiData = async(formData)=>{
      try{
        const response = await fetch('http://127.0.0.1:8000/finance/api/rsi-strategy/',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),  // 將表單資料轉換為 JSON 格式
        });
        const data = await response.json();
        //console.log('RSI Strategy Data:', data);
        return data;
      }catch(error){
        //console.error('error fetching rsi data:',error);
        return null;
      }
    };

    return(
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-4">
      <h2 className="text-xl font-bold mb-4">Parameter</h2>
      <div className="flex items-center mb-4">
        <label className="mr-2">輸入股票代碼：</label>
        <input
          type="text"
          name="stockCode"
          value={formData.stockCode}
          onChange={handleChange}
          className="border rounded p-1"
        />
        <button type="submit" className="ml-4 bg-gray-500 text-white p-1 rounded">提交</button>
      </div>

      <div className="flex items-center mb-4">
        <label className="mr-2">選擇策略：</label>
        <select
          name="strategy"
          value={formData.strategy}
          onChange={handleChange}
          className="border rounded p-1"
        >
          <option value="RSI黃金交叉策略">RSI黃金交叉策略</option>
          <option value="策略2">策略2</option>
        </select>
        <label className="ml-4 mr-2">短期RSI</label>
        <input
          type="number"
          name="shortTermRSI"
          value={formData.shortTermRSI}
          onChange={handleChange}
          className="border rounded p-1 w-16"
        />
        <label className="ml-4 mr-2">長期RSI</label>
        <input
          type="number"
          name="longTermRSI"
          value={formData.longTermRSI}
          onChange={handleChange}
          className="border rounded p-1 w-16"
        />
      </div>

      <div className="flex items-center mb-4">
        <label className="mr-2">開始日期：</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="border rounded p-1"
        />
        <label className="ml-4 mr-2">結束日期：</label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="border rounded p-1"
        />
      </div>
    </form>
    )
}