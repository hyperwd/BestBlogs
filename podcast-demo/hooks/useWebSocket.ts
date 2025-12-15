import { useEffect, useRef, useState } from 'react'

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  shouldReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onOpen,
    onClose,
    onError,
    onMessage,
    shouldReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const websocketRef = useRef<WebSocket | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = url.startsWith('ws') ? url : `${protocol}//${window.location.host}${url}`

      websocketRef.current = new WebSocket(wsUrl)
      setReadyState(WebSocket.CONNECTING)

      websocketRef.current.onopen = (event) => {
        setReadyState(WebSocket.OPEN)
        setReconnectAttempts(0)
        onOpen?.(event)
      }

      websocketRef.current.onclose = (event) => {
        setReadyState(WebSocket.CLOSED)
        onClose?.(event)

        // 自动重连逻辑
        if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
          timeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, reconnectInterval)
        }
      }

      websocketRef.current.onerror = (event) => {
        setReadyState(WebSocket.CLOSED)
        onError?.(event)
      }

      websocketRef.current.onmessage = (event) => {
        setLastMessage(event)
        onMessage?.(event)
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      setReadyState(WebSocket.CLOSED)
    }
  }

  const sendMessage = (message: string | object) => {
    if (websocketRef.current && readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message)
      websocketRef.current.send(data)
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const disconnect = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (websocketRef.current) {
      websocketRef.current.close()
      websocketRef.current = null
    }

    setReadyState(WebSocket.CLOSED)
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [url])

  return {
    lastMessage,
    readyState,
    sendMessage,
    disconnect,
    reconnect: connect,
    reconnectAttempts,
  }
}