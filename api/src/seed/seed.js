require('dotenv').config();
const { getDb } = require('../database/db');
const crypto = require('crypto');

const historiasData = [
  {
    titulo: 'Corações em Chamas',
    sinopse: 'Helena é uma bombeira dedicada que arrisca tudo para salvar vidas. Quando ela resgata o misterioso e rico empresário Eduardo de um incêndio criminoso em seu escritório, uma atração incontrolável nasce entre eles. Mas Eduardo esconde segredos do passado que podem consumir tudo o que Helena mais ama. Entre chamas reais e a paixão ardente que os consome, eles terão que decidir se o amor vale o risco de se queimarem por completo.',
    capa_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80',
    genero: 'Romance',
    autora: 'Ana Beatriz',
    tags: JSON.stringify(['romance', 'drama', 'paixão', 'perigo']),
    destaque: true,
    status: 'ativo'
  },
  {
    titulo: 'Sussurros ao Luar',
    sinopse: 'Clara se muda para uma antiga mansão na colina para recomeçar sua vida como escritora de romances. O que ela não esperava era conhecer Gabriel, um vizinho enigmático que só aparece durante a noite e que parece guardar segredos centenários. Conforme Clara investiga os mistérios da cidade e a misteriosa lenda do lobo da montanha, ela se vê irresistivelmente atraída pelo olhar penetrante de Gabriel. Um romance gótico moderno, repleto de suspense e paixões proibidas.',
    capa_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=400&q=80',
    genero: 'Suspense',
    autora: 'Clara Montenegro',
    tags: JSON.stringify(['suspense', 'mistério', 'sobrenatural', 'romance']),
    destaque: true,
    status: 'ativo'
  },
  {
    titulo: 'Destinos Cruzados',
    sinopse: 'Beatriz e Lucas se odeiam desde a faculdade de arquitetura, onde sempre competiram pelo primeiro lugar. Anos depois, por um capricho do destino, eles são contratados como co-diretores para projetar o maior centro cultural da cidade. Obrigados a dividir a mesma sala e a trabalhar juntos todos os dias, a linha tênue entre o ódio e o amor começa a se apagar. Uma comédia romântica leve, divertida e cheia de faíscas de criatividade e afeto.',
    capa_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
    genero: 'Comédia Romântica',
    autora: 'Isabella Santos',
    tags: JSON.stringify(['comédia', 'romance', 'leve', 'rivais-para-amantes']),
    destaque: false,
    status: 'ativo'
  }
];

const gerarCapitulos = (historiaId, tituloHistoria) => {
  const capitulos = [];
  for (let i = 1; i <= 10; i++) {
    const isFree = i <= 3;
    capitulos.push({
      id: crypto.randomUUID(),
      historia_id: historiaId,
      numero: i,
      titulo: `Capítulo ${i}: ${obterTituloCapitulo(tituloHistoria, i)}`,
      conteudo: gerarConteudoCapitulo(tituloHistoria, i),
      custo_moedas: isFree ? 0 : 10,
      is_gratuito: isFree,
      publicado_em: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return capitulos;
};

function obterTituloCapitulo(titulo, numero) {
  const titulos = {
    'Corações em Chamas': [
      'O Resgate', 'O Reencontro inesperado', 'Faíscas da Atração', 'Passado Oculto',
      'Revelações Perigosas', 'Chamas da Paixão', 'Cinzas da Dúvida', 'Decisões no Limite',
      'O Confronto Final', 'Um Novo Começo'
    ],
    'Sussurros ao Luar': [
      'A Mansão na Colina', 'A Primeira Noite', 'O Vizinho Enigmático', 'Segredos no Jardim',
      'A Lenda Local', 'Sussurros e Sombras', 'A Verdade Revelada', 'O Pacto do Luar',
      'O Perigo na Floresta', 'Eternidade nos Olhos'
    ],
    'Destinos Cruzados': [
      'A Reunião de Negócios', 'Primeiro Dia de Caos', 'Divisão de Espaço', 'O Café Desastroso',
      'Uma Ideia Brilhante', 'Noite de Trabalho', 'A Trégua', 'Sentimentos Ocultos',
      'O Grande Projeto', 'A Declaração de Amor'
    ]
  };
  return titulos[titulo][numero - 1] || `Capítulo Especial ${numero}`;
}

function gerarConteudoCapitulo(titulo, numero) {
  return `Este é o parágrafo de abertura do Capítulo ${numero} da história "${titulo}". A tensão emocional crescia a cada segundo entre os personagens principais, que sabiam que suas vidas estavam prestes a mudar para sempre a partir daquele momento decisivo.\n\n` +
    `No segundo parágrafo, a narrativa se aprofunda nos sentimentos internos e nos dilemas que cada um carrega. "Não posso deixar que isso aconteça de novo", pensou ele, enquanto olhava fixamente para o horizonte, lutando contra o desejo incontrolável de dar um passo à frente e quebrar a distância entre eles.\n\n` +
    `Finalmente, a cena se desenrola com um diálogo carregado de subentendidos e olhares intensos. O silêncio que se seguiu foi quase palpável, interrompido apenas pelo som suave da brisa e pela batida acelerada de dois corações que sabiam, mesmo sem admitir, que já pertenciam um ao outro.`;
}

async function seed() {
  console.log('🌱 Iniciando o processo de seeding do banco de dados SQLite...');

  try {
    const db = await getDb();
    
    console.log('🧹 Limpando dados antigos...');
    await db.run('DELETE FROM capitulos');
    await db.run('DELETE FROM historias');
    console.log('✅ Dados antigos limpos com sucesso.');

    console.log('📚 Inserindo histórias...');
    const historisIds = [];
    for (const hist of historiasData) {
      const id = crypto.randomUUID();
      historisIds.push({ id, titulo: hist.titulo });
      await db.run(
        'INSERT INTO historias (id, titulo, sinopse, capa_url, genero, autora, tags, destaque, status, total_capitulos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, hist.titulo, hist.sinopse, hist.capa_url, hist.genero, hist.autora, hist.tags, hist.destaque, hist.status, 10]
      );
    }
    console.log(`✅ Inseridas ${historisIds.length} histórias.`);

    console.log('📖 Inserindo capítulos...');
    for (const hist of historisIds) {
      const capitulos = gerarCapitulos(hist.id, hist.titulo);
      for (const cap of capitulos) {
        await db.run(
          'INSERT INTO capitulos (id, historia_id, numero, titulo, conteudo, custo_moedas, is_gratuito, publicado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [cap.id, cap.historia_id, cap.numero, cap.titulo, cap.conteudo, cap.custo_moedas, cap.is_gratuito, cap.publicado_em]
        );
      }
      console.log(`✅ Inseridos 10 capítulos para a história "${hist.titulo}".`);
    }

    console.log('🚀 Seeding concluído com absoluto sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seeding:', error.message || error);
    process.exit(1);
  }
}

seed();
