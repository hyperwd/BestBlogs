import { NextRequest } from 'next/server'
import { WebSocketServer, WebSocket } from 'ws'

// WebSocket 连接存储
const connections = new Set<WebSocket>()

// 广播函数
export function broadcast(data: any) {
  const message = JSON.stringify(data)

  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(message)
      } catch (error) {
        console.error('Failed to send message to WebSocket:', error)
        connections.delete(ws)
      }
    } else {
      connections.delete(ws)
    }
  })
}

// 模拟实时数据推送
function startDataSimulation() {
  // 模拟突发新闻推送
  setInterval(() => {
    const breakingNews = [
      {
        title: '突发：重要科技新闻更新',
        description: 'AI领域取得重大突破'
      },
      {
        title: '市场快讯：股市出现重大波动',
        description: '全球市场受最新政策影响'
      },
      {
        title: '国际要闻：重要事件发生',
        description: '国际形势出现新变化'
      }
    ]

    const randomNews = breakingNews[Math.floor(Math.random() * breakingNews.length)]

    broadcast({
      type: 'breaking_news',
      news: {
        ...randomNews,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        importance: 8 + Math.floor(Math.random() * 2)
      }
    })
  }, 30000) // 每30秒推送一次突发新闻

  // 模拟统计数据更新
  setInterval(() => {
    broadcast({
      type: 'stats_update',
      stats: {
        totalSources: 35 + Math.floor(Math.random() * 5),
        activeStreams: 25 + Math.floor(Math.random() * 8),
        todayNews: 150 + Math.floor(Math.random() * 50),
        breakingNewsCount: Math.floor(Math.random() * 5),
        processedHours: 120 + Math.floor(Math.random() * 20),
        accuracyRate: 95 + Math.random() * 4
      }
    })
  }, 15000) // 每15秒更新统计数据
}

// 启动数据模拟
if (typeof window === 'undefined') {
  startDataSimulation()
}

// WebSocket 路由处理器
export async function GET(request: NextRequest) {
  // 这里我们无法直接在 Next.js 中创建 WebSocket 服务器
  // 在实际部署时，需要单独的 WebSocket 服务器或使用 Vercel Edge Functions

  // 为了演示，我们返回一些说明
  return new Response(
    'WebSocket 服务器需要在单独的进程中运行。请查看文档了解如何设置 WebSocket 支持。',
    {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  )
}

// 导出连接管理器供其他模块使用
export { connections }