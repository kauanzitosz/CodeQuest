# Estado atual do CodeQuest

## Implementado nesta versão (0.2.0)

- Aplicativo mobile React Native/Expo.
- Cadastro e login por e-mail e senha via API Node.js.
- Senhas derivadas com `scrypt` e salt individual.
- Sessões com tokens aleatórios; o banco armazena somente o hash do token.
- Token local guardado com Expo SecureStore.
- SQLite com tabelas `users`, `user_profiles` e `auth_sessions`.
- Persistência do resumo de progresso do MVP.
- Inspeção do banco sem exibir senha, hash ou token.
- Testes automatizados do backend, autenticação, sessões e lógica de progresso.

## Limites conhecidos

- API e banco executam localmente no computador de desenvolvimento.
- O transporte entre app e API usa HTTP para a demonstração em rede privada.
- Não há verificação de e-mail nem recuperação de senha implementada.
- O cliente ainda envia o resumo do perfil para persistência; em produção, regras de XP/gems devem ser calculadas e validadas pelo backend a partir de eventos idempotentes.
- Ainda não há deploy, HTTPS, backup automatizado ou PostgreSQL remoto.
- Parte das telas do Figma permanece como protótipo e não como funcionalidade mobile pronta.

## Próximas etapas sugeridas

1. Completar e testar o ciclo de autenticação (cadastro, login, restauração, logout e expiração).
2. Refatorar e conectar a navegação das telas do mobile.
3. Implementar as preferências de acessibilidade globalmente.
4. Definir e migrar o modelo de dados para um banco remoto quando o backend estiver pronto.
5. Disponibilizar cursos, lições e exercícios pela API.
6. Mover regras de progresso e recompensas para o servidor.
