
let allArticlesHTML = [];
let currentCategory = 'all';

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
    // ?t=Date.now() लगाने से ब्राउज़र कभी पुरानी फाइल (Cache) नहीं रखेगा, हमेशा तुरंत ताज़ा खबर दिखाएगा
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
 
