import Swal from 'sweetalert2'

const JSON_HEADER = {
    'Content-Type':'application/json',
}
const DEBUG = true
const ROOT = DEBUG ? "http://127.0.0.1:8000/search/" : "/search/"
// """
// searchInput:{
//     searchBy:str, // "target" or "regulator"
//     search_term:str, // input string
// }
// """
export function SearchArea({search_input, setSearchInput, setSearchResult}) {
    let getGene = () => {
        fetch(ROOT + 'get_gene/', {
            method: "POST",
            headers: JSON_HEADER,
            body: JSON.stringify({
                searchBy: search_input.searchBy,
                search_term: search_input.search_term
            }),
        })
        .then(response => response.json())
        .then(json_response => {
            if (json_response.status === "success") {
                const results = json_response.data;
                if (results.length > 1) {
                    // 如果有多個結果，使用 SweetAlert 讓用戶選擇
                    let options = results.map(result => ({
                        text: `${result.Gene_ID} - ${result.Gene_Name} - ${result.Transcript_Name} - ${result.Sequence_Name} - ${result.Other_Name}`,
                        value: result
                    }));

                    Swal.fire({
                        title: '選擇一個基因',
                        input: 'select',
                        inputOptions: options.reduce((obj, item) => {
                            obj[item.value.id] = item.text;
                            return obj;
                        }, {}),
                        inputPlaceholder: '選擇一個基因',
                        showCancelButton: true
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // 根據用戶選擇設置結果
                            const selectedGene = results.find(gene => gene.id == result.value);
                            setSearchResult(selectedGene);  // 更新 ResultArea 顯示選擇的結果
                        }
                    });
                } else {
                    // 如果只有一個結果，直接顯示
                    setSearchResult(results[0]);
                }
            } else {
                setSearchResult({});  // 如果沒有結果，顯示空結果
            }
        })
        .catch(err => { console.log(err) });
    };

    return (
        <div className="my-1 border border-stone-500 rounded-md p-2 shadow-md bg-white grid gap-1 grid-cols-1 sm:grid-cols-2 text-center">
            <div>請輸入類型 (目前沒效果)</div>
            <div className="flex justify-around">
                <label className="rounded-2xl p-1 hover:bg-stone-300 active:bg-stone-500">
                    <input type="radio" checked={search_input.searchBy === "target"} 
                        onChange={() => { setSearchInput({...search_input, searchBy: "target"}) }}
                    />
                    target radio
                </label>
                <label className="rounded-2xl p-1 hover:bg-stone-300 active:bg-stone-500">
                    <input type="radio" checked={search_input.searchBy === "regulator"} 
                        onChange={() => { setSearchInput({...search_input, searchBy: "regulator"}) }}
                    />
                    regulator radio
                </label>
            </div>
            <div>Input a gene or transcript to search:
            (e.g. fbxb-97 , WBGene00016885 , C52E2.6.1 )</div>
            <input type="text" className="border rounded-sm hover:bg-neutral-200"
                value={search_input.search_term}
                onChange={e => {
                    setSearchInput({...search_input, search_term: e.target.value})
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
