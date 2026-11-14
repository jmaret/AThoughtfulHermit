(function initEngagement() {
  const VISITOR_KEY = 'ath_visitor_key';
  const EMAIL_KEY = 'ath_send_email';
  const LOCAL_VOTES_KEY = 'ath_local_votes';

  function functionsBase() {
    if (!ATH_CONFIG.supabaseUrl) {
      return '';
    }
    return `${ATH_CONFIG.supabaseUrl.replace(/\/$/, '')}/functions/v1`;
  }

  function getVisitorKey() {
    let key = localStorage.getItem(VISITOR_KEY);
    if (!key) {
      key =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, key);
    }
    return key;
  }

  function readLocalVotes() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function writeLocalVotes(votes) {
    localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(votes));
  }

  function localCountsFor(chronicleId) {
    const votes = readLocalVotes();
    let likes = 0;
    let dislikes = 0;
    Object.values(votes[chronicleId] || {}).forEach((vote) => {
      if (vote === 'like') likes += 1;
      if (vote === 'dislike') dislikes += 1;
    });
    return { likes, dislikes, mine: (votes[chronicleId] || {})[getVisitorKey()] || null };
  }

  function applyVoteUi(likes, dislikes, mine) {
    likeCount.textContent = String(likes);
    dislikeCount.textContent = String(dislikes);
    likeBtn.classList.toggle('is-active', mine === 'like');
    dislikeBtn.classList.toggle('is-active', mine === 'dislike');
    likeBtn.setAttribute('aria-pressed', String(mine === 'like'));
    dislikeBtn.setAttribute('aria-pressed', String(mine === 'dislike'));
  }

  async function callFunction(name, { method = 'GET', body, query } = {}) {
    const base = functionsBase();
    if (!base) {
      throw new Error('Supabase is not configured yet. Add supabaseUrl and supabaseAnonKey in config.js.');
    }

    const url = new URL(`${base}/${name}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
    }

    const headers = {
      apikey: ATH_CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${ATH_CONFIG.supabaseAnonKey}`,
    };
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    let response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error(
        'Could not reach Supabase. Confirm config.js URL/key, and that Edge Functions are deployed (e.g. react, subscribe).'
      );
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Function "${name}" is not deployed yet in Supabase (404). Deploy the Edge Functions from this repo.`
        );
      }
      throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
    }
    return payload;
  }

  function setStatus(el, message, kind = 'info') {
    if (!el) return;
    el.hidden = !message;
    el.textContent = message || '';
    el.dataset.kind = kind;
  }

  const subscribeForm = document.getElementById('subscribe-form');
  const subscribeEmail = document.getElementById('subscribe-email');
  const subscribeStatus = document.getElementById('subscribe-status');
  const reactionStatus = document.getElementById('reaction-status');
  const likeBtn = document.getElementById('feature-like');
  const dislikeBtn = document.getElementById('feature-dislike');
  const likeCount = document.getElementById('like-count');
  const dislikeCount = document.getElementById('dislike-count');
  const sendNowBtn = document.getElementById('feature-send-now');
  const sendModal = document.getElementById('send-modal');
  const sendForm = document.getElementById('send-form');
  const sendEmail = document.getElementById('send-email');
  const sendStatus = document.getElementById('send-status');
  const sendCloseButtons = document.querySelectorAll('[data-send-close]');

  function currentChronicle() {
    return typeof CHRONICLES !== 'undefined' && typeof focusIndex === 'number'
      ? CHRONICLES[focusIndex]
      : null;
  }

  function stillFocused(chronicleId) {
    return currentChronicle()?.id === chronicleId;
  }

  async function refreshCounts(chronicleId) {
    setStatus(reactionStatus, '');
    if (!chronicleId) {
      return;
    }

    if (!functionsBase()) {
      if (!stillFocused(chronicleId)) return;
      const local = localCountsFor(chronicleId);
      applyVoteUi(local.likes, local.dislikes, local.mine);
      return;
    }

    try {
      const payload = await callFunction('reaction-counts', {
        query: { chronicleId },
      });
      if (!stillFocused(chronicleId)) return;
      const row = payload.counts?.[chronicleId] || { likes: 0, dislikes: 0 };
      const mine = localCountsFor(chronicleId).mine;
      applyVoteUi(row.likes, row.dislikes, mine);
    } catch {
      if (!stillFocused(chronicleId)) return;
      const local = localCountsFor(chronicleId);
      applyVoteUi(local.likes, local.dislikes, local.mine);
    }
  }

  window.athRefreshReactions = function athRefreshReactions() {
    const piece = currentChronicle();
    if (piece) {
      refreshCounts(piece.id);
    }
  };

  if (subscribeForm) {
    subscribeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus(subscribeStatus, 'Sending confirmation…');
      try {
        const payload = await callFunction('subscribe', {
          method: 'POST',
          body: { email: subscribeEmail.value },
        });
        setStatus(subscribeStatus, payload.message || 'Check your email to confirm.', 'success');
        subscribeForm.reset();
      } catch (error) {
        setStatus(subscribeStatus, error.message, 'error');
      }
    });
  }

  async function castVote(vote) {
    const piece = currentChronicle();
    if (!piece) return;
    const chronicleId = piece.id;
    setStatus(reactionStatus, '');

    // Always remember this browser's choice locally so the header is never used for vote errors.
    const votes = readLocalVotes();
    votes[chronicleId] = votes[chronicleId] || {};
    votes[chronicleId][getVisitorKey()] = vote;
    writeLocalVotes(votes);

    if (!functionsBase()) {
      if (!stillFocused(chronicleId)) return;
      const local = localCountsFor(chronicleId);
      applyVoteUi(local.likes, local.dislikes, vote);
      return;
    }

    try {
      const payload = await callFunction('react', {
        method: 'POST',
        body: {
          chronicleId,
          visitorKey: getVisitorKey(),
          vote,
        },
      });
      if (!stillFocused(chronicleId)) return;
      applyVoteUi(payload.likes ?? 0, payload.dislikes ?? 0, payload.vote);
    } catch (error) {
      if (!stillFocused(chronicleId)) return;
      const local = localCountsFor(chronicleId);
      applyVoteUi(local.likes, local.dislikes, vote);
      setStatus(reactionStatus, error.message, 'error');
    }
  }

  likeBtn?.addEventListener('click', () => castVote('like'));
  dislikeBtn?.addEventListener('click', () => castVote('dislike'));

  function openSendModal() {
    sendEmail.value = localStorage.getItem(EMAIL_KEY) || '';
    setStatus(sendStatus, '');
    sendModal.hidden = false;
    sendModal.setAttribute('aria-hidden', 'false');
    sendEmail.focus();
  }

  function closeSendModal() {
    sendModal.hidden = true;
    sendModal.setAttribute('aria-hidden', 'true');
  }

  sendNowBtn?.addEventListener('click', openSendModal);
  sendCloseButtons.forEach((button) => button.addEventListener('click', closeSendModal));

  sendForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const piece = currentChronicle();
    if (!piece) return;
    setStatus(sendStatus, 'Sending…');
    try {
      localStorage.setItem(EMAIL_KEY, sendEmail.value.trim());
      const payload = await callFunction('send-article-now', {
        method: 'POST',
        body: {
          email: sendEmail.value,
          chronicleId: piece.id,
        },
      });
      setStatus(sendStatus, payload.message || 'Article sent.', 'success');
      setTimeout(closeSendModal, 900);
    } catch (error) {
      setStatus(sendStatus, error.message, 'error');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sendModal && !sendModal.hidden) {
      closeSendModal();
    }
  });

  // Handle confirm/unsubscribe return links that land on the site with ?subscribed=1 etc.
  const params = new URLSearchParams(window.location.search);
  if (params.get('subscribed') === '1') {
    setStatus(subscribeStatus, 'Subscription confirmed. Welcome.', 'success');
  }
  if (params.get('unsubscribed') === '1') {
    setStatus(subscribeStatus, 'You have been unsubscribed.', 'info');
  }

  window.athRefreshReactions();
})();
