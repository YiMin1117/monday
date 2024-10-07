import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import D3Chart from './D3Chart';
import DataTable from 'react-data-table-component';

export function TranscriptPage() {
  const { transcriptName } = useParams();
  const [transcriptData, setTranscriptData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/search/get_transcript_data/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript_name: transcriptName })
    })
      .then(response => response.json())
      .then(data => setTranscriptData(data))
      .catch(error => console.error('Error fetching transcript data:', error));
  }, [transcriptName]);

  const splicedColumns = [
    { name: 'Type', selector: row => row.type, sortable: true },
    { name: 'Start', selector: row => row.start, sortable: true },
    { name: 'Stop', selector: row => row.stop, sortable: true },
    { name: 'Length', selector: row => row.length, sortable: true }
  ];

  const unsplicedColumns = [
    { name: 'Type', selector: row => row.type, sortable: true },
    { name: 'Start', selector: row => row.start, sortable: true },
    { name: 'Stop', selector: row => row.stop, sortable: true },
    { name: 'Length', selector: row => row.length, sortable: true }
  ];
  
  console.log('transript)debug:',transcriptData)
  // 通用函數：處理序列的著色和格式化
  const formatSequence = (sequence, data) => {
    const colors = {
      odd_exon: "#FFFF00",  // 黃色
      even_exon: "#FFA500", // 橘色
      utr: "#D3D3D3",        // 灰色
      intron: "transparent" // 無色處理的 intron
    };
    // 確保 data 和 sequence 存在
    if (!data || !sequence) return '';

    let coloredSequence = Array(sequence.length).fill(colors.intron);

    // 著色外顯子
    let exonIndex = 0;
    data.forEach(row => {
      if (row.type.startsWith('exon')) {
        let start = row.start - 1;
        let stop = row.stop;
        let color = (exonIndex % 2 === 0) ? colors.odd_exon : colors.even_exon;
        for (let i = start; i < stop; i++) {
          coloredSequence[i] = color;
        }
        exonIndex++;
      }
    });

    // 著色 UTR 區域
    data.forEach(row => {
      if (row.type.endsWith('UTR')) {
        let start = row.start - 1;
        let stop = row.stop;
        for (let i = start; i < stop; i++) {
          coloredSequence[i] = colors.utr;
        }
      }
    });

    // 格式化字符串
    let coloredSegments = coloredSequence.map((color, index) => {
      let char = sequence[index];
      return color ? `<span style="background-color: ${color};">${char}</span>` : char;
    });

    let formattedString = '';
    let segments = coloredSegments.join('');

    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = segments;
    let spans = Array.from(tempDiv.querySelectorAll('span'));

    // 添加空格和換行符
    for (let i = 0; i < spans.length; i++) {
      formattedString += spans[i].outerHTML;
      if ((i + 1) % 10 === 0 && (i + 1) !== spans.length) {
        formattedString += '&nbsp;';
      }
      if ((i + 1) % 50 === 0 && (i + 1) !== spans.length) {
        formattedString += '<br>';
      }
    }

    return formattedString;
  };

  // 格式化蛋白質序列
  const formatProteinData = (proteinSeq) => {
    
    let formatted = '';
    for (let i = 0; i < proteinSeq.length; i += 40) {
      let index = i + 1;
      let segment = proteinSeq.substring(i, i + 40);
      let spacedSegment = segment.match(/.{1,10}/g).join(' ');
      formatted += `${index.toString().padEnd(5)} ${spacedSegment}\n`;
    }
    return formatted;
  };

  if (!transcriptData) {
    return <div>Loading...</div>;
  }

   return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Transcript Information: {transcriptName}</h1>

      {/* Spliced Table and Sequence */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Spliced Table</h2>
        {transcriptData.spliced_data.length > 0 ? (
          <DataTable
            columns={splicedColumns}
            data={transcriptData.spliced_data}
            pagination
            highlightOnHover
          />
        ) : (
          <p>No spliced data available</p>
        )}

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Spliced Sequence</h2>
          <div className="flex">
            <div className="w-1/2">
              {transcriptData.spliced_sequence && transcriptData.spliced_data ? (
                <pre className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatSequence(transcriptData.spliced_sequence, transcriptData.spliced_data) }}></pre>
              ) : (
                <p>No spliced sequence available</p>
              )}
            </div>
            <div className="w-1/2">
              <D3Chart data={transcriptData.spliced_data}></D3Chart>
            </div>
          </div>
        </div>
      </div>

      {/* Unspliced Table and Sequence */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Unspliced Table</h2>
        {transcriptData.unspliced_data.length > 0 ? (
          <DataTable
            columns={unsplicedColumns}
            data={transcriptData.unspliced_data}
            pagination
            highlightOnHover
          />
        ) : (
          <p>No unspliced data available</p>
        )}

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Unspliced Sequence</h2>
          <div className="flex">
            <div className="w-1/2">
              {transcriptData.unspliced_sequence && transcriptData.unspliced_data ? (
                <pre className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatSequence(transcriptData.unspliced_sequence, transcriptData.unspliced_data) }}></pre>
              ) : (
                <p>No unspliced sequence available</p>
              )}
            </div>
            <div className="w-1/2">
              <D3Chart data={transcriptData.unspliced_data}></D3Chart>
            </div>
          </div>
        </div>
      </div>

      {/* Protein Data */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Protein Data</h2>
        <pre className="whitespace-pre-wrap">
          {formatProteinData(transcriptData.protein_data)}
        </pre>
      </div>
    </div>
  );
}
