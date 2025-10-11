const { useState, useEffect } = React;

const TUTORIAL_STEPS = [
    {
        title: "ようこそ！",
        text: "「星間の塔 攻略支援ツール」へようこそ！<br>基本的な使い方をいくつかのステップで簡単にご紹介します。",
        action: (props) => {},
    },
    {
        title: "① 3つのモード",
        text: "画面上部でモードを切り替えられます。<br><b>探索</b>：塔を攻略します。<br><b>計画</b>：攻略計画を立てます。<br><b>ログ</b>：過去の記録を閲覧します。",
        action: (props) => {},
    },
    {
        title: "② マップと詳細",
        text: "左に塔のマップ、右に選択したマスの詳細が表示されます。",
        action: (props) => {},
    },
    {
        title: "③ 所持メギド管理",
        text: "下の「所持メギド」タブでは、手持ちのメギドを登録します。まずはここから始めましょう。",
        action: (props) => props.setActiveTab('ownership'),
    },
    {
        title: "④ 編成管理",
        text: "「編成」タブでは、塔に挑戦するパーティを管理します。QRコードでのインポート・エクスポートも可能です。",
        action: (props) => props.setActiveTab('formation'),
    },
    {
        title: "チュートリアル完了",
        text: "基本的な説明は以上です！設定画面からいつでもデータのエクスポートが可能です。それでは、良き戦争を！",
        action: (props) => props.setActiveTab('details'),
    }
];

const Tutorial = ({ onComplete, setActiveTab }) => {
    const [step, setStep] = useState(0);
    const currentStep = TUTORIAL_STEPS[step];

    useEffect(() => {
        if (currentStep && currentStep.action) {
            currentStep.action({ setActiveTab });
        }
    }, [step, setActiveTab]);

    const handleNext = () => {
        if (step < TUTORIAL_STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(s => s - 1);
        }
    };

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000
    };

    const dialogStyle = {
        backgroundColor: '#2d2d2d', // var(--bg-panel)
        color: '#f0f0f0', // var(--text-main)
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #70f0e0', // var(--primary-accent)
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.4)'
    };

    const navStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1.5rem'
    };

    const buttonStyle = {
        background: '#444',
        color: 'white',
        border: '1px solid #666',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: '#70f0e0',
        color: '#1E1E1E',
        borderColor: '#70f0e0'
    };

    if (!currentStep) return null;

    return (
        <div style={overlayStyle}>
            <div style={dialogStyle}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '0.75rem' }}>{currentStep.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: currentStep.text }} style={{ lineHeight: 1.7 }}></p>
                <div style={navStyle}>
                    <span style={{ color: '#9E9E9E' }}>{step + 1} / {TUTORIAL_STEPS.length}</span>
                    <div style={{display: 'flex', gap: '8px'}}>
                        {step > 0 && <button onClick={handlePrev} style={buttonStyle}>戻る</button>}
                        <button onClick={handleNext} style={primaryButtonStyle}>
                            {step === TUTORIAL_STEPS.length - 1 ? '完了' : '次へ'}
                        </button>
                    </div>
                </div>
            </div>
            <button onClick={onComplete} style={{position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer'}}>
                スキップ
            </button>
        </div>
    );
};