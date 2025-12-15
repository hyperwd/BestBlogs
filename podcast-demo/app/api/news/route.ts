import { NextRequest, NextResponse } from 'next/server'
import { analyzeContent, summarizeNews } from '@/lib/dify/client'
import fs from 'fs/promises'
import path from 'path'

// 存储新闻数据的目录
const NEWS_DIR = path.join(process.cwd(), 'data', 'news')

// 模拟新闻数据（用于演示）
const mockNewsData = [
  {
    id: '1',
    title: 'OpenAI 发布 GPT-5 模型，性能提升显著',
    content: 'OpenAI 今日正式发布了备受期待的 GPT-5 大语言模型，在多项基准测试中显示出显著性能提升。新模型在理解复杂指令、代码生成和多模态处理方面都有重大突破，预计将推动 AI 应用的新一轮发展。',
    source: {
      id: 'bbc-world',
      name: 'BBC World Service',
      type: 'radio',
      country: 'UK',
      language: 'en'
    },
    publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    importanceScore: 9,
    category: '人工智能',
    tags: ['AI', 'OpenAI', 'GPT-5', '技术突破'],
    isBreaking: true,
    aiSummary: 'OpenAI发布GPT-5，在多项指标上超越前代模型，标志着AI技术又一重大突破。',
    sentiment: 'positive'
  },
  {
    id: '2',
    title: '全球股市波动，科技股领跌',
    content: '受美联储加息预期影响，全球股市出现明显波动，科技股跌幅较大。投资者对高利率环境的担忧导致科技板块遭遇抛售，纳斯达克指数下跌超过3%。分析师建议投资者保持谨慎，关注后续政策走向。',
    source: {
      id: 'cctv-news',
      name: '央视新闻',
      type: 'tv',
      country: 'CN',
      language: 'zh'
    },
    publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    importanceScore: 8,
    category: '财经新闻',
    tags: ['股市', '美联储', '科技股', '经济'],
    isBreaking: true,
    aiSummary: '全球股市受美联储政策预期影响出现波动，投资者需关注后续政策走向。',
    sentiment: 'negative'
  },
  {
    id: '3',
    title: '新款电动汽车续航突破1000公里',
    content: '某知名电动车厂商发布新款车型，官方续航里程突破1000公里大关。这一突破得益于新的电池技术和轻量化设计，预计将大幅缓解用户的里程焦虑问题。新车预计明年上市，售价在30-50万区间。',
    source: {
      id: 'tech-podcast-daily',
      name: 'Tech Podcast Daily',
      type: 'podcast',
      country: 'US',
      language: 'en'
    },
    publishedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    importanceScore: 6,
    category: '科技',
    tags: ['电动车', '续航', '新能源', '汽车'],
    isBreaking: false,
    aiSummary: '电动汽车技术取得新突破，1000公里续航有望缓解用户里程焦虑。',
    sentiment: 'positive'
  }
]

// 生成新闻 ID
function generateNewsId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'latest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const sourceId = searchParams.get('sourceId')
    const category = searchParams.get('category')

    // 确保 news 目录存在
    await fs.mkdir(NEWS_DIR, { recursive: true })

    // 尝试读取存储的新闻数据
    let storedNews: any[] = []
    try {
      const files = await fs.readdir(NEWS_DIR)
      const jsonFiles = files.filter(file => file.endsWith('.json'))

      for (const file of jsonFiles) {
        try {
          const content = await fs.readFile(path.join(NEWS_DIR, file), 'utf-8')
          const news = JSON.parse(content)
          storedNews.push(news)
        } catch (error) {
          console.error(`Failed to read news file ${file}:`, error)
        }
      }
    } catch (error) {
      console.log('No stored news found, using mock data')
    }

    // 如果没有存储的新闻数据，使用模拟数据
    if (storedNews.length === 0) {
      storedNews = mockNewsData
    }

    // 应用过滤器
    let filteredNews = storedNews

    if (sourceId) {
      filteredNews = filteredNews.filter(news => news.source.id === sourceId)
    }

    if (category) {
      filteredNews = filteredNews.filter(news => news.category === category)
    }

    if (type === 'breaking') {
      filteredNews = filteredNews.filter(news => news.isBreaking)
    }

    // 按发布时间排序（最新的在前）
    filteredNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // 限制结果数量
    const limitedNews = filteredNews.slice(0, limit)

    return NextResponse.json({
      success: true,
      news: limitedNews,
      total: filteredNews.length,
      type: type
    })

  } catch (error: any) {
    console.error('Get news API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get news',
        details: error.message,
        news: mockNewsData // 返回模拟数据作为备用
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 确保 news 目录存在
    await fs.mkdir(NEWS_DIR, { recursive: true })

    const body = await request.json()
    const {
      title,
      content,
      source,
      category = '未分类',
      tags = [],
      isBreaking = false,
      enableAnalysis = true
    } = body

    if (!title || !content || !source) {
      return NextResponse.json(
        { error: 'Title, content, and source are required' },
        { status: 400 }
      )
    }

    const newsId = generateNewsId()
    const now = new Date().toISOString()

    let newsItem = {
      id: newsId,
      title,
      content,
      source,
      publishedAt: now,
      importanceScore: 5, // 默认分数
      category,
      tags,
      isBreaking,
      aiSummary: '',
      sentiment: 'neutral' as const
    }

    // 如果启用 AI 分析
    if (enableAnalysis) {
      try {
        console.log(`Starting AI analysis for news: ${title}`)

        // 调用 Dify 进行内容分析
        const analysisResult = await analyzeContent({
          content: `${title}\n\n${content}`,
          analysisType: 'comprehensive',
          extractKeywords: true,
          sentimentAnalysis: true,
          importanceScoring: true,
          breakingNewsDetection: true,
        })

        if (analysisResult.success && analysisResult.data) {
          const result = analysisResult.data

          // 更新新闻项的 AI 分析结果
          if (result.data) {
            const analysisData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data

            newsItem.aiSummary = analysisData.summary || analysisData.aiSummary || ''
            newsItem.importanceScore = analysisData.importanceScore || analysisData.score || 5
            newsItem.sentiment = analysisData.sentiment || 'neutral'

            // 提取关键词并添加到标签
            if (analysisData.keywords && Array.isArray(analysisData.keywords)) {
              newsItem.tags = [...new Set([...tags, ...analysisData.keywords])]
            }

            // 检测是否为突发新闻
            if (analysisData.isBreaking !== undefined) {
              newsItem.isBreaking = analysisData.isBreaking
            }
          }
        }

        console.log(`AI analysis completed for news: ${newsId}`)
      } catch (error) {
        console.error('AI analysis failed:', error)
        // 如果 AI 分析失败，继续保存新闻但不包含分析结果
      }
    }

    // 保存新闻到文件
    const filename = `news_${newsId}.json`
    const filepath = path.join(NEWS_DIR, filename)

    await fs.writeFile(filepath, JSON.stringify(newsItem, null, 2))

    console.log(`News item saved: ${filename}`)

    return NextResponse.json({
      success: true,
      news: newsItem,
      message: 'News item created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create news API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create news item',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// 批量分析新闻
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsIds, analysisType = 'comprehensive' } = body

    if (!Array.isArray(newsIds) || newsIds.length === 0) {
      return NextResponse.json(
        { error: 'News IDs array is required' },
        { status: 400 }
      )
    }

    // 确保 news 目录存在
    await fs.mkdir(NEWS_DIR, { recursive: true })

    const results = []

    for (const newsId of newsIds) {
      try {
        // 读取新闻文件
        const filepath = path.join(NEWS_DIR, `news_${newsId}.json`)
        const content = await fs.readFile(filepath, 'utf-8')
        const newsItem = JSON.parse(content)

        // 进行 AI 分析
        const analysisResult = await analyzeContent({
          content: `${newsItem.title}\n\n${newsItem.content}`,
          analysisType: analysisType,
          extractKeywords: true,
          sentimentAnalysis: true,
          importanceScoring: true,
        })

        if (analysisResult.success && analysisResult.data) {
          const result = analysisResult.data

          if (result.data) {
            const analysisData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data

            newsItem.aiSummary = analysisData.summary || analysisData.aiSummary || newsItem.aiSummary
            newsItem.importanceScore = analysisData.importanceScore || analysisData.score || newsItem.importanceScore
            newsItem.sentiment = analysisData.sentiment || newsItem.sentiment

            // 更新标签
            if (analysisData.keywords && Array.isArray(analysisData.keywords)) {
              newsItem.tags = [...new Set([...newsItem.tags, ...analysisData.keywords])]
            }
          }

          // 保存更新后的新闻
          await fs.writeFile(filepath, JSON.stringify(newsItem, null, 2))
        }

        results.push({
          newsId,
          success: true,
          analysis: analysisResult.data
        })

      } catch (error) {
        console.error(`Failed to analyze news ${newsId}:`, error)
        results.push({
          newsId,
          success: false,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      results: results,
      message: 'Batch analysis completed'
    })

  } catch (error: any) {
    console.error('Batch analysis API error:', error)
    return NextResponse.json(
      { error: 'Batch analysis failed', details: error.message },
      { status: 500 }
    )
  }
}