'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Radio,
  Tv,
  Podcast,
  BarChart3,
  Users,
  Activity,
  Globe,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  Languages
} from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalSources: 0,
    activeSources: 0,
    totalTranscripts: 0,
    totalNews: 0,
    apiCalls: 0,
    processingHours: 0,
    accuracyRate: 95,
    uptime: 99.9,
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [systemHealth, setSystemHealth] = useState({
    difyStatus: 'healthy',
    apiStatus: 'healthy',
    storageStatus: 'healthy',
    databaseStatus: 'healthy',
  })

  useEffect(() => {
    fetchStats()
    fetchRecentActivity()
    fetchSystemHealth()

    // 定期刷新数据
    const interval = setInterval(() => {
      fetchStats()
      fetchSystemHealth()
    }, 30000) // 30秒刷新一次

    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // 模拟最近活动数据
      const activities = [
        {
          id: 1,
          type: 'transcription',
          description: '完成央视新闻音频转录',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: 'success'
        },
        {
          id: 2,
          type: 'translation',
          description: 'BBC新闻翻译成中文',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          status: 'success'
        },
        {
          id: 3,
          type: 'analysis',
          description: 'AI分析多条新闻内容',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'success'
        },
        {
          id: 4,
          type: 'error',
          description: '某播客源连接失败',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          status: 'error'
        }
      ]
      setRecentActivity(activities)
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    }
  }

  const fetchSystemHealth = async () => {
    try {
      // 模拟系统健康状态
      setSystemHealth({
        difyStatus: Math.random() > 0.1 ? 'healthy' : 'warning',
        apiStatus: 'healthy',
        storageStatus: 'healthy',
        databaseStatus: 'healthy',
      })
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transcription':
        return <Volume2 className="h-4 w-4" />
      case 'translation':
        return <Languages className="h-4 w-4" />
      case 'analysis':
        return <BarChart3 className="h-4 w-4" />
      case 'play':
        return <Play className="h-4 w-4" />
      case 'pause':
        return <Pause className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`
    return `${Math.floor(minutes / 1440)}天前`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">管理控制台</h1>
                <p className="text-sm text-gray-500">播客演示平台管理系统</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/">返回主页</Link>
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新数据
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">媒体源</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSources}</p>
                  <p className="text-xs text-gray-500">{stats.activeSources} 活跃</p>
                </div>
                <Radio className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">转录内容</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTranscripts}</p>
                  <p className="text-xs text-gray-500">{stats.processingHours} 小时处理</p>
                </div>
                <Volume2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">新闻推送</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalNews}</p>
                  <p className="text-xs text-gray-500">今日新增</p>
                </div>
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API 调用</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.apiCalls}</p>
                  <p className="text-xs text-gray-500">{stats.accuracyRate}% 准确率</p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：系统状态和活动 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 系统健康状态 */}
            <Card>
              <CardHeader>
                <CardTitle>系统健康状态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    {getStatusIcon(systemHealth.difyStatus)}
                    <p className="text-sm font-medium mt-2">Dify API</p>
                    <Badge variant={systemHealth.difyStatus === 'healthy' ? 'default' : 'destructive'} className="mt-1">
                      {systemHealth.difyStatus === 'healthy' ? '正常' : '警告'}
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    {getStatusIcon(systemHealth.apiStatus)}
                    <p className="text-sm font-medium mt-2">API 服务</p>
                    <Badge variant={systemHealth.apiStatus === 'healthy' ? 'default' : 'destructive'} className="mt-1">
                      {systemHealth.apiStatus === 'healthy' ? '正常' : '警告'}
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    {getStatusIcon(systemHealth.storageStatus)}
                    <p className="text-sm font-medium mt-2">存储系统</p>
                    <Badge variant={systemHealth.storageStatus === 'healthy' ? 'default' : 'destructive'} className="mt-1">
                      {systemHealth.storageStatus === 'healthy' ? '正常' : '警告'}
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    {getStatusIcon(systemHealth.databaseStatus)}
                    <p className="text-sm font-medium mt-2">数据库</p>
                    <Badge variant={systemHealth.databaseStatus === 'healthy' ? 'default' : 'destructive'} className="mt-1">
                      {systemHealth.databaseStatus === 'healthy' ? '正常' : '警告'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 最近活动 */}
            <Card>
              <CardHeader>
                <CardTitle>最近活动</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                      </div>
                      {getStatusIcon(activity.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：快速操作 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/admin/sources">
                    <Plus className="h-4 w-4 mr-2" />
                    添加媒体源
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/config">
                    <Settings className="h-4 w-4 mr-2" />
                    系统配置
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/news">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    新闻管理
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新RSS源
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>系统信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">运行时间</span>
                    <span className="font-medium">{stats.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">处理时长</span>
                    <span className="font-medium">{stats.processingHours} 小时</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">识别准确率</span>
                    <span className="font-medium">{stats.accuracyRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API调用量</span>
                    <span className="font-medium">{stats.apiCalls}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>媒体源分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Radio className="h-4 w-4" />
                      <span className="text-sm">电台</span>
                    </div>
                    <Badge variant="outline">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tv className="h-4 w-4" />
                      <span className="text-sm">电视台</span>
                    </div>
                    <Badge variant="outline">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Podcast className="h-4 w-4" />
                      <span className="text-sm">播客</span>
                    </div>
                    <Badge variant="outline">15</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}