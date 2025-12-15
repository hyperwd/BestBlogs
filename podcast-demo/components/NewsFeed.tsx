'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  TrendingUp,
  Clock,
  ExternalLink,
  Play,
  Volume2,
  Languages,
  Star,
  Filter,
  RefreshCw
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface NewsItem {
  id: string
  title: string
  content: string
  source: {
    id: string
    name: string
    type: 'radio' | 'tv' | 'podcast'
    country: string
    language: string
  }
  publishedAt: string
  importanceScore: number
  category: string
  tags: string[]
  transcript?: string
  translation?: string
  audioUrl?: string
  isBreaking: boolean
  aiSummary: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

interface NewsFeedProps {
  type: 'latest' | 'breaking' | 'analysis'
  news?: NewsItem[]
}

export function NewsFeed({ type, news = [] }: NewsFeedProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(news)
  const [loading, setLoading] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'time' | 'importance'>('time')

  useEffect(() => {
    fetchNews()
  }, [type])

  useEffect(() => {
    filterNews()
  }, [newsItems, filterCategory, filterSource, sortBy])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/news?type=${type}`)
      const data = await response.json()

      if (type === 'breaking' && news.length > 0) {
        // 对于突发新闻，使用传入的 news 数据
        setNewsItems(news)
      } else {
        setNewsItems(data.news || [])
      }
    } catch (error) {
      console.error('Failed to fetch news:', error)
      // 使用模拟数据作为演示
      setNewsItems(getMockNews())
    } finally {
      setLoading(false)
    }
  }

  const filterNews = () => {
    let filtered = [...newsItems]

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory)
    }

    if (filterSource !== 'all') {
      filtered = filtered.filter(item => item.source.name === filterSource)
    }

    // 排序
    filtered.sort((a, b) => {
      if (sortBy === 'importance') {
        return b.importanceScore - a.importanceScore
      } else {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      }
    })

    setNewsItems(filtered)
  }

  const getImportanceColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800 border-red-200'
    if (score >= 6) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '🟢'
      case 'negative':
        return '🔴'
      default:
        return '🟡'
    }
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'radio':
        return '📻'
      case 'tv':
        return '📺'
      case 'podcast':
        return '🎙️'
      default:
        return '📻'
    }
  }

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'CN': '🇨🇳',
      'US': '🇺🇸',
      'UK': '🇬🇧',
      'FR': '🇫🇷',
      'JP': '🇯🇵',
      'KR': '🇰🇷',
    }
    return flags[country] || '🌍'
  }

  const getMockNews = (): NewsItem[] => [
    {
      id: '1',
      title: 'OpenAI 发布 GPT-5 模型，性能提升显著',
      content: 'OpenAI 今日正式发布了备受期待的 GPT-5 大语言模型，在多项基准测试中显示出显著性能提升...',
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
      content: '受美联储加息预期影响，全球股市出现明显波动，科技股跌幅较大...',
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
      content: '某知名电动车厂商发布新款车型，官方续航里程突破1000公里大关...',
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

  const sources = Array.from(new Set(newsItems.map(item => item.source.name)))
  const categories = Array.from(new Set(newsItems.map(item => item.category)))

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">筛选:</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">全部分类</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">全部来源</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'time' | 'importance')}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="time">按时间排序</option>
            <option value="importance">按重要性排序</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchNews}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 新闻列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无{type === 'breaking' ? '突发' : '最新'}新闻</p>
          </div>
        ) : (
          newsItems.map(item => (
            <Card key={item.id} className={`source-card ${item.isBreaking ? 'border-red-200 bg-red-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {item.isBreaking && (
                      <div className="bg-red-500 text-white p-1 rounded-full">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getImportanceColor(item.importanceScore)}>
                          重要性: {item.importanceScore}/10
                        </Badge>
                        <Badge variant="outline">
                          {getSourceIcon(item.source.type)} {item.source.name}
                        </Badge>
                        <Badge variant="secondary">
                          {getCountryFlag(item.source.country)} {item.source.language.toUpperCase()}
                        </Badge>
                      </div>

                      <CardTitle className="text-lg mb-2">{item.title}</CardTitle>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span>{formatDate(item.publishedAt)}</span>
                        <span>{getSentimentIcon(item.sentiment)} {item.sentiment === 'positive' ? '正面' : item.sentiment === 'negative' ? '负面' : '中性'}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    {item.source.language !== 'zh' && (
                      <Button variant="ghost" size="sm">
                        <Languages className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 mb-3 line-clamp-3">{item.content}</p>

                {item.aiSummary && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Star className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">AI 摘要</span>
                    </div>
                    <p className="text-sm text-blue-700">{item.aiSummary}</p>
                  </div>
                )}

                {item.translation && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Languages className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">中文翻译</span>
                    </div>
                    <p className="text-sm text-green-700">{item.translation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}