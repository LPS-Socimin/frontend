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
    // ROTA DE CADASTRO (Validações da Especificação)
    // ==========================================
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            limparMensagens();

            const handle = document.getElementById('handle-cadastro').value.trim();
            const email = document.getElementById('email-cadastro').value.trim();
            const senha = document.getElementById('senha-cadastro').value;
            const confirmacao = document.getElementById('confirmacao-senha').value;

            let erros = [];

            // 1. Validação: Campos ausentes/inválidos e senhas divergentes
            if (!handle || !email || !senha || !confirmacao) {
                erros.push("• Payload com campo inválido ou ausente.");
            }
            if (senha !== confirmacao) {
                erros.push("• Senha e confirmação de senha divergentes.");
            }
            
            // [AVISO: BACKEND NECESSÁRIO] Simulação de verificação na base de dados
            // Se o usuário tentar a handle padrão de testes, simula que já existe
            if (handle.toLowerCase() === '@usuario_teste' || handle === 'usuario_teste') {
                erros.push("• Esta handle de perfil já existe na base de dados.");
            }

            // Exibe os erros ou prossegue com o cadastro
            if (erros.length > 0) {
                mostrarMensagem(msgCadastro, erros.join("<br>"), 'erro');
            } else {
                // 2. Recebe dados válidos e senhas iguais
                // [AVISO: BACKEND NECESSÁRIO] Aqui ocorreria o INSERT na base de dados de perfis
                mostrarMensagem(msgCadastro, "Sucesso na criação de usuário!", 'sucesso');
                
                // Aguarda um pouco e manda para o login
                setTimeout(() => {
                    formCadastro.reset();
                    formCadastro.style.display = 'none';
                    formLogin.style.display = 'flex';
                    mostrarMensagem(msgLogin, "Conta criada com sucesso! Faça login.", 'sucesso');
                }, 1500);
            }
        });
    }

    // ==========================================
    // ROTA DE LOGIN (Validações da Especificação)
    // ==========================================
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            limparMensagens();

            const email = document.getElementById('email-login').value.trim();
            const senha = document.getElementById('senha-login').value;

            // 1. Recebe payload com campo inválido ou ausente
            if (!email || !senha) {
                mostrarMensagem(msgLogin, "Erro de solicitação inválida.", 'erro');
                return;
            }

            // 2. Recebe email válido mas a validação da senha falha
            // [AVISO: BACKEND NECESSÁRIO] Verificação criptográfica do hash da senha na base de dados
            // Para simulação no Front-end: A senha correta deve ser "123456"
            if (senha !== "12345") {
                mostrarMensagem(msgLogin, "Divergência detectada: E-mail ou senha incorretos.", 'erro');
                return;
            }

            // 3. Recebe email válido e a validação de senha sucede
            // [AVISO: BACKEND NECESSÁRIO] Geração e envio do Token JWT real
            localStorage.setItem('socimin_token', 'token_simulado_jwt_12345');
            mostrarMensagem(msgLogin, "Autenticado com sucesso! Redirecionando...", 'sucesso');
            
            // Redireciona para a home do perfil criado
            setTimeout(() => {
                carregarModulo('home_pessoal/perfil');
            }, 800);
        });
    }
})();