# White Stone Group — Cloudflare backend edition
Target: https://vsl.whitestonegroup.in
Support: support@whitestonegroup.in

Folders: content (policy Markdown), dist (complete frontend), scripts (policy builder), cloudflare (one standalone Worker).
Main page: dist/index.html. Editable page content: dist/config.js.
Read SETUP-HINGLISH.md. Set window.LEAD_API_URL in dist/config.js AFTER obtaining your actual Worker address. It is intentionally empty, not a made-up endpoint.

Frontend stays on DigitalOcean Static Site, source dist. Cloudflare Worker is deployed separately using cloudflare/worker.mjs in its dashboard. No npm packages, Node service, database or paid DigitalOcean lead-api is needed for this edition.

Leads go to https://forms.gle/6AhLCBaWQ27paGmS6 using existing public form field mappings. This is a public form submission integration, not an official Google Forms API. Google can change submission behavior; live verification is required. The handler checks the visible confirmation sentence before unlocking video:
Your business assessment has been submitted successfully.

No real lead submitted during local tests. Google Form must remain published, publicly answerable and accepting responses. Changes to questions, validation or confirmation text require integration updates. Do not automatically retry uncertain submissions: they might already be saved.

Only confirmed submissions unlock Wistia phlyf9l656. Audible autoplay is attempted; browsers can require a Play tap. Wistia video is externally hosted. This UI gate is not secure paid-content protection.

Worker uses a specific-origin CORS policy, server validation, bounded body size and honeypot. Origin checks are not bot authentication; monitor abuse and add verified anti-bot checks if needed. Free plan quotas/CPU limits apply; no unlimited availability promise. No personal details logged by this code. No Pixel or Kit installed.

Policy edits: python3 scripts/build-policies.py; commit content and generated dist policy files. Noindex retained for testing. Worker changes pasted in dashboard must be deployed there separately; GitHub commit alone does not update the Worker in this setup.
