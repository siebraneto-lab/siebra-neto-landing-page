// =============================================================================
// LANÇAMENTOS AUTOMÁTICOS
// releases.json é atualizado a cada 6h por uma automação do GitHub que consulta
// a API do Spotify. REGRA: mais recente primeiro (data_lancamento decrescente).
// letras.json (opcional): { "ID_DO_LANCAMENTO": "texto da letra" }
// =============================================================================

let musicasSpotify = [];
let lancamentosSwiper = null;

function renderizarSlides(musicas) {
    // REGRA DE ORDENAÇÃO: mais recentes primeiro.
    const ordenadas = [...musicas].sort((a, b) => new Date(b.data_lancamento || 0) - new Date(a.data_lancamento || 0));

    const wrapper = document.querySelector('.lancamentos-swiper .swiper-wrapper');
    wrapper.innerHTML = '';

    ordenadas.forEach((musica) => {
        const barras = '<div class="bar" style="width:6px;"></div>'.repeat(8);
        const banner = musica.capa_url
            ? `style="background-image: url(${musica.capa_url}); background-size: cover; background-position: center;"`
            : '';
        const tipo = musica.tipo === 'track' ? 'track' : 'album';
        wrapper.insertAdjacentHTML('beforeend', `
            <div class="swiper-slide">
                <div class="slide-card">
                    <div class="slide-banner" ${banner}>
                        <div class="absolute inset-0 flex items-center justify-center">
                            ${musica.capa_url ? '' : `<div class="equalizer" style="height:60px; opacity:0.4;">${barras}</div>`}
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-900/40 to-green-700/20 border border-green-500/30 text-green-400 text-xs font-inter font-semibold">
                                <i class="fas fa-fire text-orange-400"></i> ${musica.titulo}
                            </span>
                            <span class="text-xs text-gray-500 font-inter">${(musica.data_lancamento || '').substring(0, 4)}</span>
                        </div>
                        <h3 class="font-ubuntu text-2xl font-bold text-white mb-4 neon-text">${musica.titulo}</h3>
                        <div class="featured-track mb-4">
                            <iframe style="border-radius:12px"
                                src="https://open.spotify.com/embed/${tipo}/${musica.id}?utm_source=generator&theme=0"
                                width="100%" height="152" frameBorder="0" allowfullscreen=""
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"></iframe>
                        </div>
                        <div class="lyrics-toggle flex items-center gap-2 text-neon-purple font-inter text-sm font-semibold" onclick="toggleLyrics(this)">
                            <i class="fas fa-music"></i>
                            <span>Letra / Detalhes</span>
                            <span class="arrow">&#9660;</span>
                        </div>
                        <div class="lyrics-area mt-3">
                            <p class="font-inter text-gray-400 text-sm leading-relaxed italic">${musica.letra || 'Letra não disponível no momento.'}</p>
                            <div class="mt-4 pt-4 border-t border-neon-purple/20">
                                <p class="font-inter text-xs text-gray-500">Composição: ${musica.compositor || 'Siebra Neto'}</p>
                                <p class="font-inter text-xs text-gray-500 mt-1">Gênero: ${musica.genero || 'A definir'}</p>
                                <p class="font-inter text-xs text-gray-500 mt-1">Lançamento: ${musica.data_lancamento || 'a confirmar'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);
    });

    initSwiper();
}

function initSwiper() {
    if (lancamentosSwiper) lancamentosSwiper.destroy(true, true);
    const cont = document.querySelector('.lancamentos-swiper');
    if (cont && !cont.querySelector('.autoplay-progress')) {
        cont.insertAdjacentHTML('beforeend', '<div class="autoplay-progress"><span></span></div>');
    }
    const total = document.querySelectorAll('.lancamentos-swiper .swiper-slide').length;
    lancamentosSwiper = new Swiper('.lancamentos-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        centeredSlides: true,
        // Com 3+ slides usa loop infinito; com 1-2 usa "rewind" (volta ao primeiro), mais estável.
        loop: total >= 3,
        rewind: total >= 2 && total < 3,
        grabCursor: true,
        effect: 'coverflow',
        coverflowEffect: { rotate: 5, stretch: 0, depth: 100, modifier: 1, slideShadows: false },
        // Transição longa e suave (1,4s). O delay é contado DEPOIS da transição,
        // então 3,6s + 1,4s = ciclo total de 5s por slide.
        speed: 1400,
        autoplay: total >= 2 ? { delay: 3600, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
        on: {
            autoplayTimeLeft(_s, _t, progress) {
                const barra = document.querySelector('.autoplay-progress span');
                if (barra) barra.style.width = ((1 - progress) * 100) + '%';
            }
        },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: { 768: { slidesPerView: 1.3, spaceBetween: 40 } }
    });
}


// =============================================================================
// DISCOGRAFIA AUTOMÁTICA (substitui o player "Top tracks" do Spotify)
// Lista todos os lançamentos do releases.json, MAIS NOVO PRIMEIRO.
// =============================================================================
function renderDiscografia(musicas) {
    const alvo = document.querySelector('.spotify-embed');
    if (!alvo) return;
    const ordenadas = [...musicas].sort((a, b) => new Date(b.data_lancamento || 0) - new Date(a.data_lancamento || 0));
    const fmt = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const embed = (m) => `https://open.spotify.com/embed/${m.tipo === 'track' ? 'track' : 'album'}/${m.id}?utm_source=generator&theme=0`;

    alvo.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div>
                <p class="font-ubuntu text-xl font-bold text-white">Siebra Neto</p>
                <p class="font-inter text-xs text-gray-400">Discografia · ${ordenadas.length} ${ordenadas.length === 1 ? 'lançamento' : 'lançamentos'}</p>
            </div>
            <a href="https://open.spotify.com/artist/0bKK5d0pmO8aLjYmGjXeAn" target="_blank" rel="noopener noreferrer"
               class="px-4 py-2 rounded-full border border-[#1DB954]/60 text-[#1DB954] font-inter text-xs font-semibold hover:bg-[#1DB954] hover:text-black transition-colors">
                <i class="fab fa-spotify mr-1"></i>Seguir no Spotify
            </a>
        </div>
        <iframe id="disco-player" style="border-radius:12px" src="${ordenadas.length ? embed(ordenadas[0]) : ''}" width="100%" height="152"
            frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        <ul id="disco-lista" class="mt-4 space-y-2 overflow-y-auto pr-1" style="max-height:230px;">
            ${ordenadas.map((m, i) => `
                <li class="disco-item flex items-center gap-3 p-2 rounded-xl cursor-pointer border ${i === 0 ? 'border-neon-pink/60 bg-white/5' : 'border-white/5 hover:border-neon-purple/50 hover:bg-white/5'} transition-all" data-embed="${embed(m)}">
                    <span class="w-5 text-center font-inter text-xs text-gray-500">${i + 1}</span>
                    <div class="w-11 h-11 rounded-lg bg-cover bg-center flex-shrink-0 bg-white/10" ${m.capa_url ? `style="background-image:url(${m.capa_url})"` : ''}></div>
                    <div class="min-w-0 flex-1">
                        <p class="font-inter text-sm font-semibold text-white truncate">${m.titulo}</p>
                        <p class="font-inter text-xs text-gray-500">${fmt(m.data_lancamento)}${i === 0 ? ' · <span class="text-neon-pink">mais recente</span>' : ''}</p>
                    </div>
                    <i class="fas fa-play text-xs text-gray-400"></i>
                </li>`).join('')}
        </ul>`;

    alvo.querySelectorAll('.disco-item').forEach((li) => {
        li.addEventListener('click', () => {
            document.getElementById('disco-player').src = li.dataset.embed;
            alvo.querySelectorAll('.disco-item').forEach((x) => { x.classList.remove('border-neon-pink/60', 'bg-white/5'); x.classList.add('border-white/5'); });
            li.classList.remove('border-white/5'); li.classList.add('border-neon-pink/60', 'bg-white/5');
        });
    });
}

async function carregarLancamentos() {
    const RESERVA = [{ id: '2Xr8ox7FHyXuF4gMVN1oPG', tipo: 'track', titulo: 'Sem luva de seda', compositor: 'Siebra Neto', genero: 'MPB / Rock / Reggae', data_lancamento: null, capa_url: null }];
    try {
        const [r, l] = await Promise.all([
            fetch('releases.json?t=' + Date.now()),
            fetch('letras.json?t=' + Date.now()).catch(() => null)
        ]);
        if (!r.ok) throw new Error('releases.json indisponível');
        const dados = await r.json();
        const letras = l && l.ok ? await l.json() : {};
        musicasSpotify = (dados.lancamentos || []).map(m => ({
            ...m,
            letra: letras[m.id] || m.letra || 'A letra desta composição será disponibilizada em breve.'
        }));
        if (!musicasSpotify.length) throw new Error('lista vazia');
    } catch (e) {
        console.warn('Usando lista de reserva:', e);
        musicasSpotify = RESERVA;
    }
    renderDiscografia(musicasSpotify);
    renderizarSlides(musicasSpotify);
}

function toggleLyrics(el) {
    el.classList.toggle('active');
    el.nextElementSibling.classList.toggle('expanded');
}

function createParticles() {
    const c = document.getElementById('particles');
    const cores = ['#ff2d75', '#b026ff', '#4d6bff', '#1DB954'];
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const s = Math.random() * 5 + 1, cor = cores[Math.floor(Math.random() * cores.length)];
        p.style.width = p.style.height = s + 'px';
        p.style.background = cor;
        p.style.boxShadow = `0 0 ${s * 3}px ${cor}`;
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 15 + 10) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        c.appendChild(p);
    }
}

function createMusicalNotes() {
    const c = document.getElementById('musical-notes');
    const notas = ['\u266A', '\u266B', '\u266C', '\u2669', '\uD83C\uDFB5', '\uD83C\uDFB6'];
    const cores = ['rgba(255, 45, 117, 0.5)', 'rgba(176, 38, 255, 0.5)', 'rgba(77, 107, 255, 0.4)'];
    for (let i = 0; i < 15; i++) {
        const n = document.createElement('div');
        n.classList.add('musical-note');
        n.textContent = notas[Math.floor(Math.random() * notas.length)];
        n.style.color = cores[Math.floor(Math.random() * cores.length)];
        n.style.left = Math.random() * 100 + '%';
        n.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
        n.style.animationDuration = (Math.random() * 20 + 15) + 's';
        n.style.animationDelay = (Math.random() * 15) + 's';
        c.appendChild(n);
    }
}

function createSoundWaveBg() {
    const c = document.getElementById('soundWaveBg');
    for (let i = 0; i < 80; i++) {
        const b = document.createElement('div');
        b.classList.add('sw-bar');
        b.style.setProperty('--max-h', (Math.random() * 80 + 20) + 'px');
        b.style.animationDelay = (Math.random() * 2) + 's';
        b.style.animationDuration = (Math.random() * 1 + 1) + 's';
        c.appendChild(b);
    }
}

function handleScrollAnimations() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-up').forEach(el => obs.observe(el));
}

function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.add('hidden')));
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const alvo = document.querySelector(this.getAttribute('href'));
            if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarLancamentos();
    createParticles();
    createMusicalNotes();
    createSoundWaveBg();
    handleScrollAnimations();
    setupMobileMenu();
    setupSmoothScroll();
});
