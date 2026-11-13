## پنل هوشمند تحلیل ارزهای دیجیتال با هوش مصنوعی 🤖 (نسخه ۴)
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
## 🆕 امکانات نسخه ۴ (جستجوی وب زنده):
- **🔎 جستجوی وب زنده از منابع رسمی:** یک سرویس مستقل در `js/services/websearch.js` که هم‌زمان با بقیهٔ مرحله‌های تحلیل، سه پرس‌وجوی محدود به `site:` را به Jina (`s.jina.ai`) می‌فرستد و نتیجه فقط از سه منبع رسمی مالی است: Yahoo Finance (`finance.yahoo.com/quote`)، Barchart (`barchart.com/crypto/quotes`) و Perplexity Finance (`perplexity.ai/finance`). همیشه منطقهٔ ایالات متحده و زبان انگلیسی (`gl=US&hl=en`)، صرف‌نظر از زبان رابط کاربری.
- **🧠 تحلیل «امروز» به‌جای تحلیل کلی:** نتیجهٔ جستجو در یک بلوک ساختاریافته به نام `LIVE WEB SEARCH RESULTS` به پرامپت هوش مصنوعی افزوده می‌شود و ۸ قانون اجباری استفاده از داده‌های وب را حمل می‌کند: ترکیب با داده‌های پنل و تاریخ‌زدن به امروز، گزارش هر دو قیمت در صورت اختلاف، اولویت داده‌های ۷۲ ساعت اخیر، استناد به منبع برای هر ادعای وب (مثلاً «per Barchart»)، و در پایان یک فهرست Sources که فقط نشانی‌های واقعاً استفاده‌شده را دارد.
- **🃏 کارت جدید «جستجوی وب زنده»:** با نشان منبع، پیوند عنوان، خلاصه و تاریخ; دقیقاً مثل کارت اخبار با `textContent` و `safeHref` و DOMPurify در برابر XSS پاک‌سازی می‌شود. فهرست سفید URL در سرویس یک‌بار دیگر نتایج را پالایش می‌کند، بنابراین نشت موتور جستجو (مثلاً صفحهٔ یک نماد دیگر) هرگز به کارت یا پرامپت نمی‌رسد.
- **🔑 فیلد اختیاری «کلید API جستجوی وب (Jina)»:** درست زیر فیلد کلید OpenRouter، با دکمهٔ نمایش/پنهان‌سازی; در `localStorage` با کلید `websearch_api_key` و کاملاً جدا از کلید OpenRouter ذخیره می‌شود. کلید را از [dashboard.jina.ai](https://dashboard.jina.ai) بگیرید.
- **🛡 غیرکشنده به‌طور کامل:** بدون کلید، با کلید نامعتبر، یا در زمان محدودیت نرخ، هیچ درخواستی به سرویس جستجو فرستاده نمی‌شود (یا خطای مربوطه نمایش داده می‌شود) و بقیهٔ داشبورد عیناً مثل قبل کار می‌کند. جستجو هرگز درخواست‌های Binance/CoinGecko/CoinPaprika/OpenRouter را بلاک نمی‌کند و از هیچ پراکسی CORS عمومی استفاده نمی‌شود، چون کلید را فاش می‌کرد.
- **💳 هزینهٔ تقریبی:** هر تحلیل سه پرس‌وجو ارسال می‌کند و هر پرس‌وجو به‌طور ثابت حدود ۱۰٬۰۰۰ توکن Jina مصرف می‌کند؛ در مجموع چیزی نزدیک ۳۰٬۰۰۰ توکن برای هر تحلیل. پلن رایگان Jina با ۱۰ میلیون توکن، بیش از ۳۰۰ تحلیل را پوشش می‌دهد.

- **⌨️ پاسخ هوش مصنوعی به‌صورت زنده تایپ می‌شود:** گزارش با `stream: true` و SSE از OpenRouter دریافت می‌شود و هر بخش به‌محض رسیدن روی صفحه نمایش داده می‌شود (رندرهای میانی تا حد ۱۵۰ میلی‌ثانیه ادغام می‌شوند)؛ دیگر لازم نیست چند دقیقه به یک کارت خالی خیره شوید. اگر اتصال در میانهٔ راه قطع شود، همان متنی که نوشته شده حفظ می‌شود و یک یادداشت صادقانه («ارسال گزارش پیش از پایان قطع شد…») به آن افزوده می‌شود؛ دکمه‌های کپی/PDF تا پایان نوشتن غیرفعال‌اند.
- **🔗 فهرست منابع به شکل چیپ نمایش داده می‌شود:** نشانی‌های انتهای گزارش هوش مصنوعی از متن بیرون کشیده، یک‌بار شسته و به صورت قرص‌های رنگی (با همان پالت نشان‌های کارت جستجو) در می‌آیند؛ مسیر بلند با بیضی بریده می‌شود و نشانی کامل در `title` می‌ماند. با `overflow-wrap: anywhere` دیگر هیچ نشانی انگلیسیِ بلند از کارت فارسی بیرون نمی‌زند و در موبایل سرریز ایجاد نمی‌شود.

---
## 🆕 امکانات نسخه ۳ (بازطراحی کامل):
- **🎨 رابط کاربری مدرن:** طراحی Glassmorphism با تم روشن/تاریک، انیمیشن‌های ریزتعامل، اسکلتون لودینگ، ظاهر شدن پلکانی کارت‌ها و افکت Ripple.
- **🌐 دوزبانه کامل (فارسی/انگلیسی):** پشتیبانی همزمان RTL و LTR با یک دکمه؛ نام ارز، عنوان صفحه و همه نماها با تغییر زبان دوباره رندر می‌شوند.
- **📊 اندیکاتورهای پیشرفته:** علاوه بر RSI و MACD، حالا بانجر، استوکاستیک، ADX، ATR، OBV، VWAP، ایچیموکو، فیبوناچی و Volume Profile هم محاسبه می‌شود.
- **💸 دقت پویا برای قیمت‌های بسیار کوچک:** تعداد اعشار بر پایه قدر عدد انتخاب می‌شود تا همیشه ۴ رقم بامعنا دیده شود. دارایی‌هایی مثل BABYDOGE با قیمت ۳٫۱۳×۱۰⁻¹⁰ به‌جای `$0.00000000` مقدار واقعی `$0.0000000003135` را در ویجت قیمت، اندیکاتورها، سطوح حمایت/مقاومت، فیبوناچی و پرامپت نشان می‌دهند؛ برای اعداد کوچک‌تر از ۱۰⁻¹⁸ هم از نماد علمی استفاده می‌شود.
- **🔗 منبع داده سه‌لایه:** Binance → CoinGecko → CoinPaprika با خطایابی خودکار (رفع مشکل CORS بایننس).
- **🧩 ماژولار:** پیش از این بازطراحی، همه منطق پروژه در یک فایل `script.js` به طول ۳۹۱۶ خط جمع شده بود؛ آن فایل نسل اول (legacy) حالا حذف شده و دیگر در ریپو قرار ندارد. کد فعلی به ۱۵ ماژول ES مجزا (سرویس‌ها، تحلیل، UI) با مجموعاً حدود ۳٬۳۵۰ خط تقسیم شده و jQuery و Select2 حذف شدند؛ جای آن‌ها یک کمبوکس جستجوپذیر و دسترس‌پذیر نشسته است.
- **🔒 امنیت و پایداری:** کلید API فقط از فیلد «کلید API OpenRouter» در رابط کاربری خوانده و در همان مرورگر ذخیره می‌شود (هیچ کلیدی در کد یا ریپو نیست)؛ خروجی هوش مصنوعی با DOMPurify پاک‌سازی می‌شود، همه درخواست‌ها تایم‌اوت دارند و خطاهای OpenRouter به‌دقت مدیریت می‌شوند (کلید نامعتبر / اعتبار ناکافی / محدودیت نرخ).
- **🧵 ادامه خودکار گزارش‌های بلند:** هر درخواست با `max_tokens: 8192` ارسال می‌شود؛ اگر مدل پاسخ را در سقف طول قطع کند (`finish_reason: "length"`)، داشبورد خودش متن تولیدشده را به‌عنوان پیام دستیار به همان گفتگو اضافه می‌کند و درخواست ادامه می‌دهد (حداکثر ۲ بار) و تکه‌ها را بدون فاصله به هم می‌چسباند تا جمله، جدول یا تیتر وسط نمی‌شکند. اگر باز هم ناقص ماند، گزارش همان‌جا نمایش داده می‌شود و فقط یک یادداشت محلی‌سازی‌شده به آن افزوده می‌شود: «پاسخ به دلیل محدودیت طول مدل ناقص ماند…».

---
## ⚠️ محدودیت‌های شناخته‌شده (داده‌های درون‌شبکه‌ای):
این پنل فقط از APIهای رایگان و بدون کلید استفاده می‌کند؛ به همین دلیل برخی شاخص‌های زنجیره‌ای برای همه دارایی‌ها در دسترس نیستند:

- **🔗 شاخص‌های مخصوص شبکه‌های UTXO:** نسبت NVT، نرخ هش، سختی شبکه، تعداد آدرس‌های فعال و حجم تراکنش‌ها فقط برای شبکه‌های UTXO (مانند BTC، LTC، DOGE، DASH، ZEC، XMR) و ETH قابل دریافت است. برای پلتفرم‌های قرارداد هوشمند (ترون، سولانا، کاردانو، پولکادات) و سهام توکنی‌شده (xStock) منبع رایگانی برای این اعداد وجود ندارد.
- **🧩 پنل «قابل استفاده نیست»:** در این دارایی‌ها به‌جای جدول خالی یا عدد صفر، یک پنل توضیحی (فارسی/انگلیسی) نمایش داده می‌شود که دقیقاً می‌گوید کدام شاخص و چرا موجود نیست.
- **📈 ضریب مایر برای همه دارایی‌ها:** ضریب مایر فقط به قیمت و میانگین ۲۰۰ روزه نیاز دارد؛ بنابراین برای هر دارایی که دست‌کم ۲۰۰ روز تاریخچه قیمت داشته باشد محاسبه می‌شود، مستقل از در دسترس بودن داده‌های درون‌شبکه‌ای.
- **⛏ ضریب پوئل:** بر پایه درآمد روزانه ماینرها محاسبه می‌شود و فقط برای بیت‌کوین معنا دارد؛ چون منبع رایگانی برای میانگین ۳۶۵ روزه انتشار وجود ندارد، به‌جای عدد ساختگی مقدار «داده در دسترس نیست» نمایش داده می‌شود.
- **🤖 محدودیت ساخت داده در پرامپت:** متن ارسالی به مدل صریحاً فهرست می‌کند کدام شاخص‌ها برای این دارایی محاسبه نشده‌اند و از مدل می‌خواهد برای آن‌ها عدد نسازد، آن‌ها را از منبع دیگری نقل نکند و نبود داده را ضعف شبکه تفسیر نکند.

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
- **(اختیاری، نسخه ۴)** کلید Jina را در کادر `کلید API جستجوی وب (Jina)` قرار دهید تا اخبار و قیمت‌های لحظه‌ای منابع رسمی به تحلیل اضافه شود. این کادر در `localStorage` مرورگر شما با کلید `websearch_api_key` ذخیره می‌شود و خالی‌گذاشتن آن فقط بخش جستجو را خاموش می‌کند.
- مدل هوش مصنوعی مورد نظر را برای تحلیل از لیست انتخاب کنید.
- ارز دیجیتال مورد نظر را برای تحلیل از لیست انتخاب کنید.
- در آخر نوع تحلیل را انتخاب کنید و صبر کنید تا هوش مصنوعی گزارش کامل تحلیل را برای شما آماده کند.

### مرحله ۳: ساخت کلید API در Jina (اختیاری)
- به سایت [jina.ai](https://jina.ai/api-dashboard) بروید و یک حساب کاربری رایگان بسازید.
- پس از ورود به حساب کاربری، به صفحه [تنظیمات کلیدهای API](https://jina.ai/api-dashboard/key-manager) بروید.
- کلید API ساخته‌شده را کپی کنید. این کلید چیزی شبیه به `jina_9••••••--8uVK` خواهد بود.
- کلید Jina را در کادر `کلید API جستجوی وب (Jina)` در [پنل تحلیل](https://imotb.github.io/ai-crypto-analysis/) قرار دهید تا اخبار و قیمت‌های لحظه‌ای منابع رسمی به تحلیل اضافه شود.
---
## ⚠️ نکات مهم:
- **کلید API** خود را مانند یک رمز عبور محافظت کنید و آن را در اختیار کسی قرار ندهید.
- اگر با خطای **Invalid API Key** مواجه شدید، از درست بودن کلید API واردشده اطمینان حاصل کنید.
- در صورت بروز خطای **Rate Limit Exceeded**، چند دقیقه صبر کنید و دوباره تلاش کنید.
- خطای **جستجوی وب** هرگز تحلیل را متوقف نمی‌کند: کلید نامعتبر Jina، محدودیت نرخ یا قطعی `s.jina.ai` فقط کارت جستجو را به حالت خطا می‌برد و گزارش هوش مصنوعی فقط با داده‌های پنل ساخته می‌شود.
- اگر اینترنت شما قطع باشد، پیام «اتصال اینترنت برقرار نیست» را می‌بینید و بقیه بخش‌های داشبورد (نمودار و اندیکاتورها) از بین نمی‌روند.
- برای استفاده از مدل‌های پیشرفته‌تر هوش مصنوعی (مانند Claude Opus، GLM، Grok و Gemini نسخه‌های غیررایگان) نیاز به [خرید اعتبار API](https://openrouter.ai/settings/credits) از OpenRouter دارید.

#### ⭕️ تحلیل‌های ارائه‌شده توسط این پنل صرفاً جنبه اطلاع‌رسانی و آموزشی دارند و نباید به‌عنوان توصیه مالی تلقی شوند. بازار ارزهای دیجیتال پرنوسان است. همیشه پیش از هرگونه تصمیم‌گیری برای سرمایه‌گذاری، تحقیقات شخصی خود را انجام دهید.

---

## Smart Cryptocurrency Analysis Panel with AI 🤖 (Version 4)
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
## 🆕 What's new in Version 4 (live web search):
- **🔎 Live web search from official sources only:** a fully independent service in `js/services/websearch.js` fires three `site:`-restricted queries at Jina (`s.jina.ai`) in parallel with the other pipeline steps. Results come only from Yahoo Finance (`finance.yahoo.com/quote`), Barchart (`barchart.com/crypto/quotes`) and Perplexity Finance (`perplexity.ai/finance`), always with US region and English (`gl=US&hl=en`) regardless of the UI language.
- **🧠 A "today" analysis instead of a generic one:** the results are injected into the OpenRouter prompt as a structured `LIVE WEB SEARCH RESULTS` block that carries 8 mandatory WEB DATA USAGE RULES — merge the fresh findings with the panel's technical values and date the report to today, report both numbers when a live quote disagrees with the panel snapshot, prefer items from the last 72 hours, attribute every web-sourced claim to its source (e.g. "(per Barchart)"), and finish with a Sources list containing only the URLs actually used.
- **🃏 New "Live Web Search" result card:** source badge, clickable title, snippet and optional date. It is sanitized exactly like the news card (`textContent` + `safeHref` + DOMPurify). A URL allowlist re-filters every item inside the service, so an engine leak (a page for a different symbol) never reaches the card or the prompt.
- **🔑 Optional "Web Search API Key (Jina)" field:** placed right under the OpenRouter key, with the same show/hide eye toggle. It persists in `localStorage` under `websearch_api_key`, completely separate from `openrouter_api_key`. Get a free key at [dashboard.jina.ai](https://dashboard.jina.ai).
- **🛡 Non-fatal by design:** with no key no request is sent at all; an invalid key or a rate limit only marks the search step as failed and toasts a localized notice, while every other card behaves exactly as before. The search never blocks the Binance/CoinGecko/CoinPaprika/OpenRouter requests and no public CORS proxy is ever used, because that would leak the key.
- **💳 Approximate cost:** each analysis issues 3 queries and each query is billed a flat ~10,000 Jina tokens, so an analysis costs roughly 30,000 Jina tokens. The free 10M-token tier covers 300+ analyses.

- **⌨️ The AI report types itself in live:** the report is fetched from OpenRouter with `stream: true` over SSE and each chunk is painted as it arrives (intermediate renders coalesce to ~150 ms), so you no longer stare at an empty card for minutes. If the stream stops halfway, the text that was already written is kept and an honest notice is appended ("The report stream stopped before it finished…"); the Copy/PDF buttons stay disabled while it writes.
- **🔗 The Sources list became chips:** the URLs at the end of the AI report are extracted, cleaned and deduped, then rendered as colored pills reusing the search-card source palette; long paths truncate with an ellipsis and keep the full URL in `title`. Combined with `overflow-wrap: anywhere`, a long English URL can no longer escape a Persian card or overflow the page on mobile.

---
## 🆕 What's new in Version 3 (complete redesign):
- **🎨 Modern UI:** Glassmorphism design with dark/light themes, micro-interactions, skeleton loaders, staggered card reveals and button ripple effects.
- **🌐 Fully bilingual (Persian/English):** Simultaneous RTL and LTR support with a single toggle — coin names, the page title and every view re-render on switch.
- **📊 Advanced indicators:** Beyond RSI and MACD, it now computes Bollinger Bands, Stochastic, ADX, ATR, OBV, VWAP, Ichimoku, Fibonacci retracement and Volume Profile (POC/VAH/VAL).
- **💸 Dynamic precision for ultra-low prices:** a single shared `formatPrice` in `js/format.js` replaced the two divergent copies (one in the UI, one in the prompt builder) that both hardcoded `toFixed(8)` and a whitelist of "cheap" symbols. Decimal places are now derived from the magnitude so four significant digits always stay visible: BABYDOGE at 3.13e-10 renders `$0.0000000003135` in the price widget, indicator chips, support/resistance, Fibonacci levels and the AI prompt instead of `$0.00000000`, falling back to scientific notation below 1e-18.
- **🔗 Three-layer data fallback:** Binance → CoinGecko → CoinPaprika with automatic degradation (fixes Binance browser CORS blocking).
- **🧩 Modular architecture:** Before this redesign all logic lived in a single legacy `script.js` of 3,916 lines. That first-generation file has since been deleted and no longer ships in the repository — what exists today is 15 small ES modules (services / analysis / UI) totalling roughly 3,350 lines. jQuery and Select2 were removed as well and replaced with an accessible, searchable custom combobox.
- **🔒 Security & robustness:** The API key is read only from the "OpenRouter API Key" field in the UI and persisted in your own browser — no key is ever shipped in code or the repository. AI markdown is sanitized with DOMPurify, every request has an AbortController timeout, and OpenRouter failures are mapped to precise, localized errors (INVALID_KEY / NO_CREDITS / RATE_LIMIT).
- **🧵 Auto-continue for long reports:** every request is sent with `max_tokens: 8192`; when the model cuts the answer at its output limit (`finish_reason: "length"`), the dashboard appends the partial answer as an assistant turn and asks the same conversation to continue — up to 2 extra requests — then stitches the pieces with no separator so a sentence, table row or heading is never split. If the report is still incomplete, what was produced is shown as-is with a localized notice added: "The response stayed incomplete because of the model's output length limit…".

---
## ⚠️ Known limitations (on-chain data):
The panel talks only to free, key-less APIs, so some chain-level metrics genuinely do not exist for every asset:

- **🔗 UTXO-only metrics:** NVT ratio, hash rate, network difficulty, active addresses and transaction volume are available only for UTXO chains (BTC, LTC, DOGE, DASH, ZEC, XMR) and ETH. Smart-contract platforms (TRON, Solana, Cardano, Polkadot) and tokenized stocks (xStock) have no free source for these numbers.
- **🧩 "Not applicable" panel:** for those assets the UI shows an informational panel — in Persian or English — naming exactly which metric is missing and why, instead of an empty table or a misleading zero.
- **📈 Mayer Multiple for every asset:** Mayer is price ÷ 200-day moving average, so it is computed for any asset with at least 200 days of price history, regardless of on-chain availability.
- **⛏ Puell Multiple:** built from daily miner revenue, so it is meaningful for Bitcoin only. No free feed exposes the 365-day issuance average, and the card reports "no data" rather than a fabricated constant.
- **🤖 Prompt guardrail:** the analysis prompt explicitly lists the metrics that were not computed for the selected asset and instructs the model not to invent values, not to quote them from elsewhere, and not to read missing data as network weakness.

---
## 🏗 Project structure (v4):
```
index.html              semantic RTL/LTR shell: settings form, pipeline, results grid
style.css               design-token system (CSS vars, data-theme), glass cards, components
js/
  main.js               orchestrator: state + 6-step analysis pipeline
  config.js             guarded localStorage persistence (API key / search key / theme / language)
  i18n.js               Persian & English dictionaries + localized chrome (title, aria-labels)
  catalog.js            37 AI models, 114 assets (cryptocurrencies + tokenized stocks)
  format.js             one shared price formatter — dynamic precision down to 1e-18
  services/
    http.js             fetchJson with AbortController timeouts + non-JSON 200 guard
    market.js           price + klines: Binance (data-api.binance.vision) → CoinGecko → CoinPaprika
    ai.js               OpenRouter chat completions + error-code mapping + auto-continue on "length"
    blockchain.js       chain stats, network metrics (NVT/Mayer), news, Fear & Greed
    websearch.js        Jina live search: 3 site-restricted queries, URL allowlist, never throws
  analysis/
    indicators.js       RSI, MACD, SMA/EMA, Bollinger, Stochastic, ADX, ATR, OBV, VWAP,
                        Ichimoku, Fibonacci, Volume Profile, support/resistance detection
    promptBuilder.js    localized short/long-term analysis prompts + LIVE WEB SEARCH RESULTS block
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
- **(Optional, Version 4)** Put a Jina key in the `Web Search API Key (Jina)` box to merge live official-source data into the report. It is stored in your browser under `websearch_api_key`, separate from the OpenRouter key, and leaving it empty only switches the search step off. Create one at [dashboard.jina.ai](https://dashboard.jina.ai).
- Select the AI model you want to analyze with from the list.
- Select the cryptocurrency you want to analyze from the list.
- Finally, choose the analysis type and wait for the AI to prepare the full report for you.

### Step 3: Create an API Key on Jina (Optional)
- Go to [jina.ai](https://jina.ai/api-dashboard) and create a free account.
- Once logged in, navigate to the [API Key Settings](https://jina.ai/api-dashboard/key-manager) page.
- Copy the generated API key. It will look something like `jina_9••••••--8uVK`.
- Enter the Jina key into the `Web Search API Key (Jina)` field in the [Analysis Panel](https://imotb.github.io/ai-crypto-analysis/) to incorporate real-time news and prices from official sources into your analysis.
---
## ⚠️ Important notes:
- Protect your **API key** like a password and do not share it with anyone.
- If you get an **Invalid API Key** error, make sure the key you entered is correct.
- If you get a **Rate Limit Exceeded** error, wait a few minutes and try again.
- A **web search** failure never stops an analysis: an invalid Jina key, a rate limit or an `s.jina.ai` outage only puts the search card in its failed state, and the AI report is produced from panel data alone.
- If you are offline you will see a "Network unavailable" message, and the chart and indicators already on screen are not discarded.
- To use more advanced AI models (Claude Opus, GLM, Grok and Gemini non-free tiers) you need to [purchase API credits](https://openrouter.ai/settings/credits) from OpenRouter.

#### ⭕️ The analyses provided by this panel are for informational and educational purposes only and must not be considered financial advice. The cryptocurrency market is volatile. Always do your own research before making any investment decision.

---

## 📜 License
This project is licensed under the [MIT License](https://github.com/imotb/ai-crypto-analysis/raw/refs/heads/main/LICENSE).
