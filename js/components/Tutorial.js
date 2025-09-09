
const { useState, useLayoutEffect, useRef, useEffect } = React;

const TUTORIAL_STEPS = [
    {
        title: "ようこそ！",
        text: "「星間の塔 攻略支援ツール」へようこそ！<br>基本的な使い方をいくつかのステップで簡単にご紹介します。",
        selector: null,
    },
    {
        title: "① 3つのモード",
        text: "画面上部でモードを切り替えられます。<br><b>探索</b>：塔を攻略します。<br><b>計画</b>：攻略計画を立てます。<br><b>ログ</b>：過去の記録を閲覧します。",
        selector: ".header-modes",
        position: "bottom",
    },
    {
        title: "② マップ画面",
        text: "こちらが塔のマップです。各マスをタップすると、そのマスの詳細情報が表示されます。",
        selector: ".left-panel",
        position: "right",
    },
    {
        title: "③ マップ詳細とアクション",
        text: "マスをタップすると、右側に詳細が表示されます。ここで「戦闘」や「探索」などのアクションを実行します。",
        selector: ".right-panel",
        position: "left",
    },
    {
        title: "④ 所持メギド管理",
        text: "「所持メギド」タブでは、手持ちのメギドを登録します。登録したメギドは、編成作成時に一覧で表示されます。",
        selector: ".tab-content",
        position: "bottom",
        action: (props) => props.setActiveTab('ownership'),
    },
    {
        title: "⑤ 編成管理",
        text: "「編成」タブでは、塔に挑戦するパーティを管理します。QRコードでのインポート・エクスポートも可能です。",
        selector: ".tab-content",
        position: "bottom",
        action: (props) => props.setActiveTab('formation'),
    },
    {
        title: "チュートリアル完了",
        text: "基本的な説明は以上です！設定画面からいつでもデータのエクスポートが可能です。それでは、良き星間探索を！",
        selector: null,
        action: (props) => props.setActiveTab('details'),
    }
];

const Tutorial = ({ onClose, setActiveTab, onStepChange }) => {
    const [step, setStep] = useState(0);
    const [highlightStyle, setHighlightStyle] = useState({ display: 'none' });
    const [dialogStyle, setDialogStyle] = useState({});
    const dialogRef = useRef(null);

    const currentStep = TUTORIAL_STEPS[step];

    useEffect(() => {
        if (onStepChange) {
            onStepChange(step);
        }
    }, [step, onStepChange]);

    useLayoutEffect(() => {
        if (currentStep.action) {
            currentStep.action({ setActiveTab });
        }

        const targetSelector = currentStep.selector;
        if (!targetSelector) {
            setHighlightStyle({ display: 'none' });
            setDialogStyle({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            });
            return;
        }

        setTimeout(() => {
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                setHighlightStyle({
                    top: `${rect.top - 4}px`,
                    left: `${rect.left - 4}px`,
                    width: `${rect.width + 8}px`,
                    height: `${rect.height + 8}px`,
                    display: 'block',
                });

                if (dialogRef.current) {
                    const dialogRect = dialogRef.current.getBoundingClientRect();
                    let top, left;
                    const offset = 16;

                    switch (currentStep.position) {
                        case 'bottom':
                            top = rect.bottom + offset;
                            left = rect.left + rect.width / 2 - dialogRect.width / 2;
                            break;
                        case 'top':
                            top = rect.top - dialogRect.height - offset;
                            left = rect.left + rect.width / 2 - dialogRect.width / 2;
                            break;
                        case 'left':
                            top = rect.top + rect.height / 2 - dialogRect.height / 2;
                            left = rect.left - dialogRect.width - offset;
                            break;
                        case 'right':
                        default:
                            top = rect.top + rect.height / 2 - dialogRect.height / 2;
                            left = rect.right + offset;
                            break;
                    }
                    
                    const margin = 10;
                    if (top < margin) top = margin;
                    if (left < margin) left = margin;
                    if (left + dialogRect.width > window.innerWidth - margin) {
                        left = window.innerWidth - dialogRect.width - margin;
                    }
                    if (top + dialogRect.height > window.innerHeight - margin) {
                        top = window.innerHeight - dialogRect.height - margin;
                    }

                    setDialogStyle({ top: `${top}px`, left: `${left}px`, transform: 'none' });
                }
            } else {
                 setHighlightStyle({ display: 'none' });
                 setDialogStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
            }
        }, 150);

    }, [step, setActiveTab]);

    const handleNext = () => {
        if (step < TUTORIAL_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div className="tutorial-overlay">
            <div className="tutorial-highlight-hole" style={highlightStyle}></div>
            <button className="tutorial-skip-button" onClick={onClose}>チュートリアルをスキップ</button>
            <div className="tutorial-container">
                <div className="tutorial-dialog" ref={dialogRef} style={dialogStyle}>
                    <h3>{currentStep.title}</h3>
                    <p dangerouslySetInnerHTML={{ __html: currentStep.text }}></p>
                    <div className="tutorial-navigation">
                        <span className="step-counter">{step + 1} / {TUTORIAL_STEPS.length}</span>
                        <div className="nav-buttons">
                            {step > 0 && <button onClick={handlePrev}>戻る</button>}
                            <button onClick={handleNext} className="primary">
                                {step === TUTORIAL_STEPS.length - 1 ? '完了' : '次へ'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
