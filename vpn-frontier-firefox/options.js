// VPN Frontier v6.1.0 — Options Page
var C=document.getElementById("content");
var BD={"ru":".ru","su":".su","xn--p1ai":".рф","xn--p1acf":".рус","xn--80adxhks":".москва","xn--80aswg":".сайт","xn--d1acj3b":".дети","xn--80asehdb":".онлайн","xn--c1avg":".орг","xn--e1a4c":".ею"};

function msg(a,d){return new Promise(function(r){chrome.runtime.sendMessage(Object.assign({action:a},d||{}),r)})}
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}
function toast(text){var el=document.getElementById("toast");el.textContent=text;el.classList.add("show");setTimeout(function(){el.classList.remove("show")},2000)}

document.getElementById("lang-ru").addEventListener("click",function(){setLang("ru");chrome.runtime.sendMessage({action:"setLang",lang:"ru"});render()});
document.getElementById("lang-en").addEventListener("click",function(){setLang("en");chrome.runtime.sendMessage({action:"setLang",lang:"en"});render()});

async function render(){
  document.getElementById("lang-ru").className="lang-btn"+(currentLang==="ru"?" active":"");
  document.getElementById("lang-en").className="lang-btn"+(currentLang==="en"?" active":"");
  document.getElementById("page-title").textContent=t("o.title").replace("VPN Frontier — ","");

  var st=await msg("getState");if(!st){C.innerHTML="—";return}
  var stats=await msg("getStats");
  var customTlds=st.customTlds||[],whitelist=st.whitelist||[],providers=st.providers||[],allProv=st.allProviders||[];
  var checkFreq=st.checkFreq||10,checkConds=st.checkConds||["nav","timer","startup"],soundEnabled=st.soundEnabled!==false;

  // ── General Settings ──
  var freqOpts=[[5,"p.freq_5"],[10,"p.freq_10"],[15,"p.freq_15"],[30,"p.freq_30"],[60,"p.freq_60"]];
  var freqSel='<select class="sel" id="freq-sel">'+freqOpts.map(function(f){return'<option value="'+f[0]+'"'+(checkFreq===f[0]?' selected':'')+'>'+t(f[1])+'</option>'}).join("")+'</select>';

  var condItems=[["nav","p.cond_nav"],["tab","p.cond_tab"],["timer","p.cond_timer"],["startup","p.cond_startup"],["wake","p.cond_wake"],["focus","p.cond_focus"]];
  var condHtml=condItems.map(function(c){
    var on=checkConds.indexOf(c[0])!==-1;
    return'<div class="s-row"><span class="s-label">'+t(c[1])+'</span><button class="toggle'+(on?" on":"")+'" data-cond="'+c[0]+'">'+(on?"ON":"OFF")+'</button></div>';
  }).join("");

  // ── Providers ──
  var provHtml=allProv.map(function(p){
    var on=providers.indexOf(p.id)!==-1;
    return'<div class="prov-card"><span class="prov-name">'+p.name+'</span><button class="toggle'+(on?" on":"")+'" data-prov="'+p.id+'">'+(on?t("p.prov_active"):t("p.prov_inactive"))+'</button></div>';
  }).join("");

  // ── Zones ──
  var builtinTags=Object.keys(BD).map(function(k){return'<span class="tag">'+BD[k]+'</span>'}).join("");
  var customTags=customTlds.map(function(tld){return'<span class="tag custom">.'+esc(tld)+' <i class="x" data-tld="'+esc(tld)+'">✕</i></span>'}).join("");

  // ── Whitelist ──
  var wlTags=whitelist.length?whitelist.map(function(d){return'<span class="tag">'+esc(d)+' <i class="x" data-wl="'+esc(d)+'">✕</i></span>'}).join(""):'<span style="color:var(--txm)">'+t("p.empty")+'</span>';

  // ── Stats ──
  var daily=stats.daily||[];var total=stats.total||0;var domains=stats.domains||{};
  var todayCount=daily.length?daily[daily.length-1].count:0;
  var weekCount=daily.reduce(function(s,d){return s+d.count},0);
  var maxDay=Math.max.apply(null,daily.map(function(d){return d.count}))||1;

  var barsHtml=daily.map(function(d){
    var h=Math.max(2,Math.round(d.count/maxDay*100));
    var label=d.date.slice(5);
    return'<div class="chart-bar-wrap"><div class="chart-bar-count">'+d.count+'</div><div class="chart-bar" style="height:'+h+'%"></div><div class="chart-bar-label">'+label+'</div></div>';
  }).join("");

  var sorted=Object.entries(domains).sort(function(a,b){return b[1]-a[1]}).slice(0,10);
  var topHtml=sorted.length?sorted.map(function(e){return'<div class="top-domain"><span class="top-domain-name">'+esc(e[0])+'</span><span class="top-domain-count">'+e[1]+'</span></div>'}).join(""):'<div style="color:var(--txm);text-align:center;padding:12px">'+t("o.stats_no_data")+'</div>';

  C.innerHTML=
    // General
    '<div class="section"><div class="section-head">'+t("o.sec_general")+'</div><div class="section-body">'+
      '<div class="s-row"><span class="s-label">'+t("p.freq_label")+'</span>'+freqSel+'</div>'+
      '<div class="s-row"><span class="s-label">'+t("p.sound_label")+'</span><button class="toggle'+(soundEnabled?" on":"")+'" id="sound-toggle">'+(soundEnabled?t("p.sound_on"):t("p.sound_off"))+'</button></div>'+
      '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--brd)"><div style="font-size:13px;font-weight:700;color:var(--txd);margin-bottom:8px">'+t("p.cond_label")+'</div>'+condHtml+'</div>'+
    '</div></div>'+

    // Stats
    '<div class="section"><div class="section-head">'+t("o.sec_stats")+'<button class="action-btn" id="reset-stats">'+t("o.stats_reset")+'</button></div><div class="section-body">'+
      '<div class="stat-cards"><div class="stat-card"><div class="stat-num">'+todayCount+'</div><div class="stat-label">'+t("o.stats_today")+'</div></div><div class="stat-card"><div class="stat-num">'+weekCount+'</div><div class="stat-label">'+t("o.stats_week")+'</div></div><div class="stat-card"><div class="stat-num">'+total+'</div><div class="stat-label">'+t("o.stats_total")+'</div></div></div>'+
      '<div class="chart"><div class="chart-title">'+t("o.stats_chart")+'</div><div class="chart-bars">'+barsHtml+'</div></div>'+
      '<div class="chart-title">'+t("o.stats_top")+'</div>'+topHtml+
    '</div></div>'+

    // Providers
    '<div class="section"><div class="section-head">'+t("o.sec_providers")+' ('+providers.length+'/'+allProv.length+')</div><div class="section-body"><div class="prov-grid">'+provHtml+'</div></div></div>'+

    // Zones
    '<div class="section"><div class="section-head">'+t("o.sec_zones")+' ('+(Object.keys(BD).length+customTlds.length)+')</div><div class="section-body"><div class="tags">'+builtinTags+customTags+'</div><div class="add-row"><input class="add-input" id="tld-input" placeholder="'+t("p.ph_tld")+'"><button class="add-btn" id="tld-add">'+t("p.add")+'</button></div></div></div>'+

    // Whitelist
    '<div class="section"><div class="section-head">'+t("o.sec_wl")+' ('+whitelist.length+')</div><div class="section-body"><div class="tags">'+wlTags+'</div><div class="add-row"><input class="add-input" id="wl-input" placeholder="'+t("p.ph_wl")+'"><button class="add-btn" id="wl-add">'+t("p.add")+'</button></div></div></div>'+

    // Import/Export
    '<div class="section"><div class="section-head">'+t("o.sec_ie")+'</div><div class="section-body"><div class="ie-btns"><button class="ie-btn" id="ie-export">'+t("p.export")+'</button><button class="ie-btn" id="ie-import">'+t("p.import")+'</button></div><textarea class="ie-area" id="ie-data" placeholder="'+t("p.ie_ph")+'"></textarea><div class="ie-msg" id="ie-msg"></div></div></div>'+

    // About
    '<div class="section"><div class="section-head">'+t("o.sec_about")+'</div><div class="section-body"><p class="about-text">'+t("o.about_text")+'</p></div></div>'+

    // Privacy
    '<div class="section"><div class="section-head">'+t("o.sec_privacy")+'</div><div class="section-body"><p class="about-text">'+t("o.privacy_text")+'</p></div></div>';

  // ── Events ──
  document.getElementById("freq-sel").addEventListener("change",function(){msg("setCheckFreq",{freq:parseInt(this.value)});toast(t("o.saved"))});
  document.getElementById("sound-toggle").addEventListener("click",function(){
    soundEnabled=!soundEnabled;msg("setSoundEnabled",{enabled:soundEnabled});
    this.className="toggle"+(soundEnabled?" on":"");this.textContent=soundEnabled?t("p.sound_on"):t("p.sound_off");toast(t("o.saved"));
  });

  document.querySelectorAll("[data-cond]").forEach(function(el){el.addEventListener("click",function(){
    var id=el.dataset.cond;var idx=checkConds.indexOf(id);
    if(idx!==-1)checkConds.splice(idx,1);else checkConds.push(id);
    if(!checkConds.length)checkConds.push(id);
    msg("setCheckConds",{conds:checkConds}).then(function(){toast(t("o.saved"));render()});
  })});

  document.querySelectorAll("[data-prov]").forEach(function(el){el.addEventListener("click",function(){
    var id=el.dataset.prov;var idx=providers.indexOf(id);
    if(idx!==-1)providers.splice(idx,1);else providers.push(id);
    if(!providers.length)providers.push(id);
    msg("setProviders",{providers:providers}).then(function(){toast(t("o.saved"));render()});
  })});

  document.getElementById("tld-add").addEventListener("click",function(){var v=document.getElementById("tld-input").value.trim();if(v)msg("addCustomTld",{tld:v}).then(render)});
  document.getElementById("tld-input").addEventListener("keydown",function(e){if(e.key==="Enter")document.getElementById("tld-add").click()});
  document.querySelectorAll("[data-tld]").forEach(function(el){el.addEventListener("click",function(){msg("removeCustomTld",{tld:el.dataset.tld}).then(render)})});

  document.getElementById("wl-add").addEventListener("click",function(){var v=document.getElementById("wl-input").value.trim();if(v)msg("addWhitelist",{domain:v}).then(render)});
  document.getElementById("wl-input").addEventListener("keydown",function(e){if(e.key==="Enter")document.getElementById("wl-add").click()});
  document.querySelectorAll("[data-wl]").forEach(function(el){el.addEventListener("click",function(){msg("removeWhitelist",{domain:el.dataset.wl}).then(render)})});

  document.getElementById("reset-stats").addEventListener("click",function(){msg("resetStats").then(function(){toast(t("o.saved"));render()})});

  document.getElementById("ie-export").addEventListener("click",async function(){var r=await msg("exportSettings");document.getElementById("ie-data").value=r.data;try{await navigator.clipboard.writeText(r.data);document.getElementById("ie-msg").textContent=t("p.ie_copied")}catch(e){document.getElementById("ie-msg").textContent=t("p.ie_manual")}});
  document.getElementById("ie-import").addEventListener("click",async function(){var json=document.getElementById("ie-data").value.trim();if(!json){document.getElementById("ie-msg").textContent=t("p.ie_empty");return}var r=await msg("importSettings",{json:json});document.getElementById("ie-msg").textContent=r.ok?t("p.ie_ok"):t("p.ie_err")+(r.error||"");if(r.ok)setTimeout(render,500)});
}

loadLang(function(){render()});
