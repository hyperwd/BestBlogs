import { NextRequest, NextResponse } from 'next/server'
import { translateText } from '@/lib/dify/client'
import fs from 'fs/promises'
import path from 'path'

// 存储翻译结果的目录
const TRANSLATIONS_DIR = path.join(process.cwd(), 'data', 'translations')

export async function POST(request: NextRequest) {
  try {
    // 确保 translations 目录存在
    await fs.mkdir(TRANSLATIONS_DIR, { recursive: true })

    // 解析请求数据
    const body = await request.json()
    const { text, sourceLanguage = 'auto', targetLanguage = 'zh-CN', style = 'professional' } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      )
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      )
    }

    console.log(`Starting translation from ${sourceLanguage} to ${targetLanguage}`)

    // 调用 Dify 进行翻译
    const translationResult = await translateText({
      text: text,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      style: style,
    })

    if (!translationResult.success) {
      console.error('Translation failed:', translationResult.error)
      return NextResponse.json(
        { error: 'Translation failed', details: translationResult.error },
        { status: 500 }
      )
    }

    // 处理翻译结果
    const result = translationResult.data
    let translatedText = ''

    // 尝试提取翻译文本
    try {
      if (typeof result.data === 'string') {
        // 如果返回的是字符串
        translatedText = result.data
      } else if (result.data && typeof result.data === 'object') {
        // 如果返回的是对象，尝试从不同字段提取
        translatedText = result.data.translation || result.data.translatedText || result.data.answer || JSON.stringify(result.data)
      } else if (result.answer) {
        // 如果数据在 answer 字段中
        translatedText = result.answer
      }
    } catch (parseError) {
      console.error('Failed to parse translation result:', parseError)
      translatedText = JSON.stringify(result)
    }

    // 生成翻译文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `translation_${timestamp}.json`
    const filepath = path.join(TRANSLATIONS_DIR, filename)

    // 保存翻译结果到文件
    const translationFile = {
      originalText: text,
      translatedText: translatedText,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      style: style,
      timestamp: new Date().toISOString(),
      filename: filename,
    }

    await fs.writeFile(filepath, JSON.stringify(translationFile, null, 2))

    console.log(`Translation completed and saved to ${filename}`)

    // 返回翻译结果
    return NextResponse.json({
      success: true,
      translation: translationFile,
      message: 'Translation completed successfully'
    })

  } catch (error: any) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      {
        error: 'Translation failed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// 获取翻译记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceLanguage = searchParams.get('sourceLanguage')
    const targetLanguage = searchParams.get('targetLanguage')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 确保 translations 目录存在
    try {
      await fs.access(TRANSLATIONS_DIR)
    } catch {
      // 目录不存在，返回空结果
      return NextResponse.json({ translations: [] })
    }

    // 读取翻译文件列表
    const files = await fs.readdir(TRANSLATIONS_DIR)

    // 过滤 JSON 文件
    const jsonFiles = files.filter(file => file.endsWith('.json'))

    // 读取翻译文件内容
    const translations = []
    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(TRANSLATIONS_DIR, file), 'utf-8')
        const translation = JSON.parse(content)

        // 应用过滤器
        let include = true
        if (sourceLanguage && translation.sourceLanguage !== sourceLanguage) {
          include = false
        }
        if (targetLanguage && translation.targetLanguage !== targetLanguage) {
          include = false
        }

        if (include) {
          translations.push(translation)
        }
      } catch (error) {
        console.error(`Failed to read translation file ${file}:`, error)
      }
    }

    // 按时间戳排序（最新的在前）
    translations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // 限制结果数量
    const limitedTranslations = translations.slice(0, limit)

    return NextResponse.json({
      success: true,
      translations: limitedTranslations,
      total: translations.length
    })

  } catch (error: any) {
    console.error('Get translations API error:', error)
    return NextResponse.json(
      { error: 'Failed to get translations', details: error.message },
      { status: 500 }
    )
  }
}