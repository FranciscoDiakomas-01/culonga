import axios from 'axios';
import FormData from 'form-data';

export default async function uploadFile(file: Express.Multer.File) {
  try {
    // 1 - Cria o upload "slot"
    const response = await axios.post(
      'https://api.uploadthing.com/v6/uploadFiles',
      {
        files: [
          {
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            customId: null,
          },
        ],
        acl: 'public-read',
        metadata: null,
        contentDisposition: 'inline',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Uploadthing-Api-Key': process.env.UPLOADTHING_TOKEN!,
        },
      },
    );
    const data = response.data[0];
    if (!data) {
      return {
        message: 'Erro ao salvar arquivo',
        success: false,
      };
    }
    const { url, fields, fileUrl } = data;

    // 2 - Monta o formulário com os campos + arquivo
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value as string);
    }
    formData.append('file', file.buffer, file.originalname);
    // 3 - Envia o arquivo pro bucket
    const resFinal = await axios.post(url, formData, {
      headers: formData.getHeaders(),
    });
    // 4 - Retorna sucesso com URL do arquivo
    return {
      success: true,
      message: 'Arquivo salvo com sucesso',
      fileUrl,
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao enviar pro bucket:');
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
    } else {
      console.error('Erro inesperado:', error);
    }

    return {
      message: 'Erro ao salvar arquivo',
      success: false,
    };
  }
}
