(async function() {
    const params = new URLSearchParams(window.location.search);
    const forumId = params.get('id');
    const token = localStorage.getItem('socimin_token');

    const titleEl = document.getElementById('forum-title');
    const descriptionEl = document.getElementById('forum-description');
    const postsContainer = document.getElementById('posts-container');
    const createPostBtn = document.getElementById('btn-create-post');
    const backBtn = document.getElementById('btn-back');

    if (!forumId) {
        titleEl.textContent = "ID do Fórum não encontrado!";
        return;
    }

    // Lógica do botão Voltar
    backBtn.addEventListener('click', () => window.history.back());

    // Mostra o botão de criar post se o usuário estiver logado
    if (token) {
        createPostBtn.style.display = 'inline-block';
        createPostBtn.addEventListener('click', () => carregarModulo(`forum/post_forum?forum_id=${forumId}`));
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
