// Importar multer para processar upload de arquivos
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();


// Criar diretório para uploads se não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar o multer para armazenar arquivos temporariamente
const upload = multer({ 
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// Rota para validação de CPF via documento (adicione junto com as outras rotas)
app.post('/api/validate-cpf', upload.single('document'), (req, res) => {
  // Verificar se recebemos um arquivo
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nenhum arquivo foi enviado' 
    });
  }

  // Em um sistema real, aqui usaria OCR para extrair o CPF
  // Para demonstração, vamos simular com um atraso
  setTimeout(() => {
    // Remover arquivo temporário
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error('Erro ao remover arquivo temporário:', err);
    }

    // Simular validação bem-sucedida (em produção, use um OCR real)
    res.json({
      success: true,
      message: 'Documento validado com sucesso!',
      cpf: '583.720.788-07',
      name: 'CAUA SALVADOR LIMA',
      birthDate: '27/10/2004',
      documentType: 'RG'
    });
  }, 2000); // Simular processamento de 2 segundos
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
