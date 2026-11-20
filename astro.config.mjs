// @ts-check
import { defineConfig } from 'astro/config';

// 本地邮件工具：只在 astro dev 时注入路由，不会进入构建产物
/** @type {import('astro').AstroIntegration} */
const devMail = {
  name: 'dev-mail',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command !== 'dev') return;

      injectRoute({
        pattern: '/dev/mail',
        entrypoint: './src/dev/mail.astro'
      });
      injectRoute({
        pattern: '/api/dev/send-mail',
        entrypoint: './src/dev/api/send-mail.ts'
      });
      injectRoute({
        pattern: '/dev/mail/preview',
        entrypoint: './src/dev/api/mail-preview.ts'
      });
    }
  }
};

// 站点地址用于 canonical / OG / sitemap 等绝对链接
export default defineConfig({
  site: 'https://jrxh-top.github.io',
  output: 'static',
  integrations: [devMail],
  build: {
    inlineStylesheets: 'auto'
  },
  devToolbar: {
    enabled: false
  }
});
