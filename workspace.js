document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id), M=window.MediCare;
 const logo=document.querySelector('.logo-icon');
 if(logo)logo.outerHTML='<button id="menu-toggle" class="btn btn-icon" aria-label="Open navigation" aria-expanded="false">☰</button><img class="brand-mark" src="assets/medicare-logo.svg" alt="" width="42" height="42">';
 document.querySelector('.sidebar').insertBefore(document.querySelector('.app-nav'),document.querySelector('.profile-selector-card'));
 document.querySelector('.profile-header-btns').hidden=true;
 document.querySelector('.header-actions .dropdown-wrapper').hidden=true;
 $('btn-toggle-theme').hidden=true;
 document.querySelector('.hpra-legend-bar').innerHTML='<span><i class="fa-solid fa-circle-info"></i> Your schedule follows the medicines you add. Always use the dose on your prescription or product label.</span>';
 document.querySelector('.profile-card-header h3').textContent='My health topics';
 document.querySelector('.profile-card-header p').textContent='Check a topic to tailor your care.';
 const profile=document.querySelector('.profile-selector-card');
 const browse=document.createElement('div');browse.className='browse-topics';
 browse.innerHTML='<label for="common-topics">Explore the health library</label><select id="common-topics"><option value="">Choose a common topic…</option>'+M.topics.map(t=>`<option value="${t.id}">${M.escape(t.label)} · ${t.kind}</option>`).join('')+'</select>';
 profile.prepend(browse);
 $('common-topics').onchange=e=>{if(e.target.value)M.detail(M.topics.find(t=>t.id===e.target.value));};
 const grid=$('conditions-checkbox-grid');const details=document.createElement('details');details.className='profile-details';details.open=true;details.innerHTML='<summary>My saved topics</summary>';grid.before(details);details.append(grid);
 const input=$('custom-disease-input'), add=$('btn-add-custom-disease');
 input.placeholder='Disease, symptom or goal…';input.setAttribute('aria-label','Search for a disease, symptom or wellness goal');input.maxLength=100;
 add.textContent='+ Add disease';
 const status=document.createElement('p');status.id='topic-search-status';status.className='search-status';status.setAttribute('role','status');
 const results=document.createElement('div');results.id='topic-search-results';results.className='topic-results';
 document.querySelector('.add-disease-row').after(status,results);
 const privacy=document.createElement('p');privacy.className='sidebar-footnote';privacy.textContent='Online searches send only your search term to the US National Library of Medicine.';results.after(privacy);const addRow=document.querySelector('.add-disease-row');details.before(addRow,status,results,privacy);
 let controller,request=0;
 input.addEventListener('input',()=>{request++;controller?.abort();results.replaceChildren();status.textContent='';add.disabled=false;});
 async function search(){
   const term=input.value.trim();
   if(term.length<2){status.textContent='Enter a disease, symptom or wellness goal (at least 2 characters).';return;}
   const seq=++request;controller?.abort();controller=new AbortController();const thisController=controller;
   status.textContent='Searching medical topics online…';results.replaceChildren();add.disabled=true;
   const normalized=term.toLowerCase().replace(/[^a-z0-9]/g,'');
   const aliases={fatloss:'weight_loss',weightloss:'weight_loss',headaches:'headache',headache:'headache',diabetes:'diabetes'};
   const local=M.topics.filter(t=>t.id===aliases[normalized]||t.label.toLowerCase().includes(term.toLowerCase()));
   function row(topic){const b=document.createElement('button');b.type='button';b.className='topic-result';b.textContent=topic.label; b.onclick=()=>{M.detail(topic);status.textContent='Review the topic, then choose Add to my topics.';};results.append(b);}
   local.forEach(row);
   const timeout=setTimeout(()=>thisController.abort(),12000);
   try{
     const params=new URLSearchParams({terms:term,ef:'info_link_data',maxList:'7'});
     const response=await fetch(`https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?${params}`,{signal:thisController.signal});
     if(!response.ok)throw new Error('network');
     const data=await response.json();if(seq!==request)return;
     if(!Array.isArray(data[1])||!Array.isArray(data[3]))throw new Error('format');
     data[1].forEach((id,i)=>{
       const label=data[3][i]?.[0];if(!label||local.some(t=>t.label.toLowerCase()===label.toLowerCase()))return;
       const sources=(data[2]?.info_link_data?.[i]||[]).map(([url,title])=>({title,url:url.replace(/^http:/,'https:').replace('www.nlm.nih.gov/medlineplus/','medlineplus.gov/')})).filter(s=>M.safeUrl(s.url));
       row({id:'nlm_'+id,label,sources});
     });
     status.textContent=results.children.length?'Choose the matching topic to review its sources.':'No match found. Enter a recognised disease or symptom, or check the spelling. This directory does not contain every condition.';
   }catch{if(seq===request)status.textContent=local.length?'Online search is unavailable. You can open these saved, sourced guides.':'Could not reach the medical directory. Check your connection and retry; your entry has not been added.';}
   finally{clearTimeout(timeout);if(seq===request)add.disabled=false;}
 }
 add.onclick=search;input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search();}});
 document.querySelectorAll('.ai-generator-banner,.filter-box').forEach(el=>el.hidden=true);
 const exerciseHeader=document.querySelector('#tab-exercises .panel-header');exerciseHeader.querySelector('h2').textContent='Movement & exercise';exerciseHeader.querySelector('p').textContent='Guidance for the health topics you select, with a source on every card.';
 document.querySelector('#tab-remedies .panel-header h2').textContent='Everyday care';document.querySelector('#tab-remedies .panel-header p').textContent='Practical self-care for your selected topics, grounded in patient information.';
 document.querySelector('#tab-ai-consultant h2').textContent='AI Doctor';document.querySelector('#tab-ai-consultant .subtitle').textContent='Source-backed health education. Not a diagnosis or prescription.';
 $('btn-generate-ai-plan').textContent='Explain my health topics';
 M.refresh(window.medicareProfile.list().filter(d=>d.checked));
 $('ai-user-query').placeholder='What would you like to understand?';
 document.querySelector('#tab-library .detail-heading') || ($('condition-detail').innerHTML='<div class="detail-heading"><div><span class="topic-kind">YOUR GUIDE TO EVERYDAY HEALTH</span><h2>Small questions. Trusted sources.</h2><p>Explore symptoms, long-term conditions and healthy habits.</p></div></div><div class="library-topic-grid">'+M.topics.map(t=>`<button class="topic-tile" data-topic="${t.id}"><span class="topic-kind">${t.kind}</span><strong>${M.escape(t.label)}</strong><span>Explore care & guidance ↗</span></button>`).join('')+'</div>');
 document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>M.detail(M.topics.find(t=>t.id===b.dataset.topic)));
 function setMenu(open){document.body.classList.toggle('menu-open',open);$('menu-toggle').setAttribute('aria-expanded',String(open));$('sidebar-scrim').hidden=!open;}
 $('menu-toggle').onclick=()=>setMenu(!document.body.classList.contains('menu-open'));
 $('sidebar-scrim').onclick=()=>setMenu(false);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);$('menu-toggle').focus();}});
 document.querySelectorAll('.nav-tab').forEach(b=>b.addEventListener('click',()=>{
   document.querySelectorAll('.nav-tab').forEach(n=>{if(n===b)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});
   if(b.dataset.tab==='tab-ai-consultant')M.refresh(window.medicareProfile.list().filter(d=>d.checked));
   setMenu(false);window.scrollTo({top:0,behavior:'smooth'});
 }));
 document.querySelector('.nav-tab.active').setAttribute('aria-current','page');
 // Avoid treating the sidebar's checkboxes as automatically prescribed medicines.
 const welcome=document.createElement('div');welcome.className='schedule-welcome';welcome.innerHTML='<div><span class="topic-kind">MAKE SPACE FOR YOUR WELLBEING</span><h3>Your health, one day at a time.</h3><p>Keep your medicines organised and find care you can understand.</p><button class="btn btn-primary" id="welcome-add">+ Add your medication</button></div><div class="welcome-art" aria-hidden="true"><img src="assets/medicare-logo.svg" alt=""><span>♡</span></div>';
 document.querySelector('#tab-schedule .panel-header').after(welcome);$('welcome-add').onclick=()=>document.querySelector('[data-tab="tab-add"]').click();
});
