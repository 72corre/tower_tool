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
    const createSelect = (options, selected, className = 'custom-select') => {
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

    // --- Render Functions ---
    function render() {
        currentMapName = mapSelector.value;
        currentMapData = JSON.parse(JSON.stringify(MAPS[currentMapName]));
        editorTitle.textContent = `2. ${currentMapName} の編集`;
        editorContainer.innerHTML = '';

        Object.entries(currentMapData).forEach(([key, rules]) => {
            editorContainer.appendChild(createEntryCard(key, rules));
        });
        updateOutput();
    }

    function createEntryCard(key, rules) {
        const card = document.createElement('div');
        card.className = 'card-custom';
        
        const header = document.createElement('div');
        header.className = 'card-header-custom d-flex justify-content-between align-items-center';
        header.innerHTML = `<h5>トリガー: ${key}</h5>`;
        const deleteEntryBtn = document.createElement('button');
        deleteEntryBtn.className = 'btn-danger-soft';
        deleteEntryBtn.textContent = 'このトリガーセットを削除';
        deleteEntryBtn.onclick = () => {
            if (confirm(`トリガー「${key}」のルールセット全体を削除します。よろしいですか？`)) {
                delete currentMapData[key];
                render();
            }
        };
        header.appendChild(deleteEntryBtn);

        const body = document.createElement('div');
        body.className = 'card-body-custom';

        rules.forEach((rule, index) => {
            body.appendChild(createRuleForm(key, index, rule));
        });

        const addRuleBtn = document.createElement('button');
        addRuleBtn.className = 'btn btn-secondary mt-3';
        addRuleBtn.textContent = '＋ 対策ルールを追加';
        addRuleBtn.onclick = () => {
            currentMapData[key].push({ category: TAG_CATEGORIES[0], subCategory: '', reason: '', priorityRule: { type: 'fixed', priority: 'medium' } });
            render();
        };
        body.appendChild(addRuleBtn);
        
        card.append(header, body);
        return card;
    }

    function createRuleForm(entryKey, ruleIndex, rule) {
        const formContainer = document.createElement('div');
        formContainer.className = 'rule-card';
        const ruleData = currentMapData[entryKey][ruleIndex];

        const header = document.createElement('div');
        header.className = 'd-flex justify-content-between align-items-center mb-3';
        header.innerHTML = `<h6>対策ルール #${ruleIndex + 1}</h6>`;
        const deleteRuleBtn = document.createElement('button');
        deleteRuleBtn.className = 'btn-danger-soft btn-sm';
        deleteRuleBtn.textContent = '削除';
        deleteRuleBtn.onclick = () => {
            if(confirm('この対策ルールを削除しますか？')) {
                currentMapData[entryKey].splice(ruleIndex, 1);
                render();
            }
        };
        header.appendChild(deleteRuleBtn);

        const fields = document.createElement('div');
        fields.innerHTML = `
            <div class="row">
                <div class="col-md-6 form-group"></div>
                <div class="col-md-6 form-group"></div>
            </div>
            <div class="form-group"></div>
            <div class="form-group"></div>
        `;

        // Category & SubCategory
        fields.querySelector('.col-md-6:nth-child(1)').innerHTML = '<label>対策カテゴリ</label>';
        const catSelect = createSelect(TAG_CATEGORIES, rule.category);
        catSelect.onchange = (e) => { ruleData.category = e.target.value; updateOutput(); };
        fields.querySelector('.col-md-6:nth-child(1)').appendChild(catSelect);

        fields.querySelector('.col-md-6:nth-child(2)').innerHTML = '<label>対策サブカテゴリ</label>';
        const subCatInput = document.createElement('input');
        subCatInput.type = 'text'; subCatInput.className = 'form-control'; subCatInput.value = rule.subCategory || '';
        subCatInput.oninput = (e) => { ruleData.subCategory = e.target.value; updateOutput(); };
        fields.querySelector('.col-md-6:nth-child(2)').appendChild(subCatInput);

        // Reason
        fields.querySelector('.form-group:nth-child(2)').innerHTML = '<label>推奨理由</label>';
        const reasonInput = document.createElement('textarea');
        reasonInput.className = 'form-control'; reasonInput.rows = 2; reasonInput.value = rule.reason || '';
        reasonInput.oninput = (e) => { ruleData.reason = e.target.value; updateOutput(); };
        fields.querySelector('.form-group:nth-child(2)').appendChild(reasonInput);

        // Priority Rule
        const priorityContainer = fields.querySelector('.form-group:nth-child(3)');
        priorityContainer.innerHTML = '<label>優先度ルール</label>';
        const priorityType = rule.priorityRule?.type || 'fixed';
        
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group toggle-btn-group';
        const fixedBtn = document.createElement('button');
        fixedBtn.textContent = '固定';
        fixedBtn.className = priorityType === 'fixed' ? 'toggle-btn-active' : 'toggle-btn-inactive';
        fixedBtn.onclick = () => { 
            if(ruleData.priorityRule.type === 'fixed') return;
            ruleData.priorityRule = { type: 'fixed', priority: 'medium' };
            render();
        };
        const conditionalBtn = document.createElement('button');
        conditionalBtn.textContent = '条件分岐';
        conditionalBtn.className = priorityType === 'conditional' ? 'toggle-btn-active' : 'toggle-btn-inactive';
        conditionalBtn.onclick = () => { 
            if(ruleData.priorityRule.type === 'conditional') return;
            ruleData.priorityRule = { type: 'conditional', rules: [], defaultPriority: 'low' };
            render();
        };
        btnGroup.append(fixedBtn, conditionalBtn);
        priorityContainer.appendChild(btnGroup);

        const priorityDetails = document.createElement('div');
        priorityDetails.className = 'mt-2 p-3 rounded';
        priorityDetails.style.backgroundColor = 'rgba(0,0,0,0.2)';

        if (priorityType === 'fixed') {
            const prioritySelect = createSelect(PRIORITY_OPTIONS, rule.priorityRule.priority);
            prioritySelect.onchange = (e) => { ruleData.priorityRule.priority = e.target.value; updateOutput(); };
            priorityDetails.append(prioritySelect);
        } else {
            rule.priorityRule.rules.forEach((cond, condIndex) => {
                const condDiv = document.createElement('div');
                condDiv.className = 'd-flex align-items-center mb-2';
                const opSelect = createSelect(OPERATOR_OPTIONS, cond.operator, 'custom-select custom-select-sm');
                opSelect.onchange = (e) => { cond.operator = e.target.value; updateOutput(); };
                const valInput = document.createElement('input');
                valInput.type='number'; valInput.className='form-control form-control-sm'; valInput.value = cond.value;
                valInput.oninput = (e) => { cond.value = e.target.value; updateOutput(); };
                const prioSelect = createSelect(PRIORITY_OPTIONS, cond.priority, 'custom-select custom-select-sm');
                prioSelect.onchange = (e) => { cond.priority = e.target.value; updateOutput(); };
                const delCondBtn = document.createElement('button');
                delCondBtn.className = 'btn-danger-soft btn-sm ml-2'; delCondBtn.textContent = '×';
                delCondBtn.onclick = () => { ruleData.priorityRule.rules.splice(condIndex, 1); render(); };
                condDiv.innerHTML = 'IF value&nbsp;';
                condDiv.append(opSelect, valInput, '&nbsp;THEN priority&nbsp;', prioSelect, delCondBtn);
                priorityDetails.appendChild(condDiv);
            });
            const addCondBtn = document.createElement('button');
            addCondBtn.className = 'btn btn-sm btn-info'; addCondBtn.textContent = '＋ 条件追加';
            addCondBtn.onclick = () => { ruleData.priorityRule.rules.push({ operator: '>=', value: 0, priority: 'medium' }); render(); };
            
            const defaultPrioDiv = document.createElement('div');
            defaultPrioDiv.className = 'mt-3';
            const defaultPrioSelect = createSelect(PRIORITY_OPTIONS, rule.priorityRule.defaultPriority);
            defaultPrioSelect.onchange = (e) => { ruleData.priorityRule.defaultPriority = e.target.value; updateOutput(); };
            defaultPrioDiv.append('ELSE priority&nbsp;', defaultPrioSelect);
            priorityDetails.append(addCondBtn, defaultPrioDiv);
        }
        priorityContainer.appendChild(priorityDetails);

        formContainer.append(header, fields);
        return formContainer;
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
        const newKey = prompt('新しいトリガーキーを入力してください (例: 状態異常-暗闇):');
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
