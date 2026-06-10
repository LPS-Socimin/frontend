(function() {
// Bolha de proteção para a tela do Fórum Público

    const btnVoltar = document.getElementById('btn-voltar-inicio');
    
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function(evento) {
            evento.preventDefault();
            
            // Verifica o estado de autenticação atual do sistema
            const token = localStorage.getItem('socimin_token');
            
            if (token) {
                // Se houver sessão ativa, retorna ao painel do perfil
                carregarModulo('home_pessoal/perfil');
            } else {
                // Caso contrário, redireciona para a tela de login
                carregarModulo('auth');
            }
        });
    }

})();