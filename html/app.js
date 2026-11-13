"use strict";
/* ===================================================================
   Settings you may want to change
   =================================================================== */
const CONFIG = {
  server: "",          // BirdNET-Go address, e.g. "http://192.168.1.50:8080". Empty = same address as this page (proxy).
  refreshSeconds: 60,  // how often to ask BirdNET-Go for new detections
  maxOnPlate: 60       // most species drawn on the plate; the rest appear in the index only
};

/* ===================================================================
   Plate library: Nederlandsche Vogelen (KB) on Wikimedia Commons.
   "Name=code,code" -> File:Nederlandsche vogelen (KB) - Name (code).jpg
   =================================================================== */
const KB_RAW = "Acanthis flammea=332b;Acrocephalus arundinaceus=02v;Acrocephalus schoenobaenus=098b;Aegithalos caudatus=048b;Alauda arvensis=026b,380b;Alca torda=404b;Alcedo atthis=285pl;Anas acuta=178b,176b;Anas clypeata=253pl,voor255;Anas crecca=146b,148b;Anas penelope=voor213,211pl,348b;Anas platyrhynchos=215pl,364b,366b,voor217;Anas querquedula=180b,182b;Anas strepera=314b,316b;Anser albifrons=207pl;Anser anser=203pl;Anthus pratensis=209pl;Apus apus=036b;Ardea cinerea=289pl;Ardea purpurea=352b;Ardeola ralloides=456b;Arenaria interpres=291pl;Asio flammeus=062d,064a;Asio otus=302b;Athene noctua=068b;Aythya fuligula=277pl,279pl;Aythya marila=269pl;Aythya nyroca=322b;Bombycilla garrulus=201pl;Botaurus stellaris=074b,076a,340b;Branta bernicla=188b;Branta leucopsis=197pl;Bubo scandiacus=392b;Bucephala clangula=310b,312b,336b;Buteo buteo=446b;Calidris alba=283pl;Calidris ferruginea=426b;Calidris maritima=442b;Calidris minuta=271pl;Caprimulgus europaeus=038b;Carduelis carduelis=328b;Carduelis flavirostris=338b;Certhia brachydactyla=058b;Charadrius alexandrinus=470b;Charadrius hiaticula=265pl;Chlidonias niger=130b;Chloris chloris=072b;Chroicocephalus ridibundus=281pl,152d,154b;Ciconia ciconia=174b;Ciconia nigra=458b;Cinclus cinclus=024b;Circus aeruginosus=014c,016c;Circus cyaneus=390b;Coccothraustes coccothraustes=136b;Coloeus monedula=219pl;Columba livia=012b,408b,412b,414b,420b;Columba oenas=406b;Columba palumbus=008b,010a;Corvus cornix=205pl;Corvus corone=223pl;Corvus frugilegus=199pl;Coturnix coturnix=142b;Crex crex=275pl;Cuculus canorus=116b,326b;Cyanistes caeruleus=044b;Cygnus cygnus=490b,492b;Delichon urbicum=032b;Dendrocopos major=040b;Dendrocopos medius=346b;Dendrocopos minor=356b;Dryocopus martius=384b,386b;Emberiza calandra=436b;Emberiza citrinella=114b;Emberiza hortulana=144b;Emberiza schoeniclus=080b;Erithacus rubecula=086b;Falco peregrinus=438b;Falco subbuteo=229pl;Falco tinnunculus=227pl,306b,308b;Ficedula albicollis=450b;Fratercula arctica=358b;Fringilla coelebs=140b;Fringilla montifringilla=225pl;Fulica atra=060b,062a;Gallinago gallinago=233pl;Gallinago media=247pl;Gallinula chloropus=070b;Gallus gallus=472b,474b;Garrulus glandarius=03va;Gavia immer=484b;Grus grus=464b;Gyps fulvus=korteinhoud008;Haematopus ostralegus=050b;Haliaeetus albicilla=416b,418b;Hippolais icterina=100b;Hirundo rustica=030b;Hydrobates pelagicus=245pl;Ixobrychus minutus=058c,056b;Jynx torquilla=342b;Lanius collurio=126b;Lanius excubitor=120b;Lanius senator=468b;Larus argentatus=195pl;Larus marinus=440b;Limosa limosa=052b,320b;Linaria cannabina=156b;Lophophanes cristatus=444b;Loxia curvirostra=221pl;Lullula arborea=344b,350b;Luscinia megarhynchos=122b;Luscinia svecica=410b;Lymnocryptes minimus=237pl;Lyrurus tetrix=164b,166b;Melanitta fusca=330b;Melanitta nigra=334pl;Meleagris gallopavo=452b;Mergellus albellus=296b,362b,ivb;Mergus merganser=324b;Mergus serrator=241pl,voor243;Morus bassanus=400b;Motacilla alba=118b;Motacilla cinerea=432b;Motacilla flava=102b;Nucifraga caryocatactes=006a;Numenius arquata=108b;Numenius phaeopus=304b;Numida meleagris=454b;Nycticorax nycticorax=150b,152a;Oenanthe oenanthe=162b,273pl;Oriolus oriolus=018b;Otis tarda=460b;Otus scops=378b;Panurus biarmicus=084b;Parus major=112b;Passer domesticus=076d;Passer montanus=078b;Pavo cristatus=480b,482b;Perdix perdix=184a,186a;Phalacrocorax aristotelis=462b;Phalacrocorax carbo=088b,092a;Phalaropus fulicarius=486b;Phasianus colchicus=158b,160b;Philomachus pugnax=028b;Phoenicurus phoenicurus=082b,360b;Pica pica=002a;Picus canus=388b;Picus viridis=042b,372b;Platalea leucorodia=170b,172b;Plectrophenax nivalis=300b;Pluvialis apricaria=249pl,voor251;Pluvialis squatarola=478b;Podiceps cristatus=168b;Podiceps grisegena=434b;Podiceps nigricollis=488b;Poecile montanus=046b;Porzana porzana=261pl,354b,voor263;Prunella collaris=396b;Prunella modularis=402b;Puffinus puffinus=368b;Pyrrhula pyrrhula=132b;Recurvirostra avosetta=066b;Regulus regulus=293pl;Riparia riparia=034b;Rynchops niger=398b;Scolopax rusticola=287pl;Serinus canaria=476b;Sitta europaea=430b;Spinus spinus=134b;Stercorarius skua=448b;Sterna hirundo=104b,106b;Sternula albifrons=466b;Streptopelia roseogrisea=422b;Streptopelia turtur=010d;Sturnus vulgaris=376b;Sylvia atricapilla=424b;Sylvia borin=138b;Sylvia communis=096b;Tachybaptus ruficollis=231pl;Tadorna tadorna=190b,192b;Thalasseus sandvicensis=428b;Tringa erythropus=257pl,267pl;Tringa nebularia=318b;Tringa totanus=259pl;Troglodytes troglodytes=110b;Turdus iliacus=020b;Turdus merula=016f;Turdus philomelos=022b,382b;Turdus pilaris=235pl;Turdus torquatus=239pl;Tyto alba alba=374b;Tyto alba guttata=298b;Upupa epops=128b;Vanellus vanellus=064d,370b";

/* Names BirdNET uses today -> names the 2015 scans were filed under */
const SYNONYM = {
  "Spatula clypeata":"Anas clypeata","Mareca penelope":"Anas penelope","Mareca strepera":"Anas strepera",
  "Spatula querquedula":"Anas querquedula","Calidris pugnax":"Philomachus pugnax","Dryobates minor":"Dendrocopos minor",
  "Dendrocoptes medius":"Dendrocopos medius","Leiopicus medius":"Dendrocopos medius","Linaria flavirostris":"Carduelis flavirostris",
  "Corvus monedula":"Coloeus monedula","Curruca communis":"Sylvia communis","Larus ridibundus":"Chroicocephalus ridibundus",
  "Botaurus minutus":"Ixobrychus minutus","Nyctea scandiaca":"Bubo scandiacus","Acanthis cabaret":"Acanthis flammea",
  "Miliaria calandra":"Emberiza calandra","Parus caeruleus":"Cyanistes caeruleus","Parus montanus":"Poecile montanus",
  "Carduelis cannabina":"Linaria cannabina","Carduelis chloris":"Chloris chloris","Carduelis spinus":"Spinus spinus",
  "Tetrao tetrix":"Lyrurus tetrix","Catharacta skua":"Stercorarius skua","Sterna sandvicensis":"Thalasseus sandvicensis",
  "Sterna albifrons":"Sternula albifrons","Delichon urbica":"Delichon urbicum"
};

const COMMONS = "https://commons.wikimedia.org";
const filePath = (file, w) => COMMONS + "/wiki/Special:FilePath/" + encodeURIComponent(file) + "?width=" + w;
const filePage = file => COMMONS + "/wiki/File:" + encodeURIComponent(file.replace(/ /g, "_"));

const KB = {};
for (const e of KB_RAW.split(";")) {
  const [name, codes] = e.split("=");
  const key = name.split(" ").slice(0, 2).join(" ");
  for (const c of codes.split(",")) {
    const file = "Nederlandsche vogelen (KB) - " + name + " (" + c + ").jpg";
    (KB[key] = KB[key] || []).push({ file, src: filePath(file, 500), large: filePath(file, 960), page: filePage(file),
      credit: "Nederlandsche Vogelen, Nozeman & Sepp, 1770–1829. Koninklijke Bibliotheek." });
  }
}

/* Hand-picked plates for species the main library lacks or shows poorly.
   Scientific name -> [Commons file name, credit]. First entry is used; the rest are offered as alternatives. */
const CURATED_RAW = {
  "Streptopelia decaocto": [
    ["Columba decaocto Frivaldski.jpg", "Frivaldszky's plate from the first description of the species, 1838."],
    ["TurturStoliczkaeKeulemans.jpg", "J. G. Keulemans, 19th century."],
    ["Turtle dove Albin.jpg", "Eleazar Albin, A Natural History of Birds, 1731–38."]
  ],
  "Cygnus olor": [
    ["A natural history of birds - illustrated with a hundred and one copper plates, curiously engraven from the life (1731) (14563733179).jpg", "Eleazar Albin, A Natural History of Birds, 1731."]
  ]
};
const CURATED = {};
for (const k in CURATED_RAW) CURATED[k] = CURATED_RAW[k].map(([file, credit]) => ({ file, src: filePath(file, 500), large: filePath(file, 960), page: filePage(file), credit: credit + " Wikimedia Commons." }));

/* ===================================================================
   Fugleramme artwork: ready-made transparent cut-outs, filed by scientific
   name. Read from an "art" folder beside this page if one exists, otherwise
   straight from the project's GitHub repository.
   https://github.com/arnegiacomo/fugleramme  (classic style, CC BY-SA 4.0)
   =================================================================== */
const ART_REMOTE = "https://raw.githubusercontent.com/arnegiacomo/fugleramme/main/assets";
const ART_SOURCES = { gould: "John Gould", vonwright: "The von Wright brothers, Svenska Fåglar", audubon: "John James Audubon", fuertes: "Louis Agassiz Fuertes",
  dresser: "H. E. Dresser, A History of the Birds of Europe", keulemans: "J. G. Keulemans", wilson: "Alexander Wilson", levaillant: "François Levaillant", swainson: "William Swainson" };
const FR = { files: {}, alias: {}, ok: false };
async function loadFugleramme() {
  for (const base of ["art", ART_REMOTE]) {
    try {
      const r = await fetch(base + "/artwork/classic/manifest.json"); if (!r.ok) throw 0;
      const m = await r.json();
      for (const key of Object.keys(m).sort((a, b) => a.length - b.length || a.localeCompare(b))) {
        const mm = key.match(/^birds\/(.+?)(?:-(\d+))?\.(webp|png)$/); if (!mm) continue;
        const who = ART_SOURCES[m[key].source] || (m[key].source || "").replace(/^./, c => c.toUpperCase());
        const src = base + "/artwork/classic/" + key;
        (FR.files[mm[1]] = FR.files[mm[1]] || []).push({ file: key, src, large: src, page: m[key].url || "", ready: true,
          credit: (who ? "After " + who + ". " : "") + "Cut-out from the Fugleramme project, CC BY-SA 4.0." });
      }
      try { FR.alias = await fetch(base + "/birdnet_aliases.json").then(x => x.json()); } catch (e) {}
      FR.ok = true; return;
    } catch (e) {}
  }
}
const slug = n => n.trim().toLowerCase().replace(/ /g, "-");
function frPlates(sci) { return FR.files[slug(sci)] || (FR.alias[sci] && FR.files[slug(FR.alias[sci])]) || []; }

/* ===================================================================
   Small helpers
   =================================================================== */
const $ = s => document.querySelector(s);
const store = {
  get(k, d) { try { const v = localStorage.getItem("birdplate." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("birdplate." + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem("birdplate." + k); } catch (e) {} }
};
const params = new URLSearchParams(location.search);
/* An http(s) address with no quotes, spaces or angle brackets, or "" (use this page's own address).
   The address is only ever taken from this browser's own settings, never from the link that
   opened the page, so a link someone sends cannot point the page at a server of their choosing. */
const cleanServer = v => { v = String(v || "").trim().replace(/\/+$/, ""); return /^https?:\/\/[^\s"'<>`\\]+$/i.test(v) ? v : ""; };
const server = cleanServer(store.get("server", "") || CONFIG.server);
const demoAsked = params.has("demo");   // ?demo: the sample plate on purpose
let demo = demoAsked;                     // also true while BirdNET-Go cannot be reached
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* Links shown on a card come from Wikipedia, Wikimedia Commons or the artwork manifest: only ever follow http(s) ones. */
const safeHref = u => { try { const x = new URL(String(u || ""), location.href); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } };
const ymd = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const longDate = d => d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const calls = n => n.toLocaleString() + (n === 1 ? " call" : " calls");
function roman(n) { const t = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]]; let s = ""; for (const [v, r] of t) while (n >= v) { s += r; n -= v; } return s; }
function when(s) {
  if (!s) return "";
  const d = new Date(String(s).replace(" ", "T"));
  if (isNaN(d)) return String(s);
  const sameDay = ymd(d) === ymd(new Date());
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return sameDay ? "today at " + time : d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) + (/\d:\d/.test(s) ? ", " + time : "");
}

/* ===================================================================
   Detections from BirdNET-Go
   =================================================================== */
let period = store.get("period", "week");

/* Behind a sign-in such as Cloudflare Access, a lapsed sign-in shows up as this page's own
   requests being redirected to the sign-in page. Reload then, so the sign-in appears on
   screen instead of the plate quietly going stale. Only after the page has shown live
   birds at least once, so a redirect at first load cannot cause a reload loop. */
let everLive = false;
function signInLapsed(r) {
  if (r.type !== "opaqueredirect") return false;
  if (everLive) location.reload();
  return true;
}
async function apiFetch(path) {
  const r = await fetch(server + path, { headers: { Accept: "application/json" }, redirect: server ? "follow" : "manual" });
  if (signInLapsed(r)) throw new Error("The sign-in for this page has lapsed. Reload the page to sign in again.");
  return r;
}

async function fetchSpecies() {
  if (demoAsked) return sample();
  let path;
  if (period === "today") path = "/api/v2/analytics/species/daily?date=" + ymd(new Date());
  else if (period === "all") path = "/api/v2/analytics/species/summary";
  else path = "/api/v2/analytics/species/summary?start_date=" + ymd(daysAgo(period === "week" ? 6 : 29)) + "&end_date=" + ymd(new Date());
  const r = await apiFetch(path);
  if (r.status === 401 || r.status === 403) throw new Error("BirdNET-Go asked for a sign-in. Allow this page's address under its security settings, or turn off private mode.");
  if (!r.ok) throw new Error("BirdNET-Go answered with error " + r.status + ".");
  const j = await r.json();
  const rows = Array.isArray(j) ? j : (j && (j.species || j.data || j.items)) || [];
  return rows.map(o => ({
    sci: o.scientific_name || o.scientificName || "",
    common: o.common_name || o.commonName || o.scientific_name || "Unnamed",
    count: Number(o.count ?? o.total ?? o.count_in_period ?? 0),
    first: o.first_heard || o.first_seen || o.first_heard_date || "",
    last: o.last_heard || o.latest_heard || o.last_seen || o.latest_seen || "",
    hourly: Array.isArray(o.hourly_counts) && o.hourly_counts.length === 24 ? o.hourly_counts : null,
    maxConf: o.max_confidence || 0, avgConf: o.avg_confidence || 0,
    isNew: !!o.is_new_species, newYear: !!o.is_new_this_year, newSeason: !!o.is_new_this_season,
    season: o.current_season || "", daysKnown: o.days_since_first_seen || 0,
    thumb: o.thumbnail_url ? (/^https?:/.test(o.thumbnail_url) ? o.thumbnail_url : server + o.thumbnail_url) : ""
  })).filter(s => s.sci && s.count > 0).sort((a, b) => b.count - a.count);
}

function sample() {
  const raw = "Robin,Erithacus rubecula,148;Blackbird,Turdus merula,121;Wood Pigeon,Columba palumbus,96;Blue Tit,Cyanistes caeruleus,88;Great Tit,Parus major,74;House Sparrow,Passer domesticus,69;Jackdaw,Corvus monedula,61;Carrion Crow,Corvus corone,47;Magpie,Pica pica,44;Wren,Troglodytes troglodytes,41;Dunnock,Prunella modularis,37;Starling,Sturnus vulgaris,35;Goldfinch,Carduelis carduelis,33;Chaffinch,Fringilla coelebs,29;Tawny Owl,Strix aluco,24;Long-tailed Tit,Aegithalos caudatus,22;Coal Tit,Periparus ater,19;Redwing,Turdus iliacus,18;Song Thrush,Turdus philomelos,16;Great Spotted Woodpecker,Dendrocopos major,14;Nuthatch,Sitta europaea,13;Greenfinch,Chloris chloris,12;Jay,Garrulus glandarius,9;Fieldfare,Turdus pilaris,9;Buzzard,Buteo buteo,8;Pied Wagtail,Motacilla alba,7;Goldcrest,Regulus regulus,7;Mallard,Anas platyrhynchos,6;Green Woodpecker,Picus viridis,6;Bullfinch,Pyrrhula pyrrhula,5;Mistle Thrush,Turdus viscivorus,5;Pheasant,Phasianus colchicus,4;Siskin,Spinus spinus,4;Grey Heron,Ardea cinerea,3;Sparrowhawk,Accipiter nisus,3;Moorhen,Gallinula chloropus,3;Kestrel,Falco tinnunculus,2;Barn Owl,Tyto alba,2;Raven,Corvus corax,2";
  const mult = { today: 1, week: 6, month: 24, all: 110 }[period];
  return raw.split(";").map((r, i) => {
    const [common, sci, c] = r.split(","), count = c * mult, night = /Owl/.test(common);
    let seed = i * 97 + 13; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const w = Array.from({ length: 24 }, (_, h) => (night ? (h < 6 || h > 18 ? 1 : 0) : Math.exp(-((h - 8) ** 2) / 8) + .5 * Math.exp(-((h - 15) ** 2) / 6)) * (.4 + rnd()));
    const tot = w.reduce((a, b) => a + b, 0), hourly = w.map(x => Math.round(x / tot * count));
    const d = new Date(); d.setHours(night ? 5 : 8 + (i % 6), (i * 7) % 60, 0);
    return { sci, common, count, hourly, first: "", last: ymd(d) + " " + d.toTimeString().slice(0, 8), maxConf: .62 + rnd() * .36, avgConf: 0, daysKnown: 40 + i * 9, newSeason: i % 11 === 6, season: "autumn", thumb: "" };
  });
}

/* ===================================================================
   Finding a plate for a species
   =================================================================== */
function kbPlates(sci) { return [...(CURATED[sci] || []), ...(KB[sci] || KB[SYNONYM[sci]] || [])]; }

function scoreCandidate(title, sci) {
  const t = title.replace(/^File:/, ""), low = t.toLowerCase(), squashed = low.replace(/[\s_]/g, "");
  if (/crossley|\bmap\b|eggs?\b|\bnest|wing|skull|skelet|\bhead\b|\bkop\b|stamp|mural|distribution|\.svg$|\.ogg$|\.pdf$|\.webm$| & /i.test(t)) return -1;
  let s = 0;
  if (/albin|selby|frivald|bewick|edwards|donovan|lewin|martinet|buffon|natural history of birds|nederlandsche vogelen/i.test(t)) s += 100;  // figures on plain paper
  else if (/keulemans onze vogels/i.test(t)) s += 90;
  else if (/keulemans/i.test(t)) s += 80;
  else if (/naumann/i.test(t)) s += 75;
  else if (/^[A-Z][a-z]+ [a-z]+ 18\d\d\.jpe?g$/.test(t)) s += 70;
  else if (/gould/i.test(t)) s += 60;
  else if (/lilford|thorburn/i.test(t)) s += 55;
  else if (/audubon/i.test(t)) s += 55;
  else if (/wellcome|engraving|lithograph/i.test(t)) s += 40;
  else if (/zwarts/i.test(t)) s += 30;
  else if (/iconographia zoologica/i.test(t)) s += 20;
  if (squashed.includes(sci.toLowerCase().replace(/\s/g, ""))) s += 50;
  return s;
}

async function commonsPlates(sci) {
  const cached = store.get("cat2." + sci);
  if (cached && Date.now() - cached.t < 30 * 864e5) return cached.v;
  let v = [];
  try {
    const u = COMMONS + "/w/api.php?format=json&origin=*&action=query&generator=categorymembers&gcmtype=file&gcmlimit=80&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=500&gcmtitle=" + encodeURIComponent("Category:" + sci + " (illustrations)");
    const j = await fetch(u).then(r => r.json());
    v = Object.values((j.query && j.query.pages) || {}).map(p => {
      const ii = p.imageinfo && p.imageinfo[0];
      if (!ii || !/^image\/(jpeg|png|tiff)$/.test(ii.mime) || ii.width < 400 || !ii.thumburl) return null;
      const score = scoreCandidate(p.title, sci);
      return score < 0 ? null : { score, file: p.title.replace(/^File:/, ""), src: ii.thumburl, large: ii.thumburl, page: ii.descriptionurl,
        credit: p.title.replace(/^File:/, "").replace(/\.\w+$/, "").replace(/\s*\(\d{6,}\)/, "") + ". Wikimedia Commons." };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12);
    store.set("cat2." + sci, { t: Date.now(), v });
  } catch (e) { /* offline or blocked: fall through to whatever else we have */ }
  return v;
}

/* Plates to try for a species, best first. */
async function choosePlates(sp) {
  const chosen = store.get("choice." + sp.sci);
  if (chosen) return [chosen];
  const fr = frPlates(sp.sci), kb = kbPlates(sp.sci);
  if (fr.length) return [fr[0], ...kb.slice(0, 1)];
  if (kb.length) return [kb[0]];
  const c = await commonsPlates(sp.sci);
  if (c.length) return c.slice(0, 6);
  if (sp.thumb) return [{ src: sp.thumb, large: sp.thumb, photo: true, credit: "No engraved plate found. Photograph supplied by BirdNET-Go." }];
  return [];
}

/* ===================================================================
   Lifting the bird off its page.
   Reads the paper colour from the margins, keeps the largest inked
   figure, and lets everything paper-coloured fall away.
   =================================================================== */
function cutout(img) {
  const W = Math.min(img.naturalWidth, 420), H = Math.round(img.naturalHeight * W / img.naturalWidth);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0, W, H);
  const im = x.getImageData(0, 0, W, H), d = im.data, m = Math.round(W * .035), m2 = Math.round(W * .08);
  const rs = [], gs = [], bs = [];
  for (let y = m; y < H - m; y += 3) for (let X = m; X < W - m; X += 3) {
    if (X > m2 && X < W - m2 && y > m2 && y < H - m2) continue;
    const i = (y * W + X) * 4; rs.push(d[i]); gs.push(d[i + 1]); bs.push(d[i + 2]);
  }
  const med = a => a.sort((p, q) => p - q)[a.length >> 1], pr = med(rs), pg = med(gs), pb = med(bs);
  const dist = new Float32Array(W * H);
  for (let y = m; y < H - m; y++) for (let X = m; X < W - m; X++) {
    const k = y * W + X, i = k * 4, dr = d[i] - pr, dg = d[i + 1] - pg, db = d[i + 2] - pb;
    dist[k] = Math.sqrt(dr * dr + dg * dg + db * db);
  }
  const S = 4, gw = Math.ceil(W / S), gh = Math.ceil(H / S), cnt = new Uint16Array(gw * gh);
  for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) if (dist[y * W + X] > 42) cnt[(y / S | 0) * gw + (X / S | 0)]++;
  const R = 2, dl = new Uint8Array(gw * gh);
  for (let y = 0; y < gh; y++) for (let X = 0; X < gw; X++) {
    if (cnt[y * gw + X] < 3) continue;
    for (let yy = Math.max(0, y - R); yy <= Math.min(gh - 1, y + R); yy++) for (let xx = Math.max(0, X - R); xx <= Math.min(gw - 1, X + R); xx++) dl[yy * gw + xx] = 1;
  }
  const lab = new Int32Array(gw * gh), comps = [null], st = [];
  for (let s = 0; s < dl.length; s++) {
    if (!dl[s] || lab[s]) continue;
    const n = comps.length, o = { a: 0, x0: gw, x1: 0, y0: gh, y1: 0 }; lab[s] = n; st.push(s);
    while (st.length) {
      const p = st.pop(), py = p / gw | 0, px = p % gw; o.a += cnt[p];
      if (px < o.x0) o.x0 = px; if (px > o.x1) o.x1 = px; if (py < o.y0) o.y0 = py; if (py > o.y1) o.y1 = py;
      for (let yy = py - 1; yy <= py + 1; yy++) for (let xx = px - 1; xx <= px + 1; xx++) {
        if (yy < 0 || xx < 0 || yy >= gh || xx >= gw) continue;
        const q = yy * gw + xx; if (dl[q] && !lab[q]) { lab[q] = n; st.push(q); }
      }
    }
    comps.push(o);
  }
  if (comps.length < 2) return null;
  let big = 1; comps.forEach((o, i) => { if (o && o.a > comps[big].a) big = i; });
  let tot = 0;
  const keep = comps.map((o, i) => {
    if (!o) return false;
    const w = o.x1 - o.x0 + 1, h = o.y1 - o.y0 + 1;
    const caption = h < gh * .07 || w / h > 5;           // lines of lettering
    const k = i === big || (o.a >= comps[big].a * .2 && !caption);
    if (k) tot += o.a; return k;
  });
  if (tot / (W * H) > .5) return null;                   // a full painted scene: leave it whole
  // Edge of the figure: a narrow band for smooth outlines, nothing softer.
  const al = new Float32Array(W * H);
  for (let k = 0; k < W * H; k++) {
    const y = k / W | 0, X = k % W;
    if (keep[lab[(y / S | 0) * gw + (X / S | 0)]]) al[k] = Math.max(0, Math.min(1, (dist[k] - 24) / 16));
  }
  // Paper reachable from the page edge is removed; pale areas enclosed by the figure stay solid.
  const outside = new Uint8Array(W * H), q = [];
  const push = k => { if (!outside[k] && al[k] < .5) { outside[k] = 1; q.push(k); } };
  for (let X = 0; X < W; X++) { push(X); push((H - 1) * W + X); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (q.length) { const k = q.pop(), y = k / W | 0, X = k % W; if (X > 0) push(k - 1); if (X < W - 1) push(k + 1); if (y > 0) push(k - W); if (y < H - 1) push(k + W); }
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) {
    const k = y * W + X, a = outside[k] ? al[k] : 1;
    if (a > .05) { if (X < x0) x0 = X; if (X > x1) x1 = X; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    d[k * 4 + 3] = a * 255;
  }
  if (x1 <= x0 || y1 <= y0) return null;
  x.putImageData(im, 0, 0);
  const out = document.createElement("canvas"); out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
  out.getContext("2d").drawImage(c, -x0, -y0);
  out.cover = tot / (W * H);
  return out;
}

function loadImage(src, cors) {
  return new Promise((res, rej) => {
    const i = new Image(); if (cors) i.crossOrigin = "anonymous";
    i.onload = () => res(i); i.onerror = () => rej(new Error("image")); i.src = src;
  });
}

/* Build the drawable figure for one species: { el, aspect, plate }.
   Tries each plate in turn and keeps the first that lifts cleanly off plain paper;
   failing that, the one with the least background. */
const CLEAN = .36;
async function makeFigure(sp, plates) {
  let best = null, whole = null;
  for (const plate of plates) {
    if (plate.photo) continue;
    if (plate.ready) {   // already a transparent cut-out: use it exactly as it is
      try { const img = await loadImage(plate.src, false); img.alt = ""; return { el: img, aspect: img.naturalWidth / img.naturalHeight, plate }; } catch (e) { continue; }
    }
    let img;
    try { img = await loadImage(plate.src, true); }
    catch (e) { try { img = await loadImage(plate.src, false); } catch (e2) { continue; } }
    let cut = null; try { cut = cutout(img); } catch (e) {}
    if (cut && (!best || cut.cover < best.cut.cover)) best = { cut, plate };
    if (!cut && !whole) whole = { img, plate };
    if (cut && cut.cover <= CLEAN) break;
  }
  if (best) return { el: best.cut, aspect: best.cut.width / best.cut.height, plate: best.plate };
  if (whole) { whole.img.alt = ""; return { el: whole.img, aspect: whole.img.naturalWidth / whole.img.naturalHeight, plate: whole.plate }; }
  const ph = plates.find(p => p.photo), photo = (ph && ph.src) || sp.thumb;
  if (photo) {
    try { const img = await loadImage(photo, false); img.alt = ""; return { el: img, aspect: img.naturalWidth / img.naturalHeight, plate: ph || { src: photo, large: photo, photo: true, credit: "Photograph supplied by BirdNET-Go." } }; } catch (e) {}
  }
  const el = document.createElement("span"); el.textContent = sp.common; return { el, aspect: 1.7, blank: true, plate: null };
}

/* ===================================================================
   Arranging the plate
   =================================================================== */
const plateEl = $("#plate"), statusEl = $("#status"), tip = $("#tip");
const figures = new Map();   // sci -> { button, aspect, plate, plateKey }
let species = [], firstReveal = true;

/* In one-screen mode, give the plate whatever height is left once everything else is measured. */
let fit = store.get("fit", true);
function fitPlate() {
  document.body.classList.toggle("fit", fit);
  if (!fit) { plateEl.style.height = ""; return; }
  plateEl.style.height = Math.max(140, innerHeight - measureOthers()) + "px";
}
function measureOthers() {
  let h = 0; for (const el of [document.querySelector("header"), $("#caption"), document.querySelector("main section")]) {
    const cs = getComputedStyle(el); if (cs.display !== "none") h += el.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
  }
  const pcs = getComputedStyle(plateEl); return Math.ceil(h + parseFloat(pcs.marginTop) + parseFloat(pcs.marginBottom) + 2);
}

function layout() {
  fitPlate();
  const CW = plateEl.clientWidth, CH = plateEl.clientHeight;
  const shown = species.slice(0, CONFIG.maxOnPlate).filter(s => figures.has(s.sci));
  if (!shown.length || !CW || !CH) return;
  const max = shown[0].count, ar = CW / CH;
  const items = shown.map(s => {
    const f = figures.get(s.sci), scale = Math.max(.2, Math.pow(s.count / max, .45)), area = f.blank ? .03 : scale * scale;
    return { s, f, w: Math.sqrt(area * f.aspect), h: Math.sqrt(area / f.aspect) };
  }).sort((a, b) => b.w * b.h - a.w * a.h);
  const placed = [], gap = .035, step = .03;   // gap: clear space kept between neighbouring birds
  for (const it of items) {
    for (let i = 0; i < 20000; i++) {
      const r = step * Math.sqrt(i), a = i * 2.399963;
      const cx = r * Math.cos(a) * Math.sqrt(ar) * 1.08, cy = r * Math.sin(a) / Math.sqrt(ar);
      let ok = true;
      for (const p of placed) {
        if (Math.abs(cx - p.cx) < (it.w + p.w) / 2 + gap && Math.abs(cy - p.cy) < (it.h + p.h) / 2 + gap) { ok = false; break; }
      }
      if (ok) { it.cx = cx; it.cy = cy; break; }
    }
    if (it.cx == null) { it.cx = 0; it.cy = 0; }
    placed.push(it);
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of placed) { x0 = Math.min(x0, p.cx - p.w / 2); x1 = Math.max(x1, p.cx + p.w / 2); y0 = Math.min(y0, p.cy - p.h / 2); y1 = Math.max(y1, p.cy + p.h / 2); }
  const k = Math.min(CW / (x1 - x0), CH / (y1 - y0)), ox = (CW - (x1 - x0) * k) / 2, oy = (CH - (y1 - y0) * k) / 2;
  const onPlate = new Set();
  placed.forEach((p, i) => {
    const b = p.f.button; onPlate.add(b);
    b.style.width = p.w * k + "px"; b.style.height = p.h * k + "px";
    b.style.transform = "translate(" + (ox + (p.cx - p.w / 2 - x0) * k) + "px," + (oy + (p.cy - p.h / 2 - y0) * k) + "px)";
    b.style.zIndex = p.f.blank ? "4" : String(1 + Math.round((p.cy - y0) * 3));
    if (!b.isConnected) plateEl.append(b);
    if (!b.classList.contains("in")) { b.style.transitionDelay = (firstReveal ? i * 28 : 0) + "ms"; requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add("in"))); setTimeout(() => b.style.transitionDelay = "", 2600); }
  });
  for (const [, f] of figures) if (!onPlate.has(f.button)) { f.button.classList.remove("in"); f.button.remove(); }
  firstReveal = false;
}

function showTip(sp, x, y) {
  tip.innerHTML = "<b>" + esc(sp.common) + "</b><i>" + esc(sp.sci) + "</i><span>" + calls(sp.count) + "</span>";
  tip.classList.add("on");
  const w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, x - w / 2)) + "px";
  tip.style.top = (y - h - 18 < 8 ? y + 22 : y - h - 18) + "px";
}

async function ensureFigure(sp, force) {
  const have = figures.get(sp.sci);
  if (have && !force) { have.sp = sp; have.button.setAttribute("aria-label", sp.common + ", " + calls(sp.count)); return; }
  const fig = await makeFigure(sp, await choosePlates(sp)), plate = fig.plate;
  const b = have ? have.button : document.createElement("button");
  b.className = "bird" + (have ? " in" : "") + (plate && plate.ready ? " ink" : ""); b.replaceChildren(fig.el);
  b.setAttribute("aria-label", sp.common + ", " + calls(sp.count));
  const rec = { button: b, aspect: fig.aspect, plate, sp, blank: !!fig.blank };
  if (!have) {
    const cur = () => figures.get(sp.sci).sp;
    b.addEventListener("pointermove", e => showTip(cur(), e.clientX, e.clientY));
    b.addEventListener("pointerleave", () => tip.classList.remove("on"));
    b.addEventListener("focus", () => { const r = b.getBoundingClientRect(); showTip(cur(), r.left + r.width / 2, r.top); });
    b.addEventListener("blur", () => tip.classList.remove("on"));
    b.addEventListener("click", () => openDetail(cur()));
  }
  figures.set(sp.sci, rec);
}

async function pool(list, n, fn) {
  let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) { const it = list[i++]; try { await fn(it); } catch (e) {} } }));
}

/* ===================================================================
   Page furniture
   =================================================================== */
function renderHeading() {
  const now = new Date(), total = species.reduce((a, s) => a + s.count, 0);
  const span = { today: longDate(now), week: "The seven days to " + longDate(now), month: "The thirty days to " + longDate(now), all: "Every day on record, to " + longDate(now) }[period];
  $("#sub").innerHTML = esc(span) + "." + (species.length ? "<br>" + species.length + " species from " + calls(total) + "." : "");
  const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
  $("#pl").textContent = "Plate " + roman(doy);
  $("#pl").title = "Day " + doy + " of " + now.getFullYear();
  document.querySelectorAll("nav button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.p === period)));
}

function renderIndex() {
  $("#index").replaceChildren(...species.map(sp => {
    const li = document.createElement("li"), b = document.createElement("button"), f = figures.get(sp.sci);
    b.innerHTML = '<span class="c">' + esc(sp.common) + (f && f.blank ? ' <span class="x">(no plate)</span>' : "") + '</span><span class="n">' + sp.count.toLocaleString() + "</span>";
    b.title = sp.sci; b.addEventListener("click", () => openDetail(sp)); li.append(b); return li;
  }));
}

let busy = false, lastSig = "";
async function refresh(initial) {
  if (busy) return; busy = true;
  try {
    let rows;
    try { rows = await fetchSpecies(); demo = demoAsked; if (!demo) everLive = true; $("#notice").textContent = demo ? "This is a sample plate, not your station." : ""; }
    catch (e) {
      if (!initial && species.length && !demo) { busy = false; return; }   // keep what we have through a hiccup
      demo = true; rows = sample();
      const msg = e instanceof TypeError ? "BirdNET-Go could not be reached" + (server ? " at " + server : " through this page's address") + "." : e.message;
      $("#notice").innerHTML = esc(msg) + " Showing a sample plate instead. <button id='fix'>Open station settings</button>";
      $("#fix").addEventListener("click", () => openSettings());
    }
    const sig = period + "|" + rows.map(s => s.sci + ":" + s.count).join(",");
    species = rows;
    if (sig === lastSig) { busy = false; return; }
    lastSig = sig;
    renderHeading();
    if (!rows.length) {
      for (const [, f] of figures) f.button.remove();
      statusEl.innerHTML = period === "today" ? "Nothing heard yet today. The plate fills in as birds call. <button id='wk'>Look at the last seven days</button>" : "No detections in this period.";
      const wk = $("#wk"); if (wk) wk.addEventListener("click", () => setPeriod("week"));
      renderIndex(); busy = false; return;
    }
    const top = rows.slice(0, CONFIG.maxOnPlate), missing = top.filter(s => !figures.has(s.sci));
    let done = 0;
    if (missing.length > 3) statusEl.textContent = "Preparing the plate…";
    await pool(top, 6, async sp => { await ensureFigure(sp); if (missing.length > 3 && !figures.get(sp.sci).button.isConnected) statusEl.textContent = "Preparing the plate… " + (++done) + " of " + missing.length; });
    statusEl.textContent = "";
    renderIndex(); layout();
  } finally { busy = false; }
}

function setPeriod(p) {
  period = p; store.set("period", p); lastSig = "";
  for (const [, f] of figures) { f.button.classList.remove("in"); }
  renderHeading(); refresh(true);
}
document.querySelectorAll("nav button").forEach(b => b.addEventListener("click", () => setPeriod(b.dataset.p)));

/* ---------- detail card ---------- */
const detail = $("#detail");
async function openDetail(sp) {
  tip.classList.remove("on");
  const f = figures.get(sp.sci), plate = f ? f.plate : (await choosePlates(sp))[0];
  $("#dName").textContent = sp.common; $("#dSci").textContent = sp.sci;
  const img = $("#dImg");
  img.style.display = plate ? "" : "none";
  if (plate) { img.src = plate.large || plate.src; img.alt = "Plate of " + sp.common; img.classList.toggle("ink", !!plate.ready); }
  const pageHref = plate ? safeHref(plate.page) : "";
  $("#dCredit").innerHTML = plate ? esc(plate.credit || "") + (pageHref ? ' <a href="' + esc(pageHref) + '" target="_blank" rel="noopener noreferrer">View the source</a>' : "") : "No plate has been found for this species.";
  renderFacts(sp, null);
  $("#dBlurb").textContent = ""; loadBlurb(sp);
  renderBars($("#hours"), sp.hourly, (n, h) => h + ":00, " + calls(n)); $("#dHoursWrap").hidden = !sp.hourly;
  $("#dHoursLabel").textContent = period === "today" ? "Calls by hour, today" : "Calls by hour of the day, over this period";
  $("#dTrendWrap").hidden = true; $("#dRecWrap").hidden = true; stopAudio();
  loadExtras(sp);
  $("#alts").replaceChildren(); $("#altLabel").style.display = "none";
  if (!detail.open) detail.showModal();
  const alts = [...frPlates(sp.sci), ...kbPlates(sp.sci), ...(await commonsPlates(sp.sci))];
  if ($("#dSci").textContent !== sp.sci || alts.length < 2 && !(alts.length === 1 && (!plate || plate.src !== alts[0].src))) return;
  $("#altLabel").style.display = "";
  $("#alts").replaceChildren(...alts.map(a => {
    const b = document.createElement("button"); b.title = a.file || ""; b.setAttribute("aria-pressed", String(!!plate && plate.src === a.src));
    b.innerHTML = '<img loading="lazy" alt="' + esc(a.file || "Another plate") + '" src="' + esc(a.src) + '">';
    b.addEventListener("click", async () => {
      store.set("choice." + sp.sci, { src: a.src, large: a.large, page: a.page, credit: a.credit, file: a.file, ready: !!a.ready });
      await ensureFigure(sp, true); layout(); renderIndex(); openDetail(sp);
    });
    return b;
  }));
}

/* ---------- further particulars for the card, asked of BirdNET-Go when it opens ---------- */
const pct = c => Math.round(c * (c <= 1 ? 100 : 1)) + " in 100";
const RARITY = { very_common: "Very common here at this season", common: "Common here at this season", uncommon: "Uncommon here at this season", rare: "Rare here at this season", very_rare: "Very rare here at this season" };

function renderFacts(sp, info) {
  const f = [["Heard", '<dd class="big">' + calls(sp.count) + "</dd>"]];
  const add = (k, v) => { if (v) f.push([k, "<dd>" + esc(v) + "</dd>"]); };
  add("First heard", when(sp.first)); add("Last heard", when(sp.last));
  if (sp.maxConf) add("Surest identification", pct(sp.maxConf));
  if (sp.avgConf) add("Usual confidence", pct(sp.avgConf));
  if (sp.daysKnown) add("Known at this station", sp.daysKnown === 1 ? "since yesterday" : "for " + sp.daysKnown.toLocaleString() + " days");
  if (info) {
    const t = info.taxonomy || {}, fam = t.family_common || t.familyCommon || "", famSci = t.family || "";
    add("Family", fam && famSci ? fam + " (" + famSci + ")" : fam || famSci);
    add("Order", t.order || "");
    add("Standing", RARITY[info.rarity && info.rarity.status] || "");
  }
  $("#dFacts").innerHTML = f.map(([k, v]) => "<dt>" + k + "</dt>" + v).join("");
  const notes = [];
  if (sp.isNew) notes.push("New to this station.");
  else if (sp.newYear) notes.push("The first of the year.");
  else if (sp.newSeason) notes.push("The first of the " + (sp.season || "season") + ".");
  $("#dNotes").textContent = notes.join(" ");
}

function renderBars(el, values, title) {
  if (!values) { el.replaceChildren(); return; }
  values = values.map(n => Math.max(0, Number(n) || 0));
  const mx = Math.max(1, ...values);
  // Built as elements, not HTML text, so the page needs no inline styles under its Content-Security-Policy.
  el.replaceChildren(...values.map((n, i) => { const bar = document.createElement("i"); bar.style.height = (n / mx * 100) + "%"; bar.title = title(n, i); return bar; }));
}

/* A line or two about the bird, from the opening of its Wikipedia article (CC BY-SA). Remembered for 90 days.
   The first sentence is mostly alternative names, so the second and third are used when the article has them. */
function blurbFrom(t) {
  t = String(t || "").replace(/\s+/g, " ").trim();
  const parts = (t.match(/.+?[a-z\)\]"’”]\.(?=\s+[A-Z]|$)/g) || [t]).map(x => x.trim());
  if (parts.length < 2) return parts[0] || "";
  const two = parts[1] + (parts[2] ? " " + parts[2] : "");
  return two.length <= 340 ? two : parts[1];
}
async function loadBlurb(sp) {
  let b = store.get("wiki2." + sp.sci);
  if (!b || Date.now() - b.t > 90 * 864e5) {
    b = { t: Date.now(), text: "", url: "" };
    try {
      const r = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(sp.sci.replace(/ /g, "_")) + "?redirect=true");
      if (r.ok) { const j = await r.json(); if (j.type !== "disambiguation" && j.extract) { b.text = blurbFrom(j.extract); b.url = (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) || ""; } }
      if (r.ok || r.status === 404) store.set("wiki2." + sp.sci, b);
    } catch (e) { return; }
  }
  if (!b.text || !detail.open || $("#dSci").textContent !== sp.sci) return;
  const wikiHref = safeHref(b.url);
  $("#dBlurb").innerHTML = esc(b.text) + (wikiHref ? ' <a href="' + esc(wikiHref) + '" target="_blank" rel="noopener noreferrer">Wikipedia</a>' : "");
}

const player = $("#player");
function stopAudio() { player.pause(); document.querySelectorAll("#recs button").forEach(b => b.textContent = "Play"); }
player.addEventListener("ended", stopAudio);

async function getJSON(path) { const r = await apiFetch(path); if (!r.ok) throw new Error(r.status); return r.json(); }

async function loadExtras(sp) {
  const still = () => detail.open && $("#dSci").textContent === sp.sci;
  const q = encodeURIComponent(sp.sci), today = ymd(new Date()), from = ymd(daysAgo(29));
  const dayLabel = d => new Date(d + "T12:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });

  if (demo) {   // invented particulars for the sample plate
    let seed = sp.sci.length * 131 + sp.count; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    showTrend(Array.from({ length: 30 }, (_, i) => ({ date: ymd(daysAgo(29 - i)), count: Math.round(sp.count / (period === "today" ? 1 : 6) * (.3 + rnd() * 1.1)) })));
    showRecs([0, 1, 2].map(i => ({ date: today, time: String(7 + i * 2).padStart(2, "0") + ":" + String(Math.floor(rnd() * 60)).padStart(2, "0") + ":00", confidence: .6 + rnd() * .38,
      weather: { description: ["light rain", "overcast", "clear"][i], temperature: 7 + i * 2 } })), false);
    return;
  }

  // hour-of-day pattern for periods longer than a day
  if (!sp.hourly) getJSON("/api/v2/analytics/time/distribution/hourly?species=" + q + "&start_date=" + (period === "all" ? "2000-01-01" : ymd(daysAgo(period === "week" ? 6 : 29))) + "&end_date=" + today).then(rows => {
    if (!still() || !Array.isArray(rows)) return;
    const h = new Array(24).fill(0); rows.forEach(r => { if (r.hour >= 0 && r.hour < 24) h[r.hour] = r.count; });
    renderBars($("#hours"), h, (n, i) => i + ":00, " + calls(n)); $("#dHoursWrap").hidden = false;
  }).catch(() => {});

  // calls per day, last thirty days
  getJSON("/api/v2/analytics/time/daily?species=" + q + "&start_date=" + from + "&end_date=" + today).then(j => {
    if (!still()) return;
    const got = {}; ((j && j.data) || []).forEach(d => got[String(d.date).slice(0, 10)] = d.count);
    showTrend(Array.from({ length: 30 }, (_, i) => { const d = ymd(daysAgo(29 - i)); return { date: d, count: got[d] || 0 }; }));
  }).catch(() => {});

  // family, order and how usual the bird is here
  getJSON("/api/v2/species?scientific_name=" + q).then(info => { if (still() && info) renderFacts(sp, info); }).catch(() => {});

  // the latest recordings, with weather at the time
  getJSON("/api/v2/detections?species=" + q + "&numResults=4&includeWeather=true").then(j => {
    if (!still()) return;
    const rows = Array.isArray(j) ? j : (j && j.data) || [];
    if (rows.length) showRecs(rows.slice(0, 4), true);
  }).catch(() => {});

  function showTrend(days) {
    renderBars($("#trend"), days.map(d => d.count), (n, i) => dayLabel(days[i].date) + ", " + calls(n));
    $("#trendFrom").textContent = dayLabel(days[0].date); $("#dTrendWrap").hidden = false;
  }
  function showRecs(rows, live) {
    const spec = $("#spec"); spec.hidden = true;
    if (live && rows[0].id != null) { spec.onload = () => spec.hidden = false; spec.onerror = () => spec.hidden = true; spec.src = server + "/api/v2/spectrogram/" + encodeURIComponent(rows[0].id) + "?size=md"; }
    $("#recs").replaceChildren(...rows.map(r => {
      const li = document.createElement("li"), w = r.weather || {};
      const wx = [w.description || w.weatherMain || "", w.temperature || w.temperature === 0 ? Math.round(w.temperature) + "°" : ""].filter(Boolean).join(", ");
      li.innerHTML = "<span>" + esc(dayLabel(r.date) + ", " + String(r.time || "").slice(0, 5)) + "</span><span>" + pct(r.confidence || 0) + '</span><span class="w">' + esc(wx) + "</span>";
      if (live && r.id != null && !r.spectrogramOnly) {
        const b = document.createElement("button"); b.textContent = "Play"; b.setAttribute("aria-label", "Play the recording from " + dayLabel(r.date) + " at " + String(r.time || "").slice(0, 5));
        b.addEventListener("click", () => {
          const playing = b.textContent === "Stop"; stopAudio(); if (playing) return;
          player.src = server + "/api/v2/audio/" + encodeURIComponent(r.id); player.play().then(() => b.textContent = "Stop").catch(() => { b.textContent = "Play"; });
        });
        li.prepend(b);
      }
      return li;
    }));
    $("#dRecWrap").hidden = false;
  }
}
detail.addEventListener("close", stopAudio);

/* ---------- settings ---------- */
const settings = $("#settings");
function openSettings() { $("#srv").value = store.get("server", "") || CONFIG.server; $("#fitOpt").checked = fit; settings.showModal(); }
$("#fitOpt").addEventListener("change", e => { fit = e.target.checked; store.set("fit", fit); layout(); });
$("#openSettings").addEventListener("click", openSettings);
$("#setForm").addEventListener("submit", () => {
  let v = $("#srv").value.trim().replace(/\/+$/, "");
  if (v && !/^https?:\/\//i.test(v)) v = "http://" + v;
  if (cleanServer(v)) store.set("server", cleanServer(v)); else store.del("server");
  location.href = location.pathname;
});
$("#showSample").addEventListener("click", () => { location.href = location.pathname + "?demo"; });
document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));
document.querySelectorAll("dialog").forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));

let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(layout, 150); });
renderHeading();
loadFugleramme().then(() => refresh(true));
// Keeps trying while BirdNET-Go is unreachable too, so a screen left on (a TV, say) recovers by itself.
setInterval(() => { if (!document.hidden && !demoAsked) refresh(false); }, CONFIG.refreshSeconds * 1000);
