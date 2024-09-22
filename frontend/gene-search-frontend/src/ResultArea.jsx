
function GeneInfo({search_result}){
    return (
        <div>
            <div>Gene {search_result.Gene_Name} information</div>
            <div>
                Gene Information
                <div className="px-5 overflow-x-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Gene WormBase ID</th>
                                <th>Status</th>
                                <th>Gene Sequence Name</th>
                                <th>Gene Name</th>
                                <th>Other Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{search_result.Gene_ID}</td>
                                <td>{search_result.Status}</td>
                                <td>{search_result.Sequence_Name}</td>
                                <td>{search_result.Gene_Name}</td>
                                <td>{search_result.Other_Name}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
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
        <>
            <GeneInfo search_result={search_result} />
        </>
    );
}