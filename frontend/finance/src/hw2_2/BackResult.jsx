import DataTable from 'react-data-table-component';

export function BackResult({ resultData }) {
    if (!resultData) {
        return <div>請輸入參數以開始回測</div>;
    }
    
    const { initial_value, final_value, sharpe_ratio, max_drawdown, annual_returns,transactions } = resultData;

    // 資產變化的資料列
    const assetChangeData = [
        { label: '期初資產', value: initial_value },
        { label: '期末資產', value: final_value.toFixed(2) }
    ];

    // 策略績效的資料列
    const strategyPerformanceData = [
        { label: 'SharpeRatio', value: sharpe_ratio.toFixed(2) },
        { label: 'MaxDrawdown', value: max_drawdown.toFixed(2) }
    ];

    // 年度報酬率表格欄位定義
    const annualReturnColumns = [
        { name: 'Year', selector: row => row.year, sortable: true },
        { name: 'Annual Return(%)', selector: row => (row.return * 100).toFixed(2) + '%', sortable: true }
    ];
    const columns = [
        { name: 'Date', selector: row => row.date, sortable: true },
        { name: 'Amount', selector: row => row.amount, sortable: true },
        { name: 'Price', selector: row => row.price, sortable: true },
        { name: 'Value', selector: row => row.value, sortable: true }
    ];

    return (
        <div>
            <h2>資產變化</h2>
            <DataTable
                columns={[
                    { name: 'Label', selector: row => row.label },
                    { name: 'Value', selector: row => row.value }
                ]}
                data={assetChangeData}
                noHeader
                pagination={false}
            />

            <h2>策略績效</h2>
            <DataTable
                columns={[
                    { name: 'Label', selector: row => row.label },
                    { name: 'Value', selector: row => row.value }
                ]}
                data={strategyPerformanceData}
                noHeader
                pagination={false}
            />

            <h2>年度報酬率</h2>
            <DataTable
                columns={annualReturnColumns}
                data={annual_returns}
                pagination
                highlightOnHover
            />
            <h2>交易紀錄</h2>
            <DataTable
                columns={columns}
                data={transactions} // 從後端接收到的交易資料
                pagination // 開啟分頁功能
            />
        </div>
    );
}
