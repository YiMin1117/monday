from django.http import JsonResponse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import pandas as pd
import time
import json
import logging
logger = logging.getLogger('django')


def get_stock_data(request):
    stock_id = request.GET.get('stock_id', '1303')  # 默認股票代碼
    years_range = int(request.GET.get('years_range', 10))  # 默認過去10年

    url = f"https://goodinfo.tw/tw/StockBzPerformance.asp?STOCK_ID={stock_id}"
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-software-rasterizer")
    options.add_argument("--disable-webgl")
    options.add_argument("--log-level=3")  # 隱藏不必要的錯誤日誌
    driver = webdriver.Chrome(options=options)

    try:
        driver.get(url)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "selSheet")))

        # 手動選擇下拉選單
        def process_table(option_text, columns_to_extract,current_option):
            select_element = driver.find_element(By.ID, "selSheet")
            # 僅當需要時才進行點擊切換
            if current_option != option_text:
                options = select_element.find_elements(By.TAG_NAME, "option")
                for option in options:
                    if option_text in option.text:
                        option.click()
                        time.sleep(3)  # 等待表格更新
                        break
            table_html = driver.find_element(By.ID, "tblDetail").get_attribute("outerHTML")
            soup = BeautifulSoup(table_html, "html.parser")
            rows = soup.find_all("tr", id=lambda x: x and x.startswith("row"))
            rows_data = [[col.get_text(strip=True) for col in row.find_all("td")] for row in rows]
            df = pd.DataFrame(rows_data)
            return df.iloc[:, columns_to_extract],option_text
        # 初始化當前選項
        current_option = None
        # 四張表格
        stock_data = {}
        stock_data['dividend_prices'],current_option = process_table("股利政策(發放年度)", [0, 1, 2, 3, 4, 5, 6, 7],current_option)
        stock_data['stock_prices'],current_option = process_table("PER/PBR", [0, 3, 4, 5, 6],current_option)
        stock_data['per'],current_option = process_table("PER/PBR", [0, 9, 10, 11, 12],current_option)
        stock_data['pbr'],current_option = process_table("PER/PBR", [0, 13, 14, 15, 16],current_option)

        # 年份篩選和處理邏輯
        current_year = pd.Timestamp.now().year - 1
        min_year = current_year - years_range + 1
        filtered_data = {}
        for key, df in stock_data.items():
            df.columns = [f"Column{i}" for i in range(len(df.columns))]
            # 嘗試提取年份，非年份數據跳過
            def extract_year_or_quarter(value):
                try:
                    year = int(value[:4])  # 嘗試提取前4個字符並轉換為整數
                    return year
                except (ValueError, TypeError):
                    # 若前4個字符無法轉換，檢查是否是季度格式（例如 "24Q3"）
                    if len(value) == 4 and value[2:] in ["Q1", "Q2", "Q3", "Q4"]:
                        # 將季度年份轉換為完整年份（假設 24Q3 -> 2024）
                        quarter_year = 2000 + int(value[:2])
                        return quarter_year
                return None
                    

            df['年份'] = df["Column0"].apply(extract_year_or_quarter)  # 提取年份
            filtered_df = df[(df['年份'].between(min_year, current_year, inclusive='both'))|(df["Column0"].str.match(r"^\d{2}Q[1-4]$"))]  # 按年份篩選
            filtered_df = filtered_df.drop(columns=['年份'], errors='ignore')  # 刪除臨時年份列
            filtered_data[key] = filtered_df.to_dict(orient='records')  # 轉為 JSON 格式

        return JsonResponse({"status": "success", "data": filtered_data}, json_dumps_params={'ensure_ascii': False})
    
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})
    
    finally:
        driver.quit()


def is_float(value):
    try:
        float(value)
        return True
    except ValueError:
        return False

def calculate_dividend_prices(stock_data):
    dividend_data = stock_data.get("data").get("dividend_prices", [])
    #print(dividend_data)
    total_dividends = [float(row.get("Column7", 0)) for row in dividend_data if is_float(row.get("Column7", "0"))]
    n_years = len(total_dividends)
    average_dividend = sum(total_dividends) / n_years if n_years > 0 else 0
    return {
        "便宜價": round(average_dividend * 15, 2),
        "合理價": round(average_dividend * 20, 2),
        "昂貴價": round(average_dividend * 30, 2),
    }


def calculate_stock_prices(stock_data):
    stock_price_data = stock_data.get("data").get("stock_prices", [])
    #print(stock_price_data)
    valid_stock_price_data = [row for row in stock_price_data if row.get("Column0", "").isdigit()]
    highest_prices = [float(row["Column1"]) for row in valid_stock_price_data]
    lowest_prices = [float(row["Column2"]) for row in valid_stock_price_data]
    average_prices = [float(row["Column4"]) for row in valid_stock_price_data]
    return {
        "便宜價": round(sum(lowest_prices) / len(lowest_prices), 2) if lowest_prices else 0,
        "合理價": round(sum(average_prices) / len(average_prices), 2) if average_prices else 0,
        "昂貴價": round(sum(highest_prices) / len(highest_prices), 2) if highest_prices else 0,
    }


def calculate_pbr_prices(stock_data):
    pbr_data = stock_data.get("data").get("pbr", [])
    #print(pbr_data)
    if not pbr_data:
        return {"便宜價": None, "合理價": None, "昂貴價": None}
    latest_row = pbr_data[0]
    latest_bps = float(latest_row["Column1"])
    #print(latest_bps)
    historical_data = pbr_data[1:]
    highest_pbrs = [float(row["Column2"]) for row in historical_data if is_float(row["Column2"])]
    lowest_pbrs = [float(row["Column3"]) for row in historical_data if is_float(row["Column3"])]
    average_pbrs = [float(row["Column4"]) for row in historical_data if is_float(row["Column4"])]
    return {
        "便宜價": round((sum(lowest_pbrs) / len(lowest_pbrs)) * latest_bps, 2) if lowest_pbrs else 0,
        "合理價": round((sum(average_pbrs) / len(average_pbrs)) * latest_bps, 2) if average_pbrs else 0,
        "昂貴價": round((sum(highest_pbrs) / len(highest_pbrs)) * latest_bps, 2) if highest_pbrs else 0,
    }


def calculate_per_prices(stock_data):
    per_data = stock_data.get("data").get("per", [])
    #print(per_data)
    if not per_data:
        return {"便宜價": None, "合理價": None, "昂貴價": None}
    historical_data = per_data[1:]
    latest_eps = float(historical_data[0]["Column1"])
    eps_values = [float(row["Column1"]) for row in historical_data if is_float(row["Column1"])]
    avg_eps = sum(eps_values) / len(eps_values) if eps_values else 0
    var = (latest_eps + avg_eps) / 2
    highest_pers = [float(row["Column2"]) for row in historical_data if is_float(row["Column2"])]
    lowest_pers = [float(row["Column3"]) for row in historical_data if is_float(row["Column3"])]
    average_pers = [float(row["Column4"]) for row in historical_data if is_float(row["Column4"])]
    return {
        "便宜價": round((sum(lowest_pers) / len(lowest_pers)) * var, 2) if lowest_pers else 0,
        "合理價": round((sum(average_pers) / len(average_pers)) * var, 2) if average_pers else 0,
        "昂貴價": round((sum(highest_pers) / len(highest_pers)) * var, 2) if highest_pers else 0,
    }

   
# 主视图函数
def pricising_calculate(request):
    """计算便宜价、合理价和昂贵价的主函数"""
    if request.method == "POST":
        try:
            # 接收并解析前端传来的 JSON 数据
            stock_data = json.loads(request.body)
            #print("mother",stock_data)

            # 调用各算法
            results = {
                "dividend_based": calculate_dividend_prices(stock_data),
                "stock_price_based": calculate_stock_prices(stock_data),
                "pbr(本淨比)_based": calculate_pbr_prices(stock_data),
                "per(本益比)_based": calculate_per_prices(stock_data),
            }

            # 返回计算结果
            return JsonResponse({"status": "success", "data": results}, json_dumps_params={"ensure_ascii": False})

        except Exception as e:
            logger.exception("An error occurred in pricising_calculate")
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)


from django.http import JsonResponse
from django.utils.timezone import localtime, now
import twstock

def current_prices(request):
    stock_id = request.GET.get('stock')  # 從前端取得股票代號
    if not stock_id:
        return JsonResponse({"error": "缺少股票代號"}, status=400)

    try:
        stock = twstock.Stock(stock_id)
        realtime_data = twstock.realtime.get(stock_id)  # 即時數據
        local_time = localtime(now())

        if realtime_data['success'] and realtime_data['info']['time']:
            # 檢查是否在交易時間
            transaction_time = local_time.strftime("%H:%M:%S") < "13:30:00"

            if transaction_time:
                best_bid = realtime_data['realtime']['best_bid_price'][-1]
                best_ask = realtime_data['realtime']['best_ask_price'][-1]
                current_price = (float(best_bid) + float(best_ask)) / 2  # 均價
            else:
                # 收盤後，使用最後收盤價
                current_price = stock.price[-1] if stock.price else None
        else:
            return JsonResponse({"error": "無法獲取即時價格"}, status=500)
        
        print(current_price)
        return JsonResponse({"currentPrice": current_price})

    except Exception as e:
        return JsonResponse({"error": f"發生錯誤: {str(e)}"}, status=500)