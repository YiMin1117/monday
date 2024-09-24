
function GeneInfo({search_result}){
    let table_content;
    if (search_result){
        table_content = (
            <>
                <div className="border-b-2 py-2 flex items-center justify-center">
                    Gene {search_result.Gene_Name} information
                </div>
                <div>
                    <div className="border-b-2">Gene Information</div>
                    <div className="py-2 text-xs border-stone-500 grid gap-2 grid-flow-col grid-rows-5 grid-cols-2 sm:grid-rows-2 sm:grid-cols-5 sm:grid-flow-row sm:text-xs md:text-base lg:text-xl">
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">Gene WormBase ID</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">Status</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">Gene Sequence Name</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">Gene Name</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">Other Name</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Gene_ID}</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Status}</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Sequence_Name}</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Gene_Name}</div>
                        <div className="bg-neutral-100 hover:bg-neutral-300 rounded flex justify-center items-center text-center p-0.5">{search_result.Other_Name}</div>
                    </div>
                </div>
            </>
        )
    }else{
        table_content = <div className="flex justify-center text-2xl">沒有找到!</div>;
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

export function ResultArea({search_result}){
    return (
        <div className="border border-stone-500 rounded-md p-5 shadow-md bg-white">
            <GeneInfo search_result={search_result} />
        </div>
    );
}