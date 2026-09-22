(() => {
 const id = window.PAGE_CONTENT?.wistiaMediaId;
 if (window.PAGE_CONTENT?.videoProvider !== 'wistia' || !/^[a-z0-9]{10}$/.test(id || '')) return;
 window.wistiaOptions = {
   [id]: {
     copyLinkAndThumbnailEnabled: false,
     endVideoBehavior: 'reset',
     playbar: false,
     smallPlayButton: false,
     playbackRateControl: true,
     qualityControl: true,
     resumable: false,
     volumeControl: true,
     settingsControl: true,
     fullscreenButton: true,
     plugin: {
       share: {on: false, channels: ''},
       chapters: {on: false, chapterList: []},
       captions: {on: false},
       'captions-v1': {on: false},
       'midrollLink-v1': {links: false},
       'postRoll-v1': {on: false}
     }
   }
 };
 for (const [src, type] of [['https://fast.wistia.com/player.js', ''], ['https://fast.wistia.com/embed/' + id + '.js', 'module']]) {
   const script = document.createElement('script');
   script.src = src; script.async = true;
   if (type) script.type = type;
   document.head.appendChild(script);
 }
 function setupPlayer() {
   const player = document.querySelector('wistia-player');
   if (!player) return;
   player.setAttribute('media-id', id);
   player.setAttribute('autoplay', 'true');
   player.setAttribute('muted', 'false');
   player.setAttribute('silent-autoplay', 'false');
   player.setAttribute('big-play-button', 'true');
   player.setAttribute('volume', '1');
   // Wistia renders controls inside an open shadow root. Scope the presentation
   // override to the player, leaving its video, menu actions and branding intact.
   const compactCSS = `.w-bottom-bar{left:auto!important;right:0!important;bottom:0!important;width:280px!important;max-width:100%!important;transform:scale(.65)!important;transform-origin:bottom right!important}`;
   const styledRoots = new WeakSet();
   function applyCompactControls(root) {
     if (!root) return;
     if (!styledRoots.has(root)) {
       styledRoots.add(root);
       const style = document.createElement('style');
       style.textContent = compactCSS;
       root.appendChild(style);
       const observer = new MutationObserver(() => applyCompactControls(root));
       observer.observe(root, {childList: true, subtree: true});
     }
     root.querySelectorAll('*').forEach(element => {
       if (element.shadowRoot) applyCompactControls(element.shadowRoot);
     });
   }
   function compact() { applyCompactControls(player.shadowRoot); }
   player.addEventListener('api-ready', compact);
   player.addEventListener('loaded-data', compact);
   customElements.whenDefined('wistia-player').then(compact);

   // Suppress navigation controls before and after the custom element upgrades.
   for (const [name, value] of Object.entries({
     'play-bar-control': 'false', 'play-pause-control': 'false',
     'playback-rate-control': 'true', 'quality-control': 'true', 'resumable': 'false',
     'volume-control': 'true', 'settings-control': 'true',
     'fullscreen-control': 'true'
   })) player.setAttribute(name, value);
   let lastTime = 0;
   let seeking = false;
   let correction = false;
   player.addEventListener('time-update', () => {
     if (!seeking && !correction && Number.isFinite(player.currentTime)) lastTime = player.currentTime;
   });
   player.addEventListener('seeking', () => {
     seeking = true;
     if (!correction && Math.abs(player.currentTime - lastTime) > 1) {
       correction = true;
       player.currentTime = lastTime;
     }
   });
   player.addEventListener('seeked', () => {
     seeking = false;
     correction = false;
   });
   player.addEventListener('ended', () => { lastTime = 0; });
   document.addEventListener('keydown', event => {
     if (!event.composedPath().includes(player)) return;
     if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'j', 'J', 'l', 'L'].includes(event.key) || /^[0-9]$/.test(event.key)) {
       event.preventDefault();
       event.stopImmediatePropagation();
     }
   }, true);
 }
 if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupPlayer, {once:true}); else setupPlayer();
})();
