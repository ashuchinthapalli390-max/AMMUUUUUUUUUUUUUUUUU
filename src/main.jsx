import React from 'react';
import {createRoot} from 'react-dom/client';
import gsap from 'gsap';
import LoveReveal from './LoveReveal.jsx';
import QRCode from 'qrcode';
import {AdminWebsite, BirthdayWebsite} from './BirthdayApp.jsx';

// Reuse the original GSAP chapter-controller timelines while the static page skeleton
// is rendered and owned by React components.
window.gsap=gsap;
window.ammuMakeQR=url=>QRCode.toDataURL(url,{width:250,margin:2,color:{dark:'#692842',light:'#ffffff'}});
const path = window.location.pathname.replace(/\/$/, '');
const isAdmin = path === '/admin';
const isAdminPreview = path === '/admin/preview';

const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = isAdmin ? '/css/admin.css' : '/css/style.css';
document.head.append(stylesheet);

document.title = isAdmin
  ? "Ashu's Studio | Ammu Birthday Admin"
  : isAdminPreview
  ? "Ashu's Studio Preview | Ammu Birthday Universe 👑"
  : 'A Little Universe for Ammuuuu • From Ashu';

createRoot(document.getElementById('root')).render(
  path === '/my-lovely-ammu' || path === '/for-ammu'
    ? <LoveReveal />
    : isAdmin
    ? <AdminWebsite />
    : <BirthdayWebsite isPreview={isAdminPreview} />
);
