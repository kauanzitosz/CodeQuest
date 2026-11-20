# Arquitetura — Login e persistência inicial do CodeQuest

## Componentes

```text
React Native / Expo Go
        |
        | HTTP local (desenvolvimento)
        v
Node.js HTTP API :3333
        |
        v
SQLite (arquivo local)
```

## Modelo de dados implementado

### users
- `id` — PK
- `username` — único, não diferencia maiúsculas/minúsculas
- `email` — único, não diferencia maiúsculas/minúsculas
- `password_salt`
- `password_hash`
- `created_at`, `updated_at`, `last_login_at`

### user_profiles
- `user_id` — PK e FK para `users.id`
- `xp`, `gems`, `streak`, `best_streak`
- `last_study_date`
- `completed_lessons_json`, `reviewed_lessons_json`
- `day_key`, `today_xp`, `today_lessons`, `today_perfect`
- `updated_at`

### auth_sessions
- `id` — PK
- `user_id` — FK para `users.id`
- `token_hash` — único; o token original não é salvo
- `created_at`, `expires_at`, `last_used_at`

## Fluxo de cadastro
1. O app envia nome, e-mail e senha à API.
2. A API valida os campos e cria salt aleatório.
3. Node.js deriva o hash da senha usando `scrypt`.
4. A API grava `users` e `user_profiles` dentro de uma transação SQLite.
5. A API gera token aleatório, grava apenas SHA-256 do token na tabela `auth_sessions` e retorna o token ao app.
6. O app salva o token no Expo SecureStore.

## Fluxo de login
1. A API procura o e-mail sem diferenciar maiúsculas/minúsculas.
2. Deriva novamente o hash usando o salt armazenado.
3. Compara hashes em tempo constante.
4. Se a senha estiver correta, cria uma nova sessão e devolve usuário/perfil.
5. O app armazena o token com SecureStore.

## Fluxo de restauração
Ao abrir o app, o token é lido do SecureStore. O app chama `GET /api/auth/me`. A API calcula o hash do token recebido, procura a sessão e verifica expiração. Se válida, retorna o usuário e o perfil do banco.

## Migração futura
O SQLite permite validar o fluxo local rapidamente. Para ambiente multiusuário remoto, o esquema deverá ser migrado para PostgreSQL e o servidor Node.js hospedado com HTTPS. O app continuará falando com a mesma interface conceitual da API.

## Observação sobre integridade da gamificação

Na demonstração atual, o app envia o resumo do perfil ao endpoint protegido `PUT /api/profile`. Isso serve para validar login, sessão e persistência. Para produção, os totais de XP/gems não devem ser aceitos diretamente do cliente: o backend deverá registrar eventos de conclusão/revisão, verificar idempotência e calcular as recompensas no servidor.
