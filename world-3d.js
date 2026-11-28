import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';

const canvas = document.getElementById('w-3d');
const host = document.getElementById('world');
if (!canvas || !host) throw new Error('3D world mount not found');

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: false, powerPreference: 'high-performance'});
renderer.setClearColor(0x000000, 1); // opaque black: with mix-blend-mode screen, empty areas show the scene art and objects additively lighten it
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 1.2, 10);
const root = new THREE.Group();
scene.add(root);

const palette = {
  orange: 0xe2561a, amber: 0xffb45a, teal: 0x2fe0c4, pink: 0xf5abc7,
  cream: 0xf5f0e6, blue: 0x123fce, green: 0x204c39, dusk: 0x6b2a4f,
  ink: 0x111827, sky: 0x75c5ff
};
const mat = (color, roughness=.48, metalness=.08, emissive=0, intensity=0) => new THREE.MeshStandardMaterial({color, roughness, metalness, emissive, emissiveIntensity:intensity});
const glow = (color, intensity=3) => new THREE.MeshBasicMaterial({color, transparent:true, opacity:.9});
const groups = {};
const makeGroup = name => { const g = new THREE.Group(); g.name = name; groups[name] = g; root.add(g); return g; };

function box(g, size, material, pos, rot=[0,0,0], bevel=.08) {
  const geo = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(...pos); mesh.rotation.set(...rot); mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh); return mesh;
}
function sphere(g, radius, material, pos) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 20), material);
  mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh;
}
function torus(g, radius, tube, material, pos, rot=[0,0,0]) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 16, 64), material);
  mesh.position.set(...pos); mesh.rotation.set(...rot); mesh.castShadow = true; g.add(mesh); return mesh;
}
function textlessCard(g, color, pos, scale=1) {
  const card = box(g, [2.3*scale, 1.45*scale, .08], mat(color, .32), pos, [0.08,-.22,.08]);
  box(g, [1.75*scale,.06,.02], mat(palette.cream,.8), [pos[0],pos[1]+.25,pos[2]+.06], [0,-.22,.08]);
  box(g, [1.25*scale,.06,.02], mat(palette.cream,.8), [pos[0]-.25*scale,pos[1]-.03,pos[2]+.06], [0,-.22,.08]);
  return card;
}

// DESK: a complete miniature studio desk with monitor, mug, lamp and floating geometry.
const desk = makeGroup('desk');
box(desk, [7,.35,3], mat(0x5b2c1b), [0,-2.0,0]);
box(desk, [6.5,.16,2.6], mat(0xa96735,.55), [0,-1.78,0]);
box(desk, [2.9,1.8,.18], mat(0x171c27,.25,.35), [0,.05,.1], [0,-.05,0]);
box(desk, [2.55,1.45,.04], mat(0x142e37,.2,.3,palette.teal,.25), [0,.08,.19], [0,-.05,0]);
box(desk, [.16,1.1,.16], mat(0x2b3038), [0,-.95,.1]);
box(desk, [1.6,.12,.9], mat(0x272d37), [0,-1.55,.1]);
box(desk, [.08,1.2,.08], mat(palette.amber,.35,.2), [-2.35,-.95,.25], [0,0,.05]);
torus(desk, .55, .08, mat(palette.orange,.3,.25), [-2.35,.15,.25], [Math.PI/2,0,0]);
sphere(desk, .42, mat(0x9c4b1c,.4), [1.95,-1.2,.35]);
torus(desk, .32, .09, mat(0xd4793a,.4), [2.28,-1.18,.35], [0,Math.PI/2,0]);
box(desk, [.6,.12,1.8], mat(palette.orange,.45), [2.55,-.75,-.1]);
sphere(desk, .72, mat(palette.amber,.18,.08,palette.orange,.2), [-3.2,.6,-.4]);
textlessCard(desk, palette.pink, [2.55,1.1,.1], .75);
box(desk, [1.1,.9,1.1], mat(palette.pink,.32), [-2.6,.65,.2], [.3,.4,.2]);

// BUILD: glowing network, terminals and a rotating wireframe cube.
const build = makeGroup('build');
const wireMat = new THREE.LineBasicMaterial({color:palette.teal, transparent:true, opacity:.8});
const cubeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.8,2.8,2.8));
const wire = new THREE.LineSegments(cubeGeo, wireMat); wire.position.set(0,.2,0); build.add(wire);
const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.72,1), mat(palette.teal,.2,.4,palette.teal,.55)); inner.position.set(0,.2,0); build.add(inner);
const nodes = [];
for(let i=0;i<12;i++) {
  const a = i/12*Math.PI*2, radius = 2.8 + (i%2)*.55;
  const n = sphere(build, .09, mat(palette.cream,.2,.1,palette.teal,.8), [Math.cos(a)*radius, Math.sin(a*1.7)*1.15, Math.sin(a)*radius*.48]);
  nodes.push(n);
}
for(let i=0;i<nodes.length;i++) {
  const points = [nodes[i].position.clone(), nodes[(i+1)%nodes.length].position.clone()];
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({color:palette.teal,transparent:true,opacity:.27})); build.add(line);
}
box(build, [3.2,1.2,.12], mat(0x031a20,.3,.25,palette.teal,.2), [0,-2.15,.1], [.12,0,0]);
box(build, [2.6,.06,.03], mat(palette.teal,.4,.1,palette.teal,.6), [0,-1.88,.2]);
box(build, [1.8,.06,.03], mat(palette.teal,.4,.1,palette.teal,.6), [-.35,-2.05,.2]);

// LIFE: low-poly landscape, sun and layered floating photographs.
const life = makeGroup('life');
const ground = new THREE.Mesh(new THREE.PlaneGeometry(16,10), mat(0xe0731a,.9)); ground.rotation.x=-Math.PI/2; ground.position.y=-2.15; ground.receiveShadow=true; life.add(ground);
sphere(life, 1.05, mat(0xffb134,.28,.05,0xff8a32,.35), [3.2,2.0,-1]);
const mountainMat = mat(0x2c6e8c,.9);
for (let i=0;i<4;i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(1.5+i*.35, 3+i*.35, 4), mountainMat); m.position.set(-3+i*1.8,-.75,-1.7); m.rotation.y=Math.PI/4; m.castShadow=true; life.add(m); }
textlessCard(life, 0xfffaf0, [-2.9,.75,.4], .9); textlessCard(life, 0xfffaf0, [2.5,-.1,1.2], .75);
torus(life, .85, .05, mat(palette.cream,.8), [-2.9,.75,.48], [0,0,0]);

// HELLO: a dusk portal with stars, moon and luminous rings.
const hello = makeGroup('hello');
const moon = sphere(hello, 1.15, mat(palette.pink,.45,.05,palette.pink,.18), [3,1.8,-.8]);
for(let i=0;i<3;i++) torus(hello, 2.0+i*.35, .035, new THREE.MeshBasicMaterial({color:i===1?palette.orange:palette.pink,transparent:true,opacity:.55-i*.1}), [0,.3,0], [Math.PI/2.35+i*.1,.2+i*.2,.2]);
for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2, r=3+Math.random()*4; const s=sphere(hello, .025+Math.random()*.045, glow(palette.cream), [Math.cos(a)*r,Math.sin(a)*r*.55-.3,-1-Math.random()*2]); s.userData.phase=Math.random()*6.28;}
box(hello,[2.4,.08,.04],new THREE.MeshBasicMaterial({color:palette.pink,transparent:true,opacity:.7}),[0,-1.3,.2]);

const hemi = new THREE.HemisphereLight(0xffe1bc, 0x101328, 2.2); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffc47b, 4); key.position.set(4,7,6); key.castShadow=true; key.shadow.mapSize.set(1024,1024); scene.add(key);
const fill = new THREE.PointLight(palette.teal, 2.5, 14); fill.position.set(-4,2,4); scene.add(fill);

let width=innerWidth, height=innerHeight, pointerX=0, pointerY=0, targetX=0, targetY=0, current=0;
function resize(){width=innerWidth;height=innerHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=width<700?14.5:10;camera.updateProjectionMatrix();}
function pointer(e){pointerX=(e.clientX/width-.5)*2;pointerY=(e.clientY/height-.5)*2;}
addEventListener('resize',resize); addEventListener('pointermove',pointer,{passive:true}); resize();
function sceneIndex(){
  if(!document.body.classList.contains('w-on')) return -1;
  const ids=['about','work','life','contact']; let best=-1, distance=Infinity;
  ids.forEach((id,i)=>{const r=document.getElementById(id)?.getBoundingClientRect(); if(!r)return; const d=Math.abs(r.top+Math.min(r.height,height)*.5-height*.5); if(r.top<height*.7&&r.bottom>height*.3&&d<distance){best=i;distance=d;}});
  return best;
}
function activate(i){['desk','build','life','hello'].forEach((name,n)=>{groups[name].visible=n===i;});}
function animate(t=0){requestAnimationFrame(animate); const index=sceneIndex(); current += ((index>=0?index:-1)-current)*.06; if(index<0 && current<=-0.95){activate(-1); return;} const i=Math.round(current); activate(i);
  targetX=reduce?0:pointerX; targetY=reduce?0:pointerY;
  root.rotation.y += ((targetX*.12)-root.rotation.y)*.04; root.rotation.x += ((-targetY*.07)-root.rotation.x)*.04;
  camera.position.x += (targetX*.7-camera.position.x)*.025; camera.position.y += (1.2-targetY*.35-camera.position.y)*.025;
  if(!reduce){wire.rotation.x=t*.00035;wire.rotation.y=t*.00055;inner.rotation.y=-t*.0008;groups.life.rotation.y=Math.sin(t*.00025)*.08;groups.hello.rotation.y=Math.sin(t*.0002)*.06;moon.position.y=1.8+Math.sin(t*.001)*.12;}
  hello.children.forEach((o,n)=>{if(o.userData.phase)o.position.y+=Math.sin(t*.001+o.userData.phase)*.0007;});
  renderer.render(scene,camera);
}
activate(-1); animate();
