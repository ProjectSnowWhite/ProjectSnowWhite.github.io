var Y=globalThis.BABYLON,b=256,y={splats:["means_bytes_0","means_bytes_1","scales","f_dc","opacities"],splats2:["quaternions","f_rest_labels","scales"],centroids:["f_rest_centroids"]};y.steps=["means_step","means_bytes_0","means_bytes_1","scales"];var Q=[...new Set([...y.splats,...y.splats2,...y.centroids,...y.steps])],z=20,D=21,T=22,I=c=>c===0?1:9+c,M={linear4:0,smallest3:1,disc:2},E=6,N=1800,k=16,K=8,G=127;function X(c){let e=new Int32Array(N),s=c.sizes;if(!s)return e;if(s.unit!==k)throw new Error("this 4D video counts sizes in units this viewer does not read (unit "+s.unit+", it reads "+k+")");for(let t=0;t<3;t++)e.set(s.scale_log2[t],256*t);if(s.level_log2){for(let t=0;t<3;t++)e.set(s.level_log2[t],768+256*t);e[1792]=s.step_bias,e[1793]=1}return s.spin_shift&&e.set(s.spin_shift,1536),e}function oe(c,e,s,t){if(!c[1793])return 0;let i=[c[e[0]],c[256+e[1]],c[512+e[2]]].sort((o,r)=>o-r);return Math.min(K,Math.max(0,Math.floor((i[1]+c[1792]-c[768+256*t+s])/k)))}function ae(c,e,s){let t=[c[s[0]],c[256+s[1]],c[512+s[2]]],i=[0,1,2].sort((g,U)=>t[g]-t[U]||g-U),o=i[0],r=i[1],a=i[2],h=c[1536+Math.min(255,Math.max(0,t[a]-t[r]))],u=e[0]/G*2-1,n=e[1]/G*2-1,p=1-Math.abs(u)-Math.abs(n),f=[p<0?(1-Math.abs(n))*(u>=0?1:-1):u,p<0?(1-Math.abs(u))*(n>=0?1:-1):n,p],_=Math.hypot(f[0],f[1],f[2]);f=f.map(g=>g/_);let m=f[2]>=0?1:-1,w=-1/(m+f[2]),S=f[0]*f[1]*w,F=[1+m*f[0]*f[0]*w,m*S,-m*f[0]],W=[S,m+f[1]*f[1]*w,-f[1]],B=(e[2]<<h)%256*Math.PI/256,v=[0,1,2].map(g=>Math.cos(B)*F[g]+Math.sin(B)*W[g]),V=r===(a+1)%3?1:-1,Z=[f[1]*v[2]-f[2]*v[1],f[2]*v[0]-f[0]*v[2],f[0]*v[1]-f[1]*v[0]].map(g=>g*V),l=[];l[a]=v,l[r]=Z,l[o]=f;let P=[1+l[0][0]+l[1][1]+l[2][2],1+l[0][0]-l[1][1]-l[2][2],1-l[0][0]+l[1][1]-l[2][2],1-l[0][0]-l[1][1]+l[2][2]],x=0;for(let g=1;g<4;g++)P[g]>P[x]&&(x=g);let d=Math.sqrt(Math.max(P[x],1e-12))*2;return x===0?[d/4,(l[1][2]-l[2][1])/d,(l[2][0]-l[0][2])/d,(l[0][1]-l[1][0])/d]:x===1?[(l[1][2]-l[2][1])/d,d/4,(l[1][0]+l[0][1])/d,(l[2][0]+l[0][2])/d]:x===2?[(l[2][0]-l[0][2])/d,(l[1][0]+l[0][1])/d,d/4,(l[2][1]+l[1][2])/d]:[(l[0][1]-l[1][0])/d,(l[2][0]+l[0][2])/d,(l[2][1]+l[1][2])/d,d/4]}var ce="means_step",A=128,C=c=>c.positions||"places";function he(c,e,s,t,i,o=()=>0){let r=e*256+s,a=i?0:c+(t-A)*(1<<o((r+c&65535)>>8));return{sum:a,place:r+a&65535}}function R(c){let e=c.rotation||"linear4";if(!(e in M))throw new Error("this file stores its rotations as '"+e+"', which this viewer does not read (it reads "+Object.keys(M).join(", ")+")");return M[e]}function H(c){let e=c.version===void 0?1:c.version;if(!(Number.isInteger(e)&&e>=1&&e<=E))throw new Error("this 4D video is format version "+e+"; this viewer reads versions 1 to "+E+" - update the viewer");for(let t of c.groups||[])R(t);let s=C(c);if(s!=="places"&&s!=="steps")throw new Error("this 4D video stores its positions as '"+s+"', which this viewer does not read (it reads places and steps)");if(s==="steps"&&(c.tracks||c.layout!=="luma"))throw new Error("this 4D video stores positions as steps in a layout this viewer reads them from one luma image only");return c}function $(c){let e={},s={},t=(i,o,r,a,h,u)=>{(e[i]=e[i]||[])[o]={s:r,x:a,y:h,c:u},(s[i]=s[i]||new Set).add(r)};if(c.tracks)c.tracks.forEach((i,o)=>{for(let r of i.tiles)t(r.plane,r.src,o,r.x,r.y,0)});else if(c.layout==="luma")for(let i of c.tiles)t(i.plane,i.src,0,i.x,i.y,0);else{let[i,o]=c.cell;for(let r of c.placement){let a=[r.cell%3*i,Math.floor(r.cell/3)*o];r.src.forEach((h,u)=>t(r.plane,h,0,a[0],a[1],r.dst[u]))}}return{by:e,uses:s}}var J=c=>`byteAt${c.s}(vec2u(${c.x}u, ${c.y}u) + xy, ${c.c}u)`;function ee(c,e){let s=new Set;for(let t of y[e])for(let i of c.uses[t]||[])s.add(i);return[...s].sort((t,i)=>t-i)}function te(c){return Q.map(e=>{let s=c.by[e]||[];return"fn pl_"+e+"(xy: vec2u) -> vec4u { return vec4u("+[0,1,2,3].map(t=>s[t]?J(s[t]):"0u").join(", ")+"); }"}).join(`
`)}function se(c,e){let s=$(c),t=C(c)==="steps",i=(c.groups||[]).some(a=>a.rotation==="disc"),o=t||i,r=[];for(let a=0;a<e;a++)r.push(`@group(0) @binding(${I(a)}) var mosaic${a}: texture_2d<f32>;
fn byteAt${a}(p: vec2u, c: u32) -> u32 { return u32(round(textureLoad(mosaic${a}, p, 0)[c] * 255.0)); }`);return`
struct Params {
  side: u32, count: u32, cbSide: u32, cbK: u32,
  coeffs: u32, qLevels: u32, oLevels: u32, rot: u32,           // rot: how the rotation plane is read (ROTATIONS)
  xyzMin: vec4f, xyzMax: vec4f, quatMin: vec4f, quatMax: vec4f, atlasMin: vec4f, atlasMax: vec4f,
  shn: vec4f,                    // codebook range (x, y) for Babylon's single-range centroids; opacity logit range (z, w)
};
@group(0) @binding(0) var<uniform> P: Params;
${r.join(`
`)}
@group(0) @binding(2) var oMeansL: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(3) var oMeansU: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var oScales: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(5) var oColors: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(6) var oQuats: texture_storage_2d<rgba16float, write>;
@group(0) @binding(7) var oLabels: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(8) var<storage, read_write> oPos: array<vec4f>;
@group(0) @binding(9) var oCent: texture_storage_2d<rgba16float, write>;
${t?`struct StepParams { key: u32, a: u32, b: u32, c: u32 };
@group(0) @binding(${z}) var<storage, read_write> stepSum: array<vec4i>;      // per splat: the steps added up since the key frame (x, y, z)
@group(0) @binding(${D}) var<uniform> SP: StepParams;`:""}
${o?`@group(0) @binding(${T}) var<storage, read> SZ: array<i32>;       // the group's whole-number tables (sizesTable)
// the log2 of the three radii of a splat's scale levels, in sixteenths of an octave
fn szScale(s: vec3u) -> vec3i { return vec3i(SZ[s.x], SZ[256u + s.y], SZ[512u + s.z]); }
// the bits a position step is stored coarser than a level: from the splat's middle radius and the high byte of the place the step starts from
fn stepShift(s: vec3u, hi: vec3u) -> vec3u {
  if (SZ[1793] == 0) { return vec3u(0u); }
  let t = szScale(s);
  let mid = max(min(t.x, t.y), min(max(t.x, t.y), t.z));
  let v = vec3i(mid + SZ[1792]) - vec3i(SZ[768u + hi.x], SZ[1024u + hi.y], SZ[1280u + hi.z]);
  return vec3u(clamp(v >> vec3u(4u), vec3i(0), vec3i(8)));      // (>> on a signed number keeps the sign: the floor of the division by 16)
}`:""}

// kissgs dequantisation of an 8-bit value quantised with 'levels' levels -> 0..1
fn lvl(b: u32, levels: u32) -> f32 {
  if (levels >= 256u) { return f32(b) / 255.0; }
  let q = f32(levels - 1u);
  return round(f32(b) * q / 255.0) / q;
}
${te(s)}

@compute @workgroup_size(${b})
fn splats(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= P.count) { return; }
  let xy = vec2u(i % P.side, i / P.side);
${t?`  // positions as steps: the place is this frame's anchor (the position planes) plus the sum the steps pass has just brought up to this frame
  let place = vec3u((vec3i(pl_means_bytes_1(xy).xyz * 256u + pl_means_bytes_0(xy).xyz) + stepSum[i].xyz) & vec3i(65535));
  let mL = vec4u(place & vec3u(255u), 0u);
  let mU = vec4u(place >> vec3u(8u), 0u);`:`  let mL = pl_means_bytes_0(xy);
  let mU = pl_means_bytes_1(xy);`}
  textureStore(oMeansL, xy, vec4f(vec3f(mL.xyz) / 255.0, 1.0));
  textureStore(oMeansU, xy, vec4f(vec3f(mU.xyz) / 255.0, 1.0));
  let n = mix(P.xyzMin.xyz, P.xyzMax.xyz, vec3f(mU.xyz * 256u + mL.xyz) / 65535.0);
  let o = pl_opacities(xy);
  // positions as Babylon's SOG shader computes them (log space); w = opacity (the sort reads x y z only; the viewer frames the camera on opaque splats)
  oPos[i] = vec4f(sign(n) * (exp(abs(n)) - vec3f(1.0)), 1.0 / (1.0 + exp(-mix(P.shn.z, P.shn.w, lvl(o.x, P.oLevels)))));

  let s = pl_scales(xy);
  textureStore(oScales, xy, vec4f(lvl(s.x, P.oLevels), lvl(s.y, P.oLevels), lvl(s.z, P.oLevels), 1.0));
  let f = pl_f_dc(xy);
  textureStore(oColors, xy, vec4f(lvl(f.x, P.oLevels), lvl(f.y, P.oLevels), lvl(f.z, P.oLevels), lvl(o.x, P.oLevels)));
}

${t?`// positions as steps: one frame's step into the sum - once for EVERY frame, in the order of the frames (a key frame sets the sum to zero)
@compute @workgroup_size(${b})
fn steps(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= P.count) { return; }
  if (SP.key != 0u) { stepSum[i] = vec4i(0); return; }
  let xy = vec2u(i % P.side, i / P.side);
  let st = pl_means_step(xy);
  // the step's unit: 2^k levels, k from this frame's scale levels and from where the step starts (this frame's anchor + the sum so far)
  let base = (vec3i(pl_means_bytes_1(xy).xyz * 256u + pl_means_bytes_0(xy).xyz) + stepSum[i].xyz) & vec3i(65535);
  let k = stepShift(pl_scales(xy).xyz, vec3u(base) >> vec3u(8u));
  stepSum[i] = stepSum[i] + vec4i((vec3i(st.xyz) - vec3i(${A})) << k, 0);
}
`:""}
${i?`// A DISC (rot 2; the trainer's cook/gsv4d_spec.py disc_decode): the plane holds the disc's normal as two octahedral coordinates at 7 bits and its spin - the
// angle of its longest axis in the normal's own tangent frame, a half turn in 256 steps, stored shifted down by the bits a nearly round disc drops. Which
// axis is the normal (the smallest radius), which the longest, and the spin's shift come from the splat's own scale levels through the size tables.
fn discQuat(qb: vec4u, sl: vec3u) -> vec4f {
  let t = szScale(sl);
  // the axes in the order of their radii, a tie: the lower index first (rank = how many axes come before this one)
  let r0 = u32(t.y < t.x) + u32(t.z < t.x);
  let r1 = u32(t.x <= t.y) + u32(t.z < t.y);
  let r2 = u32(t.x <= t.z) + u32(t.y <= t.z);
  var iN = 0u; var i2 = 0u; var i1 = 0u;
  if (r1 == 0u) { iN = 1u; } else if (r2 == 0u) { iN = 2u; }
  if (r1 == 1u) { i2 = 1u; } else if (r2 == 1u) { i2 = 2u; }
  if (r1 == 2u) { i1 = 1u; } else if (r2 == 2u) { i1 = 2u; }
  let k = u32(SZ[1536u + u32(clamp(t[i1] - t[i2], 0, 255))]);
  // the normal
  let uv = vec2f(qb.xy) / 127.0 * 2.0 - vec2f(1.0);
  let z = 1.0 - abs(uv.x) - abs(uv.y);
  let sx = select(-1.0, 1.0, uv.x >= 0.0);
  let sy = select(-1.0, 1.0, uv.y >= 0.0);
  let n = normalize(vec3f(select(uv.x, (1.0 - abs(uv.y)) * sx, z < 0.0), select(uv.y, (1.0 - abs(uv.x)) * sy, z < 0.0), z));
  // its two tangents (Duff et al. 2017; the seam at n.z = 0 is never met: no 7-bit pair lies on the diamond's edge)
  let s = select(-1.0, 1.0, n.z >= 0.0);
  let a = -1.0 / (s + n.z);
  let b = n.x * n.y * a;
  let t1 = vec3f(1.0 + s * n.x * n.x * a, s * b, -s * n.x);
  let t2 = vec3f(b, s + n.y * n.y * a, -n.y);
  let phi = f32((qb.z << k) % 256u) * 0.01227184630308513;      // pi / 256
  let a1 = cos(phi) * t1 + sin(phi) * t2;
  let a2 = cross(n, a1) * select(-1.0, 1.0, i2 == (i1 + 1u) % 3u);      // (longest, middle, normal) right-handed
  var c: array<vec3f, 3>;                                        // the rotation's columns: each axis where its radius is stored
  c[i1] = a1; c[i2] = a2; c[iN] = n;
  // the matrix -> the quaternion (w x y z), by the largest of the four squared components
  let m00 = c[0].x; let m11 = c[1].y; let m22 = c[2].z;
  let tr = vec4f(1.0 + m00 + m11 + m22, 1.0 + m00 - m11 - m22, 1.0 - m00 + m11 - m22, 1.0 - m00 - m11 + m22);
  var j = 0u;
  if (tr.y > tr[j]) { j = 1u; }
  if (tr.z > tr[j]) { j = 2u; }
  if (tr.w > tr[j]) { j = 3u; }
  let r = sqrt(max(tr[j], 1e-12)) * 2.0;
  // m[row][col] = c[col][row]
  if (j == 0u) { return vec4f(r / 4.0, (c[1].z - c[2].y) / r, (c[2].x - c[0].z) / r, (c[0].y - c[1].x) / r); }
  if (j == 1u) { return vec4f((c[1].z - c[2].y) / r, r / 4.0, (c[1].x + c[0].y) / r, (c[2].x + c[0].z) / r); }
  if (j == 2u) { return vec4f((c[2].x - c[0].z) / r, (c[1].x + c[0].y) / r, r / 4.0, (c[2].y + c[1].z) / r); }
  return vec4f((c[0].y - c[1].x) / r, (c[2].x + c[0].z) / r, (c[2].y + c[1].z) / r, r / 4.0);
}
`:""}// second pass over the splats (Babylon's device allows 4 storage textures per shader stage)
@compute @workgroup_size(${b})
fn splats2(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= P.count) { return; }
  let xy = vec2u(i % P.side, i / P.side);

  // the rotation plane -> Babylon's smallest-three: the largest component is left out (its index in alpha as 252 + index).
  // linear4 (rot 0): the plane holds the quaternion (w x y z), linear per component. smallest3 (rot 1): the plane IS smallest-three already - the three kept
  // components x sqrt 2 on -1 .. 1 (in their own order) and the dropped one's index as -1, -1/3, 1/3, 1 (Mogev3 cook/gsv4d_spec.py rot_encode).
  // disc (rot 2): the function above this pass, when a group states it.
  let qb = pl_quaternions(xy);
  var q = mix(P.quatMin, P.quatMax, vec4f(lvl(qb.x, P.qLevels), lvl(qb.y, P.qLevels), lvl(qb.z, P.qLevels), lvl(qb.w, P.qLevels)));
  var m = 0u;
  var abc: vec3f;
  if (P.rot == 1u) {
    m = u32(clamp(floor((q.w + 1.0) * 1.5 + 0.5), 0.0, 3.0));
    abc = q.xyz * 0.70710678118;
  } else {
${i?`    if (P.rot == 2u) { q = discQuat(qb, pl_scales(xy).xyz); }      // a disc: its quaternion, then as any other
`:""}    let len = length(q);
    q = select(vec4f(1.0, 0.0, 0.0, 0.0), q / len, len > 1e-12);
    let a = abs(q);
    if (a.y > a[m]) { m = 1u; }
    if (a.z > a[m]) { m = 2u; }
    if (a.w > a[m]) { m = 3u; }
    if (q[m] < 0.0) { q = -q; }
    if (m == 0u) { abc = q.yzw; } else if (m == 1u) { abc = vec3f(q.x, q.z, q.w); } else if (m == 2u) { abc = vec3f(q.x, q.y, q.w); } else { abc = q.xyz; }
  }
  textureStore(oQuats, xy, vec4f(abc * 0.70710678118 + vec3f(0.5), (252.0 + f32(m)) / 255.0));

  // codebook label (u, v) in the S x S grid -> index n = v * S + u, as two bytes
  let lb = pl_f_rest_labels(xy);
  let k = lb.y * P.cbSide + lb.x;
  textureStore(oLabels, xy, vec4f(f32(k & 255u) / 255.0, f32(k >> 8u) / 255.0, 0.0, 1.0));
}

// the codebook: tile t of the 5-wide atlas holds coefficient t of every centroid at (n % S, n / S); Babylon wants centroid n, coefficient t at
// ((n % 64) * coeffs + t, n / 64), one value range for all channels
@compute @workgroup_size(${b})
fn centroids(@builtin(global_invocation_id) gid: vec3u) {
  let j = gid.x;
  if (j >= P.cbK * P.coeffs) { return; }
  let n = j / P.coeffs;
  let t = j % P.coeffs;
  let S = P.cbSide;
  let c = pl_f_rest_centroids(vec2u((t % 5u) * S + n % S, (t / 5u) * S + n / S));
  let v = mix(P.atlasMin.xyz, P.atlasMax.xyz, vec3f(lvl(c.x, P.oLevels), lvl(c.y, P.oLevels), lvl(c.z, P.oLevels)));
  textureStore(oCent, vec2u((n % 64u) * P.coeffs + t, n / 64u), vec4f((v - vec3f(P.shn.x)) / (P.shn.y - P.shn.x), 1.0));
}
`}var L=6,ie=64,re=1;function j(c,e){return!c||c.arrived===void 0||c.complete||c.error?c&&c.error?Math.min(e,c.arrived||0):e:Math.min(e,c.arrived)}function ne(c,e,s,t){let i=j(c,e);return i>=e||c&&c.error?!0:i>=Math.min(e,s+2+Math.ceil(re*t))}var O=class{constructor(e,s,t){this.engine=e,this.scene=s,this.video=t,this.info=H(t.info),this.steps=C(this.info)==="steps",this._streams=(t.streams&&t.streams.length?t.streams:[{blocks:t.blocks,codec:t.codec,description:t.description,width:t.info.width,height:t.info.height,role:"all"}]).map((i,o)=>({k:o,blocks:i.blocks,codec:i.codec,description:i.description,width:i.width,height:i.height,role:i.role,dec:null,cfg:null,next:0,out:0,pending:[]})),this.count=t.complete===!1?this.info.frames:this._streams[0].blocks.length,this.fps=this.info.fps||30,this.rate=1,this.cached=!1,this.bounce=!1,this._dir=1,this.current=-1,this.playing=!1,this.loop=!0,this.onChange=null,this.slots=[],this.front=null,this.gpu=null,this._target=0,this._showTarget=-1,this._epoch=0,this._stats={decoded:0,converted:0,shown:0,late:0},this._busy={convert:0,read:0},this._disposed=!1,this.buffering=!1}there(){return j(this.video,this.count)}groupOf(e){let s=this.info.groups,t=0;for(;t+1<s.length&&s[t+1].firstFrame<=e;)t++;return t}async open(e){window.__gsvPlayer=this,this._sortMesh=e;let s=this.engine,t=this.info,i=t.groups[0],o=i.sidelen,r=o*o;if(t.groups.some(n=>n.sidelen!==o))throw new Error("All groups of a video must have the same number of splats.");this.n=r,this.side=o,this.coeffs=(i.shDegree+1)*(i.shDegree+1)-1,this.cbK=Math.max(...t.groups.map(n=>n.codebook.k));for(let n of this._streams)if(n.cfg={codec:n.codec,codedWidth:n.width,codedHeight:n.height,optimizeForLatency:!0},n.description&&(n.cfg.description=n.description),!(await VideoDecoder.isConfigSupported(n.cfg)).supported)throw new Error("This browser cannot decode "+n.cfg.codec+" at "+n.width+" x "+n.height+".");if(s.isWebGPU){if(!s._device)throw new Error("Playing a 3DGS video needs a WebGPU device, and this page has none.");this.gpu=new q(this)}else{let{WebGLBackend:n}=await import("./gsv-gl-IWDNCMWN.js");this.gpu=new n(this)}await this.gpu.init(),this.cached=!!this.video.cacheFrames&&!!s.isWebGPU&&this.count>1&&this.count<=ie&&!!(e&&e.__gpuSort);for(let n=0;n<(this.cached?this.count:L);n++)this.slots.push(Object.assign({k:n,state:"free",index:-1,group:-1,cbGroup:-1,pos:null,epoch:0},this.gpu.makeSlot(n)));for(let n of this._streams)n.dec=new VideoDecoder({output:p=>this._onOutput(n,p),error:p=>{if(this.error=p,console.error("gsv decoder ("+n.role+"):",p),this._firstFail){let f=this._firstFail;this._firstFail=null,f(new Error("the "+n.role+" video decoder failed: "+p.message))}}}),n.dec.configure(n.cfg);this.video.listen&&(this._unlisten=this.video.listen(()=>{this._pump(),this.onChange&&this.onChange(this.state())}));let a=new Promise((n,p)=>{this._firstDone=n,this._firstFail=p});this._showTarget=0,this._pump();let h=await a,u=Float32Array.from(h.pos);return this.mesh=e,this.sog={version:1,splatCount:r,shDegree:this.coeffs>0?i.shDegree:0,positions:u,meansTextureL:h.bt.meansL,meansTextureU:h.bt.meansU,scalesTexture:h.bt.scales,quatsTexture:h.bt.quats,sh0Texture:h.bt.colors,shCentroidsTexture:this.coeffs>0?h.bt.cent:void 0,shLabelsTexture:this.coeffs>0?h.bt.labels:void 0,shCoeffCount:this.coeffs,meansMin:[0,0,0],meansMax:[0,0,0],scalesMin:[0,0,0],scalesMax:[0,0,0],sh0Min:[0,0,0,0],sh0Max:[0,0,0,0],shnMin:0,shnMax:1},this._setRanges(h.group),e.setSogTextureData(this.sog),this._swap(h,!0),this._beforeRender=this.scene.onBeforeRenderObservable.add(()=>this._tick()),u}_setRanges(e){let s=this.info.groups[e],t=s.ranges,i=this.sog;i&&(i.meansMin=t.xyzMin.slice(),i.meansMax=t.xyzMax.slice(),i.scalesMin=t.scalesMin.slice(),i.scalesMax=t.scalesMax.slice(),i.sh0Min=[t.fdcMin[0],t.fdcMin[1],t.fdcMin[2],t.opacityMin[0]],i.sh0Max=[t.fdcMax[0],t.fdcMax[1],t.fdcMax[2],t.opacityMax[0]],i.shnMin=Math.min(...s.codebook.atlasMin),i.shnMax=Math.max(...s.codebook.atlasMax))}_pump(){if(this._disposed)return;let e=this.slots.filter(s=>s.state==="busy"||s.state==="ready").length;for(let s of this._streams){if(!s.dec||s.dec.state!=="configured")continue;let t=s.dec.decodeQueueSize+s.pending.length+e,i=this.there();for(;s.next<i&&s.dec.decodeQueueSize<3&&(this.cached||t<L);){let o=s.blocks[s.next];s.dec.decode(new EncodedVideoChunk({type:o.key?"key":"delta",timestamp:Math.round(1e3*o.time),data:o.data})),s.next++,t++}}}_onOutput(e,s){let t=e.out++;if(this._stats.decoded++,this._disposed||!this.steps&&!this.cached&&t<this._target){s.close(),this._pump();return}e.pending.push({f:s,i:t}),this._convertPending()}_convertPending(){for(;!this._disposed;){let e=this._streams[0].pending[0];if(!e||!this._streams.every(i=>i.pending.length&&i.pending[0].i===e.i))break;let s=this.cached&&this.slots[e.i].state!=="free";if(this.steps&&(s||!this.cached&&e.i<this._target)){let i=this._streams.map(o=>o.pending.shift().f);try{this.gpu.advance(i,e.i)}finally{for(let o of i)try{o.close()}catch{}}continue}let t=this.cached?this.slots[e.i]:this.slots.find(i=>i.state==="free");if(!t)break;if(s){for(let i of this._streams)i.pending.shift().f.close();continue}this._convert(t,this._streams.map(i=>i.pending.shift().f),e.i)}this._pump()}_convert(e,s,t){let i=this.groupOf(t);e.state="busy",e.index=t,e.group=i,e.epoch=this._epoch;let o=!!this._firstDone&&t===this._showTarget||!(this._sortMesh&&this._sortMesh.__gpuSort),r,a=performance.now();try{r=this.gpu.convert(e,s,i,o)}catch(u){r=Promise.reject(u)}finally{for(let u of s)try{u.close()}catch{}}this._busy.convert+=performance.now()-a;let h=e.epoch;r.then(u=>{if(e.pos=u,!this._disposed){if(!this.cached&&(h!==this._epoch||e.index<this._target)){e.state="free",e.pos=null,this._convertPending();return}if(e.state="ready",this._stats.converted++,this._firstDone&&e.index===this._showTarget){let n=this._firstDone;this._firstDone=null,this._firstFail=null,this._showTarget=-1,n(e);return}e.index===this._showTarget&&(this._showTarget=-1,this._swap(e))}},u=>{if(e.state="free",console.error("gsv convert:",u),this._firstFail){let n=this._firstFail;this._firstFail=null,n(u)}})}_swap(e,s){let t=this.mesh,i=this.front;if(this.front=e,e.state="front",i&&i!==e&&(i.state=this.cached?"ready":"free",i.pos=null),this.current=e.index,this._stats.shown++,t){if(!s){let r=e.bt;t._centersTexture=r.meansL,t._covariancesATexture=r.meansU,t._covariancesBTexture=r.scales,t._rotationsATexture=r.quats,t._colorsTexture=r.colors,this.coeffs>0&&(t._shTextures=[r.cent,r.labels]),Object.assign(this.sog,{meansTextureL:r.meansL,meansTextureU:r.meansU,scalesTexture:r.scales,quatsTexture:r.quats,sh0Texture:r.colors,shCentroidsTexture:this.coeffs>0?r.cent:void 0,shLabelsTexture:this.coeffs>0?r.labels:void 0}),this._setRanges(e.group)}let o=e.pos;if(e.pos=null,t.__gpuSort&&e.posBuf)t.__gpuSort.setPositions(e.posBuf);else if(o&&t._splatPositions&&t._splatPositions.length===o.length){if((!this.playing||s)&&t._splatPositions.set(o),t._worker&&t._worker.postMessage({command:"positionsUpdate",offset:0,data:o},[o.buffer]),t._cameraViewInfos)for(let h of t._cameraViewInfos.values())h.sortCameraPosition&&(h.sortCameraPosition.x=NaN);let r=this.scene.activeCamera;r&&(t.layerMask&r.layerMask)!==0&&(t._sortIsDirty=!0,t._canPostToWorker&&t._postToWorker(!0))}}this._convertPending(),this.onChange&&this.onChange(this.state())}_tick(){if(this.error&&(this.playing=!1),this._pump(),!this.playing||!(this.rate>0))return;let e=performance.now(),s=1e3/(this.fps*this.rate);if(e-this._lastShown<s-2)return;this.bounce&&this.cached&&this.loop&&this.count>1?(this.current+this._dir>=this.count||this.current+this._dir<0)&&(this._dir=-this._dir):this._dir=1;let i=this.current+this._dir;if(this._dir>0&&i<this.count&&i>=this.there()){this.buffering||(this.buffering=!0,this.onChange&&this.onChange(this.state()));return}if(this.buffering){if(!ne(this.video,this.count,this.current,this.fps))return;this.buffering=!1,this._lastShown=e-s,this.onChange&&this.onChange(this.state())}if(i>=this.count){this.loop&&this.count>1?this._showTarget!==0&&this.seek(0,!0):this.pause();return}let o=this.slots.find(r=>r.state==="ready"&&r.index===i);if(!o){this._stats.late++;return}this._lastShown=e-this._lastShown>2*s?e:this._lastShown+s,this._swap(o)}ready(e){if(e===this.current)return!0;if(this.cached){let s=this.slots[e];return!!s&&s.state==="ready"}return this.slots.some(s=>s.state==="ready"&&s.index===e)}state(){let e=this.video;return{frame:this.current,count:this.count,playing:this.playing,rate:this.rate,cached:this.cached,bounce:this.bounce&&this.cached,instant:this.info.instants?this.info.instants[Math.max(0,this.current)]:this.current,group:this.front?this.front.group:0,fps:this.fps,arrived:this.there(),complete:!e||e.arrived===void 0||!!e.complete,buffering:this.buffering,bytes:e&&e.bytes?{got:e.bytes.got,total:e.bytes.total}:null,error:e&&e.error?String(e.error.message||e.error):null}}play(){this.count<2||(this.current>=this.count-1&&!(this.bounce&&this.cached)&&this.seek(0,!0),this.playing=!0,this._lastShown=performance.now()-1e3/(this.fps*Math.max(this.rate,.001)),this.onChange&&this.onChange(this.state()))}pause(){this.playing=!1,this.onChange&&this.onChange(this.state())}seek(e,s){if(e=Math.max(0,Math.min(this.there()-1,Math.round(e))),s||(this.playing=!1),e===this.current){this.onChange&&this.onChange(this.state());return}if(this.cached){let a=this.slots[e];a.state==="ready"?(this._showTarget=-1,this._swap(a)):this._showTarget=e;return}let t=a=>{a.state==="ready"&&(a.state="free",a.pos=null)},i=this.slots.find(a=>a.state==="ready"&&a.index===e);if(i){this.slots.forEach(a=>{a.index<e&&t(a)}),this._target=Math.max(this._target,e),this._swap(i);return}let o=this._streams[0].blocks,r=e;for(;r>0&&!o[r].key;)r--;if(this._target=e,this._showTarget=e,r<=this.current&&e>this.current){if(this.slots.forEach(a=>{a.index<e&&t(a)}),!this.steps)for(let a of this._streams){for(let h of a.pending)h.i<e&&h.f.close();a.pending=a.pending.filter(h=>h.i>=e)}}else{this._epoch++,this.slots.forEach(t);for(let a of this._streams){for(let h of a.pending)h.f.close();a.pending=[],a.dec.reset(),a.dec.configure(a.cfg),a.next=r,a.out=r}}this._convertPending()}dispose(){this._disposed=!0,this.playing=!1,this._unlisten&&(this._unlisten(),this._unlisten=null),this._beforeRender&&this.scene.onBeforeRenderObservable.remove(this._beforeRender);for(let e of this._streams){for(let s of e.pending)s.f.close();e.pending=[];try{e.dec&&e.dec.state!=="closed"&&e.dec.close()}catch{}}this.mesh&&this.mesh.__gpuSort&&this.mesh.__gpuSort.setPositions(null);for(let e of this.slots)if(e!==this.front||!this.mesh)for(let s in e.bt)e.bt[s].dispose();try{this.gpu&&this.gpu.dispose(this.slots)}catch(e){console.error("gsv dispose:",e)}}},q=class{constructor(e){this.p=e,this.e=e.engine,this.dev=e.engine._device,this.paramsGroup=-1,this.mosaics=[]}async init(){let e=this.p,s=this.dev,t=e.info,i=GPUTextureUsage;this.mosaics=e._streams.map(n=>s.createTexture({size:[n.width,n.height],format:"rgba8unorm",usage:i.TEXTURE_BINDING|i.COPY_DST|i.COPY_SRC|i.RENDER_ATTACHMENT,label:"gsv mosaic "+n.k})),this.params=s.createBuffer({size:144,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,label:"gsv params"});let o=s.createShaderModule({code:se(t,e._streams.length),label:"gsv planes"}),a=(await o.getCompilationInfo()).messages.filter(n=>n.type==="error");if(a.length)throw new Error("gsv shader: "+a.map(n=>n.lineNum+": "+n.message).join("; "));this.pSplats=s.createComputePipeline({layout:"auto",compute:{module:o,entryPoint:"splats"},label:"gsv splats"}),this.pSplats2=s.createComputePipeline({layout:"auto",compute:{module:o,entryPoint:"splats2"},label:"gsv splats 2"}),this.pCent=s.createComputePipeline({layout:"auto",compute:{module:o,entryPoint:"centroids"},label:"gsv centroids"}),this.disc=(t.groups||[]).some(n=>n.rotation==="disc"),(e.steps||this.disc)&&(this.sizes=s.createBuffer({size:N*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,label:"gsv size tables"}));let h=$(t),u=this.mosaics.map(n=>n.createView());this.mosaicsFor=n=>ee(h,n).map(p=>({binding:I(p),resource:u[p]})),e.steps&&(this.stepSum=s.createBuffer({size:e.n*16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC,label:"gsv step sum"}),this.stepParams=s.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,label:"gsv step params"}),this.pSteps=s.createComputePipeline({layout:"auto",compute:{module:o,entryPoint:"steps"},label:"gsv steps"}),this.bgSteps=s.createBindGroup({layout:this.pSteps.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.params}},...this.mosaicsFor("steps"),{binding:z,resource:{buffer:this.stepSum}},{binding:D,resource:{buffer:this.stepParams}},{binding:T,resource:{buffer:this.sizes}}]}))}makeSlot(e){let s=this.p,t=this.dev,i=this.e,o=GPUTextureUsage,r=s.side,a=s.n,h=(_,m,w,S)=>t.createTexture({size:[_,m],format:w,usage:o.TEXTURE_BINDING|o.STORAGE_BINDING|o.COPY_SRC,label:"gsv "+S}),u=_=>{let m=i.wrapWebGPUTexture(_);return i.updateWrappedWebGPUTexture(m,_),new Y.BaseTexture(s.scene,m)},n={meansL:h(r,r,"rgba8unorm","meansL"),meansU:h(r,r,"rgba8unorm","meansU"),scales:h(r,r,"rgba8unorm","scales"),colors:h(r,r,"rgba8unorm","colors"),quats:h(r,r,"rgba16float","quats"),labels:h(r,r,"rgba8unorm","labels"),cent:h(64*Math.max(1,s.coeffs),Math.max(1,Math.ceil(s.cbK/64)),"rgba16float","centroids")},p=t.createBuffer({size:a*16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC,label:"gsv positions "+e}),f={t:n,posBuf:p,bt:{},staging:null,bg1:t.createBindGroup({layout:this.pSplats.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.params}},...this.mosaicsFor("splats"),{binding:2,resource:n.meansL.createView()},{binding:3,resource:n.meansU.createView()},{binding:4,resource:n.scales.createView()},{binding:5,resource:n.colors.createView()},{binding:8,resource:{buffer:p}},...s.steps?[{binding:z,resource:{buffer:this.stepSum}}]:[]]}),bg2:t.createBindGroup({layout:this.pSplats2.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.params}},...this.mosaicsFor("splats2"),{binding:6,resource:n.quats.createView()},{binding:7,resource:n.labels.createView()},...this.disc?[{binding:T,resource:{buffer:this.sizes}}]:[]]}),bgc:t.createBindGroup({layout:this.pCent.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.params}},...this.mosaicsFor("centroids"),{binding:9,resource:n.cent.createView()}]})};for(let _ in n)f.bt[_]=u(n[_]);return f}_writeParams(e){let s=this.p,t=s.info.groups[e],i=t.ranges,o=t.codebook,r=new ArrayBuffer(144),a=new Uint32Array(r),h=new Float32Array(r);a.set([s.side,s.n,o.side,o.k,s.coeffs,t.quatLevels,t.otherLevels,R(t)],0);let u=(n,p)=>{h.set([n[0],n[1]===void 0?0:n[1],n[2]===void 0?0:n[2],n[3]===void 0?0:n[3]],8+4*p)};u(i.xyzMin,0),u(i.xyzMax,1),u(i.quatMin,2),u(i.quatMax,3),u(o.atlasMin,4),u(o.atlasMax,5),u([Math.min(...o.atlasMin),Math.max(...o.atlasMax),i.opacityMin[0],i.opacityMax[0]],6),this.dev.queue.writeBuffer(this.params,0,r),this.sizes&&this.dev.queue.writeBuffer(this.sizes,0,X(t))}_addStep(e,s){let t=this.p;this.dev.queue.writeBuffer(this.stepParams,0,new Uint32Array([t._streams[0].blocks[s].key?1:0,0,0,0])),e.setPipeline(this.pSteps),e.setBindGroup(0,this.bgSteps),e.dispatchWorkgroups(Math.ceil(t.n/b))}advance(e,s){let t=this.p,i=this.dev,o=t.groupOf(s);o!==this.paramsGroup&&(this._writeParams(o),this.paramsGroup=o),t._streams.forEach((h,u)=>i.queue.copyExternalImageToTexture({source:e[u]},{texture:this.mosaics[u]},[h.width,h.height]));let r=i.createCommandEncoder({label:"gsv step "+s}),a=r.beginComputePass();this._addStep(a,s),a.end(),i.queue.submit([r.finish()])}convert(e,s,t,i=!0){let o=this.p,r=this.dev;t!==this.paramsGroup&&(this._writeParams(t),this.paramsGroup=t),o._streams.forEach((u,n)=>r.queue.copyExternalImageToTexture({source:s[n]},{texture:this.mosaics[n]},[u.width,u.height]));let a=r.createCommandEncoder({label:"gsv frame "+e.index}),h=a.beginComputePass();return o.steps&&this._addStep(h,e.index),h.setPipeline(this.pSplats),h.setBindGroup(0,e.bg1),h.dispatchWorkgroups(Math.ceil(o.n/b)),h.setPipeline(this.pSplats2),h.setBindGroup(0,e.bg2),h.dispatchWorkgroups(Math.ceil(o.n/b)),e.cbGroup!==t&&o.coeffs>0&&(h.setPipeline(this.pCent),h.setBindGroup(0,e.bgc),h.dispatchWorkgroups(Math.ceil(o.cbK*o.coeffs/b))),h.end(),e.cbGroup=t,i?(e.staging||(e.staging=r.createBuffer({size:o.n*16,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST,label:"gsv positions read "+e.k})),a.copyBufferToBuffer(e.posBuf,0,e.staging,0,o.n*16),r.queue.submit([a.finish()]),e.staging.mapAsync(GPUMapMode.READ).then(()=>{let u=performance.now(),n=new Float32Array(e.staging.getMappedRange().slice(0));return e.staging.unmap(),o._busy.read+=performance.now()-u,n})):(r.queue.submit([a.finish()]),r.queue.onSubmittedWorkDone().then(()=>null))}dispose(e){for(let s of e)s.staging&&s.state!=="busy"&&s.staging.destroy(),s.posBuf.destroy();for(let s of this.mosaics)s.destroy();this.params&&this.params.destroy(),this.stepSum&&this.stepSum.destroy(),this.stepParams&&this.stepParams.destroy(),this.sizes&&this.sizes.destroy()}};export{M as a,E as b,N as c,k as d,K as e,G as f,X as g,oe as h,ae as i,ce as j,A as k,C as l,he as m,R as n,H as o,$ as p,J as q,ee as r,se as s,re as t,j as u,ne as v,O as w};
