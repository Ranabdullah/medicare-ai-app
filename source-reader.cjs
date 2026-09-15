const cheerio = require('cheerio');
const cache = new Map();
function valid(value) {
  const u = new URL(value);
  if(u.protocol !== 'https:' || u.port || u.username || u.password || !['www.nhs.uk','www2.hse.ie','medlineplus.gov','www.medlineplus.gov','www.nlm.nih.gov'].includes(u.hostname)) throw new Error('Unsupported source');
  return u;
}
async function readSource(value) {
  let url=valid(value);
  const cached=cache.get(url.href);if(cached && Date.now()-cached.at<3600000)return cached.data;
  const original=url.href;
  let response;
  for(let i=0;i<5;i++){
    response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'MediCare patient-information preview'}});
    if(response.status>=300 && response.status<400){url=valid(new URL(response.headers.get('location'),url).href);continue;}
    break;
  }
  if(!response.ok || !response.headers.get('content-type')?.includes('text/html'))throw new Error('Source unavailable');
  let html='';for await(const chunk of response.body){html+=Buffer.from(chunk).toString('utf8');if(html.length>2000000)throw new Error('Source too large');}
  const $=cheerio.load(html);
  $('script,style,nav,footer,header,form,aside,.nhsuk-breadcrumb,.nhsuk-feedback-banner').remove();
  const main=$('main').first().length?$('main').first():$('#main, #topic-summary').first();
  if(!main.length)throw new Error('No article');
  const sections=[];let section={heading:'Overview',paragraphs:[]},parentHeading='Overview';
  main.find('h2,h3,p,li').each((_,el)=>{
    const tag=el.tagName.toLowerCase(),text=$(el).text().replace(/\s+/g,' ').trim();
    if(!text || /^(Page last reviewed|Next review due|Find out more|More in|Page last updated)/i.test(text))return;
    if(tag==='h2'||tag==='h3') {if(section.paragraphs.length)sections.push(section);if(tag==='h2')parentHeading=text;section={heading:/^(Do|Don.t)$/i.test(text)?parentHeading+' — '+text:text,paragraphs:[]};}
    else if(!$(el).parents('li').length && !$(el).find('li').length && text.length>25 && section.paragraphs.length<5) section.paragraphs.push(text);
  });
  if(section.paragraphs.length)sections.push(section);
  const compact=sections.filter(s=>!/cookie|website|feedback|navigation|useful links|other formats/i.test(s.heading)).slice(0,24).map(s=>({...s,paragraphs:s.paragraphs.map(p=>p.split(/\s+/).slice(0,55).join(' ')+(p.split(/\s+/).length>55?' …':''))}));
  if(!compact.length)throw new Error('No readable sections');
  const data={title:$('h1').first().text().trim()||$('title').text(),url:url.href,retrievedAt:new Date().toISOString(),sections:compact};
  if(cache.size>150)cache.delete(cache.keys().next().value);
  cache.set(original,{at:Date.now(),data});return data;
}
module.exports={readSource,valid};
