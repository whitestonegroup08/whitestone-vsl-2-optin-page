(() => {
 const c=window.PAGE_CONTENT;if(!c)return;
 const get=id=>document.getElementById(id);
 const safe=value=>{try{const u=new URL(value,location.href);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
 const map={'headline-one':'headlineOne','headline-two':'headlineTwo','guarantee':'guarantee','booking':'bookingText','steps-heading':'stepsHeading','disclaimer':'disclaimer','copyright':'copyright'};
 for(const [id,key]of Object.entries(map))if(typeof c[key]==='string')get(id).textContent=c[key];
 const headline=get('headline-two');
 const amount='10 Lakh/Month';
 const content=headline.textContent;
 const position=content.indexOf(amount);
 if(position!==-1){const highlight=document.createElement('span');highlight.className='revenue-highlight';highlight.textContent=amount;headline.replaceChildren(document.createTextNode(content.slice(0,position)),highlight,document.createTextNode(content.slice(position+amount.length)));}
 for(const [id,key]of Object.entries({booking:'bookingUrl',privacy:'privacyUrl',terms:'termsUrl',refund:'refundUrl'})){const u=safe(c[key]);if(u)get(id).href=u;}
 const bottom=get('booking-bottom');if(bottom){bottom.href=get('booking').href;bottom.textContent=c.bookingText||'BOOK A CALL';}
 const logo=safe(c.logoUrl);if(logo)get('logo').src=logo;get('logo').alt=c.logoAlt||'Mastermind';
 if(Array.isArray(c.steps)){const items=c.steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li;});const li=document.createElement('li');li.append('Any questions? ');const a=document.createElement('a');a.textContent=c.email;a.href='mailto:'+encodeURIComponent(c.email);li.append(a);get('steps').replaceChildren(...items,li);}
 if(c.videoProvider === "wistia") return;
 let url=safe(c.videoUrl);if(url){const u=new URL(url);if(['youtu.be','youtube.com','www.youtube.com'].includes(u.hostname)){const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.split('/').pop();if(/^[\w-]{11}$/.test(id||''))url='https://www.youtube-nocookie.com/embed/'+id;}if(['vimeo.com','www.vimeo.com'].includes(u.hostname)){const id=u.pathname.split('/').pop();if(/^\d+$/.test(id||''))url='https://player.vimeo.com/video/'+id;}if(/\.(mp4|webm)(\?|$)/i.test(url)){const video=document.createElement('video');video.src=url;video.controls=true;video.playsInline=true;video.preload='metadata';get('video-wrap').replaceChildren(video);}else get('video').src=url;}
})();
