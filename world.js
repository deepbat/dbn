/* dbn scene world: scroll chooses the scene, text sits inside it, leaves and light react to touch. */
(function(){
var host=document.getElementById('world');if(!host)return;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var secs=[['about','s-desk','DESK','the desk','where it starts'],['work','s-build','BUILD','the workbench','small tools, real use'],['life','s-life','LIFE','outside the screen','real photographs'],['contact','s-hello','HELLO','say hello','come and say hi']];
var scenes=secs.map(function(s){var el=host.querySelector('.'+s[1]);return{sec:document.getElementById(s[0]),el:el,art:el.querySelector('.w-art'),word:el.querySelector('.w-word'),o:0,p:0,cap:s}});
var cv=document.getElementById('w-canvas'),cx=cv.getContext('2d'),cap=document.getElementById('w-cap');
var W=0,H=0,dpr=Math.min(devicePixelRatio||1,1.5),mob=innerWidth<700;
function size(){W=innerWidth;H=innerHeight;mob=W<700;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
size();addEventListener('resize',function(){size();measure()});
var ptr={x:-999,y:-999,on:0};
addEventListener('pointermove',function(e){ptr.x=e.clientX;ptr.y=e.clientY;ptr.on=1},{passive:true});
addEventListener('pointerdown',function(e){ptr.x=e.clientX;ptr.y=e.clientY;ptr.on=1},{passive:true});
addEventListener('pointerup',function(){ptr.on=0},{passive:true});
var objects=[].slice.call(host.querySelectorAll('.w-object'));
function moveObjects(){
  if(reduce){objects.forEach(function(el){el.style.translate='0 0'});return}
  var mx=ptr.x>0?((ptr.x/W)-.5)*2:0, my=ptr.y>0?((ptr.y/H)-.5)*2:0;
  objects.forEach(function(el){
    var depth=parseFloat(el.getAttribute('data-depth')||1);
    var x=(mx*depth*24).toFixed(1), y=(my*depth*18).toFixed(1);
    el.style.translate=x+'px '+y+'px';
  });
}
function R(a,b){return a+Math.random()*(b-a)}
var N=mob?{dust:28,code:14,leaf:16,ember:26}:{dust:60,code:30,leaf:30,ember:50};
var dust=[],code=[],leaves=[],embers=[];
var LC=['#e2561a','#f08a24','#c8321a','#f2b134','#b8401a'];
function init(){dust=[];code=[];leaves=[];embers=[];
for(var i=0;i<N.dust;i++)dust.push({x:R(0,W),y:R(0,H),r:R(.8,2.6),vx:R(-.08,.08),vy:R(-.12,.02),a:R(.15,.55),t:R(0,6)});
for(var i=0;i<N.code;i++)code.push({x:i*(W/N.code)+R(0,10),y:R(-H,H),v:R(.5,1.6),s:R(11,15),c:0,str:''});
for(var i=0;i<N.leaf;i++)leaves.push(leaf(true));
for(var i=0;i<N.ember;i++)embers.push({x:R(0,W),y:R(0,H),r:R(1,3),vy:R(-.7,-.2),vx:R(-.15,.15),a:R(.2,.8),t:R(0,6)})}
function leaf(r){return{x:R(0,W),y:r?R(-20,H):R(-60,-10),s:R(mob?9:11,mob?19:26),vy:R(.5,1.3),vx:0,ph:R(0,6.28),sw:R(.4,1.1),rot:R(0,6.28),vr:R(-.02,.02),c:LC[Math.floor(Math.random()*5)],fl:R(0,6.28)}}
var G='01{}<>/;=()[]+*#$%&';
function draw(t,dt){cx.clearRect(0,0,W,H);
var s=scenes;
if(s[0].o>.02){cx.globalAlpha=s[0].o;dust.forEach(function(d){d.t+=dt*.001;d.x+=d.vx*dt*.06+Math.sin(d.t)*.15;d.y+=d.vy*dt*.06;if(ptr.on||ptr.x>0){var dx=d.x-ptr.x,dy=d.y-ptr.y,q=dx*dx+dy*dy;if(q<14000){d.x+=dx*.01;d.y+=dy*.01}}if(d.y<-5)d.y=H+5;if(d.x<-5)d.x=W+5;if(d.x>W+5)d.x=-5;cx.fillStyle='rgba(255,196,120,'+d.a+')';cx.beginPath();cx.arc(d.x,d.y,d.r,0,6.283);cx.fill()})}
if(s[1].o>.02){cx.globalAlpha=s[1].o*.55;cx.font='500 13px Mono,monospace';code.forEach(function(c){c.y+=c.v*dt*.06;if(c.y>H+200){c.y=R(-300,-20);c.x=c.x}cx.fillStyle='#2fe0c4';for(var k=0;k<9;k++){var yy=c.y-k*c.s*1.2;if(yy<-20||yy>H+20)continue;cx.globalAlpha=s[1].o*(k?.5-k*.05:.9);cx.fillText(G.charAt((Math.floor(c.x*7+yy*.13+k*5))%G.length),c.x,yy)}})}
if(s[2].o>.02){cx.globalAlpha=s[2].o;leaves.forEach(function(l,i){l.ph+=dt*.001*l.sw;l.fl+=dt*.003;l.vx*=.95;var dx=l.x-ptr.x,dy=l.y-ptr.y,q=dx*dx+dy*dy;if(q<22000&&ptr.x>0){var f=1-q/22000;l.vx+=dx/Math.sqrt(q+1)*f*1.4;l.y+=dy/Math.sqrt(q+1)*f*1.4;l.vr+=(dx>0?.002:-.002)*f}l.x+=Math.sin(l.ph)*.6+l.vx;l.y+=l.vy*dt*.06;l.rot+=l.vr;if(l.y>H+30||l.x<-60||l.x>W+60){leaves[i]=leaf(false);return}
cx.save();cx.translate(l.x,l.y);cx.rotate(l.rot);cx.scale(Math.cos(l.fl)*.8+.2,1);cx.fillStyle=l.c;var z=l.s;cx.beginPath();cx.moveTo(0,-z);cx.bezierCurveTo(z*.9,-z*.5,z*.7,z*.6,0,z);cx.bezierCurveTo(-z*.7,z*.6,-z*.9,-z*.5,0,-z);cx.fill();cx.strokeStyle='rgba(90,25,5,.5)';cx.lineWidth=1;cx.beginPath();cx.moveTo(0,-z*.8);cx.lineTo(0,z*1.1);cx.stroke();cx.restore()})}
if(s[3].o>.02){cx.globalAlpha=s[3].o;embers.forEach(function(e){e.t+=dt*.001;e.x+=e.vx*dt*.06+Math.sin(e.t*2)*.2;e.y+=e.vy*dt*.06;if(e.y<-5){e.y=H+5;e.x=R(0,W)}cx.fillStyle='rgba(255,'+Math.floor(150+e.r*25)+',110,'+e.a+')';cx.beginPath();cx.arc(e.x,e.y,e.r,0,6.283);cx.fill()})}
cx.globalAlpha=1}
var tops=[];
function measure(){}
var curScene=-1,scr=null;
function scramble(txt){if(reduce){cap.innerHTML=txt;return}if(scr)clearInterval(scr);var f=0,n=14,ch='abcdefghijklmnopqrstuvwxyz01/<>_';var parts=txt.split('|');scr=setInterval(function(){f++;var out=parts.map(function(p,i){if(i===0)return p;return p}).join('');var k=Math.floor(f/n*out.length),res='';for(var i=0;i<out.length;i++)res+=i<k||out.charAt(i)===' '?out.charAt(i):ch.charAt(Math.floor(Math.random()*ch.length));cap.textContent=res;if(f>=n){clearInterval(scr);cap.textContent=out}},38)}
function setCap(i){if(i===curScene)return;curScene=i;if(i<0){cap.textContent='';return}var c=scenes[i].cap;scramble('0'+(i+1)+' / 04  '+c[3]+' . '+c[4])}
function scroll(){var vh=innerHeight,y=scrollY;var heroEnd=document.querySelector('.hero').getBoundingClientRect().bottom;document.body.classList.toggle('w-on',heroEnd<vh*.92);
var best=-1,bo=0;
scenes.forEach(function(s,i){var r=s.sec.getBoundingClientRect();var enter=Math.max(0,Math.min(1,(vh*.95-r.top)/(vh*.55)));var o=i===0?Math.max(0,Math.min(1,(vh*.95-r.top)/(vh*.5))):enter;
if(i<scenes.length-1){}
s.o=o;s.p=Math.max(0,Math.min(1,(vh*.5-r.top)/(r.height||1)));
s.el.style.opacity=o.toFixed(3);s.el.style.zIndex=i;
s.art.style.transform='translate3d(0,'+(-s.p*60).toFixed(1)+'px,0) scale('+(1+s.p*.12).toFixed(3)+')';
s.word.style.transform='translate3d('+((.2-s.p*1.3)*W*.6).toFixed(0)+'px,-50%,0)';
if(r.top<vh*.5&&r.bottom>vh*.5){best=i}});
if(heroEnd>=vh*.92)best=-1;setCap(best)}
var busy=false;addEventListener('scroll',function(){if(!busy){busy=true;requestAnimationFrame(function(){busy=false;scroll()})}},{passive:true});
init();document.body.classList.add('w-ready');scroll();
var last=0,run=false;
function loop(t){requestAnimationFrame(loop);var dt=Math.min(50,t-last||16);last=t;if(document.hidden||!document.body.classList.contains('w-on'))return;draw(t,dt);moveObjects()}
if(reduce){draw(0,16);moveObjects()}else requestAnimationFrame(loop);
addEventListener('resize',init);
})();
/* v2 stage driver: each .st is a pinned full-screen stage; scroll progress sets --i (enter) and --o (exit) on its beats. */
(function(){
var sts=[].slice.call(document.querySelectorAll('.st')),beats=[];
sts.forEach(function(st){[].slice.call(st.querySelectorAll('[data-r]')).forEach(function(el){var r=el.getAttribute('data-r').split(',').map(Number);beats.push({st:st,el:el,r:r})})});
function c(x){return x<0?0:x>1?1:x}
var nav=document.querySelector('.nav');function run(){var vh=innerHeight,hh=nav?nav.offsetHeight:64;document.documentElement.style.setProperty('--hh',hh+'px');sts.forEach(function(st){st._p=c((hh-st.getBoundingClientRect().top)/Math.max(1,st.offsetHeight-vh))});
beats.forEach(function(b){var p=b.st._p,r=b.r,i=c((p-r[0])/Math.max(.001,r[1]-r[0])),o=r.length>3?c((p-r[2])/Math.max(.001,r[3]-r[2])):0;b.el.style.setProperty('--i',i.toFixed(3));b.el.style.setProperty('--o',o.toFixed(3));})}
var busy=false;function q(){if(!busy){busy=true;requestAnimationFrame(function(){busy=false;run()})}}
addEventListener('scroll',q,{passive:true});addEventListener('resize',q);run();
})();
