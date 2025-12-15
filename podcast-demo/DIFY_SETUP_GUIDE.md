# Dify 工作流配置指南

本指南帮助您配置 Dify 工作流以实现完整的播客演示平台功能。

## 🎯 配置目标

通过 Dify 工作流实现：
- ✅ **音频转录**: 音频文件 → 文字内容
- ✅ **AI 分析**: 文字内容 → 摘要、评分、分类
- ✅ **文本翻译**: 外语内容 → 中文翻译
- ✅ **语音合成**: 文字内容 → 中文语音

## 🛠️ 环境配置

### 1. 复制环境配置文件
```bash
cp .env.example .env.local
```

### 2. 编辑 .env.local 文件
```bash
# Dify API 配置
DIFY_API_URL=https://your-dify-instance.com/v1
DIFY_API_KEY=your-dify-api-key

# Dify 工作流配置 (导入后填写实际ID)
DIFY_TRANSCRIPTION_WORKFLOW_ID=transcription-workflow
DIFY_ANALYSIS_WORKFLOW_ID=播客分析流程
DIFY_TRANSLATION_WORKFLOW_ID=播客分析结果翻译
```

## 📥 导入工作流

### 1. 音频转录工作流
**文件**: 需要在 Dify 中创建

**工作流配置**:
- 名称: `BestBlogs 音频转录`
- 输入变量:
  - `audio_file`: 文件类型
  - `language`: 文本类型，默认 "auto"
  - `output_format`: 文本类型，默认 "json"
  - `include_timestamps`: 布尔类型，默认 true

**系统提示词**:
```
你是专业的音频转录助手。请将用户提供的音频文件准确转录为文字。

要求：
1. 准确识别语音内容
2. 保持原始语言的准确性
3. 如包含时间戳信息，请保留
4. 输出格式为JSON

输出格式：
{
  "text": "转录的文本内容",
  "language": "识别的语言",
  "segments": [
    {
      "start": 0,
      "end": 5.2,
      "text": "第一段文字"
    }
  ]
}
```

### 2. 播客分析工作流（推荐使用现有）
**文件**: `/Users/zt/Pro/BestBlogs/flows/Dify/dsl/BestBlogs 播客分析流程.yml`

**修改建议**:
1. 将输入变量从 `input_article_id` 改为 `content` (文本内容)
2. 调整系统提示词中的"播客分析专家"为"内容分析专家"
3. 保持现有的评估维度和输出格式

### 3. 播客分析结果翻译工作流（推荐使用现有）
**文件**: `/Users/zt/Pro/BestBlogs/flows/Dify/dsl/BestBlogs 播客分析结果翻译.yml`

**无需修改**，直接导入使用即可。

## 🔧 Dify 配置步骤

### 1. 登录 Dify 控制台
- 访问您的 Dify 实例
- 登录管理员账号

### 2. 创建音频转录工作流
1. 点击 "工作流" → "创建工作流"
2. 选择 "空白工作流"
3. 配置开始节点和输入变量
4. 添加 LLM 节点，设置转录提示词
5. 设置输出节点
6. 保存并获取工作流ID

### 3. 导入现有工作流
1. 点击 "工作流" → "导入工作流"
2. 上传以下文件：
   - `BestBlogs 播客分析流程.yml`
   - `BestBlogs 播客分析结果翻译.yml`

### 4. 获取工作流ID
- 在每个工作流的详情页面中，复制工作流ID
- 更新 `.env.local` 文件中的对应配置

## 🧪 测试配置

### 1. 重启开发服务器
```bash
# 停止当前服务器
# Ctrl+C

# 重新启动
pnpm dev
```

### 2. 检查配置验证
启动时会显示 Dify 配置验证结果：
```
✅ Dify 配置验证通过
```

如果看到警告，请检查 `.env.local` 文件中的必需配置。

### 3. 测试 Dify 连接
在浏览器中打开 http://localhost:3000，查看控制台：
- 应该看到 "Dify 配置验证通过" 消息
- 如果配置正确，将显示 Dify 工作流ID

## 🚀 功能测试

### 1. 音频转录测试
```javascript
// 在浏览器控制台中测试
import { transcribeAudio } from '@/lib/dify/client';

// 测试音频转录（需要音频文件）
const audioFile = new File(['音频数据'], 'test.mp3');
const result = await transcribeAudio({
  audioFile: audioFile,
  language: 'auto',
  outputFormat: 'json'
});
```

### 2. 内容分析测试
```javascript
import { analyzeContent } from '@/lib/dify/client';

// 测试内容分析
const result = await analyzeContent({
  content: '这是要分析的文本内容',
  analysisType: 'comprehensive',
  extractKeywords: true,
  sentimentAnalysis: true,
  importanceScoring: true,
  breakingNewsDetection: true
});
```

### 3. 文本翻译测试
```javascript
import { translateText } from '@/lib/dify/client';

// 测试文本翻译
const result = await translateText({
  text: 'This is the text to translate',
  sourceLanguage: 'auto',
  targetLanguage: 'zh-CN',
  style: 'professional'
});
```

## 📊 工作流映射

| 功能 | Dify 工作流 | 输入 | 输出 |
|------|-------------|------|------|
| 音频转录 | `transcription-workflow` | 音频文件 | 转录文本 |
| 内容分析 | `播客分析流程` | 文本内容 | 分析结果 |
| 文本翻译 | `播客分析结果翻译` | 分析结果 | 翻译结果 |
| 语音合成 | `tts-workflow` | 文本内容 | 语音文件 |

## 🔍 故障排除

### 配置验证失败
```
警告: 缺少以下必需的环境变量:
- DIFY_API_URL
- DIFY_API_KEY
```

**解决方案**：
1. 检查 `.env.local` 文件是否存在
2. 确认变量名拼写正确
3. 验证环境变量值是否正确

### 工作流调用失败
**错误**: `Workflow not found`

**解决方案**：
1. 检查工作流ID是否正确
2. 确认 Dify 工作流是否已发布
3. 验证 API 密钥是否有效

### 音频处理失败
**错误**: `Invalid audio file format`

**解决方案**：
1. 确保音频文件格式正确（MP3、WAV、M4A、OGG）
2. 检查文件大小是否超过限制
3. 验证文件是否成功上传

## 💡 优化建议

### 1. 工作流优化
- 为每个工作流设置合适的超时时间
- 启用缓存以提高响应速度
- 监控 API 使用量和成本

### 2. 错误处理
- 实现重试机制
- 添加用户友好的错误消息
- 提供降级方案

### 3. 性能优化
- 使用批量处理减少API调用
- 实现智能缓存策略
- 优化大文件处理流程

配置完成后，您的播客演示平台将通过 Dify 工作流提供完整的AI功能！🎉