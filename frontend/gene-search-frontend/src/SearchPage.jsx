import { SearchArea } from "./SearchArea";
import { ResultArea } from "./ResultArea";
import { useState } from "react";

/*
searchInput:{
   searchBy:str, // "target" or "regulator"
   gene_name:str, // input string
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
        gene_name:"123456789",
    }
    const [search_input, setSearchInput] = useState(test_init)

    return (
        <div className="bg-slate-200 p-5 flex flex-col justify-center">
            <SearchArea search_input={search_input} setSearchInput={setSearchInput}/>
            <ResultArea search_result={temp_data} />
        
        </div>

    );

}