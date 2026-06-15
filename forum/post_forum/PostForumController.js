(async function() {
    const params = new URLSearchParams(window.location.search);
    let forumId = params.get('forum_id') || params.get('id');

    // Helper: attempt to extract forum_id from an arbitrary string
    const extractFromString = (s) => {
        if (!s) return null;
        try {
            const decoded = decodeURIComponent(s);
            const qIdx = decoded.indexOf('?');
            const candidate = qIdx >= 0 ? decoded.substring(qIdx + 1) : decoded;
            const p = new URLSearchParams(candidate);
            return p.get('forum_id') || p.get('id') || null;
        } catch (e) {
            // If decodeURIComponent fails, try raw
            const qIdx = s.indexOf('?');
            const candidate = qIdx >= 0 ? s.substring(qIdx + 1) : s;
            const p = new URLSearchParams(candidate);
            return p.get('forum_id') || p.get('id') || null;
        }
    };

    // Suporte para router que usa ?tela=forum/view_forum?id=... (pode ser codificado)
    if (!forumId) {
        const telaParam = params.get('tela');
        forumId = extractFromString(telaParam);
    }

    // Fallbacks adicionais: verificar se o query foi codificado em toda a search ou em href
    if (!forumId) {
        // Ex: ?tela=forum%2Fpost_forum%3Fforum_id%3D123
        const rawSearch = window.location.search || '';
        forumId = extractFromString(rawSearch);
    }
    if (!forumId) {
        const href = window.location.href || '';
        forumId = extractFromString(href);
    }

    // Último recurso: verificar o estado do histórico (pushState/modulo)
    try {
        if (!forumId && window.history && window.history.state && window.history.state.modulo) {
            forumId = extractFromString(window.history.state.modulo);
        }
    } catch (e) {
        // ignore
    }

    // Fallback: some routers may put query in the hash
    if (!forumId && window.location.hash && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hParams = new URLSearchParams(hashQuery);
        forumId = hParams.get('forum_id') || hParams.get('id');
    }
    // Fallback: último fórum criado nesta sessão (se disponível)
    if (!forumId) {
        try { forumId = localStorage.getItem('socimin_last_forum_id') || null; } catch (e) { /* ignore */ }
    }
    const token = localStorage.getItem('socimin_token');

    // Proteção de Rota: se não estiver logado ou não houver ID do fórum, volta.
    if (!token) {
        carregarModulo('auth');
        return;
    }
    if (!forumId) {
        alert("ID do fórum não especificado. Verifique a navegação e tente novamente.");
        carregarModulo('forum/home_forum');
        return;
    }

    // Se for um forum mockado, informe que não é possível postar nele
    if (typeof forumId === 'string' && forumId.startsWith && forumId.startsWith('mock-')) {
        alert('Este é um fórum de demonstração; criar posts não é suportado aqui.');
        carregarModulo('forum/home_forum');
        return;
    }

    const form = document.getElementById('form-create-post');
    const cancelBtn = document.getElementById('btn-cancel-post');
    const forumTitleInput = document.getElementById('post-forum-title-input');

    // Busca o nome do fórum para dar contexto ao usuário
    const forumRes = await Gateway.request('forum', `/${forumId}`);
    if(forumRes.ok) {
        if (forumTitleInput) forumTitleInput.value = forumRes.data.title;
    }

    // Preenche o ID do usuário logado (apenas visual) quando possível
    try {
        const auth = await Gateway.validarTokenAutenticacao(localStorage.getItem('socimin_token'));
        if (auth && auth.valido && auth.user) {
            // user id is not shown anymore; controllers use the token server-side
        }
    } catch (e) {
        // ignora
    }

    if (cancelBtn) {
        cancelBtn.textContent = 'Voltar a Fóruns';
        cancelBtn.addEventListener('click', () => carregarModulo('forum/home_forum'));
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Publicando...";

        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const video_url = document.getElementById('post-video').value || null;
        const imageFileEl = document.getElementById('post-image-file');
        const imageFile = (imageFileEl && imageFileEl.files && imageFileEl.files.length > 0) ? imageFileEl.files[0] : null;

        let result;
        if (imageFile) {
            result = await Gateway.criarPostForum(forumId, title, content, null, imageFile, video_url);
        } else {
            result = await Gateway.criarPostForum(forumId, title, content, null, null, video_url);
        }

        if (result.ok) {
            alert('Post criado com sucesso!');
            carregarModulo(`forum/view_forum?id=${forumId}`);
        } else {
            const msg = result.data?.error || result.raw || result.error || `Status ${result.status}`;
            alert(`Erro ao criar post: ${msg}`);
            console.error('Detalhes da falha ao criar post (forum):', result);
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Publicar Post";
        }
    });
})();
