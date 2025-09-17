let db;

function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        try {
            const app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore(app);
            console.log("Firebase initialized successfully");
        } catch (e) {
            console.error("Error initializing Firebase:", e);
        }
    } else {
        console.error("Firebase SDK not loaded");
    }
}

// 編成IDを生成する（日本語対応）
function getFormationId(formation) {
    try {
        const jsonString = JSON.stringify(formation);
        // 文字列をUTF-8のバイトシーケンスにエンコード
        const utf8Bytes = new TextEncoder().encode(jsonString);
        // バイト配列をBase64にエンコード
        const base64 = btoa(String.fromCharCode.apply(null, utf8Bytes));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch (e) {
        console.error("Failed to create formation ID", e);
        return null;
    }
}

// 採点を送信する
async function submitRating(formationId, rating) {
    if (!db) {
        console.error("Firestore is not initialized.");
        return;
    }
    if (rating < 1 || rating > 5) {
        console.error("Rating must be between 1 and 5.");
        return;
    }

    const ratingRef = db.collection('formations').doc(formationId);

    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(ratingRef);
            if (!doc.exists) {
                transaction.set(ratingRef, {
                    total_rating: rating,
                    rating_count: 1,
                    [`rating_${rating}`]: 1
                });
            } else {
                const data = doc.data();
                const newTotalRating = (data.total_rating || 0) + rating;
                const newRatingCount = (data.rating_count || 0) + 1;
                const newRatingBucket = (data[`rating_${rating}`] || 0) + 1;

                transaction.update(ratingRef, {
                    total_rating: newTotalRating,
                    rating_count: newRatingCount,
                    [`rating_${rating}`]: newRatingBucket
                });
            }
        });
        console.log("Rating submitted successfully!");
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
}

// 特定の編成の採点情報を取得する
async function getFormationRating(formationId) {
    if (!db) return null;
    try {
        const doc = await db.collection('formations').doc(formationId).get();
        if (doc.exists) {
            return doc.data();
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error getting document:", e);
        return null;
    }
}

// 複数の編成の採点情報をまとめて取得する
async function getRatingsForFormations(formationIds) {
    if (!db || !formationIds || formationIds.length === 0) {
        return {};
    }
    
    const ratings = {};
    // Firestoreの `in` クエリは10個までなので、10個ずつに分割して取得
    const chunks = [];
    for (let i = 0; i < formationIds.length; i += 10) {
        chunks.push(formationIds.slice(i, i + 10));
    }

    try {
        for (const chunk of chunks) {
            const querySnapshot = await db.collection('formations').where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
            querySnapshot.forEach((doc) => {
                ratings[doc.id] = doc.data();
            });
        }
        return ratings;
    } catch (e) {
        console.error("Error getting documents: ", e);
        return {};
    }
}

/**
 * 新しい「みんなの編成」をFirestoreに投稿します。
 * @param {object} formationData - 投稿する編成データ。
 * @returns {Promise<string|null>} 成功した場合は新しいドキュメントのID、失敗した場合はnull。
 */
async function postCommunityFormation(formationData) {
    if (!db) {
        console.error("Firestore is not initialized.");
        return null;
    }

    try {
        // 投稿日時と、検索用のフィールドを付与
        const dataToPost = {
            ...formationData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            // 評価を初期化
            total_rating: 0,
            rating_count: 0,
        };

        const docRef = await db.collection('communityFormations').add(dataToPost);
        console.log("Formation posted successfully with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error posting formation: ", e);
        return null;
    }
}

/**
 * 条件に基づいて「みんなの編成」をFirestoreから取得します。
 * @param {object} filters - フィルタ条件。例: { floor: 5, megidoName: 'バエル' }
 * @returns {Promise<Array>} 取得した編成データの配列。
 */
async function getCommunityFormations(filters = {}) {
    if (!db) {
        console.error("Firestore is not initialized.");
        return [];
    }

    try {
        let query = db.collection('communityFormations');

        // フィルタを適用
        if (filters.floor) {
            query = query.where('floor', '==', parseInt(filters.floor, 10));
        }
        if (filters.enemyName) {
            // 部分一致はできないため、前方一致で代替
            query = query.where('enemyName', '>=', filters.enemyName).where('enemyName', '<=', filters.enemyName + '\uf8ff');
        }
        if (filters.megidoName) {
            query = query.where('megidoNames', 'array-contains', filters.megidoName);
        }

        // 最終的なクエリを実行
        const querySnapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
        
        const formations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return formations;

    } catch (e) {
        console.error("Error getting community formations: ", e);
        return [];
    }
}


// DOMContentLoadedでFirebaseを初期化
document.addEventListener('DOMContentLoaded', initializeFirebase);
