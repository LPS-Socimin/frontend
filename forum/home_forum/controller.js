(async function() {
    const token = localStorage.getItem('socimin_token');
    const feedForuns = document.getElementById('feed-foruns');
    const createForumContainer = document.getElementById('create-forum-container');
    const searchInput = document.getElementById('forum-search-input');
    const searchButton = document.getElementById('forum-search-button');

    // Botão de Voltar (leva para perfil se logado, ou auth se não)
    document.getElementById('btn-voltar-inicio').addEventListener('click', (e) => {
        e.preventDefault();
        carregarModulo(token ? 'home_pessoal/perfil' : 'auth');
    });

    // Adiciona botão "Criar Fórum" se o usuário estiver logado
    if (token) {
        createForumContainer.innerHTML = `<button id="btn-create-forum" class="btn-primario">Criar Novo Fórum</button>`;
        document.getElementById('btn-create-forum').addEventListener('click', () => carregarModulo('forum/home_forum/criar_forum'));
    }

    // Função para buscar e renderizar os fóruns
    const fetchAndRenderForums = async (query = '') => {
        feedForuns.innerHTML = '<p>Carregando fóruns...</p>';
        const endpoint = query ? `/?q=${encodeURIComponent(query)}` : '/';
        const res = await Gateway.request('forum', endpoint);

        feedForuns.innerHTML = ''; // Limpa antes de renderizar
        if (res.ok && res.data.forums && res.data.forums.length > 0) {
            res.data.forums.forEach(forum => {
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
                        <span>Criado em ${new Date(forum.created_at).toLocaleDateString()}</span>
                    </div>
                `;
                feedForuns.appendChild(article);
            });
        } else {
            feedForuns.innerHTML = `<p style="text-align:center; padding: 20px;">Nenhum fórum encontrado ${query ? `com o termo "${query}"` : ''}.</p>`;
        }
    };

    // Lógica da busca
    searchButton.addEventListener('click', () => {
        fetchAndRenderForums(searchInput.value);
    });
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            fetchAndRenderForums(searchInput.value);
        }
    });

    // Carga inicial
    fetchAndRenderForums();
})();
