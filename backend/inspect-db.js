import { openDatabase } from './database.js';

const db = openDatabase();
const users = db.prepare(`
  SELECT u.id, u.username, u.email, u.created_at, u.last_login_at,
         p.xp, p.gems, p.streak,
         json_array_length(p.completed_lessons_json) AS completed_lessons,
         (SELECT COUNT(*) FROM auth_sessions s WHERE s.user_id = u.id AND s.expires_at > ?) AS active_sessions
  FROM users u
  LEFT JOIN user_profiles p ON p.user_id = u.id
  ORDER BY u.created_at DESC
`).all(new Date().toISOString());

console.log('\nCODEQUEST · BANCO DE DADOS SQLITE');
console.log(`Usuários cadastrados: ${users.length}\n`);
if (!users.length) console.log('Ainda não existem contas cadastradas.');
for (const user of users) {
  const maskedEmail = user.email.replace(/^(.).+(@.+)$/, '$1***$2');
  console.log(`- ${user.username} (${maskedEmail})`);
  console.log(`  ID: ${user.id}`);
  console.log(`  Cadastro: ${user.created_at}`);
  console.log(`  Último login: ${user.last_login_at || 'Ainda não entrou'}`);
  console.log(`  XP: ${user.xp ?? 0} | Gems: ${user.gems ?? 0} | Ofensiva: ${user.streak ?? 0}`);
  console.log(`  Lições concluídas: ${user.completed_lessons ?? 0} | Sessões ativas: ${user.active_sessions}`);
}
console.log('\nNenhuma senha, hash ou token é exibido neste relatório.\n');
db.close();
