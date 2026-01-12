// 整合的单页应用JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 初始化标签页切换
    initTabs();

    // 初始化各个功能模块
    initConvertTab();
    initHistoryTab();
    initCompareTab();
});

// 标签页切换功能
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            // 移除所有active类
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 添加active类到当前标签
            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            // 设置页面类型，用于CSS样式控制
            document.body.setAttribute('data-page', targetTab);

            // 切换到对应标签时加载数据
            if (targetTab === 'history') {
                loadHistory();
            }
        });
    });

    // 初始化：设置默认页面类型
    document.body.setAttribute('data-page', 'convert');
}

// ==================== 文档转换功能 ====================
let selectedTemplateId = null;

function initConvertTab() {
    loadConvertTemplates();
    setupFileUpload();
    setupConvertButton();
    setupUploadModal();
}

async function loadConvertTemplates() {
    try {
        const response = await fetch('/api/templates');
        const result = await response.json();

        if (result.success) {
            renderConvertTemplates(result.data);
        }
    } catch (error) {
        console.error('加载模板失败:', error);
    }
}

function renderConvertTemplates(templates) {
    const templateList = document.getElementById('templateList');

    if (templates.length === 0) {
        templateList.innerHTML = '<li class="template-item">暂无模板，请先上传模板</li>';
        return;
    }

    templateList.innerHTML = templates.map(template => `
        <li class="template-item ${template.is_default ? 'selected' : ''}"
            data-id="${template.id}">
            <div class="template-item-content" onclick="selectTemplate('${template.id}')">
                <div class="template-item-name">${template.name}</div>
                ${template.is_default ? '<div class="template-default-badge">默认</div>' : ''}
            </div>
            <div class="template-item-actions">
                <button class="btn-icon btn-sm" onclick="event.stopPropagation(); editTemplateName('${template.id}', '${template.name}')" title="编辑名称">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </button>
                ${!template.is_default ? `
                    <button class="btn-icon btn-sm" onclick="event.stopPropagation(); setDefaultTemplate('${template.id}')" title="设为默认">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                        </svg>
                    </button>
                ` : ''}
                <button class="btn-icon btn-sm btn-delete" onclick="event.stopPropagation(); deleteTemplate('${template.id}')" title="删除">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </li>
    `).join('');

    // 自动选中默认模板
    const defaultTemplate = templates.find(t => t.is_default);
    if (defaultTemplate) {
        selectTemplate(defaultTemplate.id);
    }
}

function selectTemplate(templateId) {
    selectedTemplateId = templateId;

    console.log('[DEBUG] 模板已选择，ID:', templateId);

    // 更新UI
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.id === templateId) {
            item.classList.add('selected');
        }
    });

    updateConvertButton();
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');

    // 点击上传
    uploadArea.addEventListener('click', () => fileInput.click());

    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect();
        }
    });

    function handleFileSelect() {
        const file = fileInput.files[0];
        if (file) {
            fileInfo.textContent = `已选择: ${file.name}`;

            console.log('[DEBUG] 文件已选择:', file.name);
            console.log('[DEBUG] 当前选择的模板ID:', selectedTemplateId);

            // 如果已选择模板，自动开始转换
            if (selectedTemplateId) {
                console.log('[DEBUG] 模板已选择，开始自动转换');
                updateConvertButton();
                // 自动触发转换
                convertDocument(file);
            } else {
                console.log('[DEBUG] 未选择模板，等待用户选择');
                updateConvertButton();
            }
        }
    }
}

function updateConvertButton() {
    const fileInput = document.getElementById('fileInput');
    const convertBtn = document.getElementById('convertBtn');

    // 如果按钮不存在（自动转换模式），直接返回
    if (!convertBtn) {
        return;
    }

    if (selectedTemplateId && fileInput.files.length > 0) {
        convertBtn.disabled = false;
    } else {
        convertBtn.disabled = true;
    }
}

function setupConvertButton() {
    const convertBtn = document.getElementById('convertBtn');

    // 如果按钮不存在（已移除自动转换功能），直接返回
    if (!convertBtn) {
        console.log('[DEBUG] convertBtn 不存在，已启用自动转换模式');
        return;
    }

    convertBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('fileInput');

        if (!selectedTemplateId || fileInput.files.length === 0) {
            alert('请先选择模板和文件');
            return;
        }

        const file = fileInput.files[0];
        await convertDocument(file);
    });
}

async function convertDocument(file) {
    const formData = new FormData();
    formData.append('template_id', selectedTemplateId);
    formData.append('file', file);

    const progressContainer = document.getElementById('progressContainer');
    const resultContainer = document.getElementById('resultContainer');
    const convertBtn = document.getElementById('convertBtn');

    try {
        // 如果convertBtn存在，则禁用它
        if (convertBtn) {
            convertBtn.disabled = true;
        }

        if (progressContainer) {
            progressContainer.style.display = 'block';
            // 更新进度文本为"正在转换"
            const progressText = document.getElementById('progressText');
            const progressFill = document.getElementById('progressFill');
            if (progressText) {
                progressText.textContent = '正在转换...';
            }
            if (progressFill) {
                progressFill.textContent = '正在转换';
                progressFill.style.width = '100%';
            }
        }

        if (resultContainer) {
            resultContainer.style.display = 'none';
        }

        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
            showResult(result.data);
        } else {
            alert('转换失败: ' + (result.message || '未知错误'));
            if (convertBtn) {
                convertBtn.disabled = false;
            }
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('转换失败:', error);
        alert('转换失败: ' + error.message);
        if (convertBtn) {
            convertBtn.disabled = false;
        }
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }
}

function showResult(data) {
    const progressContainer = document.getElementById('progressContainer');
    const resultContainer = document.getElementById('resultContainer');
    const resultTitle = document.getElementById('resultTitle');
    const resultInfo = document.getElementById('resultInfo');
    const similarityScore = document.getElementById('similarityScore');
    const convertBtn = document.getElementById('convertBtn');

    // 隐藏进度，显示结果
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }

    if (resultContainer) {
        resultContainer.style.display = 'block';
        resultContainer.classList.add('result-success');
    }

    // 如果convertBtn存在，则启用它
    if (convertBtn) {
        convertBtn.disabled = false;
    }

    // 设置结果信息
    if (resultTitle) {
        resultTitle.textContent = '✅ 转换完成！';
    }

    if (resultInfo) {
        resultInfo.innerHTML = `
            文件名: <strong>${data.output_filename}</strong>
        `;
    }

    if (similarityScore) {
        similarityScore.textContent = `格式相似度: ${(data.similarity * 100).toFixed(1)}%`;

        // 相似度颜色
        if (data.similarity >= 0.9) {
            similarityScore.style.color = 'var(--success)';
        } else if (data.similarity >= 0.7) {
            similarityScore.style.color = 'var(--warning)';
        } else {
            similarityScore.style.color = 'var(--error)';
        }
    }

    // 自动触发下载
    setTimeout(() => {
        window.location.href = data.download_url;
    }, 1000);
}

// ==================== 模板管理功能 ====================
async function editTemplateName(templateId, currentName) {
    const newName = prompt('请输入新的模板名称:', currentName);

    if (newName === null) return;

    const trimmedName = newName.trim();
    if (!trimmedName) {
        alert('模板名称不能为空');
        return;
    }

    if (trimmedName === currentName) return;

    try {
        const response = await fetch(`/api/templates/${templateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmedName })
        });

        const result = await response.json();

        if (result.success) {
            alert('修改成功！');
            loadConvertTemplates(); // 刷新转换页面的模板列表
        } else {
            alert('修改失败: ' + result.message);
        }
    } catch (error) {
        console.error('修改失败:', error);
        alert('修改失败，请重试');
    }
}

async function setDefaultTemplate(templateId) {
    if (!confirm('确定要设为默认模板吗？')) return;

    try {
        const response = await fetch(`/api/templates/${templateId}/default`, {
            method: 'PUT'
        });

        const result = await response.json();

        if (result.success) {
            alert('设置成功！');
            loadConvertTemplates();
        } else {
            alert('设置失败: ' + result.message);
        }
    } catch (error) {
        console.error('设置失败:', error);
        alert('设置失败，请重试');
    }
}

async function downloadTemplate(templateId) {
    try {
        // 直接使用 window.location 触发下载
        window.location.href = `/api/templates/${templateId}/download`;
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
}

async function deleteTemplate(templateId) {
    if (!confirm('确定要删除这个模板吗？删除后无法恢复！')) return;

    try {
        const response = await fetch(`/api/templates/${templateId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert('删除成功！');
            loadConvertTemplates();
        } else {
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试');
    }
}

function setupUploadModal() {
    const addTemplateBtn = document.getElementById('addTemplateBtn');
    const uploadModal = document.getElementById('uploadModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const uploadForm = document.getElementById('uploadForm');

    // 如果上传按钮不存在，跳过事件绑定
    if (!addTemplateBtn) {
        console.log('[DEBUG] addTemplateBtn 不存在，跳过上传按钮事件绑定');
        return;
    }

    addTemplateBtn.addEventListener('click', () => {
        uploadModal.style.display = 'flex';
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            uploadModal.style.display = 'none';
            if (uploadForm) uploadForm.reset();
        });
    }

    if (uploadModal) {
        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) {
                uploadModal.style.display = 'none';
                if (uploadForm) uploadForm.reset();
            }
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await uploadTemplate();
        });
    }

    // 文件选择时自动填充模板名称
    const fileInput = document.getElementById('templateFile');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const name = file.name.replace(/\.docx$/i, '');
                const templateNameInput = document.getElementById('templateName');
                if (templateNameInput) {
                    templateNameInput.value = name;
                }
            }
        });
    }
}

async function uploadTemplate() {
    const name = document.getElementById('templateName').value.trim();
    const file = document.getElementById('templateFile').files[0];
    const isDefault = document.getElementById('isDefault').checked;

    if (!name) {
        alert('请输入模板名称');
        return;
    }

    if (!file) {
        alert('请选择模板文件');
        return;
    }

    if (!file.name.endsWith('.docx')) {
        alert('仅支持.docx格式的文件');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    formData.append('is_default', isDefault);

    try {
        const response = await fetch('/api/templates/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('上传成功！');
            document.getElementById('uploadModal').style.display = 'none';
            document.getElementById('uploadForm').reset();
            loadConvertTemplates();
        } else {
            alert('上传失败: ' + result.message);
        }
    } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败，请重试');
    }
}

function showError(message) {
    const templateList = document.getElementById('templateManageList');
    templateList.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
            <div style="font-size: 4em;">⚠️</div>
            <p>${message}</p>
        </div>
    `;
}

// ==================== 转换历史功能 ====================
function initHistoryTab() {
    loadHistory();
}

async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const result = await response.json();

        if (result.success) {
            renderStats(result.data);
            renderHistory(result.data.conversions);
        }
    } catch (error) {
        console.error('加载历史记录失败:', error);
        showErrorHistory('加载失败，请刷新页面重试');
    }
}

function renderStats(data) {
    document.getElementById('totalCount').textContent = data.total_count;
}

function renderHistory(conversions) {
    const historyList = document.getElementById('historyList');

    if (conversions.length === 0) {
        historyList.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #666;">
                <div style="font-size: 4em;">📭</div>
                <p>暂无转换记录</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>转换时间</th>
                    <th>使用模板</th>
                    <th>文件名</th>
                    <th>文件大小</th>
                    <th>相似度</th>
                    <th>处理耗时</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                ${conversions.map(record => {
                    const date = new Date(record.timestamp);
                    const timeStr = date.toLocaleString('zh-CN');
                    const fileSize = formatFileSize(record.file_size);
                    const similarity = (record.similarity * 100).toFixed(1);
                    const processingTime = record.processing_time.toFixed(3);

                    let similarityClass = 'similarity-high';
                    if (record.similarity < 0.7) similarityClass = 'similarity-low';
                    else if (record.similarity < 0.9) similarityClass = 'similarity-medium';

                    const fileName = record.masked_filename || '***.docx';

                    return `
                        <tr>
                            <td>${timeStr}</td>
                            <td>${record.template_name}</td>
                            <td>${fileName}</td>
                            <td>${fileSize}</td>
                            <td class="${similarityClass}">${similarity}%</td>
                            <td>${processingTime}秒</td>
                            <td><span class="badge badge-success">✅ 成功</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showErrorHistory(message) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = `
        <div style="text-align: center; padding: 60px; color: #666;">
            <div style="font-size: 4em;">⚠️</div>
            <p>${message}</p>
        </div>
    `;
}

// ===== 相似度比较功能 =====
function initCompareTab() {
    const compareUpload1 = document.getElementById('compareUpload1');
    const compareUpload2 = document.getElementById('compareUpload2');
    const compareFile1 = document.getElementById('compareFile1');
    const compareFile2 = document.getElementById('compareFile2');
    const compareBtn = document.getElementById('compareBtn');

    // 如果相似度比较功能的元素不存在，直接返回
    if (!compareUpload1 || !compareUpload2 || !compareFile1 || !compareFile2) {
        console.log('[DEBUG] 相似度比较功能元素不存在，跳过初始化');
        return;
    }

    let file1Selected = false;
    let file2Selected = false;

    // 点击上传区域1触发文件选择
    compareUpload1.addEventListener('click', () => {
        compareFile1.click();
    });

    // 点击上传区域2触发文件选择
    compareUpload2.addEventListener('click', () => {
        compareFile2.click();
    });

    // 文件1选择
    compareFile1.addEventListener('change', () => {
        const file = compareFile1.files[0];
        if (file) {
            const fileInfo1 = document.getElementById('compareFileInfo1');
            if (fileInfo1) {
                fileInfo1.textContent = `已选择: ${file.name}`;
                fileInfo1.style.color = 'var(--success)';
            }
            file1Selected = true;
            updateCompareButton();
        }
    });

    // 文件2选择
    compareFile2.addEventListener('change', () => {
        const file = compareFile2.files[0];
        if (file) {
            const fileInfo2 = document.getElementById('compareFileInfo2');
            if (fileInfo2) {
                fileInfo2.textContent = `已选择: ${file.name}`;
                fileInfo2.style.color = 'var(--success)';
            }
            file2Selected = true;
            updateCompareButton();
        }
    });

    function updateCompareButton() {
        if (compareBtn) {
            compareBtn.disabled = !(file1Selected && file2Selected);
        }
    }

    // 点击比较按钮
    if (compareBtn) {
        compareBtn.addEventListener('click', async () => {
            if (!file1Selected || !file2Selected) {
                alert('请先选择两个文档');
                return;
            }

            await compareDocuments();
        });
    }
}

function setupDragDrop(uploadArea, fileInput, onFileSelect) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            onFileSelect(files[0]);
        }
    });
}

function displayCompareResult(data) {
    const resultDiv = document.getElementById('compareResult');
    const contentDiv = document.getElementById('compareResultContent');

    resultDiv.classList.add('show');

    // 获取相似度等级
    const similarity = data.overall_similarity;
    const similarityPercent = (similarity * 100).toFixed(1);
    let similarityClass = 'similarity-low';
    if (similarity >= 0.9) similarityClass = 'similarity-high';
    else if (similarity >= 0.7) similarityClass = 'similarity-medium';

    // 文件说明映射 - 小白友好的详细说明
    const fileDescriptions = {
        'document.xml': '📄 存储文档的所有内容：文字、段落、标题、表格、图片等。这是文档的核心文件。',
        'styles.xml': '🎨 定义所有样式：标题1/2/3、正文、字体、颜色、字号、间距等。决定文档长什么样。',
        'settings.xml': '⚙️ 文档的全局设置：默认字体、页面大小、页边距、行距等基本配置。',
        'numbering.xml': '🔢 自动编号规则：如"1.1.1"、"一、二、三"、项目符号等编号格式。',
        'fontTable.xml': '🔤 记录文档中使用的所有字体名称，确保在其他电脑上能正确显示字体。',
        'theme/theme1.xml': '🌈 主题配色方案：定义文档的配色组合，包括标题、正文、背景等颜色。',
        'webSettings.xml': '🌐 Web视图设置：文档在浏览器中打开时的显示方式。'
    };

    // 构建文件比较表格
    let fileComparisonsHtml = '';
    for (const [filePath, comparison] of Object.entries(data.file_comparisons)) {
        const isIdentical = comparison.identical;
        const fileSimilarity = comparison.similarity ? (comparison.similarity * 100).toFixed(1) + '%' : '-';
        const statusBadge = isIdentical
            ? '<span class="similarity-badge similarity-high">相同</span>'
            : comparison.similarity
                ? `<span class="similarity-badge ${similarityClass}">${fileSimilarity}</span>`
                : '<span class="similarity-badge similarity-low">不同</span>';

        // 获取文件说明，始终使用预定义的详细说明，不使用reason
        const fileName = filePath.split('/').pop();
        const description = fileDescriptions[fileName] || fileDescriptions[filePath] || '📄 Word文档格式文件';

        fileComparisonsHtml += `
            <tr>
                <td><code style="font-size: 0.9em;">${fileName}</code></td>
                <td>${description}</td>
                <td style="text-align: center;">${statusBadge}</td>
            </tr>
        `;
    }

    contentDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 3em; margin-bottom: 12px;">
                ${similarity >= 0.9 ? '✅' : similarity >= 0.7 ? '⚠️' : '❌'}
            </div>
            <div style="font-size: 2em; font-weight: 700; margin-bottom: 8px;">
                整体相似度: ${similarityPercent}%
            </div>
            <div style="color: var(--text-secondary);">
                ${similarity >= 0.9 ? '格式高度一致' : similarity >= 0.7 ? '格式基本一致' : '格式差异较大'}
            </div>
        </div>

        <h4 style="margin: 24px 0 16px; font-family: 'Space Grotesk', sans-serif; font-size: 1.2em;">
            📁 格式文件对比详情
        </h4>

        <table class="comparison-table">
            <thead>
                <tr>
                    <th style="width: 25%;">文件</th>
                    <th style="width: 55%;">说明</th>
                    <th style="width: 20%; text-align: center;">相似度</th>
                </tr>
            </thead>
            <tbody>
                ${fileComparisonsHtml}
            </tbody>
        </table>

        ${data.content_consistent ? '' : `
            <div style="margin-top: 16px; padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border-left: 4px solid var(--warning);">
                <strong>注意:</strong> 两个文档的内容不同，相似度仅反映格式文件的匹配程度。
            </div>
        `}
    `;
}

// 新增：文档对比功能
async function compareDocuments() {
    const compareFile1 = document.getElementById('compareFile1');
    const compareFile2 = document.getElementById('compareFile2');
    const compareBtn = document.getElementById('compareBtn');
    const compareResult = document.getElementById('compareResult');
    const compareDiffView = document.getElementById('compareDiffView');

    if (!compareFile1.files[0] || !compareFile2.files[0]) {
        alert('请先选择两个文档');
        return;
    }

    // 禁用按钮，显示加载状态
    compareBtn.disabled = true;
    compareBtn.textContent = '正在比较...';

    try {
        const formData = new FormData();
        formData.append('file1', compareFile1.files[0]);
        formData.append('file2', compareFile2.files[0]);

        // 首先进行格式相似度比较
        const compareResponse = await fetch('/api/compare', {
            method: 'POST',
            body: formData
        });

        if (!compareResponse.ok) {
            throw new Error('比较失败');
        }

        const compareData = await compareResponse.json();
        displayCompareResult(compareData.data);

        // 解析两个文档用于显示内容对比
        const parseFormData1 = new FormData();
        parseFormData1.append('file', compareFile1.files[0]);

        const parseFormData2 = new FormData();
        parseFormData2.append('file', compareFile2.files[0]);

        const [parseResponse1, parseResponse2] = await Promise.all([
            fetch('/api/parse-docx', { method: 'POST', body: parseFormData1 }),
            fetch('/api/parse-docx', { method: 'POST', body: parseFormData2 })
        ]);

        if (!parseResponse1.ok || !parseResponse2.ok) {
            throw new Error('解析文档失败');
        }

        const doc1Data = (await parseResponse1.json()).data;
        const doc2Data = (await parseResponse2.json()).data;

        // 显示左右对比视图
        displayDiffView(doc1Data, doc2Data);

    } catch (error) {
        console.error('比较失败:', error);
        alert('比较失败: ' + error.message);
    } finally {
        compareBtn.disabled = false;
        compareBtn.textContent = '开始比较';
    }
}

function displayDiffView(doc1Data, doc2Data) {
    const compareDiffView = document.getElementById('compareDiffView');
    const diffFilename1 = document.getElementById('diffFilename1');
    const diffFilename2 = document.getElementById('diffFilename2');
    const diffCount1 = document.getElementById('diffCount1');
    const diffCount2 = document.getElementById('diffCount2');
    const diffContent1 = document.getElementById('diffContent1');
    const diffContent2 = document.getElementById('diffContent2');

    // 设置文件名和段落数
    diffFilename1.textContent = doc1Data.filename;
    diffFilename2.textContent = doc2Data.filename;
    diffCount1.textContent = `${doc1Data.total_paragraphs} 段`;
    diffCount2.textContent = `${doc2Data.total_paragraphs} 段`;

    // 计算段落差异
    const paragraphs1 = doc1Data.paragraphs;
    const paragraphs2 = doc2Data.paragraphs;

    // 使用简单的算法对齐段落
    const maxParagraphs = Math.max(paragraphs1.length, paragraphs2.length);
    const aligned1 = [];
    const aligned2 = [];

    for (let i = 0; i < maxParagraphs; i++) {
        const para1 = paragraphs1[i];
        const para2 = paragraphs2[i];

        if (para1 && para2) {
            // 两个文档都有这个段落
            const textSame = para1.text === para2.text;
            const styleSame = para1.style_id === para2.style_id;

            // 检查其他格式属性
            const tabSame = (para1.tab_count || 0) === (para2.tab_count || 0);
            const brSame = (para1.br_count || 0) === (para2.br_count || 0);
            const indentSame = JSON.stringify(para1.indent) === JSON.stringify(para2.indent);
            const jcSame = (para1.jc || '') === (para2.jc || '');
            const spacingSame = JSON.stringify(para1.spacing) === JSON.stringify(para2.spacing);

            // 收集所有差异
            const differences = [];

            if (styleSame && textSame && tabSame && brSame && indentSame && jcSame && spacingSame) {
                // 完全相同
                aligned1.push({ ...para1, status: 'unchanged' });
                aligned2.push({ ...para2, status: 'unchanged' });
            } else {
                // 有差异
                const diffData = {
                    ...para1,
                    status: textSame ? 'modified' : 'modified',
                    text_diff: !textSame,
                    style_diff: !styleSame,
                    tab_diff: !tabSame,
                    br_diff: !brSame,
                    indent_diff: !indentSame,
                    jc_diff: !jcSame,
                    spacing_diff: !spacingSame,
                };

                // 添加具体的差异值用于显示
                if (!styleSame) {
                    diffData.style_id_diff = para1.style_id || '无样式';
                    diffData.other_style_id = para2.style_id || '无样式';
                }
                if (!tabSame) {
                    diffData.tab_count_diff = para1.tab_count || 0;
                    diffData.other_tab_count = para2.tab_count || 0;
                }
                if (!brSame) {
                    diffData.br_count_diff = para1.br_count || 0;
                    diffData.other_br_count = para2.br_count || 0;
                }
                if (!jcSame) {
                    diffData.jc_diff = para1.jc || '默认';
                    diffData.other_jc = para2.jc || '默认';
                }

                aligned1.push({ ...diffData });

                // 为对侧创建对应的差异信息
                aligned2.push({
                    ...para2,
                    status: textSame ? 'modified' : 'modified',
                    text_diff: !textSame,
                    style_diff: !styleSame,
                    tab_diff: !tabSame,
                    br_diff: !brSame,
                    indent_diff: !indentSame,
                    jc_diff: !jcSame,
                    spacing_diff: !spacingSame,
                    style_id_diff: para2.style_id || '无样式',
                    other_style_id: para1.style_id || '无样式',
                    tab_count_diff: para2.tab_count || 0,
                    other_tab_count: para1.tab_count || 0,
                    br_count_diff: para2.br_count || 0,
                    other_br_count: para1.br_count || 0,
                    jc_diff: para2.jc || '默认',
                    other_jc: para1.jc || '默认',
                });
            }
        } else if (para1) {
            // 只有文档1有
            aligned1.push({ ...para1, status: 'removed' });
            aligned2.push(null);
        } else if (para2) {
            // 只有文档2有
            aligned1.push(null);
            aligned2.push({ ...para2, status: 'added' });
        }
    }

    // 渲染段落
    diffContent1.innerHTML = renderParagraphs(aligned1, 'left');
    diffContent2.innerHTML = renderParagraphs(aligned2, 'right');

    // 计算并显示统计信息
    updateDiffStatistics(aligned1, aligned2);

    // 显示对比视图
    compareDiffView.style.display = 'block';

    // 初始化对比视图功能
    initDiffViewFeatures();
}

function renderParagraphs(paragraphs, side) {
    return paragraphs.map((para, index) => {
        if (!para) {
            return `<div class="diff-paragraph diff-empty" data-index="${index}"></div>`;
        }

        const statusClass = para.status || 'unchanged';
        const statusInfo = getStatusInfo(statusClass, side);

        // 生成格式说明（小白友好）
        const formatNotes = getFormatNotes(para, side);

        return `
            <div class="diff-paragraph diff-${statusClass}" data-index="${index}">
                <div class="diff-paragraph-main">
                    <span class="diff-paragraph-number">${index + 1}</span>
                    <span class="diff-paragraph-text">${escapeHtml(para.text)}</span>
                </div>
                ${formatNotes ? `<div class="diff-paragraph-notes">${formatNotes}</div>` : ''}
            </div>
        `;
    }).join('');
}

function getStatusInfo(status, side) {
    const sideText = side === 'left' ? '文档1' : '文档2';

    switch (status) {
        case 'added':
            return {
                icon: '➕',
                label: '新增',
                tooltip: `${sideText}中新增的内容`,
                explanation: side === 'right' ? '此段落仅存在于文档2中' : ''
            };
        case 'removed':
            return {
                icon: '➖',
                label: '删除',
                tooltip: `${sideText}中被删除的内容`,
                explanation: side === 'left' ? '此段落仅存在于文档1中' : ''
            };
        case 'modified':
            return {
                icon: '✏️',
                label: '修改',
                tooltip: `${sideText}中内容或样式发生变化`,
                explanation: '此段落的内容或格式有所不同'
            };
        default:
            return {
                icon: '',
                label: '相同',
                tooltip: '两个文档中完全相同',
                explanation: ''
            };
    }
}

// 为Word小白生成格式说明
function getFormatNotes(para, side) {
    const notes = [];
    const sideText = side === 'left' ? '左文档' : '右文档';

    // 如果有样式ID，用简单的话解释
    if (para.style_id) {
        notes.push(`📝 格式：样式"${para.style_id}"`);
    }

    // 根据状态添加说明
    if (para.status === 'added') {
        notes.push(side === 'right' ? '✨ 这是新增的段落' : '（此段落在对侧被删除）');
    } else if (para.status === 'removed') {
        notes.push(side === 'left' ? '🗑️ 这是被删除的段落' : '（此段落在对侧被新增）');
    } else if (para.status === 'modified') {
        // 对于修改的段落，显示更详细的差异信息
        const differences = [];

        if (para.text_diff) {
            differences.push(`文字内容不同`);
        }

        // 检查样式差异 - 只显示当前文档的样式
        if (para.style_diff && para.style_id_diff !== undefined) {
            differences.push(`样式"${para.style_id_diff}"不同`);
        }

        // 检查制表符差异 - 显示当前文档的制表符数量
        if (para.tab_diff && para.tab_count_diff !== undefined) {
            differences.push(`制表符数量：${para.tab_count_diff}`);
        }

        // 检查换行符差异 - 显示当前文档的换行符数量
        if (para.br_diff && para.br_count_diff !== undefined) {
            differences.push(`换行符数量：${para.br_count_diff}`);
        }

        // 检查对齐方式差异 - 显示当前文档的对齐方式
        if (para.jc_diff && para.jc_diff !== undefined) {
            const jcMap = {
                'left': '左对齐',
                'right': '右对齐',
                'center': '居中',
                'both': '两端对齐',
                '': '默认',
                null: '默认'
            };
            const jcText = jcMap[para.jc_diff] || para.jc_diff || '默认';
            differences.push(`对齐方式：${jcText}`);
        }

        // 检查缩进差异
        if (para.indent_diff) {
            differences.push(`段落缩进不同`);
        }

        // 检查间距差异
        if (para.spacing_diff) {
            differences.push(`段落间距不同`);
        }

        if (differences.length > 0) {
            notes.push(`⚠️ ${differences.join('；')}`);
        }
    }

    return notes.length > 0 ? notes.join(' · ') : '';
}

function escapeHtml(text) {
    // 先转义HTML特殊字符以防止XSS
    const div = document.createElement('div');
    div.textContent = text;
    let escapedText = div.innerHTML;

    // 然后将转义后的空白字符替换为带颜色的HTML标签
    // 注意：需要匹配转义后的空格（&#32; 或直接空格）
    return escapedText
        // 空格替换为带颜色的标签
        .replace(/ /g, '<span class="whitespace-space">[空格]</span>')
        // 制表符（转义后仍是\t，需要用字符代码）
        .replace(/\t/g, '<span class="whitespace-tab">[制表符]</span>')
        // 不换行空格（转义后为&#160;）
        .replace(/&#160;/g, '<span class="whitespace-nbsp">[不换行空格]</span>')
        // 其他空白字符
        .replace(/&#8195;/g, '<span class="whitespace-em">[em空格]</span>')
        .replace(/&#8201;/g, '<span class="whitespace-thin">[窄空格]</span>');
}

function updateDiffStatistics(aligned1, aligned2) {
    // 统计各类差异的数量
    let added = 0, removed = 0, modified = 0, unchanged = 0;

    for (let i = 0; i < Math.max(aligned1.length, aligned2.length); i++) {
        const para1 = aligned1[i];
        const para2 = aligned2[i];

        // 统计新增（仅在文档2中）
        if (!para1 && para2 && para2.status === 'added') {
            added++;
        }
        // 统计删除（仅在文档1中）
        else if (para1 && !para2 && para1.status === 'removed') {
            removed++;
        }
        // 统计修改和相同
        else if (para1 && para2) {
            if (para1.status === 'modified' || para2.status === 'modified') {
                modified++;
            } else if (para1.status === 'unchanged' && para2.status === 'unchanged') {
                unchanged++;
            }
        }
    }

    // 更新统计显示
    document.getElementById('statAdded').textContent = added;
    document.getElementById('statRemoved').textContent = removed;
    document.getElementById('statModified').textContent = modified;
    document.getElementById('statUnchanged').textContent = unchanged;

    // 添加动画效果
    const statElements = document.querySelectorAll('.diff-stat-value');
    statElements.forEach(el => {
        const targetValue = parseInt(el.textContent);
        animateValue(el, 0, targetValue, 500);
    });
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

function initDiffViewFeatures() {
    // 仅显示差异按钮
    const toggleDiffOnly = document.getElementById('toggleDiffOnly');
    const compareDiffView = document.getElementById('compareDiffView');

    if (toggleDiffOnly) {
        // 初始化：默认勾选，立即应用
        if (toggleDiffOnly.checked) {
            compareDiffView.classList.add('show-diffs-only');
        }

        // 监听复选框变化
        toggleDiffOnly.addEventListener('change', () => {
            if (toggleDiffOnly.checked) {
                compareDiffView.classList.add('show-diffs-only');
            } else {
                compareDiffView.classList.remove('show-diffs-only');
            }
        });
    }

    // 同步滚动复选框
    const syncScrollCheckbox = document.getElementById('syncScroll');

    if (syncScrollCheckbox) {
        // 初始化：默认勾选，立即启用
        if (syncScrollCheckbox.checked) {
            enableSyncScroll();
        }

        // 监听复选框变化
        syncScrollCheckbox.addEventListener('change', () => {
            if (syncScrollCheckbox.checked) {
                enableSyncScroll();
            } else {
                disableSyncScroll();
            }
        });
    }

    // 拖动分隔条调整宽度
    initResizer();
}

function enableSyncScroll() {
    const diffContent1 = document.getElementById('diffContent1');
    const diffContent2 = document.getElementById('diffContent2');

    let isSyncing = false;

    diffContent1.addEventListener('scroll', () => {
        if (!isSyncing) {
            isSyncing = true;
            diffContent2.scrollTop = diffContent1.scrollTop;
            setTimeout(() => isSyncing = false, 50);
        }
    });

    diffContent2.addEventListener('scroll', () => {
        if (!isSyncing) {
            isSyncing = true;
            diffContent1.scrollTop = diffContent2.scrollTop;
            setTimeout(() => isSyncing = false, 50);
        }
    });
}

function disableSyncScroll() {
    const diffContent1 = document.getElementById('diffContent1');
    const diffContent2 = document.getElementById('diffContent2');

    // 移除事件监听器（通过克隆元素）
    const newContent1 = diffContent1.cloneNode(true);
    const newContent2 = diffContent2.cloneNode(true);

    diffContent1.parentNode.replaceChild(newContent1, diffContent1);
    diffContent2.parentNode.replaceChild(newContent2, diffContent2);
}

function initResizer() {
    const resizer = document.getElementById('diffResizer');
    const diffPanel1 = document.getElementById('diffPanel1');
    const diffPanel2 = document.getElementById('diffPanel2');
    const diffContainer = document.getElementById('diffContainer');

    if (!resizer || !diffPanel1 || !diffPanel2) return;

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizer.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerRect = diffContainer.getBoundingClientRect();
        const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        if (percentage > 20 && percentage < 80) {
            diffPanel1.style.flex = `0 0 ${percentage}%`;
            diffPanel2.style.flex = `0 0 ${100 - percentage}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}
