/* ══════════════════════════════════════════════════════════
   TABLE OF CONTENTS
   1. Nav — mobile menu toggle
   2. Hero — phone rotation carousel
   3. Advantages — sliding card carousel
   4. Showcase — tab switcher
   5. Timeline — scroll-triggered fade-in
══════════════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────
   1. NAV — Mobile menu toggle
────────────────────────────────────────────── */
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// Close mobile menu when screen is resized to desktop width
window.addEventListener('resize', () => {
  if (window.innerWidth > 960) {
    document.getElementById('mobileMenu').classList.remove('open');
  }
});


/* ──────────────────────────────────────────────
   2. HERO — Phone rotation
   5 phones rotate through 5 position classes every 3s.
   Positions: hidden-left → left → center → right → hidden-right
────────────────────────────────────────────── */
(function () {
  const POSITIONS = [
    'pos-hidden-left',
    'pos-left',
    'pos-center',
    'pos-right',
    'pos-hidden-right'
  ];

  const phones = document.querySelectorAll('.phone');

  // Each phone starts at its natural index position
  let state = [0, 1, 2, 3, 4];

  function rotate() {
    // Shift every phone one step forward, wrap around at the end
    state = state.map(s => (s + 1) % 5);
    phones.forEach((phone, i) => {
      phone.className = 'phone ' + POSITIONS[state[i]];
    });
  }

  setInterval(rotate, 3000);
})();


/* ──────────────────────────────────────────────
   3. ADVANTAGES — Sliding card carousel
   - 3 cards visible on desktop
   - 2 cards on tablet (≤960px)
   - 1 card on mobile (≤600px)
   - Auto-advances every 4s, pauses on hover
   - Touch/swipe support
────────────────────────────────────────────── */
(function () {
  const track        = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const cards        = Array.from(track.querySelectorAll('.adv-card'));
  const total        = cards.length;
  const GAP          = 20; // must match CSS gap value

  let currentIndex = 0;
  let visibleCount = getVisibleCount();
  let maxIndex     = total - visibleCount;

  function getVisibleCount() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 960) return 2;
    return 3;
  }

  // Build dot buttons based on how many slides exist
  function buildDots() {
    dotsContainer.innerHTML = '';
    visibleCount = getVisibleCount();
    maxIndex     = total - visibleCount;

    for (let i = 0; i <= maxIndex; i++) {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === currentIndex ? ' active' : '');
      btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      btn.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(btn);
    }
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    const cardWidth = cards[0].getBoundingClientRect().width;
    const offset    = currentIndex * (cardWidth + GAP);
    track.style.transform = `translateX(-${offset}px)`;

    // Update active dot
    document.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  // Rebuild dots and recalculate position on resize
  function onResize() {
    const newVisible = getVisibleCount();
    if (newVisible !== visibleCount) {
      visibleCount = newVisible;
      maxIndex     = total - visibleCount;
      currentIndex = Math.min(currentIndex, maxIndex);
      buildDots();
      goTo(currentIndex);
    }
  }

  // Auto-advance
  let autoInterval = setInterval(() => {
    goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }, 4000);

  // Pause auto-advance on hover
  track.addEventListener('mouseenter', () => clearInterval(autoInterval));
  track.addEventListener('mouseleave', () => {
    autoInterval = setInterval(() => {
      goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }, 4000);
  });

  // Swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(currentIndex + (diff > 0 ? 1 : -1));
  });

  window.addEventListener('resize', onResize);

  // Init
  buildDots();
  goTo(0);
})();


/* ──────────────────────────────────────────────
   4. SHOWCASE — Tab switcher
   Click a tab pill → swap the visible panel with a fade-in animation
────────────────────────────────────────────── */
(function () {
  const tabs   = document.querySelectorAll('.showcase-tab');
  const panels = document.querySelectorAll('.showcase-panel');

  function activateTab(tabId) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));

    panels.forEach(p => {
      if (p.dataset.panel === tabId) {
        p.classList.add('active');
        // Two rAF frames needed: first renders display:grid, second triggers transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => p.classList.add('visible'));
        });
      } else {
        p.classList.remove('active', 'visible');
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  // Animate the first panel in on page load
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelector('.showcase-panel.active')?.classList.add('visible');
    });
  });
})();


/* ──────────────────────────────────────────────
   5. TIMELINE — Scroll-triggered fade-in
   Each step fades in + slides up as it enters the viewport.
   Steps stagger by 100ms so they animate in sequence.
────────────────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.timeline-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
})();

/* ──────────────────────────────────────────────
   POPUP — open / close
────────────────────────────────────────────── */
function openPopup() {
  document.getElementById('popupOverlay').classList.add('open');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closePopup() {
  document.getElementById('popupOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Close when clicking the dark overlay (outside the popup box)
document.getElementById('popupOverlay').addEventListener('click', function (e) {
  if (e.target === this) closePopup();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePopup();
});

// Attach openPopup to all CTA buttons
document.querySelectorAll('.btn-primary').forEach(btn => {
  // Skip pricing "Get a Quote" outlined buttons if you want them to do something different later
  btn.addEventListener('click', openPopup);
});


document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('open');
    document.body.style.overflow = '';
  });
});