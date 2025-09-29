const express = require('express');
const multer = require('multer'); 
const path = require('path');
const app = express();
const port = 3000;

const fs = require('fs'); // [SLIDE 9] Módulo 'fs' para criação de pastas (Aula 2)

// [SETUP] Middleware essencial para ler JSON (embora não seja usado para upload, é boa prática)
app.use(express.json());

// ----------------------------------------------------------------------
// MÓDULO 1: CONFIGURAÇÃO DO MULTER E DISKSTORAGE (Aulas 1 e 2)
// ----------------------------------------------------------------------

// [SLIDE 9/10 - Aula 2] Função para garantir que a pasta de destino exista
const createUploadDirectory = (dir) => {
    // Checa se a pasta existe. (!fs.existsSync(caminho))
    if (!fs.existsSync(dir)) {
        // Se não existir, cria a pasta recursivamente.
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Diretório ${dir} criado com sucesso.`);
    }
};


const storage = multer.diskStorage({
    // [SLIDE 10 - Aula 2] A função 'destination' é onde a lógica do 'fs' é injetada.
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        createUploadDirectory(uploadDir); // Garante que a pasta exista!
        cb(null, uploadDir); 
    },
    
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// [SLIDE 4/5 - Aula 2] O Guardião: Função para validar o tipo de arquivo (MIME type).
const fileFilter = (req, file, cb) => {
    // Permite apenas JPG ou PNG (tipos mais comuns para imagens web).
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); 
    } else {
        // Rejeita o arquivo com uma mensagem de erro.
        cb(new Error('Tipo de arquivo inválido. Apenas JPG e PNG são permitidos.'), false);
    }
};

// [SLIDE 7 - Aula 2] O Controle: Define os limites de segurança.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB em bytes

// Cria a instância do Multer com todas as configurações de segurança.
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter, // Aplica o filtro de tipo (Aula 2)
    limits: { 
        fileSize: MAX_FILE_SIZE, // Limite de tamanho (Aula 2)
        files: 1 // Apenas um arquivo por vez
    }
});

// ----------------------------------------------------------------------
// MÓDULO 2: ROTAS (Aulas 1 e 2)
// ----------------------------------------------------------------------

app.get('/', (req, res) => {
  res.send('Servidor de Upload está no ar!');
});


// [SLIDE 9 - Aula 1 | SLIDE 11 - Aula 2] Rota para upload de UM ÚNICO arquivo (com tratamento de erro).
app.post('/upload-single', (req, res) => {
    
    // Uso da função 'upload.single' envolvida para capturar erros.
    // 'meuArquivo' deve ser o 'key' do campo no formulário multipart/form-data.
    upload.single('meuArquivo')(req, res, function (err) {
        
        // --- 1. TRATAMENTO DE ERROS DO MULTER ---
        if (err instanceof multer.MulterError) {
            // Erros automáticos do limits (ex: LIMIT_FILE_SIZE)
            return res.status(400).send({ 
                message: `Erro do Multer: ${err.code}. Tente novamente.` 
            });
        } 
        
        if (err) {
            // Erro customizado do fileFilter (ex: 'Tipo de arquivo inválido.')
            return res.status(400).send({ message: err.message });
        }
        // --- FIM DO TRATAMENTO DE ERROS ---


        // Se chegou aqui, o upload foi um sucesso (ou nenhum arquivo foi enviado).
        if (!req.file) {
            return res.status(400).send('Nenhum arquivo enviado. Verifique se o campo é "meuArquivo".');
        }

        res.status(200).send(`Arquivo ${req.file.filename} enviado com sucesso! Caminho: ${req.file.path}`);
    });
});


// [SLIDE 13 - Aula 2] Rota para upload de MÚLTIPLOS arquivos (Exemplo de expansão)
app.post('/upload-multi', (req, res) => {
    
    // O Multer aceita até 5 arquivos do campo 'minhasFotos'.
    upload.array('minhasFotos', 5)(req, res, function (err) {
        
        // ... (O tratamento de erro do Multer é o mesmo aqui) ...
        if (err instanceof multer.MulterError) {
            return res.status(400).send({ message: `Erro do Multer: ${err.code}.` });
        } 
        if (err) {
            return res.status(400).send({ message: err.message });
        }

        // Se chegou aqui, a array de arquivos está em req.files
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Nenhum arquivo enviado.');
        }

        const fileNames = req.files.map(file => file.filename);
        
        res.status(200).send({ 
            message: "Arquivos enviados com sucesso!",
            files: fileNames
        });
    });
});



app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});