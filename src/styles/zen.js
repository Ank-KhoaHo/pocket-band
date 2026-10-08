(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,ALL=NS.ALL,ODD2=NS.ODD2,pick=NS.pick,arp=NS.arp,ost=NS.ost,bassl=NS.bassl,melody=NS.melody,harm=NS.harm,
 drums=NS.drums,fill=NS.fill,sparkle=NS.sparkle,hearts=NS.hearts,N=NS.N,D=NS.D,W=NS.W,M=NS.M,KOTO=NS.KOTO,SUB=NS.SUB,wind_tex=NS.wind_tex;
/* ---- zen: koto and shakuhachi, temple bells, bowls and taiko. Every note snaps to the pentatonic scale (penta). ---- */
var EVERY4=[0,4,8,12];
var KOTO_ROLL=[[0,'R',2],[.5,0,1.5],[1,1,1.5],[1.5,2,1.5,.8],[3,1,1,.7]];
function bells(X,L,kind,bars,v,oct){var B=M(kind);bars.forEach(function(b){N(X,L,'bell','fx',B,{},X.BR(X.chordAt(b,0),'r')+(oct||36),X.T(b,0),4*X.spb,v||.4)})}
PB.addStyle({id:'zen',label:'ZEN',short:'koto · flute',stripe:'#c0392b',nm:'Zen garden',penta:true,
 ds:'A plucked koto and a breathy shakuhachi on a five-note scale, with temple bells, singing bowls and low taiko.',
 bpm:{gentle:66,quiet:56,theme:76,lively:92,stroll:84,warm:72,tense:80,epic:100},fast:{rush:202,chase:212},
 swing:{def:.5},grid:8,ir:{sec:3.2,damp:.5,pre:.025},revRet:.8,master:[{t:'highshelf',f:7500,g:-2}],dangerCut:1500,
 parts:{koto:{pan:-.2,rev:.35,g:.65,hp:120},lead:{pan:.1,rev:.4,g:.9},resp:{pan:-.25,rev:.4,g:.7},bell:{pan:.3,rev:.6,g:.5},
  bass:{lp:260,g:.8},taiko:{rev:.3,g:.9},wind:{g:.45,rev:.3},hb:{post:true,g:1}},
 inst:'koto, shakuhachi, temple bell, singing bowl, taiko, sub bass',
 arrange:function(X){var id=X.C.arr,SH=W('shakuhachi');
  function taiko(bars,v){bars.forEach(function(b){D(X,'base','taiko','taiko',X.T(b,0),v||.7)})}
  if(id==='gentle'){pick(X,'base','koto',KOTO,{voice:{c:62}},KOTO_ROLL,ALL,.48);melody(X,{A:{part:'lead',inst:SH,v:.62},B:{part:'resp',inst:KOTO,oct:12,v:.5}});
   bells(X,'hi','templebell',EVERY4,.35);if(X.on('base'))wind_tex(X,'wind')}
  else if(id==='quiet'){pick(X,'base','koto',KOTO,{voice:{c:60}},[[0,'R',3],[2,1,2,.7]],ALL,.4);bells(X,'base','bowl',[0,4,8,12],.4,24);
   melody(X,{A:{part:'lead',inst:SH,v:.5}});if(X.on('base'))wind_tex(X,'wind')}
  else if(id==='theme'){pick(X,'base','koto',KOTO,{voice:{c:62}},KOTO_ROLL,ALL,.5);bassl(X,'base','bass',SUB,{},'long',ALL,.55);
   melody(X,{A:{part:'lead',inst:SH,v:.7},B:{part:'resp',inst:KOTO,oct:12,v:.6}});taiko(EVERY4,.45);bells(X,'hi','templebell',[0,8],.3)}
  else if(id==='lively'){arp(X,'base','koto',KOTO,{voice:{c:64},step:.5,shape:'updown'},ALL,.45);bassl(X,'base','bass',SUB,{},'r5',ALL,.6);
   melody(X,{A:{part:'lead',inst:SH,v:.78},B:{part:'resp',inst:KOTO,oct:12,v:.68}});harm(X,'hi','resp',KOTO,{},R(12,16),-2,12,.4);
   drums(X,'base','taiko',{taiko:'x.......x...x...'},ALL,.6);drums(X,'hi','taiko',{frame:'..o...o...o...o.'},ALL,.4)}
  else if(id==='stroll'){bassl(X,'base','bass',SUB,{},'walk',ALL,.55);pick(X,'base','koto',KOTO,{voice:{c:62}},[[0,'R',1],[1,1,1],[2,'F',1],[3,2,1]],ALL,.45);
   melody(X,{A:{part:'lead',inst:KOTO,oct:12,v:.7},B:{part:'resp',inst:SH,v:.65}});drums(X,'hi','taiko',{frame:'x...o...x...o...'},ALL,.45)}
  else if(id==='warm'){pick(X,'base','koto',KOTO,{voice:{c:60}},KOTO_ROLL,ALL,.45);bassl(X,'base','bass',SUB,{},'long',ALL,.5);
   melody(X,{A:{part:'lead',inst:SH,v:.7},B:{part:'resp',inst:KOTO,oct:12,v:.55}});bells(X,'hi','bowl',EVERY4,.4,24);sparkle(X,'hi','bell',M('templebell'),{c:84},ODD2,.2)}
  else if(id==='tense'){ost(X,'base','koto',KOTO,{step:.25,alt:1,oct:24,gate:.6},ALL,.42);hearts(X,ALL);taiko(EVERY4,.65);
   melody(X,{A:{part:'lead',inst:SH,v:.62},B:{part:'resp',inst:KOTO,v:.5}});if(X.on('base'))wind_tex(X,'wind')}
  else if(id==='epic'){arp(X,'base','koto',KOTO,{voice:{c:64},step:.25},ALL,.45);bassl(X,'base','bass',SUB,{},'long',ALL,.65);
   melody(X,{A:{part:'lead',inst:SH,v:.88,dbl:{part:'resp',inst:KOTO,oct:12,v:.45}},B:{part:'resp',inst:KOTO,oct:12,v:.7}});
   drums(X,'base','taiko',{taiko:'x..x..x.x...x.x.'},ALL,.85);bells(X,'hi','templebell',EVERY4,.4);fill(X,'base','taiko','taiko',[7,15],.6)}}});
})();
