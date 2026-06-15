(async function() {
    // 1. Lógica do botão Voltar (Volta ao Perfil)
    const btnVoltar = document.getElementById('btn-voltar-forum');
    if (btnVoltar) {
        // Atualiza label para deixar claro onde o botão leva
        btnVoltar.textContent = 'Voltar aos Fóruns';
        btnVoltar.addEventListener('click', function(evento) {
            evento.preventDefault();
            // Volta para a lista de fóruns (comportamento mais intuitivo neste contexto)
            carregarModulo('forum/home_forum');
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
                    const created = res.data || {};
                    // Salva o último fórum criado para uso por outras telas (fallback)
                    if (created.id) {
                        try { localStorage.setItem('socimin_last_forum_id', created.id); } catch (e) { /* ignore */ }
                    }

                    alert('Fórum "' + nomeForum + '" criado com sucesso!');
                    // Vai para a nova página do fórum
                    if (created.id) {
                        carregarModulo(`forum/view_forum?id=${created.id}`);
                    } else {
                        carregarModulo('home_pessoal/perfil');
                    }
            } else {
                alert('Erro ao criar fórum: ' + (res.data?.error || 'Tente novamente.'));
            }
        });
    }

})();