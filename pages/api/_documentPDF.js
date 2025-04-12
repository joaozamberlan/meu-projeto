// api/_documentPDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Função principal para gerar o PDF
export const gerarPDF = (treinos, nomeProfissional) => {
  // Inicializa documento PDF
  const doc = new jsPDF();
  
  // Configurações visuais gerais
  const cores = {
    titulo: [30, 50, 100],        // Azul escuro para títulos
    subtitulo: [50, 50, 50],      // Cinza escuro para subtítulos
    aquecimento: {
      fundo: [245, 247, 250],     // Azul muito claro para fundo
      borda: [80, 100, 140],      // Azul médio para borda
      texto: [40, 40, 80]         // Azul-escuro para texto
    },
    tabela: {
      cabecalho: [60, 90, 120],   // Azul para cabeçalho
      linhaAlternada: [240, 245, 250] // Azul claro para linhas alternadas
    }
  };
  
  // Gera páginas com detalhes dos treinos
  treinos.forEach((treino, treinoIndex) => {
    let posicaoY = 20; // Aumentado ligeiramente para melhor espaçamento do topo
    
    // Renderiza cabeçalho do treino - centralizado
    renderizarCabecalhoTreino(doc, treino, posicaoY, cores);
    posicaoY += treino.tempoAerobico > 0 ? 32 : 28; // Ligeiramente aumentado para melhor espaçamento
    
    // Renderiza tabela de exercícios
    renderizarTabelaExercicios(doc, treino, posicaoY);
    
    // Adiciona nova página para o próximo treino (se houver)
    if (treinoIndex < treinos.length - 1) {
      doc.addPage();
    }
  });
  
  // Adiciona página de resumo no final
  doc.addPage();
  renderizarResumoVolume(doc, treinos, nomeProfissional);
  
  // Adiciona página de observações gerais
  renderizarObservacoesGerais(doc);
  
  // Salva o PDF
  doc.save("plano_treino.pdf");
  
  return true; // Retorno para indicar sucesso
};

// Função para renderizar o cabeçalho de cada treino
const renderizarCabecalhoTreino = (doc, treino, posicaoY, cores) => {
  const larguraPagina = doc.internal.pageSize.width;
  
  // Título principal do treino - centralizado
  // Corrigido o problema de duplicação de "TREINO"
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cores.titulo);
  doc.text(`${treino.nome.toUpperCase()}`, larguraPagina/2, posicaoY, { align: 'center' });
  
  // Subtítulo com músculos alvo - centralizado e mais destacado
  doc.setFontSize(11); // Aumentado para destaque
  doc.setFont('helvetica', 'bold'); // Negrito para destaque
  doc.setTextColor(...cores.subtitulo);
  doc.text(`Músculos alvo: ${treino.musculosAlvo}`, larguraPagina/2, posicaoY + 8, { align: 'center' });

  // Adiciona informação de treino aeróbico se houver - centralizado e mais destacado
  if (parseInt(treino.tempoAerobico) > 0) {
    doc.setFont('helvetica', 'bold'); // Negrito para destaque
    doc.text(`Treino aeróbico: ${treino.tempoAerobico} minutos de aeróbico contínuo pós treino ou em outro horário.`, 
             larguraPagina/2, posicaoY + 16, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    renderizarCaixaAquecimento(doc, posicaoY + 20, cores.aquecimento);
  } else {
    renderizarCaixaAquecimento(doc, posicaoY + 16, cores.aquecimento);
  }
};

// Função para renderizar a caixa de aquecimento
const renderizarCaixaAquecimento = (doc, posicaoY, cores) => {
  // Desenha retângulo com bordas arredondadas
  doc.setFillColor(...cores.fundo);
  doc.setDrawColor(...cores.borda);
  
  const margemLateral = 20; // Aumentada para melhor alinhamento
  const larguraPagina = doc.internal.pageSize.width;
  const largura = larguraPagina - (margemLateral * 2);
  const altura = 10; // Ligeiramente aumentada
  const raioCantos = 3; // Raio para bordas mais arredondadas
  
  // Retângulo com bordas arredondadas
  doc.roundedRect(margemLateral, posicaoY, largura, altura, raioCantos, raioCantos, 'FD');
  
  // Texto do aquecimento - centralizado
  doc.setTextColor(...cores.texto);
  doc.setFont('helvetica', 'bold');
  doc.text("Aquecimento, tempo de descanso: Ler observações no final do PDF.", 
           larguraPagina/2, posicaoY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
};

// Função para renderizar página de observações gerais
const renderizarObservacoesGerais = (doc) => {
  doc.addPage();
  const posicaoY = 25; // Aumentado para melhor espaçamento
  const larguraPagina = doc.internal.pageSize.width;
  
  // Título da página - centralizado com estilo aprimorado
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 50, 100);
  doc.text("OBSERVAÇÕES GERAIS", larguraPagina/2, posicaoY, { align: 'center' });
  
  // Adicionar uma linha horizontal decorativa abaixo do título - centralizada
  doc.setLineWidth(0.7); // Ligeiramente mais grossa
  doc.setDrawColor(80, 100, 140);
  const larguraLinha = 140;
  doc.line((larguraPagina - larguraLinha)/2, posicaoY + 5, (larguraPagina + larguraLinha)/2, posicaoY + 5);
  
  // Configurações de texto
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  // Definindo margens para o texto das observações - mais equilibradas
  const margemEsquerda = 30;
  const margemDireita = 30;
  const larguraDisponivel = larguraPagina - margemEsquerda - margemDireita;
  
  const observacoes = [
    "Ajuste a carga para ficar dentro da faixa de repetições propostas. Caso consiga realizar mais do que o indicado para a semana, aumente para manter dentro do indicado.",
    "Descanse de 2-3 minutos entre cada série, exceto nos métodos onde o descanso é reduzido.",
    "",
    "Sugestão de aquecimento para exercícios mais pesados:",
    "1. Realizar a primeira série como aquecimento padrão com 5-8 repetições com carga leve.",
    "2. Após isso, aumentar para 50% da carga de trabalho (peso da série válida) e realizar 5 repetições.",
    "3. Na sequência, realizar 3-5 repetições com 85% de carga de trabalho.",
    "4. Após isso, realizar as séries válidas na faixa de repetições indicada.",
    "",
    "Esse aquecimento é indicado nos primeiros exercícios para cada grupo muscular, principalmente nos exercícios onde mais carga é mobilizada. Não é obrigatória a realização caso o treino fique muito longo."
  ];
  
  // Iniciando a posição Y para o texto (abaixo do título e linha)
  let y = posicaoY + 20;
  
  // Renderiza cada linha de observação com quebra de texto apropriada
  observacoes.forEach((linha, index) => {
    if (linha === "") {
      // Linha em branco, apenas avança um pouco o Y
      y += 7; // Ligeiramente aumentado
    } else if (linha.startsWith("Sugestão")) {
      // Título da seção de aquecimento com formatação em negrito
      doc.setFont('helvetica', 'bold');
      doc.text(linha, margemEsquerda, y);
      doc.setFont('helvetica', 'normal');
      y += 9; // Aumentado para destacar melhor o título da seção
    } else if (linha.match(/^\d\./)) {
      // Itens numerados da lista de aquecimento (com recuo)
      // Garantindo que linhas longas não sejam cortadas
      const linhasQuebradas = doc.splitTextToSize(linha, larguraDisponivel - 10);
      doc.text(linhasQuebradas, margemEsquerda + 8, y); // Recuo para os itens numerados
      y += 7 * linhasQuebradas.length; // Avança baseado no número de linhas
    } else {
      // Parágrafos normais com quebra de texto automática
      const linhasQuebradas = doc.splitTextToSize(linha, larguraDisponivel);
      doc.text(linhasQuebradas, margemEsquerda, y);
      y += 7 * linhasQuebradas.length + 1; // Ligeiro espaço adicional entre parágrafos
    }
  });
  
  // Adicionar rodapé com número de página - centralizado
  const totalPages = doc.internal.getNumberOfPages();
  const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
  doc.setFontSize(9); // Ligeiramente maior para melhor legibilidade
  doc.setTextColor(120, 120, 120);
  doc.text(`Página ${currentPage} de ${totalPages}`, larguraPagina/2, 285, { align: 'center' });
};

// Função para renderizar a tabela de exercícios
const renderizarTabelaExercicios = (doc, treino, posicaoY) => {
  autoTable(doc, {
    startY: posicaoY,
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
      fillColor: [60, 90, 120],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9, // Reduzido para evitar cortes
      cellPadding: 3 // Adicionado padding para melhor espaçamento
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3 // Adicionado padding para melhor espaçamento
    },
    alternateRowStyles: {
      fillColor: [240, 245, 250]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 18 }, // Reduzido para dar mais espaço
      1: { cellWidth: 'auto', minCellWidth: 40 }, // Garantir largura mínima adequada
      2: { halign: 'center', cellWidth: 20 }, // Reduzido para dar mais espaço
      3: { halign: 'center', cellWidth: 28 }, // Reduzido para dar mais espaço
      4: { halign: 'center', cellWidth: 25 }, // Reduzido para dar mais espaço
      5: { cellWidth: 'auto', minCellWidth: 30 } // Garantir largura mínima adequada
    },
    margin: { left: 14, right: 14 }, // Margens reduzidas para evitar corte
    didDrawPage: (data) => {
      // Adicionar rodapé com número de página - centralizado
      const larguraPagina = doc.internal.pageSize.width;
      const totalPages = doc.internal.getNumberOfPages();
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(9); // Ligeiramente maior
      doc.setTextColor(120, 120, 120);
      doc.text(`Página ${currentPage} de ${totalPages}`, larguraPagina/2, 285, { align: 'center' });
    }
  });
};

// Função para renderizar o resumo de volume
const renderizarResumoVolume = (doc, treinos, nomeProfissional) => {
  const volumeTotal = calcularTotalSeries(treinos);
  const posicaoY = 25; // Aumentado para melhor espaçamento
  const larguraPagina = doc.internal.pageSize.width;
  
  // Título da página de resumo com estilo aprimorado - centralizado
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 50, 100);
  doc.text("RESUMO DE VOLUME POR GRUPO MUSCULAR", larguraPagina/2, posicaoY, { align: 'center' });
  
  // Adicionar uma linha horizontal decorativa abaixo do título - centralizada
  doc.setLineWidth(0.7); // Ligeiramente mais grossa
  doc.setDrawColor(80, 100, 140);
  const larguraLinha = 140;
  doc.line((larguraPagina - larguraLinha)/2, posicaoY + 5, (larguraPagina + larguraLinha)/2, posicaoY + 5);
  
  // Adicionar tabela com resumo de volume
  autoTable(doc, {
    startY: posicaoY + 20, // Aumentado para melhor espaçamento
    head: [["GRUPO MUSCULAR", "VOLUME TOTAL (SÉRIES)"]],
    body: Object.entries(volumeTotal)
      .sort((a, b) => b[1] - a[1]) // Ordena por volume (decrescente)
      .map(([grupo, volume]) => [grupo, volume]),
    theme: 'grid',
    headStyles: {
      fillColor: [60, 90, 120],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 11,
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5, // Aumentado para centralizar melhor verticalmente
      valign: 'middle' // Centralização vertical explícita
    },
    alternateRowStyles: {
      fillColor: [240, 245, 250]
    },
    columnStyles: {
      0: { 
        halign: 'center', // Centralizado horizontalmente 
        valign: 'middle', // Centralizado verticalmente
        cellPadding: 5
      },
      1: { 
        halign: 'center', // Centralizado horizontalmente
        valign: 'middle'  // Centralizado verticalmente
      }
    },
    margin: { left: 50, right: 50 }, // Margens aumentadas para melhor centralização
  });
  
  // Adicionar data de geração e informações adicionais em posições mais equilibradas
  const dataAtual = new Date().toLocaleDateString();
  doc.setFontSize(9); // Ligeiramente maior
  doc.setTextColor(100, 100, 100);
  doc.text(`Plano de treino gerado em: ${dataAtual}`, 20, 280);
  doc.text(`Desenvolvido por: ${nomeProfissional || "Profissional"}`, larguraPagina - 20, 280, { align: 'right' });
};

// Função para calcular o total de séries por grupo muscular
const calcularTotalSeries = (treinos) => {
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