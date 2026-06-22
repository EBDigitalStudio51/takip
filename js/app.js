(() => {
'use strict';
const root=document.documentElement,body=document.body;
const systemReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionModes=['full','system','reduced'];
let motionMode=localStorage.getItem('eb-motion')||'full';
if(!motionModes.includes(motionMode))motionMode='full';
root.dataset.motion=motionMode;
const reduced=motionMode==='reduced'||(motionMode==='system'&&systemReduced);
const themes=['ocean','nebula','emerald','sunset','gold','silver'];
const colors={ocean:'#040711',nebula:'#090510',emerald:'#03100d',sunset:'#110604',gold:'#0f0c05',silver:'#080a0f'};
const metaTheme=document.querySelector('meta[name="theme-color"]');
const logoSource=theme=>`assets/logo-${theme}.svg`;
function syncThemeAssets(theme){const src=logoSource(theme);document.querySelectorAll('[data-theme-logo]').forEach(img=>{if(img.getAttribute('src')!==src)img.setAttribute('src',src)});document.querySelector('link[rel~="icon"]')?.setAttribute('href',src)}
function setTheme(theme,persist=true){const safe=themes.includes(theme)?theme:'ocean';root.dataset.theme=safe;document.querySelectorAll('[data-theme-value]').forEach(b=>b.classList.toggle('is-active',b.dataset.themeValue===safe));metaTheme?.setAttribute('content',colors[safe]);syncThemeAssets(safe);if(persist)localStorage.setItem('eb-theme',safe);window.dispatchEvent(new CustomEvent('themechange'))}
setTheme(localStorage.getItem('eb-theme')||'ocean',false);
function syncMotionUI(){document.querySelectorAll('[data-motion-value]').forEach(b=>b.classList.toggle('is-active',b.dataset.motionValue===motionMode));const status=document.querySelector('[data-motion-status]');if(status)status.textContent=motionMode==='full'?'TAM':motionMode==='system'?'SİSTEM':'AZALTILMIŞ'}
function setMotion(mode){const safe=motionModes.includes(mode)?mode:'full';if(safe===motionMode){syncMotionUI();return}localStorage.setItem('eb-motion',safe);root.dataset.motion=safe;location.reload()}
syncMotionUI();
const intro=document.getElementById('intro');
if(intro){body.classList.add('no-scroll');setTimeout(()=>{intro.classList.add('is-hidden');body.classList.remove('no-scroll');setTimeout(()=>intro.remove(),800)},reduced?250:1900)}
const header=document.querySelector('.site-header'),progress=document.querySelector('.scroll-progress span'),navLinks=[...document.querySelectorAll('.desktop-nav a')];
const sections=navLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
function onScroll(){const y=scrollY;header?.classList.toggle('scrolled',y>20);const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);if(progress)progress.style.width=`${Math.min(100,y/max*100)}%`;let active='';sections.forEach(s=>{if(s.getBoundingClientRect().top<=180)active=s.id});navLinks.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')===`#${active}`))}
onScroll();addEventListener('scroll',onScroll,{passive:true});
const panel=document.querySelector('.theme-panel'),backdrop=document.querySelector('.panel-backdrop');
function openTheme(){panel?.classList.add('is-open');backdrop?.classList.add('is-visible');panel?.setAttribute('aria-hidden','false');document.querySelectorAll('[data-theme-open]').forEach(b=>b.setAttribute('aria-expanded','true'));body.classList.add('no-scroll')}
function closeTheme(){panel?.classList.remove('is-open');backdrop?.classList.remove('is-visible');panel?.setAttribute('aria-hidden','true');document.querySelectorAll('[data-theme-open]').forEach(b=>b.setAttribute('aria-expanded','false'));body.classList.remove('no-scroll')}
document.querySelectorAll('[data-theme-open]').forEach(b=>b.addEventListener('click',openTheme));document.querySelectorAll('[data-theme-close]').forEach(b=>b.addEventListener('click',closeTheme));document.querySelectorAll('[data-theme-value]').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.themeValue)));document.querySelector('.theme-reset')?.addEventListener('click',()=>setTheme('ocean'));
document.querySelectorAll('[data-motion-value]').forEach(b=>b.addEventListener('click',()=>setMotion(b.dataset.motionValue)));
const toggle=document.querySelector('.menu-toggle'),menu=document.getElementById('mobileMenu');
function toggleMenu(force){if(!toggle||!menu)return;const open=typeof force==='boolean'?force:!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);menu.setAttribute('aria-hidden',String(!open));toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç')}
toggle?.addEventListener('click',()=>toggleMenu());menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));

/* V5.4 — reliable home-logo and back-to-top controls */
function scrollHome(event){
  event?.preventDefault?.();
  closeTheme?.();
  toggleMenu?.(false);
  window.scrollTo({top:0,left:0,behavior:reduced?'auto':'smooth'});
  if(history.replaceState)history.replaceState(null,'',location.pathname+location.search);
}
document.querySelectorAll('a.brand[href="#top"],a.to-top[href="#top"]').forEach(link=>{
  link.addEventListener('click',scrollHome);
  link.setAttribute('role','button');
});

const io='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -35px'}):null;
document.querySelectorAll('.reveal').forEach(el=>{if(el.dataset.delay)el.style.setProperty('--delay',`${Number(el.dataset.delay)}ms`);io?io.observe(el):el.classList.add('is-visible')});
const rotate=document.querySelector('[data-rotate-word]'),words=['kusursuz detay','özgün karakter','güçlü performans','net kullanıcı deneyimi','kalıcı etki'];let wi=0;if(rotate&&!reduced)setInterval(()=>{rotate.classList.add('swap');setTimeout(()=>{wi=(wi+1)%words.length;rotate.textContent=words[wi];rotate.classList.remove('swap')},220)},2400);
const modal=document.getElementById('caseModal');document.querySelector('[data-case-open]')?.addEventListener('click',()=>modal?.showModal());document.querySelector('[data-case-close]')?.addEventListener('click',()=>modal?.close());modal?.addEventListener('click',e=>{const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()});
document.getElementById('proposalForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget),features=f.getAll('feature'),labPrice=f.get('labPrice'),labConfig=f.get('labConfig');const msg=['Merhaba Efecan, EB Digital Studio üzerinden ulaşıyorum.','',`Ad / Marka: ${f.get('name')||'-'}`,`Proje türü: ${f.get('type')||'-'}`,`Sayfa sayısı: ${f.get('pages')||'-'}`,`Teslim beklentisi: ${f.get('deadline')||'-'}`,`İstenen özellikler: ${features.length?features.join(', '):'Belirtilmedi'}`,labConfig?`Canlı konfigürasyon:
${labConfig}`:'',labPrice?`Hesaplanan proje toplamı: ${labPrice}`:'',`Proje detayı: ${f.get('details')||'Belirtilmedi'}`,'','Projem için görüşmek istiyorum.'].filter(Boolean).join('\n');const url=`https://wa.me/905425866513?text=${encodeURIComponent(msg)}`;const opened=window.open(url,'_blank');if(opened)opened.opener=null;else window.location.href=url});
const reviewDialog=document.getElementById('reviewDialog'),reviewForm=document.getElementById('reviewForm');let reviewOpener=null;
function openReview(event){if(!reviewDialog)return;event?.preventDefault?.();reviewOpener=event?.currentTarget||document.activeElement;reviewDialog.classList.add('is-open');reviewDialog.setAttribute('aria-hidden','false');body.classList.add('no-scroll');setTimeout(()=>reviewDialog.querySelector('input,select,textarea,button')?.focus(),60)}
function closeReview(){if(!reviewDialog)return;reviewDialog.classList.remove('is-open');reviewDialog.setAttribute('aria-hidden','true');body.classList.remove('no-scroll');reviewOpener?.focus?.()}
document.addEventListener('click',event=>{const opener=event.target.closest('[data-review-open]');if(opener){openReview(event);return}if(event.target.closest('[data-review-close]'))closeReview()});
reviewForm?.addEventListener('submit',event=>{event.preventDefault();if(!reviewForm.reportValidity())return;const f=new FormData(reviewForm);if(!f.get('consent'))return;const stars='★'.repeat(Number(f.get('rating')||5));const msg=['Merhaba Efecan, EB Digital Studio için müşteri yorumu paylaşmak istiyorum.','',`Ad Soyad: ${f.get('reviewer')||'-'}`,`Marka / Proje: ${f.get('brand')||'-'}`,`Proje türü: ${f.get('project')||'-'}`,`Değerlendirme: ${f.get('rating')||'-'}/5 ${stars}`,`Yorum: ${f.get('comment')||'-'}`,'','Bu yorumun adım ve marka bilgimle EB Digital Studio sitesinde yayınlanmasına izin veriyorum.'].join('\n');const url=`https://wa.me/905425866513?text=${encodeURIComponent(msg)}`;const opened=window.open(url,'_blank');if(opened)opened.opener=null;else window.location.href=url;closeReview();reviewForm.reset()});
/* ============================
   PREMIUM CUSTOM SELECTS
   Replaces browser-native white dropdown panels while keeping the
   original <select> elements fully functional for forms and scripts.
   ============================ */
(function initPremiumSelects(){
  const selects=[...document.querySelectorAll('select:not([data-native-select])')];
  if(!selects.length)return;
  let active=null;
  const valueDescriptor=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value');

  function variantFor(select){
    if(select.closest('.design-lab-v5'))return'lab';
    if(select.closest('.review-dialog'))return'review';
    return'proposal';
  }
  function selectedOption(select){return select.options[select.selectedIndex]||select.options[0]}
  function closeActive({focus=false}={}){
    if(!active)return;
    active.popover.classList.remove('is-open','opens-up');
    active.popover.setAttribute('aria-hidden','true');
    active.trigger.setAttribute('aria-expanded','false');
    if(focus)active.trigger.focus();
    active=null;
  }
  function positionPopover(item){
    const rect=item.trigger.getBoundingClientRect();
    const margin=10;
    const width=Math.max(rect.width,Math.min(360,window.innerWidth-margin*2));
    item.popover.style.width=`${Math.min(width,window.innerWidth-margin*2)}px`;
    item.popover.style.left=`${Math.max(margin,Math.min(rect.left,window.innerWidth-width-margin))}px`;
    item.popover.style.top=`${rect.bottom+8}px`;
    item.popover.classList.remove('opens-up');
    const popRect=item.popover.getBoundingClientRect();
    const below=window.innerHeight-rect.bottom;
    const above=rect.top;
    if(below<Math.min(popRect.height+20,300)&&above>below){
      item.popover.classList.add('opens-up');
      item.popover.style.top=`${Math.max(margin,rect.top-popRect.height-8)}px`;
    }
  }
  function sync(item){
    const option=selectedOption(item.select);
    item.value.textContent=option?.textContent?.trim()||'Seçiniz';
    item.buttons.forEach((button,index)=>{
      const isSelected=index===item.select.selectedIndex;
      button.setAttribute('aria-selected',String(isSelected));
      button.tabIndex=isSelected?0:-1;
    });
  }
  function open(item){
    if(active&&active!==item)closeActive();
    active=item;
    item.popover.classList.add('is-open');
    item.popover.setAttribute('aria-hidden','false');
    item.trigger.setAttribute('aria-expanded','true');
    positionPopover(item);
    requestAnimationFrame(()=>item.buttons[item.select.selectedIndex]?.focus({preventScroll:true}));
  }

  selects.forEach((select,index)=>{
    const variant=variantFor(select);
    select.classList.add('eb-native-select');
    select.tabIndex=-1;
    select.setAttribute('aria-hidden','true');

    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='eb-select-trigger';
    trigger.dataset.selectVariant=variant;
    trigger.setAttribute('aria-haspopup','listbox');
    trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-controls',`ebSelectList${index}`);
    trigger.innerHTML='<span class="eb-select-value"></span><span class="eb-select-caret" aria-hidden="true">⌄</span>';
    select.insertAdjacentElement('afterend',trigger);

    const popover=document.createElement('div');
    popover.id=`ebSelectList${index}`;
    popover.className='eb-select-popover';
    popover.dataset.selectVariant=variant;
    popover.setAttribute('role','listbox');
    popover.setAttribute('aria-hidden','true');
    document.body.appendChild(popover);

    const buttons=[...select.options].map((option,optionIndex)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='eb-select-option';
      button.setAttribute('role','option');
      button.disabled=option.disabled;
      button.dataset.optionIndex=String(optionIndex);
      button.innerHTML=`<span>${option.textContent.trim()}</span><span class="eb-select-check" aria-hidden="true">✓</span>`;
      popover.appendChild(button);
      return button;
    });
    const item={select,trigger,popover,value:trigger.querySelector('.eb-select-value'),buttons};

    // Programmatic select.value changes (used by Design Lab -> contact transfer)
    // also refresh the custom visible label.
    try{
      Object.defineProperty(select,'value',{
        configurable:true,
        get(){return valueDescriptor.get.call(this)},
        set(value){valueDescriptor.set.call(this,value);sync(item)}
      });
    }catch(_error){}

    trigger.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();
      active===item?closeActive({focus:true}):open(item);
    });
    trigger.addEventListener('keydown',event=>{
      if(['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){
        event.preventDefault();open(item);
      }
    });
    buttons.forEach((button,optionIndex)=>{
      button.addEventListener('click',event=>{
        event.preventDefault();
        if(button.disabled)return;
        select.selectedIndex=optionIndex;
        select.dispatchEvent(new Event('input',{bubbles:true}));
        select.dispatchEvent(new Event('change',{bubbles:true}));
        sync(item);closeActive({focus:true});
      });
      button.addEventListener('keydown',event=>{
        const enabled=buttons.filter(x=>!x.disabled);
        const current=enabled.indexOf(button);
        let next=current;
        if(event.key==='ArrowDown')next=Math.min(enabled.length-1,current+1);
        else if(event.key==='ArrowUp')next=Math.max(0,current-1);
        else if(event.key==='Home')next=0;
        else if(event.key==='End')next=enabled.length-1;
        else if(event.key==='Escape'){event.preventDefault();closeActive({focus:true});return}
        else if(event.key==='Tab'){closeActive();return}
        else return;
        event.preventDefault();enabled[next]?.focus();
      });
    });
    select.addEventListener('change',()=>sync(item));
    select.form?.addEventListener('reset',()=>setTimeout(()=>sync(item),0));
    sync(item);
  });

  document.addEventListener('pointerdown',event=>{
    if(active&&!active.trigger.contains(event.target)&&!active.popover.contains(event.target))closeActive();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active)closeActive({focus:true})});
  addEventListener('resize',()=>closeActive(),{passive:true});
  addEventListener('scroll',event=>{if(active&&event.target!==active.popover)closeActive()},{passive:true,capture:true});
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-lab-apply]'))setTimeout(()=>selects.forEach(select=>select.dispatchEvent(new Event('change',{bubbles:true}))),0);
  });
})();

if(!reduced&&matchMedia('(pointer:fine)').matches){
  const dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring'),label=ring?.querySelector('span');
  if(dot&&ring){
    root.classList.add('custom-cursor-ready');
    let mx=-100,my=-100,rx=-100,ry=-100,started=false;
    const setVisible=visible=>{dot.classList.toggle('is-visible',visible);ring.classList.toggle('is-visible',visible)};
    addEventListener('pointermove',e=>{
      mx=e.clientX;my=e.clientY;
      if(!started){rx=mx;ry=my;started=true;setVisible(true)}
      dot.style.transform=`translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    },{passive:true});
    document.addEventListener('pointerleave',()=>setVisible(false));
    document.addEventListener('pointerenter',()=>started&&setVisible(true));
    addEventListener('blur',()=>setVisible(false));
    (function cursorLoop(){
      rx+=(mx-rx)*.18;ry+=(my-ry)*.18;
      ring.style.transform=`translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(cursorLoop);
    })();
    const interactive='a,button,[data-tilt],input,select,textarea,[data-cursor],.compare-shell';
    document.querySelectorAll(interactive).forEach(el=>{
      el.addEventListener('pointerenter',()=>{
        ring.classList.add('is-active');
        if(label)label.textContent=el.dataset.cursor||((el.matches('input[type=range]')||el.closest('[data-compare]'))?'SÜRÜKLE':el.matches('input,select,textarea')?'':'AÇ');
      });
      el.addEventListener('pointerleave',()=>{ring.classList.remove('is-active');if(label)label.textContent=''});
    });
    addEventListener('pointerdown',()=>{dot.classList.add('is-pressed');ring.classList.add('is-pressed')});
    addEventListener('pointerup',()=>{dot.classList.remove('is-pressed');ring.classList.remove('is-pressed')});
  }
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1200px) rotateX(${-y*3.5}deg) rotateY(${x*4.5}deg)`});
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.07}px,${(e.clientY-r.top-r.height/2)*.07}px)`});
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });
}
const canvas=document.getElementById('particleCanvas');if(canvas&&!reduced){const ctx=canvas.getContext('2d');let ps=[],w=0,h=0,dpr=1,canvasActive=!document.hidden;const rgb=()=>{const v=getComputedStyle(root).getPropertyValue('--accent').trim().replace('#','');return v.length===6?[parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)]:[59,130,246]};function resize(){dpr=Math.min(devicePixelRatio||1,innerWidth<700?1.25:2);w=innerWidth;h=innerHeight;canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;ctx.setTransform(dpr,0,0,dpr,0,0);const count=w<700?12:Math.min(74,Math.max(28,Math.floor(w/22)));ps=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*(w<700?.08:.14),vy:(Math.random()-.5)*(w<700?.08:.14),r:Math.random()*1.25+.35,a:Math.random()*.3+.08}))}function frame(){if(canvasActive){ctx.clearRect(0,0,w,h);const [r,g,b]=rgb(),linkDistance=w<700?82:115;ps.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.fillStyle=`rgba(${r},${g},${b},${p.a})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();for(let j=i+1;j<ps.length;j++){const q=ps[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);if(d<linkDistance){ctx.beginPath();ctx.strokeStyle=`rgba(${r},${g},${b},${(1-d/linkDistance)*.03})`;ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}}})}requestAnimationFrame(frame)}document.addEventListener('visibilitychange',()=>{canvasActive=!document.hidden});resize();frame();addEventListener('resize',resize)}
let key='';addEventListener('keydown',e=>{if(e.key==='Escape'){closeTheme();toggleMenu(false);modal?.close?.();closeReview()}key=(key+e.key.toLowerCase()).slice(-2);if(key==='eb')openTheme()});const original=document.title;document.addEventListener('visibilitychange',()=>document.title=document.hidden?'Projen seni bekliyor — EB Studio':original);const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
})();
