import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exercisesDB = {
  Peito: [
    "Supino Reto", "Crucifixo",
    "Supino Máquina Reto", "Supino Máquina Inclinado", "Supino Máquina Declinado",
    "Mergulho / Paralela", "Cross-over Baixo", "Voador",
    "Supino Inclinado com Halteres", "Supino Inclinado na Barra", 
    "Supino Reto com Halteres", "Supino Reto com Barra", 
    "Crucifixo Inclinado", "Crucifixo Reto", 
    "Cross-over Alto", "Supino Inclinado no Smith", "Supino Reto no Smith"
  ],
  Costas: [
    "Barra Fixa", "Remada Curvada", "Pulldown",
    "Remada Articulada", "Pull Around", "Puxador Frontal com Pegada Triângulo",
    "T Row", "Remada Baixa",
    "Remada Curvada com Peito Apoiado no Banco", "Remada Serrote", 
    "Puxador Frontal com Pegada Pronada", "Puxador Frontal com Supinada", 
    "High-row Supinado", "High-row Neutro", "Low-Row", 
    "Puxada Alta Articulada", "Pullover Máquina"
  ],
  Ombro: [
    "Elevação Lateral Halter", "Elevação Lateral Polia", "Elevação Frontal",
    "Desenvolvimento", "Face Pull", "Crucifixo Invertido",
    "Desenvolvimento Smith", "Desenvolvimento Halter", 
    "Desenvolvimento Máquina", "Voador Invertido", 
    "Elevação Frontal Polia Baixa", "Crucifixo Invertido na Polia", 
    "Remada Alta"
  ],
  Bíceps: [
    "Rosca Scott", "Rosca Bayesian", "Rosca Banco 45",
    "Rosca Direta", "Rosca Martelo", "Rosca Alternada", 
    "Rosca Concentrada"
  ],
  Tríceps: [
    "Tríceps Francês Polia", "Tríceps Testa Polia", "Tríceps Corda",
    "Tríceps Carter", "Tríceps Unilateral na Polia Alta", "Paralela"
  ],
  Quadríceps: [
    "Hack 45", "Leg 45", "Agachamento Livre", "Agachamento Smith",
    "Agachamento Máquina Articulada", "Cadeira Extensora",
    "Afundo", "Afundo Búlgaro", "Leg Press Horizontal", 
    "Flexão Nórdica Reversa", "Agachamento Pêndulo"
  ],
  Isquiotibiais: [
    "Mesa Flexora", "Cadeira Flexora", "Stiff"
  ],
  Panturrilha: [
    "Panturrilha em Pé Máquina", "Panturrilha Leg Horizontal", 
    "Panturrilha Sentado Máquina", "Panturrilha no Leg Press", 
    "Panturrilha em Pé no Smith"
  ],
  Glúteos: [
    "Elevação Pélvica", "Búlgaro", "Cadeira Abdutora", 
    "Glúteo na Polia"
  ]
};

export default function TreinoApp() {
  const [treinos, setTreinos] = useState([{ 
    nome: "Treino A", 
    musculosAlvo: "MMSS", 
    exercicios: [], 
    tempoAerobico: 0 
  }]);
  const [grupoSelecionado, setGrupoSelecionado] = useState("");
  const [exercicioSelecionado, setExercicioSelecionado] = useState("");
  const [series, setSeries] = useState("");
  const [reps, setReps] = useState("");
  const [metodo, setMetodo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [treinoAtual, setTreinoAtual] = useState(0);

  const gruposMusculares = Object.keys(exercisesDB);
  const opcoesMusculosAlvo = ["MMSS", "MMII", "MMII e MMSS"];

  const adicionarExercicio = () => {
    if (series > 0 && reps && exercicioSelecionado && grupoSelecionado) {
      const novosTreinos = [...treinos];
      novosTreinos[treinoAtual].exercicios.push({ 
        nome: exercicioSelecionado, 
        grupo: grupoSelecionado, 
        series, 
        reps, 
        metodo, 
        observacao 
      });
      setTreinos(novosTreinos);
      resetarCamposExercicio();
    }
  };

  const resetarCamposExercicio = () => {
    setSeries("");
    setReps("");
    setExercicioSelecionado("");
    setMetodo("");
    setObservacao("");
  };

  const removerExercicio = (index) => {
    const novosTreinos = [...treinos];
    novosTreinos[treinoAtual].exercicios.splice(index, 1);
    setTreinos(novosTreinos);
  };

  const adicionarTreino = () => {
    setTreinos([...treinos, { 
      nome: `Treino ${String.fromCharCode(65 + treinos.length)}`, 
      musculosAlvo: "MMSS", 
      exercicios: [], 
      tempoAerobico: 0 
    }]);
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    let startY = 10;
  
    treinos.forEach((treino, treinoIndex) => {
      doc.setFontSize(10);
      doc.text(`Treino – ${treino.nome}`, 14, startY);
      doc.text(`Músculos alvo: ${treino.musculosAlvo}.`, 14, startY + 6);
      if (parseInt(treino.tempoAerobico) > 0) {
        doc.text(`Treino aeróbico: ${treino.tempoAerobico} minutos de aeróbico contínuo pós treino ou em outro horário.`, 14, startY + 12);
        doc.setFillColor(0, 0, 0);
        doc.setTextColor(255, 255, 255);
        doc.rect(14, startY + 16, 182, 6, 'F');
        doc.text("Aquecimento: Ler sugestão apresentada abaixo.", 16, startY + 20);
        doc.setTextColor(0, 0, 0);
        startY += 24;

      } else {
        doc.setFillColor(0, 0, 0);
        doc.setTextColor(255, 255, 255);
        doc.rect(14, startY + 12, 182, 6, 'F');
        doc.text("Aquecimento: Ler sugestão apresentada abaixo.", 16, startY + 16);
        doc.setTextColor(0, 0, 0);
 
        startY += 18;
      }
    
      autoTable(doc, {
        startY: startY,
        head: [["ORDEM DOS EXERCÍCIOS", "NOME DOS EXERCÍCIOS", "SÉRIES", "REPETIÇÕES", "MÉTODO DE TREINAMENTO", "OBSERVAÇÕES"]],
        body: treino.exercicios.map((ex, index) => [
          index + 1,
          ex.nome,
          ex.series,
          ex.reps,
          ex.metodo,
          ex.observacao
        ]),
        theme: 'grid',
      });

      startY = doc.lastAutoTable.finalY + 10;

      if (treinoIndex < treinos.length - 1) {
        doc.addPage();
        startY = 10;
      }
    });
  doc.addPage();
  resumirVolumeGruposMusculares(doc, startY);
  doc.save("treinos.pdf");
};

const resumirVolumeGruposMusculares = (doc, startY) => {
  const volumeTotal = calcularTotalSeries();
  
  doc.setFontSize(12);
  doc.text("Resumo de Volume por Grupo Muscular", 14, startY);
  startY += 10;

  autoTable(doc, {
    startY: startY,
    head: [["Grupo Muscular", "Volume Total (Séries)"]],
    body: Object.entries(volumeTotal).map(([grupo, volume]) => [grupo, volume]),
    theme: 'grid',
  });
};

const calcularTotalSeries = () => {
  const totalSeriesPorGrupo = {};

  treinos.forEach((treino) => {
    treino.exercicios.forEach((exercicio) => {
      const grupo = exercicio.grupo;
      const series = Number(exercicio.series);

      totalSeriesPorGrupo[grupo] = (totalSeriesPorGrupo[grupo] || 0) + series;
    });
  });

  return totalSeriesPorGrupo;
};

return (
  <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
    {/* Título */}
    <h1 className="text-xl font-bold text-gray-800">Montar Treino</h1>

    {/* Botões para adicionar treino e gerar PDF */}
    <div className="mt-4 flex gap-2">
      <button
        onClick={adicionarTreino}
        className="bg-green-500 text-white p-2 rounded flex-1"
      >
        Adicionar Treino
      </button>
      <button
        onClick={gerarPDF}
        className="bg-blue-500 text-white p-2 rounded flex-1"
      >
        Gerar PDF
      </button>
    </div>

    {/* Selecionar Treino */}
    <div className="mt-4">
      <label className="text-gray-800">Selecionar Treino:</label>
      <select
        value={treinoAtual}
        onChange={(e) => setTreinoAtual(Number(e.target.value))}
        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      >
        {treinos.map((treino, index) => (
          <option key={index} value={index}>
            {treino.nome}
          </option>
        ))}
      </select>
    </div>

    {/* Músculos Alvo */}
    <div className="mt-4">
      <label className="text-gray-800">Músculos Alvo:</label>
      <select
        value={treinos[treinoAtual].musculosAlvo}
        onChange={(e) => {
          const novosTreinos = [...treinos];
          novosTreinos[treinoAtual].musculosAlvo = e.target.value;
          setTreinos(novosTreinos);
        }}
        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      >
        {opcoesMusculosAlvo.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>
    </div>

    {/* Tempo de Aeróbico */}
    <div className="mt-4">
      <label className="text-gray-800">Tempo de Aeróbico (minutos):</label>
      <input
        type="number"
        value={treinos[treinoAtual].tempoAerobico}
        onChange={(e) => {
          const novosTreinos = [...treinos];
          novosTreinos[treinoAtual].tempoAerobico = e.target.value;
          setTreinos(novosTreinos);
        }}
        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      />
    </div>

    {/* Grupo Muscular */}
    <div className="mt-4">
      <label className="text-gray-800">Grupo Muscular:</label>
      <select
        value={grupoSelecionado}
        onChange={(e) => setGrupoSelecionado(e.target.value)}
        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      >
        <option value="">Selecione um grupo</option>
        {gruposMusculares.map((grupo) => (
          <option key={grupo} value={grupo}>
            {grupo}
          </option>
        ))}
      </select>
    </div>

    {/* Exercício */}
    <div className="mt-4">
      <label className="text-gray-800">Exercício:</label>
      <select
        value={exercicioSelecionado}
        onChange={(e) => setExercicioSelecionado(e.target.value)}
        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      >
        <option value="">Selecione um exercício</option>
        {grupoSelecionado &&
          exercisesDB[grupoSelecionado].map((exercicio) => (
            <option key={exercicio} value={exercicio}>
              {exercicio}
            </option>
          ))}
      </select>
    </div>

    {/* Séries */}
    <div className="mt-4">
      <label className="text-gray-800">Séries:</label>
      <input
        type="number"
        value={series}
        onChange={(e) => setSeries(e.target.value)}
 className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      />
    </div>

    {/* Repetições */}
    <div className="mt-4">
      <label className="text-gray-800">Repetições:</label>
      <input
        type="text"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      />
    </div>

    {/* Método */}
    <div className="mt-4">
      <label className="text-gray-800">Método:</label>
      <input
        type="text"
        value={metodo}
        onChange={(e) => setMetodo(e.target.value)}
        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      />
    </div>

    {/* Observação */}
    <div className="mt-4">
      <label className="text-gray-800">Observação:</label>
      <input
        type="text"
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      />
    </div>

    {/* Botão para adicionar exercício */}
    <button
      onClick={adicionarExercicio}
      className="mt-4 bg-yellow-500 text-white p-2 rounded"
    >
      Adicionar Exercício
    </button>

    {/* Lista de Exercícios */}
    <div className="mt-4">
      <h2 className="text-black font-bold text-black-800">Exercícios</h2>
      <ul className="divide-y divide-gray-200">
        {treinos[treinoAtual].exercicios.map((ex, index) => (
          <li
            key={index}
            className="mt-2 p-2 flex justify-between items-center bg-gray-100 border border-gray-300 rounded text-gray-900"
          >
            <span className="font-medium">
              {ex.nome} - {ex.series} séries de {ex.reps} repetições
            </span>
            <button
              onClick={() => removerExercicio(index)}
              className="bg-red-500 text-white p-1 rounded"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>

    {/* Volume Total por Agrupamento Muscular */}
    <div className="mt-6">
      <h2 className="text-lg font-bold text-gray-800">
        Volume Total por Agrupamento Muscular
      </h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grupo Muscular
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Número Total de Séries
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(calcularTotalSeries()).map(([grupo, total]) => (
            <tr key={grupo}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {grupo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {total || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);}