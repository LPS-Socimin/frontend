(async function() {
    const token = localStorage.getItem('socimin_token');
    
    // Elementos do formulário
    const editNome = document.getElementById('edit-nome');
    const editHandle = document.getElementById('edit-handle');
    const editBio = document.getElementById('edit-bio');
    const editEmail = document.getElementById('edit-email');

    // 1. CARREGA DADOS ATUAIS
    const dadosAtuais = await Gateway.buscarDadosPerfil(token);
    if (dadosAtuais.sucesso && dadosAtuais.dono_do_perfil) {
        editNome.value = dadosAtuais.dados_publicos.nome;
        editHandle.value = dadosAtuais.dados_publicos.handle;
        editBio.value = dadosAtuais.dados_publicos.bio;
        editEmail.value = dadosAtuais.dados_sensiveis.email;
    }

    // 2. LÓGICA BOTÃO CANCELAR
    const btnCancelar = document.getElementById('btn-cancelar-edicao');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', (e) => {
            e.preventDefault();
            carregarModulo('home_pessoal/perfil');
        });
    }

    // 3. LÓGICA SALVAR FORMULÁRIO
    const formEdicao = document.getElementById('form-editar-perfil');
    if (formEdicao) {
        formEdicao.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Aqui enviamos o campo editHandle.value para o Gateway
            const resposta = await Gateway.atualizarDadosPerfil(token, {
                nome: editNome.value,
                handle: editHandle.value, // Novo campo enviado
                bio: editBio.value,
                email: editEmail.value
            });

            if (resposta.sucesso) {
                alert('Perfil atualizado com sucesso!');
                carregarModulo('home_pessoal/perfil');
            }
        });
    }
})();