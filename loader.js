
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
  adBox.innerHTML = '<a href="mailto:' + myEmail + '?subject=Malik%20News%20Vigyapan%20ya%20Samachar" style="display: inline-block; background: #facc15; color: #1e293b; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 0.88rem;">📢 विज्ञापन एवं समाचार भेजने हेतु संपर्क करें</a>';
  mainFooter.appendChild(adBox);
}
 

// हेडर के बिल्कुल बाएं कोने में बड़ा 'MN' लोगो और बीच में बड़ा '🎙️ Malik News 🎙️'
const siteHeader = document.querySelector('header');
const mainHeading = document.querySelector('header h1');
if (siteHeader && mainHeading && !document.getElementById('mn-brand-row')) {
  const brandRow = document.createElement('div');
  brandRow.id = 'mn-brand-row';
  brandRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 900px; margin: 0 auto 8px auto; padding: 0 10px; box-sizing: border-box;';

  const logoBadge = document.createElement('div');
  logoBadge.style.cssText = 'width: 74px; height: 74px; border-radius: 50%; background: linear-gradient(135deg, #facc15, #eab308); border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #1e3a8a; font-family: sans-serif; flex-shrink: 0;';
  logoBadge.innerHTML = '<span style="font-size: 1.75rem; font-weight: 900; line-height: 1;">MN</span><span style="font-size: 0.55rem; font-weight: 800; background: #dc2626; color: #ffffff; padding: 1px 6px; border-radius: 4px; margin-top: 3px;">NEWS</span>';

  mainHeading.style.cssText = 'margin: 0 auto; font-size: 2.55rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 10px; flex-grow: 1;';
  mainHeading.innerHTML = '<span style="font-size: 2.6rem;">🎙️</span><span>' + mainHeading.textContent.replace(/🎙️/g, '').trim() + '</span><span style="font-size: 2.6rem;">🎙️</span>';

  siteHeader.insertBefore(brandRow, mainHeading);
  brandRow.appendChild(logoBadge);
  brandRow.appendChild(mainHeading);
}
 
