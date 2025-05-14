async function enviarParaBackend(dados) {
  // Simulação
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Dados enviados:", dados);
      localStorage.setItem("reservaTemp", JSON.stringify(dados));
      resolve({ status: "success" });
    }, 1000);
  });
}

// Evento de envio do formulário
document
  .getElementById("formReserva")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
      this.classList.add("was-validated");
      return;
    }

    const dadosReserva = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      telefone: document.getElementById("telefone").value,
      hospedes: document.getElementById("hospedes").value,
      checkin: document.getElementById("checkin").value,
      checkout: document.getElementById("checkout").value,
      dataRegistro: new Date().toISOString(),
    };

    try {
      // Envio para o back-end
      const resposta = await enviarParaBackend(dadosReserva);

      if (resposta.status === "success") {
        // Mostrar confirmação
        document.getElementById("detalhesReserva").innerHTML = `
                <p><strong>Nome:</strong> ${dadosReserva.nome}</p>
                <p><strong>Check-in:</strong> ${new Date(
                  dadosReserva.checkin
                ).toLocaleDateString("pt-BR")}</p>
                <p><strong>Check-out:</strong> ${new Date(
                  dadosReserva.checkout
                ).toLocaleDateString("pt-BR")}</p>
                <p><strong>Hóspedes:</strong> ${dadosReserva.hospedes}</p>
            `;

        document.getElementById("emailConfirmacao").textContent =
          dadosReserva.email;
        document
          .getElementById("confirmacaoReserva")
          .classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: "smooth" });

        this.reset();
        this.classList.remove("was-validated");
      }
    } catch (erro) {
      alert("Erro ao enviar reserva. Tente novamente.");
      console.error("Erro:", erro);
    }
  });

// Validação de telefone
document.getElementById("telefone").addEventListener("input", function (e) {
  const regex = /^\(?\d{2}\)?[\s-]?9?\d{4}-?\d{4}$/;
  if (!regex.test(this.value)) {
    this.setCustomValidity("Formato inválido! Use (99) 99999-9999");
  } else {
    this.setCustomValidity("");
  }
});

// Validação de datas
document.getElementById("checkout").addEventListener("change", function () {
  const checkin = new Date(document.getElementById("checkin").value);
  const checkout = new Date(this.value);

  if (checkout <= checkin) {
    this.setCustomValidity("Check-out deve ser posterior ao Check-in");
  } else {
    this.setCustomValidity("");
  }
});
