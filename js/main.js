(() => {
  const $ = s => document.querySelector(s);
  const h = (t, a = {}, ...c) => {
    const e = document.createElement(t);
    for (const k in a) k.startsWith('on') ? e.addEventListener(k.slice(2), a[k]) : e.setAttribute(k, a[k]);
    e.append(...c.flat());
    return e;
  };
  if (!window.SITE || !window.PROJECTS) {
    $('#isi').replaceChildren(h('p', { class: 'wrap state' }, 'Gagal memuat data. Periksa file js/data.js dan pastikan urutan script benar.'));
    return;
  }
  const S = window.SITE, P = window.PROJECTS, page = document.body.dataset.page;
  document.title = document.title.replace('[NAMA LENGKAP]', S.nama);

  // Header dan footer
  const NAV = [['index.html', 'Beranda', 'beranda'], ['tentang.html', 'Tentang', 'tentang'], ['karya.html', 'Karya pilihan', 'karya'], ['kontak.html', 'Kontak', 'kontak']];
  const cur = page === 'proyek' ? 'karya' : page;
  const nav = h('nav', { id: 'nav', 'aria-label': 'Utama', class: 'closed' },
    h('ul', {}, NAV.map(([u, l, k]) => h('li', {}, h('a', k === cur ? { href: u, 'aria-current': 'page' } : { href: u }, l)))));
  const btn = h('button', { class: 'btn menu-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'nav', onclick: () => toggle() }, 'Menu');
  function toggle(open) {
    const o = open === undefined ? nav.classList.contains('closed') : open;
    nav.classList.toggle('closed', !o);
    btn.setAttribute('aria-expanded', String(o));
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !nav.classList.contains('closed')) { toggle(false); btn.focus(); }
  });
  $('#hdr').append(h('div', { class: 'wrap' },
    h('a', { class: 'brand', href: 'index.html' }, h('img', { src: 'assets/logo.svg', alt: '', width: '36', height: '36' }), S.nama), btn, nav));
  $('#ftr').append(h('div', { class: 'wrap' }, '© ' + new Date().getFullYear() + ' ' + S.nama + '. ' + S.jurusan + '.'));

  // Baris proyek
  const row = p => h('a', { class: 'row', href: 'proyek.html?id=' + encodeURIComponent(p.id) },
    h('h3', {}, p.nama), h('div', {}, h('p', {}, p.tujuan), h('p', { class: 'tools' }, 'Tools: ' + p.tools.join(', '))));
  const fill = (box, list) => { box.className = ''; box.replaceChildren(...list.map(row)); };

  if (page === 'beranda') {
    $('#h-nama').textContent = S.nama;
    $('#h-sub').textContent = 'Mahasiswa ' + S.jurusan + '. ' + S.intro;
    fill($('#daftar'), P.slice(0, 3));
  }

  if (page === 'tentang') {
    $('#kuliah').textContent = 'Mahasiswa ' + S.jurusan + ', angkatan ' + S.angkatan + '.';
    $('#intro').textContent = S.intro;
    $('#skill').append(...S.skill.map(s => h('li', {}, s)));
  }

  if (page === 'karya') {
    const box = $('#daftar'), bar = $('#filter'), tools = [...new Set(P.flatMap(p => p.tools))];
    let sel = '';
    const draw = () => {
      [...bar.children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === sel)));
      const l = sel ? P.filter(p => p.tools.includes(sel)) : P;
      if (!l.length) {
        box.className = 'state';
        box.replaceChildren(h('p', {}, sel ? 'Belum ada karya dengan tool ini.' : 'Belum ada karya. Tambahkan proyek di js/data.js.'),
          sel ? h('button', { class: 'btn', type: 'button', onclick: () => { sel = ''; draw(); } }, 'Tampilkan semua karya') : '');
      } else fill(box, l);
      $('#hasil').textContent = l.length + ' karya ditampilkan';
    };
    ['', ...tools].forEach(t => bar.append(h('button', { class: 'chip', type: 'button', 'data-t': t, onclick: () => { sel = t; draw(); } }, t || 'Semua')));
    draw();
  }

  if (page === 'proyek') {
    const id = new URLSearchParams(location.search).get('id'), i = P.findIndex(p => p.id === id), box = $('#detail');
    if (i < 0) {
      box.className = 'state';
      box.replaceChildren(h('h1', {}, 'Proyek tidak ditemukan'), h('p', {}, 'Tautan ini tidak cocok dengan proyek mana pun.'),
        h('a', { class: 'btn', href: 'karya.html' }, 'Kembali ke karya pilihan'));
    } else {
      const p = P[i], r = (k, v) => [h('dt', {}, k), h('dd', {}, v)];
      document.title = p.nama + ' | ' + S.nama;
      box.className = '';
      box.replaceChildren(h('h1', {}, p.nama),
        h('dl', { class: 'spec' }, r('Peran saya', p.peran), r('Tujuan', p.tujuan), r('Tools', p.tools.join(', ')), r('Hasil dan dampak', p.hasil),
          p.tautan ? r('Tautan', h('a', { href: p.tautan }, p.tautan)) : []),
        h('nav', { class: 'pn', 'aria-label': 'Proyek lain' },
          i > 0 ? h('a', { href: 'proyek.html?id=' + encodeURIComponent(P[i - 1].id) }, 'Sebelumnya: ' + P[i - 1].nama) : '',
          i < P.length - 1 ? h('a', { href: 'proyek.html?id=' + encodeURIComponent(P[i + 1].id) }, 'Berikutnya: ' + P[i + 1].nama) : ''));
    }
  }

  if (page === 'kontak') {
    const ok = !/\[/.test(S.email), msg = $('#msg');
    const say = (t, e) => { msg.className = 'msg' + (e ? ' err' : ''); msg.textContent = t; };
    $('#email').textContent = S.email;
    $('#salin').addEventListener('click', async () => {
      if (!ok) return say('Gagal: email belum diisi di js/data.js.', 1);
      try { await navigator.clipboard.writeText(S.email); say('Email disalin.'); }
      catch { say('Gagal menyalin. Salin manual: ' + S.email, 1); }
    });
    $('#form').addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(e.target), n = f.get('nama').trim(), m = f.get('email').trim(), t = f.get('pesan').trim();
      if (!n || !m || !t) return say('Gagal: isi nama, email, dan pesan.', 1);
      if (!ok) return say('Gagal: email tujuan belum diisi di js/data.js.', 1);
      say('Membuka aplikasi email Anda…');
      location.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent('Pesan dari ' + n) + '&body=' + encodeURIComponent(t + '\n\nBalas ke: ' + m);
    });
    [['GitHub', S.github], ['LinkedIn', S.linkedin]].filter(x => x[1])
      .forEach(([l, u]) => $('#tautan').append(h('li', {}, h('a', { href: u }, l))));
  }
})();
