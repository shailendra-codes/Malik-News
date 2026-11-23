
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

// --- Adsterra विज्ञापन लोडर (100% वर्किंग वर्ज़न) ---
window.addEventListener('load', function() {
    setTimeout(function() {
        const articles = document.querySelectorAll('article');

        // 1. पहली खबर के नीचे Banner 300x250
        if (articles.length > 0 && !document.getElementById('adsterra-box-1')) {
            const adBox1 = document.createElement('div');
            adBox1.id = 'adsterra-box-1';
            adBox1.style.cssText = 'text-align: center; margin: 20px auto; padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; max-width: 340px;';
            adBox1.innerHTML = '<span style="font-size: 0.75rem; color: #64748b; display: block; margin-bottom: 8px; font-weight: bold;">विज्ञापन • Advertisement</span>';

            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'width: 300px; height: 250px; border: none; overflow: hidden; display: block; margin: 0 auto;';
            iframe.scrolling = 'no';
            adBox1.appendChild(iframe);
            articles[0].parentNode.insertBefore(adBox1, articles[0].nextSibling);

            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;overflow:hidden;">
                    <script type="text/javascript">
                        atOptions = {
                            'key' : 'cf8eca1144160da509dbab5e00c5ee3eb',
                            'format' : 'iframe',
                            'height' : 250,
                            'width' : 300,
                            'params' : {}
                        };
                    <\/script>
                    <script type="text/javascript" src="https://bicea.org"><\/script>
                </body>
                </html>
            `);
            doc.close();
        }

        // 2. चौथी खबर के नीचे Native Banner
        if (articles.length > 3 && !document.getElementById('adsterra-native-box')) {
            const adBox2 = document.createElement('div');
            adBox2.id = 'adsterra-native-box';
            adBox2.style.cssText = 'text-align: center; margin: 25px auto; padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; max-width: 100%;';
            adBox2.innerHTML = '<span style="font-size: 0.75rem; color: #64748b; display: block; margin-bottom: 8px; font-weight: bold;">प्रायोजित समाचार • Sponsored</span><div id="container-54be950fdcf2528d7a0241e626b560f1"></div>';

            const script2 = document.createElement('script');
            script2.async = true;
            script2.setAttribute('data-cfasync', 'false');
            script2.src = 'https://bicea.org';

            adBox2.appendChild(script2);
            articles[3].parentNode.insertBefore(adBox2, articles[3].nextSibling);
        }
    }, 1500);
});
 
