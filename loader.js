
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
 
