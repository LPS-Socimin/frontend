(async function() {
    // Extrai parâmetro 'id' da URL. Suporta dois formatos:
    // - ?id=... (direto)
    // - ?tela=forum/view_forum?id=... (quando o router usa ?tela=...)
    const params = new URLSearchParams(window.location.search);
    let forumId = params.get('id');
    if (!forumId) {
        const telaParam = params.get('tela');
        if (telaParam) {
            const qIndex = telaParam.indexOf('?');
            if (qIndex >= 0) {
                const sub = telaParam.substring(qIndex + 1);
                const subParams = new URLSearchParams(sub);
                forumId = subParams.get('id');
            }
        }
    }
    const token = localStorage.getItem('socimin_token');

    const titleEl = document.getElementById('forum-title');
    const descriptionEl = document.getElementById('forum-description');
    const postsContainer = document.getElementById('posts-container');
    const createPostBtn = document.getElementById('btn-create-post');
    const backBtn = document.getElementById('btn-back');

    // Lógica do botão Voltar: sempre retornar para a tela de explorar fóruns
    if (backBtn) {
        backBtn.textContent = 'Voltar a Fóruns';
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            carregarModulo('forum/home_forum');
        });
    }

    if (!forumId) {
        titleEl.textContent = "ID do Fórum não encontrado!";
        return;
    }

    // Mostra o botão de criar post se o usuário estiver logado
    if (token) {
        createPostBtn.style.display = 'inline-block';
        createPostBtn.textContent = 'Interagir';
        createPostBtn.setAttribute('title', 'Interagir neste fórum (criar post)');
        createPostBtn.addEventListener('click', () => carregarModulo(`forum/post_forum?forum_id=${forumId}`));
    }

    // Se for um forum mockado (id começando com 'mock-'), renderiza conteúdo de demonstração local
    if (forumId && forumId.startsWith && forumId.startsWith('mock-')) {
        const demoMap = {
            'mock-1': { title: 'Dicas de Infraestrutura', description: 'Discussões sobre cabeamento, redes e infraestrutura.' },
            'mock-2': { title: 'Programação Frontend', description: 'Técnicas, frameworks e melhores práticas em frontend.' },
            'mock-3': { title: 'Banco de Dados', description: 'Modelagem, performance e consultas eficientes.' }
        };
        const demo = demoMap[forumId] || { title: 'Fórum de Demonstração', description: 'Conteúdo de exemplo.' };
        titleEl.textContent = `Fórum: ${demo.title}`;
        descriptionEl.textContent = demo.description;

        postsContainer.innerHTML = '';
        const samplePosts = [
            { user_id: 'demo1', created_at: new Date(), title: 'Boas-vindas', content: 'Este é um post de apresentação do fórum demo.' , image: 'forum/home_forum/cabos.jpg'},
            { user_id: 'demo2', created_at: new Date(Date.now()-3600*1000), title: 'Pergunta Exemplo', content: 'Alguém já teve problemas com latência em switches gerenciáveis? Compartilhe suas experiências.' }
        ];

        samplePosts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-card';
            const authorInitial = (post.user_id && post.user_id.toString().charAt(0)) || 'U';
            article.innerHTML = `
                <div class="post-header">
                    <div class="post-author-avatar">${authorInitial}</div>
                    <div class="post-author-info">
                        <span class="post-author">${post.user_id}</span>
                        <span class="post-date">${new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-text">${post.content}</p>
                ${post.image ? `<div class="post-media"><img src="${post.image}" alt="Imagem do post" class="post-image" style="max-width:100%; border-radius:8px; margin-top:8px;"></div>` : ''}
            `;
            postsContainer.appendChild(article);
        });
        return;
    }

    // Otimização: Buscar detalhes do fórum e posts em paralelo
    const [forumRes, postsRes] = await Promise.all([
        Gateway.request('forum', `/${forumId}`),
        Gateway.request('forum', `/posts?forum_id=${forumId}`)
    ]);

    if (forumRes.ok) {
        titleEl.textContent = `Fórum: ${forumRes.data.title}`;
        descriptionEl.textContent = forumRes.data.description || 'Bem-vindo a este fórum.';
    } else {
        titleEl.textContent = "Fórum não encontrado";
        return;
    }

    postsContainer.innerHTML = ''; // Limpar
    if (postsRes.ok && postsRes.data.posts && postsRes.data.posts.length > 0) {
        postsRes.data.posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-card';
            // Lógica para criar um placeholder de avatar com a inicial
            const authorInitial = post.user_id.toString()[0]; // Simplificado para usar ID
            article.innerHTML = `
                <div class="post-header">
                    <div class="post-author-avatar">${authorInitial}</div>
                    <div class="post-author-info">
                        <span class="post-author">User ID: ${post.user_id}</span>
                        <span class="post-date">${new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-text">${post.content}</p>
                ${post.image_id ? `<div class="post-media"><img src="http://localhost:8000/storage/${post.image_id}" alt="Imagem do post" class="post-image"></div>` : ''}
                ${post.video_url ? `<a href="${post.video_url}" target="_blank" class="post-video-link">Assistir vídeo</a>` : ''}
            `;
            postsContainer.appendChild(article);
        });
    } else {
        postsContainer.innerHTML = '<p style="text-align: center; padding: 20px; font-style: italic; color: #666;">Fórum vazio.</p>';
    }

})();
