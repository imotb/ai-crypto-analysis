/*
 * Crypto Analysis Assistant
 *
 * Smart cryptocurrency analysis with AI power.
 *
 * @author    https://github.com/imotb
 * @version   1.0.0
 * @license   MIT
 */
class CryptoAnalyzer {
    constructor() {
        this.apiKey = '';
        this.selectedModel = '';
        this.selectedCrypto = '';
        this.analysisType = 'short';
        this.cryptoData = {};
        this.cryptoInfo = {};
        this.currentLanguage = 'fa'; // زبان پیش‌فرض فارسی
        this.translations = this.getTranslations();
        this.initializeEventListeners();
        this.applyLanguage();
    }

    // تابع برای تعریف ترجمه‌ها
    getTranslations() {
        return {
            'fa': {
                'title': 'تحلیل هوشمند ارزهای دیجیتال',
                'subtitle': 'تحلیل ارزهای دیجیتال با قدرت هوش مصنوعی',
                'settings': 'تنظیمات تحلیل',
                'apiKeyLabel': 'کلید API OpenRouter:',
                'apiKeyPlaceholder': 'کلید API خود را وارد کنید',
                'apiKeyHelp': 'کلید API خود را از openrouter.ai دریافت کنید',
                'modelLabel': 'مدل هوش مصنوعی:',
                'cryptoLabel': 'ارز دیجیتال:',
                'analysisTypeLabel': 'نوع تحلیل:',
                'analysisTypeShort': 'تحلیل کوتاه مدت',
                'analysisTypeLong': 'تحلیل بلند مدت',
                'analyzeButton': 'شروع تحلیل هوشمند',
                'resultsTitle': 'نتایج تحلیل',
                'loadingText': 'در حال دریافت داده‌های لحظه‌ای...',
                'cryptoInfoTitle': 'اطلاعات ارز (لحظه‌ای)',
                'summaryTitle': 'خلاصه تحلیل',
                'liveChartTitle': 'نمودار زنده',
                'indicatorsTitle': 'شاخص‌های تکنیکال (محاسبه شده)',
                'levelsTitle': 'سطوح حمایت و مقاومت',
                'recommendationTitle': 'پیشنهاد معاملاتی',
                'fullAnalysisTitle': 'تحلیل کامل هوش مصنوعی',
                'copyButton': 'کپی نتایج',
                'downloadButton': 'دانلود PDF',
                'shareButton': 'اشتراک گذاری'
            },
            'en': {
                'title': 'Crypto Analysis Assistant',
                'subtitle': 'Smart cryptocurrency analysis with AI power',
                'settings': 'Analysis Settings',
                'apiKeyLabel': 'OpenRouter API Key:',
                'apiKeyPlaceholder': 'Enter your API key',
                'apiKeyHelp': 'Get your API key from openrouter.ai',
                'modelLabel': 'AI Model:',
                'cryptoLabel': 'Cryptocurrency:',
                'analysisTypeLabel': 'Analysis Type:',
                'analysisTypeShort': 'Short-term Analysis',
                'analysisTypeLong': 'Long-term Analysis',
                'analyzeButton': 'Start Smart Analysis',
                'resultsTitle': 'Analysis Results',
                'loadingText': 'Fetching real-time data...',
                'cryptoInfoTitle': 'Currency Info (Live)',
                'summaryTitle': 'Analysis Summary',
                'liveChartTitle': 'Live Chart',
                'indicatorsTitle': 'Technical Indicators (Calculated)',
                'levelsTitle': 'Support & Resistance Levels',
                'recommendationTitle': 'Trading Recommendation',
                'fullAnalysisTitle': 'Full AI Analysis',
                'copyButton': 'Copy Results',
                'downloadButton': 'Download PDF',
                'shareButton': 'Share'
            }
        };
    }

    // تابع برای اعمال زبان انتخاب شده
    applyLanguage() {
        // تغییر متن دکمه زبان
        document.getElementById('langTextSubtitle').textContent = 
            this.currentLanguage === 'fa' ? 'English' : 'فارسی';
        
        // تغییر جهت صفحه
        document.body.setAttribute('dir', this.currentLanguage === 'fa' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', this.currentLanguage);
        
        // اعمال ترجمه‌ها
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (this.translations[this.currentLanguage][key]) {
                element.textContent = this.translations[this.currentLanguage][key];
            }
        });
        
        // اعمال ترجمه برای placeholderها
        const placeholders = document.querySelectorAll('[data-translate-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (this.translations[this.currentLanguage][key]) {
                element.setAttribute('placeholder', this.translations[this.currentLanguage][key]);
            }
        });
    }

    // تابع جدید برای فرمت‌بندی اعداد بسیار کوچک
    formatSmallNumber(num, maxDecimals = 10) {
        if (num === 0) return '0';
        if (num >= 0.01) {
            return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
        }
        if (num >= 0.0001) {
            return num.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 });
        }
        
        // برای اعداد بسیار کوچک مثل شیبا و پپه
        const fixedNum = num.toFixed(maxDecimals);
        // حذف صفرهای انتهایی
        return fixedNum.replace(/\.?0+$/, '');
    }

    // تابع جدید برای فرمت‌بندی قیمت بر اساس نوع ارز
    formatPrice(price, symbol) {
        // لیست ارزهایی که قیمت بسیار پایینی دارند
        const lowPriceCryptos = ['SHIB', 'PEPE', 'DOGE', 'XLM'];
        
        if (lowPriceCryptos.includes(symbol)) {
            if (price < 0.0001) {
                return price.toFixed(8);
            } else if (price < 0.01) {
                return price.toFixed(6);
            }
        }
        
        if (price < 1) {
            return price.toFixed(4);
        }
        
        return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    }

    // تابع جدید برای فرمت‌بندی اعداد در محاسبات
    formatCalculationNumber(num) {
        if (num === 0) return 0;
        if (Math.abs(num) < 0.000001) {
            return parseFloat(num.toFixed(10));
        }
        if (Math.abs(num) < 0.001) {
            return parseFloat(num.toFixed(8));
        }
        if (Math.abs(num) < 0.1) {
            return parseFloat(num.toFixed(6));
        }
        return parseFloat(num.toFixed(4));
    }

    initializeEventListeners() {
    document.getElementById('analyzeBtn').addEventListener('click', () => this.startAnalysis());
    document.getElementById('copyBtn').addEventListener('click', () => this.copyResults());
    document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());
    document.getElementById('shareBtn').addEventListener('click', () => this.shareResults());
    
    // اضافه کردن event listener برای تغییر زبان
    document.getElementById('langToggleSubtitle').addEventListener('click', () => {
        this.currentLanguage = this.currentLanguage === 'fa' ? 'en' : 'fa';
        this.applyLanguage();
    });
    
        // Initialize Select2 for cryptocurrency dropdown
        $('#cryptocurrency').select2({
            templateResult: this.formatCryptoOption,
            templateSelection: this.formatCryptoSelection,
            width: '100%'
        });
        
        // Initialize Select2 for AI model dropdown
        $('#model').select2({
            templateResult: this.formatAIModelOption,
            templateSelection: this.formatAIModelSelection,
            width: '100%'
        });
    }

    // Add these new methods to format options with icons
    formatCryptoOption(option) {
        if (!option.id) {
            return option.text;
        }
        
        const iconUrl = $(option.element).data('icon');
        if (!iconUrl) {
            return option.text;
        }
        
        const $option = $(
            '<span><img src="' + iconUrl + '" class="crypto-icon" /> ' + option.text + '</span>'
        );
        return $option;
    }

    formatCryptoSelection(option) {
        if (!option.id) {
            return option.text;
        }
        
        const iconUrl = $(option.element).data('icon');
        if (!iconUrl) {
            return option.text;
        }
        
        const $option = $(
            '<span><img src="' + iconUrl + '" class="crypto-icon-selection" /> ' + option.text + '</span>'
        );
        return $option;
    }

    formatAIModelOption(option) {
        if (!option.id) {
            return option.text;
        }
        
        const iconUrl = $(option.element).data('icon');
        if (!iconUrl) {
            return option.text;
        }
        
        const $option = $(
            '<span><img src="' + iconUrl + '" class="ai-icon" /> ' + option.text + '</span>'
        );
        return $option;
    }

    formatAIModelSelection(option) {
        if (!option.id) {
            return option.text;
        }
        
        const iconUrl = $(option.element).data('icon');
        if (!iconUrl) {
            return option.text;
        }
        
        const $option = $(
            '<span><img src="' + iconUrl + '" class="ai-icon-selection" /> ' + option.text + '</span>'
        );
        return $option;
    }

    async startAnalysis() {
        // دریافت تنظیمات
        this.apiKey = document.getElementById('apiKey').value;
        this.selectedModel = document.getElementById('model').value;
        this.selectedCrypto = document.getElementById('cryptocurrency').value;
        this.analysisType = document.querySelector('input[name="analysisType"]:checked').value;

        // اعتبارسنجی
        if (!this.apiKey) {
            this.showError(this.currentLanguage === 'fa' ? 
                'لطفاً کلید API OpenRouter خود را وارد کنید' : 
                'Please enter your OpenRouter API key');
            return;
        }

        // نمایش پنل نتایج
        document.getElementById('resultsPanel').style.display = 'block';
        document.getElementById('analysisStatus').style.display = 'block';
        document.getElementById('analysisResults').style.display = 'none';

        try {
            // به‌روزرسانی وضعیت
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال دریافت اطلاعات ارز...' : 
                'Fetching currency information...');
            
            // دریافت اطلاعات ارز
            await this.fetchCryptoInfo();
            
            // به‌روزرسانی وضعیت
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال دریافت داده‌های لحظه‌ای...' : 
                'Fetching real-time data...');
            
            // دریافت داده‌های واقعی از API های عمومی
            await this.fetchRealTimeData();
            
            // به‌روزرسانی وضعیت
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال محاسبه شاخص‌های تکنیکال...' : 
                'Calculating technical indicators...');
            
            // محاسبه شاخص‌های تکنیکال
            await this.calculateTechnicalIndicators();
            
            // به‌روزرسانی وضعیت
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال دریافت شاخص ترس و طمع...' : 
                'Fetching fear & greed index...');
            
            // دریافت شاخص ترس و طمع
            await this.fetchFearGreedIndex();
            
            // به‌روزرسانی وضعیت
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال تحلیل هوشمند...' : 
                'Performing AI analysis...');
            
            // تحلیل هوشمند
            const analysis = await this.performAIAnalysis();
            
            // نمایش نتایج
            this.displayResults(analysis);
            
        } catch (error) {
            console.error('Error:', error);
            this.showError(this.currentLanguage === 'fa' ? 
                'خطا در انجام تحلیل: ' + error.message : 
                'Analysis error: ' + error.message);
        }
    }

    updateStatus(message) {
        const loadingText = document.querySelector('.loading p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }

    async fetchCryptoInfo() {
        // اطلاعات پایه ارزها
        const cryptoInfoDatabase = {
            bitcoin: { symbol: 'BTC', name: this.currentLanguage === 'fa' ? 'بیت کوین' : 'Bitcoin', coingeckoId: 'bitcoin', tradingViewSymbol: 'BINANCE:BTCUSDT' },
            ethereum: { symbol: 'ETH', name: this.currentLanguage === 'fa' ? 'اتریوم' : 'Ethereum', coingeckoId: 'ethereum', tradingViewSymbol: 'BINANCE:ETHUSDT' },
            binancecoin: { symbol: 'BNB', name: this.currentLanguage === 'fa' ? 'بایننس کوین' : 'Binance Coin', coingeckoId: 'binancecoin', tradingViewSymbol: 'BINANCE:BNBUSDT' },
            ripple: { symbol: 'XRP', name: this.currentLanguage === 'fa' ? 'ریپل' : 'Ripple', coingeckoId: 'ripple', tradingViewSymbol: 'BINANCE:XRPUSDT' },
            solana: { symbol: 'SOL', name: this.currentLanguage === 'fa' ? 'سولانا' : 'Solana', coingeckoId: 'solana', tradingViewSymbol: 'BINANCE:SOLUSDT' },
            cardano: { symbol: 'ADA', name: this.currentLanguage === 'fa' ? 'کاردانو' : 'Cardano', coingeckoId: 'cardano', tradingViewSymbol: 'BINANCE:ADAUSDT' },
            dogecoin: { symbol: 'DOGE', name: this.currentLanguage === 'fa' ? 'دوج کوین' : 'Dogecoin', coingeckoId: 'dogecoin', tradingViewSymbol: 'BINANCE:DOGEUSDT' },
            tron: { symbol: 'TRX', name: this.currentLanguage === 'fa' ? 'ترون' : 'Tron', coingeckoId: 'tron', tradingViewSymbol: 'BINANCE:TRXUSDT' },
            polkadot: { symbol: 'DOT', name: this.currentLanguage === 'fa' ? 'پولکادات' : 'Polkadot', coingeckoId: 'polkadot', tradingViewSymbol: 'BINANCE:DOTUSDT' },
            polygon: { symbol: 'MATIC', name: this.currentLanguage === 'fa' ? 'پالیگان' : 'Polygon', coingeckoId: 'matic-network', tradingViewSymbol: 'BINANCE:MATICUSDT' },
            litecoin: { symbol: 'LTC', name: this.currentLanguage === 'fa' ? 'لایت کوین' : 'Litecoin', coingeckoId: 'litecoin', tradingViewSymbol: 'BINANCE:LTCUSDT' },
            chainlink: { symbol: 'LINK', name: this.currentLanguage === 'fa' ? 'چین لینک' : 'Chainlink', coingeckoId: 'chainlink', tradingViewSymbol: 'BINANCE:LINKUSDT' },
            'bitcoin-cash': { symbol: 'BCH', name: this.currentLanguage === 'fa' ? 'بیت کوین کش' : 'Bitcoin Cash', coingeckoId: 'bitcoin-cash', tradingViewSymbol: 'BINANCE:BCHUSDT' },
            'ethereum-classic': { symbol: 'ETC', name: this.currentLanguage === 'fa' ? 'اتریوم کلاسیک' : 'Ethereum Classic', coingeckoId: 'ethereum-classic', tradingViewSymbol: 'BINANCE:ETCUSDT' },
            stellar: { symbol: 'XLM', name: this.currentLanguage === 'fa' ? 'استلار' : 'Stellar', coingeckoId: 'stellar', tradingViewSymbol: 'BINANCE:XLMUSDT' },
            uniswap: { symbol: 'UNI', name: this.currentLanguage === 'fa' ? 'یونی‌سواپ' : 'Uniswap', coingeckoId: 'uniswap', tradingViewSymbol: 'BINANCE:UNIUSDT' },
            toncoin: { symbol: 'TON', name: this.currentLanguage === 'fa' ? 'تون کوین' : 'Toncoin', coingeckoId: 'the-open-network', tradingViewSymbol: 'BINANCE:TONUSDT' },
            'avalanche-2': { symbol: 'AVAX', name: this.currentLanguage === 'fa' ? 'آوالانچ' : 'Avalanche', coingeckoId: 'avalanche-2', tradingViewSymbol: 'BINANCE:AVAXUSDT' },
            'shiba-inu': { symbol: 'SHIB', name: this.currentLanguage === 'fa' ? 'شیبا اینو' : 'Shiba Inu', coingeckoId: 'shiba-inu', tradingViewSymbol: 'BINANCE:SHIBUSDT' },
            monero: { symbol: 'XMR', name: this.currentLanguage === 'fa' ? 'مونرو' : 'Monero', coingeckoId: 'monero', tradingViewSymbol: 'KUCOIN:XMRUSDT' },
            'vechain': { symbol: 'VET', name: this.currentLanguage === 'fa' ? 'وی چین' : 'VeChain', coingeckoId: 'vechain', tradingViewSymbol: 'BINANCE:VETUSDT' },
            'cosmos-hub': { symbol: 'ATOM', name: this.currentLanguage === 'fa' ? 'کازماس' : 'Cosmos', coingeckoId: 'cosmos', tradingViewSymbol: 'BINANCE:ATOMUSDT' },
            'tezos': { symbol: 'XTZ', name: this.currentLanguage === 'fa' ? 'تزوس' : 'Tezos', coingeckoId: 'tezos', tradingViewSymbol: 'BINANCE:XTZUSDT' },
            'leo-token': { symbol: 'LEO', name: this.currentLanguage === 'fa' ? 'لئو توکن' : 'LEO Token', coingeckoId: 'leo-token', tradingViewSymbol: 'OKX:LEOUSDT' },
            'kucoin-shares': { symbol: 'KCS', name: this.currentLanguage === 'fa' ? 'کوکوین توکن' : 'KuCoin', coingeckoId: 'kucoin-shares', tradingViewSymbol: 'KUCOIN:KCSUSDT' },
            'zcash': { symbol: 'ZEC', name: this.currentLanguage === 'fa' ? 'زی کش' : 'Zcash', coingeckoId: 'zcash', tradingViewSymbol: 'BINANCE:ZECUSDT' },
            'pax-gold': { symbol: 'PAXG', name: this.currentLanguage === 'fa' ? 'پکس گلد' : 'PAX Gold', coingeckoId: 'pax-gold', tradingViewSymbol: 'BINANCE:PAXGUSDT' },
            'tether-gold': { symbol: 'XAUT', name: this.currentLanguage === 'fa' ? 'تتر گلد' : 'Tether Gold', coingeckoId: 'tether-gold', tradingViewSymbol: 'XAUTUSDT' },
            'chiliz': { symbol: 'CHZ', name: this.currentLanguage === 'fa' ? 'چیلیز' : 'Chiliz', coingeckoId: 'chiliz', tradingViewSymbol: 'BINANCE:CHZUSDT' },
            'the-sandbox': { symbol: 'SAND', name: this.currentLanguage === 'fa' ? 'سندباکس' : 'The Sandbox', coingeckoId: 'the-sandbox', tradingViewSymbol: 'BINANCE:SANDUSDT' },
            'near': { symbol: 'NEAR', name: this.currentLanguage === 'fa' ? 'نیر پروتکل' : 'NEAR Protocol', coingeckoId: 'near', tradingViewSymbol: 'BINANCE:NEARUSDT' },
            'sui': { symbol: 'SUI', name: this.currentLanguage === 'fa' ? 'سویی' : 'Sui', coingeckoId: 'sui', tradingViewSymbol: 'BINANCE:SUIUSDT' },
            'render-token': { symbol: 'RENDER', name: this.currentLanguage === 'fa' ? 'رندر توکن' : 'Render', coingeckoId: 'render-token', tradingViewSymbol: 'BINANCE:RENDERUSDT' },
            'injective-protocol': { symbol: 'INJ', name: this.currentLanguage === 'fa' ? 'اینجکتیو' : 'Injective', coingeckoId: 'injective-protocol', tradingViewSymbol: 'BINANCE:INJUSDT' },
            'stacks': { symbol: 'STX', name: this.currentLanguage === 'fa' ? 'استکس' : 'Stacks', coingeckoId: 'blockstack', tradingViewSymbol: 'BINANCE:STXUSDT' },
            'celestia': { symbol: 'TIA', name: this.currentLanguage === 'fa' ? 'سلستیا' : 'Celestia', coingeckoId: 'celestia', tradingViewSymbol: 'OKX:TIAUSDT' },
            'floki': { symbol: 'FLOKI', name: this.currentLanguage === 'fa' ? 'فلوکی' : 'FLOKI', coingeckoId: 'floki', tradingViewSymbol: 'BINANCE:FLOKIUSDT' },
            'baby-doge-coin': { symbol: 'BABYDOGE', name: this.currentLanguage === 'fa' ? 'بیبی دوج' : 'Baby Doge Coin', coingeckoId: 'baby-doge-coin', tradingViewSymbol: 'OKX:BABYDOGEUSDT' },
            'wanchain': { symbol: 'WAN', name: this.currentLanguage === 'fa' ? 'ون چین' : 'Wanchain', coingeckoId: 'wanchain', tradingViewSymbol: 'BINANCE:WANUSDT' },
            electroneum: { symbol: 'ETN', name: this.currentLanguage === 'fa' ? 'الکترونیوم' : 'Electroneum', coingeckoId: 'electroneum', tradingViewSymbol: 'KUCOIN:ETNUSDT' },
            'trust-wallet-token': { symbol: 'TWT', name: this.currentLanguage === 'fa' ? 'تراست ولت توکن' : 'Trust Wallet Token', coingeckoId: 'trust-wallet-token', tradingViewSymbol: 'BINANCE:TWTUSDT' },
            'pepe': { symbol: 'PEPE', name: this.currentLanguage === 'fa' ? 'پپه' : 'Pepe', coingeckoId: 'pepe', tradingViewSymbol: 'BINANCE:PEPEUSDT' },
            'dogs': { symbol: 'DOGS ', name: this.currentLanguage === 'fa' ? 'داگز' : 'Dogs', coingeckoId: 'dogs-2', tradingViewSymbol: 'BINANCE:DOGSUSDT' },
            'sonic': { symbol: 'S', name: this.currentLanguage === 'fa' ? 'سونیک' : 'Sonic', coingeckoId: 'sonic-3', tradingViewSymbol: 'COINEX:SUSDT' },
            'hyperliquid': { symbol: 'HYPE', name: this.currentLanguage === 'fa' ? 'هایپر لیکویید' : 'Hyperliquid', coingeckoId: 'hyperliquid', tradingViewSymbol: 'KUCOIN:HYPEUSDT' },
            'pump-fun': { symbol: 'PUMP', name: this.currentLanguage === 'fa' ? 'پامپ فان' : 'Pump.fun', coingeckoId: 'pump-fun', tradingViewSymbol: 'BYBIT:PUMPUSDT' },
            kusama: { symbol: 'KSM', name: this.currentLanguage === 'fa' ? 'کوزاما' : 'Kusama', coingeckoId: 'kusama', tradingViewSymbol: 'OKX:KSMUSDT' },
            aave: { symbol: 'AAVE', name: this.currentLanguage === 'fa' ? 'آوه' : 'Aave', coingeckoId: 'aave', tradingViewSymbol: 'BINANCE:AAVEUSDT' },
            aptos: { symbol: 'APT', name: this.currentLanguage === 'fa' ? 'آپتوس' : 'Aptos', coingeckoId: 'aptos', tradingViewSymbol: 'OKX:APTUSDT' },
            'apex-token-2': { symbol: 'APEX', name: this.currentLanguage === 'fa' ? 'اپکس پروتکل' : 'ApeX Protocol', coingeckoId: 'apex-token-2', tradingViewSymbol: 'BYBIT:APEXUSDT' },
            okb: { symbol: 'OKB', name: this.currentLanguage === 'fa' ? 'او کی بی' : 'OKB', coingeckoId: 'okb', tradingViewSymbol: 'OKX:OKBUSDT' },
            notcoin: { symbol: 'NOT', name: this.currentLanguage === 'fa' ? 'نات کوین' : 'Notcoin', coingeckoId: 'notcoin', tradingViewSymbol: 'OKX:NOTUSDT' },
            optimism: { symbol: 'OP', name: this.currentLanguage === 'fa' ? 'اپتیمیزم' : 'Optimism', coingeckoId: 'optimism', tradingViewSymbol: 'OKX:OPUSDT' },
            decentraland: { symbol: 'MANA', name: this.currentLanguage === 'fa' ? 'دیسنترالند' : 'Decentraland', coingeckoId: 'decentraland', tradingViewSymbol: 'BINANCE:MANAUSDT' },
            'internet-computer': { symbol: 'ICP', name: this.currentLanguage === 'fa' ? 'اینترنت کامپیوتر' : 'Internet Computer', coingeckoId: 'internet-computer', tradingViewSymbol: 'COINBASE:ICPUSDT' },
            'curve-dao-token': { symbol: 'CRV', name: this.currentLanguage === 'fa' ? 'کرو دائو' : 'Curve DAO', coingeckoId: 'curve-dao-token', tradingViewSymbol: 'OKX:CRVUSDT' },
            zora: { symbol: 'ZORA', name: this.currentLanguage === 'fa' ? 'زورا' : 'Zora', coingeckoId: 'zora', tradingViewSymbol: 'KUCOIN:ZORAUSDT' },
            'ondo-finance': { symbol: 'ONDO', name: this.currentLanguage === 'fa' ? 'اوندو' : 'Ondo', coingeckoId: 'ondo-finance', tradingViewSymbol: 'KUCOIN:ONDOUSDT' },
            'aster-2': { symbol: 'ASTER', name: this.currentLanguage === 'fa' ? 'آستار' : 'Aster', coingeckoId: 'aster-2', tradingViewSymbol: 'MEXC:ASTERUSDT' },
            arbitrum: { symbol: 'ARB', name: this.currentLanguage === 'fa' ? 'آربیتروم' : 'Arbitrum', coingeckoId: 'arbitrum', tradingViewSymbol: 'KUCOIN:ARBUSDT' },
            'pancakeswap-token': { symbol: 'CAKE', name: this.currentLanguage === 'fa' ? 'پنکیک سواپ' : 'PancakeSwap', coingeckoId: 'pancakeswap-token', tradingViewSymbol: 'CRYPTO:CAKEUSD' },
        };

        this.cryptoInfo = cryptoInfoDatabase[this.selectedCrypto] || cryptoInfoDatabase.bitcoin;
        console.log('Selected crypto info:', this.cryptoInfo);
    }

async fetchRealTimeData() {
        try {
            // دریافت داده‌های لحظه‌ای از CoinGecko API (رایگان و بدون نیاز به API Key)
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${this.cryptoInfo.coingeckoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
            
            if (!response.ok) {
                throw new Error('خطا در دریافت داده‌ها از CoinGecko');
            }

            const data = await response.json();
            const cryptoData = data[this.cryptoInfo.coingeckoId];

            if (!cryptoData) {
                throw new Error('داده‌های ارز یافت نشد');
            }

            // دریافت داده‌های تاریخی برای محاسبات تکنیکال
            const historicalData = await this.fetchHistoricalData();

            this.cryptoData = {
                symbol: this.cryptoInfo.symbol,
                name: this.cryptoInfo.name,
                price: cryptoData.usd,
                priceChange24h: cryptoData.usd_24h_change || 0,
                volume24h: cryptoData.usd_24h_vol || 0,
                marketCap: cryptoData.usd_market_cap || 0,
                historicalData: historicalData,
                lastUpdated: Date.now()
            };

            console.log('Real-time data fetched:', this.cryptoData);

        } catch (error) {
            console.error('Error fetching real-time data:', error);
            throw new Error('خطا در دریافت داده‌های لحظه‌ای');
        }
    }

    async fetchHistoricalData() {
        try {
            // دریافت داده‌های تاریخی 30 روزه از CoinGecko
            const endDate = Math.floor(Date.now() / 1000);
            const startDate = endDate - (30 * 24 * 60 * 60); // 30 روز قبل

            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${this.cryptoInfo.coingeckoId}/market_chart/range?vs_currency=usd&from=${startDate}&to=${endDate}`);
            
            if (!response.ok) {
                throw new Error('خطا در دریافت داده‌های تاریخی');
            }

            const data = await response.json();
            
            // تبدیل داده‌ها به فرمت مورد نیاز
            return data.prices.map((price, index) => ({
                date: new Date(price[0]).toISOString().split('T')[0],
                price: price[1],
                volume: data.total_volumes[index] ? data.total_volumes[index][1] : 0
            }));

        } catch (error) {
            console.error('Error fetching historical data:', error);
            // در صورت خطا، داده‌های شبیه‌سازی شده برمی‌گردانیم
            return this.generateSimulatedHistoricalData();
        }
    }

    generateSimulatedHistoricalData() {
        const data = [];
        const basePrice = this.cryptoData.price || 100;
        const endDate = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(endDate);
            date.setDate(date.getDate() - i);
            
            // شبیه‌سازی نوسانات قیمت
            const randomChange = (Math.random() - 0.5) * 0.1; // ±5%
            const price = basePrice * (1 + randomChange);
            
            data.push({
                date: date.toISOString().split('T')[0],
                price: price,
                volume: Math.random() * 1000000000
            });
        }
        
        return data;
    }

    async calculateTechnicalIndicators() {
        const prices = this.cryptoData.historicalData.map(d => d.price);
        
        // محاسبه RSI
        this.cryptoData.technicalIndicators = {
            rsi: this.calculateRSI(prices),
            macd: this.calculateMACD(prices),
            sma20: this.calculateSMA(prices, 20),
            sma50: this.calculateSMA(prices, 50),
            ema12: this.calculateEMA(prices, 12),
            ema26: this.calculateEMA(prices, 26)
        };

        // محاسبه سطوح حمایت و مقاومت با الگوریتم بهبودیافته
        this.cryptoData.supportLevels = this.calculateSupportLevels(prices);
        this.cryptoData.resistanceLevels = this.calculateResistanceLevels(prices);

        console.log('Technical indicators calculated:', this.cryptoData.technicalIndicators);
    }

    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;

        const changes = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }

        const gains = changes.map(change => change > 0 ? change : 0);
        const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

        let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        }

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        return Math.round(rsi * 100) / 100;
    }

    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);
        const macdLine = fastEMA - slowEMA;
        
        return this.formatCalculationNumber(macdLine);
    }

    calculateSMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1] || 0;

        const sum = prices.slice(-period).reduce((sum, price) => sum + price, 0);
        return this.formatCalculationNumber(sum / period);
    }

    calculateEMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1] || 0;

        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }

        return this.formatCalculationNumber(ema);
    }

    calculateSupportLevels(prices) {
        const currentPrice = prices[prices.length - 1];
        const supportLevels = [];
        
        // الگوریتم بهبودیافته برای پیدا کردن سطوح حمایت
        for (let i = 2; i < prices.length - 2; i++) {
            // پیدا کردن کف‌های محلی
            if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1] && 
                prices[i] < prices[i - 2] && prices[i] < prices[i + 2]) {
                
                // فقط سطوحی که پایین‌تر از قیمت فعلی هستند
                if (prices[i] < currentPrice) {
                    supportLevels.push(prices[i]);
                }
            }
        }

        // مرتب‌سازی و حذف سطوح نزدیک به هم
        supportLevels.sort((a, b) => b - a);
        const filteredLevels = [];
        
        for (const level of supportLevels) {
            let isClose = false;
            for (const existingLevel of filteredLevels) {
                if (Math.abs(level - existingLevel) / existingLevel < 0.02) { // کمتر از 2% فاصله
                    isClose = true;
                    break;
                }
            }
            if (!isClose) {
                filteredLevels.push(level);
            }
        }

        // اگر به اندازه کافی سطح پیدا نشد، از سطوح فیبوناچی استفاده کن
        while (filteredLevels.length < 3) {
            const lastLevel = filteredLevels.length > 0 ? filteredLevels[filteredLevels.length - 1] : currentPrice;
            filteredLevels.push(this.formatCalculationNumber(lastLevel * 0.95));
        }

        return filteredLevels.slice(0, 3);
    }

    calculateResistanceLevels(prices) {
        const currentPrice = prices[prices.length - 1];
        const resistanceLevels = [];
        
        // الگوریتم بهبودیافته برای پیدا کردن سطوح مقاومت
        for (let i = 2; i < prices.length - 2; i++) {
            // پیدا کردن سقف‌های محلی
            if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1] && 
                prices[i] > prices[i - 2] && prices[i] > prices[i + 2]) {
                
                // فقط سطوحی که بالاتر از قیمت فعلی هستند
                if (prices[i] > currentPrice) {
                    resistanceLevels.push(prices[i]);
                }
            }
        }

        // مرتب‌سازی و حذف سطوح نزدیک به هم
        resistanceLevels.sort((a, b) => a - b);
        const filteredLevels = [];
        
        for (const level of resistanceLevels) {
            let isClose = false;
            for (const existingLevel of filteredLevels) {
                if (Math.abs(level - existingLevel) / existingLevel < 0.02) { // کمتر از 2% فاصله
                    isClose = true;
                    break;
                }
            }
            if (!isClose) {
                filteredLevels.push(level);
            }
        }

        // اگر به اندازه کافی سطح پیدا نشد، از سطوح فیبوناچی استفاده کن
        while (filteredLevels.length < 3) {
            const lastLevel = filteredLevels.length > 0 ? filteredLevels[filteredLevels.length - 1] : currentPrice;
            filteredLevels.push(this.formatCalculationNumber(lastLevel * 1.05));
        }

        return filteredLevels.slice(0, 3);
    }

    async fetchFearGreedIndex() {
        try {
            // دریافت شاخص ترس و طمع از Alternative.me API
            const response = await fetch('https://api.alternative.me/fng/');
            
            if (!response.ok) {
                throw new Error('خطا در دریافت شاخص ترس و طمع');
            }

            const data = await response.json();
            this.cryptoData.fearGreedIndex = parseInt(data.data[0].value);
            
            console.log('Fear & Greed Index:', this.cryptoData.fearGreedIndex);

        } catch (error) {
            console.error('Error fetching Fear & Greed Index:', error);
            // در صورت خطا، مقدار پیش‌فرض
            this.cryptoData.fearGreedIndex = 50;
        }
    }

    async performAIAnalysis() {
        const prompt = this.generatePrompt();
        console.log('Generated prompt:', prompt);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.selectedModel,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(this.currentLanguage === 'fa' ? 'خطا در ارتباط با API' : 'API connection error');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    generatePrompt() {
        const cryptoData = this.cryptoData;
        const cryptoInfo = this.cryptoInfo;
        
        // استفاده از تابع جدید برای فرمت‌بندی قیمت
        const formattedPrice = this.formatPrice(cryptoData.price, cryptoInfo.symbol);
        const formattedSMA20 = this.formatPrice(cryptoData.technicalIndicators.sma20, cryptoInfo.symbol);
        const formattedSMA50 = this.formatPrice(cryptoData.technicalIndicators.sma50, cryptoInfo.symbol);
        const formattedSupportLevels = cryptoData.supportLevels.map(level => this.formatPrice(level, cryptoInfo.symbol)).join(', ');
        const formattedResistanceLevels = cryptoData.resistanceLevels.map(level => this.formatPrice(level, cryptoInfo.symbol)).join(', ');
        
        if (this.currentLanguage === 'fa') {
            if (this.analysisType === 'short') {
                return `لطفاً یک تحلیل کوتاه مدت جامع برای ارز دیجیتال ${cryptoInfo.name} (${cryptoInfo.symbol}) ارائه دهید.

تحلیل کوتاه مدت باید روی موارد زیر تمرکز کند:
- تحلیل تکنیکال و شاخص‌های فوری
- رفتار قیمت و حجم معاملات
- شاخص ترس و طمع فعلی
- سیگنال‌های معاملاتی کوتاه مدت

داده‌های لحظه‌ای و واقعی:
- قیمت فعلی: $${formattedPrice}
- تغییر قیمت 24 ساعته: ${cryptoData.priceChange24h.toFixed(2)}%
- حجم معاملات 24 ساعته: $${(cryptoData.volume24h / 1000000000).toFixed(1)}B
- ارزش بازار: $${(cryptoData.marketCap / 1000000000).toFixed(1)}B
- RSI (محاسبه شده): ${cryptoData.technicalIndicators.rsi}
- MACD (محاسبه شده): ${cryptoData.technicalIndicators.macd}
- SMA20 (محاسبه شده): $${formattedSMA20}
- SMA50 (محاسبه شده): $${formattedSMA50}
- شاخص ترس و طمع (لحظه‌ای): ${cryptoData.fearGreedIndex}
- سطوح حمایت (محاسبه شده): ${formattedSupportLevels}
- سطوح مقاومت (محاسبه شده): ${formattedResistanceLevels}

لطفاً تحلیل شامل موارد زیر باشد:
1. وضعیت فعلی ${cryptoInfo.name} (صعودی، نزولی، یا خنثی) بر اساس داده‌های لحظه‌ای
2. تحلیل تکنیکال دقیق با تمرکز بر زمان کوتاه مدت
3. سیگنال‌های خرید و فروش فوری
4. حد ضرر و هدف سود کوتاه مدت
5. ریسک‌های کوتاه مدت
6. پیشنهاد معاملاتی برای چند روز آینده

توجه: تمام داده‌های فوق لحظه‌ای و واقعی هستند و بر اساس آخرین اطلاعات بازار می‌باشند.

پاسخ را به زبان فارسی و به صورت ساختاریافته با استفاده از مارک‌داون ارائه دهید. برای عناوین از ### و برای تاکید از ** استفاده کنید.`;
            } else {
                return `لطفاً یک تحلیل بلند مدت جامع برای ارز دیجیتال ${cryptoInfo.name} (${cryptoInfo.symbol}) ارائه دهید.

تحلیل بلند مدت باید روی موارد زیر تمرکز کند:
- روندهای بلندمدت قیمت
- فاندامنتال و آینده پروژه
- پتانسیل رشد در بلندمدت
- تحلیل بازار و رقبا
- پیش‌بینی قیمت برای ماه‌ها و سال‌های آینده

داده‌های لحظه‌ای و واقعی:
- قیمت فعلی: $${formattedPrice}
- تغییر قیمت 24 ساعته: ${cryptoData.priceChange24h.toFixed(2)}%
- حجم معاملات 24 ساعته: $${(cryptoData.volume24h / 1000000000).toFixed(1)}B
- ارزش بازار: $${(cryptoData.marketCap / 1000000000).toFixed(1)}B
- RSI (محاسبه شده): ${cryptoData.technicalIndicators.rsi}
- MACD (محاسبه شده): ${cryptoData.technicalIndicators.macd}
- SMA20 (محاسبه شده): $${formattedSMA20}
- SMA50 (محاسبه شده): $${formattedSMA50}
- شاخص ترس و طمع (لحظه‌ای): ${cryptoData.fearGreedIndex}
- سطوح حمایت (محاسبه شده): ${formattedSupportLevels}
- سطوح مقاومت (محاسبه شده): ${formattedResistanceLevels}

لطفاً تحلیل شامل موارد زیر باشد:
1. تحلیل فاندامنتال پروژه ${cryptoInfo.name}
2. روندهای بلندمدت قیمت
3. پتانسیل رشد در 6 ماه تا 2 سال آینده
4. تحلیل رقبا و بازار
5. عوامل موثر بر رشد بلندمدت
6. پیش‌بینی قیمت برای دوره‌های زمانی مختلف
7. استراتژی سرمایه‌گذاری بلندمدت
8. ریسک‌ها و فرصت‌های بلندمدت

توجه: تمام داده‌های فوق لحظه‌ای و واقعی هستند و بر اساس آخرین اطلاعات بازار می‌باشند.

پاسخ را به زبان فارسی و به صورت ساختاریافته با استفاده از مارک‌داون ارائه دهید. برای عناوین از ### و برای تاکید از ** استفاده کنید.`;
            }
        } else {
            if (this.analysisType === 'short') {
                return `Please provide a comprehensive short-term analysis for the cryptocurrency ${cryptoInfo.name} (${cryptoInfo.symbol}).

Short-term analysis should focus on:
- Technical analysis and immediate indicators
- Price behavior and trading volume
- Current fear and greed index
- Short-term trading signals

Real-time data:
- Current price: $${formattedPrice}
- 24h price change: ${cryptoData.priceChange24h.toFixed(2)}%
- 24h trading volume: $${(cryptoData.volume24h / 1000000000).toFixed(1)}B
- Market cap: $${(cryptoData.marketCap / 1000000000).toFixed(1)}B
- RSI (calculated): ${cryptoData.technicalIndicators.rsi}
- MACD (calculated): ${cryptoData.technicalIndicators.macd}
- SMA20 (calculated): $${formattedSMA20}
- SMA50 (calculated): $${formattedSMA50}
- Fear & Greed Index (real-time): ${cryptoData.fearGreedIndex}
- Support levels (calculated): ${formattedSupportLevels}
- Resistance levels (calculated): ${formattedResistanceLevels}

Please include:
1. Current status of ${cryptoInfo.name} (bullish, bearish, or neutral) based on real-time data
2. Detailed technical analysis with focus on short-term
3. Immediate buy/sell signals
4. Short-term stop loss and take profit levels
5. Short-term risks
6. Trading suggestion for the next few days

Note: All data above is real-time and based on the latest market information.

Respond in English and use structured markdown. Use ### for headings and ** for emphasis.`;
            } else {
                return `Please provide a comprehensive long-term analysis for the cryptocurrency ${cryptoInfo.name} (${cryptoInfo.symbol}).

Long-term analysis should focus on:
- Long-term price trends
- Project fundamentals and future
- Growth potential in the long term
- Market analysis and competitors
- Price prediction for months and years ahead

Real-time data:
- Current price: $${formattedPrice}
- 24h price change: ${cryptoData.priceChange24h.toFixed(2)}%
- 24h trading volume: $${(cryptoData.volume24h / 1000000000).toFixed(1)}B
- Market cap: $${(cryptoData.marketCap / 1000000000).toFixed(1)}B
- RSI (calculated): ${cryptoData.technicalIndicators.rsi}
- MACD (calculated): ${cryptoData.technicalIndicators.macd}
- SMA20 (calculated): $${formattedSMA20}
- SMA50 (calculated): $${formattedSMA50}
- Fear & Greed Index (real-time): ${cryptoData.fearGreedIndex}
- Support levels (calculated): ${formattedSupportLevels}
- Resistance levels (calculated): ${formattedResistanceLevels}

Please include:
1. Fundamental analysis of ${cryptoInfo.name} project
2. Long-term price trends
3. Growth potential in the next 6 months to 2 years
4. Competitors and market analysis
5. Factors affecting long-term growth
6. Price prediction for different time periods
7. Long-term investment strategy
8. Long-term risks and opportunities

Note: All data above is real-time and based on the latest market information.

Respond in English and use structured markdown. Use ### for headings and ** for emphasis.`;
            }
        }
    }

    // Amirreza is Best ;)

displayResults(analysis) {
    document.getElementById('analysisStatus').style.display = 'none';
    document.getElementById('analysisResults').style.display = 'block';

    const cryptoData = this.cryptoData;
    const cryptoInfo = this.cryptoInfo;

    // نمایش اطلاعات ارز
    this.displayCryptoInfo(cryptoInfo, cryptoData);

    // نمایش خلاصه تحلیل
    this.displaySummary(cryptoInfo, cryptoData);

    // نمایش نمودار زنده
    this.displayLiveChart(cryptoInfo);

    // نمایش شاخص‌ها
    this.displayIndicators(cryptoData.technicalIndicators, cryptoData.fearGreedIndex);

    // نمایش سطوح حمایت و مقاومت
    this.displayLevels(cryptoData.supportLevels, cryptoData.resistanceLevels);

    // نمایش تحلیل کامل با پشتیبانی از مارک‌داون
    this.displayAnalysisWithMarkdown(analysis);

    // استخراج پیشنهاد معاملاتی از تحلیل
    this.extractRecommendation(analysis);
}

displayCryptoInfo(cryptoInfo, cryptoData) {
    const cryptoInfoContent = document.getElementById('cryptoInfoContent');
    
    // استفاده از تابع جدید برای فرمت‌بندی قیمت
    const formattedPrice = this.formatPrice(cryptoData.price, cryptoInfo.symbol);
    const formattedVolume = (cryptoData.volume24h / 1000000000).toFixed(1);
    const formattedMarketCap = (cryptoData.marketCap / 1000000000).toFixed(1);
    
    cryptoInfoContent.innerHTML = `
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'نام ارز' : 'Currency Name'}</div>
            <div class="value">${cryptoInfo.name}</div>
        </div>
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'نماد' : 'Symbol'}</div>
            <div class="value">${cryptoInfo.symbol}</div>
        </div>
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'قیمت فعلی' : 'Current Price'}</div>
            <div class="value">$${formattedPrice}</div>
        </div>
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'تغییر 24h' : '24h Change'}</div>
            <div class="value ${cryptoData.priceChange24h >= 0 ? 'positive' : 'negative'}">${cryptoData.priceChange24h.toFixed(2)}%</div>
        </div>
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'حجم 24h' : '24h Volume'}</div>
            <div class="value">$${formattedVolume}B</div>
        </div>
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'ارزش بازار' : 'Market Cap'}</div>
            <div class="value">$${formattedMarketCap}B</div>
        </div>
    `;
}

displaySummary(cryptoInfo, cryptoData) {
    const summaryContent = document.getElementById('summaryContent');
    const trend = cryptoData.priceChange24h >= 0 ? 
        (this.currentLanguage === 'fa' ? 'صعودی 📈' : 'Bullish 📈') : 
        (this.currentLanguage === 'fa' ? 'نزولی 📉' : 'Bearish 📉');
    const analysisType = this.analysisType === 'short' ? 
        (this.currentLanguage === 'fa' ? 'کوتاه مدت' : 'Short-term') : 
        (this.currentLanguage === 'fa' ? 'بلند مدت' : 'Long-term');
    
    // استفاده از تابع جدید برای فرمت‌بندی قیمت
    const formattedPrice = this.formatPrice(cryptoData.price, cryptoInfo.symbol);
    
    summaryContent.innerHTML = `
        <p><strong>${this.currentLanguage === 'fa' ? 'نوع تحلیل:' : 'Analysis Type:'}</strong> ${analysisType}</p>
        <p><strong>${this.currentLanguage === 'fa' ? 'وضعیت فعلی:' : 'Current Status:'}</strong> ${trend}</p>
        <p><strong>${this.currentLanguage === 'fa' ? 'قیمت فعلی:' : 'Current Price:'}</strong> $${formattedPrice}</p>
        <p><strong>${this.currentLanguage === 'fa' ? 'تغییر 24 ساعته:' : '24h Change:'}</strong> <span class="${cryptoData.priceChange24h >= 0 ? 'positive' : 'negative'}">${cryptoData.priceChange24h.toFixed(2)}%</span></p>
        <p><strong>${this.currentLanguage === 'fa' ? 'شاخص ترس و طمع:' : 'Fear & Greed Index:'}</strong> ${cryptoData.fearGreedIndex} (${this.getFearGreedText(cryptoData.fearGreedIndex)})</p>
        <p><strong>${this.currentLanguage === 'fa' ? 'تحلیل کلی:' : 'Overall Analysis:'}</strong> ${this.getGeneralAnalysis(cryptoData)}</p>
    `;
}

displayLiveChart(cryptoInfo) {
    const liveChartContainer = document.getElementById('liveChartContainer');
    
    // استفاده از TradingView widget برای نمودار زنده
    liveChartContainer.innerHTML = `
        <iframe 
            src="https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${cryptoInfo.tradingViewSymbol}&interval=240&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=[]&hideideas=1&theme=dark&style=2&timezone=Etc/UTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=${this.currentLanguage === 'fa' ? 'fa_IR' : 'en'}&utm_source=&utm_medium=widget&utm_campaign=chart&utm_term=${cryptoInfo.tradingViewSymbol}"
            frameborder="0"
            allowtransparency="true"
            scrolling="no"
            allowfullscreen>
        </iframe>
    `;
}

displayIndicators(indicators, fearGreedIndex) {
    const indicatorsGrid = document.getElementById('indicatorsGrid');
    
    // استفاده از تابع جدید برای فرمت‌بندی قیمت در شاخص‌ها
    const formattedSMA20 = this.formatSmallNumber(indicators.sma20);
    const formattedSMA50 = this.formatSmallNumber(indicators.sma50);
    const formattedEMA12 = this.formatSmallNumber(indicators.ema12);
    const formattedEMA26 = this.formatSmallNumber(indicators.ema26);
    
    indicatorsGrid.innerHTML = `
        <div class="indicator-item">
            <div class="name">RSI</div>
            <div class="value ${this.getRSIClass(indicators.rsi)}">${indicators.rsi}</div>
        </div>
        <div class="indicator-item">
            <div class="name">MACD</div>
            <div class="value ${indicators.macd >= 0 ? 'positive' : 'negative'}">${this.formatSmallNumber(indicators.macd)}</div>
        </div>
        <div class="indicator-item">
            <div class="name">SMA20</div>
            <div class="value">$${formattedSMA20}</div>
        </div>
        <div class="indicator-item">
            <div class="name">SMA50</div>
            <div class="value">$${formattedSMA50}</div>
        </div>
        <div class="indicator-item">
            <div class="name">EMA12</div>
            <div class="value">$${formattedEMA12}</div>
        </div>
        <div class="indicator-item">
            <div class="name">EMA26</div>
            <div class="value">$${formattedEMA26}</div>
        </div>
        <div class="indicator-item">
            <div class="name">${this.currentLanguage === 'fa' ? 'شاخص ترس و طمع' : 'Fear & Greed Index'}</div>
            <div class="value ${this.getFearGreedClass(fearGreedIndex)}">${fearGreedIndex}</div>
        </div>
    `;
}

displayLevels(supportLevels, resistanceLevels) {
    const levelsContent = document.getElementById('levelsContent');
    
    // استفاده از تابع جدید برای فرمت‌بندی سطوح
    const formattedSupportLevels = supportLevels.map(level => this.formatPrice(level, this.cryptoInfo.symbol));
    const formattedResistanceLevels = resistanceLevels.map(level => this.formatPrice(level, this.cryptoInfo.symbol));
    
    levelsContent.innerHTML = `
        <div class="level-group">
            <h4>${this.currentLanguage === 'fa' ? 'سطوح حمایت' : 'Support Levels'}</h4>
            ${formattedSupportLevels.map((level, index) => `
                <div class="level-item">
                    <span class="level-name">${this.currentLanguage === 'fa' ? `حمایت ${index + 1}` : `Support ${index + 1}`}</span>
                    <span class="level-value">$${level}</span>
                </div>
            `).join('')}
        </div>
        <div class="level-group">
            <h4>${this.currentLanguage === 'fa' ? 'سطوح مقاومت' : 'Resistance Levels'}</h4>
            ${formattedResistanceLevels.map((level, index) => `
                <div class="level-item">
                    <span class="level-name">${this.currentLanguage === 'fa' ? `مقاومت ${index + 1}` : `Resistance ${index + 1}`}</span>
                    <span class="level-value">$${level}</span>
                </div>
            `).join('')}
        </div>
    `;
}

displayAnalysisWithMarkdown(analysis) {
    const fullAnalysisContent = document.getElementById('fullAnalysisContent');
    
    // استفاده از کتابخانه marked برای تبدیل مارک‌داون به HTML
    const htmlContent = marked.parse(analysis);
    
    // اعمال استایل‌های سفارشی برای خروجی بهتر
    const styledContent = htmlContent
        .replace(/<h1>/g, '<h1 style="color: #333; font-size: 1.8rem; margin-bottom: 20px;">')
        .replace(/<h2>/g, '<h2 style="color: #333; font-size: 1.5rem; margin-bottom: 15px;">')
        .replace(/<h3>/g, '<h3 style="color: #333; font-size: 1.3rem; margin-bottom: 12px;">')
        .replace(/<h4>/g, '<h4 style="color: #333; font-size: 1.1rem; margin-bottom: 10px;">')
        .replace(/<strong>/g, '<strong style="color: #333; font-weight: 700;">')
        .replace(/<ul>/g, '<ul style="margin-bottom: 15px; padding-right: 20px;">')
        .replace(/<ol>/g, '<ol style="margin-bottom: 15px; padding-right: 20px;">')
        .replace(/<li>/g, '<li style="margin-bottom: 8px;">')
        .replace(/<p>/g, '<p style="margin-bottom: 15px; line-height: 1.8;">');
    
    fullAnalysisContent.innerHTML = styledContent;
}

extractRecommendation(analysis) {
    const recommendationContent = document.getElementById('recommendationContent');
    
    // استفاده از تابع جدید برای فرمت‌بندی قیمت در پیشنهادات
    const currentPrice = this.cryptoData.price;
    const formattedStopLoss = this.formatPrice(currentPrice * 0.95, this.cryptoInfo.symbol);
    const formattedTakeProfit = this.formatPrice(currentPrice * 1.08, this.cryptoInfo.symbol);
    const formattedLongTermStopLoss = this.formatPrice(currentPrice * 0.7, this.cryptoInfo.symbol);
    const formattedLongTermTarget = this.formatPrice(currentPrice * 2, this.cryptoInfo.symbol);
    
    // استخراج پیشنهاد بر اساس نوع تحلیل
    if (this.analysisType === 'short') {
        recommendationContent.innerHTML = `
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'پیشنهاد معاملاتی:' : 'Trading Suggestion:'}</span>
                <span class="value positive">${this.currentLanguage === 'fa' ? 'لانگ (خرید)' : 'Long (Buy)'}</span>
            </div>
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'حد ضرر:' : 'Stop Loss:'}</span>
                <span class="value">$${formattedStopLoss}</span>
            </div>
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'هدف سود:' : 'Take Profit:'}</span>
                <span class="value">$${formattedTakeProfit}</span>
            </div>
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'ریسک:' : 'Risk:'}</span>
                <span class="value neutral">${this.currentLanguage === 'fa' ? 'متوسط' : 'Medium'}</span>
            </div>
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'زمان‌بندی:' : 'Timing:'}</span>
                <span class="value">${this.currentLanguage === 'fa' ? '1-7 روز' : '1-7 days'}</span>
            </div>
        `;
    } else {
        recommendationContent.innerHTML = `
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'پیشنهاد سرمایه‌گذاری:' : 'Investment Suggestion:'}</span>
                <span class="value positive">${this.currentLanguage === 'fa' ? 'هولد (نگهداری)' : 'Hold'}</span>
            </div>
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'حد ضرر بلندمدت:' : 'Long-term Stop Loss:'}</span>
                <span class="value">$${formattedLongTermStopLoss}</span>
            </div>
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'هدف بلندمدت:' : 'Long-term Target:'}</span>
                <span class="value">$${formattedLongTermTarget}</span>
            </div>
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'ریسک بلندمدت:' : 'Long-term Risk:'}</span>
                <span class="value neutral">${this.currentLanguage === 'fa' ? 'کم تا متوسط' : 'Low to Medium'}</span>
            </div>
            <div class="recommendation-item">
                <span class="label">${this.currentLanguage === 'fa' ? 'زمان‌بندی:' : 'Timing:'}</span>
                <span class="value">${this.currentLanguage === 'fa' ? '6-24 ماه' : '6-24 months'}</span>
            </div>
        `;
    }
}

getRSIClass(rsi) {
    if (rsi > 70) return 'negative';
    if (rsi < 30) return 'positive';
    return 'neutral';
}

getFearGreedClass(index) {
    if (index > 75) return 'negative';
    if (index < 25) return 'positive';
    return 'neutral';
}

getFearGreedText(index) {
    if (this.currentLanguage === 'fa') {
        if (index > 75) return 'طمع شدید';
        if (index > 50) return 'طمع';
        if (index > 25) return 'ترس';
        return 'ترس شدید';
    } else {
        if (index > 75) return 'Extreme Greed';
        if (index > 50) return 'Greed';
        if (index > 25) return 'Fear';
        return 'Extreme Fear';
    }
}

getGeneralAnalysis(cryptoData) {
    if (this.currentLanguage === 'fa') {
        if (cryptoData.priceChange24h > 3) {
            return 'روند صعودی قوی با پتانسیل ادامه رشد';
        } else if (cryptoData.priceChange24h > 0) {
            return 'روند صعودی ملایم با نیاز به تأیید بیشتر';
        } else if (cryptoData.priceChange24h > -3) {
            return 'روند نزولی ملایم با امکان اصلاح';
        } else {
            return 'روند نزولی قوی با نیاز به احتیاط';
        }
    } else {
        if (cryptoData.priceChange24h > 3) {
            return 'Strong bullish trend with potential for continued growth';
        } else if (cryptoData.priceChange24h > 0) {
            return 'Mild bullish trend requiring further confirmation';
        } else if (cryptoData.priceChange24h > -3) {
            return 'Mild bearish trend with potential for correction';
        } else {
            return 'Strong bearish trend requiring caution';
        }
    }
}

    showError(message) {
        alert(message);
    }

    copyResults() {
        const results = document.getElementById('fullAnalysisContent').innerText;
        navigator.clipboard.writeText(results).then(() => {
            alert(this.currentLanguage === 'fa' ? 
                'نتایج با موفقیت کپی شد' : 
                'Results copied successfully');
        });
    }

    downloadPDF() {
        alert(this.currentLanguage === 'fa' ? 
            'در نسخه نمایشی فعال نیست' : 
            'Not available in demo version');
    }

    shareResults() {
        if (navigator.share) {
            navigator.share({
                title: this.currentLanguage === 'fa' ? 
                    'تحلیل هوشمند ارز دیجیتال' : 
                    'Smart Crypto Analysis',
                text: document.getElementById('fullAnalysisContent').innerText,
                url: window.location.href
            });
        } else {
            alert(this.currentLanguage === 'fa' ? 
                'مرورگر شما از اشتراک گذاری پشتیبانی نمی‌کند' : 
                'Your browser does not support sharing');
        }
    }
}

// مقداردهی اولیه
document.addEventListener('DOMContentLoaded', () => {
    new CryptoAnalyzer();
});



