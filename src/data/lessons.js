// As respostas são verificadas por índice; não executamos código fornecido pelo usuário.
export const LESSONS = [
  {
    id: 'java-variaveis', title: 'Variáveis e tipos', subtitle: 'Guarde e use informações',
    category: 'JAVA · INICIANTE', section: 'SEÇÃO 1 · UNIDADE 1',
    questions: [
      {
        id: 'v1', title: 'O que aparece na tela?', instruction: 'Leia o código e escolha a saída correta.',
        code: 'int x = 5;\nint y = 3;\nSystem.out.print(x + y);',
        options: ['53', '8', '5 + 3', 'Erro'], correctIndex: 1,
        explanation: 'Como x e y são inteiros, o operador + soma 5 e 3, resultando em 8.',
        hint: 'Os dois valores são inteiros, não textos.',
      },
      {
        id: 'v2', title: 'Qual tipo de variável?', instruction: 'Escolha o tipo mais adequado para a idade de uma pessoa.',
        code: '___ idade = 18;', options: ['String', 'boolean', 'int', 'double'], correctIndex: 2,
        explanation: 'int representa números inteiros, como a idade 18.',
        hint: 'Não precisamos guardar casas decimais.',
      },
      {
        id: 'v3', title: 'O que será impresso?', instruction: 'Uma String é um texto entre aspas.',
        code: 'String nome = "Ana";\nSystem.out.print("Oi, " + nome);',
        options: ['Oi, nome', 'Ana', 'Oi, Ana', 'Erro'], correctIndex: 2,
        explanation: 'Quando juntamos textos com +, Java concatena a mensagem e o valor de nome.',
        hint: 'O operador + pode juntar textos.',
      },
    ],
  },
  {
    id: 'java-condicionais', title: 'Condicionais', subtitle: 'Tome decisões com if e else',
    category: 'JAVA · INICIANTE', section: 'SEÇÃO 1 · UNIDADE 2',
    questions: [
      {
        id: 'c1', title: 'Qual frase será exibida?', instruction: 'Observe a comparação na condição.',
        code: 'int idade = 20;\nif (idade >= 18) {\n  System.out.print("Maior");\n} else {\n  System.out.print("Menor");\n}',
        options: ['Menor', 'Maior', '20', 'Nada'], correctIndex: 1,
        explanation: '20 é maior ou igual a 18, portanto a condição é verdadeira.',
        hint: 'O símbolo >= significa maior ou igual.',
      },
      {
        id: 'c2', title: 'Complete a condição', instruction: 'O programa deve identificar uma nota suficiente.',
        code: 'int nota = 8;\nif (nota ___ 7) {\n  System.out.print("Aprovado");\n}',
        options: ['<', '>=', '!=', '='], correctIndex: 1,
        explanation: '>= testa se a nota é maior ou igual a 7.',
        hint: 'Precisamos aceitar 7 e qualquer nota acima dela.',
      },
      {
        id: 'c3', title: 'Qual operador usar?', instruction: 'Verifique se duas condições são verdadeiras ao mesmo tempo.',
        code: 'if (temSenha ___ temInternet) {\n  System.out.print("Entrar");\n}',
        options: ['||', '!', '&&', '=='], correctIndex: 2,
        explanation: '&& é o operador lógico E: os dois valores devem ser verdadeiros.',
        hint: 'A entrada só acontece quando ambas as condições valem.',
      },
    ],
  },
  {
    id: 'java-lacos', title: 'Laços de repetição', subtitle: 'Repita tarefas com for e while',
    category: 'JAVA · INICIANTE', section: 'SEÇÃO 1 · UNIDADE 3',
    questions: [
      {
        id: 'l1', title: 'Quantas vezes repete?', instruction: 'A contagem começa no zero.',
        code: 'for (int i = 0; i < 4; i++) {\n  System.out.println(i);\n}',
        options: ['3', '4', '5', 'Sempre'], correctIndex: 1,
        explanation: 'O laço passa pelos valores 0, 1, 2 e 3: são quatro repetições.',
        hint: 'Conte os números 0, 1, 2 e 3.',
      },
      {
        id: 'l2', title: 'Complete o código', instruction: 'Queremos percorrer uma sequência de valores.',
        code: '___ (int i = 0; i < 5; i++) {\n  System.out.println(i);\n}',
        options: ['if', 'for', 'else', 'switch'], correctIndex: 1,
        explanation: 'for executa o bloco enquanto uma condição de repetição for atendida.',
        hint: 'É a palavra usada quando temos contador e incremento.',
      },
      {
        id: 'l3', title: 'Quando o while termina?', instruction: 'Observe a variável e a condição.',
        code: 'int n = 0;\nwhile (n < 3) {\n  n++;\n}\nSystem.out.print(n);',
        options: ['0', '2', '3', '4'], correctIndex: 2,
        explanation: 'O valor é incrementado até 3, quando n < 3 passa a ser falso.',
        hint: 'O laço termina quando n deixar de ser menor que 3.',
      },
    ],
  },
];

export const COMMUNITY_POSTS = [
  { id: 'helen', name: 'Helen.dev', initial: 'H', course: 'Java', time: 'há 2 h',
    content: 'Desbloqueei minha primeira conquista de Java! Um passo por dia.', likes: 24, color: 'cyan' },
  { id: 'rafael', name: 'Rafael.codes', initial: 'R', course: 'Python', time: 'ontem',
    content: 'Dica: errar um exercício faz parte do aprendizado. Revise e tente de novo!', likes: 18, color: 'lime' },
];
