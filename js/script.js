/* ==============================
   LUCID PORTFOLIO — SCRIPT
   ============================== */

// ---------- THEME TOGGLE ----------
const themeLight = document.getElementById('theme-light');
const themeDark = document.getElementById('theme-dark');

function setTheme(mode) {
  document.body.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  if (themeLight) themeLight.classList.toggle('active', mode === 'light');
  if (themeDark) themeDark.classList.toggle('active', mode === 'dark');
}

if (themeLight && themeDark) {
  themeLight.addEventListener('click', () => setTheme('light'));
  themeDark.addEventListener('click', () => setTheme('dark'));
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

// ---------- MODALS ----------
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal(backdrop.id);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id));
    document.querySelectorAll('.filter-dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

// ---------- DOWNLOAD COUNTER ----------
const downloadBtn = document.getElementById('download-cv-btn');
const downloadCounter = document.getElementById('download-counter');

if (downloadBtn && downloadCounter) {
  let downloads = parseInt(localStorage.getItem('cvDownloads')) || 0;
  downloadCounter.textContent = `${downloads} Downloads`;

  downloadBtn.addEventListener('click', () => {
    downloads++;
    localStorage.setItem('cvDownloads', downloads);
    downloadCounter.textContent = `${downloads} Downloads`;
  });
}

// ---------- CATEGORY LABEL MAPPING ----------
const categoryLabels = {
  'typography': 'Typography',
  'logo': 'Logo',
  'publication': 'Publication Materials',
  'poster': 'Poster',
  'social': 'Social Media',
  'uiux': 'UI/UX',
  'others': 'Others'
};

// ---------- PROJECT MODAL & LIKE COUNTER ----------
function openProject(card) {
  const title = card.dataset.title || 'Project Title';
  const desc = card.dataset.desc || 'A dynamic visual layout designed to capture attention.';
  const year = card.dataset.year || '2025';
  const img = card.dataset.img || '';
  const category = card.dataset.category || 'others';

  const modal = document.getElementById('project-modal');
  if (!modal) return;

  modal.querySelector('.modal-project-head h3').textContent = title;
  modal.querySelector('.modal-project-head .year').textContent = year;
  modal.querySelector('.modal-project-body p').textContent = desc;

  // Set the category badge
  const categoryEl = modal.querySelector('.modal-project-category');
  if (categoryEl) {
    categoryEl.textContent = categoryLabels[category] || 'Others';
  }

  const imgBox = modal.querySelector('.modal-project-img');
  if (img) {
    imgBox.style.backgroundImage = `url(${img})`;
    imgBox.style.backgroundSize = 'cover';
    imgBox.style.backgroundPosition = 'center';
    imgBox.textContent = '';
  } else {
    imgBox.style.backgroundImage = '';
    imgBox.textContent = '';
  }

  // --- Like Counter Logic ---
  const likeBtn = modal.querySelector('.like-btn');
  const likeCount = modal.querySelector('.likes');
  const likeKey = `likes_${title}`;
  const likedKey = `liked_${title}`;

  let likes = parseInt(localStorage.getItem(likeKey)) || 0;
  likeCount.textContent = `${likes} Likes`;

  if (localStorage.getItem(likedKey) === 'true') {
    likeBtn.classList.add('liked');
  } else {
    likeBtn.classList.remove('liked');
  }

  const newLikeBtn = likeBtn.cloneNode(true);
  likeBtn.parentNode.replaceChild(newLikeBtn, likeBtn);

  newLikeBtn.addEventListener('click', function () {
    if (this.classList.contains('liked')) {
      likes--;
      this.classList.remove('liked');
      localStorage.setItem(likedKey, 'false');
    } else {
      likes++;
      this.classList.add('liked');
      localStorage.setItem(likedKey, 'true');
    }
    localStorage.setItem(likeKey, likes);
    likeCount.textContent = `${likes} Likes`;
  });

  openModal('project-modal');
}

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => openProject(card));
});

// ---------- PROJECT FILTER STATE (Search + Category) ----------
let currentSearch = '';
let currentCategory = 'all';

function applyFilters() {
  document.querySelectorAll('.project-card').forEach(card => {
    const title = (card.dataset.title || '').toLowerCase();
    const category = card.dataset.category || 'others';

    const matchesSearch = title.includes(currentSearch);
    const matchesCategory = currentCategory === 'all' || category === currentCategory;

    card.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
  });
}

// ---------- PROJECT SEARCH ----------
const searchInput = document.getElementById('project-search');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    applyFilters();
  });
}

// ---------- CATEGORY FILTER BUTTONS ----------
const categoryButtons = document.querySelectorAll('.category-btn');
if (categoryButtons.length) {
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category || 'all';
      applyFilters();
    });
  });
}

// ---------- PROJECT FILTER DROPDOWN & SORTING ----------
const filterToggle = document.getElementById('filter-toggle');
const filterMenu = document.getElementById('filter-menu');
const filterLabel = document.getElementById('filter-label');
const projectsGrid = document.getElementById('projects-grid');
const filterDropdown = document.querySelector('.filter-dropdown');

if (filterToggle && filterMenu && projectsGrid) {
  // Toggle dropdown open/close
  filterToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle('open');
    filterToggle.setAttribute('aria-expanded', filterDropdown.classList.contains('open'));
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!filterDropdown.contains(e.target)) {
      filterDropdown.classList.remove('open');
      filterToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Helper: get likes for a project from localStorage
  function getLikes(card) {
    const title = card.dataset.title || '';
    return parseInt(localStorage.getItem(`likes_${title}`)) || 0;
  }

  // Sorting function
  function sortProjects(sortType) {
    const cards = Array.from(projectsGrid.querySelectorAll('.project-card'));

    const sorted = cards.map(card => {
      const title = card.dataset.title || '';
      const year = parseInt(card.dataset.year) || 0;
      const likes = getLikes(card);
      return { card, title, year, likes };
    });

    switch (sortType) {
      case 'date-desc':
        sorted.sort((a, b) => b.year - a.year);
        break;
      case 'date-asc':
        sorted.sort((a, b) => a.year - b.year);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.title.toLowerCase().localeCompare(a.title.toLowerCase()));
        break;
      case 'likes-desc':
        sorted.sort((a, b) => b.likes - a.likes);
        break;
      case 'likes-asc':
        sorted.sort((a, b) => a.likes - b.likes);
        break;
      case 'reset':
        return;
      default:
        return;
    }

    sorted.forEach(({ card }) => projectsGrid.appendChild(card));
  }

  // Handle menu option clicks
  filterMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sortType = e.target.dataset.sort;
      if (!sortType) return;

      if (sortType === 'reset') {
        filterLabel.textContent = 'Filter by';
        filterMenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      } else {
        filterLabel.textContent = e.target.textContent;
        filterMenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        sortProjects(sortType);
      }

      filterDropdown.classList.remove('open');
      filterToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- CONTACT FORM ----------
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    const original = btn.innerHTML;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Message Sent!';
      setTimeout(() => {
        closeModal('contact-modal');
        contactForm.reset();
        btn.innerHTML = original;
        btn.disabled = false;
      }, 1200);
    }, 1000);
  });
}

// ---------- SCROLL TO TOP ----------
document.querySelectorAll('.scroll-top button').forEach(btn => {
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});