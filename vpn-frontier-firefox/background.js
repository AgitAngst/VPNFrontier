// VPN Frontier v6.1.0 — Background (Firefox)
// lang.js is loaded via manifest scripts array

// Allow extension pages to access session storage
try{chrome.storage.session.setAccessLevel({accessLevel:"TRUSTED_AND_UNTRUSTED_CONTEXTS"})}catch(e){}

var ALARM_NAME = "ip-check";
var MAX_HISTORY = 200;

var BUILTIN_TLDS = ["ru","su","xn--p1ai","xn--p1acf","xn--80adxhks","xn--80aswg","xn--d1acj3b","xn--80asehdb","xn--c1avg","xn--e1a4c"];
var RU_VPN_KW = ["kaspersky","hidemy.name","hideme","browsec","planet vpn","planet-vpn","prostovpn","timeweb","selectel","reg.ru","yandex","mail.ru","vk company","vk llc","rostelecom","megafon","beeline","mts ","tele2 ","ngenix","ddos-guard","qrator"];
var VPN_MARKERS = ["vpn","proxy","hosting","vps","datacenter","data center","data-center","cloud","tunnel","anonymizer","tor exit","colocation","colo "];

// ── 10 IP Providers ──
var ALL_PROVIDERS = [
  { id:"ipapi",     name:"ipapi.co",           url:"https://ipapi.co/json/",          p:function(d){return{c:d.country_code,ip:d.ip,org:d.org||""}} },
  { id:"ipinfo",    name:"ipinfo.io",          url:"https://ipinfo.io/json",          p:function(d){return{c:d.country,ip:d.ip,org:d.org||""}} },
  { id:"ifconfig",  name:"ifconfig.co",        url:"https://ifconfig.co/json",        p:function(d){return{c:d.country_iso,ip:d.ip,org:d.asn_org||""}} },
  { id:"ipwhois",   name:"ipwho.is",           url:"https://ipwho.is/",               p:function(d){return{c:d.country_code,ip:d.ip,org:d.connection&&d.connection.org||""}} },
  { id:"freeipapi", name:"freeipapi.com",      url:"https://freeipapi.com/api/json",  p:function(d){return{c:d.countryCode,ip:d.ipAddress,org:""}} },
  { id:"ipapi_com", name:"ip-api.com",         url:"https://pro.ip-api.com/json/?fields=countryCode,query,org,isp", p:function(d){return{c:d.countryCode,ip:d.query,org:d.org||d.isp||""}} },
  { id:"ipdata",    name:"ipdata.co",          url:"https://api.ipdata.co/?api-key=test", p:function(d){return{c:d.country_code,ip:d.ip,org:d.asn&&d.asn.name||""}} },
  { id:"ipbase",    name:"ipbase.com",         url:"https://api.ipbase.com/v1/json/", p:function(d){return{c:d.country_code,ip:d.ip,org:""}} },
  { id:"ipgeo",     name:"ipgeolocation.io",   url:"https://api.ipgeolocation.io/ipgeo", p:function(d){return{c:d.country_code2,ip:d.ip,org:d.organization||d.isp||""}} },
  { id:"ip2loc",    name:"ip2location.io",     url:"https://api.ip2location.io/",     p:function(d){return{c:d.country_code,ip:d.ip,org:""}} },
];

var DEFAULT_PROVIDERS = ["ipapi","ipinfo","ifconfig","ipwhois","freeipapi"];
var DEFAULT_FREQ = 10;
var DEFAULT_COND = ["nav","timer","startup"]; // array of active triggers

var blockCount = 0;

// ── Helpers ──
function tldOf(h){var p=h.toLowerCase().split(".");return p[p.length-1]}
function isDomainBlocked(h,tlds,wl){h=h.toLowerCase();if(wl.some(function(w){return h===w||h.endsWith("."+w)}))return false;return tlds.some(function(tt){return h===tt||h.endsWith("."+tt)})}
function isRuDomain(h){h=h.toLowerCase();return BUILTIN_TLDS.some(function(tt){return h===tt||h.endsWith("."+tt)})}
async function getSync(){return chrome.storage.sync.get({customTlds:[],whitelist:[],lang:"ru",providers:DEFAULT_PROVIDERS,checkFreq:DEFAULT_FREQ,checkConds:DEFAULT_COND,soundEnabled:true})}

function todayKey(){return"stats_"+new Date().toISOString().slice(0,10)}

async function trackBlock(url){
  var key=todayKey();
  var d=await chrome.storage.local.get([key,"statsTotal","statsDomains"]);
  var today=d[key]||0;
  var total=d.statsTotal||0;
  var domains=d.statsDomains||{};
  try{var host=new URL(url).hostname;domains[host]=(domains[host]||0)+1}catch(e){}
  var upd={statsTotal:total+1,statsDomains:domains};upd[key]=today+1;
  await chrome.storage.local.set(upd);
}
function getAllTlds(c){return[...new Set([...BUILTIN_TLDS,...c.map(function(x){return x.toLowerCase()})])]}

// ── Rules ──
async function rebuildRules(){
  var s=await getSync();var rule={id:1,priority:1,action:{type:"redirect",redirect:{extensionPath:"/blocked.html"}},condition:{requestDomains:getAllTlds(s.customTlds),resourceTypes:["main_frame"]}};
  if(s.whitelist.length)rule.condition.excludedRequestDomains=s.whitelist;
  try{var old=await chrome.declarativeNetRequest.getDynamicRules();await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:old.map(function(r){return r.id}),addRules:[rule]})}catch(e){console.error("[VF]",e)}
}
async function clearRules(){var old=await chrome.declarativeNetRequest.getDynamicRules();if(old.length)await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:old.map(function(r){return r.id})})}

// ── Badge & Icon ──
function updateBadge(blocking){
  if(blocking&&blockCount>0){chrome.action.setBadgeText({text:String(blockCount)});chrome.action.setBadgeBackgroundColor({color:"#ef4444"})}
  else chrome.action.setBadgeText({text:""});
}

function setIcon(type){
  // type: "ru" or "globe"
  var prefix = type === "ru" ? "ru" : "globe";
  chrome.action.setIcon({
    path:{
      "16":"icons/"+prefix+"16.png",
      "48":"icons/"+prefix+"48.png",
      "128":"icons/"+prefix+"128.png"
    }
  });
}

// Track current tab to update icon
chrome.tabs.onActivated.addListener(async function(info){
  try{var tab=await chrome.tabs.get(info.tabId);updateIconForUrl(tab.url)}catch{}
  var s=await getSync();
  if((s.checkConds||DEFAULT_COND).indexOf("tab")!==-1){
    var st=await chrome.storage.local.get("lastCheck");
    if(!st.lastCheck||Date.now()-st.lastCheck>15000)doFreshCheck();
  }
});
chrome.tabs.onUpdated.addListener(function(tabId,info,tab){if(info.url)updateIconForUrl(info.url)});

// Wake from sleep detection (alarm fires late = device was sleeping)
chrome.alarms.onAlarm.addListener(async function(a){
  if(a.name!==ALARM_NAME)return;
  var s=await getSync();var conds=s.checkConds||DEFAULT_COND;
  // Check if timer trigger is active
  if(conds.indexOf("timer")!==-1){doFreshCheck();return}
  // Even if timer is off, check if wake trigger is on and alarm was delayed (sleep)
  if(conds.indexOf("wake")!==-1){
    var st=await chrome.storage.local.get("lastCheck");
    var expected=s.checkFreq*60*1000;
    var actual=st.lastCheck?Date.now()-st.lastCheck:expected*2;
    if(actual>expected*1.5)doFreshCheck(); // alarm fired late = was sleeping
  }
});

// Window focus = return to browser
chrome.windows.onFocusChanged.addListener(async function(windowId){
  if(windowId===chrome.windows.WINDOW_ID_NONE)return;
  var s=await getSync();
  if((s.checkConds||DEFAULT_COND).indexOf("focus")!==-1){
    var st=await chrome.storage.local.get("lastCheck");
    if(!st.lastCheck||Date.now()-st.lastCheck>30000)doFreshCheck();
  }
});

function updateIconForUrl(url){
  if(!url)return setIcon("globe");
  try{var h=new URL(url).hostname;setIcon(isRuDomain(h)?"ru":"globe")}
  catch(e){setIcon("globe")}
}

// ── History ──
async function addHistory(url,reason){var d=await chrome.storage.local.get("blockHistory");var h=d.blockHistory||[];h.unshift({url:url,reason:reason,time:Date.now()});if(h.length>MAX_HISTORY)h.length=MAX_HISTORY;await chrome.storage.local.set({blockHistory:h})}

// ── Geo with selectable providers ──
async function fetchGeo(){
  var s=await getSync();
  var activeIds=s.providers||DEFAULT_PROVIDERS;
  var active=ALL_PROVIDERS.filter(function(p){return activeIds.indexOf(p.id)!==-1});
  if(!active.length)active=ALL_PROVIDERS.slice(0,3);

  for(var i=0;i<active.length;i++){
    var pv=active[i];
    try{
      var r=await fetch(pv.url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(6000)});
      if(!r.ok)continue;
      var d=await r.json();var g=pv.p(d);
      if(g.c)return{country:g.c.toUpperCase(),ip:g.ip,org:(g.org||"").toLowerCase(),provider:pv.name};
    }catch(e){console.warn("[VF]",pv.name,e.message)}
  }
  return null;
}

function analyze(geo){
  if(!geo)return{type:"unknown",reason:"No IP data"};
  if(geo.country!=="RU")return{type:"foreign",reason:geo.country};
  var o=geo.org;
  for(var i=0;i<RU_VPN_KW.length;i++){if(o.includes(RU_VPN_KW[i]))return{type:"ru_vpn",reason:RU_VPN_KW[i]}}
  for(var j=0;j<VPN_MARKERS.length;j++){if(o.includes(VPN_MARKERS[j]))return{type:"ru_vpn",reason:VPN_MARKERS[j]}}
  return{type:"real_ru",reason:"Real RU IP"};
}

// ── Check ──
var activeCheck=null,lastCheckTs=0;
async function doFreshCheck(){
  if(activeCheck)return activeCheck;
  if(Date.now()-lastCheckTs<3000){var cached=await chrome.storage.local.get(["country","ip","org","provider","verified","blocking","analysisType","analysisReason","lastCheck","error","blockedTlds"]);return cached}
  activeCheck=(async function(){
    try{
      await loadLangBg();
      var geo=await fetchGeo();var a=analyze(geo);
      var shouldBlock=(a.type==="foreign"||a.type==="unknown");
      if(shouldBlock)await rebuildRules();else await clearRules();
      var prev=await chrome.storage.local.get(["analysisType","country"]);
      if(a.type==="ru_vpn"&&prev.analysisType!=="ru_vpn")notify(t("n.vpn_title"),t("n.vpn_msg",{reason:a.reason}));
      if(prev.country&&prev.country!==(geo&&geo.country))notify(t("n.country_title"),t("n.country_msg",{from:prev.country,to:geo?geo.country:"?",status:shouldBlock?t("n.block_on"):t("n.block_off")}));
      var state={country:geo?geo.country:null,ip:geo?geo.ip:null,org:geo?geo.org:null,provider:geo?geo.provider:null,verified:!shouldBlock,blocking:shouldBlock,analysisType:a.type,analysisReason:a.reason,lastCheck:Date.now(),error:geo?null:"No IP data",blockedTlds:getAllTlds((await getSync()).customTlds).length};
      await chrome.storage.local.set(state);updateBadge(shouldBlock);return state;
    }finally{lastCheckTs=Date.now()}
  })();
  try{return await activeCheck}finally{activeCheck=null}
}

function notify(title,message){try{chrome.notifications.create("vf-"+Date.now(),{type:"basic",iconUrl:"icons/globe128.png",title:title,message:message,priority:2})}catch(e){}}
async function loadLangBg(){var d=await chrome.storage.sync.get({lang:"ru"});currentLang=d.lang}

// ── Navigation ──
chrome.webNavigation.onBeforeNavigate.addListener(async function(details){
  if(details.frameId!==0)return;
  var url;try{url=new URL(details.url)}catch(e){return}
  var s=await getSync();
  if(!isDomainBlocked(url.hostname,getAllTlds(s.customTlds),s.whitelist))return;
  await chrome.storage.session.set({["burl_"+details.tabId]:details.url});
  var st=await chrome.storage.local.get("paused");
  if(st.paused)return;
  var conds=s.checkConds||DEFAULT_COND;
  if(conds.indexOf("nav")!==-1){
    var result=await doFreshCheck();
    if(result.blocking){
      blockCount++;updateBadge(true);addHistory(details.url,result.analysisType||"blocked");trackBlock(details.url);
      try{var tab=await chrome.tabs.get(details.tabId);if(tab&&tab.url&&!tab.url.includes("blocked.html")&&!(tab.pendingUrl||"").includes("blocked.html"))chrome.tabs.update(details.tabId,{url:chrome.runtime.getURL("blocked.html")})}catch(e){}
    }
  }
});
chrome.tabs.onRemoved.addListener(function(id){chrome.storage.session.remove("burl_"+id).catch(function(){})});

// ── Context Menu ──
async function setupCtx(){
  await loadLangBg();
  chrome.contextMenus.removeAll(function(){
    chrome.contextMenus.create({id:"block-tld",title:t("ctx.block"),contexts:["page"]});
    chrome.contextMenus.create({id:"whitelist-domain",title:t("ctx.wl"),contexts:["page"]});
  });
}
chrome.contextMenus.onClicked.addListener(async function(info,tab){
  if(!tab||!tab.url)return;var host;try{host=new URL(tab.url).hostname}catch(e){return}
  await loadLangBg();
  if(info.menuItemId==="block-tld"){var tld=tldOf(host);if(BUILTIN_TLDS.includes(tld)){notify("ℹ️",t("n.tld_exists"));return}var s=await getSync();if(s.customTlds.indexOf(tld)===-1){s.customTlds.push(tld);await chrome.storage.sync.set({customTlds:s.customTlds});if((await chrome.storage.local.get("blocking")).blocking)await rebuildRules();notify("VPN Frontier",t("n.tld_added",{tld:tld}))}}
  if(info.menuItemId==="whitelist-domain"){var s2=await getSync();if(s2.whitelist.indexOf(host)===-1){s2.whitelist.push(host);await chrome.storage.sync.set({whitelist:s2.whitelist});if((await chrome.storage.local.get("blocking")).blocking)await rebuildRules();notify("VPN Frontier",t("n.wl_added",{domain:host}))}}
});

// ── Lifecycle ──
chrome.runtime.onInstalled.addListener(async function(){
  await rebuildRules();await chrome.storage.local.set({verified:false,blocking:true,paused:false});
  setupCtx();await doFreshCheck();
  var s=await getSync();chrome.alarms.create(ALARM_NAME,{periodInMinutes:s.checkFreq||DEFAULT_FREQ});
});
chrome.runtime.onStartup.addListener(async function(){
  await rebuildRules();await chrome.storage.local.set({verified:false,blocking:true});
  blockCount=0;setupCtx();
  var s=await getSync();
  if((s.checkConds||DEFAULT_COND).indexOf("startup")!==-1)await doFreshCheck();
});
// Alarm handler is above in onAlarm listener

// ── Messages ──
chrome.runtime.onMessage.addListener(function(msg,sender,reply){
  switch(msg.action){
    case"recheck":case"recheckNow":
      (async function(){var s=await doFreshCheck();var sync=await getSync();reply(Object.assign({},s,sync))})();return true;
    case"getState":
      (async function(){var l=await chrome.storage.local.get(null);var s=await getSync();reply(Object.assign({},l,s,{builtinTlds:BUILTIN_TLDS,allProviders:ALL_PROVIDERS.map(function(p){return{id:p.id,name:p.name}})}))})();return true;
    case"togglePause":
      (async function(){var d=await chrome.storage.local.get("paused");var np=!d.paused;if(np)await clearRules();else{await rebuildRules();await chrome.storage.local.set({verified:false,blocking:true});await doFreshCheck()}await chrome.storage.local.set({paused:np,blocking:!np});reply(await chrome.storage.local.get(null))})();return true;
    case"getBlockedUrl":
      (async function(){var id=sender.tab?sender.tab.id:null;if(id){var d=await chrome.storage.session.get("burl_"+id);reply({url:d["burl_"+id]||null})}else reply({url:null})})();return true;
    case"proceedToUrl":
      (async function(){
        try{
          var u=new URL(msg.url);
          if(u.protocol!=="http:"&&u.protocol!=="https:"){reply({ok:false});return}
          chrome.tabs.update(sender.tab.id,{url:msg.url});
        }catch(e){console.error("[VF] bad url",e)}
        reply({ok:true});
      })();return true;
    case"addCustomTld":
      (async function(){var s=await getSync();var tld=msg.tld.toLowerCase().replace(/^\./,"").replace(/[^a-z0-9\-]/g,"");if(tld&&tld.length>0&&tld.length<64&&s.customTlds.indexOf(tld)===-1&&BUILTIN_TLDS.indexOf(tld)===-1){s.customTlds.push(tld);await chrome.storage.sync.set({customTlds:s.customTlds});if((await chrome.storage.local.get("blocking")).blocking)await rebuildRules()}reply({customTlds:(await getSync()).customTlds})})();return true;
    case"removeCustomTld":
      (async function(){var s=await getSync();s.customTlds=s.customTlds.filter(function(x){return x!==msg.tld});await chrome.storage.sync.set({customTlds:s.customTlds});if((await chrome.storage.local.get("blocking")).blocking)await rebuildRules();reply({customTlds:s.customTlds})})();return true;
    case"addWhitelist":
      (async function(){var s=await getSync();var d=msg.domain.toLowerCase().replace(/^https?:\/\//,"").replace(/\/.*$/,"");if(d&&s.whitelist.indexOf(d)===-1){s.whitelist.push(d);await chrome.storage.sync.set({whitelist:s.whitelist});if((await chrome.storage.local.get("blocking")).blocking)await rebuildRules()}reply({whitelist:(await getSync()).whitelist})})();return true;
    case"removeWhitelist":
      (async function(){var s=await getSync();s.whitelist=s.whitelist.filter(function(x){return x!==msg.domain});await chrome.storage.sync.set({whitelist:s.whitelist});if((await chrome.storage.local.get("blocking")).blocking)await rebuildRules();reply({whitelist:s.whitelist})})();return true;
    case"getHistory":chrome.storage.local.get("blockHistory",function(d){reply({history:d.blockHistory||[]})});return true;
    case"clearHistory":chrome.storage.local.set({blockHistory:[]},function(){reply({ok:true})});return true;
    case"exportSettings":
      (async function(){var s=await getSync();var h=(await chrome.storage.local.get("blockHistory")).blockHistory||[];reply({data:JSON.stringify({customTlds:s.customTlds,whitelist:s.whitelist,lang:s.lang,providers:s.providers,checkFreq:s.checkFreq,checkConds:s.checkConds,blockHistory:h},null,2)})})();return true;
    case"importSettings":
      (async function(){try{var d=JSON.parse(msg.json);var sets={};if(d.customTlds)sets.customTlds=d.customTlds;if(d.whitelist)sets.whitelist=d.whitelist;if(d.lang)sets.lang=d.lang;if(d.providers)sets.providers=d.providers;if(d.checkFreq)sets.checkFreq=d.checkFreq;if(d.checkConds)sets.checkConds=d.checkConds;await chrome.storage.sync.set(sets);if(d.blockHistory)await chrome.storage.local.set({blockHistory:d.blockHistory});if((await chrome.storage.local.get("blocking")).blocking)await rebuildRules();reply({ok:true})}catch(e){reply({ok:false,error:e.message})}})();return true;
    case"setLang":
      (async function(){await chrome.storage.sync.set({lang:msg.lang});currentLang=msg.lang;setupCtx();reply({ok:true})})();return true;
    case"setProviders":
      (async function(){await chrome.storage.sync.set({providers:msg.providers});reply({ok:true})})();return true;
    case"setCheckFreq":
      (async function(){await chrome.storage.sync.set({checkFreq:msg.freq});chrome.alarms.clear(ALARM_NAME);chrome.alarms.create(ALARM_NAME,{periodInMinutes:msg.freq});reply({ok:true})})();return true;
    case"setCheckConds":
      (async function(){await chrome.storage.sync.set({checkConds:msg.conds});reply({ok:true})})();return true;
    case"setSoundEnabled":
      (async function(){await chrome.storage.sync.set({soundEnabled:msg.enabled});reply({ok:true})})();return true;
    case"getStats":
      (async function(){
        var keys=[];for(var i=0;i<7;i++){var d=new Date();d.setDate(d.getDate()-i);keys.push("stats_"+d.toISOString().slice(0,10))}
        var data=await chrome.storage.local.get([...keys,"statsTotal","statsDomains"]);
        var daily=keys.map(function(k){return{date:k.replace("stats_",""),count:data[k]||0}}).reverse();
        reply({daily:daily,total:data.statsTotal||0,domains:data.statsDomains||{}});
      })();return true;
    case"resetStats":
      (async function(){
        var all=await chrome.storage.local.get(null);var removes=Object.keys(all).filter(function(k){return k.startsWith("stats_")});
        var upd={statsTotal:0,statsDomains:{}};await chrome.storage.local.set(upd);
        for(var i=0;i<removes.length;i++)await chrome.storage.local.remove(removes[i]);
        reply({ok:true});
      })();return true;
  }
});
