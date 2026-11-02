## پنل هوشمند تحلیل ارزهای دیجیتال با هوش مصنوعی 🤖 (نسخه ۳)
پنل تحلیل ارزهای دیجیتال با هوش مصنوعی، یک رابط کاربری تحت وب و کاملاً رایگان است که با استفاده از جدیدترین مدل‌های زبانی بزرگ (LLM) در پشت‌زمینه، تحلیل‌های لحظه‌ای و دقیقی از وضعیت فعلی، پتانسیل‌ها و ریسک‌های بازار رمز ارزها را در اختیار شما قرار می‌دهد.
کافی‌ست ارز دیجیتال مورد نظر خود را انتخاب کنید تا در کمترین زمان، گزارش کاملی از وضعیت فنی، احساسات بازار، پیش‌بینی کوتاه‌مدت و بلندمدت، سیگنال‌های حمایت و مقاومت و پیشنهاد‌های معاملاتی را از مدل هوش مصنوعی مورد نظر خود دریافت کنید.
این پنل کاملاً رایگان و از طریق GitHub Pages در دسترس است و نیازی به دیپلوی دستی توسط کاربر ندارد.

---
## ✨ امکانات:
- **📈 تحلیل هوشمند بازار:** دریافت داده‌های به‌روز از بازارهای کریپتو و تحلیل آن‌ها با هوش مصنوعی.
- **🔍 شناسایی خودکار:** تشخیص سطوح حمایت و مقاومت، الگوهای قیمتی و سیگنال‌های خرید یا فروش.
- **🎯 شاخص‌ها:** دریافت لحظه‌ای شاخص ترس و طمع، میانگین‌های متحرک، RSI و MACD.
- **🛠 رابط کاربری ساده:** استفاده آسان بدون نیاز به نصب یا دانش فنی. تنها چیزی که نیاز دارید یک کلید API است.
- **💰 پشتیبانی از ارزهای مختلف:** تقریباً تمام ارزهای دیجیتال محبوب جهان (مانند BTC، ETH، ADA، SOL و…) به‌علاوه سهام توکنی‌شده (xStock) را تحلیل کنید.
- **👽 پشتیبانی از LLMهای متنوع:** امکان انتخاب بین مدل‌های مختلف هوش مصنوعی مانند DeepSeek، GPT-OSS، Grok و…

---
## 🆕 امکانات نسخه ۳ (بازطراحی کامل):
- **🎨 رابط کاربری مدرن:** طراحی Glassmorphism با تم روشن/تاریک، انیمیشن‌های ریزتعامل، اسکلتون لودینگ، ظاهر شدن پلکانی کارت‌ها و افکت Ripple.
- **🌐 دوزبانه کامل (فارسی/انگلیسی):** پشتیبانی همزمان RTL و LTR با یک دکمه؛ نام ارز، عنوان صفحه و همه نماها با تغییر زبان دوباره رندر می‌شوند.
- **📊 اندیکاتورهای پیشرفته:** علاوه بر RSI و MACD، حالا بانجر، استوکاستیک، ADX، ATR، OBV، VWAP، ایچیموکو، فیبوناچی و Volume Profile هم محاسبه می‌شود.
- **🔗 منبع داده سه‌لایه:** Binance → CoinGecko → CoinPaprika با خطایابی خودکار (رفع مشکل CORS بایننس).
- **🧩 ماژولار:** پیش از این بازطراحی، همه منطق پروژه در یک فایل `script.js` به طول ۳۹۱۶ خط جمع شده بود؛ آن فایل نسل اول (legacy) حالا حذف شده و دیگر در ریپو قرار ندارد. کد فعلی به ۱۴ ماژول ES مجزا (سرویس‌ها، تحلیل، UI) تقسیم شده و jQuery و Select2 حذف شدند؛ جای آن‌ها یک کمبوکس جستجوپذیر و دسترس‌پذیر نشسته است.
- **🔒 امنیت و پایداری:** کلید API فقط از فیلد «کلید API OpenRouter» در رابط کاربری خوانده و در همان مرورگر ذخیره می‌شود (هیچ کلیدی در کد یا ریپو نیست)؛ خروجی هوش مصنوعی با DOMPurify پاک‌سازی می‌شود، همه درخواست‌ها تایم‌اوت دارند و خطاهای OpenRouter به‌دقت مدیریت می‌شوند (کلید نامعتبر / اعتبار ناکافی / محدودیت نرخ).

---
## 🚀 راهنمای استفاده (مهم):
**برای استفاده از پنل، به یک کلید API از سرویس OpenRouter نیاز دارید.**

### مرحله ۱: ساخت کلید API در OpenRouter
- به سایت [OpenRouter.ai](https://openrouter.ai) بروید و یک حساب کاربری رایگان بسازید.
- پس از ورود به حساب کاربری، به صفحه [تنظیمات کلیدهای API](https://openrouter.ai/settings/keys) بروید.
- روی دکمه `Create API Key` کلیک کنید، یک نام برای کلید خود انتخاب کنید (مثلاً Crypto Panel) و آن را بسازید.
- کلید API ساخته‌شده را کپی کنید. این کلید چیزی شبیه به `sk-or-v1-61837r92b5aa3…` خواهد بود.
- در پنل OpenRouter وارد بخش [Training, Logging, & Privacy](https://openrouter.ai/settings/privacy) شوید و در منوی Privacy Settings سه گزینه اول را فعال کنید.

### مرحله ۲: استفاده از پنل تحلیل
##### حالا که کلید را دارید، فقط چند کلیک با تحلیل فاصله دارید:
- به پنل تحلیل کریپتو مراجعه کنید: https://imotb.github.io/ai-crypto-analysis
- کلید API را در کادر `کلید API OpenRouter` قرار دهید. کلید فقط در مرورگر خودتان ذخیره می‌شود و در بازدیدهای بعدی همان کادر به‌طور خودکار از آن مقدار می‌گیرد.
- مدل هوش مصنوعی مورد نظر را برای تحلیل از لیست انتخاب کنید.
- ارز دیجیتال مورد نظر را برای تحلیل از لیست انتخاب کنید.
- در آخر نوع تحلیل را انتخاب کنید و صبر کنید تا هوش مصنوعی گزارش کامل تحلیل را برای شما آماده کند.

---
## ⚠️ نکات مهم:
- **کلید API** خود را مانند یک رمز عبور محافظت کنید و آن را در اختیار کسی قرار ندهید.
- اگر با خطای **Invalid API Key** مواجه شدید، از درست بودن کلید API واردشده اطمینان حاصل کنید.
- در صورت بروز خطای **Rate Limit Exceeded**، چند دقیقه صبر کنید و دوباره تلاش کنید.
- اگر اینترنت شما قطع باشد، پیام «اتصال اینترنت برقرار نیست» را می‌بینید و بقیه بخش‌های داشبورد (نمودار و اندیکاتورها) از بین نمی‌روند.
- برای استفاده از مدل‌های پیشرفته‌تر هوش مصنوعی (مانند Claude Opus، GLM، Grok و Gemini نسخه‌های غیررایگان) نیاز به [خرید اعتبار API](https://openrouter.ai/settings/credits) از OpenRouter دارید.

#### ⭕️ تحلیل‌های ارائه‌شده توسط این پنل صرفاً جنبه اطلاع‌رسانی و آموزشی دارند و نباید به‌عنوان توصیه مالی تلقی شوند. بازار ارزهای دیجیتال پرنوسان است. همیشه پیش از هرگونه تصمیم‌گیری برای سرمایه‌گذاری، تحقیقات شخصی خود را انجام دهید.

---

## Smart Cryptocurrency Analysis Panel with AI 🤖 (Version 3)
The Crypto Analysis Panel with AI is a completely free web interface that uses the latest Large Language Models (LLMs) behind the scenes to give you real-time, accurate analysis of the current state, potential and risks of the cryptocurrency market.
Simply select the cryptocurrency you want and, in the shortest possible time, receive a full report on technical condition, market sentiment, short-term and long-term forecasts, support/resistance signals and trading suggestions from your chosen AI model.
This panel is completely free and available via GitHub Pages; it does not require any manual deployment by the user.

---
## ✨ Features:
- **📈 Smart market analysis:** Pull up-to-date crypto market data and analyse it with AI.
- **🔍 Automatic detection:** Detect support and resistance levels, price patterns and buy/sell signals.
- **🎯 Indicators:** Instant Fear & Greed index, moving averages, RSI and MACD.
- **🛠 Simple interface:** Easy to use with no installation or technical knowledge. All you need is an API key.
- **💰 Broad asset coverage:** Analyse almost all of the world's popular cryptocurrencies (BTC, ETH, ADA, SOL, etc.) plus tokenized stocks (xStock).
- **👽 Many LLMs:** Choose between different AI models such as DeepSeek, GPT-OSS, Grok, etc.

---
## 🆕 What's new in Version 3 (complete redesign):
- **🎨 Modern UI:** Glassmorphism design with dark/light themes, micro-interactions, skeleton loaders, staggered card reveals and button ripple effects.
- **🌐 Fully bilingual (Persian/English):** Simultaneous RTL and LTR support with a single toggle — coin names, the page title and every view re-render on switch.
- **📊 Advanced indicators:** Beyond RSI and MACD, it now computes Bollinger Bands, Stochastic, ADX, ATR, OBV, VWAP, Ichimoku, Fibonacci retracement and Volume Profile (POC/VAH/VAL).
- **🔗 Three-layer data fallback:** Binance → CoinGecko → CoinPaprika with automatic degradation (fixes Binance browser CORS blocking).
- **🧩 Modular architecture:** Before this redesign all logic lived in a single legacy `script.js` of 3,916 lines. That first-generation file has since been deleted and no longer ships in the repository — what exists today is 14 small ES modules (services / analysis / UI). jQuery and Select2 were removed as well and replaced with an accessible, searchable custom combobox.
- **🔒 Security & robustness:** The API key is read only from the "OpenRouter API Key" field in the UI and persisted in your own browser — no key is ever shipped in code or the repository. AI markdown is sanitized with DOMPurify, every request has an AbortController timeout, and OpenRouter failures are mapped to precise, localized errors (INVALID_KEY / NO_CREDITS / RATE_LIMIT).

---
## 🏗 Project structure (v3):
```
index.html              semantic RTL/LTR shell: settings form, pipeline, results grid
style.css               design-token system (CSS vars, data-theme), glass cards, components
js/
  main.js               orchestrator: state + 5-step analysis pipeline
  config.js             guarded localStorage persistence (API key / theme / language)
  i18n.js               Persian & English dictionaries + localized chrome (title, aria-labels)
  catalog.js            24 AI models, 114 assets (cryptocurrencies + tokenized stocks)
  services/
    http.js             fetchJson with AbortController timeouts + non-JSON 200 guard
    market.js           price + klines: Binance (data-api.binance.vision) → CoinGecko → CoinPaprika
    ai.js               OpenRouter chat completions + error-code mapping
    blockchain.js       chain stats, network metrics (NVT/Mayer), news, Fear & Greed
  analysis/
    indicators.js       RSI, MACD, SMA/EMA, Bollinger, Stochastic, ADX, ATR, OBV, VWAP,
                        Ichimoku, Fibonacci, Volume Profile, support/resistance detection
    promptBuilder.js    localized short/long-term analysis prompts
  ui/
    fx.js               theme toggle, ripple, scroll reveal, toast system, icon fallback
    combo.js            accessible search combobox (replaces jQuery Select2)
    views.js            renderers + DOMPurify/XSS sanitizer + safe link filtering
    widgets.js          TradingView advanced-chart embed
```

**Hosting:** the site is plain static files (no build step) published via GitHub Pages at
https://imotb.github.io/ai-crypto-analysis — just push to the repository; no manual deployment is needed.

---
## 🚀 User guide (important):
**To use the panel you need an API key from the OpenRouter service.**

### Step 1: Create an API key in OpenRouter
- Go to the [OpenRouter.ai](https://openrouter.ai) site and create a free account.
- After logging in, go to the [API Key Settings](https://openrouter.ai/settings/keys) page.
- Click the `Create API Key` button, choose a name for your key (e.g. Crypto Panel) and create it.
- Copy the generated key. It will look something like `sk-or-v1-61837r92b5aa3…`.
- In the OpenRouter panel, open the [Training, Logging, & Privacy](https://openrouter.ai/settings/privacy) section and enable the first three options in the Privacy Settings menu.

### Step 2: Using the Analysis Panel
###### Now that you have the key, you are only a few clicks away from an analysis:
- Visit the Crypto Analysis Panel: https://imotb.github.io/ai-crypto-analysis
- Paste the key you copied into the `OpenRouter API Key` box. The key is stored only in your own browser and the same box is auto-filled from it on every visit.
- Select the AI model you want to analyze with from the list.
- Select the cryptocurrency you want to analyze from the list.
- Finally, choose the analysis type and wait for the AI to prepare the full report for you.

---
## ⚠️ Important notes:
- Protect your **API key** like a password and do not share it with anyone.
- If you get an **Invalid API Key** error, make sure the key you entered is correct.
- If you get a **Rate Limit Exceeded** error, wait a few minutes and try again.
- If you are offline you will see a "Network unavailable" message, and the chart and indicators already on screen are not discarded.
- To use more advanced AI models (Claude Opus, GLM, Grok and Gemini non-free tiers) you need to [purchase API credits](https://openrouter.ai/settings/credits) from OpenRouter.

#### ⭕️ The analyses provided by this panel are for informational and educational purposes only and must not be considered financial advice. The cryptocurrency market is volatile. Always do your own research before making any investment decision.

---

## 📜 License
This project is licensed under the [MIT License](https://github.com/imotb/ai-crypto-analysis/raw/refs/heads/main/LICENSE).
