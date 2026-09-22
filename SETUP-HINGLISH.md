# Cloudflare Free backend: complete setup

1. ZIP extract karein. Ismein content, dist, scripts, cloudflare, README.md aur ye guide hain.
2. https://dash.cloudflare.com par account/login karein. Workers Free plan use karein. Domain transfer/nameserver change nahi chahiye.
3. Workers & Pages > Create application > Create Worker / Hello World option choose karein. Worker name whitestone-leads rakhein. Deploy.
4. Edit code kholein. Default worker code poora replace karke cloudflare/worker.mjs ka ENTIRE text paste karein. Save and Deploy/Deploy karein. Ye single self-contained file hai; npm start nahi.
5. Settings > Domains & Routes se production workers.dev URL copy karein (preview URL nahi). Workers.dev enabled hona chahiye. Browser mein URL + /health kholein: {"ok":true,"service":"whitestone-leads"}. Hello World dikhe toh replacement deploy nahi hua.
6. Worker default sirf https://vsl.whitestonegroup.in accept karta hai. Extra starter domain testing chahiye toh Settings > Variables and Secrets mein text ALLOWED_ORIGINS add karein: exact https origins comma-separated, no trailing slash. Secrets/tokens frontend mein na paste karein.
7. GitHub mein SUBDOMAIN wali repository kholein. Main website wali repo nahi. Add file > Upload files se is extracted folder ke ANDAR ke content, dist, scripts, cloudflare, README.md, SETUP-HINGLISH.md upload/replace karein. Commit changes. ZIP ya outer folder upload na karein. Existing lead-api folder is edition mein used nahi; GitHub se folder hataane se running DO resource/billing band nahi hota.
8. GitHub > dist > config.js > pencil Edit. Last line window.LEAD_API_URL = ''; mein quotes ke beech aapka actual production Worker URL + /leads paste karein. Example FORMAT: window.LEAD_API_URL = 'https://whitestone-leads.YOUR-SUBDOMAIN.workers.dev/leads'; YOUR-SUBDOMAIN literal mat rakhein. Commit changes.
9. DigitalOcean SUBDOMAIN app: Static Site source dist, branch main, build blank, output Auto, route /. Latest deployment successful hone dein. Is edition ke liye DO paid lead-api service add na karein.
10. GoDaddy vsl CNAME nayi DigitalOcean Static Site app ko point kare. Cloudflare Worker ko vsl DNS point nahi karna. DigitalOcean Networking mein vsl.whitestonegroup.in Active/HTTPS ready hona chahiye. Main domain @/www/NS records same rakhein.
11. Incognito mein https://vsl.whitestonegroup.in kholein. Real test details submit karein. Google Form editor > Responses mein entry verify karein. Popup close, video unlock, mobile and Facebook in-app playback test karein. Sound autoplay blocked ho toh native Play tap karein.
12. Agar DO paid lead-api pehle create hua hai: successful Cloudflare end-to-end test KE BAAD sirf us backend component ko select karke its delete/destroy component action se remove karein. App/Static Site/domain delete nahi karna. / route Static Site par rehna chahiye. Billing mein resource removal verify karein; already incurred usage charge remain kar sakta hai. Existing separate main-site hosting charges unchanged.

Troubleshooting:
- Registration not configured: dist/config.js mein real URL set nahi ya latest frontend deploy nahi hua.
- Failed to fetch: URL, Worker deployment, CORS allowed origin, network check karein.
- 403: actual website origin ALLOWED_ORIGINS mein exact match kare.
- 404: request URL /leads par end hona chahiye.
- Could not confirm/502: Google Form Responses pehle check karein; form accepting/public/field IDs/confirmation text verify karein. Repeated retry duplicate leads bana sakta hai.
- /health OK is only readiness, not proof Google saved a lead.
- Cloudflare quota/CPU errors: Worker metrics/errors check karein. Free plan limited hai.

Pricing: https://developers.cloudflare.com/workers/platform/pricing/
Dashboard guide: https://developers.cloudflare.com/workers/get-started/dashboard/
