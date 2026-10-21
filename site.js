var V=(n,t)=>[n[0]-t[0],n[1]-t[1],n[2]-t[2]],H=(n,t)=>n[0]*t[0]+n[1]*t[1]+n[2]*t[2],et=(n,t)=>[n[1]*t[2]-n[2]*t[1],n[2]*t[0]-n[0]*t[2],n[0]*t[1]-n[1]*t[0]],R=n=>{let t=Math.hypot(n[0],n[1],n[2])||1;return[n[0]/t,n[1]/t,n[2]/t]};function Dt(n,t){let e=R(n.f),s=R(n.u),i=R(et(e,s)),r=2*t*Math.tan(n.fov/2),o=r*(n.aspect||1),a=[n.p[0]+e[0]*t,n.p[1]+e[1]*t,n.p[2]+e[2]*t],h=[i[0]*o/2,i[1]*o/2,i[2]*o/2],l=[s[0]*r/2,s[1]*r/2,s[2]*r/2];return{pa:[a[0]-h[0]-l[0],a[1]-h[1]-l[1],a[2]-h[2]-l[2]],pb:[a[0]+h[0]-l[0],a[1]+h[1]-l[1],a[2]+h[2]-l[2]],pc:[a[0]-h[0]+l[0],a[1]-h[1]+l[1],a[2]-h[2]+l[2]]}}function I(n,t,e,s){let i=R(V(n.pb,n.pa)),r=R(V(n.pc,n.pa)),o=R(et(i,r)),a=V(n.pa,t),h=V(n.pb,t),l=V(n.pc,t),c=-H(o,a);if(!(c>1e-6))throw new Error("the eye is on or behind the screen plane");let f=e/c;return{l:H(i,a)*f,r:H(i,h)*f,b:H(r,a)*f,t:H(r,l)*f,n:e,f:s,d:c,vr:i,vu:r,vn:o}}function bt(n){let{l:t,r:e,b:s,t:i,n:r,f:o}=n,a=new Array(16).fill(0);return a[0]=2*r/(e-t),a[5]=2*r/(i-s),a[8]=(e+t)/(e-t),a[9]=(i+s)/(i-s),a[10]=-(o+r)/(o-r),a[11]=-1,a[14]=-2*o*r/(o-r),a}function st(n,t,e){let s=I(t,e,.1,100),i=(s.l+s.r)/2,r=(s.b+s.t)/2,o=Math.max(1e-9,Math.min(s.r-s.l,s.t-s.b)/2);return Math.hypot(i,r)/o}function Bt(n,t,e,s){let i=R(n.f),r=R(n.u),o=R(et(i,r)),a=et(o,i),h=t/Math.max(1e-9,s[2]),l=c=>{let f=V(c,s);return[0,1,2].map(u=>n.p[u]+h*(f[0]*o[u]+f[1]*a[u]-f[2]*i[u]))};return{screen:{pa:l(e.pa),pb:l(e.pb),pc:l(e.pc)},map:{scale:h,apply:l}}}var Ue=n=>Math.max(1,Math.ceil(n/4096)),ze=new Float32Array(1),Hs=new Uint32Array(ze.buffer);function St(n,t,e){let s=n,i=[t[2],t[6],t[10]],r=i[0]*e[0]+i[1]*e[1]+i[2]*e[2];return{g:[0,1,2].map(a=>i[0]*s[4*a]+i[1]*s[4*a+1]+i[2]*s[4*a+2]),a:i[0]*s[12]+i[1]*s[13]+i[2]*s[14]-r}}function Ge(n,t,e){let s=[],i=n;for(let r=0;r<t;r++){let o=0,a=Math.abs(i);if(a>=1e-30&&isFinite(a)){let h=Math.floor(Math.log2(a));Math.pow(2,h)>a&&h--,Math.pow(2,h+1)<=a&&h++;let l=Math.pow(2,h-(e-1));o=Math.sign(i)*Math.floor(a/l)*l}s.push(o),i-=o}return s}function Ve(n,t){let e=[],s=n;for(let i=0;i<t;i++){let r=isFinite(s)?Math.fround(s):0;e.push(r),s-=r}return e}function Ne(n){return{g:n.g.map(t=>Ge(t,4,12)),a:Ve(n.a,4),gf:[Math.fround(n.g[0]),Math.fround(n.g[1]),Math.fround(n.g[2]),Math.fround(n.a)]}}function zt(n,t,e){let s=0,i=0,r=0,o=0,a=e(n[0]);for(let h=1;h<t;h++){let l=e(n[h]),c=a<0||Object.is(a,-0),f=l<0||Object.is(l,-0),u;c!==f?u=c&&!f:u=Math.abs(a)<Math.abs(l),Math.abs(a)===Math.abs(l)&&c===f&&o++,u&&s++,c&&f&&(i++,u&&r++),a=l}return{pairs:t-1,wrong:s,ties:o,front:i,frontWrong:r}}var j=`const WG = 256u;
const ROUNDS = 16u;
const TILE = 4096u;
struct Pass { n: u32, tiles: u32, shift: u32, count: u32 };
`;function It(n){return`${j}
struct Key {
  gx: vec4f, gy: vec4f, gz: vec4f,       // g per component, in four parts of at most 12 significant bits
  a: vec4f,                              // a in four float32 parts
  gf: vec4f,                             // g and a as plain float32 (for positions beyond the exact path's range)
  n: u32, count: u32, width: u32, pad: u32,
};
@group(0) @binding(0) var<uniform> K: Key;
${n==="texture"?"@group(0) @binding(1) var positions: texture_2d<f32>;":"@group(0) @binding(1) var<storage, read> positions: array<vec4f>;"}
@group(0) @binding(2) var<storage, read_write> keys: array<u32>;

var<private> wide: bool;                 // a term too large for the accumulator (|term| >= 2^58, or not finite)

fn add128(a: vec4u, b: vec4u) -> vec4u {
  let x = a.x + b.x;
  let cx = select(0u, 1u, x < a.x);
  let y0 = a.y + b.y;
  let y = y0 + cx;
  let cy = select(0u, 1u, y0 < a.y) + select(0u, 1u, y < y0);
  let z0 = a.z + b.z;
  let z = z0 + cy;
  let cz = select(0u, 1u, z0 < a.z) + select(0u, 1u, z < z0);
  return vec4u(x, y, z, a.w + b.w + cz);
}

fn sub128(a: vec4u, b: vec4u) -> vec4u {  // a - b for a >= b
  let x = a.x - b.x;
  let bx = select(0u, 1u, a.x < b.x);
  let y0 = a.y - b.y;
  let y = y0 - bx;
  let by = select(0u, 1u, a.y < b.y) + select(0u, 1u, y0 < bx);
  let z0 = a.z - b.z;
  let z = z0 - by;
  let bz = select(0u, 1u, a.z < b.z) + select(0u, 1u, z0 < by);
  return vec4u(x, y, z, a.w - b.w - bz);
}

fn ge128(a: vec4u, b: vec4u) -> bool {
  if (a.w != b.w) { return a.w > b.w; }
  if (a.z != b.z) { return a.z > b.z; }
  if (a.y != b.y) { return a.y > b.y; }
  return a.x >= b.x;
}

// s + |t| in units of 2^-64; t must be exactly a float32 value (it is: a product of two 12-bit numbers, or a part of a)
fn acc(s: vec4u, t: f32) -> vec4u {
  let b = bitcast<u32>(t);
  let e = (b >> 23u) & 255u;
  if (e == 0u) { return s; }             // zero, or below 2^-126: nothing at this resolution
  let q = i32(e) - 86;                   // |t| = m * 2^(e - 150) = m * 2^(q - 64): m's lowest bit sits at bit q
  if (q > 98) { wide = true; return s; }  // top bit above 121: no headroom left for the sum
  let m = (b & 0x7fffffu) | 0x800000u;
  var v = vec4u(0u);
  if (q < 0) {
    if (q > -24) { v.x = m >> u32(-q); }
  } else {
    let L = u32(q) >> 5u;
    let o = u32(q) & 31u;
    let lo = m << o;
    let hi = select(0u, m >> (32u - o), o != 0u);
    v = vec4u(select(0u, lo, L == 0u),
              select(0u, lo, L == 1u) | select(0u, hi, L == 0u),
              select(0u, lo, L == 2u) | select(0u, hi, L == 1u),
              select(0u, lo, L == 3u) | select(0u, hi, L == 2u));
  }
  return add128(s, v);
}

var<private> P: vec4u;                   // the positive and the negative terms, summed separately
var<private> N: vec4u;
fn term(t: f32) {
  if (t < 0.0) { N = acc(N, t); } else { P = acc(P, t); }
}

// the float32 bits of (P - N) * 2^-64, rounded to nearest, ties to even
fn rounded() -> u32 {
  let neg = !ge128(P, N);
  let M = select(sub128(P, N), sub128(N, P), neg);
  var p: i32;
  if (M.w != 0u) { p = 127 - i32(countLeadingZeros(M.w)); }
  else if (M.z != 0u) { p = 95 - i32(countLeadingZeros(M.z)); }
  else if (M.y != 0u) { p = 63 - i32(countLeadingZeros(M.y)); }
  else if (M.x != 0u) { p = 31 - i32(countLeadingZeros(M.x)); }
  else { return 0u; }                    // exactly zero: +0, as the worker's double sum gives
  var w: u32;                            // bits p .. p - 31
  var sticky = false;                    // anything set below them
  if (p < 31) {
    w = M.x << u32(31 - p);
  } else {
    let q = u32(p - 31);
    let L = q >> 5u;
    let o = q & 31u;
    let l0 = M[L];
    let l1 = select(0u, M[min(L + 1u, 3u)], L < 3u);
    w = select((l0 >> o) | (l1 << (32u - o)), l0, o == 0u);
    sticky = (l0 & ((1u << o) - 1u)) != 0u;
    for (var k = 0u; k < L; k++) { sticky = sticky || (M[k] != 0u); }
  }
  var mant = w >> 8u;
  if (((w >> 7u) & 1u) == 1u && (sticky || (w & 0x7fu) != 0u || (mant & 1u) == 1u)) { mant += 1u; }
  var ex = p + 63;                       // 2^(p - 64): biased exponent p - 64 + 127
  if (mant == 0x1000000u) { mant = 0x800000u; ex += 1; }
  let sign = select(0u, 0x80000000u, neg);
  if (ex <= 0) { return sign; }
  return sign | (u32(ex) << 23u) | (mant & 0x7fffffu);
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3u, @builtin(num_workgroups) nwg: vec3u) {
  let i = gid.x + gid.y * nwg.x * WG;
  if (i >= K.n) { return; }
  var p = vec3f(0.0);                    // entries past the splat count (Babylon pads to 16) sit at the origin, as in the worker
  if (i < K.count) { p = ${n==="texture"?"textureLoad(positions, vec2u(i % K.width, i / K.width), 0).xyz":"positions[i].xyz"}; }
  P = vec4u(0u);
  N = vec4u(0u);
  wide = false;
  for (var k = 0u; k < 3u; k++) {
    let x = p[k];
    let xh = bitcast<f32>(bitcast<u32>(x) & 0xfffff000u);
    let xl = x - xh;                     // exact: same exponent (Sterbenz), the 12 low mantissa bits
    var g = K.gx;
    if (k == 1u) { g = K.gy; } else if (k == 2u) { g = K.gz; }
    for (var j = 0u; j < 4u; j++) { term(g[j] * xh); term(g[j] * xl); }
  }
  for (var j = 0u; j < 4u; j++) { term(K.a[j]); }
  var bits = rounded();
  if (wide) { bits = bitcast<u32>(dot(K.gf.xyz, p) + K.gf.w); }   // beyond +-2^58 (or not finite): float32 arithmetic
  keys[i] = bits ^ 0x7fffffffu;
}
`}var We=`${j}
@group(0) @binding(0) var<uniform> P: Pass;
@group(0) @binding(1) var<storage, read> keysIn: array<u32>;
@group(0) @binding(2) var<storage, read_write> hist: array<u32>;
var<workgroup> count: array<atomic<u32>, 256>;

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_index) t: u32, @builtin(workgroup_id) wid: vec3u) {
  let tile = wid.x;
  atomicStore(&count[t], 0u);
  workgroupBarrier();
  let start = tile * TILE;
  for (var r = 0u; r < ROUNDS; r++) {
    let i = start + r * WG + t;
    if (i < P.n) { atomicAdd(&count[(keysIn[i] >> P.shift) & 255u], 1u); }
  }
  workgroupBarrier();
  hist[t * P.tiles + tile] = atomicLoad(&count[t]);
}
`,$e=`${j}
@group(0) @binding(0) var<uniform> P: Pass;
@group(0) @binding(1) var<storage, read_write> hist: array<u32>;
@group(0) @binding(2) var<storage, read_write> totals: array<u32>;
var<workgroup> part: array<u32, 256>;

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_index) t: u32, @builtin(workgroup_id) wid: vec3u) {
  let row = wid.x * P.tiles;
  let per = (P.tiles + WG - 1u) / WG;
  let lo = min(t * per, P.tiles);
  let hi = min(lo + per, P.tiles);
  var s = 0u;
  for (var k = lo; k < hi; k++) { s += hist[row + k]; }
  part[t] = s;
  workgroupBarrier();
  for (var off = 1u; off < WG; off = off << 1u) {
    var v = 0u;
    if (t >= off) { v = part[t - off]; }
    workgroupBarrier();
    part[t] = part[t] + v;
    workgroupBarrier();
  }
  var run = part[t] - s;
  for (var k = lo; k < hi; k++) { let c = hist[row + k]; hist[row + k] = run; run += c; }
  if (t == WG - 1u) { totals[wid.x] = part[t]; }
}
`,Ke=`${j}
@group(0) @binding(0) var<storage, read_write> totals: array<u32>;
var<workgroup> part: array<u32, 256>;

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_index) t: u32) {
  let v = totals[t];
  part[t] = v;
  workgroupBarrier();
  for (var off = 1u; off < WG; off = off << 1u) {
    var a = 0u;
    if (t >= off) { a = part[t - off]; }
    workgroupBarrier();
    part[t] = part[t] + a;
    workgroupBarrier();
  }
  totals[t] = part[t] - v;
}
`,qe=`${j}
@group(0) @binding(0) var<uniform> P: Pass;
@group(0) @binding(1) var<storage, read> keysIn: array<u32>;
@group(0) @binding(2) var<storage, read> valsIn: array<u32>;
@group(0) @binding(3) var<storage, read_write> keysOut: array<u32>;
@group(0) @binding(4) var<storage, read_write> valsOut: array<u32>;
@group(0) @binding(5) var<storage, read> hist: array<u32>;
@group(0) @binding(6) var<storage, read> starts: array<u32>;        // per digit: the keys of all smaller digits (the digits pass)
override FIRST: bool = false;
override LAST: bool = false;
var<workgroup> base: array<u32, 256>;
var<workgroup> masks: array<atomic<u32>, 2048>;          // [digit * 8 + word]: which threads of this round hold that digit

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_index) t: u32, @builtin(workgroup_id) wid: vec3u) {
  let tile = wid.x;
  // where each digit's keys of this tile start: all keys of smaller digits + this digit's keys in earlier tiles
  base[t] = starts[t] + hist[t * P.tiles + tile];
  for (var k = 0u; k < 8u; k++) { atomicStore(&masks[t * 8u + k], 0u); }
  workgroupBarrier();

  let word = t >> 5u;
  let bit = 1u << (t & 31u);
  let start = tile * TILE;
  for (var r = 0u; r < ROUNDS; r++) {
    let i = start + r * WG + t;
    let live = i < P.n;
    var key = 0u;
    var d = 0u;
    if (live) {
      key = keysIn[i];
      d = (key >> P.shift) & 255u;
      atomicOr(&masks[d * 8u + word], bit);
    }
    workgroupBarrier();
    var rank = 0u;                       // keys of digit d before this one in the round
    var total = 0u;                      // keys of digit d in the round
    if (live) {
      for (var k = 0u; k < 8u; k++) {
        let m = atomicLoad(&masks[d * 8u + k]);
        total += countOneBits(m);
        if (k < word) { rank += countOneBits(m); } else if (k == word) { rank += countOneBits(m & (bit - 1u)); }
      }
      let at = base[d] + rank;
      var v = min(i, P.count);
      if (!FIRST) { v = valsIn[i]; }
      if (LAST) {
        valsOut[at] = bitcast<u32>(f32(v));
      } else {
        keysOut[at] = key;
        valsOut[at] = v;
      }
    }
    workgroupBarrier();
    if (live) {
      atomicStore(&masks[d * 8u + word], 0u);                    // every word set this round is cleared by one of its own threads
      if (rank + 1u == total) { base[d] = base[d] + total; }     // the digit's last key of the round moves its base on
    }
    workgroupBarrier();
  }
}
`,He=`
struct Copy { n: u32, pad0: u32, pad1: u32, pad2: u32 };
@group(0) @binding(0) var<uniform> C: Copy;
@group(0) @binding(1) var<storage, read> src: array<u32>;
@group(0) @binding(2) var<storage, read_write> dst: array<u32>;
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3u, @builtin(num_workgroups) nwg: vec3u) {
  let i = gid.x + gid.y * nwg.x * 256u;
  if (i < C.n) { dst[i] = src[i]; }
}
`;function Ut(n,t){let e=Math.max(1,Math.min(t,65535)),s=Math.max(1,Math.ceil(t/e));n.dispatchWorkgroups(e,s)}var xt=class{constructor(t){this.device=t;let e=t,s=GPUShaderStage.COMPUTE,i=c=>({binding:c,visibility:s,buffer:{type:"uniform"}}),r=c=>({binding:c,visibility:s,buffer:{type:"read-only-storage"}}),o=c=>({binding:c,visibility:s,buffer:{type:"storage"}}),a=(c,f)=>e.createBindGroupLayout({label:"gpu sort "+c,entries:f});this.layouts={keyTex:a("keys from a texture",[i(0),{binding:1,visibility:s,texture:{sampleType:"unfilterable-float"}},o(2)]),keyBuf:a("keys from a buffer",[i(0),r(1),o(2)]),hist:a("histogram",[i(0),r(1),o(2)]),scan:a("scan",[i(0),o(1),o(2)]),digits:a("digits",[o(0)]),scatter:a("scatter",[i(0),r(1),r(2),o(3),o(4),r(5),r(6)]),copy:a("copy",[i(0),r(1),o(2)])};let h=(c,f)=>e.createShaderModule({code:c,label:"gpu sort "+f}),l=(c,f,u,p)=>e.createComputePipeline({label:"gpu sort "+u,layout:e.createPipelineLayout({bindGroupLayouts:[c]}),compute:p?{module:f,entryPoint:"main",constants:p}:{module:f,entryPoint:"main"}});this.modules={keyTex:h(It("texture"),"keys (texture)"),keyBuf:h(It("buffer"),"keys (buffer)"),hist:h(We,"histogram"),scan:h($e,"scan"),digits:h(Ke,"digits"),scatter:h(qe,"scatter")},this.pKeyTex=l(this.layouts.keyTex,this.modules.keyTex,"keys (texture)"),this.pKeyBuf=l(this.layouts.keyBuf,this.modules.keyBuf,"keys (buffer)"),this.pHist=l(this.layouts.hist,this.modules.hist,"histogram"),this.pScan=l(this.layouts.scan,this.modules.scan,"scan"),this.pDigits=l(this.layouts.digits,this.modules.digits,"digits"),this.pFirst=l(this.layouts.scatter,this.modules.scatter,"scatter (first)",{FIRST:1,LAST:0}),this.pMid=l(this.layouts.scatter,this.modules.scatter,"scatter",{FIRST:0,LAST:0}),this.pLast=l(this.layouts.scatter,this.modules.scatter,"scatter (last)",{FIRST:0,LAST:1}),this.pCopy=null}async compileErrors(){let t=[];for(let e in this.modules){let s=await this.modules[e].getCompilationInfo();for(let i of s.messages)i.type==="error"&&t.push(e+" "+i.lineNum+":"+i.linePos+" "+i.message)}return t}workspace(t,e=""){let s=this.device,i=GPUBufferUsage,r=Ue(t),o=(p,g,v)=>s.createBuffer({size:Math.max(16,p),usage:g,label:"gpu sort "+v+e}),a={n:t,tiles:r,keysA:o(4*t,i.STORAGE|i.COPY_DST|i.COPY_SRC,"keys A"),valsA:o(4*t,i.STORAGE|i.COPY_SRC,"values A"),keysB:o(4*t,i.STORAGE|i.COPY_SRC,"keys B"),valsB:o(4*t,i.STORAGE|i.COPY_SRC,"values B"),hist:o(4*256*r,i.STORAGE,"histograms"),totals:o(4*256,i.STORAGE,"digit totals"),keyParams:o(96,i.UNIFORM|i.COPY_DST,"key parameters"),count:t,pass:[0,1,2,3].map(p=>{let g=s.createBuffer({size:16,usage:i.UNIFORM|i.COPY_DST,mappedAtCreation:!0,label:"gpu sort pass "+p+e});return new Uint32Array(g.getMappedRange()).set([t,r,8*p,t]),g.unmap(),g}),keyGroups:new WeakMap,lastGroups:new WeakMap},h=(p,g,v)=>s.createBindGroup({layout:p,label:"gpu sort "+v,entries:g.map((y,w)=>({binding:w,resource:{buffer:y}}))}),l=[a.keysA,a.keysB,a.keysA,a.keysB],c=[a.valsA,a.valsB,a.valsA,a.valsB],f=[a.keysB,a.keysA,a.keysB],u=[a.valsB,a.valsA,a.valsB];return a.histGroups=[0,1,2,3].map(p=>h(this.layouts.hist,[a.pass[p],l[p],a.hist],"histogram "+p)),a.scanGroup=h(this.layouts.scan,[a.pass[0],a.hist,a.totals],"scan"),a.digitsGroup=h(this.layouts.digits,[a.totals],"digits"),a.scatterGroups=[0,1,2].map(p=>h(this.layouts.scatter,[a.pass[p],l[p],c[p],f[p],u[p],a.hist,a.totals],"scatter "+p)),a.group=h,a}destroy(t){if(t)for(let e of[t.keysA,t.valsA,t.keysB,t.valsB,t.hist,t.totals,t.keyParams,...t.pass])e.destroy()}keyGroup(t,e){let s=e.texture||e.buffer,i=t.keyGroups.get(s);return i||(i=this.device.createBindGroup({layout:e.texture?this.layouts.keyTex:this.layouts.keyBuf,label:"gpu sort keys",entries:[{binding:0,resource:{buffer:t.keyParams}},{binding:1,resource:e.texture?e.texture.createView():{buffer:e.buffer}},{binding:2,resource:{buffer:t.keysA}}]}),t.keyGroups.set(s,i)),i}setCount(t,e){if(t.count!==e){t.count=e;for(let s=0;s<4;s++)this.device.queue.writeBuffer(t.pass[s],0,new Uint32Array([t.n,t.tiles,8*s,e]))}}writeKeyParams(t,e,s,i){this.setCount(t,s);let r=new ArrayBuffer(96),o=new Float32Array(r),a=new Uint32Array(r);o.set(e.g[0],0),o.set(e.g[1],4),o.set(e.g[2],8),o.set(e.a,12),o.set(e.gf,16),a.set([t.n,s,i||0,0],20),this.device.queue.writeBuffer(t.keyParams,0,r)}encodeKeys(t,e,s){t.setPipeline(s.texture?this.pKeyTex:this.pKeyBuf),t.setBindGroup(0,this.keyGroup(e,s)),Ut(t,Math.ceil(e.n/256))}encodeRadix(t,e,s){let i=e.lastGroups.get(s);i||(i=e.group(this.layouts.scatter,[e.pass[3],e.keysB,e.valsB,e.keysA,s,e.hist,e.totals],"scatter 3"),e.lastGroups.set(s,i));for(let r=0;r<4;r++)t.setPipeline(this.pHist),t.setBindGroup(0,e.histGroups[r]),t.dispatchWorkgroups(e.tiles),t.setPipeline(this.pScan),t.setBindGroup(0,e.scanGroup),t.dispatchWorkgroups(256),t.setPipeline(this.pDigits),t.setBindGroup(0,e.digitsGroup),t.dispatchWorkgroups(1),t.setPipeline(r===0?this.pFirst:r===3?this.pLast:this.pMid),t.setBindGroup(0,r===3?i:e.scatterGroups[r]),t.dispatchWorkgroups(e.tiles)}async readU32(t,e){let s=this.device,i=GPUBufferUsage;if(!this.pCopy){let u=s.createShaderModule({code:He,label:"gpu sort copy"});this.pCopy=s.createComputePipeline({label:"gpu sort copy",layout:s.createPipelineLayout({bindGroupLayouts:[this.layouts.copy]}),compute:{module:u,entryPoint:"main"}})}let r=s.createBuffer({size:16,usage:i.UNIFORM,mappedAtCreation:!0});new Uint32Array(r.getMappedRange()).set([e,0,0,0]),r.unmap();let o=s.createBuffer({size:Math.max(16,4*e),usage:i.STORAGE|i.COPY_SRC}),a=s.createBuffer({size:Math.max(16,4*e),usage:i.MAP_READ|i.COPY_DST}),h=s.createBindGroup({layout:this.layouts.copy,entries:[{binding:0,resource:{buffer:r}},{binding:1,resource:{buffer:t}},{binding:2,resource:{buffer:o}}]}),l=s.createCommandEncoder({label:"gpu sort read-back"}),c=l.beginComputePass();c.setPipeline(this.pCopy),c.setBindGroup(0,h),Ut(c,Math.ceil(e/256)),c.end(),l.copyBufferToBuffer(o,0,a,0,Math.max(16,4*e)),s.queue.submit([l.finish()]),await a.mapAsync(GPUMapMode.READ);let f=new Uint32Array(a.getMappedRange().slice(0,4*e));a.unmap();for(let u of[r,o,a])u.destroy();return f}},it=class{constructor(t,e){if(!t||!t.isWebGPU||!t._device)throw new Error("the GPU depth sort needs Babylon's WebGPU engine");this.engine=t,this.scene=e,this.device=t._device,this.radix=new xt(this.device),this.sorters=new Set,this.failed=null,this.radix.compileErrors().then(i=>{i.length&&this._fail("WGSL: "+i.join("; "))});let s=globalThis.BABYLON&&globalThis.BABYLON.GaussianSplattingMeshBase;this._added=e.onNewMeshAddedObservable.add(i=>{s&&i instanceof s&&!i.__gpuSort&&queueMicrotask(()=>{!i.isDisposed()&&!i.__gpuSort&&!this.failed&&this.attach(i)})})}attach(t){if(this.failed)return null;if(t.__gpuSort)return t.__gpuSort;let e=new kt(this,t);return this.sorters.add(e),e}_fail(t){if(!this.failed){this.failed=t,console.warn("GPU depth sort failed ("+t+"); Babylon's sort worker takes over.");for(let e of[...this.sorters])e.giveBack(t)}}dispose(){this.scene.onNewMeshAddedObservable.remove(this._added);for(let t of[...this.sorters])t.dispose()}},kt=class n{constructor(t,e){this.owner=t,this.mesh=e,this.radix=t.radix,this.buffer=null,this.version=1,this.state=new WeakMap,this.ws=null,this.checked=!1,this.stats={sorts:0,encodeMs:0},this.onSorted=null,e.__gpuSort=this,e.disableDepthSort=!0,this._obs=e.onBeforeRenderObservable.add(()=>this._beforeDraw()),this._disp=e.onDisposeObservable.add(()=>this.dispose())}setPositions(t){this.buffer=t||null,this.version++}static indexBuffer(t){let e=t&&t.mesh&&t.mesh._thinInstanceDataStorage,s=e&&e.matrixBuffer,i=s&&s.getBuffer&&s.getBuffer();return i?{gpu:i.underlyingResource,bytes:i.capacity||0}:null}_source(){let t=this.mesh;if(this.buffer)return{buffer:this.buffer,count:Math.min(t._vertexCount,Math.floor(this.buffer.size/16)),width:0};if(t.useSog)return null;let e=t._centersTexture,s=e&&e.getInternalTexture&&e.getInternalTexture(),i=s&&s._hardwareTexture&&s._hardwareTexture.underlyingResource;return i?{texture:i,count:t._vertexCount,width:i.width}:null}_beforeDraw(){let t=this.mesh,e=t.getScene().activeCamera;if(!e||!t._cameraViewInfos)return;let s=t._cameraViewInfos.get(e.uniqueId);if(!(!s||!s.splatIndexBufferSet)){if(t.isCompound||t._activeSplatRanges){this.giveBack("compound meshes and splat ranges are left to Babylon's worker");return}if(t._delayedTextureUpdate){let i=t._delayedTextureUpdate,r=t._getTextureSize(t._vertexCount+15&-16);t._updateSubTextures(i.centers,i.covA,i.covB,i.colors,0,r.y,i.sh),t._delayedTextureUpdate=null,this.version++}t._sortIsDirty&&(t._sortIsDirty=!1,this.version++),this.sortFor(s,!1)}}sortFor(t,e){let s=this.mesh,i=t.camera,r=n.indexBuffer(t),o=s._splatIndex?s._splatIndex.length:0;if(!i||!r||!r.gpu||!o||r.bytes<4*o)return!1;let a=s.computeWorldMatrix(!0).m,h=i.getViewMatrix().m,l=i.globalPosition,c=s.viewUpdateThreshold,f=this.state.get(t),u=e||!f||f.dst!==r.gpu||f.version!==this.version||f.n!==o;if(!u){let A=(m,q)=>Math.abs(m-q)<=c;for(let m=0;m<16&&!u;m++)A(f.W[m],a[m])||(u=!0);!u&&!(A(f.f[0],h[2])&&A(f.f[1],h[6])&&A(f.f[2],h[10])&&A(f.p[0],l.x)&&A(f.p[1],l.y)&&A(f.p[2],l.z))&&(u=!0)}if(!u)return!1;let p=this._source();if(!p)return!1;let g=St(a,h,[l.x,l.y,l.z]),v=performance.now(),y=this.owner.device,w=!this.checked||!this.ws||this.ws.n!==o;w&&(y.pushErrorScope("out-of-memory"),y.pushErrorScope("validation")),(!this.ws||this.ws.n!==o)&&(this.radix.destroy(this.ws),this.ws=this.radix.workspace(o," ("+s.name+")")),this.radix.writeKeyParams(this.ws,Ne(g),p.count,p.width);let k=y.createCommandEncoder({label:"splat depth sort"}),M=k.beginComputePass({label:"splat depth sort"});this.radix.encodeKeys(M,this.ws,p),this.radix.encodeRadix(M,this.ws,r.gpu),M.end(),y.queue.submit([k.finish()]),w&&(this.checked=!0,Promise.all([y.popErrorScope(),y.popErrorScope()]).then(A=>{let m=A[0]||A[1];m&&this.owner._fail(m.message)})),this.state.set(t,{dst:r.gpu,version:this.version,n:o,W:Array.from(a),f:[h[2],h[6],h[10]],p:[l.x,l.y,l.z],params:g,count:p.count});let T=performance.now()-v;return this.stats.sorts++,this.stats.encodeMs+=T,this.onSorted&&this.onSorted(T),!0}async readOrder(t){let e=this.mesh,s=e._cameraViewInfos&&e._cameraViewInfos.get((t||e.getScene().activeCamera).uniqueId),i=n.indexBuffer(s),r=s&&this.state.get(s);if(!i||!r)return null;let o=await this.radix.readU32(i.gpu,r.n),a=new Float32Array(o.buffer),h=new Uint32Array(r.n);for(let l=0;l<r.n;l++)h[l]=a[l];return{order:h,n:r.n,count:r.count,params:r.params,source:this.buffer}}async bench(t=20){let e=this.mesh,s=e._cameraViewInfos&&e._cameraViewInfos.get(e.getScene().activeCamera.uniqueId);if(!s)return null;let i=this.owner.device;await i.queue.onSubmittedWorkDone();let r=performance.now();for(let o=0;o<t;o++)this.sortFor(s,!0);return await i.queue.onSubmittedWorkDone(),(performance.now()-r)/t}giveBack(t){let e=this.mesh;console.warn("GPU depth sort off for "+e.name+": "+t),this.dispose(),e.isDisposed()||(e.disableDepthSort=!1)}dispose(){let t=this.mesh;this._obs&&(t.onBeforeRenderObservable.remove(this._obs),this._obs=null),this._disp&&(t.onDisposeObservable.remove(this._disp),this._disp=null),this.radix.destroy(this.ws),this.ws=null,t.__gpuSort===this&&delete t.__gpuSort,this.owner.sorters.delete(this)}};var Gt=.00392156862745098,_t=256;function je(n){return`struct Count { mvp: mat4x4f, n: u32, width: u32, margin: f32, opacity: u32 };
@group(0) @binding(0) var<uniform> U: Count;
${n==="texture"?"@group(0) @binding(1) var positions: texture_2d<f32>;":"@group(0) @binding(1) var<storage, read> positions: array<vec4f>;"}
@group(0) @binding(2) var<storage, read_write> total: array<atomic<u32>, 4>;

@compute @workgroup_size(${_t})
fn main(@builtin(global_invocation_id) gid: vec3u, @builtin(num_workgroups) nwg: vec3u) {
  let i = gid.x + gid.y * nwg.x * ${_t}u;
  if (i >= U.n) { return; }
  let p = ${n==="texture"?"textureLoad(positions, vec2u(i % U.width, i / U.width), 0)":"positions[i]"};
  if (U.opacity == 1u && !(p.w >= ${Gt})) { return; }
  atomicAdd(&total[0], 1u);
  let c = U.mvp * vec4f(p.xyz, 1.0);
  if (c.w > 0.0 && abs(c.x) <= U.margin * c.w && abs(c.y) <= U.margin * c.w) { atomicAdd(&total[1], 1u); }
}
`}function Vt(n,t,e,s,i=1.2,r=1){let o=0,a=0,h=0;for(let c=0;c<e;c+=r){h++;let f=n[4*c],u=n[4*c+1],p=n[4*c+2];if(s&&!(n[4*c+3]>=Gt))continue;o++;let g=f*t[3]+u*t[7]+p*t[11]+t[15];if(!(g>0))continue;let v=f*t[0]+u*t[4]+p*t[8]+t[12],y=f*t[1]+u*t[5]+p*t[9]+t[13];Math.abs(v)<=i*g&&Math.abs(y)<=i*g&&a++}let l=h?e/h:0;return{alive:Math.round(o*l),inView:Math.round(a*l)}}var rt=class{constructor(t){this.device=t,this.pipelines={},this.uniform=t.createBuffer({label:"splat count params",size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.total=t.createBuffer({label:"splat count",size:16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.back=t.createBuffer({label:"splat count read-back",size:16,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.busy=!1,this.failed=null,this._groups=new WeakMap}_pipeline(t){if(!this.pipelines[t]){let e=this.device.createShaderModule({label:"splat count ("+t+")",code:je(t)});this.pipelines[t]=this.device.createComputePipeline({label:"splat count ("+t+")",layout:"auto",compute:{module:e,entryPoint:"main"}})}return this.pipelines[t]}async count(t,e,s=1.2){if(this.busy||this.failed||!t||!t.count)return null;this.busy=!0;try{let i=this.device,r=t.buffer?"buffer":"texture",o=t.buffer||t.texture,a=this._pipeline(r),h=new ArrayBuffer(80),l=new Float32Array(h),c=new Uint32Array(h);l.set(e,0),c[16]=t.count,c[17]=t.width||0,l[18]=s,c[19]=t.buffer?1:0,i.queue.writeBuffer(this.uniform,0,h),i.queue.writeBuffer(this.total,0,new Uint32Array(4));let f=this._groups.get(o);f||(f=i.createBindGroup({layout:a.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.uniform}},{binding:1,resource:t.buffer?{buffer:t.buffer}:t.texture.createView()},{binding:2,resource:{buffer:this.total}}]}),this._groups.set(o,f)),i.pushErrorScope("validation");let u=i.createCommandEncoder({label:"splat count"}),p=u.beginComputePass({label:"splat count"}),g=Math.ceil(t.count/_t),v=Math.min(g,65535);p.setPipeline(a),p.setBindGroup(0,f),p.dispatchWorkgroups(v,Math.ceil(g/v)),p.end(),u.copyBufferToBuffer(this.total,0,this.back,0,16),i.queue.submit([u.finish()]);let y=await i.popErrorScope();if(y)throw new Error(y.message);await this.back.mapAsync(GPUMapMode.READ);let w=new Uint32Array(this.back.getMappedRange().slice(0));return this.back.unmap(),{alive:w[0],inView:w[1]}}catch(i){return this.failed=String(i&&i.message?i.message:i),console.warn("the splats in view are not counted on this GPU ("+this.failed+")"),null}finally{this.busy=!1}}dispose(){for(let t of[this.uniform,this.total,this.back])try{t.destroy()}catch{}}};var Mt=["rectilinear","panini","stereographic","equisolid","equidistant","orthographic"],nt=80*Math.PI/180,P=Object.freeze({kind:"rectilinear",d:1,k1:0,k2:0,vignette:0,ca:0,warmth:0,contrast:0,lift:0,letterbox:0,dof:0,bokeh:"disc",catEye:0,curvature:0,focusX:0,focusY:0,bloom:0,bloomThreshold:.7,halation:0,flare:0,streak:0,focusPoint:0,focusTX:0,focusTY:0}),at=["disc","oval","cat"];function X(n){let t={...P,...n};return t.kind!=="rectilinear"||["k1","k2","vignette","ca","warmth","contrast","lift","letterbox","dof","bloom","flare","streak"].some(e=>t[e]!==0)}function lt(n){let t={...P,...n};return t.bloom>0||t.flare>0||t.streak>0}var ot=4,Wt=.35;var $t=`precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float threshold;
void main(void) {
  vec4 c = texture2D(textureSampler, vUV);
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  float knee = clamp((lum - threshold) / max(1e-4, 1.0 - threshold), 0.0, 1.0);
  gl_FragColor = vec4(c.rgb * knee * knee, 1.0);
}
`,Kt=`varying vUV: vec2f;
var textureSamplerSampler: sampler;
var textureSampler: texture_2d<f32>;
uniform threshold: f32;
@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  let c = textureSample(textureSampler, textureSamplerSampler, input.vUV);
  let lum = dot(c.rgb, vec3f(0.2126, 0.7152, 0.0722));
  let knee = clamp((lum - uniforms.threshold) / max(1e-4, 1.0 - uniforms.threshold), 0.0, 1.0);
  fragmentOutputs.color = vec4f(c.rgb * knee * knee, 1.0);
}
`;var qt=`precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float bloom;
uniform float halation;
uniform float flare;
uniform float streak;
uniform float aspect;
void main(void) {
  vec3 tint = vec3(1.0 + 0.6 * halation, 1.0 - 0.25 * halation, 1.0 - 0.6 * halation);
  vec3 col = texture2D(textureSampler, vUV).rgb * bloom * tint;
  if (flare > 0.0) {
    vec3 tints[${ot}];
    tints[0] = vec3(1.0, 0.8, 0.6); tints[1] = vec3(0.6, 0.8, 1.0); tints[2] = vec3(0.8, 1.0, 0.7); tints[3] = vec3(1.0, 0.6, 0.9);
    vec2 mirror = vec2(1.0) - vUV, gv = (vec2(0.5) - vUV) * ${Wt.toFixed(3)};
    for (int k = 0; k < ${ot}; k++) {
      vec2 o = fract(mirror + gv * float(k));
      float w = pow(1.0 - length(vec2(0.5) - o) / 0.7071, 2.0);
      col += texture2D(textureSampler, o).rgb * w * tints[k] * flare * 2.0;
    }
    vec2 hv = normalize(vec2(0.5) - mirror + 1e-6) * 0.45;
    vec2 ho = fract(mirror + hv);
    float hw = pow(1.0 - length(vec2(0.5) - ho) / 0.7071, 5.0);
    col += texture2D(textureSampler, ho).rgb * hw * flare * 0.9;
  }
  if (streak > 0.0) {
    vec3 s = vec3(0.0);
    for (int k = 1; k <= 16; k++) {
      float dx = float(k) * 0.02 / aspect, w = 1.0 - float(k) / 17.0;
      s += (texture2D(textureSampler, vUV + vec2(dx, 0.0)).rgb + texture2D(textureSampler, vUV - vec2(dx, 0.0)).rgb) * w;
    }
    col += s / 8.0 * 3.0 * vec3(0.45, 0.65, 1.0) * streak;
  }
  gl_FragColor = vec4(col, 1.0);
}
`,Ht=`varying vUV: vec2f;
var textureSamplerSampler: sampler;
var textureSampler: texture_2d<f32>;
uniform bloom: f32;
uniform halation: f32;
uniform flare: f32;
uniform streak: f32;
uniform aspect: f32;
fn at(uv: vec2f) -> vec3f { return textureSampleLevel(textureSampler, textureSamplerSampler, uv, 0.0).rgb; }
@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  let tint = vec3f(1.0 + 0.6 * uniforms.halation, 1.0 - 0.25 * uniforms.halation, 1.0 - 0.6 * uniforms.halation);
  var col = at(input.vUV) * uniforms.bloom * tint;
  if (uniforms.flare > 0.0) {
    let tints = array<vec3f, ${ot}>(vec3f(1.0, 0.8, 0.6), vec3f(0.6, 0.8, 1.0), vec3f(0.8, 1.0, 0.7), vec3f(1.0, 0.6, 0.9));
    let mirror = vec2f(1.0) - input.vUV;
    let gv = (vec2f(0.5) - input.vUV) * ${Wt.toFixed(3)};
    for (var k = 0; k < ${ot}; k++) {
      let o = fract(mirror + gv * f32(k));
      let w = pow(max(0.0, 1.0 - length(vec2f(0.5) - o) / 0.7071), 2.0);
      col = col + at(o) * w * tints[k] * uniforms.flare * 2.0;
    }
    let hv = normalize(vec2f(0.5) - mirror + vec2f(1e-6)) * 0.45;
    let ho = fract(mirror + hv);
    let hw = pow(max(0.0, 1.0 - length(vec2f(0.5) - ho) / 0.7071), 5.0);
    col = col + at(ho) * hw * uniforms.flare * 0.9;
  }
  if (uniforms.streak > 0.0) {
    var s = vec3f(0.0);
    for (var k = 1; k <= 16; k++) {
      let dx = f32(k) * 0.02 / uniforms.aspect;
      let w = 1.0 - f32(k) / 17.0;
      s = s + (at(input.vUV + vec2f(dx, 0.0)) + at(input.vUV - vec2f(dx, 0.0))) * w;
    }
    col = col + s / 8.0 * 3.0 * vec3f(0.45, 0.65, 1.0) * uniforms.streak;
  }
  fragmentOutputs.color = vec4f(col, 1.0);
}
`,jt=`precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D sceneSampler;
uniform float on;
void main(void) {
  vec4 s = texture2D(sceneSampler, vUV);
  gl_FragColor = vec4(s.rgb + texture2D(textureSampler, vUV).rgb * on, s.a);
}
`,Xt=`varying vUV: vec2f;
var textureSamplerSampler: sampler;
var textureSampler: texture_2d<f32>;
var sceneSamplerSampler: sampler;
var sceneSampler: texture_2d<f32>;
uniform on: f32;
@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  let s = textureSample(sceneSampler, sceneSamplerSampler, input.vUV);
  let g = textureSample(textureSampler, textureSamplerSampler, input.vUV).rgb;
  fragmentOutputs.color = vec4f(s.rgb + g * uniforms.on, s.a);
}
`,Yt=40,Zt=.025,Qt=Math.PI*(3-Math.sqrt(5));function Xe(n){return n==="stereographic"?{g:t=>Math.tan(t/2),inv:t=>2*Math.atan(t)}:n==="equisolid"?{g:t=>Math.sin(t/2),inv:t=>2*Math.asin(Math.min(1,t))}:n==="equidistant"?{g:t=>t,inv:t=>t}:n==="orthographic"?{g:Math.sin,inv:t=>Math.asin(Math.min(1,t))}:{g:Math.tan,inv:Math.atan}}function Ye(n,t,e,s,i=1){if(n==="panini"){let c=Math.tan(s),f=t*c,u=e*c,p=f/(i+1),g=Math.sqrt(1+p*p),v=Math.max(-1,Math.min(1,p*i/g)),y=Math.atan(p)+Math.asin(v);if(Math.abs(y)>nt)return null;let w=(i+1)/(i+Math.cos(y)),k=u/w;return[Math.tan(y),k/Math.cos(y)]}let r=Math.hypot(t,e);if(r===0)return[0,0];let o=Xe(n),a=r*o.g(s);if(n==="orthographic"&&a>1)return null;let h=o.inv(a);if(!(h<=nt))return null;let l=Math.tan(h)/r;return[t*l,e*l]}function Ze(n,t,e=0,s=0,i=1){if(!e&&!s)return[n,t];let r=(n*n+t*t)/(i*i),o=1+e*r+s*r*r;return o>.05?[n/o,t/o]:null}function Nt(n,t,e,s,i=16/9){let r={...P,...n},o=Ze(t,e,r.k1,r.k2,Math.hypot(i,1));return o?Ye(r.kind,o[0],o[1],s,r.d):null}function Jt(n,t,e,s=1.5){let i={...P,...n};if(i.kind==="rectilinear"&&!i.k1&&!i.k2&&!i.ca)return{half:t,ratio:1};let r=Math.tan(t),o=64,a=1+Math.abs(i.ca);for(let f=0;f<=o;f++){let u=-1+2*f/o;for(let[p,g]of[[u*e,1],[u*e,-1],[e,u],[-e,u]]){let v=Nt(i,p*a,g*a,t,e);v&&(r=Math.max(r,Math.abs(v[1]),Math.abs(v[0])/e))}}let h=1e-4,l=Nt(i,h,0,t,e),c=l?l[0]/h:Math.tan(t);return{half:Math.atan(r),ratio:Math.min(Math.max(1,r/c),s)}}var Qe=`
float depthAt(vec2 uv) {
  vec4 dd = texture2D(depthSampler, uv);
  if (dd.g < 0.5) return far;
  float zc = dd.r * (near + far) - near;
  return halfZ > 0.5 ? (zc * (far - near) + far * near) / far : (zc * (far - near) + 2.0 * far * near) / (far + near);
}
float cocOf(float z, float zf) { return min(1.0, abs(1.0 - zf / z) * dof); }
vec3 dofColor(vec2 uv, vec2 q, vec2 ur, vec2 ub) {
  vec2 qf = vec2(focusX * aspect, focusY);
  vec2 uf = focusPoint > 0.5 ? uvOf(vec2(focusTX, focusTY)) : uvOf(pinholeOf(undistortQ(qf)));
  float zf0 = 0.0;
  for (int k = 0; k < 5; k++) { vec2 o = k == 0 ? vec2(0.0) : 0.004 * vec2(k == 1 ? 1.0 : (k == 2 ? -1.0 : 0.0), k == 3 ? 1.0 : (k == 4 ? -1.0 : 0.0)); zf0 += depthAt(uf + o); }
  float rr = length(q) / sqrt(aspect * aspect + 1.0);
  float zf = zf0 / 5.0 * max(0.05, 1.0 - curvature * rr * rr);
  vec2 dir = length(q) > 1e-6 ? q / length(q) : vec2(1.0, 0.0);
  vec2 scale = DOFMAX * vec2(1.0 / aspect, 1.0);
  float zc = depthAt(uv), cc = cocOf(zc, zf);
  vec4 base = texture2D(textureSampler, uv);
  vec3 col = base.rgb;
  if (ca != 0.0) { col.r = texture2D(textureSampler, ur).r; col.b = texture2D(textureSampler, ub).b; }
  float probe = cc;                                           // in focus here and around: nothing to blur (the early exit)
  for (int k = 0; k < 4; k++) { vec2 o = vec2(k == 0 ? 1.0 : (k == 1 ? -1.0 : 0.0), k == 2 ? 1.0 : (k == 3 ? -1.0 : 0.0)); probe = max(probe, cocOf(depthAt(uv + o * scale), zf)); }
  if (probe < 0.04) return col;
  float tot = 1.0;
  for (int i = 0; i < DOFTAPS; i++) {
    float r = sqrt((float(i) + 0.5) / float(DOFTAPS)), a = float(i) * GOLDENA;
    vec2 p = r * vec2(cos(a), sin(a));
    if (bokeh == 1) p.x *= 0.5;
    if (bokeh == 2 && length(p + dir * catEye * rr) > 1.0) continue;
    vec2 off = p * scale;
    float sz = depthAt(uv + off), ss = cocOf(sz, zf);
    if (sz > zc) ss = min(ss, cc * 2.0);
    float m = smoothstep(r - 0.08, r + 0.08, ss);
    vec3 s = texture2D(textureSampler, uv + off).rgb;
    if (ca != 0.0) { s.r = texture2D(textureSampler, ur + off).r; s.b = texture2D(textureSampler, ub + off).b; }
    col += mix(col / tot, s, m);
    tot += 1.0;
  }
  return col / tot;
}
`,Je=`
vec2 undistortQ(vec2 q) {
  if (k1 == 0.0 && k2 == 0.0) return q;
  float r2 = dot(q, q) / (aspect * aspect + 1.0), den = 1.0 + k1 * r2 + k2 * r2 * r2;
  if (!(den > 0.05)) return vec2(1e9);
  return q / den;
}
vec2 pinholeOf(vec2 q) {
  if (q.x > 1e8) return vec2(1e9);
  if (kind == 1) {
    float T = tan(halfFov), x = q.x * T, y = q.y * T;
    float k = x / (d + 1.0), R = sqrt(1.0 + k * k);
    float lam = atan(k) + asin(clamp(k * d / R, -1.0, 1.0));
    if (abs(lam) > MAXA) return vec2(1e9);
    float S = (d + 1.0) / (d + cos(lam));
    return vec2(tan(lam), (y / S) / cos(lam));
  }
  float r = length(q);
  if (r < 1e-9) return vec2(0.0);
  float th;
  if (kind == 2) th = 2.0 * atan(r * tan(halfFov * 0.5));
  else if (kind == 3) th = 2.0 * asin(min(1.0, r * sin(halfFov * 0.5)));
  else if (kind == 4) th = r * halfFov;
  else if (kind == 5) { float v = r * sin(halfFov); if (v > 1.0) return vec2(1e9); th = asin(v); }
  else th = atan(r * tan(halfFov));
  if (th > MAXA) return vec2(1e9);
  return q * (tan(th) / r);
}
vec2 uvOf(vec2 t) { return vec2(t.x / (tanRender * aspect), t.y / tanRender) * 0.5 + 0.5; }
bool outside(vec2 uv) { return any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0))); }
${Qe}`,te=`precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform int kind;
uniform float halfFov;
uniform float tanRender;
uniform float aspect;
uniform float d;
uniform float k1;
uniform float k2;
uniform float vignette;
uniform float ca;
uniform float warmth;
uniform float contrast;
uniform float lift;
uniform float letterbox;
uniform vec4 background;
uniform sampler2D depthSampler;
uniform float dof;
uniform int bokeh;
uniform float catEye;
uniform float curvature;
uniform float focusX;
uniform float focusY;
uniform float focusPoint;
uniform float focusTX;
uniform float focusTY;
uniform float near;
uniform float far;
uniform float halfZ;
const float MAXA = ${nt.toFixed(6)};
const int DOFTAPS = ${Yt};
const float DOFMAX = ${Zt.toFixed(4)};
const float GOLDENA = ${Qt.toFixed(8)};
${Je}
void main(void) {
  vec2 q = vec2((vUV.x * 2.0 - 1.0) * aspect, vUV.y * 2.0 - 1.0);
  if (letterbox > 0.0 && abs(q.y) > aspect / letterbox) { gl_FragColor = background; return; }
  vec2 t = pinholeOf(undistortQ(q));
  vec2 uv = uvOf(t);
  if (outside(uv)) { gl_FragColor = background; return; }
  vec4 c = texture2D(textureSampler, uv);
  vec2 ur = uv, ub = uv;
  if (ca != 0.0) {                                           // red laid out larger, blue smaller: the fringes grow toward the edge
    ur = uvOf(pinholeOf(undistortQ(q * (1.0 + ca)))); ub = uvOf(pinholeOf(undistortQ(q * (1.0 - ca))));
    if (outside(ur)) ur = uv;
    if (outside(ub)) ub = uv;
    c.r = texture2D(textureSampler, ur).r;
    c.b = texture2D(textureSampler, ub).b;
  }
  if (dof > 0.0) c.rgb = dofColor(uv, q, ur, ub);
  if (vignette > 0.0) { float c2 = 1.0 / (1.0 + dot(t, t)); c.rgb *= mix(1.0, c2 * c2, vignette); }
  c.rgb *= vec3(1.0 + 0.08 * warmth, 1.0, 1.0 - 0.08 * warmth);
  c.rgb = (c.rgb - 0.5) * (1.0 + contrast) + 0.5;
  c.rgb = lift + (1.0 - lift) * clamp(c.rgb, 0.0, 1.0);
  gl_FragColor = c;
}
`,ee=`varying vUV: vec2f;
var textureSamplerSampler: sampler;
var textureSampler: texture_2d<f32>;
uniform kind: i32;
uniform halfFov: f32;
uniform tanRender: f32;
uniform aspect: f32;
uniform d: f32;
uniform k1: f32;
uniform k2: f32;
uniform vignette: f32;
uniform ca: f32;
uniform warmth: f32;
uniform contrast: f32;
uniform lift: f32;
uniform letterbox: f32;
uniform background: vec4f;
var depthSamplerSampler: sampler;
var depthSampler: texture_2d<f32>;
uniform dof: f32;
uniform bokeh: i32;
uniform catEye: f32;
uniform curvature: f32;
uniform focusX: f32;
uniform focusY: f32;
uniform focusPoint: f32;
uniform focusTX: f32;
uniform focusTY: f32;
uniform near: f32;
uniform far: f32;
uniform halfZ: f32;
const MAXA: f32 = ${nt.toFixed(6)};
const DOFTAPS: i32 = ${Yt};
const DOFMAX: f32 = ${Zt.toFixed(4)};
const GOLDENA: f32 = ${Qt.toFixed(8)};

fn undistortQ(q: vec2f) -> vec2f {
  if (uniforms.k1 == 0.0 && uniforms.k2 == 0.0) { return q; }
  let r2 = dot(q, q) / (uniforms.aspect * uniforms.aspect + 1.0);
  let den = 1.0 + uniforms.k1 * r2 + uniforms.k2 * r2 * r2;
  if (!(den > 0.05)) { return vec2f(1e9); }
  return q / den;
}

fn pinholeOf(q: vec2f) -> vec2f {
  if (q.x > 1e8) { return vec2f(1e9); }
  if (uniforms.kind == 1) {
    let T = tan(uniforms.halfFov);
    let x = q.x * T;
    let y = q.y * T;
    let k = x / (uniforms.d + 1.0);
    let R = sqrt(1.0 + k * k);
    let lam = atan(k) + asin(clamp(k * uniforms.d / R, -1.0, 1.0));
    if (abs(lam) > MAXA) { return vec2f(1e9); }
    let S = (uniforms.d + 1.0) / (uniforms.d + cos(lam));
    return vec2f(tan(lam), (y / S) / cos(lam));
  }
  let r = length(q);
  if (r < 1e-9) { return vec2f(0.0); }
  var th: f32;
  if (uniforms.kind == 2) { th = 2.0 * atan(r * tan(uniforms.halfFov * 0.5)); }
  else if (uniforms.kind == 3) { th = 2.0 * asin(min(1.0, r * sin(uniforms.halfFov * 0.5))); }
  else if (uniforms.kind == 4) { th = r * uniforms.halfFov; }
  else if (uniforms.kind == 5) { let v = r * sin(uniforms.halfFov); if (v > 1.0) { return vec2f(1e9); } th = asin(v); }
  else { th = atan(r * tan(uniforms.halfFov)); }
  if (th > MAXA) { return vec2f(1e9); }
  return q * (tan(th) / r);
}

fn uvOf(t: vec2f) -> vec2f { return vec2f(t.x / (uniforms.tanRender * uniforms.aspect), t.y / uniforms.tanRender) * 0.5 + 0.5; }
fn outside(uv: vec2f) -> bool { return any(uv < vec2f(0.0)) || any(uv > vec2f(1.0)); }

fn depthAt(uv: vec2f) -> f32 {
  let dd = textureSampleLevel(depthSampler, depthSamplerSampler, clamp(uv, vec2f(0.0), vec2f(1.0)), 0.0);
  if (dd.g < 0.5) { return uniforms.far; }
  let n = uniforms.near;
  let f = uniforms.far;
  let zc = dd.r * (n + f) - n;
  if (uniforms.halfZ > 0.5) { return (zc * (f - n) + f * n) / f; }
  return (zc * (f - n) + 2.0 * f * n) / (f + n);
}
fn cocOf(z: f32, zf: f32) -> f32 { return min(1.0, abs(1.0 - zf / z) * uniforms.dof); }
fn sampleAt(uv: vec2f) -> vec4f { return textureSampleLevel(textureSampler, textureSamplerSampler, clamp(uv, vec2f(0.0), vec2f(1.0)), 0.0); }
fn dofColor(uv: vec2f, q: vec2f, ur: vec2f, ub: vec2f, sharp: vec3f) -> vec3f {
  let qf = vec2f(uniforms.focusX * uniforms.aspect, uniforms.focusY);
  var uf = uvOf(pinholeOf(undistortQ(qf)));
  if (uniforms.focusPoint > 0.5) { uf = uvOf(vec2f(uniforms.focusTX, uniforms.focusTY)); }
  let zf0 = depthAt(uf) + depthAt(uf + vec2f(0.004, 0.0)) + depthAt(uf - vec2f(0.004, 0.0)) + depthAt(uf + vec2f(0.0, 0.004)) + depthAt(uf - vec2f(0.0, 0.004));
  let rr = length(q) / sqrt(uniforms.aspect * uniforms.aspect + 1.0);
  let zf = zf0 / 5.0 * max(0.05, 1.0 - uniforms.curvature * rr * rr);
  var dir = vec2f(1.0, 0.0);
  if (length(q) > 1e-6) { dir = q / length(q); }
  let scale = DOFMAX * vec2f(1.0 / uniforms.aspect, 1.0);
  let zc = depthAt(uv);
  let cc = cocOf(zc, zf);
  var probe = cc;
  probe = max(probe, cocOf(depthAt(uv + vec2f(1.0, 0.0) * scale), zf));
  probe = max(probe, cocOf(depthAt(uv - vec2f(1.0, 0.0) * scale), zf));
  probe = max(probe, cocOf(depthAt(uv + vec2f(0.0, 1.0) * scale), zf));
  probe = max(probe, cocOf(depthAt(uv - vec2f(0.0, 1.0) * scale), zf));
  if (probe < 0.04) { return sharp; }
  var col = sharp;
  var tot = 1.0;
  for (var i = 0; i < DOFTAPS; i++) {
    let r = sqrt((f32(i) + 0.5) / f32(DOFTAPS));
    let a = f32(i) * GOLDENA;
    var p = r * vec2f(cos(a), sin(a));
    if (uniforms.bokeh == 1) { p.x = p.x * 0.5; }
    if (uniforms.bokeh == 2 && length(p + dir * uniforms.catEye * rr) > 1.0) { continue; }
    let off = p * scale;
    let sz = depthAt(uv + off);
    var ss = cocOf(sz, zf);
    if (sz > zc) { ss = min(ss, cc * 2.0); }
    let m = smoothstep(r - 0.08, r + 0.08, ss);
    var s = sampleAt(uv + off).rgb;
    if (uniforms.ca != 0.0) { s.r = sampleAt(ur + off).r; s.b = sampleAt(ub + off).b; }
    col = col + mix(col / tot, s, m);
    tot = tot + 1.0;
  }
  return col / tot;
}

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  let q = vec2f((input.vUV.x * 2.0 - 1.0) * uniforms.aspect, input.vUV.y * 2.0 - 1.0);
  let t = pinholeOf(undistortQ(q));
  let uv = uvOf(t);
  // (every sample is taken before a branch: WGSL wants textureSample in uniform control flow)
  var c = textureSample(textureSampler, textureSamplerSampler, clamp(uv, vec2f(0.0), vec2f(1.0)));
  let ur = uvOf(pinholeOf(undistortQ(q * (1.0 + uniforms.ca))));
  let ub = uvOf(pinholeOf(undistortQ(q * (1.0 - uniforms.ca))));
  let cr = textureSample(textureSampler, textureSamplerSampler, clamp(ur, vec2f(0.0), vec2f(1.0))).r;
  let cb = textureSample(textureSampler, textureSamplerSampler, clamp(ub, vec2f(0.0), vec2f(1.0))).b;
  if ((uniforms.letterbox > 0.0 && abs(q.y) > uniforms.aspect / uniforms.letterbox) || outside(uv)) {
    fragmentOutputs.color = uniforms.background;
    return fragmentOutputs;
  }
  var urs = uv;
  var ubs = uv;
  if (uniforms.ca != 0.0) {
    if (!outside(ur)) { c.r = cr; urs = ur; }
    if (!outside(ub)) { c.b = cb; ubs = ub; }
  }
  if (uniforms.dof > 0.0) { c = vec4f(dofColor(uv, q, urs, ubs, c.rgb), c.a); }
  if (uniforms.vignette > 0.0) { let c2 = 1.0 / (1.0 + dot(t, t)); c = vec4f(c.rgb * mix(1.0, c2 * c2, uniforms.vignette), c.a); }
  var rgb = c.rgb * vec3f(1.0 + 0.08 * uniforms.warmth, 1.0, 1.0 - 0.08 * uniforms.warmth);
  rgb = (rgb - 0.5) * (1.0 + uniforms.contrast) + 0.5;
  rgb = uniforms.lift + (1.0 - uniforms.lift) * clamp(rgb, vec3f(0.0), vec3f(1.0));
  fragmentOutputs.color = vec4f(rgb, c.a);
}
`,N=Object.fromEntries(Mt.map((n,t)=>[n,t]));var L=window.BABYLON,ht=.1,se=`  float n = depthNF.x, f = depthNF.y, zc = vDepthMetric * (n + f) - n;
  float z = depthNF.z > 0.5 ? (zc * (f - n) + f * n) / f : (zc * (f - n) + 2.0 * f * n) / (f + n);`,ie=`  let n: f32 = uniforms.depthNF.x;
  let f: f32 = uniforms.depthNF.y;
  let zc: f32 = fragmentInputs.vDepthMetric * (n + f) - n;
  let z: f32 = select((zc * (f - n) + 2.0 * f * n) / (f + n), (zc * (f - n) + f * n) / f, uniforms.depthNF.z > 0.5);`,ts={first:`  if (exp(A) * vColor.a < ${ht.toFixed(3)}) discard;
  gl_FragColor = vec4(vDepthMetric, 1.0, 0.0, 1.0);`,hard:`  if (exp(A) * vColor.a < ${ht.toFixed(3)}) discard;
${se}
  gl_FragColor = vec4(z, 1.0, 0.0, 1.0);`,soft:`  if (A < -4.0) discard;
  float a = min(exp(A) * vColor.a, 0.999);
  if (a < 0.00392157) discard;
${se}
  gl_FragColor = vec4(z * a, a, 0.0, a);`},es={first:`  if (exp(A) * fragmentInputs.vColor.a < ${ht.toFixed(3)}) { discard; }
  fragmentOutputs.color = vec4f(fragmentInputs.vDepthMetric, 1.0, 0.0, 1.0);`,hard:`  if (exp(A) * fragmentInputs.vColor.a < ${ht.toFixed(3)}) { discard; }
${ie}
  fragmentOutputs.color = vec4f(z, 1.0, 0.0, 1.0);`,soft:`  if (A < -4.0) { discard; }
  let a: f32 = min(exp(A) * fragmentInputs.vColor.a, 0.999);
  if (a < 0.00392157) { discard; }
${ie}
  fragmentOutputs.color = vec4f(z * a, a, 0.0, a);`},ss=n=>`precision highp float;
varying vec2 vPosition;varying vec4 vColor;
#ifdef DEPTH_RENDER
varying float vDepthMetric;
#endif
${n==="first"?"":`uniform vec3 depthNF;
`}void main(void) {
  float A = -dot(vPosition, vPosition);
${ts[n]}
}`,is=n=>`varying vPosition: vec2f;
varying vColor: vec4f;
#ifdef DEPTH_RENDER
varying vDepthMetric: f32;
#endif
${n==="first"?"":`uniform depthNF: vec3f;
`}@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  let A: f32 = -dot(fragmentInputs.vPosition, fragmentInputs.vPosition);
${es[n]}
}`,rs=`precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D depthSampler;
uniform vec2 logRange;
void main(void) {
  vec4 d = texture2D(depthSampler, vUV);
  float g = d.g > 0.02 ? clamp((logRange.y - log(max(d.r / d.g, 1e-6))) / max(logRange.y - logRange.x, 1e-6), 0.0, 1.0) : 0.0;
  gl_FragColor = vec4(g, g, g, 1.0);
}`,ns=`varying vUV: vec2f;
var textureSamplerSampler: sampler;
var textureSampler: texture_2d<f32>;
var depthSamplerSampler: sampler;
var depthSampler: texture_2d<f32>;
uniform logRange: vec2f;
@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
  let d = textureSample(depthSampler, depthSamplerSampler, input.vUV);
  let g = select(0.0, clamp((uniforms.logRange.y - log(max(d.r / max(d.g, 1e-6), 1e-6))) / max(uniforms.logRange.y - uniforms.logRange.x, 1e-6), 0.0, 1.0), d.g > 0.02);
  fragmentOutputs.color = vec4f(g, g, g, 1.0);
}`,W={first:"gsvDepthFirst",hard:"gsvDepthHard",soft:"gsvDepthSoft"};function os(n){let t=n?n.indexOf("#ifdef USE_SOG"):-1;if(t<0)return null;let e=/#(ifdef|ifndef|if|endif)\b/g;e.lastIndex=t;let s=0,i;for(;i=e.exec(n);)if(i[1]!=="endif")s++;else if(--s===0){let r=n.slice(t,e.lastIndex);return r.includes("sogMeansMin")?r+`
`:null}return null}function re(n,t){let e=n.gaussianSplattingDepthVertexShader,s=os(n.gaussianSplattingVertexShader);return!e||!s||e.indexOf(t)<0?e:e.replace(t,t+`
`+s)}function as(){let n=L.ShaderStore&&L.ShaderStore.ShadersStore||L.Effect.ShadersStore,t=L.ShaderStore?L.ShaderStore.ShadersStoreWGSL:null;if(!n.gsvDepthFirstPixelShader){for(let e of Object.keys(W))n[W[e]+"PixelShader"]=ss(e);n.gsvDepthShowPixelShader=rs,n.gsvDepthVertexShader=re(n,"uniform sampler2D colorsTexture;")}if(t&&!t.gsvDepthFirstPixelShader){for(let e of Object.keys(W))t[W[e]+"PixelShader"]=is(e);t.gsvDepthShowPixelShader=ns,t.gsvDepthVertexShader=re(t,"var colorsTexture: texture_2d<f32>;")}}function ne(n,t="first"){as();let e=n.scene,s=L.GaussianSplattingMaterial,i=n.engine.isWebGPU?L.ShaderLanguage.WGSL:L.ShaderLanguage.GLSL,r=(n.mesh&&n.mesh.material&&n.mesh.material.getEffect&&n.mesh.material.getEffect()&&n.mesh.material.getEffect().defines||"").split(`
`).map(l=>l.trim()).filter(l=>/^#define (USE_SOG|USE_SOG_V2|IS_COMPOUND|MAX_PART_COUNT)\b/.test(l)),o=n.mesh&&n.mesh.useSog?n.mesh.sogParams:null;o&&!r.includes("#define USE_SOG")&&r.push("#define USE_SOG"),o&&o.version===2&&!r.includes("#define USE_SOG_V2")&&r.push("#define USE_SOG_V2");let a=t==="soft",h=new L.ShaderMaterial(W[t],e,{vertex:"gsvDepth",fragment:W[t]},{attributes:s._Attribs,uniforms:t==="first"?s._Uniforms:s._Uniforms.concat(["depthNF"]),samplers:s._Samplers,uniformBuffers:s._UniformBuffers,shaderLanguage:i,defines:["#define DEPTH_RENDER",...r],needAlphaBlending:a});return h.backFaceCulling=!1,a&&(h.alphaMode=L.Constants.ALPHA_PREMULTIPLIED,h.disableDepthWrite=!0),h.onBindObservable.add(l=>{let c=l.material,f=c&&c.getSourceMesh&&c.getSourceMesh()||l;s._BindEffectUniforms(f,c,h,e),s._BindSogUniforms&&s._BindSogUniforms(f,h.getEffect());let u=e.activeCamera,p=h.getEffect();p.setFloat2("depthValues",u.minZ,u.minZ+u.maxZ),t!=="first"&&p.setFloat3("depthNF",u.minZ,u.maxZ,n.engine.isNDCHalfZRange?1:0)}),h}var oe=["dof","glow","sharpness","fringes"];function ae(n,t,e=1){return t==="dof"?n.dof>0:t==="glow"?n.bloom>0||n.flare>0||n.streak>0:t==="sharpness"?e>1:t==="fringes"?n.ca!==0:!1}function le(n,t,e,s=!0){if(!s)return{...e};let i={...n};return t.has("dof")&&(i.dof=0),t.has("glow")&&(i.bloom=0,i.flare=0,i.streak=0),t.has("fringes")&&(i.ca=0),i}var ct=class{constructor(t,e,s){this.wanted=t,this.changed=e,this.log=s||(()=>{}),this.off=new Set,this.room=!0,this.lastBack=null,this.fails={},this.blocked={}}setRoom(t){t!==this.room&&(this.room=t,this.log(t?"100 % of the pixels: the lens is drawn":"under 100 % of the pixels: the lens is off"),this.changed())}shed(t=performance.now()){let e=this.wanted();for(let s of oe)if(!(this.off.has(s)||!ae(e.lens,s,e.sharpness))){if(this.lastBack&&this.lastBack.tier===s&&t-this.lastBack.at<4*1e3){let i=this.fails[s]=(this.fails[s]||0)+1;this.blocked[s]=t+10*1e3*Math.pow(2,Math.min(i-1,4))}return this.off.add(s),this.lastBack=null,this.log("frames missed: "+s+" off"),this.changed(),s}return null}restore(t=performance.now()){for(let e of oe.slice().reverse())if(!(!this.off.has(e)||this.blocked[e]&&t<this.blocked[e]))return this.off.delete(e),this.lastBack={tier:e,at:t},this.log("room: "+e+" back"),this.changed(),e;return null}forgetUnused(){let t=this.wanted();for(let e of Array.from(this.off))ae(t.lens,e,t.sharpness)||this.off.delete(e)}};var d=window.BABYLON;d.GaussianSplattingMeshBase&&"UseCountingSort"in d.GaussianSplattingMeshBase?d.GaussianSplattingMeshBase.UseCountingSort=!1:console.warn("GaussianSplattingMeshBase.UseCountingSort not found: the splats use Babylon's default (coarse) depth sort, see docs/BABYLON-NOTES.md");d.GaussianSplattingMaterial&&"KernelSize"in d.GaussianSplattingMaterial?d.GaussianSplattingMaterial.KernelSize=1.2:console.warn("GaussianSplattingMaterial.KernelSize not found: splats are drawn with Babylon's own dilation (a quarter of gsplat's), see docs/BABYLON-NOTES.md");if(new URLSearchParams(location.search).get("shader")==="stock")console.info("splat shaders: Babylon's own (?shader=stock)");else if(window.SplatShader){let n=window.SplatShader.apply(d.ShaderStore);for(let t of Object.keys(n))n[t]!=="patched"&&n[t]!=="already"&&console.warn("splat shader patch '"+t+"': "+n[t]+", splats are drawn with Babylon's own shader there, see docs/OPACITY.md")}else console.warn("splat-shader.js is not loaded: splats are drawn with Babylon's own shaders, see docs/OPACITY.md");var he=new URLSearchParams(location.search).get("colour")!=="u8",ce=268435456,ls=.04,hs=.25,cs=.6,us={"-Y":{label:"-Y   COLMAP / 3DGS trainers",axis:[1,0,0],angle:Math.PI,up:[0,-1,0]},"+Y":{label:"+Y   glTF, most viewers",axis:[1,0,0],angle:0,up:[0,1,0]},"+Z":{label:"+Z   Blender, CAD",axis:[1,0,0],angle:-Math.PI/2,up:[0,0,1]},"-Z":{label:"-Z",axis:[1,0,0],angle:Math.PI/2,up:[0,0,-1]},"+X":{label:"+X",axis:[0,0,1],angle:Math.PI/2,up:[1,0,0]},"-X":{label:"-X",axis:[0,0,1],angle:-Math.PI/2,up:[-1,0,0]}};function ue(n){let t=us[n],e=d.Quaternion.RotationAxis(new d.Vector3(t.axis[0],t.axis[1],t.axis[2]),t.angle),s=d.Matrix.Identity();e.toRotationMatrix(s);let i=[[1,0,0],[0,1,0],[0,0,1]].map(function(h){let l=d.Vector3.TransformCoordinates(new d.Vector3(h[0],h[1],h[2]),s);return[Math.round(l.x),Math.round(l.y),Math.round(l.z)]}),r=h=>[0,1,2].map(l=>i[0][l]*h[0]+i[1][l]*h[1]+i[2][l]*h[2]),o=h=>[0,1,2].map(l=>i[l][0]*h[0]+i[l][1]*h[1]+i[l][2]*h[2]),a=r(t.up);return(a[0]!==0||a[1]!==1||a[2]!==0)&&console.warn("up-axis "+n+" does not map to +Y:",a),{q:e,toDisplay:r,toFile:o}}function fs(n){let t=n.length/4,e=Math.max(1,Math.floor(t/2e5)),s=[];for(let h=0;h<t;h+=e)n[4*h+3]>=.3&&s.push(h);let i=[];for(let h=0;h<t;h+=e)i.push(h);s.length<2e3&&(s=i);let r=(h,l)=>{let c=Float32Array.from(h,f=>n[4*f+l]).sort();return f=>c[Math.min(c.length-1,Math.max(0,Math.round(f*(c.length-1))))]},o={min:[0,0,0],max:[0,0,0]},a={min:[0,0,0],max:[0,0,0]};for(let h=0;h<3;h++){let l=r(i,h),c=r(s,h);o.min[h]=l(.02),o.max[h]=l(.98),a.min[h]=c(.1),a.max[h]=c(.9)}return{robust:o,core:a}}var ut=class{constructor(t){this.canvas=t,this.engine=null,this.scene=null,this.mesh=null,this.dbg=null,this.player=null,this.cropLines=null,this.mode="orbit",this._pan=null,this._walk=null,this.counter=null,this.windowCam=-1,this.windowScreen=null,this.windowOffAxis=0,this.magic=null,this.windowDepth=1,this.vrActive=!1,this.xrCompatible=!1,this.onWindow=null,this.upKey="-Y",this.tf=ue("-Y"),this.displayBounds=null,this.center=new d.Vector3(0,0,0),this.sceneRadius=1,this.flySpeed=1,this.keys=new Set,this.keysWhen=null,this.api="",this.gpuName="",this.rig=null,this.rigKeys=[],this.frusta=null,this.frustumActive=null,this.frustumSize=1,this.showFrusta=!0,this.activeCam=-1,this.transition=null,this.fovBase=.8,this.lens={...P},this.lensSharpness=1.5,this.lensOwn={...P},this.lensOwnSharpness=1.5,this.lensTour=null,this.depthView=!1,this.lensTiers=new ct(()=>({lens:this.lensTour||this.lensOwn,sharpness:this.lensOwnSharpness}),()=>this._applyLens(),e=>{this.lensSaid=e}),this._projPasses=[],this._projFrame=null,this._lastPose=null,this._saved=null,this.onModeChange=null,this.frameAspect=0,this.onFov=null,this.gpuSort=null,this.floatBlend=!0,this.floatBlendActive=!1,this._floatPasses=[]}async init(t,e){let s=null,i=typeof XRGPUBinding=="function"&&!!navigator.xr;if(t!=="webgl"&&navigator.gpu&&d.WebGPUEngine)try{if(await d.WebGPUEngine.IsSupportedAsync)for(let l of i?[!0,!1]:[!1])try{let c=new d.WebGPUEngine(this.canvas,{antialias:!1,stencil:!1,adaptToDeviceRatio:!1,powerPreference:"high-performance",xrCompatible:l});await c.initAsync(),s=c,this.xrCompatible=l;break}catch(c){if(!l)throw c;console.warn("no XR-compatible WebGPU adapter, using an ordinary one:",c)}}catch(l){console.warn("WebGPU could not start, falling back to WebGL2:",l)}s||(s=new d.Engine(this.canvas,!1,{stencil:!1,preserveDrawingBuffer:!1,alpha:!1,powerPreference:"high-performance",xrCompatible:!!navigator.xr},!1),this.xrCompatible=!!navigator.xr),this.engine=s,this.api=s.isWebGPU?"WebGPU":"WebGL"+(s.webGLVersion||2),this.gpuName=this._gpuName(),this.setRenderScale(1);let r=new d.Scene(s);if(r.useRightHandedSystem=!0,r.skipPointerMovePicking=!0,r.clearColor=d.Color4.FromHexString("#14171cff"),this.scene=r,s.isWebGPU&&!(e&&e.sort==="worker"))try{this.gpuSort=new it(s,r)}catch(l){console.warn("no GPU depth sort, Babylon's sort worker is used:",l),this.gpuSort=null}let o=new d.ArcRotateCamera("orbit",Math.PI/2,1.25,4,d.Vector3.Zero(),r);o.fov=.8,o.inertia=.86,o.panningInertia=.82,o.pinchDeltaPercentage=.004,o.useNaturalPinchZoom=!0,o.lowerBetaLimit=.01,o.upperBetaLimit=Math.PI-.01,o.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"),o.inputs.removeByType("ArcRotateCameraMouseWheelInput"),o.inputs.attached.pointers&&(o.inputs.attached.pointers.buttons=[0]),o.attachControl(!0),this.orbit=o;let a=new d.UniversalCamera("fly",new d.Vector3(0,0,3),r);a.fov=.8,a.inertia=.7,a.angularSensibility=1800,a.inputs.removeByType("FreeCameraKeyboardMoveInput"),a.inputs.removeByType("FreeCameraGamepadInput"),a.inputs.attached.mouse&&(a.inputs.attached.mouse.buttons=[0]),this.fly=a;let h=new d.UniversalCamera("tour",new d.Vector3(0,0,3),r);h.inputs.clear(),this.tourCam=h,r.activeCamera=o,this.setFloatBlend(new URLSearchParams(location.search).get("blend")!=="8bit"),window.addEventListener("keydown",l=>this._key(l,!0)),window.addEventListener("keyup",l=>this._key(l,!1)),window.addEventListener("blur",()=>this.keys.clear()),this.canvas.addEventListener("wheel",l=>{if(this.mode==="orbit"){l.preventDefault(),this._orbitWheel(l);return}if(this.mode!=="fly"&&this.mode!=="window")return;if(l.preventDefault(),l.shiftKey){this.flySpeed=Math.min(50,Math.max(.02,this.flySpeed*(l.deltaY<0?1.15:1/1.15))),this.onFlySpeed&&this.onFlySpeed(this.flySpeed);return}let c=(l.deltaY<0?1:-1)*this.flySpeed*this._navScale()*.03;if(this.mode==="window"&&this.windowScreen){let f=this.windowScreen,u=[(f.pb[0]+f.pc[0])/2,(f.pb[1]+f.pc[1])/2,(f.pb[2]+f.pc[2])/2],p=this.fly.position;c=(l.deltaY<0?1:-1)*.15*Math.hypot(u[0]-p.x,u[1]-p.y,u[2]-p.z)}this.fly.position.addInPlace(this.fly.getForwardRay(1).direction.scale(c))},{passive:!1}),this.canvas.addEventListener("contextmenu",l=>{this.mode==="fly"&&l.preventDefault()}),this.canvas.addEventListener("pointermove",l=>{if(this.mode!=="fly"&&this.mode!=="window"||!(l.buttons&2))return;l.preventDefault();let c=this.flySpeed*this._navScale()*.001,f=d.Vector3.Cross(this.fly.getForwardRay(1).direction,d.Vector3.Up()).normalize();this.fly.position.addInPlace(f.scale(l.movementX*c)),this.fly.position.y-=l.movementY*c},{passive:!1}),this.canvas.addEventListener("pointerdown",l=>{if(!(l.button!==1&&l.button!==2)&&(this._pan={x:l.clientX,y:l.clientY,focus:null},this.mode==="orbit")){l.button===1&&l.preventDefault();try{this.canvas.setPointerCapture(l.pointerId)}catch{}}}),this.canvas.addEventListener("pointermove",l=>{this._pan&&l.buttons&6&&this.mode==="orbit"&&this._orbitPan(l)});for(let l of["pointerup","pointercancel"])this.canvas.addEventListener(l,c=>{c.buttons&6||(this._pan=null)});return this.canvas.addEventListener("pointermove",l=>{this.mode==="tour"&&l.buttons&&this._interrupt()}),r.onBeforeRenderObservable.add(()=>{this._flyStep(),this._orbitStep(),this._windowStep(),this._tourStep(Math.min(.1,s.getDeltaTime()/1e3)),this._layerStep()}),r.onBeforeRenderObservable.add(()=>this._projectionBefore()),r.onAfterRenderObservable.add(()=>this._projectionAfter()),new ResizeObserver(()=>s.resize()).observe(this.canvas),this.frameDivider=1,this.frameGap=0,this._drawnAt=0,s.runRenderLoop(()=>{if(this.frameGap>0){let l=performance.now();if(l-this._drawnAt<this.frameGap)return;this._drawnAt=l}r.render()}),this.api}_gpuName(){try{let t=this.engine;if(t.isWebGPU){let s=t._adapterInfo||{};return[s.vendor,s.architecture,s.device,s.description].filter(Boolean).join(" ")}let e=t.getGlInfo();return String(e.renderer||"").replace(/^ANGLE \(/,"").replace(/\)$/,"")}catch{return""}}setRenderScale(t){this.renderScale=t,this.engine.setHardwareScalingLevel(1/((window.devicePixelRatio||1)*t)),this.engine.resize()}setBackground(t){this.scene.clearColor=d.Color4.FromHexString(t.length===7?t+"ff":t)}setFloatBlend(t){return this.floatBlend=!!t,this._buildPasses()}_buildPasses(){for(let[i,r]of this._floatPasses.concat(this._projPasses))try{r.dispose(i)}catch{}if(this._floatPasses=[],this._projPasses=[],this.floatBlendActive=!1,!this.engine)return!1;let t=this.floatBlend&&!!d.PassPostProcess&&(this.engine.isWebGPU||this.engine.getCaps().textureHalfFloatRender);this.floatBlend&&!t&&console.warn("this engine cannot render to half floats: the splats are blended in the 8-bit canvas (docs/OPACITY.md 'Blending')");let e=t?d.Constants.TEXTURETYPE_HALF_FLOAT:d.Constants.TEXTURETYPE_UNSIGNED_BYTE,s=[this.orbit,this.fly,this.tourCam].filter(Boolean);if(X(this.lens)){this._registerProjection();let i=this.engine.isWebGPU?d.ShaderLanguage.WGSL:d.ShaderLanguage.GLSL;for(let r of s){let o=new d.PostProcess("lens","gsvProjection",{uniforms:["kind","halfFov","tanRender","aspect","d","k1","k2","vignette","ca","warmth","contrast","lift","letterbox","background","dof","bokeh","catEye","curvature","focusX","focusY","focusPoint","focusTX","focusTY","near","far","halfZ"],samplers:["textureSampler","depthSampler"],size:this._lensSize(),camera:r,samplingMode:d.Texture.BILINEAR_SAMPLINGMODE,engine:this.engine,textureType:e,shaderLanguage:i});o.onApply=a=>{let h=this._projFrame&&this._projFrame.cam===r?this._projFrame:null,l=h?this.lens:P,c=h?h.half:r.fov/2;a.setInt("kind",N[l.kind]),a.setFloat("halfFov",c),a.setFloat("tanRender",h?h.tanRender:Math.tan(c)),a.setFloat("aspect",this.engine.getRenderWidth()/Math.max(1,this.engine.getRenderHeight()));for(let p of["d","k1","k2","vignette","ca","warmth","contrast","lift","letterbox","catEye","curvature","focusX","focusY","focusPoint","focusTX","focusTY"])a.setFloat(p,l[p]);let f=l.dof>0&&this._lensDepthRtt?this._lensDepthRtt:null;a.setFloat("dof",f?l.dof:0),a.setInt("bokeh",Math.max(0,at.indexOf(l.bokeh))),a.setFloat("near",r.minZ),a.setFloat("far",r.maxZ),a.setFloat("halfZ",this.engine.isNDCHalfZRange?1:0),a.setTexture("depthSampler",f||this._lensDummy());let u=this.scene.clearColor;a.setFloat4("background",u.r,u.g,u.b,1)},this._projPasses.push([r,o]),lt(this.lens)&&this._bloomChain(r,e,i)}return this.floatBlendActive=t,this.floatBlendActive}if(!t)return!1;for(let i of s)this._floatPasses.push([i,new d.PassPostProcess("floatBlend",1,i,d.Texture.NEAREST_SAMPLINGMODE,this.engine,!1,e)]);return this.floatBlendActive=this._floatPasses.length>0,this.floatBlendActive}_lensDummy(){return this._dummyDepth||(this._dummyDepth=d.RawTexture.CreateRGBATexture(new Uint8Array(4),1,1,this.scene,!1,!1)),this._dummyDepth}_lensDepth(){let t=this.lens.dof>0&&!!this.mesh&&!!this.engine,e=this._lensDepthRtt,s=this.engine?Math.max(64,Math.round(this.engine.getRenderWidth()/2)):0,i=this.engine?Math.max(64,Math.round(this.engine.getRenderHeight()/2)):0;if(e&&(!t||e._gsvMesh!==this.mesh||e.getSize().width!==s||e.getSize().height!==i)){let o=this.scene.customRenderTargets.indexOf(e);o>=0&&this.scene.customRenderTargets.splice(o,1);try{e.dispose()}catch{}try{this._lensDepthMat.dispose()}catch{}this._lensDepthRtt=this._lensDepthMat=null}if(!t||this._lensDepthRtt)return;let r=new d.RenderTargetTexture("gsvLensDepth",{width:s,height:i},this.scene,!1,!0,d.Constants.TEXTURETYPE_HALF_FLOAT,!1,d.Constants.TEXTURE_BILINEAR_SAMPLINGMODE,!0,!1);r.clearColor=new d.Color4(0,0,0,0),r.renderList=[this.mesh],this._lensDepthMat=ne(this),r.setMaterialForRendering(this.mesh,this._lensDepthMat),r._gsvMesh=this.mesh,this.scene.customRenderTargets.push(r),this._lensDepthRtt=r}_lensSize(){let t=this.lens;return t.kind==="rectilinear"&&!t.k1&&!t.k2&&!t.ca?1:this.lensSharpness}_registerProjection(){let t=d.ShaderStore&&d.ShaderStore.ShadersStore||d.Effect.ShadersStore,e=d.ShaderStore?d.ShaderStore.ShadersStoreWGSL:null;t.gsvProjectionPixelShader||(t.gsvProjectionPixelShader=te,t.gsvBloomExtractPixelShader=$t,t.gsvFlareFeaturesPixelShader=qt,t.gsvBloomAddPixelShader=jt),e&&!e.gsvProjectionPixelShader&&(e.gsvProjectionPixelShader=ee,e.gsvBloomExtractPixelShader=Kt,e.gsvFlareFeaturesPixelShader=Ht,e.gsvBloomAddPixelShader=Xt)}_bloomChain(t,e,s){let i=u=>({size:u,camera:t,samplingMode:d.Texture.BILINEAR_SAMPLINGMODE,engine:this.engine,textureType:e,shaderLanguage:s}),r=new d.PassPostProcess("lensKeep",1,t,d.Texture.BILINEAR_SAMPLINGMODE,this.engine,!1,e),o=new d.PostProcess("bloomExtract","gsvBloomExtract",{uniforms:["threshold"],samplers:["textureSampler"],...i(.25)});o.onApply=u=>u.setFloat("threshold",this.lens.bloomThreshold);let a=new d.PostProcess("flareFeatures","gsvFlareFeatures",{uniforms:["bloom","halation","flare","streak","aspect"],samplers:["textureSampler"],...i(.25)});a.onApply=u=>{for(let p of["bloom","halation","flare","streak"])u.setFloat(p,this.lens[p]);u.setFloat("aspect",this.engine.getRenderWidth()/Math.max(1,this.engine.getRenderHeight()))};let h=Math.max(8,Math.round(this.engine.getRenderHeight()*.25*.06)),l=new d.BlurPostProcess("bloomX",new d.Vector2(1,0),h,.25,t,d.Texture.BILINEAR_SAMPLINGMODE,this.engine,!1,e),c=new d.BlurPostProcess("bloomY",new d.Vector2(0,1),h,.25,t,d.Texture.BILINEAR_SAMPLINGMODE,this.engine,!1,e),f=new d.PostProcess("bloomAdd","gsvBloomAdd",{uniforms:["on"],samplers:["textureSampler","sceneSampler"],...i(1)});f.onApply=u=>{u.setTextureFromPostProcess("sceneSampler",r),u.setFloat("on",this._projFrame&&this._projFrame.cam===t?1:0)};for(let u of[r,o,a,l,c,f])this._projPasses.push([t,u])}setLens(t={},e=this.lensOwnSharpness){let s={...this.lensOwn,...t};if(!(s.kind in N))throw new Error(`projection ${s.kind}: one of ${Object.keys(N).join(", ")}`);s.d=Math.min(1,Math.max(0,s.d)),this.lensOwn=s,this.lensOwnSharpness=Math.min(2,Math.max(1,e)),this.lensTiers.forgetUnused(),this._applyLens()}setTourLens(t){if(t){let e={...P,...t};if(!(e.kind in N))throw new Error(`projection ${e.kind}: one of ${Object.keys(N).join(", ")}`);e.d=Math.min(1,Math.max(0,e.d)),this.lensTour=e}else this.lensTour=null;this.lensTiers.forgetUnused(),this._applyLens()}_applyLens(){let t=this.lensTiers,e=this.lensTour||this.lensOwn,s=this.depthView?{...P}:le(e,t.off,P,t.room),i=this.depthView||!t.room||t.off.has("sharpness")?1:this.lensOwnSharpness,r={pass:X(this.lens),size:this._lensSize(),bloom:lt(this.lens)};this.lens=s,this.lensSharpness=i,(X(s)!==r.pass||this._lensSize()!==r.size||lt(s)!==r.bloom)&&this._buildPasses(),this._lensDepth()}setDepthView(t){this.depthView=!!t,this.mesh&&!this.theatre&&!this.vrActive&&(this.mesh.layerMask=this.depthView?ce:268435455),this._applyLens()}_projectionBefore(){this._projFrame=null,this.lens.dof>0&&this._lensDepth();let t=this.scene.activeCamera;if(!X(this.lens)||this.vrActive||this.mode==="window"||!t||!this._projPasses.some(([r])=>r===t))return;let e=this.engine.getRenderWidth()/Math.max(1,this.engine.getRenderHeight()),s=t.fov/2,i=Jt(this.lens,s,e,this.lensSharpness);this._projFrame={cam:t,fov:t.fov,half:s,tanRender:Math.tan(i.half)},t.fov=2*i.half}_projectionAfter(){let t=this._projFrame;t&&t.cam.fov!==t.fov&&(t.cam.fov=t.fov)}setFov(t){this.fovBase=t*Math.PI/180,this.orbit.fov=this.fly.fov=this.fovBase}async show(t){let e=new d.GaussianSplattingMesh("splats",null,this.scene,!1);e.alwaysSelectAsActiveMesh=!0,this.gpuSort&&this.gpuSort.attach(e);let s=null;try{if(t.video){let{GsvPlayer:r}=await import("./gsv-player-IXXO2UGB.js");s=new r(this.engine,this.scene,t.video);let o=await s.open(e);Object.assign(t,fs(o))}else await e.updateDataAsync(t.splat.buffer,t.splat.sh,void 0,t.splat.shDegree),he&&t.kind==="3dgs"&&t.raw&&this._floatColours(e,t),he&&t.kind==="3dgs"&&t.raw&&this._floatCovariances(e,t)}catch(r){throw s&&s.dispose(),e.dispose(),r}let i=this.mesh;if(this.player){try{this.player.dispose()}catch(r){console.error("closing the previous video:",r)}this.player=null}return i&&(this.dbg&&this.dbg.removeMesh(i),i.dispose()),this.clearLayer(),this.mesh=e,this.player=s,this.dbg||(this.dbg=new d.GaussianSplattingDebugger),await this._attachFilters(e),this.robust=t.robust,this.core=t.core,this.setUp(this.upKey,!1),e}_floatColours(t,e){try{let s=t._colorsTexture;if(!s||!s.getSize)throw new Error("the splat mesh has no colour texture to replace");let i=s.getSize(),r=window.PLYTools.floatColours(e.raw.bytes,e.raw.header,i.width,i.height);t._colorsTexture=new d.RawTexture(r,i.width,i.height,d.Constants.TEXTUREFORMAT_RGBA,this.scene,!1,!1,d.Constants.TEXTURE_NEAREST_SAMPLINGMODE,d.Constants.TEXTURETYPE_HALF_FLOAT),s.dispose(),e.floatColours=!0}catch(s){e.floatColours=!1,console.warn("colours and opacities stay 8-bit (half-float colours failed):",s)}}_floatCovariances(t,e){if(new URLSearchParams(location.search).get("cov")!=="half")try{let s=t._covariancesATexture,i=t._covariancesBTexture;if(!s||!i||!t._splatPositions)throw new Error("the splat mesh has no covariance textures to replace");let r=s.getSize(),o=!!t._useRGBACovariants,a=window.PLYTools.covarianceData(e.raw.bytes,e.raw.header,r.width,r.height,t._splatPositions,o?4:2),h=(l,c)=>new d.RawTexture(l,r.width,r.height,c,this.scene,!1,!1,d.Constants.TEXTURE_NEAREST_SAMPLINGMODE,d.Constants.TEXTURETYPE_FLOAT);t._covariancesATexture=h(a.a,d.Constants.TEXTUREFORMAT_RGBA),t._covariancesBTexture=h(a.b,o?d.Constants.TEXTUREFORMAT_RGBA:d.Constants.TEXTUREFORMAT_RG),s.dispose(),i.dispose(),e.floatCovariances=!0}catch(s){e.floatCovariances=!1,console.warn("covariances stay half floats (float32 covariances failed):",s)}}async _attachFilters(t){for(let e=0;;e++)try{this.dbg.addMesh(t);return}catch(s){if(e>=4)throw s;await this.frames(1)}}clear(){this.clearLayer(),this.player&&(this.player.dispose(),this.player=null),this.mesh&&(this.dbg&&this.dbg.removeMesh(this.mesh),this.mesh.dispose(),this.mesh=null),this.setCropBox(null)}async showLayer(t,e){this.clearLayer();let s=new d.GaussianSplattingMesh("heroLayer",null,this.scene,!1);try{await s.updateDataAsync(t.splat.buffer,t.splat.sh,void 0,t.splat.shDegree)}catch(i){throw s.dispose(),i}return s.renderingGroupId=1,s.rotationQuaternion=this.tf.q.clone(),this.layer={mesh:s,meta:e,on:!0,alpha:0,distance:null,count:t.count},this.theatre&&(s.layerMask=536870912,this.theatre.rtt.renderList=[this.mesh,s].filter(Boolean)),this._layerStep(),s}clearLayer(){if(this.layer){this.theatre&&(this.theatre.rtt.renderList=this.mesh?[this.mesh]:[]);try{this.layer.mesh.dispose()}catch{}this.layer=null}}setLayerOn(t){this.layer&&(this.layer.on=t,this._layerStep())}layerInfo(){let t=this.layer;return t?{camera:t.meta.camera,found:this._heroIndex()>=0,on:t.on,alpha:t.alpha,distance:t.distance,count:t.count}:null}_heroIndex(){let t=this.layer,e=this.rig&&this.rig.cameras;if(!t||!e)return-1;let s=String(t.meta.camera||"").toLowerCase(),i=s.replace(/\.[a-z0-9]+$/,"");return e.findIndex(r=>{let o=String(r.name).toLowerCase();return o===s||o.replace(/\.[a-z0-9]+$/,"")===i})}_layerStep(){let t=this.layer;if(!t)return;let e=this._heroIndex(),s=t.on?1:0,i=null;if(t.on&&e>=0&&this.rigKeys[e]){let o=this.rigKeys[e].p,a=1/0;this.rigKeys.forEach((g,v)=>{v!==e&&(a=Math.min(a,Math.hypot(g.p[0]-o[0],g.p[1]-o[1],g.p[2]-o[2])))});let h=this.theatre?this.theatre.cam:this.scene.activeCamera,l=h.globalPosition||h.position;i=Math.hypot(l.x-o[0],l.y-o[1],l.z-o[2])/(isFinite(a)&&a>0?a:this.sceneRadius);let c=t.meta.fade||{},f=+c.full_until||.25,u=Math.max(f+1e-6,+c.gone_at||.6),p=Math.min(1,Math.max(0,(i-f)/(u-f)));s=1-p*p*(3-2*p)}t.alpha=s,t.distance=i,t.mesh.material&&t.mesh.material.alpha!==s*s&&(t.mesh.material.alpha=s*s);let r=s>.004;t.mesh.isEnabled()!==r&&t.mesh.setEnabled(r)}frames(t){return new Promise(e=>{let s=t,i=this.scene.onAfterRenderObservable.add(()=>{--s<=0&&(this.scene.onAfterRenderObservable.remove(i),e())})})}sizeRange(){return this.mesh?this.mesh.splatSizeRange:null}setUp(t,e){if(this.upKey=t,this.tf=ue(t),this.mesh){this.mesh.rotationQuaternion=this.tf.q.clone(),this.layer&&(this.layer.mesh.rotationQuaternion=this.tf.q.clone());let s=h=>{let l=this.tf.toDisplay(h.min),c=this.tf.toDisplay(h.max);return{min:l.map((f,u)=>Math.min(f,c[u])),max:l.map((f,u)=>Math.max(f,c[u]))}};this.displayBounds=s(this.robust);let i=s(this.core||this.robust),r=i.max.map((h,l)=>h-i.min[l]);this.sceneRadius=Math.max(1e-6,.5*Math.hypot(r[0],r[1],r[2])*1.25);let o=i.min.map((h,l)=>(h+i.max[l])/2);this.center=new d.Vector3(o[0],o[1],o[2]);let a=this.sceneRadius;for(let h of[this.orbit,this.fly,this.tourCam])h.minZ=a*5e-4,h.maxZ=a*60;this.orbit.lowerRadiusLimit=a*5e-4,this.orbit.upperRadiusLimit=a*40,this.orbit.panningSensibility=1400/a*.35}this.rig&&this._buildRig(),e!==!1&&this.frame()}frame(){if(!this.mesh)return;this.mode==="tour"&&this.setMode("orbit");let e=this.sceneRadius/Math.sin(this.orbit.fov/2)*.95;this.orbit.setTarget(this.center.clone()),this.orbit.alpha=this.upKey==="-Y"?Math.PI/2:-Math.PI/2,this.orbit.beta=1.3,this.orbit.radius=e,this.fly.position=this.orbit.position.clone(),this.fly.setTarget(this.center.clone()),this.flySpeed=1,this.onFlySpeed&&this.onFlySpeed(1)}setMode(t){if(t==="tour"||t===this.mode)return;let e=this._currentPose(),s=this.mode==="tour";this.scene.activeCamera.detachControl(),this.transition=null;let i=new d.Vector3(e.p[0],e.p[1],e.p[2]),r=new d.Vector3(e.p[0]+e.f[0],e.p[1]+e.f[1],e.p[2]+e.f[2]);if(s&&this.onFov&&Math.abs(e.fov-this.fovBase)>1e-6&&this.onFov(e.fov*180/Math.PI),t==="fly")this.fly.position=i,this.fly.setTarget(r),s&&(this.fly.fov=e.fov),this.scene.activeCamera=this.fly;else{let o=Math.min(3*this.sceneRadius,Math.max(.05*this.sceneRadius,d.Vector3.Distance(i,this.center)));this.orbit.setPosition(i),this.orbit.setTarget(i.add(r.subtract(i).scale(o))),s&&(this.orbit.fov=e.fov),this.scene.activeCamera=this.orbit}this.scene.activeCamera.attachControl(!0),this.mode=t,this._saved=null,this.onModeChange&&this.onModeChange(t)}_key(t,e){let s=t.target;if(e&&s&&/^(INPUT|SELECT|TEXTAREA)$/.test(s.tagName)&&s.type!=="range"&&s.type!=="checkbox"||e&&this.keysWhen&&!this.keysWhen())return;if(t.ctrlKey||t.metaKey||t.altKey){e||this.keys.clear();return}let i=t.key.length===1?t.key.toLowerCase():t.key;e?this.keys.add(i):this.keys.delete(i),t.key==="Shift"&&(e?this.keys.add("shift"):this.keys.delete("shift")),e&&this.mode==="tour"&&/^(w|a|s|d|q|e|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/.test(i)&&this._interrupt()}_rigScale(t){let e=this.rigKeys[t].p,s=this.rigKeys.map(i=>Math.hypot(i.p[0]-e[0],i.p[1]-e[1],i.p[2]-e[2])).filter(i=>i>1e-6).sort((i,r)=>i-r);return s.length?s[Math.floor(s.length/2)]:Math.max(.001,.05*this.sceneRadius)}_navScale(){return this.mode==="window"&&this.windowDist?this.windowDist:this.sceneRadius}focusDistance(){let t=this.scene&&this.scene.activeCamera,e=this.mesh&&this.mesh._splatPositions;if(!t||!e)return null;let s=p=>this.tf.toFile([p.x,p.y,p.z]),i=t.getForwardRay(1).direction,r=d.Vector3.Cross(i,t.upVector).normalize(),o=d.Vector3.Cross(r,i),a=s(t.globalPosition),h=s(i),l=s(r),c=s(o),f=e.length>>2,u=Math.max(1,Math.floor(f/12e4));for(let p of[.2,.6]){let g=p*Math.tan(t.fov/2),v=[];for(let y=0;y<f;y+=u){let w=e[4*y]-a[0],k=e[4*y+1]-a[1],M=e[4*y+2]-a[2],T=w*h[0]+k*h[1]+M*h[2];T>t.minZ&&(Math.abs(w*l[0]+k*l[1]+M*l[2])>g*T||Math.abs(w*c[0]+k*c[1]+M*c[2])>g*T||v.push(T))}if(v.length>=40)return Float32Array.from(v).sort()[v.length>>2]}return null}_orbitPan(t){let e=this.orbit,s=this._pan;s.focus===null&&(s.focus=this.focusDistance()||e.radius);let i=2*s.focus*Math.tan(e.fov/2)/(this.canvas.clientHeight||1),r=e.getForwardRay(1).direction,o=d.Vector3.Cross(r,e.upVector).normalize(),a=d.Vector3.Cross(o,r);e.target.addInPlace(o.scale(-(t.clientX-s.x)*i)).addInPlace(a.scale((t.clientY-s.y)*i)),s.x=t.clientX,s.y=t.clientY}_orbitWheel(t){let e=this.orbit,s=Math.max(-3,Math.min(3,-(t.deltaMode===1?t.deltaY*100/3:t.deltaY)/100)),i=this.focusDistance()||e.radius,r=i*(1-Math.exp(-ls*s));if(r<=0){e.radius=Math.min(e.upperRadiusLimit||1/0,e.radius-r);return}let o=Math.min(r,Math.max(0,e.radius-Math.max(e.lowerRadiusLimit||0,hs*i)));e.radius-=o,r>o&&e.target.addInPlace(e.getForwardRay(1).direction.scale(r-o))}_orbitStep(){if(this.mode!=="orbit"||this.keys.size===0){this._walk=null;return}let t=(...h)=>h.some(l=>this.keys.has(l)),e=this.orbit,s=e.getForwardRay(1).direction,i=d.Vector3.Cross(s,e.upVector).normalize(),r=d.Vector3.Zero();if(t("w","ArrowUp")&&r.addInPlace(s),t("s","ArrowDown")&&r.subtractInPlace(s),t("d","ArrowRight")&&r.addInPlace(i),t("a","ArrowLeft")&&r.subtractInPlace(i),t("e")&&r.addInPlace(e.upVector),t("q","c")&&r.subtractInPlace(e.upVector),r.lengthSquared()===0){this._walk=null;return}this._walk||(this._walk={focus:this.focusDistance()||e.radius});let o=Math.min(.1,this.engine.getDeltaTime()/1e3),a=this.keys.has("shift")?4:1;e.target.addInPlace(r.normalize().scale(o*a*cs*this._walk.focus))}_buildTheatre(t){this._dropTheatre();let e=Math.hypot(t.pb[0]-t.pa[0],t.pb[1]-t.pa[1],t.pb[2]-t.pa[2]),s=Math.hypot(t.pc[0]-t.pa[0],t.pc[1]-t.pa[1],t.pc[2]-t.pa[2]),i=2048,r=new d.RenderTargetTexture("window",{width:i,height:Math.max(8,Math.round(i*s/e))},this.scene,!1,!0,this.floatBlendActive?d.Constants.TEXTURETYPE_HALF_FLOAT:d.Constants.TEXTURETYPE_UNSIGNED_BYTE),o=new d.UniversalCamera("windowEye",new d.Vector3(0,0,0),this.scene);o.inputs.clear(),o.layerMask=536870912,r.activeCamera=o,r.renderList=[this.mesh,this.layer&&this.layer.mesh].filter(Boolean),r.clearColor=this.scene.clearColor.clone(),this.scene.customRenderTargets.push(r);let a=d.MeshBuilder.CreatePlane("windowScreen",{width:e,height:s,sideOrientation:d.Mesh.DOUBLESIDE},this.scene),h=new d.StandardMaterial("windowScreenMat",this.scene);h.emissiveTexture=r,h.disableLighting=!0,h.diffuseColor=new d.Color3(0,0,0),a.material=h;let l=[(t.pa[0]+t.pb[0]+t.pc[0]+(t.pb[0]+t.pc[0]-t.pa[0]))/4,(t.pa[1]+t.pb[1]+t.pc[1]+(t.pb[1]+t.pc[1]-t.pa[1]))/4,(t.pa[2]+t.pb[2]+t.pc[2]+(t.pb[2]+t.pc[2]-t.pa[2]))/4];a.position.set(l[0],l[1],l[2]);let c=new d.Vector3(t.pb[0]-t.pa[0],t.pb[1]-t.pa[1],t.pb[2]-t.pa[2]).normalize(),f=new d.Vector3(t.pc[0]-t.pa[0],t.pc[1]-t.pa[1],t.pc[2]-t.pa[2]).normalize(),u=d.Vector3.Cross(c,f).normalize();a.rotationQuaternion=d.Quaternion.FromRotationMatrix(d.Matrix.FromValues(c.x,c.y,c.z,0,f.x,f.y,f.z,0,u.x,u.y,u.z,0,0,0,0,1)),this.mesh&&(this.mesh.layerMask=536870912),this.layer&&(this.layer.mesh.layerMask=536870912),this.theatre={rtt:r,cam:o,quad:a,mat:h}}_dropTheatre(){let t=this.theatre;if(!t)return;let e=this.scene.customRenderTargets.indexOf(t.rtt);e>=0&&this.scene.customRenderTargets.splice(e,1);try{t.rtt.dispose(),t.quad.dispose(),t.mat.dispose(),t.cam.dispose()}catch{}this.mesh&&(this.mesh.layerMask=this.depthView?ce:268435455),this.layer&&(this.layer.mesh.layerMask=268435455),this.theatre=null}windowOf(t,e){let s=Math.max(0,Math.min(this.rigKeys.length-1,t|0)),i=this._keyPose(s),r=this.rig&&this.rig.cameras[s],o=r&&r.width&&r.height?r.width/r.height:16/9,a=e==="photo"?o:e||this.engine.getAspectRatio(this.scene.activeCamera)||16/9,h=this._rigScale(s)*(this.windowDepth||1);return{idx:s,pose:i,dist:h,aspect:a,screen:Dt({p:i.p,f:i.f,u:i.u,fov:i.fov,aspect:a},h)}}enterWindow(t){if(!this.rigKeys.length)return;let e=this.windowOf(t,this.vrActive?"photo":void 0),s=e.idx,i=e.pose;if(this.windowCam=s,this.windowScreen=e.screen,this.windowDist=e.dist,this.windowPose=i,this.vrActive){this._markActive(s),this.onWindow&&this.onWindow({camera:s,offAxis:0,distance:e.dist});return}this.mode==="tour"&&(this._saved=null),this.setMode("fly"),this.fly.position.set(i.p[0],i.p[1],i.p[2]),this.magic?this._dropTheatre():this._buildTheatre(this.windowScreen),this.mode="window",this._markActive(s),this.onModeChange&&this.onModeChange("window")}leaveWindow(){this.mode==="window"&&(this._dropTheatre(),this.fly.unfreezeProjectionMatrix(),this.fly.fov=this.fovBase,this.fly.upVector.set(0,1,0),this._magicOutlines(!1),this.mode="fly",this.windowScreen=null,this.onModeChange&&this.onModeChange("fly"))}_headMove(t,e,s){if(!this.windowScreen)return;let i=this.windowScreen,o=.25*Math.hypot(i.pb[0]-i.pa[0],i.pb[1]-i.pa[1],i.pb[2]-i.pa[2])/Math.max(1,this.canvas.clientWidth),a=this.fly.position,h;try{h=I(i,[a.x,a.y,a.z],.01,100)}catch{return}let l=new d.Vector3(h.vr[0]*t*o+h.vu[0]*e*o+h.vn[0]*s*o,h.vr[1]*t*o+h.vu[1]*e*o+h.vn[1]*s*o,h.vr[2]*t*o+h.vu[2]*e*o+h.vn[2]*s*o),c=a.add(l),f;try{let u=I(i,[c.x,c.y,c.z],.01,100);f=u.d>.15*this.windowDist&&u.d<3*this.windowDist&&st(this.windowPose,i,[c.x,c.y,c.z])<1.2}catch{f=!1}f&&a.copyFrom(c)}setMagic(t){let e=!!this.magic;this.magic=t||null,!(this.mode!=="window"||this.vrActive||e===!!this.magic)&&(this.fly.unfreezeProjectionMatrix(),this.fly.upVector.set(0,1,0),this._magicOutlines(!1),this.enterWindow(this.windowCam))}_magicOutlines(t){for(let e of[this.frusta,this.frustumActive])e&&(e.layerMask=t?0:268435455)}_magicStep(){let t=this.magic(),e=this.windowPose,s=this.windowDist,i=Math.max(.01,.002*this.sceneRadius),r=50*this.sceneRadius,o=1.5,a=this.windowScreen,h=e.p.slice(),l=0;if(t&&t.glass&&t.rest&&t.rest[2]>0){let u=Bt(e,s,t.glass,t.rest),p=t.rest,g=p[2],v=t.head||p;a=u.screen;let y=w=>u.map.apply([p[0]+(v[0]-p[0])*w,p[1]+(v[1]-p[1])*w,Math.max(.25*g,Math.min(4*g,v[2]))]);h=y(1),l=st(e,a,h),l>o&&(h=y(o/l),l=o)}let c;try{c=I(a,h,i,r)}catch{h=e.p.slice(),c=I(a,h,i,r)}this._magicOutlines(!0);let f=this.fly;f.position.set(h[0],h[1],h[2]),f.upVector.set(c.vu[0],c.vu[1],c.vu[2]),f.setTarget(new d.Vector3(h[0]-c.vn[0],h[1]-c.vn[1],h[2]-c.vn[2])),f.freezeProjectionMatrix(d.Matrix.FromArray(bt(c))),this.windowOffAxis=l,this.onWindow&&this.onWindow({camera:this.windowCam,offAxis:this.windowOffAxis,distance:c.d})}_windowStep(){if(this.mode==="window"&&this.magic&&this.windowScreen&&!this.vrActive)return this._magicStep();if(this.mode!=="window"||!this.windowScreen||!this.theatre||this.vrActive)return;let t=this.scene.activeCamera,e=t.globalPosition||t.position,s=null;try{s=I(this.windowScreen,[e.x,e.y,e.z],Math.max(.01,.002*this.sceneRadius),50*this.sceneRadius)}catch{return}if(s.d<.15*this.windowDist||s.d>4*this.windowDist||this.windowOffAxis>2.5){let r=this.windowPose.p,o=.15;t.position.set(e.x+(r[0]-e.x)*o,e.y+(r[1]-e.y)*o,e.z+(r[2]-e.z)*o)}let i=this.theatre.cam;i.position.set(e.x,e.y,e.z),i.upVector.set(s.vu[0],s.vu[1],s.vu[2]),i.setTarget(new d.Vector3(e.x-s.vn[0],e.y-s.vn[1],e.z-s.vn[2])),i.freezeProjectionMatrix(d.Matrix.FromArray(bt(s))),this.windowOffAxis=st(this.windowPose,this.windowScreen,[e.x,e.y,e.z]),this.onWindow&&this.onWindow({camera:this.windowCam,offAxis:this.windowOffAxis,distance:s.d})}_flyStep(){if(this.mode!=="fly"&&this.mode!=="window"||this.keys.size===0)return;let t=(...a)=>a.some(h=>this.keys.has(h)),e=Math.min(.1,this.engine.getDeltaTime()/1e3),s=this.fly.getForwardRay(1).direction,i=d.Vector3.Cross(s,d.Vector3.Up()).normalize(),r=d.Vector3.Zero();if(t("w","ArrowUp")&&r.addInPlace(s),t("s","ArrowDown")&&r.subtractInPlace(s),t("d","ArrowRight")&&r.addInPlace(i),t("a","ArrowLeft")&&r.subtractInPlace(i),t("e"," ")&&(r.y+=1),t("q","c")&&(r.y-=1),r.lengthSquared()===0)return;let o=this.keys.has("shift")?4:1;this.fly.position.addInPlace(r.normalize().scale(e*o*this.flySpeed*this._navScale()*.25))}setRig(t){this.clearRig(),this.rig=t,this._buildRig()}clearRig(){this.mode==="tour"&&this.setMode("orbit"),this.rig=null,this.rigKeys=[],this.transition=null,this.activeCam=-1,this._saved=null,this._disposeFrusta()}setFrustaVisible(t){this.showFrusta=t,this.frusta&&this.frusta.setEnabled(t),this.frustumActive&&this.frustumActive.setEnabled(t&&this.activeCam>=0)}_buildRig(){let t=window.CameraTools,e=this.tf;this.rigKeys=this.rig.cameras.map(s=>({p:e.toDisplay(s.position),f:e.toDisplay(t.forwardOf(s)),u:e.toDisplay(t.upOf(s)),fov:t.verticalFov(s)})),this._buildFrusta(),this.mode==="tour"&&this.activeCam>=0&&!this.transition&&this._applyPose(this._keyPose(this.activeCam))}_disposeFrusta(){for(let t of[this.frusta,this.frustumActive])t&&t.dispose();this.frusta=this.frustumActive=null}_keyPose(t){let e=this.rigKeys[t];return{p:e.p,f:e.f,u:e.u,fov:e.fov}}_frustumLines(t,e,s,i){let r=w=>new d.Vector3(w[0],w[1],w[2]),o=t.f,a=t.u,h=[o[1]*a[2]-o[2]*a[1],o[2]*a[0]-o[0]*a[2],o[0]*a[1]-o[1]*a[0]];e*=i||1;let l=e*Math.tan(t.fov/2),c=l*s,f=(w,k)=>r([t.p[0]+o[0]*e+h[0]*w*c+a[0]*k*l,t.p[1]+o[1]*e+h[1]*w*c+a[1]*k*l,t.p[2]+o[2]*e+h[2]*w*c+a[2]*k*l]),u=[f(-1,1),f(1,1),f(1,-1),f(-1,-1)],p=r(t.p),g=f(0,1),v=f(0,1.4),y=[g.subtract(r(h).scale(.25*c)),v,g.add(r(h).scale(.25*c))];return[[p,u[0]],[p,u[1]],[p,u[2]],[p,u[3]],[u[0],u[1],u[2],u[3],u[0]],y]}_buildFrusta(){this._disposeFrusta();let t=this.rig.cameras;this.frustumSize=Math.max(.5*window.CameraTools.medianNearestDistance(t),this.sceneRadius*.004,1e-6);let e=[];this.rigKeys.forEach((s,i)=>{for(let r of this._frustumLines(s,this.frustumSize,t[i].width/t[i].height))e.push(r)}),this.frusta=d.MeshBuilder.CreateLineSystem("frusta",{lines:e},this.scene),this.frusta.color=new d.Color3(.49,.77,1),this.frusta.isPickable=!1,this.frusta.alwaysSelectAsActiveMesh=!0,this.frusta.setEnabled(this.showFrusta),this.frustumActive=d.MeshBuilder.CreateLineSystem("frustumActive",{lines:this._frustumLines(this.rigKeys[0],this.frustumSize,t[0].width/t[0].height,1.12),updatable:!0},this.scene),this.frustumActive.color=new d.Color3(1,.8,.42),this.frustumActive.isPickable=!1,this.frustumActive.alwaysSelectAsActiveMesh=!0,this.frustumActive.setEnabled(!1),this.activeCam>=0&&this._markActive(this.activeCam)}_markActive(t){if(this.activeCam=t,!this.frustumActive||t<0||!this.rig){this.frustumActive&&this.frustumActive.setEnabled(!1);return}let e=this.rig.cameras[t];d.MeshBuilder.CreateLineSystem("frustumActive",{lines:this._frustumLines(this.rigKeys[t],this.frustumSize,e.width/e.height,1.12),instance:this.frustumActive}),this.frustumActive.setEnabled(this.showFrusta)}_currentPose(){if(this.mode==="tour"&&this._lastPose)return Object.assign({},this._lastPose,{fov:this._fovBack(this.tourCam.fov)});let t=this.scene.activeCamera,e=t.position,s=t===this.orbit?this.orbit.target.subtract(e).normalize():t.getForwardRay(1).direction;return{p:[e.x,e.y,e.z],f:[s.x,s.y,s.z],u:[0,1,0],fov:t.fov}}setFrameAspect(t){this.frameAspect=t>0?t:0,this.mode==="tour"&&this._lastPose&&(this.tourCam.fov=this._fovFor(this._lastPose.fov))}_barShare(){let t=this.canvas.clientWidth||1,e=this.canvas.clientHeight||1;return this.frameAspect>t/e?t/this.frameAspect/e:1}_fovFor(t){let e=this.frameAspect?this._barShare():1;return e===1?t:2*Math.atan(Math.tan(t/2)/e)}_fovBack(t){let e=this.frameAspect?this._barShare():1;return e===1?t:2*Math.atan(Math.tan(t/2)*e)}_applyPose(t){let e=this.tourCam;e.position.set(t.p[0],t.p[1],t.p[2]),e.upVector.set(0,1,0),e.setTarget(new d.Vector3(t.p[0]+t.f[0],t.p[1]+t.f[1],t.p[2]+t.f[2])),e.upVector.set(t.u[0],t.u[1],t.u[2]),e.fov=this._fovFor(t.fov),this._lastPose=t}_enterTour(){if(this.mode==="tour")return;let t=this._currentPose();this._saved={mode:this.mode,alpha:this.orbit.alpha,beta:this.orbit.beta,radius:this.orbit.radius,target:this.orbit.target.clone(),flyPos:this.fly.position.clone(),flyRot:this.fly.rotation.clone()},this.scene.activeCamera.detachControl(),this._applyPose(t),this.scene.activeCamera=this.tourCam,this.mode="tour",this.onModeChange&&this.onModeChange("tour")}_flyTo(t,e){let s=this._currentPose();this._enterTour(),this.transition={from:s,to:t,t:0,dur:e}}get flying(){return!!this.transition}flyTo(t,e){let s=this._currentPose(),i=Math.hypot(s.p[0]-t.p[0],s.p[1]-t.p[1],s.p[2]-t.p[2]),r=1-(s.f[0]*t.f[0]+s.f[1]*t.f[1]+s.f[2]*t.f[2]);return this.mode==="tour"&&!this.transition&&i<1e-6*Math.max(this.sceneRadius,1e-9)&&r<1e-9&&Math.abs(s.fov-t.fov)<1e-6?!1:(this.activeCam>=0&&this._markActive(-1),this._flyTo(t,e>0?e:Math.min(2.2,.7+.5*i/Math.max(this.sceneRadius*.05,1e-9))),!0)}_interrupt(){this.setMode(this._saved&&this._saved.mode==="fly"?"fly":"orbit")}stopTour(){this.transition=null;let t=this._saved;if(this.mode!=="tour"||!t){this.mode==="tour"&&this.setMode("orbit");return}this.tourCam.detachControl(),t.mode==="fly"?(this.fly.position.copyFrom(t.flyPos),this.fly.rotation.copyFrom(t.flyRot),this.scene.activeCamera=this.fly):(this.orbit.setTarget(t.target.clone()),this.orbit.alpha=t.alpha,this.orbit.beta=t.beta,this.orbit.radius=t.radius,this.scene.activeCamera=this.orbit),this.scene.activeCamera.attachControl(!0),this.mode=t.mode,this._saved=null,this.activeCam=-1,this.frustumActive&&this.frustumActive.setEnabled(!1),this.onModeChange&&this.onModeChange(this.mode)}lookThrough(t,e){if(!this.rig||t<0||t>=this.rigKeys.length)return;let s=this._keyPose(t);this._markActive(t),e===!1?(this._enterTour(),this.transition=null,this._applyPose(s)):this._flyTo(s,.9)}showPose(t,e){this.mode!=="tour"&&this._enterTour(),this.transition=null;let s=e>=0&&e<this.rigKeys.length?e:-1;s!==this.activeCam&&this._markActive(s),this._applyPose(t)}frameRig(){if(!this.rigKeys.length)return;this.mode==="tour"&&this.setMode("orbit");let t=this.rigKeys.length,e=c=>this.rigKeys.reduce((f,u)=>f.add(c(u)),d.Vector3.Zero()),s=e(c=>new d.Vector3(c.p[0],c.p[1],c.p[2])).scale(1/t),i=this.frustumSize*2;for(let c of this.rigKeys)i=Math.max(i,Math.hypot(c.p[0]-s.x,c.p[1]-s.y,c.p[2]-s.z));let r=e(c=>new d.Vector3(c.f[0],c.f[1],c.f[2])).normalize(),o=e(c=>new d.Vector3(c.u[0],c.u[1],c.u[2])).normalize(),a=d.Vector3.Cross(r,o).normalize(),h=r.scale(.75).add(o.scale(.45)).add(a.scale(.55)).normalize(),l=(i+this.frustumSize)/Math.sin(this.orbit.fov/2)*1.05;this.orbit.setTarget(s),this.orbit.setPosition(s.add(h.scale(l))),this.fly.position=this.orbit.position.clone(),this.fly.setTarget(s)}_tourStep(t){if(this.mode!=="tour")return;let e=this.transition;if(!e)return;e.t+=t;let s=Math.min(1,e.t/e.dur);this._applyPose(window.TourTools.blendPose(e.from,e.to,s)),s>=1&&(this.transition=null)}setFilters(t){let e=this.dbg;if(!e||!this.mesh)return;let s=t.opacityMax===void 0||t.opacityMax>=1?1.5:t.opacityMax;e.opacityCulling=t.opacityMin>0||s<1.5?{min:t.opacityMin,max:s}:null,e.sizeCulling=t.size?{min:t.size.min,max:t.size.max}:null,e.clippingBox=t.clip?{min:new d.Vector3(t.clip.min[0],t.clip.min[1],t.clip.min[2]),max:new d.Vector3(t.clip.max[0],t.clip.max[1],t.clip.max[2])}:null,e.opacitySaturate=!!t.flat,e.shDc=t.sh[0],e.shOrder1=t.sh[1],e.shOrder2=t.sh[2],e.shOrder3=t.sh[3]}setCropBox(t){if(!t){this.cropLines&&this.cropLines.setEnabled(!1);return}let e=t.min,s=t.max,i=(a,h,l)=>new d.Vector3(a,h,l),r=[i(e[0],e[1],e[2]),i(s[0],e[1],e[2]),i(s[0],s[1],e[2]),i(e[0],s[1],e[2]),i(e[0],e[1],s[2]),i(s[0],e[1],s[2]),i(s[0],s[1],s[2]),i(e[0],s[1],s[2])],o=[[r[0],r[1],r[2],r[3],r[0]],[r[4],r[5],r[6],r[7],r[4]],[r[0],r[4]],[r[1],r[5]],[r[2],r[6]],[r[3],r[7]]];this.cropLines?d.MeshBuilder.CreateLineSystem("crop",{lines:o,instance:this.cropLines}):(this.cropLines=d.MeshBuilder.CreateLineSystem("crop",{lines:o,updatable:!0},this.scene),this.cropLines.color=new d.Color3(1,.78,.25),this.cropLines.isPickable=!1,this.cropLines.alwaysSelectAsActiveMesh=!0),this.cropLines.setEnabled(!0)}info(){return{api:this.api,gpu:this.gpuName,fps:this.engine.getFps(),drawn:this.mesh?this.mesh.renderedSplatCount:0,sort:this.sortName()}}async countInView(){let t=this.mesh,e=this.scene&&this.scene.activeCamera;if(!t||!e)return null;let s=t.computeWorldMatrix(!0).multiply(this.scene.getTransformMatrix()).m,i=t.__gpuSort,r=i&&i._source?i._source():null;if(r&&this.engine.isWebGPU&&!(this.counter&&this.counter.failed)){this.counter||(this.counter=new rt(this.engine._device));let l=await this.counter.count(r,s);if(l)return{alive:l.alive,inView:l.inView,approx:!1};if(!this.counter.failed)return null}let o=t._splatPositions;if(!o)return null;let a=Math.min(t._vertexCount||0,o.length>>2);if(!a)return null;let h=Vt(o,s,a,!!this.player,1.2,Math.max(1,Math.ceil(a/6e4)));return{alive:h.alive,inView:h.inView,approx:!0}}sortName(){let t=this.mesh;return(t?t.__gpuSort:this.gpuSort&&!this.gpuSort.failed)?"GPU radix sort (exact)":"Babylon worker (exact)"}async sortCheck(){let t=this.mesh,e=this.scene.activeCamera,s=t&&e&&t._cameraViewInfos&&t._cameraViewInfos.get(e.uniqueId);if(!s)return null;let i,r,o,a=t._splatPositions,h;if(t.__gpuSort){let u=await t.__gpuSort.readOrder(e);if(!u)return null;i=u.order,r=u.n,o=u.params,h="GPU",u.source&&(a=new Float32Array((await t.__gpuSort.radix.readU32(u.source,4*u.count)).buffer))}else{if(!t._canPostToWorker||s.sortAppliedId!==s.sortRequestId)return{busy:"a worker sort is running: try again"};i=Uint32Array.from(t._splatIndex),r=i.length,h="worker";let u=s.sortCameraForward,p=s.sortCameraPosition,g=new Float64Array(16);g[2]=u.x,g[6]=u.y,g[10]=u.z,o=St(s.sortWorldMatrix.m,g,[p.x,p.y,p.z])}let l=Math.min(t._vertexCount,a.length/4),f=zt(i,r,u=>(u<l?o.g[0]*a[4*u]+o.g[1]*a[4*u+1]+o.g[2]*a[4*u+2]:0)+o.a);return Object.assign({sorter:h,n:r},f,{wrongPct:100*f.wrong/f.pairs,frontWrongPct:100*f.frontWrong/Math.max(1,f.front),order:i})}async screenshot(t){let e=Math.round(this.engine.getRenderWidth()*t),s=Math.round(this.engine.getRenderHeight()*t);return d.Tools.CreateScreenshotUsingRenderTargetAsync(this.engine,this.scene.activeCamera,{width:e,height:s},"image/png",1,!1)}};var F={EBML:440786851,Segment:408125543,Info:357149030,TimestampScale:2807729,Duration:17545,Tracks:374648427,TrackEntry:174,TrackNumber:215,TrackType:131,CodecID:134,CodecPrivate:25506,DefaultDuration:2352003,Video:224,PixelWidth:176,PixelHeight:186,Attachments:423732329,AttachedFile:24999,FileName:18030,FileMimeType:18016,FileData:18012,Cues:475249515,Tags:307544935,Cluster:524531317,Timestamp:231,SimpleBlock:163,BlockGroup:160,Block:161,ReferenceBlock:251},oi=new Set([F.Segment,F.Info,F.Tracks,F.TrackEntry,F.Video,F.Attachments,F.AttachedFile,F.Cluster,F.BlockGroup]);var x={EBML:440786851,Segment:408125543,Info:357149030,TimestampScale:2807729,Duration:17545,Tracks:374648427,TrackEntry:174,TrackNumber:215,TrackType:131,CodecID:134,CodecPrivate:25506,DefaultDuration:2352003,Video:224,PixelWidth:176,PixelHeight:186,Attachments:423732329,AttachedFile:24999,FileName:18030,FileMimeType:18016,FileData:18012,Cues:475249515,Tags:307544935,Cluster:524531317,Timestamp:231,SimpleBlock:163,BlockGroup:160,Block:161,ReferenceBlock:251},ds=new Set([x.Segment,x.Cluster]),ps=new Set([x.Info,x.Tracks,x.Attachments,x.Timestamp,x.SimpleBlock,x.BlockGroup]);function fe(n,t){let e=n[t],s=1;for(;s<=4&&!(e&128>>s-1);)s++;if(s>4)throw new Error("MKV: bad element id");if(t+s>n.length)return null;let i=0;for(let r=0;r<s;r++)i=i*256+n[t+r];return{v:i,len:s}}function Tt(n,t){if(t>=n.length)return null;let e=n[t],s=1;for(;s<=8&&!(e&128>>s-1);)s++;if(s>8)throw new Error("MKV: bad element size");if(t+s>n.length)return null;let i=e&255>>s,r=i===255>>s;for(let o=1;o<s;o++)i=i*256+n[t+o],n[t+o]!==255&&(r=!1);return{v:r?-1:i,len:s}}var U=(n,t,e)=>{let s=0;for(let i=0;i<e;i++)s=s*256+n[t+i];return s},At=(n,t,e)=>new TextDecoder().decode(n.subarray(t,t+e)).replace(/\0+$/,""),ft=class{constructor(t){this.onHeader=t&&t.onHeader||function(){},this.onBlock=t&&t.onBlock||function(){},this.buf=new Uint8Array(0),this.head={timestampScale:1e6,duration:0,tracks:[],attachments:{}},this.headerSent=!1,this.clusterTime=0,this.blocks=0,this.files=0,this.ended=!1,this.stack=[],this.consumed=0}push(t){let e=t instanceof Uint8Array?t:new Uint8Array(t);if(!e.length)return;let s=new Uint8Array(this.buf.length+e.length);s.set(this.buf,0),s.set(e,this.buf.length),this.buf=s,this._run()}end(){this.ended=!0,this._run(),this.headerSent||this._sendHeader()}_take(t){this.buf=this.buf.subarray(t),this.consumed+=t;for(let e of this.stack)e.left>=0&&(e.left-=t)}_sendHeader(){this.headerSent=!0,this.onHeader(this.head)}_run(){for(;;){if(this._skipFirst()){if(this.stack.length&&this.stack[this.stack.length-1].skip)return;continue}for(;this.stack.length&&this.stack[this.stack.length-1].left===0;)this.stack.pop();let t=this.buf;if(!t.length)return;let e=fe(t,0);if(!e)return;let s=Tt(t,e.len);if(!s)return;let i=e.len+s.len,r=this.stack.length?this.stack[this.stack.length-1]:null;if(r&&r.id===x.Cluster&&r.left<0&&(e.v===x.Cluster||e.v===x.Cues||e.v===x.Tags)){this.stack.pop();continue}if(!r&&e.v!==x.EBML&&e.v!==x.Segment)throw new Error("MKV: unexpected top-level element 0x"+e.v.toString(16));if(ds.has(e.v)){e.v===x.Cluster&&(this.headerSent||this._sendHeader(),this.clusterTime=0),this._take(i),this.stack.push({id:e.v,left:s.v});continue}if(s.v<0)throw new Error("MKV: an element of unknown size that is not a segment or a cluster");if(t.length<i+s.v){if(ps.has(e.v)||e.v===x.EBML||this.ended)return;let h=t.length-i;this._take(t.length),this.stack.push({id:-1,left:s.v-h,skip:!0});return}let o=i,a=i+s.v;this._element(e.v,t,o,a),this._take(a)}}_skipFirst(){let t=this.stack.length?this.stack[this.stack.length-1]:null;if(!t||!t.skip)return!1;let e=Math.min(t.left,this.buf.length);return this._take(e),t.left===0&&this.stack.pop(),!0}_element(t,e,s,i){switch(t){case x.Info:this._walk(e,s,i,(r,o,a)=>{r===x.TimestampScale?this.head.timestampScale=U(e,o,a-o):r===x.Duration&&(this.head.duration=new DataView(e.buffer,e.byteOffset+o,a-o)[a-o===4?"getFloat32":"getFloat64"](0))});break;case x.Tracks:this._walk(e,s,i,(r,o,a)=>{if(r!==x.TrackEntry)return;let h={number:0,type:0,codec:"",codecPrivate:null,width:0,height:0,defaultDuration:0,ord:this.head.tracks.length},l=(c,f,u)=>{c===x.TrackNumber?h.number=U(e,f,u-f):c===x.TrackType?h.type=U(e,f,u-f):c===x.CodecID?h.codec=At(e,f,u-f):c===x.CodecPrivate?h.codecPrivate=e.slice(f,u):c===x.DefaultDuration?h.defaultDuration=U(e,f,u-f):c===x.PixelWidth?h.width=U(e,f,u-f):c===x.PixelHeight?h.height=U(e,f,u-f):c===x.Video&&this._walk(e,f,u,l)};this._walk(e,o,a,l),this.head.tracks.push(h)});break;case x.Attachments:this._walk(e,s,i,(r,o,a)=>{if(r!==x.AttachedFile)return;let h={name:"",mime:"",data:null};this._walk(e,o,a,(l,c,f)=>{l===x.FileName?h.name=At(e,c,f-c):l===x.FileMimeType?h.mime=At(e,c,f-c):l===x.FileData&&(h.data=e.slice(c,f))}),h.data&&(h.name&&(this.head.attachments[h.name]={mime:h.mime,data:h.data,ord:this.files}),this.files++)});break;case x.Timestamp:this.clusterTime=U(e,s,i-s);break;case x.SimpleBlock:this._block(e,s,i,!1,!0);break;case x.BlockGroup:{let r=null,o=!1;this._walk(e,s,i,(a,h,l)=>{a===x.Block?r=[h,l]:a===x.ReferenceBlock&&(o=!0)}),r&&this._block(e,r[0],r[1],!o,!1);break}default:break}}_walk(t,e,s,i){for(;e<s;){let r=fe(t,e),o=Tt(t,e+r.len),a=e+r.len+o.len;i(r.v,a,a+o.v),e=a+o.v}}_block(t,e,s,i,r){let o=Tt(t,e),a=new DataView(t.buffer,t.byteOffset+e+o.len,2).getInt16(0),h=t[e+o.len+2];if((h&6)!==0)throw new Error("MKV: laced blocks are not supported");let l=this.head.timestampScale/1e6;this.onBlock({track:o.v,time:(this.clusterTime+a)*l,key:r?!!(h&128):i,data:t.slice(e+o.len+3,s),ord:this.blocks++})}};var ms="gsv4d-protected",de="gsv4d-key";var pe="aes-256-ctr",me=".gsvkey",gs="gsv4d.json";var ge=n=>{let t=new Uint8Array(n.length/2);for(let e=0;e<t.length;e++)t[e]=parseInt(n.substr(2*e,2),16);return t},vs=n=>Array.from(n,t=>t.toString(16).padStart(2,"0")).join(""),Pt=(n,t)=>typeof n=="string"&&n.length===t&&/^[0-9a-f]+$/i.test(n);function ve(n){let t=n.indexOf(0);if(t<0)return null;try{let e=JSON.parse(new TextDecoder().decode(n.subarray(0,t)));return e&&e.format===ms?e:null}catch{return null}}function ye(n){let t=n;if(typeof n=="string")try{t=JSON.parse(n)}catch{throw new Error("This is not a key file (it is not JSON).")}if(!t||t.format!==de||t.version!==1)throw new Error("This is not a key file of this viewer's format ("+de+" version 1).");if(!Pt(t.key,64)||!Pt(t.key_id,16))throw new Error("The key file holds a key of 64 hexadecimal digits and a key_id of 16.");return{key_id:t.key_id.toLowerCase(),raw:ge(t.key)}}var ys=new Map;function we(n){return ys.get(String(n).toLowerCase())||null}function ws(n,t){let e=new Uint8Array(16);return e.set(n,0),new DataView(e.buffer).setUint32(8,t>>>0),e}async function Y(n,t,e,s){return new Uint8Array(await crypto.subtle.decrypt({name:"AES-CTR",counter:ws(t,e),length:32},n,s))}var bs=n=>crypto.subtle.importKey("raw",n,{name:"AES-CTR"},!1,["decrypt"]);async function xs(n){let t=new Blob([n]).stream().pipeThrough(new DecompressionStream("deflate"));return new Uint8Array(await new Response(t).arrayBuffer())}async function be(n,t){let e=n&&n.protected||{};if(n.version!==1||e.scheme!==pe)throw new Error("This video is protected in a way this viewer does not read (version "+n.version+", "+e.scheme+"); it reads version 1, "+pe+".");if(!Pt(e.stream_id,16))throw new Error("The protected video's header is damaged.");let s=ge(e.stream_id),i=await bs(t.raw),r=vs(await Y(i,s,4294967295,new Uint8Array(8)));if(String(e.key_id).toLowerCase()!==t.key_id||e.check!==r)throw new Error("This is not the key of this video (the video names key "+e.key_id+", the key file is "+t.key_id+").");return{async header(o,a){for(let h of o)h.type===1&&h.codecPrivate&&(h.codecPrivate=await Y(i,s,4294967040+h.ord,h.codecPrivate));for(let h of Object.keys(a)){let l=a[h];if(h===gs){let c=await Y(i,s,4294967294,l.data.subarray(l.data.indexOf(0)+1)),f=await xs(c.subarray(0,e.description.length));if(f.length!==l.data.length)throw new Error("The protected video's description is damaged.");l.data=f}else l.data=await Y(i,s,4294966784+l.ord,l.data)}},block:o=>Y(i,s,o.ord,o.data)}}var ks={V_VP9:"vp09.01.51.08.03.01.01.00.01",V_AV1:"av01.1.12M.08.0.000.01.01.00.1"};function Ss(n){let t=n,e=t[1]>>6,s=t[1]>>5&1,i=t[1]&31,r=(t[2]<<24|t[3]<<16|t[4]<<8|t[5])>>>0,o=0;for(let h=0;h<32;h++)o=(o<<1|r&1)>>>0,r>>>=1;let a=Array.from(t.subarray(6,12));for(;a.length&&a[a.length-1]===0;)a.pop();return"hvc1."+(e?"ABC"[e-1]:"")+i+"."+o.toString(16).toUpperCase()+"."+(s?"H":"L")+t[12]+a.map(h=>"."+h.toString(16).toUpperCase().padStart(2,"0")).join("")}function _s(n,t){let e=n.protected&&n.protected.key_id,s=t&&t.key?ye(t.key):we(e);if(!s)throw new Error("This video is protected. Open its key file ("+me+", key "+e+") first, or drop it together with the video.");return s}function Ms(n,t,e){let s=t["gsv4d.json"];if(!s||!s.data)throw new Error("This MKV has no gsv4d.json attachment, so it is not a packed 3DGS / 4DGS video.");let i;try{i=JSON.parse(new TextDecoder().decode(s.data))}catch{throw new Error("The gsv4d.json in this MKV is not valid JSON.")}if(i.format!=="gsv4d"||![1,2,3,4,5,6].includes(i.version))throw new Error("Unknown packed-video format "+i.format+" "+i.version+".");let r=n.filter(u=>u.type===1);if(!r.length)throw new Error("This MKV has no video track.");let o=i.layout==="luma"||i.layout==="luma-split",a=i.tracks?i.tracks.length:1;if(r.length<a)throw new Error("This MKV has "+r.length+" video track(s), gsv4d.json needs "+a+".");let h=(u,p,g)=>o&&u.codec==="V_MPEGH/ISO/HEVC"&&u.codecPrivate?{codec:Ss(u.codecPrivate),description:u.codecPrivate}:o&&u.codec==="V_VP9"?{codec:"vp09.00."+(p*g>8912896?"60":"51")+".08.01.01.01.01.01"}:o&&u.codec==="V_AV1"?{codec:"av01.0.16M.08.0.110.01.01.01.1"}:o?{}:{codec:ks[u.codec]},l=[];for(let u=0;u<a;u++){let p=r[u],g=i.tracks?i.tracks[u]:i,v=h(p,g.width,g.height);if(!v.codec)throw new Error("Video track "+u+" is "+p.codec+". The viewer plays VP9 or AV1 lossless 4:4:4: the browser decodes H.264 and HEVC 4:4:4 through a colour conversion that changes the data.");l.push({track:p.number,blocks:[],codec:v.codec,description:v.description,width:g.width,height:g.height,tiles:g.tiles||i.tiles,role:g.role||"all"})}let c=i.groups[0];if(!c.logXyz)throw new Error("Positions without the log transform are not supported yet.");let f={info:i,blocks:l[0].blocks,codec:l[0].codec,description:l[0].description,width:l[0].width,height:l[0].height,streams:l,cameras:t["cameras.json"]?t["cameras.json"].data:null,tours:t["tour.json"]?t["tour.json"].data:null,arrived:0,complete:!1,bytes:{got:0,total:0},error:null,_listeners:new Set,listen(u){return this._listeners.add(u),()=>this._listeners.delete(u)},_tell(){for(let u of this._listeners)try{u(this)}catch(p){console.error("gsv source listener:",p)}}};return{format:"mkv",name:e,kind:"3dgs",count:c.splats,shDegree:c.shDegree,fileCount:c.splats,thinnedFrom:0,splat:null,stats:null,raw:null,robust:null,core:null,video:f}}function xe(n,t,e,s){if(s&&!n.blocks.length||n.blocks.length&&!n.blocks[0].key)throw new Error("Video track "+t+" does not start with a keyframe.");if(s&&n.blocks.length!==e)throw new Error("Video track "+t+" has "+n.blocks.length+" frames, gsv4d.json says "+e+".")}function ke(n,t,e,s){let i=e&&e.status||function(){};i("Reading the start of the video");let r=null,o=null,a=Promise.resolve(),h=null,l,c,f=new Promise((v,y)=>{l=v,c=y}),u=new Map,p=v=>{if(!r){h=h||v,c(v);return}r.video.error||(r.video.error=v,r.video._tell())},g=new ft({onHeader:v=>{a=a.then(async()=>{let y=v.attachments["gsv4d.json"];if(!y||!y.data)throw new Error("This MKV has no gsv4d.json attachment before its first frame, so it is not a packed 3DGS / 4DGS video.");let w=ve(y.data);if(w){let k=_s(w,e);i("Opening the protected video with its key"),o=await be(w,k),await o.header(v.tracks,v.attachments)}r=Ms(v.tracks,v.attachments,t),r.video.bytes.total=s||0,r.video.streams.forEach((k,M)=>u.set(k.track,{st:k,i:M})),l(r)}).catch(p)},onBlock:v=>{a=a.then(async()=>{if(!r||r.video.error)return;let y=u.get(v.track);if(!y)return;o&&(v.data=await o.block(v)),y.st.blocks.push(v),xe(y.st,y.i,r.video.info.frames,!1);let w=Math.min(...r.video.streams.map(k=>k.blocks.length));w!==r.video.arrived&&(r.video.arrived=w,r.video._tell())}).catch(p)}});return(async()=>{let v=n.getReader(),y=0;try{for(;;){let{done:w,value:k}=await v.read();if(w)break;y+=k.length,g.push(k),r?r.video.bytes.got=y:s&&i("Reading the start of the video ("+Math.round(100*y/s)+" %)")}if(g.end(),await a,!r)throw h||new Error("This MKV ended before its description and tracks: it is not a packed 3DGS / 4DGS video.");r.video.bytes.got=y,r.video.streams.forEach((w,k)=>xe(w,k,r.video.info.frames,!0)),r.video.complete=!0,r.video._tell()}catch(w){await a.catch(()=>{}),p(w);try{v.cancel()}catch{}}})(),f}var Z=[{id:"pinhole",label:"Pinhole (no lens)",fov:null,lens:{},about:"the splats as drawn: straight lines, nothing added"},{id:"panini-game",label:"Wide view without stretching (Panini)",fov:100,lens:{kind:"panini",d:1},about:"verticals straight, the sideways stretch of a wide angle taken out - the usual answer in games"},{id:"fisheye-stereo",label:"Fisheye 8 mm, stereographic (Samyang style)",fov:110,lens:{kind:"stereographic",vignette:.25,ca:.002},about:"a full-frame fisheye that keeps shapes: lines bow, faces do not stretch"},{id:"fisheye-circular",label:"Circular fisheye 8 mm, equisolid (Nikkor / Sigma style)",fov:150,lens:{kind:"equisolid",vignette:.35,ca:.003},about:"the round picture of a circular fisheye (dark beyond 160 degrees: one pinhole picture)"},{id:"fisheye-op",label:"Orthographic fisheye 10 mm OP (Nikkor style)",fov:150,lens:{kind:"orthographic",vignette:.2,ca:.002},about:"the 'bubble': the centre large, the edge compressed hard"},{id:"anamorphic",label:"Anamorphic 2x, scope 2.39 : 1 (Panavision style)",fov:46,lens:{kind:"rectilinear",k1:-.04,vignette:.3,ca:.0025,warmth:.15,contrast:-.05,lift:.02,letterbox:2.39,dof:.35,bokeh:"oval",streak:.7,flare:.15,bloomThreshold:.7},about:"the cinema frame: a gentle barrel, soft corners, tall oval bokeh, the blue streak across lights, the wide letterbox"},{id:"cooke",label:"Warm and soft (Cooke style)",fov:null,lens:{warmth:.45,contrast:-.1,lift:.035,vignette:.25,ca:.0015,dof:.25,bloom:1.2,bloomThreshold:.6,halation:.6},about:"warm mids, lifted shadows, a warm glow around the light, a gentle fall-off, soft backgrounds"},{id:"summicron",label:"Creamy 50 mm (Summicron style)",fov:40,lens:{dof:.6,bokeh:"disc",vignette:.15,contrast:.03},about:"a clean, even disc of blur: the subject stands out, the background melts"},{id:"zeiss",label:"Clean and neutral (Zeiss style)",fov:null,lens:{warmth:-.15,contrast:.08,vignette:.1},about:"cool, contrasty, almost no fall-off (no sharpening: it would sharpen the splats' edges too)"},{id:"helios",label:"Vintage Soviet 58 mm (Helios 44-2 style)",fov:40,lens:{k1:-.02,vignette:.55,ca:.004,warmth:.25,contrast:-.08,lift:.03,dof:.7,bokeh:"cat",catEye:.6,bloom:.8,bloomThreshold:.65,halation:.3,flare:.3},about:"the swirl: cat's-eye bokeh turning around the centre, strong fall-off, colour fringes, warm and low in contrast"},{id:"petzval",label:"Portrait 85 mm (Petzval style)",fov:30,lens:{k1:.03,vignette:.6,ca:.0035,warmth:.2,lift:.02,dof:.6,bokeh:"cat",catEye:.4,curvature:.7},about:"the sharp centre that falls away fast (field curvature), swirling bokeh, a slight pincushion and a heavy fall-off"}],Se={kind:Mt,d:[0,1],k1:[-.5,.5],k2:[-.5,.5],vignette:[0,1],ca:[0,.02],warmth:[-1,1],contrast:[-.5,.5],lift:[0,.2],letterbox:[0,4],dof:[0,1],bokeh:at,catEye:[0,1],curvature:[0,1],bloom:[0,3],bloomThreshold:[0,1],halation:[0,1],flare:[0,1],streak:[0,1]};function Me(n){let t=(e,s)=>{if(typeof e=="string")return Z.some(r=>r.id===e)?[]:[`${s}no lens called ${e} (${Z.map(r=>r.id).join(", ")})`];if(!e||typeof e!="object"||Array.isArray(e))return[`${s}optics is a lens's name, or { preset, fields }, or two of these`];let i=[];e.preset!==void 0&&!Z.some(r=>r.id===e.preset)&&i.push(`${s}no lens called ${e.preset}`);for(let[r,o]of Object.entries(e)){if(r==="preset")continue;let a=Se[r];if(!a){i.push(`${s}no field ${r} (${Object.keys(Se).join(", ")})`);continue}typeof a[0]=="string"?a.includes(o)||i.push(`${s}${r} is one of ${a.join(", ")}`):typeof o=="number"&&isFinite(o)&&o>=a[0]&&o<=a[1]||i.push(`${s}${r} is a number from ${a[0]} to ${a[1]}`)}return e.letterbox!==void 0&&e.letterbox!==0&&e.letterbox<1&&i.push(`${s}letterbox is 0 (none) or a shape from 1 to 4`),i};if(Array.isArray(n)){if(n.length!==2)return["optics is one lens or two (the first to the second over the shot)"];let e=[...t(n[0],"the first: "),...t(n[1],"the second: ")];return!e.length&&Q(n[0]).kind!==Q(n[1]).kind&&e.push("two optics over a shot keep one projection (kind)"),e}return t(n,"")}function Q(n){if(typeof n=="string")return _e(n).lens;let{preset:t,...e}=n;return{...t?_e(t).lens:P,...e}}function Te(n,t,e){let s={};for(let i of Object.keys(P))s[i]=typeof n[i]=="number"&&typeof t[i]=="number"?n[i]+(t[i]-n[i])*e:e<.5?n[i]:t[i];return(n.letterbox===0||t.letterbox===0)&&(s.letterbox=e<.5?n.letterbox:t.letterbox),s}function _e(n){let t=Z.find(e=>e.id===n);if(!t)throw new Error(`lens ${n}: one of ${Z.map(e=>e.id).join(", ")}`);return{fov:t.fov,lens:{...P,...t.lens}}}var Ct=()=>window.SceneTourTools;function Ts(n,t){if(!n.rig||!n.rig.cameras.length)throw new Error("the stream carries tours but no cameras to make them of");let e=window.CameraTools,s;try{s=JSON.parse(typeof t=="string"?t:new TextDecoder().decode(t))}catch{throw new Error("the tour file is not valid JSON")}let i=n.rig.cameras.map(r=>({name:r.name,p:r.position,f:e.forwardOf(r),u:e.upOf(r),fov:e.verticalFov(r),aspect:r.width/r.height}));return Ct().fromJson(s,i,{toView:r=>n.tf.toDisplay(r),checkOptics:Me})}var As=2;function Ps(n){if(!n.rig||n.rig.cameras.length<2)return[];let t=window.CameraTools.orderCameras(n.rig.cameras,"auto").order,e=t.map(i=>n.rigKeys[i]),s=(i,r)=>{let o=Ct().cameraTour(e,{loop:r,secondsPerCamera:As,cameras:t}),a=n.rig.cameras[0];return{name:i,group:"cameras",shots:o,seconds:o.reduce((h,l)=>h+l.seconds,0),aspect:a.width>0&&a.height>0?a.width/a.height:0}};return[s("Camera to camera: back and forth",!1),s("Camera to camera: loop",!0)]}function Ae(n,t,e){let s=[];if(t&&t.tours&&n.rig&&n.rig.cameras.length)try{for(let i of Ts(n,t.tours).tours)s.push({name:i.name,group:"scene",shots:i.shots,seconds:i.seconds,aspect:i.aspect})}catch(i){e&&e(i)}return s.concat(Ps(n))}var Et=class{constructor(t,e,s){this.scene=t,this.ui=s||{},this.name=e.name||"",this.aspect=e.aspect||0,this.edit=Ct().makeSceneTour(e.shots),this.t=0,this.on=!1,this.arriving=!1,this.index=-1,this._last=0,this.borrowed=null,this.useOptics=e.useOptics!==!1,this._lenses=new Map,this._hook=t.scene.onBeforeRenderObservable.add(()=>this._step())}get duration(){return this.edit.duration}get time(){let t=this.edit.duration;return(this.t%t+t)%t}start(){let t=this.edit.at(this.t);this.on=!0,this.index=-1,this._last=performance.now(),this._shape(this.aspect),this.arriving=t.black<.5&&this.scene.flyTo(t.pose),this.arriving?this._caption(t):this._show(t,!0)}pause(){this.on=!1,this._giveBack()}stop(){this.on=!1,this.arriving=!1,this.index=-1,this._giveBack(),this._shape(0),this.scene.setTourLens&&this.scene.setTourLens(null),this.ui.black&&this.ui.black(0)}_shape(t){this.scene.setFrameAspect&&this.scene.setFrameAspect(t),this.ui.aspect&&this.ui.aspect(t)}videoPlaying(){let t=this.scene.player;return this.borrowed?this.borrowed.was.playing:!!(t&&t.playing)}toggleVideo(){let t=this.scene.player;return t?(this.borrowed?(this.borrowed.was.playing=!this.borrowed.was.playing,this.borrowed.kind!=="hold"&&(this.borrowed.was.playing?t.play():t.pause())):t.playing?t.pause():t.play(),this.ui.video&&this.ui.video(this.videoPlaying()),this.videoPlaying()):!1}_giveBack(){let t=this.borrowed,e=this.scene.player;this.borrowed=null,!(!t||!e)&&(e.rate=t.was.rate,t.was.playing?e.play():e.pause(),this.ui.video&&this.ui.video(e.playing))}_video(t){let e=this.scene.player;if(!e)return;let s=t?t.hold?"hold":t.rate:null;if((this.borrowed?this.borrowed.kind:null)===s)return;let i=this.borrowed?this.borrowed.was:{playing:e.playing,rate:e.rate};if(this.borrowed=null,s===null){e.rate=i.rate,i.playing?e.play():e.pause();return}this.borrowed={kind:s,was:i},s==="hold"?e.pause():(e.rate=s,i.playing?e.play():e.pause())}_caption(t){t.index!==this.index&&(this.index=t.index,this.ui.caption&&this.ui.caption(t.shot,t.index,this.edit.shots.length)),this.ui.progress&&this.ui.progress(this.time/this.edit.duration)}lensAt(t){let e=t.shot;if(!this.useOptics||!e.optics&&!e.focus)return null;let s;if(e.optics){let i=this._lenses.get(e);i||(i=[Q(e.optics[0]),Q(e.optics[1])],this._lenses.set(e,i)),s=Te(i[0],i[1],t.s)}else s={...this.scene.lensOwn};if(e.focus){let i=this._direction(e.focus(t.s));i&&Object.assign(s,{focusPoint:1,focusTX:i[0],focusTY:i[1]})}return s}_direction(t){let e=window.BABYLON,s=this.scene.scene.activeCamera;if(!e||!s||!t)return null;let i=e.Vector3.TransformCoordinates(new e.Vector3(t[0],t[1],t[2]),s.getViewMatrix(!0)),r=this.scene.scene.useRightHandedSystem?-i.z:i.z;return r>1e-6?[i.x/r,i.y/r]:null}_show(t,e){return this.scene.showPose(t.pose,t.camera),this.scene.setTourLens&&this.scene.setTourLens(this.lensAt(t)),e&&this._video(t.video),this.ui.black&&this.ui.black(t.black),this._caption(t),t}_step(){if(!this.on)return;let t=performance.now(),e=Math.min(.1,(t-this._last)/1e3);if(this._last=t,this.scene.mode==="tour"){if(this.arriving){if(this.scene.flying)return;this.arriving=!1}else this.t+=e;this._show(this.edit.at(this.t),!0)}}seekTo(t){this.t=Math.min(1,Math.max(0,t))*this.edit.duration*(t>=1?1-1e-9:1),this.arriving=!1,this._show(this.edit.at(this.t),!1)}async seek(t){this.t=t,this.arriving=!1;let e=this._show(this.edit.at(t),!1),s=this.scene.player,i=()=>new Promise(o=>requestAnimationFrame(o)),r=-1;if(s){let o=Math.floor(this.edit.videoTime(t)*s.fps+1e-6),a=s.count;if(s.bounce&&s.cached&&a>1){let h=o%(2*(a-1));r=h<a?h:2*(a-1)-h}else r=o%a;s.pause(),s.seek(r);for(let h=0;h<400&&s.current!==r;h++)await i()}for(let o=0;o<4;o++)await i();return{shot:e.index,label:e.shot.label,frame:s?s.current:-1,black:e.black,video:e.video?e.video.hold?"held":"x"+e.video.rate:"free"}}dispose(){this.stop(),this.scene.scene.onBeforeRenderObservable.remove(this._hook)}},dt=class{constructor(t,e){this.scene=t,this.ui=e||{},this.list=[],this.index=-1,this.player=null,this.useOptics=!0}setUseOptics(t){this.useOptics=!!t,this.player&&(this.player.useOptics=this.useOptics,!this.useOptics&&this.scene.setTourLens&&this.scene.setTourLens(null))}get current(){return this.index>=0?this.list[this.index]:null}get on(){return!!(this.player&&this.player.on)}_changed(){this.ui.change&&this.ui.change(this)}set(t,e){let s=e||this.current&&this.current.name;this.player&&(this.player.dispose(),this.player=null),this.list=t.slice(),this.index=-1,this.list.length?this.select(Math.max(0,this.list.findIndex(i=>i.name===s)),!1):this._changed()}add(t){let e=this.list.length,s=new Set(this.list.map(i=>i.name));for(let i of t){let r=i.name,o=2;for(;s.has(r);)r=i.name+" ("+o+++")";s.add(r),this.list.push(Object.assign({},i,{name:r}))}return this._changed(),e}select(t,e){if(!(t>=0&&t<this.list.length))return;let s=this.on;this.player&&(this.player.dispose(),this.player=null),this.index=t,this.player=new Et(this.scene,Object.assign({},this.list[t],{useOptics:this.useOptics}),this.ui),(e===void 0?s:e)&&this.player.start(),this._changed()}play(){return this.player?(this.player.start(),this._changed(),!0):!1}pause(){this.player&&this.player.on&&(this.player.pause(),this._changed())}stop(){this.player&&(this.player.stop(),this._changed())}toggle(){return this.on?this.pause():this.play(),this.on}taken(){this.on&&this.stop()}toggleVideo(){let t=this.scene.player;return t?this.on?this.player.toggleVideo():(t.playing?t.pause():t.play(),t.playing):!1}dispose(){this.player&&(this.player.dispose(),this.player=null),this.list=[],this.index=-1}};function Pe(n,t){let e=()=>{let l=document.createElement("div");return l.setAttribute("aria-hidden","true"),l.style.cssText="position:absolute;background:#000;pointer-events:none;z-index:1;transition:height .6s ease,width .6s ease",n.appendChild(l),l},s=e(),i=e(),r=e(),o=e();s.style.cssText+=";left:0;right:0;top:0;height:0",i.style.cssText+=";left:0;right:0;bottom:0;height:0",r.style.cssText+=";top:0;bottom:0;left:0;width:0",o.style.cssText+=";top:0;bottom:0;right:0;width:0";let a=0,h=()=>{let l=t.canvas.clientWidth||1,c=t.canvas.clientHeight||1,f=a>l/c?(c-l/a)/2:0,u=a>0&&a<l/c?(l-c*a)/2:0;s.style.height=i.style.height=Math.round(f)+"px",r.style.width=o.style.width=Math.round(u)+"px"};return window.addEventListener("resize",h),l=>{a=l>0?l:0,h()}}function Es(n){let t=Math.min(...n.map(s=>s.blocks.length)),e=new Float64Array(t);for(let s of n)for(let i=0;i<t;i++)e[i]+=s.blocks[i].data.length;return e}function Cs(n){let t=Math.min(...n.map(e=>e.blocks.length));return Uint8Array.from(n[0].blocks.slice(0,t),e=>e.key?1:0)}function Os(n,t,e=120){if(t<0||t===n)return[];if(n<0||t<n||t-n>e)return[t];let s=[];for(let i=n+1;i<=t;i++)s.push(i);return s}function Ls(n,t){let e=Math.min(n.length,Math.max(1,Math.round(t)));if(!e)return{bps:0,frame:null,keys:0};let s=0,i=0,r=0,o=0;for(let a=n.length-e;a<n.length;a++){let h=n[a];s+=h.bytes,h.key?o++:(i+=h.bytes,r++)}return{bps:s*8*t/e,frame:r?i/r:null,keys:o}}function Rs(n){let t=0;for(let e of n)!e.key&&e.bytes>t&&(t=e.bytes);if(!t)for(let e of n)e.bytes>t&&(t=e.bytes);return t*1.25||1}function Ot(n){return n>=1e6?(n/1e6).toFixed(2)+" MB":n>=1e4?Math.round(n/1e3)+" KB":n>=1e3?(n/1e3).toFixed(1)+" KB":Math.round(n)+" B"}function Ee(n){return Math.round(n).toLocaleString("en-US")}var pt=class{constructor(t,e){this.scene=t,this.host=e,this.visible=!1,this.sizes=null,this.keys=null,this.fps=30,this.total=0,this.fileBytes=0,this.samples=[],this.trace=[],this.last=-1,this.count=null,this._drawAt=0,this._countAt=0,this._asking=!1,e.classList.add("meter"),e.setAttribute("role","status"),e.setAttribute("aria-label","Live read-out of the stream");let s=()=>{let i=document.createElement("div");return i.className="meter-line",e.appendChild(i),i};this.elRate=s(),this.elSplats=s(),this.elSpeed=s(),this.elRender=s(),this.canvas=document.createElement("canvas"),this.canvas.className="meter-graph",e.appendChild(this.canvas),this.elNote=s(),this.elNote.classList.add("meter-note"),this._obs=null}attach(t){let e=t&&t.video;this.video=e||null,this._read(),this.fps=e&&e.info.fps||30,this.total=t?t.count:0,this.samples=[],this.trace=[],this.last=-1,this.count=null,this.has=!!t,this._sync()}setVisible(t){this.visible=!!t,this._sync()}_sync(){let t=this.visible&&this.has;this.host.hidden=!t;let e=this.scene.scene;t&&!this._obs&&e&&(this._obs=e.onAfterRenderObservable.add(()=>this._frame())),!t&&this._obs&&e&&(e.onAfterRenderObservable.remove(this._obs),this._obs=null),t&&this._draw(!0)}_read(){let t=this.video;this.sizes=t?Es(t.streams):null,this.keys=t?Cs(t.streams):null,this.fileBytes=this.sizes?this.sizes.reduce((e,s)=>e+s,0):0}_frame(){let t=performance.now(),e=this.scene.player;if(this.video&&this.sizes&&this.sizes.length<Math.min(...this.video.streams.map(s=>s.blocks.length))&&this._read(),e&&this.sizes){let s=e.state(),i=s.frame;s.fps&&(this.fps=s.fps);for(let o of Os(this.last,i))o>=this.sizes.length||this.samples.push({bytes:this.sizes[o],key:!!this.keys[o],frame:o,inView:this.count?this.count.inView:null,alive:this.count?this.count.alive:null});this.last=i;let r=Math.round(10*this.fps);this.samples.length>r&&this.samples.splice(0,this.samples.length-r)}!this._asking&&t-this._countAt>=1e3/8&&(this._asking=!0,this._countAt=t,this.scene.countInView().then(s=>{if(this._asking=!1,!s)return;this.count=s;let i=this.samples[this.samples.length-1];for(i&&(i.inView=s.inView,i.alive=s.alive),this.trace.push({t,inView:s.inView,alive:s.alive});this.trace.length&&t-this.trace[0].t>10*1e3;)this.trace.shift()},()=>{this._asking=!1})),t-this._drawAt>=1e3/12&&this._draw(!1)}_draw(t){if(this.host.hidden&&!t)return;this._drawAt=performance.now();let e=this.scene.player,s=!!(e&&this.sizes),i=this.count,r=this.scene.info();if(s){let c=Ls(this.samples,this.fps),f=this.fileBytes*8*this.fps/Math.max(1,this.sizes.length);this.elRate.textContent=this.samples.length?(c.bps/1e6).toFixed(2)+" Mbit/s now  ·  "+(c.frame===null?"key frame":Ot(c.frame)+" a frame"):(f/1e6).toFixed(2)+" Mbit/s for the file  ·  press play"}else this.elRate.textContent="a still model: no stream";let o=i?i.alive:this.total;this.elSplats.textContent=Ee(o)+" splats"+(i?"  ·  "+(i.approx?"about ":"")+Ee(i.inView)+" in view":"");let a=e?e.state():null;this.elSpeed.textContent=(s?"video "+this.fps+" fps"+(a&&!a.playing?" (paused)":"")+"  ·  ":"")+"drawn at "+Math.round(r.fps)+" fps";let h=this.scene.governor,l=h?h.info():null;this.elRender.textContent=l?"render "+l.step+" %"+(l.auto?" auto":"")+" at "+l.fps+" fps"+(l.split?" ("+(l.moving?"moving":"still")+")":"")+"  ·  "+l.width+" × "+l.height+" px  ·  frame "+l.avg.toFixed(1)+" ms, slowest "+l.worst.toFixed(0)+" of "+l.budget.toFixed(1)+(l.last?"  ·  "+l.last:""):"",this.elRender.hidden=!l,this._graph(s,o)}_graph(t,e){let s=this.canvas,i=Math.min(2,window.devicePixelRatio||1),r=s.clientWidth||236,o=s.clientHeight||66;(s.width!==Math.round(r*i)||s.height!==Math.round(o*i))&&(s.width=Math.round(r*i),s.height=Math.round(o*i));let a=s.getContext("2d");a.setTransform(i,0,0,i,0,0),a.clearRect(0,0,r,o);let h=t?o-2:0,l=3,c=o-6,f="";if(t){let p=Math.round(10*this.fps),g=r/p,v=Rs(this.samples),y=r-this.samples.length*g;a.fillStyle="rgba(255,255,255,.10)",a.fillRect(0,h,r,1);let w=null;this.samples.forEach((k,M)=>{let T=k.key?h:Math.max(1,Math.min(h,k.bytes/v*h));a.fillStyle=k.key?"rgba(255,255,255,.34)":"rgba(120,178,255,.92)",a.fillRect(y+M*g,h-T,Math.max(1,g-(g>2.5?1:0)),T),k.key&&(w=k)}),f="bars: bytes of a frame, top "+Ot(v)+(w?"  ·  pale: key frame "+Ot(w.bytes):"")}let u=this.trace;if(u.length>1&&e>0){let p=u[u.length-1].t,g=p-10*1e3;a.strokeStyle="rgba(255,196,112,.95)",a.lineWidth=1.5,a.lineJoin="round",a.beginPath(),u.forEach((v,y)=>{let w=(v.t-g)/1e4*r,k=l+c-Math.min(1,v.inView/Math.max(1,v.alive||e))*c;y?a.lineTo(w,k):a.moveTo(w,k)}),a.stroke(),f+=(f?"  ·  ":"")+"line: share of the splats in view"}this.elNote.textContent=f||"the last 10 seconds"}dispose(){this.visible=!1,this.has=!1,this._sync(),this.host.replaceChildren()}};var Ce="gsv.render-size.v3";var Fs=[240,165,144,120,90,75,72,60],Oe=n=>Math.round(n/.05)*.05,Ds=n=>Math.floor(n/.05+1e-9)*.05,Le=n=>Math.min(2,Math.max(.4,+n.toFixed(3)));function Bs(n){if(!n||n.length<30)return 60;for(let t of Fs){let e=1e3/t,s=0;for(let i of n)i<=e*1.12&&s++;if(s>=n.length*.25)return t}return 60}function Is(n,t){let e=0;for(let s of n)s>t*1.2&&e++;return{missed:e,share:n.length?e/n.length:0}}function Re(n,t,e){return t>0?n*Math.sqrt(.9*e/t):n}var mt=class{constructor(t,e,s){this.name=t,this.canFull=e,this.s=s.s,this.d=e?s.d:2,this.block=null,this.fails={},this.good=null,this.lastUp=null,this.changedAt=performance.now(),this.coolUntil=0}get now(){return{s:this.s,d:this.d}}},gt=class{constructor(t,e){e=e||{},this.scene=t,this.maxPixels=e.maxPixels||83e5,this.log=e.log||(()=>{}),this.fixed=e.fixed||0,this.lens=e.lens!==void 0?e.lens:t.lensTiers||null,this.halves=e.frameRate!==!1;let s=this._remembered();this.motion=new mt("motion",this.halves,s.motion),this.rest=new mt("rest",!1,s.rest),this.split=!!e.split,this.isMoving=e.moving||(()=>this._cameraMoved()),this.moving=!this.split,this.movedAt=0,this._view=null,this.recent=[],this.hz=60,this.deltas=[],this.stamps=[],this.skip=4,this.lastAt=0,this.avg=0,this.worst=0,this.share=0,this.said="",this._hook=t.scene.onBeforeRenderObservable.add(()=>this._frame()),this._apply(),t.governor=this}get active(){return this.moving?this.motion:this.rest}get divider(){return this.fixed||!this.halves?1:this.active.d}get budget(){return this.divider*1e3/this.hz}get refresh(){return this.hz}get scale(){return this.fixed||this._fit(this.active.s)}_fit(t){let e=window.devicePixelRatio||1,s=this.scene.canvas,i=t*Math.min(1,2/e),r=Math.max(1,(s.clientWidth||1)*(s.clientHeight||1)),o=r*e*e*i*i;return o>this.maxPixels&&(i*=Math.sqrt(this.maxPixels/o)),i}_remembered(){let t={motion:{s:1,d:1},rest:{s:1,d:2}};try{let e=JSON.parse(localStorage.getItem(Ce)||"{}");for(let s of["motion","rest"])e[s]&&e[s].s>=.4&&e[s].s<=2&&(e[s].d===1||e[s].d===2)&&(t[s]={s:+e[s].s,d:e[s].d});t.motion.d===1&&t.motion.s<1&&(t.motion.s=1)}catch{}return t}_remember(){try{localStorage.setItem(Ce,JSON.stringify({motion:this.motion.now,rest:this.rest.now}))}catch{}}_apply(){this.lens&&this.lens.setRoom((this.fixed||this.active.s)>=1-1e-9),this.scene.setRenderScale(this.scale),this.scene.frameDivider=this.divider,this.scene.frameGap=this.divider>1?.8*1e3*this.divider/this.hz:0,this.skip=4,this.deltas.length=0,this.stamps.length=0}_cameraMoved(){let t=this.scene.scene.activeCamera;if(!t||!t.getViewMatrix)return!1;let e=t.getViewMatrix().m,s=this._view;if(this._view=Array.from(e),!s)return!1;for(let i=0;i<16;i++)if(Math.abs(s[i]-e[i])>1e-7)return!0;return!1}refit(){this._apply()}hold(t){this.fixed=t>0?t:0,this._apply()}_go(t,e,s){let i=t.now,r=o=>Math.round(o.s*100)+" %"+(o.d>1?" at 1/"+o.d+" rate":"");t.s=e.s,t.d=e.d,t.changedAt=performance.now(),this.said=(this.split?t===this.motion?"moving: ":"still: ":"")+r(i)+" → "+r(t.now)+"  "+s,this.log(this.said),t===this.active&&this._apply()}_frame(){let t=performance.now(),e=this.lastAt?t-this.lastAt:0,s=this.scene.engine.getDeltaTime();if(this.lastAt=t,document.hidden||!(e>0)||e>=250*this.divider){this.deltas.length=0,this.stamps.length=0,this.skip=4;return}this.split&&this.isMoving()&&(this.movedAt=t);let i=this.split?t-this.movedAt<.7*1e3:!0;if(i!==this.moving){this.moving=i,this._apply();return}if(this.skip>0){this.skip--;return}if(s>0&&s<250&&(this.recent.push(s),this.recent.length>240&&this.recent.shift(),this.recent.length>=60&&this.recent.length%30===0)){let l=Bs(this.recent);if(l!==this.hz){this.hz=l,this._apply();return}}for(this.deltas.push(e),this.stamps.push(t);this.stamps.length&&t-this.stamps[0]>.75*1e3*this.divider;)this.stamps.shift(),this.deltas.shift();if(!this.deltas.length)return;this.avg=this.deltas.reduce((l,c)=>l+c,0)/this.deltas.length,this.worst=Math.max(...this.deltas);let r=Is(this.deltas,this.budget);this.share=r.share;let o=this.active;if(this.fixed||this.recent.length<60||t<o.coolUntil||this.stamps[this.stamps.length-1]-this.stamps[0]<.75*1e3*.8*this.divider)return;t-o.changedAt>5*1e3&&o.lastUp===null&&r.share<=.15&&this._remember();let a=this.budget,h=o.s>=1-1e-9;if(r.share>.15&&h&&this.lens){let l=this.lens.shed(t);if(l){this._lensStep(o,t,"frames missed ("+Math.round(r.share*100)+" %): the lens's "+l+" off");return}}else if(r.share<=.15&&r.missed===0&&h&&this.lens&&t-o.changedAt>3*1e3){let l=this.lens.restore(t);if(l){this._lensStep(o,t,"no missed frames: the lens's "+l+" back");return}}if(r.share>.15){let l=null,c=Le(Ds(Math.min(o.s*.97,Re(o.s,Math.max(this.avg,a),a))));if(o.canFull&&o.d===1){let f=Math.max(1,c);l=f<o.s-1e-9?{s:f,d:1}:{s:o.s,d:2}}else c<o.s-1e-9&&(l={s:c,d:o.d});if(o.lastUp!==null&&o.lastUp.s===o.s&&o.lastUp.d===o.d&&o.good&&t-o.changedAt<4*1e3){let f=o.s+"@"+o.d,u=o.fails[f]=(o.fails[f]||0)+1;o.block={s:o.s,d:o.d,until:t+10*1e3*Math.pow(2,Math.min(u-1,4))},l=o.good}l&&(this._go(o,l,"frames missed ("+Math.round(r.share*100)+" % of the last "+.75+" s)"),o.coolUntil=t+.8*1e3,o.lastUp=null)}else if(r.missed===0&&t-o.changedAt>3*1e3){let l=this.avg<.85*a,c=null,f=l?Re(o.s,this.avg,a):o.s*1.1,u=Le(Oe(Math.max(o.s+.05,Math.min(f,o.s*1.5))));o.canFull&&o.d===2&&o.s>=1.5-1e-9?c={s:1,d:1}:o.canFull&&o.d===2&&u>=1.5+1e-9&&o.s<1.5?c={s:Oe(1.5),d:2}:u>o.s+1e-9&&(c={s:u,d:o.d}),c&&!(o.block&&o.block.d===c.d&&c.s>=o.block.s-1e-9&&t<o.block.until)&&!(c.d===o.d&&this._fit(c.s)<=this._fit(o.s)*1.001)&&(o.good={s:o.s,d:o.d},this._go(o,c,"no missed frames: trying it"),o.lastUp={s:c.s,d:c.d},o.coolUntil=t+.8*1e3)}else o.lastUp&&t-o.changedAt>4*1e3&&(o.lastUp=null)}_lensStep(t,e,s){this.said=s,this.log(s),t.changedAt=e,t.coolUntil=e+.8*1e3,t.lastUp=null,this.skip=4,this.deltas.length=0,this.stamps.length=0}info(){let t=this.scene.canvas,e=window.devicePixelRatio||1,s=this.scale,i=this.active;return{auto:!this.fixed,step:Math.round((this.fixed?s:i.s)*100),width:Math.round((t.clientWidth||0)*e*s),height:Math.round((t.clientHeight||0)*e*s),budget:this.budget,refresh:this.refresh,fps:Math.round(this.refresh/this.divider),split:this.split,moving:this.moving,avg:this.avg,worst:this.worst,share:this.share,last:this.said}}dispose(){this.scene.frameDivider=1,this.scene.frameGap=0,this.scene.scene.onBeforeRenderObservable.remove(this._hook),this.scene.governor===this&&(this.scene.governor=null)}};var b=n=>document.getElementById(n),Us=/^cam00/,Lt="assets/clip.mkv",vt=null,zs="The camera is on a tour, the scene is drawn live · Pause the video and it goes on · Drag the picture to take the camera",Gs="Drag to orbit · Scroll to zoom · WASD to move · Right-drag to pan",O=new URLSearchParams(location.search),E=b("stage"),C=b("view"),yt=b("stage-note"),_=null,K=!1,D=-1,S=null,z=null;O.has("theatre")&&document.body.classList.add("theatre");O.has("bare")&&document.body.classList.add("bare");function Fe(n){E.classList.remove("live"),E.classList.add("failed"),yt.style.display="block",yt.textContent="The live scene cannot start here: "+n+" The picture behind this note is a still of it.",b("controls").hidden=!0,b("chip").hidden=!0}var G=null;function De(){_&&(G?G.refit():(G=new gt(_),+O.get("scale")>0&&G.hold(Math.min(3,+O.get("scale")))))}function Rt(n){_.setMode("orbit"),D>=0?_.lookThrough(D,!!n):_.frame()}function $(n){E.classList.toggle("touring",n),b("b-tour").textContent=n?"Stop the tour":"Play the tour",b("b-tour").setAttribute("aria-pressed",String(n)),b("hint").textContent=n?zs:Gs}function wt(n){let t=b("b-play");t.textContent=n?"Pause the video":"Play the video",t.setAttribute("aria-pressed",String(n))}function Vs(){!S||!S.list.length||($(!0),S.play())}function J(){!S||!E.classList.contains("touring")||(S.stop(),$(!1))}async function Ns(){let n=[];try{let o=await fetch("data/scenes.json");o.ok&&(n=(await o.json()).scenes||[])}catch{}if(!n.length)return;let t=O.get("scene"),e=n.find(o=>o.id===t)||n[0];Lt=e.stream,vt=e;let s=b("poster");e.still&&(s.src=e.still),e.alt&&(s.alt=e.alt);let i=e.metrics||{};for(let[o,a]of[["m-rate","bitrate"],["m-psnr","psnr"],["m-lpips","lpips"]])i[a]&&b(o)&&(b(o).textContent=i[a]);let r=b("s-scene");n.length<2||(n.forEach(o=>{let a=document.createElement("option");a.value=o.id,a.textContent=o.name,r.appendChild(a)}),r.value=e.id,r.closest(".pick").hidden=!1,r.addEventListener("change",()=>{let o=new URLSearchParams(location.search);o.set("scene",r.value),location.search=o.toString()}))}function Ws(n){let t=document.createElement("iframe");t.src="cubeplayer/player.html?stream="+encodeURIComponent("../"+n.stream)+(n.camera?"&camera="+encodeURIComponent(n.camera):""),t.title="The scene, drawn live",t.allow="fullscreen",t.className="cube-frame",E.appendChild(t),C.hidden=!0,yt.style.display="none";for(let e of["s-tour","s-cam"])b(e).closest(".pick").hidden=!0;for(let e of["b-tour","b-play","b-home","b-stats"])b(e).hidden=!0;b("controls").hidden=!1,b("hint").textContent="Drag to orbit · Scroll to zoom · The controls of the scene are at its foot",t.addEventListener("load",()=>{E.classList.add("live"),window.__ready=!0})}async function $s(){try{if(await Ns(),vt&&vt.player==="cube")return Ws(vt);if(typeof VideoDecoder>"u")throw new Error("this browser has no video decoder a page can use (WebCodecs).");_=new ut(C),await _.init(O.get("engine")),_.keysWhen=()=>K,De(),_.setBackground("#000000");let n=await fetch(Lt);if(!n.ok||!n.body)throw new Error("the stream did not load ("+n.status+").");let t=await ke(n.body,Lt.split("/").pop(),{status:l=>{yt.textContent=l}},+n.headers.get("content-length")||0);t.video.cacheFrames=!0,await _.show(t);let e=b("s-cam"),s=null;t.video.cameras&&window.CameraTools?(s=window.CameraTools.parseCamerasJson(new TextDecoder().decode(t.video.cameras)),_.setRig(s),_.setFrustaVisible(!1),s.cameras.forEach((l,c)=>{let f=document.createElement("option");f.value=String(c),f.textContent=String(l.name||"camera "+(c+1)).replace(/_.*$/,""),e.appendChild(f),D<0&&Us.test(String(l.name||""))&&(D=c)}),D<0&&s.cameras.length&&(D=0),e.value=String(D),e.addEventListener("change",()=>{J(),_.setMode("orbit"),_.lookThrough(+e.value,!0),C.focus()})):e.closest(".pick").hidden=!0,Rt(!1);let i=_.player;if(i&&(i.loop=!0,i.bounce=!0,i.play(),wt(!0)),i&&s&&window.SceneTourTools)try{S=new dt(_,{aspect:Pe(E,_),black:u=>{b("t-black").style.opacity=String(u)},video:wt});let l=s.cameras[0].width/s.cameras[0].height,c=Ae(_,t.video,u=>console.warn("a tour inside the stream cannot be played:",u)).map(u=>u.group==="scene"&&Math.abs((u.aspect||0)-l)<.01*l?Object.assign({},u,{aspect:0}):u);S.set(c,"Cinematic: the long cut");let f=b("s-tour");S.list.forEach((u,p)=>{let g=document.createElement("option");g.value=String(p),g.textContent=u.name,f.appendChild(g)}),f.value=String(S.index),f.addEventListener("change",()=>{tt=!1,B=!1,S.select(+f.value,!0),$(!0),C.focus()}),_.onModeChange=u=>{u!=="tour"&&J()},window.__tour=S}catch(l){console.error("the tours could not be set up:",l),S=null}if((!S||!S.list.length)&&(b("b-tour").hidden=!0,b("s-tour").closest(".pick").hidden=!0),z=new pt(_,b("meter")),z.attach(t),z.setVisible(!0),b("meter").classList.add("quiet"),O.has("stats")&&Ft(!0),b("controls").hidden=!1,E.classList.add("live"),$(!1),S&&!tt&&O.get("tour")!=="0"){let l=Ie();l.length&&(B=!0,S.select(l[0],!0),$(!0),b("s-tour").value=String(S.index))}let r=b("chip");r.hidden=!1;let o=l=>+String(l).replace(/,/g,""),a=l=>l>=1e4?Math.round(l/1e3)+"k":l.toLocaleString("en-US");setInterval(()=>{let l=["live",Math.round(_.info().fps)+" fps"],c=/([\d.]+) Mbit\/s/.exec(z.elRate.textContent),f=/([\d,]+) splats(?:\D+?([\d,]+) in view)?/.exec(z.elSplats.textContent);c&&l.push((+c[1]).toFixed(1)+" Mbit/s"),f&&l.push(a(o(f[1]))+" splats"+(f[2]?" ("+a(o(f[2]))+" in view)":"")),G&&G.avg>0&&l.push(G.avg.toFixed(1)+" ms"),r.textContent=l.join("  ·  ")},500);let h=setInterval(()=>{_.player&&_.player.error&&(clearInterval(h),Fe(String(_.player.error.message||_.player.error)+"."))},500);window.__ready=!0}catch(n){console.error(n),window.__failed=String(n&&n.message?n.message:n),Fe(window.__failed)}}var Ks=+O.get("idle")>0?+O.get("idle"):120,Be=performance.now(),B=!1,tt=O.get("tour")==="0",Ie=()=>S.list.map((n,t)=>n.group==="scene"?t:-1).filter(n=>n>=0);for(let n of["pointerdown","keydown","wheel","touchstart"])window.addEventListener(n,()=>{Be=performance.now(),B=!1},{passive:!0,capture:!0});setInterval(()=>{if(!S||!E.classList.contains("live")||document.hidden)return;let n=Ie();if(!S.on&&!tt&&!B&&n.length&&performance.now()-Be>Ks*1e3)B=!0,S.select(n[0],!0),$(!0),b("s-tour").value=String(S.index);else if(B&&S.on&&S.player.t>=S.player.duration){let t=n[(n.indexOf(S.index)+1)%n.length];S.select(t,!0),b("s-tour").value=String(t)}},250);function Ft(n){if(!z)return;let t=b("meter"),e=n===void 0?t.classList.contains("quiet"):n;t.classList.toggle("quiet",!e),b("b-stats").setAttribute("aria-pressed",String(e))}b("b-stats").addEventListener("click",()=>Ft());b("b-tour").addEventListener("click",()=>{S&&(S.on?(tt=!0,B=!1,J(),Rt(!0)):(tt=!1,B=!1,Vs()),C.focus())});b("b-play").addEventListener("click",()=>{let n=_&&_.player;if(n){if(S){wt(S.toggleVideo());return}n.playing?n.pause():n.play(),wt(n.playing)}});b("b-home").addEventListener("click",()=>{_&&(J(),b("s-cam").value=String(D),Rt(!0),C.focus())});document.addEventListener("fullscreenchange",()=>setTimeout(De,200));b("b-full").addEventListener("click",()=>{document.fullscreenElement?document.exitFullscreen():E.requestFullscreen&&E.requestFullscreen().catch(()=>{})});E.addEventListener("pointerenter",()=>{K=!0});E.addEventListener("pointerleave",()=>{K=document.activeElement===C});C.addEventListener("focus",()=>{K=!0});C.addEventListener("blur",()=>{K=E.matches(":hover")});C.addEventListener("contextmenu",n=>n.preventDefault());C.addEventListener("pointerdown",()=>C.focus({preventScroll:!0}));C.addEventListener("wheel",()=>{S&&S.on&&(J(),_.setMode("orbit"))},{passive:!0});window.addEventListener("keydown",n=>{(n.key==="i"||n.key==="I")&&z&&!n.ctrlKey&&!n.metaKey&&!n.altKey&&!/^(INPUT|SELECT|TEXTAREA)$/.test(n.target.tagName)&&Ft()});window.addEventListener("keydown",n=>{!K||n.ctrlKey||n.metaKey||n.altKey||(n.key===" "?(n.preventDefault(),b("b-play").click()):/^Arrow/.test(n.key)&&n.preventDefault())});(async function(){let t=b("cmp");try{let e=await(await fetch("data/comparison.json")).json(),s=m=>m.mbps!==void 0?m.mbps:m.kb*.24,i=e.others.map(m=>Object.assign({},m,{mbps:s(m)})).sort((m,q)=>m.mbps-q.mbps),r=Object.assign({ours:!0},e.ours),o=[r].concat(i),a=(m,q)=>m==null?"&ndash;":m.toFixed(q),h=m=>m<10?m.toFixed(1):String(Math.round(m));t.innerHTML="<thead><tr><th>Method</th><th class=n>PSNR (dB)</th><th class=n>LPIPS</th><th class=n>Mbit/s</th><th class=n>Real-time playback</th><th>In a browser</th></tr></thead><tbody>"+o.map(m=>`<tr class="${m.ours?"ours":""}"><td>${m.ours?m.name:`<a href="https://arxiv.org/abs/${m.ref}" rel="noopener">${m.name}</a> <small>${m.venue}</small>`}</td><td class=n>${a(m.psnr,2)}</td><td class=n>${a(m.lpips,3)}${m.lpips!=null&&m.lpips_net?" <small>"+m.lpips_net+"</small>":""}</td><td class=n>${h(m.mbps)}</td><td class=n>${m.ours?"120+ fps <small>VR capable, in a browser</small>":m.fps?`${m.fps} fps <small>${m.gpu}</small>`:"not reported"}</td><td>${m.ours?"yes":"&ndash;"}</td></tr>`).join("")+"</tbody>",t.querySelector("caption")?.remove();let l=900,c=380,f=56,u=20,p=16,g=44,v=Math.log10(2),y=Math.log10(2500),w=28,k=31.5,M=m=>f+(Math.log10(m)-v)/(y-v)*(l-f-u),T=m=>p+(1-(m-w)/(k-w))*(c-p-g),A="";for(let m of[2,5,10,20,50,100,200,500,1e3,2e3])A+=`<line x1="${M(m)}" x2="${M(m)}" y1="${p}" y2="${c-g}" stroke="var(--grid)"/><text x="${M(m)}" y="${c-g+18}" text-anchor="middle">${m}</text>`;for(let m of[28,28.5,29,29.5,30,30.5,31,31.5])A+=`<line x1="${f}" x2="${l-u}" y1="${T(m)}" y2="${T(m)}" stroke="var(--grid)"/><text x="${f-8}" y="${T(m)+4}" text-anchor="end">${m}</text>`;A+=`<text x="${(f+l-u)/2}" y="${c-6}" text-anchor="middle">Mbit/s, logarithmic: smaller is better</text><text x="14" y="${(p+c-g)/2}" transform="rotate(-90 14 ${(p+c-g)/2})" text-anchor="middle">PSNR dB: higher is better</text>`;for(let m of o)A+=`<g class="${m.ours?"ours":""}"><circle cx="${M(m.mbps)}" cy="${T(m.psnr)}" r="${m.ours?8:5}" fill="${m.ours?"var(--accent)":"var(--ink-3)"}" stroke="var(--plane)" stroke-width="2"/><text x="${M(m.mbps)+(M(m.mbps)>l-120?-10:10)}" y="${T(m.psnr)+(m.ours?24:-8)}" text-anchor="${M(m.mbps)>l-120?"end":"start"}">${m.name}</text></g>`;b("cmp-plot").innerHTML=A,b("cmp-note").innerHTML=`Updated ${e.updated}, ${e.status}. Published numbers are as the papers print them for ${e.scene}, with the bit-rate worked out from their bytes per frame at 30 frames a second; the papers measure 300 frames at half resolution. Ours is measured the same way: the 300 frames at half resolution, from the stream as it is delivered (its bit-rate counts every byte of it). LPIPS is shown only where the paper states its network; ours is VGG. Real-time playback: the rendering speed each paper reports (an average over the dataset, on the GPU it names; not measured here) - all of those reported are above 30 frames a second. A dash under &ldquo;In a browser&rdquo; means the paper reports no browser player (nothing beyond the papers was checked).`}catch(e){console.error("the comparison could not be drawn:",e),t.innerHTML="<caption>The comparison could not be loaded.</caption>"}})();$s();
