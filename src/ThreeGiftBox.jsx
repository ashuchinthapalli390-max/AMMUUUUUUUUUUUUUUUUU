import React,{useEffect,useRef} from 'react';
import * as THREE from 'three';

/** Lightweight procedural Three.js box. No external 3D asset downloads required. */
export default function ThreeGiftBox({mode='voucher'}){
 const el=useRef(null);
 useEffect(()=>{
  const host=el.current;if(!host)return;
  let renderer,frame=0,observer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.setClearColor(0xffffff,0);renderer.shadowMap.enabled=true;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(42,2,.1,50);camera.position.set(3.7,3.1,5.7);camera.lookAt(0,.25,0);
  scene.add(new THREE.HemisphereLight(0xffe5e9,0x793956,3));let key=new THREE.DirectionalLight(0xffffff,4);key.position.set(4,7,5);scene.add(key);
  const container=new THREE.Group();scene.add(container);
  const pink=new THREE.MeshStandardMaterial({color:0xe7a5bf,metalness:.15,roughness:.27});
  const cream=new THREE.MeshStandardMaterial({color:0xfff1e3,metalness:.12,roughness:.25});
  const gold=new THREE.MeshStandardMaterial({color:0xb77a50,metalness:.6,roughness:.22});
  function block(x,y,z,w,h,d,mat,parent=container){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
  block(0,-.30,0,2.65,1.2,2.5,pink);block(0,-.29,1.27,.19,1.25,.08,gold);block(0,-.29,-1.27,.19,1.25,.08,gold);
  block(0,-.3,0,.23,1.25,2.58,cream);block(0,-.3,0,2.72,1.25,.23,cream);
  const lid=new THREE.Group();lid.position.set(0,.35,-1.25);container.add(lid);
  block(0,.04,1.25,2.93,.32,2.8,pink,lid);block(0,.24,1.25,.25,.09,2.87,cream,lid);block(0,.24,1.25,2.99,.09,.25,cream,lid);
  const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(.25,.085,75,9),gold);knot.position.set(0,.43,1.25);lid.add(knot);
  // Physical cards inside the box. They rise through the open lid one by one.
  const cards=[];const titles=['LIFETIME SUPPORT','LIFETIME CARE','FUNNY LITTLE CHAOS','UNLIMITED REELS','FOOD TREATS','MOVIE BUDDY','PATCHUP PASS','EMERGENCY HUGS','A SECRET SURPRISE'];
  function makeCard(title,i){
    const c=document.createElement('canvas');c.width=640;c.height=380;
    const ctx=c.getContext('2d');let g=ctx.createLinearGradient(0,0,640,380);g.addColorStop(0,'#fff4e8');g.addColorStop(1,'#e7a3c0');
    ctx.fillStyle=g;ctx.fillRect(0,0,640,380);ctx.strokeStyle='#bd6a8a';ctx.lineWidth=15;ctx.strokeRect(20,20,600,340);
    ctx.fillStyle='#873653';ctx.textAlign='center';ctx.font='700 31px Georgia';ctx.fillText('AMMUUU • THE ASHU COLLECTION',320,77);
    ctx.font='700 43px Georgia';ctx.fillText(title,320,190);ctx.font='italic 32px Georgia';ctx.fillText('Always with love ♡',320,294);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
    const face=new THREE.Mesh(new THREE.BoxGeometry(1.72,.055,1.07),[cream,cream,cream,cream,new THREE.MeshStandardMaterial({map:texture,roughness:.44}),cream]);
    face.rotation.x=-.52;face.position.set(0,-.26+i*.015,.05-i*.04);face.visible=i===0;container.add(face);cards.push(face)
  }
  titles.forEach(makeCard);
  const twinkles=new THREE.Group();container.add(twinkles);for(let i=0;i<16;i++){const t=new THREE.Mesh(new THREE.OctahedronGeometry(.04+(i%3)*.012),new THREE.MeshBasicMaterial({color:i%2?0xfff3bc:0xffbbe4}));t.position.set(Math.sin(i*2.4)*1.4,.18+Math.sin(i*1.6)*.8,Math.cos(i*2.4)*1.2);twinkles.add(t)}
  let start=performance.now();let launched=false;let selectedCard=0;
  const opening=()=>{start=performance.now();launched=true};
  const sceneChange=e=>{if(e.detail?.id==='memberships'){selectedCard=0;opening()}};document.addEventListener('ammu:chapter-change',sceneChange);
  const claimed=()=>{selectedCard=Math.min(cards.length-1,selectedCard+1);start=performance.now();launched=true};document.addEventListener('ammu:voucher-claim',claimed);
  const pack=e=>{if(mode==='packing'){start=performance.now();launched=true}};document.addEventListener('ammu:pack-item',pack);
  observer=new ResizeObserver(()=>{const b=host.getBoundingClientRect();if(b.width&&b.height){renderer.setSize(b.width,b.height,false);camera.aspect=b.width/b.height;camera.updateProjectionMatrix()}});observer.observe(host);
  const animate=now=>{const seconds=(now-start)/1000;if(mode==='voucher'&&launched){const p=Math.max(0,Math.min(1,(seconds-.4)/1.3));lid.rotation.x=-p*1.5;container.rotation.y=.18+Math.sin(seconds*.27)*.12;
     const current=selectedCard;
     cards.forEach((card,i)=>{card.visible=i===current;const progress=Math.min(1,Math.max(0,(seconds-.35)/1.2));card.position.y=-.26+progress*1.65;card.position.z=.05+progress*.65;card.rotation.x=-.52+progress*.52;card.rotation.y=Math.sin(seconds*.8)*.04});
     twinkles.rotation.y=seconds*.25}else if(mode==='packing'&&launched){const p=Math.max(0,Math.min(1,(seconds-.72)/.65));lid.rotation.x=-1.45+p*1.45;container.rotation.y=.3;container.scale.setScalar(1-p*.18)}else{lid.rotation.x=mode==='packing'?-1.45:0;container.rotation.y=Math.sin(now*.00033)*.15}renderer.render(scene,camera);frame=requestAnimationFrame(animate)};
  frame=requestAnimationFrame(animate);
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();document.removeEventListener('ammu:chapter-change',sceneChange);document.removeEventListener('ammu:pack-item',pack);document.removeEventListener('ammu:voucher-claim',claimed);renderer.dispose();renderer.domElement.remove();container.traverse(o=>{o.geometry?.dispose();if(o.material?.dispose)o.material.dispose()})};
 },[mode]);return <div ref={el} className={`real-3d-gift real-3d-${mode}`} aria-label="Interactive 3D pink gift box" />
}
