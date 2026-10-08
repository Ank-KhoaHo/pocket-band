(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var R=NS.R,ALL=NS.ALL,ODD2=NS.ODD2,pick=NS.pick,strum=NS.strum,ost=NS.ost,bassl=NS.bassl,melody=NS.melody,harm=NS.harm,
 drums=NS.drums,fill=NS.fill,sparkle=NS.sparkle,hearts=NS.hearts,D=NS.D,W=NS.W,LUTE=NS.LUTE,HARP=NS.HARP,BASSU=NS.BASSU,drone=NS.drone,trem=NS.trem,crickets=NS.crickets;
/* ---- fantasy tavern: lute, recorder and fiddle over a drone and a frame drum ---- */
var ROLL=[[0,'R',1.5],[.5,0,1],[1,1,1],[1.5,2,1,.8],[2,'F',1.5,.9],[2.5,2,1],[3,1,1],[3.5,0,1,.8]];
var JIG={frame:'x..o..x..o..x.o.'};
function bed(X){if(X.on('base'))drone(X,'drone',X.BR(0,'r')+12)}
PB.addStyle({id:'tavern',label:'TAVERN',short:'lute · recorder',stripe:'#5b8a3c',nm:'Fantasy tavern',
 ds:'A plucked lute and harp, recorder and fiddle trading the tune over a low drone and a frame drum. RPG town music.',
 bpm:{gentle:84,quiet:76,theme:104,lively:132,stroll:116,warm:96,tense:112,epic:140},fast:{rush:208,chase:224},
 swing:{def:.55,lively:.58,epic:.53},grid:8,ir:{sec:1.9,damp:.65,pre:.014},revRet:.6,master:[{t:'peaking',f:300,g:-1.5,q:.8}],dangerCut:1600,
 parts:{lute:{pan:-.25,rev:.2,g:.6,hp:90},harp:{pan:.3,rev:.32,g:.5},lead:{pan:.08,rev:.25,g:.9},resp:{pan:-.12,rev:.27,g:.85},fid:{pan:.25,rev:.2,g:.55},
  bass:{rev:.06,g:.9,lp:1100},drone:{g:.8,rev:.2},perc:{pan:.12,rev:.14,g:.8},nat:{rev:.25,g:.55},hb:{post:true,g:1}},
 inst:'lute, harp, recorder, fiddle, upright bass, frame drum, drone',
 arrange:function(X){var id=X.C.arr,RC=W('recorder'),FD=W('fiddle');
  if(id==='gentle'){pick(X,'base','lute',LUTE,{voice:{c:62}},ROLL,ALL,.48);bed(X);melody(X,{A:{part:'lead',inst:RC,oct:12,v:.65},B:{part:'resp',inst:HARP,oct:12,v:.5}});
   drums(X,'hi','perc',{frame:'x.......x.......'},R(8,16),.5)}
  else if(id==='quiet'){pick(X,'base','harp',HARP,{voice:{c:60}},[[0,'R',3],[1,1,2.5,.7],[2,2,2,.7],[3,1,1.5,.6]],ALL,.42);bed(X);
   melody(X,{A:{part:'lead',inst:RC,v:.55}});crickets(X,'base',ALL)}
  else if(id==='theme'){pick(X,'base','lute',LUTE,{voice:{c:62}},ROLL,ALL,.5);bassl(X,'base','bass',BASSU,{},'r5',ALL,.7);
   melody(X,{A:{part:'lead',inst:RC,oct:12,v:.72},B:{part:'resp',inst:FD,v:.7}});drums(X,'hi','perc',JIG,R(4,16),.6)}
  else if(id==='lively'){strum(X,'base','lute',LUTE,{voice:{c:62},damp:.05},'D.DU.UDU',ALL,.48);bassl(X,'base','bass',BASSU,{},'r5w',ALL,.8);
   melody(X,{A:{part:'lead',inst:FD,v:.85},B:{part:'resp',inst:RC,oct:12,v:.75}});harm(X,'hi','harp',HARP,{},R(12,16),-2,12,.45);
   drums(X,'base','perc',JIG,ALL,.85);fill(X,'base','perc','frame',[7,15],.7)}
  else if(id==='stroll'){bassl(X,'base','bass',BASSU,{},'walk',ALL,.8);strum(X,'base','lute',LUTE,{voice:{c:62},damp:.05},'..D...D.',ALL,.45);
   melody(X,{A:{part:'lead',inst:RC,oct:12,v:.75},B:{part:'resp',inst:LUTE,oct:12,v:.7}});drums(X,'hi','perc',{frame:'x...o...x...o...'},ALL,.6)}
  else if(id==='warm'){bed(X);pick(X,'base','lute',LUTE,{voice:{c:60}},ROLL,ALL,.42);bassl(X,'base','bass',BASSU,{},'long',ALL,.6);
   melody(X,{A:{part:'lead',inst:FD,v:.75},B:{part:'resp',inst:trem(LUTE,.125),oct:12,v:.55}});sparkle(X,'hi','harp',HARP,{c:84},ODD2,.3)}
  else if(id==='tense'){bed(X);ost(X,'base','fid',W('fiddle',{a:.01,r:.04}),{step:.25,alt:1,oct:12,gate:.7},ALL,.4);hearts(X,ALL);
   melody(X,{A:{part:'lead',inst:RC,v:.65},B:{part:'resp',inst:FD,oct:-12,v:.55}});drums(X,'hi','perc',{frame:'x..x..x.....x...'},ALL,.6)}
  else if(id==='epic'){strum(X,'base','lute',LUTE,{voice:{c:62},step:.25,spread:.008},'D.DU.UDUD.DU.UDU',ALL,.45);bassl(X,'base','bass',BASSU,{},'ost8',ALL,.85);bed(X);
   melody(X,{A:{part:'lead',inst:FD,v:.9,dbl:{part:'resp',inst:RC,oct:12,v:.5}},B:{part:'harp',inst:HARP,oct:12,v:.7}});
   drums(X,'base','perc',{frame:'x.ox.ox.x.ox.oxo'},ALL,.9);R(0,16).filter(function(b){return b%4===0}).forEach(function(b){D(X,'base','perc','taiko',X.T(b,0),.6)});fill(X,'base','perc','frame',[7,15],.8)}}});
})();
