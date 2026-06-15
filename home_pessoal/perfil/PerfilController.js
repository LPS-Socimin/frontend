(async function() {
    const params = new URLSearchParams(window.location.search);
    // Se não houver handle na URL, usa uma string vazia para o endpoint, caindo na rota GET /profile/ (meu perfil)
    const rawHandle = params.get('handle') || '';
    // Backend endpoints esperam handle sem '@' — normaliza removendo se o parâmetro vier com '@'
    const handle = rawHandle.startsWith('@') ? rawHandle.substring(1) : rawHandle;
    const tokenSalvo = localStorage.getItem('socimin_token');

    // Se estiver tentando ver um perfil sem handle e não estiver logado, vai para o login
    if (!handle && !tokenSalvo) {
        carregarModulo('auth');
        return;
    }

    // Resolver perfil a buscar:
    // - Se não houver handle, buscamos meu perfil (GET /profile/)
    // - Se houver handle e usuário logado, verificamos se é o mesmo username via /auth/me;
    //   se for, buscamos GET /profile/ (meu perfil). Caso contrário tentamos GET /profile/{handle}
    let profileRes;
    if (!handle) {
        profileRes = await Gateway.request('profile', `/`);
    } else if (tokenSalvo) {
        // validar token e comparar username
        const meRes = await Gateway.request('auth', '/me');
        const loggedUsername = meRes.ok && meRes.data ? (meRes.data.username || meRes.data.email || '') : '';
        if (loggedUsername && (loggedUsername === handle || loggedUsername === `@${handle}`)) {
            profileRes = await Gateway.request('profile', `/`);
        } else {
            profileRes = await Gateway.request('profile', `/${handle}`);
        }
    } else {
        // sem token e com handle — tentar rota pública (se existir) e exibir erro caso não exista
        profileRes = await Gateway.request('profile', `/${handle}`);
    }

    const divErro = document.getElementById('erro-perfil');
    const divConteudo = document.getElementById('conteudo-perfil');

    if (!profileRes.ok) {
        divErro.style.display = 'block';
        divConteudo.style.display = 'none';
        document.getElementById('erro-msg').textContent = profileRes.data?.error || 'Erro ao carregar perfil.';
        const btnVoltarErro = document.getElementById('btn-voltar-erro');
        if (btnVoltarErro) {
            btnVoltarErro.textContent = 'Voltar ao Login';
            // Garante que o clique previna comportamento padrão e navegue para a rota de login
            btnVoltarErro.addEventListener('click', function(e) {
                e.preventDefault();
                console.debug('btn-voltar-erro clicked: navegando para auth');
                // Rota do módulo de autenticação
                carregarModulo('auth');
            });
        }
        return;
    }

    divErro.style.display = 'none';
    // Manter conteúdo escondido até que toda a inicialização assíncrona termine
    divConteudo.style.display = 'none';
    
    const profileData = profileRes.data || {};
    // Algumas respostas do backend podem não retornar 'flags' — proteger contra undefined
    const flags = profileData.flags || {};
    const profileId = profileData.id || profileData.user_id || null;

    // -- RENDERIZAÇÃO PRINCIPAL --
    document.getElementById('perfil-nome').textContent = profileData.nickname;
    document.getElementById('perfil-handle').textContent = profileData.handle;
    document.getElementById('perfil-bio').textContent = profileData.bio || 'Sem bio informada.';
    
    // -- LÓGICA DE BOTÕES (BASEADA NAS FLAGS DO BACKEND) --
    // Determina se o usuário atual é dono do perfil. Primeiro usa flags retornadas
    // pelo backend; se não estiver explícito, tenta validar via /auth/me (caso haja token).
    let isOwner = !!flags.is_owner;
    if (!isOwner && tokenSalvo) {
        try {
            const meCheck = await Gateway.request('auth', '/me');
            const meId = meCheck.ok && meCheck.data ? (meCheck.data.id || meCheck.data.user_id) : null;
            const pid = profileId;
            if (meId && pid && meId === pid) isOwner = true;
        } catch (e) {
            console.debug('Erro ao verificar owner via auth/me', e);
        }
    }

    if (isOwner) {
        const areaEd = document.getElementById('area-edicao');
        if (areaEd) areaEd.style.display = 'block';
        // mostrar botão de editar no cabeçalho, se presente
        const btnEditarHeader = document.getElementById('btn-editar-perfil-header');
        if (btnEditarHeader) btnEditarHeader.style.display = 'inline-block';
    }

    if (flags.can_interact) {
        const areaInter = document.getElementById('area-interacao');
        if (areaInter) areaInter.style.display = 'flex';
        const details = flags.interaction_details || {};
        if (details.is_contact) {
            const btnRem = document.getElementById('btn-rem-contato');
            if (btnRem) btnRem.style.display = 'inline-block';
        } else {
            const btnAdd = document.getElementById('btn-add-contato');
            if (btnAdd) btnAdd.style.display = 'inline-block';
        }
        // Lógica do chat pode ser adicionada aqui
    }

    if (tokenSalvo) {
        const btnSairEl = document.getElementById('btn-sair');
        if (btnSairEl) btnSairEl.style.display = 'block';
    }

    // normalize handle without @ for navigation
    const profileHandleClean = (profileData.handle || '').startsWith('@') ? (profileData.handle || '').substring(1) : (profileData.handle || '');

    // -- LÓGICA DE CLIQUE DOS BOTÕES DE INTERAÇÃO --
    const btnAddContatoEl = document.getElementById('btn-add-contato');
    if (btnAddContatoEl) btnAddContatoEl.addEventListener('click', async () => {
        const res = await Gateway.adicionarContato(profileId);
        if(res.ok) {
            alert('Contato adicionado com sucesso!');
            // Ao recarregar usamos handle sem '@'
            const reloadHandle = (profileData.handle || '').startsWith('@') ? (profileData.handle || '').substring(1) : (profileData.handle || '');
            carregarModulo(`home_pessoal/perfil?handle=${encodeURIComponent(reloadHandle)}`);
        } else {
            alert(`Erro: ${res.data?.error || 'Não foi possível adicionar o contato.'}`);
        }
    });
    const btnRemContatoEl = document.getElementById('btn-rem-contato');
    if (btnRemContatoEl) btnRemContatoEl.addEventListener('click', async () => {
        const res = await Gateway.removerContato(profileId);
        if(res.ok) {
            alert('Contato removido com sucesso!');
            const reloadHandle2 = (profileData.handle || '').startsWith('@') ? (profileData.handle || '').substring(1) : (profileData.handle || '');
            carregarModulo(`home_pessoal/perfil?handle=${encodeURIComponent(reloadHandle2)}`);
        } else {
            alert(`Erro: ${res.data?.error || 'Não foi possível remover o contato.'}`);
        }
    });
    
    // -- RENDERIZAÇÃO DAS SEÇÕES (BLOG/FORUM) --
    // ... (código de renderização de fóruns e blogs permanece o mesmo, usando `profileData.user_id`)
    // -- LÓGICA DE CHAT --
    // Regras:
    // - Se usuário estiver logado e NÃO for dono do perfil: mostrar botão para abrir conversa existente ou iniciar nova conversa
    // - Se usuário for dono do perfil: listar conversas que ele participa e permitir iniciar nova conversa com contatos
    const listaConversasEl = document.getElementById('lista-conversas');
    const areaBotoesChat = document.getElementById('area-botoes-chat');

    async function findExistingChatWith(targetUserId) {
        const convRes = await Gateway.buscarConversas();
        if (!convRes.ok || !convRes.data || !convRes.data.items) return null;
        const items = convRes.data.items;
        for (const c of items) {
            if (c.user_id_1 === targetUserId || c.user_id_2 === targetUserId) return c;
        }
        return null;
    }

    if (tokenSalvo) {
        // obter informações do usuário logado
        const meRes = await Gateway.request('auth', '/me');
        const loggedUserId = meRes.ok && meRes.data ? (meRes.data.id || meRes.data.user_id) : null;

        if (isOwner) {
            // Dono do perfil: listar conversas e permitir iniciar com contatos
            if (listaConversasEl) {
                const convRes = await Gateway.buscarConversas();
                if (convRes.ok && convRes.data && convRes.data.items && convRes.data.items.length > 0) {
                    listaConversasEl.innerHTML = '';
                    convRes.data.items.forEach(chat => {
                        const li = document.createElement('li');
                        li.className = 'lista-item';
                        li.style.display = 'flex';
                        li.style.justifyContent = 'space-between';
                        li.innerHTML = `<span>Conversa ${chat.id} — ${new Date(chat.created_at).toLocaleString()}</span>`;
                        const btnAbrir = document.createElement('button');
                        btnAbrir.className = 'btn-secundario';
                        btnAbrir.textContent = 'Abrir';
                        btnAbrir.addEventListener('click', () => carregarModulo(`chat/inbox?chat_id=${chat.id}`));
                        li.appendChild(btnAbrir);
                        listaConversasEl.appendChild(li);
                    });
                } else {
                    if (listaConversasEl) listaConversasEl.innerHTML = '<li class="lista-item">Nenhuma conversa encontrada.</li>';
                }
            }

            // Botões para iniciar conversa com contatos
            if (areaBotoesChat) {
                const contatosRes = await Gateway.request('profile', '/contacts');
                if (contatosRes.ok && Array.isArray(contatosRes.data) && contatosRes.data.length > 0) {
                    areaBotoesChat.style.display = 'flex';
                    areaBotoesChat.innerHTML = '';
                    contatosRes.data.forEach(contact => {
                        const btn = document.createElement('button');
                        btn.className = 'btn-primario';
                        btn.textContent = `Chat: ${contact.nickname || contact.handle || contact.user_id}`;
                        btn.addEventListener('click', async () => {
                            // cria chat com o user_id do contato (profile.user_id)
                            const targetUser = contact.user_id || contact.id;
                            const createRes = await Gateway.request('chat', '/', {
                                method: 'POST',
                                body: JSON.stringify({ user_id_2: targetUser })
                            });
                            if (createRes.ok) {
                                carregarModulo(`chat/inbox?chat_id=${createRes.data.id}`);
                            } else {
                                alert('Erro ao iniciar conversa: ' + (createRes.data?.error || createRes.error || 'Erro desconhecido'));
                            }
                        });
                        areaBotoesChat.appendChild(btn);
                    });
                } else {
                    // manter oculto se sem contatos
                    areaBotoesChat.style.display = 'none';
                }
            }
        } else {
            // visitante logado em perfil de outro usuário
            if (listaConversasEl) listaConversasEl.innerHTML = '';
            const targetUserId = profileData.user_id || profileData.id;
            if (targetUserId && loggedUserId && targetUserId !== loggedUserId) {
                const existing = await findExistingChatWith(targetUserId);
                const btnChat = document.getElementById('btn-chat-direto');
                if (btnChat) {
                    if (existing) {
                        btnChat.textContent = 'Abrir Conversa';
                        btnChat.addEventListener('click', () => carregarModulo(`chat/inbox?chat_id=${existing.id}`));
                    } else {
                        btnChat.textContent = '+ Iniciar Conversa';
                        btnChat.addEventListener('click', async () => {
                            const createRes = await Gateway.request('chat', '/', {
                                method: 'POST',
                                body: JSON.stringify({ user_id_2: targetUserId })
                            });
                            if (createRes.ok) {
                                carregarModulo(`chat/inbox?chat_id=${createRes.data.id}`);
                            } else {
                                alert('Erro ao iniciar conversa: ' + (createRes.data?.error || createRes.error || 'Erro desconhecido'));
                            }
                        });
                    }
                }
            }
        }
    } else {
        // visitante não logado: esconder botões de chat
        const btnChat = document.getElementById('btn-chat-direto');
        if (btnChat) btnChat.style.display = 'none';
        if (areaBotoesChat) areaBotoesChat.style.display = 'none';
    }
    
    // -- EVENTOS DE ROTEAMENTO --
    const btnEditarHeader = document.getElementById('btn-editar-perfil-header');
    if (btnEditarHeader) btnEditarHeader.addEventListener('click', () => carregarModulo('home_pessoal/perfil/editar_perfil'));

    // Logout
    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            if (confirm('Deseja realmente sair da conta?')) {
                localStorage.removeItem('socimin_token');
                carregarModulo('auth');
            }
        });
    }

    // Desativar conta (tenta chamar DELETE /profile/ se disponível)
    const btnDesativar = document.getElementById('btn-desativar-conta');
    if (btnDesativar) {
        btnDesativar.addEventListener('click', async () => {
            if (!confirm('Tem certeza que deseja desativar sua conta? Esta ação pode ser irreversível.')) return;
            try {
                const res = await Gateway.request('profile', '/', { method: 'DELETE' });
                if (res.ok) {
                    alert('Conta desativada. Você será deslogado.');
                    localStorage.removeItem('socimin_token');
                    carregarModulo('auth');
                } else {
                    alert('Não foi possível desativar a conta: ' + (res.data?.error || res.data?.message || res.error || 'Erro desconhecido'));
                }
            } catch (e) {
                console.error('Erro ao desativar conta:', e);
                alert('Erro ao desativar conta. Veja o console para detalhes.');
            }
        });
    }

    // Interações: chat direto / iniciar conversa
    const btnChatDireto = document.getElementById('btn-chat-direto');
    if (btnChatDireto) btnChatDireto.addEventListener('click', () => {
        // Navega para a caixa de entrada com query para iniciar conversa com este usuário
        carregarModulo(`chat/inbox?to=${profileData.user_id || profileData.id || profileData.handle}`);
    });

    const btnIniciarChat = document.getElementById('btn-iniciar-chat');
    if (btnIniciarChat) btnIniciarChat.addEventListener('click', () => carregarModulo('chat/inbox'));

    // Fórum: criar / buscar
    const btnCriarForum = document.getElementById('btn-criar-forum');
    if (btnCriarForum) btnCriarForum.addEventListener('click', () => carregarModulo(`forum/home_forum/criar_forum?from=perfil&handle=${encodeURIComponent(profileHandleClean)}`));

    const btnBuscarForum = document.getElementById('btn-buscar-forum');
    if (btnBuscarForum) btnBuscarForum.addEventListener('click', () => carregarModulo(`forum/home_forum?from=perfil&handle=${encodeURIComponent(profileHandleClean)}`));

    // Blog: acessar / criar
    const btnAcessarBlog = document.getElementById('btn-acessar-blog');
    if (btnAcessarBlog) btnAcessarBlog.addEventListener('click', () => carregarModulo(`home_pessoal/blog?author=${profileData.user_id || profileData.id}`));

    const btnCriarBlog = document.getElementById('btn-criar-blog');
    if (btnCriarBlog) btnCriarBlog.addEventListener('click', () => carregarModulo('home_pessoal/blog/criar_blog'));

    // Ações públicas rápidas (barra de ações)
    const btnHomeForum = document.getElementById('btn-home-forum');
    if (btnHomeForum) btnHomeForum.addEventListener('click', () => carregarModulo(`forum/home_forum?from=perfil&handle=${encodeURIComponent(profileHandleClean)}`));

    const btnHomeBlog = document.getElementById('btn-home-blog');
    if (btnHomeBlog) btnHomeBlog.addEventListener('click', () => carregarModulo(`home_pessoal/blog${profileId ? `?author=${profileId}` : ''}`));

    const btnChatGlobal = document.getElementById('btn-chat-global');
    if (btnChatGlobal) btnChatGlobal.addEventListener('click', () => carregarModulo('chat/inbox'));

    // Buscar posts / conversas: fallback handlers
    const btnBuscarForumSidebar = document.getElementById('btn-buscar-forum');
    if (btnBuscarForumSidebar) btnBuscarForumSidebar.addEventListener('click', () => carregarModulo('forum/home_forum'));

    // Segurança: garante que listeners não causem erro se elemento ausente
    // Exibir o conteúdo apenas após todas as inicializações acima
    try {
        divConteudo.style.display = 'block';
    } catch (e) {
        console.debug('Erro ao mostrar conteudo do perfil:', e);
    }
})();
