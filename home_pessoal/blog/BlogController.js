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

    // Se não existirem dados de perfil e o usuário não estiver logado,
    // exibimos a versão pública (home) do blog com todas as postagens.
    if (!profileData) {
        divErro.style.display = 'none';
        divConteudo.style.display = 'block';

        document.getElementById('blog-titulo').textContent = 'Todos os Blogs';
        document.getElementById('blog-handle').textContent = '';

        const containerPosts = document.getElementById('feed-blogs');
        // limpa posts existentes antes de renderizar
        const postsExistentes = containerPosts.querySelectorAll('.post-pessoal');
        postsExistentes.forEach(p => p.remove());

        const postsRes = await Gateway.buscarPostsBlog();
        if (postsRes.ok && postsRes.data && postsRes.data.length > 0) {
            postsRes.data.forEach(post => {
                const article = document.createElement('article');
                article.className = 'post-pessoal';
                article.innerHTML = `
                    <div class="post-header">
                        <span class="post-author">${post.author_handle ? '@' + post.author_handle : 'User ' + (post.user_id || '')}</span>
                        <span class="post-date">${post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</span>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-content">${post.content}</p>
                `;
                containerPosts.appendChild(article);
                // botão Interagir para visitantes autenticados
                const token = localStorage.getItem('socimin_token');
                if (token) {
                    const actionWrap = document.createElement('div');
                    actionWrap.style.padding = '6px 0';
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'btn-primario';
                    btn.textContent = 'Interagir';
                    const authorId = post.user_id || post.author_id || post.author;
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (authorId) carregarModulo(`home_pessoal/blog/post_pessoal?author=${authorId}`);
                        else carregarModulo('home_pessoal/blog/post_pessoal');
                    });
                    actionWrap.appendChild(btn);
                    article.appendChild(actionWrap);
                }
            });
        } else {
            containerPosts.insertAdjacentHTML('beforeend', '');
        }

        // Ajusta comportamento do botão voltar nesta tela pública (voltar ao login)
        const btnVoltarInicio = document.getElementById('btn-voltar-inicio');
        if (btnVoltarInicio) {
            btnVoltarInicio.textContent = 'Voltar ao Login';
            btnVoltarInicio.addEventListener('click', (e) => {
                e.preventDefault();
                carregarModulo('auth');
            });
        }

        // Handler do formulário de busca na versão pública: tenta endpoint de busca do backend (?q=), e se não houver resposta usa filtro local
        const formBusca = document.getElementById('form-busca-blog');
        const inputBusca = document.getElementById('input-busca-blog');
        const resultadosBusca = document.getElementById('resultados-busca-blog');
        if (formBusca && inputBusca && resultadosBusca) {
            const renderResults = (lista) => {
                resultadosBusca.innerHTML = '';
                if (!lista || lista.length === 0) {
                    resultadosBusca.innerHTML = '<p>Nenhum resultado encontrado.</p>';
                    return;
                }
                lista.forEach(p => {
                    const item = document.createElement('div');
                    item.className = 'resultado-busca-item';
                    item.innerHTML = `
                        <h4 style="margin:0;color:#0a74da;">${p.title}</h4>
                        <p style="margin:0;color:#555;">${(p.content || '').slice(0,180)}${(p.content||'').length>180? '...':''}</p>
                        <p style="font-size:12px;color:#888;margin-top:6px;">${p.author_handle ? '@'+p.author_handle : ''}</p>
                    `;
                    resultadosBusca.appendChild(item);
                });
            };

            formBusca.addEventListener('submit', async (ev) => {
                ev.preventDefault();
                resultadosBusca.innerHTML = 'Buscando...';
                const termoRaw = inputBusca.value.trim();
                const termo = termoRaw.toLowerCase();

                try {
                    // 1) tenta pedir ao backend uma busca dedicada
                    let backendRes = null;
                    try {
                        backendRes = await Gateway.request('blog', `/?q=${encodeURIComponent(termoRaw)}`);
                    } catch (be) {
                        backendRes = null;
                    }

                    if (backendRes && backendRes.ok && backendRes.data && Array.isArray(backendRes.data) && backendRes.data.length > 0) {
                        renderResults(backendRes.data);
                        return;
                    }

                    // 2) fallback: buscar tudo e filtrar localmente
                    const allRes = await Gateway.buscarPostsBlog();
                    if (!allRes.ok || !allRes.data) {
                        resultadosBusca.innerHTML = '<p>Não foi possível buscar posts no momento.</p>';
                        return;
                    }
                    const encontrados = allRes.data.filter(p => {
                        const title = (p.title || '').toLowerCase();
                        const content = (p.content || '').toLowerCase();
                        const author = (p.author_handle || '').toLowerCase();
                        return title.includes(termo) || content.includes(termo) || author.includes(termo);
                    });
                    renderResults(encontrados);
                } catch (err) {
                    resultadosBusca.innerHTML = '<p>Erro na busca.</p>';
                }
            });
        }

        return;
    }

    divErro.style.display = 'none';
    divConteudo.style.display = 'block';

    // 3. PREENCHIMENTO DE DADOS E POSTS (perfil específico)
    const ownerName = profileData.nickname || profileData.handle || profileData.user_id || 'Autor';
    document.getElementById('blog-titulo').textContent = 'Blog de ' + ownerName;
    document.getElementById('blog-handle').textContent = profileData.handle;

    const containerPosts = document.getElementById('feed-blogs');
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
            // Se usuário autenticado e não-for-o-dono, permitir interagir (abrir post_pessoal para author)
            const token = localStorage.getItem('socimin_token');
            if (token && !isOwner) {
                const actionWrap = document.createElement('div');
                actionWrap.style.padding = '6px 0';
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-primario';
                btn.textContent = 'Interagir';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    carregarModulo(`home_pessoal/blog/post_pessoal?author=${profileData.user_id}`);
                });
                actionWrap.appendChild(btn);
                article.appendChild(actionWrap);
            }
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
    const btnVoltarInicio = document.getElementById('btn-voltar-inicio');
    if (btnVoltarInicio) {
        btnVoltarInicio.textContent = tokenSalvo ? 'Voltar ao Perfil' : 'Voltar à lista de fóruns';
        btnVoltarInicio.addEventListener('click', (e) => {
            e.preventDefault();
            carregarModulo(tokenSalvo ? `home_pessoal/perfil?handle=${profileData.handle}` : 'forum/home_forum');
        });
    }

})();
