// FanInsight AI - Módulo de Validação
// Gerencia validações de formulários e dados do usuário

// Validação de dados de registro
export function validateRegistrationData(formData) {
    const errors = {};
    
    // Validar nome completo
    if (!formData.get('fullName') || formData.get('fullName').trim().length < 3) {
      errors.fullName = 'Nome completo é obrigatório e deve ter pelo menos 3 caracteres';
    }
    
    // Validar CPF
    if (!validateCPF(formData.get('cpf'))) {
      errors.cpf = 'CPF inválido';
    }
    
    // Validar data de nascimento
    if (!formData.get('birthDate')) {
      errors.birthDate = 'Data de nascimento é obrigatória';
    } else {
      const birthDate = new Date(formData.get('birthDate'));
      const now = new Date();
      const minAgeDate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
      
      if (birthDate > minAgeDate) {
        errors.birthDate = 'Você deve ter pelo menos 13 anos para se registrar';
      }
    }
    
    // Validar e-mail
    if (!validateEmail(formData.get('email'))) {
      errors.email = 'E-mail inválido';
    }
    
    // Validar telefone
    if (!validatePhone(formData.get('phone'))) {
      errors.phone = 'Telefone inválido';
    }
    
    // Validar CEP
    if (!validateZipCode(formData.get('zipCode'))) {
      errors.zipCode = 'CEP inválido';
    }
    
    // Validar endereço
    if (!formData.get('street') || formData.get('street').trim().length < 3) {
      errors.street = 'Rua é obrigatória';
    }
    
    if (!formData.get('number') || formData.get('number').trim().length === 0) {
      errors.number = 'Número é obrigatório';
    }
    
    if (!formData.get('neighborhood') || formData.get('neighborhood').trim().length < 2) {
      errors.neighborhood = 'Bairro é obrigatório';
    }
    
    if (!formData.get('city') || formData.get('city').trim().length < 2) {
      errors.city = 'Cidade é obrigatória';
    }
    
    if (!formData.get('state') || formData.get('state').trim().length === 0) {
      errors.state = 'Estado é obrigatório';
    }
    
    // Validar interesses (pelo menos um jogo deve ser selecionado)
    const selectedGames = formData.getAll('games');
    if (!selectedGames || selectedGames.length === 0) {
      errors.games = 'Selecione pelo menos um jogo';
    }
    
    // Validar senha
    if (!validatePassword(formData.get('password'))) {
      errors.password = 'A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números';
    }
    
    // Validar confirmação de senha
    if (formData.get('password') !== formData.get('confirmPassword')) {
      errors.confirmPassword = 'As senhas não coincidem';
    }
    
    // Validar termos de uso
    if (!formData.get('terms')) {
      errors.terms = 'Você deve aceitar os termos de uso';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Validação de arquivos de verificação
  export function validateVerificationFiles(documentFile, selfieFile) {
    const errors = {};
    
    // Validar arquivo de documento
    if (!documentFile) {
      errors.document = 'O documento é obrigatório';
    } else {
      // Verificar tamanho (máximo 5MB)
      if (documentFile.size > 5 * 1024 * 1024) {
        errors.document = 'O documento deve ter no máximo 5MB';
      }
      
      // Verificar tipo (imagem ou PDF)
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(documentFile.type)) {
        errors.document = 'O documento deve ser uma imagem (JPG, PNG) ou PDF';
      }
    }
    
    // Validar arquivo de selfie
    if (!selfieFile) {
      errors.selfie = 'A selfie é obrigatória';
    } else {
      // Verificar tamanho (máximo 5MB)
      if (selfieFile.size > 5 * 1024 * 1024) {
        errors.selfie = 'A selfie deve ter no máximo 5MB';
      }
      
      // Verificar tipo (apenas imagem)
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(selfieFile.type)) {
        errors.selfie = 'A selfie deve ser uma imagem (JPG, PNG)';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Validação de perfil externo
  export function validateExternalProfile(profileData) {
    const errors = {};
    
    // Validar plataforma
    if (!profileData.platform || profileData.platform.trim() === '') {
      errors.platform = 'A plataforma é obrigatória';
    }
    
    // Validar nome de usuário
    if (!profileData.username || profileData.username.trim() === '') {
      errors.username = 'O nome de usuário é obrigatório';
    }
    
    // Validar URL
    if (!profileData.url || !validateURL(profileData.url)) {
      errors.url = 'URL inválida';
    }
    
    // Validar plataforma personalizada (se aplicável)
    if (profileData.platform === 'other' && (!profileData.customPlatform || profileData.customPlatform.trim() === '')) {
      errors.customPlatform = 'O nome da plataforma é obrigatório';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Funções de validação auxiliares
  
  // Validar CPF
  export function validateCPF(cpf) {
    if (!cpf) return false;
    
    // Remover caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verificar se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;
    
    if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;
    
    return digitoVerificador2 === parseInt(cpf.charAt(10));
  }
  
  // Validar e-mail
  export function validateEmail(email) {
    if (!email) return false;
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  // Validar telefone
  export function validatePhone(phone) {
    if (!phone) return false;
    
    // Remover caracteres não numéricos
    phone = phone.replace(/\D/g, '');
    
    // Verificar formato brasileiro (10 ou 11 dígitos)
    return phone.length >= 10 && phone.length <= 11;
  }
  
  // Validar CEP
  export function validateZipCode(zipCode) {
    if (!zipCode) return false;
    
    // Remover caracteres não numéricos
    zipCode = zipCode.replace(/\D/g, '');
    
    // Verificar formato brasileiro (8 dígitos)
    return zipCode.length === 8;
  }
  
  // Validar senha
  export function validatePassword(password) {
    if (!password) return false;
    
    // Pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }
  
  // Validar URL
  export function validateURL(url) {
    if (!url) return false;
    
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }