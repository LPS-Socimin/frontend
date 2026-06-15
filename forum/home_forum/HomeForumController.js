(async function() {
    const token = localStorage.getItem('socimin_token');
    const feedForuns = document.getElementById('feed-foruns');
    const createForumContainer = document.getElementById('create-forum-container');
    const searchInput = document.getElementById('forum-search-input');
    const searchButton = document.getElementById('forum-search-button');

    // Botão de Voltar: comportamento dependente de quem chamou a página
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const handleFrom = params.get('handle');
    const btnVoltarInicio = document.getElementById('btn-voltar-inicio');
    if (btnVoltarInicio) {
        if (from === 'perfil' && handleFrom) {
            btnVoltarInicio.textContent = 'Voltar ao Perfil';
            btnVoltarInicio.addEventListener('click', (e) => {
                e.preventDefault();
                carregarModulo(`home_pessoal/perfil?handle=${encodeURIComponent(handleFrom)}`);
            });
        } else if (token) {
            btnVoltarInicio.textContent = 'Voltar ao Meu Perfil';
            btnVoltarInicio.addEventListener('click', (e) => {
                e.preventDefault();
                carregarModulo('home_pessoal/perfil');
            });
        } else {
            btnVoltarInicio.textContent = 'Voltar ao Login';
            btnVoltarInicio.addEventListener('click', (e) => {
                e.preventDefault();
                carregarModulo('auth');
            });
        }
    }

    // Adiciona botão "Criar Fórum" se o usuário estiver logado
    if (token) {
        createForumContainer.innerHTML = `<button id="btn-create-forum" class="btn-primario">Criar Novo Fórum</button>`;
        document.getElementById('btn-create-forum').addEventListener('click', () => carregarModulo('forum/home_forum/criar_forum'));
    }

    // Mocks de demonstração (sempre disponíveis)
    const MOCK_FORUMS = [
        { id: 'mock-1', title: 'Dicas de Infraestrutura', description: 'Discussões sobre cabeamento, redes e infraestrutura.', created_at: new Date(), thumb: 'forum/home_forum/cabos.jpg' },
        { id: 'mock-2', title: 'Programação Frontend', description: 'Técnicas, frameworks e melhores práticas em frontend.', created_at: new Date(Date.now() - 3600*1000), thumb: 'forum/home_forum/cabos.jpg' },
        { id: 'mock-3', title: 'Banco de Dados', description: 'Modelagem, performance e consultas eficientes.', created_at: new Date(Date.now() - 7200*1000), thumb: 'forum/home_forum/cabos.jpg' }
    ];

    const matchesQuery = (item, q) => {
        if (!q) return true;
        const s = q.toLowerCase();
        return (item.title || '').toLowerCase().includes(s) || (item.description || '').toLowerCase().includes(s);
    };

    // Função para buscar e renderizar os fóruns
    const fetchAndRenderForums = async (query = '') => {
        feedForuns.innerHTML = '<p>Carregando fóruns...</p>';
        const endpoint = query ? `/?q=${encodeURIComponent(query)}` : '/';
        // Tenta obter resultados do backend (se disponível)
        let res = { ok: false, data: null };
        try {
            res = await Gateway.request('forum', endpoint);
        } catch (e) {
            console.warn('Erro ao solicitar fóruns ao backend:', e);
        }

        feedForuns.innerHTML = ''; // Limpa antes de renderizar

        // Filtra mocks pelo termo de busca (se houver)
        const mocksToRender = MOCK_FORUMS.filter(m => matchesQuery(m, query));

        // Renderiza mocks primeiro (se houver)
        if (mocksToRender.length > 0) {
            mocksToRender.forEach(forum => {
                const article = document.createElement('article');
                article.className = 'forum-card';
                article.innerHTML = `
                    <a href="javascript:carregarModulo('forum/view_forum?id=${forum.id}')" class="forum-card-link">
                        <div style="display:flex; gap:12px; align-items:center;">
                            <img src="${forum.thumb}" alt="thumb" style="width:84px;height:64px;object-fit:cover;border-radius:8px;flex-shrink:0;"/>
                            <div style="flex:1;">
                                <h3 class="forum-title">${forum.title} <small style=\"color:#888; font-weight:600; margin-left:8px;\">(demo)</small></h3>
                                <p class="forum-description">${forum.description}</p>
                            </div>
                        </div>
                        <div class="forum-card-footer">Criado em ${new Date(forum.created_at).toLocaleDateString()}</div>
                    </a>
                `;
                feedForuns.appendChild(article);
                // botão Interagir para usuários logados
                if (token) {
                    const actionWrap = document.createElement('div');
                    actionWrap.style.padding = '8px 12px';
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'btn-primario';
                    btn.textContent = 'Interagir';
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        carregarModulo(`forum/post_forum?forum_id=${forum.id}`);
                    });
                    actionWrap.appendChild(btn);
                    article.appendChild(actionWrap);
                }
            });
        }

        // Se houver dados reais do backend, renderize abaixo dos mocks
        let backendCount = 0;
        if (res.ok && res.data) {
            // Alguns backends retornam { forums: [...] } ou simplesmente um array
            const forums = Array.isArray(res.data) ? res.data : (res.data.forums || []);
            const filtered = query ? forums.filter(f => matchesQuery(f, query)) : forums;
            filtered.forEach(forum => {
                const article = document.createElement('article');
                article.className = 'forum-card';
                article.innerHTML = `
                    <div class="forum-card-content">
                        <a href="javascript:carregarModulo('forum/view_forum?id=${forum.id}')" class="forum-card-link">
                            <h3 class="forum-title">${forum.title}</h3>
                        </a>
                        <p class="forum-description">${forum.description || 'Sem descrição.'}</p>
                    </div>
                    <div class="forum-card-footer">
                        <span>Criado em ${forum.created_at ? new Date(forum.created_at).toLocaleDateString() : ''}</span>
                    </div>
                `;
                feedForuns.appendChild(article);
                // botão Interagir (aparece somente para usuários logados)
                if (token) {
                    const actions = document.createElement('div');
                    actions.style.padding = '8px 12px';
                    const btnInteract = document.createElement('button');
                    btnInteract.type = 'button';
                    btnInteract.className = 'btn-primario';
                    btnInteract.textContent = 'Interagir';
                    btnInteract.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        carregarModulo(`forum/post_forum?forum_id=${forum.id}`);
                    });
                    actions.appendChild(btnInteract);
                    article.appendChild(actions);
                }
            });
            backendCount = filtered.length;
        }

        // Se nenhum mock nem backend bateu com a busca, mostrar nota de 'nenhum resultado'
        if ((mocksToRender.length + backendCount) === 0) {
            const nota = document.createElement('div');
            nota.style.padding = '12px';
            nota.style.color = '#666';
            nota.style.textAlign = 'center';
            nota.textContent = query ? `Nenhum fórum encontrado com o termo "${query}".` : 'Fóruns de demonstração exibidos abaixo.';
            feedForuns.appendChild(nota);
        }
    };

    // Lógica da busca (verifica elementos antes de usar)
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            fetchAndRenderForums(searchInput.value || '');
        });
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                fetchAndRenderForums(searchInput.value || '');
            }
        });
    }

    // Carga inicial
    fetchAndRenderForums();
})();
