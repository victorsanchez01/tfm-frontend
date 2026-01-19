# TFM Learning Platform - Frontend

Plataforma de aprendizaje adaptativa impulsada por IA.

## Tecnologías

- React 18 + TypeScript
- Vite
- CSS Modules
- React Router
- React Query
- Zustand

## Despliegue

### Vercel (Recomendado)

1. Fork este repositorio
2. Importa en [Vercel](https://vercel.com)
3. Deploy automático

### Local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Características

- 🎯 Quiz adaptativo con algoritmo IRT/CAT
- 📊 Sistema de progreso personalizado
- 🏆 Certificados generados automáticamente
- 💾 Sistema de favoritos
- 📱 100% responsive
- 🤖 100% IA (sin instructores humanos)

## Progreso

- **Historias completadas**: 10/22 (45.5%)
- **Estado**: En desarrollo activo

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
