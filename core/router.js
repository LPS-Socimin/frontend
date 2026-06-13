async function carregarModulo(caminhoCompleto, salvarHistorico = true) {
    const loader = document.getElementById('global-loader');
    loader.style.display = 'flex'; // Mostra o loader imediatamente

    const root = document.getElementById('app-root');
    const [caminhoDoModulo, queryString] = caminhoCompleto.split('?');

    try {
        const respostaHtml = await fetch(`${caminhoDoModulo}/view.html`);
        if (!respostaHtml.ok) throw new Error(`HTML não encontrado em: ${caminhoDoModulo}`);
        const html = await respostaHtml.text();
        
        root.innerHTML = html;

        document.querySelectorAll('.estilo-dinamico, .script-dinamico').forEach(elemento => elemento.remove());

        const linkCss = document.createElement('link');
        linkCss.rel = 'stylesheet';
        linkCss.href = `${caminhoDoModulo}/style.css`;
        linkCss.className = 'estilo-dinamico';
        document.head.appendChild(linkCss);

        // REMOVIDO: Cache-busting que causava lentidão. O navegador agora gerencia o cache.
        const respostaJs = await fetch(`${caminhoDoModulo}/controller.js`);
        if (!respostaJs.ok) throw new Error(`JS não encontrado em: ${caminhoDoModulo}`);
        const js = await respostaJs.text();

        const scriptJs = document.createElement('script');
        scriptJs.textContent = js; 
        scriptJs.className = 'script-dinamico';
        document.body.appendChild(scriptJs);

        if (salvarHistorico) {
            window.history.pushState({ modulo: caminhoCompleto }, "", `?tela=${caminhoCompleto}`);
        }

    } catch (erro) {
        console.error('Falha de Roteamento:', erro);
        root.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red;">
                <h2>Erro ao carregar a tela!</h2>
                <p>O caminho <b>"${caminhoDoModulo}"</b> não foi encontrado.</p>
            </div>
        `;
    } finally {
        loader.style.display = 'none'; // Esconde o loader ao final, mesmo se der erro.
    }
}

window.addEventListener('popstate', function(evento) {
    if (evento.state && evento.state.modulo) {
        carregarModulo(evento.state.modulo, false);
    } else {
        // Carrega a tela inicial se não houver estado
        carregarModulo('auth', false);
    }
});
