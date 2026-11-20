# CodeQuest — Aplicativo mobile e API (MVP 0.2.0)

**Projeto acadêmico demonstrativo | React Native + Expo + Node.js + SQLite**

Esta versão mantém as telas e as lições do MVP anterior e acrescenta o primeiro fluxo real de conta do CodeQuest: cadastro, login por e-mail e senha, sessão persistente, API local e banco de dados relacional SQLite.

## 1. O que já funciona

| Recurso | Implementação nesta versão |
|---|---|
| Cadastro | Cria usuário com nome, e-mail e senha. |
| Login | Valida e-mail e senha no backend. |
| Senhas | Armazenadas como hash derivado com salt individual usando `scrypt`; a senha original não é gravada. |
| Sessão | Token aleatório com expiração, salvo como hash no banco e guardado no celular com Expo SecureStore. |
| Recuperar sessão | Ao reabrir o app, consulta a API e recupera a conta autenticada. |
| Banco de dados | SQLite relacional em `backend/data/codequest.sqlite`. |
| Perfil | XP, gems, ofensiva, lições concluídas e revisões são salvos no banco. |
| Sair da conta | Revoga a sessão no servidor e apaga o token local. |
| Inspeção | `npm run db:inspect` lista contas e estatísticas sem exibir senha, hash ou token. |
| Testes | `npm test` executa testes da API, autenticação, sessão, perfil e lógica de progressão. |

A parte de aprendizado continua sendo a do MVP anterior. O foco novo desta entrega é autenticação e persistência.

## 2. Arquitetura desta demonstração

```text
Celular (Expo Go)
       |
       | HTTP na rede local durante desenvolvimento
       v
API Node.js (porta 3333)
       |
       | consultas SQL
       v
SQLite: backend/data/codequest.sqlite
```

O banco contém três tabelas iniciais:

- `users`: identificador, nome de usuário, e-mail e hash/salt da senha.
- `user_profiles`: XP, gems, ofensiva e progresso de aprendizagem.
- `auth_sessions`: sessões ativas, armazenando somente o hash do token.

O arquivo `backend/schema.sql` contém a definição das tabelas, chaves primárias, chaves estrangeiras e índices.

**Limite importante:** o SQLite é o banco local de desenvolvimento desta primeira etapa. Ele é persistente e relacional, mas ainda não é um banco remoto compartilhado entre celulares. A próxima evolução poderá migrar esse mesmo núcleo para PostgreSQL e hospedar a API em um servidor.

## 3. Pré-requisitos

- Node.js 22.13 ou superior.
- npm.
- VS Code (recomendado).
- Expo Go instalado no celular.
- Computador e celular na mesma rede Wi-Fi para testar via LAN.

O projeto permanece no Expo SDK 57. Para abrir no Expo Go, instale uma versão do Expo Go compatível com SDK 57. As bibliotecas `expo-constants` e `expo-secure-store` estão fixadas em versões compatíveis com essa linha do SDK.

A API usa o módulo SQLite nativo do Node.js (`node:sqlite`), sem driver nativo adicional. No Node 22 ele pode exibir um aviso de recurso experimental; o aviso não significa que a execução falhou. O Node 24 mais recente oferece um estágio de estabilidade mais avançado para esse módulo.

## 4. Instalação e execução

### Passo 1 — Extrair e abrir o projeto

Clone o repositório ou extraia o pacote e abra a pasta `CodeQuest` no VS Code.

### Passo 2 — Instalar dependências

No terminal integrado, execute:

```bash
npm install
```

### Passo 3 — Iniciar a API e o banco

Abra o primeiro terminal e execute:

```bash
npm run server
```

Na primeira execução, o backend cria automaticamente a pasta `backend/data` e o arquivo `codequest.sqlite`, além de criar as tabelas.

A API ficará disponível na porta `3333`. Teste no navegador do próprio computador:

```text
http://localhost:3333/api/health
```

A resposta esperada é um JSON com `"ok": true` e `"database": "sqlite"`.

**Não feche esse terminal enquanto estiver usando o aplicativo.**

### Passo 4 — Iniciar o Expo

Abra um segundo terminal na pasta do projeto e execute:

```bash
npx expo start --lan
```

O Expo CLI mostrará um QR Code. Abra o Expo Go e faça a leitura. O celular precisa estar na mesma rede Wi-Fi do computador.

O app tenta descobrir automaticamente o IP do computador a partir do endereço LAN usado pelo Expo. Se a conexão com a API não funcionar, configure manualmente a URL:

1. No Windows, abra o PowerShell e execute `ipconfig`.
2. Localize o endereço IPv4 do adaptador Wi-Fi, por exemplo `192.168.0.25`.
3. Crie um arquivo `.env` na raiz do projeto, ao lado de `package.json`.
4. Adicione, substituindo pelo seu IPv4:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.25:3333/api
```

5. Pare o Expo com `Ctrl+C` e reinicie:

```bash
npx expo start --lan --clear
```

Se o Windows perguntar, permita o Node.js em redes privadas. Não abra a porta 3333 para a Internet; ela é apenas para esta demonstração local.

### Passo 5 — Criar sua conta de teste

No aplicativo:

1. Toque em **CRIAR MINHA CONTA**.
2. Informe nome de usuário, e-mail e senha.
3. Use uma senha de demonstração com pelo menos 8 caracteres; não reutilize uma senha pessoal importante.
4. Toque em **CRIAR CONTA**.
5. O servidor grava a conta e o perfil no SQLite e devolve uma sessão ao aplicativo.

Depois:

1. Abra a aba **Perfil**.
2. Use **SAIR DA CONTA**.
3. Na tela inicial, escolha **JÁ TENHO UMA CONTA**.
4. Entre com o mesmo e-mail e senha.
5. O aplicativo recupera o perfil salvo no banco.

## 5. Demonstrar que o banco recebeu os dados

Com a API funcionando, abra um terceiro terminal e execute:

```bash
npm run db:inspect
```

O comando mostra:

- usuários cadastrados;
- e-mail mascarado;
- data de cadastro e último login;
- XP, gems e ofensiva;
- quantidade de lições concluídas;
- sessões ativas.

O inspetor **não mostra senha, salt, hash ou token**.

O arquivo do banco fica em:

```text
backend/data/codequest.sqlite
```

Esse arquivo é criado na primeira execução e permanece no computador após fechar o aplicativo ou o servidor.

## 6. Testes automatizados

Execute:

```bash
npm test
```

Os testes cobrem:

- cadastro e criação de perfil;
- bloqueio de cadastro duplicado;
- senha incorreta;
- criação, validação e revogação de sessão;
- persistência de XP e lições no banco;
- endpoints de health, cadastro, sessão e logout;
- regras de progresso e recompensa do MVP anterior.

## 7. Endpoints implementados

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/api/health` | Verifica API e banco. |
| POST | `/api/auth/register` | Cria uma conta e uma sessão. |
| POST | `/api/auth/login` | Valida credenciais e cria uma sessão. |
| GET | `/api/auth/me` | Recupera usuário e perfil da sessão. |
| POST | `/api/auth/logout` | Revoga a sessão atual. |
| PUT | `/api/profile` | Atualiza XP, gems e progresso. |

As rotas protegidas recebem o token no cabeçalho `Authorization: Bearer <token>`.

## 8. Arquivos novos e alterados

```text
backend/
├── auth-service.js       # cadastro, login, senha e sessões
├── database.js           # abertura e inicialização do SQLite
├── schema.sql            # tabelas, chaves e índices
├── server.js             # API HTTP
├── inspect-db.js         # inspeção sem segredos
└── tests/
    ├── api.test.js
    └── auth.test.js

src/services/api.js       # cliente HTTP usado pelo app
src/screens/AuthScreens.js# telas de cadastro e login reais
App.js                    # restauração da sessão e sincronização do perfil
```

## 9. Segurança e limites desta etapa

- Senhas não são armazenadas em texto puro. O backend deriva um hash com `scrypt` e salt aleatório individual.
- O token de sessão é aleatório; o banco guarda somente seu SHA-256. O token no celular fica no `expo-secure-store`, não no AsyncStorage.
- A API tem limite básico de tentativas de cadastro/login por IP para a demonstração.
- Nesta etapa, o endpoint de perfil recebe os indicadores de progresso enviados pelo aplicativo para demonstrar persistência. Antes de produção, o servidor deverá calcular e validar recompensas (XP/gems) por eventos de lição, em vez de aceitar os totais enviados pelo cliente.
- A comunicação HTTP está sem TLS porque o servidor é local e didático. Use apenas uma conta e senha de teste em rede privada confiável. Não use senhas reais nem exponha a porta 3333 publicamente.
- Antes de produção, ainda precisamos de HTTPS, política de rate limit robusta, recuperação/verificação de e-mail, gestão de segredos, backups, logs e revisão de segurança.
- A conta não é um cadastro de produção e não está hospedada na AWS. A API e o SQLite ficam no computador que executa o backend.

## 10. Documentação do repositório

- [Arquitetura de login e banco](docs/ARQUITETURA_LOGIN_BANCO.md)
- [Estado atual e próximos passos](docs/STATUS_DO_PROJETO.md)
- [Protótipo Figma](docs/FIGMA.md)
- [Roteiro de demonstração](APRESENTACAO_PARA_AULA.md)
- [Política de segurança](SECURITY.md)
- [Como contribuir](CONTRIBUTING.md)

## 11. Próxima etapa recomendada

Depois de demonstrar cadastro/login e persistência, a continuação natural é migrar o esquema para PostgreSQL, colocar a API em um servidor e começar a servir cursos e lições pelo backend, mantendo a mesma experiência mobile.
