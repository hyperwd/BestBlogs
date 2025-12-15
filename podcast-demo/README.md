# 智能播客电台演示平台

基于 BestBlogs.dev 架构构建的多媒体播客演示平台，集成 AI 转录、实时翻译和智能分析功能。

## 🎯 核心功能

### 1. 多媒体源接收
- 支持电台、电视台、播客音视频源
- RSS 订阅源自动聚合
- 实时流媒体处理

### 2. AI 智能处理
- 大模型音频转录（中文/双语对照）
- 实时外语音频转中文音频
- AI 自动汇集分析，生成实时推送
- 突发、重大新闻及时提醒

### 3. 交互界面
- 主屏播放器（可选择电台/电视台/播客）
- 实时新闻推送列表
- 信源管理（增删改查）
- AI 模型配置管理

### 4. Dify 集成
- 支持自定义 Dify 工作流
- 可配置 AI 模型接口
- 智能内容分析和摘要

## 🛠️ 技术架构

### 前端技术栈
- **框架**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Shadcn/ui
- **状态管理**: Zustand + React Query
- **音频处理**: Howler.js + MediaRecorder API

### 后端技术栈
- **运行时**: Node.js + Express
- **数据库**: SQLite (演示用) + Redis (缓存)
- **文件存储**: 本地文件系统
- **AI 集成**: Dify 工作流 + OpenAI Whisper

### 核心组件
```
podcast-demo/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # 主界面
│   ├── admin/             # 管理界面
│   └── api/               # API 路由
├── components/            # React 组件
├── lib/                   # 工具库
├── config/               # 配置文件
└── data/                 # 数据存储
```

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 环境配置
```bash
cp .env.example .env.local
```

### 3. 配置环境变量
```env
# Dify 配置
DIFY_API_URL=https://your-dify-instance.com/v1
DIFY_API_KEY=your-dify-api-key

# OpenAI 配置
OPENAI_API_KEY=your-openai-api-key

# 音频处理配置
AUDIO_STORAGE_PATH=./data/audio
TRANSCRIPT_STORAGE_PATH=./data/transcripts
```

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 访问应用
- 主界面: http://localhost:3000
- 管理界面: http://localhost:3000/admin

## 📝 配置说明

### RSS 源配置
在 `config/sources.json` 中配置媒体源：

```json
{
  "sources": [
    {
      "id": "cctv-news",
      "name": "央视新闻",
      "type": "tv",
      "rssUrl": "https://example.com/cctv-news.rss",
      "language": "zh",
      "isActive": true
    },
    {
      "id": "bbc-news",
      "name": "BBC News",
      "type": "radio",
      "rssUrl": "https://example.com/bbc-news.rss",
      "language": "en",
      "isActive": true
    }
  ]
}
```

### Dify 工作流配置
在 `config/dify.js` 中配置工作流：

```javascript
module.exports = {
  workflows: {
    transcription: {
      apiKey: process.env.DIFY_TRANSCRIPTION_API_KEY,
      workflowId: "transcription-workflow-id"
    },
    translation: {
      apiKey: process.env.DIFY_TRANSLATION_API_KEY,
      workflowId: "translation-workflow-id"
    },
    analysis: {
      apiKey: process.env.DIFY_ANALYSIS_API_KEY,
      workflowId: "analysis-workflow-id"
    }
  }
};
```

## 🎬 演示功能

### 1. 主屏播放器
- 实时播放选定的媒体源
- 支持音视频切换
- 实时翻译字幕显示

### 2. 实时新闻推送
- AI 自动分析各信源内容
- 生成实时新闻摘要
- 突发新闻自动提醒

### 3. 信源管理
- 添加新的媒体源
- 编辑现有源配置
- 启用/禁用特定源

### 4. AI 配置
- 切换不同 AI 模型
- 调整转录语言设置
- 配置工作流参数

## 🔄 工作流程

### 音频处理流程
```
RSS 源 → 音频下载 → 语音转录 → AI 分析 → 存储 → 推送
```

### 实时翻译流程
```
外语音频 → 语音识别 → 文本翻译 → 语音合成 → 实时广播
```

### 新闻分析流程
```
多源文本 → AI 汇集分析 → 重要性评分 → 突发检测 → 实时推送
```

## 🎯 演示亮点

1. **实时性**: 支持实时音频流处理和翻译
2. **智能性**: AI 自动分析和新闻重要性评估
3. **可配置性**: 灵活的源管理和 AI 模型配置
4. **演示友好**: 界面简洁，功能直观，适合客户演示

## 📁 项目结构

```
podcast-demo/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx          # 主界面
│   │   ├── player/           # 播放器组件
│   │   └── news/             # 新闻推送组件
│   ├── admin/
│   │   ├── page.tsx          # 管理界面
│   │   ├── sources/          # 源管理
│   │   └── config/           # 配置管理
│   └── api/
│       ├── sources/          # 源管理 API
│       ├── audio/            # 音频处理 API
│       └── news/             # 新闻 API
├── components/
│   ├── MediaPlayer/          # 媒体播放器
│   ├── NewsFeed/             # 新闻推送
│   └── SourceManager/        # 源管理器
├── lib/
│   ├── dify/                 # Dify 集成
│   ├── audio/                # 音频处理
│   └── rss/                  # RSS 解析
├── config/
│   ├── sources.json          # 媒体源配置
│   └── dify.js               # Dify 工作流配置
└── data/
    ├── audio/                # 音频文件存储
    ├── transcripts/          # 转录文本存储
    └── news/                 # 新闻数据存储
```

## 🎪 演示场景

1. **多源监控**: 同时监控多个国际媒体源
2. **实时翻译**: 外语新闻实时翻译成中文
3. **智能筛选**: AI 自动筛选重要新闻
4. **突发提醒**: 重大新闻实时推送提醒
5. **灵活配置**: 现场添加新的媒体源进行演示

这个演示平台完美展示了 AI + 播客技术的创新应用，适合向客户展示技术实力和产品概念。