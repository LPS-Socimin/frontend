(function() {
// Bolha de proteção para a tela de Criar Fórum

    // 1. Lógica do botão Cancelar (Volta ao Perfil)
    const btnCancelar = document.getElementById('btn-cancelar-forum');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(evento) {
            evento.preventDefault();
            carregarModulo('home_pessoal/perfil');
            // Manda o roteador voltar para a dashboard do perfil
        });
    }

    // 2. Lógica de Salvar o Formulário
    const formCriar = document.getElementById('form-criar-forum');
    if (formCriar) {
        formCriar.addEventListener('submit', function(evento) {
            evento.preventDefault();
            // Evita o recarregamento automático da página
            
            const nomeForum = document.getElementById('input-nome-forum').value;
            // Captura o nome que o usuário digitou
            
            // Simulação de chamada ao Backend:
            console.log('Solicitação de criação de fórum enviada para:', nomeForum);
            alert('Fórum "' + nomeForum + '" criado com sucesso!');
            
            carregarModulo('home_pessoal/perfil');
            // Retorna ao perfil após concluir a ação
        });
    }

})();