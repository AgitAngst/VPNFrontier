// VPN Frontier v6.1.0-android — Blocked Page
var ZONES_MAP={"ru":".ru","su":".su","xn--p1ai":".рф","xn--p1acf":".рус","xn--80adxhks":".москва","xn--80aswg":".сайт","xn--d1acj3b":".дети","xn--80asehdb":".онлайн","xn--c1avg":".орг","xn--e1a4c":".ею"};
var blockedUrl=null;

function playBlockAlert(){
  chrome.storage.sync.get({soundEnabled:true},function(s){
    if(!s.soundEnabled)return;
    // Android: use vibration instead of AudioContext
    try{if(navigator.vibrate)navigator.vibrate([100,50,100])}catch(e){}
    // Also try AudioContext as fallback
    try{
      var ctx=new AudioContext();
      var osc=ctx.createOscillator();var gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.frequency.value=440;osc.type="sine";
      gain.gain.setValueAtTime(0.12,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);
      osc.start(ctx.currentTime);osc.stop(ctx.currentTime+0.2);
    }catch(e){}
  });
}

function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}

chrome.tabs.getCurrent(function(tab){if(!tab)return;chrome.storage.session.get("burl_"+tab.id,function(d){blockedUrl=d["burl_"+tab.id]||null;document.getElementById("burl").textContent=blockedUrl||t("bl.url_unknown")})});

function renderText(){
  document.getElementById("title").textContent=t("bl.title");
  document.getElementById("sub").textContent=t("bl.sub");
  document.getElementById("url-lbl").textContent=t("bl.url_label");
  document.getElementById("check-btn").textContent=t("bl.check_btn");
  document.getElementById("go-btn").textContent=t("bl.go_btn");
  document.getElementById("btn-back").textContent=t("bl.back");
  document.getElementById("btn-close").textContent=t("bl.close");
  document.getElementById("w-vpn-h").textContent=t("bl.warn_vpn_h");
  document.getElementById("w-vpn-p").textContent=t("bl.warn_vpn_p");
  document.getElementById("w-why-h").textContent=t("bl.warn_why_h");
  document.getElementById("w-why-p").textContent=t("bl.warn_why_p");
  document.getElementById("zones-sum").textContent=t("bl.zones");
  document.getElementById("i-co-l").textContent=t("p.country");
  document.getElementById("i-rsn-l").textContent=t("p.reason");
  if(!blockedUrl)document.getElementById("burl").textContent=t("bl.url_unknown");
  document.getElementById("lang-ru").className="lang-btn"+(currentLang==="ru"?" active":"");
  document.getElementById("lang-en").className="lang-btn"+(currentLang==="en"?" active":"");
}

function renderZones(){chrome.storage.sync.get({customTlds:[]},function(s){var el=document.getElementById("zlist");var h="";var k=Object.keys(ZONES_MAP);for(var i=0;i<k.length;i++)h+='<span class="zt">'+ZONES_MAP[k[i]]+'</span>';for(var j=0;j<s.customTlds.length;j++)h+='<span class="zt custom">.'+esc(s.customTlds[j])+'</span>';el.innerHTML=h})}

document.getElementById("lang-ru").addEventListener("click",function(){setLang("ru");chrome.runtime.sendMessage({action:"setLang",lang:"ru"});renderText()});
document.getElementById("lang-en").addEventListener("click",function(){setLang("en");chrome.runtime.sendMessage({action:"setLang",lang:"en"});renderText()});

var checkBtn=document.getElementById("check-btn");
var checkResult=document.getElementById("check-result");
var crTitle=document.getElementById("cr-title");
var crDetail=document.getElementById("cr-detail");
var goBtn=document.getElementById("go-btn");

checkBtn.addEventListener("click",doCheck);

function doCheck(){
  checkBtn.disabled=true;checkBtn.textContent=t("bl.checking");
  checkResult.className="check-result";goBtn.classList.remove("show");
  chrome.runtime.sendMessage({action:"recheckNow"},function(state){
    checkBtn.disabled=false;checkBtn.textContent=t("bl.check_btn");
    if(!state){showResult("fail",t("bl.err_title"),t("bl.err_detail"));return}
    if(state.ip||state.country){
      document.getElementById("info-card").style.display="";
      document.getElementById("i-ip").textContent=state.ip||"—";
      document.getElementById("i-co").textContent=countryFull(state.country);
      document.getElementById("i-org").textContent=state.org||"—";
      document.getElementById("i-rsn").textContent=state.analysisReason||"—";
    }
    if(state.analysisType==="real_ru"){showResult("ok",t("bl.ok_title"),t("bl.ok_detail"));if(blockedUrl)goBtn.classList.add("show")}
    else if(state.analysisType==="ru_vpn"){showResult("vpn",t("bl.vpn_title"),t("bl.vpn_detail"));if(blockedUrl)goBtn.classList.add("show")}
    else if(state.analysisType==="foreign"){showResult("fail",t("bl.fail_title"),t("bl.fail_detail",{country:countryFull(state.country)}));playBlockAlert()}
    else{showResult("fail",t("bl.unk_title"),t("bl.unk_detail"));playBlockAlert()}
  });
}

function showResult(type,title,detail){checkResult.className="check-result show "+type;crTitle.textContent=title;crDetail.textContent=detail}

goBtn.addEventListener("click",function(){if(!blockedUrl)return;goBtn.textContent=t("bl.going");goBtn.disabled=true;chrome.runtime.sendMessage({action:"proceedToUrl",url:blockedUrl})});
document.getElementById("btn-back").addEventListener("click",function(){if(history.length>1)history.back();else chrome.tabs.getCurrent(function(tab){if(tab)chrome.tabs.update(tab.id,{url:"about:blank"})})});
document.getElementById("btn-close").addEventListener("click",function(){chrome.tabs.getCurrent(function(tab){if(tab)chrome.tabs.remove(tab.id)})});

loadLang(function(){renderText();renderZones();doCheck()});
