#!/bin/bash
# Word格式还原工具 - 启动脚本

echo "=========================================="
echo "   Word格式还原工具 - Web版"
echo "=========================================="
echo ""

# 检查Python版本
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3"
    echo "请先安装Python 3.8或更高版本"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "✅ Python版本: $PYTHON_VERSION"

# 检查依赖
echo ""
echo "📦 检查依赖..."
pip3 install -q -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装完成"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 创建必要的目录
echo ""
echo "📁 创建目录..."
mkdir -p data template_files static/uploads

# 初始化模板配置
if [ ! -f "data/templates.json" ]; then
    echo '{"templates": []}' > data/templates.json
    echo "✅ 创建模板配置文件"
fi

# 启动服务
echo ""
echo "🚀 启动服务..."
echo ""
echo "访问地址: http://localhost:8002"
echo "按 Ctrl+C 停止服务"
echo ""

python3 main.py
