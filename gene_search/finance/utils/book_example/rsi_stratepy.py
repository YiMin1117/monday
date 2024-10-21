import pandas as pd
import mplfinance as mpf
from talib.abstract import RSI
from .Data import getData
from .BackTest import ChartTrade, Performance

def rsi_backtest_strategy(prod, start_date, end_date, short_term=120, long_term=150):
    print(prod)
    # 取得回測資料
    data = getData(prod, start_date, end_date)

    # 計算相對強弱指標
    data['rsi1'] = RSI(data, timeperiod=short_term)
    data['rsi2'] = RSI(data, timeperiod=long_term)

    # 初始部位
    position = 0
    trade = pd.DataFrame()

    # 開始回測
    for i in range(data.shape[0] - 1):
        c_time = data.index[i]
        c_rsi1 = data.loc[c_time, 'rsi1']
        c_rsi2 = data.loc[c_time, 'rsi2']
        n_time = data.index[i + 1]
        n_open = data.loc[n_time, 'open']

        # 進場程序
        if position == 0:
            if c_rsi1 > c_rsi2:
                position = 1
                order_time = n_time
                order_price = n_open
                order_unit = 1
        # 出場程序
        elif position == 1:
            if c_rsi1 < c_rsi2 * 0.999:
                position = 0
                cover_time = n_time
                cover_price = n_open
                # 記錄交易資料
                trade = pd.concat([trade, pd.DataFrame([[
                    prod, 
                    'Buy', 
                    order_time, 
                    order_price, 
                    cover_time, 
                    cover_price, 
                    order_unit
                ]])], ignore_index=True)

    return trade


# # 繪製副圖
# addp = []
# addp.append(mpf.make_addplot(data['rsi1'], panel=2, secondary_y=False))
# addp.append(mpf.make_addplot(data['rsi2'], panel=2, secondary_y=False))

# # 績效分析
# Performance(trade, 'ETF')
# # 繪製K線圖與交易明細
# ChartTrade(data, trade, addp=addp)
