// """
// searchInput:{
//     searchBy:str, // "target" or "regulator"
//     search_term:str, // input string
// }

import { Link } from "react-router-dom";

// """
export function ResultArea({search_result ,search_input}) {
    
    return (
        <div className="border border-stone-500 rounded-md p-5 shadow-md bg-white">
             <GeneInfo search_result={search_result} search_input={search_input} />
        </div>
    );
}
function GeneInfo({search_result,search_input}) {
    let table_content;
    if(search_result === null){
        table_content = null;
    }
    // 確保 search_result_list 是一個數組，如果不是，則設置為空數組
    else if (Object.keys(search_result).length === 0) {
        table_content = <div className="flex justify-center text-2xl">沒有找到!</div>;
    } else {
        console.log(search_result)
        let input_type;
        let all_name=Object.keys(search_result);
        for (let index = 0; index < all_name.length; index++) {
            if(search_result[all_name[index]]=== search_input.search_term){
                input_type = all_name[index]
                break
            }
        }
        //console.log(search_result.Gene_Name)
        table_content = (
            <>
                <div className="border-b-2 py-2 flex items-center justify-center text-2xl">
                    Gene {search_result.Gene_Name}  information
                </div>
                <div>
                    <div className="border-b-2">Gene Information</div>
                    <div className="py-2 text-xs border-stone-500 grid gap-2 grid-flow-col grid-rows-5 grid-cols-2 sm:grid-rows-2 sm:grid-cols-[repeat(5,_auto)] sm:grid-flow-row sm:text-xs md:text-base lg:text-xl">
                        <div className={(input_type=="Gene_ID"? "bg-lime-300":"bg-neutral-300")+ " hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5"}>Gene WormBase ID</div>
                        <div className={(input_type=="Status"? "bg-lime-300":"bg-neutral-300")+ " hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5"}>Status</div>
                        <div className={(input_type=="Sequence_Name"? "bg-lime-300":"bg-neutral-300")+ " hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5"}>Gene Sequence Name</div>
                        <div className={(input_type=="Gene_Name"? "bg-lime-300":"bg-neutral-300")+ " hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5"}>Gene Name</div>
                        <div className={(input_type=="Other_Name"? "bg-lime-300":"bg-neutral-300")+ " hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5"}>Other Name</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5"><a className="text-sky-600 underline "  href={`https://wormbase.org/species/c_elegans/gene/${search_result.Gene_ID}`} target="_blank" >{search_result.Gene_ID}</a></div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Status}</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Sequence_Name}</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Gene_Name}</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Other_Name}</div>
                    </div> 
                    <div className="py-2 text-xs border-stone-500 grid gap-2 grid-flow-col grid-rows-2 grid-cols-2 sm:grid-rows-2 sm:grid-cols-[repeat(2,_auto)] sm:grid-flow-row sm:text-xs md:text-base lg:text-xl">
                        <div className={(input_type=="Transcript_Name"? "bg-lime-300":"bg-neutral-300")+ " hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5"}>RNA Name</div>
                        <div className={(input_type=="Type"? "bg-lime-300":"bg-neutral-300")+ " hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5"}>RNA Type</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5 text-blue-600 underline">
                            <Link to={`/transcript/${search_result.Transcript_Name}`}>{search_result.Transcript_Name}</Link></div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Type}</div>

                    </div> 
                </div>
            </>
        )
    }

    return (
        <div className="grid grid-cols-1">
            {table_content}
        </div>
    );
}




/*
search_result:{
    "Gene_ID": "WBGene00000001",
    "Status": "Live",
    "Sequence_Name": "Y110A7A.10",
    "Gene_Name": "aap-1",
    "Other_Name": "CELE_Y110A7A.10",
    "Transcript_Name": "Y110A7A.10.1",
    "Type": "coding_transcript"
}
*/

