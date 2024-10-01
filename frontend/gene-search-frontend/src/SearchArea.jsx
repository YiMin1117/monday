/*
searchInput:{
   searchBy:str, // "target" or "regulator"
   Gene_Name:str, // input string
   
}
*/

const JSON_HEADER = {
    'Content-Type':'application/json',
}

const DEBUG = true

const ROOT = DEBUG ? "http://127.0.0.1:8000/search/" : "/search/"

export function SearchArea({search_input, setSearchInput, setSearchResult}){
    let getGene = ()=>{
        fetch(ROOT + 'get_gene/',{
            method:"POST",
            headers:JSON_HEADER,
            body:JSON.stringify(search_input),
        }
        ).then(response=>{return response.json()})
        .then(json_response=>{
            if (json_response.status === "success"){
                setSearchResult(json_response.data);
            }else{
                setSearchResult(null)
            }
            console.log(json_response)
        })
        .catch(err=>{console.log(err)})
    }

    return (
        <div className="my-1 border border-stone-500 rounded-md p-2 shadow-md bg-white grid gap-1 grid-cols-1 sm:grid-cols-2 text-center">
            <div>請輸入類型 (目前沒效果)</div>
            <div className="flex justify-around">
                <label className="rounded-2xl p-1 hover:bg-stone-300 active:bg-stone-500">
                    <input type="radio" checked={search_input.searchBy==="target"?true:false}
                        onChange={()=>{setSearchInput({...search_input, searchBy:"target"})}}
                    />
                    target radio</label>
                <label className="rounded-2xl p-1 hover:bg-stone-300 active:bg-stone-500">
                    <input type="radio" checked={search_input.searchBy==="target"?false:true}
                        onChange={()=>{setSearchInput({...search_input, searchBy:"regulator"})}}
                    />
                    regulator radio</label>
            </div>
            <div>請輸入 Gene Name</div>
            <input type="text" className="border rounded-sm hover:bg-neutral-200"
                value={search_input.gene_name}
                onChange={e=>{
                    setSearchInput({...search_input, Gene_Name:e.target.value})
                }}
            />
            <button onClick={getGene}
                className="my-1 mx-auto w-3/4 rounded-md border border-lime-50 bg-lime-300 hover:bg-lime-400 active:bg-lime-500 sm:col-span-2"
            >
                Search!
            </button>
        </div>
    );
}