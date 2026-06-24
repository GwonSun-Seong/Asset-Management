import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Vite가 기본 차단하는 모든 OS 시스템 환경변수를 명시적으로 로드
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      '__SUPABASE_URL__': JSON.stringify(env.SUPABASE_URL || '__SUPABASE_URL__'),
      '__SUPABASE_KEY__': JSON.stringify(env.SUPABASE_KEY || '__SUPABASE_KEY__'),
      '__SECURITY_KEY__': JSON.stringify(env.SECURITY_KEY || '__SECURITY_KEY__'),
    },
    server: {
      proxy: {
        '/toss-api': {
          target: 'https://openapi.tossinvest.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/toss-api/, ''),
          secure: true
        }
      }
    }
  };
});
