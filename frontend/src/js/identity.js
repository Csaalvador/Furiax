// FanInsight AI - Módulo de Identidade
// Gerencia processamento de documentos, reconhecimento facial e verificação de identidade

import { showLoading, hideLoading, showNotification, state } from './app.js';
import { submitVerification, checkVerificationStatus } from './api.js';
import { validateVerificationFiles } from './validation.js';

// Configurações do módulo de identidade
const IDENTITY_CONFIG = {
  // Dimensões para imagens de preview
  previewMaxWidth: 400,
  previewMaxHeight: 300,
  
  // Formatos aceitos
  acceptedDocumentFormats: ['image/jpeg', 'image/png', 'application/pdf'],
  acceptedSelfieFormats: ['image/jpeg', 'image/png'],
  
  // Limite de tamanho de arquivos (5MB)
  maxFileSize: 5 * 1024 * 1024
};

// Processar upload de documento
export async function processDocumentUpload(file, previewElement) {
  if (!file) {
    showNotification('Selecione um arquivo de documento válido', 'error');
    return null;
  }
  
  // Validar tamanho e formato
  if (file.size > IDENTITY_CONFIG.maxFileSize) {
    showNotification('O arquivo é muito grande. O tamanho máximo é 5MB.', 'error');
    return null;
  }
  
  if (!IDENTITY_CONFIG.acceptedDocumentFormats.includes(file.type)) {
    showNotification('Formato inválido. Use JPG, PNG ou PDF.', 'error');
    return null;
  }
  
  // Exibir preview
  try {
    await displayDocumentPreview(file, previewElement);
    return file;
  } catch (error) {
    console.error('Erro ao processar documento:', error);
    showNotification('Erro ao processar documento. Tente novamente.', 'error');
    return null;
  }
}

// Processar upload de selfie
export async function processSelfieUpload(file, previewElement) {
  if (!file) {
    showNotification('Selecione uma imagem para a selfie', 'error');
    return null;
  }
  
  // Validar tamanho e formato
  if (file.size > IDENTITY_CONFIG.maxFileSize) {
    showNotification('O arquivo é muito grande. O tamanho máximo é 5MB.', 'error');
    return null;
  }
  
  if (!IDENTITY_CONFIG.acceptedSelfieFormats.includes(file.type)) {
    showNotification('Formato inválido. Use JPG ou PNG.', 'error');
    return null;
  }
  
  // Exibir preview
  try {
    await displaySelfiePreview(file, previewElement);
    return file;
  } catch (error) {
    console.error('Erro ao processar selfie:', error);
    showNotification('Erro ao processar selfie. Tente novamente.', 'error');
    return null;
  }
}

// Exibir preview do documento
function displayDocumentPreview(file, previewElement) {
  return new Promise((resolve, reject) => {
    if (!previewElement) {
      reject(new Error('Elemento de preview não encontrado'));
      return;
    }
    
    if (file.type === 'application/pdf') {
      // Para PDFs, exibir um ícone
      previewElement.innerHTML = `
        <div class="flex items-center justify-center mb-4">
          <svg class="h-16 w-16 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span class="ml-2 text-gray-300">${file.name}</span>
        </div>
      `;
      resolve(file);
    } else {
      // Para imagens, criar um preview redimensionado
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
          // Redimensionar imagem para preview
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calcular proporções para redimensionamento
          if (width > IDENTITY_CONFIG.previewMaxWidth) {
            height = (height * IDENTITY_CONFIG.previewMaxWidth) / width;
            width = IDENTITY_CONFIG.previewMaxWidth;
          }
          
          if (height > IDENTITY_CONFIG.previewMaxHeight) {
            width = (width * IDENTITY_CONFIG.previewMaxHeight) / height;
            height = IDENTITY_CONFIG.previewMaxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Exibir preview
          previewElement.innerHTML = `
            <img src="${canvas.toDataURL('image/jpeg')}" alt="Preview do documento" class="max-h-60 mx-auto rounded-lg">
          `;
          
          resolve(file);
        };
        
        img.onerror = function() {
          reject(new Error('Não foi possível carregar a imagem'));
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = function() {
        reject(new Error('Não foi possível ler o arquivo'));
      };
      
      reader.readAsDataURL(file);
    }
  });
}

// Exibir preview da selfie
function displaySelfiePreview(file, previewElement) {
  return new Promise((resolve, reject) => {
    if (!previewElement) {
      reject(new Error('Elemento de preview não encontrado'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const img = new Image();
      
      img.onload = function() {
        // Redimensionar imagem para preview
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcular proporções para redimensionamento
        if (width > IDENTITY_CONFIG.previewMaxWidth) {
          height = (height * IDENTITY_CONFIG.previewMaxWidth) / width;
          width = IDENTITY_CONFIG.previewMaxWidth;
        }
        
        if (height > IDENTITY_CONFIG.previewMaxHeight) {
          width = (width * IDENTITY_CONFIG.previewMaxHeight) / height;
          height = IDENTITY_CONFIG.previewMaxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exibir preview
        previewElement.innerHTML = `
          <img src="${canvas.toDataURL('image/jpeg')}" alt="Preview da selfie" class="max-h-60 mx-auto rounded-lg">
        `;
        
        resolve(file);
      };
      
      img.onerror = function() {
        reject(new Error('Não foi possível carregar a imagem'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = function() {
      reject(new Error('Não foi possível ler o arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Enviar documentos para verificação
export async function verifyIdentity(documentFile, selfieFile, statusElement) {
  // Validar arquivos
  const validation = validateVerificationFiles(documentFile, selfieFile);
  
  if (!validation.isValid) {
    const errorMessages = Object.values(validation.errors).join('\n');
    showNotification(errorMessages, 'error');
    return false;
  }
  
  // Atualizar status
  if (statusElement) {
    statusElement.innerHTML = `
      <div class="flex items-center p-4 bg-gray-700 rounded-lg">
        <div class="animate-spin h-5 w-5 border-2 border-furia-blue border-t-transparent rounded-full mr-3"></div>
        <p>Verificando sua identidade... Por favor, aguarde.</p>
      </div>
    `;
    statusElement.classList.remove('hidden');
  }
  
  showLoading();
  
  try {
    // Criar FormData para envio
    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('selfie', selfieFile);
    
    // Enviar para o servidor
    const result = await submitVerification(formData);
    
    // Atualizar estado global
    state.verificationStatus = result.status;
    
    // Retornar resultado
    return result;
  } catch (error) {
    console.error('Erro na verificação de identidade:', error);
    showNotification('Erro ao verificar identidade. Tente novamente.', 'error');
    return { success: false, status: 'error', message: error.message };
  } finally {
    hideLoading();
  }
}

// Verificar status atual da verificação
export async function checkIdentityStatus() {
  try {
    const status = await checkVerificationStatus();
    state.verificationStatus = status.status;
    return status;
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return { status: 'unknown' };
  }
}

// Extrair informações do documento (simulação)
export function extractDocumentInfo(documentResult) {
  // Em um sistema real, isso viria do resultado do OCR
  // Aqui vamos simular alguns dados
  
  return {
    fullName: 'Carlos Silva',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '15/05/1992',
    documentType: documentResult?.type || 'RG',
    issuingAuthority: 'SSP/SP',
    issuanceDate: '10/01/2018',
    confidence: documentResult?.confidence || 0.85
  };
}

// Gerar hash do documento para verificação futura
export function generateDocumentHash(documentFile) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      // Em um sistema real, calcularíamos um hash criptográfico
      // Aqui vamos simular um hash baseado no nome e tamanho do arquivo
      const simpleHash = `doc_${documentFile.name.replace(/\W/g, '')}_${documentFile.size}_${Date.now()}`;
      resolve(simpleHash);
    };
    
    reader.readAsArrayBuffer(documentFile);
  });
}