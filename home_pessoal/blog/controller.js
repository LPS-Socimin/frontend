(async function() {
// Bolha de proteção assíncrona do Blog Pessoal

    const tokenSalvo = localStorage.getItem('socimin_token');
    
    // [AVISO: BACKEND NECESSÁRIO] Numa aplicação real, a handle do blog a ser carregado viria da URL.
    // Aqui estamos reaproveitando o Gateway para simular os dados do dono do blog.
    const respostaBlog = await Gateway.buscarDadosPerfil(tokenSalvo);

    const divErro = document.getElementById('erro-blog');
    const divConteudo = document.getElementById('conteudo-blog');

    // =========================================================
    // 1. VALIDAÇÃO DE EXISTÊNCIA DO BLOG
    // =========================================================
    // Simula a verificação se o usuário possui a feature de blog ativa na sua LPS
    const temBlogAtivo = true; // Simulação de backend

    if (!respostaBlog || !respostaBlog.sucesso || !temBlogAtivo) {
        if (divErro) divErro.style.display = 'block';
        if (divConteudo) divConteudo.style.display = 'none';
        
        const btnVoltarErro = document.getElementById('btn-voltar-erro');
        if (btnVoltarErro) {
            btnVoltarErro.addEventListener('click', () => {
                carregarModulo(tokenSalvo ? 'home_pessoal/perfil' : 'auth');
            });
        }
        return; // Pára a execução
    }

    if (divErro) divErro.style.display = 'none';
    if (divConteudo) divConteudo.style.display = 'block';

    // =========================================================
    // 2. PREENCHIMENTO DE DADOS DO BLOG
    // =========================================================
    const handleAtual = respostaBlog.dados_publicos.handle;
    document.getElementById('blog-titulo').textContent = 'Blog de ' + respostaBlog.dados_publicos.nome;
    document.getElementById('blog-handle').textContent = handleAtual;
    
    // Atualiza o autor do post de exemplo para corresponder ao dono do blog
    const autorExemplo = document.getElementById('exemplo-author');
    if (autorExemplo) autorExemplo.textContent = '👤 ' + handleAtual;

    // =========================================================
    // 3. REGRAS DE ACESSO E PERMISSÕES (LPS)
    // =========================================================
    if (respostaBlog.dono_do_perfil) {
        // É O DONO DO BLOG: Pode criar postagens e apagar o blog
        document.getElementById('area-dono-blog').style.display = 'block';

        const btnNovaPostagem = document.getElementById('btn-nova-postagem');
        if (btnNovaPostagem) btnNovaPostagem.addEventListener('click', () => carregarModulo('home_pessoal/blog/post_pessoal'));

        const btnApagarBlog = document.getElementById('btn-apagar-blog');
        if (btnApagarBlog) {
            btnApagarBlog.addEventListener('click', () => {
                if (confirm("ATENÇÃO: Tem a certeza que deseja apagar o seu blog e todas as postagens? Esta ação é irreversível.")) {
                    // [AVISO: BACKEND NECESSÁRIO] Rota DELETE /blog/
                    alert("O seu blog foi apagado com sucesso.");
                    carregarModulo('home_pessoal/perfil');
                }
            });
        }

    } else if (tokenSalvo) {
        // VISITANTE LOGADO: Pode seguir ou deixar de seguir o blog
        document.getElementById('area-interacao-blog').style.display = 'block';
        
        const btnSeguir = document.getElementById('btn-seguir-blog');
        const btnDeixarSeguir = document.getElementById('btn-deixar-seguir');
        
        // Simulação de toggle de Seguir/Deixar de Seguir
        if (btnSeguir && btnDeixarSeguir) {
            btnSeguir.addEventListener('click', () => {
                // [AVISO: BACKEND NECESSÁRIO] Rota POST /blog/seguir
                alert('Agora você está seguindo o blog de ' + handleAtual);
                btnSeguir.style.display = 'none';
                btnDeixarSeguir.style.display = 'inline-block';
            });
            
            btnDeixarSeguir.addEventListener('click', () => {
                // [AVISO: BACKEND NECESSÁRIO] Rota DELETE /blog/seguir
                alert('Você deixou de seguir este blog.');
                btnDeixarSeguir.style.display = 'none';
                btnSeguir.style.display = 'inline-block';
            });
        }
    }
    // (Se não houver token, é visitante anônimo: as áreas de dono e interação continuam ocultas pelo HTML)

    // =========================================================
    // 4. ROTA DE BUSCA DE BLOGS
    // =========================================================
    const formBusca = document.getElementById('form-busca-blog');
    if (formBusca) {
        formBusca.addEventListener('submit', (e) => {
            e.preventDefault();
            const termoBusca = document.getElementById('input-busca-blog').value;
            const divResultados = document.getElementById('resultados-busca-blog');
            
            // [AVISO: BACKEND NECESSÁRIO] Faria uma chamada à base de dados filtrando blogs
            divResultados.innerHTML = `
                <div style="background: #e1f5fe; padding: 10px; border-radius: 6px; font-size: 14px; color: #0277bd;">
                    <strong>🔍 Resultados simulados para "${termoBusca}":</strong><br>
                    - <a href="#" style="color: #0288d1; text-decoration: none;">Blog de Engenharia (@engenheiro_x)</a><br>
                    - <a href="#" style="color: #0288d1; text-decoration: none;">Tech News (@tech_guru)</a>
                </div>
            `;
        });
    }

    // =========================================================
    // 5. NAVEGAÇÃO BÁSICA
    // =========================================================
    const btnVoltar = document.getElementById('btn-voltar-inicio');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', (evento) => {
            evento.preventDefault();
            carregarModulo(tokenSalvo ? 'home_pessoal/perfil' : 'auth');
        });
    }

})();