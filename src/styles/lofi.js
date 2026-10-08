(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,mtof=NS.mtof,ALL=NS.ALL,ODD2=NS.ODD2,pick=NS.pick,strum=NS.strum,block=NS.block,padSeg=NS.padSeg,arp=NS.arp,ost=NS.ost,bassl=NS.bassl,melody=NS.melody,harm=NS.harm,drums=NS.drums,fill=NS.fill,sparkle=NS.sparkle,hearts=NS.hearts,N=NS.N;
var W=NS.W,M=NS.M,EP=NS.EP,SUB=NS.SUB,SAWB=NS.SAWB,CH=NS.CH,GTR=NS.GTR,MAND=NS.MAND,BASSU=NS.BASSU,PIZZ=NS.PIZZ,PIZZC=NS.PIZZC,HARP=NS.HARP,GTRM=NS.GTRM,trem=NS.trem,D=NS.D,tone=NS.tone,birds=NS.birds,crickets=NS.crickets,crackle=NS.crackle,ks=NS.ks;
/* ---- (b) lo-fi hop ---- */
PB.addStyle({id:'lofi',label:'LO-FI',short:'e-piano · kalimba',stripe:'#8a6fb0',nm:'Lo-fi hop',
 ds:'Swung boom-bap drums; electric piano with 7ths and 9ths; kalimba and vibes; sub bass; tape wobble and vinyl.',
 bpm:{gentle:74,lively:90,warm:82,quiet:68,theme:84,stroll:92,tense:86,epic:98},fast:{rush:202,chase:210},
 swing:{def:.6},grid:16,ir:{sec:2.2,damp:.85,pre:.02},revRet:.6,wobble:7,sat:1.5,master:[{t:'lowpass',f:7800,q:.5},{t:'lowshelf',f:170,g:2}],dangerCut:1150,
 parts:{ep:{pan:0,rev:.22,g:.75,lp:4200},bass:{rev:0,g:1,lp:500},kal:{pan:-.18,rev:.3,g:.85},vib:{pan:.22,rev:.32,g:.8},gtr:{pan:-.32,rev:.15,g:.5,lp:2600},kick:{g:1,rev:.02},
  snare:{pan:.05,rev:.14,g:.8},hat:{pan:.25,rev:.05,g:.65,lp:9000},shak:{pan:-.3,rev:.05,g:.6},vinyl:{g:.7,post:true},nat:{rev:.3,g:.5},lead:{pan:-.1,rev:.3,g:.85},brass:{pan:.15,rev:.25,g:.6},hb:{post:true,g:1}},
 inst:'FM electric piano, kalimba, vibraphone, music box, muted guitar, flute, sub bass, boom-bap kit, vinyl',
 arrange:function(X){var id=X.C.arr,KA=M('kalimba'),VB=M('vibes',{trem:1}),MB=M('musicbox'),EPV={c:62,sev:1,add9:'auto'};
  var hop={kick:'x......x..x.....',snare:'....x.......x...'},hats={hat:'o.o.o.o.o.o.o.o.'},ghost={hat:'.g.g...g.g...g.g'};
  if(id==='gentle'){block(X,'base','ep',EP,{voice:EPV,roll:.03},[[0,3.8]],ALL,.5);melody(X,{A:{part:'kal',inst:KA,v:.8},B:{part:'vib',inst:VB,v:.6}});bassl(X,'base','bass',SUB,{glide:2},'long',R(4,16),.8);
   drums(X,'hi','kick',{kick:'x.........x.....'},R(4,16),.7);drums(X,'hi','snare',{rim:'....x.......x...'},R(4,16),.7);drums(X,'hi','hat',hats,R(4,16),.5);birds(X,'base',ALL,.5);crackle(X,'base',6)}
  else if(id==='lively'){block(X,'base','ep',EP,{voice:EPV,roll:.012},[[0,1.4],[1.75,.5],[3,.8]],ALL,.5);bassl(X,'base','bass',SUB,{},'synco',ALL,.85);melody(X,{A:{part:'kal',inst:KA,v:.85},B:{part:'vib',inst:VB,v:.7}});
   harm(X,'hi','vib',VB,{},R(12,16),-2,0,.45);drums(X,'base','kick',{kick:hop.kick},ALL,1);drums(X,'base','snare',{snare:hop.snare},ALL,.85);drums(X,'hi','hat',hats,ALL,.6);drums(X,'hi','hat',ghost,ALL,.5);
   drums(X,'hi','shak',{shaker:'..o...o...o...o.'},ALL,.6);arp(X,'hi','gtr',GTRM,{voice:{c:60},step:.5},ALL,.42);crackle(X,'base',5)}
  else if(id==='warm'){arp(X,'base','gtr',GTRM,{voice:{c:62},step:.5,shape:'updown'},ALL,.45);block(X,'base','ep',EP,{voice:EPV,roll:.03},[[0,3.8]],ALL,.38);bassl(X,'base','bass',SUB,{},'r5',ALL,.85);
   melody(X,{A:{part:'lead',inst:W('flute',{cut:2600}),v:.8},B:{part:'kal',inst:KA,v:.75}});drums(X,'base','kick',{kick:hop.kick},ALL,.9);drums(X,'base','snare',{snare:hop.snare},ALL,.75,{});drums(X,'hi','hat',hats,ALL,.55);crackle(X,'base',5)}
  else if(id==='quiet'){block(X,'base','ep',EP,{voice:{c:60,sev:1,add9:1},roll:.04},[[0,3.8]],ALL,.42);melody(X,{A:{part:'lead',inst:MB,oct:12,v:.55},B:{part:'vib',inst:VB,v:.5}});bassl(X,'base','bass',SUB,{glide:2},'long',ALL,.75);
   drums(X,'hi','kick',{kick:'x.........x.....'},ALL,.6);drums(X,'hi','snare',{brush:'....x.......x...'},ALL,.9);crickets(X,'base',ALL);crackle(X,'base',9)}
  else if(id==='theme'){block(X,'base','ep',EP,{voice:EPV,roll:.015},[[0,1.4],[1.75,.5],[3,.8]],ALL,.42);bassl(X,'base','bass',SUB,{},'synco',ALL,.8);melody(X,{A:{part:'kal',inst:KA,v:.8},B:{part:'vib',inst:VB,v:.68}});
   drums(X,'hi','kick',{kick:hop.kick},R(4,16),.9);drums(X,'hi','snare',{snare:hop.snare},R(4,16),.75);drums(X,'hi','hat',hats,R(4,16),.55);crackle(X,'base',5);birds(X,'base',ALL,.3)}
  else if(id==='stroll'){arp(X,'base','gtr',GTRM,{voice:{c:62},step:.5},ALL,.45);block(X,'base','ep',EP,{voice:EPV},[[.5,.3],[2.5,.3]],ALL,.4);bassl(X,'base','bass',SUB,{},'walk',ALL,.8);
   melody(X,{A:{part:'kal',inst:KA,v:.85},B:{part:'vib',inst:M('glock'),oct:12,v:.45}});drums(X,'hi','shak',{shaker:'oooooooooooooooo'},ALL,.45);drums(X,'hi','snare',{rim:'....x.......x...'},ALL,.7);drums(X,'hi','kick',{kick:'x.......x.......'},ALL,.75);crackle(X,'base',5)}
  else if(id==='tense'){block(X,'base','ep',EP,{voice:{c:58,sev:1},roll:.05},[[0,3.8]],ALL,.42);bassl(X,'base','bass',SUB,{},'long',ALL,.8);hearts(X,ALL);melody(X,{A:{part:'kal',inst:KA,v:.8},B:{part:'vib',inst:VB,v:.55}});
   drums(X,'hi','hat',{hat:'..g...g...g...g.'},ALL,.7);drums(X,'hi','snare',{rim:'........x.......'},ALL,.6);crackle(X,'base',10)}
  else if(id==='epic'){drums(X,'base','kick',{kick:'x..x..x...x..x..'},ALL,1);drums(X,'base','snare',{snare:'....x.......x...'},ALL,.9);drums(X,'hi','hat',{hat:'oooooooooooooooo'},ALL,.45);fill(X,'base','snare','snare',[7,15],.6);
   bassl(X,'base','bass',SAWB,{},'ost8',ALL,.9);block(X,'base','ep',EP,{voice:{c:62,sev:1}},[[.5,.25],[1.5,.25],[2.5,.25],[3.5,.25]],ALL,.42);
   melody(X,{A:{part:'kal',inst:KA,v:.9,dbl:{part:'brass',inst:W('brass'),oct:-12,v:.5}},B:{part:'brass',inst:W('brass'),v:.6}});crackle(X,'base',5)}}});
})();
