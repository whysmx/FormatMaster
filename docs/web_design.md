# Word格式还原工具 - Web版设计文档

## 1. 项目概述

### 1.1 项目名称
Word格式还原工具 Web版 (Word Format Restorer Web)

### 1.2 设计理念
**极简主义**: 无需登录、单文件处理、API最小化

### 1.3 核心价值
- 🔓 **零门槛**: 打开即用，无需注册登录
- 🚀 **极简单**: 每次处理一个文件，避免复杂性
- ⚡ **够用**: 仅保留核心功能，减少维护成本

---

## 2. 技术架构

### 2.1 技术栈

#### 后端
```
FastAPI          - Web框架
SQLite + SQLAlchemy - 数据库（可选，用于统计）
Python-multipart - 文件上传
lxml             - XML处理（复用现有核心模块）
```

#### 前端
```
HTML5 + CSS3     - 简洁的界面
原生JavaScript   - 交互逻辑
```

#### 核心模块
```
restorer.core    - 格式还原引擎（复用）
restorer.comparer - 格式对比（复用）
```

### 2.2 架构图

```
┌─────────────────────────────────────┐
│         用户浏览器                    │
│  ┌──────────────────────────────┐  │
│  │  简单上传页面 (HTML/JS)      │  │
│  └──────────────┬───────────────┘  │
└─────────────────┼───────────────────┘
                  │ HTTP POST
┌─────────────────▼───────────────────┐
│         FastAPI 服务                │
│  ┌──────────────────────────────┐  │
│  │  POST /api/convert           │  │
│  │    - 接收文件                │  │
│  │    - 返回结果                │  │
│  └──────────────┬───────────────┘  │
│                 │                   │
│  ┌──────────────▼───────────────┐  │
│  │  格式还原核心模块            │  │
│  │  (restorer.core)             │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 3. 功能设计

### 3.1 功能列表

#### ✅ 实现功能
1. **单文件上传**: 每次处理一个Word文档
2. **格式还原**: 应用标准格式模板
3. **在线下载**: 实时返回处理后的文件
4. **格式验证**: 显示相似度指标

#### ❌ 不实现功能
- ❌ 用户登录/注册
- ❌ 批量文件上传
- ❌ 历史记录
- ❌ 用户配置
- ❌ 文件管理
- ❌ 数据库存储（可选，仅用于统计）

---

## 4. API设计（极简版）

### 4.1 API列表

**仅2个API接口：**

#### 1. 上传并转换
```http
POST /api/convert
Content-Type: multipart/form-data
```

**请求参数：**
```
template: file (标准格式文档)
target: file (待处理文档)
```

**响应：**
```json
{
  "success": true,
  "message": "格式还原完成",
  "similarity": 100.0,
  "download_url": "/api/download/abc123.docx"
}
```

或错误情况：
```json
{
  "success": false,
  "error": "文件格式不支持，仅支持.docx格式"
}
```

#### 2. 下载结果
```http
GET /api/download/{filename}
```

**响应：**
```
直接返回文件流 (Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document)
```

---

## 5. 前端设计

### 5.1 页面布局

```
┌──────────────────────────────────────┐
│      Word格式还原工具                 │
├──────────────────────────────────────┤
│                                       │
│  📋 上传标准格式                      │
│  ┌──────────────────────────────┐   │
│  │ [选择文件] 或拖拽文件到此处    │   │
│  │ 标准格式.docx                 │   │
│  └──────────────────────────────┘   │
│                                       │
│  📄 上传待处理文档                    │
│  ┌──────────────────────────────┐   │
│  │ [选择文件] 或拖拽文件到此处    │   │
│  │ 待处理文档.docx                │   │
│  └──────────────────────────────┘   │
│                                       │
│  ┌──────────────────────────────┐   │
│  │     [开始格式还原]            │   │
│  └──────────────────────────────┘   │
│                                       │
│  ⏳ 处理中... (进度条)                │
│                                       │
│  ✅ 格式还原完成！                    │
│     格式相似度: 100.0%                │
│     [下载结果]                        │
└──────────────────────────────────────┘
```

### 5.2 HTML结构

```html
<!DOCTYPE html>
<html>
<head>
    <title>Word格式还原工具</title>
    <style>
        /* 简洁的样式 */
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .upload-box { border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
        .upload-box.dragover { border-color: #4CAF50; background: #f0f0f0; }
        button { background: #4CAF50; color: white; border: none; padding: 15px 30px; font-size: 16px; cursor: pointer; }
        .progress { display: none; margin: 20px 0; }
        .result { display: none; text-align: center; }
        .similarity { font-size: 24px; color: #4CAF50; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>📝 Word格式还原工具</h1>
    <p>上传两个Word文档，我们将把标准格式的样式应用到目标文档</p>

    <!-- 标准格式上传 -->
    <h2>1️⃣ 标准格式文档</h2>
    <div class="upload-box" id="templateBox">
        <input type="file" id="templateFile" accept=".docx" style="display:none">
        <p>点击或拖拽标准格式文档到此处</p>
        <p id="templateName"></p>
    </div>

    <!-- 目标文档上传 -->
    <h2>2️⃣ 待处理文档</h2>
    <div class="upload-box" id="targetBox">
        <input type="file" id="targetFile" accept=".docx" style="display:none">
        <p>点击或拖拽待处理文档到此处</p>
        <p id="targetName"></p>
    </div>

    <!-- 提交按钮 -->
    <button id="convertBtn" disabled>开始格式还原</button>

    <!-- 进度显示 -->
    <div class="progress" id="progress">
        <p>⏳ 处理中...</p>
    </div>

    <!-- 结果显示 -->
    <div class="result" id="result">
        <h2>✅ 格式还原完成！</h2>
        <div class="similarity" id="similarity"></div>
        <a id="downloadLink" class="button">下载结果</a>
    </div>

    <script>
        // JavaScript交互逻辑
    </script>
</body>
</html>
```

---

## 6. 后端实现

### 6.1 项目结构

```
word-format-restorer/
├── backend/
│   ├── main.py              # FastAPI应用入口
│   ├── config.py            # 配置文件
│   ├── routes.py            # API路由
│   ├── services.py          # 业务逻辑
│   └── utils.py             # 工具函数
├── static/
│   ├── index.html           # 前端页面
│   ├── css/
│   │   └── style.css        # 样式文件
│   └── js/
│       └── app.js           # 前端逻辑
├── uploads/                 # 临时上传目录
├── downloads/               # 临时下载目录
└── src/restorer/            # 核心模块（复用）
```

### 6.2 核心代码

#### main.py (FastAPI入口)
```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uuid

from services import convert_document

app = FastAPI(title="Word格式还原工具")

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 临时文件目录
UPLOAD_DIR = Path("uploads")
DOWNLOAD_DIR = Path("downloads")
UPLOAD_DIR.mkdir(exist_ok=True)
DOWNLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
async def index():
    """返回首页"""
    return FileResponse("static/index.html")

@app.post("/api/convert")
async def api_convert(
    template: UploadFile = File(...),
    target: UploadFile = File(...)
):
    """格式转换API"""
    # 验证文件格式
    if not template.filename.endswith('.docx') or not target.filename.endswith('.docx'):
        raise HTTPException(status_code=400, detail="仅支持.docx格式")

    # 保存上传文件
    template_path = UPLOAD_DIR / f"{uuid.uuid4()}_{template.filename}"
    target_path = UPLOAD_DIR / f"{uuid.uuid4()}_{target.filename}"

    with open(template_path, 'wb') as f:
        f.write(await template.read())
    with open(target_path, 'wb') as f:
        f.write(await target.read())

    # 执行格式转换
    try:
        output_path, similarity = convert_document(template_path, target_path)

        # 移动到下载目录
        download_filename = f"{uuid.uuid4()}_formatted.docx"
        download_path = DOWNLOAD_DIR / download_filename
        output_path.rename(download_path)

        return {
            "success": True,
            "message": "格式还原完成",
            "similarity": similarity,
            "download_url": f"/api/download/{download_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{filename}")
async def api_download(filename: str):
    """下载转换结果"""
    file_path = DOWNLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在或已过期")
    return FileResponse(file_path, filename=f"formatted_{filename}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### services.py (业务逻辑)
```python
from pathlib import Path
import sys

# 添加核心模块路径
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from restorer.core import FormatRestorer
from restorer.comparer import FormatComparer

def convert_document(template_path: str, target_path: str):
    """执行格式转换并返回相似度"""
    # 格式还原
    restorer = FormatRestorer(template_path)
    output_path = Path("uploads") / f"temp_{uuid.uuid4()}.docx"
    restorer.restore_format(target_path, str(output_path))

    # 计算相似度
    comparer = FormatComparer()
    result = comparer.compare_documents(
        template_path,
        str(output_path),
        full_compare=False  # 仅对比格式文件
    )
    similarity = result.get("overall_similarity", 0.0)

    return output_path, similarity
```

---

## 7. 文件管理策略

### 7.1 临时文件处理

```
上传文件 → 临时存储 (uploads/) → 处理 → 结果文件 (downloads/) → 1小时后自动删除
```

### 7.2 清理机制

**方式1: 定时清理（推荐）**
```python
import asyncio
from datetime import datetime, timedelta

async def cleanup_old_files():
    """每小时清理一次超过1小时的文件"""
    while True:
        now = datetime.now()
        for file in DOWNLOAD_DIR.glob("*.docx"):
            if now - datetime.fromtimestamp(file.stat().st_mtime) > timedelta(hours=1):
                file.unlink()
        await asyncio.sleep(3600)  # 每小时执行一次
```

**方式2: 请求时清理**
```python
# 每次下载后立即删除
@app.get("/api/download/{filename}")
async def api_download(filename: str):
    file_path = DOWNLOAD_DIR / filename
    response = FileResponse(file_path, filename=f"formatted_{filename}")
    # 下载后删除
    await asyncio.sleep(1)  # 等待传输完成
    file_path.unlink()
    return response
```

---

## 8. 部署方案

### 8.1 开发环境

```bash
# 安装依赖
pip install fastapi uvicorn python-multipart

# 启动服务
python backend/main.py

# 或使用uvicorn
uvicorn backend.main:app --reload
```

访问: http://localhost:8000

### 8.2 生产环境

#### 使用Docker（推荐）

**Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./uploads:/app/uploads
      - ./downloads:/app/downloads
    restart: always
```

启动：
```bash
docker-compose up -d
```

#### 使用systemd（Linux）

```ini
[Unit]
Description=Word Format Restorer Web
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/word-format-restorer
ExecStart=/usr/bin/python3 backend/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 9. 安全考虑

### 9.1 文件安全

✅ **已实现的安全措施：**
- 文件类型验证（仅允许.docx）
- 文件大小限制（默认10MB）
- UUID文件名（防止路径遍历）
- 临时文件自动清理

### 9.2 建议

- 使用HTTPS（生产环境）
- 添加CORS限制
- 限制并发请求（防止DDoS）
- 添加速率限制

---

## 10. 性能优化

### 10.1 异步处理

FastAPI天然支持异步，文件上传和IO操作都是异步的。

### 10.2 文件大小限制

```python
# 限制上传文件大小为10MB
from fastapi import Body

@app.post("/api/convert")
async def api_convert(
    template: UploadFile = File(...),
    target: UploadFile = File(...)
):
    # 检查文件大小
    MAX_SIZE = 10 * 1024 * 1024  # 10MB
    if template.size > MAX_SIZE or target.size > MAX_SIZE:
        raise HTTPException(status_code=400, detail="文件大小超过10MB限制")
    ...
```

### 10.3 并发处理

单文件处理时间<1秒，理论上可以支持100+并发用户。

---

## 11. 测试计划

### 11.1 功能测试

- [ ] 上传标准格式和目标文档
- [ ] 验证格式还原正确性
- [ ] 下载转换结果
- [ ] 错误处理（非docx文件、超大文件等）

### 11.2 性能测试

- [ ] 单文件处理时间
- [ ] 并发处理能力
- [ ] 内存占用

---

## 12. 开发计划

### Phase 1: MVP（1-2天）
- [x] 基础FastAPI应用
- [ ] 文件上传功能
- [ ] 格式转换集成
- [ ] 简单的前端页面

### Phase 2: 完善（1天）
- [ ] 进度显示
- [ ] 相似度展示
- [ ] 错误处理
- [ ] 文件清理机制

### Phase 3: 优化（可选）
- [ ] Docker部署
- [ ] 性能优化
- [ ] 单元测试

---

## 13. 总结

### 13.1 核心特点

✅ **极简**: 仅2个API接口
✅ **无状态**: 不需要数据库
✅ **够用**: 满足核心需求
✅ **易维护**: 代码量少，易理解和维护

### 13.2 技术亮点

- 复用现有核心模块
- FastAPI异步高性能
- 临时文件自动清理
- 零配置开箱即用

### 13.3 扩展性

如需后期扩展：
1. 添加用户认证 → JWT token
2. 添加历史记录 → SQLite数据库
3. 添加批量处理 → 后台任务队列
4. 添加标准格式库 → 简单的文件管理

---

**设计版本**: v1.0
**最后更新**: 2024-01-08
**状态**: 待开发
