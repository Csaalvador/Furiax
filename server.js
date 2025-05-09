require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 📂 Upload (mantido como você já tinha)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 📥 Validação de CPF via documento
app.post('/api/validate-cpf', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado' });
  }

  setTimeout(() => {
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error('Erro ao remover arquivo temporário:', err);
    }

    res.json({
      success: true,
      message: 'Documento validado com sucesso!',
      cpf: '583.720.708-07',
      name: 'CAUA SALVADOR LIMA',
      birthDate: '27/10/2004',
      documentType: 'RG'
    });
  }, 2000);
});

// 🛡️ Autenticação com Discord (novo)
app.post('/api/discord/token', async (req, res) => {
  const { code } = req.body;

  try {
    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI,
      scope: 'identify relationships.read'
    });

    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json({
      token: accessToken,
      user: userRes.data
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erro na autenticação com o Discord' });
  }
});

// 🔊 Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
