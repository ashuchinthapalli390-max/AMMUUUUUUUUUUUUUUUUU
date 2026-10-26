import React,{useCallback,useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';

/** A temporary liquid-paper scratch reveal. The original photo is never modified. */
export default function LiquidMemory(){
  const canvasRef=useRef(null),frameRef=useRef(null),pointer=useRef({x:0,y:0,active:false});
  const prefersReduced=useReducedMotion();
  const [photo,setPhoto]=useState(0);
  const photos=[{src:'/assets/photos/original_black.jpg',alt:'Ammu wearing her black embroidered outfit and sunglasses'},{src:'/assets/photos/original_white.jpg',alt:'Ammu wearing her white kurti'}];
  const reset=useCallback(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;const b=c.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.75);c.width=Math.max(1,Math.round(b.width*dpr));c.height=Math.max(1,Math.round(b.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,b.width,b.height);ctx.fillStyle='rgba(255,250,245,.16)';ctx.fillRect(0,0,b.width,b.height);pointer.current.active=false;},[]);
  useEffect(()=>{reset();const ro=new ResizeObserver(reset);if(frameRef.current)ro.observe(frameRef.current);return()=>ro.disconnect()},[reset]);
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;
    let raf=0,previous=0;
    // Repaint the thin paper layer on EVERY frame instead of adding an opaque
    // coat indefinitely. This keeps the entire portrait recognizable.
    const paint=(ts)=>{
      const r=canvas.getBoundingClientRect();
      if(ts-previous>=30&&r.width&&r.height){
        previous=ts;
        ctx.globalCompositeOperation='source-over';
        ctx.clearRect(0,0,r.width,r.height);
        ctx.fillStyle='rgba(255,250,247,.16)';ctx.fillRect(0,0,r.width,r.height);
        if(pointer.current.active&&!prefersReduced){
          const pos=pointer.current, t=ts/780;
          ctx.globalCompositeOperation='destination-out';
          for(let i=0;i<7;i++){
            const angle=i*Math.PI*2/7+t*.47;
            const distance=18+Math.sin(t*.7+i)*12;
            const x=pos.x+Math.cos(angle)*distance,y=pos.y+Math.sin(angle)*distance;
            const radius=110+18*Math.sin(t*.7+i);
            const gradient=ctx.createRadialGradient(x,y,5,x,y,radius);
            gradient.addColorStop(0,'rgba(0,0,0,.95)');
            gradient.addColorStop(.45,'rgba(0,0,0,.67)');
            gradient.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=gradient;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
          }
          ctx.globalCompositeOperation='source-over';
        }
      }
      raf=requestAnimationFrame(paint);
    };
    raf=requestAnimationFrame(paint);
    return()=>cancelAnimationFrame(raf);
  },[prefersReduced,photo]);
  const move=e=>{const r=frameRef.current?.getBoundingClientRect();if(!r)return;pointer.current={x:e.clientX-r.left,y:e.clientY-r.top,active:true}};
  const leave=()=>pointer.current.active=false;
  const revealGallery=()=>{document.getElementById('memories')?.classList.add('gallery-view');window.ammuRefreshPage?.('memories');};
  const swap=()=>{setPhoto(i=>(i+1)%photos.length);reset()};
  return <div className="liquid-storyboard-stage">
    <div className="liquid-story-top"><span className="eyebrow">FROM OUR FIRST MEETING TO FOREVER MEMORIES</span><h3>About Our Journey <em>♡ The Little Things We Keep.</em></h3><p>The stories we made, from our first hello to our midnight conversations and everything in between.</p></div>
    <motion.div className="liquid-memory-frame" ref={frameRef} initial={{opacity:0,scale:.985}} animate={{opacity:1,scale:1}} transition={{duration:.75}} onPointerMove={move} onPointerLeave={leave} onPointerDown={move}>
      <img src={photos[photo].src} alt={photos[photo].alt} draggable={false}/>
      <canvas ref={canvasRef} className="liquid-paper-canvas" aria-hidden="true"/>
      <div className="liquid-caption"><span className="liquid-corner-star">✦</span><span>With you, every little moment is magic ♡</span><span className="liquid-corner-star">✿</span></div>
      
    </motion.div>
    
  </div>
}
