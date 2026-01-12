# Format Master 格式大师 - 图标展示

## 🎨 已创建的图标

我为你的网站设计了一系列图标，全部使用 SVG 格式，可以无损缩放：

### 1. **logo.svg** - 经典设计
- 圆形渐变背景
- 白色文档图标
- 蓝色 "F" 字母（代表 Format）
- 装饰性小星星
- **推荐用于**: 首页 Logo

### 2. **logo-modern.svg** - 现代风格 ⭐
- 紫蓝渐变圆角矩形
- 粗体 "FM" 字母组合
- 底部小字 "FORMAT MASTER"
- **推荐用于**: 网站头部显示

### 3. **logo-minimal.svg** - 极简主义
- 绿蓝渐变文档
- 白色对勾符号
- 简洁格式线
- **推荐用于**: 应用图标、App 图标

### 4. **favicon.svg** - 网站图标
- 32x32 小尺寸
- 简洁 "FM" 缩写
- **用于**: 浏览器标签页图标

### 5. **logo-text.svg** - 文字 Logo
- 横向文字设计
- 渐变 "Format Master"
- 中文 "格式大师"
- **推荐用于**: 页脚、邮件签名

### 6. **logo-3d.svg** - 3D 效果
- 双层重叠文档
- 阴影效果
- 立体感强
- **推荐用于**: 品牌宣传、海报

### 7. **logo-circle.svg** - 圆环设计
- 外圆环装饰
- 内圆渐变
- 文档+对勾组合
- 四角装饰点
- **推荐用于**: 徽章、印章

### 8. **logo-apple.svg** - Apple 风格
- 圆角矩形
- 极简文档边框
- 光泽效果
- **推荐用于**: iOS App 图标

## 📁 文件位置

所有图标保存在：
```
/web/static/icons/
├── logo.svg           # 经典设计
├── logo-modern.svg    # 现代风格（当前使用）
├── logo-minimal.svg   # 极简主义
├── logo-3d.svg        # 3D 效果
├── logo-circle.svg    # 圆环设计
├── logo-apple.svg     # Apple 风格
├── logo-text.svg      # 文字 Logo
└── favicon.svg        # 网站图标
```

## 🔄 如何更换图标

### 方法 1: 修改 HTML（推荐）
编辑 `/web/templates/index.html`:
```html
<!-- 将 logo-modern.svg 替换为你喜欢的图标 -->
<img src="/static/icons/logo-3d.svg" alt="Format Master Logo" class="logo-image">
```

### 方法 2: 直接查看
在浏览器中访问：
```
http://localhost:8002/static/icons/logo-modern.svg
http://localhost:8002/static/icons/logo-3d.svg
http://localhost:8002/static/icons/logo-minimal.svg
```

## 🎯 设计特点

- ✅ **矢量格式**: 可无损缩放到任意尺寸
- ✅ **渐变色彩**: 蓝紫色系，专业现代
- ✅ **响应式**: 自适应不同屏幕
- ✅ **轻量化**: SVG 文件，加载快速
- ✅ **品牌一致**: 所有图标统一风格

## 💡 使用建议

| 场景 | 推荐图标 |
|------|---------|
| 网站头部 | logo-modern.svg |
| Favicon | favicon.svg |
| App 图标 | logo-minimal.svg 或 logo-apple.svg |
| 宣传海报 | logo-3d.svg 或 logo-circle.svg |
| 邮件签名 | logo-text.svg |

## 🎨 定制

如需修改颜色、尺寸或样式，只需编辑 SVG 文件中的：
- `<linearGradient>` - 颜色渐变
- `<text>` - 文字内容
- `<rect>` / `<circle>` - 形状
- `width` / `height` - 尺寸
