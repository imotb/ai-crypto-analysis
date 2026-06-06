/*
 * Crypto Analysis Assistant
 *
 * Smart cryptocurrency analysis with AI power.
 *
 * @author    https://github.com/imotb
 * @version   2.0.0
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
        this._blockchairSlugs = {
            'LTC': 'litecoin',
            'BCH': 'bitcoin-cash',
            'DOGE': 'dogecoin',
            'DASH': 'dash',
            'ADA': 'cardano',
            'DOT': 'polkadot',
            'XRP': 'ripple',
            'EOS': 'eos',
            'XLM': 'stellar',
            'ZEC': 'zcash',
            'XMR': 'monero'
        };
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
                'cryptoInfoTitle': '💎 اطلاعات ارز (لحظه‌ای)',
                'summaryTitle': '🔍 خلاصه تحلیل',
                'liveChartTitle': '👁‍🗨 نمودار زنده',
                'indicatorsTitle': '🧮 شاخص‌های تکنیکال (محاسبه شده)',
                'levelsTitle': '🎯 سطوح حمایت و مقاومت',
                'volumeProfileTitle': '📊 پروفایل حجم',
                'fibonacciTitle': '🌀 سطوح بازگشت فیبوناچی',
                'recommendationTitle': '🎰 پیشنهاد معاملاتی',
                'fullAnalysisTitle': '🤖 تحلیل کامل هوش مصنوعی',
                'copyButton': 'کپی نتایج',
                'downloadButton': 'دانلود PDF',
                'shareButton': 'اشتراک گذاری',
                'newsTitle': '📌 اخبار بازار کریپتو',
                'loadingNewsText': 'در حال دریافت آخرین ترندها...',
                'blockchainTitle': '⛓️ داده‌های پیشرفته بلاکچین',
                'advancedMetricsTitle': '📈 متریک‌های پیشرفته شبکه',
                'loadingBlockchainText': 'در حال دریافت داده‌های بلاکچین...',
                'loadingMetricsText': 'در حال محاسبه متریک‌های پیشرفته...',
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
                'cryptoInfoTitle': '💎 Currency Info (Live)',
                'summaryTitle': '🔎 Analysis Summary',
                'liveChartTitle': '👁‍🗨 Live Chart',
                'indicatorsTitle': '🧮 Technical Indicators (Calculated)',
                'levelsTitle': '🎯 Support & Resistance Levels',
                'volumeProfileTitle': '📊 Volume Profile',
                'fibonacciTitle': '🌀 Fibonacci Retracement Levels',
                'recommendationTitle': '🎰 Trading Recommendation',
                'fullAnalysisTitle': '🤖 Full AI Analysis',
                'copyButton': 'Copy Results',
                'downloadButton': 'Download PDF',
                'shareButton': 'Share',
                'newsTitle': '📌 Crypto Market News',
                'loadingNewsText': 'Fetching latest Trends...',
                'blockchainTitle': '⛓️ Advanced Blockchain Data',
                'advancedMetricsTitle': '📈 Advanced Network Metrics',
                'loadingBlockchainText': 'Fetching blockchain data...',
                'loadingMetricsText': 'Calculating advanced metrics...',
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
        // بررسی وجود num و معتبر بودن آن
        if (num === undefined || num === null || isNaN(num)) {
            console.warn('Invalid number detected:', num);
            return '0';
        }
        
        const number = Number(num);
        if (isNaN(number)) {
            return '0';
        }
        
        if (number === 0) return '0';
        if (number >= 0.01) {
            try {
                return number.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 6 
                });
            } catch (error) {
                return number.toFixed(2);
            }
        }
        if (number >= 0.0001) {
            try {
                return number.toLocaleString(undefined, { 
                    minimumFractionDigits: 4, 
                    maximumFractionDigits: 8 
                });
            } catch (error) {
                return number.toFixed(4);
            }
        }
        
        // برای اعداد بسیار کوچک مثل شیبا و پپه
        const fixedNum = number.toFixed(maxDecimals);
        // حذف صفرهای انتهایی
        return fixedNum.replace(/\.?0+$/, '');
    }

    // تابع جدید برای فرمت‌بندی قیمت بر اساس نوع ارز
    formatPrice(price, symbol) {
        // بررسی وجود price و معتبر بودن آن
        if (price === undefined || price === null || isNaN(price)) {
            console.warn('Invalid price detected:', price);
            return '0.00';
        }
        
        // اطمینان از عدد بودن
        const numPrice = Number(price);
        if (isNaN(numPrice)) {
            return '0.00';
        }
        
        // لیست ارزهایی که قیمت بسیار پایینی دارند
        const lowPriceCryptos = ['SHIB', 'PEPE', 'DOGE', 'XLM', 'FLOKI', 'BABYDOGE'];
        
        if (lowPriceCryptos.includes(symbol)) {
            if (numPrice < 0.0001) {
                return numPrice.toFixed(8);
            } else if (numPrice < 0.01) {
                return numPrice.toFixed(6);
            }
        }
        
        if (numPrice < 1) {
            return numPrice.toFixed(4);
        }
        
        // استفاده از toLocaleString با حفاظت از خطا
        try {
            return numPrice.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 6 
            });
        } catch (error) {
            console.error('Error in toLocaleString:', error);
            return numPrice.toFixed(2);
        }
    }

    // تابع جدید برای فرمت‌بندی اعداد در محاسبات
    formatCalculationNumber(num) {
        // بررسی وجود num و معتبر بودن آن
        if (num === undefined || num === null || isNaN(num)) {
            console.warn('Invalid calculation number detected:', num);
            return 0;
        }
        
        const number = Number(num);
        if (isNaN(number)) {
            return 0;
        }
        
        if (number === 0) return 0;
        if (Math.abs(number) < 0.000001) {
            return parseFloat(number.toFixed(10));
        }
        if (Math.abs(number) < 0.001) {
            return parseFloat(number.toFixed(8));
        }
        if (Math.abs(number) < 0.1) {
            return parseFloat(number.toFixed(6));
        }
        return parseFloat(number.toFixed(4));
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
        // جلوگیری از تحلیل همزمان چندگانه
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn.disabled) {
            return;
        }
        
        // غیرفعال کردن دکمه تحلیل
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${this.currentLanguage === 'fa' ? 'در حال تحلیل...' : 'Analyzing...'}`;

        // دریافت تنظیمات
        this.apiKey = document.getElementById('apiKey').value.trim();
        this.selectedModel = document.getElementById('model').value;
        this.selectedCrypto = document.getElementById('cryptocurrency').value;
        this.analysisType = document.querySelector('input[name="analysisType"]:checked').value;

        // اعتبارسنجی اولیه
        if (!this.apiKey) {
            this.showError(this.currentLanguage === 'fa' ? 
                'لطفاً کلید API OpenRouter خود را وارد کنید' : 
                'Please enter your OpenRouter API key');
            this.resetAnalyzeButton();
            return;
        }

        if (!this.selectedCrypto) {
            this.showError(this.currentLanguage === 'fa' ? 
                'لطفاً یک ارز دیجیتال انتخاب کنید' : 
                'Please select a cryptocurrency');
            this.resetAnalyzeButton();
            return;
        }

        try {
            // نمایش پنل نتایج
            document.getElementById('resultsPanel').style.display = 'block';
            document.getElementById('analysisStatus').style.display = 'block';
            document.getElementById('analysisResults').style.display = 'none';

            // 🔄 مرحله 1: دریافت اطلاعات پایه ارز
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال دریافت اطلاعات ارز...' : 
                'Fetching currency information...');
            
            await this.fetchCryptoInfo();
            
            if (!this.cryptoInfo || !this.cryptoInfo.symbol) {
                throw new Error(this.currentLanguage === 'fa' ? 
                    'اطلاعات ارز یافت نشد' : 
                    'Currency information not found');
            }

            // 🔄 مرحله 2: دریافت داده‌های لحظه‌ای
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال دریافت داده‌های لحظه‌ای...' : 
                'Fetching real-time data...');
            
            await this.fetchRealTimeData();
            
            if (!this.cryptoData || !this.cryptoData.price) {
                throw new Error(this.currentLanguage === 'fa' ? 
                    'داده‌های قیمتی دریافت نشد' : 
                    'Price data not received');
            }

            // 🔄 مرحله 3: دریافت داده‌های بلاکچین
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال دریافت داده‌های پیشرفته بلاکچین...' : 
                'Fetching advanced blockchain data...');
            
            await this.fetchBlockchainData();

            // 🔄 مرحله 4: محاسبه شاخص‌های تکنیکال
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال محاسبه شاخص‌های تکنیکال...' : 
                'Calculating technical indicators...');
            
            await this.calculateTechnicalIndicators();

            // 🔄 مرحله 5: محاسبه متریک‌های پیشرفته شبکه
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال محاسبه متریک‌های پیشرفته...' : 
                'Calculating advanced metrics...');
            
            this.calculateAdvancedNetworkMetrics();

            // 🔄 مرحله 6: دریافت اخبار و ترندها (به صورت موازی برای سرعت بیشتر)
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال دریافت آخرین اخبار و ترندها...' : 
                'Fetching latest news and trends...');
            
            const newsPromise = this.fetchCryptoNews().catch(error => {
                console.warn('News fetch failed:', error);
                return this.getDefaultNews();
            });

            // 🔄 مرحله 7: دریافت شاخص ترس و طمع
            const fearGreedPromise = this.fetchFearGreedIndex().catch(error => {
                console.warn('Fear & Greed index fetch failed:', error);
                this.cryptoData.fearGreedIndex = 50; // مقدار پیش‌فرض
            });

            // منتظر ماندن برای تکمیل درخواست‌های موازی
            await Promise.allSettled([newsPromise, fearGreedPromise]);

            // نمایش اخبار به محض آماده شدن
            const news = await newsPromise;
            this.displayNews(news);

            // 🔄 مرحله 8: تحلیل هوشمند با AI
            this.updateStatus(
            this.currentLanguage === 'fa' ?
            'درحال تحلیل با AI...':
            'Analyzing with AI...');
            
            const analysis = await this.performAIAnalysis();
            
            if (!analysis || analysis.trim() === '') {
                throw new Error(this.currentLanguage === 'fa' ? 
                    'تحلیل AI پاسخی برنگرداند' : 
                    'AI analysis returned empty response');
            }

            // 🔄 مرحله 9: نمایش نتایج
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال نمایش نتایج...' : 
                'Displaying results...');
            
            this.displayResults(analysis);

            // 🔄 مرحله 10: به‌روزرسانی نهایی
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'تحلیل با موفقیت تکمیل شد ✅' : 
                'Analysis completed successfully ✅');
            
            // تأخیر کوتاه برای نمایش پیام موفقیت
            setTimeout(() => {
                document.getElementById('analysisStatus').style.display = 'none';
                this.resetAnalyzeButton();
            }, 1000);

        } catch (error) {
            console.error('Analysis error:', error);
            this.handleAnalysisError(error);
            this.resetAnalyzeButton();
        }
    }

    // تابع کمکی برای بازنشانی دکمه تحلیل
    resetAnalyzeButton() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `<i class="fas fa-magic"></i> ${this.translations[this.currentLanguage]['analyzeButton']}`;
    }

    // تابع بهبودیافته برای مدیریت خطا
    handleAnalysisError(error) {
        // مخفی کردن وضعیت بارگذاری
        const analysisStatus = document.getElementById('analysisStatus');
        if (analysisStatus) {
            analysisStatus.style.display = 'none';
        }

        let errorMessage = '';
        let errorDetails = '';

        // تشخیص نوع خطا و ارائه پیام مناسب
        if (error.message.includes('API') || error.message.includes('کلید') || error.message.includes('API key')) {
            errorMessage = this.currentLanguage === 'fa' ? 
                'خطا در ارتباط با API' : 
                'API connection error';
            errorDetails = this.currentLanguage === 'fa' ? 
                'لطفاً کلید API خود را بررسی کنید و از فعال بودن آن اطمینان حاصل کنید.' : 
                'Please check your API key and ensure it is active.';
        } 
        else if (error.message.includes('network') || error.message.includes('شبکه') || error.message.includes('Network')) {
            errorMessage = this.currentLanguage === 'fa' ? 
                'خطای شبکه' : 
                'Network error';
            errorDetails = this.currentLanguage === 'fa' ? 
                'لطفاً اتصال اینترنت خود را بررسی کنید و مجدداً تلاش کنید.' : 
                'Please check your internet connection and try again.';
        }
        else if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
            errorMessage = this.currentLanguage === 'fa' ? 
                'خطای امنیتی مرورگر' : 
                'Browser security error';
            errorDetails = this.currentLanguage === 'fa' ? 
                'لطفاً از VPN استفاده کنید یا مرورگر را در حالت ناشناس امتحان کنید.' : 
                'Please use VPN or try in incognito mode.';
        }
        else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
            errorMessage = this.currentLanguage === 'fa' ? 
                ' timeout خطای' : 
                'Timeout error';
            errorDetails = this.currentLanguage === 'fa' ? 
                'درخواست بسیار طول کشید. لطفاً مجدداً تلاش کنید.' : 
                'Request took too long. Please try again.';
        }
        else if (error.message.includes('undefined') || error.message.includes('toLocaleString')) {
            errorMessage = this.currentLanguage === 'fa' ? 
                'خطا در پردازش داده‌ها' : 
                'Data processing error';
            errorDetails = this.currentLanguage === 'fa' ? 
                'داده‌های دریافت شده ناقص هستند. لطفاً مجدداً تلاش کنید.' : 
                'Received data is incomplete. Please try again.';
        }
        else {
            errorMessage = this.currentLanguage === 'fa' ? 
                'خطا در انجام تحلیل' : 
                'Analysis error';
            errorDetails = error.message;
        }

        // نمایش خطا در رابط کاربری
        this.showErrorInUI(errorMessage, errorDetails);
    }

    // تابع بهبودیافته برای نمایش خطا در UI
    showErrorInUI(title, message) {
        const resultsPanel = document.getElementById('resultsPanel');
        if (!resultsPanel) return;

        // Find or create the error container inside resultsPanel, preserving the heading
        let errorContainer = document.getElementById('errorContainer');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'errorContainer';
            resultsPanel.appendChild(errorContainer);
        }

        // Hide analysis status if visible
        const analysisStatus = document.getElementById('analysisStatus');
        if (analysisStatus) analysisStatus.style.display = 'none';
        const analysisResults = document.getElementById('analysisResults');
        if (analysisResults) analysisResults.style.display = 'none';

        errorContainer.innerHTML = `
            <div class="error-panel">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="error-actions">
                    <button onclick="location.reload()" class="retry-btn">
                        <i class="fas fa-redo"></i>
                        ${this.currentLanguage === 'fa' ? 'بارگذاری مجدد صفحه' : 'Reload Page'}
                    </button>
                    <button onclick="document.getElementById('errorContainer').remove()" class="close-btn">
                        <i class="fas fa-times"></i>
                        ${this.currentLanguage === 'fa' ? 'بستن' : 'Close'}
                    </button>
                </div>
                <div class="error-tips">
                    <h4>${this.currentLanguage === 'fa' ? 'راهنمایی:' : 'Tips:'}</h4>
                    <ul>
                        <li>${this.currentLanguage === 'fa' ? 'اتصال اینترنت خود را بررسی کنید' : 'Check your internet connection'}</li>
                        <li>${this.currentLanguage === 'fa' ? 'کلید API خود را بررسی کنید' : 'Verify your API key'}</li>
                        <li>${this.currentLanguage === 'fa' ? 'در صورت نیاز از VPN استفاده کنید' : 'Use VPN if necessary'}</li>
                        <li>${this.currentLanguage === 'fa' ? 'مرورگر را به روزرسانی کنید' : 'Update your browser'}</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // تابع بهبودیافته برای به‌روزرسانی وضعیت
    updateStatus(message) {
        const loadingText = document.querySelector('.loading p');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.opacity = '0.7';
            loadingText.style.transition = 'opacity 0.3s ease';
            
            // افکت fade in
            setTimeout(() => {
                loadingText.style.opacity = '1';
            }, 50);
        }
        
        // همچنین در کنسول لاگ کنیم برای دیباگ
        console.log(`Status: ${message}`);
    }

    async fetchCryptoInfo() {
        // اطلاعات پایه ارزها
        const cryptoInfoDatabase = {
            bitcoin: { symbol: 'BTC', name: this.currentLanguage === 'fa' ? 'بیت کوین' : 'Bitcoin', coingeckoId: 'bitcoin', coinpaprikaId: 'btc-bitcoin', tradingViewSymbol: 'BINANCE:BTCUSDT' },
            ethereum: { symbol: 'ETH', name: this.currentLanguage === 'fa' ? 'اتریوم' : 'Ethereum', coingeckoId: 'ethereum', coinpaprikaId: 'eth-ethereum', tradingViewSymbol: 'BINANCE:ETHUSDT' },
            binancecoin: { symbol: 'BNB', name: this.currentLanguage === 'fa' ? 'بایننس کوین' : 'Binance Coin', coingeckoId: 'binancecoin', coinpaprikaId: 'bnb-bnb', tradingViewSymbol: 'BINANCE:BNBUSDT' },
            ripple: { symbol: 'XRP', name: this.currentLanguage === 'fa' ? 'ریپل' : 'Ripple', coingeckoId: 'ripple', coinpaprikaId: 'xrp-xrp', tradingViewSymbol: 'BINANCE:XRPUSDT' },
            solana: { symbol: 'SOL', name: this.currentLanguage === 'fa' ? 'سولانا' : 'Solana', coingeckoId: 'solana', coinpaprikaId: 'sol-solana', tradingViewSymbol: 'BINANCE:SOLUSDT' },
            cardano: { symbol: 'ADA', name: this.currentLanguage === 'fa' ? 'کاردانو' : 'Cardano', coingeckoId: 'cardano', coinpaprikaId: 'ada-cardano', tradingViewSymbol: 'BINANCE:ADAUSDT' },
            dogecoin: { symbol: 'DOGE', name: this.currentLanguage === 'fa' ? 'دوج کوین' : 'Dogecoin', coingeckoId: 'dogecoin', coinpaprikaId: 'doge-dogecoin', tradingViewSymbol: 'BINANCE:DOGEUSDT' },
            tron: { symbol: 'TRX', name: this.currentLanguage === 'fa' ? 'ترون' : 'Tron', coingeckoId: 'tron', coinpaprikaId: 'trx-tron', tradingViewSymbol: 'BINANCE:TRXUSDT' },
            polkadot: { symbol: 'DOT', name: this.currentLanguage === 'fa' ? 'پولکادات' : 'Polkadot', coingeckoId: 'polkadot', coinpaprikaId: 'dot-polkadot', tradingViewSymbol: 'BINANCE:DOTUSDT' },
            polygon: { symbol: 'POL', name: this.currentLanguage === 'fa' ? 'پالیگان' : 'Polygon', coingeckoId: 'matic-network', coinpaprikaId: 'matic-polygon', tradingViewSymbol: 'BINANCE:POLUSDT' },
            litecoin: { symbol: 'LTC', name: this.currentLanguage === 'fa' ? 'لایت کوین' : 'Litecoin', coingeckoId: 'litecoin', coinpaprikaId: 'ltc-litecoin', tradingViewSymbol: 'BINANCE:LTCUSDT' },
            chainlink: { symbol: 'LINK', name: this.currentLanguage === 'fa' ? 'چین لینک' : 'Chainlink', coingeckoId: 'chainlink', coinpaprikaId: 'link-chainlink', tradingViewSymbol: 'BINANCE:LINKUSDT' },
            'bitcoin-cash': { symbol: 'BCH', name: this.currentLanguage === 'fa' ? 'بیت کوین کش' : 'Bitcoin Cash', coingeckoId: 'bitcoin-cash', coinpaprikaId: 'bch-bitcoin-cash', tradingViewSymbol: 'BINANCE:BCHUSDT' },
            'ethereum-classic': { symbol: 'ETC', name: this.currentLanguage === 'fa' ? 'اتریوم کلاسیک' : 'Ethereum Classic', coingeckoId: 'ethereum-classic', coinpaprikaId: 'etc-ethereum-classic', tradingViewSymbol: 'BINANCE:ETCUSDT' },
            stellar: { symbol: 'XLM', name: this.currentLanguage === 'fa' ? 'استلار' : 'Stellar', coingeckoId: 'stellar', coinpaprikaId: 'xlm-stellar', tradingViewSymbol: 'BINANCE:XLMUSDT' },
            uniswap: { symbol: 'UNI', name: this.currentLanguage === 'fa' ? 'یونی‌سواپ' : 'Uniswap', coingeckoId: 'uniswap', coinpaprikaId: 'uni-uniswap', tradingViewSymbol: 'BINANCE:UNIUSDT' },
            toncoin: { symbol: 'TON', name: this.currentLanguage === 'fa' ? 'تون کوین' : 'Toncoin', coingeckoId: 'the-open-network', coinpaprikaId: 'ton-toncoin', tradingViewSymbol: 'BINANCE:TONUSDT' },
            'avalanche-2': { symbol: 'AVAX', name: this.currentLanguage === 'fa' ? 'آوالانچ' : 'Avalanche', coingeckoId: 'avalanche-2', coinpaprikaId: 'avax-avalanche', tradingViewSymbol: 'BINANCE:AVAXUSDT' },
            'shiba-inu': { symbol: 'SHIB', name: this.currentLanguage === 'fa' ? 'شیبا اینو' : 'Shiba Inu', coingeckoId: 'shiba-inu', coinpaprikaId: 'shib-shiba-inu', tradingViewSymbol: 'BINANCE:SHIBUSDT' },
            monero: { symbol: 'XMR', name: this.currentLanguage === 'fa' ? 'مونرو' : 'Monero', coingeckoId: 'monero', coinpaprikaId: 'xmr-monero', tradingViewSymbol: 'KUCOIN:XMRUSDT' },
            'vechain': { symbol: 'VET', name: this.currentLanguage === 'fa' ? 'وی چین' : 'VeChain', coingeckoId: 'vechain', coinpaprikaId: 'vet-vechain', tradingViewSymbol: 'BINANCE:VETUSDT' },
            'cosmos-hub': { symbol: 'ATOM', name: this.currentLanguage === 'fa' ? 'کازماس' : 'Cosmos', coingeckoId: 'cosmos', coinpaprikaId: 'atom-cosmos', tradingViewSymbol: 'BINANCE:ATOMUSDT' },
            'tezos': { symbol: 'XTZ', name: this.currentLanguage === 'fa' ? 'تزوس' : 'Tezos', coingeckoId: 'tezos', coinpaprikaId: 'xtz-tezos', tradingViewSymbol: 'BINANCE:XTZUSDT' },
            'leo-token': { symbol: 'LEO', name: this.currentLanguage === 'fa' ? 'لئو توکن' : 'LEO Token', coingeckoId: 'leo-token', coinpaprikaId: 'leo-leo-token', tradingViewSymbol: 'OKX:LEOUSDT' },
            'kucoin-shares': { symbol: 'KCS', name: this.currentLanguage === 'fa' ? 'کوکوین توکن' : 'KuCoin', coingeckoId: 'kucoin-shares', coinpaprikaId: 'kcs-kucoin-token', tradingViewSymbol: 'KUCOIN:KCSUSDT' },
            'zcash': { symbol: 'ZEC', name: this.currentLanguage === 'fa' ? 'زی کش' : 'Zcash', coingeckoId: 'zcash', coinpaprikaId: 'zec-zcash', tradingViewSymbol: 'BINANCE:ZECUSDT' },
            'pax-gold': { symbol: 'PAXG', name: this.currentLanguage === 'fa' ? 'پکس گلد' : 'PAX Gold', coingeckoId: 'pax-gold', coinpaprikaId: 'paxg-pax-gold', tradingViewSymbol: 'BINANCE:PAXGUSDT' },
            'tether-gold': { symbol: 'XAUT', name: this.currentLanguage === 'fa' ? 'تتر گلد' : 'Tether Gold', coingeckoId: 'tether-gold', coinpaprikaId: 'xaut-tether-gold', tradingViewSymbol: 'XAUTUSDT' },
            'chiliz': { symbol: 'CHZ', name: this.currentLanguage === 'fa' ? 'چیلیز' : 'Chiliz', coingeckoId: 'chiliz', coinpaprikaId: 'chz-chiliz', tradingViewSymbol: 'BINANCE:CHZUSDT' },
            'the-sandbox': { symbol: 'SAND', name: this.currentLanguage === 'fa' ? 'سندباکس' : 'The Sandbox', coingeckoId: 'the-sandbox', coinpaprikaId: 'sand-the-sandbox', tradingViewSymbol: 'BINANCE:SANDUSDT' },
            'near': { symbol: 'NEAR', name: this.currentLanguage === 'fa' ? 'نیر پروتکل' : 'NEAR Protocol', coingeckoId: 'near', coinpaprikaId: 'near-near-protocol', tradingViewSymbol: 'BINANCE:NEARUSDT' },
            'sui': { symbol: 'SUI', name: this.currentLanguage === 'fa' ? 'سویی' : 'Sui', coingeckoId: 'sui', coinpaprikaId: 'sui-sui', tradingViewSymbol: 'BINANCE:SUIUSDT' },
            'render-token': { symbol: 'RENDER', name: this.currentLanguage === 'fa' ? 'رندر توکن' : 'Render', coingeckoId: 'render-token', coinpaprikaId: 'render-render', tradingViewSymbol: 'BINANCE:RENDERUSDT' },
            'injective-protocol': { symbol: 'INJ', name: this.currentLanguage === 'fa' ? 'اینجکتیو' : 'Injective', coingeckoId: 'injective-protocol', coinpaprikaId: 'inj-injective-protocol', tradingViewSymbol: 'BINANCE:INJUSDT' },
            'stacks': { symbol: 'STX', name: this.currentLanguage === 'fa' ? 'استکس' : 'Stacks', coingeckoId: 'blockstack', coinpaprikaId: 'stx-stacks', tradingViewSymbol: 'BINANCE:STXUSDT' },
            'celestia': { symbol: 'TIA', name: this.currentLanguage === 'fa' ? 'سلستیا' : 'Celestia', coingeckoId: 'celestia', coinpaprikaId: 'tia-celestia', tradingViewSymbol: 'OKX:TIAUSDT' },
            'floki': { symbol: 'FLOKI', name: this.currentLanguage === 'fa' ? 'فلوکی' : 'FLOKI', coingeckoId: 'floki', coinpaprikaId: 'floki-floki-inu', tradingViewSymbol: 'BINANCE:FLOKIUSDT' },
            'baby-doge-coin': { symbol: 'BABYDOGE', name: this.currentLanguage === 'fa' ? 'بیبی دوج' : 'Baby Doge Coin', coingeckoId: 'baby-doge-coin', coinpaprikaId: 'babydoge-baby-doge-coin', tradingViewSymbol: 'OKX:BABYDOGEUSDT' },
            'wanchain': { symbol: 'WAN', name: this.currentLanguage === 'fa' ? 'ون چین' : 'Wanchain', coingeckoId: 'wanchain', coinpaprikaId: 'wan-wanchain', tradingViewSymbol: 'BINANCE:WANUSDT' },
            electroneum: { symbol: 'ETN', name: this.currentLanguage === 'fa' ? 'الکترونیوم' : 'Electroneum', coingeckoId: 'electroneum', coinpaprikaId: 'etn-electroneum', tradingViewSymbol: 'KUCOIN:ETNUSDT' },
            'trust-wallet-token': { symbol: 'TWT', name: this.currentLanguage === 'fa' ? 'تراست ولت توکن' : 'Trust Wallet Token', coingeckoId: 'trust-wallet-token', coinpaprikaId: 'twt-trust-wallet-token', tradingViewSymbol: 'BINANCE:TWTUSDT' },
            'pepe': { symbol: 'PEPE', name: this.currentLanguage === 'fa' ? 'پپه' : 'Pepe', coingeckoId: 'pepe', coinpaprikaId: 'pepe-pepe', tradingViewSymbol: 'BINANCE:PEPEUSDT' },
            'dogs': { symbol: 'DOGS', name: this.currentLanguage === 'fa' ? 'داگز' : 'Dogs', coingeckoId: 'dogs-2', coinpaprikaId: 'dogs-dogs', tradingViewSymbol: 'BINANCE:DOGSUSDT' },
            'sonic': { symbol: 'S', name: this.currentLanguage === 'fa' ? 'سونیک' : 'Sonic', coingeckoId: 'sonic-3', coinpaprikaId: 's-sonic', tradingViewSymbol: 'COINEX:SUSDT' },
            'hyperliquid': { symbol: 'HYPE', name: this.currentLanguage === 'fa' ? 'هایپر لیکویید' : 'Hyperliquid', coingeckoId: 'hyperliquid', coinpaprikaId: 'hype-hyperliquid', tradingViewSymbol: 'KUCOIN:HYPEUSDT' },
            'pump-fun': { symbol: 'PUMP', name: this.currentLanguage === 'fa' ? 'پامپ فان' : 'Pump.fun', coingeckoId: 'pump-fun', coinpaprikaId: 'pump-pumpfun', tradingViewSymbol: 'BYBIT:PUMPUSDT' },
            kusama: { symbol: 'KSM', name: this.currentLanguage === 'fa' ? 'کوزاما' : 'Kusama', coingeckoId: 'kusama', coinpaprikaId: 'ksm-kusama', tradingViewSymbol: 'OKX:KSMUSDT' },
            aave: { symbol: 'AAVE', name: this.currentLanguage === 'fa' ? 'آوه' : 'Aave', coingeckoId: 'aave', coinpaprikaId: 'aave-new', tradingViewSymbol: 'BINANCE:AAVEUSDT' },
            aptos: { symbol: 'APT', name: this.currentLanguage === 'fa' ? 'آپتوس' : 'Aptos', coingeckoId: 'aptos', coinpaprikaId: 'apt-aptos', tradingViewSymbol: 'OKX:APTUSDT' },
            'apex-token-2': { symbol: 'APEX', name: this.currentLanguage === 'fa' ? 'اپکس پروتکل' : 'ApeX Protocol', coingeckoId: 'apex-token-2', coinpaprikaId: 'apxp-apex-protocol', tradingViewSymbol: 'BYBIT:APEXUSDT' },
            okb: { symbol: 'OKB', name: this.currentLanguage === 'fa' ? 'او کی بی' : 'OKB', coingeckoId: 'okb', coinpaprikaId: 'okb-okb', tradingViewSymbol: 'OKX:OKBUSDT' },
            notcoin: { symbol: 'NOT', name: this.currentLanguage === 'fa' ? 'نات کوین' : 'Notcoin', coingeckoId: 'notcoin', coinpaprikaId: 'not-notcoin', tradingViewSymbol: 'OKX:NOTUSDT' },
            optimism: { symbol: 'OP', name: this.currentLanguage === 'fa' ? 'اپتیمیزم' : 'Optimism', coingeckoId: 'optimism', coinpaprikaId: 'op-optimism', tradingViewSymbol: 'OKX:OPUSDT' },
            decentraland: { symbol: 'MANA', name: this.currentLanguage === 'fa' ? 'دیسنترالند' : 'Decentraland', coingeckoId: 'decentraland', coinpaprikaId: 'mana-decentraland', tradingViewSymbol: 'BINANCE:MANAUSDT' },
            'internet-computer': { symbol: 'ICP', name: this.currentLanguage === 'fa' ? 'اینترنت کامپیوتر' : 'Internet Computer', coingeckoId: 'internet-computer', coinpaprikaId: 'icp-internet-computer', tradingViewSymbol: 'COINBASE:ICPUSDT' },
            'curve-dao-token': { symbol: 'CRV', name: this.currentLanguage === 'fa' ? 'کرو دائو' : 'Curve DAO', coingeckoId: 'curve-dao-token', coinpaprikaId: 'crv-curve-dao-token', tradingViewSymbol: 'OKX:CRVUSDT' },
            zora: { symbol: 'ZORA', name: this.currentLanguage === 'fa' ? 'زورا' : 'Zora', coingeckoId: 'zora', coinpaprikaId: 'zora-zora', tradingViewSymbol: 'KUCOIN:ZORAUSDT' },
            'ondo-finance': { symbol: 'ONDO', name: this.currentLanguage === 'fa' ? 'اوندو' : 'Ondo', coingeckoId: 'ondo-finance', coinpaprikaId: 'ondo-ondo', tradingViewSymbol: 'KUCOIN:ONDOUSDT' },
            'aster-2': { symbol: 'ASTER', name: this.currentLanguage === 'fa' ? 'آستار' : 'Aster', coingeckoId: 'aster-2', coinpaprikaId: 'aster-aster', tradingViewSymbol: 'MEXC:ASTERUSDT' },
            arbitrum: { symbol: 'ARB', name: this.currentLanguage === 'fa' ? 'آربیتروم' : 'Arbitrum', coingeckoId: 'arbitrum', coinpaprikaId: 'arb-arbitrum', tradingViewSymbol: 'KUCOIN:ARBUSDT' },
            'pancakeswap-token': { symbol: 'CAKE', name: this.currentLanguage === 'fa' ? 'پنکیک سواپ' : 'PancakeSwap', coingeckoId: 'pancakeswap-token', coinpaprikaId: 'cake-pancakeswap', tradingViewSymbol: 'CRYPTO:CAKEUSD' },
            bittensor: { symbol: 'TAO', name: this.currentLanguage === 'fa' ? 'بیتنسور' : 'Bittensor', coingeckoId: 'bittensor', coinpaprikaId: 'tao-bittensor', tradingViewSymbol: 'MEXC:TAOUSDT' },
            'story-2': { symbol: 'IP', name: this.currentLanguage === 'fa' ? 'استوری' : 'Story', coingeckoId: 'story-2', coinpaprikaId: 'ip-story', tradingViewSymbol: 'MEXC:IPUSDT' },
            'binance-staked-sol': { symbol: 'BNSOL', name: this.currentLanguage === 'fa' ? 'بایننس استیکد سول' : 'Binance Staked SOL', coingeckoId: 'binance-staked-sol', coinpaprikaId: 'bnsol-binance-staked-sol', tradingViewSymbol: 'BINANCE:BNSOLUSDT' },
            sky: { symbol: 'SKY', name: this.currentLanguage === 'fa' ? 'اسکای' : 'Sky', coingeckoId: 'sky', coinpaprikaId: 'sky-sky', tradingViewSymbol: 'OKX:SKYUSDT' },
            'official-trump': { symbol: 'TRUMP', name: this.currentLanguage === 'fa' ? 'آفیشال ترامپ' : 'Official Trump', coingeckoId: 'official-trump', coinpaprikaId: 'trump-official-trump', tradingViewSymbol: 'MEXC:TRUMPUSDT' },
            sushi: { symbol: 'SUSHI', name: this.currentLanguage === 'fa' ? 'سوشی' : 'Sushi', coingeckoId: 'sushi', coinpaprikaId: 'sushi-sushi', tradingViewSymbol: 'BINANCE:SUSHIUSDT' },
            harmony: { symbol: 'ONE', name: this.currentLanguage === 'fa' ? 'هارمونی' : 'Harmony', coingeckoId: 'harmony', coinpaprikaId: 'one-harmony', tradingViewSymbol: 'BINANCE:ONEUSDT' },
            bonk: { symbol: 'BONK', name: this.currentLanguage === 'fa' ? 'بونک' : 'Bonk', coingeckoId: 'bonk', coinpaprikaId: 'bonk-bonk', tradingViewSymbol: 'BINANCE:BONKUSDT' },
            neo: { symbol: 'NEO', name: this.currentLanguage === 'fa' ? 'نئو' : 'NEO', coingeckoId: 'neo', coinpaprikaId: 'neo-neo', tradingViewSymbol: 'BINANCE:NEOUSDT' },
            plasma: { symbol: 'XPL', name: this.currentLanguage === 'fa' ? 'پلاسما' : 'Plasma', coingeckoId: 'plasma', coinpaprikaId: 'xpl-plasma', tradingViewSymbol: 'MEXC:XPLUSDT' },
            'pudgy-penguins': { symbol: 'PENGU', name: this.currentLanguage === 'fa' ? 'پاجی پنگوئن' : 'Pudgy Penguins', coingeckoId: 'pudgy-penguins', coinpaprikaId: 'pengu-pudgy-penguins', tradingViewSymbol: 'MEXC:PENGUUSDT' },
            jasmycoin: { symbol: 'JASMY', name: this.currentLanguage === 'fa' ? 'جسمی کوین' : 'JasmyCoin', coingeckoId: 'jasmycoin', coinpaprikaId: 'jasmy-jasmycoin', tradingViewSymbol: 'BINANCE:JASMYUSDT' },
            'cheems-token': { symbol: 'CHEEMS', name: this.currentLanguage === 'fa' ? 'چیمز' : 'Cheems Token', coingeckoId: 'cheems-token', coinpaprikaId: 'cheems-cheems-cheemspet', tradingViewSymbol: 'MEXC:CHEEMSUSDT' },
            linea: { symbol: 'LINEA', name: this.currentLanguage === 'fa' ? 'لینیا' : 'Linea', coingeckoId: 'linea', coinpaprikaId: 'linea-linea', tradingViewSymbol: 'BINANCE:LINEAUSDT' },
            mitosis: { symbol: 'MITO', name: this.currentLanguage === 'fa' ? 'میتوسیس' : 'Mitosis', coingeckoId: 'mitosis', coinpaprikaId: 'mito-mitosis', tradingViewSymbol: 'BINANCE:MITOUSDT' },
            'pyth-network': { symbol: 'PYTH', name: this.currentLanguage === 'fa' ? 'پایت نتورک' : 'Pyth Network', coingeckoId: 'pyth-network', coinpaprikaId: 'pyth-pyth-network', tradingViewSymbol: 'BINANCE:PYTHUSDT' },
            starknet: { symbol: 'STRK', name: this.currentLanguage === 'fa' ? 'استارک نت' : 'Starknet', coingeckoId: 'starknet', coinpaprikaId: 'strk-starknet', tradingViewSymbol: 'BINANCE:STRKUSDT' },
            avantis: { symbol: 'AVNT', name: this.currentLanguage === 'fa' ? 'آوانتیس' : 'Avantis', coingeckoId: 'avantis', coinpaprikaId: 'avantis', tradingViewSymbol: 'OKX:AVNTUSDT' },
            'smooth-love-potion': { symbol: 'SLP', name: this.currentLanguage === 'fa' ? 'اسموت لاو پوشن' : 'Smooth Love Potion', coingeckoId: 'smooth-love-potion', coinpaprikaId: 'slp-smooth-love-potion', tradingViewSymbol: 'OKX:SLPUSDT' },
            fasttoken: { symbol: 'FTN', name: this.currentLanguage === 'fa' ? 'فست توکن' : 'Fasttoken', coingeckoId: 'fasttoken', coinpaprikaId: 'ftn-fasttoken', tradingViewSymbol: 'MEXC:FTNUSDT' },
            dash: { symbol: 'DASH', name: this.currentLanguage === 'fa' ? 'دش' : 'Dash', coingeckoId: 'dash', coinpaprikaId: 'dash-dash', tradingViewSymbol: 'BINANCE:DASHUSDT' },
            'reserve-rights-token': { symbol: 'RSR', name: this.currentLanguage === 'fa' ? 'ریورس رایت' : 'Reserve Rights', coingeckoId: 'reserve-rights-token', coinpaprikaId: 'rsr-reserve-rights', tradingViewSymbol: 'KUCOIN:RSRUSDT' },
            digibyte: { symbol: 'DGB', name: this.currentLanguage === 'fa' ? 'دیجی بایت' : 'DigiByte', coingeckoId: 'digibyte', coinpaprikaId: 'dgb-digibyte', tradingViewSymbol: 'KUCOIN:DGBUSDT' },
            audius: { symbol: 'AUDIO', name: this.currentLanguage === 'fa' ? 'آدیوس' : 'Audius', coingeckoId: 'audius', coinpaprikaId: 'audio-audius', tradingViewSymbol: 'KUCOIN:AUDIOUSDT' },
            'x-empire': { symbol: 'X', name: this.currentLanguage === 'fa' ? 'ایکس امپایر' : 'X Empire', coingeckoId: 'x-empire', coinpaprikaId: 'x-x-empire', tradingViewSymbol: 'KUCOIN:XUSDT' },
            kava: { symbol: 'KAVA', name: this.currentLanguage === 'fa' ? 'کاوا' : 'Kava', coingeckoId: 'kava', coinpaprikaId: 'kava-kava', tradingViewSymbol: 'BINANCE:KAVAUSDT' },
            stepn: { symbol: 'GMT', name: this.currentLanguage === 'fa' ? 'استپن' : 'Stepn', coingeckoId: 'stepn', coinpaprikaId: 'gmt-gmt', tradingViewSymbol: 'OKX:GMTUSDT' },
            dogwifhat: { symbol: 'WIF', name: this.currentLanguage === 'fa' ? 'داگ ویف هت' : 'dogwifhat', coingeckoId: 'dogwifhat', coinpaprikaId: 'wif-dogwifhat', tradingViewSymbol: 'OKX:WIFUSDT' },
            'sei-network': { symbol: 'SEI', name: this.currentLanguage === 'fa' ? 'سی نتورک' : 'Sei', coingeckoId: 'sei-network', coinpaprikaId: 'sei-sei', tradingViewSymbol: 'BINANCE:SEIUSDT' },
            syrup: { symbol: 'SYRUP', name: this.currentLanguage === 'fa' ? 'سیراپ' : 'Syrup', coingeckoId: 'syrup', coinpaprikaId: 'syrup-syrup-token', tradingViewSymbol: 'BINANCE:SYRUPUSDT' },
            altlayer: { symbol: 'ALT', name: this.currentLanguage === 'fa' ? 'آلت لیر' : 'AltLayer', coingeckoId: 'altlayer', coinpaprikaId: 'alt-altlayer', tradingViewSymbol: 'KUCOIN:KALTUSDT' },
            mantle: { symbol: 'MNT', name: this.currentLanguage === 'fa' ? 'منتل' : 'Mantle', coingeckoId: 'mantle', coinpaprikaId: 'mnt-mantle', tradingViewSymbol: 'BYBIT:MNTUSDT' },
            kaspa: { symbol: 'KAS', name: this.currentLanguage === 'fa' ? 'کسپا' : 'Kaspa', coingeckoId: 'kaspa', coinpaprikaId: 'kas-kaspa', tradingViewSymbol: 'MEXC:KASUSDT' },
            'flare-networks': { symbol: 'FLR', name: this.currentLanguage === 'fa' ? 'فلر' : 'Flare', coingeckoId: 'flare-networks', coinpaprikaId: 'flr-flare-network', tradingViewSymbol: 'OKX:FLRUSDT' },
            'gatechain-token': { symbol: 'GT', name: this.currentLanguage === 'fa' ? 'گیت توکن' : 'Gate', coingeckoId: 'gatechain-token', coinpaprikaId: 'gt-gatetoken', tradingViewSymbol: 'GATE:GTUSDT' },
            'sun-token': { symbol: 'SUN', name: this.currentLanguage === 'fa' ? 'سان توکن' : 'Sun Token', coingeckoId: 'sun-token', coinpaprikaId: 'sun-sun', tradingViewSymbol: 'BINANCE:SUNUSDT' },
            'gas': { symbol: 'GAS', name: this.currentLanguage === 'fa' ? 'گس' : 'Gas', coingeckoId: 'gas', coinpaprikaId: 'gas-gas', tradingViewSymbol: 'OKX:GASUSDT' },
            'helium': { symbol: 'HNT', name: this.currentLanguage === 'fa' ? 'هلیوم' : 'Helium', coingeckoId: 'helium', coinpaprikaId: 'hnt-helium', tradingViewSymbol: 'POLONIEX:HNTUSDT' },
            'coredaoorg': { symbol: 'CORE', name: this.currentLanguage === 'fa' ? 'کور' : 'Core', coingeckoId: 'coredaoorg', coinpaprikaId: 'core-core-dao', tradingViewSymbol: 'OKX:COREUSDT' },
            'mocaverse': { symbol: 'MOCA', name: this.currentLanguage === 'fa' ? 'موکا' : 'Moca Network', coingeckoId: 'mocaverse', coinpaprikaId: 'moca-moca', tradingViewSymbol: 'KUCOIN:MOCAUSDT' },
            'alphabet-xstock': { symbol: 'GOOGLX', name: this.currentLanguage === 'fa' ? 'گوگل استاک' : 'Alphabet xStock', coingeckoId: 'alphabet-xstock', coinpaprikaId: 'googlx-alphabet-tokenized-stock-xstock', tradingViewSymbol: 'BYBIT:GOOGLXUSDT' },
            'nvidia-xstock': { symbol: 'NVDAX', name: this.currentLanguage === 'fa' ? 'انویدیا استاک' : 'NVIDIA xStock', coingeckoId: 'nvidia-xstock', coinpaprikaId: 'nvdax-nvidia-tokenized-stock-xstock', tradingViewSymbol: 'CRYPTO:NVDAXUSD' },
            'apple-xstock': { symbol: 'AAPLX', name: this.currentLanguage === 'fa' ? 'اپل استاک' : 'Apple xStock', coingeckoId: 'apple-xstock', coinpaprikaId: 'aaplx-apple-tokenized-stock-xstock', tradingViewSymbol: 'MEXC:AAPLXUSDT' },
            'tesla-xstock': { symbol: 'TSLAX', name: this.currentLanguage === 'fa' ? 'تسلا استاک' : 'Tesla xStock', coingeckoId: 'tesla-xstock', coinpaprikaId: 'tslax-tesla-tokenized-stock-xstock', tradingViewSymbol: 'MEXC:TSLAXUSDT' },
            'circle-xstock': { symbol: 'CRCLX', name: this.currentLanguage === 'fa' ? 'سیرکل استاک' : 'Circle xStock', coingeckoId: 'circle-xstock', coinpaprikaId: 'crclx-circle-tokenized-stock-xstock', tradingViewSymbol: 'BYBIT:CRCLXUSDT' },
            'microstrategy-xstock': { symbol: 'MSTRX', name: this.currentLanguage === 'fa' ? 'میکرواستراتژی استاک' : 'MicroStrategy xStock', coingeckoId: 'microstrategy-xstock', coinpaprikaId: 'mstrx-microstrategy-tokenized-stock-xstock', tradingViewSymbol: 'GATEIO:MSTRXUSDT' },
            'sp500-xstock': { symbol: 'SPYX', name: this.currentLanguage === 'fa' ? 'اس پی 500 استاک' : 'SP500 xStock', coingeckoId: 'sp500-xstock', coinpaprikaId: 'spyx-sp500-tokenized-stock-xstock', tradingViewSymbol: 'GATEIO:SPYXUSDT' },
            'meta-xstock': { symbol: 'METAX', name: this.currentLanguage === 'fa' ? 'متا استاک' : 'Meta xStock', coingeckoId: 'meta-xstock', coinpaprikaId: 'metax-meta-tokenized-stock-xstock', tradingViewSymbol: 'GATEIO:METAXUSDT' },
            'cisco-xstock': { symbol: 'CSCOX', name: this.currentLanguage === 'fa' ? 'سیسکو استاک' : 'Cisco xStock', coingeckoId: 'cisco-xstock', coinpaprikaId: 'cscox-cisco-tokenized-stock-xstock', tradingViewSymbol: 'GATEIO:CSCOXUSDT' },
            'broadcom-xstock': { symbol: 'AVGOX', name: this.currentLanguage === 'fa' ? 'برادکام استاک' : 'Broadcom xStock', coingeckoId: 'broadcom-xstock', coinpaprikaId: 'avgox-broadcom-tokenized-stock-xstock', tradingViewSymbol: 'GATEIO:AVGOXUSDT' },
            'crowdstrike-xstock': { symbol: 'CRWDX', name: this.currentLanguage === 'fa' ? 'کراوداسترایک استاک' : 'CrowdStrike xStock', coingeckoId: 'crowdstrike-xstock', coinpaprikaId: 'crwdx-crowdstrike-tokenized-stock-xstock', tradingViewSymbol: 'GATEIO:CRWDXUSDT' },
            'amazon-xstock': { symbol: 'AMZNX', name: this.currentLanguage === 'fa' ? 'آمازون استاک' : 'Amazon xStock', coingeckoId: 'amazon-xstock', coinpaprikaId: 'amznx-amazon-tokenized-stock-xstock', tradingViewSymbol: 'GATEIO:AMZNXUSDT' },
        };

        this.cryptoInfo = cryptoInfoDatabase[this.selectedCrypto] || cryptoInfoDatabase.bitcoin;
        console.log('Selected crypto info:', this.cryptoInfo);
    }

    // 🔄 دریافت داده‌های لحظه‌ای (اصلاح شده با اولویت بایننس)
    async fetchRealTimeData() {
        try {
            // 🥇 اولویت ۱: بایننس
            try {
                const binanceData = await this.fetchFromBinance();
                this.cryptoData = { ...this.cryptoData, ...binanceData };
                this.cryptoData.historicalData = await this.fetchHistoricalDataFromBinance();
                console.log('Real-time data fetched from Binance:', this.cryptoData);
                return;
            } catch (binanceError) {
                console.warn('Binance API failed, trying CoinGecko...', binanceError);
            }

            // 🥈 اولویت ۲: کوین‌گکو
            try {
                const geckoData = await this.fetchFromCoinGecko();
                this.cryptoData = { ...this.cryptoData, ...geckoData };
                this.cryptoData.historicalData = await this.fetchHistoricalDataFromCoinGecko();
                console.log('Real-time data fetched from CoinGecko:', this.cryptoData);
                return;
            } catch (geckoError) {
                console.warn('CoinGecko API failed, trying CoinPaprika...', geckoError);
            }

            // 🥉 اولویت ۳: کوین‌پاپریکا (بدون تاریخچه، فقط قیمت)
            try {
                const paprikaData = await this.fetchFromCoinPaprika();
                this.cryptoData = { ...this.cryptoData, ...paprikaData };
                this.cryptoData.historicalData = []; // تاریخچه نداریم
                console.log('Real-time data fetched from CoinPaprika (Price Only):', this.cryptoData);
                return;
            } catch (paprikaError) {
                 console.warn('CoinPaprika API failed too.', paprikaError);
            }

            // اگر به اینجا رسیدیم یعنی هر ۳ منبع شکست خورده‌اند
            throw new Error('All data sources failed');

        } catch (error) {
            console.error('Error fetching real-time data:', error);
            throw new Error(this.currentLanguage === 'fa' ? 'خطا در دریافت قیمت لحظه‌ای از تمام منابع' : 'Error fetching real-time price from all sources');
        }
    }

    // تابع جدید: دریافت از بایننس
    async fetchFromBinance() {
        // استخراج نماد بایننس از tradingViewSymbol (مثلاً BINANCE:BTCUSDT -> BTCUSDT)
        let symbol = this.cryptoInfo.tradingViewSymbol.replace('BINANCE:', '').replace('USDT', 'USDT'); 
        // اگر نماد USDT نداشت (برای اطمینان)
        if (!symbol.endsWith('USDT') && !symbol.endsWith('USD')) {
            symbol += 'USDT';
        }

        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        if (!response.ok) throw new Error('Binance API Error');
        
        const data = await response.json();
        
        // دریافت تاریخچه برای محاسبه تغییرات دقیق‌تر اگر نیاز بود، اما تیکر 24 ساعته کافی است
        return {
            price: parseFloat(data.lastPrice),
            priceChange24h: parseFloat(data.priceChangePercent),
            volume24h: parseFloat(data.quoteVolume), // حجم به تتر
            marketCap: null, // بایننس مارکت کپ را مستقیم نمی‌دهد، در صورت نیاز از کوین‌گکو پر می‌شود
            high24h: parseFloat(data.highPrice),
            low24h: parseFloat(data.lowPrice),
            lastUpdated: Date.now()
        };
    }

    // اصلاح شده: دریافت از کوین‌گکو بدون داده فیک
    async fetchFromCoinGecko() {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${this.cryptoInfo.coingeckoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
        if (!response.ok) throw new Error('CoinGecko API Error');
        
        const data = await response.json();
        const coinData = data[this.cryptoInfo.coingeckoId];
        
        if (!coinData) throw new Error('Currency data not found in CoinGecko');

        return {
            price: coinData.usd,
            priceChange24h: coinData.usd_24h_change,
            volume24h: coinData.usd_24h_vol,
            marketCap: coinData.usd_market_cap,
            lastUpdated: Date.now()
        };
    }


    // تابع جدید برای دریافت داده‌ها از CoinPaprika (با مدیریت خطا)
    async fetchFromCoinPaprika() {
        try {
            // دریافت داده‌های لحظه‌ای از CoinPaprika API
            const response = await fetch(`https://api.coinpaprika.com/v1/tickers/${this.cryptoInfo.coinpaprikaId}`);
            
            if (!response.ok) {
                throw new Error('خطا در دریافت داده‌ها از CoinPaprika');
            }

            const data = await response.json();
            
            // دریافت داده‌های صرافی‌ها
            let exchangeData = [];
            try {
                const exchangeResponse = await fetch(`https://api.coinpaprika.com/v1/coins/${this.cryptoInfo.coinpaprikaId}/exchanges`);
                if (exchangeResponse.ok) {
                    const exchanges = await exchangeResponse.json();
                    exchangeData = exchanges.slice(0, 10).map(exchange => ({
                        name: exchange.name,
                        pair: exchange.pair,
                        volume: exchange.quotes.USD.volume_24h,
                        price: exchange.quotes.USD.price
                    }));
                }
            } catch (exchangeError) {
                console.warn('Could not fetch exchange data from CoinPaprika:', exchangeError.message);
            }

            return {
                exchangeData: exchangeData,
                circulatingSupply: data.circulating_supply,
                maxSupply: data.max_supply
            };

        } catch (error) {
            console.error('Error fetching from CoinPaprika:', error);
            throw error;
        }
    }

    // تابع جدید برای دریافت داده‌های تاریخی از CoinGecko
    // 🔄 دریافت داده‌های تاریخی (کندل‌ها) برای تحلیل تکنیکال
    async fetchHistoricalData() {
        // تلاش برای دریافت از بایننس (کندل‌های دقیق)
        try {
            return await this.fetchHistoricalDataFromBinance();
        } catch (error) {
            console.warn('Binance OHLC failed, trying CoinGecko...', error);
            // تلاش برای کوین‌گکو
            return await this.fetchHistoricalDataFromCoinGecko();
        }
    }

    // تابع جدید: دریافت کندل‌ها از بایننس
    async fetchHistoricalDataFromBinance() {
        let symbol = this.cryptoInfo.tradingViewSymbol.replace('BINANCE:', '');
        if (!symbol.endsWith('USDT')) symbol += 'USDT';

        // دریافت 365 کندل روزانه
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=365`);
        if (!response.ok) throw new Error('Binance OHLC Error');

        const data = await response.json();
        
        // فرمت کردن داده‌ها به ساختار مورد نیاز برنامه
        return data.map(d => ({
            date: new Date(d[0]),
            dateString: new Date(d[0]).toISOString().split('T')[0],
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5])
        }));
    }

    // تابع قدیمی کوین‌گکو (فقط کمی تمیز شده)
    async fetchHistoricalDataFromCoinGecko() {
        const days = 365;
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${this.cryptoInfo.coingeckoId}/ohlc?vs_currency=usd&days=${days}`);
        if (!response.ok) throw new Error('CoinGecko OHLC Error');

        const data = await response.json();
        // مپ کردن داده‌های کوین‌گکو (Time, Open, High, Low, Close) - حجم ندارد در این اندپوینت
        // برای حجم باید یک درخواست جدا زد که اینجا برای سادگی و سرعت نادیده می‌گیریم یا از بایننس استفاده می‌کنیم
        // اما چون بایننس اولویت است، این فقط فال‌بک است.
        return data.map(item => ({
            date: new Date(item[0]),
            dateString: new Date(item[0]).toISOString().split('T')[0],
            open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
            volume: 0 // کوین‌گکو در اندپوینت رایگان OHLC حجم نمی‌دهد
        }));
    }

    async calculateTechnicalIndicators() {
        // اطمینان از وجود داده‌های تاریخی
        if (!this.cryptoData.historicalData || this.cryptoData.historicalData.length < 2) {
            console.error('No historical data available for technical indicators.');
            throw new Error(this.currentLanguage === 'fa' ? 
                'داده‌های تاریخی برای محاسبه شاخص‌ها موجود نیست.' : 
                'Historical data not available for calculating indicators.');
        }
        
        const closes = this.cryptoData.historicalData.map(d => d.close);
        const volumes = this.cryptoData.historicalData.map(d => d.volume || 0);
        const highs = this.cryptoData.historicalData.map(d => d.high);
        const lows = this.cryptoData.historicalData.map(d => d.low);
        const opens = this.cryptoData.historicalData.map(d => d.open);
        
        // محاسبه اندیکاتورهای اصلی
        const atrResult = this.calculateATR(highs, lows, closes, 14); // ATR جدید که شامل TR و ATR هموار شده است

        this.cryptoData.technicalIndicators = {
            rsi: this.calculateRSI(closes),
            macd: this.calculateMACD(closes),
            sma20: this.calculateSMA(closes, 20),
            sma50: this.calculateSMA(closes, 50),
            sma200: this.calculateSMA(closes, 200),
            ema12: this.calculateEMA(closes, 12),
            ema26: this.calculateEMA(closes, 26),
            bollingerBands: this.calculateBollingerBands(closes),
            stochastic: this.calculateStochastic(highs, lows, closes),
            adx: this.calculateADX(highs, lows, closes, 14, atrResult.smoothedTR), // ADX جدید
            atr: atrResult.atr, // ATR جدید
            obv: this.calculateOBV(closes, volumes),
            vwap: this.calculateVWAP(closes, volumes),
            ichimoku: this.calculateIchimoku(highs, lows, closes),
            fibonacci: this.calculateFibonacciRetracement(closes),
            volumeProfile: this.calculateVolumeProfile(closes, volumes)
        };

        // محاسبه سطوح حمایت و مقاومت با تفکیک زمانی
        this.cryptoData.supportLevelsShort = this.calculateSupportLevels(closes, 'short');
        this.cryptoData.resistanceLevelsShort = this.calculateResistanceLevels(closes, 'short');
        this.cryptoData.supportLevelsLong = this.calculateSupportLevels(closes, 'long');
        this.cryptoData.resistanceLevelsLong = this.calculateResistanceLevels(closes, 'long');

        console.log('Technical indicators calculated:', this.cryptoData.technicalIndicators);
    }

    // تابع جدید برای محاسبه باندهای بولینگر
    calculateBollingerBands(prices, period = 20, stdDev = 2) {
        if (prices.length < period) return { upper: 0, middle: 0, lower: 0 };

        const middle = this.calculateSMA(prices, period);
        const recentPrices = prices.slice(-period);
        
        // محاسبه انحراف معیار
        const variance = recentPrices.reduce((sum, price) => {
            return sum + Math.pow(price - middle, 2);
        }, 0) / period;
        
        const standardDeviation = Math.sqrt(variance);
        
        return {
            upper: this.formatCalculationNumber(middle + (standardDeviation * stdDev)),
            middle: this.formatCalculationNumber(middle),
            lower: this.formatCalculationNumber(middle - (standardDeviation * stdDev)),
            bandwidth: this.formatCalculationNumber((standardDeviation * 2 * stdDev) / middle * 100)
        };
    }

    // تابع جدید برای محاسبه استوکاستیک
    calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
        if (closes.length < kPeriod) return { k: 50, d: 50 };

        let kValues = [];

        // محاسبه K% برای دوره dPeriod + kPeriod
        for (let i = closes.length - kPeriod - dPeriod + 1; i < closes.length; i++) {
            if (i < kPeriod - 1) {
                kValues.push(50); // مقدار اولیه تا داده کافی جمع شود
                continue;
            }
            
            const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
            const periodLows = lows.slice(i - kPeriod + 1, i + 1);
            const currentClose = closes[i];
            
            const highestHigh = Math.max(...periodHighs);
            const lowestLow = Math.min(...periodLows);
            
            const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
            kValues.push(k);
        }
        
        const lastK = kValues.length > 0 ? kValues[kValues.length - 1] : 50;

        // محاسبه D% (SMA از K%)
        const kForDSMA = kValues.slice(-dPeriod);
        const d = kForDSMA.reduce((sum, val) => sum + val, 0) / kForDSMA.length;
        
        return {
            k: this.formatCalculationNumber(lastK),
            d: this.formatCalculationNumber(d)
        };
    }

    // تابع جدید برای محاسبه شاخص جهت‌گیری میانگین (ADX)
    calculateADX(highs, lows, closes, period = 14, smoothedTR) {
        if (closes.length < period * 2 || !smoothedTR || smoothedTR.length === 0) return 0; // نیاز به داده‌های کافی

        let plusDM = [];
        let minusDM = [];

        // محاسبه +DM و -DM
        for (let i = 1; i < highs.length; i++) {
            const upMove = highs[i] - highs[i - 1];
            const downMove = lows[i - 1] - lows[i];
            
            plusDM.push((upMove > downMove && upMove > 0) ? upMove : 0);
            minusDM.push((downMove > upMove && downMove > 0) ? downMove : 0);
        }
        
        // هموارسازی +DM و -DM
        // ما به داده‌های هموار شده از همان نقطه‌ای که smoothedTR شروع شده نیاز داریم
        const offset = closes.length - smoothedTR.length;
        const smoothedPlusDM = this.smoothWilder(plusDM.slice(offset), period);
        const smoothedMinusDM = this.smoothWilder(minusDM.slice(offset), period);

        if (smoothedPlusDM.length === 0 || smoothedMinusDM.length === 0) return 0;

        // محاسبه +DI و -DI
        let plusDI = [];
        let minusDI = [];
        let dxValues = [];

        for (let i = 0; i < smoothedTR.length; i++) {
            if (i >= smoothedPlusDM.length) break; // اطمینان از هم‌اندازه بودن آرایه‌ها

            const tr = smoothedTR[i];
            const pDI = (tr > 0) ? (smoothedPlusDM[i] / tr) * 100 : 0;
            const mDI = (tr > 0) ? (smoothedMinusDM[i] / tr) * 100 : 0;
            
            plusDI.push(pDI);
            minusDI.push(mDI);
            
            // محاسبه DX
            const diSum = pDI + mDI;
            const diDiff = Math.abs(pDI - mDI);
            const dx = (diSum > 0) ? (diDiff / diSum) * 100 : 0;
            dxValues.push(dx);
        }

        // هموارسازی DX برای بدست آوردن ADX
        const adxValues = this.smoothWilder(dxValues, period);
        const lastADX = adxValues.length > 0 ? adxValues[adxValues.length - 1] : 0;

        return this.formatCalculationNumber(lastADX);
    }

    // تابع جدید برای محاسبه میانگین واقعی دامنه (ATR)
    calculateATR(highs, lows, closes, period = 14) {
        if (closes.length < period + 1) return { tr: [], smoothedTR: [], atr: 0 };

        let trValues = [];
        for (let i = 1; i < closes.length; i++) {
            const highLow = highs[i] - lows[i];
            const highClose = Math.abs(highs[i] - closes[i - 1]);
            const lowClose = Math.abs(lows[i] - closes[i - 1]);
            trValues.push(Math.max(highLow, highClose, lowClose));
        }

        // محاسبه ATR هموار شده
        const smoothedTR = this.smoothWilder(trValues, period);
        const lastATR = smoothedTR.length > 0 ? smoothedTR[smoothedTR.length - 1] : 0;
        
        return {
            tr: trValues, // True Range خام
            smoothedTR: smoothedTR, // TR هموار شده (برای ADX لازم است)
            atr: this.formatCalculationNumber(lastATR) // مقدار نهایی ATR
        };
    }

    // تابع کمکی برای هموارسازی Wilder (مورد نیاز برای ATR و ADX)
    smoothWilder(data, period) {
        if (data.length < period) return [];
        
        let smoothed = [];
        let sum = 0;
        
        // محاسبه SMA برای اولین مقدار
        for (let i = 0; i < period; i++) {
            sum += data[i];
        }
        smoothed.push(sum / period);
        
        // محاسبه هموار شده برای بقیه
        for (let i = period; i < data.length; i++) {
            const prevSmoothed = smoothed[smoothed.length - 1];
            const currentSmoothed = (prevSmoothed * (period - 1) + data[i]) / period;
            smoothed.push(currentSmoothed);
        }
        
        return smoothed;
    }

    // تابع جدید برای محاسبه حجم تعادل (OBV)
    calculateOBV(closes, volumes) {
        if (closes.length < 2 || volumes.length < 2) return 0;

        let obv = 0;
        
        // محاسبه برای دوره اخیر
        for (let i = 1; i < closes.length; i++) {
            if (closes[i] > closes[i - 1]) {
                obv += volumes[i] || 0;
            } else if (closes[i] < closes[i - 1]) {
                obv -= volumes[i] || 0;
            }
            // اگر قیمت مساوی باشد، OBV تغییر نمی‌کند
        }
        
        return this.formatCalculationNumber(obv);
    }

    // تابع جدید برای محاسبه میانگین وزنی حجم (VWAP)
    calculateVWAP(prices, volumes) {
        if (prices.length === 0 || volumes.length === 0) return 0;

        let totalValue = 0;
        let totalVolume = 0;
        
        for (let i = 0; i < prices.length; i++) {
            totalValue += prices[i] * (volumes[i] || 0);
            totalVolume += volumes[i] || 0;
        }
        
        return totalVolume > 0 ? this.formatCalculationNumber(totalValue / totalVolume) : 0;
    }

    // تابع جدید برای محاسبه ابر ایچیموکو
    calculateIchimoku(highs, lows, closes, conversionPeriod = 9, basePeriod = 26, laggingSpanPeriod = 52, displacement = 26) {
        if (closes.length < laggingSpanPeriod) {
            return {
                conversionLine: 0,
                baseLine: 0,
                leadingSpanA: 0,
                leadingSpanB: 0,
                laggingSpan: 0
            };
        }

        // محاسبه خط تبدیل (Tenkan-sen)
        const conversionHighs = highs.slice(-conversionPeriod);
        const conversionLows = lows.slice(-conversionPeriod);
        const conversionLine = (Math.max(...conversionHighs) + Math.min(...conversionLows)) / 2;
        
        // محاسبه خط پایه (Kijun-sen)
        const baseHighs = highs.slice(-basePeriod);
        const baseLows = lows.slice(-basePeriod);
        const baseLine = (Math.max(...baseHighs) + Math.min(...baseLows)) / 2;
        
        // محاسبه پیشرو A (Senkou Span A)
        const leadingSpanA = (conversionLine + baseLine) / 2;
        
        // محاسبه پیشرو B (Senkou Span B)
        // برای محاسبه Span B، ما به 52 کندل *قبل* از 26 کندل آینده نیاز داریم
        // اما برای سادگی، Span B فعلی را بر اساس 52 کندل اخیر محاسبه می‌کنیم.
        const laggingHighs = highs.slice(-laggingSpanPeriod);
        const laggingLows = lows.slice(-laggingSpanPeriod);
        const leadingSpanB = (Math.max(...laggingHighs) + Math.min(...laggingLows)) / 2;
        
        // محاسبه تأخیری (Chikou Span)
        // <<<---- اصلاح باگ در این خط ---->>>
        // Chikou Span (Lagging Span) قیمت بسته شدن *فعلی* است
        const laggingSpan = closes[closes.length - 1]; 
        
        return {
            conversionLine: this.formatCalculationNumber(conversionLine),
            baseLine: this.formatCalculationNumber(baseLine),
            leadingSpanA: this.formatCalculationNumber(leadingSpanA), // این مقدار باید 26 دوره در آینده رسم شود
            leadingSpanB: this.formatCalculationNumber(leadingSpanB), // این مقدار باید 26 دوره در آینده رسم شود
            laggingSpan: this.formatCalculationNumber(laggingSpan) // این مقدار باید 26 دوره در گذشته رسم شود
        };
    }

    // تابع جدید برای محاسبه سطوح بازگشت فیبوناچی
    calculateFibonacciRetracement(prices) {
        if (prices.length < 2) return { high: 0, low: 0, levels: [] };

        const recentPrices = prices.slice(-100); // استفاده از 100 قیمت اخیر
        const high = Math.max(...recentPrices);
        const low = Math.min(...recentPrices);
        const diff = high - low;
        
        // سطوح استاندارد فیبوناچی
        const fibonacciLevels = [
            { level: 0, price: high },
            { level: 0.236, price: high - (diff * 0.236) },
            { level: 0.382, price: high - (diff * 0.382) },
            { level: 0.5, price: high - (diff * 0.5) },
            { level: 0.618, price: high - (diff * 0.618) },
            { level: 0.786, price: high - (diff * 0.786) },
            { level: 1, price: low }
        ];
        
        return {
            high: this.formatCalculationNumber(high),
            low: this.formatCalculationNumber(low),
            levels: fibonacciLevels.map(item => ({
                level: item.level,
                price: this.formatCalculationNumber(item.price)
            }))
        };
    }

    // تابع جدید برای محاسبه پروفایل حجم
    calculateVolumeProfile(prices, volumes, bins = 20) {
        if (prices.length === 0 || volumes.length === 0) return { levels: [], poc: 0, vah: 0, val: 0 };

        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const binSize = (high - low) / bins;
        
        // ایجاد سطوح قیمت
        const priceLevels = [];
        for (let i = 0; i < bins; i++) {
            const levelLow = low + (i * binSize);
            const levelHigh = low + ((i + 1) * binSize);
            const levelPrice = (levelLow + levelHigh) / 2;
            
            let totalVolume = 0;
            
            // محاسبه حجم در این سطح قیمت
            for (let j = 0; j < prices.length; j++) {
                if (prices[j] >= levelLow && prices[j] <= levelHigh) {
                    totalVolume += volumes[j] || 0;
                }
            }
            
            priceLevels.push({
                price: this.formatCalculationNumber(levelPrice),
                volume: totalVolume
            });
        }
        
        // مرتب‌سازی سطوح بر اساس حجم
        priceLevels.sort((a, b) => b.volume - a.volume);
        
        // پیدا کردن Point of Control (POC) - سطح با بیشترین حجم
        const poc = priceLevels.length > 0 ? priceLevels[0].price : 0;
        
        // محاسبه Value Area High (VAH) و Value Area Low (VAL)
        // 70% از کل حجم در Value Area قرار دارد
        const totalVolume = priceLevels.reduce((sum, level) => sum + level.volume, 0);
        const targetVolume = totalVolume * 0.7;
        
        let accumulatedVolume = 0;
        let vah = 0;
        let val = 0;
        
        // شروع از POC و اضافه کردن سطوح به ترتیب حجم
        for (const level of priceLevels) {
            accumulatedVolume += level.volume;
            
            if (vah === 0) {
                vah = level.price;
            }
            
            val = level.price;
            
            if (accumulatedVolume >= targetVolume) {
                break;
            }
        }
        
        return {
            levels: priceLevels,
            poc: poc,
            vah: vah,
            val: val
        };
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

    // جایگزین توابع calculateSupportLevels و calculateResistanceLevels
    calculateSupportLevels(prices, timeframe = 'short') {
        const currentPrice = prices[prices.length - 1];
        const supportLevels = [];
        
        // تعیین دوره زمانی بر اساس نوع تحلیل
        const period = timeframe === 'short' ? 14 : 50;
        const dataPoints = timeframe === 'short' ? prices.slice(-period) : prices;
        
        // الگوریتم بهبودیافته برای پیدا کردن سطوح حمایت
        for (let i = 2; i < dataPoints.length - 2; i++) {
            // پیدا کردن کف‌های محلی
            if (dataPoints[i] < dataPoints[i - 1] && dataPoints[i] < dataPoints[i + 1] && 
                dataPoints[i] < dataPoints[i - 2] && dataPoints[i] < dataPoints[i + 2]) {
                
                // فقط سطوحی که پایین‌تر از قیمت فعلی هستند
                if (dataPoints[i] < currentPrice) {
                    // بررسی حجم معاملات در این سطح
                    const volumeAtLevel = this.getVolumeAtPriceLevel(dataPoints[i]);
                    supportLevels.push({
                        price: dataPoints[i],
                        strength: this.calculateLevelStrength(dataPoints, i, 'support'),
                        volume: volumeAtLevel,
                        timeframe: timeframe
                    });
                }
            }
        }

        // شناسایی Order Blocks
        const orderBlocks = this.identifyOrderBlocks(dataPoints, 'support');
        orderBlocks.forEach(block => {
            if (block.price < currentPrice) {
                supportLevels.push({
                    price: block.price,
                    strength: block.strength,
                    volume: block.volume,
                    timeframe: timeframe,
                    type: 'orderblock'
                });
            }
        });

        // مرتب‌سازی و حذف سطوح نزدیک به هم
        supportLevels.sort((a, b) => b.price - a.price);
        const filteredLevels = this.filterAndMergeLevels(supportLevels);

        // اگر به اندازه کافی سطح پیدا نشد، از سطوح فیبوناچی استفاده کن
        while (filteredLevels.length < 3) {
            const lastLevel = filteredLevels.length > 0 ? filteredLevels[filteredLevels.length - 1].price : currentPrice;
            filteredLevels.push({
                price: this.formatCalculationNumber(lastLevel * 0.95),
                strength: 0.5,
                volume: 0,
                timeframe: timeframe,
                type: 'fibonacci'
            });
        }

        return filteredLevels.slice(0, 3);
    }

    calculateResistanceLevels(prices, timeframe = 'short') {
        const currentPrice = prices[prices.length - 1];
        const resistanceLevels = [];
        
        // تعیین دوره زمانی بر اساس نوع تحلیل
        const period = timeframe === 'short' ? 14 : 50;
        const dataPoints = timeframe === 'short' ? prices.slice(-period) : prices;
        
        // الگوریتم بهبودیافته برای پیدا کردن سطوح مقاومت
        for (let i = 2; i < dataPoints.length - 2; i++) {
            // پیدا کردن سقف‌های محلی
            if (dataPoints[i] > dataPoints[i - 1] && dataPoints[i] > dataPoints[i + 1] && 
                dataPoints[i] > dataPoints[i - 2] && dataPoints[i] > dataPoints[i + 2]) {
                
                // فقط سطوحی که بالاتر از قیمت فعلی هستند
                if (dataPoints[i] > currentPrice) {
                    // بررسی حجم معاملات در این سطح
                    const volumeAtLevel = this.getVolumeAtPriceLevel(dataPoints[i]);
                    resistanceLevels.push({
                        price: dataPoints[i],
                        strength: this.calculateLevelStrength(dataPoints, i, 'resistance'),
                        volume: volumeAtLevel,
                        timeframe: timeframe
                    });
                }
            }
        }

        // شناسایی Order Blocks
        const orderBlocks = this.identifyOrderBlocks(dataPoints, 'resistance');
        orderBlocks.forEach(block => {
            if (block.price > currentPrice) {
                resistanceLevels.push({
                    price: block.price,
                    strength: block.strength,
                    volume: block.volume,
                    timeframe: timeframe,
                    type: 'orderblock'
                });
            }
        });

        // مرتب‌سازی و حذف سطوح نزدیک به هم
        resistanceLevels.sort((a, b) => a.price - b.price);
        const filteredLevels = this.filterAndMergeLevels(resistanceLevels);

        // اگر به اندازه کافی سطح پیدا نشد، از سطوح فیبوناچی استفاده کن
        while (filteredLevels.length < 3) {
            const lastLevel = filteredLevels.length > 0 ? filteredLevels[filteredLevels.length - 1].price : currentPrice;
            filteredLevels.push({
                price: this.formatCalculationNumber(lastLevel * 1.05),
                strength: 0.5,
                volume: 0,
                timeframe: timeframe,
                type: 'fibonacci'
            });
        }

        return filteredLevels.slice(0, 3);
    }

    identifyOrderBlocks(data, type) {
        const orderBlocks = [];
        
        if (!this.cryptoData.historicalData || this.cryptoData.historicalData.length < 5) {
            return orderBlocks;
        }
        
        const ohlcData = this.cryptoData.historicalData;
        
        // شناسایی شمع‌های صعودی و نزولی قوی
        for (let i = 1; i < ohlcData.length; i++) {
            const currentCandle = ohlcData[i];
            const previousCandle = ohlcData[i - 1];
            
            // محاسبه اندازه بدنه و سایه‌ها
            const bodySize = Math.abs(currentCandle.close - currentCandle.open);
            const upperWick = currentCandle.high - Math.max(currentCandle.open, currentCandle.close);
            const lowerWick = Math.min(currentCandle.open, currentCandle.close) - currentCandle.low;
            const totalWick = upperWick + lowerWick;
            
            // شمع صعودی قوی (بدنه بزرگ و سایه کوچک)
            if (currentCandle.close > currentCandle.open && bodySize > totalWick * 1.5) {
                const bullishCandle = {
                    index: i,
                    low: currentCandle.low,
                    high: currentCandle.high,
                    open: currentCandle.open,
                    close: currentCandle.close,
                    volume: currentCandle.volume || 0,
                    type: 'bullish'
                };
                
                // بررسی اینکه آیا این شمع بخشی از یک حرکت قوی است
                if (i > 0 && previousCandle.close > previousCandle.open) {
                    // دو شمع صعودی پشت سر هم - سیگنال قوی‌تر
                    bullishCandle.strength = 0.8;
                } else {
                    bullishCandle.strength = 0.6;
                }
                
                orderBlocks.push(bullishCandle);
            }
            
            // شمع نزولی قوی
            if (currentCandle.close < currentCandle.open && bodySize > totalWick * 1.5) {
                const bearishCandle = {
                    index: i,
                    low: currentCandle.low,
                    high: currentCandle.high,
                    open: currentCandle.open,
                    close: currentCandle.close,
                    volume: currentCandle.volume || 0,
                    type: 'bearish'
                };
                
                // بررسی اینکه آیا این شمع بخشی از یک حرکت قوی است
                if (i > 0 && previousCandle.close < previousCandle.open) {
                    // دو شمع نزولی پشت سر هم - سیگنال قوی‌تر
                    bearishCandle.strength = 0.8;
                } else {
                    bearishCandle.strength = 0.6;
                }
                
                orderBlocks.push(bearishCandle);
            }
        }
        
        // فیلتر کردن Order Blocks بر اساس نوع (حمایت یا مقاومت)
        let filteredBlocks = [];
        
        if (type === 'support') {
            // Order Block‌های حمایت: پایین آخرین شمع صعودی قوی
            const bullishBlocks = orderBlocks.filter(block => block.type === 'bullish');
            
            if (bullishBlocks.length > 0) {
                // مرتب‌سازی بر اساس شاخص (جدیدترین‌ها اول)
                bullishBlocks.sort((a, b) => b.index - a.index);
                
                // گرفتن چند مورد آخر
                const recentBullishBlocks = bullishBlocks.slice(0, 3);
                
                filteredBlocks = recentBullishBlocks.map(block => ({
                    price: block.low,
                    strength: block.strength,
                    volume: block.volume,
                    index: block.index,
                    type: 'orderblock'
                }));
            }
        } else if (type === 'resistance') {
            // Order Block‌های مقاومت: بالاترین آخرین شمع نزولی قوی
            const bearishBlocks = orderBlocks.filter(block => block.type === 'bearish');
            
            if (bearishBlocks.length > 0) {
                // مرتب‌سازی بر اساس شاخص (جدیدترین‌ها اول)
                bearishBlocks.sort((a, b) => b.index - a.index);
                
                // گرفتن چند مورد آخر
                const recentBearishBlocks = bearishBlocks.slice(0, 3);
                
                filteredBlocks = recentBearishBlocks.map(block => ({
                    price: block.high,
                    strength: block.strength,
                    volume: block.volume,
                    index: block.index,
                    type: 'orderblock'
                }));
            }
        }
        
        return filteredBlocks;
    }

    getVolumeAtPriceLevel(priceLevel) {
        if (!this.cryptoData.historicalData || this.cryptoData.historicalData.length === 0) {
            return 0;
        }
        
        let totalVolume = 0;
        const tolerance = priceLevel * 0.02; // 2% tolerance
        
        this.cryptoData.historicalData.forEach(data => {
            // بررسی اینکه آیا سطح قیمت در محدوده High/Low شمع قرار دارد
            if (data.low <= priceLevel + tolerance && data.high >= priceLevel - tolerance) {
                totalVolume += data.volume || 0;
            }
        });
        
        return totalVolume;
    }

    calculateLevelStrength(data, index, type) {
        let strength = 0;
        const price = data[index];
        const tolerance = price * 0.01; // 1% tolerance
        
        // تعداد دفعاتی که قیمت این سطح را لمس کرده و برگشته است
        let touches = 0;
        let bounces = 0;
        
        for (let i = 0; i < data.length; i++) {
            if (Math.abs(data[i] - price) < tolerance) {
                touches++;
                
                // بررسی اینکه آیا پس از لمس، قیمت برگشته است
                if (i > 0 && i < data.length - 1) {
                    // برای حمایت: قیمت به سطح رسیده و سپس بالا رفته
                    if (type === 'support' && data[i-1] > price && data[i+1] > price) {
                        bounces++;
                    } 
                    // برای مقاومت: قیمت به سطح رسیده و سپس پایین رفته
                    else if (type === 'resistance' && data[i-1] < price && data[i+1] < price) {
                        bounces++;
                    }
                }
            }
        }
        
        // محاسبه قدرت بر اساس تعداد لمس‌ها و برگشت‌ها
        if (touches > 0) {
            strength = (bounces / touches) * 0.7 + (touches / data.length) * 0.3;
        }
        
        // بررسی حجم معاملات در این سطح
        const volumeAtLevel = this.getVolumeAtPriceLevel(price);
        const avgVolume = this.cryptoData.historicalData.reduce((sum, d) => sum + (d.volume || 0), 0) / this.cryptoData.historicalData.length;
        
        if (avgVolume > 0) {
            const volumeFactor = Math.min(volumeAtLevel / avgVolume, 2) / 2; // حداکثر 2 برابر میانگین
            strength = strength * 0.8 + volumeFactor * 0.2; // 20% از قدرت بر اساس حجم
        }
        
        return Math.min(strength, 1); // حداکثر قدرت 1
    }

    // تابع کمکی برای ادغام سطوح نزدیک به هم
    filterAndMergeLevels(levels) {
        const filteredLevels = [];
        
        for (const level of levels) {
            let isClose = false;
            
            for (const existingLevel of filteredLevels) {
                if (Math.abs(level.price - existingLevel.price) / existingLevel.price < 0.02) { // کمتر از 2% فاصله
                    isClose = true;
                    
                    // ادغام سطوح با حفظ قوی‌ترین سطح
                    if (level.strength > existingLevel.strength) {
                        const index = filteredLevels.indexOf(existingLevel);
                        filteredLevels[index] = level;
                    }
                    break;
                }
            }
            
            if (!isClose) {
                filteredLevels.push(level);
            }
        }
        
        return filteredLevels;
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
                max_tokens: 8192,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(this.currentLanguage === 'fa' ? 'خطا در ارتباط با API' : 'API connection error');
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Check if response was truncated due to max_tokens
        const finishReason = data.choices[0].finish_reason;
        if (finishReason === 'length') {
            content += '\n\n---\n\n' + (this.currentLanguage === 'fa' ?
                '⚠️ **توجه:** تحلیل به دلیل محدودیت طول پاسخ ناقص است. لطفاً تحلیل دیگری با درخواست کوتاه‌تر انجام دهید.' :
                '⚠️ **Note:** Analysis was truncated due to response length limits. Please run another analysis with a shorter request.');
        }

        return content;
    }

    // تابع جدید برای دریافت داده‌های صرافی‌ها
    async fetchExchangeData() {
        try {
            const response = await fetch(`https://api.coinpaprika.com/v1/coins/${this.cryptoInfo.coinpaprikaId}/exchanges`);
            
            if (!response.ok) {
                throw new Error('خطا در دریافت داده‌های صرافی‌ها');
            }

            const data = await response.json();
            
            // استخراج داده‌های حجم معاملات از صرافی‌های برتر
            return data.slice(0, 10).map(exchange => ({
                name: exchange.name,
                pair: exchange.pair,
                volume: exchange.quotes.USD.volume_24h,
                price: exchange.quotes.USD.price
            }));

        } catch (error) {
            console.error('Error fetching exchange data:', error);
            return [];
        }
    }

    // تابع جدید برای محاسبه قدرت Order Block
    calculateOrderBlockStrength(orderBlock, data) {
        let strength = 0;
        const price = orderBlock.price;
        const volume = orderBlock.volume;
        const index = orderBlock.index;
        
        // فاکتور 1: حجم معاملات در Order Block (40% از قدرت)
        const avgVolume = data.reduce((sum, d, i) => {
            if (i < data.length - 1 && this.cryptoData.historicalData[i]) {
                return sum + (this.cryptoData.historicalData[i].volume || 0);
            }
            return sum;
        }, 0) / (data.length - 1);
        
        const volumeFactor = Math.min(volume / avgVolume, 3) / 3; // حداکثر 3 برابر میانگین
        strength += volumeFactor * 0.4;
        
        // فاکتور 2: واکنش قیمت پس از Order Block (30% از قدرت)
        let reactionScore = 0;
        const lookAheadPeriod = Math.min(10, data.length - index - 1);
        
        if (lookAheadPeriod > 0) {
            for (let i = 1; i <= lookAheadPeriod; i++) {
                const currentIndex = index + i;
                if (currentIndex >= data.length) break;
                
                // برای Order Block حمایت، بررسی می‌کنیم که قیمت چقدر بالا رفته
                if (orderBlock.type === 'support') {
                    const priceIncrease = (data[currentIndex] - price) / price;
                    reactionScore += Math.min(priceIncrease, 0.1) * 10; // حداکثر 1 نمره برای هر دوره
                }
                // برای Order Block مقاومت، بررسی می‌کنیم که قیمت چقدر پایین رفته
                else if (orderBlock.type === 'resistance') {
                    const priceDecrease = (price - data[currentIndex]) / price;
                    reactionScore += Math.min(priceDecrease, 0.1) * 10; // حداکثر 1 نمره برای هر دوره
                }
            }
            
            const reactionFactor = Math.min(reactionScore / lookAheadPeriod, 1);
            strength += reactionFactor * 0.3;
        }
        
        // فاکتور 3: تعداد لمس‌های بعدی (20% از قدرت)
        let touches = 0;
        const tolerance = price * 0.02; // 2% tolerance
        
        for (let i = index + 1; i < data.length; i++) {
            if (Math.abs(data[i] - price) < tolerance) {
                touches++;
            }
        }
        
        const touchesFactor = Math.min(touches / 5, 1); // حداکثر 5 لمس
        strength += touchesFactor * 0.2;
        
        // فاکتور 4: فاصله زمانی از Order Block (10% از قدرت)
        const timeFactor = 1 - (index / data.length); // Order Block‌های جدیدتر قدرت بیشتری دارند
        strength += timeFactor * 0.1;
        
        return Math.min(strength, 1); // حداکثر قدرت 1
    }

    // تابع جدید برای نمایش پروفایل حجم
    displayVolumeProfile() {
        const volumeProfileContent = document.getElementById('volumeProfileContent');
        
        if (!this.cryptoData.technicalIndicators || !this.cryptoData.technicalIndicators.volumeProfile) {
            volumeProfileContent.innerHTML = `
                <div class="no-data">
                    <p>${this.currentLanguage === 'fa' ? 'داده‌ای برای نمایش پروفایل حجم موجود نیست' : 'No volume profile data available'}</p>
                </div>
            `;
            return;
        }
        
        const volumeProfile = this.cryptoData.technicalIndicators.volumeProfile;
        const poc = this.formatPrice(volumeProfile.poc, this.cryptoInfo.symbol);
        const vah = this.formatPrice(volumeProfile.vah, this.cryptoInfo.symbol);
        const val = this.formatPrice(volumeProfile.val, this.cryptoInfo.symbol);
        
        // نمایش سطوح کلیدی پروفایل حجم
        volumeProfileContent.innerHTML = `
            <div class="volume-profile-summary">
                <div class="volume-level-item">
                    <div class="level-label">${this.currentLanguage === 'fa' ? 'Point of Control (POC)' : 'Point of Control (POC)'}</div>
                    <div class="level-value">$${poc}</div>
                    <div class="level-description">${this.currentLanguage === 'fa' ? 'بیشترین حجم معاملات' : 'Highest trading volume'}</div>
                </div>
                <div class="volume-level-item">
                    <div class="level-label">${this.currentLanguage === 'fa' ? 'Value Area High (VAH)' : 'Value Area High (VAH)'}</div>
                    <div class="level-value">$${vah}</div>
                    <div class="level-description">${this.currentLanguage === 'fa' ? 'بالاترین سطح ارزش' : 'Highest value level'}</div>
                </div>
                <div class="volume-level-item">
                    <div class="level-label">${this.currentLanguage === 'fa' ? 'Value Area Low (VAL)' : 'Value Area Low (VAL)'}</div>
                    <div class="level-value">$${val}</div>
                    <div class="level-description">${this.currentLanguage === 'fa' ? 'پایین‌ترین سطح ارزش' : 'Lowest value level'}</div>
                </div>
            </div>
            
            <div class="volume-profile-chart">
                <h4>${this.currentLanguage === 'fa' ? 'توزیع حجم بر اساس قیمت' : 'Volume Distribution by Price'}</h4>
                <div class="volume-bars" id="volumeBars"></div>
            </div>
            
            <div class="volume-profile-analysis">
                <h4>${this.currentLanguage === 'fa' ? 'تحلیل پروفایل حجم' : 'Volume Profile Analysis'}</h4>
                <p>${this.getVolumeProfileAnalysis(volumeProfile)}</p>
            </div>
        `;
        
        // رسم نمودار میله‌ای پروفایل حجم
        this.drawVolumeProfileChart(volumeProfile);
    }

    // تابع کمکی برای رسم نمودار پروفایل حجم
    drawVolumeProfileChart(volumeProfile) {
        const volumeBars = document.getElementById('volumeBars');
        if (!volumeBars || !volumeProfile.levels || volumeProfile.levels.length === 0) {
            return;
        }
        
        // مرتب‌سازی سطوح بر اساس قیمت
        const sortedLevels = [...volumeProfile.levels].sort((a, b) => a.price - b.price);
        
        // پیدا کردن حداکثر حجم برای نرمال‌سازی
        const maxVolume = Math.max(...sortedLevels.map(level => level.volume));
        
        // ایجاد میله‌های حجم
        volumeBars.innerHTML = sortedLevels.map(level => {
            const percentage = (level.volume / maxVolume) * 100;
            const isPOC = Math.abs(level.price - volumeProfile.poc) < (volumeProfile.poc * 0.01);
            const isVAH = Math.abs(level.price - volumeProfile.vah) < (volumeProfile.vah * 0.01);
            const isVAL = Math.abs(level.price - volumeProfile.val) < (volumeProfile.val * 0.01);
            
            let barClass = 'volume-bar';
            if (isPOC) barClass += ' poc-bar';
            else if (isVAH || isVAL) barClass += ' va-bar';
            
            return `
                <div class="volume-bar-container">
                    <div class="${barClass}" style="width: ${percentage}%"></div>
                    <div class="volume-bar-label">$${this.formatPrice(level.price, this.cryptoInfo.symbol)}</div>
                    <div class="volume-bar-value">${this.formatNumber(level.volume)}</div>
                </div>
            `;
        }).join('');
    }

    // تابع کمکی برای تحلیل پروفایل حجم
    getVolumeProfileAnalysis(volumeProfile) {
        const currentPrice = this.cryptoData.price;
        const poc = volumeProfile.poc;
        const vah = volumeProfile.vah;
        const val = volumeProfile.val;
        
        let analysis = '';
        
        if (this.currentLanguage === 'fa') {
            if (currentPrice > vah) {
                analysis = `قیمت فعلی ($${this.formatPrice(currentPrice, this.cryptoInfo.symbol)}) بالاتر از Value Area High ($${vah}) قرار دارد. این نشان می‌دهد که خریداران قوی هستند و ممکن است قیمت به سطوح بالاتر حرکت کند. با این حال، این منطقه ممکن است با مقاومت مواجه شود.`;
            } else if (currentPrice < val) {
                analysis = `قیمت فعلی ($${this.formatPrice(currentPrice, this.cryptoInfo.symbol)}) پایین‌تر از Value Area Low ($${val}) قرار دارد. این نشان می‌دهد که فروشندگان کنترل دارند و ممکن است قیمت به سطوح پایین‌تر ادامه دهد. این منطقه ممکن است به عنوان حمایت عمل کند.`;
            } else {
                analysis = `قیمت فعلی ($${this.formatPrice(currentPrice, this.cryptoInfo.symbol)}) در داخل Value Area (بین $${val} و $${vah}) قرار دارد. این نشان‌دهنده‌ی تعادل بین خریداران و فروشندگان است. Point of Control در $${poc} مهم‌ترین سطح قیمت در این محدوده است.`;
            }
            
            // افزودن تحلیل مربوط به شکل پروفایل
            const profileShape = this.analyzeProfileShape(volumeProfile);
            analysis += ` ${profileShape}`;
            
        } else {
            if (currentPrice > vah) {
                analysis = `Current price ($${this.formatPrice(currentPrice, this.cryptoInfo.symbol)}) is above Value Area High ($${vah}). This indicates strong buying pressure and the price may move to higher levels. However, this area may face resistance.`;
            } else if (currentPrice < val) {
                analysis = `Current price ($${this.formatPrice(currentPrice, this.cryptoInfo.symbol)}) is below Value Area Low ($${val}). This indicates sellers are in control and the price may continue to lower levels. This area may act as support.`;
            } else {
                analysis = `Current price ($${this.formatPrice(currentPrice, this.cryptoInfo.symbol)}) is inside the Value Area (between $${val} and $${vah}). This indicates a balance between buyers and sellers. The Point of Control at $${poc} is the most important price level in this range.`;
            }
            
            // افزودن تحلیل مربوط به شکل پروفایل
            const profileShape = this.analyzeProfileShape(volumeProfile);
            analysis += ` ${profileShape}`;
        }
        
        return analysis;
    }

    // تابع کمکی برای تحلیل شکل پروفایل حجم
    analyzeProfileShape(volumeProfile) {
        if (!volumeProfile.levels || volumeProfile.levels.length === 0) {
            return this.currentLanguage === 'fa' ? 
                'اطلاعات کافی برای تحلیل شکل پروفایل وجود ندارد.' : 
                'Insufficient information to analyze profile shape.';
        }
        
        // تحلیل توزیع حجم
        const sortedLevels = [...volumeProfile.levels].sort((a, b) => b.volume - a.volume);
        const topLevels = sortedLevels.slice(0, 3);
        const totalVolume = sortedLevels.reduce((sum, level) => sum + level.volume, 0);
        const topVolume = topLevels.reduce((sum, level) => sum + level.volume, 0);
        const concentration = (topVolume / totalVolume) * 100;
        
        if (this.currentLanguage === 'fa') {
            if (concentration > 50) {
                return `پروفایل حجم دارای تمرکز بالا (${concentration.toFixed(1)}%) است که نشان‌دهنده‌ی وجود یک منطقه قیمت مهم و احتمالاً ادامه روند است.`;
            } else if (concentration > 30) {
                return `پروفایل حجم دارای تمرکز متوسط (${concentration.toFixed(1)}%) است که نشان‌دهنده‌ی یک بازار متعادل با مناطق قیمت متعدد است.`;
            } else {
                return `پروفایل حجم دارای توزیع گسترده (${concentration.toFixed(1)}%) است که نشان‌دهنده‌ی عدم قطعیت در بازار و احتمال تغییر روند است.`;
            }
        } else {
            if (concentration > 50) {
                return `The volume profile has high concentration (${concentration.toFixed(1)}%), indicating the presence of an important price area and potential trend continuation.`;
            } else if (concentration > 30) {
                return `The volume profile has medium concentration (${concentration.toFixed(1)}%), indicating a balanced market with multiple price areas.`;
            } else {
                return `The volume profile has wide distribution (${concentration.toFixed(1)}%), indicating market uncertainty and potential trend change.`;
            }
        }
    }

    // تابع کمکی برای فرمت‌بندی اعداد بزرگ
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        } else {
            return num.toFixed(2);
        }
    }

    // تابع جدید برای نمایش سطوح فیبوناچی
    displayFibonacciLevels() {
        const fibonacciContent = document.getElementById('fibonacciContent');
        
        if (!this.cryptoData.technicalIndicators || !this.cryptoData.technicalIndicators.fibonacci) {
            fibonacciContent.innerHTML = `
                <div class="no-data">
                    <p>${this.currentLanguage === 'fa' ? 'داده‌ای برای نمایش سطوح فیبوناچی موجود نیست' : 'No Fibonacci data available'}</p>
                </div>
            `;
            return;
        }
        
        const fibonacci = this.cryptoData.technicalIndicators.fibonacci;
        const currentPrice = this.cryptoData.price;
        
        fibonacciContent.innerHTML = `
            <div class="fibonacci-summary">
                <div class="fibonacci-range">
                    <div class="fib-range-item">
                        <span class="fib-label">${this.currentLanguage === 'fa' ? '🟢 بیشترین سطح قیمت' : '🟢 Highest price level'}</span>
                        <span class="fib-value">$${this.formatPrice(fibonacci.high, this.cryptoInfo.symbol)}</span>
                    </div>
                    <div class="fib-range-item">
                        <span class="fib-label">${this.currentLanguage === 'fa' ? '🔴 کمترین سطح قیمت' : '🔴 Lowest price level'}</span>
                        <span class="fib-value">$${this.formatPrice(fibonacci.low, this.cryptoInfo.symbol)}</span>
                    </div>
                </div>
            </div>
            
            <div class="fibonacci-levels">
                <h4>${this.currentLanguage === 'fa' ? 'سطوح بازگشت فیبوناچی' : 'Fibonacci Retracement Levels'}</h4>
                ${fibonacci.levels.map(level => {
                    const isNearCurrentPrice = Math.abs(level.price - currentPrice) / currentPrice < 0.02;
                    const levelClass = isNearCurrentPrice ? 'fib-level current-price' : 'fib-level';
                    
                    return `
                        <div class="${levelClass}">
                            <span class="fib-percent">${(level.level * 100).toFixed(1)}%</span>
                            <span class="fib-price">$${this.formatPrice(level.price, this.cryptoInfo.symbol)}</span>
                            ${isNearCurrentPrice ? `<span class="current-indicator">${this.currentLanguage === 'fa' ? 'قیمت فعلی' : 'Current Price'}</span>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="fibonacci-analysis">
                <h4>${this.currentLanguage === 'fa' ? 'تحلیل سطوح فیبوناچی' : 'Fibonacci Analysis'}</h4>
                <p>${this.getFibonacciAnalysis(fibonacci, currentPrice)}</p>
            </div>
        `;
    }

    // تابع کمکی برای تحلیل سطوح فیبوناچی
    getFibonacciAnalysis(fibonacci, currentPrice) {
        const range = fibonacci.high - fibonacci.low;
        const currentPosition = (currentPrice - fibonacci.low) / range;
        
        let analysis = '';
        
        if (this.currentLanguage === 'fa') {
            if (currentPosition > 0.786) {
                analysis = `قیمت فعلی در بالاترین سطح فیبوناچی (78.6%) قرار دارد که نشان‌دهنده‌ی قدرت خریداران است. با این حال، این منطقه ممکن است با مقاومت مواجه شود.`;
            } else if (currentPosition > 0.618) {
                analysis = `قیمت فعلی در سطح طلایی فیبوناچی (61.8%) قرار دارد که یکی از مهم‌ترین سطوح حمایت/مقاومت است. واکنش قیمت در این منطقه بسیار مهم است.`;
            } else if (currentPosition > 0.5) {
                analysis = `قیمت فعلی در سطح 50% فیبوناچی قرار دارد که یک سطح روانی مهم است و اغلب به عنوان حمایت یا مقاومت عمل می‌کند.`;
            } else if (currentPosition > 0.382) {
                analysis = `قیمت فعلی در سطح 38.2% فیبوناچی قرار دارد که یک سطح اصلاحی مهم است. اگر این سطح حمایت شود، ممکن است شاهد ادامه روند صعودی باشیم.`;
            } else if (currentPosition > 0.236) {
                analysis = `قیمت فعلی در سطح 23.6% فیبوناچی قرار دارد که یک سطح اصلاحی ضعیف است. اگر قیمت از این سطح پایین‌تر برود، ممکن است اصلاح عمیق‌تری داشته باشیم.`;
            } else {
                analysis = `قیمت فعلی زیر تمام سطوح کلیدی فیبوناچی قرار دارد که نشان‌دهنده‌ی ضعف نسبی است. سطح 23.6% ($${this.formatPrice(fibonacci.low + (range * 0.236), this.cryptoInfo.symbol)}) اولین مقاومت مهم است.`;
            }
        } else {
            if (currentPosition > 0.786) {
                analysis = `Current price is at the highest Fibonacci level (78.6%), indicating strong buying pressure. However, this area may face resistance.`;
            } else if (currentPosition > 0.618) {
                analysis = `Current price is at the golden Fibonacci level (61.8%), which is one of the most important support/resistance levels. Price reaction at this level is very important.`;
            } else if (currentPosition > 0.5) {
                analysis = `Current price is at the 50% Fibonacci level, which is an important psychological level and often acts as support or resistance.`;
            } else if (currentPosition > 0.382) {
                analysis = `Current price is at the 38.2% Fibonacci level, which is an important correction level. If this level holds as support, we may see trend continuation.`;
            } else if (currentPosition > 0.236) {
                analysis = `Current price is at the 23.6% Fibonacci level, which is a weak correction level. If price breaks below this level, we may see a deeper correction.`;
            } else {
                analysis = `Current price is below all key Fibonacci levels, indicating relative weakness. The 23.6% level ($${this.formatPrice(fibonacci.low + (range * 0.236), this.cryptoInfo.symbol)}) is the first important resistance.`;
            }
        }
        
        return analysis;
    }

    // تابع جدید برای دریافت اخبار از RSS feeds (بدون نیاز به API Key)
    async fetchCryptoNews() {
        try {
            const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss');
            if (!response.ok) throw new Error('News API Error');

            const data = await response.json();
            const newsItems = data.items.slice(0, 8);

            return newsItems.map(item => ({
                title: item.title,
                source: 'CoinTelegraph',
                date: new Date(item.pubDate),
                description: item.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
                link: item.link,
                important: item.categories && (item.categories.includes('BTC') || item.categories.includes('Markets') || item.title.includes('Bitcoin'))
            }));
        } catch (error) {
            console.warn('Error fetching news:', error);
            return this.getDefaultNews();
        }
    }

    getDefaultNews() {
        const defaultNews = [
            {
                title: '📈 بازار ارزهای دیجیتال در نوسان',
                source: 'Crypto Analysis',
                date: new Date(),
                description: 'تحلیل تکنیکال نشان‌دهنده فرصت‌های معاملاتی مناسب در بازار است.',
                link: '#',
                important: false
            }
        ];
        return defaultNews;
    }

    // تابع جدید برای نمایش اخبار در UI
    displayNews(news) {
        const newsContent = document.getElementById('newsContent');
        
        if (!news || news.length === 0) {
            newsContent.innerHTML = `
                <div class="news-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${this.currentLanguage === 'fa' ? 'هیچ خبری یافت نشد' : 'No news found'}</p>
                </div>
            `;
            return;
        }
        
        let newsHTML = '';
        
        news.forEach(item => {
            const title = item.title;
            const source = item.source;
            const date = new Date(item.date).toLocaleDateString(
                this.currentLanguage === 'fa' ? 'fa-IR' : 'en-US', 
                { year: 'numeric', month: 'short', day: 'numeric' }
            );
            const description = item.description || '';
            const link = item.link;
            const isImportant = item.important;
            const newsClass = isImportant ? 'news-item important' : 'news-item';
            
            newsHTML += `
                <div class="${newsClass}">
                    <h4 class="news-title">
                        ${title}
                        ${isImportant ? '<i class="fas fa-fire important-fire"></i>' : ''}
                    </h4>
                    <div class="news-source">
                        <i class="fas fa-chart-line"></i> ${this.currentLanguage === 'fa' ? 'منبع: ' : 'Source: '}${source}
                    </div>
                    <div class="news-date">
                        <i class="fas fa-clock"></i> ${date}
                    </div>
                    ${description ? `<p class="news-description">${description}</p>` : ''}
                    <a href="${link}" target="_blank" class="news-link">
                        ${this.currentLanguage === 'fa' ? 'مشاهده جزئیات' : 'View Details'} 
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `;
        });
        
        newsContent.innerHTML = newsHTML;
    }

    // تابع جدید برای دریافت داده‌های پیشرفته بلاکچین
    async fetchBlockchainData() {
        try {
            const symbol = this.cryptoInfo.symbol;
            console.log('Fetching blockchain data for:', symbol);

            if (symbol === 'BTC') {
                const stats = await this.fetchBTCStats();
                if (stats) {
                    this.cryptoData.blockchain = {
                        networkDifficulty: stats.difficulty,
                        hashRate: stats.hash_rate,
                        transactionCount: stats.n_tx,
                        activeAddresses: null,
                        transactionVolume: stats.total_btc_sent
                    };
                }
            } else if (symbol === 'ETH') {
                await this.fetchEthereumData();
            } else if (this._blockchairSlugs[symbol]) {
                await this.fetchBlockchairData(this._blockchairSlugs[symbol]);
            } else {
                this.cryptoData.blockchain = null;
            }
        } catch (error) {
            console.warn('Blockchain data fetch failed:', error);
            this.cryptoData.blockchain = null;
        }
    }

    // دریافت داده‌های بلاکچین از Blockchair (بدون نیاز به API Key)
    async fetchBlockchairData(slug) {
        const response = await fetch(`https://api.blockchair.com/${slug}/stats`);
        if (!response.ok) throw new Error(`Blockchair API error for ${slug}`);

        const json = await response.json();
        const data = json.data;

        const rawVolume = parseFloat(data.volume_24h_approximate || data.volume_24h || 0);
        const priceUsd = parseFloat(data.market_price_usd || 0);
        const decimals = (slug === 'bitcoin' || slug === 'bitcoin-cash' || slug === 'bitcoin-sv' || slug === 'litecoin' || slug === 'dogecoin' || slug === 'dash') ? 1e8 : 1e6;
        const volumeUsd = priceUsd > 0 ? (rawVolume / decimals) * priceUsd : rawVolume;

        this.cryptoData.blockchain = {
            networkDifficulty: parseFloat(data.difficulty || 0),
            hashRate: parseFloat(data.hashrate_24h || data.hashrate || 0),
            transactionCount: parseInt(data.transactions_24h || data.transactions || 0),
            activeAddresses: parseInt(data.address_count || data.active_addresses || 0),
            transactionVolume: volumeUsd
        };
    }

    async fetchBTCStats() {
        try {
            const response = await fetch('https://api.blockchain.info/stats');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn('Error fetching BTC stats:', error);
            return null;
        }
    }

    // تابع برای دریافت داده‌های بازار بیت‌کوین
    async fetchBTCMarketData() {
        try {
            // استفاده از CoinGecko برای داده‌های بازار
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('BTC Market Data API response:', data);
            
            return {
                addresses_active_count: data.community_data?.twitter_followers ? Math.floor(data.community_data.twitter_followers / 100) : 245678,
                tx_volume: data.market_data?.total_volume?.usd || 45678923456
            };
            
        } catch (error) {
            console.error('Error fetching BTC market data:', error);
            // داده‌های نمونه
            return {
                addresses_active_count: 245678,
                tx_volume: 45678923456
            };
        }
    }

    async fetchEthereumData() {
        try {
            const response = await fetch('https://eth.blockscout.com/api/v2/stats');
            if (!response.ok) throw new Error('Blockscout API error');

            const data = await response.json();

            const txCountToday = parseInt(data.transactions_today || 0);
            const gasUsedToday = parseFloat(data.gas_used_today || 0);
            const avgGasPriceGwei = parseFloat(data.gas_prices?.average || 0);
            const txVolumeUsd = avgGasPriceGwei > 0 && gasUsedToday > 0
                ? (gasUsedToday * avgGasPriceGwei * 1e-9 * parseFloat(data.coin_price || 0))
                : 0;

            this.cryptoData.blockchain = {
                networkDifficulty: 0,
                hashRate: 0,
                transactionCount: txCountToday,
                activeAddresses: parseInt(data.total_addresses || 0),
                transactionVolume: txVolumeUsd
            };

        } catch (error) {
            console.error('Error fetching Ethereum data:', error);
            throw new Error('Error fetching Ethereum data');
        }
    }

    // تابع برای دریافت استخرهای ماینینگ
    async fetchMiningPools() {
        const response = await fetch('https://api.blockchain.info/pools?timespan=4days');
        if (!response.ok) throw new Error('خطا در دریافت داده‌های استخرها');
        const data = await response.json();
        
        // تبدیل به آرایه و مرتب‌سازی
        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }

    // تابع برای دریافت بلاک‌های اخیر
    async fetchRecentBlocks() {
        const response = await fetch('https://api.blockchain.info/blocks/1573858800000?format=json');
        if (!response.ok) throw new Error('خطا در دریافت بلاک‌های اخیر');
        const data = await response.json();
        return data.blocks.slice(0, 5); // 5 بلاک آخر
    }

    // تابع برای دریافت داده‌های بازار سایر ارزها
    async fetchCryptoMarketData(symbol) {
        // استفاده از API جایگزین برای ارزهای غیر BTC
        const response = await fetch(`https://api.blockchain.com/v3/exchange/tickers/${symbol}-USD`);
        if (!response.ok) throw new Error('خطا در دریافت داده‌های بازار');
        return await response.json();
    }

    // تابع جدید برای تحلیل پیشرفته‌تر شبکه
    calculateAdvancedNetworkMetrics() {
        try {
            if (!this.cryptoData.blockchain) {
                console.warn('No blockchain data available for advanced metrics');
                this.cryptoData.nvtRatio = 0;
                this.cryptoData.mayerMultiple = 0;
                this.cryptoData.puellMultiple = 0;
                return;
            }
            
            const blockchain = this.cryptoData.blockchain;
            const price = this.cryptoData.price;
            const marketCap = this.cryptoData.marketCap;
            
            console.log('Calculating advanced metrics with:', { price, marketCap, blockchain });
            
            // محاسبه NVT Ratio (Network Value to Transactions)
            if (blockchain.transactionVolume && price && marketCap && blockchain.transactionVolume > 0) {
                const dailyTransactionVolume = blockchain.transactionVolume;
                this.cryptoData.nvtRatio = marketCap / dailyTransactionVolume;
                console.log('NVT Ratio calculated:', this.cryptoData.nvtRatio);
            } else {
                this.cryptoData.nvtRatio = 0; // داده موجود نیست
            }
            
            // محاسبه Mayer Multiple با استفاده از SMA 200 واقعی
            if (price && this.cryptoData.technicalIndicators && this.cryptoData.technicalIndicators.sma200 && this.cryptoData.technicalIndicators.sma200 > 0) {
                const _200DayMA = this.cryptoData.technicalIndicators.sma200;
                this.cryptoData.mayerMultiple = price / _200DayMA;
                console.log('Mayer Multiple calculated (real):', this.cryptoData.mayerMultiple, 'using SMA200:', _200DayMA);
            } else {
                console.warn('Real SMA200 not available or is zero, cannot calculate Mayer Multiple.');
                this.cryptoData.mayerMultiple = 0; // داده موجود نیست
            }
            
            // محاسبه Puell Multiple
            if (blockchain.stats && blockchain.stats.miners_revenue_usd && blockchain.stats.miners_revenue_usd > 0) {
                const dailyIssuance = blockchain.stats.miners_revenue_usd;
                // این یک محاسبه ساده شده است. برای محاسبه واقعی نیاز به 365-day MA درآمد ماینرها است.
                // فعلا از یک تقریب استفاده می‌کنیم، اما Puell Multiple فقط برای BTC معنای واقعی دارد.
                const _365DayMAIssuance = (blockchain.stats.miners_revenue_usd * 0.8) || 1; // تقریب ساده
                this.cryptoData.puellMultiple = dailyIssuance / _365DayMAIssuance;
                console.log('Puell Multiple calculated:', this.cryptoData.puellMultiple);
            } else {
                // Puell Multiple فقط برای BTC (یا کوین‌های با داده درآمد ماینر) موجود است
                this.cryptoData.puellMultiple = 0; // داده موجود نیست
            }
            
        } catch (error) {
            console.error('Error in calculateAdvancedNetworkMetrics:', error);
            // در صورت خطا، داده‌های شبیه‌سازی شده استفاده می‌کنیم
            this.cryptoData.nvtRatio = 0;
            this.cryptoData.mayerMultiple = 0;
            this.cryptoData.puellMultiple = 0;
        }
    }

    // تابع برای نمایش داده‌های بلاکچین
    displayBlockchainData() {
        const blockchainContent = document.getElementById('blockchainContent');
        if (!blockchainContent) {
            console.error('blockchainContent element not found');
            return;
        }
        
        if (!this.cryptoData.blockchain) {
            blockchainContent.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${this.currentLanguage === 'fa' ? 'داده‌های بلاکچین برای این ارز در دسترس نیست.' : 'Blockchain data not available for this currency.'}</p>
                </div>
            `;
            return;
        }
        
        const blockchain = this.cryptoData.blockchain;
        
        try {
            blockchainContent.innerHTML = `
                <div class="blockchain-stats-grid">
                    <div class="blockchain-stat-item">
                        <div class="stat-label">${this.currentLanguage === 'fa' ? 'سختی شبکه' : 'Network Difficulty'}</div>
                        <div class="stat-value">${blockchain.networkDifficulty > 0 ? this.formatNumber(blockchain.networkDifficulty) : 'N/A'}</div>
                        <div class="stat-description">${this.currentLanguage === 'fa' ? 'میزان سختی استخراج' : 'Mining difficulty level'}</div>
                    </div>
                    <div class="blockchain-stat-item">
                        <div class="stat-label">${this.currentLanguage === 'fa' ? 'نرخ هش' : 'Hash Rate'}</div>
                        <div class="stat-value">${blockchain.hashRate > 0 ? this.formatHashRate(blockchain.hashRate) : 'N/A'}</div>
                        <div class="stat-description">${this.currentLanguage === 'fa' ? 'قدرت محاسباتی شبکه' : 'Network computational power'}</div>
                    </div>
                    <div class="blockchain-stat-item">
                        <div class="stat-label">${this.currentLanguage === 'fa' ? 'تراکنش‌ها (24h)' : 'Transactions (24h)'}</div>
                        <div class="stat-value">${blockchain.transactionCount > 0 ? this.formatNumber(blockchain.transactionCount) : 'N/A'}</div>
                        <div class="stat-description">${this.currentLanguage === 'fa' ? 'تعداد تراکنش‌های روزانه' : 'Daily transaction count'}</div>
                    </div>
                    <div class="blockchain-stat-item">
                        <div class="stat-label">${this.currentLanguage === 'fa' ? 'آدرس‌های فعال' : 'Active Addresses'}</div>
                        <div class="stat-value">${blockchain.activeAddresses > 0 ? this.formatNumber(blockchain.activeAddresses) : 'N/A'}</div>
                        <div class="stat-description">${this.currentLanguage === 'fa' ? 'آدرس‌های فعال در شبکه' : 'Active network addresses'}</div>
                    </div>
                </div>
                
                <div class="blockchain-analysis-section">
                    <h4>${this.currentLanguage === 'fa' ? '📊 تحلیل سلامت شبکه' : '📊 Network Health Analysis'}</h4>
                    <div class="network-health-indicators">
                        <div class="health-indicator ${this.getNetworkHealthClass(blockchain.hashRate, 'hashRate')}">
                            <span class="indicator-label">${this.currentLanguage === 'fa' ? 'امنیت شبکه' : 'Network Security'}</span>
                            <span class="indicator-value">${this.getNetworkHealthStatus(blockchain.hashRate, 'hashRate')}</span>
                        </div>
                        <div class="health-indicator ${this.getNetworkHealthClass(blockchain.transactionCount, 'transactions')}">
                            <span class="indicator-label">${this.currentLanguage === 'fa' ? 'فعالیت شبکه' : 'Network Activity'}</span>
                            <span class="indicator-value">${this.getNetworkHealthStatus(blockchain.transactionCount, 'transactions')}</span>
                        </div>
                        <div class="health-indicator ${this.getNetworkHealthClass(blockchain.activeAddresses, 'addresses')}">
                            <span class="indicator-label">${this.currentLanguage === 'fa' ? 'پذیرش کاربران' : 'User Adoption'}</span>
                            <span class="indicator-value">${this.getNetworkHealthStatus(blockchain.activeAddresses, 'addresses')}</span>
                        </div>
                    </div>
                    <p class="network-analysis-text">${this.getDetailedNetworkAnalysis(blockchain)}</p>
                </div>
            `;
            
        } catch (error) {
            console.error('Error displaying blockchain data:', error);
            blockchainContent.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${this.currentLanguage === 'fa' ? 'خطا در نمایش داده‌های بلاکچین' : 'Error displaying blockchain data'}</p>
                </div>
            `;
        }
    }

    // این توابع رو اضافه کن
    getNetworkHealthClass(value, type) {
        if (!value) return 'health-unknown';
        
        const thresholds = {
            hashRate: { high: 100000000000000, medium: 50000000000000 },
            transactions: { high: 100000, medium: 50000 },
            addresses: { high: 500000, medium: 250000 }
        };
        
        const threshold = thresholds[type];
        if (!threshold) return 'health-unknown';
        
        if (value >= threshold.high) return 'health-excellent';
        if (value >= threshold.medium) return 'health-good';
        if (value > 0) return 'health-fair';
        return 'health-poor';
    }

    getNetworkHealthStatus(value, type) {
        if (!value) return this.currentLanguage === 'fa' ? 'نامشخص' : 'Unknown';
        
        const status = {
            'health-excellent': this.currentLanguage === 'fa' ? 'عالی' : 'Excellent',
            'health-good': this.currentLanguage === 'fa' ? 'خوب' : 'Good',
            'health-fair': this.currentLanguage === 'fa' ? 'متوسط' : 'Fair',
            'health-poor': this.currentLanguage === 'fa' ? 'ضعیف' : 'Poor',
            'health-unknown': this.currentLanguage === 'fa' ? 'نامشخص' : 'Unknown'
        };
        
        const healthClass = this.getNetworkHealthClass(value, type);
        return status[healthClass];
    }

    getDetailedNetworkAnalysis(blockchain) {
        const hashRate = blockchain.hashRate || 0;
        const txCount = blockchain.transactionCount || 0;
        const activeAddresses = blockchain.activeAddresses || 0;
        
        if (this.currentLanguage === 'fa') {
            if (hashRate > 150000000000000 && txCount > 300000) {
                return 'شبکه در شرایط بسیار مطلوبی قرار دارد. نرخ هش بالا نشان‌دهنده امنیت قوی شبکه است و حجم بالای تراکنش‌ها حاکی از adoption گسترده می‌باشد.';
            } else if (hashRate > 80000000000000 && txCount > 150000) {
                return 'شبکه در شرایط خوبی عمل می‌کند. امنیت شبکه در سطح قابل قبولی است و فعالیت کاربران رو به رشد می‌باشد.';
            } else if (hashRate > 30000000000000) {
                return 'شبکه نیاز به توجه بیشتری دارد. اگرچه امنیت پایه برقرار است، اما برای رشد بیشتر نیاز به افزایش adoption دارد.';
            } else {
                return 'شبکه در مراحل اولیه توسعه قرار دارد. پتانسیل رشد بالایی وجود دارد اما نیاز به زمان برای بلوغ بیشتر است.';
            }
        } else {
            if (hashRate > 150000000000000 && txCount > 300000) {
                return 'The network is in excellent condition. High hash rate indicates strong network security, and high transaction volume shows widespread adoption.';
            } else if (hashRate > 80000000000000 && txCount > 150000) {
                return 'The network is performing well. Network security is at an acceptable level and user activity is growing.';
            } else if (hashRate > 30000000000000) {
                return 'The network requires more attention. Although basic security is established, it needs more adoption for further growth.';
            } else {
                return 'The network is in early development stages. There is high growth potential but it needs time to mature further.';
            }
        }
    }

    // تابع برای نمایش متریک‌های پیشرفته
    displayAdvancedMetrics() {
        const advancedMetricsContent = document.getElementById('advancedMetricsContent');
        if (!advancedMetricsContent) {
            console.error('advancedMetricsContent element not found');
            return;
        }
        
        const metrics = this.cryptoData;
        
        // اگر هیچ متریک پیشرفته‌ای محاسبه نشده باشد (همه صفر باشند)، پیام مناسب نمایش بده
        if (!metrics || (!metrics.nvtRatio && !metrics.mayerMultiple && !metrics.puellMultiple)) {
            advancedMetricsContent.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${this.currentLanguage === 'fa' ? 'متریک‌های پیشرفته شبکه برای این ارز در دسترس نیست.' : 'Advanced network metrics not available for this currency.'}</p>
                </div>
            `;
            return;
        }
        
        try {
            advancedMetricsContent.innerHTML = `
                <div class="advanced-metrics-grid">
                    <div class="metric-item ${this.getMetricClass(metrics.nvtRatio, 'nvt')}">
                        <div class="metric-name">NVT Ratio</div>
                        <div class="metric-value">${metrics.nvtRatio > 0 ? metrics.nvtRatio.toFixed(2) : 'N/A'}</div>
                        <div class="metric-description">${this.getNVTDescription(metrics.nvtRatio)}</div>
                        <div class="metric-explanation">${this.currentLanguage === 'fa' ? 
                            'نسبت ارزش شبکه به حجم تراکنش‌ها' : 
                            'Network Value to Transactions Ratio'}</div>
                    </div>
                    
                    <div class="metric-item ${this.getMetricClass(metrics.mayerMultiple, 'mayer')}">
                        <div class="metric-name">Mayer Multiple</div>
                        <div class="metric-value">${metrics.mayerMultiple > 0 ? metrics.mayerMultiple.toFixed(2) : 'N/A'}</div>
                        <div class="metric-description">${this.getMayerDescription(metrics.mayerMultiple)}</div>
                        <div class="metric-explanation">${this.currentLanguage === 'fa' ? 
                            'قیمت فعلی نسبت به میانگین 200 روزه' : 
                            'Current price vs 200-day moving average'}</div>
                    </div>
                    
                    <div class="metric-item ${this.getMetricClass(metrics.puellMultiple, 'puell')}">
                        <div class="metric-name">Puell Multiple</div>
                        <div class="metric-value">${metrics.puellMultiple > 0 ? metrics.puellMultiple.toFixed(2) : 'N/A'}</div>
                        <div class="metric-description">${this.getPuellDescription(metrics.puellMultiple)}</div>
                        <div class="metric-explanation">${this.currentLanguage === 'fa' ? 
                            'درآمد روزانه ماینرها نسبت به میانگین سالانه' : 
                            'Daily miner revenue vs yearly average'}</div>
                    </div>
                    
                    <div class="metric-item ${this.getNetworkHealthClass(metrics.blockchain?.activeAddresses, 'addresses')}">
                        <div class="metric-name">${this.currentLanguage === 'fa' ? 'آدرس‌های فعال' : 'Active Addresses'}</div>
                        <div class="metric-value">${metrics.blockchain?.activeAddresses > 0 ? this.formatNumber(metrics.blockchain.activeAddresses) : 'N/A'}</div>
                        <div class="metric-description">${this.getNetworkHealthStatus(metrics.blockchain?.activeAddresses, 'addresses')}</div>
                        <div class="metric-explanation">${this.currentLanguage === 'fa' ? 
                            'تعداد آدرس‌های فعال در 24 ساعت گذشته' : 
                            'Active addresses in last 24 hours'}</div>
                    </div>
                </div>
                
                <div class="metrics-analysis">
                    <h4>${this.currentLanguage === 'fa' ? '🔍 تحلیل ترکیبی متریک‌ها' : '🔍 Combined Metrics Analysis'}</h4>
                    <p>${this.getCombinedMetricsAnalysis(metrics)}</p>
                </div>
            `;
            
        } catch (error) {
            console.error('Error displaying advanced metrics:', error);
            advancedMetricsContent.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${this.currentLanguage === 'fa' ? 'خطا در نمایش متریک‌های پیشرفته' : 'Error displaying advanced metrics'}</p>
                </div>
            `;
        }
    }

    // تابع جدید برای تحلیل ترکیبی متریک‌ها
    getCombinedMetricsAnalysis(metrics) {
        const nvt = metrics.nvtRatio || 0;
        const mayer = metrics.mayerMultiple || 0;
        const puell = metrics.puellMultiple || 0;
        
        if (this.currentLanguage === 'fa') {
            if (nvt < 60 && mayer < 1.2 && puell < 1.5) {
                return 'متریک‌ها نشان‌دهنده شرایط مطلوب برای سرمایه‌گذاری هستند. ارزش شبکه نسبت به حجم تراکنش‌ها منطقی، قیمت نزدیک به میانگین تاریخی و درآمد ماینرها در محدوده سالم است.';
            } else if (nvt > 120 && mayer > 2.0) {
                return 'احتیاط توصیه می‌شود. ارزش شبکه نسبت به حجم تراکنش‌ها بالا و قیمت significantly بالاتر از میانگین تاریخی است.';
            } else if (puell > 3.0) {
                return 'درآمد ماینرها در سطح بالایی قرار دارد که ممکن است نشان‌دهنده نزدیک شدن به سقف بازار باشد.';
            } else {
                return 'متریک‌ها در محدوده نرمال قرار دارند. شرایط بازار متعادل و فرصت‌های معاملاتی مناسبی وجود دارد.';
            }
        } else {
            if (nvt < 60 && mayer < 1.2 && puell < 1.5) {
                return 'Metrics indicate favorable investment conditions. Network value relative to transaction volume is reasonable, price is close to historical average, and miner revenue is in a healthy range.';
            } else if (nvt > 120 && mayer > 2.0) {
                return 'Caution is advised. Network value relative to transaction volume is high and price is significantly above historical average.';
            } else if (puell > 3.0) {
                return 'Miner revenue is at a high level, which may indicate approaching market top.';
            } else {
                return 'Metrics are within normal ranges. Market conditions are balanced with good trading opportunities.';
            }
        }
    }

    // توابع کمکی برای فرمت‌بندی و تحلیل
    formatHashRate(hashRate) {
        if (hashRate >= 1e18) return (hashRate / 1e18).toFixed(2) + ' EH/s';
        if (hashRate >= 1e15) return (hashRate / 1e15).toFixed(2) + ' PH/s';
        if (hashRate >= 1e12) return (hashRate / 1e12).toFixed(2) + ' TH/s';
        return (hashRate / 1e9).toFixed(2) + ' GH/s';
    }

    getNetworkAnalysis(stats) {
        const difficulty = stats.difficulty;
        const hashRate = stats.hash_rate;
        const txCount = stats.tx_count;
        
        if (this.currentLanguage === 'fa') {
            if (hashRate > 150000000000000000000 && difficulty > 50000000000000) {
                return 'شبکه در شرایط بسیار امن و قدرتمندی قرار دارد. نرخ هش و سختی شبکه در سطح بالایی است که نشان‌دهنده امنیت بالای شبکه می‌باشد.';
            } else if (hashRate > 80000000000000000000) {
                return 'شبکه در شرایط خوبی قرار دارد. امنیت شبکه در سطح قابل قبولی است.';
            } else {
                return 'شبکه نیاز به توجه بیشتری دارد. سطح امنیت شبکه می‌تواند بهبود یابد.';
            }
        } else {
            if (hashRate > 150000000000000000000 && difficulty > 50000000000000) {
                return 'The network is in a very secure and powerful condition. Hash rate and network difficulty are at high levels, indicating high network security.';
            } else if (hashRate > 80000000000000000000) {
                return 'The network is in good condition. Network security is at an acceptable level.';
            } else {
                return 'The network requires more attention. Network security level can be improved.';
            }
        }
    }

    getMetricClass(value, type) {
        if (!value) return 'neutral';
        
        switch(type) {
            case 'nvt':
                return value > 150 ? 'overbought' : value < 50 ? 'oversold' : 'neutral';
            case 'mayer':
                return value > 2.4 ? 'overbought' : value < 1.0 ? 'oversold' : 'neutral';
            case 'puell':
                return value > 4.0 ? 'overbought' : value < 0.5 ? 'oversold' : 'neutral';
            default:
                return 'neutral';
        }
    }

    getNVTDescription(value) {
        if (!value) return this.currentLanguage === 'fa' ? 'داده‌ای موجود نیست' : 'No data available';
        
        if (this.currentLanguage === 'fa') {
            if (value > 150) return 'ارزش شبکه نسبت به حجم تراکنش‌ها بسیار بالا است';
            if (value < 50) return 'ارزش شبکه نسبت به حجم تراکنش‌ها پایین است';
            return 'ارزش شبکه نسبت به حجم تراکنش‌ها در محدوده سالم';
        } else {
            if (value > 150) return 'Network value is very high relative to transaction volume';
            if (value < 50) return 'Network value is low relative to transaction volume';
            return 'Network value is healthy relative to transaction volume';
        }
    }

    getMayerDescription(value) {
        if (!value) return this.currentLanguage === 'fa' ? 'داده‌ای موجود نیست' : 'No data available';
        
        if (this.currentLanguage === 'fa') {
            if (value > 2.4) return 'قیمت نسبت به میانگین 200 روزه بسیار بالا است';
            if (value < 1.0) return 'قیمت نسبت به میانگین 200 روزه پایین است';
            return 'قیمت در محدوده سالم نسبت به میانگین 200 روزه';
        } else {
            if (value > 2.4) return 'Price is very high relative to 200-day moving average';
            if (value < 1.0) return 'Price is low relative to 200-day moving average';
            return 'Price is healthy relative to 200-day moving average';
        }
    }

    getPuellDescription(value) {
        if (!value) return this.currentLanguage === 'fa' ? 'داده‌ای موجود نیست' : 'No data available';
        
        if (this.currentLanguage === 'fa') {
            if (value > 4.0) return 'درآمد ماینرها بسیار بالاست - احتمال اصلاح قیمت';
            if (value < 0.5) return 'درآمد ماینرها بسیار پایین است - احتمال بهبود قیمت';
            return 'درآمد ماینرها در محدوده سالم';
        } else {
            if (value > 4.0) return 'Miner revenue is very high - potential price correction';
            if (value < 0.5) return 'Miner revenue is very low - potential price improvement';
            return 'Miner revenue is in healthy range';
        }
    }

    getCurrentDateTime() {
        const now = new Date();
        
        if (this.currentLanguage === 'fa') {
            // تاریخ شمسی برای فارسی
            const persianDate = new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            }).format(now);
            
            const time = new Intl.DateTimeFormat('fa-IR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            }).format(now);
            
            return {
                date: persianDate,
                time: time,
                full: `${persianDate} - ساعت ${time}`,
                iso: now.toISOString(),
                timestamp: now.getTime()
            };
        } else {
            // تاریخ میلادی برای انگلیسی
            const englishDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            }).format(now);
            
            const time = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            }).format(now);
            
            return {
                date: englishDate,
                time: time,
                full: `${englishDate} - ${time}`,
                iso: now.toISOString(),
                timestamp: now.getTime()
            };
        }
    }

    // تابع کمکی برای دریافت اطلاعات زمانی تحلیل
    getAnalysisTimeContext() {
        const current = this.getCurrentDateTime();
        const now = new Date();
        
        if (this.currentLanguage === 'fa') {
            return {
                currentDate: current.date,
                currentTime: current.time,
                currentFull: current.full,
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate(),
                context: `تحلیل در تاریخ ${current.date} و ساعت ${current.time} انجام شده است. لطفاً تحلیل خود را بر اساس شرایط فعلی بازار در این تاریخ ارائه دهید.`
            };
        } else {
            return {
                currentDate: current.date,
                currentTime: current.time,
                currentFull: current.full,
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate(),
                context: `Analysis performed on ${current.date} at ${current.time}. Please provide your analysis based on current market conditions as of this date.`
            };
        }
    }

    generatePrompt() {
        const cryptoData = this.cryptoData;
        const cryptoInfo = this.cryptoInfo;
        
        // دریافت اطلاعات زمانی فعلی
        const timeContext = this.getAnalysisTimeContext();
        
        // استفاده از تابع جدید برای فرمت‌بندی قیمت
        const formattedPrice = this.formatPrice(cryptoData.price, cryptoInfo.symbol);
        const formattedSMA20 = this.formatPrice(cryptoData.technicalIndicators.sma20, cryptoInfo.symbol);
        const formattedSMA50 = this.formatPrice(cryptoData.technicalIndicators.sma50, cryptoInfo.symbol);
        const formattedSMA200 = this.formatPrice(cryptoData.technicalIndicators.sma200, cryptoInfo.symbol); // SMA200
        
        // سطوح حمایت و مقاومت بر اساس نوع تحلیل
        const supportLevels = this.analysisType === 'short' ? 
            cryptoData.supportLevelsShort : cryptoData.supportLevelsLong;
        const resistanceLevels = this.analysisType === 'short' ? 
            cryptoData.resistanceLevelsShort : cryptoData.resistanceLevelsLong;
        
        const formattedSupportLevels = supportLevels.map(level => 
            `${this.formatPrice(level.price, cryptoInfo.symbol)} (قدرت: ${(level.strength * 100).toFixed(0)}%)`
        ).join(', ');
        
        const formattedResistanceLevels = resistanceLevels.map(level => 
            `${this.formatPrice(level.price, cryptoInfo.symbol)} (قدرت: ${(level.strength * 100).toFixed(0)}%)`
        ).join(', ');
        
        // داده‌های بلاکچین و متریک‌های پیشرفته
        const blockchainData = cryptoData.blockchain || {};
        const stats = blockchainData.stats || {};
        
        // فرمت‌بندی داده‌های بلاکچین با بررسی مقادیر صفر
        const formattedDifficulty = blockchainData.networkDifficulty > 0 ? this.formatNumber(blockchainData.networkDifficulty) : (this.currentLanguage === 'fa' ? 'در دسترس نیست' : 'N/A');
        const formattedHashRate = blockchainData.hashRate > 0 ? this.formatHashRate(blockchainData.hashRate) : (this.currentLanguage === 'fa' ? 'در دسترس نیست' : 'N/A');
        const formattedTxCount = blockchainData.transactionCount > 0 ? this.formatNumber(blockchainData.transactionCount) : (this.currentLanguage === 'fa' ? 'در دسترس نیست' : 'N/A');
        const formattedActiveAddr = blockchainData.activeAddresses > 0 ? this.formatNumber(blockchainData.activeAddresses) : (this.currentLanguage === 'fa' ? 'در دسترس نیست' : 'N/A');
        const formattedTxVolume = blockchainData.transactionVolume > 0 ? `$${this.formatNumber(blockchainData.transactionVolume)}` : (this.currentLanguage === 'fa' ? 'در دسترس نیست' : 'N/A');
        
        // فرمت‌بندی متریک‌های پیشرفته با بررسی مقادیر صفر
        const formattedNVT = cryptoData.nvtRatio > 0 ? `${cryptoData.nvtRatio.toFixed(2)} (${this.getNVTDescription(cryptoData.nvtRatio)})` : (this.currentLanguage === 'fa' ? 'در دسترس نیست' : 'N/A');
        const formattedMayer = cryptoData.mayerMultiple > 0 ? `${cryptoData.mayerMultiple.toFixed(2)} (${this.getMayerDescription(cryptoData.mayerMultiple)})` : (this.currentLanguage === 'fa' ? 'در دسترس نیست' : 'N/A');
        const formattedPuell = cryptoData.puellMultiple > 0 ? `${cryptoData.puellMultiple.toFixed(2)} (${this.getPuellDescription(cryptoData.puellMultiple)})` : (this.currentLanguage === 'fa' ? 'در دسترس نیست' : 'N/A');
        const formattedAvgFee = stats.average_transaction_fee > 0 ? `$${stats.average_transaction_fee.toFixed(2)}` : (this.currentLanguage === 'fa' ? 'در دسترس نیست' : 'N/A');
        
        // متن راهنما برای هوش مصنوعی در مورد داده‌های ناموجود
        const dataNote = (this.currentLanguage === 'fa') ? 
            `**نکته مهم:** اگر در داده‌ها "N/A" یا "در دسترس نیست" مشاهده کردید، به این معناست که داده واقعی برای آن متریک موجود نیست (مخصوصاً برای ارزهایی غیر از بیت‌کوین). لطفاً تحلیل خود را بر اساس داده‌های موجود انجام دهید و به نبود آن داده‌ها اشاره کنید.` :
            `**Important Note:** If you see "N/A" or "در دسترس نیست" in the data, it means real data is not available for that metric (especially for non-BTC coins). Please perform your analysis based on the available data and note the missing data.`;


        if (this.currentLanguage === 'fa') {
            if (this.analysisType === 'short') {
                return `لطفاً یک تحلیل کوتاه مدت جامع و بسیار دقیق برای ارز دیجیتال ${cryptoInfo.name} (${cryptoInfo.symbol}) ارائه دهید.

    ⏰ **اطلاعات زمانی تحلیل:**
    ${timeContext.context}
    ${dataNote}

    تحلیل کوتاه مدت باید روی موارد زیر تمرکز کند:
    - تحلیل تکنیکال پیشرفته با داده‌های لحظه‌ای
    - تحلیل فاندامنتال شبکه بلاکچین (در صورت وجود داده)
    - شاخص‌های پیشرفته روی‌زنجیره (On-Chain) (در صورت وجود داده)
    - رفتار قیمت و حجم معاملات با جزئیات کامل
    - شاخص ترس و طمع و احساسات بازار
    - سیگنال‌های معاملاتی دقیق با مدیریت ریسک
    - Order Blocks و سطوح کلیدی با تاییدیه حجم
    - تحلیل سلامت شبکه و امنیت (در صورت وجود داده)

    📊 **داده‌های لحظه‌ای و واقعی:**
    - قیمت فعلی: $${formattedPrice}
    - تغییر قیمت 24 ساعته: ${cryptoData.priceChange24h.toFixed(2)}%
    - حجم معاملات 24 ساعته: $${(cryptoData.volume24h / 1000000000).toFixed(1)}B
    - ارزش بازار: $${(cryptoData.marketCap / 1000000000).toFixed(1)}B
    - عرضه در گردش: ${cryptoData.circulatingSupply ? cryptoData.circulatingSupply.toLocaleString() : 'نامشخص'}

    🎯 **شاخص‌های تکنیکال پیشرفته:**
    - RSI: ${cryptoData.technicalIndicators.rsi} (${this.getRSIInterpretation(cryptoData.technicalIndicators.rsi)})
    - MACD: ${cryptoData.technicalIndicators.macd}
    - SMA20: $${formattedSMA20}
    - SMA50: $${formattedSMA50}
    - SMA200: $${formattedSMA200}
    - باندهای بولینگر: 
    بالا=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.upper, cryptoInfo.symbol)}, 
    میانی=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.middle, cryptoInfo.symbol)}, 
    پایین=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.lower, cryptoInfo.symbol)}
    - استوکاستیک: K=${cryptoData.technicalIndicators.stochastic.k}, D=${cryptoData.technicalIndicators.stochastic.d}
    - شاخص جهت‌گیری میانگین (ADX): ${cryptoData.technicalIndicators.adx}
    - میانگین واقعی دامنه (ATR): ${cryptoData.technicalIndicators.atr}
    - حجم تعادل (OBV): ${cryptoData.technicalIndicators.obv}
    - میانگین وزنی حجم (VWAP): ${this.formatPrice(cryptoData.technicalIndicators.vwap, cryptoInfo.symbol)}

    ⛓️ **داده‌های پیشرفته بلاکچین:**
    - سختی شبکه: ${formattedDifficulty}
    - نرخ هش: ${formattedHashRate}
    - تعداد تراکنش‌ها: ${formattedTxCount}
    - آدرس‌های فعال: ${formattedActiveAddr}
    - حجم تراکنش‌ها: ${formattedTxVolume}

    📈 **متریک‌های پیشرفته شبکه:**
    - NVT Ratio: ${formattedNVT}
    - Mayer Multiple: ${formattedMayer}
    - Puell Multiple: ${formattedPuell}

    🎯 **سطوح کلیدی:**
    - سطوح حمایت: ${formattedSupportLevels}
    - سطوح مقاومت: ${formattedResistanceLevels}
    - Point of Control (POC): $${this.formatPrice(cryptoData.technicalIndicators.volumeProfile.poc, cryptoInfo.symbol)}
    - Value Area High (VAH): $${this.formatPrice(cryptoData.technicalIndicators.volumeProfile.vah, cryptoInfo.symbol)}
    - Value Area Low (VAL): $${this.formatPrice(cryptoData.technicalIndicators.volumeProfile.val, cryptoInfo.symbol)}

    🧠 **شاخص احساسات بازار:**
    - شاخص ترس و طمع: ${cryptoData.fearGreedIndex} (${this.getFearGreedText(cryptoData.fearGreedIndex)})

    **توجه بسیار مهم:** این تحلیل در تاریخ ${timeContext.currentDate} و ساعت ${timeContext.currentTime} انجام شده است. لطفاً تحلیل خود را کاملاً بر اساس شرایط فعلی بازار و داده‌های ارائه شده در این تاریخ انجام دهید. از اشاره به رویدادها یا شرایط تاریخی گذشته خودداری کنید.

    لطفاً تحلیل شامل موارد زیر باشد:

    🔍 **تحلیل فنی پیشرفته:**
    1. وضعیت فعلی ${cryptoInfo.name} با جزئیات کامل
    2. تحلیل تمام اندیکاتورها با سیگنال‌های دقیق
    3. شناسایی روند اصلی و روندهای فرعی
    4. تحلیل قدرت روند با استفاده از ADX و Volume

    ⛓️ **تحلیل فاندامنتال شبکه (بر اساس داده‌های موجود):**
    1. سلامت و امنیت شبکه بر اساس داده‌های بلاکچین (اگر موجود است)
    2. تحلیل فعالیت شبکه (آدرس‌های فعال، تراکنش‌ها) (اگر موجود است)
    3. ارزیابی ارزش شبکه با متریک‌های NVT و Mayer (اگر موجود است)
    4. تحلیل اقتصادی ماینرها با Puell Multiple (اگر موجود است)

    🎯 **پیشنهاد معاملاتی دقیق:**
    1. نقاط ورود دقیق با تاییدیه‌های لازم
    2. حد ضرر پویا بر اساس ATR و سطوح کلیدی
    3. اهداف سود چندگانه با احتمال موفقیت
    4. مدیریت موقعیت و سایز معامله

    ⚠️ **مدیریت ریسک پیشرفته:**
    1. شناسایی ریسک‌های کوتاه مدت
    2. سناریوهای مختلف قیمتی
    3. راهکارهای خروج اضطراری
    4. نسبت ریسک به ریوارد

    📊 **سناریوهای محتمل:**
    - سناریو اصلی (70% احتمال)
    - سناریو جایگزین (20% احتمال) 
    - سناریو ریسکی (10% احتمال)

    پاسخ را به زبان فارسی و به صورت ساختار یافته با استفاده از مارک‌داون ارائه دهید. از ### برای عناوین اصلی و ** برای تاکید استفاده کنید. در نقش یک تحلیلگر تکنیکال حرفه‌ای با 10 سال تجربه در بازارهای مالی، تحلیل جامعی ارائه دهید که شامل نقاط ورود/خروج دقیق، مدیریت ریسک پیشرفته و سناریوهای مختلف باشد.`;
            } else {
                return `لطفاً یک تحلیل بلند مدت جامع و بسیار دقیق برای ارز دیجیتال ${cryptoInfo.name} (${cryptoInfo.symbol}) ارائه دهید.

    ⏰ **اطلاعات زمانی تحلیل:**
    ${timeContext.context}
    ${dataNote}

    تحلیل بلند مدت باید روی موارد زیر تمرکز کند:
    - تحلیل فاندامنتال عمیق پروژه و تکنولوژی (این بخش نیاز به داده خارجی ندارد و باید توسط شما انجام شود)
    - روندهای بلندمدت قیمت با داده‌های تاریخی
    - پتانسیل رشد بر اساس متریک‌های روی‌زنجیره (در صورت وجود داده)
    - تحلیل بازار، رقبا و جایگاه پروژه
    - پیش‌بینی قیمت برای ماه‌ها و سال‌های آینده
    - چرخه‌های بازار و تحلیل زمانی
    - تأثیر رویدادهای آینده و آپدیت‌ها
    - تحلیل اقتصادی توکن و مدل تورمی

    📊 **داده‌های لحظه‌ای و واقعی:**
    - قیمت فعلی: $${formattedPrice}
    - تغییر قیمت 24 ساعته: ${cryptoData.priceChange24h.toFixed(2)}%
    - حجم معاملات 24 ساعته: $${(cryptoData.volume24h / 1000000000).toFixed(1)}B
    - ارزش بازار: $${(cryptoData.marketCap / 1000000000).toFixed(1)}B
    - عرضه در گردش: ${cryptoData.circulatingSupply ? cryptoData.circulatingSupply.toLocaleString() : 'نامشخص'}
    - حداکثر عرضه: ${cryptoData.maxSupply ? cryptoData.maxSupply.toLocaleString() : 'نامشخص'}

    🎯 **شاخص‌های تکنیکال بلندمدت:**
    - RSI: ${cryptoData.technicalIndicators.rsi}
    - MACD: ${cryptoData.technicalIndicators.macd}
    - SMA20: $${formattedSMA20}
    - SMA50: $${formattedSMA50}
    - SMA200: $${formattedSMA200}
    - باندهای بولینگر (پریود 50): 
    بالا=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.upper, cryptoInfo.symbol)}, 
    پایین=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.lower, cryptoInfo.symbol)}

    ⛓️ **داده‌های پیشرفته بلاکچین:**
    - سختی شبکه: ${formattedDifficulty}
    - نرخ هش: ${formattedHashRate}
    - تعداد تراکنش‌ها: ${formattedTxCount}
    - آدرس‌های فعال: ${formattedActiveAddr}
    - میانگین کارمزد تراکنش: ${formattedAvgFee}

    📈 **متریک‌های پیشرفته بلندمدت:**
    - NVT Ratio: ${formattedNVT}
    - Mayer Multiple: ${formattedMayer}
    - Puell Multiple: ${formattedPuell}
    - MVRV Ratio: N/A (داده در دسترس نیست)
    - نسبت ارزش شبکه به NWE: N/A (داده در دسترس نیست)

    🎯 **سطوح کلیدی بلندمدت:**
    - سطوح حمایت بلندمدت: ${formattedSupportLevels}
    - سطوح مقاومت بلندمدت: ${formattedResistanceLevels}
    - سطوح بازگشت فیبوناچی: ${cryptoData.technicalIndicators.fibonacci.levels.map(level => 
        `${(level.level * 100).toFixed(1)}%: $${this.formatPrice(level.price, cryptoInfo.symbol)}`
    ).join(', ')}

    🧠 **شاخص‌های کلان بازار:**
    - شاخص ترس و طمع: ${cryptoData.fearGreedIndex} (${this.getFearGreedText(cryptoData.fearGreedIndex)})
    - دامیننس بیت‌کوین: N/A (داده در دسترس نیست)

    **توجه بسیار مهم:** این تحلیل در تاریخ ${timeContext.currentDate} و ساعت ${timeContext.currentTime} انجام شده است. لطفاً تحلیل بلندمدت خود را با توجه به شرایط فعلی بازار و چشم‌انداز آینده بر اساس وضعیت کنونی ارائه دهید.

    لطفاً تحلیل شامل موارد زیر باشد:

    🔍 **تحلیل فاندامنتال عمیق:**
    1. ارزیابی تکنولوژی و نقشه راه پروژه
    2. تحلیل تیم توسعه‌دهندگان و شرکا
    3. بررسی کاربردپذیری و پذیرش بازار
    4. تحلیل توکنومیکس و مدل اقتصادی

    📈 **تحلیل تکنیکال بلندمدت:**
    1. شناسایی روندهای اصلی چندماهه و چندساله
    2. تحلیل چرخه‌های تاریخی قیمت
    3. شناسایی مناطق ارزشی برای سرمایه‌گذاری
    4. پیش‌بینی قیمت بر اساس مدل‌های رشد

    ⛓️ **تحلیل سلامت شبکه (بر اساس داده‌های موجود):**
    1. ارزیابی امنیت و غیرمتمرکز بودن شبکه (اگر داده موجود است)
    2. تحلیل رشد اکوسیستم و توسعه‌دهندگان
    3. بررسی فعالیت کاربران و تراکنش‌ها (اگر داده موجود است)
    4. تحلیل پایداری اقتصادی شبکه

    🎯 **استراتژی سرمایه‌گذاری:**
    1. نقاط ورود استراتژیک برای سرمایه‌گذاری
    2. استراتژی میانگین‌گیری دلاری (DCA)
    3. اهداف قیمتی کوتاه‌مدت، میان‌مدت و بلندمدت
    4. مدیریت ریسک و حفاظت از سرمایه

    🌍 **تحلیل بازار و رقابت:**
    1. بررسی جایگاه در بازار جهانی
    2. تحلیل رقبا و مزیت رقابتی
    3. تأثیر رویدادهای کلان اقتصادی
    4. سناریوهای مختلف رشد صنعت بلاکچین

    ⚠️ **ریسک‌های بلندمدت:**
    1. ریسک‌های فنی و امنیتی
    2. ریسک‌های قانونی و مقرراتی
    3. ریسک‌های بازار و رقابتی
    4. راهکارهای کاهش ریسک

    پاسخ را به زبان فارسی و به صورت ساختار یافته با استفاده از مارک‌داون ارائه دهید. از ### برای عناوین اصلی و ** برای تاکید استفاده کنید. در نقش یک تحلیلگر ارشد با 10 سال تجربه در بازارهای مالی و تخصص در فناوری بلاکچین، تحلیل جامعی ارائه دهید که شامل ارزیابی فاندامنتال، تکنیکال و روی‌زنجیره باشد.`;
            }
        } else {
            // ... (بخش انگلیسی پرامپت با همین منطق اصلاح شده است)
            if (this.analysisType === 'short') {
                return `Please provide a comprehensive and highly detailed short-term analysis for the cryptocurrency ${cryptoInfo.name} (${cryptoInfo.symbol}).

    ⏰ **Analysis Time Information:**
    ${timeContext.context}
    ${dataNote}

    Short-term analysis should focus on:
    - Advanced technical analysis with real-time data
    - Blockchain network fundamental analysis (if data is available)
    - Advanced on-chain metrics (if data is available)
    - Price behavior and volume analysis with full details
    - Fear and greed index and market sentiment
    - Precise trading signals with risk management
    - Order Blocks and key levels with volume confirmation
    - Network health and security analysis (if data is available)

    📊 **Real-time Data:**
    - Current price: $${formattedPrice}
    - 24h price change: ${cryptoData.priceChange24h.toFixed(2)}%
    - 24h trading volume: $${(cryptoData.volume24h / 1000000000).toFixed(1)}B
    - Market cap: $${(cryptoData.marketCap / 1000000000).toFixed(1)}B
    - Circulating supply: ${cryptoData.circulatingSupply ? cryptoData.circulatingSupply.toLocaleString() : 'Unknown'}

    🎯 **Advanced Technical Indicators:**
    - RSI: ${cryptoData.technicalIndicators.rsi} (${this.getRSIInterpretation(cryptoData.technicalIndicators.rsi)})
    - MACD: ${cryptoData.technicalIndicators.macd}
    - SMA20: $${formattedSMA20}
    - SMA50: $${formattedSMA50}
    - SMA200: $${formattedSMA200}
    - Bollinger Bands: 
    upper=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.upper, cryptoInfo.symbol)}, 
    middle=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.middle, cryptoInfo.symbol)}, 
    lower=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.lower, cryptoInfo.symbol)}
    - Stochastic: K=${cryptoData.technicalIndicators.stochastic.k}, D=${cryptoData.technicalIndicators.stochastic.d}
    - Average Directional Index (ADX): ${cryptoData.technicalIndicators.adx}
    - Average True Range (ATR): ${cryptoData.technicalIndicators.atr}
    - On-Balance Volume (OBV): ${cryptoData.technicalIndicators.obv}
    - Volume Weighted Average Price (VWAP): ${this.formatPrice(cryptoData.technicalIndicators.vwap, cryptoInfo.symbol)}

    ⛓️ **Advanced Blockchain Data:**
    - Network Difficulty: ${formattedDifficulty}
    - Hash Rate: ${formattedHashRate}
    - Transaction Count: ${formattedTxCount}
    - Active Addresses: ${formattedActiveAddr}
    - Transaction Volume: ${formattedTxVolume}

    📈 **Advanced Network Metrics:**
    - NVT Ratio: ${formattedNVT}
    - Mayer Multiple: ${formattedMayer}
    - Puell Multiple: ${formattedPuell}

    🎯 **Key Levels:**
    - Support Levels: ${formattedSupportLevels}
    - Resistance Levels: ${formattedResistanceLevels}
    - Point of Control (POC): $${this.formatPrice(cryptoData.technicalIndicators.volumeProfile.poc, cryptoInfo.symbol)}
    - Value Area High (VAH): $${this.formatPrice(cryptoData.technicalIndicators.volumeProfile.vah, cryptoInfo.symbol)}
    - Value Area Low (VAL): $${this.formatPrice(cryptoData.technicalIndicators.volumeProfile.val, cryptoInfo.symbol)}

    🧠 **Market Sentiment:**
    - Fear & Greed Index: ${cryptoData.fearGreedIndex} (${this.getFearGreedText(cryptoData.fearGreedIndex)})

    **CRITICAL NOTE:**
    This analysis was performed on ${timeContext.currentDate} at ${timeContext.currentTime}. Please provide your analysis entirely based on current market conditions and data as of this date. Do not refer to past historical events or conditions.

    Please include the following in your analysis:

    🔍 **Advanced Technical Analysis:**
    1. Current status of ${cryptoInfo.name} with complete details
    2. Analysis of all indicators with precise signals
    3. Identification of main trend and sub-trends
    4. Trend strength analysis using ADX and Volume

    ⛓️ **Network Fundamental Analysis (based on available data):**
    1. Network health and security based on blockchain data (if available)
    2. Network activity analysis (active addresses, transactions) (if available)
    3. Network value assessment using NVT and Mayer metrics (if available)
    4. Miner economics analysis with Puell Multiple (if available)

    🎯 **Precise Trading Recommendations:**
    1. Exact entry points with necessary confirmations
    2. Dynamic stop loss based on ATR and key levels
    3. Multiple profit targets with success probability
    4. Position management and trade sizing

    ⚠️ **Advanced Risk Management:**
    1. Identification of short-term risks
    2. Various price scenarios
    3. Emergency exit strategies
    4. Risk to reward ratio

    📊 **Probable Scenarios:**
    - Main Scenario (70% probability)
    - Alternative Scenario (20% probability)
    - Risk Scenario (10% probability)

    Respond in English and use structured markdown. Use ### for main headings and ** for emphasis. As a professional technical analyst with 10 years of experience in financial markets, provide a comprehensive analysis that includes precise entry/exit points, advanced risk management, and various scenarios.`;
            } else {
                return `Please provide a comprehensive and highly detailed long-term analysis for the cryptocurrency ${cryptoInfo.name} (${cryptoInfo.symbol}).

    ⏰ **Analysis Time Information:**
    ${timeContext.context}
    ${dataNote}

    Long-term analysis should focus on:
    - Deep fundamental analysis of project and technology (this part requires no external data and should be done by you)
    - Long-term price trends with historical data
    - Growth potential based on on-chain metrics (if data is available)
    - Market analysis, competitors and project positioning
    - Price prediction for months and years ahead
    - Market cycles and time analysis
    - Impact of future events and updates
    - Token economics and inflation model analysis

    📊 **Real-time Data:**
    - Current price: $${formattedPrice}
    - 24h price change: ${cryptoData.priceChange24h.toFixed(2)}%
    - 24h trading volume: $${(cryptoData.volume24h / 1000000000).toFixed(1)}B
    - Market cap: $${(cryptoData.marketCap / 1000000000).toFixed(1)}B
    - Circulating supply: ${cryptoData.circulatingSupply ? cryptoData.circulatingSupply.toLocaleString() : 'Unknown'}
    - Max supply: ${cryptoData.maxSupply ? cryptoData.maxSupply.toLocaleString() : 'Unknown'}

    🎯 **Long-term Technical Indicators:**
    - RSI: ${cryptoData.technicalIndicators.rsi}
    - MACD: ${cryptoData.technicalIndicators.macd}
    - SMA20: $${formattedSMA20}
    - SMA50: $${formattedSMA50}
    - SMA200: $${formattedSMA200}
    - Bollinger Bands (50 period): 
    upper=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.upper, cryptoInfo.symbol)}, 
    lower=$${this.formatPrice(cryptoData.technicalIndicators.bollingerBands.lower, cryptoInfo.symbol)}

    ⛓️ **Advanced Blockchain Data:**
    - Network Difficulty: ${formattedDifficulty}
    - Hash Rate: ${formattedHashRate}
    - Transaction Count: ${formattedTxCount}
    - Active Addresses: ${formattedActiveAddr}
    - Average Transaction Fee: ${formattedAvgFee}

    📈 **Advanced Long-term Metrics:**
    - NVT Ratio: ${formattedNVT}
    - Mayer Multiple: ${formattedMayer}
    - Puell Multiple: ${formattedPuell}
    - MVRV Ratio: N/A (Data not available)
    - Network Value to NWE Ratio: N/A (Data not available)

    🎯 **Long-term Key Levels:**
    - Long-term Support Levels: ${formattedSupportLevels}
    - Long-term Resistance Levels: ${formattedResistanceLevels}
    - Fibonacci Retracement Levels: ${cryptoData.technicalIndicators.fibonacci.levels.map(level => 
        `${(level.level * 100).toFixed(1)}%: $${this.formatPrice(level.price, cryptoInfo.symbol)}`
    ).join(', ')}

    🧠 **Macro Market Indicators:**
    - Fear & Greed Index: ${cryptoData.fearGreedIndex} (${this.getFearGreedText(cryptoData.fearGreedIndex)})
    - Bitcoin Dominance: N/A (Data not available)

    **CRITICAL NOTE:**
    This analysis was performed on ${timeContext.currentDate} at ${timeContext.currentTime}. Please provide your long-term analysis considering current market conditions and future outlook based on the present situation.

    Please include the following in your analysis:

    🔍 **Deep Fundamental Analysis:**
    1. Technology assessment and project roadmap
    2. Development team and partners analysis
    3. Usability and market adoption review
    4. Tokenomics and economic model analysis

    📈 **Long-term Technical Analysis:**
    1. Identification of multi-month and multi-year trends
    2. Analysis of historical price cycles
    3. Identification of value areas for investment
    4. Price prediction based on growth models

    ⛓️ **Network Health Analysis (based on available data):**
    1. Security and decentralization assessment (if data available)
    2. Ecosystem growth and developer analysis
    3. User activity and transaction analysis (if data available)
    4. Network economic sustainability analysis

    🎯 **Investment Strategy:**
    1. Strategic entry points for investment
    2. Dollar-cost averaging (DCA) strategy
    3. Short-term, medium-term and long-term price targets
    4. Risk management and capital protection

    🌍 **Market and Competition Analysis:**
    1. Global market positioning
    2. Competitor analysis and competitive advantages
    3. Impact of macroeconomic events
    4. Various blockchain industry growth scenarios

    ⚠️ **Long-term Risks:**
    1. Technical and security risks
    2. Legal and regulatory risks
    3. Market and competitive risks
    4. Risk mitigation strategies

    Respond in English and use structured markdown. Use ### for main headings and ** for emphasis. As a senior analyst with 10 years of experience in financial markets and blockchain technology expertise, provide a comprehensive analysis that includes fundamental, technical and on-chain assessment.`;
            }
        }
    }

    // اضافه کردن تابع کمکی برای تفسیر RSI
    getRSIInterpretation(rsi) {
        if (this.currentLanguage === 'fa') {
            if (rsi > 70) return 'اشباع خرید';
            if (rsi < 30) return 'اشباع فروش';
            return 'خنثی';
        } else {
            if (rsi > 70) return 'Overbought';
            if (rsi < 30) return 'Oversold';
            return 'Neutral';
        }
    }

    // اضافه کردن تابع برای SMA200 (در صورت نیاز)
    calculateSMA200(prices) {
        return this.calculateSMA(prices, 200);
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
    this.displayIndicators();

    // نمایش سطوح حمایت و مقاومت
    this.displayLevels();

    // نمایش پروفایل حجم
    this.displayVolumeProfile();

    // نمایش سطوح فیبوناچی
    this.displayFibonacciLevels();

    // نمایش داده‌های بلاکچین
    this.displayBlockchainData();

    // نمایش متریک‌های پیشرفته
    this.displayAdvancedMetrics();

    // نمایش تحلیل کامل با پشتیبانی از مارک‌داون
    this.displayAnalysisWithMarkdown(analysis);

    // استخراج پیشنهاد معاملاتی از تحلیل
    this.extractRecommendation(analysis);
}

displayCryptoInfo(cryptoInfo, cryptoData) {
    const cryptoInfoContent = document.getElementById('cryptoInfoContent');
    
    // بررسی وجود داده‌های لازم
    if (!cryptoData || !cryptoInfo) {
        cryptoInfoContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${this.currentLanguage === 'fa' ? 'داده‌های ارز در دسترس نیست' : 'Currency data not available'}</p>
            </div>
        `;
        return;
    }
    
    // استفاده از تابع جدید برای فرمت‌بندی قیمت با بررسی خطا
    const formattedPrice = this.formatPrice(cryptoData.price, cryptoInfo.symbol);
    const formattedVolume = cryptoData.volume24h ? (cryptoData.volume24h / 1000000000).toFixed(1) : '0.0';
    const formattedMarketCap = cryptoData.marketCap ? (cryptoData.marketCap / 1000000000).toFixed(1) : '0.0';
    const priceChange24h = cryptoData.priceChange24h || 0;
    
    cryptoInfoContent.innerHTML = `
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'نام ارز' : 'Currency Name'}</div>
            <div class="value">${cryptoInfo.name || 'N/A'}</div>
        </div>
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'نماد' : 'Symbol'}</div>
            <div class="value">${cryptoInfo.symbol || 'N/A'}</div>
        </div>
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'قیمت فعلی' : 'Current Price'}</div>
            <div class="value">$${formattedPrice}</div>
        </div>
        <div class="crypto-info-item">
            <div class="label">${this.currentLanguage === 'fa' ? 'تغییر 24h' : '24h Change'}</div>
            <div class="value ${priceChange24h >= 0 ? 'positive' : 'negative'}">${priceChange24h.toFixed(2)}%</div>
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
    
    // بررسی وجود داده‌های لازم
    if (!cryptoData || !cryptoInfo) {
        summaryContent.innerHTML = `
            <div class="error-message">
                <p>${this.currentLanguage === 'fa' ? 'داده‌های تحلیل در دسترس نیست' : 'Analysis data not available'}</p>
            </div>
        `;
        return;
    }
    
    const priceChange24h = cryptoData.priceChange24h || 0;
    const trend = priceChange24h >= 0 ? 
        (this.currentLanguage === 'fa' ? 'صعودی 📈' : 'Bullish 📈') : 
        (this.currentLanguage === 'fa' ? 'نزولی 📉' : 'Bearish 📉');
    const analysisType = this.analysisType === 'short' ? 
        (this.currentLanguage === 'fa' ? 'کوتاه مدت' : 'Short-term') : 
        (this.currentLanguage === 'fa' ? 'بلند مدت' : 'Long-term');
    
    // استفاده از تابع جدید برای فرمت‌بندی قیمت
    const formattedPrice = this.formatPrice(cryptoData.price, cryptoInfo.symbol);
    const fearGreedIndex = cryptoData.fearGreedIndex || 50;
    
    summaryContent.innerHTML = `
        <p><strong>${this.currentLanguage === 'fa' ? 'نوع تحلیل:' : 'Analysis Type:'}</strong> ${analysisType}</p>
        <p><strong>${this.currentLanguage === 'fa' ? 'وضعیت فعلی:' : 'Current Status:'}</strong> ${trend}</p>
        <p><strong>${this.currentLanguage === 'fa' ? 'قیمت فعلی:' : 'Current Price:'}</strong> $${formattedPrice}</p>
        <p><strong>${this.currentLanguage === 'fa' ? 'تغییر 24 ساعته:' : '24h Change:'}</strong> <span class="${priceChange24h >= 0 ? 'positive' : 'negative'}">${priceChange24h.toFixed(2)}%</span></p>
        <p><strong>${this.currentLanguage === 'fa' ? 'شاخص ترس و طمع:' : 'Fear & Greed Index:'}</strong> ${fearGreedIndex} (${this.getFearGreedText(fearGreedIndex)})</p>
        <p><strong>${this.currentLanguage === 'fa' ? 'تحلیل کلی:' : 'Overall Analysis:'}</strong> ${this.getGeneralAnalysis(cryptoData)}</p>
    `;
}

displayLiveChart(cryptoInfo) {
    const liveChartContainer = document.getElementById('liveChartContainer');

    try {
        const tradingViewSymbol = cryptoInfo.tradingViewSymbol || 'BINANCE:BTCUSDT';

        liveChartContainer.innerHTML = `
            <div class="tradingview-widget-container" style="height:100%;width:100%;">
                <div class="tradingview-widget-container__widget" style="height:calc(100% - 32px);width:100%;"></div>
            </div>
        `;

        const config = {
            autosize: true,
            symbol: tradingViewSymbol,
            interval: "240",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: this.currentLanguage === 'fa' ? 'fa_IR' : 'en',
            allow_symbol_change: true,
            hide_side_toolbar: true,
            hide_top_toolbar: true,
            save_image: true,
            studies: [],
            hideideas: true,
            show_popup_button: false,
            show_volume: true,
            withdateranges: true
        };

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.textContent = JSON.stringify(config);

        liveChartContainer.querySelector('.tradingview-widget-container').appendChild(script);
    } catch (error) {
        console.error('Error loading chart:', error);
        liveChartContainer.innerHTML = `
            <div class="chart-error">
                <i class="fas fa-chart-line"></i>
                <p>${this.currentLanguage === 'fa' ? 'امکان نمایش نمودار در حال حاضر وجود ندارد' : 'Chart display is currently unavailable'}</p>
            </div>
        `;
    }
}


displayIndicators() {
    const indicatorsGrid = document.getElementById('indicatorsGrid');
    
    // بررسی وجود technicalIndicators
    if (!this.cryptoData.technicalIndicators) {
        indicatorsGrid.innerHTML = `
            <div class="no-data">
                <p>${this.currentLanguage === 'fa' ? 'داده‌های شاخص‌ها در دسترس نیست' : 'Indicators data not available'}</p>
            </div>
        `;
        return;
    }
    
    const indicators = this.cryptoData.technicalIndicators;
    
    // استفاده از (??) به جای (||) برای پذیرفتن مقدار 0
    const rsiValue = indicators.rsi ?? 50;
    const macdValue = indicators.macd ?? 0;
    const fearGreedValue = this.cryptoData.fearGreedIndex ?? 50;
    const stochasticK = indicators.stochastic?.k ?? 0;
    const stochasticD = indicators.stochastic?.d ?? 0;
    const adxValue = indicators.adx ?? 0;

    // استفاده از توابع جدید برای فرمت‌بندی با بررسی خطا
    const formattedSMA20 = this.formatPrice(indicators.sma20 ?? 0, this.cryptoInfo.symbol);
    const formattedSMA50 = this.formatPrice(indicators.sma50 ?? 0, this.cryptoInfo.symbol);
    const formattedEMA12 = this.formatPrice(indicators.ema12 ?? 0, this.cryptoInfo.symbol);
    const formattedEMA26 = this.formatPrice(indicators.ema26 ?? 0, this.cryptoInfo.symbol);
    const formattedVWAP = this.formatPrice(indicators.vwap ?? 0, this.cryptoInfo.symbol);
    
    indicatorsGrid.innerHTML = `
        <div class="indicator-item">
            <div class="name">RSI</div>
            <div class="value ${this.getRSIClass(rsiValue)}">${rsiValue.toFixed(2)}</div>
        </div>
        <div class="indicator-item">
            <div class="name">MACD</div>
            <div class="value ${macdValue >= 0 ? 'positive' : 'negative'}">${this.formatSmallNumber(macdValue)}</div>
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
            <div class="name">VWAP</div>
            <div class="value">$${formattedVWAP}</div>
        </div>
        <div class="indicator-item">
            <div class="name">${this.currentLanguage === 'fa' ? 'شاخص ترس و طمع' : 'Fear & Greed Index'}</div>
            <div class="value ${this.getFearGreedClass(fearGreedValue)}">${fearGreedValue}</div>
        </div>
        <div class="indicator-item">
            <div class="name">Stochastic</div>
            <div class="value ${this.getStochasticClass(stochasticK)}">${stochasticK.toFixed(2)} / ${stochasticD.toFixed(2)}</div>
        </div>
        <div class="indicator-item">
            <div class="name">ADX</div>
            <div class="value ${this.getADXClass(adxValue)}">${adxValue.toFixed(2)}</div>
        </div>
    `;
}

// توابع کمکی جدید برای کلاس‌بندی اندیکاتورها
getStochasticClass(kValue) {
    if (kValue > 80) return 'overbought';
    if (kValue < 20) return 'oversold';
    return 'neutral';
}

getADXClass(adxValue) {
    if (adxValue > 25) return 'strong';
    if (adxValue > 20) return 'moderate';
    return 'weak';
}

displayLevels() {
    const levelsContent = document.getElementById('levelsContent');
    
    // سطوح حمایت و مقاومت بر اساس نوع تحلیل
    const supportLevels = this.analysisType === 'short' ? 
        this.cryptoData.supportLevelsShort : this.cryptoData.supportLevelsLong;
    const resistanceLevels = this.analysisType === 'short' ? 
        this.cryptoData.resistanceLevelsShort : this.cryptoData.resistanceLevelsLong;
    
    // استفاده از تابع جدید برای فرمت‌بندی سطوح
    const formattedSupportLevels = supportLevels.map(level => this.formatPrice(level.price, this.cryptoInfo.symbol));
    const formattedResistanceLevels = resistanceLevels.map(level => this.formatPrice(level.price, this.cryptoInfo.symbol));
    
    levelsContent.innerHTML = `
        <div class="level-group">
            <h4>${this.currentLanguage === 'fa' ? 'سطوح حمایت' : 'Support Levels'}</h4>
            ${supportLevels.map((level, index) => `
                <div class="level-item ${level.type === 'orderblock' ? 'orderblock' : ''}">
                    <span class="level-name">${this.currentLanguage === 'fa' ? `حمایت ${index + 1}` : `Support ${index + 1}`}</span>
                    <span class="level-value">$${formattedSupportLevels[index]}</span>
                    <span class="level-strength">${(level.strength * 100).toFixed(0)}%</span>
                    ${level.type === 'orderblock' ? '<span class="level-type">Order Block</span>' : ''}
                </div>
            `).join('')}
        </div>
        <div class="level-group">
            <h4>${this.currentLanguage === 'fa' ? 'سطوح مقاومت' : 'Resistance Levels'}</h4>
            ${resistanceLevels.map((level, index) => `
                <div class="level-item ${level.type === 'orderblock' ? 'orderblock' : ''}">
                    <span class="level-name">${this.currentLanguage === 'fa' ? `مقاومت ${index + 1}` : `Resistance ${index + 1}`}</span>
                    <span class="level-value">$${formattedResistanceLevels[index]}</span>
                    <span class="level-strength">${(level.strength * 100).toFixed(0)}%</span>
                    ${level.type === 'orderblock' ? '<span class="level-type">Order Block</span>' : ''}
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
        try {
            const fullAnalysisContent = document.getElementById('fullAnalysisContent');
            if (!fullAnalysisContent) {
                this.showError(this.currentLanguage === 'fa' ? 
                    'محتوایی برای کپی یافت نشد' : 
                    'No content found to copy');
                return;
            }
            
            const results = fullAnalysisContent.innerText;
            if (!results || results.trim() === '') {
                this.showError(this.currentLanguage === 'fa' ? 
                    'محتوای خالی است' : 
                    'Content is empty');
                return;
            }
            
            navigator.clipboard.writeText(results).then(() => {
                // نمایش نوتیفیکیشن موفقیت
                this.showNotification(this.currentLanguage === 'fa' ? 
                    'نتایج با موفقیت کپی شد ✅' : 
                    'Results copied successfully ✅', 'success');
            }).catch(err => {
                console.error('Copy failed:', err);
                this.showError(this.currentLanguage === 'fa' ? 
                    'خطا در کپی کردن نتایج' : 
                    'Error copying results');
            });
        } catch (error) {
            console.error('Copy error:', error);
            this.showError(this.currentLanguage === 'fa' ? 
                'خطا در دسترسی به کلیپ‌بورد' : 
                'Error accessing clipboard');
        }
    }

    // تابع کمکی برای نمایش نوتیفیکیشن
    showNotification(message, type = 'info') {
        // ایجاد یک نوتیفیکیشن موقت
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // استایل‌دهی به نوتیفیکیشن
        const isRtl = this.currentLanguage === 'fa';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            ${isRtl ? 'right' : 'left'}: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // حذف خودکار بعد از 3 ثانیه
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    async downloadPDF() {
        try {
            // نمایش پیام در حال پردازش
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'در حال آماده‌سازی PDF...' : 
                'Preparing PDF...');
            
            // مخفی کردن دکمه‌های عملیاتی برای نمایش بهتر در PDF
            const actionButtons = document.querySelector('.action-buttons');
            const originalDisplay = actionButtons.style.display;
            actionButtons.style.display = 'none';
            
            // اضافه کردن هدر به نتایج برای نمایش بهتر در PDF
            const resultsPanel = document.getElementById('resultsPanel');
            const originalContent = resultsPanel.innerHTML;
            
            // ایجاد هدر برای PDF
            const pdfHeader = document.createElement('div');
            pdfHeader.className = 'pdf-header';
            pdfHeader.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px; padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
                    <h1 style="margin: 0; font-size: 1.8rem;">${this.translations[this.currentLanguage]['title']}</h1>
                    <p style="margin: 5px 0 0 0; font-size: 1rem;">${this.translations[this.currentLanguage]['subtitle']}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${this.cryptoInfo.name} (${this.cryptoInfo.symbol}) - ${new Date().toLocaleDateString()}</p>
                </div>
            `;
            
            resultsPanel.insertBefore(pdfHeader, resultsPanel.firstChild);
            
            // صبر برای رندر کامل محتوا
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // گرفتن عکس از محتوای نتایج
            const canvas = await html2canvas(resultsPanel, {
                scale: 2, // افزایش کیفیت تصویر
                useCORS: true, // اجازه بارگذاری تصاویر از دامنه‌های دیگر
                allowTaint: true,
                logging: false,
                backgroundColor: '#f8f9fa'
            });
            
            // بازگرداندن دکمه‌های عملیاتی
            actionButtons.style.display = originalDisplay;
            
            // حذف هدر اضافه شده
            resultsPanel.removeChild(pdfHeader);
            
            // ایجاد PDF
            const { jsPDF } = window.jspdf;
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // محاسبه ابعاد تصویر برای تناسب با صفحه A4
            const imgWidth = 210; // عرض صفحه A4 بر حسب میلی‌متر
            const pageHeight = 295; // ارتفاع صفحه A4 بر حسب میلی‌متر
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            // اضافه کردن تصویر به PDF
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // اگر تصویر بزرگتر از یک صفحه باشد، صفحات اضافی ایجاد کن
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // ذخیره فایل PDF
            const fileName = `${this.cryptoInfo.symbol}_analysis_${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(fileName);
            
            // نمایش پیام موفقیت
            this.updateStatus(this.currentLanguage === 'fa' ? 
                'فایل PDF با موفقیت دانلود شد' : 
                'PDF downloaded successfully');
            
            // بازگرداندن وضعیت به حالت عادی بعد از 1 ثانیه
            setTimeout(() => {
                document.getElementById('analysisStatus').style.display = 'none';
            }, 1000);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showError(this.currentLanguage === 'fa' ? 
                'خطا در ایجاد فایل PDF: ' + error.message : 
                'Error creating PDF file: ' + error.message);
        }
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
