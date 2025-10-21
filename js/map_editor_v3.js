document.addEventListener('DOMContentLoaded', () => {
    // 1. STATE MANAGEMENT
    // =================================================================
    let state = {}; // State is now empty initially

    // 2. DOM REFERENCES
    // =================================================================
    const mapSelector = document.getElementById('mapSelector');
    const editorContainer = document.getElementById('editor-container');
    const outputTextarea = document.getElementById('output');
    const inputArea = document.getElementById('input-area');
    const loadBtn = document.getElementById('load-btn');
    const copyBtn = document.getElementById('copy-btn');
    const addEntryBtn = document.getElementById('add-entry-btn');
    const editorTitle = document.getElementById('editor-title');

    // 3. CORE RENDER LOGIC (Functions are mostly the same as before)
    // =================================================================

    const render = () => {
        const selectedMapName = mapSelector.value;
        editorTitle.textContent = `3. 「${selectedMapName}」の編集`;
        renderEditor(selectedMapName);
        renderOutput(selectedMapName);
    };

    const renderEditor = (mapName) => {
        editorContainer.innerHTML = '';
        const data = state[mapName];
        if (!data) return; // Don't render if no data is loaded

        if (mapName === 'GIMMICK_REASON_TEMPLATES' || mapName === 'WEAKNESS_TO_GIMMICK_MAP') {
            renderKeyValueEditor(mapName, data);
        } else {
            renderComplexMapEditor(mapName, data);
        }
    };

    const renderKeyValueEditor = (mapName, data) => {
        for (const key in data) {
            const value = data[key];
            const entryDiv = document.createElement('div');
            entryDiv.className = 'card-custom';
            entryDiv.innerHTML = `
                <div class="card-body-custom">
                    <div class="row">
                        <div class="col-md-5">
                            <label>キー</label>
                            <input type="text" class="form-control key-input" data-map="${mapName}" data-original-key="${key}" value="${key}">
                        </div>
                        <div class="col-md-5">
                            <label>値</label>
                            <input type="text" class="form-control value-input" data-map="${mapName}" data-key="${key}" value="${value}">
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                            <button class="btn btn-danger-soft remove-entry-btn" data-map="${mapName}" data-key="${key}">削除</button>
                        </div>
                    </div>
                </div>
            `;
            editorContainer.appendChild(entryDiv);
        }
    };

    const renderComplexMapEditor = (mapName, data) => {
        for (const key in data) {
            const counters = data[key];
            const entryDiv = document.createElement('div');
            entryDiv.className = 'card-custom';
            
            let countersHtml = counters.map((counter, index) => {
                const priorityRuleHtml = renderPriorityRule(mapName, key, index, counter.priorityRule);
                return (
                    `
                    <div class="p-3 mt-2 rounded" style="background-color: rgba(0,0,0,0.2);">
                        <div class="row">
                            <div class="col-md-3"><label>Category</label><input type="text" class="form-control counter-prop-input" data-map="${mapName}" data-key="${key}" data-index="${index}" data-prop="category" value="${counter.category || ''}"></div>
                            <div class="col-md-3"><label>SubCategory</label><input type="text" class="form-control counter-prop-input" data-map="${mapName}" data-key="${key}" data-index="${index}" data-prop="subCategory" value="${counter.subCategory || ''}"></div>
                            <div class="col-md-5">${priorityRuleHtml}</div>
                            <div class="col-md-1 d-flex align-items-end"><button class="btn btn-danger-soft remove-counter-btn" data-map="${mapName}" data-key="${key}" data-index="${index}">削除</button></div>
                        </div>
                    </div>
                `
                );
            }).join('');

            entryDiv.innerHTML = (
                `
                <div class="card-header-custom d-flex justify-content-between align-items-center">
                    <input type="text" class="form-control key-input w-50" data-map="${mapName}" data-original-key="${key}" value="${key}">
                    <button class="btn btn-danger-soft remove-entry-btn" data-map="${mapName}" data-key="${key}">トリガー削除</button>
                </div>
                <div class="card-body-custom">
                    <h6>Counters / Actions</h6>
                    <div class="counters-container">${countersHtml}</div>
                    <button class="btn btn-secondary btn-sm mt-3 add-counter-btn" data-map="${mapName}" data-key="${key}">対策/アクションを追加</button>
                </div>
            `
            );
            editorContainer.appendChild(entryDiv);
        }
    };

    const renderPriorityRule = (mapName, key, index, rule) => {
        if (!rule) return '<label>Priority Rule (Not Set)</label><input type="text" class="form-control" disabled>';
        
        if (rule.type === 'fixed') {
            return (
                `
                <label>Priority Rule (Fixed)</label>
                <select class="custom-select priority-rule-input" data-map="${mapName}" data-key="${key}" data-index="${index}" data-prop="priority" data-ruletype="fixed">
                    <option value="high" ${rule.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="medium" ${rule.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="low" ${rule.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
            `
            );
        }
        if (rule.type === 'conditional') {
            return `<label>Priority Rule (Conditional)</label><textarea class="form-control" rows="2" disabled>${JSON.stringify(rule)}</textarea>`;
        }
        return '';
    };

    const renderOutput = (mapName) => {
        const data = state[mapName];
        if (!data) {
            outputTextarea.value = '上記エリアにデータを読み込んでください。';
            return;
        }
        const outputString = `const ${mapName} = ${JSON.stringify(data, null, 4)};`;
        outputTextarea.value = outputString;
    };

    // 4. EVENT HANDLERS
    // =================================================================

    loadBtn.addEventListener('click', () => {
        const inputText = inputArea.value.trim();
        const selectedMapName = mapSelector.value;
        if (!inputText) {
            alert('入力エリアにJavaScriptオブジェクトを貼り付けてください。');
            return;
        }

        try {
            // Remove `const MAP_NAME = ` and trailing semicolon to get the raw object
            let objectString = inputText.replace(/^const\s+\w+\s*=\s*/, '');
            if (objectString.endsWith(';')) {
                objectString = objectString.slice(0, -1);
            }

            // A safer way to parse a JS object literal than JSON.parse
            const parsedObject = new Function(`return ${objectString}`)();
            
            state[selectedMapName] = parsedObject;
            alert(`「${selectedMapName}」を正常に読み込みました。`);
            render(); // Re-render everything with the new data
        } catch (error) {
            alert('オブジェクトの解析に失敗しました。正しい形式で貼り付けてください。\nエラー: ' + error.message);
            console.error("Parsing error:", error);
        }
    });

    mapSelector.addEventListener('change', () => {
        // When changing map, clear the editor until new data is loaded
        editorContainer.innerHTML = '';
        const selectedMapName = mapSelector.value;
        editorTitle.textContent = `3. 「${selectedMapName}」の編集`;
        // Update output area to show the currently loaded data for the new selection
        renderOutput(selectedMapName);
    });

    addEntryBtn.addEventListener('click', () => {
        const mapName = mapSelector.value;
        if (!state[mapName]) {
            alert('先にデータを読み込んでください。');
            return;
        }
        const newKey = prompt(`新しいキー（トリガー名）を入力してください:\n例: 状態異常-暗闇`);
        if (newKey && !state[mapName][newKey]) {
            if (mapName === 'GIMMICK_REASON_TEMPLATES' || mapName === 'WEAKNESS_TO_GIMMICK_MAP') {
                state[mapName][newKey] = '';
            } else {
                state[mapName][newKey] = [];
            }
            render();
        } else if (newKey) {
            alert('キーが既に存在するか、無効です。');
        }
    });

    editorContainer.addEventListener('change', (e) => {
        const target = e.target;
        const mapName = target.dataset.map;
        if (!state[mapName]) return;

        if (target.classList.contains('value-input')) {
            const key = target.dataset.key;
            state[mapName][key] = target.value;
        }
        else if (target.classList.contains('key-input')) {
            const originalKey = target.dataset.originalKey;
            const newKey = target.value;
            if (originalKey !== newKey) {
                if (state[mapName][newKey]) {
                    alert('新しいキー名は既に存在します。');
                    target.value = originalKey;
                    return;
                }
                const value = state[mapName][originalKey];
                delete state[mapName][originalKey];
                state[mapName][newKey] = value;
                // We need to re-render to update all the data attributes
                render();
                return; // Exit to avoid double-rendering output
            }
        }
        else if (target.classList.contains('counter-prop-input')) {
            const { key, index, prop } = target.dataset;
            state[mapName][key][index][prop] = target.value;
        }
        else if (target.classList.contains('priority-rule-input')) {
            const { key, index, prop, ruletype } = target.dataset;
            if (ruletype === 'fixed') {
                state[mapName][key][index].priorityRule[prop] = target.value;
            }
        }

        renderOutput(mapName);
    });

    editorContainer.addEventListener('click', (e) => {
        const target = e.target;
        const mapName = target.dataset.map;
        if (!mapName || !state[mapName]) return;

        if (target.classList.contains('remove-entry-btn')) {
            const key = target.dataset.key;
            if (confirm(`「${key}」のエントリを削除しますか？`)) {
                delete state[mapName][key];
                render();
            }
        }
        else if (target.classList.contains('add-counter-btn')) {
            const key = target.dataset.key;
            state[mapName][key].push({ category: '', subCategory: '', priorityRule: { type: 'fixed', priority: 'low' } });
            render();
        }
        else if (target.classList.contains('remove-counter-btn')) {
            const { key, index } = target.dataset;
            state[mapName][key].splice(index, 1);
            render();
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!outputTextarea.value || outputTextarea.value.startsWith('上記エリアに')) {
            alert('コピーするデータがありません。');
            return;
        }
        outputTextarea.select();
        navigator.clipboard.writeText(outputTextarea.value)
            .then(() => alert('クリップボードにコピーしました！'))
            .catch(err => alert('コピーに失敗しました。'));
    });

    // 5. INITIALIZATION
    // =================================================================
    render(); // Initial render to set titles and output placeholder
});
