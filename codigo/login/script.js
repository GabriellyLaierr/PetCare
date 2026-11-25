const formularioLogin = document.getElementById('formulario');
const linkEsqueceuSenha = document.getElementById('esqueceu-senha');

// Controla o clique no link "Esqueceu a senha?"
linkEsqueceuSenha.addEventListener('click', function(event) {
    event.preventDefault();
    alert('Funcionalidade em desenvolvimento!');
});

// Controla o envio do formulário de Login
formularioLogin.addEventListener('submit', function(event) {
    event.preventDefault();

    const emailDigitado = document.getElementById('email').value;
    const senhaDigitada = document.getElementById('senha').value;

    // Busca os dados salvos no navegador pelo cadastro
    const dadosSalvos = localStorage.getItem('usuarioPetCare');

    if (!dadosSalvos) {
        alert('Nenhuma conta encontrada! Por favor, cadastre-se primeiro.');
        return;
    }

    const usuario = JSON.parse(dadosSalvos);

    // Valida se o e-mail e a senha batem
    if (emailDigitado === usuario.email && senhaDigitada === usuario.senha) {
        alert(`Bem-vindo(a) de volta ao PetCare, ${usuario.nome}!`);
        window.location.href = '../principal/index.html';
    } else {
        alert('E-mail ou senha incorretos! Tente novamente.');
    }
});