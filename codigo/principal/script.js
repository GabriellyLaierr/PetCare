// 1. ATALHOS E ARMAZENAMENTO LOCAL
const $ = id => document.getElementById(id);
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioPetCare')) || {
    nome: 'Tutor(a)', email: 'tutor@petcare.com', senha: '123',
    foto: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
};
let listaPets = JSON.parse(localStorage.getItem('petsPetCare')) || [];
let petAtivoId = listaPets[0]?.id || null;
let vacinasCustom = JSON.parse(localStorage.getItem('vacinasCustomPetCare')) || [];

const salvarDados = () => {
    localStorage.setItem('usuarioPetCare', JSON.stringify(usuarioLogado));
    localStorage.setItem('petsPetCare', JSON.stringify(listaPets));
    localStorage.setItem('vacinasCustomPetCare', JSON.stringify(vacinasCustom));
};

const formatarData = d => d ? d.split('-').reverse().join('/') : '--/--/----';

const lerArquivo = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => callback(reader.result, file.name);
    reader.readAsDataURL(file);
};

// 2. USUÁRIO E NAVEGAÇÃO ENTRE ABAS
function atualizarHeader() {
    $('header-user-name').textContent = usuarioLogado.nome;
    $('config-nome').value = usuarioLogado.nome;
    $('config-email').value = usuarioLogado.email;
    if (usuarioLogado.foto) {
        $('header-user-avatar').src = usuarioLogado.foto;
        $('config-preview-foto').src = usuarioLogado.foto;
    }
}

function abrirAba(targetId, titulo) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.target === targetId));
    document.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.id === targetId));
    if (titulo) $('titulo-pagina').textContent = titulo;
}

document.querySelectorAll('.nav-item').forEach(btn =>
    btn.addEventListener('click', () => abrirAba(btn.dataset.target, btn.textContent.trim()))
);

$('btn-menu-usuario').addEventListener('click', () => $('user-dropdown').classList.toggle('show'));
$('drop-config').addEventListener('click', () => {
    $('user-dropdown').classList.remove('show');
    abrirAba('sec-configuracoes', 'Configurações');
});
$('btn-sair').addEventListener('click', () => window.location.href = '../login/index.html');

// 3. MODAL DE PET (CADASTRAR, EDITAR, EXCLUIR E EXAMES)
let fotoPetBase64 = 'https://cdn-icons-png.flaticon.com/512/616/616408.png';
let arquivoTemp = { nome: '', data: '' };
let examesTemp = [];

$('pet-especie').addEventListener('change', e =>
    $('grupo-outra-especie').style.display = e.target.value === 'Outra' ? 'flex' : 'none'
);
$('pet-adotado').addEventListener('change', e =>
    $('label-data-pet').textContent = e.target.checked ? 'Data de Resgate' : 'Data de Nascimento'
);

$('pet-foto-input').addEventListener('change', e => lerArquivo(e.target.files[0], url => {
    fotoPetBase64 = url;
    $('modal-preview-pet').src = url;
}));

$('pet-exame-arquivo').addEventListener('change', e => lerArquivo(e.target.files[0], (url, nome) => {
    arquivoTemp = { nome, data: url };
    $('texto-btn-anexar').textContent = nome.length > 15 ? nome.slice(0, 15) + '...' : nome;
}));

function renderExamesModal() {
    $('lista-exames-modal').innerHTML = examesTemp.map((ex, i) => `
        <div class="exame-item-chip">
            <div class="exame-item-info">
                <strong>${ex.nome}</strong>
                ${ex.arquivoNome
                    ? `<a href="${ex.arquivoData}" download="${ex.arquivoNome}" class="link-anexo-exame"><i class="fa-solid fa-file-arrow-down"></i> ${ex.arquivoNome}</a>`
                    : `<small style="color:#777;">(Sem anexo)</small>`}
            </div>
            <button type="button" class="btn-remover-exame" onclick="removerExameTemp(${i})"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

window.removerExameTemp = i => { examesTemp.splice(i, 1); renderExamesModal(); };

$('btn-adicionar-exame').addEventListener('click', () => {
    const nome = $('pet-exames-texto').value.trim();
    if (!nome && !arquivoTemp.nome) return alert('Digite o nome do exame ou anexe um arquivo.');
    examesTemp.push({ nome: nome || 'Exame sem título', arquivoNome: arquivoTemp.nome, arquivoData: arquivoTemp.data });
    $('pet-exames-texto').value = '';
    $('pet-exame-arquivo').value = '';
    arquivoTemp = { nome: '', data: '' };
    $('texto-btn-anexar').textContent = 'Anexar Arquivo';
    renderExamesModal();
});

function abrirModalPet(pet = null) {
    $('form-pet-modal').reset();
    $('pet-id-edit').value = pet ? pet.id : '';
    $('modal-pet-titulo').textContent = pet ? 'Editar Informações do Pet' : 'Cadastrar Novo Pet';
    $('btn-excluir-pet').style.display = pet ? 'inline-flex' : 'none';

    const padrao = ['Cachorro', 'Gato', 'Coelho', 'Hamster'];
    if (pet) {
        $('pet-nome').value = pet.nome;
        $('pet-raca').value = pet.raca;
        $('pet-data').value = pet.data;
        $('pet-castrado').value = pet.castrado;
        $('pet-descricao').value = pet.descricao;
        $('pet-adotado').checked = pet.adotado;
        $('pet-especie').value = padrao.includes(pet.especie) ? pet.especie : 'Outra';
        $('grupo-outra-especie').style.display = padrao.includes(pet.especie) ? 'none' : 'flex';
        if (!padrao.includes(pet.especie)) $('pet-outra-especie').value = pet.especie;
    } else {
        $('grupo-outra-especie').style.display = 'none';
    }

    $('label-data-pet').textContent = pet?.adotado ? 'Data de Resgate' : 'Data de Nascimento';
    fotoPetBase64 = pet?.foto || '';
    examesTemp = pet?.exames ? [...pet.exames] : [];
    arquivoTemp = { nome: '', data: '' };
    $('texto-btn-anexar').textContent = 'Anexar Arquivo';
    renderExamesModal();
    $('modal-pet').classList.add('open');
}

$('btn-abrir-modal-pet').addEventListener('click', () => abrirModalPet());
$('btn-empty-add').addEventListener('click', () => abrirModalPet());
$('btn-editar-pet').addEventListener('click', () => abrirModalPet(listaPets.find(p => p.id === petAtivoId)));
$('btn-fechar-modal').addEventListener('click', () => $('modal-pet').classList.remove('open'));
$('btn-cancelar-modal').addEventListener('click', () => $('modal-pet').classList.remove('open'));

// Excluir Pet
$('btn-excluir-pet').addEventListener('click', () => {
    const idEdit = $('pet-id-edit').value;
    if (!idEdit || !confirm('Tem certeza que deseja excluir este pet? Todos os dados dele serão apagados.')) return;

    listaPets = listaPets.filter(p => p.id != idEdit);
    petAtivoId = listaPets[0]?.id || null;
    salvarDados();
    $('modal-pet').classList.remove('open');
    renderizarTudo();
});

// Salvar Pet
$('form-pet-modal').addEventListener('submit', e => {
    e.preventDefault();
    const nomePend = $('pet-exames-texto').value.trim();
    if (nomePend || arquivoTemp.nome) {
        examesTemp.push({ nome: nomePend || 'Exame sem título', arquivoNome: arquivoTemp.nome, arquivoData: arquivoTemp.data });
    }

    const idEdit = $('pet-id-edit').value;
    const dadosPet = {
        nome: $('pet-nome').value,
        especie: $('pet-especie').value === 'Outra' ? $('pet-outra-especie').value : $('pet-especie').value,
        raca: $('pet-raca').value || 'SRD',
        adotado: $('pet-adotado').checked,
        data: $('pet-data').value,
        castrado: $('pet-castrado').value,
        exames: [...examesTemp],
        descricao: $('pet-descricao').value,
        foto: fotoPetBase64
    };

    if (idEdit) {
        const idx = listaPets.findIndex(p => p.id == idEdit);
        listaPets[idx] = { ...listaPets[idx], ...dadosPet };
    } else {
        const novo = { id: Date.now(), ...dadosPet, vacinas: [], medicamentos: [], historico: [] };
        listaPets.push(novo);
        petAtivoId = novo.id;
    }

    salvarDados();
    $('modal-pet').classList.remove('open');
    renderizarTudo();
});

// 4. RENDERIZAÇÃO DO PAINEL, VACINAS, REMÉDIOS E HISTÓRICO
function renderLista(itens, idResumo, idCompleto, msgVazia, tplResumo, tplCompleto) {
    $(idResumo).innerHTML = itens.length ? itens.map(tplResumo).join('') : `<p class="subtitle">${msgVazia}</p>`;
    $(idCompleto).innerHTML = itens.length ? itens.map(tplCompleto).join('') : `<p class="subtitle">${msgVazia}</p>`;
}

function renderizarTudo() {
    // Sidebar de Pets
    const sidebar = $('lista-pets-sidebar');
    const btnAdd = $('btn-abrir-modal-pet');
    sidebar.innerHTML = '';
    listaPets.forEach(pet => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `pet-avatar-item ${pet.id === petAtivoId ? 'active' : ''}`;
        btn.innerHTML = `<img src="${pet.foto}" class="avatar-circle"><span>${pet.nome}</span>`;
        btn.onclick = () => { petAtivoId = pet.id; renderizarTudo(); };
        sidebar.appendChild(btn);
    });
    sidebar.appendChild(btnAdd);

    // Painel Principal
    const temPet = listaPets.length > 0;
    $('estado-sem-pet').style.display = temPet ? 'none' : 'block';
    $('painel-pet-ativo').style.display = temPet ? 'grid' : 'none';
    if (!temPet) return;

    const pet = listaPets.find(p => p.id === petAtivoId) || listaPets[0];
    petAtivoId = pet.id;

    $('view-pet-foto').src = pet.foto;
    $('view-pet-nome').textContent = pet.nome;
    $('view-pet-raca-especie').textContent = `${pet.especie} • ${pet.raca}`;
    $('view-pet-data').textContent = `${pet.adotado ? 'Resgate' : 'Nascimento'}: ${formatarData(pet.data)}`;
    $('view-pet-castrado').textContent = pet.castrado === 'Sim' ? 'Castrado(a)' : 'Não castrado(a)';
    $('view-pet-desc').textContent = pet.descricao || 'Nenhuma observação cadastrada.';

    $('view-pet-exames-lista').innerHTML = pet.exames?.length
        ? pet.exames.map(ex => `<li><span>• ${ex.nome}</span> ${ex.arquivoNome ? `<a href="${ex.arquivoData}" download="${ex.arquivoNome}" class="link-anexo-exame"><i class="fa-solid fa-paperclip"></i> ${ex.arquivoNome}</a>` : ''}</li>`).join('')
        : '<li>Nenhum exame registrado no perfil.</li>';

    renderLista(pet.vacinas, 'resumo-vacinas-lista', 'lista-completa-vacinas', 'Nenhuma vacina registrada.',
        v => `<div class="mini-item"><span><strong>${v.nome}</strong><br><small>Retorno programado</small></span><strong>${formatarData(v.proximaData)}</strong></div>`,
        v => `<div class="record-card"><div><strong>${v.nome}</strong><br><small>Aplicada em: ${formatarData(v.dataAplicacao)}</small></div><span class="badge">Próxima: ${formatarData(v.proximaData)}</span></div>`
    );

    renderLista(pet.medicamentos, 'resumo-medicamentos-lista', 'lista-completa-medicamentos', 'Nenhum medicamento cadastrado.',
        m => `<div class="mini-item green"><span><strong>${m.nome}</strong> (${m.dose})<br><small>${m.intervalo}</small></span><strong>${m.proximaData ? formatarData(m.proximaData) : 'Sem data futura'}</strong></div>`,
        m => `<div class="record-card"><div><strong>${m.nome}</strong> - Dose: ${m.dose}<br><small>Frequência: ${m.intervalo}</small></div><span class="badge">${m.proximaData ? 'Próxima: ' + formatarData(m.proximaData) : 'Sem data futura'}</span></div>`
    );

    renderLista(pet.historico, 'resumo-historico-lista', 'lista-completa-historico', 'Sem registros no histórico.',
        h => `<div class="timeline-step"><strong>${formatarData(h.data)}${h.hora ? ' às ' + h.hora : ''}</strong><p><small>${h.tipo}</small><br>${h.descricao}</p></div>`,
        h => `<div class="record-card"><div><strong>${h.tipo}</strong>: ${h.descricao}</div><strong>${formatarData(h.data)}${h.hora ? ' às ' + h.hora : ''}</strong></div>`
    );
}

// 5. FORMULÁRIOS DE SAÚDE, CONTA E SERVIÇOS
$('hist-tipo').addEventListener('change', e => {
    const isDoenca = e.target.value === 'Histórico / Doença';
    $('grupo-hist-hora').style.display = isDoenca ? 'none' : 'flex';
    $('hist-hora').required = !isDoenca;
    if (isDoenca) $('hist-hora').value = '';
    $('tooltip-hist-clinico').style.display = isDoenca ? 'inline-flex' : 'none';
});

$('form-historico').addEventListener('submit', e => {
    e.preventDefault();
    const pet = listaPets.find(p => p.id === petAtivoId);
    if (!pet) return alert('Cadastre um pet primeiro!');
    pet.historico.push({ tipo: $('hist-tipo').value, data: $('hist-data').value, hora: $('hist-hora').value, descricao: $('hist-descricao').value });
    salvarDados(); e.target.reset();
    $('grupo-hist-hora').style.display = 'flex';
    $('tooltip-hist-clinico').style.display = 'none';
    renderizarTudo();
});

$('form-vacina').addEventListener('submit', e => {
    e.preventDefault();
    const pet = listaPets.find(p => p.id === petAtivoId);
    if (!pet) return alert('Cadastre um pet primeiro!');
    const nome = $('vac-nome').value.trim();
    if (!vacinasCustom.includes(nome)) { vacinasCustom.push(nome); atualizarDatalistVacinas(); }
    pet.vacinas.push({ nome, dataAplicacao: $('vac-data-aplicacao').value, proximaData: $('vac-proxima-data').value });
    salvarDados(); e.target.reset(); renderizarTudo();
    alert('Vacina salva e lembrete ativado!');
});

$('form-medicamento').addEventListener('submit', e => {
    e.preventDefault();
    const pet = listaPets.find(p => p.id === petAtivoId);
    if (!pet) return alert('Cadastre um pet primeiro!');
    pet.medicamentos.push({
        nome: $('med-nome').value,
        dose: `${$('med-dose-qtd').value} ${$('med-dose-tipo').value}`,
        intervalo: $('med-intervalo').value,
        proximaData: $('med-proxima-data').value
    });
    salvarDados(); e.target.reset(); renderizarTudo();
});

function atualizarDatalistVacinas() {
    const dl = $('vacinas-salvas-datalist');
    vacinasCustom.forEach(v => {
        if (![...dl.options].some(o => o.value === v)) dl.insertAdjacentHTML('beforeend', `<option value="${v}">${v}</option>`);
    });
}

$('form-notificacoes').addEventListener('submit', e => { e.preventDefault(); alert('Preferências de lembretes salvas!'); });

$('config-foto-input').addEventListener('change', e => lerArquivo(e.target.files[0], url => {
    usuarioLogado.foto = url;
    $('config-preview-foto').src = url;
}));

$('form-config-conta').addEventListener('submit', e => {
    e.preventDefault();
    usuarioLogado.nome = $('config-nome').value;
    usuarioLogado.email = $('config-email').value;
    if ($('config-senha').value) usuarioLogado.senha = $('config-senha').value;
    salvarDados(); atualizarHeader();
    alert('Dados da conta atualizados com sucesso!');
});

$('form-busca-servicos').addEventListener('submit', e => {
    e.preventDefault();
    const tipo = $('serv-tipo').value;
    const lista = (JSON.parse(localStorage.getItem('servicosPetCare')) || []).filter(s => s.tipo === tipo);

    $('resultados-servicos').innerHTML = lista.length
        ? lista.map(s => `
            <div class="service-card">
                <img src="${s.foto || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'}" class="avatar-round-lg">
                <span class="service-badge">${s.modalidade || s.tipo}</span>
                <h3>${s.nome}</h3>
                <p><i class="fa-solid fa-location-dot"></i> ${s.local || 'Endereço não informado'}</p>
                <p><i class="fa-solid fa-phone"></i> ${s.tel || 'Telefone não informado'}</p>
                ${s.descricao ? `<p class="subtitle" style="margin:4px 0 0;">${s.descricao}</p>` : ''}
            </div>`).join('')
        : `<div class="card full-width" style="text-align:center;"><p class="subtitle" style="margin:0;">Nenhum estabelecimento do tipo <strong>${tipo}</strong> cadastrado.</p></div>`;
});

// Inicializar
atualizarHeader();
atualizarDatalistVacinas();
renderizarTudo();
