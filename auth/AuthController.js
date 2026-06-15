(function() {
    // Endpoints de navegação pública
    const btnNavBlog = document.getElementById('btn-nav-blog');
    if (btnNavBlog) btnNavBlog.addEventListener('click', () => carregarModulo('home_pessoal/blog'));

    const btnNavForum = document.getElementById('btn-nav-forum');
    if (btnNavForum) btnNavForum.addEventListener('click', () => carregarModulo('forum/home_forum'));

    // Elementos do DOM
    const formLogin = document.getElementById('login-form');
    const formCadastro = document.getElementById('cadastro-form');
    const linkCadastro = document.getElementById('link-cadastro');
    const linkLogin = document.getElementById('link-login');
    const msgLogin = document.getElementById('msg-login');
    const msgCadastro = document.getElementById('msg-cadastro');

    // Funções auxiliares para exibir mensagens
    function mostrarMensagem(elemento, mensagem, tipo) {
        elemento.style.display = 'block';
        elemento.innerHTML = mensagem;
        elemento.className = 'msg-box ' + (tipo === 'erro' ? 'msg-erro' : 'msg-sucesso');
    }

    function limparMensagens() {
        msgLogin.style.display = 'none';
        msgCadastro.style.display = 'none';
    }

    // Lógica de alternância de tela
    if (linkCadastro && linkLogin) {
        linkCadastro.addEventListener('click', (e) => {
            e.preventDefault(); 
            limparMensagens();
            formLogin.style.display = 'none'; 
            formCadastro.style.display = 'flex';
        });
        linkLogin.addEventListener('click', (e) => {
            e.preventDefault(); 
            limparMensagens();
            formCadastro.style.display = 'none'; 
            formLogin.style.display = 'flex';
        });
    }

    // ==========================================
    // ROTA DE CADASTRO (Ajustada à Especificação)
    // ==========================================
    if (formCadastro) {
        formCadastro.addEventListener('submit', async function(e) {
            e.preventDefault();
            limparMensagens();

            const btnSubmit = formCadastro.querySelector('button[type="submit"]');
            const originalText = btnSubmit.textContent;
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Enviando...';

            const handle = document.getElementById('handle-cadastro').value.trim();
            const email = document.getElementById('email-cadastro').value.trim();
            const senha = document.getElementById('senha-cadastro').value;
            const confirmacao = document.getElementById('confirmacao-senha').value;
            
            // Validação com acúmulo de erros
            let erros = [];
            if (!handle) erros.push("• O campo 'handle' é obrigatório.");
            if (!email) erros.push("• O campo 'email' é obrigatório.");
            if (!senha) erros.push("• O campo 'senha' é obrigatório.");
            if (!confirmacao) erros.push("• O campo 'confirmação de senha' é obrigatório.");
            if (senha && confirmacao && senha !== confirmacao) {
                erros.push("• Senha e confirmação de senha divergentes.");
            }

            if (erros.length > 0) {
                mostrarMensagem(msgCadastro, erros.join("<br>"), 'erro');
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
                return;
            }

            const resAuth = await Gateway.register(handle, email, senha);
            
            if (resAuth.ok) {
                const resLogin = await Gateway.login(email, senha);
                if (!resLogin.ok) {
                    const erroLogin = resLogin.data?.error || resLogin.error || 'Erro ao autenticar após cadastro.';
                    erros.push(`• ${erroLogin}`);
                    mostrarMensagem(msgCadastro, erros.join("<br>"), 'erro');
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = originalText;
                    return;
                }

                localStorage.setItem('socimin_token', resLogin.data.access_token);
                const resProfile = await Gateway.criarPerfilInicial(handle, `@${handle}`);

                if (resProfile.ok) {
                    mostrarMensagem(msgCadastro, "Sucesso na criação de usuário!", 'sucesso');
                    setTimeout(() => {
                        formCadastro.reset();
                        formCadastro.style.display = 'none';
                        formLogin.style.display = 'flex';
                        mostrarMensagem(msgLogin, "Conta criada com sucesso! Faça login.", 'sucesso');
                    }, 1500);
                } else {
                    // Erro na criação do perfil, pode ser handle duplicado ou token inválido
                    const erroMsg = resProfile.data?.error || resProfile.data?.message || resProfile.error || "Erro desconhecido ao criar perfil";
                    erros.push(`• ${erroMsg}`);
                    // Limpamos o token local para forçar um novo login se necessário
                    localStorage.removeItem('socimin_token');
                    mostrarMensagem(msgCadastro, erros.join("<br>"), 'erro');
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = originalText;
                    return;
                }
            } else {
                // Erro no cadastro do usuário (email/handle duplicado)
                const erroMsg = resAuth.data?.error || "Erro ao cadastrar usuário.";
                erros.push(`• ${erroMsg}`);
                mostrarMensagem(msgCadastro, erros.join("<br>"), 'erro');
            }

            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
        });
    }

    // ==========================================
    // ROTA DE LOGIN (Ajustada à Especificação)
    // ==========================================
    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();
            limparMensagens();
            
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            const originalText = btnSubmit.textContent;
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Entrando...';

            const email = document.getElementById('email-login').value.trim();
            const senha = document.getElementById('senha-login').value;

            if (!email || !senha) {
                // Mensagem ajustada para a especificação
                mostrarMensagem(msgLogin, "Erro de solicitação inválida.", 'erro');
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
                return;
            }

            const res = await Gateway.login(email, senha);

            if (res.ok) {
                localStorage.setItem('socimin_token', res.data.access_token);
                // Mensagem e redirecionamento conforme especificação
                mostrarMensagem(msgLogin, `Autenticado com sucesso! Token: ${res.data.access_token.substring(0,15)}...`, 'sucesso');
                
                setTimeout(() => {
                    carregarModulo('home_pessoal/perfil');
                }, 1000);
            } else {
                // Backend retorna "Credenciais inválidas", o que é mais seguro do que "divergência detectada"
                mostrarMensagem(msgLogin, res.data?.error || "Credenciais inválidas.", 'erro');
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
            }
        });
    }
})();
