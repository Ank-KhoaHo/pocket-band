(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,ALL=NS.ALL,ODD2=NS.ODD2,padSeg=NS.padSeg,arp=NS.arp,bassl=NS.bassl,melody=NS.melody,
 sparkle=NS.sparkle,hearts=NS.hearts,N=NS.N,D=NS.D,W=NS.W,M=NS.M,SUB=NS.SUB,SUPERSAW=NS.SUPERSAW,drone=NS.drone,wind_tex=NS.wind_tex;
/* ---- ambient chill: slow pads, singing bowls, bells, a drone and wind. No drum kit. ---- */
var EVERY4=[0,4,8,12],EVERY2=R(0,8).map(function(i){return i*2});
function pad(cut,a){return function(X,n){SUPERSAW(X,n,{cut:cut,a:a||1.2,r:1.6,g:.2})}}
function bowls(X,L,bars,v){var BOWL=M('bowl');bars.forEach(function(b){N(X,L,'bowl','fx',BOWL,{},X.BR(X.chordAt(b,0),'r')+24,X.T(b,0),4*X.spb,v||.5)})}
function bed(X,wind){if(X.on('base')){drone(X,'drone',X.BR(0,'r'));if(wind)wind_tex(X,'wind')}}
PB.addStyle({id:'ambient',label:'AMBIENT',short:'pads · bells',stripe:'#7fa7d9',nm:'Ambient chill',
 ds:'Slow evolving pads, singing bowls and soft bells over a low drone and wind. No drums: made for long listening.',
 bpm:{gentle:66,quiet:60,theme:72,lively:84,stroll:78,warm:70,tense:76,epic:90},fast:{rush:202,chase:210},
 swing:{def:.5},grid:8,ir:{sec:4.5,damp:.4,pre:.03},revRet:.9,master:[{t:'highshelf',f:7000,g:-3}],dangerCut:1400,
 parts:{pad:{rev:.6,g:.55},bell:{pan:.3,rev:.7,g:.5},lead:{pan:-.1,rev:.5,g:.8},resp:{pan:.2,rev:.6,g:.65},arp:{pan:-.3,rev:.6,g:.4,delay:[.75,.4,.4]},
  bass:{lp:300,g:.9},drone:{g:.9},wind:{g:.55,rev:.3},bowl:{pan:-.3,rev:.6,g:.55},perc:{rev:.4,g:.7},hb:{post:true,g:1}},
 inst:'supersaw pad, singing bowl, celesta, glockenspiel, flute, sub bass, drone, wind',
 arrange:function(X){var id=X.C.arr,CE=M('celesta'),GL=M('glock'),FL=W('flute',{a:.15,r:.4,cut:2400});
  if(id==='gentle'){padSeg(X,'base','pad',pad(1500),{voice:{c:60,add9:'auto'}},ALL,.5);melody(X,{A:{part:'lead',inst:CE,oct:12,v:.5},B:{part:'resp',inst:GL,oct:12,v:.35}});
   bowls(X,'hi',EVERY4,.45);bed(X,true)}
  else if(id==='quiet'){bed(X,true);padSeg(X,'base','pad',pad(900,2),{voice:{c:57}},ALL,.38);bowls(X,'base',EVERY2,.4);
   melody(X,{A:{part:'lead',inst:CE,oct:12,v:.42}})}
  else if(id==='theme'){padSeg(X,'base','pad',pad(1800),{voice:{c:62,add9:'auto'}},ALL,.45);bassl(X,'base','bass',SUB,{},'long',ALL,.6);
   melody(X,{A:{part:'lead',inst:FL,v:.6},B:{part:'resp',inst:CE,oct:12,v:.45}});sparkle(X,'hi','bell',GL,{c:86},ODD2,.25);bed(X,false)}
  else if(id==='lively'){padSeg(X,'base','pad',pad(2200,.6),{voice:{c:62,add9:'auto'}},ALL,.4);arp(X,'base','arp',CE,{voice:{c:72},step:.5,shape:'updown'},ALL,.35);
   bassl(X,'base','bass',SUB,{},'r5',ALL,.65);melody(X,{A:{part:'lead',inst:FL,v:.62},B:{part:'resp',inst:GL,oct:12,v:.4}});bowls(X,'hi',EVERY4,.35)}
  else if(id==='stroll'){padSeg(X,'base','pad',pad(1600),{voice:{c:60}},ALL,.42);bassl(X,'base','bass',SUB,{},'walk',ALL,.6);
   melody(X,{A:{part:'lead',inst:CE,oct:12,v:.5},B:{part:'resp',inst:FL,v:.5}});arp(X,'hi','arp',GL,{voice:{c:76},step:1},ALL,.25);bed(X,true)}
  else if(id==='warm'){padSeg(X,'base','pad',pad(1200),{voice:{c:60,sev:1}},ALL,.48);melody(X,{A:{part:'lead',inst:FL,v:.55},B:{part:'resp',inst:CE,oct:12,v:.4}});
   bassl(X,'base','bass',SUB,{},'long',ALL,.55);bowls(X,'hi',EVERY4,.4);bed(X,false)}
  else if(id==='tense'){bed(X,true);padSeg(X,'base','pad',pad(700,1.5),{voice:{c:52,n:2}},ALL,.45);hearts(X,ALL,.7);
   melody(X,{A:{part:'lead',inst:CE,v:.5},B:{part:'resp',inst:FL,oct:-12,v:.45}});EVERY4.forEach(function(b){D(X,'hi','perc','taiko',X.T(b,0),.45)})}
  else if(id==='epic'){padSeg(X,'base','pad',pad(3000,.5),{voice:{c:62}},ALL,.5);arp(X,'base','arp',CE,{voice:{c:74},step:.5},ALL,.32);bassl(X,'base','bass',SUB,{},'long',ALL,.7);
   melody(X,{A:{part:'lead',inst:FL,v:.7,dbl:{part:'bell',inst:CE,oct:12,v:.35}},B:{part:'resp',inst:GL,oct:12,v:.45}});
   ALL.forEach(function(b){D(X,'base','perc','taiko',X.T(b,0),b%4===0?.8:.5)});bowls(X,'hi',EVERY4,.45)}}});
})();
