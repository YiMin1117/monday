import React from 'react';
import DataTable from 'react-data-table-component';
const columns = [
    {
      name: 'Gene ID',
      selector: row => row.Gene_ID,
      sortable: true,
    },
    {
      name: 'Gene Name',
      selector: row => row.Gene_Name,
      sortable: true,
    },
    {
      name: 'Target RNA Name',
      selector: row => row.Sequence_Name,
      sortable: true,
      cell: row => <a href={`#target_${row.id}`}>{row.Sequence_Name}</a>,  // 假設你需要鏈接到某個地方
    },
    {
      name: 'Target RNA Type',
      selector: row => row.Type,
      sortable: true,
    },
  ];
const customStyles = {
header: {
    style: {
    fontSize: '18px',  // 標題字體大小
    fontWeight: 'bold',
    textAlign: 'center',  // 標題置中
    },
},
rows: {
    style: {
    fontSize: '16px',  // 行的字體大小
    textAlign: 'center',  // 行內文字置中
    },
},
headCells: {
    style: {
    fontSize: '18px',  // 表頭字體大小
    fontWeight: 'bold',
    textAlign: 'center',  // 表頭置中
    },
},
cells: {
    style: {
    fontSize: '16px',  // 單元格內容的字體大小
    textAlign: 'center',  // 單元格內容置中
    },
},
};
export function BrowseResult({ data }){
    return (
        <div className="flex justify-center items-center my-1 border border-stone-500 rounded-md p-2 shadow-md bg-white">
            <div className="m-4 w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-4 text-center">Browse Result</h1>
                <DataTable
                columns={columns}
                data={data}  // 來自後端的數據
                pagination  // 開啟分頁功能
                highlightOnHover  // 行 hover 高亮
                pointerOnHover  // 當滑鼠移到行上時顯示指針
                responsive  // 適應不同屏幕
                striped  // 斑馬線樣式
                subHeader
                subHeaderComponent={
                    <input
                    type="text"
                    placeholder="Search..."
                    className="p-2 border w-full text-center"  // 搜索框居中
                    />
                }
                customStyles={customStyles}  // 使用自定義樣式
                />
            </div>
        </div>
      );
}