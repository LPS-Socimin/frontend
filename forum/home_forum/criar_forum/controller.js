(async function() {
    // 1. Lógica do botão Voltar (Volta ao Perfil)
    const btnVoltar = document.getElementById('btn-voltar-forum');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function(evento) {
            evento.preventDefault();
            carregarModulo('home_pessoal/perfil');
        });
    }

    // 2. Lógica de Salvar o Formulário
    const formCriar = document.getElementById('form-criar-forum');
    if (formCriar) {
        formCriar.addEventListener('submit', async function(evento) {
            evento.preventDefault();
            
            const nomeForum = document.getElementById('input-nome-forum').value;
            const descricao = document.getElementById('input-desc-forum')?.value || "Discussão sobre " + nomeForum;
            
            const res = await Gateway.criarForum(nomeForum, descricao);
            
            if (res.ok) {
                alert('Fórum "' + nomeForum + '" criado com sucesso!');
                carregarModulo('home_pessoal/perfil');
            } else {
                alert('Erro ao criar fórum: ' + (res.data?.error || 'Tente novamente.'));
            }
        });
    }

})();