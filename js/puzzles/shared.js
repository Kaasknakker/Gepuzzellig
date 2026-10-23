const hash=s=>{let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return h>>>0};
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const shuf=(a,R)=>{for(let i=a.length-1;i>0;i--){const j=R()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const lc=a=>{const o=[];let k=0;for(const v of a.concat(0)){if(v)k++;else if(k){o.push(k);k=0}}return o};
const rowsOf=(g,W,H)=>{H=H||W;return[...Array(H)].map((_,r)=>g.slice(r*W,r*W+W))};
const colsOf=(g,W,H)=>{H=H||W;return[...Array(W)].map((_,c)=>[...Array(H)].map((_,r)=>g[r*W+c]))};
const nb4=(i,N)=>{const r=i/N|0,c=i%N,o=[];if(r>0)o.push(i-N);if(r<N-1)o.push(i+N);if(c>0)o.push(i-1);if(c<N-1)o.push(i+1);return o};

