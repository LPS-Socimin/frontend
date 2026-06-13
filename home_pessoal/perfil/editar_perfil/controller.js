(async function() {
    const token = localStorage.getItem('socimin_token');
    
    // Elementos do formulário
    const editNome = document.getElementById('edit-nome');
    const editHandle = document.getElementById('edit-handle');
    const editBio = document.getElementById('edit-bio');
    const editEmail = document.getElementById('edit-email');

    // 1. CARREGA DADOS ATUAIS
    const dadosAtuais = await Gateway.buscarDadosPerfil();
    if (dadosAtuais.sucesso && dadosAtuais.dono_do_perfil) {
        editNome.value = dadosAtuais.dados_publicos.nome;
        editHandle.value = dadosAtuais.dados_publicos.handle;
        editBio.value = dadosAtuais.dados_publicos.bio || '';
        // E-mail não é retornado pelo profile-service, desabilitamos ou buscamos do auth/me
        editEmail.value = 'E-mail gerido pela conta';
        editEmail.disabled = true;
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
            
            const resposta = await Gateway.atualizarDadosPerfil(token, {
                nome: editNome.value,
                handle: editHandle.value,
                bio: editBio.value
            });

            if (resposta.sucesso) {
                alert('Perfil atualizado com sucesso!');
                carregarModulo('home_pessoal/perfil');
            } else {
                alert('Erro ao atualizar perfil: ' + (resposta.mensagem || 'Tente novamente.'));
            }
        });
    }

    // Lógica para o novo botão de desativar conta
    const btnDesativar = document.getElementById('btn-desativar-conta');
    if (btnDesativar) {
        btnDesativar.addEventListener('click', async () => {
            if (confirm("Tem a certeza que deseja desativar a sua conta? Esta ação é irreversível.")) {
                const res = await Gateway.request('profile', '/', { method: 'DELETE' });
                if (res.ok) {
                    localStorage.removeItem('socimin_token');
                    alert("Perfil desativado com sucesso.");
                    carregarModulo('auth');
                } else {
                    alert("Erro ao desativar perfil: " + (res.data?.error || "Erro desconhecido"));
                }
            }
        });
    }
})();