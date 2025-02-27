const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;
const DB_FILE = "partidas.json";

app.use(express.json());
app.use(cors());

// Função para carregar partidas do arquivo JSON
function carregarPartidas() {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

// Função para salvar partidas no arquivo JSON
function salvarPartidas(partidas) {
    fs.writeFileSync(DB_FILE, JSON.stringify(partidas, null, 2));
}

app.get("/partidas", (req, res) => {
    res.json(carregarPartidas());
});

// Rota para adicionar uma nova partida
app.post("/partidas", (req, res) => {
    const partidas = carregarPartidas();
    const novaPartida = { id: Date.now(), ...req.body, participantes: [] };
    partidas.push(novaPartida);
    salvarPartidas(partidas);
    res.status(201).json(novaPartida);
});

// Rota para adicionar participante com nome e telefone
app.post("/partidas/:id/participantes", (req, res) => {
    const partidas = carregarPartidas();
    const partida = partidas.find(p => p.id == req.params.id);
    if (!partida) return res.status(404).send("Partida não encontrada.");

    const { nome, telefone } = req.body;

    // Validar se nome e telefone foram fornecidos
    if (!nome || !telefone) {
        return res.status(400).send("Nome e telefone são obrigatórios.");
    }

    // Adicionar novo participante com nome, telefone e presença (inicialmente false)
    const novoParticipante = { id: Date.now(), nome, telefone, presente: false };
    partida.participantes.push(novoParticipante);

    salvarPartidas(partidas);
    res.status(201).json(novoParticipante);
});

// Rota para carregar participantes de uma partida específica
app.get("/partidas/:id/participantes", (req, res) => {
    const partida = carregarPartidas().find(p => p.id == req.params.id);
    res.json(partida ? partida.participantes : []);
});

// Rota para confirmar presença de um participante
app.patch("/partidas/:id/participantes/:partId", (req, res) => {
    const partidas = carregarPartidas();
    const partida = partidas.find(p => p.id == req.params.id);
    if (!partida) return res.status(404).send("Partida não encontrada.");

    const participante = partida.participantes.find(p => p.id == req.params.partId);
    if (!participante) return res.status(404).send("Participante não encontrado.");

    participante.presente = !participante.presente;
    salvarPartidas(partidas);
    res.json(participante);
});

// Rota para remover participante de uma partida
app.delete("/partidas/:id/participantes/:partId", (req, res) => {
    const partidas = carregarPartidas();
    const partida = partidas.find(p => p.id == req.params.id);
    if (!partida) return res.status(404).send("Partida não encontrada.");

    const participanteIndex = partida.participantes.findIndex(p => p.id == req.params.partId);
    if (participanteIndex === -1) return res.status(404).send("Participante não encontrado.");

    partida.participantes.splice(participanteIndex, 1);
    salvarPartidas(partidas);
    res.status(204).send();
});

// Rota para excluir uma partida
app.delete("/partidas/:id", (req, res) => {
    let partidas = carregarPartidas();
    partidas = partidas.filter(p => p.id != req.params.id);
    salvarPartidas(partidas);
    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
