(() => {
  const id = window.PAGE_CONTENT?.wistiaMediaId;

  if (
    window.PAGE_CONTENT?.videoProvider !== 'wistia' ||
    !/^[a-z0-9]{10}$/.test(id || '')
  ) return;

  /* ---------------------------------------------------------
     WISTIA OPTIONS
     Important: fitStrategy = contain prevents video cropping.
  --------------------------------------------------------- */
  window.wistiaOptions = {
    [id]: {
      copyLinkAndThumbnailEnabled: false,
      endVideoBehavior: 'reset',

      /* IMPORTANT */
      fitStrategy: 'contain',

      playbar: false,
      smallPlayButton: false,
      playbackRateControl: true,
      qualityControl: true,
      resumable: false,
      volumeControl: true,
      settingsControl: true,
      fullscreenButton: true,

      plugin: {
        share: {
          on: false,
          channels: ''
        },

        chapters: {
          on: false,
          chapterList: []
        },

        captions: {
          on: false
        },

        'captions-v1': {
          on: false
        },

        'midrollLink-v1': {
          links: false
        },

        'postRoll-v1': {
          on: false
        }
      }
    }
  };


  /* ---------------------------------------------------------
     LOAD WISTIA SCRIPTS
  --------------------------------------------------------- */
  for (const [src, type] of [
    ['https://fast.wistia.com/player.js', ''],
    ['https://fast.wistia.com/embed/' + id + '.js', 'module']
  ]) {

    /* Prevent loading same script multiple times */
    if (document.querySelector(`script[src="${src}"]`)) continue;

    const script = document.createElement('script');

    script.src = src;
    script.async = true;

    if (type) script.type = type;

    document.head.appendChild(script);
  }


  /* ---------------------------------------------------------
     PLAYER SETUP
  --------------------------------------------------------- */
  function setupPlayer() {

    const player = document.querySelector('wistia-player');

    if (!player) return;


    /* -------------------------------------------------------
       BASIC PLAYER SETTINGS
    ------------------------------------------------------- */

    player.setAttribute('media-id', id);

    player.setAttribute('autoplay', 'true');
    player.setAttribute('muted', 'false');
    player.setAttribute('silent-autoplay', 'false');

    player.setAttribute('big-play-button', 'true');

    player.setAttribute('volume', '1');


    /* =======================================================
       IMPORTANT FIX
       Preserve complete original video.
       Never crop the top / bottom / left / right.
    ======================================================= */

    player.setAttribute('fit-strategy', 'contain');

    /*
      Do NOT force:
      fit-strategy="cover"

      Do NOT force a 16:9 aspect here unless the SOURCE
      VIDEO itself is actually 16:9.
    */


    /* -------------------------------------------------------
       RESPONSIVE PLAYER
    ------------------------------------------------------- */

    player.style.setProperty('display', 'block');
    player.style.setProperty('width', '100%');
    player.style.setProperty('max-width', '100%');


    /* -------------------------------------------------------
       PLAYER CONTROLS
    ------------------------------------------------------- */

    const playerOptions = {
      'play-bar-control': 'false',

      'play-pause-control': 'false',

      'playback-rate-control': 'true',

      'quality-control': 'true',

      'resumable': 'false',

      'volume-control': 'true',

      'settings-control': 'true',

      'fullscreen-control': 'true'
    };

    for (const [name, value] of Object.entries(playerOptions)) {
      player.setAttribute(name, value);
    }


    /* -------------------------------------------------------
       COMPACT CONTROLS
    ------------------------------------------------------- */

    const compactCSS = `
      .w-bottom-bar {
        left: auto !important;
        right: 0 !important;
        bottom: 0 !important;

        width: 280px !important;
        max-width: 100% !important;

        transform: scale(.65) !important;
        transform-origin: bottom right !important;
      }
    `;


    const styledRoots = new WeakSet();


    function applyCompactControls(root) {

      if (!root) return;

      if (!styledRoots.has(root)) {

        styledRoots.add(root);

        const style = document.createElement('style');

        style.textContent = compactCSS;

        root.appendChild(style);


        const observer = new MutationObserver(() => {
          applyCompactControls(root);
        });


        observer.observe(root, {
          childList: true,
          subtree: true
        });
      }


      root.querySelectorAll('*').forEach(element => {

        if (element.shadowRoot) {
          applyCompactControls(element.shadowRoot);
        }

      });
    }


    function compact() {
      applyCompactControls(player.shadowRoot);
    }


    /* -------------------------------------------------------
       FORCE CONTAIN AGAIN AFTER PLAYER LOAD
       This protects against player/customisation overrides.
    ------------------------------------------------------- */

    function forceCorrectVideoFit() {

      player.setAttribute('fit-strategy', 'contain');

      /*
        Aurora Player JS property.
        Official supported equivalent of fit-strategy attribute.
      */

      try {
        player.fitStrategy = 'contain';
      } catch (e) {
        /* Ignore if player has not fully upgraded yet */
      }
    }


    player.addEventListener('api-ready', () => {

      forceCorrectVideoFit();

      compact();

    });


    player.addEventListener('loaded-data', () => {

      forceCorrectVideoFit();

      compact();

    });


    customElements
      .whenDefined('wistia-player')
      .then(() => {

        forceCorrectVideoFit();

        compact();

      });


    /* -------------------------------------------------------
       PREVENT VIDEO SEEKING / SKIPPING
    ------------------------------------------------------- */

    let lastTime = 0;

    let seeking = false;

    let correction = false;


    player.addEventListener('time-update', () => {

      if (
        !seeking &&
        !correction &&
        Number.isFinite(player.currentTime)
      ) {

        lastTime = player.currentTime;

      }

    });


    player.addEventListener('seeking', () => {

      seeking = true;


      if (
        !correction &&
        Math.abs(player.currentTime - lastTime) > 1
      ) {

        correction = true;

        player.currentTime = lastTime;

      }

    });


    player.addEventListener('seeked', () => {

      seeking = false;

      correction = false;

    });


    player.addEventListener('ended', () => {

      lastTime = 0;

    });


    /* -------------------------------------------------------
       BLOCK KEYBOARD SEEK
    ------------------------------------------------------- */

    document.addEventListener(
      'keydown',

      event => {

        if (!event.composedPath().includes(player)) return;


        const blockedKeys = [
          'ArrowLeft',
          'ArrowRight',
          'Home',
          'End',
          'j',
          'J',
          'l',
          'L'
        ];


        if (
          blockedKeys.includes(event.key) ||
          /^[0-9]$/.test(event.key)
        ) {

          event.preventDefault();

          event.stopImmediatePropagation();

        }

      },

      true
    );
  }


  /* ---------------------------------------------------------
     START PLAYER
  --------------------------------------------------------- */

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      setupPlayer,
      { once: true }
    );

  } else {

    setupPlayer();

  }

})();
