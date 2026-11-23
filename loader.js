let allArticlesHTML = [];
let currentCategory = 'all';

async function autoLoadNewsUnlimited() {
  const container = document.getElementById('news-container');
  const ticker = document.getElementById('breaking-news');
  allArticlesHTML = [];
  let num = 1;

  // सीधे news-1.html, news-2.html, news-3.html... को बिना किसी API सीमा के लोड करेगा
  while (true) {
    try {
      const res = await fetch(`news-${num}.html`);
      if (!res.ok) break;
      const html = await res.text();
      allArticlesHTML.unshift(html); // नई खबर सबसे ऊपर
      num++;
    } catch (e) {
      break;
    }
  }

  if (allArticlesHTML.length === 0) {
    container.innerHTML = '<p style="text-align:center;">अभी कोई खबर उपलब्ध नहीं है।</p>';
    return;
  }

  container.innerHTML = allArticlesHTML.join('');

  // सबसे नई खबर का शीर्षक ब्रेकिंग न्यूज़ पट्टी में डालना
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = allArticlesHTML;
  const headline = tempDiv.querySelector('h2');
  if (headline && ticker) {
    ticker.textContent = headline.textContent;
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

autoLoadNewsUnlimited();
 
