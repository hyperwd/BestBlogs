// Dify 工作流配置 (演示环境 - 仅使用 Dify)

// 从环境变量获取配置
const getEnvVar = (name, defaultValue = '') => {
  return process.env[name] || defaultValue;
};

module.exports = {
  // Dify API 基础配置
  api: {
    baseUrl: getEnvVar('DIFY_API_URL', 'https://api.dify.ai/v1'),
    apiKey: getEnvVar('DIFY_API_KEY'),
    timeout: 30000, // 30秒超时
  },

  // 工作流配置 (仅使用 Dify)
  workflows: {
    // 音频转录工作流
    transcription: {
      workflowId: getEnvVar('DIFY_TRANSCRIPTION_WORKFLOW_ID', 'transcription-workflow'),
      apiKey: getEnvVar('DIFY_API_KEY'),
      inputs: {
        audio_file: '', // 音频文件路径
        language: 'auto', // 自动检测语言
        output_format: 'json', // 输出格式
        include_timestamps: true, // 包含时间戳
      },
      timeout: 120000, // 2分钟超时，转录可能较慢
    },

    // 文本翻译工作流 (使用现有的播客分析结果翻译工作流)
    translation: {
      workflowId: getEnvVar('DIFY_TRANSLATION_WORKFLOW_ID', '播客分析结果翻译'),
      apiKey: getEnvVar('DIFY_API_KEY'),
      inputs: {
        content: '', // 待分析内容
        language: 'auto', // 源语言自动检测
        target_language: 'zh-CN', // 目标语言中文
        translation_style: 'professional', // 专业翻译风格
      },
      timeout: 60000, // 1分钟超时
    },

    // 内容分析工作流 (使用现有的播客分析流程工作流)
    analysis: {
      workflowId: getEnvVar('DIFY_ANALYSIS_WORKFLOW_ID', '播客分析流程'),
      apiKey: getEnvVar('DIFY_API_KEY'),
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

    // 文本转语音工作流 (需要您创建)
    tts: {
      workflowId: getEnvVar('DIFY_TTS_WORKFLOW_ID', 'tts-workflow'),
      apiKey: getEnvVar('DIFY_API_KEY'),
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
};

// 验证必需的配置
const requiredEnvVars = [
  'DIFY_API_URL',
  'DIFY_API_KEY'
];

const validateConfig = () => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('警告: 缺少以下必需的环境变量:');
    missingVars.forEach(varName => {
      console.warn(`- ${varName}`);
    });
    console.warn('请检查 .env.local 文件配置');
    return false;
  }

  console.log('✅ Dify 配置验证通过');
  return true;
};

// 应用启动时验证配置
if (typeof window === 'undefined') {
  validateConfig();
}