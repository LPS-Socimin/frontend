(async function() {
    const btnVoltar = document.getElementById('btn-voltar-chat');
    if (btnVoltar) {
        btnVoltar.textContent = 'Voltar ao Perfil';
        btnVoltar.addEventListener('click', () => carregarModulo('home_pessoal/perfil'));
    }

    const listaConversas = document.querySelector('.lista-itens');
    if (listaConversas) {
        // Sempre mostrar duas conversas fictícias para apresentação didática
        const mocks = [
            { id: 'mock-1', title: 'João', snippet: 'Olá, João! Você enviou o relatório de presença?', created_at: new Date() },
            { id: 'mock-2', title: 'Maria', snippet: 'Boa tarde, Maria! Como você está?', created_at: new Date(Date.now() - 3600 * 1000) }
        ];

        listaConversas.innerHTML = '';
        // Renderizar mocks primeiro
        mocks.forEach(m => {
            const div = document.createElement('div');
            div.style.padding = '10px';
            div.style.borderBottom = '1px solid #eee';
            div.style.cursor = 'pointer';
            div.innerHTML = `<strong>${m.title}</strong><div style="color:#666; font-size:0.9em;">${m.snippet}</div><div style="color:#999; font-size:0.8em;">${new Date(m.created_at).toLocaleString()}</div>`;
            div.addEventListener('click', () => {
                // ação didática para mock: mostrar modal/alert com conteúdo
                alert(`Abrindo conversa: ${m.title}\n\n${m.snippet}`);
            });
            listaConversas.appendChild(div);
        });

        // Em seguida, tentar carregar conversas reais do backend
        const res = await Gateway.buscarConversas();
        if (res.ok && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
            res.data.items.forEach(chat => {
                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.borderBottom = '1px solid #eee';
                div.style.cursor = 'pointer';
                div.textContent = `Conversa ID: ${chat.id} (Iniciada em ${new Date(chat.created_at).toLocaleDateString()})`;
                div.addEventListener('click', () => {
                    carregarModulo(`chat/inbox?chat_id=${chat.id}`);
                });
                listaConversas.appendChild(div);
            });
        } else {
            // se não houver conversas reais, indicar que apenas os mocks estão visíveis
            const nota = document.createElement('div');
            nota.style.padding = '10px';
            nota.style.color = '#666';
            nota.textContent = 'Somente conversas de demonstração estão disponíveis.';
            listaConversas.appendChild(nota);
        }
    }
})();