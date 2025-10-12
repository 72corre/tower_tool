document.addEventListener('DOMContentLoaded', () => {
    const mapSelector = document.getElementById('mapSelector');
    const editorContainer = document.getElementById('editor-container');
    const outputTextArea = document.getElementById('output');
    const addEntryBtn = document.getElementById('add-entry-btn');
    const copyBtn = document.getElementById('copy-btn');

    let currentMapData = {};
    let currentMapName = '';

    const MAPS = {
        GIMMICK_COUNTER_MAP,
        WEAKNESS_ATTACK_MAP,
        SUPPORT_PRIORITY_MAP
    };

    // --- Helper Functions ---
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // --- Core Functions ---

    function renderEditor() {
        editorContainer.innerHTML = '';
        currentMapData = JSON.parse(JSON.stringify(MAPS[currentMapName])); // Deep copy

        for (const key in currentMapData) {
            const entryElement = createEntryElement(key, currentMapData[key]);
            editorContainer.appendChild(entryElement);
        }
        updateOutput();
    }

    function createEntryElement(key, valueArray) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'card';
        const uniqueId = 'collapse-' + btoa(unescape(encodeURIComponent(key))).replace(/=/g, '');

        entryDiv.innerHTML = "
            <div class=\"card-header\" data-toggle=\"collapse\" data-target=\"#${uniqueId}\">
                <strong>${key}</strong>
            </div>
            <div id=\"${uniqueId}\" class=\"collapse show\">
                <div class=\"card-body\"></div>
            </div>
        ";
        const cardBody = entryDiv.querySelector('.card-body');

        valueArray.forEach((rule, index) => {
            const ruleForm = createRuleForm(key, index, rule);
            cardBody.appendChild(ruleForm);
        });

        const addRuleBtn = document.createElement('button');
        addRuleBtn.className = 'btn btn-sm btn-success mt-2';
        addRuleBtn.innerText = 'ルールを追加';
        addRuleBtn.onclick = () => {
            currentMapData[key].push({ category: '', subCategory: '', reason: '' }); // Add a template
            renderEditor(); // Re-render
        };
        cardBody.appendChild(addRuleBtn);
        
        const deleteEntryBtn = document.createElement('button');
        deleteEntryBtn.className = 'btn btn-sm btn-danger mt-2 ml-2';
        deleteEntryBtn.innerText = 'このエントリを削除';
        deleteEntryBtn.onclick = () => {
            delete currentMapData[key];
            renderEditor();
        };
        cardBody.appendChild(deleteEntryBtn);

        return entryDiv;
    }

    function createRuleForm(entryKey, ruleIndex, rule) {
        const form = document.createElement('form');
        form.className = 'p-3 mb-3 bg-light rounded border';
        let formHtml = '';

        for (const key in rule) {
            formHtml += "
                <div class=\"form-group row\">
                    <label class=\"col-sm-3 col-form-label\">${key}</label>
                    <div class=\"col-sm-9\">
                        <input type=\"text\" class=\"form-control\" data-entry=\"${entryKey}\" data-index=\"$"${ruleIndex}\" data-key=\"${key}\" value=\"" + escapeHTML(rule[key]) + "">
                    </div>
                </div>
            ";
        }
        form.innerHTML = formHtml;
        
        const deleteRuleBtn = document.createElement('button');
        deleteRuleBtn.type = 'button';
        deleteRuleBtn.className = 'btn btn-sm btn-warning';
        deleteRuleBtn.innerText = 'このルールを削除';
        deleteRuleBtn.onclick = () => {
            currentMapData[entryKey].splice(ruleIndex, 1);
            renderEditor();
        };
        form.appendChild(deleteRuleBtn);

        return form;
    }

    function updateOutput() {
        let outputString = `const ${currentMapName} = {\n`;
        for (const key in currentMapData) {
            outputString += `    '${key}': [\n`;
            currentMapData[key].forEach(rule => {
                outputString += `        { `; 
                const ruleEntries = Object.entries(rule);
                ruleEntries.forEach(([k, v], i) => {
                    const isLast = i === ruleEntries.length - 1;
                    const formattedValue = v.replace(/'/g, "\'");
                    outputString += `${k}: '${formattedValue}'${isLast ? '' : ', '}`;
                });
                outputString += ` },\n`;
            });
            outputString += `    ],\n`;
        }
        outputString += '};';
        outputTextArea.value = outputString;
    }

    // --- Event Listeners ---

    mapSelector.addEventListener('change', (e) => {
        currentMapName = e.target.value;
        renderEditor();
    });

    editorContainer.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            const { entry, index, key } = e.target.dataset;
            currentMapData[entry][index][key] = e.target.value;
            updateOutput();
        }
    });

    addEntryBtn.addEventListener('click', () => {
        const newKey = prompt('新しいエントリのキーを入力してください (例: 状態異常-暗闇):');
        if (newKey && !currentMapData[newKey]) {
            currentMapData[newKey] = [{}]; // Start with one empty rule
            renderEditor();
        } else if (newKey) {
            alert('そのキーは既に存在します。');
        }
    });

    copyBtn.addEventListener('click', () => {
        outputTextArea.select();
        document.execCommand('copy');
        alert('クリップボードにコピーしました！');
    });

    // --- Initial Load ---
    currentMapName = mapSelector.value;
    renderEditor();
});
