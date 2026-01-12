// 全局变量
let selectedTemplateId = null;
let selectedFile = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadTemplates();
    setupFileUpload();
    setupConvertButton();
});

// 加载模板列表
async function loadTemplates() {
    try {
        const response = await fetch('/api/templates');
        const result = await response.json();

        if (result.success) {
            renderTemplates(result.data);
        }
    } catch (error) {
        console.error('加载模板失败:', error);
        showError('加载模板失败，请刷新页面重试');
    }
}

// 渲染模板列表
function renderTemplates(templates) {
    const templateList = document.getElementById('templateList');

    if (templates.length === 0) {
        templateList.innerHTML = '<li class="template-item">暂无模板，请先到模板管理页面上传</li>';
        return;
    }

    templateList.innerHTML = templates.map((template, index) => {
        const isSelected = template.is_default || (index === 0 && !selectedTemplateId);
        if (isSelected && !selectedTemplateId) {
            selectedTemplateId = template.id;
        }

        const updateDate = new Date(template.updated_at).toLocaleDateString('zh-CN');
        const defaultMark = template.is_default ? '⭐' : '';

        return `
            <li class="template-item ${isSelected ? 'selected' : ''}" data-id="${template.id}">
                <div class="template-name">${defaultMark} ${template.name}</div>
                <div class="template-update">更新: ${updateDate}</div>
                <div class="check-icon">✓</div>
            </li>
        `;
    }).join('');

    // 绑定点击事件
    document.querySelectorAll('.template-item').forEach(item => {
        item.addEventListener('click', function() {
            selectTemplate(this.dataset.id);
        });
    });
}

// 选择模板
function selectTemplate(templateId) {
    selectedTemplateId = templateId;

    // 更新UI
    document.querySelectorAll('.template-item').forEach(item => {
        if (item.dataset.id === templateId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    updateConvertButton();
}

// 设置文件上传
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f0f2ff';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f8f9ff';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f8f9ff';

        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    });
}

// 处理文件选择
function handleFileSelect(file) {
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
        showError('请选择.docx格式的Word文档');
        return;
    }

    selectedFile = file;

    // 更新UI
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.classList.add('has-file');
    document.getElementById('fileInfo').textContent = `已选择: ${file.name}`;
    document.querySelector('.upload-text').textContent = '点击重新选择文件';

    updateConvertButton();
}

// 设置转换按钮
function setupConvertButton() {
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    convertBtn.addEventListener('click', startConversion);
    downloadBtn.addEventListener('click', downloadFile);
}

// 更新转换按钮状态
function updateConvertButton() {
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.disabled = !(selectedTemplateId && selectedFile);
}

// 开始转换
async function startConversion() {
    if (!selectedTemplateId || !selectedFile) {
        showError('请先选择模板和上传文件');
        return;
    }

    // 显示进度
    showProgress();

    // 准备表单数据
    const formData = new FormData();
    formData.append('template_id', selectedTemplateId);
    formData.append('file', selectedFile);

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // 更新进度
            updateProgress(100, '转换完成！');

            // 显示结果
            setTimeout(() => {
                showResult(result.data);
            }, 500);
        } else {
            showError('转换失败: ' + result.message);
        }
    } catch (error) {
        console.error('转换失败:', error);
        showError('转换失败，请重试');
    }
}

// 显示进度
function showProgress() {
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('resultContainer').style.display = 'none';
    document.getElementById('convertBtn').disabled = true;

    // 模拟进度
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress < 90) {
            updateProgress(progress, '正在转换...');
        } else {
            clearInterval(interval);
        }
    }, 200);
}

// 更新进度
function updateProgress(progress, text) {
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressFill').textContent = progress + '%';
    document.getElementById('progressText').textContent = text;
}

// 显示结果
function showResult(data) {
    const resultContainer = document.getElementById('resultContainer');
    const resultTitle = document.getElementById('resultTitle');
    const resultInfo = document.getElementById('resultInfo');
    const similarityScore = document.getElementById('similarityScore');
    const downloadBtn = document.getElementById('downloadBtn');

    resultContainer.className = 'result-container result-success';
    resultContainer.style.display = 'block';

    resultTitle.textContent = '✅ 转换完成！';
    resultInfo.textContent = `输出文件: ${data.output_filename}`;

    const similarity = (data.similarity * 100).toFixed(1);
    similarityScore.textContent = `相似度: ${similarity}%`;

    // 设置下载链接
    downloadBtn.onclick = () => {
        window.location.href = data.download_url;
        // 下载后重置页面
        setTimeout(() => {
            location.reload();
        }, 1000);
    };

    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('convertBtn').disabled = false;
}

// 显示错误
function showError(message) {
    const resultContainer = document.getElementById('resultContainer');
    const resultTitle = document.getElementById('resultTitle');
    const resultInfo = document.getElementById('resultInfo');

    resultContainer.className = 'result-container result-error';
    resultContainer.style.display = 'block';

    resultTitle.textContent = '❌ 转换失败';
    resultInfo.textContent = message;

    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('convertBtn').disabled = false;
    document.getElementById('similarityScore').textContent = '';
    document.getElementById('downloadBtn').style.display = 'none';
}

// 下载文件
function downloadFile() {
    // 下载逻辑已在showResult中设置
}
