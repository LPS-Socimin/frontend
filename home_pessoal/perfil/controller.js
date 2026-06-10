(async function() {
    const tokenSalvo = localStorage.getItem('socimin_token');
    const respostaPerfil = await Gateway.buscarDadosPerfil(tokenSalvo);

    const divErro = document.getElementById('erro-perfil');
    const divConteudo = document.getElementById('conteudo-perfil');

    // 1. VALIDAÇÃO DE EXISTÊNCIA
    if (!respostaPerfil || !respostaPerfil.sucesso) {
        if (divErro) divErro.style.display = 'block';
        if (divConteudo) divConteudo.style.display = 'none';
        
        const btnVoltarErro = document.getElementById('btn-voltar-erro');
        if (btnVoltarErro) btnVoltarErro.addEventListener('click', () => carregarModulo('auth'));
        return; 
    }

    if (divErro) divErro.style.display = 'none';
    if (divConteudo) divConteudo.style.display = 'block';

    // 2. DADOS PÚBLICOS
    document.getElementById('perfil-nome').textContent = respostaPerfil.dados_publicos.nome;
    document.getElementById('perfil-handle').textContent = respostaPerfil.dados_publicos.handle;
    document.getElementById('perfil-bio').textContent = respostaPerfil.dados_publicos.bio;
    
    const listaContatos = document.getElementById('lista-contatos');
    if (listaContatos && respostaPerfil.contatos) {
        respostaPerfil.contatos.forEach(contato => {
            const li = document.createElement('li');
            li.textContent = '👤 ' + contato;
            listaContatos.appendChild(li);
        });
    }

    // 3. ACESSO (DONO vs VISITANTE)
    if (respostaPerfil.dono_do_perfil) {
        document.getElementById('area-edicao').style.display = 'block';
        document.getElementById('perfil-email').textContent = respostaPerfil.dados_sensiveis?.email || '';
        document.getElementById('btn-sair').style.display = 'block'; 
        
        const btnDesativar = document.getElementById('btn-desativar-conta');
        if (btnDesativar) {
            btnDesativar.addEventListener('click', () => {
                if(confirm("Tem a certeza que deseja desativar a sua conta? Esta ação é irreversível.")) {
                    localStorage.removeItem('socimin_token');
                    localStorage.removeItem('socimin_db_perfil'); 
                    alert("Conta desativada com sucesso.");
                    carregarModulo('auth');
                }
            });
        }
    } else if (tokenSalvo) {
        document.getElementById('area-interacao').style.display = 'flex';
        document.getElementById('btn-sair').style.display = 'block';
        
        const jaEContato = false; 
        if (jaEContato) {
            document.getElementById('btn-rem-contato').style.display = 'inline-block';
        } else {
            document.getElementById('btn-add-contato').style.display = 'inline-block';
        }

        document.getElementById('btn-add-contato').addEventListener('click', () => alert('Pedido de contacto enviado!'));
        document.getElementById('btn-rem-contato').addEventListener('click', () => alert('Contacto removido.'));
    }

    // 4. VARIABILIDADES DA LPS
    const lpsConfig = { forum: true, blog: true, chat: true };

    if (lpsConfig.forum) {
        document.getElementById('area-forum').style.display = 'block';
        
        const listaForuns = document.getElementById('lista-foruns');
        if (listaForuns && respostaPerfil.foruns_criados) {
            respostaPerfil.foruns_criados.forEach(forum => {
                const li = document.createElement('li');
                li.textContent = '💬 ' + forum;
                listaForuns.appendChild(li);
            });
        }

        const areaAcompanhados = document.getElementById('area-foruns-acompanhados');
        const listaAcompanhados = document.getElementById('lista-foruns-acompanhados');
        if (areaAcompanhados && listaAcompanhados) {
            areaAcompanhados.style.display = 'block';
            const forunsSeguidos = ['Inteligência Artificial', 'Engenharia de Software'];
            forunsSeguidos.forEach(forum => {
                const li = document.createElement('li');
                li.textContent = '⭐ Fórum de ' + forum;
                listaAcompanhados.appendChild(li);
            });
        }

        if (respostaPerfil.dono_do_perfil) {
            document.getElementById('btn-criar-forum').style.display = 'inline-block';
        }
        
        const btnBuscarForum = document.getElementById('btn-buscar-forum');
        if (btnBuscarForum) btnBuscarForum.addEventListener('click', () => carregarModulo('forum/home_forum'));
    }

    if (lpsConfig.blog) {
        document.getElementById('area-blog').style.display = 'block';
        
        const listaPosts = document.getElementById('lista-posts');
        if (listaPosts && respostaPerfil.postagens_blog) {
            respostaPerfil.postagens_blog.forEach(post => {
                const li = document.createElement('li');
                li.textContent = '📝 ' + post;
                listaPosts.appendChild(li);
            });
        }
        
        if (respostaPerfil.dono_do_perfil) {
            document.getElementById('area-botoes-blog').style.display = 'flex';
            
            // --- REGRA DINÂMICA: Alterna botões baseado na existência do blog ---
            const btnAcessar = document.getElementById('btn-acessar-blog');
            const btnCriar = document.getElementById('btn-criar-blog');
            
            if (respostaPerfil.dados_publicos.hasBlog) {
                if (btnAcessar) btnAcessar.style.display = 'inline-block';
                if (btnCriar) btnCriar.style.display = 'none';
            } else {
                if (btnAcessar) btnAcessar.style.display = 'none';
                if (btnCriar) btnCriar.style.display = 'inline-block';
            }
        }
    }

    if (lpsConfig.chat) {
        document.getElementById('area-chat').style.display = 'block';
        const listaConversas = document.getElementById('lista-conversas');
        
        if (respostaPerfil.dono_do_perfil) {
            document.getElementById('area-botoes-chat').style.display = 'flex';
            const conversasSimuladas = ['Conversa com @amigo1', 'Conversa com @amigo2'];
            conversasSimuladas.forEach(conv => {
                const li = document.createElement('li');
                li.textContent = '✉️ ' + conv;
                listaConversas.appendChild(li);
            });
            
        } else if (tokenSalvo) {
            const li = document.createElement('li');
            li.textContent = '✉️ Conversa ativa com ' + respostaPerfil.dados_publicos.handle;
            listaConversas.appendChild(li);
        }
    }

    // 5. EVENTOS DE ROTEAMENTO
    const btnEditar = document.getElementById('btn-editar-perfil');
    if (btnEditar) btnEditar.addEventListener('click', () => carregarModulo('home_pessoal/perfil/editar_perfil'));

    const btnCriarForum = document.getElementById('btn-criar-forum');
    if (btnCriarForum) btnCriarForum.addEventListener('click', () => carregarModulo('forum/home_forum/criar_forum'));

    const btnCriarBlog = document.getElementById('btn-criar-blog');
    if (btnCriarBlog) btnCriarBlog.addEventListener('click', () => carregarModulo('home_pessoal/blog/criar_blog'));

    const btnAcessarBlog = document.getElementById('btn-acessar-blog');
    if (btnAcessarBlog) btnAcessarBlog.addEventListener('click', () => carregarModulo('home_pessoal/blog'));

    const btnIniciarChat = document.getElementById('btn-iniciar-chat');
    if (btnIniciarChat) btnIniciarChat.addEventListener('click', () => carregarModulo('chat/inbox'));

    const btnChatDireto = document.getElementById('btn-chat-direto');
    if (btnChatDireto) btnChatDireto.addEventListener('click', () => carregarModulo('chat/inbox'));

    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', function() {
            localStorage.removeItem('socimin_token');
            carregarModulo('auth');
        });
    }

})();