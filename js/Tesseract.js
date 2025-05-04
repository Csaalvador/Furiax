// Função para processar o documento localmente com Tesseract OCR
// Esta função é usada como fallback quando o servidor não está disponível
function processDocumentWithOCR(file) {
    // Mostrar loading state
    const resultContainer = document.querySelector('.document-validation-result');
    resultContainer.innerHTML = `
      <div class="validation-loading">
        <i class="fas fa-spinner fa-spin"></i> Processando documento localmente...
      </div>
    `;
    
    // Criar URL do arquivo para processamento
    const imageUrl = URL.createObjectURL(file);
    
    // Processar com Tesseract.js
    Tesseract.recognize(
      imageUrl,
      'por', // Português
      { 
        logger: m => {
          if (m.status === 'recognizing text') {
            resultContainer.innerHTML = `
              <div class="validation-loading">
                <i class="fas fa-spinner fa-spin"></i> Processando documento... ${Math.round(m.progress * 100)}%
              </div>
            `;
          }
        }
      }
    ).then(({ data: { text } }) => {
      // Liberar a URL do objeto
      URL.revokeObjectURL(imageUrl);
      
      // Tentar encontrar CPF no texto extraído
      const cpf = extractCPFFromText(text);
      
      if (cpf) {
        resultContainer.innerHTML = `
          <div class="validation-success">
            <i class="fas fa-check-circle"></i> Documento processado com sucesso!
          </div>
          <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
            <img src="${URL.createObjectURL(file)}" alt="CPF Document" style="max-width:100%; max-height:300px; border-radius:5px;">
            
            <div style="margin-top:15px; padding:10px; background:rgba(0,204,102,0.1); border-radius:5px; border:1px solid rgba(0,204,102,0.3);">
              <div><strong>CPF:</strong> ${cpf}</div>
              <div><strong>Status:</strong> Verificado localmente</div>
            </div>
            
            <button onclick="confirmCPF('${cpf}')" style="margin-top:15px; background:#4CAF50; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; width:100%; font-weight:bold;">
              Confirmar Documento
            </button>
          </div>
        `;
        
        // Auto-preencher o campo de CPF
        const cpfField = document.getElementById('cpf');
        if (cpfField) {
          cpfField.value = cpf;
        }
      } else {
        // Não encontrou CPF válido
        resultContainer.innerHTML = `
          <div class="validation-error">
            <i class="fas fa-exclamation-circle"></i> Não foi possível identificar um CPF válido.
          </div>
          <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
            <img src="${URL.createObjectURL(file)}" alt="Document" style="max-width:100%; max-height:300px; border-radius:5px;">
            <div style="margin-top:15px; padding:10px; background:rgba(255,255,255,0.05); border-radius:5px; font-size:0.9rem; color:#aaa; max-height:150px; overflow:auto;">
              <p>Texto extraído:</p>
              <pre style="white-space: pre-wrap; word-break: break-word;">${text}</pre>
            </div>
            <div style="display:flex; gap:10px; margin-top:15px;">
              <button onclick="document.getElementById('documentUpload').click()" style="flex:1; background:#1e90ff; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer;">
                Tentar novamente
              </button>
              <button onclick="openManualInputForm()" style="flex:1; background:#555; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer;">
                Inserir manualmente
              </button>
            </div>
          </div>
        `;
      }
    }).catch(error => {
      console.error('Erro de OCR:', error);
      resultContainer.innerHTML = `
        <div class="validation-error">
          <i class="fas fa-exclamation-circle"></i> Erro ao processar o documento.
        </div>
        <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
          <p style="color:#ff3b5c;">Ocorreu um erro ao processar o documento. Por favor, tente novamente ou insira o CPF manualmente.</p>
          <div style="display:flex; gap:10px; margin-top:15px;">
            <button onclick="document.getElementById('documentUpload').click()" style="flex:1; background:#1e90ff; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer;">
              Tentar novamente
            </button>
            <button onclick="openManualInputForm()" style="flex:1; background:#555; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer;">
              Inserir manualmente
            </button>
          </div>
        </div>
      `;
    });
  }
  
  // Formulário para input manual
  function openManualInputForm() {
    const resultContainer = document.querySelector('.document-validation-result');
    resultContainer.innerHTML = `
      <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
        <h3 style="color:var(--primary); margin-bottom:15px;">Inserir CPF manualmente</h3>
        <div style="margin-bottom:15px;">
          <label style="display:block; margin-bottom:5px; color:#aaa;">CPF:</label>
          <input type="text" id="manual-cpf-input" style="width:100%; padding:12px; background:rgba(255,255,255,0.05); border:1px solid #444; border-radius:5px; color:white;" placeholder="Digite o CPF (somente números)">
        </div>
        <button onclick="submitManualCPF()" style="margin-top:15px; background:#4CAF50; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; width:100%; font-weight:bold;">
          Confirmar CPF
        </button>
      </div>
    `;
    
    // Adicionar máscara para CPF
    const manualCpfInput = document.getElementById('manual-cpf-input');
    if (manualCpfInput) {
      manualCpfInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        if (value.length > 9) {
          this.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
          this.value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
        } else if (value.length > 3) {
          this.value = value.replace(/(\d{3})(\d+)/, '$1.$2');
        } else {
          this.value = value;
        }
      });
    }
  }
  
  // Validar e submeter CPF manual
  function submitManualCPF() {
    const cpfInput = document.getElementById('manual-cpf-input');
    if (!cpfInput) return;
    
    let cpf = cpfInput.value.replace(/\D/g, '');
    
    // Validar CPF
    if (cpf.length !== 11 || !/^\d+$/.test(cpf)) {
      alert('Por favor, insira um CPF válido com 11 dígitos.');
      return;
    }
    
    // Formatar CPF
    const formattedCPF = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    // Preencher o campo CPF no formulário
    const formCpfField = document.getElementById('cpf');
    if (formCpfField) {
      formCpfField.value = formattedCPF;
    }
    
    // Mostrar confirmação
    const resultContainer = document.querySelector('.document-validation-result');
    resultContainer.innerHTML = `
      <div class="validation-success">
        <i class="fas fa-check-circle"></i> CPF inserido manualmente com sucesso!
      </div>
      <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
        <div style="margin-top:5px; padding:10px; background:rgba(0,204,102,0.1); border-radius:5px; border:1px solid rgba(0,204,102,0.3);">
          <div><strong>CPF:</strong> ${formattedCPF}</div>
          <div><strong>Status:</strong> Verificado manualmente</div>
        </div>
      </div>
    `;
    
    // Mostrar notificação
    showNotification('Sucesso', 'CPF registrado com sucesso!', 'success');
  }
  
  // Função auxiliar para extrair CPF do texto
  function extractCPFFromText(text) {
    // Padrão para CPF em vários formatos (xxx.xxx.xxx-xx, xxxxxxxxxxx, etc.)
    const cpfPattern = /\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\.\s]?\d{2}/g;
    const matches = text.match(cpfPattern);
    
    if (!matches || matches.length === 0) {
      return null;
    }
    
    // Verificar cada match para CPF válido
    for (let i = 0; i < matches.length; i++) {
      const potentialCPF = matches[i].replace(/[^\d]/g, '');
      if (validateCPF(potentialCPF)) {
        // Formatar como 123.456.789-09
        return potentialCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
    }
    
    return null;
  }
  
  // Função para validar o formato do CPF
  function validateCPF(cpf) {
    // Remover caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verificar se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }
    
    // Verificar se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1+$/.test(cpf)) {
      return false;
    }
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    // Verificar se os dígitos verificadores estão corretos
    return (parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2);
  }