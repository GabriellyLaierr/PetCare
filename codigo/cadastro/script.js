const formularioCadastro = document.getElementById('formulario');

formularioCadastro.addEventListener('submit', function(event) {
    // Impede o envio padrão do formulário (que recarregaria a página)
    event.preventDefault();

    // Captura os valores digitados nos campos
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar_senha').value;
    const termosAceitos = document.getElementById('termos').checked;

    // 1. Validação: Verifica se as senhas são iguais
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem! Por favor, digite novamente.');
        return;
    }

    // 2. Validação extra: Tamanho mínimo da senha
    if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    // 3. Validação: Garante que os termos foram marcados
    if (!termosAceitos) {
        alert('Você precisa aceitar os Termos de Uso e Política de Privacidade.');
        return;
    }

    // 4. Monta o objeto do usuário com os dados preenchidos
    const novoUsuario = {
        nome: nome,
        email: email,
        senha: senha
    };

    // 5. Salva no localStorage do navegador para que a tela de Login possa ler depois
    localStorage.setItem('usuarioPetCare', JSON.stringify(novoUsuario));

    alert('Conta criada com sucesso! Você será redirecionado para o login.');

    // 6. Redireciona para a página de login na mesma aba
    window.location.href = '../login/index.html';
});