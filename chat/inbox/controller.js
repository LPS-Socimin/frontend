(async function() {
    const btnVoltar = document.getElementById('btn-voltar-chat');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => carregarModulo('home_pessoal/perfil'));
    }

    const listaConversas = document.querySelector('.lista-itens');
    if (listaConversas) {
        const res = await Gateway.buscarConversas();
        if (res.ok && res.data.items && res.data.items.length > 0) {
            listaConversas.innerHTML = '';
            res.data.items.forEach(chat => {
                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.borderBottom = '1px solid #eee';
                div.style.cursor = 'pointer';
                div.textContent = `Conversa ID: ${chat.id} (Iniciada em ${new Date(chat.created_at).toLocaleDateString()})`;
                div.addEventListener('click', () => {
                    // Aqui poderia abrir a conversa específica
                    alert('Abrindo conversa ' + chat.id);
                });
                listaConversas.appendChild(div);
            });
        } else {
            listaConversas.innerHTML = '<div style="padding: 10px;">Nenhuma conversa encontrada.</div>';
        }
    }
})();