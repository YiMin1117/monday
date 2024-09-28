import { useState } from "react";
// '''
// const [browseBy, setBrowseBy] = useState('target');
//     const [rnaTypes, setRnaTypes] = useState({
//         mrna: false,
//         nonCodingRNA: {
//         selectAll: false,
//         types: {
//             '7kncRNA': false,
//             ncRNA: false,
//             asRNA: false,
//             circRNA: false,
//             lincRNA: false,
//             miRNA: false,
//             preMiRNA: false,
//             rRNA: false,
//             scRNA: false,
//             miRNAPrimaryTranscript: false,
//             nonCodingTranscript: false,
//             snoRNA: false,
//             snRNA: false,
//             tRNA: false,
//             transposonNcRNA: false,
//             transposonMrna: false,
//         }
//     }
//   });
// '''
export function BrowseSearchArea({browseBy,rnaTypes,setBrowseBy,setRnaTypes,data,setData}){
  const handleBrowseByChange = (e) => {
    setBrowseBy(e.target.value);
  };

  const handleCheckboxChange = (category, type = null) => {
    if (category === 'mrna') {
      setRnaTypes((prevState) => ({
        ...prevState,
        mrna: !prevState.mrna
      }));
    } else if (category === 'nonCodingRNA') {
      if (type === 'selectAll') {
        const selectAll = !rnaTypes.nonCodingRNA.selectAll;
        const newTypes = {};
        Object.keys(rnaTypes.nonCodingRNA.types).forEach(key => {
          newTypes[key] = selectAll;
        });
        setRnaTypes((prevState) => ({
          ...prevState,
          nonCodingRNA: {
            selectAll: selectAll,
            types: newTypes
          }
        }));
      } else {
        setRnaTypes((prevState) => ({
          ...prevState,
          nonCodingRNA: {
            ...prevState.nonCodingRNA,
            types: {
              ...prevState.nonCodingRNA.types,
              [type]: !prevState.nonCodingRNA.types[type]
            }
          }
        }));
      }
    }
  };
  let getGene_by_type = () =>{
    let payload = {
        mrna: rnaTypes.mrna,
        nonCodingRNA: {
            selectAll: rnaTypes.nonCodingRNA.selectAll,
            types: {}
        }
    };
    for (let rnaType in rnaTypes.nonCodingRNA.types) {
        if (rnaTypes.nonCodingRNA.types) {
            payload.nonCodingRNA.types[rnaType] = rnaTypes.nonCodingRNA.types[rnaType];
        }
    }
    console.log(payload)
    fetch('http://127.0.0.1:8000/search/get_gene_by_type', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // 處理返回的結果
        if (data.status === "success") {
            // 處理成功的邏輯
            setData(data.data)
        } else {
            // 處理錯誤
            console.log('Error:', data.message);
        }
    })
    .catch(err => {
        console.error('Request failed', err);
    });
  }

  return (
    <div className="flex justify-center items-center my-1 border border-stone-500 rounded-md p-2 shadow-md bg-white"> 
      <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">
              Browse predicted PRG-1 associated piRNA-target pairs in Caenorhabditis elegans
          </h1>
          <div className="mt-6">
              <BrowseBy browseBy={browseBy} handleBrowseByChange={handleBrowseByChange} />
              
              {browseBy === 'target' && (
                  <RNATypeCheckboxes rnaTypes={rnaTypes} handleCheckboxChange={handleCheckboxChange} />
              )}
          </div>
          <button onClick={getGene_by_type}
          className="my-1 mx-auto w-3/4 rounded-md border border-lime-50 bg-lime-300 hover:bg-lime-400 active:bg-lime-500 sm:col-span-2"
          >
          Search!
          </button>
      </div>
    </div>
   

  );
}
const BrowseBy = ({ browseBy, handleBrowseByChange }) => {
    return (
    <div className="flex space-x-10">
        <label className="font-bold text-lg">Browse By:</label>
        <div>
          <input 
            type="radio" 
            name="browseBy" 
            value="target"
            checked={browseBy === 'target'}
            onChange={handleBrowseByChange}
          />
          <label className="ml-2">Target (RNAs except piRNA)</label>
        </div>
        <div>
          <input 
            type="radio" 
            name="browseBy" 
            value="regulator"
            checked={browseBy === 'regulator'}
            onChange={handleBrowseByChange}
          />
          <label className="ml-2">Regulator (piRNA)</label>
        </div>
    </div>
    );
  };
  const RNATypeCheckboxes = ({ rnaTypes, handleCheckboxChange }) => {
    return (
    <div className="mt-4">
        <input
          type="checkbox"
          id="mrna"
          checked={rnaTypes.mrna}
          onChange={() => handleCheckboxChange('mrna')}
        />
        <label htmlFor="mrna" className="ml-2">mRNA</label>
  
        <div className="mt-4 ml-6">
            <label className="font-bold">Non Coding RNA</label>
            <div className="ml-4">
                <input
                type="checkbox"
                checked={rnaTypes.nonCodingRNA.selectAll}
                onChange={() => handleCheckboxChange('nonCodingRNA', 'selectAll')}
                />
                <label className="ml-2">Select All</label>
    
                <div className="grid grid-cols-2 mt-2">
                {Object.keys(rnaTypes.nonCodingRNA.types).map((type) => (
                    <div key={type}>
                    <input
                        type="checkbox"
                        checked={rnaTypes.nonCodingRNA.types[type]}
                        onChange={() => handleCheckboxChange('nonCodingRNA', type)}
                    />
                    <label className="ml-2">{type}</label>
                    </div>
                ))}
                </div>
            </div>
        </div>
    </div>
    );
  };