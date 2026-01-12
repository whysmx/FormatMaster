# UI 颜色显示问题排查指南

## 🔍 快速诊断步骤

### 1. 访问诊断页面
打开浏览器访问：http://localhost:8002/diagnose

这个页面会显示：
- CSS 变量是否正确加载
- 所有颜色变量的实际值
- 元素样式是否正确应用

### 2. 常见问题和解决方案

#### 问题 1: 浏览器缓存
**症状**: 修改 CSS 后页面没有变化

**解决方案**:
```
1. 硬刷新页面
   - Mac: Cmd + Shift + R
   - Windows: Ctrl + Shift + R

2. 清除浏览器缓存
   - Chrome: DevTools > Application > Clear storage

3. 使用无痕模式测试
```

#### 问题 2: CSS 变量未定义
**症状**: 颜色显示为默认值（黑色/白色）

**检查**:
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 是否有错误
3. 查看 Network 标签，确认 style.css 是否加载成功

**解决方案**:
- 确认 style.css 文件存在且路径正确
- 检查 CSS 语法是否正确
- 重启服务器

#### 问题 3: 内联样式覆盖
**症状**: 某些元素颜色正确，某些不正确

**检查**:
```javascript
// 在浏览器 Console 中运行：
const element = document.querySelector('.card');
const styles = window.getComputedStyle(element);
console.log('背景色:', styles.backgroundColor);
console.log('文字色:', styles.color);
```

#### 问题 4: Google Fonts 加载失败
**症状**: 字体显示不正确，影响整体样式

**解决方案**:
```css
/* 在 style.css 顶部添加 */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* 或者使用系统字体作为后备 */
body {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### 3. 颜色参考值

正确的颜色值应该是：

```css
--primary: #3B82F6        /* 蓝色 */
--primary-dark: #2563EB   /* 深蓝色 */
--primary-light: #60A5FA  /* 浅蓝色 */
--success: #10B981        /* 绿色 */
--error: #EF4444          /* 红色 */
--warning: #F59E0B        /* 橙色 */
--text-primary: #1E293B   /* 深灰色文字 */
--text-secondary: #475569 /* 浅灰色文字 */
--bg-primary: #F8FAFC     /* 浅灰背景 */
--bg-secondary: #FFFFFF   /* 白色背景 */
```

### 4. 调试技巧

#### 在浏览器 Console 中测试

```javascript
// 1. 检查 CSS 变量
const root = document.documentElement;
const styles = getComputedStyle(root);
console.log('主色:', styles.getPropertyValue('--primary'));
console.log('文字色:', styles.getPropertyValue('--text-primary'));

// 2. 测试颜色应用
document.body.style.setProperty('--primary', '#FF0000');
// 如果页面变成红色，说明 CSS 变量工作正常

// 3. 检查元素样式
const card = document.querySelector('.card');
console.log('卡片背景:', window.getComputedStyle(card).backgroundColor);
```

### 5. 完整的样式重置（如果需要）

如果样式完全错乱，可以在浏览器 Console 中运行：

```javascript
// 强制重新加载 CSS
const link = document.querySelector('link[href*="style.css"]');
if (link) {
    link.href = link.href + '?v=' + new Date().getTime();
    location.reload();
}
```

### 6. 服务器检查

```bash
# 确认服务器运行正常
curl -I http://localhost:8002

# 检查 CSS 文件是否可访问
curl -I http://localhost:8002/static/css/style.css

# 查看 CSS 内容（前 50 行）
curl http://localhost:8002/static/css/style.css | head -50
```

## 📱 移动端测试

### iOS Safari
1. 打开 Settings > Safari > Advanced
2. 启用 Web Inspector
3. 连接到 Mac 进行调试

### Android Chrome
1. 启用 USB 调试
2. 在 Chrome 中访问 `chrome://inspect`
3. 选择设备进行调试

## 🎨 颜色对比度检查

确保文字在背景上清晰可见：

```javascript
// 检查对比度
function getContrastRatio(hex1, hex2) {
    // 简化的对比度计算
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

console.log('对比度:', getContrastRatio('#1E293B', '#F8FAFC'));
// 应该 >= 4.5 (WCAG AA 标准)
```

## 🚀 快速修复脚本

如果所有方法都失败，运行：

```bash
# 1. 重启服务器
cd /Users/wen/Desktop/code/21word/web
python3 -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload

# 2. 清除浏览器缓存并硬刷新
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R

# 3. 如果还是不行，清除所有缓存
# Chrome > Settings > Privacy and security > Clear browsing data
```

## 📞 获取帮助

如果问题仍然存在：

1. 访问 http://localhost:8002/diagnose
2. 截图诊断页面的信息
3. 在浏览器 Console 中运行 `console.log(navigator.userAgent)`
4. 提供这些信息以便进一步排查
