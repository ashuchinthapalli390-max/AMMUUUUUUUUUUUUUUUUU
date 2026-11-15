const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let site = {}, db = {}, section = 'overview', editing = null;
let toastTimer;

function toast(msg) {
  $('#toast').textContent = msg;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3300);
}

async function req(url, options = {}) {
  let r = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let x = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(x.error || 'Server error');
  return x;
}

function showLogin() {
  $('#admin-login').hidden = false;
  $('#dashboard').hidden = true;
}

async function load() {
  try {
    let session = await req('/api/admin/session');
    if (!session.authenticated) {
      showLogin();
      return;
    }
    let d = await req('/api/admin/data');
    site = d.site;
    db = d.db;
    $('#admin-login').hidden = true;
    $('#dashboard').hidden = false;
    render();
  } catch (e) {
    showLogin();
    $('#login-error').textContent = e.message;
  }
}

$('#login-form').onsubmit = async e => {
  e.preventDefault();
  try {
    await req('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: $('#password').value })
    });
    $('#login-error').textContent = '';
    await load();
  } catch (e) {
    $('#login-error').textContent = e.message;
  }
};

$('#logout').onclick = async () => {
  await req('/api/admin/logout', { method: 'POST', body: '{}' });
  showLogin();
};

$$('[data-section]').forEach(b => b.onclick = () => {
  section = b.dataset.section;
  render();
});

const headers = {
  overview: 'Overview',
  flyingnotes: 'Flying Love Notes 🦋',
  mailstudio: 'Birthday Countdown Mail Studio 💌',
  story: 'Our Friendship Journey',
  photos: 'Photo Library',
  magazine: 'Birthday Magazine Editor',
  bestiecard: 'Bestie ID Card Editor',
  wishes: 'Wish Submissions',
  letters: 'Letters & Wishes',
  vouchers: 'Gifts & Memberships',
  playlist: 'Birthday Playlist',
  extras: 'Movies & Extra Notes',
  settings: 'Website Settings',
  notifications: 'Email Notifications'
};

function render() {
  let title = headers[section] || 'Ashu’s Studio';
  $('#page-title').textContent = title;
  $$('[data-section]').forEach(b => b.classList.toggle('active', b.dataset.section === section));

  const map = {
    overview: renderOverview,
    flyingnotes: renderFlyingNotesAdmin,
    mailstudio: renderMailStudioAdmin,
    story: renderStory,
    photos: renderPhotos,
    magazine: renderMagazineAdmin,
    bestiecard: renderBestieCardAdmin,
    wishes: renderWishes,
    letters: renderLetters,
    vouchers: renderVouchers,
    extras: renderExtrasAdmin,
    playlist: renderPlaylistAdmin,
    settings: renderSettings,
    notifications: renderNotifications
  };

  if (map[section]) map[section]();
}

function card(text, number) {
  return `<div class="stat"><b>${number}</b><span>${text}</span></div>`;
}

function renderOverview() {
  const voucherCount = (site.vouchers || []).filter(x => x.id !== 'coupon').length;
  $('#admin-content').innerHTML = `
    <div class="stats">
      ${card('Journey Chapters', site.chapters.length)}
      ${card('Published Gallery Images', site.gallery.filter(x => x.approved !== false).length)}
      ${card('Flying Notes', (site.flyingNotes || []).length)}
      ${card('Wishes Received', db.wishes?.length || 0)}
    </div>
    <div class="panel" style="background: linear-gradient(135deg, #fff2f6, #ffe6f0); border: 2px solid #e597b4; padding: 24px; border-radius: 16px;">
      <h2 style="color: #781d45; margin-top: 0;">🔒 Birthday Release Security & Status</h2>
      <p style="color: #692842; font-size: 14.5px; line-height: 1.6; margin-bottom: 20px;">
        The official birthday website is locked until November 17, 2026, 00:00:00 Asia/Kolkata. All early preview bypasses and preview routes have been eliminated for production security. Use this dashboard to manage Flying Love Notes, monitor Countdown Emails, edit memoirs, and configure settings.
      </p>
      <div class="bar-actions" style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="/" target="_blank" class="primary" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 24px; background: linear-gradient(135deg, #781d45, #b83d6a); color: #fff; box-shadow: 0 6px 20px rgba(120,29,69,0.25);">
          ✦ Public Countdown Gate ↗
        </a>
        <button class="outline" data-go="flyingnotes">🦋 Flying Love Notes</button>
        <button class="outline" data-go="mailstudio">💌 Countdown Mail Studio</button>
      </div>
    </div>
    <div class="panel">
      <h2>Birthday Release Target</h2>
      <p><b>${esc(site.birthdayDate || '2026-11-17T00:00:00+05:30')} (Asia/Kolkata)</b></p>
      <p>Public visitors see only the locked countdown gate until server time reaches midnight. Media assets and personal content remain strictly protected.</p>
    </div>`;

  $$('[data-go]').forEach(b => b.onclick = () => {
    section = b.dataset.go;
    render();
  });
}

// -------------------------------------------------------------
// PHASE 4: FLYING LOVE NOTES 🦋
// -------------------------------------------------------------
function renderFlyingNotesAdmin() {
  const notes = site.flyingNotes || [];
  $('#admin-content').innerHTML = toolbar('Flying Love Notes • ' + notes.length + ' Messengers', 'Add Note', 'flyingNotes') + `
    <div class="panel">
      <h2>Tiny Flying Messengers Carrying Love Notes</h2>
      <p>These magical butterflies fly across Ammu's screen carrying folded paper envelopes with wax heart seals. When clicked, they unfold into sweet handwritten letters from Ashu.</p>
    </div>` +
    table(
      ['Butterfly Color', 'Theme', 'Message', 'Probability', 'Status', 'Actions'],
      notes.map((n, i) => `
        <tr>
          <td><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${getButterflyColorHex(n.butterflyColor)};margin-right:6px;vertical-align:middle;"></span><b>${esc(n.butterflyColor || 'blush-pink')}</b></td>
          <td>${esc(n.theme || 'heart-seal')}</td>
          <td style="max-width:320px;">“${esc(n.message)}”</td>
          <td>${n.probability || 20}%</td>
          <td><span class="flag ${n.isEnabled !== false ? 'good' : ''}">${n.isEnabled !== false ? 'Active' : 'Disabled'}</span></td>
          <td>
            <button class="action-btn" data-toggle-note="${i}">${n.isEnabled !== false ? 'Disable' : 'Enable'}</button>
            ${actions('flyingNotes', i)}
          </td>
        </tr>`)
    );

  listHandlers();

  $$('[data-toggle-note]').forEach(b => b.onclick = async () => {
    const idx = +b.dataset.toggleNote;
    site.flyingNotes[idx].isEnabled = site.flyingNotes[idx].isEnabled === false;
    await saveSite();
    render();
  });
}

function getButterflyColorHex(color) {
  const map = {
    'blush-pink': '#F8BBD0',
    'lavender': '#D7BCE8',
    'pearl-white': '#FFFDF7',
    'rose-gold': '#F4A6C1',
    'soft-blue': '#BEE3F8'
  };
  return map[color] || '#F8BBD0';
}

// -------------------------------------------------------------
// PHASE 13: BIRTHDAY COUNTDOWN MAIL STUDIO 💌
// -------------------------------------------------------------
async function renderMailStudioAdmin() {
  $('#admin-content').innerHTML = `
    <div class="panel">
      <h2>Birthday Countdown Mail Studio 💌</h2>
      <p>Automated countdown emails with custom designed posters, affectionate compliments and advance-birthday messages for Ammu.</p>
    </div>
    <div style="padding:20px;text-align:center;color:#882a52;">Loading countdown studio data...</div>`;

  try {
    const statusData = await req('/api/countdown/status');
    const milestones = statusData.milestones || [];
    const manifest = await fetch('/assets/countdown/manifest.json').then(r => r.json()).catch(() => ({ posters: [] }));
    const manifestPosters = manifest.posters || [];

    $('#admin-content').innerHTML = `
      <div class="panel">
        <h2>Campaign Status & Controls</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;margin:18px 0;">
          <div style="background:#fff4f8;padding:16px;border-radius:12px;border:1px solid #ecccdb;">
            <b>Campaign Switch:</b><br>
            <span style="font-size:18px;font-weight:bold;color:${statusData.enabled ? '#2e7d32' : '#c2185b'};">
              ${statusData.enabled ? 'ACTIVE (Sending)' : 'PAUSED'}
            </span>
          </div>
          <div style="background:#fff4f8;padding:16px;border-radius:12px;border:1px solid #ecccdb;">
            <b>Ammu Opt-In Status:</b><br>
            <span style="font-size:16px;color:#781d45;">
              ${statusData.isSubscribed ? `Subscribed (${statusData.tier})` : 'Awaiting Consent'}
            </span>
          </div>
          <div style="background:#fff4f8;padding:16px;border-radius:12px;border:1px solid #ecccdb;">
            <b>Target Unlock Instant:</b><br>
            <span style="font-size:14px;color:#551c36;">${new Date(statusData.birthdayUnlockAt).toLocaleString()}</span>
          </div>
        </div>

        <div class="bar-actions">
          <button id="btn-toggle-campaign" class="primary">${statusData.enabled ? 'Pause Campaign ⏸' : 'Enable Campaign ▶'}</button>
          <button id="btn-send-test" class="outline">Send Test Email To Ashu Only ✉</button>
        </div>
      </div>

      <div class="panel">
        <h2>Preview All 26 Countdown Milestone Posters</h2>
        <p>Select any milestone to preview its unique responsive HTML email composition and poster theme:</p>
        <div style="display:flex;gap:10px;margin-bottom:16px;">
          <select id="milestone-preview-select" style="padding:8px 14px;border-radius:10px;border:1px solid #d996ae;font-size:14px;flex:1;max-width:400px;">
            ${milestones.map(m => `<option value="${m.id}">${esc(m.relativeLabel)} · ${esc(m.name)}</option>`).join('')}
          </select>
          <button id="btn-load-email-preview" class="primary">Preview Email HTML ↗</button>
        </div>
        <div id="email-preview-container" style="border:1px solid #e5b9cc;border-radius:14px;padding:20px;background:#fff;min-height:280px;overflow:auto;">
          <p style="color:#882a52;">Select a milestone above and click "Preview Email HTML".</p>
        </div>
      </div>

      <div class="panel">
        <h2>All 21 Daily Countdown Posters (Manifest Gallery)</h2>
        <p>Full 1080×1350 genuine countdown artwork from 21 days down to 24 hours left. Click any poster to view full-resolution, or download directly:</p>
        <div id="manifest-posters-gallery" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:16px;margin-top:16px;">
          ${manifestPosters.map(p => `
            <div style="background:#fff4f8;border:1px solid #eabacb;border-radius:12px;padding:12px;text-align:center;box-shadow:0 4px 14px rgba(105,45,75,0.08);">
              <div style="border-radius:8px;overflow:hidden;border:2px solid #fff;margin-bottom:8px;aspect-ratio:1080/1350;background:#fce8ef;cursor:pointer;" onclick="window.open('${esc(p.image)}', '_blank')">
                <img src="${esc(p.image)}" alt="${esc(p.label)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
              </div>
              <div style="font-size:12px;font-weight:bold;color:#781d45;">${esc(p.label)}</div>
              <div style="font-size:10px;color:#9e486c;margin-bottom:8px;">${esc(p.theme || '')}</div>
              <a href="${esc(p.image)}" download="${esc(p.filename)}" class="btn outline" style="font-size:11px;padding:5px 8px;display:block;text-decoration:none;">Download PNG ↓</a>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="panel">
        <h2>Full Countdown Schedule Table (26 Milestones)</h2>
        ${table(['Milestone', 'Target IST', 'Tier', 'Poster Theme'],
          milestones.map(m => `
            <tr>
              <td><b>${esc(m.relativeLabel)}</b></td>
              <td>${new Date(m.targetIST).toLocaleString()}</td>
              <td><span class="flag good">${esc(m.tierRequired)}</span></td>
              <td>${esc(m.posterTheme)}</td>
            </tr>`))}
      </div>`;

    $('#btn-toggle-campaign').onclick = async () => {
      try {
        const res = await req('/api/admin/countdown/toggle', { method: 'POST', body: '{}' });
        toast(res.enabled ? 'Campaign Enabled!' : 'Campaign Paused.');
        renderMailStudioAdmin();
      } catch (err) {
        toast('Error: ' + err.message);
      }
    };

    $('#btn-send-test').onclick = async () => {
      const milestoneId = $('#milestone-preview-select')?.value || '24-hours';
      toast('Sending test preview to Ashu notification email...');
      try {
        const res = await req('/api/admin/countdown/test', {
          method: 'POST',
          body: JSON.stringify({ milestoneId })
        });
        toast(res.ok ? `Test email sent to ${res.recipient}!` : 'Could not send test email.');
      } catch (err) {
        toast('Failed: ' + err.message);
      }
    };

    $('#btn-load-email-preview').onclick = async () => {
      const milestoneId = $('#milestone-preview-select').value;
      try {
        const res = await req('/api/admin/countdown/preview', {
          method: 'POST',
          body: JSON.stringify({ milestoneId })
        });
        $('#email-preview-container').innerHTML = `
          <div style="background:#fcf3f6;padding:12px;border-radius:8px;margin-bottom:12px;font-size:13px;color:#781d45;">
            <b>Subject:</b> ${esc(res.milestone.subject)}<br>
            <b>Poster Theme:</b> ${esc(res.milestone.posterTheme)}
          </div>
          <div style="max-height:500px;overflow:auto;border:1px solid #eed0dc;border-radius:10px;">
            ${res.html}
          </div>`;
      } catch (err) {
        toast('Preview failed: ' + err.message);
      }
    };
  } catch (e) {
    $('#admin-content').innerHTML = `<div class="panel"><p class="error">Could not load countdown studio: ${esc(e.message)}</p></div>`;
  }
}

function toolbar(title, btn, action) {
  return `<div class="toolbar"><div><h2 style="margin:0">${esc(title)}</h2></div><div><button class="primary" data-add="${action}">+ ${esc(btn)}</button></div></div>`;
}

function table(head, rows) {
  return `<div class="panel" style="overflow:auto"><table class="data-table"><thead><tr>${head.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

function actions(type, i) {
  return `<button class="action-btn" data-edit="${type}:${i}">Edit</button><button class="action-btn" data-delete="${type}:${i}">Remove</button>`;
}

function listHandlers() {
  $$('[data-add]').forEach(b => b.onclick = () => openEditor(b.dataset.add, -1));
  $$('[data-edit]').forEach(b => b.onclick = () => {
    let [t, i] = b.dataset.edit.split(':');
    openEditor(t, +i);
  });
  $$('[data-delete]').forEach(b => b.onclick = () => {
    let [t, i] = b.dataset.delete.split(':');
    if (!confirm('Remove from website collection?')) return;
    site[t].splice(+i, 1);
    saveSite();
  });
}

function renderMagazineAdmin() {
  const pages = site.magazinePages || [];
  $('#admin-content').innerHTML = toolbar('Birthday Magazine • ' + pages.length + ' Pages', 'Add Magazine Page', 'magazinePages') + `
    <div class="panel">
      <h2>Interactive Magazine Book</h2>
      <p>Every two pages form a desktop spread. Edit the heading, editorial story, and photo for each page.</p>
    </div>` +
    table(['Page', 'Photo', 'Page Type', 'Title', 'Actions'], pages.map((pg, i) => `
      <tr>
        <td><b>${String(i + 1).padStart(2, '0')}</b></td>
        <td><img src="${esc(pg.image || '/assets/photos/original_white.jpg')}" alt="Magazine page"></td>
        <td>${esc(pg.type)}</td>
        <td><b>${esc(pg.title)}</b><br><small>${esc(pg.subtitle || '').slice(0, 90)}</small></td>
        <td>${actions('magazinePages', i)}</td>
      </tr>`));
  listHandlers();
}

function renderBestieCardAdmin() {
  let c = site.bestieCard || {};
  $('#admin-content').innerHTML = `
    <div class="panel">
      <h2>Ammu's Birthday Bestie ID</h2>
      <p>This is a cute keepsake card for Pottiiii. Edits change both sides of the ID card and its downloadable PNG versions.</p>
      <div class="editgrid">
        <label>Display Name<input id="id-name" value="${esc(c.name || '')}"></label>
        <label>Nickname<input id="id-nickname" value="${esc(c.nickname || '')}"></label>
        <label>Card Number<input id="id-number" value="${esc(c.number || '')}"></label>
        <label>Issued by<input id="id-issuedby" value="${esc(c.issuedBy || '')}"></label>
        <label class="wide">Portrait Path<input id="id-photo" value="${esc(c.photo || '')}"></label>
        <label class="wide">Membership Perks (one per line)<textarea id="id-perks" rows="7">${esc((c.perks || []).join('\n'))}</textarea></label>
      </div>
      <div class="bar-actions">
        <button class="primary" id="save-bestie-card">Save Birthday ID ✓</button>
      </div>
    </div>`;

  $('#save-bestie-card').onclick = async () => {
    site.bestieCard = {
      name: $('#id-name').value,
      nickname: $('#id-nickname').value,
      number: $('#id-number').value,
      issuedBy: $('#id-issuedby').value,
      photo: $('#id-photo').value,
      perks: $('#id-perks').value.split('\n').map(v => v.trim()).filter(Boolean)
    };
    await saveSite();
  };
}

function renderStory() {
  $('#admin-content').innerHTML = toolbar('Our Journey Chapters', 'Add Memory', 'chapters') + `
    <p class="note">Friendship journey chapters displayed across the website timeline.</p>` +
    table(['Chapter', 'Title', 'Description', 'Photo', 'Actions'], site.chapters.map((ch, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><b>${esc(ch.icon)} ${esc(ch.title)}</b></td>
        <td>${esc(ch.description).slice(0, 120)}</td>
        <td><img src="${esc(ch.image)}" alt="Memory"></td>
        <td>${actions('chapters', i)}</td>
      </tr>`));
  listHandlers();
}

function renderPhotos() {
  $('#admin-content').innerHTML = toolbar('Birthday Photo Gallery', 'Add Photo', 'gallery') + `
    <div class="panel">
      <h2>Upload a New Photo</h2>
      <input id="photo-upload" type="file" accept="image/jpeg,image/png">
      <button class="primary" id="upload-photo" style="margin-left:12px">Upload & Add</button>
      <p id="photo-upload-status" class="error"></p>
    </div>` +
    table(['Photo', 'Caption', 'Category', 'Published', 'Actions'], site.gallery.map((x, i) => `
      <tr>
        <td><div class="gallery-thumb"><img src="${esc(x.src)}" alt="gallery"></div></td>
        <td>${esc(x.caption)}</td>
        <td>${esc(x.category)}</td>
        <td><span class="flag ${x.approved !== false ? 'good' : ''}">${x.approved !== false ? 'Visible' : 'Hidden'}</span></td>
        <td>
          <button class="action-btn" data-toggle="${i}">${x.approved !== false ? 'Hide' : 'Publish'}</button>
          ${actions('gallery', i)}
        </td>
      </tr>`));

  listHandlers();
  $$('[data-toggle]').forEach(b => b.onclick = () => {
    let x = site.gallery[+b.dataset.toggle];
    x.approved = x.approved === false;
    saveSite();
  });
  $('#upload-photo').onclick = uploadPhoto;
}

async function uploadPhoto() {
  let f = $('#photo-upload').files?.[0];
  if (!f) { toast('Choose a photo first'); return; }
  $('#photo-upload-status').textContent = 'Uploading...';
  try {
    const data = await resizeImage(f);
    const r = await req('/api/admin/upload', { method: 'POST', body: JSON.stringify({ base64: data }) });
    site.gallery.push({ id: 'photo' + Date.now(), src: r.url, category: 'Memories', caption: f.name.replace(/\.[^/.]+$/, ''), approved: true });
    await saveSite();
    toast('Photo added and published!');
  } catch (e) {
    $('#photo-upload-status').textContent = e.message;
  }
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    let u = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(u);
      let scale = Math.min(1, 1200 / Math.max(im.width, im.height)), cv = document.createElement('canvas');
      cv.width = Math.round(im.width * scale);
      cv.height = Math.round(im.height * scale);
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL('image/jpeg', 0.82).split(',')[1]);
    };
    im.onerror = () => reject(new Error('Could not load image'));
    im.src = u;
  });
}

function renderWishes() {
  $('#admin-content').innerHTML = `
    <div class="panel">
      <h2>Ammu’s Private Wishes</h2>
      <p>Only Ashu can see these submissions. Kept confidential.</p>
    </div>` +
    (db.wishes && db.wishes.length ? db.wishes.map(w => `
      <div class="panel">
        <span class="crumb">RECEIVED ${new Date(w.createdAt).toLocaleString()}</span>
        <h2>Letter ${esc(w.id)}</h2>
        ${w.answers.map((t, i) => `
          <p><b>${['Wish One', 'Wish Two', 'Wish Three', 'What Ashu should change', 'How Ashu can improve'][i]}:</b><br>${esc(t || '(skipped)')}</p>`).join('')}
      </div>`).join('') : '<div class="panel">No birthday wishes submitted yet.</div>');
}

function renderLetters() {
  $('#admin-content').innerHTML = toolbar('Birthday Letters', 'Add Letter', 'letters') +
    table(['Title', 'Text', 'Actions'], site.letters.map((l, i) => `
      <tr>
        <td><b>${esc(l.title)}</b></td>
        <td>${esc(l.text).slice(0, 220)}</td>
        <td>${actions('letters', i)}</td>
      </tr>`)) +
    `<div class="panel">
      <h2>Three Birthday Wishes From Ashu</h2>
      ${site.wishesFromAshu.map((t, i) => `<p><b>Wish ${i + 1}:</b> ${esc(t)}</p>`).join('')}
      <button class="outline" id="edit-ashu-wishes">Edit Those Wishes</button>
    </div>`;
  listHandlers();
  $('#edit-ashu-wishes').onclick = () => openEditor('wishesFromAshu', 0);
}

function renderVouchers() {
  $('#admin-content').innerHTML = toolbar('Claimable Vouchers', 'Add Voucher', 'vouchers') +
    table(['Icon', 'Voucher', 'Description', 'Actions'], site.vouchers.map((v, i) => `
      <tr>
        <td>${esc(v.icon)}</td>
        <td><b>${esc(v.title)}</b></td>
        <td>${esc(v.description)}</td>
        <td>${actions('vouchers', i)}</td>
      </tr>`)) +
    `<div class="panel">
      <h2>Four Funny Dream Gifts</h2>
      ${site.pranks.map((p, i) => `
        <div style="padding:12px;border-bottom:1px solid #efd8e0">
          <b>${esc(p.icon)} ${esc(p.name)}</b>
          <p>${esc(p.joke)}</p>
          <button class="action-btn" data-edit="pranks:${i}">Edit Joke</button>
        </div>`).join('')}
    </div>`;
  listHandlers();
}

function renderExtrasAdmin() {
  $('#admin-content').innerHTML = toolbar('Movie Archive', 'Add Movie', 'movies') +
    table(['Title', 'Description', 'Actions'], (site.movies || []).map((m, i) => `
      <tr>
        <td>${esc(m.icon)} <b>${esc(m.title)}</b></td>
        <td>${esc(m.description)}</td>
        <td>${actions('movies', i)}</td>
      </tr>`)) +
    toolbar('Night Sky Messages', 'Add Star Note', 'stars') +
    table(['Memory Note', 'Actions'], (site.stars || []).map((m, i) => `
      <tr>
        <td>${esc(m)}</td>
        <td>${actions('stars', i)}</td>
      </tr>`)) +
    toolbar('Reasons Jar', 'Add Sweet Reason', 'reasons') +
    table(['Little Reason', 'Actions'], (site.reasons || []).map((m, i) => `
      <tr>
        <td>${esc(m)}</td>
        <td>${actions('reasons', i)}</td>
      </tr>`));
  listHandlers();
}

function renderPlaylistAdmin() {
  const tracks = site.playlist || [];
  $('#admin-content').innerHTML = toolbar('A Beautiful Playlist For You', 'Add Song', 'playlist') + `
    <div class="panel">
      <h2>♫ Ammu's Editable Birthday Playlist</h2>
      <p>Configure track titles, artists, and audio paths.</p>
    </div>` +
    table(['Song', 'Artist', 'MP3 path', 'Actions'], tracks.map((song, i) => `
      <tr>
        <td><b>${esc(song.title)}</b></td>
        <td>${esc(song.artist)}</td>
        <td><code>${esc(song.src)}</code></td>
        <td>${actions('playlist', i)}</td>
      </tr>`));
  listHandlers();
}

function renderSettings() {
  $('#admin-content').innerHTML = `
    <div class="panel">
      <h2>Global Birthday Website Settings</h2>
      <div class="editgrid">
        <label>Website title<input id="set-title" value="${esc(site.title)}"></label>
        <label>Main hero heading<input id="set-hero" value="${esc(site.heroTitle)}"></label>
        <label>Birthday unlock timestamp (Asia/Kolkata)<input id="set-date" value="${esc(site.birthdayDate)}"></label>
        <label>From name<input id="set-sender" value="${esc(site.sender)}"></label>
        <label>Nickname<input id="set-nickname" value="${esc(site.nickname)}"></label>
        <label class="wide">Hero image path<input id="set-heroimage" value="${esc(site.heroImage)}"></label>
      </div>
      <div class="bar-actions">
        <button class="primary" id="save-settings">Save Website Settings</button>
        <a class="outline" href="/" target="_blank">View Countdown Gate ↗</a>
      </div>
    </div>`;

  $('#save-settings').onclick = () => {
    Object.assign(site, {
      title: $('#set-title').value,
      heroTitle: $('#set-hero').value,
      birthdayDate: $('#set-date').value,
      sender: $('#set-sender').value,
      nickname: $('#set-nickname').value,
      heroImage: $('#set-heroimage').value
    });
    saveSite();
  };
}

function renderNotifications() {
  $('#admin-content').innerHTML = `
    <div class="panel">
      <h2>Email Notification History</h2>
      <p>System delivery records for form submissions, voucher alerts and countdown mailings.</p>
    </div>` +
    table(['Date', 'Recipient', 'Subject', 'Status'], (db.notifications || []).map(n => `
      <tr>
        <td>${new Date(n.at).toLocaleString()}</td>
        <td>${esc(n.to)}</td>
        <td>${esc(n.subject)}</td>
        <td><span class="flag ${n.status === 'sent' ? 'good' : ''}">${esc(n.status)}</span></td>
      </tr>`));
}

const schema = {
  chapters: { title: 'text', description: 'textarea', icon: 'text', image: 'text' },
  gallery: { src: 'text', caption: 'text', category: 'text', approved: 'checkbox' },
  playlist: { title: 'text', artist: 'text', src: 'text', cover: 'text' },
  magazinePages: { type: 'text', eyebrow: 'text', title: 'text', subtitle: 'text', body: 'textarea', image: 'text', note: 'text' },
  letters: { title: 'text', text: 'textarea' },
  vouchers: { title: 'text', icon: 'text', description: 'textarea' },
  pranks: { name: 'text', icon: 'text', joke: 'textarea' },
  wishesFromAshu: { wish1: 'textarea', wish2: 'textarea', wish3: 'textarea' },
  movies: { title: 'text', description: 'textarea', icon: 'text' },
  stars: { text: 'textarea' },
  reasons: { text: 'textarea' },
  flyingNotes: { message: 'textarea', butterflyColor: 'text', theme: 'text', probability: 'number' }
};

function openEditor(type, index) {
  editing = { type, index };
  let data = type === 'stars' || type === 'reasons'
    ? (index < 0 ? { text: '' } : { text: site[type][index] })
    : type === 'wishesFromAshu'
      ? { wish1: site.wishesFromAshu[0], wish2: site.wishesFromAshu[1], wish3: site.wishesFromAshu[2] }
      : index < 0 ? {} : site[type][index];

  $('#editor-title').textContent = (index < 0 ? 'Add ' : 'Edit ') + type.replaceAll(/([A-Z])/g, ' $1');
  let html = '<div class="editgrid">';
  for (let [field, kind] of Object.entries(schema[type] || {})) {
    let val = data[field] ?? '', label = field.replaceAll(/([A-Z])/g, ' $1');
    if (kind === 'textarea') html += `<label class="wide">${esc(label)}<textarea data-field="${field}">${esc(val)}</textarea></label>`;
    else if (kind === 'checkbox') html += `<label>${esc(label)} <input type="checkbox" data-field="${field}" ${val === true ? 'checked' : ''}></label>`;
    else html += `<label>${esc(label)}<input type="${kind}" data-field="${field}" value="${esc(val)}"></label>`;
  }
  html += '</div>';
  $('#editor-fields').innerHTML = html;
  $('#editor-overlay').hidden = false;
}

function closeEditor() {
  $('#editor-overlay').hidden = true;
  editing = null;
}
$('#editor-close').onclick = closeEditor;
$('#editor-cancel').onclick = closeEditor;

$('#editor-form').onsubmit = async e => {
  e.preventDefault();
  let { type, index } = editing, obj = {};
  $$('#editor-fields [data-field]').forEach(f => {
    let v = f.type === 'checkbox' ? f.checked : f.type === 'number' ? Number(f.value) : f.value;
    obj[f.dataset.field] = v;
  });

  if (type === 'wishesFromAshu') {
    site.wishesFromAshu = [obj.wish1, obj.wish2, obj.wish3];
  } else if (type === 'stars' || type === 'reasons') {
    if (index < 0) site[type].push(obj.text);
    else site[type][index] = obj.text;
  } else {
    if (index < 0) {
      obj.id = (type.slice(0, -1) || 'item') + Date.now();
      if (type === 'gallery' && obj.approved === undefined) obj.approved = false;
      if (type === 'flyingNotes' && obj.isEnabled === undefined) obj.isEnabled = true;
      if (!site[type]) site[type] = [];
      site[type].push(obj);
    } else {
      site[type][index] = { ...site[type][index], ...obj };
    }
  }

  try {
    await saveSite();
    closeEditor();
    render();
  } catch (e) {
    toast(e.message);
  }
};

async function saveSite() {
  try {
    let r = await req('/api/admin/site', { method: 'PUT', body: JSON.stringify(site) });
    toast('Saved successfully!');
    await load();
    return r;
  } catch (e) {
    toast('Save failed: ' + e.message);
    throw e;
  }
}

load();
