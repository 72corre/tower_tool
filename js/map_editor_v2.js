document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mapSelector = document.getElementById('mapSelector');
    const editorContainer = document.getElementById('editor-container');
    const outputTextArea = document.getElementById('output');
    const addEntryBtn = document.getElementById('add-entry-btn');
    const copyBtn = document.getElementById('copy-btn');
    const editorTitle = document.getElementById('editor-title');

    // --- Data & State ---
    let currentMapData = {};
    let currentMapName = '';
    const MAPS = { GIMMICK_COUNTER_MAP, WEAKNESS_ATTACK_MAP, SUPPORT_PRIORITY_MAP };
    const TAG_CATEGORIES = ['状態異常', '弱体', '妨害', '強化', '補助', '回復', '特殊状態', 'トランス', '地形', '攻撃手段', '耐性', 'ダメージ', '特効', 'その他'];
    const PRIORITY_OPTIONS = ['high', 'medium', 'low'];
    const OPERATOR_OPTIONS = ['>=', '<=', '>', '<', '=='];

    // --- Helper Functions ---
    const createSelect = (options, selected, className = 'form-control') => {
        const select = document.createElement('select');
        select.className = className;
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.text = opt;
            if (opt === selected) option.selected = true;
            select.appendChild(option);
        });
        return select;
    };

    const createTextInput = (value, className = 'form-control') => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = className;
        input.value = value || '';
        return input;
    };

    // --- Render Functions ---
    function render() {
        currentMapName = mapSelector.value;
        currentMapData = JSON.parse(JSON.stringify(MAPS[currentMapName]));
        editorTitle.textContent = `2. ${currentMapName} の編集`;
        editorContainer.innerHTML = '';

        Object.entries(currentMapData).forEach(([key, rules]) => {
            const entryCard = createEntryCard(key, rules);
            editorContainer.appendChild(entryCard);
        });
        updateOutput();
    }

    function createEntryCard(key, rules) {
        const card = document.createElement('div');
        card.className = 'card';
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header d-flex justify-content-between align-items-center';
        cardHeader.innerHTML = `<strong>トリガー: ${key}</strong>`;
        const deleteEntryBtn = document.createElement('span');
        deleteEntryBtn.className = 'delete-btn';
        deleteEntryBtn.innerHTML = '&times; このルールセットを削除';
        deleteEntryBtn.onclick = () => {
            delete currentMapData[key];
            render();
        };
        cardHeader.appendChild(deleteEntryBtn);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        rules.forEach((rule, index) => {
            cardBody.appendChild(createRuleForm(key, index, rule));
        });

        const addRuleBtn = document.createElement('button');
        addRuleBtn.className = 'btn btn-secondary mt-2';
        addRuleBtn.textContent = '対策ルールを追加';
        addRuleBtn.onclick = () => {
            currentMapData[key].push({ category: TAG_CATEGORIES[0], subCategory: '', reason: '', priorityRule: { type: 'fixed', priority: 'medium' } });
            render();
        };
        cardBody.appendChild(addRuleBtn);
        
        card.append(cardHeader, cardBody);
        return card;
    }

    function createRuleForm(entryKey, ruleIndex, rule) {
        const form = document.createElement('div');
        form.className = 'rule-card';
        const ruleData = currentMapData[entryKey][ruleIndex];

        // --- Rule Form Fields ---
        const catSelect = createSelect(TAG_CATEGORIES, rule.category);
        catSelect.onchange = (e) => { ruleData.category = e.target.value; updateOutput(); };

        const subCatInput = createTextInput(rule.subCategory);
        subCatInput.oninput = (e) => { ruleData.subCategory = e.target.value; updateOutput(); };

        const reasonInput = createTextInput(rule.reason);
        reasonInput.oninput = (e) => { ruleData.reason = e.target.value; updateOutput(); };

        // --- Priority Rule UI ---
        const priorityContainer = document.createElement('div');
        const priorityType = rule.priorityRule?.type || 'fixed';

        const fixedRadio = document.createElement('input');
        fixedRadio.type = 'radio'; fixedRadio.name = `priority-type-${entryKey}-${ruleIndex}`; fixedRadio.checked = priorityType === 'fixed';
        fixedRadio.onchange = () => { 
            ruleData.priorityRule = { type: 'fixed', priority: 'medium' };
            render();
        };

        const conditionalRadio = document.createElement('input');
        conditionalRadio.type = 'radio'; conditionalRadio.name = `priority-type-${entryKey}-${ruleIndex}`; conditionalRadio.checked = priorityType === 'conditional';
        conditionalRadio.onchange = () => { 
            ruleData.priorityRule = { type: 'conditional', rules: [], defaultPriority: 'low' };
            render();
        };

        if (priorityType === 'fixed') {
            const prioritySelect = createSelect(PRIORITY_OPTIONS, rule.priorityRule.priority);
            prioritySelect.onchange = (e) => { ruleData.priorityRule.priority = e.target.value; updateOutput(); };
            priorityContainer.innerHTML = '';
            priorityContainer.append(fixedRadio, '固定', prioritySelect, conditionalRadio, '条件分岐');
        } else {
            const conditionalDiv = document.createElement('div');
            rule.priorityRule.rules.forEach((cond, condIndex) => {
                const condRuleDiv = document.createElement('div');
                condRuleDiv.className = 'priority-conditional-rule';
                const opSelect = createSelect(OPERATOR_OPTIONS, cond.operator, 'form-control form-control-sm');
                opSelect.onchange = (e) => { cond.operator = e.target.value; updateOutput(); };
                const valInput = createTextInput(cond.value, 'form-control form-control-sm');
                valInput.oninput = (e) => { cond.value = e.target.value; updateOutput(); };
                const prioSelect = createSelect(PRIORITY_OPTIONS, cond.priority, 'form-control form-control-sm');
                prioSelect.onchange = (e) => { cond.priority = e.target.value; updateOutput(); };
                const delCondBtn = document.createElement('span');
                delCondBtn.className = 'delete-btn'; delCondBtn.innerHTML = '&times;';
                delCondBtn.onclick = () => { ruleData.priorityRule.rules.splice(condIndex, 1); render(); };
                condRuleDiv.append('IF value', opSelect, valInput, 'THEN priority', prioSelect, delCondBtn);
                conditionalDiv.appendChild(condRuleDiv);
            });
            const addCondBtn = document.createElement('button');
            addCondBtn.className = 'btn btn-sm btn-info'; addCondBtn.textContent = '条件追加';
            addCondBtn.onclick = () => { ruleData.priorityRule.rules.push({ operator: '>=', value: 0, priority: 'medium' }); render(); };
            conditionalDiv.appendChild(addCondBtn);
            
            const defaultPrioSelect = createSelect(PRIORITY_OPTIONS, rule.priorityRule.defaultPriority);
            defaultPrioSelect.onchange = (e) => { ruleData.priorityRule.defaultPriority = e.target.value; updateOutput(); };
            const defaultPrioDiv = document.createElement('div');
            defaultPrioDiv.append('ELSE priority', defaultPrioSelect);
            conditionalDiv.appendChild(defaultPrioDiv);

            priorityContainer.innerHTML = '';
            priorityContainer.append(fixedRadio, '固定', conditionalRadio, '条件分岐', conditionalDiv);
        }

        const deleteRuleBtn = document.createElement('button');
        deleteRuleBtn.className = 'btn btn-sm btn-danger mt-3';
        deleteRuleBtn.textContent = 'この対策ルールを削除';
        deleteRuleBtn.onclick = () => { currentMapData[entryKey].splice(ruleIndex, 1); render(); };

        form.innerHTML = `
            <h6>対策ルール #${ruleIndex + 1}</h6>
            <div class="form-row"><div class="form-group col-md-6"><label>対策カテゴリ</label></div><div class="form-group col-md-6"><label>対策サブカテゴリ</label></div></div>
            <div class="form-row"><div class="form-group col-md-6"></div><div class="form-group col-md-6"></div></div>
            <div class="form-group"><label>推奨理由</label></div>
            <h6>優先度ルール</h6>
        `;
        form.querySelectorAll('.form-group')[0].appendChild(catSelect);
        form.querySelectorAll('.form-group')[1].appendChild(subCatInput);
        form.querySelectorAll('.form-group')[2].appendChild(reasonInput);
        form.appendChild(priorityContainer);
        form.appendChild(deleteRuleBtn);

        return form;
    }

    function updateOutput() {
        try {
            const outputString = `const ${currentMapName} = ${JSON.stringify(currentMapData, null, 4)};`;
            outputTextArea.value = outputString;
        } catch (e) {
            outputTextArea.value = 'Error generating output: ' + e.message;
        }
    }

    // --- Event Listeners ---
    mapSelector.addEventListener('change', render);
    addEntryBtn.addEventListener('click', () => {
        const newKey = prompt('新しいルールセットのトリガーキーを入力してください (例: 状態異常-暗闇):');
        if (newKey && !currentMapData[newKey]) {
            currentMapData[newKey] = [];
            render();
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
    render();
});
