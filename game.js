const C=["red","green","yellow","blue"];
const LABEL={red:"RED",green:"GREEN",yellow:"YELLOW",blue:"BLUE"};
const START={red:0,green:13,yellow:26,blue:39};
const DIE=["","⚀","⚁","⚂","⚃","⚄","⚅"];
const path=[];
for(let c=1;c<=13;c++)path.push([6,c-1]);
for(let r=1;r<=13;r++)path.push([r,13]);
for(let c=12;c>=0;c--)path.push([13,c]);
for(let r=12;r>=1;r--)path.push([r,0]);
const safe=[8,21,34,47];

const S={
  mode:"local",type:"classic",count:2,turn:0,dice:1,awaiting:false,
  sound:true,vibration:true,rolling:false,computer:false,
  players:C.map((color,i)=>({color,name:"Player "+(i+1),ai:false,t:[-1,-1,-1,-1],home:0}))
};

const $=id=>document.getElementById(id);
function toast(m){const x=$("toast");x.textContent=m;x.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>x.classList.remove("show"),1600)}
function vib(n=35){if(S.vibration&&navigator.vibrate)navigator.vibrate(n)}
function tone(f=520){if(!S.sound)return;try{const A=AudioContext||webkitAudioContext,a=new A,o=a.createOscillator,g=a.createGain;o.frequency.value=f;g.gain.value=.035;o.connect(g);g.connect(a.destination);o.start();setTimeout(()=>{o.stop();a.close()},80)}catch{}}
function show(id){["home","setup","game"].forEach(x=>$(x).classList.toggle("hidden",x!==id))}
function openSetup(mode){
  S.mode=mode;S.computer=mode==="computer";
  if(mode==="friends")toast("Friends mode uses the same device in this build");
  show("setup");renderEditor();
}
function renderEditor(){
  document.querySelectorAll(".game-tab").forEach(x=>x.classList.toggle("active",x.dataset.type===S.type));
  document.querySelectorAll(".count").forEach(x=>x.classList.toggle("active",+x.dataset.count===S.count));
  const e=$("playerEditor");e.innerHTML="";
  for(let i=0;i<S.count;i++){
    const p=S.players[i];p.ai=S.computer&&i>0;
    e.insertAdjacentHTML("beforeend",`<div class="editor"><span class="color" style="background:var(--${p.color})"></span><input maxlength="14" value="${p.name}" data-name="${i}" ${p.ai?"disabled":""}><span>${p.ai?"🤖":"👤"}</span></div>`);
  }
}
function makeBoard(){
  const cells=$("cells");cells.innerHTML="";
  path.forEach((q,i)=>{
    const d=document.createElement("div");d.className="cell";
    if(safe.includes(i)){d.classList.add("safe");d.textContent="★"}
    if(i===0)d.classList.add("red");if(i===13)d.classList.add("green");if(i===26)d.classList.add("yellow");if(i===39)d.classList.add("blue");
    d.style.left=((q[1])/15*100)+"%";d.style.top=((q[0])/15*100)+"%";cells.appendChild(d);
  });
  const lanes=$("lanes");lanes.innerHTML="";
  const laneDefs={
    red:[[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
    green:[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
    yellow:[[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
    blue:[[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]]
  };
  for(const color of C)laneDefs[color].forEach(q=>{const d=document.createElement("div");d.className="lane "+color;d.style.left=(q[1]/15*100)+"%";d.style.top=(q[0]/15*100)+"%";lanes.appendChild(d)});
}
const yardPos={
 red:[[7,7],[14,7],[7,14],[14,14]],green:[[86,7],[93,7],[86,14],[93,14]],
 yellow:[[86,86],[93,86],[86,93],[93,93]],blue:[[7,86],[14,86],[7,93],[14,93]]
};
function xy(color,pos,i){
  if(pos<0)return {x:yardPos[color][i][0],y:yardPos[color][i][1]};
  if(pos>=52){
    const lane={red:[[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],green:[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],yellow:[[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],blue:[[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]}}[color];
    const q=lane[Math.min(5,pos-52)];return{x:(q[1]+.5)/15*100,y:(q[0]+.5)/15*100};
  }
  const q=path[(START[color]+pos)%52];return{x:(q[1]+.5)/15*100,y:(q[0]+.5)/15*100};
}
function movable(p,i,d){const x=p.t[i];return x!==57&&(x<0?d===6:x+d<=57)}
function render(){
  const p=S.players[S.turn];$("turnName").textContent=LABEL[p.color];
  $("dice").textContent=DIE[S.dice];$("roll").disabled=S.rolling||p.ai;
  $("gameMsg").textContent=S.rolling?`${p.name} — choose a glowing token`:`${p.name}'s turn — roll the dice`;
  const wrap=$("tokens");wrap.innerHTML="";
  S.players.slice(0,S.count).forEach((p,pi)=>{
    p.t.forEach((pos,ti)=>{
      const b=document.createElement("button");b.className="token "+p.color;
      const q=xy(p.color,pos,ti);b.style.left=q.x+"%";b.style.top=q.y+"%";
      if(pi===S.turn&&S.rolling&&movable(p,ti,S.dice))b.classList.add("movable");
      b.onclick=()=>move(pi,ti);wrap.appendChild(b);
    });
    $("score-"+p.color).textContent=p.home+"/4";
  });
  for(let i=S.count;i<4;i++)$("score-"+C[i]).textContent="—";
}
function roll(){
  if(S.rolling||S.players[S.turn].ai)return;
  S.rolling=true;vib();tone(650);
  let n=0;const id=setInterval(()=>{
    S.dice=1+Math.floor(Math.random()*6);$("dice").textContent=DIE[S.dice];
    if(++n===10){clearInterval(id);finishRoll()}
  },70);
}
function finishRoll(){
  const p=S.players[S.turn],d=S.dice;
  const ms=p.t.map((_,i)=>movable(p,i,d)?i:-1).filter(i=>i>=0);
  if(!ms.length){
    S.rolling=false;render();toast(d===6?"No legal move — six again":"No legal move");
    if(d===6)setTimeout(()=>{S.dice=1;render();if(p.ai)computerTurn();},500);else next();
    return;
  }
  render();toast(d===6?"SIX! Choose a token":"Choose a token");
  if(p.ai)setTimeout(()=>computerMove(ms),450);
}
function move(pi,ti){
  if(!S.rolling||pi!==S.turn)return;
  const p=S.players[pi],d=S.dice;if(!movable(p,ti,d))return;
  const was=p.t[ti];p.t[ti]=was<0?0:was+d;
  S.rolling=false;vib(55);tone(760);
  let captured=capture(p,ti);
  if(p.t[ti]===57){p.home++;toast(p.name+" reached HOME! 🏆")}
  if(p.home===4){render();setTimeout(()=>winner(p),450);return}
  render();
  if(d===6||captured){setTimeout(()=>{if(d===6)toast("Extra turn!");if(p.ai)computerTurn();},450);if(!p.ai)S.rolling=false;else S.rolling=false}
  else setTimeout(next,350);
}
function capture(p,ti){
  const pos=p.t[ti];if(pos<0||pos>=52)return false;
  const abs=(START[p.color]+pos)%52;if(safe.includes(abs))return false;
  let hit=false;
  S.players.slice(0,S.count).forEach(o=>{if(o===p)return;o.t.forEach((v,j)=>{if(v>=0&&v<52&&(START[o.color]+v)%52===abs){o.t[j]=-1;hit=true}})});
  if(hit){toast("TOKEN CAPTURED! ⚔");tone(330);vib(100)}return hit;
}
function next(){S.rolling=false;S.turn=(S.turn+1)%S.count;render();if(S.players[S.turn].ai)setTimeout(computerTurn,600)}
function computerTurn(){
  const p=S.players[S.turn];if(!p.ai)return;
  if(!S.rolling){rollAI();return}
  const choices=p.t.map((_,i)=>movable(p,i,S.dice)?i:-1).filter(i=>i>=0);
  if(!choices.length){next();return}
  computerMove(choices);
}
function rollAI(){
  if(S.rolling)return;
  S.rolling=true;let n=0;const id=setInterval(()=>{S.dice=1+Math.floor(Math.random()*6);$("dice").textContent=DIE[S.dice];if(++n===8){clearInterval(id);finishRoll()}},75)
}
function computerMove(choices){
  const p=S.players[S.turn],d=S.dice;
  // Prefer a capture, then a token leaving yard, then the furthest token.
  let pick=choices.find(i=>canCaptureAfter(p,i,d));
  if(pick===undefined)pick=choices.find(i=>p.t[i]<0);
  if(pick===undefined)pick=choices.sort((a,b)=>p.t[b]-p.t[a])[0];
  setTimeout(()=>move(S.turn,pick),350);
}
function canCaptureAfter(p,i,d){
  const old=p.t[i],nextPos=old<0?0:old+d;if(nextPos>=52)return false;
  const abs=(START[p.color]+nextPos)%52;if(safe.includes(abs))return false;
  return S.players.slice(0,S.count).some(o=>o!==p&&o.t.some(v=>v>=0&&v<52&&(START[o.color]+v)%52===abs));
}
function winner(p){
  toast("🏆 "+p.name+" WINS!");
  const coins=Number(localStorage.getItem("abhiCoins")||2550)+500;localStorage.setItem("abhiCoins",coins);
  $("coins").textContent=coins;setTimeout(()=>show("setup"),1200);
}
function start(){
  S.turn=0;S.dice=1;S.rolling=false;
  for(let i=0;i<S.count;i++){const input=document.querySelector(`[data-name="${i}"]`);if(input&&!input.disabled)S.players[i].name=input.value.trim()||"Player "+(i+1);S.players[i].t=[-1,-1,-1,-1];S.players[i].home=0;S.players[i].ai=S.computer&&i>0}
  show("game");render();if(S.players[0].ai)setTimeout(computerTurn,600)
}
function load(){
  makeBoard();$("coins").textContent=localStorage.getItem("abhiCoins")||2550;
  $("gems").textContent=localStorage.getItem("abhiGems")||50;
  renderEditor();
  document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>openSetup(b.dataset.mode));
  document.querySelectorAll(".game-tab").forEach(b=>b.onclick=()=>{S.type=b.dataset.type;renderEditor()});
  document.querySelectorAll(".count").forEach(b=>b.onclick=()=>{S.count=+b.dataset.count;renderEditor()});
  $("startGame").onclick=start;$("backSetup").onclick=()=>show("home");$("exitGame").onclick=()=>show("home");$("roll").onclick=roll;
  $("soundBtn").onclick=()=>{S.sound=!S.sound;$("soundBtn").textContent=S.sound?"🔊":"🔇"};
  $("settingsBtn").onclick=()=>$("settings").classList.remove("hidden");$("closeSettings").onclick=()=>$("settings").classList.add("hidden");
  $("sound").onchange=e=>S.sound=e.target.checked;$("vibration").onchange=e=>S.vibration=e.target.checked;
  $("resetData").onclick=()=>{localStorage.clear();$("coins").textContent=2550;$("gems").textContent=50;toast("Data reset")};
}
load();
    
