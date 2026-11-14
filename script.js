const VISIBLE_COUNT_DESKTOP = 3;

let focusIndex = 0;
let visibleCount = VISIBLE_COUNT_DESKTOP;

const featurePanel = document.getElementById('feature-panel');
const featureSeries = document.getElementById('feature-series');
const featureTitle = document.getElementById('feature-title');
const featureExcerpts = document.getElementById('feature-excerpts');
const featureEssayBtn = document.getElementById('feature-essay');
const featureCartoonBtn = document.getElementById('feature-cartoon');
const stripTrack = document.getElementById('strip-track');
const stripPrev = document.getElementById('strip-prev');
const stripNext = document.getElementById('strip-next');
const stripStatus = document.getElementById('strip-status');

const imageModal = document.getElementById('image-modal');
const modalImage = imageModal.querySelector('.image-modal__image');
const modalEssay = document.getElementById('image-modal-essay');

function updateVisibleCount() {
  if (window.matchMedia('(max-width: 640px)').matches) {
    visibleCount = 1;
  } else if (window.matchMedia('(max-width: 900px)').matches) {
    visibleCount = 2;
  } else {
    visibleCount = VISIBLE_COUNT_DESKTOP;
  }
}

function windowStartForFocus(index) {
  const maxStart = Math.max(0, CHRONICLES.length - visibleCount);
  return Math.min(Math.max(0, index - Math.floor((visibleCount - 1) / 2)), maxStart);
}

function resetModalContent() {
  modalImage.hidden = true;
  modalImage.removeAttribute('src');
  modalImage.alt = '';
  modalEssay.hidden = true;
  modalEssay.replaceChildren();
}

function openCartoonLightbox({ title, src }) {
  resetModalContent();
  modalImage.hidden = false;
  modalImage.src = src;
  modalImage.alt = `Cartoon: ${title}`;
  imageModal.hidden = false;
  imageModal.setAttribute('aria-hidden', 'false');
  imageModal.setAttribute('aria-label', `Enlarged cartoon: ${title}`);
  document.body.style.overflow = 'hidden';
  imageModal.querySelector('.image-modal__close').focus();
}

function openEssay(essayId, title) {
  const template = document.getElementById(essayId);
  if (!template) {
    return;
  }

  resetModalContent();
  modalEssay.appendChild(template.content.cloneNode(true));
  modalEssay.hidden = false;
  imageModal.hidden = false;
  imageModal.setAttribute('aria-hidden', 'false');
  imageModal.setAttribute('aria-label', title);
  document.body.style.overflow = 'hidden';
  imageModal.querySelector('.image-modal__close').focus();
}

function closeImageModal() {
  imageModal.hidden = true;
  imageModal.setAttribute('aria-hidden', 'true');
  resetModalContent();
  document.body.style.overflow = '';
}

function renderFeature(animate = true) {
  const piece = CHRONICLES[focusIndex];
  if (!piece) {
    return;
  }

  if (animate) {
    featurePanel.classList.remove('is-swapping');
    void featurePanel.offsetWidth;
    featurePanel.classList.add('is-swapping');
  }

  featurePanel.style.borderTopColor = piece.accent;
  featureSeries.textContent = piece.series;
  featureTitle.textContent = piece.title;
  featureExcerpts.replaceChildren(
    ...piece.excerpts.map((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    })
  );

  featureEssayBtn.dataset.essayId = piece.essayId;
  featureEssayBtn.setAttribute('aria-label', `Open essay: ${piece.title}`);
  featureCartoonBtn.dataset.cartoonSrc = piece.cartoonSrc;
  featureCartoonBtn.dataset.cartoonTitle = piece.title;
  featureCartoonBtn.setAttribute('aria-label', `View cartoon for ${piece.title}`);
}

function renderStrip() {
  const start = windowStartForFocus(focusIndex);
  const visible = CHRONICLES.slice(start, start + visibleCount);

  stripTrack.replaceChildren(
    ...visible.map((piece, offset) => {
      const absoluteIndex = start + offset;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'strip-card' + (absoluteIndex === focusIndex ? ' is-focused' : '');
      button.style.borderTopColor = piece.accent;
      button.setAttribute('aria-pressed', String(absoluteIndex === focusIndex));
      button.setAttribute('aria-label', `Focus chronicle: ${piece.title}`);
      button.dataset.index = String(absoluteIndex);

      const logo = document.createElement('img');
      logo.className = 'panel-logo';
      logo.src = 'images/TransparentMasterLogo.png';
      logo.alt = '';
      logo.setAttribute('aria-hidden', 'true');
      logo.width = 52;
      logo.height = 52;

      const heading = document.createElement('h3');
      heading.textContent = piece.title;

      const excerpt = document.createElement('p');
      excerpt.textContent = piece.excerpts[0] || '';

      const series = document.createElement('p');
      series.className = 'strip-series';
      series.textContent = piece.series;

      button.append(logo, heading, excerpt, series);
      return button;
    })
  );

  stripPrev.disabled = focusIndex <= 0;
  stripNext.disabled = focusIndex >= CHRONICLES.length - 1;
  stripStatus.textContent = `${focusIndex + 1} of ${CHRONICLES.length}`;
}

function setFocus(index, { animate = true } = {}) {
  if (index < 0 || index >= CHRONICLES.length) {
    return;
  }

  focusIndex = index;
  renderFeature(animate);
  renderStrip();
  if (typeof window.athRefreshReactions === 'function') {
    window.athRefreshReactions();
  }
}

stripPrev.addEventListener('click', () => setFocus(focusIndex - 1));
stripNext.addEventListener('click', () => setFocus(focusIndex + 1));

stripTrack.addEventListener('click', (event) => {
  const card = event.target.closest('.strip-card');
  if (!card) {
    return;
  }

  setFocus(Number(card.dataset.index));
});

featureEssayBtn.addEventListener('click', () => {
  const piece = CHRONICLES[focusIndex];
  openEssay(piece.essayId, piece.title);
});

featureCartoonBtn.addEventListener('click', () => {
  const piece = CHRONICLES[focusIndex];
  openCartoonLightbox({ title: piece.title, src: piece.cartoonSrc });
});

imageModal.querySelectorAll('[data-modal-close]').forEach((element) => {
  element.addEventListener('click', closeImageModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !imageModal.hidden) {
    closeImageModal();
    return;
  }

  if (!imageModal.hidden) {
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    setFocus(focusIndex - 1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    setFocus(focusIndex + 1);
  }
});

window.addEventListener('resize', () => {
  updateVisibleCount();
  renderStrip();
});

updateVisibleCount();
setFocus(0, { animate: false });
