const Gateway = {
    validarTokenAutenticacao: async function(tokenRecebido) {
        return new Promise((resolver) => {
            setTimeout(() => {
                if (tokenRecebido === 'token_simulado_jwt_12345') {
                    resolver({ valido: true, mensagem: 'Usuário autenticado', id_usuario: 101 });
                } else {
                    resolver({ valido: false, mensagem: 'Usuário não autenticado' });
                }
            }, 500); 
        });
    },

    // --- LÓGICA DE SIMULAÇÃO DE BANCO DE DADOS (Persistência) ---
    obterBancoDeDados: function() {
        const dbStr = localStorage.getItem('socimin_db_perfil');
        if (dbStr) return JSON.parse(dbStr); 
        
        // Adicionadas as flags de controle do Blog Inicial
        const dbInicial = {
            nome: 'Estudante de Engenharia',
            handle: '@usuario_teste', 
            bio: 'Desenvolvedor da rede Socimin.',
            email: 'estudante@faculdade.com',
            hasBlog: false,    // Inicia sem blog
            blogTitulo: ''     // Sem título inicialmente
        };
        localStorage.setItem('socimin_db_perfil', JSON.stringify(dbInicial));
        return dbInicial;
    },

    salvarBancoDeDados: function(dados) {
        localStorage.setItem('socimin_db_perfil', JSON.stringify(dados));
    },

    buscarDadosPerfil: async function(tokenRecebido) {
        console.log('Gateway: Buscando dados atualizados do perfil...');
        const db = this.obterBancoDeDados();
        
        return new Promise((resolver) => {
            setTimeout(() => {
                if (tokenRecebido === 'token_simulado_jwt_12345') {
                    resolver({
                        sucesso: true,
                        dono_do_perfil: true,
                        // Retornando a flag hasBlog e blogTitulo para o front-end
                        dados_publicos: { 
                            handle: db.handle, 
                            nome: db.nome, 
                            bio: db.bio,
                            hasBlog: db.hasBlog || false,
                            blogTitulo: db.blogTitulo || ''
                        },
                        dados_sensiveis: { email: db.email },
                        contatos: ['@amigo1', '@amigo2'],
                        foruns_criados: ['Fórum de Computação'],
                        postagens_blog: ['Meu primeiro post na LPS!']
                    });
                } else {
                    resolver({
                        sucesso: true,
                        dono_do_perfil: false,
                        dados_publicos: { 
                            handle: db.handle, 
                            nome: db.nome, 
                            bio: db.bio,
                            hasBlog: db.hasBlog || false,
                            blogTitulo: db.blogTitulo || ''
                        },
                        contatos: ['@amigo1', '@amigo2']
                    });
                }
            }, 500);
        });
    },

    atualizarDadosPerfil: async function(tokenRecebido, novosDados) {
        console.log('Gateway: Salvando novos dados no banco...');
        return new Promise((resolver) => {
            setTimeout(() => {
                if (tokenRecebido === 'token_simulado_jwt_12345') {
                    const db = this.obterBancoDeDados();
                    db.nome = novosDados.nome;
                    db.bio = novosDados.bio;
                    db.email = novosDados.email;
                    db.handle = novosDados.handle; 
                    this.salvarBancoDeDados(db);
                    
                    resolver({ sucesso: true, mensagem: 'Perfil atualizado com sucesso!' });
                } else {
                    resolver({ sucesso: false, mensagem: 'Erro de autenticação.' });
                }
            }, 500);
        });
    },

    // --- NOVO MÉTODO: CRIAR NOVO BLOG ---
    criarNovoBlog: async function(tokenRecebido, tituloBlog) {
        console.log('Gateway: Criando novo blog...');
        return new Promise((resolver) => {
            setTimeout(() => {
                if (tokenRecebido === 'token_simulado_jwt_12345') {
                    const db = this.obterBancoDeDados();
                    db.hasBlog = true;          // Ativa a flag de que o blog existe
                    db.blogTitulo = tituloBlog; // Salva o título escolhido
                    this.salvarBancoDeDados(db);
                    
                    resolver({ sucesso: true, mensagem: 'Blog criado no banco com sucesso!' });
                } else {
                    resolver({ sucesso: false, mensagem: 'Erro de autenticação.' });
                }
            }, 500);
        });
    }
};