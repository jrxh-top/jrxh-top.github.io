// @ts-check
import { defineConfig } from 'astro/config';

// 站点地址用于 canonical / OG / sitemap 等绝对链接
export default defineConfig({
  site: 'https://jrxh-top.github.io',
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  },
  devToolbar: {
    enabled: false
  }
});
