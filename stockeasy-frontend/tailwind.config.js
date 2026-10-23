/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta do StockEasy — pensada para um painel de gestão confiável,
        // sem cair no clichê "SaaS genérico" (nada de roxo/azul-elétrico padrão).
        ink: {
          DEFAULT: '#1F2420', // texto principal, quase-preto esverdeado
          soft: '#4B564D',    // texto secundário
        },
        paper: '#FAFAF8',     // fundo principal da aplicação
        panel: {
          DEFAULT: '#1B2A22', // fundo da sidebar (verde-floresta escuro)
          soft: '#24362B',    // hover/active na sidebar
        },
        moss: {
          DEFAULT: '#2F6F4E', // accent primário: estoque, crescimento, ações positivas
          light: '#E7F0EA',
          dark: '#234F38',
        },
        amber: {
          DEFAULT: '#C97C1F', // alerta (estoque baixo)
          light: '#FBEFDD',
          dark: '#8A5210',   // texto de aviso sobre fundo claro (contraste AA)
        },
        clay: {
          DEFAULT: '#B8503E', // perigo/crítico (estoque zerado, exclusão)
          light: '#F8E7E3',
          dark: '#8E3A2B',   // texto de erro sobre fundo claro + hover de botão perigo
        },
        line: '#E4E1D9',      // divisórias e bordas sutis
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Work Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
