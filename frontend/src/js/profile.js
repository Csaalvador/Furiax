// FanInsight AI - Módulo de Perfil
// Gerencia dados de perfil, integrações e análises consolidadas do usuário

import { getUserProfile, getFanInsights, getSocialConnections, getExternalProfiles } from './api.js';
import { showLoading, hideLoading, showNotification, state } from './app.js';

// Objeto de perfil unificado
let userProfile = null;
let profileInsights = null;
let profileComplete = false;

// Carregar perfil completo do usuário
export async function loadUserProfile() {
  showLoading();
  
  try {
    // Buscar todas as informações
    const profile = await getUserProfile();
    const insights = await getFanInsights();
    const socialConnections = await getSocialConnections();
    const externalProfiles = await getExternalProfiles();
    
    // Consolidar em um objeto unificado
    userProfile = {
      ...profile,
      insights,
      socialConnections,
      externalProfiles
    };
    
    // Atualizar insights
    profileInsights = generateProfileInsights(userProfile);
    
    // Determinar se o perfil está completo
    profileComplete = (
      profile &&
      profile.verifiedAt && 
      socialConnections && socialConnections.length > 0 &&
      externalProfiles && externalProfiles.length > 0
    );
    
    // Atualizar estado global
    state.userProfile = userProfile;
    state.profileComplete = profileComplete;
    
    console.log('Perfil do usuário carregado:', profileComplete ? 'Completo' : 'Incompleto');
    return userProfile;
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    showNotification('Erro ao carregar dados do perfil. Tente novamente.', 'error');
    return null;
  } finally {
    hideLoading();
  }
}

// Obter perfil atual
export function getCurrentProfile() {
  return userProfile;
}

// Verificar se o perfil está completo
export function isProfileComplete() {
  return profileComplete;
}

// Obter insights do perfil
export function getProfileInsights() {
  return profileInsights;
}

// Calcular pontuação geral do perfil
export function calculateOverallScore() {
  if (!userProfile || !userProfile.insights) {
    return 0;
  }
  
  // Pesos para diferentes métricas
  const weights = {
    socialEngagement: 0.35,
    competitiveEngagement: 0.35,
    loyaltyScore: 0.3
  };
  
  // Calcular pontuação ponderada
  const weightedScore = 
    (userProfile.insights.socialEngagement.score * weights.socialEngagement) +
    (userProfile.insights.competitiveEngagement.score * weights.competitiveEngagement) +
    (userProfile.insights.loyaltyScore * weights.loyaltyScore);
  
  // Arredondar para inteiro
  return Math.round(weightedScore);
}

// Determinar nível de fã
export function determineFanLevel() {
  const score = calculateOverallScore();
  
  if (score >= 85) return 'Superfã';
  if (score >= 70) return 'Fã Dedicado';
  if (score >= 50) return 'Fã Regular';
  if (score >= 30) return 'Fã Casual';
  return 'Iniciante';
}

// Gerar insights personalizados
function generateProfileInsights(profile) {
  if (!profile || !profile.insights) {
    return [];
  }
  
  const insights = [];
  
  // Insights de engajamento social
  if (profile.insights.socialEngagement.score >= 70) {
    insights.push({
      category: 'social',
      title: 'Alto Engajamento Social',
      description: 'Você demonstra um forte engajamento nas redes sociais com conteúdo da FURIA.',
      icon: 'social',
      score: profile.insights.socialEngagement.score
    });
  }
  
  // Insights de engajamento competitivo
  if (profile.insights.competitiveEngagement.score >= 70) {
    insights.push({
      category: 'competitive',
      title: 'Performance Competitiva',
      description: 'Seu histórico de jogos mostra um forte alinhamento com os títulos competitivos da FURIA.',
      icon: 'game',
      score: profile.insights.competitiveEngagement.score
    });
  }
  
  // Insights de lealdade
  if (profile.insights.loyaltyScore >= 70) {
    insights.push({
      category: 'loyalty',
      title: 'Alta Fidelidade',
      description: 'Sua participação em eventos e aquisição de produtos mostra um forte compromisso com a FURIA.',
      icon: 'loyalty',
      score: profile.insights.loyaltyScore
    });
  }
  
  // Insights de melhorias
  if (profile.socialConnections.length < 2) {
    insights.push({
      category: 'improvement',
      title: 'Conecte Mais Redes',
      description: 'Adicione mais redes sociais para uma análise mais completa do seu engajamento.',
      icon: 'add',
      actionUrl: '/social'
    });
  }
  
  if (profile.externalProfiles.length < 2) {
    insights.push({
      category: 'improvement',
      title: 'Adicione Mais Perfis',
      description: 'Conecte mais perfis de jogos para melhorar seu score competitivo.',
      icon: 'add',
      actionUrl: '/profiles'
    });
  }
  
  // Recomendações personalizadas
  if (profile.insights.recommendations && profile.insights.recommendations.length > 0) {
    profile.insights.recommendations.forEach((recommendation, index) => {
      if (index < 3) { // Limitar a 3 recomendações
        insights.push({
          category: 'recommendation',
          title: `Recomendação #${index + 1}`,
          description: recommendation,
          icon: 'star'
        });
      }
    });
  }
  
  return insights;
}

// Verificar quais experiências exclusivas estão desbloqueadas
export function getUnlockedExperiences() {
  const score = calculateOverallScore();
  
  // Lista de todas as experiências possíveis
  const allExperiences = [
    {
      id: 'early_access',
      title: 'Early Access',
      description: 'Acesso antecipado a novos produtos da FURIA antes do lançamento oficial.',
      requiredLevel: 1, // Nível mínimo requerido (1 = iniciante)
      requiredScore: 20,
      icon: 'shop'
    },
    {
      id: 'exclusive_content',
      title: 'Conteúdo Exclusivo',
      description: 'Acesso a vídeos e conteúdos exclusivos dos bastidores da FURIA.',
      requiredLevel: 2, // Nível mínimo (2 = fã casual)
      requiredScore: 40,
      icon: 'video'
    },
    {
      id: 'meet_greet',
      title: 'Meet & Greet',
      description: 'Encontros virtuais exclusivos com jogadores e equipes da FURIA.',
      requiredLevel: 3, // Nível mínimo (3 = fã regular)
      requiredScore: 60,
      icon: 'users'
    },
    {
      id: 'beta_tester',
      title: 'Beta Tester',
      description: 'Participe de testes beta de novos produtos e serviços da FURIA.',
      requiredLevel: 3, // Nível mínimo (3 = fã regular)
      requiredScore: 65,
      icon: 'lab'
    },
    {
      id: 'backstage_pass',
      title: 'Backstage Pass',
      description: 'Acesso aos bastidores em eventos onde a FURIA estiver competindo.',
      requiredLevel: 4, // Nível mínimo (4 = fã dedicado)
      requiredScore: 75,
      icon: 'vip'
    },
    {
      id: 'private_events',
      title: 'Eventos Privados',
      description: 'Convites para eventos exclusivos organizados pela FURIA para seus maiores fãs.',
      requiredLevel: 5, // Nível mínimo (5 = superfã)
      requiredScore: 85,
      icon: 'calendar'
    },
    {
      id: 'custom_merch',
      title: 'Mercadoria Personalizada',
      description: 'Acesso a produtos com seu nome personalizado e edições limitadas.',
      requiredLevel: 5, // Nível mínimo (5 = superfã)
      requiredScore: 90,
      icon: 'gift'
    }
  ];
  
  // Filtrar experiências desbloqueadas com base na pontuação
  return allExperiences.map(experience => ({
    ...experience,
    unlocked: score >= experience.requiredScore,
    progress: Math.min(100, Math.round((score / experience.requiredScore) * 100))
  }));
}

// Obter insights de redes sociais
export function getSocialInsights() {
  if (!userProfile || !userProfile.insights) {
    return {};
  }
  
  return {
    mentions: userProfile.insights.socialMentions || 0,
    interactions: userProfile.insights.socialInteractions || 0,
    frequency: userProfile.insights.interactionFrequency || 'Baixa',
    platforms: userProfile.socialConnections.map(conn => conn.platform) || []
  };
}

// Obter insights de jogos
export function getGameInsights() {
  if (!userProfile || !userProfile.externalProfiles) {
    return {};
  }
  
  // Extrair estatísticas de jogos de todos os perfis
  const gameStats = userProfile.externalProfiles
    .filter(profile => profile.gameStats)
    .flatMap(profile => profile.gameStats);
  
  // Consolidar estatísticas de jogos (somar horas por jogo)
  const consolidatedStats = {};
  gameStats.forEach(stat => {
    if (!consolidatedStats[stat.name]) {
      consolidatedStats[stat.name] = { name: stat.name, hours: 0 };
    }
    consolidatedStats[stat.name].hours += stat.hours;
  });
  
  // Converter para array e ordenar por horas jogadas
  const topGames = Object.values(consolidatedStats)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5); // Top 5 jogos
  
  // Calcular nível competitivo baseado nos perfis
  const avgRelevanceScore = userProfile.externalProfiles.reduce(
    (sum, profile) => sum + (profile.relevanceScore || 0), 0
  ) / userProfile.externalProfiles.length;
  
  let competitiveLevel;
  if (avgRelevanceScore >= 80) competitiveLevel = 'Pro-Player';
  else if (avgRelevanceScore >= 60) competitiveLevel = 'Semi-Pro';
  else if (avgRelevanceScore >= 40) competitiveLevel = 'Competitivo';
  else if (avgRelevanceScore >= 20) competitiveLevel = 'Amador';
  else competitiveLevel = 'Casual';
  
  return {
    topGames,
    competitiveLevel,
    competitiveScore: Math.round(avgRelevanceScore),
    platforms: userProfile.externalProfiles.map(profile => profile.platform)
  };
}

// Gerar resumo rápido do perfil
export function generateProfileSummary() {
  if (!userProfile) {
    return 'Perfil não disponível';
  }
  
  const fanLevel = determineFanLevel();
  const score = calculateOverallScore();
  const socialCount = userProfile.socialConnections?.length || 0;
  const profilesCount = userProfile.externalProfiles?.length || 0;
  
  return {
    name: userProfile.personalInfo?.fullName || 'Fã Anônimo',
    fanLevel,
    score,
    verified: !!userProfile.verifiedAt,
    socialCount,
    profilesCount,
    fanSince: userProfile.registeredAt ? new Date(userProfile.registeredAt) : null,
    completionRate: calculateProfileCompletionRate()
  };
}

// Calcular taxa de conclusão do perfil (porcentagem)
function calculateProfileCompletionRate() {
  if (!userProfile) {
    return 0;
  }
  
  // Pesos para diferentes seções do perfil
  const weights = {
    personalInfo: 20,
    verification: 25,
    socialConnections: 30,
    externalProfiles: 25
  };
  
  let completion = 0;
  
  // Informações pessoais
  if (userProfile.personalInfo) {
    completion += weights.personalInfo;
  }
  
  // Verificação
  if (userProfile.verifiedAt) {
    completion += weights.verification;
  }
  
  // Redes sociais (distribuído pelo número de conexões, até 3)
  const socialCount = userProfile.socialConnections?.length || 0;
  const socialWeight = Math.min(socialCount, 3) * (weights.socialConnections / 3);
  completion += socialWeight;
  
  // Perfis externos (distribuído pelo número de perfis, até 3)
  const profilesCount = userProfile.externalProfiles?.length || 0;
  const profilesWeight = Math.min(profilesCount, 3) * (weights.externalProfiles / 3);
  completion += profilesWeight;
  
  return Math.round(completion);
}

// Obter histórico recente de interações
export function getRecentInteractions(limit = 5) {
  if (!userProfile || !userProfile.insights || !userProfile.insights.recentInteractions) {
    return [];
  }
  
  // Ordenar por data (mais recente primeiro)
  return userProfile.insights.recentInteractions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit); // Limitar ao número solicitado
}

// Formatar data para exibição
export function formatDate(dateString, format = 'short') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  }
  
  if (format === 'relative') {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'ano' : 'anos'} atrás`;
    }
  }
  
  return dateString;
}

// Gerar URL compartilhável do perfil
export function generateShareableURL(username) {
  const baseURL = window.location.origin;
  return `${baseURL}/fan-profile/${username || 'share'}`;
}

// Gerar imagem do perfil para compartilhamento
export function generateProfileImage() {
  // Em um sistema real, isso geraria uma imagem personalizada
  // Aqui vamos simplesmente retornar a URL de uma imagem padrão
  
  return `${window.location.origin}/assets/profile-share-template.jpg`;
}