import backtrader as bt

class RSIStrategy(bt.Strategy):
    params = (
        ("entry_strategy_type", ""),
        ("exit_strategy_type", ""),
        ("rsi_short_period", 7),
        ("rsi_long_period", 14),
    )


    def __init__(self, params=None):
        self.dataopen = self.datas[0].open
        self.dataclose = self.datas[0].close
        self.order = None
        self.buyprice = None
        self.buycomm = None

        self.rsi_short = bt.indicators.RSI(self.dataclose, period=self.params.rsi_short_period)
        self.rsi_long = bt.indicators.RSI(self.dataclose, period=self.params.rsi_long_period)
    def log(self, txt, dt=None):
        '''用於策略中的日誌功能'''
        dt = dt or self.datas[0].datetime.date(0)
        print('%s, %s' % (dt.isoformat(), txt))
    def notify_order(self, order):
        if order.status in [order.Submitted, order.Accepted]:
            return

        if order.status in [order.Completed]:
            if order.isbuy():
                self.log('BUY EXECUTED, Price: %.2f, Cost: %.2f, Comm %.2f' % 
                         (order.executed.price, order.executed.value, order.executed.comm))
                self.buyprice = order.executed.price
                self.buycomm = order.executed.comm
            elif order.issell():
                self.log('SELL EXECUTED, Price: %.2f, Cost: %.2f, Comm %.2f' % 
                         (order.executed.price, order.executed.value, order.executed.comm))

            self.bar_executed = len(self)

        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log('Order Canceled/Margin/Rejected')

        self.order = None
    def notify_trade(self, trade):
        if not trade.isclosed:
            return
        self.log('OPERATION PROFIT, GROSS %.2f, NET %.2f' % (trade.pnl, trade.pnlcomm))
    def next(self):
        if self.order:
            return

        if not self.position:
            if self.rsi_short[0] > self.rsi_long[0]:
                self.log(f'BUY CREATE, {self.dataopen[0]:.2f}')
                self.order = self.buy()
        else:
            if self.rsi_short[0] < self.rsi_long[0] * 0.999:
                self.log(f'SELL CREATE, {self.dataopen[0]:.2f}')
                self.order = self.sell()

