// 历史记录页面脚本

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});

// 加载历史记录
async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const result = await response.json();

        if (result.success) {
            renderHistory(result.data);
        }
    } catch (error) {
        console.error('加载历史记录失败:', error);
        showError('加载历史记录失败，请刷新页面重试');
    }
}

// 渲染历史记录
function renderHistory(data) {
    const totalCount = document.getElementById('totalCount');
    const historyList = document.getElementById('historyList');

    // 更新统计数字
    totalCount.textContent = data.total_count;

    if (data.conversions.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>暂无转换记录</p>
                <p style="font-size: 0.9em; margin-top: 10px;">开始转换文档后，记录将显示在这里</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = '<ul class="history-list">' +
        data.conversions.map(record => {
            const date = new Date(record.timestamp);
            const dateStr = date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const fileSize = formatFileSize(record.file_size);
            const similarity = (record.similarity * 100).toFixed(1);
            const processingTime = record.processing_time.toFixed(2);

            // 相似度样式
            let similarityClass = 'similarity-low';
            if (record.similarity >= 0.95) {
                similarityClass = 'similarity-high';
            } else if (record.similarity >= 0.8) {
                similarityClass = 'similarity-medium';
            }

            return `
                <li class="history-item">
                    <div class="history-time">${dateStr}</div>
                    <div class="history-details">
                        <div class="history-detail">
                            <div class="history-detail-label">模板</div>
                            <div class="history-detail-value">${record.template_name}</div>
                        </div>
                        <div class="history-detail">
                            <div class="history-detail-label">文件</div>
                            <div class="history-detail-value">***.docx</div>
                        </div>
                        <div class="history-detail">
                            <div class="history-detail-label">大小</div>
                            <div class="history-detail-value">${fileSize}</div>
                        </div>
                        <div class="history-detail">
                            <div class="history-detail-label">相似度</div>
                            <div class="history-detail-value ${similarityClass}">${similarity}%</div>
                        </div>
                        <div class="history-detail">
                            <div class="history-detail-label">耗时</div>
                            <div class="history-detail-value">${processingTime}秒</div>
                        </div>
                    </div>
                </li>
            `;
        }).join('') +
        '</ul>';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// 显示错误
function showError(message) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <p>${message}</p>
        </div>
    `;
}
