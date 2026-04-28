import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Forneça o caminho para o seu aplicativo Next.js para carregar next.config.js e arquivos .env em seu ambiente de teste
  dir: './',
});

// Adicione qualquer configuração personalizada a ser enviada ao Jest
/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Adicione mais opções de configuração antes de cada teste ser executado
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração do Next.js que é assíncrona
export default createJestConfig(config);
