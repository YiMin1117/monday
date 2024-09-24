import { SearchArea } from "./SearchArea";
import { ResultArea } from "./ResultArea";
import { useState } from "react";

/*
searchInput:{
   searchBy:str, // "target" or "regulator"
   Gene_Name:str, // input string
}
*/

const temp_data = {
    "Gene_ID": "WBGene00000001",
    "Status": "Live",
    "Sequence_Name": "Y110A7A.10",
    "Gene_Name": "aap-1",
    "Other_Name": "CELE_Y110A7A.10",
    "Transcript_Name": "Y110A7A.10.1",
    "Type": "coding_transcript"
}

export function SearchPage(){
    const test_init = {
        searchBy:"target",
        Gene_Name:"",
    }
    const [search_input, setSearchInput] = useState(test_init)
    const [search_result, setSearchResult] = useState(null)
    console.log("Render!", search_result)
    return (
        <div className="bg-slate-200 p-5 flex flex-col justify-center">
            <SearchArea search_input={search_input} setSearchInput={setSearchInput} setSearchResult={setSearchResult}/>
            <ResultArea search_result={search_result} />        
        </div>

    );

}