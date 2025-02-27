document.addEventListener("DOMContentLoaded", async () => {
    const listaParticipantes = document.getElementById("listaParticipantes");
    const urlParams = new URLSearchParams(window.location.search);
    const partidaId = urlParams.get("id");

    // Verifique se o 'partidaId' existe
    if (!partidaId) {
        alert("ID da partida não encontrado na URL.");
        return;  // Impede o carregamento dos participantes
    }

    // Função para carregar participantes
    async function carregarParticipantes() {
        const response = await fetch(`http://localhost:3000/partidas/${partidaId}/participantes`);
        if (response.ok) {
            const participantes = await response.json();
            listaParticipantes.innerHTML = "";  // Limpando a lista

            if (participantes.length === 0) {
                listaParticipantes.innerHTML = "<li>Nenhum participante encontrado.</li>";
            }

            participantes.forEach(p => {
                const participanteDiv = document.createElement("li");
                participanteDiv.innerHTML = `
                    <div id="InfPrt">${p.nome} - ${p.telefone}</div>
                    <button class="presenca ${p.presente ? 'confirmado' : ''}" data-id="${p.id}">
                        ${p.presente ? "Presente" : "Confirmar Presença"}
                    </button>
                    <button class="remover" data-id="${p.id}">Remover</button>
                `;
                listaParticipantes.appendChild(participanteDiv);

                // Adicionando evento de click para confirmar presença
                participanteDiv.querySelector(".presenca").addEventListener("click", () => confirmarPresenca(p.id, participanteDiv.querySelector(".presenca")));

                // Adicionando evento de click para remover participante
                participanteDiv.querySelector(".remover").addEventListener("click", () => removerParticipante(p.id, participanteDiv));
            });
        } else {
            alert("Erro ao carregar participantes.");
        }
    }

    // Função para confirmar presença
    async function confirmarPresenca(participanteId, botao) {
        const response = await fetch(`http://localhost:3000/partidas/${partidaId}/participantes/${participanteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            const data = await response.json();
            botao.classList.toggle("confirmado", data.presente);
            botao.textContent = data.presente ? "Presente" : "Confirmar Presença";
        } else {
            alert("Erro ao confirmar presença.");
        }
    }

    // Função para remover participante
    async function removerParticipante(participanteId, participanteDiv) {
        const response = await fetch(`http://localhost:3000/partidas/${partidaId}/participantes/${participanteId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            participanteDiv.remove();  // Remove o participante da lista no frontend
        } else {
            alert("Erro ao remover participante.");
        }
    }

    // Carregando os participantes assim que a página carrega
    carregarParticipantes();
});
