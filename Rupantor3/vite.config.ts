import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// This configuration is designed to ensure the build resolves the custom
// asset path used for the logo and bundles the application correctly.
export default defineConfig({
  plugins: [react()],
  // Define base directory for resolving path.resolve
  root: './',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      // Custom alias for the logo image to ensure it is correctly bundled and referenced.
      // The image is expected to be located at src/assets/30413506c2fe0151b8e7a901d4930f79e5e6f227.png
      'figma:asset/30413506c2fe0151b8e7a901d4930f79e5e6f227.png': path.resolve(__dirname, './src/assets/30413506c2fe0151b8e7a901d4930f79e5e6f227.png'),
    },
  },
  // Set the output directory to 'build' as specified in your README
  build: {
    outDir: 'build',
  },
});
