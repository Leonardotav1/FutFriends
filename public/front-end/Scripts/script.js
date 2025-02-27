const apiUrl = "http://localhost:3000/partidas";

document.addEventListener("DOMContentLoaded", () => {
    const formPartida = document.getElementById("formPartida");
    const listaPartidas = document.getElementById("listaPartidas");

    async function carregarPartidas() {
        const response = await fetch(apiUrl);
        const partidas = await response.json();
        listaPartidas.innerHTML = "";
        partidas.forEach(partida => exibirPartida(partida));
    }

    function exibirPartida(partida) {
        const partidaDiv = document.createElement("div");
        partidaDiv.innerHTML = `
            <strong>${partida.titulo}</strong> - ${partida.local} - ${new Date(partida.dataHora).toLocaleString()}<br>
            <input type="text" placeholder="Adicionar participante" class="novoParticipante">
            <input type="text" placeholder="Telefone do participante" class="telefoneParticipante">
            <button class="btnAdicionar" data-id="${partida.id}">Adicionar</button>
            <button class="removerPartida" data-id="${partida.id}">Excluir Partida</button>
            <a class="btnParticip" href="participantes.html?id=${partida.id}">Ver Participantes</a>
        `;
        listaPartidas.appendChild(partidaDiv);

        partidaDiv.querySelector(".btnAdicionar").addEventListener("click", () => adicionarParticipante(partida.id, partidaDiv));
        partidaDiv.querySelector(".removerPartida").addEventListener("click", () => excluirPartida(partida.id));
    }

    async function adicionarParticipante(id, partidaDiv) {
        const nomeInput = partidaDiv.querySelector(".novoParticipante");
        const telefoneInput = partidaDiv.querySelector(".telefoneParticipante");
        const nome = nomeInput.value.trim();
        const telefone = telefoneInput.value.trim();

        if (nome && telefone) {
            await fetch(`${apiUrl}/${id}/participantes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, telefone })
            });
            nomeInput.value = "";
            telefoneInput.value = "";  // Limpar o campo de telefone
        } else {
            alert("Por favor, preencha tanto o nome quanto o telefone.");
        }
    }

    async function excluirPartida(id) {
        await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        carregarPartidas();
    }

    formPartida.addEventListener("submit", async (event) => {
        event.preventDefault();
        const titulo = document.getElementById("titulo").value;
        const local = document.getElementById("local").value;
        const dataHora = document.getElementById("dataHora").value;
        await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ titulo, local, dataHora })
        });
        formPartida.reset();
        carregarPartidas();
    });

    carregarPartidas();
});