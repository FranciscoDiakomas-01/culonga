import JWTService from 'src/services/jwt/jwt.service';

export function getUserId(token: string) {
  const jwt = new JWTService();
  try {
    const userid = jwt.decode(token);
    return userid?.userid ?? '';
  } catch (error) {
    return '';
  }
}

const ALLOWED_MIME_TYPES = [
  // PDF
  'application/pdf',
  'text/plain',

  // Imagens
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',

  // Áudio
  'audio/mpeg', // mp3
  'audio/wav',
  'audio/ogg',
  'audio/webm',

  // planilhas e docs office
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export function isValidFile(file: Express.Multer.File) {
  if (!file) {
    return {
      alowed: false,
      message: 'Envia  arquivo',
    };
  }

  // Verifica tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      alowed: false,
      message: `Tipo de arquivo não permitido: ${file.mimetype}`,
    };
  }

  // Limita tamanho (opcional, exemplo: 10MB)
  const MAX_SIZE = 4 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      alowed: false,
      message: `Arquivo muito grande (máx 10MB)`,
    };
  }

  return {
    alowed: true,
    message: `Arquivo permito`,
  };
}



