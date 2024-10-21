export function BackSearch({formData,setFormData,setBackData}){
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
      };

    const handleSubmit = async(e) => {
        e.preventDefault();
        const data =await fetchBackData(formData);
        setBackData(data);
    };
    const fetchBackData =async(formData)=>{
      try{
        const response = await fetch('http://127.0.0.1:8000/finance/api/backtest/',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),  // 將表單資料轉換為 JSON 格式
        });
        console.log(formData)
        const data = await response.json();
        //console.log('RSI Strategy Data:', data);
        return data;
      }catch(error){
        //console.error('error fetching rsi data:',error);
        return null;
      }
    }
    return(
        <div className="container mx-auto p-5">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">股票進出場回測</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block">Select stock:</label>
                <input
                  type="text"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
  
              <div>
                <label className="block">Select entry Strategy:</label>
                <select
                  name="entryStrategy"
                  value={formData.entryStrategy}
                  onChange={handleChange}
                  className="border p-2 w-full"
                >
                  <option value="RSI黃金交叉">RSI黃金交叉</option>
                  <option value="RSI死亡交叉">RSI死亡交叉</option>
                </select>
              </div>
  
              <div>
                <label className="block">Select exit Strategy:</label>
                <select
                  name="exitStrategy"
                  value={formData.exitStrategy}
                  onChange={handleChange}
                  className="border p-2 w-full"
                >
                  <option value="RSI死亡交叉">RSI死亡交叉</option>
                  <option value="RSI黃金交叉">RSI黃金交叉</option>
                </select>
              </div>
  
              <div>
                <label className="block">長期RSI週期:</label>
                <input
                  type="number"
                  name="longTermRSI"
                  value={formData.longTermRSI}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
  
              <div>
                <label className="block">短期RSI週期:</label>
                <input
                  type="number"
                  name="shortTermRSI"
                  value={formData.shortTermRSI}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
  
              <div>
                <label className="block">初始資金:</label>
                <input
                  type="number"
                  name="initialCapital"
                  value={formData.initialCapital}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
  
              <div>
                <label className="block">手續費:</label>
                <input
                  type="number"
                  name="transactionFee"
                  value={formData.transactionFee}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>

              <div>
                <label className="block">單筆下單股數:</label>
                <input
                  type="number"
                  name="stack"
                  value={formData.stack}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
  
              <div>
                <label className="block">開始日期:</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
  
              <div>
                <label className="block">結束日期:</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="border p-2 w-full"
                />
              </div>
            </div>
            <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
              新增
            </button>
          </form>
        </div>
      </div>
    )
}