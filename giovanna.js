(()=>{'use strict';
 const doc=document,cover=doc.getElementById('invitation-cover'),site=doc.getElementById('invitation'),music=doc.getElementById('music-toggle'),modal=doc.getElementById('giovanna-modal');
 let opened=false,lastFocus=null;
 function reveal(){
   if(opened)return;opened=true;
   site.hidden=false;doc.body.classList.remove('invite-locked');
   cover.classList.add('is-opening');
   setTimeout(()=>{cover.classList.add('is-exiting');site.classList.add('is-open');},550);
   setTimeout(()=>{cover.hidden=true;doc.getElementById('inicio')?.setAttribute('tabindex','-1');doc.getElementById('inicio')?.focus({preventScroll:true})},1250);
   music.hidden=false;
   if('IntersectionObserver' in window){const observer=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target)}})},{threshold:.1,rootMargin:'0px 0px -35px 0px'});doc.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}
   else doc.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));
   doc.querySelector('#inicio')?.classList.add('in-view');
 }
 doc.getElementById('open-invitation').addEventListener('click',reveal);
 doc.getElementById('skip-cover').addEventListener('click',reveal);
 const target=Date.parse('2026-10-31T22:00:00Z');
 const pad=n=>String(n).padStart(2,'0');
 function countdown(){
   let rest=Math.max(0,target-Date.now());
   let days=Math.floor(rest/86400000);rest%=86400000;
   let hours=Math.floor(rest/3600000);rest%=3600000;
   let minutes=Math.floor(rest/60000);rest%=60000;
   let seconds=Math.floor(rest/1000);
   for(const [key,value] of Object.entries({days,hours,minutes,seconds})){const el=doc.querySelector('[data-count="'+key+'"]');if(el)el.textContent=pad(value)}
   if(Date.now()>=target){const label=doc.querySelector('.count-label');if(label)label.textContent='CHEGOU O GRANDE DIA!'}
 }
 countdown();setInterval(countdown,1000);
 const place='Rua Antônio Rômulo Rosa, Chácaras Quintas de Igarapé, Igarapé - MG';
 const maps='https://www.google.com/maps/search/?'+new URLSearchParams({api:'1',query:place}).toString();
 doc.getElementById('maps-link').href=maps;
 const calendar='https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:'Giovanna — 15 anos',dates:'20261031T220000Z/20261031T230000Z',details:'Celebração dos 15 anos de Giovanna. Início às 19h (horário de Brasília). Horário de término não informado.',location:place}).toString();
 doc.getElementById('google-calendar').href=calendar;
 doc.getElementById('save-ics').addEventListener('click',()=>{
   const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Giovanna 15 Anos//PT-BR','BEGIN:VEVENT','UID:giovanna15-20261031@convite.local','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'),'DTSTART:20261031T220000Z','SUMMARY:Giovanna - 15 anos','LOCATION:'+place.replace(/,/g,'\\,'),'DESCRIPTION:Convite especial. Início às 19h. Término não informado.','END:VEVENT','END:VCALENDAR'];
   const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));
   const a=doc.createElement('a');a.href=url;a.download='Giovanna-15-anos.ics';doc.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 });
 function showModal(){lastFocus=doc.activeElement;modal.hidden=false;doc.body.style.overflow='hidden';doc.getElementById('gio-nome').focus()}
 function hideModal(){modal.hidden=true;doc.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus()}
 doc.getElementById('open-rsvp').addEventListener('click',showModal);
 modal.querySelectorAll('[data-close-rsvp]').forEach(el=>el.addEventListener('click',hideModal));
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)hideModal()});
 doc.getElementById('giovanna-form').addEventListener('submit',async function(e){
   e.preventDefault();const form=this,btn=form.querySelector('[type=submit]'),status=doc.getElementById('gio-status');
   btn.disabled=true;status.textContent='Enviando confirmação...';
   const f=new FormData(form);
   try{
     const resp=await fetch('/api/rsvp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:f.get('nome'),presenca:f.get('presenca'),quantidade:Number(f.get('quantidade')),website:f.get('website')})});
     const data=await resp.json();if(!resp.ok)throw new Error(data.error==='prazo_encerrado'?'O prazo de confirmação terminou.':'Não foi possível registrar. Confira os dados e tente novamente.');
     status.textContent='Confirmação registrada com sucesso. Obrigada por responder!';
     btn.textContent='CONFIRMAÇÃO ENVIADA';btn.disabled=true;
   }catch(err){status.textContent=err.message||'Não foi possível registrar.';btn.disabled=false}
 });
 // Small original synthesized instrumental loop; no third-party audio or Aurora family's tracks.
 let ac=null,player=null,playing=false,voiceTimer=null,sequenceTime=0;
 const phrase=[392,493.88,587.33,783.99,659.25,587.33,493.88,440,392,523.25,659.25,783.99,698.46,587.33,493.88,392];
 function note(freq,time){
   if(!ac)return;
   const osc=ac.createOscillator(),gain=ac.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,time);
   const duration=1.45;gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(.04,time+.028);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
   osc.connect(gain);gain.connect(ac.destination);osc.start(time);osc.stop(time+duration+.02);
 }
 function schedule(){
   if(!playing||!ac)return;while(sequenceTime<ac.currentTime+1.3){
     const index=Math.floor(sequenceTime/.52)%phrase.length;
     note(phrase[index],sequenceTime);
     if(index%4===0)note(phrase[index]/2,sequenceTime);
     sequenceTime+=.52;
   }
 }
 async function toggleMusic(){
   try{
     if(!ac){const C=window.AudioContext||window.webkitAudioContext;if(!C){music.hidden=true;return}ac=new C()}
     if(!playing){await ac.resume();playing=true;sequenceTime=ac.currentTime+.04;schedule();voiceTimer=setInterval(schedule,450);music.setAttribute('aria-pressed','true');music.setAttribute('aria-label','Pausar música ambiente');music.querySelector('.music-status').textContent='Pausar'}
     else{playing=false;clearInterval(voiceTimer);await ac.suspend();music.setAttribute('aria-pressed','false');music.setAttribute('aria-label','Reproduzir música ambiente');music.querySelector('.music-status').textContent='Música'}
   }catch{music.hidden=true}
 }
 music.addEventListener('click',toggleMusic);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden&&playing)toggleMusic()});
})();