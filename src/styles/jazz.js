(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,ALL=NS.ALL,ODD2=NS.ODD2,block=NS.block,padSeg=NS.padSeg,bassl=NS.bassl,melody=NS.melody,harm=NS.harm,
 drums=NS.drums,fill=NS.fill,sparkle=NS.sparkle,hearts=NS.hearts,W=NS.W,M=NS.M,EP=NS.EP,BASSU=NS.BASSU,PIANO=NS.PIANO;
/* ---- jazz café: Rhodes and piano comping, walking upright bass, brushes and ride, muted trumpet ---- */
var RIDE={ride:'x.xxx.xx',hat:'..x...x.'},BRUSH={brush:'..x...x.'};
PB.addStyle({id:'jazz',label:'JAZZ CAFÉ',short:'rhodes · brushes',stripe:'#b3543c',nm:'Jazz café',
 ds:'Rhodes and piano comping on sevenths, a walking upright bass, brushes and ride cymbal, a muted trumpet on the tune.',
 bpm:{gentle:84,quiet:76,theme:108,lively:144,stroll:120,warm:96,tense:132,epic:160},fast:{rush:220,chase:232},
 swing:{def:.64,lively:.62,epic:.6},grid:8,ir:{sec:1.6,damp:.75,pre:.015},revRet:.5,master:[{t:'lowshelf',f:180,g:1.5},{t:'highshelf',f:8000,g:-2}],dangerCut:1500,
 parts:{ep:{pan:-.15,rev:.22,g:.7,lp:4500},pno:{pan:.2,rev:.25,g:.75},lead:{pan:.05,rev:.28,g:.95},resp:{pan:-.25,rev:.3,g:.75},vib:{pan:.3,rev:.3,g:.7},
  bass:{rev:.05,g:1,lp:1500},ride:{pan:.3,rev:.12,g:.55},kick:{g:.75,rev:.05},snare:{pan:-.1,rev:.15,g:.7},hb:{post:true,g:1}},
 inst:'Rhodes electric piano, acoustic piano, vibraphone, muted trumpet, upright bass, brushes, ride cymbal',
 arrange:function(X){var id=X.C.arr,TP=W('mutetrumpet'),VB=M('vibes',{trem:1}),EV={c:62,sev:1,add9:'auto'},PV={c:60,sev:1};
  if(id==='gentle'){block(X,'base','ep',EP,{voice:EV,roll:.03},[[0,3.8]],ALL,.45);bassl(X,'base','bass',BASSU,{},'r5',ALL,.7);
   melody(X,{A:{part:'vib',inst:VB,v:.6},B:{part:'pno',inst:PIANO,oct:12,v:.5}});drums(X,'hi','snare',BRUSH,R(4,16),.6)}
  else if(id==='quiet'){block(X,'base','pno',PIANO,{voice:PV,roll:.04},[[0,3.8]],ALL,.38);bassl(X,'base','bass',BASSU,{},'long',ALL,.55);
   melody(X,{A:{part:'vib',inst:VB,v:.5},B:{part:'pno',inst:PIANO,oct:12,v:.4}});drums(X,'hi','snare',{brush:'....x.......x...'},ALL,.45)}
  else if(id==='theme'){block(X,'base','ep',EP,{voice:EV,roll:.015},[[0,1.4],[1.75,.5],[3,.8]],ALL,.45);bassl(X,'base','bass',BASSU,{},'walk',ALL,.8);
   melody(X,{A:{part:'lead',inst:TP,v:.75},B:{part:'pno',inst:PIANO,oct:12,v:.55}});drums(X,'base','ride',RIDE,ALL,.6);drums(X,'hi','snare',BRUSH,ALL,.5)}
  else if(id==='lively'){block(X,'base','ep',EP,{voice:EV},[[0,.6],[1.5,.4]],ALL,.48);bassl(X,'base','bass',BASSU,{},'walk',ALL,.85);
   melody(X,{A:{part:'lead',inst:TP,v:.85},B:{part:'vib',inst:VB,v:.7}});harm(X,'hi','pno',PIANO,{},R(12,16),-2,12,.45);
   drums(X,'base','ride',RIDE,ALL,.7);drums(X,'base','kick',{kick:'x.......'},ALL,.5);drums(X,'hi','snare',{brush:'..x..xx.'},ALL,.55);fill(X,'hi','snare','snare',[7,15],.4)}
  else if(id==='stroll'){block(X,'base','pno',PIANO,{voice:PV},[[.5,.5],[2.5,.5]],ALL,.42);bassl(X,'base','bass',BASSU,{},'walk',ALL,.8);
   melody(X,{A:{part:'vib',inst:VB,v:.7},B:{part:'lead',inst:TP,v:.65}});drums(X,'base','ride',{ride:'x.x.x.x.',hat:'..x...x.'},ALL,.5);sparkle(X,'hi','vib',VB,{c:84},ODD2,.25)}
  else if(id==='warm'){padSeg(X,'base','ep',EP,{voice:EV,roll:.03},ALL,.42);bassl(X,'base','bass',BASSU,{},'r5',ALL,.72);
   melody(X,{A:{part:'lead',inst:TP,v:.7},B:{part:'vib',inst:VB,v:.55}});drums(X,'hi','snare',BRUSH,ALL,.55);drums(X,'hi','ride',{ride:'x...x...'},ALL,.4)}
  else if(id==='tense'){block(X,'base','ep',EP,{voice:{c:56,sev:1},roll:.05},[[0,3.8]],ALL,.42);bassl(X,'base','bass',BASSU,{},'ost8',ALL,.65);hearts(X,ALL);
   melody(X,{A:{part:'vib',inst:VB,v:.7},B:{part:'lead',inst:TP,oct:-12,v:.6}});drums(X,'hi','ride',{ride:'x.x.x.x.'},ALL,.45)}
  else if(id==='epic'){block(X,'base','pno',PIANO,{voice:PV},[[0,.4],[1.5,.3],[2.5,.3]],ALL,.5);block(X,'hi','ep',EP,{voice:EV},[[3.5,.4]],ALL,.4);
   bassl(X,'base','bass',BASSU,{},'walk',ALL,.9);melody(X,{A:{part:'lead',inst:TP,v:.9,dbl:{part:'vib',inst:VB,oct:12,v:.4}},B:{part:'pno',inst:PIANO,oct:12,v:.7}});
   drums(X,'base','ride',RIDE,ALL,.8);drums(X,'base','kick',{kick:'x...x...'},ALL,.6);drums(X,'base','snare',{snare:'..g..g.g'},ALL,.5);fill(X,'base','snare','snare',[3,7,11,15],.55)}}});
})();
