// Contador FURIAX simples - apenas minutos e dias
document.addEventListener('DOMContentLoaded', function() {
    // Criar uma data de início se não existir
    if(!localStorage.getItem('fanStartTime')) {
      // Definir uma data aleatória no passado
      const diasAtras = Math.floor(Math.random() * 1000) + 1; // Entre 1 e 1000 dias
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasAtras);
      localStorage.setItem('fanStartTime', dataInicio.getTime());
    }
    
    // Atualizar o tempo a cada segundo
    setInterval(atualizarTempoFa, 1000);
    atualizarTempoFa(); // Executar imediatamente
  });
  
  function atualizarTempoFa() {
    // Encontrar o elemento onde mostrar o tempo
    const elementoTempo = document.querySelector('.fan-stat-value');
    if(!elementoTempo) return;
    
    const dataInicio = new Date(parseInt(localStorage.getItem('fanStartTime')));
    const agora = new Date();
    const diff = agora - dataInicio;
    
    // Calcular apenas minutos e dias
    const totalMinutos = Math.floor(diff / (1000 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const minutos = totalMinutos % (60 * 24); // Minutos do dia atual
    
    // Criar texto de exibição
    const texto = `${dias} dias e ${minutos} minutos`;
    elementoTempo.textContent = texto;
  }
  
  // Para resetar o tempo (copie no console)
  // localStorage.removeItem('fanStartTime'); location.reload();