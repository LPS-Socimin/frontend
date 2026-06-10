async function iniciarApp() {
// Função assíncrona para iniciar o sistema e ler o histórico

    const parametrosUrl = new URLSearchParams(window.location.search);
    // Lê os parâmetros que estão no link do navegador (tudo depois do "?")
    
    let telaSolicitada = parametrosUrl.get('tela');
    // Captura especificamente o valor da variável "tela" no link

    // --- REGRA 1: MANTER A TELA ATUAL NO REFRESH (F5) ---
    if (telaSolicitada && telaSolicitada !== 'auth') {
    // Se o usuário pedir uma tela específica (como o blog ou fórum) pelo URL...
        
        window.history.replaceState({ modulo: telaSolicitada }, "", `?tela=${telaSolicitada}`);
        carregarModulo(telaSolicitada, false);
        return;
    }

    // --- REGRA 2: FORÇAR TELA INICIAL DE AUTENTICAÇÃO ---
    // Atendendo ao pedido: "Assim que eu abrir meu site, a pagina inicial deve ser a de autenticação"
    let moduloInicial = 'auth';

    window.history.replaceState({ modulo: moduloInicial }, "", `?tela=${moduloInicial}`);
    // Substitui o link no navegador para refletir a tela de login
    
    carregarModulo(moduloInicial, false);
    // Injeta os arquivos da tela de autenticação
}

iniciarApp();
// Roda o código