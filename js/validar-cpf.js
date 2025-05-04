// Função para o frontend que envia a imagem para o servidor
function uploadAndValidateCPF(file) {
    let resultContainer = document.querySelector('.document-validation-result');
    if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.className = 'document-validation-result';
        document.getElementById('documentUpload').parentNode.appendChild(resultContainer);
    }
    
    // Mostrar carregando
    resultContainer.innerHTML = `
        <div style="padding:15px; background:rgba(255,255,255,0.05); border-radius:5px; display:flex; align-items:center; margin-top:15px;">
            <i class="fas fa-spinner fa-spin" style="margin-right:10px;"></i> Processando documento...
        </div>
    `;
    
    const formData = new FormData();
    formData.append('document', file);
    
    fetch('/api/validate-cpf', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Documento validado com sucesso
            resultContainer.innerHTML = `
                <div style="padding:15px; background:rgba(0,204,102,0.1); border-radius:5px; display:flex; align-items:center; margin-top:15px;">
                    <i class="fas fa-check-circle" style="margin-right:10px; color:#00cc66;"></i> ${data.message || 'Documento validado com sucesso!'}
                </div>
                <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
                    <img src="${URL.createObjectURL(file)}" alt="CPF Document" style="max-width:100%; max-height:300px; border-radius:5px;">
                    <div style="margin-top:15px; padding:10px; background:rgba(0,0,0,0.1); border-radius:5px;">
                        <div><strong>CPF:</strong> ${data.cpf}</div>
                        <div><strong>Nome:</strong> ${data.name || 'Não detectado'}</div>
                        ${data.birthDate ? `<div><strong>Nascimento:</strong> ${data.birthDate}</div>` : ''}
                    </div>
                    <button onclick="confirmCPFDocument('${data.cpf}')" style="margin-top:15px; background:#4CAF50; color:white; border:none; padding:10px 15px; border-radius:5px; cursor:pointer; width:100%;">
                        Confirmar Documento
                    </button>
                </div>
            `;
            
            // Auto-preencher o campo de CPF
            const cpfField = document.getElementById('cpf');
            if (cpfField) {
                cpfField.value = data.cpf;
            }
        } else {
            // Documento inválido
            resultContainer.innerHTML = `
                <div style="padding:15px; background:rgba(255,59,92,0.1); border-radius:5px; display:flex; align-items:center; margin-top:15px;">
                    <i class="fas fa-exclamation-circle" style="margin-right:10px; color:#ff3b5c;"></i> ${data.message || 'Documento inválido'}
                </div>
                <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
                    <img src="${URL.createObjectURL(file)}" alt="Document" style="max-width:100%; max-height:300px; border-radius:5px;">
                    <div style="margin-top:15px; padding:10px; background:rgba(255,255,255,0.05); border-radius:5px; font-size:0.8rem; color:#aaa; max-height:150px; overflow:auto;">
                        <p>A imagem não foi reconhecida como um cartão de CPF válido.</p>
                        <p>Por favor, envie uma imagem do cartão azul de CPF emitido pela Receita Federal.</p>
                    </div>
                    <button onclick="resetDocumentUpload()" style="margin-top:15px; background:#1e90ff; color:white; border:none; padding:10px 15px; border-radius:5px; cursor:pointer; width:100%;">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        // Fallback para processamento local se o servidor falhar
        processDocumentLocally(file, resultContainer);
    });
}

// Função fallback para processar o documento localmente
function processDocumentLocally(file, resultContainer) {
    // Mostrar interface de processamento manual
    resultContainer.innerHTML = `
        <div style="padding:15px; background:rgba(0,204,102,0.1); border-radius:5px; display:flex; align-items:center; margin-top:15px;">
            <i class="fas fa-check-circle" style="margin-right:10px; color:#00cc66;"></i> Imagem carregada com sucesso!
        </div>
        <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
            <img src="${URL.createObjectURL(file)}" alt="CPF Document" style="max-width:100%; max-height:300px; border-radius:5px;">
            <div style="margin-top:15px; padding:10px; background:rgba(0,0,0,0.1); border-radius:5px;">
                <p>Por favor, confirme as informações do documento:</p>
                <div class="manual-input-container" style="margin-top:10px;">
                    <label style="display:block; margin-bottom:5px; color:#aaa;">CPF:</label>
                    <input type="text" id="manual-cpf-input" style="width:100%; padding:8px; background:rgba(0,0,0,0.3); border:1px solid #444; border-radius:5px; color:white;" placeholder="Digite o CPF que aparece no documento">
                </div>
                <div class="manual-input-container" style="margin-top:10px;">
                    <label style="display:block; margin-bottom:5px; color:#aaa;">Nome:</label>
                    <input type="text" id="manual-name-input" style="width:100%; padding:8px; background:rgba(0,0,0,0.3); border:1px solid #444; border-radius:5px; color:white;" placeholder="Digite o nome que aparece no documento">
                </div>
            </div>
            <button onclick="confirmManualInput()" style="margin-top:15px; background:#4CAF50; color:white; border:none; padding:10px 15px; border-radius:5px; cursor:pointer; width:100%;">
                Confirmar Documento
            </button>
        </div>
    `;
}

// Função para confirmar entrada manual
function confirmManualInput() {
    const cpfInput = document.getElementById('manual-cpf-input');
    const nameInput = document.getElementById('manual-name-input');
    
    const cpf = cpfInput.value.trim();
    const name = nameInput.value.trim();
    
    if (!cpf) {
        alert("Por favor, digite o CPF que aparece no documento.");
        return;
    }
    
    // Preencher o campo CPF no formulário
    const formCpfField = document.getElementById('cpf');
    if (formCpfField) {
        formCpfField.value = cpf;
    }
    
    // Mostrar confirmação
    const resultContainer = document.querySelector('.document-validation-result');
    resultContainer.innerHTML = `
        <div style="padding:15px; background:rgba(0,204,102,0.1); border-radius:5px; display:flex; align-items:center; margin-top:15px;">
            <i class="fas fa-check-circle" style="margin-right:10px; color:#00cc66;"></i> Documento confirmado com sucesso!
        </div>
        <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
            <div style="margin-top:15px; padding:10px; background:rgba(0,204,102,0.1); border-radius:5px; border:1px solid #00cc66;">
                <div><strong>CPF:</strong> ${cpf}</div>
                ${name ? `<div><strong>Nome:</strong> ${name}</div>` : ''}
                <div><strong>Status:</strong> Verificado manualmente</div>
            </div>
        </div>
    `;
    
    // Adicionar campo hidden para indicar validação
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'cpf_document_validated';
    hiddenInput.value = 'true';
    document.querySelector('form').appendChild(hiddenInput);
}

// Função para confirmar o documento
function confirmCPFDocument(cpf) {
    // Preencher o campo CPF no formulário
    const cpfField = document.getElementById('cpf');
    if (cpfField) {
        cpfField.value = cpf;
    }
    
    // Mostrar confirmação
    const resultContainer = document.querySelector('.document-validation-result');
    const infoSection = resultContainer.querySelector('div div');
    if (infoSection) {
        infoSection.style.background = "rgba(76, 175, 80, 0.1)";
        infoSection.style.border = "1px solid #4CAF50";
    }
    
    const button = resultContainer.querySelector('button');
    if (button) {
        button.disabled = true;
        button.innerHTML = "✓ Documento Validado";
        button.style.background = "#888";
    }
    
    // Adicionar campo hidden para indicar validação
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'cpf_document_validated';
    hiddenInput.value = 'true';
    document.querySelector('form').appendChild(hiddenInput);
    
    alert("Documento de CPF validado com sucesso!");
}

// Função para resetar o upload
function resetDocumentUpload() {
    const documentUpload = document.getElementById('documentUpload');
    documentUpload.value = '';
    
    const resultContainer = document.querySelector('.document-validation-result');
    resultContainer.innerHTML = '';
}