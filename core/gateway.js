const Gateway = {
    API_BASE_URL: 'http://localhost:8000',

    async request(service, endpoint, options = {}) {
        const url = `${this.API_BASE_URL}/${service}${endpoint}`;
        const token = localStorage.getItem('socimin_token');

        const headers = {
            ...options.headers
        };

        // Se o body NÃO for FormData, usamos JSON por padrão
        const isFormData = options && options.body && (options.body instanceof FormData);
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            let data = null;
            let raw = null;
            try {
                // sempre tente ler como texto primeiro
                raw = await response.text();
                // tente parsear JSON a partir do texto
                try { data = raw ? JSON.parse(raw) : null; } catch (e) { data = null; }
            } catch (e) {
                // leitura do body falhou (ex: no content)
            }
            return {
                ok: response.ok,
                status: response.status,
                data,
                raw
            };
        } catch (error) {
            console.error(`Erro na requisição para ${url}:`, error);
            return {
                ok: false,
                error: error.message
            };
        }
    },

    async validarTokenAutenticacao(token) {
        if (!token) return { valido: false };
        const res = await this.request('auth', '/me');
        if (res.ok) {
            return { valido: true, mensagem: 'Usuário autenticado', id_usuario: res.data.id, user: res.data };
        } else {
            return { valido: false, mensagem: 'Usuário não autenticado' };
        }
    },

    async login(email, password) {
        return await this.request('auth', '/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async register(username, email, password) {
        return await this.request('auth', '/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    },

    async buscarDadosPerfil(tokenOverride) {
        // Se houver tokenOverride, poderíamos usá-lo, mas o request() já pega do localStorage
        const res = await this.request('profile', '/');
        
        if (res.ok) {
            const contatosRes = await this.request('profile', '/contacts');
            const contatos = contatosRes.ok ? contatosRes.data.map(c => c.handle || c.nickname) : [];

            // Buscar posts do blog do autor
            const blogRes = await this.request('blog', `/author/${res.data.user_id}`);
            const posts = blogRes.ok ? blogRes.data.map(p => p.title) : [];

            // Buscar fóruns (exemplo de como integrar)
            const forumRes = await this.request('forum', `/?user_id=${res.data.user_id}`);
            const foruns = forumRes.ok && forumRes.data.forums ? forumRes.data.forums.map(f => f.title) : [];

            return {
                sucesso: true,
                dono_do_perfil: true,
                dados_publicos: {
                    handle: res.data.handle,
                    nome: res.data.nickname,
                    bio: res.data.bio,
                    hasBlog: posts.length > 0,
                    blogTitulo: posts.length > 0 ? 'Meu Blog' : ''
                },
                dados_sensiveis: { email: '' }, 
                contatos: contatos,
                foruns_criados: foruns,
                postagens_blog: posts
            };
        } else if (res.status === 404) {
            return { sucesso: false, erro: 'Perfil não encontrado' };
        }
        return { sucesso: false };
    },

    async atualizarDadosPerfil(token, novosDados) {
        const res = await this.request('profile', '/', {
            method: 'PUT',
            body: JSON.stringify({
                nickname: novosDados.nome,
                handle: novosDados.handle,
                bio: novosDados.bio
            })
        });
        return { sucesso: res.ok, mensagem: res.ok ? 'Perfil atualizado com sucesso!' : 'Erro ao atualizar perfil.' };
    },

    async criarPerfilInicial(nickname, handle) {
        return await this.request('profile', '/', {
            method: 'POST',
            body: JSON.stringify({ nickname, handle, bio: '' })
        });
    },

    async buscarPerfilPorHandle(handle) {
        return await this.request('profile', `/${handle}`);
    },

    async adicionarContato(contactProfileId) {
        // Assume que o 'profile_id' será o do usuário logado, a ser determinado pelo backend
        // ou extraído do token. Por simplicidade, o backend pode resolver.
        // O endpoint de contatos do profile-service espera profile_id e contact_profile_id.
        // O profile_id pode ser inferido pelo user_id do token.
        // Vamos precisar buscar o perfil do usuário logado para obter seu ID de perfil.
        const myProfileRes = await this.buscarDadosPerfil();
        if (!myProfileRes.sucesso) return { ok: false, error: "Could not identify own profile to add contact."};

        return await this.request('profile', '/contacts', {
            method: 'POST',
            body: JSON.stringify({
                profile_id: myProfileRes.dados_publicos.id, 
                contact_profile_id: contactProfileId 
            })
        });
    },

    async removerContato(contactProfileId) {
        const myProfileRes = await this.buscarDadosPerfil();
        if (!myProfileRes.sucesso) return { ok: false, error: "Could not identify own profile to remove contact."};
        
        return await this.request('profile', '/contacts', {
            method: 'DELETE',
            body: JSON.stringify({
                profile_id: myProfileRes.dados_publicos.id,
                contact_profile_id: contactProfileId
            })
        });
    },

    async criarNovoBlog(tituloBlog, content = 'Bem-vindo ao meu novo blog!', imageId = null, imageFile = null, video_url = null) {
        if (imageFile) {
            const fd = new FormData();
            fd.append('title', tituloBlog);
            fd.append('content', content);
            if (video_url) fd.append('video_url', video_url);
            fd.append('image', imageFile);
            const res = await this.request('blog', '/', { method: 'POST', body: fd });
            return { sucesso: res.ok, mensagem: res.ok ? 'Blog criado com sucesso!' : 'Erro ao criar blog.', data: res.data };
        }
        const res = await this.request('blog', '/', {
            method: 'POST',
            body: JSON.stringify({
                title: tituloBlog,
                content: content,
                image_id: imageId || null,
                video_url
            })
        });
        return { sucesso: res.ok, mensagem: res.ok ? 'Blog criado com sucesso!' : 'Erro ao criar blog.', data: res.data };
    },

    // --- BLOG SERVICE ---
    async buscarPostsBlog(authorId = null) {
        const endpoint = authorId ? `/author/${authorId}` : '/';
        return await this.request('blog', endpoint);
    },

    async criarPostagemBlog(titulo, conteudo, imageId = null, imageFile = null, video_url = null) {
        // Se houver arquivo de imagem, envie como FormData (upload)
        if (imageFile) {
            const fd = new FormData();
            fd.append('title', titulo);
            fd.append('content', conteudo);
            if (video_url) fd.append('video_url', video_url);
            fd.append('image', imageFile);
            return await this.request('blog', '/', { method: 'POST', body: fd });
        }
        return await this.request('blog', '/', {
            method: 'POST',
            body: JSON.stringify({ title: titulo, content: conteudo, image_id: imageId || null, video_url })
        });
    },

    // --- FORUM SERVICE ---
    async buscarForuns() {
        return await this.request('forum', '/');
    },

    async criarForum(titulo, descricao) {
        return await this.request('forum', '/', {
            method: 'POST',
            body: JSON.stringify({ title: titulo, description: descricao })
        });
    },

    async buscarPostsForum(forumId) {
        return await this.request('forum', `/posts?forum_id=${forumId}`);
    },

    async criarPostForum(forumId, title, content, imageId = null, imageFile = null, video_url = null) {
        const endpoint = `/${forumId}/posts`;
        if (imageFile) {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('content', content);
            if (video_url) fd.append('video_url', video_url);
            fd.append('image', imageFile);
            return await this.request('forum', endpoint, { method: 'POST', body: fd });
        }
        return await this.request('forum', endpoint, {
            method: 'POST',
            body: JSON.stringify({ title, content, image_id: imageId || null, video_url })
        });
    },

    // --- CHAT SERVICE ---
    async buscarConversas() {
        return await this.request('chat', '/');
    },

    async enviarMensagem(chatId, conteudo) {
        return await this.request('chat', `/${chatId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content: conteudo })
        });
    }
};
