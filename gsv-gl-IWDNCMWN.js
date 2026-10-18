import{g as x,j as v,k as _,l as d,n as y,p as E}from"./chunk-AUM5PP7C.js";var b=globalThis.BABYLON,R=1<<18,S=["means_bytes_0","means_bytes_1","scales","f_dc","opacities","quaternions","f_rest_labels","f_rest_centroids",v],z=`#version 300 es
void main() {                                          // one triangle covering the target; no vertex data needed
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;function A(f,i){let e=E(f),s=n=>`byteAt${n.s}(ivec2(${n.x}, ${n.y}) + xy, ${n.c})`,t=[],o=[];for(let n=0;n<i;n++)t.push(`uniform sampler2D mosaic${n};`),o.push(`uint byteAt${n}(ivec2 p, int c) { return uint(roundEven(texelFetch(mosaic${n}, p, 0)[c] * 255.0)); }`);let a=S.map(n=>{let r=e.by[n]||[];return`uvec4 pl_${n}(ivec2 xy) { return uvec4(${[0,1,2,3].map(c=>r[c]?s(r[c]):"0u").join(", ")}); }`});return`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp isampler2D;
${t.join(`
`)}
uniform isampler2D uSum;                               // positions as steps: per splat the steps added up since the key frame (x, y, z)
uniform int uKey;                                      // the step pass's own word: is this frame a key frame
uniform ivec4 uI;                                      // side, codebook side, SH coefficients per colour, codebook entries
uniform ivec2 uL;                                      // quaternion levels, other levels
uniform int uRot;                                      // how the rotation plane is read: 0 linear4, 1 smallest3, 2 disc (gsv-player.js ROTATIONS)
uniform isampler2D uSizes;                             // the group's whole-number tables (gsv-player.js sizesTable), 256 wide: rows 0 - 2 scale_log2, 3 - 5
                                                       // level_log2, 6 spin_shift, 7: step_bias, 1 when the steps have units
uniform vec4 xyzMin, xyzMax, quatMin, quatMax, atlasMin, atlasMax;
uniform vec4 shn;                                      // codebook range (x, y) for Babylon's single-range centroids; opacity logit range (z, w)
${o.join(`
`)}
// kissgs dequantisation of an 8-bit value quantised with 'levels' levels -> 0..1 (the same arithmetic as the WGSL version)
float lvl(uint b, int levels) {
  if (levels >= 256) return float(b) / 255.0;
  float q = float(levels - 1);
  return roundEven(float(b) * q / 255.0) / q;
}
${a.join(`
`)}
int sz(int row, uint col) { return texelFetch(uSizes, ivec2(int(col), row), 0).r; }
// the log2 of the three radii of a splat's scale levels, in sixteenths of an octave
ivec3 szScale(uvec3 s) { return ivec3(sz(0, s.x), sz(1, s.y), sz(2, s.z)); }
// the bits a position step is stored coarser than a level (the WGSL stepShift, word for word)
ivec3 stepShift(uvec3 s, uvec3 hi) {
  if (sz(7, 1u) == 0) return ivec3(0);
  ivec3 t = szScale(s);
  int mid = max(min(t.x, t.y), min(max(t.x, t.y), t.z));
  ivec3 v = ivec3(mid + sz(7, 0u)) - ivec3(sz(3, hi.x), sz(4, hi.y), sz(5, hi.z));
  return clamp(v >> 4, ivec3(0), ivec3(8));              // (>> on a signed number keeps the sign: the floor of the division by 16)
}
`}var L=`
out ivec4 oSum;
void main() {
  ivec2 xy = ivec2(gl_FragCoord.xy);
  if (uKey != 0) { oSum = ivec4(0); return; }
  uvec4 st = pl_${v}(xy);
  ivec4 sum = texelFetch(uSum, xy, 0);
  // the step's unit: 2^k levels, k from this frame's scale levels and from where the step starts (this frame's anchor + the sum so far)
  ivec3 base = (ivec3(pl_means_bytes_1(xy).xyz * 256u + pl_means_bytes_0(xy).xyz) + sum.xyz) & 65535;
  ivec3 k = stepShift(pl_scales(xy).xyz, uvec3(base) >> 8u);
  oSum = sum + ivec4((ivec3(st.xyz) - ivec3(${_})) << k, 0);
}`,P=f=>`
layout(location = 0) out vec4 oMeansL;
layout(location = 1) out vec4 oMeansU;
layout(location = 2) out vec4 oScales;
layout(location = 3) out vec4 oColors;
layout(location = 4) out vec4 oPos;
void main() {
  ivec2 xy = ivec2(gl_FragCoord.xy);                   // row y of the target = row y of the planes, as in the WebGPU path
${f?`  // positions as steps: the place is this frame's anchor (the position planes) plus the sum the step pass has just brought up to this frame
  uvec3 place = uvec3((ivec3(pl_means_bytes_1(xy).xyz * 256u + pl_means_bytes_0(xy).xyz) + texelFetch(uSum, xy, 0).xyz) & 65535);
  uvec4 mL = uvec4(place & 255u, 0u);
  uvec4 mU = uvec4(place >> 8u, 0u);`:`  uvec4 mL = pl_means_bytes_0(xy);
  uvec4 mU = pl_means_bytes_1(xy);`}
  oMeansL = vec4(vec3(mL.xyz) / 255.0, 1.0);
  oMeansU = vec4(vec3(mU.xyz) / 255.0, 1.0);
  vec3 n = mix(xyzMin.xyz, xyzMax.xyz, vec3(mU.xyz * 256u + mL.xyz) / 65535.0);
  uvec4 o = pl_opacities(xy);
  // positions as Babylon's SOG shader computes them (log space); w = opacity (the sort reads x y z only; the viewer frames the camera on opaque splats)
  oPos = vec4(sign(n) * (exp(abs(n)) - vec3(1.0)), 1.0 / (1.0 + exp(-mix(shn.z, shn.w, lvl(o.x, uL.y)))));
  uvec4 s = pl_scales(xy);
  oScales = vec4(lvl(s.x, uL.y), lvl(s.y, uL.y), lvl(s.z, uL.y), 1.0);
  uvec4 f = pl_f_dc(xy);
  oColors = vec4(lvl(f.x, uL.y), lvl(f.y, uL.y), lvl(f.z, uL.y), lvl(o.x, uL.y));
}`,M=`
layout(location = 0) out vec4 oQuats;
layout(location = 1) out vec4 oLabels;
// A DISC (uRot 2; the WGSL discQuat, word for word): the normal as two octahedral coordinates at 7 bits and the spin, read with the splat's own scale levels
vec4 discQuat(uvec4 qb, uvec3 sl) {
  ivec3 t = szScale(sl);
  int r0 = int(t.y < t.x) + int(t.z < t.x);
  int r1 = int(t.x <= t.y) + int(t.z < t.y);
  int r2 = int(t.x <= t.z) + int(t.y <= t.z);
  int iN = 0, i2 = 0, i1 = 0;
  if (r1 == 0) iN = 1; else if (r2 == 0) iN = 2;
  if (r1 == 1) i2 = 1; else if (r2 == 1) i2 = 2;
  if (r1 == 2) i1 = 1; else if (r2 == 2) i1 = 2;
  uint k = uint(sz(6, uint(clamp(t[i1] - t[i2], 0, 255))));
  vec2 uv = vec2(qb.xy) / 127.0 * 2.0 - vec2(1.0);
  float z = 1.0 - abs(uv.x) - abs(uv.y);
  float sx = uv.x >= 0.0 ? 1.0 : -1.0, sy = uv.y >= 0.0 ? 1.0 : -1.0;
  vec3 n = normalize(vec3(z < 0.0 ? (1.0 - abs(uv.y)) * sx : uv.x, z < 0.0 ? (1.0 - abs(uv.x)) * sy : uv.y, z));
  float s = n.z >= 0.0 ? 1.0 : -1.0;
  float a = -1.0 / (s + n.z);
  float b = n.x * n.y * a;
  vec3 t1 = vec3(1.0 + s * n.x * n.x * a, s * b, -s * n.x);
  vec3 t2 = vec3(b, s + n.y * n.y * a, -n.y);
  float phi = float((qb.z << k) % 256u) * 0.01227184630308513;      // pi / 256
  vec3 a1 = cos(phi) * t1 + sin(phi) * t2;
  vec3 a2 = cross(n, a1) * (i2 == (i1 + 1) % 3 ? 1.0 : -1.0);
  vec3 c[3];
  c[i1] = a1; c[i2] = a2; c[iN] = n;
  float m00 = c[0].x, m11 = c[1].y, m22 = c[2].z;
  vec4 tr = vec4(1.0 + m00 + m11 + m22, 1.0 + m00 - m11 - m22, 1.0 - m00 + m11 - m22, 1.0 - m00 - m11 + m22);
  int j = 0;
  if (tr.y > tr[j]) j = 1;
  if (tr.z > tr[j]) j = 2;
  if (tr.w > tr[j]) j = 3;
  float r = sqrt(max(tr[j], 1e-12)) * 2.0;
  if (j == 0) return vec4(r / 4.0, (c[1].z - c[2].y) / r, (c[2].x - c[0].z) / r, (c[0].y - c[1].x) / r);
  if (j == 1) return vec4((c[1].z - c[2].y) / r, r / 4.0, (c[1].x + c[0].y) / r, (c[2].x + c[0].z) / r);
  if (j == 2) return vec4((c[2].x - c[0].z) / r, (c[1].x + c[0].y) / r, r / 4.0, (c[2].y + c[1].z) / r);
  return vec4((c[0].y - c[1].x) / r, (c[2].x + c[0].z) / r, (c[2].y + c[1].z) / r, r / 4.0);
}
void main() {
  ivec2 xy = ivec2(gl_FragCoord.xy);
  // the rotation plane -> Babylon's smallest-three: the largest component is left out (its index in alpha as 252 + index).
  // linear4 (uRot 0): the quaternion (w x y z), linear per component. smallest3 (uRot 1): the plane is smallest-three already - the three kept components
  // x sqrt 2 on -1 .. 1 and the dropped one's index as -1, -1/3, 1/3, 1 (the same arithmetic as the WGSL version)
  uvec4 qb = pl_quaternions(xy);
  vec4 q = mix(quatMin, quatMax, vec4(lvl(qb.x, uL.x), lvl(qb.y, uL.x), lvl(qb.z, uL.x), lvl(qb.w, uL.x)));
  int m = 0;
  vec3 abc;
  if (uRot == 1) {
    m = int(clamp(floor((q.w + 1.0) * 1.5 + 0.5), 0.0, 3.0));
    abc = q.xyz * 0.70710678118;
  } else {
    if (uRot == 2) q = discQuat(qb, pl_scales(xy).xyz);    // a disc: its quaternion, then as any other
    float len = length(q);
    q = len > 1e-12 ? q / len : vec4(1.0, 0.0, 0.0, 0.0);
    vec4 a = abs(q);
    if (a.y > a[m]) m = 1;
    if (a.z > a[m]) m = 2;
    if (a.w > a[m]) m = 3;
    if (q[m] < 0.0) q = -q;
    if (m == 0) abc = q.yzw; else if (m == 1) abc = vec3(q.x, q.z, q.w); else if (m == 2) abc = vec3(q.x, q.y, q.w); else abc = q.xyz;
  }
  oQuats = vec4(abc * 0.70710678118 + vec3(0.5), (252.0 + float(m)) / 255.0);
  // codebook label (u, v) in the S x S grid -> index n = v * S + u, as two bytes
  uvec4 lb = pl_f_rest_labels(xy);
  uint k = lb.y * uint(uI.y) + lb.x;
  oLabels = vec4(float(k & 255u) / 255.0, float(k >> 8u) / 255.0, 0.0, 1.0);
}`,w=`
out vec4 oCent;
void main() {
  // Babylon wants centroid n, coefficient t at ((n % 64) * coeffs + t, n / 64); tile t of the 5-wide atlas holds coefficient t of entry n at (n % S, n / S)
  ivec2 p = ivec2(gl_FragCoord.xy);
  int coeffs = uI.z, S = uI.y;
  int n = p.y * 64 + p.x / coeffs, t = p.x % coeffs;
  if (n >= uI.w) { oCent = vec4(0.0); return; }
  uvec4 c = pl_f_rest_centroids(ivec2((t % 5) * S + n % S, (t / 5) * S + n / S));
  vec3 v = mix(atlasMin.xyz, atlasMax.xyz, vec3(lvl(c.x, uL.y), lvl(c.y, uL.y), lvl(c.z, uL.y)));
  oCent = vec4((v - vec3(shn.x)) / (shn.y - shn.x), 1.0);
}`;function F(f,i){let e=A(f,i),s=d(f)==="steps";return{pass1:e+P(s),pass2:e+M,pass3:e+w,step:s?e+L:null}}var T=class{constructor(i){this.p=i,this.e=i.engine,this.gl=i.engine._gl,this.mosaics=[],this.sum=null,this.sumAt=0,this.sizes=[],this.disposed=!1}async init(){let i=this.gl,e=this.p;if(!i||!(i instanceof WebGL2RenderingContext))throw new Error("Playing a 3DGS video on WebGL needs WebGL2.");if(!i.getExtension("EXT_color_buffer_float"))throw new Error("Playing a 3DGS video on WebGL needs float render targets (EXT_color_buffer_float).");let s=F(e.info,e._streams.length);this.progs=[s.pass1,s.pass2,s.pass3].map((t,o)=>this._program(t,"pass "+(o+1))),this.vao=i.createVertexArray(),e.steps&&(this.stepProg=this._program(s.step,"the step pass"),this.sum=[0,1].map(()=>{let t=this._texture(e.side,e.side,i.RGBA32I);return{tex:t,fbo:this._fbo([t])}})),this.mosaics=e._streams.map(()=>{let t=i.createTexture();return i.bindTexture(i.TEXTURE_2D,t),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,i.NEAREST),t}),this._restore()}_program(i,e){let s=this.gl,t=(n,r)=>{let c=s.createShader(n);if(s.shaderSource(c,r),s.compileShader(c),!s.getShaderParameter(c,s.COMPILE_STATUS))throw new Error("gsv WebGL "+e+": "+s.getShaderInfoLog(c));return c},o=s.createProgram();if(s.attachShader(o,t(s.VERTEX_SHADER,z)),s.attachShader(o,t(s.FRAGMENT_SHADER,i)),s.linkProgram(o),!s.getProgramParameter(o,s.LINK_STATUS))throw new Error("gsv WebGL "+e+": "+s.getProgramInfoLog(o));let a={};for(let n of["uI","uL","uRot","xyzMin","xyzMax","quatMin","quatMax","atlasMin","atlasMax","shn","uSum","uKey","uSizes"])a[n]=s.getUniformLocation(o,n);return a.mosaic=this.p._streams.map((n,r)=>s.getUniformLocation(o,"mosaic"+r)),{prog:o,u:a}}_texture(i,e,s){let t=this.gl,o=t.createTexture();return t.bindTexture(t.TEXTURE_2D,o),t.texStorage2D(t.TEXTURE_2D,1,s,i,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),o}_fbo(i){let e=this.gl,s=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,s),i.forEach((o,a)=>e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+a,e.TEXTURE_2D,o,0)),e.drawBuffers(i.map((o,a)=>e.COLOR_ATTACHMENT0+a));let t=e.checkFramebufferStatus(e.FRAMEBUFFER);if(t!==e.FRAMEBUFFER_COMPLETE)throw new Error("gsv WebGL: render targets incomplete ("+t+")");return s}makeSlot(i){let e=this.gl,s=this.p,t=this.e,o=s.side,a=64*Math.max(1,s.coeffs),n=Math.max(1,Math.ceil(s.cbK/64)),r={meansL:this._texture(o,o,e.RGBA8),meansU:this._texture(o,o,e.RGBA8),scales:this._texture(o,o,e.RGBA8),colors:this._texture(o,o,e.RGBA8),quats:this._texture(o,o,e.RGBA16F),labels:this._texture(o,o,e.RGBA8),cent:this._texture(a,n,e.RGBA16F)},c=this._texture(o,o,e.RGBA32F),l={t:r,posTex:c,cent:[a,n],fbo1:this._fbo([r.meansL,r.meansU,r.scales,r.colors,c]),fbo2:this._fbo([r.quats,r.labels]),fboC:this._fbo([r.cent]),fboRead:this._fbo([c]),pbo:e.createBuffer(),bt:{}};e.bindBuffer(e.PIXEL_PACK_BUFFER,l.pbo),e.bufferData(e.PIXEL_PACK_BUFFER,s.n*16,e.STREAM_READ),e.bindBuffer(e.PIXEL_PACK_BUFFER,null);let u={cent:[a,n]};for(let m in r){let[p,h]=u[m]||[o,o];l.bt[m]=new b.BaseTexture(s.scene,t.wrapWebGLTexture(r[m],!1,b.Constants.TEXTURE_NEAREST_SAMPLINGMODE,p,h))}return this._restore(),l}_restore(){let i=this.gl,e=this.e;i.bindVertexArray(null),i.bindFramebuffer(i.FRAMEBUFFER,e._currentFramebuffer||null),i.bindBuffer(i.PIXEL_PACK_BUFFER,null),i.activeTexture(i.TEXTURE0),e.wipeCaches(!0)}_uniforms(i,e){let s=this.gl,t=this.p,o=t.info.groups[e],a=o.ranges,n=o.codebook,r=i.u,c=(l,u)=>s.uniform4f(l,u[0],u[1]===void 0?0:u[1],u[2]===void 0?0:u[2],u[3]===void 0?0:u[3]);if(s.uniform4i(r.uI,t.side,n.side,t.coeffs,n.k),s.uniform2i(r.uL,o.quatLevels,o.otherLevels),s.uniform1i(r.uRot,y(o)),c(r.xyzMin,a.xyzMin),c(r.xyzMax,a.xyzMax),c(r.quatMin,a.quatMin),c(r.quatMax,a.quatMax),c(r.atlasMin,n.atlasMin),c(r.atlasMax,n.atlasMax),c(r.shn,[Math.min(...n.atlasMin),Math.max(...n.atlasMax),a.opacityMin[0],a.opacityMax[0]]),r.mosaic.forEach((l,u)=>{l&&s.uniform1i(l,u)}),r.uSizes){let l=t._streams.length+1;s.activeTexture(s.TEXTURE0+l),s.bindTexture(s.TEXTURE_2D,this._sizes(e)),s.uniform1i(r.uSizes,l)}if(r.uSum&&this.sum){let l=t._streams.length;s.activeTexture(s.TEXTURE0+l),s.bindTexture(s.TEXTURE_2D,this.sum[this.sumAt].tex),s.uniform1i(r.uSum,l)}}_sizes(i){if(!this.sizes[i]){let e=this.gl,s=x(this.p.info.groups[i]),t=new Int32Array(256*8);t.set(s.subarray(0,1792),0),t[7*256]=s[1792],t[7*256+1]=s[1793];let o=this._texture(256,8,e.R32I);e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.texSubImage2D(e.TEXTURE_2D,0,0,0,256,8,e.RED_INTEGER,e.INT,t),this.sizes[i]=o}return this.sizes[i]}_draw(i,e,s,t,o){let a=this.gl;a.useProgram(i.prog),this._uniforms(i,o),a.bindFramebuffer(a.FRAMEBUFFER,e),a.viewport(0,0,s,t),a.drawArrays(a.TRIANGLES,0,3)}_upload(i){let e=this.gl;e.bindBuffer(e.PIXEL_UNPACK_BUFFER,null),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.NONE),i.forEach((s,t)=>{e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,this.mosaics[t]),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE,s)}),e.disable(e.BLEND),e.disable(e.DEPTH_TEST),e.disable(e.STENCIL_TEST),e.disable(e.CULL_FACE),e.disable(e.SCISSOR_TEST),e.colorMask(!0,!0,!0,!0),e.bindVertexArray(this.vao)}_addStep(i,e){let s=this.gl,t=this.p,o=1-this.sumAt;s.useProgram(this.stepProg.prog),s.uniform1i(this.stepProg.u.uKey,t._streams[0].blocks[i].key?1:0),this._draw(this.stepProg,this.sum[o].fbo,t.side,t.side,e),this.sumAt=o}advance(i,e){try{this._upload(i),this._addStep(e,this.p.groupOf(e))}finally{this._restore()}}convert(i,e,s){let t=this.gl,o=this.p;try{this._upload(e),o.steps&&this._addStep(i.index,s),this._draw(this.progs[0],i.fbo1,o.side,o.side,s),this._draw(this.progs[1],i.fbo2,o.side,o.side,s),i.cbGroup!==s&&o.coeffs>0&&this._draw(this.progs[2],i.fboC,i.cent[0],i.cent[1],s),i.cbGroup=s,t.bindFramebuffer(t.FRAMEBUFFER,i.fboRead),t.readBuffer(t.COLOR_ATTACHMENT0),t.bindBuffer(t.PIXEL_PACK_BUFFER,i.pbo),t.readPixels(0,0,o.side,o.side,t.RGBA,t.FLOAT,0)}finally{this._restore()}let a=t.fenceSync(t.SYNC_GPU_COMMANDS_COMPLETE,0);return t.flush(),new Promise((n,r)=>{let c=new Float32Array(o.n*4),l=c.length,u=0,m=()=>{if(this.disposed){r(new Error("the player was closed"));return}let h=Math.min(R,l-u),g=performance.now();t.bindBuffer(t.PIXEL_PACK_BUFFER,i.pbo),t.getBufferSubData(t.PIXEL_PACK_BUFFER,u*4,c,u,h),t.bindBuffer(t.PIXEL_PACK_BUFFER,null),o._busy.read+=performance.now()-g,u+=h,u<l?setTimeout(m,0):n(c)},p=()=>{if(this.disposed){t.deleteSync(a),r(new Error("the player was closed"));return}let h=t.clientWaitSync(a,0,0);if(h===t.WAIT_FAILED){t.deleteSync(a),r(new Error("the GPU read-back failed"));return}if(h===t.TIMEOUT_EXPIRED){setTimeout(p,1);return}t.deleteSync(a),m()};setTimeout(p,1)})}dispose(i){this.disposed=!0;let e=this.gl;for(let s of i){for(let t of[s.fbo1,s.fbo2,s.fboC,s.fboRead])e.deleteFramebuffer(t);e.deleteBuffer(s.pbo),e.deleteTexture(s.posTex)}for(let s of this.mosaics)e.deleteTexture(s);for(let s of this.sum||[])e.deleteFramebuffer(s.fbo),e.deleteTexture(s.tex);for(let s of[...this.progs||[],...this.stepProg?[this.stepProg]:[]])e.deleteProgram(s.prog);this.vao&&e.deleteVertexArray(this.vao),this._restore()}};export{T as WebGLBackend,F as glslCode};
