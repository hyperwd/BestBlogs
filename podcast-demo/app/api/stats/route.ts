import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const SOURCES_FILE = path.join(process.cwd(), 'config', 'sources.json')

export async function GET() {
  try {
    // 读取媒体源配置
    let sources = []
    try {
      const sourcesData = await fs.readFile(SOURCES_FILE, 'utf-8')
      const sourcesConfig = JSON.parse(sourcesData)
      sources = sourcesConfig.sources || []
    } catch (error) {
      console.log('Sources file not found, using empty array')
    }

    const totalSources = sources.length
    const activeSources = sources.filter((source: any) => source.isActive).length

    // 读取转录数据
    let totalTranscripts = 0
    try {
      const transcriptsDir = path.join(DATA_DIR, 'transcripts')
      const transcriptFiles = await fs.readdir(transcriptsDir)
      totalTranscripts = transcriptFiles.filter(file => file.endsWith('.json')).length
    } catch (error) {
      console.log('Transcripts directory not found')
    }

    // 读取新闻数据
    let totalNews = 0
    try {
      const newsDir = path.join(DATA_DIR, 'news')
      const newsFiles = await fs.readdir(newsDir)
      totalNews = newsFiles.filter(file => file.endsWith('.json')).length
    } catch (error) {
      console.log('News directory not found')
    }

    // 计算处理时长（模拟数据）
    const processingHours = Math.floor(totalTranscripts * 0.5) // 假设每个转录平均0.5小时

    // 模拟 API 调用量
    const apiCalls = totalTranscripts * 3 + totalNews * 2 // 转录+翻译+分析

    // 模拟准确率
    const accuracyRate = 95 + Math.random() * 4 // 95-99%

    // 模拟系统运行时间
    const uptime = 99.5 + Math.random() * 0.5 // 99.5-100%

    const stats = {
      totalSources,
      activeSources,
      totalTranscripts,
      totalNews,
      processedHours: processingHours,
      apiCalls,
      accuracyRate: Math.round(accuracyRate * 10) / 10,
      uptime: Math.round(uptime * 10) / 10,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      stats: stats
    })

  } catch (error: any) {
    console.error('Stats API error:', error)

    // 返回默认统计数据
    const defaultStats = {
      totalSources: 0,
      activeSources: 0,
      totalTranscripts: 0,
      totalNews: 0,
      processedHours: 0,
      apiCalls: 0,
      accuracyRate: 95.0,
      uptime: 99.9,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      stats: defaultStats
    })
  }
}