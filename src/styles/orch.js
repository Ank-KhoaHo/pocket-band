(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,mtof=NS.mtof,ALL=NS.ALL,ODD2=NS.ODD2,pick=NS.pick,strum=NS.strum,block=NS.block,padSeg=NS.padSeg,arp=NS.arp,ost=NS.ost,bassl=NS.bassl,melody=NS.melody,harm=NS.harm,drums=NS.drums,fill=NS.fill,sparkle=NS.sparkle,hearts=NS.hearts,N=NS.N;
var W=NS.W,M=NS.M,EP=NS.EP,SUB=NS.SUB,SAWB=NS.SAWB,CH=NS.CH,GTR=NS.GTR,MAND=NS.MAND,BASSU=NS.BASSU,PIZZ=NS.PIZZ,PIZZC=NS.PIZZC,HARP=NS.HARP,GTRM=NS.GTRM,trem=NS.trem,D=NS.D,tone=NS.tone,birds=NS.birds,crickets=NS.crickets,crackle=NS.crackle,ks=NS.ks;
/* ---- (c) whimsical orchestral ---- */
PB.addStyle({id:'orch',label:'ORCHESTRA',short:'strings · winds',stripe:'#c4a24a',nm:'Whimsical orchestral',
 ds:'Pizzicato strings; flute and clarinet call-and-response; bassoon bass; harp, glockenspiel, timpani; hall reverb.',
 bpm:{gentle:80,lively:116,warm:92,quiet:66,theme:100,stroll:108,tense:108,epic:128},
 swing:{def:.53,lively:.5,epic:.5},grid:8,ir:{sec:2.6,damp:.6,pre:.025},revRet:.75,master:[{t:'highshelf',f:6000,g:-2}],dangerCut:1900,
 parts:{pv:{pan:-.32,rev:.3,g:.55,hp:150},pc:{pan:.3,rev:.28,g:.75,lp:2500},str:{pan:0,rev:.38,g:.6},fl:{pan:-.15,rev:.32,g:.9},cl:{pan:.2,rev:.32,g:.9},ob:{pan:.1,rev:.3,g:.85},bsn:{pan:.12,rev:.22,g:.85},
  hn:{pan:-.25,rev:.4,g:.75},hp:{pan:-.42,rev:.34,g:.55},glk:{pan:.36,rev:.36,g:.42},timp:{rev:.3,g:.9},perc:{pan:.2,rev:.3,g:.6},nat:{rev:.3,g:.5},hb:{post:true,g:1}},
 inst:'pizzicato violins and cellos, string section, flute, clarinet, oboe, bassoon, horn, harp, glockenspiel, celesta, timpani, triangle',
 arrange:function(X){var id=X.C.arr,FL=W('flute'),CL=W('clarinet'),OB=W('oboe'),BS=W('bassoon'),HN=W('horn'),ST=W('strings'),GL=M('glock'),CE=M('celesta');
  var harpU=[[0,'R',2],[.5,0,2],[1,1,2],[1.5,2,2],[2,'F',2],[2.5,2,2],[3,1,2],[3.5,0,2]];
  function timpAt(bars,v){bars.forEach(function(b){D(X,'hi','timp','timp',X.T(b,0),v||.8,{f:mtof(X.BR(X.chordAt(b,0),'r')+12)})})}
  if(id==='gentle'){pick(X,'base','hp',HARP,{voice:{c:64}},harpU,ALL,.42);padSeg(X,'base','str',ST,{voice:{c:62}},ALL,.38);melody(X,{A:{part:'fl',inst:FL,v:.75},B:{part:'cl',inst:CL,v:.7}});
   bassl(X,'base','bsn',BS,{oct:12},'long',R(4,16),.55);sparkle(X,'hi','glk',GL,{c:86},ODD2,.3);[0,8].forEach(function(b){D(X,'hi','perc','tri',X.T(b,0),.8)});birds(X,'base',ALL,.4)}
  else if(id==='lively'){bassl(X,'base','pc',PIZZC,{oct:12},'boom',ALL,.9);block(X,'base','pv',PIZZ,{voice:{c:67}},[[1,.3],[3,.3]],ALL,.55);block(X,'hi','pv',PIZZ,{voice:{c:72,n:2}},[[.5,.2],[1.5,.2],[2.5,.2],[3.5,.2]],ALL,.35);
   bassl(X,'base','bsn',W('bassoon',{r:.03}),{oct:12},'boom',ALL,.55);melody(X,{A:{part:'fl',inst:FL,v:.85,dbl:{part:'glk',inst:GL,oct:12,v:.35}},B:{part:'cl',inst:CL,v:.8}});
   timpAt([0,4,8,12]);[0,2,4,6,8,10,12,14].forEach(function(b){D(X,'hi','perc','tri',X.T(b,0),.6)});drums(X,'hi','perc',{snare:'....g.g.....g.g.'},ALL,.35);fill(X,'hi','timp','timp',[7,15],.5)}
  else if(id==='warm'){padSeg(X,'base','str',ST,{voice:{c:62}},ALL,.45);bassl(X,'base','pc',PIZZC,{oct:12},'walk',ALL,.85);melody(X,{A:{part:'cl',inst:CL,v:.8},B:{part:'ob',inst:OB,v:.75}});
   harm(X,'hi','hn',HN,{},R(8,16),-2,-12,.55);pick(X,'hi','hp',HARP,{voice:{c:64}},harpU,ALL,.3)}
  else if(id==='quiet'){padSeg(X,'base','str',W('strings',{cut:1300}),{voice:{c:60}},ALL,.4);pick(X,'base','hp',HARP,{voice:{c:62}},[[0,'R',3],[1,0,2],[2,1,2],[3,2,2]],ALL,.36);
   melody(X,{A:{part:'glk',inst:CE,oct:12,v:.55},B:{part:'fl',inst:FL,v:.55}});bassl(X,'base','bsn',BS,{oct:12},'long',ALL,.45);
   if(X.on('hi'))[3,9,13].forEach(function(b){var c=X.ctx,o2=X.out('nat');var tb=X.T(b,2);X.later(tb,tb+2,function(){[0,.42].forEach(function(dt,i){tone(X,o2,'sine',i?360:385,0,tb+dt,.08,.25,.04)})});X.evd('nat','owl',X.T(b,2),.5)})}
  else if(id==='theme'){bassl(X,'base','pc',PIZZC,{oct:12},'boom',ALL,.8);block(X,'base','pv',PIZZ,{voice:{c:67}},[[1,.3],[3,.3]],ALL,.45);melody(X,{A:{part:'fl',inst:FL,v:.8},B:{part:'cl',inst:CL,v:.78}});
   padSeg(X,'hi','str',ST,{voice:{c:62}},R(8,16),.35);sparkle(X,'hi','glk',GL,{c:86},ODD2,.3);timpAt([0,8],.6);
   [0,8].forEach(function(b){var vc=X.V(X.chordAt(b,0),{c:72});vc.concat(vc.map(function(m){return m+12})).forEach(function(m,k){N(X,'base','hp','fx',HARP,{},m,X.T(b,0)+k*.045,1.5,.35)})})}
  else if(id==='stroll'){bassl(X,'base','bsn',W('bassoon',{r:.03}),{oct:12},'walk',ALL,.6);block(X,'base','pv',PIZZ,{voice:{c:67}},[[.5,.25],[1.5,.25],[2.5,.25],[3.5,.25]],ALL,.42);
   melody(X,{A:{part:'ob',inst:OB,v:.8},B:{part:'fl',inst:FL,v:.75}});drums(X,'hi','perc',{wood:'o.g.o.g.'},ALL,.55,{f:700});[0,4,8,12].forEach(function(b){D(X,'hi','perc','tri',X.T(b,0),.6)})}
  else if(id==='tense'){block(X,'base','str',W('strings',{a:.02,r:.08,trem:14}),{voice:{c:52,n:2}},[[0,4]],ALL,.7);hearts(X,ALL);ost(X,'base','bsn',W('bassoon',{r:.03}),{step:.5,oct:12,gate:.6},ALL,.5);
   bassl(X,'base','pc',PIZZC,{oct:12},'long',ALL,.6);melody(X,{A:{part:'cl',inst:CL,v:.75},B:{part:'hn',inst:HN,oct:-12,v:.6}});[6,14].forEach(function(b){D(X,'hi','perc','cym',X.T(b,0),.9,{len:X.spb*8})})}
  else if(id==='epic'){ost(X,'base','pv',PIZZ,{step:.5,alt:1,oct:36},ALL,.6);ost(X,'base','pc',PIZZC,{step:.5,oct:12},ALL,.75);bassl(X,'base','bsn',W('bassoon',{r:.03}),{oct:12},'ost8',ALL,.55);
   melody(X,{A:{part:'fl',inst:FL,v:.85,dbl:{part:'cl',inst:CL,oct:-12,v:.55,L:'base'}},B:{part:'hn',inst:HN,v:.75}});ALL.forEach(function(b){D(X,'base','timp','timp',X.T(b,0),.8,{f:mtof(X.BR(X.chordAt(b,0),'r')+12)});D(X,'base','timp','bd',X.T(b,2),.6)});
   [3,7,11,15].forEach(function(b){D(X,'hi','perc','cym',X.T(b,0),.9,{len:X.spb*4})});block(X,'hi','hn',HN,{voice:{c:60}},[[3.5,.4]],ALL,.45);fill(X,'hi','perc','snare',[7,15],.5)}}});
})();
