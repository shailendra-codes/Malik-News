
let allArticlesHTML = [];
let currentCategory = 'all';

// 1. सर्च बॉक्स का पुराना टेक्स्ट बदलना
const searchBox = document.getElementById('search-input');
if (searchBox) {
  searchBox.placeholder = '🔍 यहाँ कोई भी खबर खोजें...';
}

// 2. index.html को छुए बिना नए कैटेगरी बटन (मनोरंजन, खेल जगत, टेक इंडस्ट्री) जोड़ना
const filterContainer = document.querySelector('.filter-btns');
if (filterContainer) {
  filterContainer.innerHTML = `
    <button class="filter-btn active" onclick="setCategory('all', this)">सभी खबरें</button>
    <button class="filter-btn" onclick="setCategory('रोज़गार', this)">💼 रोज़गार</button>
    <button class="filter-btn" onclick="setCategory('समस्या', this)">⚡ आम समस्याएं</button>
    <button class="filter-btn" onclick="setCategory('योजना', this)">🏛️ सरकारी योजनाएं</button>
    <button class="filter-btn" onclick="setCategory('मनोरंजन', this)">🎬 मनोरंजन</button>
    <button class="filter-btn" onclick="setCategory('खेल जगत', this)">🏏 खेल जगत</button>
    <button class="filter-btn" onclick="setCategory('टेक', this)">💻 टेक इंडस्ट्री</button>
  `;
}

// 3. ऊपर की पट्टी को लगातार चलाने का स्टाइल
const style = document.createElement('style');
style.textContent = `
  .ticker-wrap { position: relative; overflow: hidden; }
  .ticker-title { position: relative; z-index: 2; }
  #breaking-news {
    display: inline-block !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
    max-width: none !important;
    padding-left: 100%;
    animation: ticker-move 18s linear infinite;
  }
  #breaking-news:hover {
    animation-play-state: paused;
  }
  @keyframes ticker-move {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
`;
document.head.appendChild(style);

async function loadSingleNewsFile() {
  const container = document.getElementById('news-container');
  const ticker = document.getElementById('breaking-news');

  try {
    const res = await fetch('all-news.html?t=' + Date.now());
    if (!res.ok) throw new Error('File not found');
    const fullHTML = await res.text();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHTML;
    const articles = tempDiv.querySelectorAll('article');

    allArticlesHTML = Array.from(articles).map(art => art.outerHTML);

    if (allArticlesHTML.length === 0) {
      container.innerHTML = '<p style="text-align:center;">अभी कोई खबर उपलब्ध नहीं है।</p>';
      return;
    }

    container.innerHTML = allArticlesHTML.join('');

    const firstHeadline = tempDiv.querySelector('h2');
    if (firstHeadline && ticker) {
      ticker.textContent = firstHeadline.textContent;
    }
  } catch (e) {
    container.innerHTML = '<p style="text-align:center;">खबरें लोड हो रही हैं, कृपया पेज रिफ्रेश करें।</p>';
  }
}

function setCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterNews();
}

function filterNews() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const container = document.getElementById('news-container');
  container.innerHTML = '';

  const filtered = allArticlesHTML.filter(html => {
    const text = html.toLowerCase();
    const matchesSearch = text.includes(query);
    const matchesCat = currentCategory === 'all' || text.includes(currentCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:20px; background:#fff; border-radius:10px;">इस खोज से जुड़ी कोई खबर नहीं मिली।</p>';
  } else {
    container.innerHTML = filtered.join('');
  }
}

loadSingleNewsFile();
 
// वेबसाइट के नीचे अपने आप बढ़ने वाला असली लाइव काउंटर (100 से आगे गिनेगा)
const footer = document.querySelector('footer');
if (footer) {
  const counterBox = document.createElement('div');
  counterBox.style.cssText = 'margin-top: 12px; display: inline-flex; align-items: center; gap: 8px; font-weight: bold; color: #ffffff; background: #1d4ed8; padding: 6px 14px; border-radius: 20px; border: 1px solid #93c5fd; font-size: 0.9rem;';
  counterBox.innerHTML = '<span>👁️ कुल पाठक:</span> <span id="real-views" style="background:#dc2626; padding:2px 10px; border-radius:12px; color:#fff;">...</span>';
  footer.appendChild(counterBox);

  const apiHost = 'https://countapi.xyz';
  const apiPath = '/hit/malik-news-shailendra-2026/visits';

  fetch(apiHost + apiPath)
    .then(res => res.json())
    .then(data => {
      document.getElementById('real-views').textContent = (100 + data.value);
    })
    .catch(() => {
      // यदि बाहरी सर्वर व्यस्त हो, तो भी हर विज़िट पर स्थानीय गिनती बढ़ाएगा
      let localCount = parseInt(localStorage.getItem('mn_views') || '100');
      localCount += 1;
      localStorage.setItem('mn_views', localCount);
      document.getElementById('real-views').textContent = localCount;
    });
}


// हर खबर के नीचे 'शेयर करें' और 'ईमेल से भेजें (Mail)' दोनों बटन लगाना
function addShareButtons() {
  document.querySelectorAll('#news-container article').forEach(art => {
    if (art.querySelector('.share-row')) return;
    const title = art.querySelector('h2') ? art.querySelector('h2').textContent : 'Malik News';
    const fullMsg = '📰 Malik News पर पढ़ें: ' + title + '\n👉 ' + window.location.href;

    const row = document.createElement('div');
    row.className = 'share-row';
    row.style.cssText = 'display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px;';

    // 1. हरा शेयर बटन (WhatsApp / Share Menu)
    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.style.cssText = 'background: #16a34a; color: #fff; padding: 8px 14px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.88rem; font-weight: bold;';
    shareBtn.textContent = '📲 खबर शेयर करें';
    shareBtn.onclick = function() {
      if (navigator.share) {
        navigator.share({ title: 'Malik News', text: fullMsg });
      } else {
        navigator.clipboard.writeText(fullMsg);
        shareBtn.textContent = '✅ लिंक कॉपी हो गया!';
        setTimeout(() => { shareBtn.textContent = '📲 खबर शेयर करें'; }, 3000);
      }
    };

    // 2. नीला ईमेल (Mail) बटन
    const mailBtn = document.createElement('a');
    mailBtn.href = 'mailto:?subject=' + encodeURIComponent('Malik News: ' + title) + '&body=' + encodeURIComponent(fullMsg);
    mailBtn.style.cssText = 'background: #1d4ed8; color: #fff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 0.88rem; font-weight: bold; display: inline-block;';
    mailBtn.textContent = '✉️ ईमेल से भेजें';

    row.appendChild(shareBtn);
    row.appendChild(mailBtn);
    art.appendChild(row);
  });
}

const newsObserver = new MutationObserver(addShareButtons);
const newsBox = document.getElementById('news-container');
if (newsBox) {
  newsObserver.observe(newsBox, { childList: true });
}
 

// वेबसाइट के नीचे 'विज्ञापन एवं संपर्क' बटन जोड़ना
const mainFooter = document.querySelector('footer');
if (mainFooter) {
  const myEmail = 'maliklang3489' + '@' + 'gmail.com';
  const adBox = document.createElement('div');
  adBox.style.cssText = 'margin-top: 12px;';
  adBox.innerHTML = '<a href="mailto:' + myEmail + '?subject=Malik%20News" style="display:inline-block;background:#facc15;color:#1e293b;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:0.88rem;">📢 विज्ञापन एवं समाचार भेजने हेतु संपर्क करें</a>';
  mainFooter.appendChild(adBox);
}
 

// बाएं और दाएं दोनों कोनों पर 'MN' लोगो और बीच में '🎙️ Malik News 🎙️'
const siteHeader = document.querySelector('header');
const mainHeading = document.querySelector('header h1');
const subTagline = document.querySelector('header p');
if (siteHeader && mainHeading && !document.getElementById('mn-brand-row')) {
  const brandRow = document.createElement('div');
  brandRow.id = 'mn-brand-row';
  brandRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;max-width:960px;margin:0 auto;padding:0 10px;box-sizing:border-box;';

  const makeLogo = () => {
    const b = document.createElement('div');
    b.style.cssText = 'width:70px;height:70px;border-radius:50%;background:#facc15;border:3px solid #fff;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#1e3a8a;font-family:sans-serif;flex-shrink:0;';
    b.innerHTML = '<b style="font-size:1.6rem;line-height:1;">MN</b><span style="font-size:0.55rem;font-weight:bold;background:#dc2626;color:#fff;padding:1px 5px;border-radius:3px;margin-top:2px;">NEWS</span>';
 
    return b;
  };

  const textCol = document.createElement('div');
  textCol.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;flex-grow:1;';

  mainHeading.style.cssText = 'margin:0 !important;padding:0 !important;font-size:2.4rem;font-weight:900;line-height:1.1;display:flex;align-items:center;justify-content:center;gap:8px;';
  mainHeading.innerHTML = '<span>🎙️</span><span>Malik News</span><span>🎙️</span>';

  siteHeader.insertBefore(brandRow, mainHeading);
  brandRow.appendChild(makeLogo());
  textCol.appendChild(mainHeading);
  if (subTagline) {
    subTagline.style.cssText = 'margin:6px 0 0 0 !important;text-align:center;font-size:0.95rem;';
    textCol.appendChild(subTagline);
  }
  brandRow.appendChild(textCol);
  brandRow.appendChild(makeLogo());
}

// --- Adsterra Smartlink बटन (बिना खाली बॉक्स के 100% कमाई वाला कोड) ---
window.addEventListener('load', function() {
    setTimeout(function() {
        const firstNews = document.querySelector('article');
        if (firstNews && !document.getElementById('smartlink-promo')) {
            const promoBox = document.createElement('div');
            promoBox.id = 'smartlink-promo';
            promoBox.style.cssText = 'text-align: center; margin: 18px auto; padding: 10px; max-width: 360px;';
            promoBox.innerHTML = '<a href="https://asiafilm.org" target="_blank" rel="noopener noreferrer" style="display: block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 11px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.9rem; box-shadow: 0 3px 8px rgba(37, 99, 235, 0.25);">🔥 विशेष प्रायोजित ऑफर देखें • Sponsored</a>';
            firstNews.parentNode.insertBefore(promoBox, firstNews.nextSibling);
        }
    }, 1000);
});

// --- हेडर टैगलाइन में 'साप्ताहिक एवं दैनिक' अपडेट ---
(function() {
    const subTitle = document.querySelector('header p');
    if (subTitle) {
        subTitle.innerHTML = 'पूरे भारत की आम समस्याओं, रोजगार और समाधान का <strong>साप्ताहिक एवं दैनिक</strong> मंच';
    }
})();
 
 
// --- संपादक परिचय बॉक्स, ईमेल बॉक्स और क्लीन कॉपीराइट लाइन ---
(function() {
    // 1. गहरे बॉक्स में 'हर सोमवार नया अंक' को साप्ताहिक एवं दैनिक के अनुसार अपडेट करें
    document.querySelectorAll('h2, h3, p, div, span').forEach(function(el) {
        if (el.children.length === 0) {
            if (el.textContent.includes('हर सोमवार नया अंक')) {
                el.textContent = 'हर सोमवार विशेष अंक और रोज़ाना दैनिक बुलेटिन सीधे अपने ईमेल पर पाएं (बिल्कुल मुफ्त)';
            }
            if (el.textContent.includes('© 2026 Malik News')) {
                el.textContent = '© 2026 Malik News • सर्वाधिकार सुरक्षित (All Rights Reserved)';
            }
        }
    });

    // 2. संपादक परिचय बॉक्स जोड़ें
    if (!document.getElementById('editor-about-box')) {
        const aboutBox = document.createElement('div');
        aboutBox.id = 'editor-about-box';
        aboutBox.style.cssText = 'max-width: 800px; margin: 20px auto 15px auto; padding: 15px 18px; background: #f8fafc; border-left: 4px solid #dc2626; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); font-family: inherit; line-height: 1.6; color: #1e293b;';
        aboutBox.innerHTML = '<h3 style="margin: 0 0 8px 0; font-size: 1.05rem; color: #dc2626;">📰 Malik News • संपादक परिचय (About Editor)</h3>' +
            '<p style="margin: 4px 0; font-size: 0.92rem;"><strong>संस्थापक एवं संपादक:</strong> शैलेन्द्र कुमार सिंह</p>' +
            '<p style="margin: 4px 0; font-size: 0.92rem;"><strong>प्रकाशन प्रारूप:</strong> साप्ताहिक विशेष अंक (प्रत्येक सोमवार) एवं दैनिक समाचार बुलेटिन</p>' +
            '<p style="margin: 4px 0 0 0; font-size: 0.92rem;"><strong>उद्देश्य:</strong> पूरे भारत की आम समस्याओं, रोजगार, अर्थव्यवस्था और राष्ट्रीय-अंतरराष्ट्रीय घटनाओं को निष्पक्ष, निर्भीक एवं सरल भाषा में पाठकों तक पहुँचाना।</p>';

        const footer = document.querySelector('footer');
        if (footer) {
            footer.parentNode.insertBefore(aboutBox, footer);
        } else {
            document.body.appendChild(aboutBox);
        }
    }
})();
 

const MD_URL = "https://shailendra-codes" + ".github.io/M-Drishti/";
const techBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('टेक इंडस्ट्री'));
if (techBtn) {
    techBtn.insertAdjacentHTML('afterend', `<a href="${MD_URL}" target="_blank" style="background:#dc2626;color:#fff;padding:6px 14px;border-radius:16px;font-weight:700;text-decoration:none;font-size:0.82rem;display:inline-block;margin-left:6px;">👁️ M Drishti (वीडियो देखें)</a>`);
}
 

const AMZ_BOOK = "https://www.amazon" + ".in/dp/B0HSR3HQT1";
const mainWrap = document.querySelector('main') || document.querySelector('.container') || document.body;
if (mainWrap) {
    mainWrap.insertAdjacentHTML('afterbegin', `
        <div style="background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;padding:16px 18px;border-radius:12px;margin:14px auto;max-width:960px;box-shadow:0 4px 12px rgba(0,0,0,0.12);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
            <div style="flex:1;min-width:240px;">
                <span style="background:#facc15;color:#0f172a;font-size:0.75rem;font-weight:800;padding:3px 9px;border-radius:12px;">📚 विशेष प्रकाशन • Amazon Kindle पर लाइव</span>
                <h3 style="margin:8px 0 4px;font-size:1.1rem;color:#fff;">Hinglish to Python: Learn Coding Without English (MalikLang Official Guide)</h3>
                <p style="margin:0;font-size:0.86rem;color:#cbd5e1;">लेखक: शैलेन्द्र कुमार सिंह • 25 से 29 नवंबर तक Amazon Kindle पर <b>100% निःशुल्क (Free)</b> डाउनलोड के लिए उपलब्ध!</p>
            </div>
            <a href="${AMZ_BOOK}" target="_blank" style="background:#22c55e;color:#fff;padding:10px 18px;border-radius:8px;font-weight:800;text-decoration:none;font-size:0.9rem;white-space:nowrap;">📖 Amazon पर देखें / डाउनलोड करें ➔</a>
        </div>
    `);
}
 
