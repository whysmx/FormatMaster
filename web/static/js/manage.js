// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadTemplates();
    setupUploadModal();
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
        templateList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>暂无模板，点击上方按钮上传第一个模板</p>
            </div>
        `;
        return;
    }

    templateList.innerHTML = templates.map(template => {
        const updateDate = new Date(template.updated_at).toLocaleString('zh-CN');

        return `
            <div class="template-card" data-id="${template.id}">
                <div class="template-card-header">
                    <div class="template-card-name">
                        ${template.name}
                    </div>
                </div>
                <div class="template-card-meta">
                    更新时间: ${updateDate}
                </div>
                <div class="template-actions">
                    <button class="btn btn-sm btn-secondary edit-btn" data-id="${template.id}" data-name="${template.name}">
                        编辑名称
                    </button>
                    ${!template.is_default ? `
                        <button class="btn btn-sm btn-secondary set-default-btn" data-id="${template.id}">
                            设为默认
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${template.id}">
                        删除
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // 绑定事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editTemplateName(this.dataset.id, this.dataset.name);
        });
    });

    document.querySelectorAll('.set-default-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setDefaultTemplate(this.dataset.id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteTemplate(this.dataset.id);
        });
    });
}

// 设置上传模态框
function setupUploadModal() {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const uploadForm = document.getElementById('uploadForm');

    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        uploadForm.reset();
    });

    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
            uploadForm.reset();
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await uploadTemplate();
    });

    // 文件选择时自动填充模板名称
    const fileInput = document.getElementById('templateFile');
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // 移除 .docx 扩展名
            const name = file.name.replace(/\.docx$/i, '');
            document.getElementById('templateName').value = name;
        }
    });
}

// 编辑模板名称
async function editTemplateName(templateId, currentName) {
    const newName = prompt('请输入新的模板名称:', currentName);

    if (newName === null) {
        // 用户取消
        return;
    }

    const trimmedName = newName.trim();
    if (!trimmedName) {
        alert('模板名称不能为空');
        return;
    }

    if (trimmedName === currentName) {
        // 名称未改变
        return;
    }

    try {
        const response = await fetch(`/api/templates/${templateId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: trimmedName })
        });

        const result = await response.json();

        if (result.success) {
            alert('修改成功！');
            loadTemplates();
        } else {
            alert('修改失败: ' + result.message);
        }
    } catch (error) {
        console.error('修改失败:', error);
        alert('修改失败，请重试');
    }
}

// 上传模板
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
            loadTemplates();
        } else {
            alert('上传失败: ' + result.message);
        }
    } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败，请重试');
    }
}

// 设置默认模板
async function setDefaultTemplate(templateId) {
    if (!confirm('确定要设为默认模板吗？')) {
        return;
    }

    try {
        const response = await fetch(`/api/templates/${templateId}/default`, {
            method: 'PUT'
        });

        const result = await response.json();

        if (result.success) {
            alert('设置成功！');
            loadTemplates();
        } else {
            alert('设置失败: ' + result.message);
        }
    } catch (error) {
        console.error('设置失败:', error);
        alert('设置失败，请重试');
    }
}

// 删除模板
async function deleteTemplate(templateId) {
    if (!confirm('确定要删除这个模板吗？删除后无法恢复！')) {
        return;
    }

    try {
        const response = await fetch(`/api/templates/${templateId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert('删除成功！');
            loadTemplates();
        } else {
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试');
    }
}

// 显示错误
function showError(message) {
    const templateList = document.getElementById('templateList');
    templateList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <p>${message}</p>
        </div>
    `;
}
