(async function() {
// Bolha de proteção do módulo Criar Blog

    // 1. Lógica do botão Cancelar (Volta para o Perfil)
    const btnCancelar = document.getElementById('btn-cancelar-blog');
    if (btnCancelar) {
        btnCancelar.textContent = 'Voltar ao Perfil';
        btnCancelar.addEventListener('click', function(evento) {
            evento.preventDefault();
            carregarModulo('home_pessoal/perfil');
            // Manda o Roteador voltar para o dashboard
        });
    }

    // Preenche autor (ID do usuário logado) visualmente
    try {
        const auth = await Gateway.validarTokenAutenticacao(localStorage.getItem('socimin_token'));
        if (auth && auth.valido && auth.user) {
            const authorInput = document.getElementById('criarblog-author-id');
            if (authorInput) authorInput.value = auth.user.id || auth.id_usuario || '';
        }
    } catch (e) {}

    // 2. Lógica para Submeter o Formulário e Salvar no Banco
    const formCriarBlog = document.getElementById('form-criar-blog');
    if (formCriarBlog) {
        formCriarBlog.addEventListener('submit', async function(evento) {
            evento.preventDefault();

            const titulo = document.getElementById('input-titulo-blog').value.trim();
            const conteudo = document.getElementById('input-conteudo-blog').value.trim();
            const videoUrl = document.getElementById('input-video-blog').value.trim() || null;
            const imagemId = document.getElementById('input-imagem-id-blog') ? document.getElementById('input-imagem-id-blog').value.trim() : null;

            // Feedback visual no botão enquanto "salva"
            const btnSubmit = formCriarBlog.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.textContent;
            btnSubmit.textContent = 'Criando...';
            btnSubmit.disabled = true;

            try {
                const resposta = await Gateway.criarNovoBlog(titulo, conteudo, imagemId, null, videoUrl);
                if (resposta.sucesso) {
                    // Guarda id/autor criado e navega diretamente para o blog criado
                    try {
                        if (resposta.data && resposta.data.id) {
                            localStorage.setItem('socimin_last_blog_id', resposta.data.id);
                        }
                    } catch (e) {}
                    // Tenta obter id do usuário logado e abrir o blog deste autor
                    try {
                        const me = await Gateway.validarTokenAutenticacao(localStorage.getItem('socimin_token'));
                        const authorId = me && me.user ? (me.user.id || me.id_usuario) : null;
                        if (authorId) {
                            alert('Sucesso! O blog "' + titulo + '" foi criado.');
                            carregarModulo(`home_pessoal/blog?author=${authorId}`);
                            return;
                        }
                    } catch (err) {}
                    alert('Sucesso! O blog "' + titulo + '" foi criado.');
                    carregarModulo('home_pessoal/perfil');
                } else {
                    alert('Erro: ' + resposta.mensagem);
                    btnSubmit.textContent = textoOriginal;
                    btnSubmit.disabled = false;
                }
            } catch (err) {
                alert('Erro ao criar blog.');
                btnSubmit.textContent = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }

})();