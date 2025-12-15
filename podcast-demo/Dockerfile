# 使用官方Node.js 18 LTS镜像
FROM node:18-alpine AS base

# 安装必要的依赖
RUN apk add --no-cache libc6-compat

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package.json pnpm-lock.yaml* ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产镜像
FROM node:18-alpine AS production

# 安装必要的运行时依赖
RUN apk add --no-cache libc6-compat

# 设置工作目录
WORKDIR /app

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制package文件
COPY package.json pnpm-lock.yaml* ./

# 安装pnpm
RUN npm install -g pnpm

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=base --chown=nextjs:nodejs /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/config ./config

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]