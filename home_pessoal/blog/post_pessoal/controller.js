(function() {
    const formPost = document.getElementById('form-postagem');
    const btnCancelar = document.getElementById('btn-cancelar-post');

    formPost.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Postagem publicada com sucesso!');
        carregarModulo('home_pessoal/perfil');
    });

    btnCancelar.addEventListener('click', () => carregarModulo('home_pessoal/perfil'));
})();