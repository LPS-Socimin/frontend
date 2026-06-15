// Função auxiliar para obter o nome do arquivo baseado no caminho
function obterNomeArquivo(caminhoDoModulo, tipo) {
    // Extrai o nome da pasta (última parte do caminho)
    const partes = caminhoDoModulo.split('/');
    const nomePasta = partes[partes.length - 1];
    
    // Converte snake_case para PascalCase
    const pascalCase = nomePasta
        .split('_')
        .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join('');
    
    // Retorna o nome do arquivo com a extensão correta
    switch(tipo) {
        case 'view': return `${pascalCase}View.html`;
        case 'style': return `${pascalCase}Style.css`;
        case 'controller': return `${pascalCase}Controller.js`;
        default: return null;
    }
}

async function carregarModulo(caminhoCompleto, salvarHistorico = true) {
    const loader = document.getElementById('global-loader');
    loader.style.display = 'flex'; // Mostra o loader imediatamente

    const root = document.getElementById('app-root');
    const [caminhoDoModulo, queryString] = caminhoCompleto.split('?');

    try {
        const nomeView = obterNomeArquivo(caminhoDoModulo, 'view');
        const respostaHtml = await fetch(`${caminhoDoModulo}/${nomeView}`);
        if (!respostaHtml.ok) throw new Error(`HTML não encontrado em: ${caminhoDoModulo}/${nomeView}`);
        const html = await respostaHtml.text();
        
        root.innerHTML = html;

        document.querySelectorAll('.estilo-dinamico, .script-dinamico').forEach(elemento => elemento.remove());

        const linkCss = document.createElement('link');
        linkCss.rel = 'stylesheet';
        const nomeStyle = obterNomeArquivo(caminhoDoModulo, 'style');
        // Adiciona cache-buster em desenvolvimento para garantir atualização rápida dos estilos
        linkCss.href = `${caminhoDoModulo}/${nomeStyle}?v=${Date.now()}`;
        linkCss.className = 'estilo-dinamico';
        document.head.appendChild(linkCss);

        // REMOVIDO: Cache-busting que causava lentidão. O navegador agora gerencia o cache.
        // Atualiza o histórico ANTES de injetar/executar o controller para que o
        // script carregado veja os parâmetros corretos em `window.location.search`.
        if (salvarHistorico) {
            const caminhoDoModuloEncoded = caminhoDoModulo;
            const url = queryString ? `?tela=${caminhoDoModuloEncoded}&${queryString}` : `?tela=${caminhoDoModuloEncoded}`;
            window.history.pushState({ modulo: caminhoCompleto }, "", url);
        }

        const nomeController = obterNomeArquivo(caminhoDoModulo, 'controller');
        const respostaJs = await fetch(`${caminhoDoModulo}/${nomeController}?v=${Date.now()}`);
        if (!respostaJs.ok) throw new Error(`JS não encontrado em: ${caminhoDoModulo}`);
        const js = await respostaJs.text();

        const scriptJs = document.createElement('script');
        scriptJs.textContent = js; 
        scriptJs.className = 'script-dinamico';
        document.body.appendChild(scriptJs);

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
