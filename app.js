/* =========================================================
   Logica JavaScript - Rede Raizes do Nordeste
   Projeto Multidisciplinar - Trilha Front-End (UNINTER 2026)
   Aluno: Luiz Gustavo da Silva | RU: 4933749
   ========================================================= */

// 1. Dados simulados do Cardapio e Unidades (Mock Data)
const cardapio = [
  {
    id: 1,
    nome: "Cuscuz com Carne de Sol",
    categoria: "cuscuz",
    categoriaTexto: "Cuscuz e Tapiocas",
    preco: 19.90,
    descricao: "Cuscuz tradicional com queijo coalho e carne de sol desfiada na manteiga de garrafa."
  },
  {
    id: 2,
    nome: "Tapioca de Queijo Coalho",
    categoria: "cuscuz",
    categoriaTexto: "Cuscuz e Tapiocas",
    preco: 14.50,
    descricao: "Tapioca artesanal recheada com queijo coalho tostadinho na chapa."
  },
  {
    id: 3,
    nome: "Baiao de Dois Individual",
    categoria: "pratos",
    categoriaTexto: "Pratos do Sertao",
    preco: 28.90,
    descricao: "Arroz, feijao de corda, queijo coalho, carne seca e temperos regionais."
  },
  {
    id: 4,
    nome: "Escondidinho de Macaxeira",
    categoria: "pratos",
    categoriaTexto: "Pratos do Sertao",
    preco: 26.00,
    descricao: "Pure de macaxeira cremoso com recheio de carne de sol e queijo gratinado."
  },
  {
    id: 5,
    nome: "Suco Natural de Graviola (400ml)",
    categoria: "bebidas",
    categoriaTexto: "Bebidas",
    preco: 9.50,
    descricao: "Polpa fresca de fruta batida com agua mineral."
  },
  {
    id: 6,
    nome: "Suco Natural de Caju (400ml)",
    categoria: "bebidas",
    categoriaTexto: "Bebidas",
    preco: 9.00,
    descricao: "Suco natural com sabor tradicional de caju."
  },
  {
    id: 7,
    nome: "Bolo de Rolo Pernambucano",
    categoria: "sobremesas",
    categoriaTexto: "Sobremesas",
    preco: 12.00,
    descricao: "Fatia artesanal com camadas finas e goiabada derretida."
  },
  {
    id: 8,
    nome: "Cocada Mole na Casquinha",
    categoria: "sobremesas",
    categoriaTexto: "Sobremesas",
    preco: 10.50,
    descricao: "Doce de coco caseiro preparado com leite condensado."
  }
];

const nomesUnidades = {
  recife: "Recife - Matriz (Boa Viagem)",
  salvador: "Salvador (Pelourinho)",
  fortaleza: "Fortaleza (Beira-Mar)"
};

// 2. Variaveis de estado
let itensCarrinho = [];
let pontosFidelidade = 120;
let descontoAplicado = false;
let statusAtualPedido = 1;
let categoriaAtiva = "todos";
let termoBusca = "";

// 3. Inicializacao ao carregar a pagina
document.addEventListener("DOMContentLoaded", function () {
  renderizarProdutos();
  configurarCanais();
  configurarEventosGerais();
  configurarLGPD();
});

// 4. Seletor de Canais (Web Desktop, App Mobile, Totem Presencial)
function configurarCanais() {
  const botoesCanal = document.querySelectorAll(".btn-canal");
  botoesCanal.forEach(function (btn) {
    btn.addEventListener("click", function () {
      botoesCanal.forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      const canal = btn.getAttribute("data-canal");
      document.body.className = `canal-${canal}`;
    });
  });
}

// 5. Renderizacao do Catalogo
function renderizarProdutos() {
  const container = document.getElementById("lista-produtos");
  if (!container) return;
  container.innerHTML = "";

  const pratosFiltrados = cardapio.filter(function (prato) {
    const matchCat = categoriaAtiva === "todos" || prato.categoria === categoriaAtiva;
    const matchBusca =
      prato.nome.toLowerCase().includes(termoBusca) ||
      prato.descricao.toLowerCase().includes(termoBusca);
    return matchCat && matchBusca;
  });

  if (pratosFiltrados.length === 0) {
    container.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; color: #6b7280; padding: 25px;'>Nenhum prato encontrado para a busca informada.</p>";
    return;
  }

  pratosFiltrados.forEach(function (prato) {
    const card = document.createElement("div");
    card.className = "card-produto";
    card.innerHTML = `
      <span class="tag-categoria">${prato.categoriaTexto}</span>
      <h3>${prato.nome}</h3>
      <p class="descricao">${prato.descricao}</p>
      <div class="rodape-card">
        <span class="preco">R$ ${prato.preco.toFixed(2).replace(".", ",")}</span>
        <button type="button" class="btn-adicionar" data-id="${prato.id}">+ Adicionar</button>
      </div>
    `;

    card.querySelector(".btn-adicionar").addEventListener("click", function () {
      adicionarAoCarrinho(prato.id);
    });

    container.appendChild(card);
  });
}

// 6. Manipulacao do Carrinho
function adicionarAoCarrinho(id) {
  const produto = cardapio.find((p) => p.id === id);
  if (!produto) return;

  const itemExistente = itensCarrinho.find((item) => item.id === id);
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    itensCarrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: 1
    });
  }

  atualizarCarrinhoVisual();
  abrirCarrinho();
}

function alterarQuantidade(id, delta) {
  const item = itensCarrinho.find((i) => i.id === id);
  if (!item) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) {
    itensCarrinho = itensCarrinho.filter((i) => i.id !== id);
  }
  atualizarCarrinhoVisual();
}

function removerDoCarrinho(id) {
  itensCarrinho = itensCarrinho.filter((item) => item.id !== id);
  atualizarCarrinhoVisual();
}

function atualizarCarrinhoVisual() {
  const container = document.getElementById("itens-carrinho");
  const contagem = document.getElementById("contagem-carrinho");
  const saldoModal = document.getElementById("saldo-modal-pontos");
  if (!container || !contagem) return;

  if (saldoModal) saldoModal.textContent = pontosFidelidade;

  let totalQtd = 0;
  container.innerHTML = "";

  if (itensCarrinho.length === 0) {
    container.innerHTML = "<p style='color: #6b7280; padding: 15px 0; text-align: center;'>Sua sacola esta vazia.</p>";
  } else {
    itensCarrinho.forEach(function (item) {
      totalQtd += item.quantidade;
      const linha = document.createElement("div");
      linha.className = "item-linha";
      linha.innerHTML = `
        <div style="flex: 1;">
          <strong>${item.nome}</strong>
          <div style="color: #b45309; font-size: 13px;">R$ ${(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" class="btn-diminuir" style="width: 26px; height: 26px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 3px; font-weight: bold;">-</button>
          <span style="font-weight: bold; min-width: 18px; text-align: center;">${item.quantidade}</span>
          <button type="button" class="btn-aumentar" style="width: 26px; height: 26px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 3px; font-weight: bold;">+</button>
          <button type="button" class="btn-remover" style="margin-left: 6px; color: #dc2626; border: none; background: none; cursor: pointer; font-size: 13px;">Remover</button>
        </div>
      `;

      linha.querySelector(".btn-diminuir").addEventListener("click", () => alterarQuantidade(item.id, -1));
      linha.querySelector(".btn-aumentar").addEventListener("click", () => alterarQuantidade(item.id, 1));
      linha.querySelector(".btn-remover").addEventListener("click", () => removerDoCarrinho(item.id));

      container.appendChild(linha);
    });
  }

  contagem.textContent = totalQtd;
  atualizarTotaisCarrinho();
}

function atualizarTotaisCarrinho() {
  let subtotal = 0;
  itensCarrinho.forEach(function (item) {
    subtotal += item.preco * item.quantidade;
  });

  let desconto = descontoAplicado ? 10.0 : 0.0;
  let total = Math.max(0, subtotal - desconto);

  const subtotalEl = document.getElementById("valor-subtotal");
  const totalEl = document.getElementById("valor-total");

  if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

function abrirCarrinho() {
  const modal = document.getElementById("modal-carrinho");
  if (modal) modal.classList.add("aberto");
}

function fecharCarrinho() {
  const modal = document.getElementById("modal-carrinho");
  if (modal) modal.classList.remove("aberto");
}

// 7. Eventos Gerais
function configurarEventosGerais() {
  // Categorias
  const botoesFiltro = document.querySelectorAll(".btn-filtro");
  botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () {
      botoesFiltro.forEach((b) => b.classList.remove("ativo"));
      botao.classList.add("ativo");
      categoriaAtiva = botao.getAttribute("data-categoria");
      renderizarProdutos();
    });
  });

  // Campo de busca
  const campoBusca = document.getElementById("campo-busca-prato");
  if (campoBusca) {
    campoBusca.addEventListener("input", function (e) {
      termoBusca = e.target.value.toLowerCase().trim();
      renderizarProdutos();
    });
  }

  // Abertura/fechamento do carrinho
  document.getElementById("btn-abrir-carrinho")?.addEventListener("click", abrirCarrinho);
  document.getElementById("btn-fechar-carrinho")?.addEventListener("click", fecharCarrinho);
  document.getElementById("btn-continuar-comprando")?.addEventListener("click", fecharCarrinho);

  const modalCarrinho = document.getElementById("modal-carrinho");
  if (modalCarrinho) {
    modalCarrinho.addEventListener("click", function (e) {
      if (e.target === modalCarrinho) fecharCarrinho();
    });
  }

  // Seletor de Unidades (cardápio por filial)
  const selectUnidade = document.getElementById("select-unidade");
  const tituloUnidade = document.getElementById("titulo-unidade-atual");
  if (selectUnidade) {
    selectUnidade.addEventListener("change", function (e) {
      const val = e.target.value;
      if (tituloUnidade) {
        tituloUnidade.textContent = `Cardápio Oficial — Unidade ${nomesUnidades[val]}`;
      }
    });
  }

  // Resgate de pontos de fidelidade
  const btnPontos = document.getElementById("btn-aplicar-desconto-pontos");
  if (btnPontos) {
    btnPontos.addEventListener("click", function () {
      if (pontosFidelidade >= 100 && !descontoAplicado) {
        descontoAplicado = true;
        document.getElementById("aviso-desconto-aplicado").style.display = "block";
        document.getElementById("linha-desconto").style.display = "block";
        btnPontos.disabled = true;
        atualizarTotaisCarrinho();
      } else {
        alert("Pontos insuficientes ou desconto ja utilizado.");
      }
    });
  }

  // Alternancia de Forma de Pagamento
  const radiosPay = document.querySelectorAll('input[name="pagamento"]');
  radiosPay.forEach(function (radio) {
    radio.addEventListener("change", function () {
      document.querySelectorAll(".opcao-pay").forEach((op) => op.classList.remove("ativo"));
      radio.closest(".opcao-pay").classList.add("ativo");

      const blocoPix = document.getElementById("bloco-pix");
      const btnFinalizar = document.getElementById("btn-finalizar-pedido");

      if (this.value === "pix") {
        if (blocoPix) blocoPix.style.display = "block";
        if (btnFinalizar) btnFinalizar.style.display = "none";
      } else {
        if (blocoPix) blocoPix.style.display = "none";
        if (btnFinalizar) btnFinalizar.style.display = "block";
      }
    });
  });

  // Submissao do Checkout
  document.getElementById("form-checkout")?.addEventListener("submit", function (e) {
    e.preventDefault();
    processarPagamentoFinal();
  });

  document.getElementById("btn-confirmar-pix")?.addEventListener("click", function () {
    processarPagamentoFinal();
  });

  // Avanco de status da cozinha
  document.getElementById("btn-avancar-status")?.addEventListener("click", avancarStatusPedido);

  // Fazer novo pedido
  document.getElementById("btn-novo-pedido")?.addEventListener("click", function () {
    document.getElementById("secao-rastreio").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// 8. Processamento do Pagamento e Envio para Cozinha
function processarPagamentoFinal() {
  if (itensCarrinho.length === 0) {
    alert("Adicione ao menos um prato antes de pagar.");
    return;
  }

  const checkLgpd = document.getElementById("check-lgpd");
  if (checkLgpd && !checkLgpd.checked) {
    alert("E necessario concordar com os termos da LGPD para continuar.");
    return;
  }

  const nome = document.getElementById("nome-cliente").value || "Cliente";
  const selectUnidade = document.getElementById("select-unidade");
  const unidade = selectUnidade ? selectUnidade.value : "recife";

  alert("Integracao Externa: Conectando ao servico de pagamento...\nTransacao autorizada com sucesso!");

  fecharCarrinho();

  // Atualiza pontos
  if (descontoAplicado) {
    pontosFidelidade -= 100;
  }
  pontosFidelidade += 20;

  document.getElementById("qtd-pontos").textContent = pontosFidelidade;
  document.getElementById("saldo-modal-pontos").textContent = pontosFidelidade;

  // Monta dados do pedido concluido
  const copiaItens = [...itensCarrinho];
  itensCarrinho = [];
  descontoAplicado = false;
  document.getElementById("aviso-desconto-aplicado").style.display = "none";
  document.getElementById("linha-desconto").style.display = "none";
  document.getElementById("btn-aplicar-desconto-pontos").disabled = false;
  atualizarCarrinhoVisual();

  // Exibe tela de rastreamento
  const secaoRastreio = document.getElementById("secao-rastreio");
  document.getElementById("unidade-pedido-rastreio").textContent = nomesUnidades[unidade].toUpperCase();
  document.getElementById("cliente-pedido-rastreio").textContent = nome;
  document.getElementById("numero-pedido-rastreio").textContent = "#RN-" + Math.floor(1000 + Math.random() * 9000);

  const listaRastreio = document.getElementById("lista-itens-rastreio");
  if (listaRastreio) {
    listaRastreio.innerHTML = copiaItens
      .map((item) => `<li>${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</li>`)
      .join("");
  }

  statusAtualPedido = 1;
  atualizarGraficoStatus();
  secaoRastreio.style.display = "block";
  secaoRastreio.scrollIntoView({ behavior: "smooth" });
}

// 9. Linha do Tempo / Stepper do Pedido
function avancarStatusPedido() {
  if (statusAtualPedido === 1) {
    statusAtualPedido = 2;
    alert("Status atualizado: A Cozinha iniciou o preparo.");
  } else if (statusAtualPedido === 2) {
    statusAtualPedido = 3;
    alert("Status atualizado: Pedido pronto para retirada no balcao.");
  } else {
    alert("O pedido ja foi finalizado e retirado.");
  }
  atualizarGraficoStatus();
}

function atualizarGraficoStatus() {
  const e1 = document.getElementById("status-1");
  const e2 = document.getElementById("status-2");
  const e3 = document.getElementById("status-3");
  const l1 = document.getElementById("linha-1");
  const l2 = document.getElementById("linha-2");

  if (e1) e1.className = "etapa " + (statusAtualPedido >= 1 ? (statusAtualPedido > 1 ? "concluida" : "ativa") : "");
  if (l1) l1.style.backgroundColor = statusAtualPedido >= 2 ? "#15803d" : "#e5e7eb";
  if (e2) e2.className = "etapa " + (statusAtualPedido >= 2 ? (statusAtualPedido > 2 ? "concluida" : "ativa") : "");
  if (l2) l2.style.backgroundColor = statusAtualPedido >= 3 ? "#15803d" : "#e5e7eb";
  if (e3) e3.className = "etapa " + (statusAtualPedido >= 3 ? "concluida" : "");
}

// 10. LGPD: Modal e Cookies
function configurarLGPD() {
  const banner = document.getElementById("banner-lgpd");
  const modalPolitica = document.getElementById("modal-politica-lgpd");
  const consentimento = localStorage.getItem("consentimento_lgpd_raizes");

  if (consentimento && banner) {
    banner.style.display = "none";
  }

  // Botoes do Banner
  document.getElementById("btn-aceitar-lgpd-todos")?.addEventListener("click", function () {
    localStorage.setItem("consentimento_lgpd_raizes", "todos");
    if (banner) banner.style.display = "none";
  });

  document.getElementById("btn-aceitar-lgpd-essenciais")?.addEventListener("click", function () {
    localStorage.setItem("consentimento_lgpd_raizes", "essenciais");
    if (banner) banner.style.display = "none";
  });

  // Abertura do Modal da Politica
  function abrirPolitica(e) {
    if (e) e.preventDefault();
    if (modalPolitica) modalPolitica.classList.add("aberto");
  }

  function fecharPolitica() {
    if (modalPolitica) modalPolitica.classList.remove("aberto");
  }

  document.getElementById("link-abrir-politica")?.addEventListener("click", abrirPolitica);
  document.getElementById("link-rodape-politica")?.addEventListener("click", abrirPolitica);
  document.getElementById("link-rodape-titular")?.addEventListener("click", abrirPolitica);
  document.getElementById("link-ler-lgpd-checkout")?.addEventListener("click", abrirPolitica);
  document.getElementById("btn-fechar-politica")?.addEventListener("click", fecharPolitica);
  document.getElementById("btn-entendido-politica")?.addEventListener("click", fecharPolitica);

  if (modalPolitica) {
    modalPolitica.addEventListener("click", function (e) {
      if (e.target === modalPolitica) fecharPolitica();
    });
  }
}
