// =============================================================================
        // ===== RENDERIZAÇÃO DINÂMICA DOS SLIDES - REGRA DE ORDENAÇÃO =================
        // =============================================================================
        //
        // REGRA DE ORDENAÇÃO: Mais recentes primeiro.
        // Os slides são ordenados pela propriedade `data_lancamento` de forma DECRESCENTE
        // (do mais recente para o mais antigo). Quando o backend for conectado à
        // Spotify Web API, manter esta mesma ordenação na resposta da API.
        //
        // IMPORTANTE: A Spotify Web API requer autenticação OAuth2 via backend.
        // O Client Secret NUNCA deve ser exposto no frontend.
        // Referência: https://developer.spotify.com/documentation/web-api
        //
        // Quando o backend estiver pronto, substitua a constante `musicasSpotify` abaixo
        // por uma chamada `fetch()` ao seu endpoint (ex: /api/spotify/tracks).
        // A estrutura de cada objeto deve conter pelo menos: { id, data_lancamento, titulo }
        // Campos opcionais: { letra, genero, compositor, capa_url }
        //
        // =============================================================================

        // ===== DADOS DAS MÚSICAS (simulando retorno da API do Spotify) =====
        // Quando novas músicas forem adicionadas ao perfil do compositor no Spotify,
        // basta adicionar novos objetos a este array (ou conectar ao backend).
        // A ordenação é feita automaticamente pelo JavaScript abaixo.
        const musicasSpotify = [
            {
                id: '2Xr8ox7FHyXuF4gMVN1oPG',
                data_lancamento: '2024-06-29',
                titulo: 'Lançamento',
                compositor: 'Siebra Neto',
                genero: 'MPB / Rock / Reggae',
                letra: 'A letra desta composição será disponibilizada em breve. Acompanhe as redes sociais do Siebra Neto para novidades sobre este lançamento.',
                capa_url: null // Quando disponível, insira a URL da capa do single aqui
            }
            // =====================================================================
            // EXEMPLO: Para adicionar uma nova música, copie o bloco abaixo e
            // preencha com os dados. O sistema ordenará automaticamente.
            // =====================================================================
            // ,{
            //     id: 'SPOTIFY_TRACK_ID_AQUI',
            //     data_lancamento: '2025-01-15',
            //     titulo: 'Nome da Música',
            //     compositor: 'Siebra Neto',
            //     genero: 'Rock / MPB',
            //     letra: 'Letra da música aqui...',
            //     capa_url: 'https://url-da-capa.jpg'
            // }
        ];

        // =============================================================================
        // ===== FUNÇÃO DE RENDERIZAÇÃO DINÂMICA DOS SLIDES ============================
        // =============================================================================
        //
        // REGRA DE ORDENAÇÃO: Mais recentes primeiro.
        // Esta função recebe o array de músicas, ordena por data_lancamento (decrescente),
        // gera o HTML dos slides e insere no container .swiper-wrapper.
        // O Swiper é inicializado SOMENTE APÓS a inserção dos slides no DOM.
        //
        // =============================================================================
        function renderizarSlides(musicas) {

            // =========================================================================
            // REGRA DE ORDENAÇÃO: Mais recentes primeiro.
            // Ordena o array pela propriedade `data_lancamento` de forma DECRESCENTE.
            // Quando o backend for conectado, manter esta ordenação na API.
            // =========================================================================
            const musicasOrdenadas = [...musicas].sort((a, b) => {
                return new Date(b.data_lancamento) - new Date(a.data_lancamento);
            });

            const swiperWrapper = document.querySelector('.lancamentos-swiper .swiper-wrapper');
            swiperWrapper.innerHTML = ''; // Limpa qualquer conteúdo anterior

            // Gera um slide para cada música ordenada
            musicasOrdenadas.forEach((musica, index) => {
                const slideHTML = `
                    <div class="swiper-slide">
                        <div class="slide-card">
                            <!-- Banner Visual -->
                            <div class="slide-banner" ${musica.capa_url ? `style="background-image: url(${musica.capa_url}); background-size: cover; background-position: center;"` : ''}>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    ${musica.capa_url ? '' : `
                                    <div class="equalizer" style="height:60px; opacity:0.4;">
                                        <div class="bar" style="width:6px;"></div>
                                        <div class="bar" style="width:6px;"></div>
                                        <div class="bar" style="width:6px;"></div>
                                        <div class="bar" style="width:6px;"></div>
                                        <div class="bar" style="width:6px;"></div>
                                        <div class="bar" style="width:6px;"></div>
                                        <div class="bar" style="width:6px;"></div>
                                        <div class="bar" style="width:6px;"></div>
                                    </div>
                                    `}
                                </div>
                            </div>

                            <!-- Track Info -->
                            <div class="p-6">
                                <div class="flex items-center gap-3 mb-4">
                                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-900/40 to-green-700/20 border border-green-500/30 text-green-400 text-xs font-inter font-semibold">
                                        <i class="fas fa-fire text-orange-400"></i> ${musica.titulo}
                                    </span>
                                    <span class="text-xs text-gray-500 font-inter">${musica.data_lancamento.substring(0, 4)}</span>
                                </div>

                                <h3 class="font-ubuntu text-2xl font-bold text-white mb-4 neon-text">${musica.titulo}</h3>

                                <!-- Spotify Embed -->
                                <div class="featured-track mb-4">
                                    <iframe 
                                        style="border-radius:12px" 
                                        src="https://open.spotify.com/embed/track/${musica.id}?utm_source=generator&theme=0" 
                                        width="100%" 
                                        height="152" 
                                        frameBorder="0" 
                                        allowfullscreen="" 
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                                        loading="lazy">
                                    </iframe>
                                </div>

                                <!-- Lyrics Toggle -->
                                <div class="lyrics-toggle flex items-center gap-2 text-neon-purple font-inter text-sm font-semibold" onclick="toggleLyrics(this)">
                                    <i class="fas fa-music"></i>
                                    <span>Letra / Detalhes</span>
                                    <span class="arrow">&#9660;</span>
                                </div>
                                <div class="lyrics-area mt-3">
                                    <p class="font-inter text-gray-400 text-sm leading-relaxed italic">
                                        ${musica.letra || 'Letra não disponível no momento.'}
                                    </p>
                                    <div class="mt-4 pt-4 border-t border-neon-purple/20">
                                        <p class="font-inter text-xs text-gray-500">Composição: ${musica.compositor || 'Siebra Neto'}</p>
                                        <p class="font-inter text-xs text-gray-500 mt-1">Gênero: ${musica.genero || 'A definir'}</p>
                                        <p class="font-inter text-xs text-gray-500 mt-1">Lançamento: ${musica.data_lancamento}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                swiperWrapper.insertAdjacentHTML('beforeend', slideHTML);
            });

            // =========================================================================
            // IMPORTANTE: O Swiper é inicializado APÓS a inserção dos slides no DOM.
            // Se inicializar antes, o carrossel não funcionará corretamente.
            // =========================================================================
            initSwiper();
        }

        // ===== INICIALIZAÇÃO DO SWIPER (chamada APÓS renderização dos slides) =====
        let lancamentosSwiper = null;

        function initSwiper() {
            // Destroi instância anterior se existir (útil ao atualizar dados)
            if (lancamentosSwiper) {
                lancamentosSwiper.destroy(true, true);
            }

            lancamentosSwiper = new Swiper('.lancamentos-swiper', {
                slidesPerView: 1,
                spaceBetween: 30,
                centeredSlides: true,
                loop: musicasSpotify.length > 1, // Loop apenas se houver mais de 1 slide
                grabCursor: true,
                effect: 'coverflow',                coverflowEffect: {
                    rotate: 5,                    stretch: 0,
                    depth: 100,                    modifier: 1,
                    slideShadows: false,                },
                pagination: {
                    el: '.swiper-pagination',                    clickable: true,                },
                navigation: {
                    nextEl: '.swiper-button-next',                    prevEl: '.swiper-button-prev',                },
                breakpoints: {
                    768: {
                        slidesPerView: 1.3,
                        spaceBetween: 40,
                    }
                }
            });
        }

        // =============================================================================
        // REGRA DE ORDENAÇÃO: Mais recentes primeiro.
        // Chamada principal: renderiza os slides ordenados e inicializa o Swiper.
        // Quando o backend estiver pronto, substitua `musicasSpotify` pelo retorno
        // da sua API (ex: fetch('/api/spotify/tracks').then(res => res.json()).then(renderizarSlides))
        // =============================================================================
        renderizarSlides(musicasSpotify);

        // ===== LYRICS TOGGLE =====
        function toggleLyrics(element) {
            const lyricsArea = element.nextElementSibling;
            element.classList.toggle('active');
            lyricsArea.classList.toggle('expanded');
        }

        // ===== PARTICLE SYSTEM =====
        function createParticles() {
            const container = document.getElementById('particles');
            const particleCount = 40;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                const size = Math.random() * 5 + 1;
                const colors = ['#ff2d75', '#b026ff', '#4d6bff', '#1DB954'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.background = color;
                particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
                particle.style.animationDelay = (Math.random() * 10) + 's';
                
                container.appendChild(particle);
            }
        }

        // ===== MUSICAL NOTES FLOATING =====
        function createMusicalNotes() {
            const container = document.getElementById('musical-notes');
            const notes = ['\u266A', '\u266B', '\u266C', '\u2669', '\uD83C\uDFB5', '\uD83C\uDFB6'];
            const noteCount = 15;

            for (let i = 0; i < noteCount; i++) {
                const note = document.createElement('div');
                note.classList.add('musical-note');
                note.textContent = notes[Math.floor(Math.random() * notes.length)];
                
                const colors = ['rgba(255, 45, 117, 0.5)', 'rgba(176, 38, 255, 0.5)', 'rgba(77, 107, 255, 0.4)'];
                note.style.color = colors[Math.floor(Math.random() * colors.length)];
                note.style.left = Math.random() * 100 + '%';
                note.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
                note.style.animationDuration = (Math.random() * 20 + 15) + 's';
                note.style.animationDelay = (Math.random() * 15) + 's';
                
                container.appendChild(note);
            }
        }

        // ===== SOUND WAVE BACKGROUND (bottom) =====
        function createSoundWaveBg() {
            const container = document.getElementById('soundWaveBg');
            const barCount = 80;

            for (let i = 0; i < barCount; i++) {
                const bar = document.createElement('div');
                bar.classList.add('sw-bar');
                
                const height = Math.random() * 60 + 10;
                bar.style.setProperty('--max-h', height + 'px');
                bar.style.animationDelay = (Math.random() * 2) + 's';
                bar.style.animationDuration = (Math.random() * 0.5 + 1) + 's';
                
                container.appendChild(bar);
            }
        }

        // ===== MOBILE MENU TOGGLE =====
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });

        // ===== INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS =====
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in-up').forEach(el => {
            observer.observe(el);
        });

        // Initialize Background Systems
        createParticles();
        createMusicalNotes();
        createSoundWaveBg();