# Word Format Restorer - Word格式还原工具

一个强大的工具，用于将标准Word文档的格式应用到其他文档，同时保留原始内容。

## ✨ 主要特性

- 🚀 **快速处理**: 单文档处理时间 < 1秒
- 🎯 **格式精确**: 100%还原标准文档的格式定义
- 💾 **批量处理**: 支持批量处理多个文档
- 🔍 **格式验证**: 内置XML对比功能，验证格式还原准确性
- 🛡️ **内容安全**: 只修改格式，不改变文档内容
- 📦 **零依赖**: 仅需 lxml，其他使用Python标准库

## 📋 功能说明

### 格式还原范围

- ✅ 字体样式（字体名称、字号、颜色、加粗、斜体等）
- ✅ 段落样式（对齐方式、行距、段前段后间距、首行缩进）
- ✅ 标题样式（Heading 1-9）
- ✅ 编号和项目符号样式
- ✅ 表格样式
- ✅ 页面设置（纸张大小、页边距）
- ✅ 保留目标文档页眉页脚内容
- ✅ 保留原内容关系（图片、超链接、注释、脚注/尾注）

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/word-format-restorer.git
cd word-format-restorer

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install lxml
```

### 基本使用

#### 1. 还原单个文档格式

```bash
# 方式1：使用传统接口（推荐，简单）
python -m restorer.cli 标准格式.docx 待处理.docx -o 输出.docx

# 方式2：使用子命令格式
python -m restorer.cli restore 标准格式.docx 待处理.docx -o 输出.docx

# 示例
python -m restorer.cli examples/正常格式.docx examples/错乱格式.docx
```

#### 2. 批量还原格式

```bash
# 处理多个文件
python -m restorer.cli batch 标准格式.docx 文件1.docx 文件2.docx 文件3.docx

# 使用通配符
python -m restorer.cli batch 标准格式.docx *.docx

# 指定输出目录
python -m restorer.cli batch 标准格式.docx contracts/*.docx -o formatted/
```

#### 3. 对比文档格式

```bash
# 全量对比所有XML文件（默认）
python -m restorer.cli --compare 标准格式.docx 输出文档.docx

# 使用子命令格式
python -m restorer.cli compare 标准格式.docx 输出文档.docx

# 仅对比特定XML文件
python -m restorer.cli compare 标准格式.docx 输出文档.docx --file styles.xml

# 仅对比格式文件（非全量）
python -m restorer.cli compare 标准格式.docx 输出文档.docx --no-full
```

## 📖 使用示例

### 示例1：格式还原

```bash
# 使用 examples/正常格式.docx 作为格式基准，处理 examples/错乱格式.docx
python -m restorer.cli examples/正常格式.docx examples/错乱格式.docx

# 输出文件：examples/错乱格式_已格式化.docx
```

### 示例2：批量处理合同

```bash
# 批量处理 contracts 目录下的所有文档
python -m restorer.cli batch 标准合同模板.docx contracts/*.docx -o formatted_contracts/

# 输出：
# 📋 开始批量还原文档格式...
#   标准格式: 标准合同模板.docx
#   待处理文件数: 10
#
# ✅ 成功处理 10 个文件:
#   • formatted_contracts/合同1_已格式化.docx
#   • formatted_contracts/合同2_已格式化.docx
#   ...
```

### 示例3：格式对比验证

```bash
# 验证格式还原是否成功
python -m restorer.cli compare examples/正常格式.docx examples/错乱格式_已格式化.docx

# 输出：
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📊 格式对比报告
# 格式基准文档: examples/正常格式.docx
# 待验证文档: examples/错乱格式_已格式化.docx
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# ✅ XML文件对比:
#   • word/styles.xml: 完全一致 ✓
#   • word/numbering.xml: 完全一致 ✓
#   • word/settings.xml: 完全一致 ✓
#   • word/fontTable.xml: 完全一致 ✓
#
# 📈 格式相似度: 100%
#
# ✅ 结论: 格式还原完全成功！
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🛠️ 命令行参数

### restore 命令

```bash
python -m restorer.cli restore <template> <target> [options]

参数:
  template        标准格式文档路径 (.docx)
  target          待处理文档路径 (.docx)

选项:
  -o, --output    输出文档路径 (默认: 目标文档_已格式化.docx)
```

### batch 命令

```bash
python -m restorer.cli batch <template> <targets...> [options]

参数:
  template        标准格式文档路径 (.docx)
  targets         待处理文档路径列表 (支持通配符)

选项:
  -o, --output-dir 输出目录 (默认: 与原文件相同目录)
```

### compare 命令

```bash
python -m restorer.cli compare <reference> <target> [options]

参数:
  reference       参考文档路径 (.docx)
  target          待验证文档路径 (.docx)

选项:
  --file          仅对比指定的XML文件 (如: styles.xml)
  --no-full       仅对比格式相关文件，非全量对比
```

## 📊 格式对比说明

### 内容一致性检查

工具会首先检查两个文档的内容是否一致：

- **检查文件**: `word/document.xml`, `word/header*.xml`, `word/footer*.xml`,
  `word/footnotes.xml`, `word/endnotes.xml`, `word/comments.xml`, 等
- **检查方式**: 提取所有文本内容进行对比
- **结果**:
  - ✅ **内容一致**: 进行完整的XML格式对比
  - ❌ **内容不一致**: 仅报告格式差异，不作为验收依据

### XML规范化

在对比XML时，工具会自动过滤以下非确定性字段：

- `w:rsid*` (如 `w:rsidR`, `w:rsidRPr`, `w:rsidP`)
- `cp:revision`
- `dcterms:created`, `dcterms:modified`

这些字段在每次保存文档时都会变化，因此不影响格式对比的准确性。

### 对比范围

**全量对比（默认）**: 对比docx内所有XML文件
- 包含：styles.xml, numbering.xml, settings.xml, fontTable.xml
- 以及：document.xml, header*.xml, footer*.xml, 等

**格式文件对比（--no-full）**: 仅对比格式定义文件
- 仅包含：styles.xml, numbering.xml, settings.xml, fontTable.xml

## 🧪 测试

项目包含测试文档用于验证功能：

```bash
# 测试格式还原
python -m restorer.cli examples/正常格式.docx examples/错乱格式.docx

# 验证结果
python -m restorer.cli compare examples/正常格式.docx examples/错乱格式_已格式化.docx
```

## 🔧 技术细节

### 核心算法

1. **解压文档**: 将docx文件解压到临时目录
2. **复制格式文件**:
   - `word/styles.xml` - 样式定义
   - `word/numbering.xml` - 编号定义
   - `word/settings.xml` - 文档设置
   - `word/fontTable.xml` - 字体表
3. **合并关系文件**: 保留目标文档的内容关系，补齐标准格式的关系
4. **清理直接格式**: 移除document.xml中的非确定性属性
5. **重新打包**: 将处理后的文件重新打包为docx

### 项目结构

```
word-format-restorer/
├── src/
│   └── restorer/
│       ├── __init__.py      # 包初始化
│       ├── core.py          # 核心格式还原逻辑
│       ├── comparer.py      # 格式对比器
│       └── cli.py           # 命令行接口
├── tests/
│   └── __init__.py
├── examples/
│   ├── 正常格式.docx        # 格式基准文档
│   └── 错乱格式.docx        # 待处理文档
├── docs/
│   ├── 需求文档_Word格式还原工具.md
│   └── usage.md
├── pyproject.toml
├── README.md
└── LICENSE
```

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

- 作者: Your Name
- 邮箱: your.email@example.com
- GitHub: https://github.com/yourusername/word-format-restorer

## 🙏 致谢

感谢所有使用和贡献这个工具的用户！
