const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const multer = require('multer');

// --------------- INÍCIO DAS REGRAS DE SEGURANÇA (AULA 2) ---

const fs = require('fs'); // NOVO: Módulo nativo para manipulação de pastas

// [SLIDE 9] Função para criar o diretório de upload, se ele não existir.
const createUploadDirectory = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Diretório ${dir} criado automaticamente.`);
    }
};

// [SLIDE 5] O Guardião: Função para validar o tipo de arquivo (fileFilter).
const fileFilter = (req, file, cb) => {
    // Permite apenas JPG ou PNG.
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); 
    } else {
        cb(new Error('Tipo de arquivo inválido. Apenas JPG e PNG são permitidos.'), false);
    }
};

// [SLIDE 7] Define o limite máximo de tamanho.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB em bytes

// ------------------------ FIM DAS REGRAS DE SEGURANÇA (AULA 2) ---

app.get('/', (req,res) => {
    res.send(('Servidor de upload funcionando'));
});

app.listen(port, ()=> {
    console.log(`Servidor esta rodando na porta: ${port}`);
});

const storage = multer.diskStorage({
//retirar    destination: function(req,file,cd){
//retirar        cd(null,'uploads/');  
//retirar    },
    destination: function(req,file,cd){
        const uploadDiretorio = 'uploads/';
        createUploadDirectory(uploadDiretorio); // <--- Chamada para verificar/criar pasta
        cd(null, uploadDiretorio); // <--- NOVO: Usa a constante local 'uploadDir'
    },
    filename: function(req,file,cd){
        cd(null, Date.now() + path.extname(file.originalname));
    }
});

//retirar    const upload = multer({
//retirar        storage: storage
//retirar    })
const upload = multer({
    storage: storage,
    fileFilter: fileFilter, // <--- NOVO: Aplica o filtro de tipo (Slide 5)
    limits: {              // <--- NOVO: Aplica os limites de tamanho e quantidade (Slide 7)
        fileSize: MAX_FILE_SIZE, 
        files: 1 
    }
});

//retirar    app.post('/upload', upload.single('meuArquivo'), (req,res)=>{
//retirar        if(!req.file){
//retirar            return res.status(400).send('Nenhum arquivo enviado');
//retirar        }
//retirar        res.send(`Arquivo ${req.file.filename} enviado com sucesso`);
//retirar    });
// [SLIDE 11] Rota com tratamento de erros (usando callback) para capturar falhas do Multer.
app.post('/upload', (req, res) => {
    
    // Chama 'upload.single' (Middleware) e passa uma função de callback (err)
    upload.single('meuArquivo')(req, res, function (err) {
        
        // --- INÍCIO DO TRATAMENTO DE ERROS DO MULTER ---
        // Verifica se o erro é uma instância de erro do Multer (limits)
        if (err instanceof multer.MulterError) {
            return res.status(400).send({ 
                message: `Erro do Multer: ${err.code}.`,
                detail: "Verifique o tamanho ou a quantidade de arquivos."
            });
        } 
        
        // Captura o erro customizado do fileFilter ou outros erros genéricos.
        if (err) {
            return res.status(400).send({ message: err.message });
        }
        // --- FIM DO TRATAMENTO DE ERROS ---

        // Lógica de Sucesso
        if (!req.file){
            return res.status(400).send('Nenhum arquivo enviado');
        }

        res.send(`Arquivo ${req.file.filename} enviado com sucesso`);
    });
});