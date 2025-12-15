import axios from 'axios'
import difyConfig from '@/config/dify'

export interface DifyResponse {
  success: boolean
  data?: any
  error?: string
}

export interface TranscriptionRequest {
  audioFile: Buffer | File
  language?: string
  outputFormat?: 'json' | 'text' | 'srt'
  includeTimestamps?: boolean
}

export interface TranslationRequest {
  text: string
  sourceLanguage?: string
  targetLanguage: string
  style?: 'professional' | 'casual' | 'formal'
}

export interface AnalysisRequest {
  content: string
  analysisType?: 'comprehensive' | 'sentiment' | 'keywords' | 'summary'
  extractKeywords?: boolean
  sentimentAnalysis?: boolean
  importanceScoring?: boolean
  breakingNewsDetection?: boolean
}

export interface TTSRequest {
  text: string
  voice?: string
  speed?: number
  pitch?: number
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry'
}

class DifyClient {
  private baseUrl: string
  private apiKey: string
  private timeout: number

  constructor() {
    this.baseUrl = difyConfig.api.baseUrl
    this.apiKey = difyConfig.api.apiKey
    this.timeout = difyConfig.api.timeout
  }

  private async makeRequest(
    workflowId: string,
    inputs: any,
    apiKey?: string
  ): Promise<DifyResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/workflows/run`,
        {
          inputs,
          response_mode: 'blocking',
          user: 'podcast-demo',
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey || this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        }
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      console.error('Dify API Error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
      }
    }
  }

  // 音频转录
  async transcribeAudio(request: TranscriptionRequest): Promise<DifyResponse> {
    const workflow = difyConfig.workflows.transcription

    // 准备音频文件数据
    let audioData: string
    if (request.audioFile instanceof Buffer) {
      // 将 Buffer 转换为 base64
      audioData = request.audioFile.toString('base64')
    } else if (request.audioFile instanceof File) {
      // 将 File 转换为 base64
      audioData = await this.fileToBase64(request.audioFile)
    } else {
      return {
        success: false,
        error: 'Invalid audio file format',
      }
    }

    const inputs = {
      ...workflow.inputs,
      audio_file: audioData,
      language: request.language || 'auto',
      output_format: request.outputFormat || 'json',
      include_timestamps: request.includeTimestamps !== false,
    }

    return this.makeRequest(workflow.workflowId, inputs, workflow.apiKey)
  }

  // 文本翻译
  async translateText(request: TranslationRequest): Promise<DifyResponse> {
    const workflow = difyConfig.workflows.translation

    const inputs = {
      ...workflow.inputs,
      content: request.text,
      language: request.sourceLanguage || 'auto',
      target_language: request.targetLanguage,
      translation_style: request.style || 'professional',
    }

    return this.makeRequest(workflow.workflowId, inputs, workflow.apiKey)
  }

  // 内容分析
  async analyzeContent(request: AnalysisRequest): Promise<DifyResponse> {
    const workflow = difyConfig.workflows.analysis

    const inputs = {
      ...workflow.inputs,
      content: request.content,
      analysis_type: request.analysisType || 'comprehensive',
      extract_keywords: request.extractKeywords !== false,
      sentiment_analysis: request.sentimentAnalysis !== false,
      importance_scoring: request.importanceScoring !== false,
      breaking_news_detection: request.breakingNewsDetection !== false,
    }

    return this.makeRequest(workflow.workflowId, inputs, workflow.apiKey)
  }

  // 文本转语音
  async textToSpeech(request: TTSRequest): Promise<DifyResponse> {
    const workflow = difyConfig.workflows.tts

    const inputs = {
      ...workflow.inputs,
      text: request.text,
      voice: request.voice || 'zh-CN-female-1',
      speed: request.speed || 1.0,
      pitch: request.pitch || 1.0,
      emotion: request.emotion || 'neutral',
    }

    return this.makeRequest(workflow.workflowId, inputs, workflow.apiKey)
  }

  // 批量处理（用于提高效率）
  async batchProcess<T>(
    items: T[],
    processor: (item: T) => Promise<DifyResponse>,
    concurrency: number = 3
  ): Promise<DifyResponse[]> {
    const results: DifyResponse[] = []

    // 分批处理
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency)
      const batchPromises = batch.map(processor)
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  }

  // 文件转 base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // 移除 data URL 前缀，只保留 base64 数据
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 健康检查
  async healthCheck(): Promise<DifyResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Health check failed',
      }
    }
  }

  // 获取使用统计
  async getUsageStats(): Promise<DifyResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/usage`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get usage stats',
      }
    }
  }
}

// 创建全局客户端实例
export const difyClient = new DifyClient()

// 导出便捷方法
export const transcribeAudio = (request: TranscriptionRequest) => difyClient.transcribeAudio(request)
export const translateText = (request: TranslationRequest) => difyClient.translateText(request)
export const analyzeContent = (request: AnalysisRequest) => difyClient.analyzeContent(request)
export const textToSpeech = (request: TTSRequest) => difyClient.textToSpeech(request)

export default difyClient