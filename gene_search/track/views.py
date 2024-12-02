
from datetime import datetime
import json
import os
import yfinance as yf
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import pandas as pd
import traceback
import numpy as np

def replace_nan_with_none(data):
    """遞歸替換列表或字典中的 NaN 為 None"""
    if isinstance(data, list):
        return [replace_nan_with_none(item) for item in data]
    elif isinstance(data, dict):
        return {key: replace_nan_with_none(value) for key, value in data.items()}
    elif isinstance(data, float) and np.isnan(data):
        return None
    return data


def calculate_moving_average(data, window_size):
    series = pd.Series(data)
    return series.rolling(window=window_size).mean()

def calculate_standard_deviation(data, window_size):
    series = pd.Series(data)
    return series.rolling(window=window_size).std()

def calculate_signals(spread, upper_band, lower_band, moving_avg, timestamps, stock1_prices, stock2_prices):
    """
    計算交易信號，返回帶有時間戳和價格的信號
    """
    signals = []
    position_open = False
    last_trade = None

    for i in range(len(spread)):
        # 如果有缺失值，跳過
        if pd.isna(spread[i]) or pd.isna(upper_band[i]) or pd.isna(lower_band[i]) or pd.isna(stock1_prices[i]) or pd.isna(stock2_prices[i]):
            continue
        
        current_timestamp = timestamps[i]  # 獲取當前時間戳

        if not position_open:
            # 開倉條件
            if spread[i] > upper_band[i]:
                signals.append({
                    "timestamp": current_timestamp,
                    "type": "Entry",
                    "action": "Sell Stock1, Buy Stock2",
                    "spread": spread[i],
                    "stock1_price": stock1_prices[i],
                    "stock2_price": stock2_prices[i],
                })
                position_open = True
                last_trade = "Upper"
            elif spread[i] < lower_band[i]:
                signals.append({
                    "timestamp": current_timestamp,
                    "type": "Entry",
                    "action": "Buy Stock1, Sell Stock2",
                    "spread": spread[i],
                    "stock1_price": stock1_prices[i],
                    "stock2_price": stock2_prices[i],
                })
                position_open = True
                last_trade = "Lower"
        else:
            # 關倉條件
            if last_trade == "Upper" and spread[i] <= moving_avg[i]:
                signals.append({
                    "timestamp": current_timestamp,
                    "type": "Exit",
                    "action": "Buy Stock1, Sell Stock2",
                    "spread": spread[i],
                    "stock1_price": stock1_prices[i],
                    "stock2_price": stock2_prices[i],
                })
                position_open = False
            elif last_trade == "Lower" and spread[i] >= moving_avg[i]:
                signals.append({
                    "timestamp": current_timestamp,
                    "type": "Exit",
                    "action": "Sell Stock1, Buy Stock2",
                    "spread": spread[i],
                    "stock1_price": stock1_prices[i],
                    "stock2_price": stock2_prices[i],
                })
                position_open = False

    return signals




@csrf_exempt
def add_track(request):
    try:
        # 檢查請求是否為 POST
        if request.method != 'POST':
            return JsonResponse({'error': 'Invalid request method'}, status=400)

        # 獲取請求數據
        data = json.loads(request.body)
        stock1 = data.get('stock1')
        stock2 = data.get('stock2')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        n_std = int(data.get('n_std', 0))
        window_size = int(data.get('window_size', 0))
        track_until_nowday = datetime.now().strftime('%Y-%m-%d')


        # 確保所有參數齊全
        if not all([stock1, stock2, start_date, end_date, n_std, window_size]):
            return JsonResponse({'error': 'Missing parameters'}, status=400)

        # 下載股票數據（增加錯誤處理）
        try:
            stock1_data = yf.download(stock1, start=start_date, end=track_until_nowday)
            stock2_data = yf.download(stock2, start=start_date, end=track_until_nowday)
        except Exception as e:
            return JsonResponse({'error': f"Failed to fetch stock data: {str(e)}"}, status=500)

        if stock1_data.empty or stock2_data.empty:
            return JsonResponse({'error': 'Failed to retrieve stock data, please check stock symbols.'}, status=400)

        # 計算 Spread（對數差值）
        stock1_log = stock1_data['Close'].apply(lambda x: None if x <= 0 else float(x)).dropna()
        stock2_log = stock2_data['Close'].apply(lambda x: None if x <= 0 else float(x)).dropna()
        spread = pd.Series(stock1_log - stock2_log)

        # 計算移動平均與標準差
        moving_avg = calculate_moving_average(spread, window_size)
        std_dev = calculate_standard_deviation(spread, window_size)
        upper_band = moving_avg + n_std * std_dev
        lower_band = moving_avg - n_std * std_dev

        # 設置文件路徑
        base_dir = os.path.join('config', 'tracks')
        os.makedirs(base_dir, exist_ok=True)  # 確保目錄存在
        filename = f"{stock1}_{stock2}_{datetime.now().strftime('%Y%m%d%H%M%S')}_track.json"
        file_path = os.path.join(base_dir, filename)

        # 保存 JSON 文件
        signals = calculate_signals(
            spread.tolist(), 
            upper_band.tolist(), 
            lower_band.tolist(), 
            moving_avg.tolist(), 
            stock1_data.index.strftime('%Y-%m-%d').tolist(),  # 使用時間戳列表
            stock1_data['Close'].tolist(),  # Stock1 的價格
            stock2_data['Close'].tolist()   # Stock2 的價格
        )
        result = {
            'filename' : filename,
            'spread': spread.tolist(),
            'moving_avg': moving_avg.tolist(),
            'upper_band': upper_band.tolist(),
            'lower_band': lower_band.tolist(),
            'stock1_prices': stock1_data['Close'].tolist(),
            'stock2_prices': stock2_data['Close'].tolist(),
            'timestamps': stock1_data.index.strftime('%Y-%m-%d').tolist(),
            'signals': signals,  # 添加交易信號
            'input_parameters': {
                'stock1': stock1,
                'stock2': stock2,
                'start_date': start_date,
                'end_date': end_date,
                'window_size': window_size,
                'n_times': n_std,
                'track_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # 生成追蹤日期
            }
        }
        # 替換 NaN 為 None
        result = replace_nan_with_none(result)

        with open(file_path, 'w') as json_file:
            json.dump(result, json_file)

        return JsonResponse({"message": "Track added successfully!", "filename": filename}, status=201)

    except Exception as e:
        import traceback
        print(f"Error in add_track: {str(e)}")
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def delete_track(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    try:
        # 獲取請求數據
        data = json.loads(request.body)
        filename = data.get('filename')

        if not filename:
            return JsonResponse({'error': 'Filename is required'}, status=400)

        # 構建文件路徑
        base_dir = os.path.join('config', 'tracks')
        file_path = os.path.join(base_dir, filename)

        # 檢查文件是否存在並刪除
        if not os.path.exists(file_path):
            return JsonResponse({'error': 'File not found'}, status=404)

        os.remove(file_path)
        return JsonResponse({'message': f'File {filename} deleted successfully!'}, status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


#這是獲取list訊息
def get_track_list(request):
    try:
        base_dir = os.path.join('config', 'tracks')
        if not os.path.exists(base_dir):
            return JsonResponse({'tracks': []})  # 如果目錄不存在，返回空數組

        track_list = []
        for filename in os.listdir(base_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(base_dir, filename)
                with open(file_path, 'r') as json_file:
                    data = json.load(json_file)
                    track = {
                        'stock1': data['input_parameters']['stock1'],
                        'stock2': data['input_parameters']['stock2'],
                        'start_date': data['input_parameters']['start_date'],
                        'end_date': data['input_parameters']['end_date'],
                        'window_size': data['input_parameters']['window_size'],
                        'n_times': data['input_parameters']['n_times'],
                        'track_date': os.path.getmtime(file_path),  # 文件最後修改時間
                        'filename': filename
                    }
                    track_list.append(track)

        return JsonResponse({'tracks': track_list}, safe=False)
    except Exception as e:
        # 打印完整錯誤日誌
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

#這是畫圖要用的訊息
def get_track_data(request):
    # 從請求中獲取 filename
    filename = request.GET.get('filename')
    if not filename:
        return JsonResponse({'error': 'Filename is required'}, status=400)

    # 構建文件路徑
    base_dir = os.path.join('config', 'tracks')
    file_path = os.path.join(base_dir, filename)

    # 檢查文件是否存在
    if not os.path.exists(file_path):
        return JsonResponse({'error': 'File not found'}, status=404)

    try:
        # 打開並解析 JSON 文件
        with open(file_path, 'r') as json_file:
            data = json.load(json_file)
        return JsonResponse(data, safe=False)  # 返回 JSON 數據
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)