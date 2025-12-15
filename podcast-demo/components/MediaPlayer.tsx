'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Subtitles,
  Languages,
  RotateCcw,
  Download,
  Maximize2,
  Radio,
  Tv,
  Podcast
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface MediaSource {
  id: string
  name: string
  type: 'radio' | 'tv' | 'podcast'
  streamUrl?: string
  rssUrl: string
  language: string
  description: string
}

interface MediaPlayerProps {
  selectedSource: MediaSource | null
  onSourceChange: (source: MediaSource) => void
}

export function MediaPlayer({ selectedSource, onSourceChange }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSubtitles, setShowSubtitles] = useState(false)
  const [translateToChinese, setTranslateToChinese] = useState(true)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [translationText, setTranslationText] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [buffering, setBuffering] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentMediaRef = selectedSource?.type === 'tv' ? videoRef : audioRef

  useEffect(() => {
    if (selectedSource && currentMediaRef.current) {
      const media = currentMediaRef.current

      if (selectedSource.streamUrl) {
        media.src = selectedSource.streamUrl
        setBuffering(true)
      }

      const handleLoadedMetadata = () => {
        setDuration(media.duration)
        setBuffering(false)
      }

      const handleTimeUpdate = () => {
        setCurrentTime(media.currentTime)
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      const handleCanPlay = () => {
        setBuffering(false)
      }

      const handleWaiting = () => {
        setBuffering(true)
      }

      media.addEventListener('loadedmetadata', handleLoadedMetadata)
      media.addEventListener('timeupdate', handleTimeUpdate)
      media.addEventListener('ended', handleEnded)
      media.addEventListener('canplay', handleCanPlay)
      media.addEventListener('waiting', handleWaiting)

      return () => {
        media.removeEventListener('loadedmetadata', handleLoadedMetadata)
        media.removeEventListener('timeupdate', handleTimeUpdate)
        media.removeEventListener('ended', handleEnded)
        media.removeEventListener('canplay', handleCanPlay)
        media.removeEventListener('waiting', handleWaiting)
      }
    }
  }, [selectedSource])

  useEffect(() => {
    if (currentMediaRef.current) {
      currentMediaRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = async () => {
    if (!currentMediaRef.current || !selectedSource) return

    try {
      if (isPlaying) {
        currentMediaRef.current.pause()
      } else {
        await currentMediaRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error('播放失败:', error)
      setBuffering(false)
    }
  }

  const handleSeek = (value: number[]) => {
    if (currentMediaRef.current) {
      currentMediaRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate)
    if (currentMediaRef.current) {
      currentMediaRef.current.playbackRate = rate
    }
  }

  const skip = (seconds: number) => {
    if (currentMediaRef.current) {
      currentMediaRef.current.currentTime += seconds
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } catch (error) {
        console.error('无法进入全屏模式:', error)
      }
    } else {
      try {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } catch (error) {
        console.error('无法退出全屏模式:', error)
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'radio':
        return <Radio className="h-5 w-5" />
      case 'tv':
        return <Tv className="h-5 w-5" />
      case 'podcast':
        return <Podcast className="h-5 w-5" />
      default:
        return <Radio className="h-5 w-5" />
    }
  }

  const getSourceTypeName = (type: string) => {
    switch (type) {
      case 'radio':
        return '电台'
      case 'tv':
        return '电视台'
      case 'podcast':
        return '播客'
      default:
        return '媒体'
    }
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* 媒体信息头部 */}
      {selectedSource && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTypeIcon(selectedSource.type)}
              <div>
                <h2 className="text-xl font-bold">{selectedSource.name}</h2>
                <p className="text-blue-100 text-sm">
                  {getSourceTypeName(selectedSource.type)} • {selectedSource.language.toUpperCase()}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {isPlaying ? '播放中' : '已暂停'}
            </Badge>
          </div>
        </div>
      )}

      {/* 媒体播放区域 */}
      <Card>
        <CardContent className="p-6">
          {!selectedSource ? (
            <div className="text-center py-12 text-gray-500">
              <Radio className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">选择媒体源</h3>
              <p>请从右侧列表中选择一个电台、电视台或播客开始播放</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 视频播放器 (仅电视台类型) */}
              {selectedSource.type === 'tv' && (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls={false}
                    playsInline
                  />
                  {buffering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              )}

              {/* 音频播放器 (电台和播客类型) */}
              {selectedSource.type !== 'tv' && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    {selectedSource.type === 'radio' ? (
                      <Radio className="h-12 w-12 text-blue-600" />
                    ) : (
                      <Podcast className="h-12 w-12 text-purple-600" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedSource.name}</h3>
                      <p className="text-gray-600">{selectedSource.description}</p>
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    className="w-full"
                    controls={false}
                    playsInline
                  />

                  {buffering && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">缓冲中...</p>
                    </div>
                  )}
                </div>
              )}

              {/* 播放控制 */}
              <div className="space-y-4">
                {/* 进度条 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                </div>

                {/* 控制按钮 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => skip(-10)}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      onClick={togglePlay}
                      disabled={buffering}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => skip(10)}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleFullscreen}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* 音量控制 */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.1}
                        onValueChange={handleVolumeChange}
                        className="w-24"
                      />
                    </div>

                    {/* 播放速度 */}
                    <Select value={playbackRate.toString()} onValueChange={(v) => changePlaybackRate(parseFloat(v))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="0.75">0.75x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 功能开关 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="subtitles"
                        checked={showSubtitles}
                        onCheckedChange={setShowSubtitles}
                      />
                      <Label htmlFor="subtitles" className="text-sm">
                        <Subtitles className="h-4 w-4 inline mr-1" />
                        显示字幕
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="translate"
                        checked={translateToChinese}
                        onCheckedChange={setTranslateToChinese}
                      />
                      <Label htmlFor="translate" className="text-sm">
                        <Languages className="h-4 w-4 inline mr-1" />
                        翻译成中文
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      设置
                    </Button>
                  </div>
                </div>

                {/* 实时转录和翻译区域 */}
                {(showSubtitles || translateToChinese) && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    {showSubtitles && currentTranscript && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">实时转录</h4>
                        <div className="text-sm bg-white p-3 rounded border">
                          {currentTranscript || '正在转录中...'}
                        </div>
                      </div>
                    )}

                    {translateToChinese && translationText && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">中文翻译</h4>
                        <div className="text-sm bg-white p-3 rounded border">
                          {translationText || '正在翻译中...'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}