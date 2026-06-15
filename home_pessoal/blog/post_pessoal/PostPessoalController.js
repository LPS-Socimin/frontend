(function() {
    const formPost = document.getElementById('form-postagem');
    const btnCancelar = document.getElementById('btn-cancelar-post');


    formPost.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = document.getElementById('titulo-post').value.trim();
        const conteudo = document.getElementById('conteudo-post').value.trim();
        const imagemFileEl = document.getElementById('imagem-file-post');
        const imagemFile = (imagemFileEl && imagemFileEl.files && imagemFileEl.files.length > 0) ? imagemFileEl.files[0] : null;
        const videoUrl = document.getElementById('video-post').value.trim() || null;

        let res;
        if (imagemFile) {
            res = await Gateway.criarPostagemBlog(titulo, conteudo, null, imagemFile, videoUrl);
        } else {
            res = await Gateway.criarPostagemBlog(titulo, conteudo, null, null, videoUrl);
        }

        if (res.ok) {
            alert('Postagem publicada com sucesso!');
            carregarModulo('home_pessoal/perfil');
        } else {
            const msg = res.data?.error || res.raw || res.error || `Status ${res.status}`;
            alert('Erro ao publicar postagem: ' + msg);
            console.error('Detalhes da falha ao criar post (blog):', res);
        }
    });

    if (btnCancelar) {
        btnCancelar.textContent = 'Voltar ao Perfil';
        btnCancelar.addEventListener('click', () => carregarModulo('home_pessoal/perfil'));
    }
})();