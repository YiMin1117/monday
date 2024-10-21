import React, { useState } from 'react';
import { NavBar } from '../NavBar';
import { BackSearch } from './BackSearch';
import { BackResult } from './BackResult';

export function BackTrader(){
    const [formData, setFormData] = useState({
        stock: '2330',
        entryStrategy: 'RSI黃金交叉',
        exitStrategy: 'RSI死亡交叉',
        longTermRSI: '20',
        shortTermRSI: '5',
        initialCapital: '1000000',
        transactionFee: '0.001425',
        startDate: '2022-02-01',
        endDate: '2024-09-30',
        stack:'1000',
    });
    const [backData,setBackData]=useState()
    console.log(backData)
    
    return(
        <div className="bg-neutral-400 p-5 flex flex-col justify-center pt-16">
            <NavBar></NavBar>
            <BackSearch formData={formData} setFormData={setFormData} setBackData={setBackData}></BackSearch>
            <BackResult resultData={backData}></BackResult>
        </div>
        
    )
}