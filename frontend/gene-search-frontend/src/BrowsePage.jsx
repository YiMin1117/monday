import { NavBar } from "./NavBar";
import React, { useState } from 'react';
import { BrowseSearchArea } from "./BrowseSearchArea";
import { BrowseResult } from "./BrosweResult";

export function BrowsePage(){
    const [browseBy, setBrowseBy] = useState('target');
    const [rnaTypes, setRnaTypes] = useState({
        mrna: false,
        nonCodingRNA: {
          selectAll: false,
          types: {//there can add button to del selectall
              '7kncRNA(non)': false,
              ncRNA: false,
              asRNA: false,
              circular_ncRNA: false,
              lincRNA: false,
              miRNA: false,
              pre_miRNA: false,
              rRNA: false,
              scRNA: false,
              miRNA_primary_transcript: false,
              nc_primary_transcript: false,
              snoRNA: false,
              snRNA: false,
              tRNA: false,
              'Transposon-non-coding_transcript': false,
              'Transposon-mRNA': false,
          }
    }
  });
  const [data, setData] = useState([]);
  return(
    <div className=" p-5 flex flex-col justify-center pt-16">
        <NavBar/>
        <BrowseSearchArea browseBy={browseBy } rnaTypes={rnaTypes} setBrowseBy={setBrowseBy} setRnaTypes={setRnaTypes}
        data={data} setData={setData}/>
        <BrowseResult data={data}/>
    </div>
  )
}
  