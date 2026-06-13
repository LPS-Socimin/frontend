(function() {
    const formPost = document.getElementById('form-postagem');
    const btnCancelar = document.getElementById('btn-cancelar-post');

    formPost.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const titulo = document.getElementById('titulo-post').value;
        const conteudo = document.getElementById('conteudo-post').value;

        const res = await Gateway.criarPostagemBlog(titulo, conteudo);

        if (res.ok) {
            alert('Postagem publicada com sucesso!');
            carregarModulo('home_pessoal/perfil');
        } else {
            alert('Erro ao publicar postagem: ' + (res.data?.error || 'Tente novamente.'));
        }
    });

    btnCancelar.addEventListener('click', () => carregarModulo('home_pessoal/perfil'));
})();