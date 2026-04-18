// VPN Frontier v5 — Popup
var C=document.getElementById("c");
var BD={"ru":".ru","su":".su","xn--p1ai":".рф","xn--p1acf":".рус","xn--80adxhks":".москва","xn--80aswg":".сайт","xn--d1acj3b":".дети","xn--80asehdb":".онлайн","xn--c1avg":".орг","xn--e1a4c":".ею"};

function ago(ts){if(!ts)return"—";var s=Math.floor((Date.now()-ts)/1000);if(s<60)return t("p.ago_s",{n:s});if(s<3600)return t("p.ago_m",{n:Math.floor(s/60)});return t("p.ago_h",{n:Math.floor(s/3600)})}
function fmtTime(ts){var d=new Date(ts);return d.toLocaleDateString()+" "+d.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})}
function msg(a,d){return new Promise(function(r){chrome.runtime.sendMessage(Object.assign({action:a},d||{}),r)})}
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}

document.getElementById("lang-ru").addEventListener("click",function(){setLang("ru");chrome.runtime.sendMessage({action:"setLang",lang:"ru"});render()});
document.getElementById("lang-en").addEventListener("click",function(){setLang("en");chrome.runtime.sendMessage({action:"setLang",lang:"en"});render()});
function updLang(){document.getElementById("lang-ru").className="lang-btn"+(currentLang==="ru"?" active":"");document.getElementById("lang-en").className="lang-btn"+(currentLang==="en"?" active":"")}

async function render(){
  updLang();
  var st=await msg("getState");if(!st){C.innerHTML='<div class="ld">—</div>';return}
  var blocking=st.blocking,paused=st.paused,aType=st.analysisType,customTlds=st.customTlds||[],whitelist=st.whitelist||[];
  var providers=st.providers||[],allProv=st.allProviders||[],checkFreq=st.checkFreq||10,checkConds=st.checkConds||["nav","timer","startup"];

  var bT,bC;
  if(paused){bT=t("p.badge_pause");bC="b-pause"}
  else if(aType==="ru_vpn"){bT=t("p.badge_vpn");bC="b-vpn"}
  else if(blocking){bT=t("p.badge_block");bC="b-block"}
  else if(st.verified){bT=t("p.badge_open");bC="b-open"}
  else{bT=t("p.badge_check");bC="b-unk"}

  var pauseBtn=paused?'<button class="btn btn-res" id="bp">'+t("p.btn_resume")+'</button>':'<button class="btn" id="bp">'+t("p.btn_pause")+'</button>';
  var vpn=aType==="ru_vpn"?'<div class="vpn-w on">'+t("p.vpn_warn",{reason:st.analysisReason||""})+'</div>':"";

  var builtinTags=Object.keys(BD).map(function(k){return'<span class="tag">'+BD[k]+'</span>'}).join("");
  var customTags=customTlds.map(function(tld){return'<span class="tag custom">.'+esc(tld)+' <i class="x" data-tld="'+esc(tld)+'">✕</i></span>'}).join("");
  var wlTags=whitelist.length?whitelist.map(function(d){return'<span class="tag">'+esc(d)+' <i class="x" data-wl="'+esc(d)+'">✕</i></span>'}).join(""):'<span style="color:var(--txm);font-size:11px">'+t("p.empty")+'</span>';

  // Provider toggles
  var provHtml=allProv.map(function(p){
    var on=providers.indexOf(p.id)!==-1;
    return'<div class="prov-item"><span class="prov-name">'+p.name+'</span><button class="prov-toggle'+(on?" on":"")+'" data-prov="'+p.id+'">'+(on?t("p.prov_active"):t("p.prov_inactive"))+'</button></div>';
  }).join("");

  // Frequency options
  var freqOpts=[[5,"p.freq_5"],[10,"p.freq_10"],[15,"p.freq_15"],[30,"p.freq_30"],[60,"p.freq_60"]];
  var freqSelect='<select class="setting-select" id="freq-sel">'+freqOpts.map(function(f){return'<option value="'+f[0]+'"'+(checkFreq===f[0]?' selected':'')+'>'+t(f[1])+'</option>'}).join("")+'</select>';

  // Condition toggles
  var condItems=[["nav","p.cond_nav"],["tab","p.cond_tab"],["timer","p.cond_timer"],["startup","p.cond_startup"],["wake","p.cond_wake"],["focus","p.cond_focus"]];
  var condHtml=condItems.map(function(c){
    var on=checkConds.indexOf(c[0])!==-1;
    return'<div class="cond-item"><span class="cond-label">'+t(c[1])+'</span><button class="cond-toggle'+(on?" on":"")+'" data-cond="'+c[0]+'">'+(on?"ON":"OFF")+'</button></div>';
  }).join("");

  C.innerHTML=
    '<div class="card">'+
      '<div class="row"><span class="lbl">'+t("p.status")+'</span><span class="badge '+bC+'"><span class="dot'+(blocking&&!paused?" p":"")+'"></span>'+bT+'</span></div>'+
      '<div class="row"><span class="lbl">'+t("p.country")+'</span><span class="val">'+countryFull(st.country)+'</span></div>'+
      '<div class="row"><span class="lbl">'+t("p.ip")+'</span><span class="val">'+esc(st.ip||"—")+'</span></div>'+
      (st.org?'<div class="row"><span class="lbl">'+t("p.isp")+'</span><span class="val" style="max-width:170px;text-align:right;word-break:break-word;font-size:10px">'+esc(st.org)+'</span></div>':'')+
      '<div class="row"><span class="lbl">'+t("p.reason")+'</span><span class="val" style="max-width:180px;text-align:right;word-break:break-word;font-size:10px;color:'+(blocking?'var(--reds)':'var(--grn)')+'">'+esc(st.analysisReason||"—")+'</span></div>'+
      '<div class="row"><span class="lbl">'+t("p.checked")+'</span><span class="val">'+ago(st.lastCheck)+(st.provider?' · '+esc(st.provider):'')+'</span></div>'+
      (st.error?'<div class="row"><span class="lbl">'+t("p.error")+'</span><span class="val" style="color:var(--amb)">'+esc(st.error)+'</span></div>':'')+
    '</div>'+vpn+

    '<div class="sec"><details><summary>'+t("p.sec_settings")+'</summary><div class="sec-inner">'+
      '<div class="setting-row"><span class="setting-label">'+t("p.freq_label")+'</span>'+freqSelect+'</div>'+
      '<div style="margin-top:10px;font-size:11px;color:var(--txd);font-weight:600;margin-bottom:6px">'+t("p.cond_label")+'</div>'+
      condHtml+
    '</div></details></div>'+

    '<div class="sec"><details><summary>'+t("p.sec_providers")+' ('+providers.length+'/'+allProv.length+')</summary><div class="sec-inner">'+provHtml+'</div></details></div>'+

    '<div class="sec"><details><summary>'+t("p.sec_zones")+' ('+(Object.keys(BD).length+customTlds.length)+')</summary><div class="sec-inner">'+
      '<div class="tags">'+builtinTags+customTags+'</div>'+
      '<div class="add-row"><input class="add-input" id="tld-input" placeholder="'+t("p.ph_tld")+'"><button class="add-btn" id="tld-add">'+t("p.add")+'</button></div>'+
    '</div></details></div>'+

    '<div class="sec"><details><summary>'+t("p.sec_wl")+' ('+whitelist.length+')</summary><div class="sec-inner">'+
      '<div class="tags">'+wlTags+'</div>'+
      '<div class="add-row"><input class="add-input" id="wl-input" placeholder="'+t("p.ph_wl")+'"><button class="add-btn" id="wl-add">'+t("p.add")+'</button></div>'+
    '</div></details></div>'+

    '<div class="sec"><details id="hist-det"><summary>'+t("p.sec_hist")+'</summary><div class="sec-inner" id="hist-list"></div></details></div>'+

    '<div class="sec"><details><summary>'+t("p.sec_ie")+'</summary><div class="sec-inner">'+
      '<div class="ie-btns"><button class="ie-btn" id="ie-export">'+t("p.export")+'</button><button class="ie-btn" id="ie-import">'+t("p.import")+'</button></div>'+
      '<textarea class="ie-area" id="ie-data" placeholder="'+t("p.ie_ph")+'"></textarea><div class="ie-msg" id="ie-msg"></div>'+
    '</div></details></div>'+

    '<div class="acts"><button class="btn btn-pr" id="br">'+t("p.btn_check")+'</button>'+pauseBtn+'</div>'+
    '<div class="acts"><button class="btn" id="open-settings">'+t("p.open_settings")+'</button></div>'+
    '<div class="ft">VPN Frontier v6.1.0</div>';

  // Events
  var hd=document.getElementById("hist-det");if(hd)hd.addEventListener("toggle",function(){if(this.open)loadHistory()});
  document.getElementById("br").addEventListener("click",function(){this.innerHTML='<span class="sp"></span>';msg("recheck").then(render)});
  document.getElementById("bp").addEventListener("click",function(){this.innerHTML='<span class="sp"></span>';msg("togglePause").then(render)});
  document.getElementById("open-settings").addEventListener("click",function(){chrome.runtime.openOptionsPage()});
  document.getElementById("tld-add").addEventListener("click",function(){var v=document.getElementById("tld-input").value.trim();if(v)msg("addCustomTld",{tld:v}).then(render)});
  document.getElementById("tld-input").addEventListener("keydown",function(e){if(e.key==="Enter")document.getElementById("tld-add").click()});
  document.querySelectorAll("[data-tld]").forEach(function(el){el.addEventListener("click",function(){msg("removeCustomTld",{tld:el.dataset.tld}).then(render)})});
  document.getElementById("wl-add").addEventListener("click",function(){var v=document.getElementById("wl-input").value.trim();if(v)msg("addWhitelist",{domain:v}).then(render)});
  document.getElementById("wl-input").addEventListener("keydown",function(e){if(e.key==="Enter")document.getElementById("wl-add").click()});
  document.querySelectorAll("[data-wl]").forEach(function(el){el.addEventListener("click",function(){msg("removeWhitelist",{domain:el.dataset.wl}).then(render)})});

  // Provider toggles
  document.querySelectorAll("[data-prov]").forEach(function(el){
    el.addEventListener("click",function(){
      var id=el.dataset.prov;var idx=providers.indexOf(id);
      if(idx!==-1)providers.splice(idx,1);else providers.push(id);
      if(providers.length===0)providers.push(id); // at least 1
      msg("setProviders",{providers:providers}).then(render);
    });
  });

  // Frequency
  document.getElementById("freq-sel").addEventListener("change",function(){msg("setCheckFreq",{freq:parseInt(this.value)})});
  // Condition toggles
  document.querySelectorAll("[data-cond]").forEach(function(el){
    el.addEventListener("click",function(){
      var id=el.dataset.cond;var idx=checkConds.indexOf(id);
      if(idx!==-1)checkConds.splice(idx,1);else checkConds.push(id);
      if(checkConds.length===0)checkConds.push(id); // at least 1
      msg("setCheckConds",{conds:checkConds}).then(render);
    });
  });

  // Import/Export
  document.getElementById("ie-export").addEventListener("click",async function(){var r=await msg("exportSettings");document.getElementById("ie-data").value=r.data;try{await navigator.clipboard.writeText(r.data);document.getElementById("ie-msg").textContent=t("p.ie_copied")}catch(e){document.getElementById("ie-msg").textContent=t("p.ie_manual")}});
  document.getElementById("ie-import").addEventListener("click",async function(){var json=document.getElementById("ie-data").value.trim();if(!json){document.getElementById("ie-msg").textContent=t("p.ie_empty");return}var r=await msg("importSettings",{json:json});document.getElementById("ie-msg").textContent=r.ok?t("p.ie_ok"):t("p.ie_err")+(r.error||"");if(r.ok)setTimeout(render,500)});
}

async function loadHistory(){
  var r=await msg("getHistory");var el=document.getElementById("hist-list");
  if(!r.history||!r.history.length){el.innerHTML='<div class="hist-empty">'+t("p.hist_empty")+'</div>';return}
  var html=r.history.slice(0,50).map(function(h){return'<div class="hist-item"><div class="hist-url">'+esc(h.url)+'</div><div class="hist-time">'+fmtTime(h.time)+' · '+h.reason+'</div></div>'}).join("");
  if(r.history.length>50)html+='<div class="hist-empty">'+t("p.hist_more",{n:r.history.length-50})+'</div>';
  html+='<button class="add-btn" style="width:100%;margin-top:6px" id="hist-clear">'+t("p.hist_clear")+'</button>';
  el.innerHTML=html;
  var cb=document.getElementById("hist-clear");if(cb)cb.addEventListener("click",async function(){await msg("clearHistory");el.innerHTML='<div class="hist-empty">'+t("p.hist_cleared")+'</div>'});
}

loadLang(function(){render()});
