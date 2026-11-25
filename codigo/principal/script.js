// 1. ATALHOS E ARMAZENAMENTO LOCAL
const $ = id => document.getElementById(id);
const toggleHidden = (el, esconder) => (typeof el === 'string' ? $(el) : el).classList.toggle('hidden', esconder);

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

const lerArquivo = (file, cb) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(reader.result, file.name);
    reader.readAsDataURL(file);
};

// 2. USUÁRIO E NAVEGAÇÃO
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

$('btn-menu-usuario').addEventListener('click', () =>$('user-dropdown').classList.toggle('show'));
$('drop-config').addEventListener('click', () => {$('user-dropdown').classList.remove('show');
    abrirAba('sec-configuracoes', 'Configurações');
});
$('btn-sair').addEventListener('click', () => window.location.href = '../login/index.html');

// 3. MODAL DE PET E EXAMES
let fotoPetBase64 = '';
let arquivoTemp = { nome: '', data: '' };
let examesTemp = [];

function atualizarPreviewImg(imgEl, url) {
    if (url) {
        imgEl.src = url;
        toggleHidden(imgEl, false);
    } else {
        imgEl.removeAttribute('src');
        toggleHidden(imgEl, true);
    }
}

$('pet-especie').addEventListener('change', e => toggleHidden('grupo-outra-especie', e.target.value !== 'Outra'));
$('pet-adotado').addEventListener('change', e =>$('label-data-pet').textContent = e.target.checked ? 'Data de Resgate' : 'Data de Nascimento');

$('pet-foto-input').addEventListener('change', e => lerArquivo(e.target.files[0], url => {
    fotoPetBase64 = url;
    atualizarPreviewImg($('modal-preview-pet'), url);
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
                    : `<small class="exame-sem-anexo">(Sem anexo)</small>`}
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
    $('pet-exames-texto').value = '';$('pet-exame-arquivo').value = '';
    arquivoTemp = { nome: '', data: '' };
    $('texto-btn-anexar').textContent = 'Anexar Arquivo';
    renderExamesModal();
});

function abrirModalPet(pet = null) {
    $('form-pet-modal').reset();
    $('pet-id-edit').value = pet?.id \vert{}\vert{} '';$('modal-pet-titulo').textContent = pet ? 'Editar Informações do Pet' : 'Cadastrar Novo Pet';
    toggleHidden('btn-excluir-pet', !pet);

    const padrao = ['Cachorro', 'Gato', 'Coelho', 'Hamster'];
    const outraEspecie = pet && !padrao.includes(pet.especie);
    if (pet) {
        $('pet-nome').value = pet.nome;
        $('pet-raca').value = pet.raca;
        $('pet-data').value = pet.data;
        $('pet-castrado').value = pet.castrado;
        $('pet-descricao').value = pet.descricao;
        $('pet-adotado').checked = pet.adotado;
        $('pet-especie').value = outraEspecie ? 'Outra' : pet.especie;
        if (outraEspecie) $('pet-outra-especie').value = pet.especie;
    }
    toggleHidden('grupo-outra-especie', !outraEspecie);

    $('label-data-pet').textContent = pet?.adotado ? 'Data de Resgate' : 'Data de Nascimento';
    fotoPetBase64 = pet?.foto || '';
    atualizarPreviewImg($('modal-preview-pet'), fotoPetBase64);

    examesTemp = pet?.exames ? [...pet.exames] : [];
    arquivoTemp = { nome: '', data: '' };
    $('texto-btn-anexar').textContent = 'Anexar Arquivo';
    renderExamesModal();
    $('modal-pet').classList.add('open');
}

$('btn-abrir-modal-pet').addEventListener('click', () => abrirModalPet());
$('btn-empty-add').addEventListener('click', () => abrirModalPet());$('btn-editar-pet').addEventListener('click', () => abrirModalPet(listaPets.find(p => p.id === petAtivoId)));
$('btn-fechar-modal').addEventListener('click', () =>$('modal-pet').classList.remove('open'));
$('btn-cancelar-modal').addEventListener('click', () =>$('modal-pet').classList.
