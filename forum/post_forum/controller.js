(async function() {
    const params = new URLSearchParams(window.location.search);
    const forumId = params.get('forum_id');
    const token = localStorage.getItem('socimin_token');

    // Proteção de Rota: se não estiver logado ou não houver ID do fórum, volta.
    if (!token) {
        carregarModulo('auth');
        return;
    }
    if (!forumId) {
        alert("ID do fórum não especificado.");
        carregarModulo('forum/home_forum');
        return;
    }

    const form = document.getElementById('form-create-post');
    const cancelBtn = document.getElementById('btn-cancel-post');
    const forumTitleEl = document.getElementById('post-forum-title');

    // Busca o nome do fórum para dar contexto ao usuário
    const forumRes = await Gateway.request('forum', `/${forumId}`);
    if(forumRes.ok) {
        forumTitleEl.textContent = `Postando no fórum: "${forumRes.data.title}"`;
    }

    cancelBtn.addEventListener('click', () => carregarModulo(`forum/view_forum?id=${forumId}`));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Publicando...";

        const data = {
            title: document.getElementById('post-title').value,
            content: document.getElementById('post-content').value,
            image_id: document.getElementById('post-image').value || null, // No futuro, isso seria um upload
            video_url: document.getElementById('post-video').value || null
        };

        const result = await Gateway.request('forum', `/${forumId}/posts`, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (result.ok) {
            alert('Post criado com sucesso!');
            carregarModulo(`forum/view_forum?id=${forumId}`);
        } else {
            alert(`Erro ao criar post: ${result.data?.error || 'Erro desconhecido'}`);
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Publicar Post";
        }
    });
})();
