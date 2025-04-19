import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Swal from 'sweetalert2';
import exercisesDB from "./api/exercisesDB";
import { gerarPDF, calcularTotalSeries } from "./api/_documentPDF";

// Usar service workers para funcionalidade offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Atualizar o componente SortableTableRow
const SortableTableRow = ({ exercicio, index, onEdit, onRemove, darkMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercicio.id || `exercicio-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-move`}
      {...attributes}
      {...listeners}
    >
      <td className={`px-2 py-3 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        {index + 1}
      </td>
      <td className={`px-2 py-3 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        <div className="min-w-[150px] sm:min-w-0">
          <div className="font-medium text-sm">{exercicio.nome}</div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{exercicio.grupo}</div>
        </div>
      </td>
      <td className={`px-2 py-3 text-center whitespace-nowrap text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        {exercicio.series}
      </td>
      <td className={`px-2 py-3 text-center whitespace-nowrap text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        {exercicio.reps}
      </td>
      <td className="px-2 py-3">
        <div className="flex justify-center space-x-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200"
            title="Editar exercício"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200"
            title="Remover exercício"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
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
  const [nomeProfissional, setNomeProfissional] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [exercicioEditando, setExercicioEditando] = useState(null);
  const [indexEditando, setIndexEditando] = useState(null);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  const gruposMusculares = Object.keys(exercisesDB);
  const opcoesMusculosAlvo = ["MMSS", "MMII", "MMII e MMSS"];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const mostrarNotificacao = (mensagem, tipo = "success") => {
    setNotificationMessage(mensagem);
    setNotificationType(tipo);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 1500);
  };

  const fecharNotificacao = () => {
    setShowNotification(false);
  };

  const [exercicioCustom, setExercicioCustom] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const removerTreino = async () => {
    if (treinos.length <= 1) {
      mostrarNotificacao("Não é possível remover o único treino existente", "error");
      return;
    }

    const result = await Swal.fire({
      title: 'Confirmar exclusão',
      text: `Deseja remover o ${treinos[treinoAtual].nome}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
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
    }
  };

  const confirmarRemoverTreino = () => {
    if (treinos.length <= 1) {
      mostrarNotificacao("Não é possível remover o único treino existente", "error");
      return;
    }

    Swal.fire({
      title: 'Confirmar remoção',
      text: `Deseja remover o ${treinos[treinoAtual].nome}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        removerTreino();
      }
    });
  };

  const removerExercicio = async (index) => {
    const exercicio = treinos[treinoAtual].exercicios[index];
    
    const result = await Swal.fire({
      title: 'Confirmar exclusão',
      text: `Deseja remover o exercício "${exercicio.nome}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const novosTreinos = [...treinos];
      novosTreinos[treinoAtual].exercicios.splice(index, 1);
      setTreinos(novosTreinos);
      mostrarNotificacao("Exercício removido com sucesso!");
    }
  };

  const iniciarEdicaoExercicio = (exercicio, index) => {
    setExercicioEditando({ ...exercicio });
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = parseInt(active.id.split('-')[1]);
      const newIndex = parseInt(over.id.split('-')[1]);

      const novosTreinos = [...treinos];
      novosTreinos[treinoAtual].exercicios = arrayMove(
        novosTreinos[treinoAtual].exercicios,
        oldIndex,
        newIndex
      );
      setTreinos(novosTreinos);
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

  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [historicoTreinos, setHistoricoTreinos] = useState({}); // { alunoId: [{ data, treinos }] }
  const [mostrarModalAluno, setMostrarModalAluno] = useState(false);

  useEffect(() => {
    const alunosStorage = localStorage.getItem('alunos');
    const historicoStorage = localStorage.getItem('historicoTreinos');
    
    if (alunosStorage) {
      setAlunos(JSON.parse(alunosStorage));
    }
    if (historicoStorage) {
      setHistoricoTreinos(JSON.parse(historicoStorage));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('alunos', JSON.stringify(alunos));
  }, [alunos]);

  useEffect(() => {
    localStorage.setItem('historicoTreinos', JSON.stringify(historicoTreinos));
  }, [historicoTreinos]);

  useEffect(() => {
    const backupAutomatico = setInterval(() => {
      localStorage.setItem('backup_treinos', JSON.stringify(treinos));
    }, 300000); // 5 minutos

    return () => clearInterval(backupAutomatico);
  }, [treinos]);

  const adicionarAluno = async () => {
    const { value: nomeAluno } = await Swal.fire({
      title: 'Adicionar Novo Aluno',
      input: 'text',
      inputLabel: 'Nome do Aluno',
      inputPlaceholder: 'Digite o nome do aluno',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Você precisa digitar um nome!';
        }
      }
    });

    if (nomeAluno) {
      const novoAluno = {
        id: Date.now().toString(),
        nome: nomeAluno,
        dataCadastro: new Date().toISOString()
      };
      setAlunos([...alunos, novoAluno]);
      mostrarNotificacao(`Aluno ${nomeAluno} adicionado com sucesso!`);
    }
  };

  const salvarTreinoAluno = async () => {
    if (!alunoSelecionado) {
      mostrarNotificacao("Selecione um aluno primeiro!", "error");
      return;
    }

    const { value: descricao } = await Swal.fire({
      title: 'Salvar Treino',
      input: 'text',
      inputLabel: 'Descrição do Treino (ex: Mesociclo 1, Treino Inicial, etc)',
      inputPlaceholder: 'Digite uma descrição para o treino',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Você precisa adicionar uma descrição!';
        }
      }
    });

    if (descricao) {
      const novoHistorico = {
        ...historicoTreinos,
        [alunoSelecionado.id]: [
          ...(historicoTreinos[alunoSelecionado.id] || []),
          {
            id: Date.now().toString(),
            data: new Date().toISOString(),
            descricao,
            treinos: [...treinos]
          }
        ]
      };
      setHistoricoTreinos(novoHistorico);
      mostrarNotificacao("Treino salvo com sucesso!");
    }
  };

  const carregarTreinoAnterior = async (alunoId) => {
    const historicoAluno = historicoTreinos[alunoId] || [];
    if (historicoAluno.length === 0) {
      mostrarNotificacao("Este aluno não possui treinos anteriores.", "info");
      return;
    }

    const result = await Swal.fire({
      title: 'Selecione o Treino',
      input: 'select',
      inputOptions: Object.fromEntries(
        historicoAluno.map((hist, index) => [
          index,
          `${new Date(hist.data).toLocaleDateString()} - ${hist.descricao}`
        ])
      ),
      showCancelButton: true
    });

    if (result.isConfirmed) {
      const treinoSelecionado = historicoAluno[result.value];
      setTreinos(treinoSelecionado.treinos);
      mostrarNotificacao("Treino carregado com sucesso!");
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} p-2 sm:p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Plano de Treino</h1>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">Monte seu plano de treino personalizado</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 transform hover:scale-105"
              title={darkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Gerenciamento de Alunos
            </h2>
            <button
              onClick={adicionarAluno}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              Novo Aluno
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                Selecionar Aluno
              </label>
              <select
                value={alunoSelecionado?.id || ''}
                onChange={(e) => {
                  const aluno = alunos.find(a => a.id === e.target.value);
                  setAlunoSelecionado(aluno);
                }}
                className={`w-full border rounded-md py-2 px-3 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Selecione um aluno</option>
                {alunos.map(aluno => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={salvarTreinoAluno}
                disabled={!alunoSelecionado}
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                  !alunoSelecionado
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Salvar Treino do Aluno
              </button>
              <button
                onClick={() => carregarTreinoAnterior(alunoSelecionado?.id)}
                disabled={!alunoSelecionado}
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                  !alunoSelecionado
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                Carregar Treino Anterior
              </button>
            </div>
          </div>
        </div>

        {showNotification && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className={`w-full max-w-sm p-3 sm:p-4 rounded-lg shadow-lg flex items-center space-x-3 
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 mb-6`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 border-b pb-2`}>
                Gerenciar Treinos
              </h2>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={adicionarTreino}
                  className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 px-4 rounded-lg hover:bg-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
                <button
                  onClick={confirmarRemoverTreino}
                  className="flex items-center justify-center gap-2 bg-rose-500 text-white py-3 px-4 rounded-lg hover:bg-rose-600 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">Remover</span>
                </button>
                <button
                  onClick={handleGerarPDF}
                  className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                  Treino Atual
                </label>
                <select
                  value={treinoAtual}
                  onChange={(e) => setTreinoAtual(Number(e.target.value))}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                >
                  {treinos.map((treino, index) => (
                    <option key={index} value={index}>
                      {treino.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                  Músculos Alvo
                </label>
                <select
                  value={treinos[treinoAtual].musculosAlvo}
                  onChange={(e) => {
                    const novosTreinos = [...treinos];
                    novosTreinos[treinoAtual].musculosAlvo = e.target.value;
                    setTreinos(novosTreinos);
                  }}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                >
                  {opcoesMusculosAlvo.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                  Tempo de Aeróbico (min)
                </label>
                <input
                  type="number"
                  value={treinos[treinoAtual].tempoAerobico}
                  onChange={(e) => {
                    const novosTreinos = [...treinos];
                    novosTreinos[treinoAtual].tempoAerobico = e.target.value;
                    setTreinos(novosTreinos);
                  }}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                  Seu Nome (para o PDF)
                </label>
                <input
                  type="text"
                  value={nomeProfissional}
                  onChange={(e) => setNomeProfissional(e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  placeholder="Seu nome como profissional"
                />
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 border-b pb-2`}>
                Resumo de Volume
              </h2>

              <div className={`overflow-x-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Grupo Muscular
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Total de Séries
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {Object.entries(getTotalSeries()).map(([grupo, total]) => (
                      <tr key={grupo} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {grupo}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={`font-semibold px-2 py-1 rounded-full ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
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

          <div className="lg:col-span-8">
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 mb-6`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 border-b pb-2`}>
                {modoEdicao ? "Editar Exercício" : "Adicionar Exercício"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                    Grupo Muscular*
                  </label>
                  <select
                    value={grupoSelecionado}
                    onChange={(e) => {
                      setGrupoSelecionado(e.target.value);
                      setExercicioSelecionado("");
                    }}
                    className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  >
                    <option value="" className={darkMode ? 'bg-gray-700 text-white' : 'text-gray-900'}>
                      Selecione um grupo
                    </option>
                    {gruposMusculares.map((grupo) => (
                      <option 
                        key={grupo} 
                        value={grupo} 
                        className={darkMode ? 'bg-gray-700 text-white' : 'text-gray-900'}
                      >
                        {grupo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                    Exercício*
                  </label>
                  <select
                    value={exercicioSelecionado}
                    onChange={(e) => setExercicioSelecionado(e.target.value)}
                    className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    disabled={!grupoSelecionado}
                  >
                    <option value="" className={darkMode ? 'text-white bg-gray-700' : 'text-gray-900'}>
                      Selecione um exercício
                    </option>
                    {grupoSelecionado &&
                      exercisesDB[grupoSelecionado].map((exercicio) => (
                        <option 
                          key={exercicio} 
                          value={exercicio} 
                          className={darkMode ? 'text-white bg-gray-700' : 'text-gray-900'}
                        >
                          {exercicio}
                        </option>
                      ))}
                    {grupoSelecionado && (
                      <option 
                        value="customExercise" 
                        className={darkMode ? 'text-white bg-gray-700' : 'text-gray-900'}
                      >
                        Não está na lista?
                      </option>
                    )}
                  </select>
                </div>

                {exercicioSelecionado === "customExercise" && (
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                      Nome do exercício personalizado*
                    </label>
                    <input
                      type="text"
                      value={exercicioCustom}
                      onChange={(e) => setExercicioCustom(e.target.value)}
                      className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      placeholder="Digite o nome do exercício..."
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                    Séries*
                  </label>
                  <input
                    type="number"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    min="1"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                    Repetições*
                  </label>
                  <input
                    type="text"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    placeholder="Ex: 10-12, 15, Falha"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                    Método (opcional)
                  </label>
                  <input
                    type="text"
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value)}
                    className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    placeholder="Ex: Rest-Pause, Super-set"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} mb-1`}>
                    Observações (opcional)
                  </label>
                  <input
                    type="text"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    placeholder="Ex: Buscar a progressão, Até a falha"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                {modoEdicao && (
                  <button
                    onClick={cancelarEdicao}
                    className="w-full sm:w-auto bg-gray-500 text-white py-2.5 px-6 rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>
                )}
                <button
                  onClick={modoEdicao ? salvarEdicaoExercicio : adicionarExercicio}
                  className={`w-full sm:w-auto ${
                    modoEdicao 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  } text-white py-2.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md flex items-center justify-center gap-2`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {modoEdicao ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                  {modoEdicao ? 'Salvar Alterações' : 'Adicionar Exercício'}
                </button>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-4 overflow-x-auto`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 border-b pb-2`}>
                Exercícios do {treinos[treinoAtual].nome}
                <span className="hidden md:inline text-sm font-normal ml-2 text-gray-500">
                  (Arraste para reordenar)
                </span>
              </h2>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar exercícios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exercício</th>
                          <th className="w-16 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Séries</th>
                          <th className="w-16 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reps</th>
                          <th className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <SortableContext
                        items={treinos[treinoAtual].exercicios.map((_, index) => `exercicio-${index}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                          {treinos[treinoAtual].exercicios.map((exercicio, index) => (
                            <SortableTableRow
                              key={`exercicio-${index}`}
                              exercicio={exercicio}
                              index={index}
                              onEdit={() => iniciarEdicaoExercicio(exercicio, index)}
                              onRemove={() => removerExercicio(index)}
                              darkMode={darkMode}
                            />
                          ))}
                        </tbody>
                      </SortableContext>
                    </table>
                  </div>
                </div>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}