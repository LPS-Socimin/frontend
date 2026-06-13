(async function() {
    const params = new URLSearchParams(window.location.search);
    // Se não houver handle na URL, usa uma string vazia para o endpoint, caindo na rota GET /profile/ (meu perfil)
    const handle = params.get('handle') || ''; 
    const tokenSalvo = localStorage.getItem('socimin_token');

    // Se estiver tentando ver um perfil sem handle e não estiver logado, vai para o login
    if (!handle && !tokenSalvo) {
        carregarModulo('auth');
        return;
    }

    // A nova rota do backend agora nos dá toda a inteligência que precisamos
    const profileRes = await Gateway.request('profile', `/${handle}`);

    const divErro = document.getElementById('erro-perfil');
    const divConteudo = document.getElementById('conteudo-perfil');

    if (!profileRes.ok) {
        divErro.style.display = 'block';
        divConteudo.style.display = 'none';
        document.getElementById('erro-msg').textContent = profileRes.data?.error || 'Erro ao carregar perfil.';
        document.getElementById('btn-voltar-erro').addEventListener('click', () => carregarModulo('auth'));
        return;
    }

    divErro.style.display = 'none';
    divConteudo.style.display = 'block';
    
    const profileData = profileRes.data;
    const flags = profileData.flags;

    // -- RENDERIZAÇÃO PRINCIPAL --
    document.getElementById('perfil-nome').textContent = profileData.nickname;
    document.getElementById('perfil-handle').textContent = profileData.handle;
    document.getElementById('perfil-bio').textContent = profileData.bio || 'Sem bio informada.';
    
    // -- LÓGICA DE BOTÕES (BASEADA NAS FLAGS DO BACKEND) --
    if (flags.is_owner) {
        document.getElementById('area-edicao').style.display = 'block';
    }
    
    if (flags.can_interact) {
        document.getElementById('area-interacao').style.display = 'flex';
        const details = flags.interaction_details;
        if (details.is_contact) {
            document.getElementById('btn-rem-contato').style.display = 'inline-block';
        } else {
            document.getElementById('btn-add-contato').style.display = 'inline-block';
        }
        // Lógica do chat pode ser adicionada aqui
    }

    if (tokenSalvo) {
        document.getElementById('btn-sair').style.display = 'block';
    }

    // -- LÓGICA DE CLIQUE DOS BOTÕES DE INTERAÇÃO --
    document.getElementById('btn-add-contato').addEventListener('click', async () => {
        const res = await Gateway.adicionarContato(profileData.id);
        if(res.ok) {
            alert('Contato adicionado com sucesso!');
            carregarModulo(`home_pessoal/perfil?handle=${profileData.handle}`); // Recarrega a página
        } else {
            alert(`Erro: ${res.data?.error || 'Não foi possível adicionar o contato.'}`);
        }
    });

    document.getElementById('btn-rem-contato').addEventListener('click', async () => {
        const res = await Gateway.removerContato(profileData.id);
        if(res.ok) {
            alert('Contato removido com sucesso!');
            carregarModulo(`home_pessoal/perfil?handle=${profileData.handle}`); // Recarrega a página
        } else {
            alert(`Erro: ${res.data?.error || 'Não foi possível remover o contato.'}`);
        }
    });
    
    // -- RENDERIZAÇÃO DAS SEÇÕES (BLOG/FORUM) --
    // ... (código de renderização de fóruns e blogs permanece o mesmo, usando `profileData.user_id`)
    
    // -- EVENTOS DE ROTEAMENTO --
    document.getElementById('btn-editar-perfil').addEventListener('click', () => carregarModulo('home_pessoal/perfil/editar_perfil'));
    // ... (restante dos eventos)
})();
