/* PARTE 1 - CAPTURAR ELEMENTOS DO HTML */

const formulario = document.getElementById("formulario");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");
const data = document.getElementById("data");

const saldoAtual = document.getElementById("saldo-atual");
const totalReceitas = document.getElementById("total-receitas");
const totalDespesas = document.getElementById("total-despesas");

const listaMovimentacoes = document.getElementById("lista-movimentacoes");
const mensagemFormulario = document.getElementById("mensagem-formulario");

const filtroTipo = document.getElementById("filtro-tipo");
const filtroCategoria = document.getElementById("filtro-categoria");


/* PARTE 2 - CARREGAR OS DADOS SALVOS */

let movimentacoes = [];

try {
    const dadosSalvos = JSON.parse(
        localStorage.getItem("movimentacoes")
    );

    if (Array.isArray(dadosSalvos)) {
        movimentacoes = dadosSalvos;
    }
} catch (erro) {
    console.error("Erro ao carregar movimentações:", erro);
}


/* PARTE 3 - CADASTRAR E VALIDAR MOVIMENTAÇÕES */

formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();

    const descricaoDigitada = descricao.value.trim();
    const valorDigitado = Number(valor.value);
    const tipoSelecionado = tipo.value;
    const categoriaSelecionada = categoria.value;
    const dataSelecionada = data.value;

    // Verificar campos obrigatórios
    if (
        descricaoDigitada === "" ||
        !Number.isFinite(valorDigitado) ||
        valor.value.trim() === "" ||
        valorDigitado <= 0 ||
        !["receita", "despesa"].includes(tipoSelecionado) ||
        !["alimentacao", "transporte", "moradia", "lazer",
          "saude", "educacao", "outros"].includes(categoriaSelecionada) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dataSelecionada) ||
        Number.isNaN(new Date(dataSelecionada).getTime())
    ) {
        mensagemFormulario.textContent =
            "Preencha todos os campos corretamente.";
        return;
    }

    // Criar uma movimentação
    const novaMovimentacao = {
        id: crypto.randomUUID(),
        descricao: descricaoDigitada,
        valor: valorDigitado,
        tipo: tipoSelecionado,
        categoria: categoriaSelecionada,
        data: dataSelecionada
    };

    // Adicionar ao array
    movimentacoes.push(novaMovimentacao);

    salvarMovimentacoes();
    atualizarResumo();
    mostrarMovimentacoes();

    formulario.reset();

    mensagemFormulario.textContent =
        "Movimentação cadastrada com sucesso!";
});


/* PARTE 4 - CALCULAR RECEITAS, DESPESAS E SALDO */

function atualizarResumo() {

    let receitas = 0;
    let despesas = 0;

    movimentacoes.forEach(function(movimentacao) {

        if (movimentacao.tipo === "receita") {
            receitas += movimentacao.valor;
        }

        if (movimentacao.tipo === "despesa") {
            despesas += movimentacao.valor;
        }

    });

    let saldo = receitas - despesas;

    totalReceitas.textContent = formatarMoeda(receitas);
    totalDespesas.textContent = formatarMoeda(despesas);
    saldoAtual.textContent = formatarMoeda(saldo);
}


/* FUNÇÃO AUXILIAR - FORMATAR DINHEIRO */

function formatarMoeda(numero) {

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


/* PARTE 5 - EXIBIR MOVIMENTAÇÕES NA TABELA */

function mostrarMovimentacoes() {

    listaMovimentacoes.innerHTML = "";

    const tipoFiltrado = filtroTipo.value;
    const categoriaFiltrada = filtroCategoria.value;

    const movimentacoesFiltradas = movimentacoes.filter(
        function(movimentacao) {

            const correspondeTipo =
                tipoFiltrado === "todos" ||
                movimentacao.tipo === tipoFiltrado;

            const correspondeCategoria =
                categoriaFiltrada === "todas" ||
                movimentacao.categoria === categoriaFiltrada;

            return correspondeTipo && correspondeCategoria;
        }
    );

    // Caso não existam movimentações
    if (movimentacoesFiltradas.length === 0) {

        const linha = document.createElement("tr");
        const coluna = document.createElement("td");

        coluna.colSpan = 6;
        coluna.textContent =
            "Nenhuma movimentação encontrada.";

        linha.appendChild(coluna);
        listaMovimentacoes.appendChild(linha);

        return;
    }

    // Criar as linhas da tabela
    movimentacoesFiltradas.forEach(function(movimentacao) {

        const linha = document.createElement("tr");

        const dados = [
            movimentacao.descricao,
            formatarCategoria(movimentacao.categoria),
            formatarData(movimentacao.data),
            movimentacao.tipo === "receita" ? "Receita" : "Despesa",
            formatarMoeda(movimentacao.valor)
        ];

        dados.forEach(function(dado) {

            const coluna = document.createElement("td");
            coluna.textContent = dado;
            linha.appendChild(coluna);

        });

        // Botão excluir
        const colunaAcoes = document.createElement("td");
        const botaoExcluir = document.createElement("button");

        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", function() {
            excluirMovimentacao(movimentacao.id);
        });

        colunaAcoes.appendChild(botaoExcluir);
        linha.appendChild(colunaAcoes);

        listaMovimentacoes.appendChild(linha);

    });
}


/* FUNÇÕES AUXILIARES - CATEGORIA E DATA */

function formatarCategoria(categoria) {

    const categorias = {
        alimentacao: "Alimentação",
        transporte: "Transporte",
        moradia: "Moradia",
        lazer: "Lazer",
        saude: "Saúde",
        educacao: "Educação",
        outros: "Outros"
    };

    return categorias[categoria] || categoria;
}

function formatarData(data) {

    const partes = data.split("-");

    return partes[2] + "/" + partes[1] + "/" + partes[0];
}


/* PARTE 6 - EXCLUIR MOVIMENTAÇÕES */

function excluirMovimentacao(id) {

    const confirmar = confirm(
        "Deseja realmente excluir esta movimentação?"
    );

    if (confirmar === false) {
        return;
    }

    movimentacoes = movimentacoes.filter(
        function(movimentacao) {
            return movimentacao.id !== id;
        }
    );

    salvarMovimentacoes();
    atualizarResumo();
    mostrarMovimentacoes();

    mensagemFormulario.textContent =
        "Movimentação excluída com sucesso!";
}


/* PARTE 7 - SALVAR E FILTRAR MOVIMENTAÇÕES */

function salvarMovimentacoes() {

    localStorage.setItem(
        "movimentacoes",
        JSON.stringify(movimentacoes)
    );

}

// Atualizar a tabela ao alterar os filtros
filtroTipo.addEventListener("change", mostrarMovimentacoes);

filtroCategoria.addEventListener("change", mostrarMovimentacoes);


// Limpar mensagem ao limpar o formulário
formulario.addEventListener("reset", function() {
    mensagemFormulario.textContent = "";
});


// Carregar os resultados ao abrir a página
atualizarResumo();
mostrarMovimentacoes();