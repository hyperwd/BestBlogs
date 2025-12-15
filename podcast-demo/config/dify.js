// Dify 工作流配置
module.exports = {
  // Dify API 基础配置
  api: {
    baseUrl: process.env.DIFY_API_URL || 'https://api.dify.ai/v1',
    apiKey: process.env.DIFY_API_KEY || '',
    timeout: 30000, // 30秒超时
  },

  // 工作流配置
  workflows: {
    // 音频转录工作流
    transcription: {
      workflowId: process.env.DIFY_TRANSCRIPTION_WORKFLOW_ID || 'transcription-workflow',
      apiKey: process.env.DIFY_TRANSCRIPTION_API_KEY || process.env.DIFY_API_KEY,
      inputs: {
        audio_file: '', // 音频文件路径
        language: 'auto', // 自动检测语言
        output_format: 'json', // 输出格式
        include_timestamps: true, // 包含时间戳
      },
      timeout: 120000, // 2分钟超时，转录可能较慢
    },

    // 文本翻译工作流
    translation: {
      workflowId: process.env.DIFY_TRANSLATION_WORKFLOW_ID || 'translation-workflow',
      apiKey: process.env.DIFY_TRANSLATION_API_KEY || process.env.DIFY_API_KEY,
      inputs: {
        text: '', // 待翻译文本
        source_language: 'auto', // 源语言自动检测
        target_language: 'zh-CN', // 目标语言中文
        translation_style: 'professional', // 专业翻译风格
      },
      timeout: 60000, // 1分钟超时
    },

    // 内容分析工作流
    analysis: {
      workflowId: process.env.DIFY_ANALYSIS_WORKFLOW_ID || 'analysis-workflow',
      apiKey: process.env.DIFY_ANALYSIS_API_KEY || process.env.DIFY_API_KEY,
      inputs: {
        content: '', // 待分析内容
        analysis_type: 'comprehensive', // 全面分析
        extract_keywords: true, // 提取关键词
        sentiment_analysis: true, // 情感分析
        importance_scoring: true, // 重要性评分
        breaking_news_detection: true, // 突发新闻检测
      },
      timeout: 90000, // 1.5分钟超时
    },

    // 新闻摘要工作流
    summarization: {
      workflowId: process.env.DIFY_SUMMARIZATION_WORKFLOW_ID || 'summarization-workflow',
      apiKey: process.env.DIFY_SUMMARIZATION_API_KEY || process.env.DIFY_API_KEY,
      inputs: {
        articles: [], // 文章列表
        summary_length: 'medium', // 摘要长度: short/medium/long
        focus_points: [], // 关注点
        language: 'zh-CN', // 输出语言
      },
      timeout: 60000, // 1分钟超时
    },

    // 实时语音合成工作流
    tts: {
      workflowId: process.env.DIFY_TTS_WORKFLOW_ID || 'tts-workflow',
      apiKey: process.env.DIFY_TTS_API_KEY || process.env.DIFY_API_KEY,
      inputs: {
        text: '', // 待合成文本
        voice: 'zh-CN-female-1', // 声音选择
        speed: 1.0, // 语速
        pitch: 1.0, // 音调
        emotion: 'neutral', // 情感: neutral/happy/sad/angry
      },
      timeout: 30000, // 30秒超时
    },
  },

  // 错误处理配置
  errorHandling: {
    maxRetries: 3,
    retryDelay: 2000, // 2秒重试间隔
    exponentialBackoff: true,
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 3600, // 1小时缓存
    maxSize: 1000, // 最大缓存条目数
  },

  // 并发配置
  concurrency: {
    maxConcurrentRequests: 5, // 最大并发请求数
    queueSize: 100, // 队列大小
  },

  // 监控配置
  monitoring: {
    enabled: true,
    logLevel: 'info', // debug/info/warn/error
    metricsEnabled: true,
  }
}

// 根据环境变量覆盖配置
if (process.env.NODE_ENV === 'development') {
  module.exports.api.timeout = 60000 // 开发环境更长超时
  module.exports.monitoring.logLevel = 'debug'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.concurrency.maxConcurrentRequests = 10
  module.exports.cache.ttl = 1800 // 生产环境30分钟缓存
}