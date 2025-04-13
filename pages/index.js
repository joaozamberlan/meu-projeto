import React, { useState } from "react";
import exercisesDB from "./api/exercisesDB";
import { gerarPDF, calcularTotalSeries } from "./api/_documentPDF";

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
  const [nomeProfissional, setNomeProfissional] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);
  const [exercicioEditando, setExercicioEditando] = useState(null);
  const [indexEditando, setIndexEditando] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [exercicioCustom, setExercicioCustom] = useState("");

  const gruposMusculares = Object.keys(exercisesDB);
  const opcoesMusculosAlvo = ["MMSS", "MMII", "MMII e MMSS"];

  const mostrarNotificacao = (mensagem, tipo = "success") => {
    setNotificationMessage(mensagem);
    setNotificationType(tipo);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 1500);
  };

  const fecharNotificacao = () => setShowNotification(false);

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
    setTreinoAtual(treinos.length);
  };

  const removerTreino = () => {
    if (treinos.length <= 1) {
      mostrarNotificacao("Não é possível remover o único treino existente", "error");
      return;
    }
    const nomeTreino = treinos[treinoAtual].nome;
    const novosTreinos = [...treinos];
    novosTreinos.splice(treinoAtual, 1);
    novosTreinos.forEach((treino, index) => {
      treino.nome = `Treino ${String.fromCharCode(65 + index)}`;
    });
    setTreinos(novosTreinos);
    if (treinoAtual >= novosTreinos.length) {
      setTreinoAtual(novosTreinos.length - 1);
    }
    mostrarNotificacao(`${nomeTreino} removido com sucesso!`);
  };

  const moverExercicioParaCima = (index) => {
    if (index === 0) return;
    const novosTreinos = [...treinos];
    const treinoAtualObj = novosTreinos[treinoAtual];
    [treinoAtualObj.exercicios[index], treinoAtualObj.exercicios[index - 1]] = 
    [treinoAtualObj.exercicios[index - 1], treinoAtualObj.exercicios[index]];
    setTreinos(novosTreinos);
  };

  const moverExercicioParaBaixo = (index) => {
    const exercicios = treinos[treinoAtual].exercicios;
    if (index === exercicios.length - 1) return;
    const novosTreinos = [...treinos];
    const treinoAtualObj = novosTreinos[treinoAtual];
    [treinoAtualObj.exercicios[index], treinoAtualObj.exercicios[index + 1]] = 
    [treinoAtualObj.exercicios[index + 1], treinoAtualObj.exercicios[index]];
    setTreinos(novosTreinos);
  };

  const removerExercicio = (index) => {
    const novosTreinos = [...treinos];
    novosTreinos[treinoAtual].exercicios.splice(index, 1);
    setTreinos(novosTreinos);
    mostrarNotificacao("Exercício removido com sucesso!");
  };

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

  const handleGerarPDF = () => {
    const resultado = gerarPDF(treinos, nomeProfissional);
    if (resultado) {
      mostrarNotificacao("PDF de treinos gerado com sucesso!");
    }
  };

  const getTotalSeries = () => {
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white">Plano de Treino</h1>
          <p className="text-blue-100 mt-1">Monte seu plano de treino personalizado</p>
        </div>

        {/* Notificação/Toast */}
        {showNotification && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`p-4 rounded-lg shadow-lg flex items-center space-x-3 
              ${notificationType === "success" ? "bg-white border-l-4 border-green-500 text-green-700" : 
              notificationType === "error" ? "bg-white border-l-4 border-red-500 text-red-700" : 
              "bg-white border-l-4 border-blue-500 text-blue-700"}`}>
              <span className={`text-2xl 
                ${notificationType === "success" ? "text-green-500" : 
                notificationType === "error" ? "text-red-500" : "text-blue-500"}`}>
                {notificationType === "success" ? "✓" : 
                notificationType === "error" ? "✕" : "ℹ"}
              </span>
              <span className="flex-1 text-sm font-medium">{notificationMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Controle do Treino */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Gerenciar Treinos</h2>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={adicionarTreino}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1 bg-green-600 text-white py-2.5 px-4 rounded-md hover:bg-green-700 transition duration-200 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Adicionar</span>
                </button>
                <button
                  onClick={removerTreino}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1 bg-red-600 text-white py-2.5 px-4 rounded-md hover:bg-red-700 transition duration-200 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remover</span>
                </button>
                <button
                  onClick={handleGerarPDF}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>PDF</span>
                </button>
              </div>

              {/* Seleção do Treino */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Treino Atual</label>
                <select
                  value={treinoAtual}
                  onChange={(e) => setTreinoAtual(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {treinos.map((treino, index) => (
                    <option key={index} value={index}>
                      {treino.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Músculos Alvo */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Músculos Alvo</label>
                <select
                  value={treinos[treinoAtual].musculosAlvo}
                  onChange={(e) => {
                    const novosTreinos = [...treinos];
                    novosTreinos[treinoAtual].musculosAlvo = e.target.value;
                    setTreinos(novosTreinos);
                  }}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {opcoesMusculosAlvo.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tempo de Aeróbico */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Aeróbico (min)</label>
                <input
                  type="number"
                  value={treinos[treinoAtual].tempoAerobico}
                  onChange={(e) => {
                    const novosTreinos = [...treinos];
                    novosTreinos[treinoAtual].tempoAerobico = e.target.value;
                    setTreinos(novosTreinos);
                  }}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              {/* Nome Profissional */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome (para o PDF)</label>
                <input
                  type="text"
                  value={nomeProfissional}
                  onChange={(e) => setNomeProfissional(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Seu nome como profissional"
                />
              </div>
            </div>

            {/* Resumo de Volume */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Resumo de Volume</h2>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grupo Muscular
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total de Séries
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(getTotalSeries()).map(([grupo, total]) => (
                      <tr key={grupo} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{grupo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {total || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Coluna Principal */}
          <div className="lg:col-span-2">
            {/* Formulário de Exercício */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                {modoEdicao ? "Editar Exercício" : "Adicionar Exercício"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grupo Muscular */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Muscular*</label>
                  <select
                    value={grupoSelecionado}
                    onChange={(e) => {
                      setGrupoSelecionado(e.target.value);
                      setExercicioSelecionado("");
                    }}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="" className="text-gray-900">Selecione um grupo</option>
                    {gruposMusculares.map((grupo) => (
                      <option key={grupo} value={grupo} className="text-gray-900">
                        {grupo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exercício */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exercício*</label>
                  <select
                    value={exercicioSelecionado}
                    onChange={(e) => setExercicioSelecionado(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    disabled={!grupoSelecionado}
                  >
                    <option value="" className="text-gray-900">Selecione um exercício</option>
                    {grupoSelecionado &&
                      exercisesDB[grupoSelecionado].map((exercicio) => (
                        <option key={exercicio} value={exercicio} className="text-gray-900">
                          {exercicio}
                        </option>
                      ))}
                    {grupoSelecionado && <option value="customExercise" className="text-gray-900">Não está na lista?</option>}
                  </select>
                </div>
                
                {/* Campo para exercício personalizado */}
                {exercicioSelecionado === "customExercise" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do exercício personalizado*</label>
                    <input
                      type="text"
                      value={exercicioCustom}
                      onChange={(e) => setExercicioCustom(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Digite o nome do exercício..."
                    />
                  </div>
                )}

                {/* Séries e Repetições */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Séries*</label>
                  <input
                    type="number"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repetições*</label>
                  <input
                    type="text"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Ex: 10-12, 15, Falha"
                  />
                </div>
                
                {/* Método e Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método (opcional)</label>
                  <input
                    type="text"
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Ex: Rest-Pause, Super-set"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
                  <input
                    type="text"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Ex: Buscar a progressão, Até a falha"
                  />
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-3 mt-6">
                {modoEdicao && (
                  <button
                    onClick={cancelarEdicao}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition duration-200"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={modoEdicao ? salvarEdicaoExercicio : adicionarExercicio}
                  className={`${
                    modoEdicao ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'
                  } text-white py-2 px-4 rounded-md transition duration-200`}
                >
                  {modoEdicao ? 'Salvar Alterações' : 'Adicionar Exercício'}
                </button>
              </div>
            </div>

            {/* Lista de Exercícios */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                Exercícios do {treinos[treinoAtual].nome}
              </h2>
              
              {treinos[treinoAtual].exercicios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum exercício adicionado ainda.</p>
                  <p className="text-sm mt-2">Use o formulário acima para adicionar exercícios.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ordem
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exercício
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Séries
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reps
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {treinos[treinoAtual].exercicios.map((exercicio, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-800">
                            <div className="font-medium">{exercicio.nome}</div>
                            <div className="text-xs text-gray-500">{exercicio.grupo}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-800">
                            {exercicio.series}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-800">
                            {exercicio.reps}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-center space-x-1">
                              {/* Botão Mover Para Cima */}
                              <button
                                onClick={() => moverExercicioParaCima(index)}
                                disabled={index === 0}
                                className={`p-1 rounded-md ${
                                  index === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title="Mover para cima"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              
                              {/* Botão Mover Para Baixo */}
                              <button
                                onClick={() => moverExercicioParaBaixo(index)}
                                disabled={index === treinos[treinoAtual].exercicios.length - 1}
                                className={`p-1 rounded-md ${
                                  index === treinos[treinoAtual].exercicios.length - 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title="Mover para baixo"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {/* Botão Editar */}
                              <button
                                onClick={() => iniciarEdicaoExercicio(exercicio, index)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition duration-200"
                                title="Editar exercício"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              
                              {/* Botão Remover */}
                              <button
                                onClick={() => removerExercicio(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-md transition duration-200"
                                title="Remover exercício"
                              >
                                <svg xmlns="http://www.w3.org/2000 /svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}