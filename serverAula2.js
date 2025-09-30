// A função fileFilter recebe (requisição, arquivo, callback)
const fileFilter = (req, file, cb) => {
    // 1. Verifica se o mimetype do arquivo é um dos permitidos (JPG ou PNG)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        // Se for válido, chama o callback (cb) com 'null' para indicar que está OK (sem erro)
        cb(null, true); 
    } else {
        // Se não for válido, chama o callback (cb) com um erro e 'false' para rejeitar
        // A mensagem de erro será capturada pelo Express posteriormente.
        cb(new Error('Tipo de arquivo inválido. Apenas JPG e PNG são permitidos.'), false);
    }
};

// ... e a sua adição na configuração do Multer:
const upload = multer({ 
    // ...
    fileFilter: fileFilter 
    // ...
});




// Define a constante para o tamanho (5 Megabytes em bytes)
// 1 byte = 1, 1 Kilobyte = 1024 bytes, 1 Megabyte = 1024 KB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: MAX_FILE_SIZE, // Limite o tamanho do arquivo para 5MB
        files: 1 // Limite a quantidade de arquivos para 1 por requisição
    }
});


// Importa o módulo nativo File System (fs)
const fs = require('fs'); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        
        // 1. Checa se a pasta existe. (!fs.existsSync(caminho))
        if (!fs.existsSync(uploadDir)) {
            // 2. Se não existir, cria a pasta de forma síncrona.
            // A opção { recursive: true } cria subpastas se necessário (boa prática).
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // 3. Chama o callback para dizer ao Multer onde salvar.
        cb(null, uploadDir); 
    },
    // ... lógica de filename (da Aula 1) continua aqui ...
});

//Vamos envolver nossa rota com um bloco try/catch usando um middleware especial.
// Importe o multer e configure 'upload' como antes
// const upload = multer({...});
app.post('/upload', (req, res) => {
    // Usa 'upload.single' (ou array) e captura o erro:
    upload.single('meuArquivo')(req, res, function (err) {

        // 1. Verifica se houve erro DO MULTER
        if (err instanceof multer.MulterError) {
            // Retorna um erro 400 (Bad Request) com o código do erro.
            return res.status(400).send({ 
                message: `Erro do Multer: ${err.code}`,
                detail: err.message 
            });
        } 
        
        // 2. Verifica se houve erro do fileFilter ou outro erro genérico
        if (err) { return res.status(400).send({ message: err.message }); }

        // 3. Sucesso: Se tudo deu certo, continue a lógica da sua rota
        if (!req.file) { return res.status(400).send('Nenhum arquivo enviado.'); }

        res.send(`Arquivo ${req.file.filename} enviado com sucesso!`);
    });
});


