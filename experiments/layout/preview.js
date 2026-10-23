/* Proefpresentatie: dezelfde puzzels/afleidingen, uitsluitend tijdelijke proefdata. */
document.documentElement.removeAttribute('data-auth-pending');
const testBar=document.createElement('div');testBar.id='layoutBar';
testBar.innerHTML='<strong>Proefpagina</strong><select id="testSize" aria-label="Proefformaat"><option value="1">Klein</option><option value="2" selected>Normaal</option><option value="3">Groot</option></select><button id="testNew">Andere</button><button id="testCompare" aria-pressed="false">Vorige</button><a href="./">App</a>';
document.body.prepend(testBar);
$('#testSize').onchange=()=>{if(S.p){setFreePreferences(S.type,+$('#testSize').value+(PHONE?3:0),S.nv);load(S.type,true,true)}};
$('#testNew').onclick=()=>{const t=S.type||'bin';setFreePreferences(t,+$('#testSize').value+(PHONE?3:0),S.nv);load(t,true,true)};
$('#testCompare').onclick=()=>{clearHint();testOriginal=!testOriginal;window.LAYOUT_ORIGINAL=testOriginal;document.body.classList.toggle('layout-modern',!testOriginal);testFrame();$('#testCompare').setAttribute('aria-pressed',String(testOriginal));$('#testCompare').textContent=testOriginal?'Nieuwe':'Vorige';resetPuzzleFit();if(S.p)render()};
const intro=document.createElement('p');intro.id='layoutIntro';intro.textContent='Proefversie: probeer de verschillende puzzels en de drie hintstappen. “Vorige” toont de eerdere indeling van hetzelfde bord. Je echte scores en voortgang worden hier niet gebruikt.';
const testHomeObserver=new MutationObserver(()=>{const wrap=$('#home .hwrap');if(wrap&&!wrap.querySelector('#layoutIntro'))wrap.prepend(intro)});testHomeObserver.observe($('#home'),{childList:true,subtree:true});
setMe('layout-tester','Testspeler');testFrame();setFreePreferences('bin',PHONE?5:2);load('bin',true,true);
