/** Three.js procedural birthday cake. Real 3D geometry, interactive orbit, arbitrary-azimuth radial wedge slice. */
export async function createCake(container,{photo,onCutProgress}){
 let THREE;try{THREE=await import('/vendor/three.module.js').catch(()=>import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js'))}catch(e){console.warn('Three.js could not be loaded (internet needed for CDN):',e);return{is3d:false,setCandles(){},setStyle(){},resetCut(){onCutProgress(0)},makeCut(){this.c=(this.c||0)+.5;onCutProgress(Math.min(1,this.c))},serveSlice(){},setMode(){}}}
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(39,1,.1,100);camera.position.set(0,4.1,8.2);camera.lookAt(0,1.4,0);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setClearColor(0x1b0e19,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;container.append(renderer.domElement);
 const hemisphere=new THREE.HemisphereLight(0xffe2e5,0x6c324c,2.5);scene.add(hemisphere);
 const key=new THREE.DirectionalLight(0xfff1dd,3.2);key.position.set(-4,8,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;scene.add(key);
 const rim=new THREE.PointLight(0xff8bae,70,13);rim.position.set(3,4,-2);scene.add(rim);
 const soft=new THREE.PointLight(0xffedd3,25,10);soft.position.set(-4,3,3);scene.add(soft);
 const mat=(hex,rough=.4,metalness=0)=>new THREE.MeshStandardMaterial({color:hex,roughness:rough,metalness});
 const gold=mat(0xd8ac6d,.24,.66),white=mat(0xffe9ed,.55),cream=mat(0xfff1e2,.65),sponge=mat(0xe5b084,.9),jam=mat(0xe66b8a,.46),choco=mat(0x79504b,.6),pink=mat(0xf0a9c5,.5),standMat=mat(0xfce6e1,.25,.25);
 // Dedicated knife object controlled by mouse/touch dragging during the cake-cut stage.
 const knife=new THREE.Group();scene.add(knife);knife.visible=false;
 let blade=mesh(new THREE.BoxGeometry(1.35,.065,.25),mat(0xdde2ed,.16,.7),-.32,0,0,knife);
 let handle=mesh(new THREE.BoxGeometry(.62,.14,.32),mat(0x6a3645,.48),.58,0,0,knife);
 let knifeTip=mesh(new THREE.ConeGeometry(.14,.38,4),mat(0xdde2ed,.2,.65),-1.16,0,0,knife);knifeTip.rotation.z=Math.PI/2;
 knife.position.set(1.6,3.65,0);knife.rotation.set(-.28,.15,-.14);
 let knifeReturn=0;
 const cake=new THREE.Group();scene.add(cake);let currentStyle='pink',cutAngle=.22,cutCount=0,mode='orbit',candlesOn=false,served=false;let slice=null,whole=null,inside=null;
 function mesh(geo,material,x=0,y=0,z=0,group=cake){let m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
 // Cake stand: pedestal and plate, concentric metallic trim
 mesh(new THREE.CylinderGeometry(.65,.85,.58,72),gold,0,.13,0);
 mesh(new THREE.CylinderGeometry(2.2,2.16,.14,96),standMat,0,.46,0);
 mesh(new THREE.TorusGeometry(2.14,.035,12,96),gold,0,.53,0).rotation.x=Math.PI/2;
 const cakeBody=new THREE.Group();cake.add(cakeBody);
 let frost=pink;
 function sectorMesh(radius,height,y,a,len,material,group){
  const g=new THREE.CylinderGeometry(radius,radius,height,96,1,false,a,len);
  const m=mesh(g,material,0,y,0,group);
  // Explicit RADIAL CUT FACES: cylinders by themselves have an open sector, leaving
  // strange angular floating slices. Give each layer two solid sponge/frost walls.
  if(len<Math.PI*2-.02){for(const theta of [a,a+len]){
    const rad=radius*.997;
    const wall=new THREE.Mesh(new THREE.PlaneGeometry(rad,height),new THREE.MeshStandardMaterial({color:material.color,roughness:.83,side:THREE.DoubleSide}));
    wall.rotation.y=Math.atan2(-Math.cos(theta),Math.sin(theta));
    wall.position.set(Math.sin(theta)*rad*.5,y,Math.cos(theta)*rad*.5);
    wall.receiveShadow=true;group.add(wall);
  }}
  return m;
 }

 function layeredCake(group,start,len){
   // Frosted cake with separate exposed sponge/jam/cream bands. Sliced wedge side walls reveal the internal layers.
   sectorMesh(1.65,.34,.73,start,len,sponge,group);
   sectorMesh(1.67,.18,1.00,start,len,cream,group);
   sectorMesh(1.66,.30,1.22,start,len,sponge,group);
   sectorMesh(1.66,.15,1.44,start,len,jam,group);
   sectorMesh(1.66,.35,1.68,start,len,frost,group);
   sectorMesh(1.63,.06,1.87,start,len,white,group);
   sectorMesh(1.16,.32,2.03,start,len,sponge,group);
   sectorMesh(1.17,.12,2.23,start,len,cream,group);
   sectorMesh(1.17,.34,2.44,start,len,frost,group);
   sectorMesh(1.15,.055,2.64,start,len,white,group);
 }
 function buildWhole(){cakeBody.clear();whole=new THREE.Group();cakeBody.add(whole);layeredCake(whole,0,Math.PI*2);makeFrostDecor(whole);makePhotoTopper(whole);makeCandles(whole);slice=null}
 function makeFrostDecor(group,start=0,len=Math.PI*2){
   for(let i=0;i<20;i++){let t=i*Math.PI*2/20;if(len<Math.PI*2-.01&&((t-start+Math.PI*4)%(Math.PI*2))>len)continue;let x=Math.sin(t)*1.51,z=Math.cos(t)*1.51;let rose=mesh(new THREE.SphereGeometry(.14,13,10),i%3===0?jam:cream,x,1.91,z,group);rose.scale.set(1.2,.52,1.2);if(i%2===0){let pearl=mesh(new THREE.SphereGeometry(.055,12,9),gold,x*1.045,1.82,z*1.045,group)}}
   for(let i=0;i<18;i++){let t=i*Math.PI*2/18;if(len<Math.PI*2-.01&&((t-start+Math.PI*4)%(Math.PI*2))>len)continue;let x=Math.sin(t)*1.03,z=Math.cos(t)*1.03;let rose=mesh(new THREE.SphereGeometry(.10,12,8),i%4===0?jam:cream,x,2.69,z,group);rose.scale.set(1,.5,1)}
   for(let i=0;i<55;i++){let a=(i/55)*Math.PI*2;if(len<Math.PI*2-.01&&((a-start+Math.PI*4)%(Math.PI*2))>len)continue;let r=1.67;mesh(new THREE.SphereGeometry(.04,6,6),i%3===0?gold:white,Math.sin(a)*r,.85+(i%5)*.17,Math.cos(a)*r,group)}
 }
 function textureText(title,subtitle){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=370;let c=canvas.getContext('2d');c.fillStyle='#fff7ec';c.fillRect(0,0,1024,370);c.strokeStyle='#b36388';c.lineWidth=13;c.strokeRect(19,19,986,332);c.fillStyle='#a24c70';c.textAlign='center';c.font='italic 83px Georgia';c.fillText(title,512,155);c.font='bold 90px Georgia';c.fillText(subtitle,512,280);let t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t}
 function makePhotoTopper(group){
   // Written greeting as actual texture in 3D, not a CSS screenshot.
   let plaqueMat=new THREE.MeshBasicMaterial({map:textureText('Happy Birthday','Ammuuu ♡'),side:THREE.DoubleSide});let plaque=mesh(new THREE.PlaneGeometry(1.4,.51),plaqueMat,0,1.36,1.665,group);plaque.rotation.x=-.14;
   let back=mesh(new THREE.CylinderGeometry(.5,.5,.02,54),cream,0,2.69,0,group);
   let photoMesh=mesh(new THREE.PlaneGeometry(.73,.8),new THREE.MeshBasicMaterial({color:0xffd9e5,side:THREE.DoubleSide}),0,2.715,0,group);photoMesh.rotation.x=-Math.PI/2;
   const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{let cv=document.createElement('canvas');cv.width=cv.height=512;let ctx=cv.getContext('2d');ctx.fillStyle='#fff0e6';ctx.fillRect(0,0,512,512);let scale=Math.max(512/img.width,512/img.height);ctx.drawImage(img,(512-img.width*scale)/2,(512-img.height*scale)/2,img.width*scale,img.height*scale);ctx.strokeStyle='#fff6ee';ctx.lineWidth=20;ctx.strokeRect(10,10,492,492);let t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;photoMesh.material=new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide})};img.src=photo;
 }
 let flames=[];
 function makeCandles(group){flames=[];for(let i=0;i<5;i++){let angle=i/5*Math.PI*2;let r=.94,x=Math.sin(angle)*r,z=Math.cos(angle)*r;mesh(new THREE.CylinderGeometry(.045,.045,.52,14),i%2?jam:cream,x,2.94,z,group);mesh(new THREE.CylinderGeometry(.012,.012,.08,8),choco,x,3.24,z,group);let flame=mesh(new THREE.SphereGeometry(.075,12,12),new THREE.MeshBasicMaterial({color:0xffbc65}),x,3.35,z,group);flame.scale.y=1.65;flame.visible=candlesOn;flames.push(flame)}}
 function resetCut(){cutCount=0;served=false;buildWhole();onCutProgress(0)}
 function makeCut(){
   if(cutCount>=2)return;cutCount++;knifeReturn=performance.now();onCutProgress(cutCount/2);
   if(cutCount!==2)return;
   // Cut the actual cake into a solid, closed 3D wedge and a matching remainder.
   // Decorative frosting is filtered to stay OUT of the gap.
   cake.rotation.y=0;cakeBody.clear();
   const wedge=.64,start=cutAngle,end=start+wedge;
   const rest=new THREE.Group();cakeBody.add(rest);
   layeredCake(rest,end,Math.PI*2-wedge);makeFrostDecor(rest,end,Math.PI*2-wedge);
   makePhotoTopper(rest);makeCandles(rest);
   slice=new THREE.Group();cakeBody.add(slice);
   layeredCake(slice,start,wedge);makeFrostDecor(slice,start,wedge);
   const deco=mesh(new THREE.SphereGeometry(.15,15,10),jam,Math.sin(start+wedge*.5)*1.1,2.74,Math.cos(start+wedge*.5)*1.1,slice);
   deco.scale.y=.55;
   // Lift the precise cut-out wedge toward the front-right. Never leave layer
   // strips stretched over the cake, as the older renderer did.
   slice.userData.out={x:1.08,z:1.0};
   const origin=performance.now();
   const animateSlice=(now)=>{if(!slice||served)return;const t=Math.min(1,(now-origin)/830);const smooth=t*t*(3-2*t);
     slice.position.set(slice.userData.out.x*smooth,.13*smooth+Math.sin(Math.PI*t)*.17,slice.userData.out.z*smooth);
     if(t<1)requestAnimationFrame(animateSlice)
   };requestAnimationFrame(animateSlice);
 }
 function serveSlice(who){if(!slice)return;served=true;const goal=who==='ashu'?{x:1.95,z:1.9}:who==='both'?{x:0,z:2.9}:who==='surprise'?{x:-2.1,z:1.4}:{x:.55,z:2.5};// A separate miniature porcelain plate receives the first slice.
 const servingPlate=mesh(new THREE.CylinderGeometry(.94,.96,.075,62),standMat,goal.x,.51,goal.z,scene);
 mesh(new THREE.TorusGeometry(.85,.025,8,62),gold,goal.x,.556,goal.z,scene).rotation.x=Math.PI/2;
 let start=slice.position.clone(),v=0;const startTime=performance.now();function step(now){if(!slice)return;v=Math.min(1,(now-startTime)/850);let smooth=v*v*(3-2*v);slice.position.set(start.x+(goal.x-start.x)*smooth,.06+Math.sin(Math.PI*v)*.68,start.z+(goal.z-start.z)*smooth);slice.rotation.y=smooth*.2;if(v<1)requestAnimationFrame(step)}requestAnimationFrame(step)}
 buildWhole();
 // Ground shadow catcher
 const ground=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.2}),0,-.16,0,scene);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
 let w=0,h=0;function resize(){let rect=container.getBoundingClientRect();w=Math.max(100,rect.width);h=Math.max(100,rect.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}let ob=new ResizeObserver(resize);ob.observe(container);resize();
 let down=null,lastX=0,lastY=0;renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,moved:0};lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);if(mode==='cut'){knife.visible=true;knife.position.y=3.05;let r=renderer.domElement.getBoundingClientRect();if(cutCount===0)cutAngle=.22}});
 renderer.domElement.addEventListener('pointermove',e=>{if(!down)return;let dx=e.clientX-lastX;down.moved+=Math.abs(dx)+Math.abs(e.clientY-lastY);lastY=e.clientY;if(mode==='orbit')cake.rotation.y+=dx*.009;else{let r=renderer.domElement.getBoundingClientRect();knife.position.x=((e.clientX-r.left)/r.width-.5)*4.5;knife.position.z=((e.clientY-r.top)/r.height-.5)*2.0;knife.position.y=2.55+Math.sin(performance.now()*.01)*.07}lastX=e.clientX});
 renderer.domElement.addEventListener('pointerup',e=>{if(!down)return;if(mode==='cut'&&down.moved>16){knife.position.y=1.9;knifeReturn=performance.now();makeCut()}down=null});
 renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();camera.position.z=Math.max(5.5,Math.min(10,camera.position.z+Math.sign(e.deltaY)*.35));camera.position.y=camera.position.z*.50},{passive:false});
 let animateStarted=performance.now();function render(now){let t=(now-animateStarted)/1000;flames.forEach((x,i)=>{x.scale.y=1.4+Math.sin(t*10+i)*.28;x.position.y=3.35+Math.sin(t*8+i)*.02});if(!down&&mode==='orbit'&&cutCount===0)cake.rotation.y+=.0019;if(knifeReturn){let dt=(now-knifeReturn)/650;knife.position.y=1.9+Math.min(1,dt)*1.45;if(dt>=1)knifeReturn=0}renderer.render(scene,camera);requestAnimationFrame(render)}requestAnimationFrame(render);
 return{is3d:true,setMode(v){mode=v;knife.visible=v==='cut'},setStyle(v){currentStyle=v;frost=v==='choco'?choco:v==='cream'?cream:pink;resetCut();flames.forEach(x=>x.visible=candlesOn)},setCandles(on){candlesOn=on;flames.forEach(x=>x.visible=on)},makeCut,resetCut,serveSlice};
}
