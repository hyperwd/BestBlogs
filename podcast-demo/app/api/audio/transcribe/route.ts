import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/dify/client'
import fs from 'fs/promises'
import path from 'path'

// 存储转录结果的目录
const TRANSCRIPTS_DIR = path.join(process.cwd(), 'data', 'transcripts')

export async function POST(request: NextRequest) {
  try {
    // 确保 transcripts 目录存在
    await fs.mkdir(TRANSCRIPTS_DIR, { recursive: true })

    // 解析表单数据
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const sourceId = formData.get('sourceId') as string
    const language = (formData.get('language') as string) || 'auto'
    const includeTimestamps = formData.get('includeTimestamps') !== 'false'

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/mp3']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Unsupported audio format' },
        { status: 400 }
      )
    }

    // 验证文件大小 (最大 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large (max 100MB)' },
        { status: 400 }
      )
    }

    console.log(`Starting transcription for source ${sourceId}, file size: ${audioFile.size} bytes`)

    // 调用 Dify 进行转录
    const transcriptionResult = await transcribeAudio({
      audioFile: audioFile,
      language: language,
      outputFormat: 'json',
      includeTimestamps: includeTimestamps,
    })

    if (!transcriptionResult.success) {
      console.error('Transcription failed:', transcriptionResult.error)
      return NextResponse.json(
        { error: 'Transcription failed', details: transcriptionResult.error },
        { status: 500 }
      )
    }

    // 处理转录结果
    const result = transcriptionResult.data
    let transcriptData = {
      text: '',
      segments: [],
      language: 'unknown',
      duration: 0,
      confidence: 0,
    }

    // 尝试解析 Dify 返回的数据
    try {
      if (typeof result.data === 'string') {
        // 如果返回的是字符串，尝试解析为 JSON
        const parsedData = JSON.parse(result.data)
        transcriptData = { ...transcriptData, ...parsedData }
      } else if (result.data && typeof result.data === 'object') {
        // 如果返回的是对象
        transcriptData = { ...transcriptData, ...result.data }
      } else if (result.answer) {
        // 如果数据在 answer 字段中
        transcriptData.text = result.answer
      }
    } catch (parseError) {
      console.error('Failed to parse transcription result:', parseError)
      // 如果解析失败，尝试直接使用返回的数据
      transcriptData.text = JSON.stringify(result)
    }

    // 生成转录文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
)
    const filename = `${sourceId}_${timestamp}.json`
    const filepath = path.join(TRANSCRIPTS_DIR, filename)

    // 保存转录结果到文件
    const transcriptFile = {
      sourceId,
      filename,
      timestamp: new Date().toISOString(),
      language,
      ...transcriptData,
    }

    await fs.writeFile(filepath, JSON.stringify(transcriptFile, null, 2))

    console.log(`Transcription completed and saved to ${filename}`)

    // 返回转录结果
    return NextResponse.json({
      success: true,
      transcript: transcriptFile,
      message: 'Transcription completed successfully'
    })

  } catch (error: any) {
    console.error('Transcription API error:', error)
    return NextResponse.json(
      {
        error: 'Transcription failed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// 获取转录记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('sourceId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 确保 transcripts 目录存在
    try {
      await fs.access(TRANSCRIPTS_DIR)
    } catch {
      // 目录不存在，返回空结果
      return NextResponse.json({ transcripts: [] })
    }

    // 读取转录文件列表
    const files = await fs.readdir(TRANSCRIPTS_DIR)

    // 过滤 JSON 文件
    const jsonFiles = files.filter(file => file.endsWith('.json'))

    // 读取转录文件内容
    const transcripts = []
    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(TRANSCRIPTS_DIR, file), 'utf-8')
        const transcript = JSON.parse(content)

        // 如果指定了 sourceId，则过滤
        if (!sourceId || transcript.sourceId === sourceId) {
          transcripts.push(transcript)
        }
      } catch (error) {
        console.error(`Failed to read transcript file ${file}:`, error)
      }
    }

    // 按时间戳排序（最新的在前）
    transcripts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // 限制结果数量
    const limitedTranscripts = transcripts.slice(0, limit)

    return NextResponse.json({
      success: true,
      transcripts: limitedTranscripts,
      total: transcripts.length
    })

  } catch (error: any) {
    console.error('Get transcripts API error:', error)
    return NextResponse.json(
      { error: 'Failed to get transcripts', details: error.message },
      { status: 500 }
    )
  }
}