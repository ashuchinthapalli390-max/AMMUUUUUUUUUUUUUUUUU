import React,{useEffect,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
/** Framer Motion accent animation when the legacy-compatible GSAP chapter controller changes page. */
export default function MotionSceneFX(){
  const [scene,setScene]=useState(null);
  const reduce=useReducedMotion();
  useEffect(()=>{
    let timeout;
    const show=e=>{
      const detail=e.detail||{};
      setScene({id:detail.id,name:({home:'The birthday begins',journey:'Where it all started',memories:'The liquid scrapbook',magazine:'The birthday magazine','bestie-id':'Lifetime besties',letters:'Letters from Ashu',movies:'Movie memories',midnight:'After midnight',games:'Little games','little-things':'The tiniest memories',certificates:'Special awards',wishes:'Three wishes',cake:'The 3D cake studio',gifts:'Surprise gifts',pranks:'Dream gifts',memberships:'Lifetime care',shop:'Potti shopping world',cart:'The special checkout',tracking:'Gift delivery',finale:'After everything, still us'}[detail.id]||'A little surprise'),t:Date.now()});
      clearTimeout(timeout);timeout=setTimeout(()=>setScene(null),1700);
    };
    document.addEventListener('ammu:chapter-change',show);
    return()=>{document.removeEventListener('ammu:chapter-change',show);clearTimeout(timeout)};
  },[]);
  return <AnimatePresence mode="wait">{scene&&!reduce&&<motion.aside key={scene.t} className="react-chapter-bloom" initial={{opacity:0,y:-25,scale:.90,filter:'blur(6px)'}} animate={{opacity:1,y:0,scale:1,filter:'blur(0px)'}} exit={{opacity:0,y:-18,scale:.96,filter:'blur(3px)'}} transition={{type:'spring',stiffness:180,damping:19}} aria-hidden="true"><motion.span className="ornament" initial={{rotate:-70,scale:0}} animate={{rotate:0,scale:1}} transition={{delay:.15,type:'spring'}}>✿</motion.span>{scene.name}<motion.span className="ornament" initial={{rotate:70,scale:0}} animate={{rotate:0,scale:1}} transition={{delay:.20,type:'spring'}}>♡</motion.span></motion.aside>}</AnimatePresence>
}
