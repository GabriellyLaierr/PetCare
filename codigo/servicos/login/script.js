document.getElementById('form-login-servico').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    const servicosCadastrados = JSON.parse(localStorage.getItem('servicosPetCare')) || [];
    const prestadorEncontrado = servicosCadastrados.find(s => s.email === email && s.senha === senha);

    if (prestadorEncontrado) {
        localStorage.setItem('prestadorLogadoPetCare', JSON.stringify(prestadorEncontrado));
        alert(`Bem-vindo(a), ${prestadorEncontrado.nome}!`);
        window.location.href = '../principal/index.html';
    } else {
        alert('E-mail ou senha incorretos, ou serviço ainda não cadastrado.');
    }
});