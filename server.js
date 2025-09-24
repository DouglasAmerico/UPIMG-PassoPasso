// 1. Importa a biblioteca Express.
const express = require('express');
// 2. Cria uma instância do Express, que será nosso servidor.
const app = express();
// 3. Define a porta em que o servidor vai rodar.
const port = 3000;

// 4. Cria uma rota GET para o caminho raiz ('/') para teste.
app.get('/', (req, res) => {
  res.send('Servidor de Upload está no ar!');
});

// 5. Inicia o servidor e o faz "escutar" por requisições na porta definida.
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

//---------------- primeira parte ----------------

// Importa o módulo 'path' para manipular caminhos de arquivos.
const path = require('path');
// Importa a biblioteca Multer.
const multer = require('multer');

// Configura como os arquivos serão armazenados no disco.
const storage = multer.diskStorage({
  // 'destination' define a pasta de destino do arquivo.
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  // 'filename' define como o arquivo será nomeado.
  filename: function (req, file, cb) {
    // Usamos a data atual (timestamp) + extensão original para um nome único.
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Cria a instância do Multer, passando a configuração de armazenamento.
const upload = multer({ storage: storage });

//---------------- segunda parte ----------------------

// Cria uma rota do tipo POST para o caminho '/upload'.
// 'upload.single('meuArquivo')' é o middleware que processa UM ('single') 
// arquivo vindo do campo 'meuArquivo'.
app.post('/upload', upload.single('meuArquivo'), (req, res) => {
  // Se 'req.file' não existir, o upload falhou ou nenhum arquivo foi enviado.
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }

  // Se o upload for bem-sucedido, envia uma resposta de sucesso.
  res.send(`Arquivo ${req.file.filename} enviado com sucesso!`);
});

//--------------- teste no insominia -----------------------

/* Siga os passos abaixo para simular o envio de um arquivo.
-> Inicie seu servidor: node server.js
No Insomnia/Postman:
-> Método: POST
-> URL: http://localhost:3000/upload
No corpo (Body):
-> Selecione Multipart Form.
-> Crie um campo com KEY = meuArquivo.
-> Mude o tipo do campo de Text para File.
Anexe e envie o arquivo.
*/ 