(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,mtof=NS.mtof,ALL=NS.ALL,ODD2=NS.ODD2,pick=NS.pick,strum=NS.strum,block=NS.block,padSeg=NS.padSeg,arp=NS.arp,ost=NS.ost,bassl=NS.bassl,melody=NS.melody,harm=NS.harm,drums=NS.drums,fill=NS.fill,sparkle=NS.sparkle,hearts=NS.hearts,N=NS.N;
var W=NS.W,M=NS.M,EP=NS.EP,SUB=NS.SUB,SAWB=NS.SAWB,CH=NS.CH,GTR=NS.GTR,MAND=NS.MAND,BASSU=NS.BASSU,PIZZ=NS.PIZZ,PIZZC=NS.PIZZC,HARP=NS.HARP,GTRM=NS.GTRM,trem=NS.trem,D=NS.D,tone=NS.tone,birds=NS.birds,crickets=NS.crickets,crackle=NS.crackle,ks=NS.ks;
/* ---- (a) cozy acoustic folk ---- */
PB.addStyle({id:'folk',label:'FOLK',short:'guitar · fiddle',stripe:'#c97b3a',nm:'Cozy acoustic folk',
 ds:'Fingerpicked guitar and mandolin; tin whistle and fiddle trade the tune; upright bass, cajon, shaker.',
 bpm:{gentle:84,lively:116,warm:96,quiet:70,theme:96,stroll:104,tense:112,epic:136},fast:{rush:210,chase:228},
 swing:{def:.56,lively:.58,epic:.52,tense:.52},grid:8,ir:{sec:1.7,damp:.7,pre:.012},revRet:.55,master:[{t:'peaking',f:260,g:-1.5,q:.8}],dangerCut:1700,
 parts:{gtr:{pan:-.22,rev:.16,g:.55,hp:70,pk:[2600,2.5,1.2]},mand:{pan:.32,rev:.18,g:.34,hp:200},lead:{pan:.08,rev:.22,g:.95},resp:{pan:-.14,rev:.24,g:.9},harm:{pan:.26,rev:.22,g:.55},
  bass:{pan:0,rev:.05,g:.95,lp:1300},acc:{pan:.2,rev:.2,g:.6},kick:{pan:0,rev:.04,g:.9},perc:{pan:.15,rev:.08,g:.75},shak:{pan:.36,rev:.06,g:.7},glk:{pan:.3,rev:.32,g:.45},nat:{rev:.25,g:.6},hb:{post:true,g:1},fid:{pan:-.3,rev:.15,g:.5}},
 inst:'guitar, mandolin, tin whistle, fiddle, accordion, upright bass, cajon, shaker, tambourine, glockenspiel',
 arrange:function(X){var id=X.C.arr,WH=W('whistle'),FD=W('fiddle'),AC=W('accordion'),GL=M('glock');
  var travis=[[0,'R',1.9],[.5,2,1.4,.7],[1,'F',1.4,.85],[1.5,1,1,.7],[2,'R',1.9,.9],[2.5,2,1.4,.7],[3,'F',1.4,.85],[3.5,0,1,.65]];
  var caj={cajon:'x.....o.x.......',slap:'....x.......x...'};
  if(id==='gentle'){pick(X,'base','gtr',GTR,{voice:{c:62}},travis,ALL,.5);bassl(X,'base','bass',BASSU,{},'long',R(4,16),.7);
   melody(X,{A:{part:'lead',inst:WH,oct:12,v:.75},B:{part:'resp',inst:GL,oct:12,v:.55}});drums(X,'hi','shak',{shaker:'o.o.o.o.'},R(8,16),.7);
   sparkle(X,'hi','glk',GL,{c:86},[7,15],.3);birds(X,'base',ALL,.7)}
  else if(id==='lively'){strum(X,'base','gtr',GTR,{voice:{c:60}},'D.DU.UDU',ALL,.5);block(X,'hi','mand',MAND,{voice:{c:72},damp:.03},[[1,.3],[3,.3]],ALL,.42);
   bassl(X,'base','bass',BASSU,{},'r5w',ALL,.85);melody(X,{A:{part:'lead',inst:FD,v:.85},B:{part:'resp',inst:WH,oct:12,v:.78}});harm(X,'hi','harm',AC,{},R(12,16),-2,0,.55);
   drums(X,'base','kick',caj,ALL,.9);drums(X,'hi','shak',{shaker:'o.o.o.o.'},ALL,.8);drums(X,'hi','perc',{tamb:'..x...x.'},ALL,.7);drums(X,'hi','perc',{clap:'..x...x.'},R(12,16),.7);fill(X,'base','kick','slap',[7,15],.8)}
  else if(id==='warm'){padSeg(X,'base','acc',AC,{voice:{c:62}},ALL,.45);pick(X,'base','gtr',GTR,{voice:{c:62}},travis,ALL,.42);bassl(X,'base','bass',BASSU,{},'r5',ALL,.8);
   melody(X,{A:{part:'lead',inst:FD,v:.8},B:{part:'resp',inst:trem(MAND,.125),v:.6}});drums(X,'hi','perc',{brush:'..x...x.'},ALL,.8);drums(X,'hi','kick',{cajon:'x.......x.......'},ALL,.6);drums(X,'hi','shak',{shaker:'.o.o.o.o'},ALL,.6)}
  else if(id==='quiet'){pick(X,'base','gtr',GTR,{voice:{c:60}},[[0,'R',3],[1,1,2.5,.7],[2,2,2,.7],[3,1,1.5,.6]],ALL,.42);bassl(X,'base','bass',BASSU,{},'long',ALL,.55);
   melody(X,{A:{part:'lead',inst:WH,v:.58},B:{part:'resp',inst:GL,oct:12,v:.4}});crickets(X,'base',ALL);padSeg(X,'hi','acc',W('accordion',{a:.4,r:.6}),{voice:{c:57}},R(8,16),.32)}
  else if(id==='theme'){pick(X,'base','gtr',GTR,{voice:{c:62}},travis,ALL,.5);bassl(X,'base','bass',BASSU,{},'r5',ALL,.75);melody(X,{A:{part:'lead',inst:WH,v:.75},B:{part:'resp',inst:MAND,v:.75}});
   drums(X,'hi','kick',{cajon:'x.......x.......',slap:'....o.......o...'},R(4,16),.7);drums(X,'hi','shak',{shaker:'o.o.o.o.'},R(4,16),.6);sparkle(X,'hi','glk',GL,{c:86},ODD2,.3);birds(X,'base',ALL,.35)}
  else if(id==='stroll'){bassl(X,'base','bass',BASSU,{},'walk',ALL,.85);strum(X,'base','gtr',GTR,{voice:{c:62},damp:.05},'..D...D.',ALL,.45);
   melody(X,{A:{part:'lead',inst:MAND,v:.85},B:{part:'resp',inst:WH,oct:12,v:.72}});drums(X,'hi','shak',{shaker:'o.o.o.o.'},ALL,.7);drums(X,'hi','perc',{wood:'o.g.o.g.'},ALL,.6,{f:760});birds(X,'base',ALL,.3)}
  else if(id==='tense'){ost(X,'base','fid',W('fiddle',{a:.01,r:.04}),{step:.25,alt:1,oct:12,gate:.7},ALL,.4);bassl(X,'base','bass',BASSU,{},'long',ALL,.7);
   drums(X,'base','kick',{cajon:'x..x..x.....x...'},ALL,.9);hearts(X,ALL);melody(X,{A:{part:'lead',inst:WH,v:.7},B:{part:'resp',inst:FD,oct:-12,v:.6}});
   strum(X,'hi','gtr',GTRM,{voice:{c:55}},'xxxxxxxx',ALL,.5);drums(X,'hi','shak',{shaker:'oooooooooooooooo'},ALL,.45)}
  else if(id==='epic'){strum(X,'base','gtr',GTR,{voice:{c:60},step:.25,spread:.008},'D.DU.UDUD.DU.UDU',ALL,.45);bassl(X,'base','bass',BASSU,{},'ost8',ALL,.9);
   melody(X,{A:{part:'lead',inst:FD,v:.9},B:{part:'resp',inst:AC,v:.75,dbl:{part:'harm',inst:WH,oct:12,v:.55,bars:R(8,16)}}});
   drums(X,'base','kick',{cajon:'x...x...x...x...',slap:'....x.......x...'},ALL,.95);R(0,16).filter(function(b){return b%4===0}).forEach(function(b){D(X,'base','kick','tom',X.T(b,0),.9,{f:70})});
   drums(X,'hi','perc',{clap:'..x...x.',tamb:'g.o.g.o.g.o.g.o.'},ALL,.75);block(X,'hi','acc',AC,{voice:{c:64}},[[3.5,.4]],ALL,.5);fill(X,'base','kick','slap',[7,15],.85)}}});
})();
