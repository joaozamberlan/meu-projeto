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
    Abdômen: [
      "Prancha", "Elevação de Pernas", "Abdominal na Polia Alta",
      "Abdominal na Polia Baixa", "Abdominal na Máquina", 
      "Crunch no Banco Inclinado", "Crunch no Banco Reto", 
      "Crunch na Polia Baixa", "Crunch na Polia Alta"
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
    Adutores: [
      "Adutor na Máquina", "Adutor na Polia Baixa", "Cadeira Adutora",
      "Adutor na Polia Alta", "Adutor na Polia Baixa em Pé", 
       "Abdução de Quadril em Pé"
    ],
    Glúteos: [
      "Elevação Pélvica", "Agachamento Búlgaro", "Cadeira Abdutora", 
      "Glúteo na Polia baixa"
    ]
  };
  
  for (const group in exercisesDB) {
    exercisesDB[group].sort((a, b) => a.localeCompare(b));
  }

  export default exercisesDB;