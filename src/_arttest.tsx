import { createRoot } from 'react-dom/client';
import { GoalArt } from './components/GoalArt';
const kinds = ['ocean','ridges','hills','city','dunes','field','aurora'] as const;
const pals = ['golden','dawn','noon','dusk','sand','night'] as const;
createRoot(document.getElementById('root')!).render(
  <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,padding:8}}>
    {kinds.flatMap((k,i)=>pals.map((p,j)=><div key={k+p}><GoalArt className="aspect-[4/5] rounded-2xl" scene={{kind:k,palette:k==='aurora'?'night':p,seed:i*7+j+3,balloons:(i+j)%3===0}}/><div style={{fontSize:10}}>{k} {p}</div></div>))}
  </div>);
