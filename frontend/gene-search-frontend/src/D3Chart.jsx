import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // 引入tippy样式

// 定义组件
export default function D3Chart({ data }) {
  const d3Container = useRef(null);

  // Tooltip 生成函数
  const generateTooltipContent = (d) => {
    return `<table class='table' id='specific-table'>
              <tr><th>region</th><th>length(bp)</th><th>start</th><th>end</th></tr>
              <tr><td>${d.type}</td><td>${d.stop - d.start}</td><td>${d.start}</td><td>${d.stop}</td></tr>
            </table>`;
  };

  // D3 图表更新函数
  const updateChart = () => {
    if (d3Container.current && data) {
      const svg = d3.select(d3Container.current);
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 800 - margin.left - margin.right;
      const height = 200 - margin.top - margin.bottom;

      // 清除之前的内容(子元素)
      svg.selectAll("*").remove();

      // 定义绘制的区域
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // 设置 x 轴比例尺
      const x = d3.scaleLinear()
                  .domain([0, d3.max(data, d => d.stop)])
                  .range([0, width]);

      // 设置 y 轴比例尺
      const y = d3.scaleBand()
                  .domain(['utr', 'cds', 'exon','intron'])
                  .range([0, height])
                  .padding(0.1);

      // 添加 x 轴
      g.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

      // 定义颜色
      const colors = {
        'utr': '#D3D3D3',  // 灰色
        'cds': '#008000' ,  // 绿色
        'odd_exon': '#FFFF00',
        'even_exon': '#FFA500',
        'intron': '#F5F5DC'  // 乳白色
      };

      // 固定条形图的高度
      const barHeight = 20;
      const barSpacing = 5;

      // 绘制 UTR 和 CDS 条形图
      g.selectAll(".bar")
       .data(data.filter(d => d.type && (d.type.toLowerCase().includes('utr') || d.type.toLowerCase() === 'cds')))
       .enter().append("rect")
       .attr("class", "bar")
       .attr("x", d => x(d.start))
       .attr("y", d => y(d.type.toLowerCase().includes('UTR') ? 'UTR' : 'cds'))
       .attr("width", d => x(d.stop) - x(d.start))
       .attr("height", barHeight) // 固定高度
       .attr("fill", d => colors[d.type.toLowerCase().includes('utr') ? 'utr' : 'cds'])
       .attr("data-tippy-content", d => generateTooltipContent(d));
      // 绘制 intron 条形图
      g.selectAll(".intron")
        .data(data.filter(d => d.type && d.type.toLowerCase().includes('intron')))
        .enter().append("rect")
        .attr("class", "bar intron")
        .attr("x", d => x(d.start))
        .attr("y", y('cds') + barHeight + barSpacing)  // 在和 cds, exon 同一 y 轴
        .attr("width", d => x(d.stop) - x(d.start))
        .attr("height", barHeight)
        .attr("fill", colors['intron'])  // 设置为乳白色
        .attr("data-tippy-content", d => generateTooltipContent(d));
        
      // 绘制 exon 条形图
      let exonIndex = 0;
      g.selectAll(".exon")
        .data(data.filter(d => d.type && d.type.toLowerCase().includes('exon')))
        .enter().append("rect")
        .attr("class", "bar exon")
        .attr("x", d => x(d.start))
        .attr("y", y('cds') + barHeight + barSpacing)
        .attr("width", d => x(d.stop) - x(d.start))
        .attr("height", barHeight)
        .attr("fill", d => exonIndex++ % 2 === 0 ? colors['odd_exon'] : colors['even_exon'])
        .attr("data-tippy-content", d => generateTooltipContent(d));

      // 初始化 Tippy.js
      tippy('.bar', {
        allowHTML: true,
        theme: 'light',
        arrow: true
      });
    }
  };

  // 使用 useEffect 更新 D3 图表
  useEffect(() => {
    updateChart();
  }, [data]);

  return (
    <div>
      <svg ref={d3Container} width={800} height={200}></svg>
    </div>
  );
}
