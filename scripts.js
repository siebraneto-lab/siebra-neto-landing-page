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
    lancamentosSwiper = new Swiper('.lancamentos-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        centeredSlides: true,
        loop: document.querySelectorAll('.lancamentos-swiper .swiper-slide').length > 1,
        grabCursor: true,
        effect: 'coverflow',
        coverflowEffect: { rotate: 5, stretch: 0, depth: 100, modifier: 1, slideShadows: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: { 768: { slidesPerView: 1.3, spaceBetween: 40 } }
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
