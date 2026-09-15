/* Curated summaries link to the exact source used. No treatment is added to a schedule. */
(() => {
  const rows = [
    ['headache','Headache','Symptom','Headaches are common; recurring or worsening pain needs assessment.','Paracetamol or ibuprofen may help when suitable. Follow the label and check with a pharmacist.','Rest and relaxation can help. Seek advice if exercise brings on or worsens a headache.','Drink water, keep regular meals and take screen breaks.','Sudden extreme pain, weakness, confusion or loss of vision needs emergency care.','symptoms/headaches/'],
    ['weight_loss','Fat loss & healthy weight','Wellness goal','Build sustainable habits rather than aiming for rapid weight loss.','This guide does not recommend weight-loss medicines. Discuss treatment options with a clinician.','Build towards 150 minutes of activity each week, in manageable sessions.','Try balanced meals and swap sugary drinks for water. Avoid crash diets.','Get individual advice before starting a weight-loss programme if you have a medical condition.','live-well/healthy-weight/managing-your-weight/tips-to-help-you-lose-weight/'],
    ['diabetes','Type 2 diabetes','Condition','Care combines blood-glucose monitoring, lifestyle changes and medicines when needed.','Treatment may include metformin and other glucose-lowering medicines. Your clinician chooses the combination.','Walking or another suitable activity spread across the week can help.','Choose a balanced diet; avoid a very restrictive diet without professional advice.','Do not change diabetes medicines yourself. This guide is for type 2, not type 1 diabetes.','conditions/type-2-diabetes/treatment/'],
    ['hypertension','High blood pressure','Condition','Regular blood-pressure checks help monitor a condition that often has no symptoms.','A clinician may prescribe blood-pressure medicines depending on your readings and risks.','Regular activity can help lower blood pressure.','Reduce salt, eat a balanced diet and limit alcohol.','Chest pain with other symptoms may be an emergency; seek urgent medical help.','conditions/high-blood-pressure/'],
    ['pneumonia','Pneumonia','Condition','A lung infection that may require medical treatment, especially in vulnerable people.','Antibiotics may be prescribed; the choice and duration depend on clinical assessment.','Rest during illness and return to activity gradually as you recover.','Rest, drink fluids and follow your prescribed treatment.','Severe breathing difficulty, blue lips or sudden confusion needs emergency help.','conditions/pneumonia/'],
    ['asthma','Asthma','Condition','An airway condition managed with an individual treatment and action plan.','Inhalers are the main treatment; a clinician selects the appropriate preventer and reliever plan.','Stay active; ask your clinician how to manage exercise-triggered symptoms.','Avoid known triggers and review inhaler technique with your care team.','Follow your asthma action plan. A worsening attack that is not improving needs emergency help.','conditions/asthma/'],
    ['back_pain','Back pain','Symptom','Many episodes improve, but certain symptoms require urgent assessment.','Ask a pharmacist about a suitable painkiller; anti-inflammatory medicines are not suitable for everyone.','Keep moving within your comfort level; walking and suitable stretches may help.','Avoid prolonged bed rest. Heat or cold packs may ease discomfort.','New bladder or bowel problems, or numbness around the genitals, needs emergency assessment.','conditions/back-pain/'],
    ['cholesterol','High cholesterol','Condition','Lifestyle changes can help reduce cholesterol and cardiovascular risk.','Discuss whether medicine is needed with your clinician.','Try walking, cycling or swimming; build towards regular weekly activity.','Replace some saturated fats with unsaturated fats and eat more wholegrains.','Arrange follow-up cholesterol testing with your care team.','conditions/high-cholesterol/how-to-lower-your-cholesterol/'],
    ['fatty_liver','Fatty liver (MASLD)','Condition','Fat can build up in the liver, sometimes without symptoms.','Specialist treatment depends on liver damage; supplements are not a routine self-treatment.','Regular activity, aiming for 150 minutes a week when suitable, can help.','Eat a balanced diet and work towards a healthy weight.','Attend follow-up tests; advanced liver disease needs specialist care.','conditions/non-alcoholic-fatty-liver-disease/'],
    ['hypotension','Low blood pressure','Condition','Low readings can cause dizziness or fainting, especially when standing.','A clinician may review medicines or investigate the underlying cause.','Change position slowly, especially when rising from bed.','Small frequent meals and adequate water may help.','Repeated dizziness or fainting needs medical review.','conditions/low-blood-pressure-hypotension/'],
    ['anemia','Iron deficiency anaemia','Condition','Blood tests help confirm low iron and identify its cause.','Iron tablets may be prescribed after assessment.','Discuss activity with your clinician if you are breathless or fatigued.','Include iron-containing foods and follow advice about prescribed iron.','Do not assume all anaemia is iron deficiency; the cause needs assessment.','conditions/iron-deficiency-anaemia/'],
    ['acid_reflux','Heartburn & acid reflux','Condition','Stomach acid coming back into the food pipe can cause burning discomfort.','A pharmacist may recommend antacids or alginates; persistent symptoms need review.','Avoid lying down soon after a meal.','Smaller meals and avoiding personal food triggers may help.','Difficulty swallowing, frequent symptoms or unexplained weight loss needs assessment.','conditions/heartburn-and-acid-reflux/'],
    ['joint_arthritis','Arthritis','Condition','Different types of arthritis need different treatment plans.','Treatment depends on the arthritis type and may include specialist medicines.','Appropriate regular exercise and physiotherapy can support joint function.','Discuss weight management and joint protection with your care team.','Get persistent joint pain or swelling assessed.','conditions/arthritis/'],
    ['anxiety_stress','Anxiety & stress','Condition','Persistent anxiety can be treated with professional support.','Talking therapies and, when appropriate, medicines are treatment options.','Regular exercise and relaxation may help manage symptoms.','Seek support if anxiety affects everyday life.','Get urgent help if you cannot keep yourself safe.','mental-health/conditions/generalised-anxiety-disorder-gad/']
  ];
  const topics = rows.map(([id,label,kind,overview,medicine,exercise,care,safety,path]) => ({id,label,kind,overview,medicine,exercise,care,safety,sources:[{title:`NHS: ${label}`,url:`https://www.nhs.uk/${path}`}]}));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
  const sources = topic => (topic.sources || []).filter(s => safeUrl(s.url)).map(s => `<a class="source-link" href="${escape(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">↗ ${escape(s.title)}</a>`).join('');
  const fallback = topic => ({...topic,kind:'Directory topic',overview:'Found in the NLM medical conditions directory. Open the linked patient information for details.',medicine:'No medication summary has been reviewed for this topic. Use the linked source and discuss treatment with a clinician.',exercise:'No condition-specific exercise recommendation is available here. Consult the source and your care team.',care:'Open the patient information below for condition-specific care.',safety:'This directory entry confirms a medical term, not a personal diagnosis.',sources: topic.sources?.length ? topic.sources : [{title:'NLM medical conditions directory',url:'https://clinicaltables.nlm.nih.gov/apidoc/conditions/v3/doc.html'}]});
  const find = topic => topics.find(t => t.id === topic.id) || fallback(topic);
  const medicineOptions = [
    {name:'Paracetamol (acetaminophen)',topics:['headache'],access:'Common non-prescription pain relief',use:'Used for pain and fever. Check the product label and avoid taking more than one product containing paracetamol.',url:'https://www.nhs.uk/medicines/paracetamol-for-adults/'},
    {name:'Ibuprofen / other NSAIDs',topics:['headache','back_pain','joint_arthritis'],access:'Some products are available without prescription',use:'Used for pain and inflammation. May cause stomach bleeding or kidney problems and may be unsuitable with certain conditions or medicines. Ask a pharmacist about suitability.',url:'https://www.nhs.uk/medicines/nsaids/'},
    {name:'Metformin',topics:['diabetes'],access:'Prescription treatment',use:'Used for type 2 diabetes. It may be part of a combination chosen by your clinician; it is not a treatment for every type of diabetes.',url:'https://www.nhs.uk/medicines/metformin/'},
    {name:'Antacids and alginates',topics:['acid_reflux'],access:'Common pharmacy options',use:'May relieve heartburn symptoms. Persistent symptoms need assessment; other acid-reducing treatments may be considered by a clinician.',url:'https://www.nhs.uk/conditions/heartburn-and-acid-reflux/'},
    {name:'Prescribed inhalers',topics:['asthma'],access:'Clinician-selected treatment',use:'The preventer and reliever inhaler plan must match your asthma assessment and action plan. Inhalers are not interchangeable.',url:'https://www.nhs.uk/conditions/asthma/'},
    {name:'Antibiotics when indicated',topics:['pneumonia'],access:'Prescription treatment',use:'A clinician decides whether antibiotics are needed and which antibiotic, dose and duration are appropriate. Do not reuse an old pneumonia prescription.',url:'https://www.nhs.uk/conditions/pneumonia/'},
    {name:'Iron replacement',topics:['anemia'],access:'Professional assessment needed',use:'Iron tablets may be prescribed after iron deficiency is confirmed and its cause investigated. Not all anaemia is caused by low iron.',url:'https://www.nhs.uk/conditions/iron-deficiency-anaemia/'}
  ];
  function optionsFor(t){
    const items=medicineOptions.filter(m=>m.topics.includes(t.id));
    return items.length?'<div class="medicine-options"><h4>Common options to discuss</h4>'+items.map(m=>'<article class="medicine-option"><h4>'+escape(m.name)+'</h4><span class="topic-kind">'+escape(m.access)+'</span><p>'+escape(m.use)+'</p><a class="source-link" href="'+escape(m.url)+'" target="_blank" rel="noopener noreferrer">Source: NHS medicine information</a></article>').join('')+'<p class="review-note">Examples, not a prescription or a complete list. Product strength and local availability vary; confirm with an Irish pharmacist. No dose or medicine is added automatically.</p></div>':'';
  }
  function sourcePanel(t, category) {
    const urls=(t.sources||[]).filter(s=>{try{return ['www.nhs.uk','www2.hse.ie','medlineplus.gov','www.medlineplus.gov','www.nlm.nih.gov'].includes(new URL(s.url).hostname);}catch{return false;}});
    return urls.length ? '<section class="source-reading" data-source-url="'+escape(urls[0].url)+'" data-category="'+escape(category)+'"><p class="source-loading" role="status">Loading patient information from the source…</p></section>' : '';
  }
  const sourceRequests=new Map();
  async function loadSource(url){
    if(!sourceRequests.has(url))sourceRequests.set(url,fetch('/api/source?url='+encodeURIComponent(url),{signal:AbortSignal.timeout(30000)}).then(r=>{if(!r.ok)throw new Error('source');return r.json();}).catch(e=>{sourceRequests.delete(url);throw e;}));
    return sourceRequests.get(url);
  }
  async function populateSource(el){
    if(el.dataset.loading)return;el.dataset.loading='true';
    try{
      const data=await loadSource(el.dataset.sourceUrl);if(!el.isConnected)return;
      const patterns={exercise:/exercis|physical|activ|lifestyle|recover|self.care/i,medicine:/medicin|treat|inhal|antibiotic/i,care:/self|lifestyle|help|diet|eat|manag|treat/i,safety:/urgent|emergency|help|complication|GP|999|111/i,overview:/overview|symptom|about|what|treat/i};
      const relevant=data.sections.filter(s=>(patterns[el.dataset.category]||patterns.overview).test(s.heading));
      const chosen=(relevant.length?relevant:data.sections).slice(0,3);
      const render=s=>'<div class="source-section"><h4>'+escape(s.heading)+'</h4><ul>'+s.paragraphs.map(p=>'<li>'+escape(p)+'</li>').join('')+'</ul></div>';
      el.innerHTML='<div class="source-reading-title">From '+escape(new URL(data.url).hostname)+' · Patient information excerpts</div><p class="review-note">UK source: NHS 111 refers to UK services. In Ireland, contact your GP; call 112 or 999 for an emergency.</p>'+(!relevant.length?'<p class="review-note">The source has no separate section for this category. General condition information is shown below.</p>':'')+chosen.map(render).join('')+'<details><summary>Read more from this source</summary>'+data.sections.filter(s=>!chosen.includes(s)).map(render).join('')+'</details><p class="review-note">Retrieved '+new Date(data.retrievedAt).toLocaleDateString()+'. Excerpts may be shortened; source links provide full context. NHS service numbers refer to the UK; in Ireland call 112 or 999 for emergencies.</p>';
    }catch{if(!el.isConnected)return;el.innerHTML='<p>Could not load the source text. The summary above is still available.</p><button class="btn btn-outline source-retry">Retry source</button>';el.querySelector('button').onclick=()=>{delete el.dataset.loading;populateSource(el);};}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const scan=()=>document.querySelectorAll('.source-reading:not([data-loading])').forEach(el=>populateSource(el));
    new MutationObserver(scan).observe(document.getElementById('main-content'),{childList:true,subtree:true});scan();
  });
  function renderCollection(type, profile) {
    const ids = {exercise:'exercise-grid',care:'remedies-grid',safety:'dynamic-care-body'};
    const host = document.getElementById(ids[type]); if (!host) return;
    const selected = profile.filter(d => d.checked).map(find);
    host.innerHTML = selected.length ? selected.map(t => `<article class="health-card"><span class="topic-kind">${escape(t.kind)}</span><h3>${escape(t.label)}</h3><p>${escape(t[type])}</p>${sources(t)}${sourcePanel(t,type)}</article>`).join('') : '<div class="library-empty"><span>✧</span><h3>Care that fits your day</h3><p>Select a health topic in the sidebar to see relevant guidance here.</p></div>';
    if(type === 'safety') document.getElementById('dynamic-warning-body').innerHTML = '<p>For a life-threatening emergency in Ireland, call <strong>112 or 999</strong>.</p><a class="source-link" href="https://www2.hse.ie/emergencies/when-to-call-112-or-999/" target="_blank" rel="noopener noreferrer">↗ HSE: emergency help</a>';
  }
  function detail(topic) {
    const t=find(topic);
    document.getElementById('condition-detail').innerHTML = `<div class="detail-heading"><div><span class="topic-kind">HEALTH LIBRARY · ${escape(t.kind)}</span><h2>${escape(t.label)}</h2><p>${escape(t.overview)}</p></div><button class="btn btn-primary" id="save-topic">+ Add to my topics</button></div><div class="detail-grid">${[['medicine','Medication & active ingredients','fa-pills'],['exercise','Movement & exercise','fa-person-walking'],['care','Everyday care','fa-leaf'],['safety','When to get help','fa-shield-heart']].map(([key,title,icon]) => `<article class="health-card"><div class="card-symbol"><i class="fa-solid ${icon}"></i></div><h3>${title}</h3><p>${escape(t[key])}</p>${key==='medicine'?optionsFor(t):''}${sources(t)}${sourcePanel(t,key)}</article>`).join('')}</div><p class="clinical-note">General information, not a diagnosis or prescription. Dose and formulation depend on the person and product. Use your clinician’s instructions for your schedule.</p><p class="review-note">${t.kind==='Directory topic'?'Retrieved from NLM': 'Curated source summaries checked 15 September 2026'}. Sources open in a new tab.</p>`;
    const btn=document.getElementById('save-topic');
    if(window.medicareProfile?.list().some(d=>d.id===t.id && d.checked)){btn.textContent='✓ Added to my topics';btn.disabled=true;}
    btn.onclick=()=>{window.medicareProfile.add(t);btn.textContent='✓ Added to my topics';btn.disabled=true;};
    document.querySelector('[data-tab="tab-library"]').click();
  }
  let requestId=0;
  function automaticSummary(selected, message='') {
    const host=document.getElementById('ai-output-box');
    const chosen=selected.map(find);
    host.innerHTML=(message ? '<p class="clinical-note">'+escape(message)+'</p>' : '') + (chosen.length ? '<p class="review-note">Source-based topic summaries · Not an AI-generated diagnosis.</p>'+chosen.map(t=>'<article class="health-card"><h3>'+escape(t.label)+'</h3><p>'+escape(t.overview)+'</p>'+['medicine','exercise','care','safety'].map(key=>'<p><strong>'+({medicine:'Medication',exercise:'Movement',care:'Everyday care',safety:'When to get help'}[key])+': </strong>'+escape(t[key])+'</p>').join('')+sources(t)+sourcePanel(t,'overview')+'</article>').join('') : '<div class="library-empty"><h3>Select a health topic to begin</h3><p>Your sourced summary will appear here automatically.</p></div>');
  }
  function refresh(selected) {requestId++;automaticSummary(selected);}
  async function ask(prompt, selected) {
    const host=document.getElementById('ai-output-box'), id=++requestId;
    const buttons=['btn-ask-ai','btn-generate-ai-plan'].map(id=>document.getElementById(id));buttons.forEach(b=>b.disabled=true);
    host.textContent='Looking up sources and preparing an answer…';
    try {
      const response=await fetch('/api/health',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(45000),body:JSON.stringify({question:prompt,topics:selected.map(t=>t.label)})});
      if(!response.ok)throw new Error('unavailable');
      const data=await response.json();if(id!==requestId)return;
      if(!data.answer||!data.sources?.some(s=>safeUrl(s.url)))throw new Error('sources');
      host.replaceChildren();const note=document.createElement('p');note.className='clinical-note';note.textContent='AI-generated education · Check the sources and discuss treatment with your clinician.';
      const body=document.createElement('div');body.className='ai-plain-answer';body.textContent=data.answer;host.append(note,body);
      const links=document.createElement('div');links.innerHTML=sources(data);host.append(links);
    } catch {if(id===requestId)automaticSummary(selected,'Live AI answers are not connected right now. These source-based topic summaries remain available; they do not answer your specific question.');}
    finally {buttons.forEach(b=>b.disabled=false);}
  }
  window.MediCare={topics,escape,safeUrl,sources,find,renderCollection,detail,ask,refresh};
})();
