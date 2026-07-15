// Dados iniciais do sistema - formulários extraídos dos PDFs reais (ANX.GER.076 R12)

const SEED_USUARIOS = [
  { id: 'u1', email: 'admin@empresa.com', senha: 'admin123', papel: 'admin', nome: 'Administrador Qualidade', ativo: true },
  { id: 'u2', email: 'direcao@empresa.com', senha: '123456', papel: 'avaliador', nome: 'Setor Direção', ativo: true },
  { id: 'u3', email: 'qualidade@empresa.com', senha: '123456', papel: 'avaliador', nome: 'Setor Qualidade', ativo: true },
  { id: 'u4', email: 'ti@empresa.com', senha: '123456', papel: 'avaliador', nome: 'Setor TI', ativo: true },
  { id: 'u5', email: 'sesmt@empresa.com', senha: '123456', papel: 'avaliador', nome: 'Setor SESMT', ativo: true },
];

// Critérios com opções e pontuação, extraídos fielmente dos formulários PDF
const SEED_FORMULARIOS = [
  {
    id: 'f1',
    nome: 'Direção – Segurança Patrimonial',
    setor: 'Direção',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Necessidade de substituição', pesoMax: 3,
        opcoes: [
          { label: 'Não houve necessidade de substituição', pontos: 3.0 },
          { label: '01 substituição', pontos: 2.0 },
          { label: '02 substituições', pontos: 1.0 },
          { label: '03 substituições', pontos: 0.5 },
          { label: '04 ou mais substituições', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento do contrato', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f2',
    nome: 'Direção – Limpeza de Ar Condicionado (TechFrio)',
    setor: 'Direção',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Reclamações em relação ao serviço', pesoMax: 3,
        opcoes: [
          { label: 'Não houve reclamações', pontos: 3.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: '01 reclamação com impacto', pontos: 1.0 },
          { label: '02 reclamações com impacto', pontos: 0.5 },
          { label: '03 ou mais reclamações com impacto', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento da programação', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f3',
    nome: 'Serviços Gerais',
    setor: 'Direção',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Necessidade de substituição', pesoMax: 3,
        opcoes: [
          { label: 'Não houve necessidade de substituição', pontos: 3.0 },
          { label: '01 substituição', pontos: 2.0 },
          { label: '02 substituições', pontos: 1.0 },
          { label: '03 substituições', pontos: 0.5 },
          { label: '04 ou mais substituições', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento do contrato', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f4',
    nome: 'Pré-Analítico – Motorista Particular',
    setor: 'Direção',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Necessidade de substituição', pesoMax: 3,
        opcoes: [
          { label: 'Não houve necessidade de substituição', pontos: 3.0 },
          { label: '01 substituição', pontos: 2.0 },
          { label: '02 substituições', pontos: 1.0 },
          { label: '03 substituições', pontos: 0.5 },
          { label: '04 ou mais substituições', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento do contrato', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f5',
    nome: 'Qualidade – Calibração (IPEM)',
    setor: 'Qualidade',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Prazo de realização', pesoMax: 3,
        opcoes: [
          { label: 'Na data agendada', pontos: 3.0 },
          { label: 'Fora da data, mas reagendado', pontos: 2.0 },
          { label: 'Até 05 dias fora da data agendada', pontos: 1.0 },
          { label: 'Até 10 dias fora da data agendada', pontos: 0.5 },
          { label: 'Acima de 10 dias fora da data agendada', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Resolutividade', pesoMax: 4,
        opcoes: [
          { label: 'Resolvido no primeiro atendimento', pontos: 4.0 },
          { label: 'Resolvido no segundo atendimento', pontos: 2.0 },
          { label: 'Resolvido no terceiro atendimento', pontos: 1.0 },
          { label: 'Não resolvido, envolveu outra empresa', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f6',
    nome: 'Qualidade – Manutenção (DIOTEC)',
    setor: 'Qualidade',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Prazo de realização', pesoMax: 3,
        opcoes: [
          { label: 'Na data agendada', pontos: 3.0 },
          { label: 'Fora da data, mas reagendado', pontos: 2.0 },
          { label: 'Até 05 dias fora da data agendada', pontos: 1.0 },
          { label: 'Até 10 dias fora da data agendada', pontos: 0.5 },
          { label: 'Acima de 10 dias fora da data agendada', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Resolutividade', pesoMax: 4,
        opcoes: [
          { label: 'Resolvido no primeiro atendimento', pontos: 4.0 },
          { label: 'Resolvido no segundo atendimento', pontos: 2.0 },
          { label: 'Resolvido no terceiro atendimento', pontos: 1.0 },
          { label: 'Não resolvido, envolveu outra empresa', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f7',
    nome: 'Qualidade – Calibração (MTech)',
    setor: 'Qualidade',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'In loco', pesoMax: 3,
        opcoes: [
          { label: 'Na data agendada', pontos: 3.0 },
          { label: 'Atraso inferior a 10%', pontos: 2.0 },
          { label: 'Atraso superior a 90%', pontos: 1.0 },
          { label: 'Atraso de 100%', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Laboratório Permanente', pesoMax: 3,
        opcoes: [
          { label: 'Na data agendada', pontos: 3.0 },
          { label: 'Atraso inferior a 10%', pontos: 2.0 },
          { label: 'Atraso superior a 90%', pontos: 1.0 },
          { label: 'Atraso de 100%', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f8',
    nome: 'Qualidade – Manutenção (MTech)',
    setor: 'Qualidade',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'In loco', pesoMax: 3,
        opcoes: [
          { label: 'Na data agendada', pontos: 3.0 },
          { label: 'Atraso inferior a 10%', pontos: 2.0 },
          { label: 'Atraso superior a 90%', pontos: 1.0 },
          { label: 'Atraso de 100%', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Laboratório Permanente', pesoMax: 3,
        opcoes: [
          { label: 'Na data agendada', pontos: 3.0 },
          { label: 'Atraso inferior a 10%', pontos: 2.0 },
          { label: 'Atraso superior a 90%', pontos: 1.0 },
          { label: 'Atraso de 100%', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f9',
    nome: 'SESMT – Remoção de Paciente',
    setor: 'SESMT',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Reclamações em relação ao serviço', pesoMax: 3,
        opcoes: [
          { label: 'Não houve reclamações', pontos: 3.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: '01 reclamação com impacto', pontos: 1.0 },
          { label: '02 reclamações com impacto', pontos: 0.5 },
          { label: '03 ou mais reclamações com impacto', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento da programação', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f10',
    nome: 'SESMT – Lavanderia',
    setor: 'SESMT',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Reclamações em relação ao serviço', pesoMax: 3,
        opcoes: [
          { label: 'Não houve reclamações', pontos: 3.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: '01 reclamação com impacto', pontos: 1.0 },
          { label: '02 reclamações com impacto', pontos: 0.5 },
          { label: '03 ou mais reclamações com impacto', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento da programação', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f11',
    nome: 'SESMT – Exames Periódicos',
    setor: 'SESMT',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Reclamações em relação ao serviço', pesoMax: 3,
        opcoes: [
          { label: 'Não houve reclamações', pontos: 3.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: '01 reclamação com impacto', pontos: 1.0 },
          { label: '02 reclamações com impacto', pontos: 0.5 },
          { label: '03 ou mais reclamações com impacto', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento da programação', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f12',
    nome: 'Segurança do Trabalho – Controle de Pragas / Caixa D\'água',
    setor: 'SESMT',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Reclamações em relação ao serviço', pesoMax: 3,
        opcoes: [
          { label: 'Não houve reclamações', pontos: 3.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: '01 reclamação com impacto', pontos: 1.0 },
          { label: '02 reclamações com impacto', pontos: 0.5 },
          { label: '03 ou mais reclamações com impacto', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento da programação', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f13',
    nome: 'SESMT – Extintores de Incêndio',
    setor: 'SESMT',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Reclamações em relação ao serviço', pesoMax: 3,
        opcoes: [
          { label: 'Não houve reclamações', pontos: 3.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: '01 reclamação com impacto', pontos: 1.0 },
          { label: '02 reclamações com impacto', pontos: 0.5 },
          { label: '03 ou mais reclamações com impacto', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento da programação', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f14',
    nome: 'Segurança do Trabalho – Resíduo e Incineração',
    setor: 'SESMT',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Reclamações em relação ao serviço', pesoMax: 3,
        opcoes: [
          { label: 'Não houve reclamações', pontos: 3.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: '01 reclamação com impacto', pontos: 1.0 },
          { label: '02 reclamações com impacto', pontos: 0.5 },
          { label: '03 ou mais reclamações com impacto', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento da programação', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f15',
    nome: 'Serviços dos Setores Técnicos',
    setor: 'Setor Técnico',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Prazo de Realização', pesoMax: 3,
        opcoes: [
          { label: 'Na data agendada', pontos: 3.0 },
          { label: 'Fora da data, mas reagendado', pontos: 2.0 },
          { label: 'Até 05 dias fora da data agendada', pontos: 1.0 },
          { label: 'Até 10 dias fora da data agendada', pontos: 0.5 },
          { label: 'Acima de 10 dias fora da data agendada', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Resolutividade', pesoMax: 4,
        opcoes: [
          { label: 'Resolvido no primeiro atendimento', pontos: 4.0 },
          { label: 'Resolvido no segundo atendimento', pontos: 2.0 },
          { label: 'Resolvido no terceiro atendimento', pontos: 1.0 },
          { label: 'Não resolvido, envolveu outra empresa', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f16',
    nome: 'Tecnologia da Informação',
    setor: 'TI',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Atendimento às solicitações feitas', pesoMax: 3,
        opcoes: [
          { label: 'Todas atendidas de imediato', pontos: 3.0 },
          { label: 'Não imediata, mas agendada e atendida no prazo', pontos: 2.0 },
          { label: 'Atendida fora do prazo determinado', pontos: 1.0 },
          { label: 'Não atendida, mas com explicação', pontos: 0.5 },
          { label: 'Não atendida e sem explicação', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento do contrato', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f17',
    nome: 'Triagem – Logística Motoqueiros',
    setor: 'Triagem e Logística',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 3.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 1.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Atrasos injustificados', pesoMax: 3,
        opcoes: [
          { label: 'Não houve atrasos', pontos: 3.0 },
          { label: '01 atraso', pontos: 2.0 },
          { label: '02 atrasos', pontos: 1.0 },
          { label: '03 atrasos', pontos: 0.5 },
          { label: '04 ou mais atrasos', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Cumprimento do contrato', pesoMax: 4,
        opcoes: [
          { label: 'Aprovação total', pontos: 4.0 },
          { label: 'Aprovação com ressalva (baixa criticidade)', pontos: 2.0 },
          { label: 'Aprovação com ressalva (alta criticidade)', pontos: 1.0 },
          { label: 'Reprovação', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f18',
    nome: 'Setor Técnico e Pré-Analítico – Laboratório de Apoio',
    setor: 'Setor Técnico',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 3,
        opcoes: [
          { label: 'Dentro da expectativa (sem cordialidade)', pontos: 3.0 },
          { label: 'Abaixo da expectativa', pontos: 1.5 },
          { label: 'Não atenderam a solicitação', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Prazo de Liberação', pesoMax: 3,
        opcoes: [
          { label: 'Na data agendada', pontos: 3.0 },
          { label: 'Fora da data, mas reagendado', pontos: 2.0 },
          { label: 'Até 05 dias fora da data agendada', pontos: 1.0 },
          { label: 'Até 10 dias fora da data agendada', pontos: 0.5 },
          { label: 'Acima de 10 dias fora da data agendada', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Recoleta por Extravio', pesoMax: 4,
        opcoes: [
          { label: 'Não houve nenhuma solicitação de recoleta', pontos: 4.0 },
          { label: 'Menos de 1% dos exames foram recoletados', pontos: 2.0 },
          { label: 'Menos de 5% dos exames foram recoletados', pontos: 1.0 },
          { label: 'Mais de 5% dos exames foram recoletados', pontos: 0 },
        ]
      },
    ]
  },
  {
    id: 'f19',
    nome: 'Núcleo Técnico – Ensaio de Proficiência (Controllab)',
    setor: 'Setor Técnico',
    tipo: 'servico',
    criterios: [
      {
        id: 'c1', nome: 'Atendimento', pesoMax: 1,
        opcoes: [
          { label: 'Atendimento dentro da expectativa', pontos: 1.0 },
          { label: 'Atendimento abaixo da expectativa', pontos: 0.5 },
          { label: 'Não houve atendimento', pontos: 0 },
        ]
      },
      {
        id: 'c2', nome: 'Prazo de Recebimento de Material', pesoMax: 2,
        opcoes: [
          { label: 'Na data agendada', pontos: 2.0 },
          { label: 'Fora da data, mas reagendado', pontos: 1.0 },
          { label: 'Até 05 dias fora da data agendada', pontos: 0.5 },
          { label: 'Acima de 05 dias fora da data agendada', pontos: 0 },
        ]
      },
      {
        id: 'c3', nome: 'Qualidade da Amostra', pesoMax: 4,
        opcoes: [
          { label: 'Todas dentro dos parâmetros', pontos: 4.0 },
          { label: 'Menos de 5% fora dos parâmetros', pontos: 2.0 },
          { label: 'Menos de 10% fora dos parâmetros', pontos: 1.0 },
          { label: 'Mais de 10% fora dos parâmetros', pontos: 0 },
        ]
      },
      {
        id: 'c4', nome: 'Avaliação da rodada', pesoMax: 3,
        opcoes: [
          { label: 'Todos os parâmetros avaliados', pontos: 3.0 },
          { label: 'Até 5% não avaliados', pontos: 2.0 },
          { label: 'Até 10% não avaliados', pontos: 1.0 },
          { label: 'Acima de 10% não avaliados', pontos: 0 },
        ]
      },
    ]
  },
];

const SEED_FORNECEDORES = [
  { id: 'fn1', nome: 'Security Company', tipo: 'servico', setor: 'Direção' },
  { id: 'fn2', nome: 'TechFrio', tipo: 'servico', setor: 'Direção' },
  { id: 'fn3', nome: 'IPEM', tipo: 'servico', setor: 'Qualidade' },
  { id: 'fn4', nome: 'DIOTEC', tipo: 'servico', setor: 'Qualidade' },
  { id: 'fn5', nome: 'MTech', tipo: 'servico', setor: 'Qualidade' },
  { id: 'fn6', nome: 'Controllab', tipo: 'servico', setor: 'Setor Técnico' },
  { id: 'fn7', nome: 'Analog', tipo: 'servico', setor: 'Triagem e Logística' },
];

// Associação: qual e-mail vê quais formulários (configurada pelo admin)
const SEED_ASSOCIACOES = [
  { id: 'a1', email: 'direcao@empresa.com', formularioId: 'f1', fornecedorId: 'fn1' },
  { id: 'a2', email: 'direcao@empresa.com', formularioId: 'f2', fornecedorId: 'fn2' },
  { id: 'a3', email: 'direcao@empresa.com', formularioId: 'f3', fornecedorId: null },
  { id: 'a4', email: 'qualidade@empresa.com', formularioId: 'f5', fornecedorId: 'fn3' },
  { id: 'a5', email: 'qualidade@empresa.com', formularioId: 'f6', fornecedorId: 'fn4' },
  { id: 'a6', email: 'qualidade@empresa.com', formularioId: 'f7', fornecedorId: 'fn5' },
  { id: 'a7', email: 'ti@empresa.com', formularioId: 'f16', fornecedorId: null },
  { id: 'a8', email: 'sesmt@empresa.com', formularioId: 'f9', fornecedorId: null },
  { id: 'a9', email: 'sesmt@empresa.com', formularioId: 'f13', fornecedorId: null },
];

const SEED_MATRIZ = {
  cert: 10,
  aprov: 8,
  parcial: 6
};
