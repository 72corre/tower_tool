const { useState, useEffect, useMemo } = React;

const GuidanceManager = ({ isGuideMode, activeTab, ownedMegidoIds, guideStep, setGuideStep, completedSteps, onStepComplete }) => {
    const [targetRect, setTargetRect] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    // シナリオの定義
    const scenario = useMemo(() => [
        {
            step: 1,
            message: "ガイドモードへようこそ！まずはあなたの戦力となるメギドたちを登録しましょう！ここをクリックして「所持メギド管理」画面を開いてください。",
            targetSelector: "#ownership-tab-button",
            mobileTargetSelector: "#mobile-ownership-tab-button",
            condition: () => isGuideMode && !completedSteps.has(1) && ownedMegidoIds.size === 0,
            advanceOn: { prop: 'activeTab', value: 'ownership' }
        },
        {
            step: 2,
            message: "メギドの登録、ありがとうございます！次は、塔に挑戦するためのチーム（編成）を組みましょう。ここから編成画面へ進めます。",
            targetSelector: "#formation-tab-button",
            mobileTargetSelector: "#mobile-formation-tab-button",
            condition: () => isGuideMode && !completedSteps.has(2) && ownedMegidoIds.size > 0 && activeTab !== 'formation',
            advanceOn: { prop: 'activeTab', value: 'formation' }
        },
        {
            step: 3,
            message: "ここでチームを編成します。まずは3人チームがおすすめです。\n①対策役 ②攻撃役 ③サポーター\nの役割を意識するとバランスが良くなります。\n\n空いているスロットをクリックして、メギドを選択してみましょう。",
            targetSelector: "#formation-slots-container",
            mobileTargetSelector: "#formation-slots-container",
            condition: () => isGuideMode && !completedSteps.has(3) && activeTab === 'formation',
            advanceOn: { prop: 'activeTab', value: 'details' } // マップタブに戻ったら次に進む（仮）
        },
        {
            step: 4,
            message: "素晴らしい編成です！マップに戻り、最初の戦闘マスに挑戦してみましょう。このマスをクリックしてください。",
            targetSelector: "[data-square-id='f1-b1']",
            mobileTargetSelector: "[data-square-id='f1-b1']",
            condition: () => isGuideMode && !completedSteps.has(4) && guideStep === 4,
            advanceOn: { prop: 'selectedSquareId', value: '1-b1' } 
        },
        {
            step: 5,
            message: "戦闘の準備ができました。実際の戦闘はゲーム内で行い、結果をこのアプリに記録します。「勝利」ボタンを押して、戦闘に勝利したことを記録してみましょう。",
            targetSelector: "#win-button",
            mobileTargetSelector: "#win-button",
            condition: () => isGuideMode && !completedSteps.has(5) && guideStep === 5,
            advanceOn: { prop: 'battleResultLogged', value: true }
        },
        // 今後、ステップ6...と追加していく
    ], [isGuideMode, ownedMegidoIds, activeTab, completedSteps, guideStep]);

    useEffect(() => {
        const activeStep = scenario.find(s => s.step === guideStep && s.condition());

        if (!activeStep) {
            setIsVisible(false);
            return;
        }

        const selector = window.innerWidth <= 768 ? activeStep.mobileTargetSelector : activeStep.targetSelector;
        const targetElement = document.querySelector(selector);

        if (targetElement) {
            setTargetRect(targetElement.getBoundingClientRect());
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [guideStep, scenario]);
    
    useEffect(() => {
        const currentStepData = scenario.find(s => s.step === guideStep);
        if (isVisible && currentStepData && currentStepData.advanceOn) {
            if (currentStepData.advanceOn.prop === 'activeTab' && activeTab === currentStepData.advanceOn.value) {
                onStepComplete(guideStep);
                setGuideStep(guideStep + 1);
            }
        }
    }, [activeTab, guideStep, isVisible, scenario, setGuideStep, onStepComplete]);

    // 初期ステップの設定
    useEffect(() => {
        if (isGuideMode && guideStep === 0) {
            const firstStep = scenario.find(s => s.condition());
            if (firstStep) {
                setGuideStep(firstStep.step);
            }
        }
    }, [isGuideMode, guideStep, scenario, setGuideStep]);


    if (!isVisible || !targetRect) {
        return null;
    }

    const stepData = scenario.find(s => s.step === guideStep);
    if (!stepData) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9998,
        boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.7)`,
        clipPath: `inset(${targetRect.top - 5}px ${window.innerWidth - targetRect.right - 5}px ${window.innerHeight - targetRect.bottom - 5}px ${targetRect.left - 5}px round 8px)`,
        pointerEvents: 'none',
        transition: 'clip-path 0.3s ease-in-out'
    };

    const tooltipStyle = {
        position: 'fixed',
        top: targetRect.bottom + 12,
        left: targetRect.left,
        maxWidth: '300px',
        backgroundColor: 'var(--bg-panel)',
        color: 'var(--text-main)',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid var(--primary-accent)',
        zIndex: 9999,
        boxShadow: '0 5px 20px rgba(0,0,0,0.4)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s, transform 0.3s'
    };

    return (
        <>
            <div style={overlayStyle}></div>
            <div style={tooltipStyle}>
                <p style={{margin: 0, lineHeight: 1.6}}>{stepData.message}</p>
                <button onClick={() => setIsVisible(false)} style={{marginTop: '1rem', fontSize: '12px', background: 'none', border: 'none', color: 'var(--text-subtle)', textDecoration: 'underline', cursor: 'pointer'}}>閉じる</button>
            </div>
        </>
    );
};