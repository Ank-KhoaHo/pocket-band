(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,ALL=NS.ALL,ODD2=NS.ODD2,pick=NS.pick,strum=NS.strum,padSeg=NS.padSeg,bassl=NS.bassl,melody=NS.melody,harm=NS.harm,
 drums=NS.drums,fill=NS.fill,sparkle=NS.sparkle,hearts=NS.hearts,D=NS.D,W=NS.W,M=NS.M,NYLON=NS.NYLON,BASSU=NS.BASSU,EP=NS.EP,birds=NS.birds;
/* ---- bossa nova: nylon guitar comping, flute, upright bass, rim click, shaker and surdo ---- */
/* the bossa comp: thumb on the root (beats 1 and 3), fingers on the off-beats */
var COMP=[[0,'R',1],[.5,1,.5,.8],[1.5,2,.5,.85],[2,'F',1,.9],[2.5,1,.5,.8],[3,2,.5,.75],[3.5,1,.5,.8]];
var GROOVE={rim:'x..x..x...x..x..',shaker:'oooooooooooooooo'};
PB.addStyle({id:'bossa',label:'BOSSA',short:'nylon · shaker',stripe:'#e0a03c',nm:'Bossa nova',
 ds:'Nylon-string guitar comping on sevenths, a breathy flute on the tune, upright bass, rim clicks, shaker and surdo.',
 bpm:{gentle:80,quiet:72,theme:100,lively:124,stroll:110,warm:92,tense:108,epic:130},fast:{rush:204,chase:216},
 swing:{def:.54,lively:.52},grid:16,ir:{sec:1.5,damp:.7,pre:.012},revRet:.5,master:[{t:'highshelf',f:8000,g:-1.5}],dangerCut:1600,
 parts:{gtr:{pan:-.2,rev:.18,g:.65,hp:80},lead:{pan:.1,rev:.28,g:.9},resp:{pan:-.15,rev:.26,g:.75},ep:{pan:.25,rev:.25,g:.5,lp:4000},
  bass:{rev:.05,g:.95,lp:1200},perc:{pan:.2,rev:.1,g:.6},shak:{pan:.35,rev:.06,g:.5},surdo:{rev:.08,g:.85},nat:{rev:.25,g:.5},hb:{post:true,g:1}},
 inst:'nylon guitar, flute, vibraphone, Rhodes, upright bass, rim click, shaker, surdo',
 arrange:function(X){var id=X.C.arr,FL=W('flute'),VB=M('vibes'),GV={c:60,sev:1,add9:'auto'};
  function surdo(bars,v){bars.forEach(function(b){D(X,'base','surdo','surdo',X.T(b,0),(v||.7)*.8);D(X,'base','surdo','surdo',X.T(b,2),v||.7)})}
  if(id==='gentle'){pick(X,'base','gtr',NYLON,{voice:GV},COMP,ALL,.48);bassl(X,'base','bass',BASSU,{},'r5',R(4,16),.65);
   melody(X,{A:{part:'lead',inst:FL,v:.62},B:{part:'resp',inst:VB,v:.5}});drums(X,'hi','shak',{shaker:'oooooooooooooooo'},R(8,16),.4);birds(X,'base',ALL,.3)}
  else if(id==='quiet'){pick(X,'base','gtr',NYLON,{voice:GV},[[0,'R',2],[1,0,1.5,.7],[2,1,1.5,.7],[3,2,1,.6]],ALL,.42);bassl(X,'base','bass',BASSU,{},'long',ALL,.5);
   melody(X,{A:{part:'lead',inst:FL,v:.5},B:{part:'resp',inst:NYLON,oct:12,v:.45}})}
  else if(id==='theme'){pick(X,'base','gtr',NYLON,{voice:GV},COMP,ALL,.5);bassl(X,'base','bass',BASSU,{},'r5',ALL,.75);
   melody(X,{A:{part:'lead',inst:FL,v:.72},B:{part:'resp',inst:VB,v:.6}});drums(X,'hi','perc',GROOVE,R(4,16),.6);surdo(R(4,16),.5)}
  else if(id==='lively'){strum(X,'base','gtr',NYLON,{voice:GV,step:.25,damp:.05},'D..d.d..D..d.d.u',ALL,.48);bassl(X,'base','bass',BASSU,{},'r5w',ALL,.82);
   melody(X,{A:{part:'lead',inst:FL,v:.82},B:{part:'resp',inst:VB,v:.7}});harm(X,'hi','ep',EP,{},R(12,16),-2,0,.4);
   drums(X,'base','perc',GROOVE,ALL,.75);surdo(ALL,.75);fill(X,'hi','perc','rim',[7,15],.5)}
  else if(id==='stroll'){bassl(X,'base','bass',BASSU,{},'walk',ALL,.8);pick(X,'base','gtr',NYLON,{voice:GV},COMP,ALL,.42);
   melody(X,{A:{part:'lead',inst:VB,v:.7},B:{part:'resp',inst:FL,v:.65}});drums(X,'hi','shak',{shaker:'o.o.o.o.o.o.o.o.'},ALL,.5)}
  else if(id==='warm'){padSeg(X,'base','ep',EP,{voice:GV,roll:.03},ALL,.4);pick(X,'base','gtr',NYLON,{voice:GV},COMP,ALL,.42);bassl(X,'base','bass',BASSU,{},'r5',ALL,.72);
   melody(X,{A:{part:'lead',inst:FL,v:.7},B:{part:'resp',inst:VB,v:.55}});drums(X,'hi','perc',{rim:'x..x..x...x..x..'},ALL,.45);sparkle(X,'hi','ep',VB,{c:84},ODD2,.25)}
  else if(id==='tense'){pick(X,'base','gtr',NYLON,{voice:{c:55,sev:1}},[[0,'R',.5],[.5,0,.4],[1,1,.4],[1.5,2,.4],[2,'R',.5],[2.5,0,.4],[3,1,.4],[3.5,2,.4]],ALL,.45);
   bassl(X,'base','bass',BASSU,{},'long',ALL,.65);hearts(X,ALL);melody(X,{A:{part:'lead',inst:FL,v:.65},B:{part:'resp',inst:VB,oct:-12,v:.5}});
   drums(X,'hi','perc',{rim:'x..x..x.........'},ALL,.5)}
  else if(id==='epic'){strum(X,'base','gtr',NYLON,{voice:GV,step:.25,damp:.05},'D.uD.uD.D.uD.uDu',ALL,.5);bassl(X,'base','bass',BASSU,{},'r5w',ALL,.88);
   melody(X,{A:{part:'lead',inst:FL,v:.9,dbl:{part:'resp',inst:VB,oct:12,v:.4}},B:{part:'ep',inst:EP,v:.7}});
   drums(X,'base','perc',{rim:'x..x..x...x..x..',shaker:'oooooooooooooooo',tamb:'..x...x...x...x.'},ALL,.85);surdo(ALL,.9);fill(X,'base','surdo','surdo',[7,15],.6)}}});
})();
