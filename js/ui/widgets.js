/* TradingView advanced-chart embed (dynamic creation pattern: the widget loader
   reads its JSON config from the textContent of its own script element). */

export function renderTradingView(container, { symbol, theme = 'dark', locale = 'en' }) {
  const config = {
    autosize: true,
    symbol: symbol || 'BINANCE:BTCUSDT',
    interval: '240',
    timezone: 'Etc/UTC',
    theme,
    style: '1',
    locale,
    allow_symbol_change: true,
    hide_side_toolbar: true,
    save_image: true,
    studies: [],
    hideideas: true,
    withdateranges: true,
    details: false,
  };

  container.innerHTML = `
    <div class="tradingview-widget-container" style="height:100%;width:100%">
      <div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>
    </div>`;

  const wrapper = container.querySelector('.tradingview-widget-container');
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.textContent = JSON.stringify(config);
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
  /* A blocked/failed CDN load is asynchronous, so the surrounding try/catch in
     main.js can never see it — without this the container stays an empty box. */
  script.addEventListener('error', () => {
    renderChartFallback(container, typeof navigator !== 'undefined' && !navigator.onLine
      ? 'Chart unavailable — you appear to be offline.'
      : 'Chart unavailable — the TradingView embed could not be loaded.');
  }, { once: true });
  wrapper.appendChild(script);
}

export function renderChartFallback(container, message) {
  container.innerHTML = `
    <div class="chart-error">
      <i class="fas fa-chart-line" style="font-size:1.6rem"></i>
      <p></p>
    </div>`;
  container.querySelector('p').textContent = message;
}
