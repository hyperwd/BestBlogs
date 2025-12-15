import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { generateId } from '@/lib/utils'

const SOURCES_FILE = path.join(process.cwd(), 'config', 'sources.json')

// 获取所有媒体源
export async function GET() {
  try {
    const data = await fs.readFile(SOURCES_FILE, 'utf-8')
    const sources = JSON.parse(data)
    return NextResponse.json(sources)
  } catch (error) {
    console.error('Error reading sources:', error)
    return NextResponse.json(
      { error: 'Failed to read sources' },
      { status: 500 }
    )
  }
}

// 添加新的媒体源
export async function POST(request: NextRequest) {
  try {
    const newSource = await request.json()

    // 验证必需字段
    const requiredFields = ['name', 'type', 'language', 'rssUrl']
    for (const field of requiredFields) {
      if (!newSource[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // 读取现有源
    const data = await fs.readFile(SOURCES_FILE, 'utf-8')
    const sources = JSON.parse(data)

    // 检查是否已存在同名源
    if (sources.sources.some((source: any) => source.name === newSource.name)) {
      return NextResponse.json(
        { error: 'Source with this name already exists' },
        { status: 409 }
      )
    }

    // 添加新源
    const sourceWithId = {
      ...newSource,
      id: generateId(),
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    sources.sources.push(sourceWithId)

    // 写入文件
    await fs.writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2))

    return NextResponse.json(sourceWithId, { status: 201 })
  } catch (error) {
    console.error('Error adding source:', error)
    return NextResponse.json(
      { error: 'Failed to add source' },
      { status: 500 }
    )
  }
}

// 更新媒体源
export async function PUT(request: NextRequest) {
  try {
    const updatedSource = await request.json()

    if (!updatedSource.id) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      )
    }

    // 读取现有源
    const data = await fs.readFile(SOURCES_FILE, 'utf-8')
    const sources = JSON.parse(data)

    // 找到并更新源
    const sourceIndex = sources.sources.findIndex((source: any) => source.id === updatedSource.id)
    if (sourceIndex === -1) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }

    sources.sources[sourceIndex] = {
      ...sources.sources[sourceIndex],
      ...updatedSource,
      updatedAt: new Date().toISOString(),
    }

    // 写入文件
    await fs.writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2))

    return NextResponse.json(sources.sources[sourceIndex])
  } catch (error) {
    console.error('Error updating source:', error)
    return NextResponse.json(
      { error: 'Failed to update source' },
      { status: 500 }
    )
  }
}

// 删除媒体源
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('id')

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      )
    }

    // 读取现有源
    const data = await fs.readFile(SOURCES_FILE, 'utf-8')
    const sources = JSON.parse(data)

    // 找到并删除源
    const sourceIndex = sources.sources.findIndex((source: any) => source.id === sourceId)
    if (sourceIndex === -1) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }

    const deletedSource = sources.sources.splice(sourceIndex, 1)[0]

    // 写入文件
    await fs.writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2))

    return NextResponse.json({ message: 'Source deleted successfully', deletedSource })
  } catch (error) {
    console.error('Error deleting source:', error)
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 }
    )
  }
}