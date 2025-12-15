# 🚀 生产环境部署指南

本文档提供了在生产服务器上部署智能播客电台演示平台的详细指南。

## 📋 部署前准备

### 1. 服务器要求

**最低配置：**
- CPU: 2核心
- 内存: 4GB RAM
- 存储: 20GB 可用空间
- 网络: 稳定的互联网连接

**推荐配置：**
- CPU: 4核心
- 内存: 8GB RAM
- 存储: 50GB SSD
- 网络: 100Mbps+ 带宽

### 2. 软件依赖

- Docker 20.10+
- Docker Compose 2.0+
- Nginx (可选，用于反向代理)
- 域名和SSL证书 (生产环境推荐)

### 3. 必要的API密钥

确保你拥有以下服务的API密钥：
- Dify API Key (必需)
- OpenAI API Key (可选，用于额外功能)

## 🔧 部署步骤

### 步骤1: 克隆项目

```bash
# 克隆代码仓库
git clone <your-repository-url>
cd podcast-demo

# 检查项目结构
ls -la
```

### 步骤2: 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量文件
nano .env
```

**关键配置项：**
```env
# Dify API配置 (必需)
DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=your-actual-api-key

# 应用配置
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# RSS更新配置
RSS_UPDATE_INTERVAL=30
CACHE_EXPIRY=10

# 安全配置 (生产环境强烈建议)
CORS_ORIGIN=https://your-domain.com
API_SECRET_KEY=your-very-secure-secret-key
```

### 步骤3: 构建和启动服务

```bash
# 使用Docker Compose一键启动
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看启动日志
docker-compose logs -f podcast-demo
```

### 步骤4: 验证部署

```bash
# 检查容器健康状态
docker inspect podcast-demo | grep Health -A 10

# 测试API可访问性
curl http://localhost:3000/api/health

# 检查主要页面
curl http://localhost:3000
```

## 🔒 安全配置

### 1. 防火墙设置

```bash
# 只允许必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 2. Nginx反向代理配置

创建Nginx配置文件 `/etc/nginx/sites-available/podcast-demo`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # 代理配置
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/podcast-demo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 监控和维护

### 1. 日志管理

```bash
# 查看应用日志
docker-compose logs -f podcast-demo

# 日志轮转配置
sudo nano /etc/logrotate.d/podcast-demo
```

### 2. 性能监控

```bash
# 监控容器资源使用
docker stats podcast-demo

# 监控磁盘使用
df -h

# 监控内存使用
free -h
```

### 3. 自动备份

创建备份脚本 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/backup/podcast-demo"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz config/

# 备份数据库(如果有)
docker exec podcast-demo pg_dump -U username database > $BACKUP_DIR/db_$DATE.sql

# 清理旧备份(保留7天)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

设置定时备份：
```bash
# 添加到crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

## 🔄 更新和维护

### 1. 应用更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 验证更新
docker-compose ps
```

### 2. 故障排查

**常见问题和解决方案：**

1. **容器无法启动**
   ```bash
   # 检查日志
   docker-compose logs podcast-demo

   # 检查环境变量
   docker-compose config
   ```

2. **API调用失败**
   ```bash
   # 验证API密钥
   curl -H "Authorization: Bearer YOUR_API_KEY" https://api.dify.ai/v1/health

   # 检查网络连接
   docker exec podcast-demo ping api.dify.ai
   ```

3. **内存不足**
   ```bash
   # 增加swap空间
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 📈 扩展配置

### 1. 负载均衡

如果需要高可用部署，可以使用多实例：

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  podcast-demo:
    scale: 3
    # ... 其他配置
```

### 2. 缓存优化

添加Redis缓存：

```yaml
# docker-compose.yml 中添加
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
  volumes:
    - redis-data:/data
  restart: unless-stopped
```

### 3. 数据库集成

如需使用PostgreSQL替代SQLite：

```yaml
# docker-compose.yml 中添加
postgres:
  image: postgres:13
  environment:
    POSTGRES_DB: podcast_demo
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: your_password
  volumes:
    - postgres-data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
  restart: unless-stopped
```

## 🎯 部署检查清单

部署完成后，请确认以下项目：

- [ ] 服务正常启动且健康检查通过
- [ ] 所有API端点可正常访问
- [ ] 前端界面加载正常
- [ ] SSL证书配置正确
- [ ] 防火墙规则设置正确
- [ ] 日志记录功能正常
- [ ] 备份策略已实施
- [ ] 监控告警已配置
- [ ] 性能指标符合预期

完成以上步骤后，你的智能播客电台演示平台就成功部署到生产环境了！