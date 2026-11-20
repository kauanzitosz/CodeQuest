# Segurança

O CodeQuest neste estágio é um MVP acadêmico de desenvolvimento local. A API usa HTTP na rede local e o banco SQLite é armazenado no computador que executa o backend. Não exponha a porta 3333 à Internet e não utilize senhas pessoais importantes.

## Não publique

- Arquivos `.env` ou qualquer variável com segredo.
- Chaves privadas (`.pem`, `.key`, `.p12`, `.pfx`).
- Banco SQLite local (`backend/data/*.sqlite`, `*.db`) ou backups.
- Tokens de sessão, credenciais AWS ou dados pessoais de usuários.

O `.gitignore` do projeto exclui esses arquivos por padrão. Antes de cada publicação, confira `git status` e a lista de arquivos staged.

## Antes de produção

A implementação ainda precisa de HTTPS, gestão de segredos, limitação de tentativas robusta, verificação/recuperação de e-mail, política de backup e revisão da autorização e integridade das operações de perfil e gamificação.
