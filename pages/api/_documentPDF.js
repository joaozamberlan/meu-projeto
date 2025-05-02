// api/_documentPDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Função principal para gerar o PDF
export const gerarPDF = (treinos, nomeProfissional, nomeArquivo = 'Plano de treino') => {
  try {
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

      renderizarCabecalhoTreino(doc, treino, posicaoY, cores);
      posicaoY += treino.tempoAerobico > 0 ? 32 : 28; // Ligeiramente aumentado para melhor espaçamento
      
      // Renderiza tabela de exercícios
      renderizarTabelaExercicios(doc, treino, posicaoY);
      
      // Adiciona nova página para o próximo treino (se houver)
      if (treinoIndex < treinos.length - 1) {
        doc.addPage();
      }
    });
    
    doc.addPage();
    renderizarResumoVolume(doc, treinos, nomeProfissional);
    
    // Adiciona página de observações gerais
    renderizarObservacoesGerais(doc);
    
    // Onde você adiciona o nome do profissional no PDF
    const margin = 20;
    const currentY = 10;
    doc.text(`Profissional: ${nomeProfissional}`, margin, currentY);
    
    // Usa o nome do arquivo passado ou o nome padrão
    const fileName = nomeArquivo || 'Plano de Treino';
    console.log('Salvando PDF com nome:', fileName); // Para debug

    // Salva o PDF com o nome definido
    doc.save(`${fileName}.pdf`);
    
    return true; // Retorno para indicar sucesso
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return false;
  }
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

const renderizarCaixaAquecimento = (doc, posicaoY, cores) => {
  doc.setFillColor(...cores.fundo);
  doc.setDrawColor(...cores.borda);
  
  const margemLateral = 20; 
  const larguraPagina = doc.internal.pageSize.width;
  const largura = larguraPagina - (margemLateral * 2);
  const altura = 10; 
  const raioCantos = 3; 
  doc.roundedRect(margemLateral, posicaoY, largura, altura, raioCantos, raioCantos, 'FD');
  
  doc.setTextColor(...cores.texto);
  doc.setFont('helvetica', 'bold');
  doc.text("Aquecimento, tempo de descanso: Ler observações no final do PDF.", 
           larguraPagina/2, posicaoY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
};

const renderizarObservacoesGerais = (doc) => {
  doc.addPage();
  const posicaoY = 25;
  const larguraPagina = doc.internal.pageSize.width;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 50, 100);
  doc.text("OBSERVAÇÕES GERAIS", larguraPagina/2, posicaoY, { align: 'center' });
  
  doc.setLineWidth(0.7);
  doc.setDrawColor(80, 100, 140);
  const larguraLinha = 140;
  doc.line((larguraPagina - larguraLinha)/2, posicaoY + 5, (larguraPagina + larguraLinha)/2, posicaoY + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
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
  
  let y = posicaoY + 20;
  
  observacoes.forEach((linha, index) => {
    if (linha === "") {
      y += 7;
    } else if (linha.startsWith("Sugestão")) {
      doc.setFont('helvetica', 'bold');
      doc.text(linha, margemEsquerda, y);
      doc.setFont('helvetica', 'normal');
      y += 9;
    } else if (linha.match(/^\d\./)) {
      const linhasQuebradas = doc.splitTextToSize(linha, larguraDisponivel - 10);
      doc.text(linhasQuebradas, margemEsquerda + 8, y); 
      y += 7 * linhasQuebradas.length;
    } else {
      const linhasQuebradas = doc.splitTextToSize(linha, larguraDisponivel);
      doc.text(linhasQuebradas, margemEsquerda, y);
      y += 7 * linhasQuebradas.length + 1;
    }
  });
  
  const totalPages = doc.internal.getNumberOfPages();
  const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
  doc.setFontSize(9); 
  doc.setTextColor(120, 120, 120);
  doc.text(`Página ${currentPage} de ${totalPages}`, larguraPagina/2, 285, { align: 'center' });
};

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
      fontSize: 9, 
      cellPadding: 3 
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3
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
  const posicaoY = 25;
  const larguraPagina = doc.internal.pageSize.width;
  
  // Título da página
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 50, 100);
  doc.text("RESUMO DE VOLUME POR GRUPO MUSCULAR", larguraPagina/2, posicaoY, { align: 'center' });
  
  // Linha decorativa
  doc.setLineWidth(0.7);
  doc.setDrawColor(80, 100, 140);
  const larguraLinha = 140;
  doc.line((larguraPagina - larguraLinha)/2, posicaoY + 5, (larguraPagina + larguraLinha)/2, posicaoY + 5);
  
  // Calcular o total geral de séries
  const totalGeral = Object.values(volumeTotal).reduce((acc, curr) => acc + curr, 0);
  
  // Adicionar tabela com resumo de volume
  autoTable(doc, {
    startY: posicaoY + 20,
    head: [["GRUPO MUSCULAR", "VOLUME TOTAL (SÉRIES)"]],
    body: [
      ...Object.entries(volumeTotal)
        .sort((a, b) => b[1] - a[1])
        .map(([grupo, volume]) => [grupo, volume]),
      ["VOLUME TOTAL SEMANAL", totalGeral] // Adiciona linha com o total
    ],
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
      cellPadding: 5,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [240, 245, 250]
    },
    didParseCell: (data) => {
      // Estiliza a última linha (total) diferente
      if (data.row.index === Object.keys(volumeTotal).length) {
        data.cell.styles.fillColor = [60, 90, 120];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 11;
      }
    },
    columnStyles: {
      0: { halign: 'center', valign: 'middle', cellPadding: 5 },
      1: { halign: 'center', valign: 'middle' }
    },
    margin: { left: 50, right: 50 }
  });
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