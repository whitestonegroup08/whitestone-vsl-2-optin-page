// Paste this ENTIRE file into Cloudflare Worker editor and Deploy.
// Optional ALLOWED_ORIGINS environment variable: comma-separated exact https origins.
export default {
 async fetch(request, env = {}) {
  const path = new URL(request.url).pathname;
  if(request.method === 'GET' && ['/', '/health'].includes(path))
   return json({ok:true,service:'whitestone-leads'});
  if(path !== '/leads') return json({error:'Not found'},404);
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS || 'https://vsl.whitestonegroup.in').split(',').map(s=>s.trim()).filter(Boolean);
  if(!origin || !allowed.includes(origin)) return json({error:'Invalid origin'},403);
  const cors = {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin','Cache-Control':'no-store'};
  const reply = response => {
   const headers = new Headers(response.headers);
   for(const [key,value] of Object.entries(cors)) headers.set(key,value);
   return new Response(response.body,{status:response.status,headers});
  };
  if(request.method === 'OPTIONS') return new Response(null,{status:204,headers:cors});
  if(request.method !== 'POST') return reply(json({error:'Method not allowed'},405));
  try {
   // Bound the body before parsing; no visitor details are logged or stored here.
   const reader = request.body?.getReader();
   let bytes=0; const chunks=[];
   if(reader) while(true) {
    const {done,value}=await reader.read(); if(done) break;
    bytes+=value.byteLength;
    if(bytes>2048) {await reader.cancel(); return reply(json({error:'Request too large'},413));}
    chunks.push(value);
   }
   const joined=new Uint8Array(bytes); let offset=0;
   for(const chunk of chunks) {joined.set(chunk,offset);offset+=chunk.byteLength;}
   const body=new TextDecoder().decode(joined);
   const input=new Request(origin+'/api/leads',{method:'POST',headers:{'Origin':origin,'Content-Type':request.headers.get('Content-Type')||''},body});
   return reply(await handleLead(input));
  } catch {return reply(json({error:'Unable to submit. Please try again.'},500));}
 }
};

const GOOGLE_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSf5lXGRppUc338L9KSy80cUSvDbdNCJC-1GsYGOYvALWwlbNQ/formResponse';
const json = (value, status = 200) => new Response(JSON.stringify(value), {status, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
async function handleLead(request) {
  if (request.method !== 'POST') return json({error:'Method not allowed'},405);
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({error:'Invalid origin'},403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({error:'Invalid request'},415);
  const raw = await request.text();
  if (raw.length > 2048) return json({error:'Request too large'},413);
  let data; try {data=JSON.parse(raw);} catch {return json({error:'Invalid request'},400);}
  if(!data || typeof data !== 'object' || Array.isArray(data)) return json({error:'Invalid request'},400);
  const name=String(data.fullName||'').trim(), mobile=String(data.mobile||'').replace(/[\s()+-]/g,''),email=String(data.email||'').trim();
  if(name.length<2||name.length>100||!/^(?:91)?[6-9]\d{9}$/.test(mobile)||email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error:'Please check your name, mobile number and email.'},400);
  if(data.website) return json({error:'Unable to submit this form.'},400);
  const body=new URLSearchParams({'entry.1052600848':name,'entry.34319445':mobile,'entry.1997649211':email});
  try {
    const response=await fetch(GOOGLE_FORM,{method:'POST',body,signal:AbortSignal.timeout(20000)});
    const html=await response.text();
    const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ');
    if(!response.ok||!visible.includes('Your business assessment has been submitted successfully.')) return json({error:'We could not confirm your submission. Please try again shortly.'},502);
    return json({ok:true});
  } catch {return json({error:'Submission could not be confirmed. Please check your connection and try again.'},502);}
}
