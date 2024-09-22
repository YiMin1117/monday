/*
searchInput:{
   searchBy:str, // "target" or "regulator"
   gene_name:str, // input string
}
*/

export function SearchArea({search_input, setSearchInput}){
    return (
        <div className="flex flex-col">
            <div className="flex justify-evenly">
                <label>
                    <input type="radio" checked={search_input.searchBy==="target"?true:false}
                        onChange={()=>{setSearchInput({...search_input, searchBy:"target"})}}
                    />
                    target radio
                </label>
                <label >
                    <input type="radio" checked={search_input.searchBy==="target"?false:true}
                        onChange={()=>{setSearchInput({...search_input, searchBy:"regulator"})}}
                    />
                    regulator radio
                </label>
            </div>
            <div className="grid grid-cols-2">
                <div>請再右邊輸入 input</div>
                <input type="text" className="border"
                    value={search_input.gene_name}
                    onChange={e=>{
                        setSearchInput({...search_input, gene_name:e.target.value})
                    }}
                />
            </div>
        </div>
    );
}