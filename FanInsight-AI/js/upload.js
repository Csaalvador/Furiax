/**
 * FanInsight AI - Sistema de Análise de Perfil de Fãs da FURIA
 * Gerenciamento de Uploads e Verificação
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos de Documento
    const documentUpload = document.getElementById('document-upload');
    const documentPreview = document.getElementById('document-preview');
    const documentName = document.getElementById('document-name');
    const removeDocument = document.getElementById('remove-document');
    
    // Elementos de Selfie
    const selfieUpload = document.getElementById('selfie-upload');
    const selfiePreview = document.getElementById('selfie-preview');
    const selfieName = document.getElementById('selfie-name');
    const removeSelfie = document.getElementById('remove-selfie');
    
    // Elementos de verificação
    const verifyButton = document.getElementById('verify-button');
    const verificationStatus = document.getElementById('verification-status');
    const verificationSuccess = document.getElementById('verification-success');
    const verificationError = document.getElementById('verification-error');
    const retryButton = document.getElementById('retry-button');
    const errorMessage = document.getElementById('error-message');
    
    // Status de verificação
    const documentStatusIcon = document.getElementById('document-status-icon');
    const documentStatusText = document.getElementById('document-status-text');
    const faceStatusIcon = document.getElementById('face-status-icon');
    const faceStatusText = document.getElementById('face-status-text');
    
    // Armazenar arquivos
    let documentFile = null;
    let selfieFile = null;
    
    // Verificar se estamos na página de verificação
    if (!documentUpload || !selfieUpload) return;
    
    // Configurar listeners de eventos para uploads
    documentUpload.addEventListener('change', handleDocumentUpload);
    selfieUpload.addEventListener('change', handleSelfieUpload);
    
    // Botões de remover
    if (removeDocument) removeDocument.addEventListener('click', removeDocumentFile);
    if (removeSelfie) removeSelfie.addEventListener('click', removeSelfieFile);
    
    // Botão de verificação
    if (verifyButton) verifyButton.addEventListener('click', startVerificationProcess);
    
    // Botão de tentar novamente
    if (retryButton) retryButton.addEventListener('click', resetVerification);
    
    // Manipulador para upload de documento
    function handleDocumentUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Verificar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('Por favor, envie apenas arquivos JPG, PNG ou PDF.');
            event.target.value = '';
            return;
        }
        
        // Verificar tamanho do arquivo (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('O arquivo é muito grande. Por favor, envie um arquivo menor que 5MB.');
            event.target.value = '';
            return;
        }
        
        // Armazenar o arquivo
        documentFile = file;
        
        // Atualizar a UI
        documentName.textContent = file.name;
        documentPreview.classList.remove('hidden');
        
        // Verificar se podemos habilitar o botão de verificação
        checkVerifyButton();
    }
    
    // Manipulador para upload de selfie
    function handleSelfieUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Verificar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Por favor, envie apenas arquivos JPG ou PNG.');
            event.target.value = '';
            return;
        }
        
        // Verificar tamanho do arquivo (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('O arquivo é muito grande. Por favor, envie um arquivo menor que 5MB.');
            event.target.value = '';
            return;
        }
        
        // Armazenar o arquivo
        selfieFile = file;
        
        // Atualizar a UI
        selfieName.textContent = file.name;
        selfiePreview.classList.remove('hidden');
        
        // Verificar se podemos habilitar o botão de verificação
        checkVerifyButton();
    }
    
    // Remover documento
    function removeDocumentFile() {
        documentFile = null;
        documentUpload.value = '';
        documentPreview.classList.add('hidden');
        
        // Desabilitar botão de verificação
        verifyButton.disabled = true;
        verifyButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    // Remover selfie
    function removeSelfieFile() {
        selfieFile = null;
        selfieUpload.value = '';
        selfiePreview.classList.add('hidden');
        
        // Desabilitar botão de verificação
        verifyButton.disabled = true;
        verifyButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    // Verificar se podemos habilitar o botão de verificação
    function checkVerifyButton() {
        if (documentFile && selfieFile) {
            verifyButton.disabled = false;
            verifyButton.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            verifyButton.disabled = true;
            verifyButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
    
    // Iniciar processo de verificação
    async function startVerificationProcess() {
        // Desativar botão durante a verificação
        verifyButton.disabled = true;
        verifyButton.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Mostrar o status da verificação
        verificationStatus.classList.remove('hidden');
        verificationSuccess.classList.add('hidden');
        verificationError.classList.add('hidden');
        
        try {
            // Verificar documento
            const documentResult = await verifyDocument(documentFile);
            
            // Verificação de documento bem-sucedida
            documentStatusIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
            documentStatusIcon.classList.remove('bg-gray-600');
            documentStatusIcon.classList.add('bg-green-600');
            documentStatusText.textContent = 'Documento verificado com sucesso';
            
            // Atualizar status da verificação facial
            faceStatusText.textContent = 'Processando comparação facial...';
            
            // Verificar faces
            const faceResult = await compareFaces(documentFile, selfieFile);
            
            if (faceResult.match) {
                // Verificação facial bem-sucedida
                faceStatusIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
                faceStatusIcon.classList.remove('bg-gray-600');
                faceStatusIcon.classList.add('bg-green-600');
                faceStatusText.textContent = `Comparação facial concluída (${Math.round(faceResult.confidence * 100)}% de confiança)`;
                
                // Atualizar o objeto FanInsight
                // Garantir que FanInsight existe
   // Garantir que o objeto existe
window.FanInsight = window.FanInsight || {};
window.FanInsight.userData = window.FanInsight.userData || {};

// Criar função de salvar sessão
window.FanInsight.saveSession = function () {
    localStorage.setItem('fanInsightUserData', JSON.stringify(window.FanInsight.userData));
    console.log('Sessão salva com sucesso!');
};

                
                // Salvar na sessão
                window.FanInsight.saveSession();
                
                // Mostrar sucesso após 1.5 segundos (para dar tempo do usuário ver o status)
                setTimeout(() => {
                    verificationStatus.classList.add('hidden');
                    verificationSuccess.classList.remove('hidden');
                }, 1500);
            } else {
                // Falha na verificação facial
                throw new Error('A comparação facial não confirmou sua identidade. Por favor, tente novamente com uma foto mais clara.');
            }
        } catch (error) {
            console.error('Erro no processo de verificação:', error);
            
            // Atualizar UI para mostrar erro
            errorMessage.textContent = error.message || 'Ocorreu um erro durante o processo de verificação. Por favor, tente novamente.';
            verificationStatus.classList.add('hidden');
            verificationError.classList.remove('hidden');
        }
    }
    
    // Resetar o processo de verificação
    function resetVerification() {
        // Esconder mensagens
        verificationStatus.classList.add('hidden');
        verificationSuccess.classList.add('hidden');
        verificationError.classList.add('hidden');
        
        // Resetar ícones de status
        documentStatusIcon.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
        documentStatusIcon.classList.remove('bg-green-600', 'bg-red-600');
        documentStatusIcon.classList.add('bg-gray-600');
        documentStatusText.textContent = 'Processando...';
        
        faceStatusIcon.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
        faceStatusIcon.classList.remove('bg-green-600', 'bg-red-600');
        faceStatusIcon.classList.add('bg-gray-600');
        faceStatusText.textContent = 'Aguardando processamento do documento...';
        
        // Reativar botão se ambos os arquivos estiverem presentes
        checkVerifyButton();
    }
    
    // Função para verificar documento (simulada)
    async function verifyDocument(file) {
        // Em uma implementação real, você enviaria o arquivo para o backend
        // e processaria lá com OCR, etc.
        
        return new Promise((resolve, reject) => {
            // Simular processamento
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        name: 'Nome encontrado no documento',
                        cpf: '123.456.789-00',
                        verified: true
                    }
                });
                
                // Para simular um erro, use:
                // reject(new Error('Falha ao verificar documento. Certifique-se de que o documento está legível.'));
            }, 2000);
        });
    }
    
    // Função para comparar faces (simulada)
    async function compareFaces(documentFile, selfieFile) {
        // Em uma implementação real, você enviaria os arquivos para o backend
        // e processaria lá com algoritmos de comparação facial
        
        return new Promise((resolve, reject) => {
            // Simular processamento
            setTimeout(() => {
                resolve({
                    success: true,
                    match: true,
                    confidence: 0.92 // 92% de confiança na correspondência
                });
                
                // Para simular um erro, use:
                // resolve({ success: true, match: false, confidence: 0.45 });
                // ou
                // reject(new Error('Erro ao processar a comparação facial.'));
            }, 2500);
        });
    }
});