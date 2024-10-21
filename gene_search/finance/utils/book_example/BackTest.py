# 載入必要套件
import mplfinance as mpf
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np 

# 繪製蠟燭圖
def ChartCandle(data,addp=[]):
    mcolor=mpf.make_marketcolors(up='r', down='g', inherit=True)
    mstyle=mpf.make_mpf_style(base_mpf_style='yahoo', marketcolors=mcolor)
    mpf.plot(data,addplot=addp,style=mstyle,type='candle',volume=True)

# 繪製交易記錄圖
import mplfinance as mpf
import pandas as pd

def ChartTrade(data, trade=pd.DataFrame(), addp=[], v_enable=True):
    addp = addp.copy()
    data1 = data.copy()
    chart_data = {
        'buy_orders': [],
        'sell_orders': [],
        'candle_data': [],
    }

    # 如果有交易紀錄，則把交易紀錄與 K 線彙整
    if trade.shape[0] > 0:
        # 將物件複製出來，不影響原本的交易明細變數
        trade1 = trade.copy()

        # 取出進場明細，透過時間索引將資料合併
        buy_order_trade = trade1[[2, 3]]
        buy_order_trade = buy_order_trade.set_index(2)
        buy_order_trade.columns = ['buy_order']
        buy_order_trade = buy_order_trade.drop_duplicates()

        # 取出出場明細，透過時間索引將資料合併
        buy_cover_trade = trade1[[4, 5]]
        buy_cover_trade = buy_cover_trade.set_index(4)
        buy_cover_trade.columns = ['buy_cover']
        buy_cover_trade = buy_cover_trade.drop_duplicates()

        # 將交易紀錄與 K 線資料彙整
        data1 = pd.concat([data1, buy_order_trade, buy_cover_trade], axis=1)

        # 收集用於前端繪製圖表的買賣交易數據，包含時間戳
        chart_data['buy_orders'] = [{'date': int(index.timestamp() * 1000), 'price': row['buy_order']}
                                    for index, row in data1.iterrows() if not pd.isna(row['buy_order'])]

        chart_data['sell_orders'] = [{'date': int(index.timestamp() * 1000), 'price': row['buy_cover']}
                                     for index, row in data1.iterrows() if not pd.isna(row['buy_cover'])]

        # 構建燭台圖表數據 (candle data)
        for index, row in data1.iterrows():
            chart_data['candle_data'].append({
                'timestamp':  int(index.timestamp() * 1000),
                'open': row['open'],
                'high': row['high'],
                'low': row['low'],
                'close': row['close'],
                'volume': row['volume']
            })

    return chart_data

    
# 計算交易績效指標
import json
import matplotlib.pyplot as plt

def Performance(trade=pd.DataFrame(), prodtype='ETF'):
    results = {
        'total_return': None,
        'total_trades': None,
        'average_return': None,
        'average_holding_days': None,
        'win_rate': None,
        'average_profit': None,
        'average_loss': None,
        'profit_loss_ratio': None,
        'expectancy': None,
        'max_consecutive_loss': None,
        'max_drawdown': None,
        'acc_ret': [],  # 資金曲線數據
        'dd': [],  # 最大回落數據
        'new_high': []  # 資金新高數據
    }

    if trade.shape[0] == 0:
        print('沒有交易紀錄')
        return json.dumps(results)

    # 處理交易成本
    cost = 0.001 + 0.00285 if prodtype == 'ETF' else 0.003 + 0.00285 if prodtype == 'Stock' else None
    if cost is None:
        return json.dumps(results)

    # 計算交易報酬率
    trade1:pd.DataFrame = trade.copy()
    trade1 = trade1.sort_values(4).reset_index(drop=True)
    trade1.columns = ['product', 'bs', 'order_time', 'order_price', 'cover_time', 'cover_price', 'order_unit']
    trade1['ret'] = (((trade1['cover_price'] - trade1['order_price']) / trade1['order_price']) - cost) * trade1['order_unit']

    # 計算報酬率和其他指標
    results['total_return'] = round(trade1['ret'].sum(), 4)
    results['total_trades'] = trade1.shape[0]
    results['average_return'] = round(trade1['ret'].mean(), 4)

    onopen_day = (trade1['cover_time'] - trade1['order_time']).mean()
    results['average_holding_days'] = onopen_day.days if not trade1.empty else 0

    earn_trade = trade1[trade1['ret'] > 0]
    loss_trade = trade1[trade1['ret'] <= 0]
    if not earn_trade.empty and not loss_trade.empty:
        earn_ratio = earn_trade.shape[0] / trade1.shape[0]
        avg_earn = earn_trade['ret'].mean()
        avg_loss = loss_trade['ret'].mean()

        results['win_rate'] = round(earn_ratio, 2)
        results['average_profit'] = round(avg_earn, 4)
        results['average_loss'] = round(avg_loss, 4)
        results['profit_loss_ratio'] = round(abs(avg_earn / avg_loss), 4)
        results['expectancy'] = round((earn_ratio * results['profit_loss_ratio']) - (1 - earn_ratio), 4)

        earn_onopen_day = (earn_trade['cover_time'] - earn_trade['order_time']).mean() if not earn_trade.empty else pd.Timedelta(0)
        loss_onopen_day = (loss_trade['cover_time'] - loss_trade['order_time']).mean() if not loss_trade.empty else pd.Timedelta(0)

        results['average_profit_holding_days'] = earn_onopen_day.days if not earn_trade.empty else 0
        results['average_loss_holding_days'] = loss_onopen_day.days if not loss_trade.empty else 0

    # 最大連續虧損計算
    tmp_accloss = 1
    max_accloss = 1
    for ret in trade1['ret'].values:
        if ret <= 0:
            tmp_accloss *= (1 + ret)
            max_accloss = min(max_accloss, tmp_accloss)
        else:
            tmp_accloss = 1
    results['max_consecutive_loss'] = round(max_accloss - 1, 4)

    # 累計報酬率和最大資金回落計算
    trade1['acc_ret'] = (1 + trade1['ret']).cumprod()
    trade1.loc[-1, 'acc_ret'] = 1
    trade1.index = trade1.index + 1
    trade1.sort_index(inplace=True)

    trade1['acc_max_cap'] = trade1['acc_ret'].cummax()
    trade1['dd'] = trade1['acc_ret'] / trade1['acc_max_cap']
    trade1.loc[trade1['acc_ret'] == trade1['acc_max_cap'], 'new_high'] = trade1['acc_ret']
    trade1.fillna(0,inplace=True)
    results['max_drawdown'] = round(1 - trade1['dd'].min(), 4)

    # 將累積報酬率、最大回落、資金新高數據存入results
    results['acc_ret'] = trade1['acc_ret'].tolist()
    results['dd'] = trade1['dd'].tolist()
    results['new_high'] = trade1['new_high'].tolist() if 'new_high' in trade1 else []
    
    return results  

    
    
import lineTool
# Line 推播
token="權杖"
def line_print(msg):
    print(msg)
    try :
        lineTool.lineNotify(token, msg)
    except:
        print('line notify 失效')
        pass
