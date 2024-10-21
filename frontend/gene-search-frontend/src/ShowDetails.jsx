import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as d3 from 'd3';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';  // 引入 Tippy.js 樣式
import { Container, Row, Col } from 'react-bootstrap';  // 引入 Bootstrap 組件
import Swal from 'sweetalert2';
import { NavBar } from './NavBar';

export const ShowDetails = () => {
    const location = useLocation();
    const { ref_id } = location.state || {}; // 從state中獲取 ref_id
    
    const [data, setData] = useState(null);

    useEffect(() => {
        if (ref_id) {
            let timerInterval;
            let secondsPassed = 0;
    
            // Show loading spinner with countdown
            Swal.fire({
                title: 'Loading...',
                html: `Fetching data, please wait... <br> Time elapsed: <b>0</b> seconds.`,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();  // Show the spinner
    
                    // Start the interval to update the seconds
                    timerInterval = setInterval(() => {
                        secondsPassed++;
                        Swal.getHtmlContainer().querySelector('b').textContent = secondsPassed;
                    }, 1000);  // Update every second
                }
            });
    
            fetch(`http://127.0.0.1:8000/search/search_ref_id?ref_id=${ref_id}`)
            .then(response => response.json())
            .then(data => {
                // Close the loading spinner and clear the timer
                Swal.close();
                clearInterval(timerInterval);
    
                // Store the fetched data to state
                setData(data);
                
                // Draw charts using the fetched data
                drawSplicedChart(data.spliced_info); // First chart
                drawGeneChart(data.m0, 'svg-m0');    // Second chart (m0)
                drawGeneChart(data.m1, 'svg-m1');    // Third chart (m1)
                drawGeneChart(data.m2, 'svg-m2');    // Fourth chart (m2)
            })
            .catch(error => {
                // Close the loading spinner, clear the timer, and show error alert
                Swal.close();
                clearInterval(timerInterval);
    
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `Something went wrong while fetching data!`,
                });
                console.error('Error fetching data:', error);
            });
        }
    }, [ref_id]);
    
    
    console.log(data)

    // 修改 drawSplicedChart 函數來實現兩條 bar 的繪製，並調整圖例位置
    const drawSplicedChart = (splicedData) => {
        const svg = d3.select("#svg-spliced");
        const width = 1600;
        const height = 250;  // 調整高度以給圖例和條形圖留空間
        const margin = { top: 20, right: 20, bottom: 50, left: 50 };

        const x = d3.scaleLinear()
                    .domain([d3.min(splicedData, d => d.start), d3.max(splicedData, d => d.end)])
                    .range([margin.left, width - margin.right]);

        // 清空之前的圖形
        svg.selectAll("*").remove();

        svg.attr("width", width).attr("height", height);

        // 添加圖例
        const legendData = [
            { label: 'UTR', color: 'grey' },
            { label: 'CDS', color: 'green' },
            { label: 'EXON (orange)', color: 'orange' },
            { label: 'EXON (yellow)', color: 'yellow' }
        ];

        // 創建圖例群組元素，將它們放在較高位置，避免重疊條形圖
        const legend = svg.selectAll(".legend")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${margin.left}, ${i * 25})`);  // 將圖例放在圖表的上方

        // 繪製圖例的長方形
        legend.append("rect")
            .attr("x", 0)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", d => d.color);

        // 圖例的文本標籤
        legend.append("text")
            .attr("x", 30)  // 在長方形旁邊顯示文本
            .attr("y", 15)
            .style("font-size", "14px")  // 調整字體大小
            .text(d => d.label);

        // 繪製條形圖，將其下移，避免與圖例重疊
        // 第一條條狀圖：顯示 five_prime_UTR、three_prime_UTR 和 CDS
        const utrCdsData = splicedData.filter(d => d.type === 'five_prime_UTR' || d.type === 'three_prime_UTR' || d.type === 'CDS');

        svg.selectAll("rect.utr-cds")
            .data(utrCdsData)
            .enter()
            .append("rect")
            .attr("class", "utr-cds")
            .attr("x", d => x(d.start))
            .attr("y", 120)  // 下移條形圖
            .attr("width", d => x(d.end) - x(d.start))
            .attr("height", 20)
            .attr("fill", d => d.type === 'CDS' ? 'green' : 'grey')  // UTR 是灰色，CDS 是綠色
            .each(function(d) {
                // 添加 tippy.js 提示
                tippy(this, {
                    content: `
                        <table>
                            <tr><th>region</th><th>length(bp)</th><th>start</th><th>end</th></tr>
                            <tr><td>${d.type}</td><td>${d.length}</td><td>${d.start}</td><td>${d.end}</td></tr>
                        </table>
                    `,
                    allowHTML: true,  // 允許 HTML 格式
                    theme: 'material'  // Tippy.js 題材
                });
            });
        // 第二條條狀圖：顯示 EXON，並交替顏色
        const exonData = splicedData.filter(d => d.type.toLowerCase().startsWith('exon'));

        svg.selectAll("rect.exon")
            .data(exonData)
            .enter()
            .append("rect")
            .attr("class", "exon")
            .attr("x", d => x(d.start))
            .attr("y", 150)  // 下移第二條條形圖
            .attr("width", d => x(d.end) - x(d.start))
            .attr("height", 20)
            .attr("fill", (d, i) => i % 2 === 0 ? 'orange' : 'yellow')
            .each(function(d) {
                // 添加 tippy.js 提示
                tippy(this, {
                    content: `
                        <table>
                            <tr><th>region</th><th>length(bp)</th><th>start</th><th>end</th></tr>
                            <tr><td>${d.type}</td><td>${d.length}</td><td>${d.start}</td><td>${d.end}</td></tr>
                        </table>
                    `,
                    allowHTML: true,
                    theme: 'material'
                });
            });

        // 繪製 X 軸
        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom + 10})`)
            .call(d3.axisBottom(x));

        // 添加 X 軸標籤
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height)
            .text("Position");
    };

    


    // 第二到第四張圖 (m0, m1, m2)
    const drawGeneChart = (geneData, svgId) => {
        const svg = d3.select(`#${svgId}`);
        const width = 1600;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 50, left: 50 };

        const x = d3.scaleLinear()
                    .domain([d3.min(geneData, d => d.init_pos), d3.max(geneData, d => d.end_pos)])
                    .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
                    .domain([0, d3.max(geneData, d => d.evenly_rc)])
                    .range([height - margin.bottom, margin.top]);

        // 清空之前的圖形
        svg.selectAll("*").remove();

        svg.attr("width", width).attr("height", height);

        // 繪製 X 軸
        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)  // 移到圖表底部
            .call(d3.axisBottom(x));

        // 添加 X 軸標籤
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - margin.bottom + 40)  // 將標籤放在X軸下方
            .text("Position");

        // 繪製 Y 軸
        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)  // 移到圖表左側
            .call(d3.axisLeft(y));

        // 添加 Y 軸標籤
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2))
            .attr("y", margin.left - 20)
            .text("Count");

        // 繪製長方形來表示 init_pos 和 end_pos 的範圍
        svg.selectAll("rect")
            .data(geneData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.init_pos))
            .attr("y", d => y(d.evenly_rc))
            .attr("width", d => x(d.end_pos) - x(d.init_pos))
            .attr("height", d => height - margin.bottom - y(d.evenly_rc))  // 根據 evenly_rc 繪製長度
            .attr("fill", "steelblue")
            .each(function(d) {
                // 添加 tippy.js 提示
                tippy(this, {
                    content: `
                        start: ${d.init_pos} <br>
                        end: ${d.end_pos} <br>
                        read_count: ${d.evenly_rc}
                    `,
                    allowHTML: true,
                    theme: 'material'
                });
            });
    };

    return (
        <Container className="mt-4">
        <NavBar></NavBar>
          <Row>
            <Col>
              <h1 className="text-center">Transcript Detail</h1>
              <p className="text-center">Transcript Name: {ref_id}</p>
            </Col>
          </Row>
    
          {/* 第一張圖 (spliced_info) */}
          <Row className="mt-3">
            <Col>
              <svg id="svg-spliced" className="d-block mx-auto"></svg>
            </Col>
          </Row>
    
          {/* 第二張圖 (m0) */}
          <Row className="mt-3">
            <Col>
              <svg id="svg-m0" className="d-block mx-auto"></svg>
            </Col>
          </Row>
    
          {/* 第三張圖 (m1) */}
          <Row className="mt-3">
            <Col>
              <svg id="svg-m1" className="d-block mx-auto"></svg>
            </Col>
          </Row>
    
          {/* 第四張圖 (m2) */}
          <Row className="mt-3">
            <Col>
              <svg id="svg-m2" className="d-block mx-auto"></svg>
            </Col>
          </Row>
        </Container>
      );
      
};
