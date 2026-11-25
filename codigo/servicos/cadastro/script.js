document.getElementById('form-cadastro-servico').addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('cad-nome').value.trim();
    const tipo = document.getElementById('cad-tipo').value;
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value;

    const servicosCadastrados = JSON.parse(localStorage.getItem('servicosPetCare')) || [];

    if (servicosCadastrados.some(s => s.email === email)) {
        alert('Já existe um serviço cadastrado com este e-mail.');
        return;
    }

    const novoPrestador = {
        id: Date.now(),
        nome: nome,
        tipo: tipo,
        email: email,
        senha: senha,
        local: 'Endereço não informado',
        tel: 'Telefone não informado',
        dist: 5,
        foto: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
    };

    servicosCadastrados.push(novoPrestador);
    localStorage.setItem('servicosPetCare', JSON.stringify(servicosCadastrados));
    localStorage.setItem('prestadorLogadoPetCare', JSON.stringify(novoPrestador));

    alert('Cadastro de prestador realizado com sucesso!');
    window.location.href = '../login/index.html';
});