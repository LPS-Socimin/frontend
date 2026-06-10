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
├── 📂 auth/               # Módulo de Autenticação (Login/Cadastro)
├── 📂 chat/               # Módulo de Mensagens Privadas
├── 📂 core/               # Núcleo da Aplicação
│   ├── gateway.js         # Simulador de Banco de Dados e API
│   └── router.js          # Motor de roteamento SPA
├── 📂 forum/              # Módulo de Fóruns Públicos
├── 📂 home_pessoal/       # Ecossistema do Perfil e Blog
│   ├── 📂 blog/           # Lógica do Blog Pessoal
│   └── 📂 perfil/         # Dashboard e configurações de usuário
├── index.html             # Ponto de entrada (Shell) da aplicação
└── global.css             # Variáveis de cor e estilos reaproveitáveis

```

## Tutorial de Execução do Projeto Localmente (via Python no Terminal)

* Utilize o comando: python -m http.server 5500
* Em seguida, acesse o endereço abaixo no seu navegador padrão: http://localhost:5500
