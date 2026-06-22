(() => {
  'use strict';

  const assistant = document.getElementById('ebAiAssistant');
  if (!assistant) return;

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const panel = $('[data-ai-panel]', assistant);
  const messages = $('[data-ai-messages]', assistant);
  const quick = $('[data-ai-quick]', assistant);
  const form = $('[data-ai-form]', assistant);
  const input = $('[data-ai-input]', assistant);
  const intelList = $('[data-ai-intel-list]', assistant);
  const intelScore = $('[data-ai-score]', assistant);
  const stateSector = $('[data-ai-state-sector]', assistant);
  const statePackage = $('[data-ai-state-package]', assistant);
  const statePrice = $('[data-ai-state-price]', assistant);

  const PHONE = '905425866513';
  const VERSION = '6.2';
  const STORE = 'eb_crown_ai_v62';

  const state = {
    lastText: '',
    lastBrief: null,
    history: JSON.parse(localStorage.getItem(STORE) || '[]').slice(-8),
    booted: false
  };

  const tr = (value) => String(value || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  const money = (n) => `${Math.round(n).toLocaleString('tr-TR')} TL`;
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const normIncludes = (text, word) => tr(text).includes(tr(word));
  const matchAny = (text, words) => words.some(w => normIncludes(text, w));

  const sectors = [
    {
      key: 'beauty', label: 'Güzellik / Beauty Clinic', package: 'Signature Web Experience', base: 49900, min: 59900,
      icon: '✦', weight: 98, margin: 0.37, tone: 'Luxury Care',
      styleDefault: 'luxury',
      keywords: ['guzellik','güzellik','beauty','lazer','epilasyon','cilt','kalici makyaj','kalıcı makyaj','tirnak','tırnak','bolgesel','bölgesel','incelme','diyet','kirpik','salon','estetik','mezitli','bakim','bakım'],
      goal: 'Güven, hijyen, lüks algı ve randevu kararını aynı akışta güçlendirmek.',
      pages: ['Ana sayfa','Marka hakkında','Lazer epilasyon','Cilt bakımı','Kalıcı makyaj','Bölgesel incelme','Tırnak hizmetleri','Kampanyalar','Danışan yorumları','Randevu al','İletişim','Gizlilik / KVKK'],
      seo: ['şehir güzellik merkezi','bölge lazer epilasyon','cilt bakımı randevu','kalıcı makyaj hizmeti','güzellik salonu randevu'],
      angle: 'Instagram’da görünen güzelliği, Google’da güven veren premium bakım merkezine taşımak.',
      warnings: ['Kesin sonuç, garanti zayıflama veya tıbbi tedavi vaadi kullanılmaz.','Öncesi/sonrası görselleri izinli yayınlanır.','Yorumlar onaydan geçer.'],
      conversion: ['Hero’da lüks güven mesajı','Hizmet detaylarında işlem bilgisi','Sosyal kanıt ve yorumlar','WhatsApp randevu','Takip mesajı']
    },
    {
      key: 'realestate', label: 'Emlak / Gayrimenkul', package: 'Özel Dijital Sistem', base: 84900, min: 84900,
      icon: '◆', weight: 99, margin: 0.35, tone: 'Investment Trust',
      styleDefault: 'corporate',
      keywords: ['emlak','gayrimenkul','ilan','satilik','satılık','kiralik','kiralık','arsa','daire','konut','mulkiyet','mülkiyet','portfoy','portföy','tapu','mahalle','iş yeri','is yeri','filtre'],
      goal: 'İlanları portallardan bağımsız, markaya ait güvenilir dijital portföye dönüştürmek.',
      pages: ['Ana sayfa','Satılık ilanlar','Kiralık ilanlar','Arsa & yatırım','İlan detay sayfası','Filtreli portföy','Hakkımızda','Portföy ekle','İletişim'],
      seo: ['niğde satılık daire','niğde kiralık ev','niğde emlakçı','niğde satılık arsa','niğde gayrimenkul danışmanlığı'],
      angle: 'Sosyal medyada kaybolan ilanları, kendi markasına ait dijital emlak ofisine çevirmek.',
      warnings: ['Fiyat, tapu ve ilan durumu güncel tutulmalı.','Temsil edilmeyen mülk yayınlanmamalı.','İlan detayında doğrulanmış bilgiler kullanılmalı.'],
      conversion: ['İlan vitrini','Filtreleme','İlan detayı','WhatsApp bilgi al','Danışman araması']
    },
    {
      key: 'food', label: 'Restoran / Kafe', package: 'Marka Deneyimi', base: 29900, min: 29900,
      icon: '●', weight: 88, margin: 0.33, tone: 'Warm Gastro',
      styleDefault: 'warm',
      keywords: ['restoran','kafe','cafe','menu','menü','rezervasyon','kahvalti','kahvaltı','tatli','tatlı','yemek','organizasyon','masa','bistro'],
      goal: 'Menü, rezervasyon ve organizasyon taleplerini net bir satış akışına çevirmek.',
      pages: ['Ana sayfa','Dijital menü','Rezervasyon','Organizasyon paketleri','Galeri','Yorumlar','Konum'],
      seo: ['niğde kafe','niğde restoran','niğde kahvaltı','niğde doğum günü organizasyonu'],
      angle: 'İştah açıcı görsel dil + hızlı rezervasyon = daha fazla masa ve organizasyon talebi.',
      warnings: ['Menü fiyatları güncel tutulmalı.','Görseller gerçek ürünlerle uyumlu olmalı.'],
      conversion: ['Menü ön izlemesi','Favori ürünler','Rezervasyon CTA','Harita','WhatsApp']
    },
    {
      key: 'fitness', label: 'Fitness / Pilates', package: 'Signature Web Experience', base: 49900, min: 49900,
      icon: '▲', weight: 92, margin: 0.34, tone: 'Performance Studio',
      styleDefault: 'futuristic',
      keywords: ['fitness','pilates','gym','reformer','spor','antrenor','antrenör','koçluk','kocluk','zumba','uyelik','üyelik','salon','beslenme'],
      goal: 'Salon enerjisini, eğitmen güvenini ve üyelik teklifini tek akışta toplamak.',
      pages: ['Ana sayfa','Paketler','Eğitmenler','Ders programı','Deneme dersi','Başarı hikayeleri','İletişim'],
      seo: ['fitness salonu','reformer pilates','pilates stüdyosu','online koçluk'],
      angle: 'Kişiyi “salona bir bakayım” aşamasından deneme dersi talebine taşımak.',
      warnings: ['Sağlık ve fiziksel sonuçlarda garanti verilmez.'],
      conversion: ['Enerjik hero','Paket seçimi','Eğitmen güveni','Deneme dersi','WhatsApp']
    },
    {
      key: 'clinic', label: 'Klinik / Sağlık', package: 'Signature Web Experience', base: 49900, min: 59900,
      icon: '✚', weight: 94, margin: 0.34, tone: 'Clinical Trust',
      styleDefault: 'clinical',
      keywords: ['klinik','doktor','diş','dis','hekim','veteriner','saglik','sağlık','poliklinik','tedavi','hasta','randevu'],
      goal: 'Uzmanlık, hijyen ve randevu güvenini sakin, açıklayıcı bir yapıya çevirmek.',
      pages: ['Ana sayfa','Uzmanlar','Tedaviler','Randevu','Hasta bilgilendirme','SSS','İletişim','KVKK'],
      seo: ['randevu','klinik','diş hekimi','veteriner kliniği','tedavi'],
      angle: 'Tedirginliği azaltan bilgi mimarisiyle randevu kararını kolaylaştırmak.',
      warnings: ['Teşhis/tedavi garantisi verilmez.','KVKK ve açık rıza ciddi tutulur.'],
      conversion: ['Uzman güveni','Tedavi bilgisi','Randevu','SSS','Harita']
    },
    {
      key: 'education', label: 'Eğitim / Kurs', package: 'Marka Deneyimi', base: 29900, min: 29900,
      icon: '◆', weight: 87, margin: 0.32, tone: 'Academic Trust',
      styleDefault: 'corporate',
      keywords: ['kurs','egitim','eğitim','okul','ogrenci','öğrenci','veli','lgs','yks','akademi','ders','sinif','sınıf'],
      goal: 'Veli ve öğrencinin güvenini ön kayıt talebine dönüştürmek.',
      pages: ['Ana sayfa','Programlar','Öğretmen kadrosu','Başarılar','Ön kayıt','Duyurular','İletişim'],
      seo: ['kurs merkezi','yks kurs','lgs kurs','özel ders','eğitim kurumu'],
      angle: 'Kayıt döneminde çalışan dijital ön kayıt makinesi kurmak.',
      warnings: ['Başarı iddiaları kanıtlı olmalı.'],
      conversion: ['Başarı kanıtı','Programlar','Kadro','Ön kayıt','Veli iletişim']
    },
    {
      key: 'architecture', label: 'Mimarlık / İnşaat', package: 'Signature Web Experience', base: 49900, min: 49900,
      icon: '▰', weight: 91, margin: 0.35, tone: 'Editorial Portfolio',
      styleDefault: 'minimal',
      keywords: ['mimarlik','mimarlık','ic mimar','iç mimar','insaat','inşaat','dekorasyon','proje','anahtar teslim','3d','tasarim','tasarım'],
      goal: 'Projeleri prestijli sunup keşif ve teklif talebi oluşturmak.',
      pages: ['Ana sayfa','Projeler','Hizmetler','Önce/sonra','Süreç','Teklif al','İletişim'],
      seo: ['mimarlık ofisi','iç mimarlık','anahtar teslim dekorasyon','proje tasarım'],
      angle: 'Markayı iş yapan ekipten premium proje stüdyosuna taşımak.',
      warnings: ['Proje görselleri izinli kullanılmalı.'],
      conversion: ['Portföy hero','Proje detayları','Süreç','Keşif formu','WhatsApp']
    },
    {
      key: 'corporate', label: 'Kurumsal Şirket', package: 'Marka Deneyimi', base: 29900, min: 29900,
      icon: '◇', weight: 84, margin: 0.32, tone: 'Corporate Trust',
      styleDefault: 'corporate',
      keywords: ['kurumsal','sirket','şirket','firma','danismanlik','danışmanlık','uretim','üretim','hizmet','lojistik','sanayi','otomotiv'],
      goal: 'Firma güvenini, hizmet bilgisini ve teklif talebini tek yapıda toplamak.',
      pages: ['Ana sayfa','Hakkımızda','Hizmetler','Referanslar','Süreç','Teklif formu','İletişim'],
      seo: ['kurumsal web sitesi','firma tanıtım','hizmet şirketi'],
      angle: 'Daha ciddi görünümle teklif değerini ve güveni yükseltmek.',
      warnings: ['Referans, sertifika ve belge bilgileri doğrulanmalı.'],
      conversion: ['Değer vaadi','Hizmet kanıtı','Süreç','Teklif formu','Arama']
    }
  ];

  const features = [
    { key:'appointment', label:'Randevu / rezervasyon', price:6000, level:'conversion', keywords:['randevu','rezervasyon','takvim','masa','deneme dersi','başvuru','basvuru','whatsapp'] },
    { key:'reviews', label:'Onaylı yorum paneli', price:12000, level:'trust', keywords:['yorum','yıldız','yildiz','değerlendirme','deneyim','referans'] },
    { key:'campaigns', label:'Kampanya vitrini', price:5000, level:'sales', keywords:['kampanya','indirim','fırsat','firsat','paket'] },
    { key:'gallery', label:'Galeri / portföy', price:4000, level:'trust', keywords:['galeri','fotoğraf','fotograf','portföy','portfoy','öncesi','sonrası','görsel','gorsel'] },
    { key:'servicePages', label:'SEO hizmet detay sayfaları', price:8500, level:'seo', keywords:['hizmet sayfaları','hizmet detay','ayrı sayfa','seo sayfaları','sayfalar','detay sayfası'] },
    { key:'seo', label:'Gelişmiş SEO altyapısı', price:5000, level:'growth', keywords:['seo','google','search console','arama','görünür','gorunur','index'] },
    { key:'admin', label:'Admin paneli', price:20000, level:'system', keywords:['admin','panel','yönetim','yonetim','ekleyip kaldır','kendim ekleyeyim','onayla'] },
    { key:'database', label:'Veritabanı', price:12000, level:'system', keywords:['veritabanı','database','supabase','kayıt','kalıcı','kalici','sakla'] },
    { key:'membership', label:'Üyelik / giriş sistemi', price:15000, level:'system', keywords:['üyelik','uyelik','giriş','giris','login','kayıt ol','hesap'] },
    { key:'listings', label:'İlan / ürün yönetimi', price:25000, level:'system', keywords:['ilan','satılık','satilik','kiralık','kiralik','ürün','urun','stok','katalog'] },
    { key:'filters', label:'Gelişmiş filtreleme', price:12000, level:'system', keywords:['filtre','oda sayısı','oda sayisi','fiyat aralığı','mahalle','kategori','arama'] },
    { key:'payment', label:'Ödeme entegrasyonu', price:15000, level:'system', keywords:['ödeme','odeme','kart','shopier','iyzico','satın alma','satin alma','sepet'] },
    { key:'multilang', label:'İkinci dil', price:7500, level:'growth', keywords:['ikinci dil','ingilizce','arapça','almanca','dil seçeneği'] },
    { key:'blog', label:'Blog / içerik sistemi', price:8000, level:'growth', keywords:['blog','makale','duyuru','haber','içerik'] },
    { key:'animation', label:'Signature animasyon', price:7500, level:'brand', keywords:['animasyon','premium geçiş','gecis','interaktif','3d','futuristik','fütüristik'] },
    { key:'kvkk', label:'KVKK / gizlilik sayfaları', price:3500, level:'risk', keywords:['kvkk','gizlilik','çerez','cerez','hukuk','izin'] },
    { key:'analytics', label:'Dönüşüm takibi', price:4000, level:'growth', keywords:['analiz','analytics','takip','dönüşüm','donusum','kaç kişi','kac kisi'] }
  ];

  const styleProfiles = [
    { key:'luxury', label:'Luxury / Editorial', price:6000, keywords:['lüks','luks','gold','krem','rose','premium','şık','sik','zarif','altın','champagne'], description:'Krem, gold, rose-gold detaylar; geniş boşluk, editorial başlıklar, yüksek güven ve pahalı algı.' },
    { key:'futuristic', label:'Futuristic / Immersive', price:7500, keywords:['futuristik','fütüristik','neon','ai','yapay zeka','teknolojik','cyber','interaktif','3d'], description:'Koyu zemin, neon enerji, hareketli katmanlar, teknoloji ve yenilik algısı.' },
    { key:'minimal', label:'Minimal / Pure', price:0, keywords:['minimal','sade','beyaz','temiz','soft','modern','basit'], description:'Ferah boşluk, net tipografi, az efekt; yüksek okunabilirlik ve premium sadelik.' },
    { key:'corporate', label:'Corporate / Trust', price:3000, keywords:['kurumsal','ciddi','güven','guven','lacivert','profesyonel'], description:'Lacivert, düzenli grid, net CTA, şirket güveni ve karar verici dili.' },
    { key:'warm', label:'Warm / Boutique', price:3000, keywords:['sıcak','sicak','doğal','dogal','samimi','kahve','beige'], description:'Sıcak tonlar, samimi fotoğraf dili, rezervasyon ve yerel müşteri odağı.' },
    { key:'clinical', label:'Clinical / Clean Trust', price:4500, keywords:['klinik','steril','temiz','sağlık','saglik','hijyen'], description:'Beyaz, açık mavi ve sakin boşluk; bilgi, güven ve randevu kararını öne çıkarır.' }
  ];

  function detectBusinessName(text) {
    const raw = String(text || '').replace(/\s+/g, ' ').trim();
    const patterns = [
      /(?:marka|işletme|isletme|firma|şirket|sirket)\s*(?:adı|adi)?\s*[:\-]\s*([^.,;\n]{2,80})/i,
      /([^.,;\n]{3,80})\s+adında\s+(?:bir\s+)?(?:güzellik|beauty|emlak|kafe|restoran|klinik|firma|işletme|isletme|salon|ofis)/i,
      /([^.,;\n]{3,80})\s+isimli\s+(?:bir\s+)?(?:güzellik|beauty|emlak|kafe|restoran|klinik|firma|işletme|isletme|salon|ofis)/i,
      /(?:benim|bizim)\s+([^.,;\n]{3,70})\s+(?:adlı|adli|isimli)\s+/i
    ];
    for (const rgx of patterns) {
      const m = raw.match(rgx);
      if (m && m[1]) return m[1].replace(/^(Mersin|Niğde|Istanbul|İstanbul|Ankara|Mezitli|Bor)\s+/i, '').trim();
    }
    return '';
  }

  function detectLocation(text) {
    const known = ['Mersin','Mezitli','Niğde','Bor','İstanbul','Ankara','Adana','Konya','Kayseri','Aşağı Kayabaşı','İlhanlı','Selçuk','Yenişehir','Tarsus','Erdemli','Silifke'];
    const found = known.filter(k => normIncludes(text, k));
    return { city: found[0] || '', district: found[1] || '' };
  }

  function detectSector(text) {
    const scored = sectors.map(s => ({
      ...s,
      score: s.keywords.reduce((acc, k) => acc + (normIncludes(text, k) ? 1 : 0), 0)
    })).sort((a,b) => b.score - a.score || b.weight - a.weight);
    return scored[0].score > 0 ? scored[0] : sectors.find(s => s.key === 'corporate');
  }

  function detectStyle(text, sector) {
    const style = styleProfiles
      .map(s => ({...s, score: s.keywords.reduce((acc,k)=>acc + (normIncludes(text, k) ? 1 : 0), 0)}))
      .sort((a,b)=>b.score-a.score)[0];
    if (style.score) return style;
    return styleProfiles.find(s => s.key === (sector.styleDefault || 'corporate')) || styleProfiles[0];
  }

  function detectFeatures(text, sector) {
    let selected = features.filter(f => matchAny(text, f.keywords));
    const ensure = (key) => { const f = features.find(x => x.key === key); if (f && !selected.some(x => x.key === key)) selected.push(f); };
    if (sector.key === 'beauty') { ensure('appointment'); ensure('seo'); ensure('servicePages'); ensure('gallery'); ensure('kvkk'); }
    if (sector.key === 'realestate') { ensure('listings'); ensure('filters'); ensure('seo'); }
    if (sector.key === 'food') { ensure('appointment'); ensure('gallery'); }
    if (sector.key === 'clinic') { ensure('appointment'); ensure('kvkk'); ensure('seo'); }
    if (sector.key === 'education') { ensure('appointment'); ensure('seo'); }
    if (normIncludes(text, 'yorum panel')) ensure('reviews');
    if (normIncludes(text, 'google')) ensure('seo');
    if (normIncludes(text, 'whatsapp')) ensure('appointment');
    if (selected.some(f => ['admin','membership','listings','reviews'].includes(f.key))) ensure('database');
    return uniq(selected.map(f => f.key)).map(k => features.find(f => f.key === k));
  }

  function choosePackage(sector, feats) {
    const keys = feats.map(f => f.key);
    const system = ['admin','database','membership','listings','payment','filters'].some(k => keys.includes(k));
    if (system) return { name:'Özel Dijital Sistem', base:84900, min: sector.key === 'realestate' ? 89900 : 84900 };
    if (sector.key === 'beauty' || sector.key === 'clinic' || sector.key === 'fitness' || sector.key === 'architecture') {
      return { name:'Signature Web Experience', base:49900, min:sector.min || 49900 };
    }
    return { name:sector.package, base:sector.base, min:sector.min };
  }

  function calcPrice(sector, style, feats, text) {
    const pkg = choosePackage(sector, feats);
    const included = new Set(['seo']);
    if (pkg.name.includes('Signature')) { included.add('servicePages'); included.add('gallery'); }
    if (pkg.name.includes('Sistem')) { included.add('database'); }
    let featureTotal = feats.reduce((sum, f) => sum + (included.has(f.key) ? 0 : f.price), 0);
    let total = pkg.base + style.price + featureTotal;
    const keys = feats.map(f => f.key);
    let discount = 0;
    if (keys.includes('admin') && keys.includes('database')) discount += 5000;
    if (keys.includes('listings') && keys.includes('filters') && keys.includes('admin')) discount += 12000;
    if (sector.key === 'beauty' && keys.includes('appointment') && keys.includes('reviews') && keys.includes('campaigns') && keys.includes('gallery')) discount += 5000;
    if (matchAny(text, ['acil','hemen','çok hızlı','cok hizli','1 hafta'])) total *= 1.25;
    total = Math.max(pkg.min || 0, total - discount);
    return { total: Math.round(total / 100) * 100, pkg, discount, featureTotal };
  }

  function estimateTime(total, feats) {
    const keys = feats.map(f => f.key);
    if (total >= 120000 || keys.includes('admin') || keys.includes('payment') || keys.includes('membership')) return '35–55 iş günü';
    if (total >= 90000 || keys.includes('database')) return '28–42 iş günü';
    if (total >= 65000) return '22–32 iş günü';
    if (total >= 45000) return '16–24 iş günü';
    return '10–18 iş günü';
  }

  function stagePlan(brief) {
    const p = [
      { phase:'01', title:'Keşif ve konumlandırma', text:'İşletmenin hedefi, müşteri profili, renk dili, referansları ve satış amacı netleştirilir.' },
      { phase:'02', title:'Premium arayüz tasarımı', text:`${brief.style.label} çizgisinde ana sayfa, hizmet/portföy kartları ve dönüşüm akışı tasarlanır.` },
      { phase:'03', title:'Sistem ve içerik kurulumu', text:`${brief.feats.slice(0,5).map(f=>f.label).join(', ') || 'kurumsal sayfalar'} canlı yapıya işlenir.` },
      { phase:'04', title:'SEO ve güven katmanı', text:'Başlıklar, açıklamalar, schema, sitemap, KVKK, SSS ve yerel arama sinyalleri hazırlanır.' },
      { phase:'05', title:'Yayın ve satış takibi', text:'Domain, Search Console, mobil test, WhatsApp akışı ve sonraki iyileştirme planı tamamlanır.' }
    ];
    if (brief.feats.some(f => ['admin','database','membership','listings'].includes(f.key))) {
      p.splice(3, 0, { phase:'SYS', title:'Admin ve veri mimarisi', text:'Rol, veri tabanı, onay akışı, güvenli erişim ve panel ekranları ayrı test edilir.' });
    }
    return p;
  }

  function buildPersonas(brief) {
    if (brief.sector.key === 'beauty') return ['Yeni danışan: güven ve hijyen arar','Kararsız müşteri: hizmet detayı ve yorum ister','Hızlı karar veren: WhatsApp randevu ister'];
    if (brief.sector.key === 'realestate') return ['Alıcı: filtreleme ve net ilan bilgisi ister','Yatırımcı: bölge ve fiyat potansiyeli arar','Satıcı: portföyünü güvenilir ofise vermek ister'];
    if (brief.sector.key === 'food') return ['Yakındaki müşteri: menü ve konum arar','Organizasyon müşterisi: paket ve fotoğraf ister','Sadık müşteri: kampanya ve rezervasyon ister'];
    return ['İlk kez gelen müşteri: güven arar','Karşılaştıran müşteri: hizmet ve referans ister','Hazır müşteri: hızlı iletişim ister'];
  }

  function buildMicrocopy(brief) {
    if (brief.sector.key === 'beauty') return ['Güzelliğinize değer katan profesyonel dokunuşlar','Krem-gold zarafetle tasarlanmış bakım deneyimi','Randevunuzu birkaç saniyede oluşturun'];
    if (brief.sector.key === 'realestate') return ['Doğru portföy, güvenilir yatırım','Niğde’de satılık ve kiralık fırsatları tek yerde keşfedin','Beğendiğiniz ilan için anında bilgi alın'];
    if (brief.sector.key === 'food') return ['Lezzeti keşfedin, rezervasyonunuzu kolayca oluşturun','Menü, kampanya ve organizasyonlar tek yerde','Sıcak atmosfer, hızlı iletişim'];
    return ['Markanızı dijitalde daha güvenilir gösterin','Hizmetlerinizi net, profesyonel ve satış odaklı sunun','Teklif ve iletişim akışını hızlandırın'];
  }

  function analyze(text) {
    const sector = detectSector(text);
    const style = detectStyle(text, sector);
    const feats = detectFeatures(text, sector);
    const location = detectLocation(text);
    const business = detectBusinessName(text);
    const price = calcPrice(sector, style, feats, text);
    const keys = feats.map(f => f.key);
    const missing = [];
    if (!business) missing.push('Marka / işletme adı');
    if (!location.city) missing.push('Şehir ve hizmet bölgesi');
    if (!matchAny(text, ['telefon','whatsapp','numara'])) missing.push('WhatsApp / telefon');
    if (!matchAny(text, ['fotoğraf','fotograf','logo','görsel','gorsel'])) missing.push('Logo ve gerçek işletme fotoğrafları');
    if (!matchAny(text, ['bütçe','butce','fiyat','tl'])) missing.push('Bütçe beklentisi');
    if (sector.key === 'beauty' && !keys.includes('reviews')) missing.push('Yorum paneli istenip istenmediği');
    if (sector.key === 'realestate' && !keys.includes('admin')) missing.push('İlanları kimin yöneteceği');

    const clarity = clamp(28 + (sector ? 18 : 0) + (business ? 10 : 0) + (location.city ? 10 : 0) + (style ? 8 : 0) + Math.min(28, feats.length * 4) + (text.length > 160 ? 8 : 0) - Math.min(12, missing.length * 2), 15, 99);
    const opportunity = clamp(sector.weight + Math.min(12, feats.length * 2) + (keys.includes('seo') ? 5 : 0) + (keys.includes('appointment') ? 3 : 0) - missing.length * 2, 40, 100);
    const risk = clamp(16 + (keys.includes('payment') ? 14 : 0) + (keys.includes('admin') ? 10 : 0) + (keys.includes('database') ? 8 : 0) + ((sector.key === 'beauty' || sector.key === 'clinic') ? 12 : 0) + missing.length * 3, 8, 92);
    const authority = clamp(58 + (keys.includes('reviews') ? 8 : 0) + (keys.includes('seo') ? 8 : 0) + (style.key === 'luxury' ? 5 : 0) + (business ? 5 : 0), 40, 98);
    const conversion = clamp(54 + (keys.includes('appointment') ? 12 : 0) + (keys.includes('reviews') ? 6 : 0) + (keys.includes('campaigns') ? 6 : 0) + (keys.includes('filters') ? 8 : 0), 38, 99);
    const complexity = clamp(22 + feats.length * 7 + (keys.includes('admin') ? 16 : 0) + (keys.includes('payment') ? 12 : 0), 15, 96);
    const pages = uniq([...sector.pages, ...(keys.includes('blog') ? ['Blog / içerikler'] : []), ...(keys.includes('payment') ? ['Ödeme / satın alma'] : []), ...(keys.includes('membership') ? ['Üye paneli'] : []), ...(keys.includes('admin') ? ['Admin paneli'] : []), ...(keys.includes('analytics') ? ['Dönüşüm raporu'] : [])]);
    const roiSignal = clamp(Math.round((opportunity + conversion + authority - risk / 2) / 2.3), 30, 99);

    const brief = {
      text, sector, style, feats, location, business,
      packageName: price.pkg.name,
      price: price.total,
      discount: price.discount,
      featureTotal: price.featureTotal,
      time: estimateTime(price.total, feats),
      clarity, opportunity, risk, authority, conversion, complexity, roiSignal,
      missing, pages,
      seo: sector.seo,
      angle: sector.angle,
      warnings: sector.warnings,
      conversionSteps: sector.conversion,
      personas: buildPersonas({sector}),
      microcopy: buildMicrocopy({sector}),
      stages: null,
      createdAt: new Date().toISOString()
    };
    brief.stages = stagePlan(brief);
    brief.profitSignal = Math.round(brief.price * sector.margin);
    state.lastBrief = brief;
    state.history.push({ business: business || sector.label, sector: sector.label, price: brief.price, time: brief.createdAt });
    state.history = state.history.slice(-8);
    localStorage.setItem(STORE, JSON.stringify(state.history));
    return brief;
  }

  function addMessage(role, html, opts = {}) {
    const msg = document.createElement('div');
    msg.className = `eb-ai-msg ${role}`;
    msg.innerHTML = html;
    messages.appendChild(msg);
    if (!opts.noScroll) messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  function typing(label = 'Crown AI düşünüyor') {
    const el = addMessage('bot', `<div class="eb-ai-typing"><span></span><span></span><span></span><b>${esc(label)}</b></div>`);
    return () => el.remove();
  }

  function updateIntel(brief) {
    stateSector.textContent = brief.sector.label.split('/')[0].trim().toUpperCase();
    statePackage.textContent = brief.packageName.toUpperCase();
    statePrice.textContent = money(brief.price);
    intelScore.textContent = `${brief.clarity}%`;
    intelList.innerHTML = `
      <p><b>Fırsat:</b> ${brief.opportunity}/100</p>
      <p><b>Dönüşüm:</b> ${brief.conversion}/100</p>
      <p><b>Otorite:</b> ${brief.authority}/100</p>
      <p><b>Risk:</b> ${brief.risk}/100</p>
      <p><b>Tasarım:</b> ${esc(brief.style.label)}</p>
      <p><b>Modül:</b> ${brief.feats.length} ana özellik</p>
      <p><b>Teslim:</b> ${esc(brief.time)}</p>
    `;
  }

  function moduleTags(brief) {
    return brief.feats.map(f => `<span class="eb-ai-keyword is-${esc(f.level)}">${esc(f.label)}</span>`).join('') || '<span class="eb-ai-keyword">Temel web site altyapısı</span>';
  }

  function scoreGrid(brief) {
    const cells = [
      ['Netlik', brief.clarity], ['Fırsat', brief.opportunity], ['Dönüşüm', brief.conversion], ['Otorite', brief.authority], ['Risk', brief.risk], ['ROI Sinyali', brief.roiSignal]
    ];
    return `<div class="crown-score-grid">${cells.map(([n,v]) => `<span><b>${v}</b><small>${esc(n)}</small><i style="--v:${v}%"></i></span>`).join('')}</div>`;
  }

  function board(brief) {
    const agents = [
      ['CEO Strategist', 'Satış açısı', brief.angle],
      ['UX Director', 'Deneyim kararı', `${brief.style.description} İlk ekranda tek hedef: ${brief.conversionSteps[0] || 'hızlı güven'}.`],
      ['SEO Architect', 'Yerel büyüme', `${brief.seo.slice(0,3).join(', ')} aramalarına uygun sayfa mimarisi kurulmalı.`],
      ['Sales Closer', 'Kapanış cümlesi', `Bu çalışma ${brief.business || 'markanız'} için sadece site değil, talep toplayan dijital satış sistemi olarak konumlanmalı.`],
      ['Risk Guardian', 'Kontrol', brief.warnings[0] || 'Bilgiler yayın öncesi doğrulanmalı.'],
      ['Ops Manager', 'Teslim planı', `${brief.time} içinde ${brief.stages.length} aşamalı yayın planı.`]
    ];
    return `<div class="crown-board">${agents.map(a => `<article><small>${esc(a[0])}</small><b>${esc(a[1])}</b><p>${esc(a[2])}</p></article>`).join('')}</div>`;
  }

  function miniPreview(brief) {
    const label = brief.business || (brief.sector.key === 'beauty' ? 'Premium Beauty Studio' : brief.sector.key === 'realestate' ? 'Örnek Emlak Ofisi' : 'Yeni Marka');
    const cta = brief.sector.key === 'realestate' ? 'Portföyü İncele' : brief.sector.key === 'food' ? 'Rezervasyon Yap' : 'Randevu / Teklif Al';
    return `
      <div class="crown-preview is-${esc(brief.style.key)}">
        <div class="crown-preview-top"><span>${esc(brief.style.label)}</span><b>${esc(label)}</b></div>
        <h3>${esc(brief.microcopy[0])}</h3>
        <p>${esc(brief.microcopy[1])}</p>
        <div class="crown-preview-cards">
          ${brief.pages.slice(0,3).map(p => `<span>${esc(p)}</span>`).join('')}
        </div>
        <button type="button">${esc(cta)} ↗</button>
      </div>`;
  }

  function mainReport(brief) {
    const missing = brief.missing.slice(0, 5).map(x => `<li>${esc(x)}</li>`).join('') || '<li>Brief ana hatlarıyla yeterli.</li>';
    return `
      <div class="eb-ai-oracle-card crown-hero-report">
        <div class="ai-brief-top"><span>CROWN PROJECT INTELLIGENCE</span><strong>${esc(brief.business || 'Yeni Proje')}</strong></div>
        <div class="ai-price">${money(brief.price)}</div>
        <p><b>Karar:</b> ${esc(brief.packageName)} önerilir. ${esc(brief.angle)}</p>
        ${scoreGrid(brief)}
      </div>
      ${miniPreview(brief)}
      ${board(brief)}
      <div class="ai-card"><h3>Olmazsa Olmaz Modüller</h3>${moduleTags(brief)}</div>
      <div class="ai-card"><h3>İlk Mimari</h3><ul>${brief.pages.slice(0, 10).map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
      <div class="ai-card"><h3>Eksik Bilgi Kontrolü</h3><ul>${missing}</ul></div>
      <div class="ai-note">SEO, satış veya gelir sonucu garanti edilmez; sistem teknik altyapı, içerik, güven ve dönüşüm akışı olarak profesyonel şekilde kurgulanır.</div>
    `;
  }

  function setQuick() {
    const chips = [
      ['crown','Crown raporu',true], ['architecture','Site mimarisi'], ['design','Design Director'], ['growth','Growth plan'], ['pitch','Pitch deck'], ['sales','Satış konuşması'], ['objections','İtiraz lab'], ['risk','Risk kontrol'], ['roi','ROI simülasyonu'], ['whatsapp','WhatsApp özeti'], ['fill','Formu doldur'], ['copy','Kopyala']
    ];
    quick.innerHTML = chips.map(([action,label,primary]) => `<button class="eb-ai-chip ${primary ? 'primary' : ''}" type="button" data-ai-action="${action}">${label}</button>`).join('');
  }

  function boot() {
    if (state.booted) return;
    state.booted = true;
    addMessage('bot', `
      <b>EB Crown AI hazır.</b><br>
      Bir müşterinin işletmesini tek paragraf anlat. Ben bunu müşteri kazanma dosyasına çeviririm: strateji kurulu, site mimarisi, fiyat, SEO, risk, satış konuşması, itiraz cevapları, mini ön izleme reçetesi ve WhatsApp teklifi.
      <div class="ai-card"><h3>Profesyonel test</h3><p>“Güzellik merkezim için krem-gold lüks tasarım, randevu, yorum paneli, kampanya, hizmet sayfaları, galeri, KVKK ve SEO istiyorum.”</p></div>
    `);
    quick.innerHTML = [
      ['demoBeauty','Beauty Luxury demo',true],
      ['demoEstate','Emlak sistem demo'],
      ['demoClinic','Klinik güven demo'],
      ['how','Nasıl çalışır?']
    ].map(([a,l,p]) => `<button class="eb-ai-chip ${p?'primary':''}" data-ai-action="${a}" type="button">${l}</button>`).join('');
  }

  function analyzeAndRender(text) {
    state.lastText = text;
    addMessage('user', esc(text));
    const stop = typing('strateji kurulu, fiyat, SEO ve satış planı çıkarılıyor');
    setTimeout(() => {
      stop();
      const brief = analyze(text);
      updateIntel(brief);
      addMessage('bot', mainReport(brief));
      setQuick();
    }, 650);
  }

  function buildSummary(brief) {
    if (!brief) return 'Henüz analiz yapılmadı.';
    return `EB Digital Studio Crown AI Proje Özeti\n\nMarka: ${brief.business || 'Belirtilmedi'}\nSektör: ${brief.sector.label}\nKonum: ${brief.location.city || 'Belirtilmedi'} ${brief.location.district || ''}\nPaket: ${brief.packageName}\nÖn fiyat: ${money(brief.price)}\nTeslim: ${brief.time}\nTasarım: ${brief.style.label}\nSkorlar: Netlik ${brief.clarity}/100 · Fırsat ${brief.opportunity}/100 · Dönüşüm ${brief.conversion}/100 · Risk ${brief.risk}/100\nModüller: ${brief.feats.map(f=>f.label).join(', ') || 'Temel web sitesi'}\nSEO hedefleri: ${brief.seo.join(', ')}\nEksik bilgiler: ${brief.missing.join(', ') || 'Yok'}\n\nNot: Fiyat ön bilgilendirme niteliğindedir; kesin teklif kapsam netleşince hazırlanır.`;
  }

  function actionCrown(brief) {
    return `<div class="ai-card"><h3>Crown Kararı</h3><p><b>En doğru satış pozisyonu:</b> ${esc(brief.angle)}</p><p><b>Birincil vaat:</b> ${esc(brief.sector.goal)}</p><p><b>Satış yolu:</b> ${esc(brief.conversionSteps.join(' → '))}</p>${scoreGrid(brief)}</div>${board(brief)}`;
  }

  function actionArchitecture(brief) {
    return `<div class="ai-card"><h3>Site Mimarisi</h3><ul>${brief.pages.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div><div class="ai-card"><h3>Dönüşüm Akışı</h3><ol>${brief.conversionSteps.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></div><div class="ai-card"><h3>Hedef Kitle Haritası</h3><ul>${brief.personas.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div>`;
  }

  function actionDesign(brief) {
    return `${miniPreview(brief)}<div class="ai-card"><h3>Design Director Reçetesi</h3><p><b>Yön:</b> ${esc(brief.style.label)}</p><p>${esc(brief.style.description)}</p><ul><li>İlk ekran tek değer vaadiyle açılmalı.</li><li>Her bölüm sonunda bir mikro CTA bulunmalı.</li><li>Mobilde altta sabit hızlı iletişim davranışı korunmalı.</li><li>Görsel dil sektöre göre ayrışmalı; kopya şablon hissi vermemeli.</li></ul><h3>Mikro metinler</h3>${brief.microcopy.map(x=>`<span class="eb-ai-keyword">${esc(x)}</span>`).join('')}</div>`;
  }

  function actionGrowth(brief) {
    return `<div class="ai-card"><h3>30 / 60 / 90 Gün Growth Plan</h3><ul><li><b>İlk 30 gün:</b> Search Console, marka aramaları, temel sayfalar, WhatsApp dönüşüm testi.</li><li><b>60 gün:</b> ${esc(brief.seo.slice(0,2).join(' ve '))} için içerik ve sayfa güçlendirme.</li><li><b>90 gün:</b> yorumlar, kampanyalar, yeni hizmet/ilan girişleri ve dönüşüm ölçümü.</li></ul><p><b>Ölçülecek metrik:</b> WhatsApp tıklaması, form doldurma, arama tıklaması, en çok incelenen hizmet sayfası.</p></div>`;
  }

  function actionPitch(brief) {
    return `<div class="ai-card"><h3>Mini Pitch Deck</h3><ol><li><b>Problem:</b> Hizmetler/ilanlar sosyal medyada dağınık kalıyor.</li><li><b>Çözüm:</b> ${esc(brief.packageName)} ile güven ve talep akışı tek merkeze alınır.</li><li><b>Değer:</b> ${esc(brief.angle)}</li><li><b>Kapsam:</b> ${esc(brief.feats.map(f=>f.label).join(', ') || 'kurumsal web altyapısı')}</li><li><b>Yatırım:</b> ${money(brief.price)} · ${esc(brief.time)}</li><li><b>Sonraki adım:</b> Logo, fotoğraf, telefon ve içerikler alınır; ana sayfa ön izleme hazırlanır.</li></ol></div>`;
  }

  function actionSales(brief) {
    return `<div class="ai-card"><h3>Telefon Görüşmesi Senaryosu</h3><pre class="ai-copy">Merhaba, ben Efecan Berber. EB Digital Studio olarak işletmelere özel web siteleri ve dijital sistemler hazırlıyorum.\n\n${brief.business || 'İşletmenizi'} incelediğimde, ${brief.sector.label} alanında daha güçlü ve güven veren bir dijital sunumla müşteri taleplerinin daha düzenli toplanabileceğini düşündüm.\n\nBenim önerim sadece güzel görünen bir site değil; ${brief.feats.map(f=>f.label).join(', ') || 'iletişim ve teklif akışı'} olan, müşteriyi karar vermeye yaklaştıran bir yapı.\n\nSize özel kısa bir ön izleme hazırlayıp göstermek isterim. Beğenirseniz kapsamı ve fiyatı birlikte netleştiririz.</pre></div>`;
  }

  function actionObjections(brief) {
    return `<div class="ai-card"><h3>İtiraz Laboratuvarı</h3><ul><li><b>“Instagram yetiyor.”</b> Instagram görünürlük sağlar; web sitesi ise Google araması, düzenli bilgi merkezi ve güven sağlar.</li><li><b>“Fiyat yüksek.”</b> Bu fiyat yalnız tasarım değil; ${esc(brief.feats.slice(0,4).map(f=>f.label).join(', '))}, mobil yapı, SEO altyapısı ve yayın desteğini kapsar.</li><li><b>“Sonra düşünelim.”</b> Önce ana sayfa ön izleme ile düşük riskli başlayabiliriz; beğenilirse kapsam netleşir.</li><li><b>“Google’da çıkar mıyız?”</b> Altyapı Google’a uygun kurulur; sıralama garanti edilmez, doğru temel atılır.</li><li><b>“Kendimiz yaparız.”</b> Siteyi yapmak ayrı, müşteriyi karar vermeye götüren akış ve güven mimarisi kurmak ayrıdır.</li></ul></div>`;
  }

  function actionRisk(brief) {
    return `<div class="ai-card"><h3>Risk ve Kalite Kontrol</h3><ul>${brief.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}<li>Fiyat kesin teklif değil, kapsam netleşmeden bağlayıcı sunulmamalı.</li><li>Alan adı, e-posta, ücretli servisler ve reklam bütçesi ayrıca belirtilmeli.</li><li>Gerçek müşteri verisi varsa KVKK / açık rıza akışı korunmalı.</li><li>Yayın öncesi mobil hız, WhatsApp mesajı, formlar, sitemap ve Search Console kontrol edilmeli.</li></ul></div>`;
  }

  function actionRoi(brief) {
    const leadsLow = Math.max(1, Math.round(brief.price / 25000));
    const leadsHigh = Math.max(leadsLow + 2, Math.round(brief.price / 12000));
    return `<div class="ai-card"><h3>ROI Simülasyonu</h3><p>Bu bölüm kesin gelir tahmini değildir; müşteriye mantığı anlatmak için kullanılan yatırım okumasıdır.</p><ul><li><b>Ön yatırım:</b> ${money(brief.price)}</li><li><b>Güçlü sinyal:</b> ${brief.roiSignal}/100</li><li><b>Bu sistemi mantıklı kılan şey:</b> Birkaç iyi müşteri/talep, site maliyetini uzun vadede karşılayabilir.</li><li><b>Takip edilecek aralık:</b> ilk 90 günde ${leadsLow}–${leadsHigh} nitelikli WhatsApp / form talebi hedeflenebilir; garanti değildir.</li></ul></div>`;
  }

  function fillProposal(brief) {
    const formEl = document.getElementById('proposalForm');
    if (!formEl) return false;
    const set = (name, value) => { const el = formEl.querySelector(`[name="${name}"]`); if (el) el.value = value; };
    set('name', brief.business || 'Yeni proje');
    set('type', brief.packageName.includes('Sistem') ? 'Admin paneli' : 'Kurumsal web sitesi');
    set('pages', brief.pages.length > 7 ? '8+ sayfa' : '4–7 sayfa');
    set('deadline', brief.time.includes('10') || brief.time.includes('16') ? '2–4 hafta' : '1–2 ay');
    const details = formEl.querySelector('[name="details"]');
    if (details) details.value = buildSummary(brief);
    formEl.querySelectorAll('[name="feature"]').forEach(c => {
      c.checked = brief.feats.some(f => tr(f.label).includes(tr(c.value))) || c.value === 'Mobil uyum';
    });
    location.hash = '#contact';
    return true;
  }

  function answerSimple(text) {
    const n = tr(text);
    if (n.includes('fiyat') || n.includes('ne kadar') || n.includes('ucret')) return 'Fiyat kapsamla değişir. İşletme türü, sayfa sayısı ve istenen özellikleri tek paragraf yaz; Crown AI sana paket, ön fiyat ve teslim süresi çıkarsın.';
    if (n.includes('seo') || n.includes('google')) return 'SEO için başlıklar, hizmet sayfaları, yerel anahtar kelimeler, schema, sitemap ve Search Console gerekir. Sıralama garanti edilmez; doğru teknik temel kurulur.';
    if (n.includes('admin')) return 'Admin paneli; işletmenin ilan, yorum, kampanya, hizmet veya müşteri verilerini yönetmesini sağlar. Genellikle veritabanı ve rol sistemiyle birlikte kurulur.';
    return '';
  }

  function handleAction(action) {
    const brief = state.lastBrief;
    if (action === 'demoBeauty') return analyzeAndRender('Güzellik merkezim var. Lazer epilasyon, cilt bakımı, kalıcı makyaj, bölgesel incelme ve tırnak hizmetleri veriyoruz. Krem-gold lüks tasarım, WhatsApp randevu, onaylı yorum paneli, kampanya alanı, hizmet detay sayfaları, galeri, KVKK, dönüşüm takibi ve Google SEO istiyorum.');
    if (action === 'demoEstate') return analyzeAndRender('Niğde’de Net Emlak adında emlak ofisim var. Satılık ve kiralık ilanlarımı göstermek, mahalle fiyat oda sayısı ve ilan türüne göre filtreleme yapmak, her ilan için detay sayfası ve WhatsApp bilgi al butonu eklemek istiyorum. İleride admin panelinden ilanları kendim eklemek istiyorum.');
    if (action === 'demoClinic') return analyzeAndRender('Niğde’de diş kliniğim var. Hekim profilleri, tedavi sayfaları, online randevu, hasta yorumları, KVKK, Google SEO ve güven veren temiz klinik tasarımı istiyorum.');
    if (action === 'how') return addMessage('bot', '<b>Crown AI nasıl çalışır?</b><br>Müşteri briefini sektör, tasarım, modül, fiyat, risk, SEO, dönüşüm ve satış psikolojisi açısından okur. Sonuçta paket değil, müşteri kazanma dosyası üretir. Bu sürüm API kullanmaz; güvenli ve maliyetsizdir.');
    if (!brief) return addMessage('bot', 'Önce bir proje briefi yaz. Sonra Crown AI bütün panelleri üretsin.');
    const map = { crown: actionCrown, architecture: actionArchitecture, design: actionDesign, growth: actionGrowth, pitch: actionPitch, sales: actionSales, objections: actionObjections, risk: actionRisk, roi: actionRoi };
    if (map[action]) return addMessage('bot', map[action](brief));
    if (action === 'copy' || action === 'export') {
      navigator.clipboard && navigator.clipboard.writeText(buildSummary(brief));
      return addMessage('bot', '<b>Özet kopyalandı.</b><br>Teklif görüşmesinde veya WhatsApp mesajında kullanabilirsin.');
    }
    if (action === 'fill') return addMessage('bot', fillProposal(brief) ? '<b>Teklif formu dolduruldu.</b><br>Form alanına geçip WhatsApp teklifini gönderebilirsin.' : 'Teklif formu bu sayfada bulunamadı.');
    if (action === 'whatsapp') {
      window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(buildSummary(brief))}`, '_blank', 'noopener');
      return addMessage('bot', '<b>WhatsApp özeti hazırlandı.</b><br>Yeni pencerede gönderim ekranı açıldı.');
    }
  }

  function openAssistant() {
    assistant.classList.add('is-open');
    panel && panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('eb-ai-lock-ready');
    boot();
    setTimeout(() => input && input.focus(), 100);
  }
  function closeAssistant() {
    assistant.classList.remove('is-open');
    panel && panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('eb-ai-lock-ready');
    if (document.activeElement && assistant.contains(document.activeElement)) document.activeElement.blur();
  }

  $$('[data-assistant-open]').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openAssistant(); }));
  $$('[data-assistant-close]', assistant).forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeAssistant(); }));

  // V6.2 güvenli kapatma ve cursor katmanı: buton başka katmanların altında kalsa bile yakalar.
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest && e.target.closest('[data-assistant-close]');
    if (closeBtn && assistant.contains(closeBtn)) {
      e.preventDefault();
      e.stopPropagation();
      closeAssistant();
    }
  }, true);

  assistant.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-ai-action]');
    if (actionBtn) {
      e.preventDefault();
      handleAction(actionBtn.dataset.aiAction);
    }
  });

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    const simple = answerSimple(text);
    if (simple && text.length < 80) {
      addMessage('user', esc(text));
      addMessage('bot', esc(simple));
      return;
    }
    analyzeAndRender(text);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && assistant.classList.contains('is-open')) closeAssistant();
  });

  assistant.dataset.aiVersion = VERSION;
})();
