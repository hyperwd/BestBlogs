'use client'

import { MediaPlayer } from '@/components/MediaPlayer'
import { NewsFeed } from '@/components/NewsFeed'
import { SourceSelector } from '@/components/SourceSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Radio, Tv, Podcast, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const [selectedSource, setSelectedSource] = useState(null)
  const [breakingNews, setBreakingNews] = useState([])
  const [stats, setStats] = useState({
    totalSources: 0,
    activeStreams: 0,
    todayNews: 0,
    breakingNewsCount: 0,
  })

  // WebSocket 连接用于实时数据更新
  const { lastMessage, sendMessage } = useWebSocket('/api/ws')

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data)

      if (data.type === 'breaking_news') {
        setBreakingNews(prev => [data.news, ...prev.slice(0, 4)])
        setStats(prev => ({ ...prev, breakingNewsCount: prev.breakingNewsCount + 1 }))
      }

      if (data.type === 'stats_update') {
        setStats(data.stats)
      }
    }
  }, [lastMessage])

  useEffect(() => {
    // 获取初始统计数据
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 头部导航 */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Radio className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {process.env.NEXT_PUBLIC_APP_NAME}
                </h1>
                <p className="text-sm text-gray-500">
                  智能播客电台演示平台
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {stats.activeSources} 活跃源
                </Badge>
                <Badge variant="outline">
                  {stats.todayNews} 今日新闻
                </Badge>
                {breakingNews.length > 0 && (
                  <Badge variant="destructive" className="news-pulse">
                    {breakingNews.length} 突发新闻
                  </Badge>
                )}
              </div>

              <Button variant="outline" asChild>
                <Link href="/admin">管理面板</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 突发新闻提示 */}
      {breakingNews.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="container mx-auto">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-semibold text-red-800">突发新闻:</span>
              <div className="ml-4 flex-1 overflow-hidden">
                <div className="flex space-x-6 animate-scroll">
                  {breakingNews.map((news, index) => (
                    <span key={index} className="text-red-700 whitespace-nowrap">
                      {news.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：媒体播放器 */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Radio className="h-5 w-5" />
                  <span>主播放器</span>
                  {selectedSource && (
                    <Badge variant="outline" className="ml-auto">
                      {selectedSource.type === 'radio' && <Radio className="h-3 w-3 mr-1" />}
                      {selectedSource.type === 'tv' && <Tv className="h-3 w-3 mr-1" />}
                      {selectedSource.type === 'podcast' && <Podcast className="h-3 w-3 mr-1" />}
                      {selectedSource.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MediaPlayer
                  selectedSource={selectedSource}
                  onSourceChange={setSelectedSource}
                />
              </CardContent>
            </Card>
          </div>

          {/* 右侧：源选择器 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>媒体源选择</CardTitle>
              </CardHeader>
              <CardContent>
                <SourceSelector
                  selectedSource={selectedSource}
                  onSourceSelect={setSelectedSource}
                />
              </CardContent>
            </Card>

            {/* 实时统计 */}
            <Card>
              <CardHeader>
                <CardTitle>实时统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalSources}</div>
                    <div className="text-sm text-blue-600">总媒体源</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{stats.activeStreams}</div>
                    <div className="text-sm text-green-600">直播中</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">{stats.processedHours}</div>
                    <div className="text-sm text-purple-600">处理时长</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-600">{stats.accuracyRate}%</div>
                    <div className="text-sm text-orange-600">识别准确率</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部：新闻推送 */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>实时新闻推送</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="latest" className="w-full">
                <TabsList>
                  <TabsTrigger value="latest">最新推送</TabsTrigger>
                  <TabsTrigger value="breaking">突发新闻</TabsTrigger>
                  <TabsTrigger value="analysis">AI 分析</TabsTrigger>
                </TabsList>

                <TabsContent value="latest" className="mt-4">
                  <NewsFeed type="latest" />
                </TabsContent>

                <TabsContent value="breaking" className="mt-4">
                  <NewsFeed type="breaking" news={breakingNews} />
                </TabsContent>

                <TabsContent value="analysis" className="mt-4">
                  <NewsFeed type="analysis" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}