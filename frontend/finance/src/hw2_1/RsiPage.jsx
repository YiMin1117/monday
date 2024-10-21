import React, { useState } from 'react';
import { NavBar } from '../NavBar';
import { RsiSearch } from './RsiSearch';
import { RsiRsult } from './RsiResult';


export default function RsiPage(){
    // 初始化 state，包含所有的輸入字段
    const [formData, setFormData] = useState({
        stockCode: '',
        strategy: 'RSI黃金交叉策略',
        shortTermRSI: 5,
        longTermRSI: 20,
        startDate: '2022-02-15',
        endDate: '2024-09-30',
      });
    const [rsiData, setRsiData] = useState(null);

    return(
        <div className="bg-neutral-400 p-5 flex flex-col justify-center pt-16">
        <NavBar></NavBar>
        <RsiSearch formData={formData} setFormData={setFormData} setRsiData={setRsiData}></RsiSearch>
        <RsiRsult rsiData={rsiData}></RsiRsult>
       </div>
    )
}
