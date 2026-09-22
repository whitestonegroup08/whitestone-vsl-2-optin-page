(() => {
  const form = document.getElementById('lead-form');
  const status = document.getElementById('lead-status');
  const dialog = document.getElementById('lead-gate');
  dialog.showModal();
  document.body.classList.add('lead-locked');
  dialog.addEventListener('cancel', event => event.preventDefault());
  let unlocked = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = form.elements.fullName;
    const mobile = form.elements.mobile;
    const digits = mobile.value.replace(/[\s()+-]/g, '');
    name.setCustomValidity(name.value.trim().length < 2 ? 'Please enter your full name.' : '');
    mobile.setCustomValidity(/^(?:91)?[6-9]\d{9}$/.test(digits) ? '' : 'Enter a valid 10-digit Indian mobile number, optionally with +91.');
    if (!form.reportValidity() || unlocked) return;
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    status.textContent = 'Submitting your details…';
    try {
      const endpoint = window.LEAD_API_URL;
      if (!endpoint || !/^https:\/\//i.test(endpoint)) throw new Error('Registration is not configured yet. Please contact support.');
      const response = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fullName:name.value.trim(),mobile:mobile.value,email:form.elements.email.value.trim(),website:form.elements.website.value}),signal:AbortSignal.timeout(25000)});
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'Unable to submit. Please try again.');
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' ? 'Submission could not be confirmed. Please try again shortly.' : error.message;
      button.disabled = false;
      return;
    }
    unlocked = true;
    form.reset();
    dialog.close();
    document.body.classList.remove('lead-locked');
    const wrap = document.getElementById('video-wrap');
    const player = document.getElementById('video');
    player.setAttribute('autoplay', 'true');
    player.setAttribute('muted', 'false');
    player.setAttribute('silent-autoplay', 'false');
    player.setAttribute('volume', '1');
    player.setAttribute('big-play-button', 'true');
    const errorNote = document.createElement('p');
    errorNote.className = 'video-help';
    errorNote.setAttribute('role', 'status');
    errorNote.hidden = true;
    wrap.after(errorNote);
    const showError = () => {
      errorNote.textContent = 'Video could not load. Please refresh and try again.';
      errorNote.hidden = false;
    };
    player.addEventListener('error', showError);
    const script = document.createElement('script');
    script.src = 'wistia-setup.js';
    script.onerror = showError;
    document.head.appendChild(script);
    wrap.setAttribute('tabindex', '-1');
    wrap.focus({preventScroll:true});
    wrap.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  form.addEventListener('input', event => { event.target.setCustomValidity?.(''); status.textContent = ''; });
})();
