import json
import os
from datetime import datetime
import django
import sys



# 設定專案根目錄
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
TRACKS_DIR = os.path.join(BASE_DIR, 'config', 'tracks')

# 設定 Django 環境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gene_search.settings')  # 修改為正確的專案名稱
django.setup()

from track.views import calculate_signals, calculate_moving_average, calculate_standard_deviation, replace_nan_with_none

import yfinance as yf
import pandas as pd




def update_json_and_check_signals():
    """
    每日更新 JSON 文件並檢查今天之前的最新信號
    """
    if not os.path.exists(TRACKS_DIR):
        print(f"No JSON files to process in {TRACKS_DIR}")
        return

    # 模擬今天的日期為 2021-11-23
    today = "2021-11-24"  # 測試日期
    latest_signals_to_notify = []  # 用於存儲每個檔案中最新的信號

    for filename in os.listdir(TRACKS_DIR):
        if filename.endswith('.json'):
            file_path = os.path.join(TRACKS_DIR, filename)

            with open(file_path, 'r') as json_file:
                data = json.load(json_file)

            # 提取參數
            input_parameters = data.get('input_parameters', {})
            stock1 = input_parameters.get('stock1')
            stock2 = input_parameters.get('stock2')
            start_date = input_parameters.get('start_date')
            n_std = input_parameters.get('n_times')
            window_size = input_parameters.get('window_size')

            # 確保參數齊全
            if not all([stock1, stock2, start_date, n_std, window_size]):
                print(f"Missing parameters in {filename}")
                continue

            # 更新股票數據到今天
            try:
                stock1_data = yf.download(stock1, start=start_date, end=today)
                stock2_data = yf.download(stock2, start=start_date, end=today)
            except Exception as e:
                print(f"Failed to fetch stock data for {filename}: {str(e)}")
                continue

            if stock1_data.empty or stock2_data.empty:
                print(f"Empty stock data for {filename}, skipping.")
                continue

            # 計算 Spread 和信號
            stock1_log = stock1_data['Close'].apply(lambda x: None if x <= 0 else float(x)).dropna()
            stock2_log = stock2_data['Close'].apply(lambda x: None if x <= 0 else float(x)).dropna()
            spread = pd.Series(stock1_log - stock2_log)
            moving_avg = calculate_moving_average(spread, window_size)
            std_dev = calculate_standard_deviation(spread, window_size)
            upper_band = moving_avg + n_std * std_dev
            lower_band = moving_avg - n_std * std_dev
            signals = calculate_signals(
                spread.tolist(),
                upper_band.tolist(),
                lower_band.tolist(),
                moving_avg.tolist(),
                stock1_data.index.strftime('%Y-%m-%d').tolist(),
                stock1_data['Close'].tolist(),  # Stock1 的價格
                stock2_data['Close'].tolist()   # Stock2 的價格
            )

            # 更新 JSON 文件
            data.update({
                'spread': spread.tolist(),
                'moving_avg': moving_avg.tolist(),
                'upper_band': upper_band.tolist(),
                'lower_band': lower_band.tolist(),
                'stock1_prices': stock1_data['Close'].tolist(),
                'stock2_prices': stock2_data['Close'].tolist(),
                'timestamps': stock1_data.index.strftime('%Y-%m-%d').tolist(),
                'signals': signals,
            })

            # 替換 NaN 為 None
            data = replace_nan_with_none(data)

            with open(file_path, 'w') as json_file:
                json.dump(data, json_file, indent=4)

            # 找出今天之前的最新信號
            latest_signal = None
            for signal in signals:
                if signal['timestamp'] < today:  # 信號日期必須在今天之前
                    if latest_signal is None or signal['timestamp'] > latest_signal['timestamp']:
                        latest_signal = signal

            if latest_signal:
                print(f"Latest signal for {filename}: {latest_signal}")
                latest_signals_to_notify.append((stock1, stock2, latest_signal))

    # 發送所有最新信號的通知
    for stock1, stock2, signal in latest_signals_to_notify:
        notify_users(stock1, stock2, [signal])


from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

def notify_users(stock1, stock2, signals):
    """
    向所有用戶發送電子郵件通知信號，使用 email.mime 模組。
    """
    # 構建郵件標題和內容
    subject = f"交易信號通知: {stock1} vs {stock2}"
    message = f"最新交易信號:\n\n" + "\n".join(
        f"{signal['type']} - {signal['action']} at {signal['timestamp']} (Spread: {signal['spread']})"
        for signal in signals
    )

    # 獲取所有用戶的電子郵件
    recipient_email = 'n26134374@gs.ncku.edu.tw'  # 單一接收者

    # 配置 SMTP 服務器
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    sender_email = '268473951rangers@gmail.com'
    sender_password = 'zdtv riyl njkf dhsv'

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)

        # 構建郵件
        email_message = MIMEMultipart()
        email_message['From'] = sender_email
        email_message['To'] = recipient_email
        email_message['Subject'] = subject
        email_message.attach(MIMEText(message, 'plain'))

        # 發送郵件
        server.sendmail(sender_email, recipient_email, email_message.as_string())
        print(f"Notification email sent to: {recipient_email}")

        server.quit()
    except Exception as e:
        print(f"Failed to send email: {str(e)}")


if __name__ == "__main__":
    update_json_and_check_signals()
