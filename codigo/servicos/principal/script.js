// 1. ESTADO E ARMAZENAMENTO LOCAL (LOCALSTORAGE)
let prestadorLogado = JSON.parse(localStorage.getItem('prestadorLogadoPetCare')) || {
    id: Date.now(),
    nome: 'Estabelecimento Parceiro',
    tipo: 'Veterinário',
    modalidade: '',
    email: 'contato@parceiro.com',
    senha: '123',
    tel: '',
    cep: '',
    local: '',
    descricao: '',
    foto: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
    documentos: {}
};

function salvarPrestadorNoStorage() {
    localStorage.setItem('prestadorLogadoPetCare', JSON.stringify(prestadorLogado));

    // Sincroniza também na lista geral lida pelos tutores na busca de serviços
    let listaServicos = JSON.parse(localStorage.getItem('servicosPetCare')) || [];
    const index = listaServicos.findIndex(s => s.email === prestadorLogado.email || s.id === prestadorLogado.id);

    if (index !== -1) {
        listaServicos[index] = { ...listaServicos[index], ...prestadorLogado };
    } else {
        listaServicos.push(prestadorLogado);
    }

    localStorage.setItem('servicosPetCare', JSON.stringify(listaServicos));
}

// 2. NAVEGAÇÃO ENTRE ABAS E HEADER
const navItems = document.querySelectorAll('.nav-item');
const tabSections = document.querySelectorAll('.tab-section');

function abrirAba(targetId, tituloTexto) {
    navItems.forEach(btn => btn.classList.remove('active'));
    tabSections.forEach(sec => sec.classList.remove('active'));

    const btnAtivo = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if (btnAtivo) btnAtivo.classList.add('active');

    document.getElementById(targetId).classList.add('active');
    if (tituloTexto) document.getElementById('titulo-pagina').textContent = tituloTexto;
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        abrirAba(item.dataset.target, item.textContent.trim());
    });
});

// Dropdown Superior Direito
const btnMenuUsuario = document.getElementById('btn-menu-usuario');
const userDropdown = document.getElementById('user-dropdown');

btnMenuUsuario.addEventListener('click', () => userDropdown.classList.toggle('show'));
document.getElementById('drop-config').addEventListener('click', () => {
    userDropdown.classList.remove('show');
    abrirAba('sec-config-prestador', 'Configurações da Conta');
});
document.getElementById('btn-sair').addEventListener('click', () => {
    window.location.href = '../login/index.html';
});

// 3. CAMPOS DINÂMICOS DE DOCUMENTAÇÃO POR MODALIDADE
const selectModalidade = document.getElementById('serv-modalidade');
const containerCamposDocs = document.getElementById('campos-dinamicos-docs');
const subtituloDocs = document.getElementById('subtitulo-documentacao');

// Guarda temporariamente os arquivos anexados nesta sessão
let arquivosDocsTemp = { ...(prestadorLogado.documentos || {}) };

function criarCampoTexto(id, label, placeholder, valorAtual, obrigatorio = true) {
    const tagOpcional = obrigatorio ? '*' : '<span class="optional-tag">(Opcional)</span>';
    return `
        <div class="input-group">
            <label for="${id}">${label} ${tagOpcional}</label>
            <input type="text" id="${id}" placeholder="${placeholder}" value="${valorAtual || ''}" ${obrigatorio ? 'required' : ''}>
        </div>
    `;
}

function criarCampoArquivo(chaveDoc, label) {
    const docSalvo = arquivosDocsTemp[chaveDoc];
    const statusHtml = docSalvo && docSalvo.nome
        ? `<a href="${docSalvo.data}" download="${docSalvo.nome}" class="link-doc-anexado">
               <i class="fa-solid fa-file-check"></i> ${docSalvo.nome}
           </a>`
        : `<span id="status-${chaveDoc}">Nenhum arquivo selecionado</span>`;

    return `
        <div class="input-group full-col">
            <label>${label} *</label>
            <div class="file-upload-box">
                <label for="file-${chaveDoc}" class="btn-secondary cursor-pointer">
                    <i class="fa-solid fa-upload"></i> Anexar Arquivo
                </label>
                <input type="file" id="file-${chaveDoc}" data-chave="${chaveDoc}" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" hidden>
                <div class="file-status-info" id="info-box-${chaveDoc}">
                    ${statusHtml}
                </div>
            </div>
        </div>
    `;
}

function renderizarCamposDocumentacao(modalidade) {
    const docs = arquivosDocsTemp || {};
    let html = '';

    if (!modalidade) {
        subtituloDocs.textContent = 'Selecione uma modalidade acima para visualizar os documentos exigidos.';
        containerCamposDocs.innerHTML = '';
        return;
    }

    subtituloDocs.textContent = `Documentos exigidos para: ${modalidade}`;

    switch (modalidade) {
        case 'Veterinário Autônomo':
            html += criarCampoTexto('doc-crmv', 'CRMV do Profissional', 'Ex: CRMV-MG 12345', docs.crmv, true);
            html += criarCampoTexto('doc-cpf', 'CPF', 'Ex: 000.000.000-00', docs.cpf, true);
            break;

        case 'Clínica Veterinária':
            html += criarCampoTexto('doc-cnpj', 'CNPJ da Clínica', 'Ex: 00.000.000/0001-00', docs.cnpj, true);
            html += criarCampoTexto('doc-crmv', 'CRMV da Clínica', 'Ex: CRMV-MG 54321-PJ', docs.crmv, true);
            html += criarCampoTexto('doc-crmv-rt', 'CRMV do Responsável Técnico', 'Ex: CRMV-MG 98765', docs.crmvRt, true);
            html += criarCampoArquivo('alvaraSanitario', 'Alvará da Vigilância Sanitária (Arquivo)');
            break;

        case 'Farmácia de Revenda':
            html += criarCampoTexto('doc-cnpj', 'CNPJ da Farmácia', 'Ex: 00.000.000/0001-00', docs.cnpj, true);
            html += criarCampoTexto('doc-mapa', 'Registro MAPA (SIPEAGRO)', 'Ex: MG-12345-6', docs.mapa, true);
            html += criarCampoTexto('doc-crmv-rt', 'CRMV do Responsável Técnico', 'Ex: CRMV-MG 98765', docs.crmvRt, false);
            break;

        case 'Farmácia de Manipulação':
            html += criarCampoTexto('doc-cnpj', 'CNPJ da Farmácia', 'Ex: 00.000.000/0001-00', docs.cnpj, true);
            html += criarCampoTexto('doc-mapa', 'Registro MAPA (SIPEAGRO)', 'Ex: MG-12345-6', docs.mapa, true);
            html += criarCampoTexto('doc-crmv-rt', 'CRMV do Responsável Técnico', 'Ex: CRMV-MG 98765', docs.crmvRt, false);
            html += criarCampoArquivo('alvaraSanitario', 'Licença / Alvará da Vigilância Sanitária (Arquivo)');
            break;

        case 'Somente Pet Shop':
            html += criarCampoTexto('doc-cnpj', 'CNPJ do Pet Shop', 'Ex: 00.000.000/0001-00', docs.cnpj, true);
            html += criarCampoArquivo('alvaraPrefeitura', 'Alvará de Funcionamento da Prefeitura (Arquivo)');
            html += criarCampoArquivo('alvaraSanitario', 'Alvará da Vigilância Sanitária (Arquivo)');
            break;
    }

    containerCamposDocs.innerHTML = html;

    // Adiciona listeners aos inputs de arquivo recém-criados
    containerCamposDocs.querySelectorAll('input[type="file"]').forEach(inputFile => {
        inputFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const chave = this.dataset.chave;
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    arquivosDocsTemp[chave] = {
                        nome: file.name,
                        data: reader.result
                    };
                    const infoBox = document.getElementById(`info-box-${chave}`);
                    infoBox.innerHTML = `
                        <a href="${reader.result}" download="${file.name}" class="link-doc-anexado">
                            <i class="fa-solid fa-file-check"></i> ${file.name}
                        </a>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

selectModalidade.addEventListener('change', () => {
    renderizarCamposDocumentacao(selectModalidade.value);
});

// 4. UPLOAD DE LOGO/FOTO E SALVAMENTO
document.getElementById('input-foto-servico').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            prestadorLogado.foto = reader.result;
            document.getElementById('preview-foto-servico').src = reader.result;
        };
        reader.readAsDataURL(file);
    }
});

// Mapeia a modalidade específica para a categoria principal usada na busca dos tutores
function mapearCategoriaBusca(modalidade) {
    if (modalidade === 'Veterinário Autônomo' || modalidade === 'Clínica Veterinária') {
        return 'Veterinário';
    }
    if (modalidade === 'Farmácia de Revenda' || modalidade === 'Farmácia de Manipulação') {
        return 'Farmácia Veterinária';
    }
    return 'Pet Shop';
}

document.getElementById('form-dados-servico').addEventListener('submit', function(e) {
    e.preventDefault();

    const modalidade = selectModalidade.value;
    const docsColetados = { ...arquivosDocsTemp };

    // Validação dos arquivos obrigatórios conforme a modalidade
    if (modalidade === 'Clínica Veterinária' || modalidade === 'Farmácia de Manipulação') {
        if (!docsColetados.alvaraSanitario) {
            alert('Por favor, anexe o arquivo do Alvará da Vigilância Sanitária.');
            return;
        }
    }
    if (modalidade === 'Somente Pet Shop') {
        if (!docsColetados.alvaraPrefeitura || !docsColetados.alvaraSanitario) {
            alert('Por favor, anexe o Alvará da Prefeitura e o Alvará da Vigilância Sanitária.');
            return;
        }
    }

    // Coleta campos de texto visíveis
    if (document.getElementById('doc-cpf')) docsColetados.cpf = document.getElementById('doc-cpf').value.trim();
    if (document.getElementById('doc-cnpj')) docsColetados.cnpj = document.getElementById('doc-cnpj').value.trim();
    if (document.getElementById('doc-crmv')) docsColetados.crmv = document.getElementById('doc-crmv').value.trim();
    if (document.getElementById('doc-crmv-rt')) docsColetados.crmvRt = document.getElementById('doc-crmv-rt').value.trim();
    if (document.getElementById('doc-mapa')) docsColetados.mapa = document.getElementById('doc-mapa').value.trim();

    prestadorLogado.nome = document.getElementById('serv-nome').value.trim();
    prestadorLogado.modalidade = modalidade;
    prestadorLogado.tipo = mapearCategoriaBusca(modalidade);
    prestadorLogado.tel = document.getElementById('serv-telefone').value.trim();
    prestadorLogado.cep = document.getElementById('serv-cep').value.trim();
    prestadorLogado.local = document.getElementById('serv-endereco').value.trim();
    prestadorLogado.descricao = document.getElementById('serv-descricao').value.trim();
    prestadorLogado.documentos = docsColetados;
    prestadorLogado.dist = 5;

    salvarPrestadorNoStorage();
    atualizarInterfaceCompleta();
    alert('Dados salvos com sucesso! Seu serviço já está visível para os tutores.');
});

// 5. ATUALIZAÇÃO DA INTERFACE
function atualizarInterfaceCompleta() {
    // Header e Sidebar
    document.getElementById('header-provider-name').textContent = prestadorLogado.nome;
    document.getElementById('sidebar-provider-nome').textContent = prestadorLogado.nome;
    document.getElementById('sidebar-provider-tipo').textContent = prestadorLogado.tipo || 'Prestador Pet';

    if (prestadorLogado.foto) {
        document.getElementById('header-provider-avatar').src = prestadorLogado.foto;
        document.getElementById('sidebar-provider-avatar').src = prestadorLogado.foto;
        document.getElementById('preview-foto-servico').src = prestadorLogado.foto;
    }

    // Preenche formulário principal
    document.getElementById('serv-nome').value = prestadorLogado.nome || '';
    document.getElementById('serv-telefone').value = (prestadorLogado.tel && prestadorLogado.tel !== 'Telefone não informado') ? prestadorLogado.tel : '';
    document.getElementById('serv-cep').value = prestadorLogado.cep || '';
    document.getElementById('serv-endereco').value = (prestadorLogado.local && prestadorLogado.local !== 'Endereço não informado') ? prestadorLogado.local : '';
    document.getElementById('serv-descricao').value = prestadorLogado.descricao || '';

    // Preenche modalidade inicial se vier do cadastro ou já estiver salva
    if (prestadorLogado.modalidade) {
        selectModalidade.value = prestadorLogado.modalidade;
    } else if (prestadorLogado.tipo === 'Pet Shop') {
        selectModalidade.value = 'Somente Pet Shop';
    }

    arquivosDocsTemp = { ...(prestadorLogado.documentos || {}) };
    renderizarCamposDocumentacao(selectModalidade.value);

    // Configurações
    document.getElementById('config-email').value = prestadorLogado.email || '';
}

// Salvar Configurações de Acesso
document.getElementById('form-config-prestador').addEventListener('submit', function(e) {
    e.preventDefault();
    prestadorLogado.email = document.getElementById('config-email').value.trim();
    const novaSenha = document.getElementById('config-senha').value;
    if (novaSenha) prestadorLogado.senha = novaSenha;

    salvarPrestadorNoStorage();
    document.getElementById('config-senha').value = '';
    alert('Dados de acesso atualizados com sucesso!');
});

// Inicializar painel
atualizarInterfaceCompleta();