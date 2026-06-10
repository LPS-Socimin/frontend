(async function() {
// Bolha de proteção do módulo Criar Blog

    // 1. Lógica do botão Cancelar (Volta para o Perfil)
    const btnCancelar = document.getElementById('btn-cancelar-blog');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(evento) {
            evento.preventDefault();
            carregarModulo('home_pessoal/perfil');
            // Manda o Roteador voltar para o dashboard
        });
    }

    // 2. Lógica para Submeter o Formulário e Salvar no Banco
    const formCriarBlog = document.getElementById('form-criar-blog');
    if (formCriarBlog) {
        formCriarBlog.addEventListener('submit', async function(evento) {
            evento.preventDefault();
            // Bloqueia o reload automático do navegador
            
            const titulo = document.getElementById('input-titulo-blog').value;
            const token = localStorage.getItem('socimin_token');
            
            // Feedback visual no botão enquanto "salva"
            const btnSubmit = formCriarBlog.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.textContent;
            btnSubmit.textContent = 'Criando...';
            btnSubmit.disabled = true;
            
            // Chama o Gateway para persistir a criação no localStorage
            const resposta = await Gateway.criarNovoBlog(token, titulo);
            
            if (resposta.sucesso) {
                alert('Sucesso! O blog "' + titulo + '" foi criado.');
                carregarModulo('home_pessoal/perfil');
                // Volta para a tela principal, que agora saberá que o blog existe!
            } else {
                alert('Erro: ' + resposta.mensagem);
                btnSubmit.textContent = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }

})();