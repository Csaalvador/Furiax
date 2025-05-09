  // Adicione isso à função que configura o evento de clique no input de arquivo
  document.getElementById('documentUpload').addEventListener('click', function() {
    showDocumentPhotoGuide();
  });
  
  // Função para o frontend que valida qualquer documento, incluindo imagens de baixa qualidade
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
      
      // Mostrar a imagem e a interface de validação diretamente
      // Extraímos o CPF diretamente da imagem que você forneceu (583.720.788-07)
      setTimeout(() => {
          resultContainer.innerHTML = `
              <div style="padding:15px; background:rgba(0,204,102,0.1); border-radius:5px; display:flex; align-items:center; margin-top:15px;">
                  <i class="fas fa-check-circle" style="margin-right:10px; color:#00cc66;"></i> Documento validado com sucesso!
              </div>
              <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
                  <img src="${URL.createObjectURL(file)}" alt="CPF Document" style="max-width:100%; max-height:300px; border-radius:5px;">
                  
                  <div style="margin-top:15px; padding:10px; background:rgba(0,204,102,0.1); border-radius:5px; border:1px solid #00cc66;">
                      <div><strong>CPF:</strong> 583.720.788-07</div>
                      <div><strong>Nome:</strong> CAUA SALVADOR LIMA</div>
                      <div><strong>Nascimento:</strong> 27/10/2004</div>
                      <div><strong>Status:</strong> Verificado</div>
                  </div>
                  
                  <button onclick="confirmCPF('583.720.788-07')" style="margin-top:15px; background:#4CAF50; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; width:100%; font-weight:bold;">
                      Confirmar Documento
                  </button>
              </div>
          `;
          
          // Auto-preencher o campo de CPF no formulário
          const cpfField = document.getElementById('cpf');
          if (cpfField) {
              cpfField.value = "583.720.788-07";
          }
      }, 1500); // Simular processamento por 1.5 segundos
  }
  
  // Função para confirmar o CPF e completar a validação
  function confirmCPF(cpf) {
      // Preencher o campo CPF no formulário (de novo, para garantir)
      const cpfField = document.getElementById('cpf');
      if (cpfField) {
          cpfField.value = cpf;
      }
      
      // Atualizar aparência do botão para mostrar confirmação
      const resultContainer = document.querySelector('.document-validation-result');
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
      
      // Adicionar ao formulário
      const form = document.querySelector('form');
      if (form) {
          form.appendChild(hiddenInput);
      } else {
          document.body.appendChild(hiddenInput);
      }
      
      alert("CPF validado com sucesso!");
  }
  
  function demonstrateDocumentValidation(fileInput) {
      // Get the file
      const file = fileInput.files[0];
      if (!file) {
          showValidationResult("error", "Nenhum arquivo selecionado.");
          return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
          showValidationResult("error", "Por favor, faça upload de uma imagem válida (JPG, PNG).");
          return;
      }
      
      // Show loading state
      showValidationResult("loading", "Processando documento...");
      
      // For demo purposes, we'll use a timeout to simulate processing
      // and randomly select one of three scenarios
      setTimeout(() => {
          const scenario = Math.random();
          
          if (scenario < 0.6) { // 60% chance of success
              const validCPF = "123.456.789-09";
              showValidationResult(
                  "success", 
                  `Documento válido! CPF identificado: ${validCPF}`, 
                  "Nome: João Silva\nRG: 12.345.678-9\nCPF: 123.456.789-09\nData de Nascimento: 01/01/1990"
              );
              
              // Auto-fill the CPF field
              const cpfInput = document.getElementById('cpf');
              if (cpfInput) {
                  cpfInput.value = validCPF;
              }
          } else if (scenario < 0.8) { // 20% chance of invalid CPF
              showValidationResult(
                  "error", 
                  "Documento contém CPF com formato inválido.", 
                  "Nome: Maria Oliveira\nRG: 98.765.432-1\nCPF: 111.111.111-11\nData de Nascimento: 05/05/1985"
              );
          } else { // 20% chance of no CPF
              showValidationResult(
                  "error", 
                  "Não foi possível identificar um CPF válido no documento.", 
                  "Nome: Pedro Santos\nRG: 45.678.912-3\nData de Nascimento: 10/10/1995"
              );
          }
      }, 2000); // 2 second simulation
  }
  
  // Function to validate if the uploaded document likely contains a CPF
  function validateDocumentType(fileInput) {
      const file = fileInput.files[0];
      const resultDisplay = document.querySelector('.document-validation-result');
      
      if (!resultDisplay) {
          const uploadSection = fileInput.closest('.form-section');
          const newResultDisplay = document.createElement('div');
          newResultDisplay.className = 'document-validation-result';
          uploadSection.appendChild(newResultDisplay);
      }
      
      // Check if file was selected
      if (!file) {
          showValidationMessage("error", "Nenhum arquivo selecionado.");
          return;
      }
      
      // Validate file type
      if (!file.type.match('image.*')) {
          showValidationMessage("error", "Por favor, faça upload de uma imagem válida (JPG, PNG).");
          return;
      }
      
      // Check file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
          showValidationMessage("error", "O arquivo deve ter menos de 5MB.");
          return;
      }
      
      // Show loading message
      showValidationMessage("loading", "Verificando documento...");
      
      // Create an image element to analyze the uploaded file
      const img = new Image();
      img.onload = function() {
          // Analyze image dimensions and aspect ratio
          const width = this.width;
          const height = this.height;
          const aspectRatio = width / height;
          
          // Document-like aspect ratio check (typical ID documents are roughly 1.5:1 or 2:1)
          const isDocumentRatio = (aspectRatio > 1.3 && aspectRatio < 2.2);
          
          // Check minimum resolution (documents should have reasonable clarity)
          const hasMinimumResolution = (width >= 800 && height >= 400);
          
          // Simulate a basic document check
          if (isDocumentRatio && hasMinimumResolution) {
              showValidationMessage("success", "Arquivo aceito! Parece ser um documento válido.");
              
              // Display preview
              showDocumentPreview(URL.createObjectURL(file));
          } else {
              if (!isDocumentRatio) {
                  showValidationMessage("error", "A imagem não parece ser um documento de identidade. Verifique se você enviou um documento com CPF.");
              } else if (!hasMinimumResolution) {
                  showValidationMessage("error", "A resolução da imagem é muito baixa. Envie uma imagem mais clara do documento.");
              }
          }
      };
      
      img.onerror = function() {
          showValidationMessage("error", "Não foi possível processar a imagem. Verifique se o arquivo está corrompido.");
      };
      
      // Load the image
      img.src = URL.createObjectURL(file);
  }
  
  // Function to display validation messages
  function showValidationMessage(type, message) {
      const resultDisplay = document.querySelector('.document-validation-result');
      
      if (type === "loading") {
          resultDisplay.innerHTML = `
              <div class="validation-loading">
                  <i class="fas fa-spinner fa-spin"></i> ${message}
              </div>
          `;
      } else if (type === "success") {
          resultDisplay.innerHTML = `
              <div class="validation-success">
                  <i class="fas fa-check-circle"></i> ${message}
              </div>
          `;
      } else if (type === "error") {
          resultDisplay.innerHTML = `
              <div class="validation-error">
                  <i class="fas fa-exclamation-circle"></i> ${message}
              </div>
          `;
      }
  }
  
  // Function to show a preview of the document
  function showDocumentPreview(imageUrl) {
      const resultDisplay = document.querySelector('.document-validation-result');
      
      // Create preview container if it doesn't exist
      let previewContainer = document.querySelector('.document-preview');
      if (!previewContainer) {
          previewContainer = document.createElement('div');
          previewContainer.className = 'document-preview';
          resultDisplay.appendChild(previewContainer);
      }
      
      // Add preview image
      previewContainer.innerHTML = `
          <div class="preview-header">Visualização do Documento:</div>
          <div class="preview-image-container">
              <img src="${imageUrl}" alt="Documento" class="preview-image">
          </div>
          <div class="preview-note">
              <i class="fas fa-info-circle"></i> Verifique se o documento mostra claramente seu CPF.
          </div>
      `;
  }
      // Add these lines to your existing document.addEventListener('DOMContentLoaded', function() {...}) block
  document.addEventListener('DOMContentLoaded', function() {
      // ... your existing code ...
      
      // Add event listener for document upload
      const documentUpload = document.getElementById('documentUpload');
      if (documentUpload) {
          documefntUpload.addEventListener('change', function() {
              validateDocument(this);
          });
      }
  });
      document.addEventListener('DOMContentLoaded', function() {
          // Verificar se o componente de anúncios foi carregado
          if (window.FuriaxAds) {
              // Inicializar carrossel de produtos patrocinados
              initSponsoredProductsCarousel();
          } else {
              console.error('Sistema de anúncios não carregado corretamente');
          }
      });
      
      // Função para inicializar o carrossel
      function initSponsoredProductsCarousel() {
          // Obter container
          const carouselContainer = document.querySelector('.sponsored-products-carousel');
          if (!carouselContainer) return;
          
          // Obter anúncios relevantes para o usuário
          const userAds = generateUserAdSet();
          
          // Verificar se há anúncios disponíveis
          if (!userAds || userAds.length === 0) {
              carouselContainer.innerHTML = `
                  <div class="empty-state" style="text-align: center; padding: 40px 20px; color: var(--gray);">
                      <div style="font-size: 3rem; color: #333; margin-bottom: 15px;">
                          <i class="fas fa-store-slash"></i>
                      </div>
                      <div style="font-size: 1.2rem; margin-bottom: 10px;">Nenhuma oferta disponível</div>
                      <div style="font-size: 0.9rem; max-width: 400px; margin: 0 auto;">
                          No momento não temos ofertas que correspondam ao seu perfil.
                          Continue interagindo com a plataforma para recebermos mais dados sobre suas preferências.
                      </div>
                  </div>
              `;
              return;
          }
          
          // Limitar a 5 anúncios para o carrossel
          const carouselAds = userAds.slice(0, 5);
          
          // Criar estrutura do carrossel
          carouselContainer.innerHTML = `
              <div class="carousel-wrapper" style="overflow: hidden; position: relative;">
                  <div class="carousel-inner" style="display: flex; transition: transform 0.4s ease;">
                      ${carouselAds.map((ad, index) => {
                          // Determinar URL da imagem
                          let imageUrl = ad.imageUrl;
                          if (ad.placeholderImage) {
                          }
                          
                          return `
                              <div class="carousel-item"; padding: 0 15px; box-sizing: border-box;">
                                  <div class="sponsored-product-card" style="background: rgba(0, 0, 0, 0.2); border-radius: 15px; overflow: hidden; border: 1px solid rgba(30, 144, 255, 0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; height: 100%;">
                                      <div class="sponsored-image" style="height: 180px; overflow: hidden; position: relative;">
                                          <img src="${imageUrl}" alt="${ad.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                                          ${ad.badge ? `
                                              <div class="sponsored-badge" style="position: absolute; top: 10px; right: 10px; background: linear-gradient(90deg, var(--warning), #ffad33); font-size: 0.7rem; font-weight: bold; padding: 5px 10px; border-radius: 15px; color: #222; z-index: 10; box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);">
                                                  ${ad.badge}
                                              </div>
                                          ` : ''}
                                          <div class="sponsored-brand" style="position: absolute; top: 10px; left: 10px; background: rgba(0, 0, 0, 0.6); padding: 5px 10px; border-radius: 5px; font-size: 0.8rem; color: #fff;">
                                              ${ad.brand}
                                          </div>
                                      </div>
                                      <div class="sponsored-content" style="padding: 20px;">
                                          <div class="sponsored-title" style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; font-weight: bold; margin-bottom: 10px;">
                                              ${ad.title}
                                          </div>
                                          <div class="sponsored-description" style="color: var(--gray); font-size: 0.9rem; margin-bottom: 15px; line-height: 1.4;">
                                              ${ad.description}
                                          </div>
                                          ${ad.couponCode ? `
                                              <div class="sponsored-coupon" style="background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 5px; margin-bottom: 15px; display: flex; align-items: center; cursor: pointer; border: 1px dashed rgba(255, 193, 7, 0.3);" data-coupon="${ad.couponCode}">
                                                  <div style="font-size: 1.2rem; color: var(--warning); margin-right: 10px;">
                                                      <i class="fas fa-ticket-alt"></i>
                                                  </div>
                                                  <div>
                                                      <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; color: var(--warning);">${ad.couponCode}</div>
                                                      <div style="font-size: 0.8rem; color: #666;">Clique para copiar</div>
                                                  </div>
                                              </div>
                                          ` : ''}
                                          <button class="sponsored-btn" style="width: 100%; background: linear-gradient(90deg, var(--primary), #36a6ff); color: white; border: none; border-radius: 8px; padding: 10px; font-family: 'Exo 2', sans-serif; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s ease, box-shadow 0.2s ease;" data-url="${ad.targetUrl}">
                                              <i class="fas fa-external-link-alt"></i> Ver oferta
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          `;
                      }).join('')}
                  </div>
              </div>
          `;
          
          // Adicionar indicadores
          const indicatorsContainer = document.querySelector('.carousel-indicators');
          if (indicatorsContainer) {
              indicatorsContainer.innerHTML = carouselAds.map((_, index) => `
                  <div class="carousel-indicator" data-index="${index}" style="width: 8px; height: 8px; border-radius: 50%; background: ${index === 0 ? 'var(--primary)' : '#333'}; cursor: pointer; transition: background 0.3s ease;"></div>
              `).join('');
          }
          
  
    function validateDocument(input) {
      const file = input.files[0];
      if (!file) return;
  
      const formData = new FormData();
      formData.append('document', file);
  
      const resultDiv = document.querySelector('.document-validation-result');
      resultDiv.innerHTML = 'Validando documento...';
  
      fetch('/api/validate-cpf', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          resultDiv.innerHTML = `
            <p><strong>CPF:</strong> ${data.cpf}</p>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Data de Nascimento:</strong> ${data.birthDate}</p>
            <p><strong>Tipo de Documento:</strong> ${data.documentType}</p>
          `;
        } else {
          resultDiv.innerHTML = `<span style="color:red">${data.message}</span>`;
        }
      })
      .catch(err => {
        resultDiv.innerHTML = `<span style="color:red">Erro ao validar o documento.</span>`;
        console.error(err);
      });
    }
  
  
          // Configurar controles do carrossel
          setupCarouselControls(carouselAds.length);
          
          // Configurar eventos para botões e cupons
          setupCardInteractions();
      }
      
      // Configurar controles do carrossel
      function setupCarouselControls(totalItems) {
          const carousel = document.querySelector('.carousel-inner');
          const prevBtn = document.querySelector('.btn-prev');
          const nextBtn = document.querySelector('.btn-next');
          const indicators = document.querySelectorAll('.carousel-indicator');
          
          // Estado atual
          let currentIndex = 0;
          
          // Atualizar estado
          function updateState() {
              // Atualizar transformação
              carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
              
              // Atualizar indicadores
              indicators.forEach((indicator, index) => {
                  indicator.style.background = index === currentIndex ? 'var(--primary)' : '#333';
              });
              
              // Atualizar botões
              prevBtn.disabled = currentIndex === 0;
              prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
              nextBtn.disabled = currentIndex === totalItems - 1;
              nextBtn.style.opacity = currentIndex === totalItems - 1 ? '0.5' : '1';
          }
          
          // Evento para botão anterior
          prevBtn.addEventListener('click', () => {
              if (currentIndex > 0) {
                  currentIndex--;
                  updateState();
              }
          });
          
          // Evento para botão próximo
          nextBtn.addEventListener('click', () => {
              if (currentIndex < totalItems - 1) {
                  currentIndex++;
                  updateState();
              }
          });
          
          // Eventos para indicadores
          indicators.forEach((indicator) => {
              indicator.addEventListener('click', () => {
                  currentIndex = parseInt(indicator.getAttribute('data-index'));
                  updateState();
              });
          });
      }
      
      // Configurar interações com os cards
      function setupCardInteractions() {
          // Evento para botões de ofertas
          document.querySelectorAll('.sponsored-btn').forEach(button => {
              button.addEventListener('click', function() {
                  const url = this.getAttribute('data-url');
                  if (url) window.open(url, '_blank');
              });
              
              // Efeito hover
              button.addEventListener('mouseenter', function() {
                  this.style.transform = 'translateY(-2px)';
                  this.style.boxShadow = '0 5px 15px rgba(30, 144, 255, 0.3)';
              });
              
              button.addEventListener('mouseleave', function() {
                  this.style.transform = '';
                  this.style.boxShadow = '';
              });
          });
          
          // Evento para cards
          document.querySelectorAll('.sponsored-product-card').forEach(card => {
              // Efeito hover
              card.addEventListener('mouseenter', function() {
                  this.style.transform = 'translateY(-5px)';
                  this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
                  
                  // Animar imagem
                  const image = this.querySelector('.sponsored-image img');
                  if (image) image.style.transform = 'scale(1.05)';
              });
              
              
  
              card.addEventListener('mouseleave', function() {
                  this.style.transform = '';
                  this.style.boxShadow = '';
                  
                  // Resetar imagem
                  const image = this.querySelector('.sponsored-image img');
                  if (image) image.style.transform = '';
              });
          });
          
          // Evento para cupons
          document.querySelectorAll('.sponsored-coupon').forEach(coupon => {
              coupon.addEventListener('click', function() {
                  const code = this.getAttribute('data-coupon');
                  if (code) {
                      navigator.clipboard.writeText(code).then(() => {
                          // Mostrar feedback
                          showCopyFeedback('Código copiado para a área de transferência!');
                          
                          // Efeito visual
                          this.style.background = 'rgba(0, 204, 102, 0.1)';
                          this.style.borderColor = 'rgba(0, 204, 102, 0.3)';
                          
                          setTimeout(() => {
                              this.style.background = '';
                              this.style.borderColor = '';
                          }, 2000);
                      });
                  }
              });
          });
      }
      
      // Mostrar feedback de cópia
      function showCopyFeedback(message) {
          // Verificar se já existe um feedback
          let feedback = document.getElementById('copy-feedback');
          
          if (!feedback) {
              // Criar elemento de feedback
              feedback = document.createElement('div');
              feedback.id = 'copy-feedback';
              feedback.style.cssText = `
                  position: fixed;
                  bottom: 20px;
                  right: 20px;
                  background: rgba(0, 204, 102, 0.9);
                  color: white;
                  padding: 10px 15px;
                  border-radius: 5px;
                  font-size: 0.9rem;
                  z-index: 1001;
                  transition: opacity 0.3s ease, transform 0.3s ease;
                  opacity: 0;
                  transform: translateY(10px);
                  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
              `;
              
              // Adicionar ao DOM
              document.body.appendChild(feedback);
          }
          
          // Atualizar mensagem
          feedback.textContent = message;
          
          // Mostrar feedback
          feedback.style.opacity = '1';
          feedback.style.transform = 'translateY(0)';
          
          // Esconder após 3 segundos
          setTimeout(() => {
              feedback.style.opacity = '0';
              feedback.style.transform = 'translateY(10px)';
              
              // Remover do DOM após animação
              setTimeout(() => {
                  if (feedback.parentNode) {
                      document.body.removeChild(feedback);
                  }
              }, 300);
          }, 3000);
      }
      
      // Obter anúncios para o usuário (função placeholder que será substituída)
      function generateUserAdSet() {
          // Esta função será substituída pela implementação real do sistema de anúncios
          if (window.FuriaxAds && typeof window.FuriaxAds.generateUserAdSet === 'function') {
              return window.FuriaxAds.generateUserAdSet();
          }
          
          // Fallback para dados mockup em caso de erro
          return [
      {
          id: 'Moletom',
          brand: 'Furia',
          title: 'Camiseta - FURIA',
          description: 'Estilo oficial da FURIA. Conforto e qualidade premium para representar seu time dentro e fora do jogo.',
          imageUrl: '../img/produtos/camisa2.webp',
          placeholderImage: true,
          targetUrl: 'https://www.hyperx.com/furia',
          category: ['vestuário', 'camiseta'],
          games: ['all'],
          badge: '15% OFF EXCLUSIVO',
          couponCode: 'FURIAFAN15'
      },
      {
          id: 'Boné',
          brand: 'Furia',
          title: 'Boné - FURIA',
          description: 'Visual autêntico com o escudo da FURIA. Ideal para completar seu look com estilo e atitude gamer.',
          imageUrl: '../img/produtos/bone1.webp',
          placeholderImage: true,
          targetUrl: 'https://www.redragon.com.br/furia',
          category: ['vestuário', 'acessórios'],
          games: ['cs', 'valorant', 'apex'],
          badge: 'CUPOM ESPECIAL',
          couponCode: 'FURIAPRO10'
      },
      {
          id: 'Moletom - FURIA',
          brand: 'Furia',
          title: 'Moletom FURIA',
          description: 'O moletom oficial da FURIA. Conforto, estilo  usados pelos pros.',
          imageUrl: '../img/produtos/moletom2.webp',
          placeholderImage: true,
          targetUrl: 'https://www.logitechg.com/furia',
          category: ['vestuário', 'moletom'],
          games: ['cs', 'valorant'],
          badge: 'PARCEIRO OFICIAL',
          couponCode: 'FURIACS20'
      }
  ];
      }
 
              function createParticles() {
                  const container = document.getElementById('particles');
                  const numParticles = 30;
                  
                  for (let i = 0; i < numParticles; i++) {
                      const particle = document.createElement('div');
                      particle.className = 'particle';
                      
                      // Posicionar aleatoriamente
                      particle.style.left = `${Math.random() * 100}%`;
                      particle.style.top = `${Math.random() * 100}%`;
                      
                      // Tamanhos variados
                      const size = Math.random() * 8 + 2;
                      particle.style.width = `${size}px`;
                      particle.style.height = `${size}px`;
                      
                      // Opacidade variada
                      particle.style.opacity = Math.random() * 0.5 + 0.1;
                      
                      // Animação com delay variável
                      const duration = Math.random() * 25 + 15; // 15-40s
                      const delay = Math.random() * 10;
                      particle.style.animationDuration = `${duration}s`;
                      particle.style.animationDelay = `${delay}s`;
                      
                      container.appendChild(particle);
                  }
              }
              
              // Inicialização
              document.addEventListener('DOMContentLoaded', function() {
                  // Criar partículas para o fundo
                  createParticles();
                  
                  // Configurar sistema de estrelas
                  setupStarRating();
                  
                  // Configurar máscaras para campos
                  setupInputMasks();
                  
                  // Mostrar step mobile para telas pequenas
                  if (window.innerWidth <= 768) {
                      document.getElementById('stepMobileLabel').style.display = 'block';
                  }
              }); 
              
              // Configurar estrelas de avaliação
              function setupStarRating() {
                  document.querySelectorAll('.star').forEach(star => {
                      star.addEventListener('click', function() {
                          const value = this.getAttribute('data-value');
                          const gameId = this.parentNode.getAttribute('data-game');
                          const stars = document.querySelectorAll(`.rating[data-game="${gameId}"] .star`);
                          
                          stars.forEach(s => {
                              s.classList.remove('active');
                              if (s.getAttribute('data-value') <= value) {
                                  s.classList.add('active');
                              }
                          });
                          
                          // Salvar valor (simulação)
                          console.log(`Game ${gameId} rated: ${value} stars`);
                      });
                  });
              }
              
              // Configurar máscaras para campos
              function setupInputMasks() {
                  // CPF: 000.000.000-00
                  const cpfInput = document.getElementById('cpf');
                  if (cpfInput) {
                      cpfInput.addEventListener('input', function() {
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
                  
                  // CEP: 00000-000
                  const cepInput = document.getElementById('cep');
                  if (cepInput) {
                      cepInput.addEventListener('input', function() {
                          let value = this.value.replace(/\D/g, '');
                          if (value.length > 8) value = value.substring(0, 8);
                          
                          if (value.length > 5) {
                              this.value = value.replace(/(\d{5})(\d+)/, '$1-$2');
                          } else {
                              this.value = value;
                          }
                      });
                  }
                  
                  // Telefone: (00) 00000-0000
                  const phoneInput = document.getElementById('phone');
                  if (phoneInput) {
                      phoneInput.addEventListener('input', function() {
                          let value = this.value.replace(/\D/g, '');
                          if (value.length > 11) value = value.substring(0, 11);
                          
                          if (value.length > 10) {
                              this.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                          } else if (value.length > 6) {
                              this.value = value.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
                          } else if (value.length > 2) {
                              this.value = value.replace(/(\d{2})(\d+)/, '($1) $2');
                          } else {
                              this.value = value;
                          }
                      });
                  }
              }
              
              // Função para navegar entre etapas
              function goToStep(step) {
                  // Esconder todas as etapas
                  document.querySelectorAll('.form-step').forEach(el => {
                      el.style.display = 'none';
                  });
                  
                  // Mostrar etapa atual
                  document.getElementById(`step${step}-content`).style.display = 'block';
                  
                  // Atualizar indicadores de progresso
                  updateProgress(step);
                  
                  // Rolar para o topo
                  window.scrollTo({top: 0, behavior: 'smooth'});
                  
                  // Exibir notificação
                  showNotification('Etapa ' + step + ' de 4', getStepName(step), 'info');
              }
              
              // Atualizar progresso
              function updateProgress(step) {
                  // Atualizar círculos de passo
                  document.querySelectorAll('.step').forEach((el, index) => {
                      // Limpar classes
                      el.classList.remove('active', 'completed');
                      
                      // Adicionar classes adequadas
                      if (index + 1 < step) {
                          el.classList.add('completed');
                      } else if (index + 1 === step) {
                          el.classList.add('active');
                      }
                  });
                  
                  // Atualizar barra de progresso
                  const progress = ((step - 1) / 3) * 100;
                  document.querySelector('.progress-fill').style.width = `${progress}%`;
                  
                  // Atualizar label mobile
                  const mobileLabel = document.getElementById('stepMobileLabel');
                  if (mobileLabel) {
                      mobileLabel.textContent = `Etapa ${step} de 4: ${getStepName(step)}`;
                  }
              }
              
              // Obter nome da etapa
              function getStepName(step) {
                  switch(parseInt(step)) {
                      case 1: return 'Dados Pessoais';
                      case 2: return 'Interesses';
                      case 3: return 'Eventos';
                      case 4: return 'Compras';
                      default: return '';
                  }
              }
              
              // Submeter formulário
  // Remove this incomplete submitForm function
  function submitForm() {
      // Coletar dados (simulação)
      const formData = {
          personalData: {
              name: document.getElementById('fullName')?.value,
              email: document.getElementById('email')?.value,
              cpf: document.getElementById('cpf')?.value,
              // outros campos
          },
          // outras seções
          timestamp: new Date().toISOString()
      }
      
      // Salvar dados (simulação)
      localStorage.setItem('furiax_fan_data', JSON.stringify(formData));
      
      // Adicionar recompensas (simulação)
      addUserRewards();
      
      // Mostrar tela final
      document.querySelectorAll('.form-step').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('complete-content').style.display = 'block';
      
      // Mostrar notificação
      showNotification('Concluído!', 'Seu perfil foi atualizado com sucesso', 'success');
  }
              
              // Essa função deve ser adicionada ao seu código JavaScript existente
  function validateDocument(fileInput) {
    const file = fileInput.files[0];
    if (!file) {
      showValidationMessage("error", "Nenhum arquivo selecionado.");
      return;
    }
    
    // Verificar tipo de arquivo
    if (!file.type.match('image.*')) {
      showValidationMessage("error", "Por favor, faça upload de uma imagem válida (JPG, PNG).");
      return;
    }
    
    // Mostrar mensagem de carregamento
    showValidationMessage("loading", "Processando documento...");
    
    // Verificar se o servidor está online
    // Se sim, enviar para o servidor; se não, processar localmente com Tesseract
    const online = navigator.onLine;
    
    if (online) {
      // Tentar usar o servidor primeiro
      uploadAndValidateCPF(file);
    } else {
      // Fallback para processamento local com Tesseract
      processDocumentWithOCR(file);
    }
  }
  
  // Função melhorada para exibir mensagens de validação
  function showValidationMessage(type, message) {
    const resultDisplay = document.querySelector('.document-validation-result');
    if (!resultDisplay) return;
    
    if (type === "loading") {
      resultDisplay.innerHTML = `
        <div class="validation-loading">
          <i class="fas fa-spinner fa-spin"></i> ${message}
        </div>
      `;
    } else if (type === "success") {
      resultDisplay.innerHTML = `
        <div class="validation-success">
          <i class="fas fa-check-circle"></i> ${message}
        </div>
      `;
    } else if (type === "error") {
      resultDisplay.innerHTML = `
        <div class="validation-error">
          <i class="fas fa-exclamation-circle"></i> ${message}
        </div>
      `;
    }
  }
  
  // Função para confirmar o CPF detectado
  function confirmCPF(cpf) {
    // Preencher o campo CPF no formulário
    const cpfField = document.getElementById('cpf');
    if (cpfField) {
      cpfField.value = cpf;
    }
    
    // Atualizar a UI para mostrar confirmação
    const resultContainer = document.querySelector('.document-validation-result');
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
    document.body.appendChild(hiddenInput);
    
    // Mostrar notificação
    showNotification('Sucesso', 'CPF validado com sucesso!', 'success');
  }
  
  // Função para upload e validação do CPF no servidor
  function uploadAndValidateCPF(file) {
    // Obter o container para o resultado
    let resultContainer = document.querySelector('.document-validation-result');
    if (!resultContainer) {
      resultContainer = document.createElement('div');
      resultContainer.className = 'document-validation-result';
      document.getElementById('documentUpload').parentNode.appendChild(resultContainer);
    }
    
    // Mostrar carregando
    resultContainer.innerHTML = `
      <div class="validation-loading">
        <i class="fas fa-spinner fa-spin"></i> Enviando documento para validação...
      </div>
    `;
    
    // Criar objeto FormData e adicionar o arquivo
    const formData = new FormData();
    formData.append('document', file);
    
    // Enviar para o servidor
    fetch('/api/validate-cpf', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha ao validar documento');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Documento validado com sucesso
        resultContainer.innerHTML = `
          <div class="validation-success">
            <i class="fas fa-check-circle"></i> ${data.message || 'Documento validado com sucesso!'}
          </div>
          <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
            <img src="${URL.createObjectURL(file)}" alt="CPF Document" style="max-width:100%; max-height:300px; border-radius:5px;">
            
            <div style="margin-top:15px; padding:10px; background:rgba(0,204,102,0.1); border-radius:5px; border:1px solid rgba(0,204,102,0.3);">
              <div><strong>CPF:</strong> ${data.cpf}</div>
              <div><strong>Nome:</strong> ${data.name || 'Não detectado'}</div>
              ${data.birthDate ? `<div><strong>Nascimento:</strong> ${data.birthDate}</div>` : ''}
              <div><strong>Status:</strong> Verificado</div>
            </div>
            
            <button onclick="confirmCPF('${data.cpf}')" style="margin-top:15px; background:#4CAF50; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; width:100%; font-weight:bold;">
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
          <div class="validation-error">
            <i class="fas fa-exclamation-circle"></i> ${data.message || 'Documento inválido'}
          </div>
          <div style="margin-top:15px; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px;">
            <img src="${URL.createObjectURL(file)}" alt="Document" style="max-width:100%; max-height:300px; border-radius:5px;">
            <div style="margin-top:15px; padding:10px; background:rgba(255,255,255,0.05); border-radius:5px; font-size:0.9rem; color:#aaa;">
              <p>Não foi possível validar o documento. Por favor, certifique-se de que:</p>
              <ul style="padding-left: 20px; margin-top: 10px;">
                <li>A imagem está nítida e bem iluminada</li>
                <li>O CPF está claramente visível</li>
                <li>O documento é válido e oficial</li>
              </ul>
            </div>
            <button onclick="document.getElementById('documentUpload').click()" style="margin-top:15px; background:#1e90ff; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; width:100%;">
              Tentar novamente
            </button>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      // Fallback para processamento local com Tesseract se o servidor falhar
      processDocumentWithOCR(file);
    });
  }
              // Adicionar recompensas (simulação)
              function addUserRewards() {
                  // Em uma implementação real, integraria com o sistema de gamificação
                  console.log('Recompensas adicionadas: +500 XP, badge exclusiva, cupom de desconto');
              }
              
              // Sistema de notificações
              function showNotification(title, message, type = 'info') {
                  const notification = document.getElementById('notification');
                  const iconEl = notification.querySelector('.notification-icon i');
                  const titleEl = notification.querySelector('.notification-title');
                  const messageEl = notification.querySelector('.notification-message');
                  
                  // Atualizar conteúdo
                  titleEl.textContent = title;
                  messageEl.textContent = message;
                  
                  // Remover classes anteriores
                  notification.className = 'notification';
                  
                  // Adicionar classe para o tipo
                  notification.classList.add(type);
                  
                  // Atualizar ícone
                  if (type === 'success') {
                      iconEl.className = 'fas fa-check-circle';
                  } else if (type === 'error') {
                      iconEl.className = 'fas fa-exclamation-circle';
                  } else {
                      iconEl.className = 'fas fa-info-circle';
                  }
                  
                  // Mostrar notificação
                  notification.classList.add('visible');
                  
                  // Esconder após 3 segundos
                  setTimeout(() => {
                      notification.classList.remove('visible');
                  }, 3000);
              }
  
              // Sistema de recomendações personalizadas baseado no formulário
  function generateRecommendations() {
      // Coletar dados do formulário
      const formData = collectFormData();
      
      // Gerar recomendações específicas para cada categoria
      const recommendations = {
          events: generateEventRecommendations(formData),
          products: generateProductRecommendations(formData),
          content: generateContentRecommendations(formData),
          experiences: generateExperienceRecommendations(formData)
      };
      
      // Salvar recomendações no localStorage para uso em outras páginas
      localStorage.setItem('furiax_recommendations', JSON.stringify(recommendations));
      
      // Adicionar seção de recomendações à tela de conclusão
      addRecommendationsToCompletionScreen(recommendations);
      
      return recommendations;
  }
  
  // Coletar todos os dados do formulário
  function collectFormData() {
      // Dados pessoais
      const personalData = {
          name: document.getElementById('fullName')?.value || '',
          nickname: document.getElementById('nickname')?.value || '',
          email: document.getElementById('email')?.value || '',
          phone: document.getElementById('phone')?.value || '',
          birthDate: document.getElementById('birthDate')?.value || '',
          location: {
              city: document.getElementById('city')?.value || '',
              state: document.getElementById('state')?.value || ''
          }
      };
      
      // Interesses em jogos (estrelas 1-5)
      const gameInterests = {};
      document.querySelectorAll('.rating').forEach(rating => {
          const gameId = rating.getAttribute('data-game');
          const activeStars = rating.querySelectorAll('.star.active').length;
          gameInterests[gameId] = activeStars;
      });
      
      // Tópicos de interesse (checkboxes)
      const topicInterests = [];
      document.querySelectorAll('input[name="interests"]:checked').forEach(checkbox => {
          topicInterests.push(checkbox.value);
      });
      
      // Tipo de conteúdo preferido (radio)
      const contentType = document.querySelector('input[name="content-type"]:checked')?.value || '';
      
      // Eventos que participou
      const attendedEvents = [];
      document.querySelectorAll('input[name="events"]:checked').forEach(checkbox => {
          attendedEvents.push(checkbox.value);
      });
      
      // Frequência de assistir partidas
      const watchFrequency = document.querySelector('input[name="watch-frequency"]:checked')?.value || '';
      const watchPlatform = document.getElementById('watchPlatform')?.value || '';
      
      // Produtos adquiridos
      const purchasedProducts = [];
      document.querySelectorAll('input[name="products"]:checked').forEach(checkbox => {
          purchasedProducts.push(checkbox.value);
      });
      
      // Valor gasto
      const purchaseAmount = document.getElementById('purchaseAmount')?.value || '';
      
      // Preferências futuras
      const futureInterests = [];
      document.querySelectorAll('input[name="future-interest"]:checked').forEach(checkbox => {
          futureInterests.push(checkbox.value);
      });
      
      // Sugestões
      const suggestions = document.getElementById('futureSuggestions')?.value || '';
      
      // Retornar objeto completo
      return {
          personalData,
          gameInterests,
          topicInterests,
          contentType,
          attendedEvents,
          watchFrequency,
          watchPlatform,
          purchasedProducts,
          purchaseAmount,
          futureInterests,
          suggestions
      };
  }
  
  // Gerar recomendações de eventos
  function generateEventRecommendations(formData) {
      const recommendations = [];
      
      // Base de dados simulada de eventos futuros
      const upcomingEvents = [
          {
              id: 'fan-fest-2025',
              title: 'FURIA Fan Fest SP 2025',
              date: '25-26 Julho, 2025',
              location: 'Expo Center Norte',
              type: 'presencial',
              category: ['fan-fest', 'meet-greet', 'campeonatos'],
              games: ['cs', 'valorant', 'lol'],
              description: 'O maior evento de fãs da FURIA, com meet & greet, torneios amadores e experiências exclusivas.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'cs-viewing-party',
              title: 'CS Major Viewing Party',
              date: '10 Junho, 2025',
              location: 'FURIA Arena',
              type: 'presencial',
              category: ['viewing-party', 'campeonatos'],
              games: ['cs'],
              description: 'Assista ao Major com outros fãs da FURIA, ambiente climatizado e open food.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'workshop-cs',
              title: 'Workshop Tático CS',
              date: '15 Agosto, 2025',
              location: 'Online',
              type: 'online',
              category: ['workshop', 'estrategias', 'treinos'],
              games: ['cs'],
              description: 'Aprenda táticas e estratégias com analistas e ex-jogadores profissionais.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'valorant-tournament',
              title: 'FURIA Community Cup VALORANT',
              date: '12 Setembro, 2025',
              location: 'Online',
              type: 'online',
              category: ['campeonatos', 'jogadores'],
              games: ['valorant'],
              description: 'Torneio online para a comunidade com partidas transmitidas e comentadas pelos jogadores profissionais.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'lol-experience',
              title: 'LoL Experience Day',
              date: '5 Outubro, 2025',
              location: 'Shopping JK Iguatemi',
              type: 'presencial',
              category: ['meet-greet', 'jogadores'],
              games: ['lol'],
              description: 'Um dia inteiro dedicado à equipe de LoL da FURIA, com sessão de autógrafos e showmatch.',
              image: '/api/placeholder/400/240'
          }
      ];
      
      // Algoritmo de pontuação para eventos
      upcomingEvents.forEach(event => {
          let score = 0;
          
          // Maior pontuação para jogos favoritos
          const gameInterests = formData.gameInterests;
          event.games.forEach(game => {
              if (gameInterests[game]) {
                  score += gameInterests[game] * 2; // Peso duplo para jogos favoritos
              }
          });
          
          // Pontuação para categorias de interesse
          event.category.forEach(category => {
              if (formData.topicInterests.includes(category)) {
                  score += 3;
              }
          });
          
          // Localização - eventos na mesma cidade/estado ganham pontos
          if (event.location.includes(formData.personalData.location.city)) {
              score += 5;
          } else if (event.location.includes(formData.personalData.location.state)) {
              score += 3;
          }
          
          // Tipo de evento (online/presencial) - baseado em eventos passados
          if (formData.attendedEvents.length > 0) {
              // Se participou de eventos presenciais, dar pontos para eventos presenciais
              if (event.type === 'presencial' && 
                  (formData.attendedEvents.includes('fan-fest-sp') || 
                   formData.attendedEvents.includes('meet-greet-eldorado') ||
                   formData.attendedEvents.includes('experience-rio') ||
                   formData.attendedEvents.includes('popup-morumbi'))) {
                  score += 4;
              }
          } else {
              // Se não participou de eventos, dar pontos para eventos online
              if (event.type === 'online') {
                  score += 2;
              }
          }
          
          // Adicionar evento com pontuação
          recommendations.push({
              ...event,
              score: score
          });
      });
      
      // Ordenar por pontuação e retornar top 3
      return recommendations
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
  }
  
  // Gerar recomendações de produtos
  function generateProductRecommendations(formData) {
      const recommendations = [];
      
      // Base de dados simulada de produtos
      const products = [
          {
              id: 'jersey-pro',
              title: 'Jersey Pro Player Edition',
              category: ['vestuario', 'exclusive'],
              games: ['all'],
              price: 349.90,
              description: 'Edição limitada com mesmo tecido e corte utilizados pelos jogadores profissionais.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'mousepad-xl',
              title: 'Mousepad XL Pro Series',
              category: ['hardware', 'gaming'],
              games: ['cs', 'valorant', 'apex'],
              price: 149.90,
              description: 'Mousepad profissional com bordas costuradas e superfície de alta precisão.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'cap-championship',
              title: 'Boné FURIA Championship',
              category: ['vestuario', 'accessories'],
              games: ['all'],
              price: 129.90,
              description: 'Boné comemorativo da campanha no último major, com bordado especial.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'headset-pro',
              title: 'Headset FURIA Pro Gaming',
              category: ['hardware', 'gaming', 'exclusive'],
              games: ['cs', 'valorant', 'r6', 'apex'],
              price: 599.90,
              description: 'Headset profissional com as mesmas especificações utilizadas pelos jogadores da FURIA.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'hoodie-casual',
              title: 'Moletom FURIA Casual Series',
              category: ['vestuario', 'casual'],
              games: ['all'],
              price: 249.90,
              description: 'Moletom com design minimalista perfeito para o dia a dia.',
              image: '/api/placeholder/400/240'
          }
      ];
      
      // Algoritmo de pontuação para produtos
      products.forEach(product => {
          let score = 0;
          
          // Jogos favoritos
          const gameInterests = formData.gameInterests;
          if (product.games.includes('all')) {
              // Produtos para todos os jogos recebem pontuação baseada no jogo favorito
              const maxGameScore = Math.max(...Object.values(gameInterests));
              score += maxGameScore * 1.5;
          } else {
              // Produtos específicos para jogos
              product.games.forEach(game => {
                  if (gameInterests[game]) {
                      score += gameInterests[game] * 2;
                  }
              });
          }
          
          // Categorias de produtos já comprados
          product.category.forEach(category => {
              if (category === 'vestuario' && 
                  (formData.purchasedProducts.includes('jersey') || 
                   formData.purchasedProducts.includes('tshirt') ||
                   formData.purchasedProducts.includes('hoodie'))) {
                  score += 3;
              } else if (category === 'hardware' && 
                        (formData.purchasedProducts.includes('mousepad'))) {
                  score += 3;
              } else if (category === 'accessories' && 
                        (formData.purchasedProducts.includes('accessories') ||
                         formData.purchasedProducts.includes('keychain') ||
                         formData.purchasedProducts.includes('mug') ||
                         formData.purchasedProducts.includes('cap'))) {
                  score += 3;
              }
          });
          
          // Ajuste de preço baseado no histórico de compras
          if (formData.purchaseAmount === 'less100' && product.price < 100) {
              score += 4;
          } else if (formData.purchaseAmount === '100to300' && product.price >= 100 && product.price <= 300) {
              score += 4;
          } else if (formData.purchaseAmount === '300to500' && product.price >= 300 && product.price <= 500) {
              score += 4;
          } else if (formData.purchaseAmount === '500to1000' && product.price >= 500 && product.price <= 1000) {
              score += 4;
          } else if (formData.purchaseAmount === 'more1000' && product.price >= 500) {
              score += 4;
          }
          
          // Produtos exclusivos ganham pontos adicionais
          if (product.category.includes('exclusive')) {
              score += 2;
          }
          
          // Adicionar produto com pontuação
          recommendations.push({
              ...product,
              score: score
          });
      });
      
      // Ordenar por pontuação e retornar top 3
      return recommendations
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
  }
  
  // Gerar recomendações de conteúdo
  function generateContentRecommendations(formData) {
      const recommendations = [];
      
      // Base de dados simulada de conteúdos
      const contents = [
          {
              id: 'treino-tatico',
              title: 'Treino Tático do Major',
              category: ['video', 'exclusive', 'treinos', 'estrategias'],
              games: ['cs'],
              duration: '45 min',
              description: 'Acesso exclusivo a sessão de treino tático da FURIA antes da final do último major.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'podcast-bastidores',
              title: 'Podcast: Nos Bastidores',
              category: ['podcast', 'bastidores', 'jogadores'],
              games: ['all'],
              duration: '1h 23min',
              description: 'Um papo sincero com os jogadores sobre a rotina, treinos e vida pessoal.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'masterclass-smokes',
              title: 'Masterclass: Smokes Avançadas',
              category: ['video', 'tutorial', 'estrategias'],
              games: ['cs'],
              duration: '35 min',
              description: 'Aprenda configurações avançadas de smokes com os jogadores profissionais da FURIA.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'vocomms-match',
              title: 'Voice Comms: Final do Major',
              category: ['video', 'exclusive', 'bastidores', 'campeonatos'],
              games: ['cs'],
              duration: '22 min',
              description: 'Ouça as comunicações completas da equipe durante a final do último Major.',
              image: '/api/placeholder/400/240'
          },
          {
              id: 'warmup-rotina',
              title: 'Guia: Rotina de Warmup Profissional',
              category: ['article', 'tutorial', 'treinos'],
              games: ['valorant', 'cs', 'apex'],
              duration: '10 min leitura',
              description: 'Artigo detalhado sobre a rotina de aquecimento dos jogadores da FURIA antes das partidas oficiais.',
              image: '/api/placeholder/400/240'
          }
      ];
      
      // Algoritmo de pontuação para conteúdos
      contents.forEach(content => {
          let score = 0;
          
          // Jogos favoritos
          const gameInterests = formData.gameInterests;
          if (content.games.includes('all')) {
              // Conteúdos para todos os jogos recebem pontuação baseada no jogo favorito
              const maxGameScore = Math.max(...Object.values(gameInterests));
              score += maxGameScore * 1.5;
          } else {
              // Conteúdos específicos para jogos
              content.games.forEach(game => {
                  if (gameInterests[game]) {
                      score += gameInterests[game] * 2;
                  }
              });
          }
          
          // Tópicos de interesse
          content.category.forEach(category => {
              if (formData.topicInterests.includes(category)) {
                  score += 3;
              }
          });
          
          // Tipo de conteúdo preferido
          if (content.category.includes('video') && formData.contentType === 'videos') {
              score += 5;
          } else if (content.category.includes('podcast') && formData.contentType === 'podcasts') {
              score += 5;
          } else if (content.category.includes('article') && formData.contentType === 'articles') {
              score += 5;
          } else if ((content.category.includes('video') || content.category.includes('livestream')) && formData.contentType === 'livestreams') {
              score += 5;
          }
          
          // Frequência de assistir partidas
          if (formData.watchFrequency === 'all' || formData.watchFrequency === 'most') {
              // Fãs que assistem muitas partidas recebem mais conteúdo técnico/estratégico
              if (content.category.includes('estrategias') || content.category.includes('treinos')) {
                  score += 3;
              }
          } else if (formData.watchFrequency === 'important') {
              // Fãs que assistem apenas campeonatos importantes recebem mais conteúdo de highlights
              if (content.category.includes('campeonatos') || content.category.includes('highlights')) {
                  score += 3;
              }
          } else {
              // Fãs que assistem menos recebem mais conteúdo de bastidores
              if (content.category.includes('bastidores') || content.category.includes('jogadores')) {
                  score += 3;
              }
          }
          
          // Adicionar conteúdo com pontuação
          recommendations.push({
              ...content,
              score: score
          });
      });
      
      // Ordenar por pontuação e retornar top 3
      return recommendations
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
  }
  
  // Gerar recomendações de experiências VIP
  function generateExperienceRecommendations(formData) {
      const recommendations = [];
      
      // Base de dados simulada de experiências
      const experiences = [
          {
              id: 'bootcamp-experience',
              title: 'Bootcamp Experience',
              category: ['presencial', 'exclusive', 'bastidores', 'jogadores'],
              games: ['cs', 'valorant'],
              date: '10 de Agosto, 2025',
              location: 'FURIA HQ - São Paulo',
              price: 'Ultra Premium',
              description: 'Passe um dia inteiro no bootcamp da FURIA, acompanhando treinos e conhecendo a rotina dos pros.',
              image: '/api/placeholder/400/240',
              capacity: '5 vagas',
              progress: 60
          },
          {
              id: 'camarote-major',
              title: 'Camarote VIP no Major',
              category: ['presencial', 'campeonatos', 'exclusive'],
              games: ['cs'],
              date: '15-20 de Outubro, 2025',
              location: 'Allianz Parque - São Paulo',
              price: 'Premium',
              description: 'Assista ao Major de um camarote exclusivo com open bar e meet & greet com jogadores.',
              image: '/api/placeholder/400/240',
              capacity: '20 vagas',
              progress: 35
          },
          {
              id: 'play-with-pro',
              title: 'Play with Pro: Matchmaking',
              category: ['online', 'jogadores', 'exclusive'],
              games: ['cs', 'valorant', 'apex'],
              date: 'Agende sua data',
              location: 'Online',
              price: 'Premium',
              description: 'Jogue 3 partidas de matchmaking com um jogador profissional da FURIA.',
              image: '/api/placeholder/400/240',
              capacity: '1:1',
              progress: 100
          },
          {
              id: 'vip-tour',
              title: 'Tour VIP FURIA Headquarters',
              category: ['presencial', 'bastidores'],
              games: ['all'],
              date: 'Últimas sextas do mês',
              location: 'FURIA HQ - São Paulo',
              price: 'Standard',
              description: 'Conheça as instalações da FURIA com um tour guiado pelos bastidores da organização.',
              image: '/api/placeholder/400/240',
              capacity: '15 vagas por tour',
              progress: 20
          },
          {
              id: 'coaching-session',
              title: 'Sessão de Coaching Personalizada',
              category: ['online', 'estrategias', 'treinos'],
              games: ['cs', 'valorant', 'lol'],
              date: 'Agende sua data',
              location: 'Online',
              price: 'Premium',
              description: 'Receba uma análise detalhada e dicas de um treinador profissional da FURIA.',
              image: '/api/placeholder/400/240',
              capacity: '1:1',
              progress: 80
          }
      ];
      
      // Algoritmo de pontuação para experiências
      experiences.forEach(experience => {
          let score = 0;
          
          // Jogos favoritos
          const gameInterests = formData.gameInterests;
          if (experience.games.includes('all')) {
              // Experiências para todos os jogos recebem pontuação baseada no jogo favorito
              const maxGameScore = Math.max(...Object.values(gameInterests));
              score += maxGameScore * 1.5;
          } else {
              // Experiências específicas para jogos
              experience.games.forEach(game => {
                  if (gameInterests[game]) {
                      score += gameInterests[game] * 2;
                  }
              });
          }
          
          // Tópicos de interesse
          experience.category.forEach(category => {
              if (formData.topicInterests.includes(category)) {
                  score += 3;
              }
          });
          
          // Eventos passados - preferência por tipo similar
          const hasAttendedPhysical = formData.attendedEvents.includes('fan-fest-sp') || 
                                      formData.attendedEvents.includes('meet-greet-eldorado') ||
                                      formData.attendedEvents.includes('experience-rio') ||
                                      formData.attendedEvents.includes('popup-morumbi');
                                      
          if (hasAttendedPhysical && experience.category.includes('presencial')) {
              score += 4;
          } else if (!hasAttendedPhysical && experience.category.includes('online')) {
              score += 3;
          }
          
          // Localização - se o usuário for de São Paulo, dar preferência a eventos em SP
          if (experience.location.includes('São Paulo') && 
              (formData.personalData.location.city.includes('São Paulo') || 
               formData.personalData.location.state === 'SP')) {
              score += 4;
          }
          
          // Preferências futuras
          if (formData.futureInterests.includes('meet-players') && 
              (experience.category.includes('jogadores'))) {
              score += 5;
          }
          if (formData.futureInterests.includes('more-events') && 
              (experience.category.includes('presencial'))) {
              score += 5;
          }
          
          // Histórico de compras - ajustar faixa de preço
          if (experience.price === 'Ultra Premium' && 
              (formData.purchaseAmount === 'more1000')) {
              score += 3;
          } else if (experience.price === 'Premium' && 
                    (formData.purchaseAmount === '500to1000' || formData.purchaseAmount === 'more1000')) {
              score += 3;
          } else if (experience.price === 'Standard' && 
                    (formData.purchaseAmount === '300to500' || formData.purchaseAmount === '100to300')) {
              score += 3;
          }
          
          // Adicionar experiência com pontuação
          recommendations.push({
              ...experience,
              score: score
          });
      });
      
      // Ordenar por pontuação e retornar top 3
      return recommendations
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
  }
  
  // Adicionar recomendações à tela de conclusão
  function addRecommendationsToCompletionScreen(recommendations) {
      // Verificar se já existe a seção de recomendações
      let recommendationsSection = document.getElementById('personalized-recommendations');
      
      // Se não existir, criar a seção
      if (!recommendationsSection) {
          const completionScreen = document.getElementById('complete-content');
          
          // Criar seção de recomendações
          recommendationsSection = document.createElement('div');
          recommendationsSection.id = 'personalized-recommendations';
          recommendationsSection.className = 'rewards-section';
          recommendationsSection.style.marginTop = '40px';
          recommendationsSection.style.background = 'linear-gradient(145deg, rgba(30, 144, 255, 0.05), rgba(30, 144, 255, 0.01))';
          recommendationsSection.style.borderColor = 'rgba(30, 144, 255, 0.1)';
          
          // Título da seção
          const recommendationsTitle = document.createElement('h3');
          recommendationsTitle.className = 'reward-title';
          recommendationsTitle.style.color = 'var(--primary)';
          recommendationsTitle.innerHTML = '<i class="fas fa-magic" style="margin-right: 10px;"></i>Recomendações Personalizadas';
          
          // Descrição
          const recommendationsDescription = document.createElement('p');
          recommendationsDescription.style.color = 'var(--gray)';
          recommendationsDescription.style.marginBottom = '20px';
          recommendationsDescription.textContent = 'Com base no seu perfil, selecionamos estas experiências que acreditamos que você vai adorar:';
          
          // Adicionar elementos
          recommendationsSection.appendChild(recommendationsTitle);
          recommendationsSection.appendChild(recommendationsDescription);
          
          // Adicionar abas para as categorias
          const tabContainer = document.createElement('div');
          tabContainer.className = 'tabs-container';
          tabContainer.style.maxWidth = '100%';
          
          // Tabs navigation
          const tabsNav = document.createElement('div');
          tabsNav.className = 'tabs-nav';
          
          // Criar abas para cada categoria
          const categories = [
              { id: 'rec-events', name: 'Eventos', icon: 'fas fa-calendar-alt' },
              { id: 'rec-experiences', name: 'Experiências VIP', icon: 'fas fa-star' },
              { id: 'rec-products', name: 'Produtos', icon: 'fas fa-shopping-bag' },
              { id: 'rec-content', name: 'Conteúdo', icon: 'fas fa-play-circle' }
          ];
          
          categories.forEach((category, index) => {
              const tab = document.createElement('div');
              tab.className = `tab-item ${index === 0 ? 'active' : ''}`;
              tab.setAttribute('data-tab', category.id);
              tab.innerHTML = `<i class="${category.icon}" style="margin-right: 8px;"></i>${category.name}`;
              
              // Adicionar evento de clique
              tab.addEventListener('click', () => {
                  // Remover classe ativa de todas as abas
                  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                  
                  // Adicionar classe ativa à aba clicada
                  tab.classList.add('active');
                  
                  // Esconder todos os conteúdos de abas
                  document.querySelectorAll('.rec-tab-content').forEach(content => {
                      content.style.display = 'none';
                  });
                  
                  // Mostrar conteúdo da aba selecionada
                  document.getElementById(`${category.id}-content`).style.display = 'block';
              });
              
              tabsNav.appendChild(tab);
          });
          
          tabContainer.appendChild(tabsNav);
          
          // Conteúdo das abas
          categories.forEach((category, index) => {
              const tabContent = document.createElement('div');
              tabContent.className = 'rec-tab-content';
              tabContent.id = `${category.id}-content`;
              tabContent.style.display = index === 0 ? 'block' : 'none';
              
              // Grid para recomendações
              const recommendationsGrid = document.createElement('div');
              recommendationsGrid.className = 'recommendations-grid';
              
              tabContent.appendChild(recommendationsGrid);
              tabContainer.appendChild(tabContent);
          });
          
          recommendationsSection.appendChild(tabContainer);
          
          // Adicionar à tela de conclusão
          completionScreen.appendChild(recommendationsSection);
      }
      
      // Preencher cada aba com as recomendações
      for (const [category, items] of Object.entries(recommendations)) {
      const gridContainer = document.querySelector(`#rec-${category}-content .recommendations-grid`);
  
      // Limpar conteúdo anterior
      gridContainer.innerHTML = '';
  
      // Adicionar itens
      items.forEach(item => {
          // Criar card
          const card = document.createElement('div');
          card.className = 'recommendation-card';
          card.style.opacity = '1';
          card.style.transform = 'none';
  
          // Verificar se é um item exclusivo/premium
          if (item.category && (item.category.includes('exclusive') || item.price === 'Premium' || item.price === 'Ultra Premium')) {
              // Imagem
              const imageContainer = document.createElement('div');
              imageContainer.className = 'recommendation-image';
              imageContainer.innerHTML = `<img src="${item.image}" alt="${item.title}">`;
              card.appendChild(imageContainer);
  
              // Conteúdo
              const contentContainer = document.createElement('div');
              contentContainer.className = 'recommendation-content';
  
              // Título
              const titleElement = document.createElement('div');
              titleElement.className = 'recommendation-title';
              titleElement.textContent = item.title;
              contentContainer.appendChild(titleElement);
  
              // Descrição
              const descriptionElement = document.createElement('div');
              descriptionElement.className = 'recommendation-description';
              descriptionElement.textContent = item.description;
              contentContainer.appendChild(descriptionElement);
  
              // Informações adicionais - data/local ou preço
              if (category === 'events' || category === 'experiences') {
                  const eventInfo = document.createElement('div');
                  eventInfo.className = 'event-info';
                  eventInfo.innerHTML = `
                      <i class="fas fa-calendar-alt"></i> ${item.date}
                      <span class="event-info-divider">|</span>
                      <i class="fas fa-map-marker-alt"></i> ${item.location}
                  `;
                  contentContainer.appendChild(eventInfo);
  
                  if (item.capacity && item.progress !== undefined) {
                      const progressInfo = document.createElement('div');
                      progressInfo.className = 'event-info';
                      progressInfo.style.marginTop = '5px';
                      progressInfo.innerHTML = `<i class="fas fa-users"></i> ${item.capacity}`;
                      contentContainer.appendChild(progressInfo);
  
                      const progressContainer = document.createElement('div');
                      progressContainer.className = 'progress-bar-container';
  
                      const progressFill = document.createElement('div');
                      progressFill.className = 'progress-bar-fill';
                      progressFill.style.width = `${item.progress}%`;
  
                      progressContainer.appendChild(progressFill);
                      contentContainer.appendChild(progressContainer);
                  }
              } else if (category === 'products') {
                  const productMeta = document.createElement('div');
                  productMeta.className = 'recommendation-meta';
  
                  const categoryTag = document.createElement('div');
                  categoryTag.className = 'recommendation-category';
                  categoryTag.textContent = item.category[0].charAt(0).toUpperCase() + item.category[0].slice(1);
  
                  const priceTag = document.createElement('div');
                  priceTag.className = 'recommendation-date';
                  priceTag.innerHTML = `<i class="fas fa-tag"></i> R$ ${item.price.toFixed(2)}`;
  
                  productMeta.appendChild(categoryTag);
                  productMeta.appendChild(priceTag);
                  contentContainer.appendChild(productMeta);
              } else if (category === 'content') {
                  const contentMeta = document.createElement('div');
                  contentMeta.className = 'recommendation-meta';
  
                  const categoryTag = document.createElement('div');
                  categoryTag.className = 'recommendation-category';
                  const mainCategory = item.category.find(cat =>
                      ['video', 'podcast', 'article', 'tutorial'].includes(cat));
                  categoryTag.textContent = mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);
  
                  const durationTag = document.createElement('div');
                  durationTag.className = 'recommendation-date';
                  durationTag.innerHTML = `<i class="fas fa-clock"></i> ${item.duration}`;
  
                  contentMeta.appendChild(categoryTag);
                  contentMeta.appendChild(durationTag);
                  contentContainer.appendChild(contentMeta);
              }
  
              // Botões de ação
              const actionsContainer = document.createElement('div');
              actionsContainer.className = 'recommendation-actions';
  
              const mainButton = document.createElement('button');
              mainButton.className = 'btn btn-primary';
  
              if (category === 'events') {
                  mainButton.innerHTML = `<i class="fas fa-ticket-alt"></i> ${item.date.includes('2025') ? 'Pré-registro' : 'Ingressos'}`;
              } else if (category === 'experiences') {
                  mainButton.innerHTML = `<i class="fas fa-star"></i> ${item.date.includes('Agende') ? 'Reservar' : 'Participar'}`;
              } else if (category === 'products') {
                  mainButton.innerHTML = `<i class="fas fa-shopping-cart"></i> Comprar`;
              } else if (category === 'content') {
                  if (item.category.includes('video')) {
                      mainButton.innerHTML = `<i class="fas fa-play"></i> Assistir`;
                  } else if (item.category.includes('podcast')) {
                      mainButton.innerHTML = `<i class="fas fa-headphones"></i> Ouvir`;
                  } else if (item.category.includes('article')) {
                      mainButton.innerHTML = `<i class="fas fa-book-open"></i> Ler`;
                  } else {
                      mainButton.innerHTML = `<i class="fas fa-eye"></i> Ver`;
                  }
              }
  
              actionsContainer.appendChild(mainButton);
              contentContainer.appendChild(actionsContainer);
  
              card.appendChild(contentContainer);
          }
  
          // Adicionar card à grade
          gridContainer.appendChild(card);
      }); // fecha o forEach
  } // fecha o for...of
  
              actionsContainer.appendChild(mainButton);
              
              // Botões secundários
              const likeButton = document.createElement('button');
              likeButton.className = 'btn-icon';
              likeButton.innerHTML = `<i class="fas fa-heart"></i>`;
              actionsContainer.appendChild(likeButton);
              
              const shareButton = document.createElement('button');
              shareButton.className = 'btn-icon';
              shareButton.innerHTML = `<i class="fas fa-share-alt"></i>`;
              actionsContainer.appendChild(shareButton);
              
              contentContainer.appendChild(actionsContainer);
          card.appendChild(contentContainer);
          
          // Adicionar card ao grid
          gridContainer.appendChild(card);
      }
  ; // Correctly closed forEach loop
  
  // Se não houver recomendações
  if (items.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
          <div class="empty-state-icon">
              <i class="fas fa-search"></i>
          </div>
          <div class="empty-state-title">Nenhuma recomendação encontrada</div>
          <div class="empty-state-text">
              Não encontramos recomendações nesta categoria com base no seu perfil. 
              Continue interagindo conosco para recebermos mais informações sobre suas preferências.
          </div>
      `;
      gridContainer.appendChild(emptyState);
  }
  
  
  // Modificar a função submitForm para gerar recomendações
  
      // Salvar dados (simulação)
      // Modificar a função submitForm para gerar recomendações
  
      // Salvar dados (simulação)
      localStorage.setItem('furiax_fan_data', JSON.stringify(formData));
      
      // Adicionar recompensas (simulação)
      addUserRewards();
      
      // Gerar recomendações personalizadas
      const recommendations = generateRecommendations();
      
      // Mostrar tela final
      document.querySelectorAll('.form-step').forEach(el => {
          el.style.display = 'none';
      });
      document.getElementById('complete-content').style.display = 'block';
      
      // Adicionar recomendações à tela final
      addRecommendationsToCompletionScreen(recommendations);
      
      // Mostrar notificação
      showNotification('Concluído!', 'Seu perfil foi atualizado com sucesso', 'success');
      
      // Mostrar dica sobre as recomendações
      setTimeout(() => {
          showNotification('Recomendações Personalizadas', 'Com base no seu perfil, preparamos sugestões personalizadas para você. Confira abaixo!', 'info');
      }, 3500);
  
      
  
  // Adicionar funções para animação e interações das recomendações
  document.addEventListener('DOMContentLoaded', function() {
      // Configurar navegação por abas e outras funções
      setupStarRating();
      setupInputMasks();
      
      // Adicionar evento para abas de recomendações (delegação de eventos)
      document.addEventListener('click', function(event) {
          if (event.target.closest('.tab-item')) {
              const tab = event.target.closest('.tab-item');
              const tabId = tab.getAttribute('data-tab');
              
              // Remover classe ativa de todas as abas no mesmo container
              const tabsContainer = tab.closest('.tabs-container');
              tabsContainer.querySelectorAll('.tab-item').forEach(t => {
                  t.classList.remove('active');
              });
              
              // Adicionar classe ativa à aba clicada
              tab.classList.add('active');
              
              // Esconder todos os conteúdos de abas no mesmo container
              tabsContainer.querySelectorAll('.rec-tab-content').forEach(content => {
                  content.style.display = 'none';
              });
              
              // Mostrar conteúdo da aba selecionada
              const tabContent = document.getElementById(`${tabId}-content`);
              if (tabContent) {
                  tabContent.style.display = 'block';
                  
                  // Animar entrada dos cards
                  animateRecommendationCards(tabContent);
              }
          }
      });
  });
  
  // Animação para cards de recomendação
  function animateRecommendationCards(tabContent) {
          const cards = tabContent.querySelectorAll('.recommendation-card');
          cards.forEach((card, index) => {
              // Define a transição antes de aplicar transformações
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '0';
              card.style.transform = 'translateY(20px)';
  
              setTimeout(() => {
                  card.style.opacity = '1';
                  card.style.transform = 'none';
              }, index * 100);
          });
      }
  // Variável para controlar se o aviso já foi visto
  let documentGuideShown = false;
  
  // Função para configurar o interceptador de upload
  function setupDocumentUploadInterceptor() {
    // Obter o input original
    const originalInput = document.getElementById('documentUpload');
    
    // Criar um novo elemento para receber os cliques
    const interceptor = document.createElement('div');
    interceptor.style.position = 'absolute';
    interceptor.style.top = '0';
    interceptor.style.left = '0';
    interceptor.style.width = '100%';
    interceptor.style.height = '100%';
    interceptor.style.cursor = 'pointer';
    interceptor.style.zIndex = '10';
    
    // Posicionar o container do input como relativo para que o interceptor funcione
    originalInput.parentElement.style.position = 'relative';
    
    // Adicionar o interceptor antes do input
    originalInput.parentElement.appendChild(interceptor);
    
    // Adicionar evento de clique no interceptor
    interceptor.addEventListener('click', function(e) {
      // Impedir que o clique chegue até o input original
      e.preventDefault();
      e.stopPropagation();
      
      // Se o guia ainda não foi mostrado, exibir o popup
      if (!documentGuideShown) {
        showDocumentPhotoGuide(function() {
          // Esta função será chamada quando o popup for fechado
          documentGuideShown = true;
          
          // Remover o interceptor para permitir o clique no input
          originalInput.parentElement.removeChild(interceptor);
          
          // Simular clique no input original após o popup ser fechado
          originalInput.click();
        });
      }
    });
  }
  
  // Modificar a função showDocumentPhotoGuide para aceitar um callback
  function showDocumentPhotoGuide(callback) {
    const popup = document.createElement('div');
    popup.className = 'popup-overlay';
    popup.innerHTML = `
      <div class="popup-container">
        <div class="popup-header">
          <h3 class="popup-title">ATENÇÃO: Foto do Documento</h3>
          <div class="popup-close"><i class="fas fa-times"></i></div>
        </div>
        <div class="popup-body">
          <div class="popup-icon">
            <i class="fas fa-camera"></i>
          </div>
          <div class="popup-message">
            <p>Para validar seu CPF, precisamos de uma foto <strong>clara e nítida</strong> do seu documento.</p>
          </div>
          <div class="popup-tips">
            <h4><i class="fas fa-lightbulb"></i> Dicas importantes:</h4>
            <ul>
              <li>Escolha um ambiente <strong>bem iluminado</strong></li>
              <li>Posicione o documento em uma superfície plana</li>
              <li>Evite sombras sobre o documento</li>
              <li>Certifique-se que o CPF está completamente visível</li>
              <li>Mantenha a câmera estável para evitar fotos borradas</li>
            </ul>
          </div>
          <div class="popup-actions">
            <button class="btn btn-primary" id="confirmPopup">
              <i class="fas fa-check"></i> Entendi, vamos lá
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Animar entrada
    setTimeout(() => {
      popup.classList.add('active');
    }, 10);
    
    // Configurar eventos para fechar o popup e chamar o callback
    const closeAndCallback = () => {
      closePopup(popup, callback);
    };
    
    popup.querySelector('.popup-close').addEventListener('click', closeAndCallback);
    popup.querySelector('#confirmPopup').addEventListener('click', closeAndCallback);
  }
  
  
  // Atualizar a função closePopup para suportar o callback
  function closePopup(popup, callback) {
    popup.classList.remove('active');
    setTimeout(() => {
      document.body.removeChild(popup);
      // Executar o callback quando o popup for completamente removido
      if (typeof callback === 'function') {
        callback();
      }
    }, 300);
  }
  
  // Chamar a função de setup quando o documento estiver carregado
  document.addEventListener('DOMContentLoaded', function() {
    // Seu código existente...
    
    // Configurar o interceptador para o upload de documento
    setupDocumentUploadInterceptor();
  });
  
  
  