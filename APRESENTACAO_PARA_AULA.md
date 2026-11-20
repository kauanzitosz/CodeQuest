# CodeQuest — Demonstração de login e banco de dados

## Objetivo
Demonstrar o primeiro módulo de conta real do CodeQuest: cadastro, login, sessão persistente e armazenamento relacional em SQLite.

## Preparação
1. Extraia o ZIP e abra a pasta no VS Code.
2. Execute `npm install`.
3. No primeiro terminal, execute `npm run server`.
4. Verifique `http://localhost:3333/api/health` no navegador do computador. A resposta deve mostrar `ok: true`.
5. No segundo terminal, execute `npx expo start --lan`.
6. Abra o QR Code no Expo Go. O celular e o computador devem estar na mesma Wi-Fi.

Se o app não alcançar o backend, verifique o IPv4 do computador com `ipconfig`, configure `EXPO_PUBLIC_API_URL=http://IP_DO_COMPUTADOR:3333/api` em um `.env` e reinicie o Expo com `npx expo start --lan --clear`.

## Roteiro de demonstração (3–5 minutos)

### 1. Apresentar a arquitetura
Explique que o celular executa o React Native/Expo; as requisições vão para uma API Node.js; e a API grava os dados em um arquivo SQLite no computador.

### 2. Criar uma conta
1. No CodeQuest, toque em **CRIAR MINHA CONTA**.
2. Cadastre um nome, e-mail de teste e senha com ao menos 8 caracteres.
3. Mostre que o aplicativo entra automaticamente após o cadastro.

### 3. Mostrar o banco de dados
No terceiro terminal, execute `npm run db:inspect`. A saída mostra o usuário recém-cadastrado, o e-mail mascarado, data de cadastro, perfil e sessões ativas. Explique que o arquivo físico é `backend/data/codequest.sqlite`.

### 4. Demonstrar o login
1. No app, entre em Perfil e escolha **SAIR DA CONTA**.
2. Volte e toque em **JÁ TENHO UMA CONTA**.
3. Digite as mesmas credenciais e entre.
4. Explique que o backend compara o hash da senha e cria uma nova sessão.

### 5. Mostrar persistência
1. Com a conta autenticada, conclua uma lição do MVP, se houver tempo.
2. Execute novamente `npm run db:inspect`.
3. Mostre que XP, gems e quantidade de lições concluídas são persistidos.
4. Feche e reabra o app, mantendo o servidor ligado: a sessão é validada e o perfil é recuperado.

### 6. Explicar a segurança implementada
- O banco não guarda a senha original; usa hash com `scrypt` e salt individual.
- O token de sessão é aleatório; o banco armazena seu hash.
- O token no celular fica no armazenamento seguro do Expo SecureStore.

## Testes técnicos para mostrar se houver tempo

```bash
npm test
```

Os testes cobrem cadastro, duplicidade, senha incorreta, sessão, logout, perfil, API e a lógica de progresso. A versão preparada contém 12 testes automatizados.

## Limites a explicar com transparência

- A API e o banco estão locais no computador, não em nuvem.
- O HTTP é usado apenas para a demonstração em rede privada; não inserir uma senha pessoal importante.
- SQLite é a base relacional inicial; PostgreSQL e hospedagem remota são próximos passos.
- O cadastro não possui verificação de e-mail nem recuperação de senha nesta etapa.
