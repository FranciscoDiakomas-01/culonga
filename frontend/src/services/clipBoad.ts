export const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Copiado com sucesso!");
    })
    .catch((err) => {
      console.error("Erro ao copiar: ", err);
    });
};
