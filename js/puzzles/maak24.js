/* ---------- Maak 24 ---------- */
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const fr=(n,d)=>{if(!d)return null;if(d<0){n=-n;d=-d}const g=gcd(n,d)||1;return[n/g,d/g]};
function ap(x,y,op){return op==="+"?fr(x[0]*y[1]+y[0]*x[1],x[1]*y[1]):op==="-"?fr(x[0]*y[1]-y[0]*x[1],x[1]*y[1]):op==="*"?fr(x[0]*y[0],x[1]*y[1]):fr(x[0]*y[1],x[1]*y[0])}
function count24(nums){let cnt=0;
 (function rec(a){if(a.length===1){if(a[0][0]===24&&a[0][1]===1)cnt++;return}
  for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const rest=a.filter((_,k)=>k!==i&&k!==j);
   for(const[x,y]of[[a[i],a[j]],[a[j],a[i]]])for(const op of["-","/"]){const z=ap(x,y,op);if(z)rec(rest.concat([z]))}
   for(const op of["+","*"]){const z=ap(a[i],a[j],op);if(z)rec(rest.concat([z]))}}})(nums.map(n=>[n,1]));
 return cnt}
function gen24(R){const c=[];
 for(let t=0;t<80;t++){const n=[0,0,0,0].map(()=>1+(R()*9|0)),k=count24(n);if(k>0)c.push({n,k})}
 c.sort((a,b)=>b.k-a.k);
 return{rounds:[.1,.3,.5,.72,.9].map(p=>c[Math.floor(p*(c.length-1))].n)}}
