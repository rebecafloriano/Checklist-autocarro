const zonas = ['frente', 'lateralDir', 'lateralEsq', 'traseira', 'pneus', 'luzes', 'oleo', 'refrigerante'];

document.addEventListener('DOMContentLoaded', () => {

    // Restaurar switches do sessionStorage
    zonas.forEach(zona => {
        const estado = sessionStorage.getItem(zona);
        const input = document.getElementById(zona + 'Check');
        const fotoDiv = document.getElementById(zona + 'Foto');

        if (estado !== null && input && fotoDiv) {
            input.checked = estado === 'true';
            input.classList.remove('neutral');
            fotoDiv.style.display = input.checked ? 'none' : 'block';
        }
    });

    // Restaurar matrícula e motorista do sessionStorage
    const matriculaInput = document.getElementById('matricula');
    const motoristaInput = document.getElementById('motorista');

    const matriculaSalva = sessionStorage.getItem('matricula');
    const motoristaSalvo = sessionStorage.getItem('motorista');

    if (matriculaSalva) matriculaInput.value = matriculaSalva;
    if (motoristaSalvo) motoristaInput.value = motoristaSalvo;

    // Salvar em tempo real
    matriculaInput.addEventListener('input', (e) => {
        sessionStorage.setItem('matricula', e.target.value.trim());
    });

    motoristaInput.addEventListener('input', (e) => {
        sessionStorage.setItem('motorista', e.target.value.trim());
    });

    // Máscara de matrícula
    matriculaInput.addEventListener('input', function (e) {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formatted = '';

        if (value.length > 0) formatted += value.substring(0, 2);
        if (value.length > 2) formatted += '-' + value.substring(2, 4);
        if (value.length > 4) formatted += '-' + value.substring(4, 6);

        e.target.value = formatted;
    });

    // Confirmação de navegação (sair da página)
    window.addEventListener('beforeunload', (e) => {
        const switches = document.querySelectorAll('.form-check-input');
        const matricula = document.getElementById('matricula');
        const motorista = document.getElementById('motorista');

        let temNeutral = false;

        switches.forEach((sw) => {
            if (sw.classList.contains('neutral')) {
                temNeutral = true;
            }
        });

        if (temNeutral || matricula.value.trim() !== '' || motorista.value.trim() !== '') {
            const confirmationMessage = 'Você tem um checklist em andamento. Tem certeza que deseja sair?';

            e.preventDefault();
            e.returnValue = confirmationMessage;
        }
    });

});

function handleToggle(el, zona) {
    const fotoDiv = document.getElementById(zona + 'Foto');

    if (el.classList.contains('neutral')) {
        el.classList.remove('neutral');
        el.checked = true;
        fotoDiv.style.display = 'none';
    } else if (el.checked) {
        fotoDiv.style.display = 'none';
    } else {
        fotoDiv.style.display = 'block';
    }

    // Salvar no sessionStorage
    sessionStorage.setItem(zona, el.checked);
}

async function validarChecklist() {
    const switches = document.querySelectorAll('.form-check-input');
    const matricula = document.getElementById('matricula');
    const motorista = document.getElementById('motorista');
    const botaoEnviar = document.getElementById('botaoEnviar');

    let todosRespondidos = true;
    let fotosOk = true;

    // Desabilitar botão para evitar duplo clique
    botaoEnviar.disabled = true;
    botaoEnviar.innerText = 'Enviando...';

    switches.forEach((sw) => {
        const zona = sw.id.replace('Check', '');
        const fotoInput = document.getElementById(zona + 'Image');

        if (sw.classList.contains('neutral')) {
            todosRespondidos = false;
            sw.classList.add('shake');
            setTimeout(() => sw.classList.remove('shake'), 500);
        } else if (!sw.checked) {
            if (!fotoInput || !fotoInput.files || fotoInput.files.length === 0) {
                fotosOk = false;
                fotoInput.classList.add('shake');
                setTimeout(() => fotoInput.classList.remove('shake'), 500);
            }
        }
    });

    if (!todosRespondidos || matricula.value.trim() === '' || motorista.value.trim() === '') {
        if (matricula.value.trim() === '') {
            matricula.classList.add('shake');
            setTimeout(() => matricula.classList.remove('shake'), 500);
        }

        if (motorista.value.trim() === '') {
            motorista.classList.add('shake');
            setTimeout(() => motorista.classList.remove('shake'), 500);
        }

        showToast("Por favor, preencha todos os campos obrigatórios e revise o checklist.");
        botaoEnviar.disabled = false;
        botaoEnviar.innerText = 'Enviar';
        return;
    }

    if (!fotosOk) {
        showToast("Por favor, envie uma foto para todos os itens que foram marcados como problema (vermelho).");
        botaoEnviar.disabled = false;
        botaoEnviar.innerText = 'Enviar';
        return;
    }

    try {
        const respostas = {};
        const switchesMap = {};

        zonas.forEach(zona => {
            const sw = document.getElementById(zona + 'Check');
            const textarea = document.getElementById(zona + 'Textarea');
            respostas[zona] = textarea ? textarea.value.trim() : '';
            switchesMap[zona] = sw.checked ? 'ok' : 'problema';
        });

        const dadosChecklist = {
            matricula: matricula.value.trim(),
            motorista: motorista.value.trim(),
            dataHora: new Date().toISOString(),
            observacoes: respostas,
            switches: switchesMap
        };

        await salvarChecklist(dadosChecklist);
        showToast("Checklist enviado com sucesso!");

        // Resetar formulário
        matricula.value = '';
        motorista.value = '';
        sessionStorage.removeItem('matricula');
        sessionStorage.removeItem('motorista');

        switches.forEach((sw) => {
            const zona = sw.id.replace('Check', '');
            const fotoDiv = document.getElementById(zona + 'Foto');
            const fotoInput = document.getElementById(zona + 'Image');
            const textarea = document.getElementById(zona + 'Textarea');

            sw.classList.add('neutral');
            sw.checked = false;

            fotoDiv.style.display = 'none';
            if (fotoInput) fotoInput.value = '';
            if (textarea) textarea.value = '';

            sessionStorage.removeItem(zona);
        });

    } catch (error) {
        console.error("Erro ao enviar para o banco: ", error);
        showToast("Erro ao enviar checklist. Tente novamente.");
    } finally {
        botaoEnviar.disabled = false;
        botaoEnviar.innerText = 'Enviar';
    }
}

function showToast(message) {
    document.getElementById('toast-body').innerText = message;
    const toast = new bootstrap.Toast(document.getElementById('liveToast'));
    toast.show();
}
