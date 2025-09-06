const generateMappings = (data, idKey, qridKey = 'QRID') => {
    const originalToNew = new Map();
    const newToOriginal = new Map();

    if (Array.isArray(data)) {
        data.forEach(item => {
            const originalId = item[idKey];
            const newId = item[qridKey] || item['QRID'] || item['qrid'] || item['QRid'];
            if (originalId && newId) {
                originalToNew.set(originalId, newId);
                newToOriginal.set(newId, originalId);
            }
        });
    } else { // It's an object for ENEMY_ALL_DATA
        Object.keys(data).forEach(key => {
            const item = data[key];
            const originalId = key;
            const newId = item.QRid; // The user used 'QRid' here
            if (originalId && newId) {
                originalToNew.set(originalId, newId);
                newToOriginal.set(newId, originalId);
            }
        });
    }
    return { originalToNew, newToOriginal };
};

const generateMegidoMappings = () => generateMappings(COMPLETE_MEGIDO_LIST, 'id', 'QRID');
const generateEnemyMappings = () => generateMappings(ENEMY_ALL_DATA, null, 'QRid'); // idKey is null because the object key is the id
const generateOrbMappings = () => generateMappings(COMPLETE_ORB_LIST, 'id', 'qrid'); // user used lowercase 'qrid' here
const generateReishouMappings = () => generateMappings(COMPLETE_REISHOU_LIST, 'id', 'qrid'); // user used lowercase 'qrid' here
