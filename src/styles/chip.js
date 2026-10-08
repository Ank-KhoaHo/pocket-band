(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,mtof=NS.mtof,ALL=NS.ALL,ODD2=NS.ODD2,pick=NS.pick,strum=NS.strum,block=NS.block,padSeg=NS.padSeg,arp=NS.arp,ost=NS.ost,bassl=NS.bassl,melody=NS.melody,harm=NS.harm,drums=NS.drums,fill=NS.fill,sparkle=NS.sparkle,hearts=NS.hearts,N=NS.N;
var W=NS.W,M=NS.M,EP=NS.EP,SUB=NS.SUB,SAWB=NS.SAWB,CH=NS.CH,GTR=NS.GTR,MAND=NS.MAND,BASSU=NS.BASSU,PIZZ=NS.PIZZ,PIZZC=NS.PIZZC,HARP=NS.HARP,GTRM=NS.GTRM,trem=NS.trem,D=NS.D,tone=NS.tone,birds=NS.birds,crickets=NS.crickets,crackle=NS.crackle,ks=NS.ks;
/* ---- (d) chiptune-folk hybrid ---- */
PB.addStyle({id:'chip',label:'CHIPTUNE',short:'pulse · triangle',stripe:'#4ab0a0',nm:'Chiptune-folk hybrid',
 ds:'Pulse-wave lead with a tin whistle; fast chip arpeggios; triangle bass; 8-bit noise drums with a real kick and guitar.',
 bpm:{gentle:100,lively:132,warm:116,quiet:90,theme:120,stroll:126,tense:132,epic:152},
 swing:{def:.5,stroll:.56,gentle:.54,quiet:.54},grid:8,ir:{sec:1.2,damp:.5,pre:.008},revRet:.4,dangerCut:1800,
 parts:{ld:{pan:.1,rev:.18,g:.75},ld2:{pan:-.2,rev:.2,g:.6,delay:[.75,.35,.45]},arp:{pan:-.25,rev:.12,g:.45},tri:{rev:.02,g:.95},nz:{pan:.2,rev:.06,g:.6},kick:{g:.9,rev:.02},gtr:{pan:.3,rev:.14,g:.5,hp:90},
  wh:{pan:-.1,rev:.24,g:.8},glk:{pan:.3,rev:.3,g:.42},nat:{rev:.25,g:.5},hb:{post:true,g:1}},
 inst:'pulse waves (12.5 %, 25 %, 50 %), triangle bass, 8-bit noise drums, acoustic kick and shaker, guitar, tin whistle, glockenspiel',
 arrange:function(X){var id=X.C.arr,P25=CH(.25,{vib:10,slide:-40}),P12=CH(.125,{vib:12}),P50=CH(.5,{g:.08,s:.4,dec:.08}),SQ=CH(.5,{vib:14,g:.1}),TRI=CH(0,{wave:'tri',g:.42,s:.9}),WH=W('whistle'),GL=M('glock');
  var travis=[[0,'R',1.9],[.5,2,1.4,.7],[1,'F',1.4,.85],[1.5,1,1,.7],[2,'R',1.9,.9],[2.5,2,1.4,.7],[3,'F',1.4,.85],[3.5,0,1,.65]];
  if(id==='gentle'){bassl(X,'base','tri',TRI,{oct:12},'long',ALL,.7);arp(X,'base','arp',P50,{voice:{c:64},step:.5,shape:'updown'},ALL,.35);melody(X,{A:{part:'wh',inst:WH,oct:12,v:.72},B:{part:'ld2',inst:P12,v:.7}});
   pick(X,'hi','gtr',GTR,{voice:{c:62}},travis,ALL,.38);drums(X,'hi','nz',{chh:'..o...o...o...o.'},R(4,16),.5);birds(X,'base',ALL,.5)}
  else if(id==='lively'){melody(X,{A:{part:'ld',inst:P25,v:.85},B:{part:'wh',inst:WH,oct:12,v:.75}});arp(X,'hi','arp',P50,{voice:{c:72},step:.25,n:4},ALL,.32);bassl(X,'base','tri',TRI,{oct:12},'oct8',ALL,.85);
   drums(X,'base','kick',{kick:'x.......x.......'},ALL,.9);drums(X,'base','nz',{csn:'....x.......x...'},ALL,.8);drums(X,'hi','nz',{chh:'o.o.o.o.o.o.o.o.'},ALL,.6);strum(X,'base','gtr',GTR,{voice:{c:62},damp:.05},'..D...D.',ALL,.45);
   harm(X,'hi','ld2',P12,{},R(12,16),-2,0,.6);fill(X,'base','nz','csn',[7,15],.6)}
  else if(id==='warm'){melody(X,{A:{part:'ld',inst:SQ,v:.8},B:{part:'gtr',inst:GTR,v:.85}});arp(X,'hi','arp',P50,{voice:{c:67},step:.5},ALL,.32);bassl(X,'base','tri',TRI,{oct:12},'walk',ALL,.8);
   drums(X,'base','nz',{csn:'....x.......x...',chh:'o.o.o.o.o.o.o.o.'},ALL,.6);drums(X,'base','kick',{kick:'x.......x.......'},ALL,.75);pick(X,'base','gtr',GTR,{voice:{c:60}},travis,ALL,.3)}
  else if(id==='quiet'){melody(X,{A:{part:'ld2',inst:P12,v:.6},B:{part:'wh',inst:WH,v:.5}});pick(X,'base','gtr',GTR,{voice:{c:60}},[[0,'R',3],[1,1,2.5,.7],[2,2,2,.7],[3,1,1.5,.6]],ALL,.42);
   bassl(X,'base','tri',TRI,{oct:12},'long',ALL,.6);drums(X,'hi','nz',{chh:'..g...g...g...g.'},ALL,.6);crickets(X,'base',ALL)}
  else if(id==='theme'){melody(X,{A:{part:'ld',inst:P25,v:.8,dbl:{part:'wh',inst:WH,oct:12,v:.45,L:'base'}},B:{part:'glk',inst:GL,oct:12,v:.5}});arp(X,'base','arp',P50,{voice:{c:72},step:.25,n:4},ALL,.26);
   bassl(X,'base','tri',TRI,{oct:12},'r5',ALL,.8);drums(X,'hi','kick',{kick:'x.......x.......'},R(4,16),.85);drums(X,'hi','nz',{csn:'....x.......x...',chh:'o.o.o.o.o.o.o.o.'},R(4,16),.6)}
  else if(id==='stroll'){bassl(X,'base','tri',TRI,{oct:12},'oct8',ALL,.8);melody(X,{A:{part:'ld',inst:P25,v:.8},B:{part:'ld2',inst:SQ,v:.7}});drums(X,'base','nz',{chh:'.o.o.o.o'},ALL,.6);
   strum(X,'base','gtr',GTR,{voice:{c:62},damp:.05},'..D...D.',ALL,.42);drums(X,'base','kick',{kick:'x...x...'},ALL,.7);arp(X,'hi','arp',P50,{voice:{c:72},step:.25,n:3},ALL,.26)}
  else if(id==='tense'){ost(X,'base','arp',CH(.25,{g:.09,s:.5}),{step:.25,alt:1,oct:24},ALL,.5);bassl(X,'base','tri',TRI,{oct:12},'long',ALL,.7);hearts(X,ALL);
   melody(X,{A:{part:'ld2',inst:P12,v:.75},B:{part:'ld',inst:SQ,oct:-12,v:.6}});drums(X,'hi','nz',{chh:'oooooooooooooooo'},ALL,.35)}
  else if(id==='epic'){arp(X,'base','arp',P50,{voice:{c:67},step:.25},ALL,.3);melody(X,{A:{part:'ld',inst:P25,v:.9,dbl:{part:'wh',inst:WH,oct:12,v:.45}},B:{part:'ld2',inst:SQ,v:.8}});bassl(X,'base','tri',TRI,{oct:12},'oct8',ALL,.9);
   drums(X,'base','kick',{kick:'x...x...x...x...'},ALL,.95);drums(X,'base','nz',{csn:'....x.......x...'},ALL,.8);drums(X,'hi','nz',{chh:'oooooooooooooooo'},ALL,.45);strum(X,'hi','gtr',GTR,{voice:{c:60}},'D.D.D.DU',ALL,.4);fill(X,'base','nz','csn',[7,15],.7)}}});
})();
