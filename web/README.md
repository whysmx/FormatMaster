# Word格式还原工具 - Web版

一个简单易用的Word文档格式还原Web应用，支持批量处理和标准格式管理。

## 🌟 功能特性

- ✅ **无需登录** - 打开即用
- ✅ **单文件转换** - 快速处理单个文档
- ✅ **多模板支持** - 管理多个标准格式模板
- ✅ **模板管理** - 上传、编辑、删除模板
- ✅ **格式相似度** - 显示转换后的格式匹配度
- ✅ **文件隔离** - 每个用户的文件相互隔离
- ✅ **下载即删** - 节省存储空间

## 🚀 快速开始

### 1. 安装依赖

```bash
cd web
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python main.py
```

或者使用 uvicorn：

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 访问应用

打开浏览器访问：`http://localhost:8002`

## 📖 使用说明

### 页面1: 文档转换

1. **选择模板** - 点击列表中的模板进行选择（默认选中第一个）
2. **上传文档** - 点击上传区域或拖拽文件
3. **开始转换** - 点击转换按钮
4. **下载结果** - 转换完成后点击下载按钮

### 页面2: 模板管理

1. **上传模板** - 点击"上传新模板"按钮
2. **设置默认** - 点击"设为默认"按钮
3. **删除模板** - 点击"删除"按钮（需确认）

## 📁 项目结构

```
web/
├── main.py                 # FastAPI主应用
├── requirements.txt        # Python依赖
├── data/
│   └── templates.json      # 模板配置文件
├── template_files/         # 标准格式文件存储
├── static/
│   ├── css/
│   │   └── style.css      # 样式文件
│   ├── js/
│   │   ├── app.js         # 转换页面脚本
│   │   └── manage.js      # 模板管理脚本
│   └── uploads/           # 临时文件（下载后删除）
└── templates/
    ├── index.html         # 转换页面
    └── manage.html        # 模板管理页面
```

## 🔧 技术栈

### 后端
- **FastAPI** - 现代化的Web框架
- **Python 3.8+** - 开发语言
- **lxml** - XML处理
- **aiofiles** - 异步文件操作

### 前端
- **HTML5/CSS3/JavaScript** - 原生前端技术
- **Fetch API** - HTTP请求
- **无框架** - 轻量级实现

### 核心库
- **restorer** - 格式还原核心模块（复用命令行版本）

## 🔒 安全特性

- ✅ **文件类型验证** - 仅允许.docx文件
- ✅ **文件隔离** - 每个会话独立存储
- ✅ **下载权限控制** - 仅下载自己的文件
- ✅ **自动清理** - 下载后立即删除文件

## 📊 性能指标

- 单文件处理时间: < 2秒
- 支持10人并发使用
- 文件大小: 无限制（根据服务器配置）
- 内存占用: < 200MB

## 🛠️ 配置说明

### 端口配置

默认端口：8002

修改端口：
```bash
uvicorn main:app --port 9000
```

### 主机配置

默认监听：0.0.0.0（所有网络接口）

局域网访问：
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🐛 常见问题

### 1. 启动失败

检查是否安装依赖：
```bash
pip install -r requirements.txt
```

### 2. 无法访问

检查防火墙设置，确保8000端口开放

### 3. 模板文件丢失

模板文件存储在 `template_files/` 目录，确保该目录存在且有写入权限

### 4. 下载失败

文件已过期被删除，请重新转换

## 📝 开发说明

### 添加新功能

1. 后端：在 `main.py` 添加新的API路由
2. 前端：在 `static/js/` 添加JavaScript代码
3. 样式：在 `static/css/style.css` 添加CSS

### 修改样式

编辑 `static/css/style.css` 文件

### 数据持久化

当前使用JSON文件存储模板配置，如需使用数据库：
1. 安装SQLAlchemy：`pip install sqlalchemy`
2. 修改 `main.py` 使用数据库模型

## 🚀 部署建议

### 开发环境
```bash
uvicorn main:app --reload
```

### 生产环境
```bash
uvicorn main:app --host 0.0.0.0 --port 8002 --workers 4
```

### 使用systemd（Linux）
创建服务文件 `/etc/systemd/system/word-restorer.service`

### 使用Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题，请提交Issue或联系开发团队。

---

**版本**: 1.0.0
**最后更新**: 2024-01-08
