
(() => {
  'use strict';

  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];

  /* ============================
     LIVE SITE CONFIGURATOR V5
     ============================ */
  const preview = $('[data-lab-preview]');
  if (preview) {
    const money = value => `${new Intl.NumberFormat('tr-TR').format(Math.round(value / 100) * 100)} TL`;
    const safeSlug = value => (value || 'marka')
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'marka';

    const sectors = {
      fitness: {name:'Fitness & Koçluk', brand:'PULSE FITNESS', kicker:'PERFORMANCE COACHING', main:'Potansiyelini', accent:'performansa dönüştür.', desc:'Bilimsel yaklaşım, güçlü takip ve kişiye özel dijital deneyim.', cta:'Ücretsiz Görüşme', primary:'Programları Keşfet →', secondary:'Nasıl çalışır?', menu:'Hakkımızda   Programlar   Başarılar   İletişim', services:['Kişisel Program','Gelişim Takibi','Online Koçluk'], metricLabel:'HAFTALIK GELİŞİM', metric:'+24%', feature:'Günlük gelişim', icon:'⚡'},
      beauty: {name:'Güzellik & Bakım', brand:'LUMI BEAUTY', kicker:'PREMIUM BEAUTY STUDIO', main:'Işıltını', accent:'ortaya çıkar.', desc:'Zarif marka dili, premium hizmet sunumu ve hızlı online randevu deneyimi.', cta:'Randevu Al', primary:'Hizmetleri İncele →', secondary:'Salonumuz', menu:'Hizmetler   Uzmanlar   Galeri   Randevu', services:['Cilt Bakımı','Lazer Epilasyon','Profesyonel Makyaj'], metricLabel:'MÜŞTERİ MEMNUNİYETİ', metric:'%98', feature:'Online randevu', icon:'✦'},
      architecture: {name:'Mimarlık & Tasarım', brand:'FORMA STUDIO', kicker:'ARCHITECTURE & SPACE', main:'Mekânları', accent:'karaktere dönüştür.', desc:'Mimari yaklaşımı, seçkin projeleri ve tasarım dilini etkileyici bir portföyle sun.', cta:'Proje Başlat', primary:'Projeleri Keşfet →', secondary:'Stüdyomuz', menu:'Projeler   Yaklaşım   Stüdyo   İletişim', services:['Konut','Ticari Mekân','İç Mimari'], metricLabel:'TAMAMLANAN PROJE', metric:'48+', feature:'Proje vitrini', icon:'◇'},
      restaurant: {name:'Restoran & Kafe', brand:'NOIR KITCHEN', kicker:'CULINARY EXPERIENCE', main:'Lezzeti', accent:'deneyime dönüştür.', desc:'Menünü, atmosferini ve rezervasyon akışını iştah açıcı bir dijital deneyimle sun.', cta:'Rezervasyon', primary:'Menüyü Keşfet →', secondary:'Hikâyemiz', menu:'Menü   Şef   Galeri   Rezervasyon', services:['Özel Menü','Etkinlik','Masa Rezervasyonu'], metricLabel:'MİSAFİR PUANI', metric:'4.9/5', feature:'Masa rezervasyonu', icon:'✺'},
      realestate: {name:'Emlak & Gayrimenkul', brand:'NOVA ESTATE', kicker:'PREMIUM REAL ESTATE', main:'Doğru yatırımı', accent:'güvenle keşfet.', desc:'Portföyleri güçlü filtreleme, detaylı ilan sayfaları ve hızlı iletişim akışıyla sun.', cta:'Danışmana Ulaş', primary:'Portföyü İncele →', secondary:'Bölgeler', menu:'Satılık   Kiralık   Projeler   İletişim', services:['Konut','Arsa','Ticari Gayrimenkul'], metricLabel:'AKTİF PORTFÖY', metric:'120+', feature:'Akıllı ilan filtresi', icon:'⌂'},
      clinic: {name:'Klinik & Sağlık', brand:'VITA CLINIC', kicker:'MODERN HEALTHCARE', main:'Sağlığını', accent:'güvenle planla.', desc:'Uzmanlık alanlarını, hekimleri ve randevu sürecini güven veren modern bir arayüzle sun.', cta:'Randevu Oluştur', primary:'Uzmanlıkları Gör →', secondary:'Hekimlerimiz', menu:'Tedaviler   Hekimler   Klinik   Randevu', services:['Online Randevu','Uzman Hekimler','Hasta Bilgilendirme'], metricLabel:'DANIŞAN MEMNUNİYETİ', metric:'%97', feature:'Güvenli randevu', icon:'✚'},
      technology: {name:'Yazılım & Teknoloji', brand:'NEXA SYSTEMS', kicker:'DIGITAL PRODUCT', main:'Fikrini', accent:'ölçeklenebilir ürüne dönüştür.', desc:'Modern ürün anlatımı, güçlü arayüz ve veriye dayalı dijital sistemlerle büyü.', cta:'Demo Talep Et', primary:'Ürünü Keşfet →', secondary:'Dokümantasyon', menu:'Ürün   Çözümler   Kaynaklar   İletişim', services:['SaaS Ürün','Otomasyon','Veri Çözümleri'], metricLabel:'SİSTEM UPTIME', metric:'%99.9', feature:'Canlı ürün demosu', icon:'⌘'},
      education: {name:'Eğitim & Online Akademi', brand:'NOVA ACADEMY', kicker:'NEXT GENERATION LEARNING', main:'Bilgiyi', accent:'başarıya dönüştür.', desc:'Eğitim programlarını, öğrenci deneyimini ve dijital içerikleri tek platformda sun.', cta:'Ücretsiz Ders', primary:'Programları Gör →', secondary:'Nasıl İşler?', menu:'Programlar   Eğitmenler   Başarılar   Kayıt', services:['Online Eğitim','Öğrenci Paneli','Sertifika'], metricLabel:'AKTİF ÖĞRENCİ', metric:'850+', feature:'Öğrenci paneli', icon:'◫'},
      automotive: {name:'Otomotiv & Servis', brand:'APEX MOTORS', kicker:'AUTOMOTIVE EXPERIENCE', main:'Tutkunu', accent:'yola dönüştür.', desc:'Araçları, servis hizmetlerini ve teklif akışını yüksek performanslı bir deneyimle sun.', cta:'Teklif Al', primary:'Araçları İncele →', secondary:'Servisler', menu:'Araçlar   Servis   Kampanyalar   İletişim', services:['Araç Portföyü','Servis Randevusu','Hızlı Teklif'], metricLabel:'TESLİM EDİLEN ARAÇ', metric:'320+', feature:'Araç karşılaştırma', icon:'◉'},
      personal: {name:'Kişisel Marka', brand:'YOUR SIGNATURE', kicker:'PERSONAL BRAND', main:'Uzmanlığını', accent:'dijital imzaya dönüştür.', desc:'Hikâyeni, yeteneğini ve projelerini akılda kalan premium bir deneyimle sun.', cta:'İletişime Geç', primary:'Projeleri Gör →', secondary:'Ben Kimim?', menu:'Projeler   Hizmetler   Hikâyem   İletişim', services:['Portföy','Hizmetler','Kişisel Hikâye'], metricLabel:'ÖNE ÇIKAN PROJE', metric:'01', feature:'Kişisel vitrin', icon:'✧'}
    };

    const pagePlans = {
      starter:{name:'Dijital Başlangıç', label:'1–3 sayfa', price:17900, delivery:'7–10 iş günü'},
      business:{name:'Marka Deneyimi', label:'4–7 sayfa', price:29900, delivery:'12–18 iş günü'},
      signature:{name:'Signature Web Experience', label:'8–12 sayfa', price:49900, delivery:'20–30 iş günü'},
      extended:{name:'Geniş Kapsamlı Web Deneyimi', label:'13+ sayfa', price:64900, delivery:'30–45 iş günü'}
    };
    const stylePlans = {
      futuristic:{name:'Futuristik tasarım dili', price:7500, preview:'FUTURISTIC / IMMERSIVE'},
      luxury:{name:'Lüks tasarım dili', price:6000, preview:'LUXURY / EDITORIAL'},
      minimal:{name:'Minimal tasarım dili', price:0, preview:'MINIMAL / PURE'},
      corporate:{name:'Kurumsal tasarım dili', price:3000, preview:'CORPORATE / TRUST'}
    };
    const paletteNames = {electric:'Elektrik Mavi / Mor', emerald:'Zümrüt / Turkuaz', gold:'Altın / Siyah', fire:'Turuncu / Kırmızı', mono:'Gümüş / Minimal'};
    const featurePlans = {
      animations:{name:'Gelişmiş animasyon paketi', price:7500},
      language:{name:'İkinci dil', price:7500},
      blog:{name:'Blog sistemi', price:8000},
      appointment:{name:'Randevu / başvuru sistemi', price:6000},
      membership:{name:'Üyelik ve giriş sistemi', price:15000},
      database:{name:'Supabase veritabanı', price:12000},
      admin:{name:'Admin paneli', price:20000},
      tracking:{name:'Müşteri / öğrenci takip paneli', price:18000},
      uploads:{name:'Dosya / fotoğraf yükleme', price:8000},
      roles:{name:'Rol ve yetkilendirme', price:8000},
      payment:{name:'Online ödeme entegrasyonu', price:15000},
      seo:{name:'Gelişmiş teknik SEO', price:5000}
    };
    const maintenancePlans = {
      none:{name:'Bakım paketi yok', price:0},
      basic:{name:'Temel Bakım', price:2000},
      business:{name:'Business Care', price:3500},
      system:{name:'System Care', price:6000}
    };

    const state = {sector:'fitness', style:'futuristic', palette:'electric', pages:'business', deadline:'standard', maintenance:'none', device:'desktop', total:0, discount:0, urgent:0};
    const status = $('[data-lab-status]');
    const brandInput = $('[data-lab-input="brand"]');
    const sloganInput = $('[data-lab-input="slogan"]');
    const titleMain = $('[data-preview-title-main]');
    const titleAccent = $('[data-preview-title-accent]');
    const brand = $('[data-preview-brand]');
    const kicker = $('[data-preview-kicker]');
    const desc = $('[data-preview-desc]');
    const feature = $('[data-preview-feature]');
    const services = $('[data-preview-services]');
    const stack = $('[data-preview-stack]');
    const quoteBreakdown = $('[data-lab-breakdown]');

    const checkedFeatures = () => $$('[data-lab-feature]:checked').map(input => input.value);
    const featureInput = key => $(`input[data-lab-feature][value="${key}"]`);

    function enforceDependencies() {
      const selected = new Set(checkedFeatures());
      const require = keys => keys.forEach(key => { const input = featureInput(key); if (input) input.checked = true; });
      if (selected.has('membership')) require(['database']);
      if (selected.has('admin')) require(['database']);
      if (selected.has('tracking')) require(['membership','database','admin']);
      if (selected.has('uploads') || selected.has('roles')) require(['membership','database']);
    }

    function customHeadline(defaults) {
      const custom = sloganInput?.value.trim();
      if (!custom) return [defaults.main, defaults.accent];
      const words = custom.split(/\s+/).filter(Boolean);
      if (words.length < 3) return [words[0] || defaults.main, words.slice(1).join(' ') || defaults.accent];
      const split = Math.max(1, Math.floor(words.length * .44));
      return [words.slice(0, split).join(' '), words.slice(split).join(' ')];
    }

    function calculate() {
      enforceDependencies();
      const page = pagePlans[state.pages];
      const design = stylePlans[state.style];
      const selected = checkedFeatures();
      const lines = [{label:`${page.name} · ${page.label}`, value:page.price}];
      let subtotal = page.price;
      if (design.price) { subtotal += design.price; lines.push({label:design.name, value:design.price}); }
      selected.forEach(key => {
        const item = featurePlans[key];
        if (!item) return;
        subtotal += item.price;
        lines.push({label:item.name, value:item.price});
      });

      let discount = 0;
      const set = new Set(selected);
      if (['membership','database','admin','tracking'].every(key => set.has(key))) discount = 12000;
      else if (['membership','database','admin'].every(key => set.has(key))) discount = 7500;
      else if (['membership','database'].every(key => set.has(key))) discount = 3000;
      if (discount) lines.push({label:'Sistem paketi avantajı', value:-discount, discount:true});

      let afterDiscount = subtotal - discount;
      const coreSystem = ['membership','database','admin'].every(key => set.has(key));
      const advancedSystem = coreSystem && set.has('tracking');
      const systemMinimum = advancedSystem ? 99900 : coreSystem ? 84900 : 0;
      if (systemMinimum && afterDiscount < systemMinimum) {
        const minimumDifference = systemMinimum - afterDiscount;
        afterDiscount = systemMinimum;
        lines.push({label:advancedSystem ? 'Gelişmiş sistem minimum kapsamı' : 'Özel dijital sistem minimum kapsamı', value:minimumDifference});
      }
      const urgent = state.deadline === 'urgent' ? Math.round(afterDiscount * .25 / 100) * 100 : 0;
      if (urgent) lines.push({label:'Acil teslim farkı · %25', value:urgent});
      const total = afterDiscount + urgent;
      state.total = total; state.discount = discount; state.urgent = urgent;
      return {page, design, selected, lines, total, maintenance:maintenancePlans[state.maintenance]};
    }

    function renderBreakdown(result) {
      if (!quoteBreakdown) return;
      quoteBreakdown.replaceChildren();
      result.lines.forEach(line => {
        const row = document.createElement('div');
        if (line.discount) row.className = 'is-discount';
        const label = document.createElement('span'); label.textContent = line.label;
        const value = document.createElement('strong'); value.textContent = `${line.value < 0 ? '−' : '+'}${money(Math.abs(line.value))}`;
        if (line === result.lines[0]) value.textContent = money(line.value);
        row.append(label, value); quoteBreakdown.append(row);
      });
    }

    function renderPreviewSystems(selected, sector) {
      if (!stack) return;
      stack.replaceChildren();
      const visible = selected.slice(0, 3);
      if (!visible.length) visible.push('responsive');
      visible.forEach((key, index) => {
        const item = document.createElement('span');
        item.innerHTML = `<b>${String(index + 1).padStart(2,'0')}</b><small></small>`;
        item.querySelector('small').textContent = key === 'responsive' ? sector.feature : featurePlans[key]?.name || sector.feature;
        stack.append(item);
      });
    }

    function renderLab() {
      const sector = sectors[state.sector];
      const result = calculate();
      const customBrand = brandInput?.value.trim() || sector.brand;
      if (brandInput) brandInput.placeholder = `Örn. ${sector.brand}`;
      const [main, accent] = customHeadline(sector);
      const selected = result.selected;

      if (brand) brand.textContent = customBrand.toUpperCase();
      if (kicker) kicker.textContent = sector.kicker;
      if (titleMain) titleMain.textContent = main;
      if (titleAccent) titleAccent.textContent = accent;
      if (desc) desc.textContent = sector.desc;
      if (feature) feature.textContent = selected.length ? featurePlans[selected[0]]?.name || sector.feature : sector.feature;
      $('[data-preview-sector]')?.replaceChildren(document.createTextNode(sector.name.toUpperCase()));
      $('[data-preview-domain]')?.replaceChildren(document.createTextNode(`${safeSlug(customBrand)}.com`));
      $('[data-preview-menu]')?.replaceChildren(document.createTextNode(sector.menu));
      $('[data-preview-cta]')?.replaceChildren(document.createTextNode(sector.cta));
      $('[data-preview-primary]')?.replaceChildren(document.createTextNode(sector.primary));
      $('[data-preview-secondary]')?.replaceChildren(document.createTextNode(sector.secondary));
      $('[data-preview-metric-label]')?.replaceChildren(document.createTextNode(sector.metricLabel));
      $('[data-preview-metric]')?.replaceChildren(document.createTextNode(sector.metric));
      $('[data-preview-icon]')?.replaceChildren(document.createTextNode(sector.icon));
      const art = $('[data-preview-sector-art]'); if (art) art.dataset.previewSectorArt = state.sector;

      if (services) {
        services.replaceChildren();
        sector.services.forEach(text => { const el = document.createElement('span'); el.textContent = text; services.append(el); });
      }
      renderPreviewSystems(selected, sector);

      preview.dataset.style = state.style;
      $('[data-preview-style-name]')?.replaceChildren(document.createTextNode(stylePlans[state.style].preview));
      preview.dataset.palette = state.palette;
      preview.dataset.device = state.device;
      $('[data-lab-total]')?.replaceChildren(document.createTextNode(money(result.total)));
      $('[data-quote-total]')?.replaceChildren(document.createTextNode(money(result.total)));
      $('[data-quote-package]')?.replaceChildren(document.createTextNode(result.page.name));
      $('[data-lab-delivery]')?.replaceChildren(document.createTextNode(state.deadline === 'urgent' ? 'Öncelikli planlama' : result.page.delivery));
      renderBreakdown(result);

      const recurring = $('[data-lab-recurring]');
      if (recurring) {
        recurring.hidden = !result.maintenance.price;
        $('span', recurring).textContent = result.maintenance.name;
        $('strong', recurring).textContent = `${money(result.maintenance.price)}/ay`;
      }

      if (status) {
        status.textContent = 'CALCULATING'; status.classList.add('is-rendering');
        clearTimeout(renderLab.statusTimer);
        renderLab.statusTimer = setTimeout(() => { status.textContent = 'READY'; status.classList.remove('is-rendering'); }, 300);
      }
    }

    function summary() {
      const sector = sectors[state.sector];
      const result = calculate();
      const customBrand = brandInput?.value.trim() || sector.brand;
      const selectedNames = result.selected.map(key => featurePlans[key]?.name).filter(Boolean);
      return {
        brand:customBrand,
        sector:sector.name,
        style:stylePlans[state.style].name.replace(' tasarım dili',''),
        palette:paletteNames[state.palette],
        pages:result.page.label,
        deadline:state.deadline === 'urgent' ? 'Acil teslim' : 'Standart teslim',
        features:selectedNames,
        maintenance:result.maintenance,
        total:result.total,
        delivery:state.deadline === 'urgent' ? 'Öncelikli planlama' : result.page.delivery
      };
    }

    $$('[data-lab-group]').forEach(group => {
      group.addEventListener('click', event => {
        const button = event.target.closest('button[data-value]');
        if (!button) return;
        $$('button[data-value]', group).forEach(item => item.classList.toggle('is-active', item === button));
        state[group.dataset.labGroup] = button.dataset.value;
        renderLab();
      });
    });
    $$('[data-lab-input]').forEach(input => input.addEventListener('input', renderLab));
    $$('[data-lab-select]').forEach(select => select.addEventListener('change', () => { state[select.dataset.labSelect] = select.value; renderLab(); }));
    $$('[data-lab-feature]').forEach(input => input.addEventListener('change', renderLab));
    $('[data-lab-device]')?.addEventListener('click', event => {
      const button = event.target.closest('button[data-device]'); if (!button) return;
      $$('button[data-device]', event.currentTarget).forEach(item => item.classList.toggle('is-active', item === button));
      state.device = button.dataset.device; renderLab();
    });

    $('[data-lab-apply]')?.addEventListener('click', () => {
      const form = $('#proposalForm'); if (!form) return;
      const info = summary();
      const type = form.elements.type;
      if (type) type.value = state.sector === 'personal' ? 'Kişisel portföy' : (info.features.some(x => /Üyelik|Admin|Takip/.test(x)) ? 'Üyelik ve giriş sistemi' : 'Kurumsal web sitesi');
      if (form.elements.pages) form.elements.pages.value = state.pages === 'starter' ? '1–3 sayfa' : state.pages === 'business' ? '4–7 sayfa' : '8+ sayfa';
      if (form.elements.deadline) form.elements.deadline.value = state.deadline === 'urgent' ? 'Acil' : (state.pages === 'starter' ? '2–4 hafta' : '1–2 ay');
      if (form.elements.name && !form.elements.name.value) form.elements.name.value = info.brand;
      if (form.elements.labPrice) form.elements.labPrice.value = money(info.total);
      const configText = `Sektör: ${info.sector}\nTasarım: ${info.style}\nRenk: ${info.palette}\nSayfa: ${info.pages}\nÖzellikler: ${info.features.join(', ') || 'Standart web sitesi'}\nBakım: ${info.maintenance.name}\nHesaplanan toplam: ${money(info.total)}`;
      if (form.elements.labConfig) form.elements.labConfig.value = configText;
      if (form.elements.details) form.elements.details.value = `Canlı Site Konfigüratörü üzerinden hazırladığım proje:\n${configText}\n\nBu kapsamla ilerlemek istiyorum.`;
      $('#contact')?.scrollIntoView({behavior:'smooth'});
      setTimeout(() => form.elements.name?.focus(), 650);
    });

    $('[data-lab-whatsapp]')?.addEventListener('click', () => {
      const info = summary();
      const message = [
        'Merhaba Efecan, EB Digital Studio Canlı Site Konfigüratörü üzerinden bir proje oluşturdum.','',
        `Marka / işletme: ${info.brand}`,
        `Sektör: ${info.sector}`,
        `Tasarım dili: ${info.style}`,
        `Renk atmosferi: ${info.palette}`,
        `Sayfa kapsamı: ${info.pages}`,
        `Teslim planı: ${info.deadline}`,
        `Ek özellikler: ${info.features.join(', ') || 'Standart özellikler'}`,
        `Aylık bakım: ${info.maintenance.name}${info.maintenance.price ? ` · ${money(info.maintenance.price)}/ay` : ''}`,'',
        `HESAPLANAN PROJE TOPLAMI: ${money(info.total)}`,
        `Tahmini teslim: ${info.delivery}`,'',
        'Bu konfigürasyon için görüşmek istiyorum.'
      ].join('\n');
      const url = `https://wa.me/905425866513?text=${encodeURIComponent(message)}`;
      const opened = window.open(url, '_blank'); if (opened) opened.opener = null; else location.href = url;
    });

    renderLab();
  }


  /* ============================
     EB COMMAND CENTER
     ============================ */
  const center = $('#commandCenter');
  if (center) {
    const input = $('[data-command-search]', center);
    const list = $('[data-command-list]', center);
    const items = () => $$('button,a', list).filter(x => !x.hidden);
    let selected = 0;

    function syncSelection() {
      items().forEach((x,i)=>x.classList.toggle('is-selected', i===selected));
      items()[selected]?.scrollIntoView({block:'nearest'});
    }
    function openCommand() {
      center.classList.add('is-open');
      center.setAttribute('aria-hidden','false');
      document.body.classList.add('no-scroll');
      if (input) { input.value=''; filterCommands(''); setTimeout(()=>input.focus(),80); }
    }
    function closeCommand() {
      center.classList.remove('is-open');
      center.setAttribute('aria-hidden','true');
      document.body.classList.remove('no-scroll');
    }
    function filterCommands(q) {
      const query = q.toLocaleLowerCase('tr-TR').trim();
      $$('button,a', list).forEach(item=>{
        item.hidden = query && !item.textContent.toLocaleLowerCase('tr-TR').includes(query);
      });
      selected = 0; syncSelection();
    }
    function activate(item) {
      if (!item) return;
      const command = item.dataset.command;
      if (command === 'navigate') {
        closeCommand();
        $(item.dataset.target)?.scrollIntoView({behavior:'smooth'});
      } else if (command === 'theme') {
        closeCommand();
        setTimeout(()=>document.querySelector('[data-theme-open]')?.click(),80);
      } else if (item.tagName === 'A') {
        if (item.target === '_blank') window.open(item.href,'_blank','noopener,noreferrer');
        else location.href = item.href;
        closeCommand();
      }
    }

    $$('[data-command-open]').forEach(b=>b.addEventListener('click',openCommand));
    $$('[data-command-close]').forEach(b=>b.addEventListener('click',closeCommand));
    input?.addEventListener('input',()=>filterCommands(input.value));
    list?.addEventListener('click',e=>{
      const item=e.target.closest('button,a'); if(item){e.preventDefault();activate(item)}
    });

    addEventListener('keydown', e => {
      const commandOpen = center.classList.contains('is-open');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k') {
        e.preventDefault(); commandOpen ? closeCommand() : openCommand(); return;
      }
      if (!commandOpen) return;
      if (e.key==='Escape') {e.preventDefault();closeCommand()}
      if (e.key==='ArrowDown') {e.preventDefault();selected=Math.min(selected+1,items().length-1);syncSelection()}
      if (e.key==='ArrowUp') {e.preventDefault();selected=Math.max(selected-1,0);syncSelection()}
      if (e.key==='Enter') {e.preventDefault();activate(items()[selected])}
    });
    syncSelection();
  }

  /* ============================
     CASE STUDY COMPARISON
     ============================ */
  const compare = $('[data-compare]');
  if (compare) {
    const range = $('input[type="range"]', compare);
    const update = value => compare.style.setProperty('--split', `${value}%`);
    const fitLegacyViewport = () => {
      const width = compare.getBoundingClientRect().width;
      compare.style.setProperty('--legacy-scale', String(width / 1440));
    };
    range?.addEventListener('input',()=>update(range.value));
    update(range?.value || 50);
    fitLegacyViewport();
    addEventListener('resize', fitLegacyViewport, {passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(fitLegacyViewport).observe(compare);
  }

  /* small system details */
  const labStatus = $('[data-lab-status]');
  addEventListener('online',()=>{if(labStatus)labStatus.textContent='READY'});
  addEventListener('offline',()=>{if(labStatus)labStatus.textContent='OFFLINE'});
})();
