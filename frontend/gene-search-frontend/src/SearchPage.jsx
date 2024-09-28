import { SearchArea } from "./SearchArea";
import { ResultArea } from "./ResultArea";
import { NavBar } from "./NavBar";
import { useState } from "react";


// """
// searchInput:{
//     searchBy:str, // "target" or "regulator"
//     search_term:str, // input string
// }
// """


export function SearchPage(){
    const test_init = {
        searchBy:"target",
        search_term:"",
    }
    const [search_input, setSearchInput] = useState(test_init)
    const [search_result, setSearchResult] = useState(null)
    console.log("Render!", search_result)
    return (
        <div className="bg-neutral-400 p-5 flex flex-col justify-center pt-16"> {/* padding-top to account for fixed NavBar */}
            <NavBar />
            <SearchArea search_input={search_input} setSearchInput={setSearchInput} setSearchResult={setSearchResult}/>
            <ResultArea search_result={search_result} search_input={search_input} />        
        </div>

    );

}