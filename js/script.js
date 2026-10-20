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

// ---------- DOWNLOAD COUNTER (Firestore with Real-time Listener) ----------
const downloadBtn = document.getElementById('download-cv-btn');
const downloadCounter = document.getElementById('download-counter');

if (downloadBtn && downloadCounter && window.firestore) {
  // We only need `db`, `doc`, `onSnapshot`, `updateDoc`, and `increment` here
  const { db, doc, onSnapshot, updateDoc, increment } = window.firestore;
  const countersDocRef = doc(db, "siteData", "counters");

  // This listener will automatically update the display whenever the data changes
  const unsubscribe = onSnapshot(countersDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const count = docSnap.data().downloads || 0;
      downloadCounter.textContent = `${count} Downloads`;
    }
  }, (error) => {
    console.error("Error listening to download count: ", error);
  });

  // Handle the button click to increment the counter
  downloadBtn.addEventListener('click', async () => {
    try {
      await updateDoc(countersDocRef, {
        downloads: increment(1)
      });
      // We don't need to call updateDownloadDisplay() here anymore!
      // The onSnapshot listener will automatically update the UI.
    } catch (error) {
      console.error("Error updating download count: ", error);
    }
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

// ---------- PROJECT MODAL & PER-PROJECT LIKES (Firestore) ----------
async function openProject(card) {
  // ... (Your existing openProject function remains unchanged) ...
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

  // --- LIKE COUNTER LOGIC ---
  const likeBtn = modal.querySelector('.like-btn');
  const likeCount = modal.querySelector('.likes');
  
  const projectId = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const likedKey = `liked_${projectId}`;

  if (window.firestore && likeBtn && likeCount) {
    const { db, doc, getDoc, setDoc, updateDoc, increment } = window.firestore;
    const projectDocRef = doc(db, "projectLikes", projectId);

    try {
      const docSnap = await getDoc(projectDocRef);
      let currentLikes = 0;
      
      if (docSnap.exists()) {
        currentLikes = docSnap.data().likes || 0;
      } else {
        await setDoc(projectDocRef, { likes: 0 });
      }
      
      likeCount.textContent = `${currentLikes} Likes`;

      if (localStorage.getItem(likedKey) === 'true') {
        likeBtn.classList.add('liked');
      } else {
        likeBtn.classList.remove('liked');
      }

    } catch (error) {
      console.error("Error fetching likes: ", error);
      likeCount.textContent = `0 Likes`;
    }

    const newLikeBtn = likeBtn.cloneNode(true);
    likeBtn.parentNode.replaceChild(newLikeBtn, likeBtn);

    newLikeBtn.addEventListener('click', async function () {
      const isLiked = this.classList.contains('liked');
      
      try {
        if (!isLiked) {
          this.classList.add('liked');
          localStorage.setItem(likedKey, 'true');
          await updateDoc(projectDocRef, { likes: increment(1) });
        } else {
          this.classList.remove('liked');
          localStorage.setItem(likedKey, 'false');
          await updateDoc(projectDocRef, { likes: increment(-1) });
        }

        const updatedSnap = await getDoc(projectDocRef);
        if (updatedSnap.exists()) {
          likeCount.textContent = `${updatedSnap.data().likes} Likes`;
        }

      } catch (error) {
        console.error("Error updating likes: ", error);
      }
    });
  } else {
    likeCount.textContent = `0 Likes`;
  }

  openModal('project-modal');
}

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => openProject(card));
});

// ... (The rest of your file: FILTERS, SEARCH, SORTING, CONTACT FORM, etc. remains exactly the same) ...