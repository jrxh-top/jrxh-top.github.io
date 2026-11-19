# Jrxh Spark Console / 星火控制台

`jrxh.top` 的创意个人主页：把域名拆成终端提示符 `jrxh@top:~$`，让首页像一个开发者的「星火发射台」。

- 站点名：Jrxh
- 主标题：把想法，推到 top。
- 技术栈：Astro + TypeScript + 原生 CSS（无 React / Vue / UI 框架 / 动画库）
- 交互：原生 TS 实现终端命令，**不使用 eval**

## 安装与运行

```bash
npm install
npm run dev      # 本地开发 http://localhost:4321
npm run build    # 产出静态文件到 dist/
npm run preview  # 预览构建结果
```

Node 版本建议 18+（本项目在 Node 22 下验证通过）。

## 文件结构

```
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   ├── og.svg          # OG 图源文件
│   └── og.png          # 实际分享使用的 1200×630 PNG
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Terminal.astro
│   │   ├── Bento.astro
│   │   ├── ProjectCard.astro
│   │   └── Footer.astro
│   ├── content/
│   │   └── writing/            # 文章 Markdown，一个文件一篇文章
│   ├── content.config.ts       # 写作集合的字段校验
│   ├── data/
│   │   ├── site.ts             # 全站文案 / 项目 / 灵感池
│   │   └── commands.ts         # 命令 → 行为 的映射配置
│   ├── layouts/
│   │   └── ArticleLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   ├── spark.astro
│   │   └── writing/
│   │       ├── index.astro     # 写作列表
│   │       └── [slug].astro    # 文章详情
│   └── styles/
│       └── global.css
└── README.md
```

## 占位符替换清单

全站文案集中在 `src/data/site.ts`，搜索 `{{` 即可定位全部待替换内容。

| 占位符 | 位置 | 说明 |
| --- | --- | --- |
| `hello@jrxh.top` | `site.email` | 换成你的真实邮箱（`contact` 命令与联系卡共用） |
| `{{SOCIAL_URL}}` | `site.links.x` | 一个真正活跃的平台主页（也可改成博客 / 即刻 / 掘金） |
| `{{NOW_PROJECT_NAME}}` | `bento` 第 4 卡 | 正在折腾的小项目名 |
| `{{NOW_PROJECT_WHY}}` | `bento` 第 4 卡 | 为什么做这个实验，一句话 |
| `{{PROJECT_1_NAME}}` … `{{PROJECT_2_URL}}` | `projects` | 两个精选项目的名称、问题、角色、结果、标签、链接 |
| 技术栈 `TypeScript / React / …` | `bento` 第 3 卡 | 按真实使用情况替换 |
| `Star` 相关文案 | `bento` 第 2 卡 | 当前状态按真实进度改写 |

GitHub 已填写为 `https://github.com/jrxh-top`，页脚、联系卡和项目区都会使用这个地址；目前只剩社交平台链接是占位符。

补充说明：

- `src/data/site.ts` 里的 `sparks` 是 `./spark.sh` 与 `/spark` 页共用的灵感池，可自由增删。
- 项目卡右上的「火花等级」由 `sparkLevel`（1–3）控制，纯装饰，不编造数据。
- `site.h1Lead` / `h1Tail` / `subtitle` / `motto` 对应主标题、副标题与品牌口号。
- 写作区不使用占位符，内容来自 `src/content/writing/*.md`（见下一节）。

## 新增 / 修改文章

在 `src/content/writing/` 下新建 Markdown 文件，**文件名就是 URL**：

```
src/content/writing/ship-first.md  →  /writing/ship-first/
```

文件头的 frontmatter：

```yaml
---
title: '先上线，再完美'
description: '一句话摘要，用于列表、文章头部与 SEO'
date: 2026-11-12
tags: ['工程习惯', '产品']
draft: false
---
```

- 首页写作卡自动取最新 2 篇，写作列表、上一篇 / 下一篇也会自动更新；
- `draft: true` 的文章只在 `npm run dev` 下可见，`npm run build` 时会被排除；
- 正文支持标准 Markdown：`##` 小标题、引用、列表、行内代码与代码块都有对应排版；
- 删空所有文章后，首页写作卡会自动显示「暂无公开写作，先去折腾项目。」；
- 现有文章均为示例内容，直接替换或删除即可。

## 部署

### Vercel

1. 把仓库推到 GitHub；
2. Vercel 里 New Project → 选择仓库；
3. Framework 选 **Astro**，Build Command `npm run build`，Output Directory `dist`；
4. 部署完成后在 Project → Settings → Domains 添加 `jrxh.top` 与 `www.jrxh.top`，按提示配置 DNS。

### GitHub Pages

1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**；
2. 使用官方 `withastro/action` 工作流构建并发布 `dist`；
3. 若使用自定义域名，在 `public/` 下放一个内容为 `jrxh.top` 的 `CNAME` 文件（构建后会进 `dist`）。

### DNS

- 根域名 `jrxh.top`：添加 `A` 记录指向托管商的 IP，或按平台要求使用 `ALIAS/ANAME`；
- `www`：添加 `CNAME` 指向平台给出的域名（如 `cname.vercel-dns.com`）；
- 在平台侧开启 HTTPS（Let's Encrypt 自动签发即可）。

### 国内节点提醒

如果部署到国内云厂商（阿里云 / 腾讯云 / 华为云等），`.top` 域名同样需要完成 **ICP 备案**，并使用已备案的服务器与 80/443 端口；未备案会被拦截。海外托管（Vercel / Cloudflare Pages / GitHub Pages）无需 ICP 备案，但国内访问速度与稳定性需自行评估。

## 交互说明

- 终端输入框 Enter 执行命令，↑/↓ 翻历史，Esc 清屏；
- 快捷按钮会填充并执行对应命令；
- 命令通过 `commands.ts` 的映射表分发到 Terminal 内的执行函数，**没有 eval**；
- `contact` 优先使用 `navigator.clipboard`，失败时回退为展示邮箱文本；
- `./spark.sh` 触发约 800ms 的轻量 DOM 粒子；Konami code（↑↑↓↓←→←→BA）触发 2 秒全屏星火；
- 尊重 `prefers-reduced-motion`：关闭打字机、粒子与过渡，只保留文字反馈；
- 移动端默认展示输出与快捷命令，输入框折叠在「输入命令」按钮后，不强制唤起键盘。

## 无障碍与 SEO

- 语义化结构、跳转到主内容的 skip link、导航键盘可操作、输入框有 label、焦点样式可见；
- `lang="zh-CN"`，title `Jrxh — 独立开发者 | jrxh.top`，canonical `https://jrxh.top`；
- 文章页有独立的 title / description / canonical，并输出 `BlogPosting` 结构化数据；
- OG / Twitter 卡片指向 `/og.png`（`astro.config.mjs` 的 `site` 决定绝对地址，部署前确认域名）。

> OG 图使用 1200×630 的 `public/og.png`。修改 `public/og.svg` 后重新导出：

```bash
node -e "import('sharp').then(async ({default: sharp}) => { await sharp('public/og.svg').flatten({ background: '#0a0c10' }).png({ compressionLevel: 9 }).toFile('public/og.png'); })"
```
