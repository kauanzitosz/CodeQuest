# Contribuindo com o CodeQuest

Este repositório acompanha a implementação acadêmica do CodeQuest. Mantenha as alterações pequenas, testáveis e documentadas.

## Fluxo recomendado

1. Atualize sua branch `main` antes de começar.
2. Crie uma branch curta, por exemplo `feature/profile-screen`, `fix/auth-session` ou `docs/setup-guide`.
3. Faça uma mudança por vez e mantenha a separação entre telas, regras de negócio, serviços e backend.
4. Execute `npm test` antes de abrir um pull request.
5. Descreva o que mudou, como testar e quais limitações permanecem.

## Commits

Use mensagens objetivas, por exemplo:

- `feat(auth): validate login sessions`
- `fix(api): handle expired sessions`
- `docs: update local setup instructions`

## Segurança

Nunca envie senhas, tokens, chaves privadas, arquivos `.env`, banco SQLite local ou dados reais de usuários. Use `.env.example` como modelo sem valores secretos.
