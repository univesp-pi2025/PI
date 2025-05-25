document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('quarto');

  try {
    const res = await fetch('http://localhost:3000/quartos');
    if (!res.ok) throw new Error('Erro ao carregar quartos');

    const quartos = await res.json();
    console.log('[DEBUG] Dados recebidos de /quartos:', quartos);

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Selecione um quarto';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    quartos.forEach(q => {
      const option = document.createElement('option');
      option.value = q.id;
      option.text = `Quarto ${q.numero}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    alert('Não foi possível carregar os quartos disponíveis.');
  }

  // Formatação automatica de CPF e TELEFONE solicitado by Lael
  if (window.IMask) {
    IMask(document.getElementById('cpf'), {
      mask: '000.000.000-00'
    });

    IMask(document.getElementById('telefone'), {
      mask: '(00) 00000-0000'
    });
  }
});

document.getElementById('formReserva').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const cpf = document.getElementById('cpf').value.trim();
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const IDQuarto = parseInt(document.getElementById('quarto').value);
  const hospedes = document.getElementById('hospedes').value;

  // Coloquei uma verificação extra para todos os campos! 
  if (!nome || !email || !telefone || !cpf || !checkin || !checkout || !hospedes || isNaN(IDQuarto)) {
    alert('Por favor, preencha todos os campos corretamente.');
    return;
  }

  try {
    // 1 - Cadastramos o user!
    const respHospede = await fetch('http://localhost:3000/hospedes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Nome: nome,
        Documento: cpf,
        Telefone: telefone,
        Email: email,
        Endereco: ''
      })
    });

    if (!respHospede.ok) throw new Error('Erro ao cadastrar hóspede');

    // 2. Pegar último hóspede inserido
    const hospedesResp = await fetch('http://localhost:3000/hospedes');
    const lista = await hospedesResp.json();
    const novoHospede = lista[lista.length - 1];

    // 3. Agora a gnt insere a reserva
    const reserva = {
      IDQuarto,
      DataEntrada: checkin,
      DataSaida: checkout,
      Status_pagamento: 0,
      condicoes: "Aceito",
      IDHospede: novoHospede.id_Hospede
    };

    const res = await fetch('http://localhost:3000/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reserva)
    });

    const resposta = await res.json();

    if (res.ok) {
      document.getElementById('formReserva').classList.add('d-none');
      document.getElementById('confirmacaoReserva').classList.remove('d-none');
      document.getElementById('emailConfirmacao').innerText = email;
      document.getElementById('detalhesReserva').innerHTML = `
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Check-in:</strong> ${checkin}</p>
        <p><strong>Check-out:</strong> ${checkout}</p>
        <p><strong>Hóspedes:</strong> ${hospedes}</p>
        <p><strong>Quarto:</strong> ${IDQuarto}</p>
      `;
    } else {
      alert('Erro ao salvar reserva: ' + (resposta?.error || 'Erro desconhecido'));
    }
  } catch (err) {
    console.error('Erro geral:', err);
    alert('Erro ao registrar reserva.');
  }
});