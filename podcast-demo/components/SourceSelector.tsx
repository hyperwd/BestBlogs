'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Radio, Tv, Podcast, Play, Settings, Globe } from 'lucide-react'

interface MediaSource {
  id: string
  name: string
  type: 'radio' | 'tv' | 'podcast'
  rssUrl: string
  streamUrl?: string
  language: string
  country: string
  isActive: boolean
  category: string
  description: string
  thumbnail?: string
  tags: string[]
}

interface SourceSelectorProps {
  selectedSource: MediaSource | null
  onSourceSelect: (source: MediaSource) => void
}

export function SourceSelector({ selectedSource, onSourceSelect }: SourceSelectorProps) {
  const [sources, setSources] = useState<MediaSource[]>([])
  const [filteredSources, setFilteredSources] = useState<MediaSource[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSources()
  }, [])

  useEffect(() => {
    filterSources()
  }, [sources, filterType, filterCategory, filterLanguage])

  const fetchSources = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sources')
      const data = await response.json()
      setSources(data.sources.filter((source: MediaSource) => source.isActive))
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSources = () => {
    let filtered = sources

    if (filterType !== 'all') {
      filtered = filtered.filter(source => source.type === filterType)
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(source => source.category === filterCategory)
    }

    if (filterLanguage !== 'all') {
      filtered = filtered.filter(source => source.language === filterLanguage)
    }

    setFilteredSources(filtered)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'radio':
        return <Radio className="h-4 w-4" />
      case 'tv':
        return <Tv className="h-4 w-4" />
      case 'podcast':
        return <Podcast className="h-4 w-4" />
      default:
        return <Radio className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'radio':
        return 'bg-blue-100 text-blue-800'
      case 'tv':
        return 'bg-green-100 text-green-800'
      case 'podcast':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'zh': '中文',
      'en': 'English',
      'fr': 'Français',
      'es': 'Español',
      'ja': '日本語',
      'ko': '한국어',
    }
    return languages[code] || code
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

  const categories = Array.from(new Set(sources.map(s => s.category)))
  const languages = Array.from(new Set(sources.map(s => s.language)))

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg p-4 h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 过滤器 */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="radio">电台</SelectItem>
              <SelectItem value="tv">电视台</SelectItem>
              <SelectItem value="podcast">播客</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="语言" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部语言</SelectItem>
              {languages.map(language => (
                <SelectItem key={language} value={language}>
                  {getLanguageName(language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 媒体源列表 */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredSources.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>没有找到匹配的媒体源</p>
          </div>
        ) : (
          filteredSources.map(source => (
            <Card
              key={source.id}
              className={`source-card cursor-pointer transition-all ${
                selectedSource?.id === source.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSourceSelect(source)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {source.thumbnail ? (
                      <img
                        src={source.thumbnail}
                        alt={source.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(source.type)}`}>
                        {getTypeIcon(source.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{source.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {getCountryFlag(source.country)} {source.language.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {source.description}
                      </p>

                      <div className="flex items-center space-x-1 flex-wrap gap-1">
                        <Badge className={`text-xs ${getTypeColor(source.type)}`}>
                          {getTypeIcon(source.type)}
                          {source.type === 'radio' ? '电台' : source.type === 'tv' ? '电视台' : '播客'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {source.category}
                        </Badge>
                        {source.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant={selectedSource?.id === source.id ? "default" : "ghost"}
                      className="ml-2"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 管理按钮 */}
      <div className="pt-2 border-t">
        <Button variant="outline" className="w-full" asChild>
          <a href="/admin/sources">
            <Settings className="h-4 w-4 mr-2" />
            管理媒体源
          </a>
        </Button>
      </div>
    </div>
  )
}