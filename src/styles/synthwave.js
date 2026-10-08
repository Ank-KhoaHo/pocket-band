(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,ALL=NS.ALL,ODD2=NS.ODD2,block=NS.block,padSeg=NS.padSeg,arp=NS.arp,ost=NS.ost,bassl=NS.bassl,melody=NS.melody,harm=NS.harm,
 drums=NS.drums,fill=NS.fill,sparkle=NS.sparkle,hearts=NS.hearts,W=NS.W,M=NS.M,SUPERSAW=NS.SUPERSAW,SAWARP=NS.SAWARP,CH=NS.CH;
/* ---- synthwave: 80s supersaw pads, a saw arp bass, analog brass, gated snare ---- */
function pad(cut,a){return function(X,n){SUPERSAW(X,n,{cut:cut,a:a||.5,r:.6,g:.22})}}
var BEAT={kick:'x...x...x...x...',gsnare:'....x.......x...'},HATS={hat:'o.o.o.o.o.o.o.o.'};
PB.addStyle({id:'synthwave',label:'SYNTHWAVE',short:'saw · gated snare',stripe:'#e04fa0',nm:'Synthwave',
 ds:'Wide detuned supersaw pads, a pulsing saw bass, analog brass leads and a big gated snare. Night-drive 80s.',
 bpm:{gentle:88,quiet:84,theme:100,lively:118,stroll:108,warm:96,tense:112,epic:128},fast:{rush:206,chase:220},
 swing:{def:.5},grid:16,ir:{sec:2.4,damp:.55,pre:.02},revRet:.6,sat:1.2,master:[{t:'lowshelf',f:120,g:2},{t:'highshelf',f:9000,g:-1.5}],dangerCut:1300,
 parts:{pad:{rev:.45,g:.6},bass:{rev:.02,g:.95,lp:2200},lead:{pan:.1,rev:.35,g:.85,delay:[.75,.35,.4]},resp:{pan:-.2,rev:.35,g:.75},
  arp:{pan:-.3,rev:.25,g:.45,delay:[.5,.3,.35]},kick:{g:1,rev:.02},snare:{rev:.4,g:.75},hat:{pan:.25,rev:.05,g:.5,lp:10000},sp:{pan:.35,rev:.5,g:.4},hb:{post:true,g:1}},
 inst:'supersaw pad, saw arp bass, analog brass, pulse arpeggio, gated snare, drum machine kick and hats',
 arrange:function(X){var id=X.C.arr,BR=W('analogbrass'),PL=CH(.25,{vib:8,g:.09}),ARP=CH(.5,{g:.07,s:.4,dec:.08}),GL=M('glock');
  if(id==='gentle'){padSeg(X,'base','pad',pad(1800,.8),{voice:{c:60,add9:'auto'}},ALL,.45);bassl(X,'base','bass',SAWARP,{oct:12},'long',R(4,16),.6);
   melody(X,{A:{part:'lead',inst:PL,v:.6},B:{part:'resp',inst:GL,oct:12,v:.4}});drums(X,'hi','hat',HATS,R(8,16),.4)}
  else if(id==='quiet'){padSeg(X,'base','pad',pad(1000,1.2),{voice:{c:57}},ALL,.42);ost(X,'base','bass',SAWARP,{step:.5,oct:12},ALL,.4);
   melody(X,{A:{part:'lead',inst:PL,v:.5}})}
  else if(id==='theme'){padSeg(X,'base','pad',pad(2200),{voice:{c:62,add9:'auto'}},ALL,.42);ost(X,'base','bass',SAWARP,{step:.25,oct:12},ALL,.45);
   melody(X,{A:{part:'lead',inst:BR,v:.65},B:{part:'resp',inst:PL,v:.55}});drums(X,'hi','kick',BEAT,R(4,16),.8);drums(X,'hi','hat',HATS,R(4,16),.45)}
  else if(id==='lively'){padSeg(X,'base','pad',pad(2800),{voice:{c:62}},ALL,.4);bassl(X,'base','bass',SAWARP,{oct:12},'oct8',ALL,.6);
   arp(X,'base','arp',ARP,{voice:{c:74},step:.25,n:4},ALL,.3);melody(X,{A:{part:'lead',inst:BR,v:.75},B:{part:'resp',inst:PL,v:.65}});
   harm(X,'hi','sp',PL,{},R(12,16),-2,0,.4);drums(X,'base','kick',BEAT,ALL,.9);drums(X,'hi','hat',HATS,ALL,.5);fill(X,'base','kick','gsnare',[7,15],.6)}
  else if(id==='stroll'){padSeg(X,'base','pad',pad(2000),{voice:{c:60}},ALL,.4);bassl(X,'base','bass',SAWARP,{oct:12},'walk',ALL,.6);
   melody(X,{A:{part:'lead',inst:PL,v:.7},B:{part:'resp',inst:BR,v:.6}});drums(X,'hi','kick',{kick:'x.......x.......',gsnare:'....x.......x...'},ALL,.75);drums(X,'hi','hat',{hat:'..o...o...o...o.'},ALL,.45)}
  else if(id==='warm'){padSeg(X,'base','pad',pad(1600,.7),{voice:{c:60,sev:1}},ALL,.45);ost(X,'base','bass',SAWARP,{step:.5,alt:1,oct:12},ALL,.5);
   melody(X,{A:{part:'lead',inst:BR,v:.65},B:{part:'resp',inst:GL,oct:12,v:.4}});drums(X,'hi','kick',BEAT,ALL,.7);sparkle(X,'hi','sp',GL,{c:86},ODD2,.25)}
  else if(id==='tense'){padSeg(X,'base','pad',pad(900,.3),{voice:{c:52,n:2}},ALL,.45);ost(X,'base','bass',SAWARP,{step:.25,alt:1,oct:12},ALL,.5);hearts(X,ALL);
   melody(X,{A:{part:'lead',inst:PL,v:.65},B:{part:'resp',inst:BR,oct:-12,v:.55}});drums(X,'hi','hat',{hat:'..g...g...g...g.'},ALL,.6)}
  else if(id==='epic'){padSeg(X,'base','pad',pad(3500,.2),{voice:{c:62}},ALL,.45);bassl(X,'base','bass',SAWARP,{oct:12},'ost8',ALL,.65);
   arp(X,'base','arp',ARP,{voice:{c:76},step:.25},ALL,.3);melody(X,{A:{part:'lead',inst:BR,v:.85,dbl:{part:'sp',inst:PL,oct:12,v:.4}},B:{part:'resp',inst:PL,v:.75}});
   drums(X,'base','kick',{kick:'x...x...x...x...',gsnare:'....x.......x...'},ALL,1);drums(X,'hi','hat',{hat:'oooooooooooooooo'},ALL,.4);block(X,'hi','pad',pad(3500,.01),{voice:{c:64}},[[3.5,.4]],ALL,.4);fill(X,'base','kick','gsnare',[3,7,11,15],.65)}}});
})();
