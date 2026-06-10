(function() {
    const btnVoltar = document.getElementById('btn-voltar-chat');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => carregarModulo('home_pessoal/perfil'));
    }
})();