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
  const [treinos, setTreinos] = useState([{ nome: "Treino A", musculosAlvo: "MMSS", exercicios: [] }]);
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
    if (series > 0 && reps > 0 && exercicioSelecionado && grupoSelecionado) {
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
        setSeries("");
        setReps("");
        setExercicioSelecionado("");
        setMetodo("");
        setObservacao("");
    } 
};

  const removerExercicio = (index) => {
    const novosTreinos = [...treinos];
    novosTreinos[treinoAtual].exercicios.splice(index, 1);
    setTreinos(novosTreinos);
  };

  const adicionarTreino = () => {
    setTreinos([...treinos, { nome: `Treino ${String.fromCharCode(65 + treinos.length)}`, musculosAlvo: "MMSS", exercicios: [] }]);
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    let startY = 10;
  
    treinos.forEach((treino, treinoIndex) => {
      doc.setFontSize(10);
      doc.text(`Treino – ${treino.nome}`, 14, startY);
      doc.text(`Músculos alvo: ${treino.musculosAlvo}.`, 14, startY + 6);
      doc.text("Treino aeróbico: 40 minutos de aeróbico contínuo pós treino ou em outro horário.", 14, startY + 12);
      doc.setFillColor(0, 0, 0);
      doc.setTextColor(255, 255, 255);
      doc.rect(14, startY + 16, 182, 6, 'F');
      doc.text("Aquecimento: Ler sugestão apresentada abaixo.", 16, startY + 20);
      doc.setTextColor(0, 0, 0);
  
      autoTable(doc, {
        startY: startY + 24,
        head: [
          ["ORDEM DOS EXERCÍCIOS", "NOME DOS EXERCÍCIOS", "SÉRIES", "REPETIÇÕES", "MÉTODO DE TREINAMENTO", "OBSERVAÇÕES"]
        ],
        body: treino.exercicios.map((ex, index) => [
          index + 1,
          ex.nome,
          ex.series,
          ex.reps,
          ex.metodo,
          ex.observacao
        ]),
        theme: 'grid',
        headStyles: { fillColor: [183, 28, 28], textColor: [255, 255, 255] },
        styles: { cellPadding: 2, fontSize: 10 },
      });
  
      startY = doc.lastAutoTable.finalY + 10;
  
      if (treinoIndex < treinos.length - 1) {
        doc.addPage();
        startY = 10;
      }
    });
  
    // 🔥 **ADICIONE ESTA PARTE PARA O RESUMO DO VOLUME TOTAL**
    doc.addPage(); // Adiciona uma nova página para o resumo
    startY = 10;
    doc.setFontSize(12);
    doc.text("Resumo de Volume por Grupo Muscular", 14, startY);
    startY += 10;
  
    // Calcula volume total por grupo muscular
    const volumeTotal = {};
    treinos.forEach(treino => {
      treino.exercicios.forEach(ex => {
        if (!volumeTotal[ex.grupo]) {
          volumeTotal[ex.grupo] = 0;
        }
        volumeTotal[ex.grupo] += parseInt(ex.series, 10);
      });
    });
  
    // Gera a tabela do resumo
    autoTable(doc, {
      startY: startY,
      head: [["Grupo Muscular", "Volume Total (Séries)"]],
      body: Object.entries(volumeTotal).map(([grupo, volume]) => [grupo, volume]),
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 255], textColor: [255, 255, 255] },
      styles: { cellPadding: 2, fontSize: 10 },
    });
  
    doc.save("treinos.pdf");
  };
  

  const calcularTotalSeries = () => {
    const totalSeriesPorGrupo = {};

    treinos.forEach((treino) => {
      treino.exercicios.forEach((exercicio) => {
        const grupo = exercicio.grupo;
        const series = Number(exercicio.series);

        if (!totalSeriesPorGrupo[grupo]) {
          totalSeriesPorGrupo[grupo] = 0;
        }
        totalSeriesPorGrupo[grupo] += series;
      });
    });

    return totalSeriesPorGrupo;
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h1 className="text-xl font-bold text-gray-800">Montar Treino</h1>
      <button onClick={adicionarTreino} className="mt-4 bg-green-500 text-white p-2 rounded">Adicionar Treino</button>
      <button onClick={gerarPDF} className="mt-4 bg-blue-500 text-white p-2 rounded ml-2">Gerar PDF</button>
      <div className="mt-4">
        <label className="text-gray-800">Selecionar Treino:</label>
        <select value={treinoAtual} onChange={(e) => setTreinoAtual(Number(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800">
          {treinos.map((treino, index) => (
            <option key={index} value={index}>{treino.nome}</option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="text-gray-800">Músculos Alvo:</label>
        <select value={treinos[treinoAtual].musculosAlvo} onChange={(e) => {
          const novosTreinos = [...treinos];
          novosTreinos[treinoAtual].musculosAlvo = e.target.value;
          setTreinos(novosTreinos);
        }} className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800">
          {opcoesMusculosAlvo.map((opcao) => (
            <option key={opcao} value={opcao}>{opcao}</option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="text-gray-800">Grupo Muscular:</label>
        <select value={grupoSelecionado} onChange={(e) => setGrupoSelecionado(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800">
          <option value="">Selecione um grupo</option>
          {gruposMusculares.map((grupo) => (
            <option key={grupo} value={grupo}>{grupo}</option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="text-gray-800">Exercício:</label>
        <select value={exercicioSelecionado} onChange={(e) => setExercicioSelecionado(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800">
          <option value="">Selecione um exercício</option>
          {grupoSelecionado && exercisesDB[grupoSelecionado].map((exercicio) => (
            <option key={exercicio} value={exercicio}>{exercicio}</option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="text-gray-800">Séries:</label>
        <input type="number" value={series} onChange={(e) => setSeries(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800" />
      </div>
      <div className="mt-4">
        <label className="text-gray-800">Repetições:</label>
        <input
          type="text" // Mudei de "number" para "text"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
        />
      </div>
      <div className="mt-4">
        <label className="text-gray-800">Método:</label>
        <input type="text" value={metodo} onChange={(e) => setMetodo(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800" />
      </div>
      <div className="mt-4">
        <label className="text-gray-800">Observação:</label>
        <input type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800" />
      </div>
      <button onClick={adicionarExercicio} className="mt-4 bg-yellow-500 text-white p-2 rounded">Adicionar Exercício</button>
      <div className="mt-4">
        <h2 className="text-black font-bold text-black-800">Exercícios</h2>
        <ul>
          {treinos[treinoAtual].exercicios.map((ex, index) => (
            <li key={index} className="mt-2 flex justify-between items-center">
              <span>{ex.nome} - {ex.series} séries de {ex.reps} repetições</span>
              <button onClick={() => removerExercicio(index)} className="bg-red-500 text-white p-1 rounded">Remover</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-bold text-gray-800">Volume Total por Agrupamento Muscular</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo Muscular</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número Total de Séries</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(calcularTotalSeries()).map(([grupo, total]) => (
              <tr key={grupo}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grupo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{total || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}