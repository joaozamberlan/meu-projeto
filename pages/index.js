import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exercisesDB = {
  Peito: [
    "Supino Reto", "Supino Reto Articulado", "Supino Inclinado Articulado", "Supino Declinado Articulado",
    "Mergulho / Paralela", "Cross-over Baixo", "Voador",
    "Supino Inclinado com Halteres", "Supino Inclinado na Barra", 
    "Supino Reto com Halteres", "Supino Reto com Barra", 
    "Crucifixo Inclinado", "Crucifixo Reto", 
    "Cross-over Alto", "Supino Inclinado no Smith", "Supino Reto no Smith"
  ],
  Costas: [
    "Barra Fixa", "Remada Curvada", "Pulldown",
    "Remada Articulada", "Pull Around", "Puxador Frontal com Pegada Triângulo",
    "T-Bar Row", "Remada Baixa",
    "Remada Curvada com Peito Apoiado no Banco", "Remada Serrote", 
    "Puxador Frontal com Pegada Pronada", "Puxador Frontal com Pegada Supinada", 
    "High-row Supinado", "High-row Neutro", "Low-Row", 
    "Puxada Alta Articulada", "Pullover Máquina"
  ],
  Ombro: [
    "Elevação Lateral com Halteres", "Elevação Lateral na Polia Baixa", "Elevação Lateral na Polia Média",
    "Elevação Frontal com Halteres", "Elevação Frontal na Polia Baixa", 
    "Desenvolvimento com Halteres", "Desenvolvimento no Smith", "Desenvolvimento na Máquina", 
    "Face Pull", "Crucifixo Invertido com Halteres", 
    "Voador Invertido"
  ],
  Bíceps: [
    "Rosca Scott","Rosca Scott unilateral com halter", "Rosca Bayesian", "Rosca Banco 45°",
    "Rosca Direta com barra", "Rosca Martelo com Halteres", "Rosca Alternada", 
    "Rosca Concentrada", "Rosca Martelo na Polia"
  ],
  Tríceps: [
    "Tríceps Francês na Polia", "Tríceps Testa na Polia", "Tríceps Corda",
    "Tríceps Carter", "Tríceps Unilateral na Polia Alta", "Paralela"
  ],
  Quadríceps: [
    "Hack 45°", "Leg Press 45°", "Agachamento Livre", "Agachamento no Smith",
    "Agachamento Máquina Articulada", "Cadeira Extensora",
    "Afundo", "Agachamento Búlgaro", "Leg Press Horizontal", 
    "Flexão Nórdica Reversa", "Agachamento Pêndulo"
  ],
  Isquiotibiais: [
    "Mesa Flexora", "Cadeira Flexora", "Stiff",
    "Levantamento Terra", "Agachamento Sumo", "Bom Dia"
  ],
  Panturrilha: [
    "Panturrilha em Pé na Máquina", "Panturrilha no Leg Press Horizontal", 
    "Panturrilha Sentado na Máquina", "Panturrilha no Leg Press 45°", 
    "Panturrilha em Pé no Smith"
  ],
  Glúteos: [
    "Elevação Pélvica", "Agachamento Búlgaro", "Cadeira Abdutora", 
    "Glúteo na Polia baixa"
  ]
};

for (const group in exercisesDB) {
  exercisesDB[group].sort((a, b) => a.localeCompare(b));
}

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
  
  // Estados para edição de exercícios
  const [modoEdicao, setModoEdicao] = useState(false);
  const [exercicioEditando, setExercicioEditando] = useState(null);
  const [indexEditando, setIndexEditando] = useState(null);
  
  // Estado para feedback visual (pop-up)
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // success, error, info

  const gruposMusculares = Object.keys(exercisesDB);
  const opcoesMusculosAlvo = ["MMSS", "MMII", "MMII e MMSS"];

  // Função para mostrar notificação
  const mostrarNotificacao = (mensagem, tipo = "success") => {
    setNotificationMessage(mensagem);
    setNotificationType(tipo);
    setShowNotification(true);
    
    // Auto-hide após 3 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 1500);
  };

  // Fechar notificação manualmente
  const fecharNotificacao = () => {
    setShowNotification(false);
  };
  
  const [exercicioCustom, setExercicioCustom] = useState("");
  const adicionarExercicio = () => {
    if (series > 0 && reps && grupoSelecionado) {
      const nomeExercicio = exercicioSelecionado === "customExercise" ? exercicioCustom : exercicioSelecionado;
      
      if (!nomeExercicio) {
        mostrarNotificacao("Informe o nome do exercício", "error");
        return;
      }
      
      const novosTreinos = [...treinos];
      novosTreinos[treinoAtual].exercicios.push({ 
        nome: nomeExercicio, 
        grupo: grupoSelecionado, 
        series, 
        reps, 
        metodo, 
        observacao 
      });
      setTreinos(novosTreinos);
      resetarCamposExercicio();
      mostrarNotificacao(`Exercício "${nomeExercicio}" adicionado com sucesso!`);
    } else {
      mostrarNotificacao("Preencha todos os campos obrigatórios", "error");
    }
  };

  const resetarCamposExercicio = () => {
    setSeries("");
    setReps("");
    setExercicioSelecionado("");
    setExercicioCustom("");
    setMetodo("");
    setObservacao("");
    setGrupoSelecionado("");
  };

  const adicionarTreino = () => {
    const novoTreino = { 
      nome: `Treino ${String.fromCharCode(65 + treinos.length)}`, 
      musculosAlvo: "MMSS", 
      exercicios: [], 
      tempoAerobico: 0 
    };
    
    setTreinos([...treinos, novoTreino]);
    mostrarNotificacao(`${novoTreino.nome} adicionado com sucesso!`);
    
    // Opcionalmente, trocar para o novo treino automaticamente
    setTreinoAtual(treinos.length);
  };
  
  // Função para remover treino
  const removerTreino = () => {
    if (treinos.length <= 1) {
      mostrarNotificacao("Não é possível remover o único treino existente", "error");
      return;
    }
    
    const nomeTreino = treinos[treinoAtual].nome;
    const novosTreinos = [...treinos];
    novosTreinos.splice(treinoAtual, 1);
    
    // Renomear os treinos restantes para manter a ordem alfabética
    novosTreinos.forEach((treino, index) => {
      treino.nome = `Treino ${String.fromCharCode(65 + index)}`;
    });
    
    setTreinos(novosTreinos);
    
    // Ajustar o índice do treino atual se necessário
    if (treinoAtual >= novosTreinos.length) {
      setTreinoAtual(novosTreinos.length - 1);
    }
    
    mostrarNotificacao(`${nomeTreino} removido com sucesso!`);
  };

  // Funções para reordenar exercícios
  const moverExercicioParaCima = (index) => {
    if (index === 0) return; // Não pode mover o primeiro item para cima
    
    const novosTreinos = [...treinos];
    const treinoAtualObj = novosTreinos[treinoAtual];
    
    // Troca o exercício com o anterior
    [treinoAtualObj.exercicios[index], treinoAtualObj.exercicios[index - 1]] = 
    [treinoAtualObj.exercicios[index - 1], treinoAtualObj.exercicios[index]];
    
    setTreinos(novosTreinos);
  };

  const moverExercicioParaBaixo = (index) => {
    const exercicios = treinos[treinoAtual].exercicios;
    if (index === exercicios.length - 1) return; // Não pode mover o último item para baixo
    
    const novosTreinos = [...treinos];
    const treinoAtualObj = novosTreinos[treinoAtual];
    
    // Troca o exercício com o próximo
    [treinoAtualObj.exercicios[index], treinoAtualObj.exercicios[index + 1]] = 
    [treinoAtualObj.exercicios[index + 1], treinoAtualObj.exercicios[index]];
    
    setTreinos(novosTreinos);
  };

  // Funções para edição de exercícios
  const iniciarEdicaoExercicio = (exercicio, index) => {
    setExercicioEditando({...exercicio});
    setIndexEditando(index);
    setGrupoSelecionado(exercicio.grupo);
    setExercicioSelecionado(exercicio.nome);
    setSeries(exercicio.series);
    setReps(exercicio.reps);
    setMetodo(exercicio.metodo);
    setObservacao(exercicio.observacao);
    setModoEdicao(true);
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    setExercicioEditando(null);
    setIndexEditando(null);
    resetarCamposExercicio();
  };

  const salvarEdicaoExercicio = () => {
    if (series > 0 && reps && exercicioSelecionado && grupoSelecionado) {
      const novosTreinos = [...treinos];
      novosTreinos[treinoAtual].exercicios[indexEditando] = {
        nome: exercicioSelecionado,
        grupo: grupoSelecionado,
        series,
        reps,
        metodo,
        observacao
      };
      
      setTreinos(novosTreinos);
      setModoEdicao(false);
      setExercicioEditando(null);
      setIndexEditando(null);
      resetarCamposExercicio();
      mostrarNotificacao("Exercício atualizado com sucesso!");
    } else {
      mostrarNotificacao("Preencha todos os campos obrigatórios", "error");
    }
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    let startY = 10;
  
    treinos.forEach((treino, treinoIndex) => {
      doc.setFontSize(10);
      doc.text(`Treino – ${treino.nome}`, 14, startY);
      doc.text(`Músculos alvo: ${treino.musculosAlvo}.`, 14, startY + 6);

      if (parseInt(treino.tempoAerobico) > 0) {
      doc.text(`Treino aeróbico: ${treino.tempoAerobico} minutos de aeróbico contínuo pós treino ou em outro horário.`, 14, startY + 14);
      
      // Caixa de aquecimento com cores mais suaves
      doc.setFillColor(240, 240, 245); // Cinza bem claro
      doc.setDrawColor(100, 100, 100); // Borda cinza escuro
      doc.rect(14, startY + 18, 182, 8, 'FD'); // Desenha retângulo preenchido com borda
      doc.setTextColor(50, 50, 50); // Texto escuro
      doc.setFont('helvetica', 'bold');
      doc.text("Aquecimento: Ler sugestão apresentada abaixo.", 16, startY + 24);
      doc.setFont('helvetica', 'normal');
      startY += 30;
    } else {
      // Caixa de aquecimento com cores mais suaves
      doc.setFillColor(240, 240, 245); // Cinza bem claro
      doc.setDrawColor(100, 100, 100); // Borda cinza escuro
      doc.rect(14, startY + 14, 182, 8, 'FD'); // Desenha retângulo preenchido com borda
      doc.setTextColor(50, 50, 50); // Texto escuro
      doc.setFont('helvetica', 'bold');
      doc.text("Aquecimento: Ler sugestão apresentada abaixo.", 16, startY + 20);
      doc.setFont('helvetica', 'normal');
      startY += 26;
    }
    
    autoTable(doc, {
      startY: startY,
      head: [["ORDEM", "EXERCÍCIO", "SÉRIES", "REPETIÇÕES", "MÉTODO", "OBSERVAÇÕES"]],
      body: treino.exercicios.map((ex, index) => [
        index + 1,
        ex.nome,
        ex.series,
        ex.reps,
        ex.metodo,
        ex.observacao
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [60, 90, 120], // Azul mais suave
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [240, 245, 250] // Linhas alternadas com azul bem claro
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 }, // Aumentando de 15 para 20
        1: { cellWidth: 'auto' }, // Coluna EXERCÍCIO com largura automática
        2: { halign: 'center', cellWidth: 20 }, // Coluna SÉRIES centralizada
        3: { halign: 'center', cellWidth: 30 }, // Coluna REPETIÇÕES centralizada
      },
      margin: { left: 14, right: 14 },
    });

    startY = doc.lastAutoTable.finalY + 15; // Mais espaço entre as tabelas

    if (treinoIndex < treinos.length - 1) {
      doc.addPage();
      startY = 20;
    }
  });
  
  doc.addPage();
  resumirVolumeGruposMusculares(doc);
  doc.save("plano_treino.pdf");
  mostrarNotificacao("PDF de treinos gerado com sucesso!");
};

const resumirVolumeGruposMusculares = (doc) => {
  const volumeTotal = calcularTotalSeries();
  const startY = 20;
  
  // Título da página de resumo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text("RESUMO DE VOLUME POR GRUPO MUSCULAR", 105, startY, { align: 'center' });
  
  // Adicionar uma linha horizontal abaixo do título
  doc.setDrawColor(100, 100, 100);
  doc.line(14, startY + 5, 196, startY + 5);
  

  autoTable(doc, {
    startY: startY + 25,
    head: [["Grupo Muscular", "Volume Total (Séries)"]],
    body: Object.entries(volumeTotal).map(([grupo, volume]) => [grupo, volume]),
    theme: 'grid',
    headStyles: {
      fillColor: [60, 90, 120],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [240, 245, 250]
    },
    columnStyles: {
      1: { halign: 'center' }
    },
    margin: { left: 45, right: 45 },
  });
  

  // Adicionar data de geração
  const dataAtual = new Date().toLocaleDateString();
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Plano de treino gerado em: ${dataAtual}`, 14, 280);
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
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded relative">
      {/* Notificação/Toast - Agora centralizada e mais discreta */}
      {showNotification && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className={`max-w-xs p-3 rounded shadow-md flex items-center 
      ${notificationType === "success" ? "bg-gray-100 border border-green-300 text-gray-800" : 
        notificationType === "error" ? "bg-gray-100 border border-red-300 text-gray-800" : 
        "bg-gray-100 border border-blue-300 text-gray-800"}`}>
      <span className={`mr-2 text-2xl 
        ${notificationType === "success" ? "text-green-500" : 
          notificationType === "error" ? "text-red-500" : "text-blue-500"}`}>
        {notificationType === "success" ? "✓" : 
         notificationType === "error" ? "✕" : "ℹ"}
      </span>
      <span className="flex-1 text-sm">{notificationMessage}</span>
      {/* Botão X removido */}
    </div>
  </div>
)}

      {/* Título */}
      <h1 className="text-xl font-bold text-gray-800">Montar Treino</h1>

      {/* Botões para adicionar treino, remover treino e gerar PDF */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={adicionarTreino}
          className="bg-green-500 text-white p-2 rounded flex-1 hover:bg-green-600 transition"
        >
          Adicionar Treino
        </button>
        <button
          onClick={removerTreino}
          className="bg-red-500 text-white p-2 rounded flex-1 hover:bg-red-600 transition"
        >
          Remover Treino
        </button>
        <button
          onClick={gerarPDF}
          className="bg-blue-500 text-white p-2 rounded flex-1 hover:bg-blue-600 transition"
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

      {/* Formulário de Exercício */}
      <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          {modoEdicao ? "Editar Exercício" : "Adicionar Novo Exercício"}
        </h2>

        {/* Grupo Muscular */}
        <div className="mt-2">
          <label className="text-gray-800">Grupo Muscular:</label>
          <select
            value={grupoSelecionado}
            onChange={(e) => {
              setGrupoSelecionado(e.target.value);
              setExercicioSelecionado("");
            }}
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
<div className="mt-2">
  <label className="text-gray-800">Exercício:</label>
  <select
    value={exercicioSelecionado}
    onChange={(e) => setExercicioSelecionado(e.target.value)}
    className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
    disabled={!grupoSelecionado}
  >
    <option value="">Selecione um exercício</option>
    {grupoSelecionado &&
      exercisesDB[grupoSelecionado].map((exercicio) => (
        <option key={exercicio} value={exercicio}>
          {exercicio}
        </option>
      ))}
    {grupoSelecionado && <option value="customExercise">Não está na lista?</option>}
  </select>
</div>

{/* Campo para exercício personalizado */}
{exercicioSelecionado === "customExercise" && (
  <div className="mt-2">
    <label className="text-gray-800">Digite o nome do exercício:</label>
    <input
      type="text"
      value={exercicioCustom}
      onChange={(e) => setExercicioCustom(e.target.value)}
      className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
      placeholder="Nome do exercício personalizado"
    />
  </div>
)}

        {/* Séries */}
        <div className="mt-2">
          <label className="text-gray-800">Séries:</label>
          <input
            type="number"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
          />
        </div>

        {/* Repetições */}
        <div className="mt-2">
          <label className="text-gray-800">Repetições:</label>
          <input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
          />
        </div>

        {/* Método */}
        <div className="mt-2">
          <label className="text-gray-800">Método:</label>
          <input
            type="text"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
          />
        </div>

        {/* Observação */}
        <div className="mt-2">
          <label className="text-gray-800">Observação:</label>
          <input
            type="text"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
          />
        </div>

        {/* Botões de ação */}
        <div className="mt-4 flex gap-2">
          {modoEdicao ? (
            <>
              <button
                onClick={salvarEdicaoExercicio}
                className="bg-green-500 text-white p-2 rounded flex-1 hover:bg-green-600 transition"
              >
                Salvar Alterações
              </button>
              <button
                onClick={cancelarEdicao}
                className="bg-gray-500 text-white p-2 rounded flex-1 hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={adicionarExercicio}
              className="bg-yellow-500 text-white p-2 rounded w-full hover:bg-yellow-600 transition"
            >
              Adicionar Exercício
            </button>
          )}
        </div>
      </div>

      {/* Lista de Exercícios */}
      <div className="mt-6">
        <h2 className="text-lg font-bold text-gray-800">Exercícios</h2>
        {treinos[treinoAtual].exercicios.length === 0 ? (
          <p className="text-gray-500 italic mt-2">Nenhum exercício adicionado</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {treinos[treinoAtual].exercicios.map((ex, index) => (
              <li
                key={index}
                className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded text-gray-900"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {index + 1}. {ex.nome} - {ex.grupo}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => moverExercicioParaCima(index)}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600 transition'}`}
                      title="Mover para cima"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moverExercicioParaBaixo(index)}
                      disabled={index === treinos[treinoAtual].exercicios.length - 1}
                      className={`p-1 rounded ${
                        index === treinos[treinoAtual].exercicios.length - 1
                          ? 'bg-gray-300'
                          : 'bg-blue-500 text-white hover:bg-blue-600 transition'
                      }`}
                      title="Mover para baixo"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => iniciarEdicaoExercicio(ex, index)}
                      className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600 transition"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => removerExercicio(index)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition"
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-1 text-sm">
                  <div>{ex.series} séries de {ex.reps} repetições</div>
                  {ex.metodo && <div>Método: {ex.metodo}</div>}
                  {ex.observacao && <div>Obs: {ex.observacao}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
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
  );
}