"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_sync_1 = __importDefault(require("readline-sync"));
const database_1 = require("./database");
function exibirMenu() {
    console.log('\n=== Menu de Notícias ===');
    console.log('0 - Cadastrar Notícia');
    console.log('1 - Exibir todas as notícias (mais recentes primeiro)');
    console.log('2 - Exibir todas as notícias (mais antigas primeiro)');
    console.log('3 - Exibir notícias de um estado específico');
    console.log('4 - Exibir todas as notícias agrupadas por estado');
    console.log('5 - Cadastrar UF');
    console.log('6 - Cadastrar cidade');
    console.log('7 - Sair');
    console.log('=======================\n');
}
function cadastrarNoticia() {
    console.log('\n--- Cadastrar Notícia ---');
    const cidades = database_1.db.prepare('SELECT id, nome FROM cidade ORDER BY nome').all();
    if (cidades.length === 0) {
        console.log('Não há cidades cadastradas. Cadastre uma cidade primeiro.');
        return;
    }
    console.log('\nCidades disponíveis:');
    const nomesCidades = cidades.map((c) => c.nome);
    const indiceEscolhido = readline_sync_1.default.keyInSelect(nomesCidades, 'Escolha a cidade');
    if (indiceEscolhido === -1) {
        console.log('Nenhuma cidade selecionada.');
        return;
    }
    const cidadeId = cidades[indiceEscolhido].id;
    const titulo = readline_sync_1.default.question('\nTítulo: ');
    const texto = readline_sync_1.default.question('Texto: ');
    const result = database_1.db
        .prepare('INSERT INTO noticia (titulo, texto, cidade_id) VALUES (?, ?, ?)')
        .run(titulo, texto, cidadeId);
    console.log(`Notícia cadastrada com sucesso! ID: ${result.lastInsertRowid}`);
}
function cadastrarUF() {
    console.log('\n--- Cadastrar UF ---');
    const nome = readline_sync_1.default.question('Nome do estado: ');
    const sigla = readline_sync_1.default.question('Sigla (UF): ').toUpperCase();
    try {
        const result = database_1.db
            .prepare('INSERT INTO uf (nome, sigla) VALUES (?, ?)')
            .run(nome, sigla);
        console.log(`UF "${sigla}" cadastrada com sucesso! ID: ${result.lastInsertRowid}`);
    }
    catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.log(`Erro: já existe uma UF com a sigla "${sigla}".`);
        }
        else {
            console.log(`Erro ao cadastrar UF: ${error.message}`);
        }
    }
}
function cadastrarCidade() {
    console.log('\n--- Cadastrar Cidade ---');
    const ufs = database_1.db.prepare('SELECT id, nome, sigla FROM uf ORDER BY sigla').all();
    if (ufs.length === 0) {
        console.log('Não há UFs cadastradas. Cadastre uma UF primeiro.');
        return;
    }
    const nomesUfs = ufs.map((uf) => `${uf.nome} - ${uf.sigla}`);
    const indiceEscolhido = readline_sync_1.default.keyInSelect(nomesUfs, 'Escolha a UF');
    if (indiceEscolhido === -1) {
        console.log('Nenhuma UF selecionada.');
        return;
    }
    const ufEscolhida = ufs[indiceEscolhido];
    const nomeCidade = readline_sync_1.default.question('Nome da cidade: ');
    try {
        const result = database_1.db
            .prepare('INSERT INTO cidade (nome, uf_id) VALUES (?, ?)')
            .run(nomeCidade, ufEscolhida.id);
        console.log(`Cidade "${nomeCidade}" cadastrada com sucesso! ID: ${result.lastInsertRowid}`);
    }
    catch (error) {
        console.log(`Erro ao cadastrar cidade: ${error.message}`);
    }
}
function exibirNoticias(ordenacao, ufId) {
    const ordensql = ordenacao === 'recente' ? 'DESC' : 'ASC';
    let sql = `SELECT n.id, n.titulo, n.texto, n.data_criacao, c.nome as cidade_nome, u.sigla as uf_sigla
     FROM noticia n
     INNER JOIN cidade c ON n.cidade_id = c.id
     INNER JOIN uf u ON c.uf_id = u.id`;
    const params = [];
    if (ufId !== undefined) {
        sql += ` WHERE u.id = ?`;
        params.push(ufId);
    }
    sql += ` ORDER BY n.data_criacao ${ordensql}`;
    const noticias = database_1.db.prepare(sql).all(...params);
    if (noticias.length === 0) {
        console.log('Não há notícias cadastradas.');
        return;
    }
    const titulo = ordenacao === 'recente'
        ? '\n=== Notícias (Mais Recentes Primeiro) ==='
        : '\n=== Notícias (Mais Antigas Primeiro) ===';
    console.log(titulo);
    for (const noticia of noticias) {
        console.log(`\n--- #${noticia.id} - ${noticia.titulo} ---`);
        console.log(`Cidade: ${noticia.cidade_nome} (${noticia.uf_sigla})`);
        console.log(`Data: ${noticia.data_criacao}`);
        console.log(`${noticia.texto}`);
        console.log('─'.repeat(40));
    }
}
function exibirNoticiasPorEstado() {
    const ufs = database_1.db.prepare('SELECT id, nome, sigla FROM uf ORDER BY sigla').all();
    if (ufs.length === 0) {
        console.log('Não há UFs cadastradas.');
        return;
    }
    console.log('\nEstados disponíveis:');
    const siglasUfs = ufs.map((uf) => `${uf.nome} - ${uf.sigla}`);
    const indiceEscolhido = readline_sync_1.default.keyInSelect(siglasUfs, 'Escolha o estado');
    if (indiceEscolhido === -1) {
        console.log('Nenhum estado selecionado.');
        return;
    }
    const ufEscolhida = ufs[indiceEscolhido];
    while (true) {
        console.log(`\n--- Notícias de ${ufEscolhida.nome} (${ufEscolhida.sigla}) ---`);
        console.log('1 - Mais recentes primeiro');
        console.log('2 - Mais antigas primeiro');
        console.log('z - Voltar');
        const opcao = readline_sync_1.default.question('Selecione um filtro: ');
        switch (opcao) {
            case '1':
                exibirNoticias('recente', ufEscolhida.id);
                break;
            case '2':
                exibirNoticias('antiga', ufEscolhida.id);
                break;
            case 'z':
                console.log('Voltando ao menu principal...');
                return;
            default:
                console.log('Opção inválida. Tente novamente.');
        }
    }
}
function exibirNoticiasAgrupadas() {
    const noticias = database_1.db.prepare(`SELECT n.id, n.titulo, c.nome as cidade_nome, u.sigla as uf_sigla
     FROM noticia n
     INNER JOIN cidade c ON n.cidade_id = c.id
     INNER JOIN uf u ON c.uf_id = u.id
     ORDER BY u.sigla, n.data_criacao DESC`).all();
    if (noticias.length === 0) {
        console.log('Não há notícias cadastradas.');
        return;
    }
    console.log('\n=== Notícias Agrupadas por Estado ===');
    const ufsMap = new Map();
    for (const n of noticias) {
        const lista = ufsMap.get(n.uf_sigla);
        if (lista) {
            lista.push(n);
        }
        else {
            ufsMap.set(n.uf_sigla, [n]);
        }
    }
    for (const [uf, noticiasUf] of ufsMap) {
        console.log(`\n# ${uf}`);
        for (const noticia of noticiasUf) {
            console.log(`${noticia.id} - ${noticia.titulo} - ${noticia.cidade_nome}`);
        }
    }
    while (true) {
        console.log('\n(d) Detalhar notícia');
        console.log('(z) Voltar');
        const opcao = readline_sync_1.default.question('Selecione: ');
        switch (opcao.toLowerCase()) {
            case 'd': {
                const noticiaId = readline_sync_1.default.question('Número da notícia: ');
                const noticia = database_1.db.prepare(`SELECT n.id, n.titulo, n.texto, n.data_criacao, c.nome as cidade_nome, u.nome as uf_nome, u.sigla as uf_sigla
           FROM noticia n
           INNER JOIN cidade c ON n.cidade_id = c.id
           INNER JOIN uf u ON c.uf_id = u.id
           WHERE n.id = ?`).get(Number(noticiaId));
                if (!noticia) {
                    console.log('Notícia não encontrada.');
                    break;
                }
                console.log(`\n--- ${noticia.titulo} ---`);
                console.log(`Cidade: ${noticia.cidade_nome} (${noticia.uf_sigla})`);
                console.log(`Estado: ${noticia.uf_nome}`);
                console.log(`Data: ${noticia.data_criacao}`);
                console.log(`${noticia.texto}`);
                break;
            }
            case 'z':
                return;
            default:
                console.log('Opção inválida. Tente novamente.');
        }
    }
}
function main() {
    let opcaoSelecionada;
    while (true) {
        exibirMenu();
        opcaoSelecionada = readline_sync_1.default.question('Selecione uma opção: ');
        switch (opcaoSelecionada) {
            case '0':
                cadastrarNoticia();
                break;
            case '1':
                exibirNoticias('recente');
                break;
            case '2':
                exibirNoticias('antiga');
                break;
            case '3':
                exibirNoticiasPorEstado();
                break;
            case '4':
                exibirNoticiasAgrupadas();
                break;
            case '5':
                cadastrarUF();
                break;
            case '6':
                cadastrarCidade();
                break;
            case '7':
                console.log('Opção 7 selecionada - Saindo...');
                database_1.db.close();
                return;
            default:
                console.log('Opção inválida. Tente novamente.');
                break;
        }
    }
}
main();
//# sourceMappingURL=index.js.map