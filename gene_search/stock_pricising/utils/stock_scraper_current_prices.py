import requests
import time

def get_stock_price(stock_code):
    """
    根據股票代碼獲取即時價格
    """
    # tse 與 otc 格式
    stock_list_tse = f'tse_{stock_code}.tw'
    stock_list_otc = f'otc_{stock_code}.tw'

    # tse 格式測試
    query_url_tse = f'http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch={stock_list_tse}'
    query_url_otc = f'http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch={stock_list_otc}'

    # 順序嘗試 tse 和 otc
    response = requests.get(query_url_tse)
    if response.status_code == 200 and 'msgArray' in response.json() and response.json()['msgArray']:
        data = response.json()['msgArray'][0]
    else:
        response = requests.get(query_url_otc)
        if response.status_code == 200 and 'msgArray' in response.json() and response.json()['msgArray']:
            data = response.json()['msgArray'][0]
        else:
            raise ValueError(f"無法取得股票代碼 {stock_code} 的資訊")

    # 解析數據
    try:
        current_price = float(data['z']) if data['z'] else None  # 'z' 是成交價
        last_update_time = time2str(data['tlong']) if data.get('tlong') else None
    except (KeyError, ValueError):
        raise ValueError("無法解析即時價格數據")

    return current_price, last_update_time


def time2str(t):
    """
    將資料更新時間從毫秒時間戳轉為可讀格式
    """
    t = int(t) / 1000  # 將毫秒轉換為秒
    return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(t))
