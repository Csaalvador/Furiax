const Tesseract = require('tesseract.js');

// ...

app.post('/api/validate-cpf', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado' });
  }

  const imagePath = req.file.path;

  Tesseract.recognize(imagePath, 'por', { logger: m => console.log(m) })
    .then(({ data: { text } }) => {
      fs.unlinkSync(imagePath); // Remove o arquivo temporário

      console.log("Texto extraído:", text);

      // Expressão regular para encontrar CPF no texto
      const cpfMatch = text.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/);

      if (!cpfMatch) {
        return res.json({
          success: false,
          message: 'Não foi possível identificar um CPF válido.',
          extractedText: text.trim()
        });
      }

      // Aqui você pode melhorar com regex para nome e nascimento também
      res.json({
        success: true,
        message: 'Documento validado com sucesso!',
        cpf: cpfMatch[0],
        extractedText: text.trim()
      });
    })
    .catch(err => {
      console.error(err);
      fs.unlinkSync(imagePath);
      res.status(500).json({ success: false, message: 'Erro ao processar o documento' });
    });
});
