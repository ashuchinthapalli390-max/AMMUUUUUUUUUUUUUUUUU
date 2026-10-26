import React,{useEffect,useState,useRef} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
const fallback=[{id:'track1',title:'Our first song',src:'/assets/music/song-01.mp3',artist:'From Ashu'}];
export default function SectionPlaylist(){
 const [songs,setSongs]=useState(fallback),[selected,setSelected]=useState(0),[playing,setPlaying]=useState(false),[error,setError]=useState('');
 const audio=useRef(null);
 useEffect(()=>{const sync=()=>{const tracks=window.ammuBirthdayConfig?.playlist;if(Array.isArray(tracks)&&tracks.length)setSongs(tracks)};document.addEventListener('ammu:ready',sync);sync();return()=>document.removeEventListener('ammu:ready',sync)},[]);
 useEffect(()=>{const el=audio.current;if(!el)return;el.pause();el.src=songs[selected]?.src||'';el.load();setPlaying(false);setError('')},[selected,songs]);
 const toggle=()=>{let el=audio.current;if(!el)return;if(playing){el.pause();setPlaying(false)}else el.play().then(()=>{setPlaying(true);setError('')}).catch(()=>setError('Song not uploaded yet. Add the MP3 in public/assets/music, then reload 💗'))};
 return <section id="playlist" className="section ivory playlist-chapter"><div className="wrap playlist-v5">
 <div className="section-top"><span className="eyebrow">FOR MY LOVELYYYY POTTIIIIIIII</span><h2>A Beautiful <em>Playlist For You ♡</em></h2><p>Every tune, one more reason to remember a little moment together. Songs can be added later from the editable playlist list.</p></div>
 <div className="playlist-studio"><div className="v8-album-scene"><div className={'v8-cd '+(playing?'spinning':'')} aria-hidden="true"><span>{songs[selected]?.title||'Our song'}<br/>♡</span></div><motion.div className="playlist-cover v8-album-front" layout><img src="/assets/photos/original_black.jpg" alt="Ammu in her black outfit and sunglasses"/><div className="v8-song-cover" aria-label="Current song artwork"><img src={songs[selected]?.cover||'/assets/photos/original_black.jpg'} alt={songs[selected]?.title+' cover artwork'} onError={e=>{e.currentTarget.src='/assets/photos/original_black.jpg'}}/><div className="v8-song-cover-title">{songs[selected]?.title||'Our song'}</div></div><div className="playlist-cover-caption">FOR AMMUUUUU <span>♫ FROM ASHU</span></div></motion.div></div>
 <div className="playlist-tracks"><span className="eyebrow">THE ASHU COLLECTION • OUR SONGS</span><h3>{songs[selected]?.title}</h3><p>{songs[selected]?.artist||'From Ashu'}</p><audio ref={audio} onEnded={()=>{setSelected(v=>(v+1)%songs.length);setPlaying(false)}} onError={()=>{if(playing)setError('This MP3 is not uploaded yet.')}}/>
 <div className="playlist-controls"><button onClick={()=>setSelected(v=>(v+songs.length-1)%songs.length)} aria-label="Previous track">⏮</button><button onClick={toggle} className="play-btn" aria-label={playing?'Pause playlist':'Play playlist'}>{playing?'Ⅱ':'▶'}</button><button onClick={()=>setSelected(v=>(v+1)%songs.length)} aria-label="Next track">⏭</button></div>
 {error&&<p role="status" className="playlist-error">{error}</p>}
 <div className="playlist-songlist" data-allow-scroll="true">{songs.map((t,i)=><button key={t.id||i} className={i===selected?'is-playing':''} onClick={()=>setSelected(i)}><span>{String(i+1).padStart(2,'0')}</span><b>{t.title}</b><small>{t.artist||'Ashu ♡'}</small><span>{i===selected?'♡':'♪'}</span></button>)}</div>
 </div></div></div></section>
}
