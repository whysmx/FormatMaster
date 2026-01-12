# 快速开始指南

## 🚀 5分钟上手Word格式还原工具

### 第一步：安装依赖

```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install lxml
```

### 第二步：还原格式

```bash
# 还原单个文档格式
export PYTHONPATH=/path/to/21word/src:$PYTHONPATH
python -m restorer.cli examples/正常格式.docx examples/错乱格式.docx
```

输出文件：`examples/错乱格式_已格式化.docx`

### 第三步：验证结果

```bash
# 对比文档格式
python -m restorer.cli compare examples/正常格式.docx examples/错乱格式_已格式化.docx
```

## 📚 更多用法

### 批量处理

```bash
# 处理多个文件
python -m restorer.cli batch examples/正常格式.docx 文件1.docx 文件2.docx

# 使用通配符
python -m restorer.cli batch examples/正常格式.docx *.docx
```

### 查看帮助

```bash
# 查看所有命令
python -m restorer.cli --help

# 查看子命令帮助
python -m restorer.cli restore --help
python -m restorer.cli batch --help
python -m restorer.cli compare --help
```

## 🛠️ 辅助工具

```bash
# 解压docx查看XML结构
python scripts/unpack_docx.py examples/正常格式.docx

# 对比两个XML文件
python scripts/diff_xml.py extracted1/word/styles.xml extracted2/word/styles.xml

# 运行测试
python scripts/test_format_restorer.py
```

## ✅ 成功标志

如果看到以下输出，说明格式还原成功：

```
📋 开始还原文档格式...
  标准格式: examples/正常格式.docx
  目标文档: examples/错乱格式.docx

✅ 格式还原完成！
  输出文件: examples/错乱格式_已格式化.docx
```

## 📖 下一步

- 阅读完整文档：[docs/usage.md](docs/usage.md)
- 查看需求文档：[docs/需求文档_Word格式还原工具.md](docs/需求文档_Word格式还原工具.md)
- 查看项目README：[README.md](README.md)

## ❓ 遇到问题？

1. **ImportError**: 确保设置了 `PYTHONPATH`
   ```bash
   export PYTHONPATH=/path/to/21word/src:$PYTHONPATH
   ```

2. **文件不存在**: 检查文件路径是否正确
   ```bash
   ls examples/*.docx
   ```

3. **格式对比显示内容不一致**: 这是正常的
   - 标准格式文档和待处理文档内容本身不同
   - 工具只修改格式，不改变内容

4. **更多帮助**: 查看 [docs/usage.md](docs/usage.md) 的"常见问题"部分
