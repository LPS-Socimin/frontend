(async function() {
    const params = new URLSearchParams(window.location.search);
    const handle = params.get('handle');
    const tokenSalvo = localStorage.getItem('socimin_token');

    let profileData;
    let isOwner = false;

    // 1. DETERMINA O PERFIL A SER CARREGADO
    if (handle) {
        const viewedProfileRes = await Gateway.buscarPerfilPorHandle(handle);
        if (viewedProfileRes.ok) {
            profileData = viewedProfileRes.data;
            // Verifica se o usuário logado é o dono deste perfil
            if (tokenSalvo) {
                const myProfileRes = await Gateway.validarTokenAutenticacao(tokenSalvo);
                if (myProfileRes.valido && myProfileRes.user.id === profileData.user_id) {
                    isOwner = true;
                }
            }
        }
    } else if (tokenSalvo) {
        const myProfileRes = await Gateway.buscarDadosPerfil();
        if (myProfileRes.sucesso) {
            profileData = myProfileRes.dados_publicos;
            isOwner = true;
        }
    }

    const divErro = document.getElementById('erro-blog');
    const divConteudo = document.getElementById('conteudo-blog');

    // 2. VALIDAÇÃO E RENDERIZAÇÃO DO ERRO
    if (!profileData) {
        divErro.style.display = 'block';
        divConteudo.style.display = 'none';
        document.getElementById('btn-voltar-erro').addEventListener('click', () => carregarModulo(tokenSalvo ? 'home_pessoal/perfil' : 'auth'));
        return;
    }

    divErro.style.display = 'none';
    divConteudo.style.display = 'block';

    // 3. PREENCHIMENTO DE DADOS E POSTS
    document.getElementById('blog-titulo').textContent = 'Blog de ' + profileData.nickname;
    document.getElementById('blog-handle').textContent = profileData.handle;

    const containerPosts = document.querySelector('.container-blog main');
    const postsRes = await Gateway.buscarPostsBlog(profileData.user_id);
    const postsExistentes = containerPosts.querySelectorAll('.post-pessoal');
    postsExistentes.forEach(p => p.remove());

    if (postsRes.ok && postsRes.data.length > 0) {
        postsRes.data.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-pessoal';
            article.innerHTML = `
                <div class="post-header">
                    <span class="post-author">👤 ${profileData.handle}</span>
                    <span class="post-date">${new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-content">${post.content}</p>
            `;
            containerPosts.appendChild(article);
        });
    } else {
        containerPosts.insertAdjacentHTML('beforeend', '<p>Nenhuma postagem encontrada neste blog.</p>');
    }

    // 4. REGRAS DE ACESSO
    if (isOwner) {
        document.getElementById('area-dono-blog').style.display = 'block';
        document.getElementById('btn-nova-postagem').addEventListener('click', () => carregarModulo('home_pessoal/blog/post_pessoal'));
    } else if (tokenSalvo) {
        document.getElementById('area-interacao-blog').style.display = 'block';
        // A lógica de seguir/deixar de seguir pode ser implementada aqui
    }

    // 5. NAVEGAÇÃO
    document.getElementById('btn-voltar-inicio').addEventListener('click', (e) => {
        e.preventDefault();
        carregarModulo(tokenSalvo ? `home_pessoal/perfil?handle=${profileData.handle}` : 'forum/home_forum');
    });

})();
