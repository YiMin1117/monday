import { SearchArea } from "./SearchArea";
import { ResultArea } from "./ResultArea";
import { useState } from "react";

/*
searchInput:{
   searchBy:str, // "target" or "regulator"
   Gene_Name:str, // input string
}
*/


export function SearchPage(){
    const test_init = {
        searchBy:"target",
        Gene_Name:"我操你媽，變數名稱給我固定大小寫",
    }
    const [search_input, setSearchInput] = useState(test_init)
    const [search_result, setSearchResult] = useState([])
    console.log("Render!", search_result)
    return (
        <div className="bg-slate-200 p-5 flex flex-col justify-center">
            <SearchArea search_input={search_input} setSearchInput={setSearchInput} setSearchResult={setSearchResult}/>
            <ResultArea search_result_list={search_result} />        
        </div>

    );

}