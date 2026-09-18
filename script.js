const GRUPOS = [
  { nome:"Ambulatórios", salas:[
    { id:"amb1", nome:"Ambulatório I",   cal:"e57bf839e9447b0269c07f211b4f0d3bf38c65b1e11f75d0a96ffaf63f99fe25@group.calendar.google.com" },
    { id:"amb2", nome:"Ambulatório II",  cal:"de2910914da05c4274dc7a0b6b8b647797898a7cb79341cb9e0c0203d9d498e2@group.calendar.google.com" },
    { id:"amb3", nome:"Ambulatório III", cal:"42ca7db523ffdd20b5ca7940bdd3c3934509988760cbc81127672eb84c4cfd32@group.calendar.google.com" }
  ]},
  { nome:"Laboratórios", salas:[
    { id:"labdi",  nome:"Diagnóstico e Imagem",     cal:"10f8226a45860c8113da25707ba06e1ce2b50b27b3db58e281c745e15e0990fd@group.calendar.google.com" },
    { id:"labmat", nome:"Materiais Dentários",      cal:"2370f6893d753822b2d6517da37f470a6835d5eac2044b86e4bbd97cee413f65@group.calendar.google.com" },
    { id:"labmul", nome:"Multifuncional",           cal:"b2d31203c346cf89881a68b7c09f9ff2a3abd45b3b3d76e396f5ddfb51b025e6@group.calendar.google.com" },
    { id:"labpat", nome:"Patologia",                cal:"9c74aae74b5fbb2d2866c151b0c51423a6990a0348cf2f7f7abb84f761462242@group.calendar.google.com" }
  ]},
  { nome:"Salas de aula", salas:[
    { id:"sala1", nome:"Sala de aula 1", cal:"5791f0cdda5b09d52fd73d4dc549273395c720a88418682cb3fcf43ceb5a727b@group.calendar.google.com" },
    { id:"sala2", nome:"Sala de aula 2", cal:"62b0a215140bbb7e79e5d353ac70678d47ff5658cf3888c6354de80d16431b87@group.calendar.google.com" },
    { id:"sala3", nome:"Sala de aula 3", cal:"dfaac45f8abb79c9816a7247e27e97d47b76583907a2f31cd27d31c1d6c83746@group.calendar.google.com" }
  ]},
  { nome:"Espaços coletivos", salas:[
    { id:"metod", nome:"Metodologias Ativas", cal:"abf5709770f564fb165c809cadd525c7505a7a63765dd6754d696f8cd7146ec6@group.calendar.google.com" },
    { id:"audit", nome:"Miniauditório",       cal:"df583413b7a35f94ba58e78742c9c70b30607bcaed875aa2d40ad469a46f6c23@group.calendar.google.com" }
  ]},
  { nome:"Coordenação", salas:[
    { id:"reuni", nome:"Sala de reuniões", cal:"ab58348fff42a14834bfe9f90c5f1f3d618cd33ccc2188425e5d670db99acae0@group.calendar.google.com" }
  ]}
];

const nav = document.getElementById("menu");
const iframe = document.getElementById("agenda");
const carregando = document.getElementById("carregando");
const tituloSala = document.getElementById("salaAtual");
const tituloCat = document.getElementById("categoriaAtual");
const linkGoogle = document.getElementById("abrirGoogle");
const botaoMenu = document.getElementById("abreMenu");
let modo = "WEEK";
let atual = GRUPOS[0].salas[0];
let categoriaAtual = GRUPOS[0].nome;
let carregou = false;

// monta o menu
GRUPOS.forEach(g => {
  const bloco = document.createElement("div");
  bloco.className = "grupo";
  const h = document.createElement("h2");
  h.textContent = g.nome;
  bloco.appendChild(h);
  const ul = document.createElement("ul");
  g.salas.forEach(s => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = "item";
    b.dataset.id = s.id;
    b.setAttribute("aria-current", "false");
    b.innerHTML = '<span class="bolinha"></span>';
    b.appendChild(document.createTextNode(s.nome));
    b.addEventListener("click", () => selecionar(s, g.nome, true));
    li.appendChild(b);
    ul.appendChild(li);
  });
  bloco.appendChild(ul);
  nav.appendChild(bloco);
});

function urlAgenda(sala){
  const p = new URLSearchParams({
    src: sala.cal,
    ctz: "America/Sao_Paulo",
    mode: modo,
    wkst: "1",
    showTitle: "0",
    showNav: "1",
    showDate: "1",
    showPrint: "0",
    showTabs: "0",
    showCalendars: "0",
    showTz: "0"
  });
  return "https://calendar.google.com/calendar/embed?" + p.toString();
}

function selecionar(sala, categoria, fechaMenu){
  atual = sala;
  categoriaAtual = categoria;
  tituloSala.textContent = sala.nome;
  tituloCat.textContent = categoria;
  document.title = sala.nome + " — Reserva de Sala | Odontologia UFG";
  nav.querySelectorAll(".item").forEach(b =>
    b.setAttribute("aria-current", String(b.dataset.id === sala.id))
  );
  linkGoogle.href = "https://calendar.google.com/calendar/u/0/r?cid=" + encodeURIComponent(sala.cal);
  history.replaceState(null, "", "#" + sala.id);
  carregar();
  if (fechaMenu && window.matchMedia("(max-width:900px)").matches) alternarMenu(false);
}

let temporizadores = [];

function limparTemporizadores(){
  temporizadores.forEach(clearTimeout);
  temporizadores = [];
}

function carregar(){
  limparTemporizadores();
  carregou = false;
  carregando.hidden = false;
  carregando.innerHTML = "Carregando agenda…";
  // limpa o iframe primeiro, para nunca mostrar a agenda anterior
  // enquanto a nova ainda está sendo buscada
  iframe.removeAttribute("src");
  setTimeout(() => {
    iframe.src = urlAgenda(atual);
  }, 0);

  // avisos progressivos: passado um tempo, atualiza a mensagem;
  // se passar de vez, mostra o aviso de "verifique se é pública"
  temporizadores.push(setTimeout(() => {
    if (!carregou) carregando.innerHTML = "Ainda carregando… o Google Agenda às vezes demora.";
  }, 5000));
  temporizadores.push(setTimeout(() => {
    if (!carregou) {
      carregando.innerHTML =
        '<div class="aviso"><strong>Essa agenda não carregou.</strong>' +
        'Verifique se ela está definida como pública no Google Agenda ' +
        '(Configurações da agenda → Permissões de acesso → ' +
        '"Disponibilizar publicamente"), ou tente abrir direto pelo botão ' +
        '"Abrir no Google Agenda" acima.</div>';
    }
  }, 14000));
}

iframe.addEventListener("load", () => {
  if (!iframe.src || iframe.src.endsWith("about:blank")) return;
  carregou = true;
  limparTemporizadores();
  carregando.hidden = true;
});

document.querySelectorAll("[data-modo]").forEach(b => {
  b.addEventListener("click", () => {
    modo = b.dataset.modo;
    document.querySelectorAll("[data-modo]").forEach(o =>
      o.setAttribute("aria-pressed", String(o === b))
    );
    carregar();
  });
});

function alternarMenu(abrir){
  nav.dataset.aberto = String(abrir);
  botaoMenu.setAttribute("aria-expanded", String(abrir));
}
botaoMenu.addEventListener("click", () => alternarMenu(nav.dataset.aberto !== "true"));

function ajustarMenu(){
  alternarMenu(!window.matchMedia("(max-width:900px)").matches);
}
window.addEventListener("resize", ajustarMenu);

// relógio
function tick(){
  const d = new Date();
  document.getElementById("agora").textContent =
    d.toLocaleString("pt-BR", { timeZone:"America/Sao_Paulo", weekday:"short", day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
}
tick(); setInterval(tick, 30000);

// abertura: respeita o link direto (#sala2)
(function inicio(){
  ajustarMenu();
  const alvo = location.hash.replace("#", "");
  for (const g of GRUPOS){
    const s = g.salas.find(x => x.id === alvo);
    if (s) return selecionar(s, g.nome, false);
  }
  selecionar(GRUPOS[0].salas[0], GRUPOS[0].nome, false);
})();