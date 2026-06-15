# FrontEnd - Socimin

Projeto desenvolvido para disciplina de Tópicos em Engenharia de Software: Projetando Linhas de Produto de Software.
 

## Tecnologias e Padrões Utilizados

* **HTML5 Semântico & CSS3:** Estilização responsiva, componentizada e reutilizável.
* **Vanilla JavaScript (ES6+):** Motor assíncrono para manipulação do DOM e gestão de estado.
* **Roteamento SPA Customizado:** Sistema de *Single Page Application* construído do zero, injetando vistas e controladores dinamicamente.
* **Gateway / Mock Backend:** Uso do padrão arquitetural Gateway acoplado ao `LocalStorage` para simular requisições assíncronas, persistência de banco de dados e validação de Tokens JWT.

## Estrutura do Projeto

```text
📦 SOCIMIN
├── 📂 auth/                           # Módulo de Autenticação (Login/Cadastro)
├── 📂 chat/                           # Módulo de Mensagens Privadas
│   ├── 📂 inbox/                      # Módulo de conversas (caixa de entrada)
├── 📂 core/                           # Núcleo da Aplicação
│   ├── gateway.js                      # Simulador de Banco de Dados e API
│   └── router.js                       # Motor de roteamento SPA
├── 📂 forum/                          # Módulo de Fóruns Públicos
│   ├── 📂 home_forum/                 # Lógica do Fórum Pessoal
│        └── 📂 criar_forum/           # Módulo de criação de Fórum
│   └── 📂 post_forum/                 # Lógica de postagem de Fórum
│   ├── 📂 view_forum/                 # Lógica de tela do Fórum
├── 📂 home_pessoal/                   # Ecossistema do Perfil e Blog
│   ├── 📂 blog/                       # Lógica do Blog Pessoal
│        └── 📂 criar_blog/            # Módulo de criação de Blog
│        └── 📂 post_pessoal/          # Lógica de posto em Blog Pessoal
│   └── 📂 perfil/                     # Dashboard e configurações de usuário
│       └── 📂 editar perfil/          # Módulo de edição de Perfil
├── RootIndex.html                     # Ponto de entrada (Shell) da aplicação
└── global.css                         # Variáveis de cor e estilos reaproveitáveis
└── serve_root.py                      # Script para rodar o frontend

```

## Tutorial de Execução do Projeto Localmente

* **1 - Utilizando o terminal:**

```bash
# a partir de frontend-main, digite no terminal:
python serve_root.py
# abre http://localhost:5500
```

Observação: este script (`serve_root.py`) foi adicionado ao repositório e faz com que a raiz `/` sirva `RootIndex.html` (caso exista). Sem esse script, `python -m http.server` exibirá listagem de diretório quando não houver `index.html` padrão.


* **2 - Usando VSCode Live Server**

Instale a extensão "Live Server" e clique com o botão direito em `RootIndex.html` → "Open with Live Server".

## Dica:
- Execute sempre os comandos a partir da pasta `frontend` para não haver erros de caminho.
