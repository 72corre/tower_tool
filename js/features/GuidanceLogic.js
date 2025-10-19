const STYLE_MAP = {
    RUSH: 'ラッシュ',
    COUNTER: 'カウンター',
    BURST: 'バースト'
};

const TUTORIAL_GUIDE_FLOW = [
  {
    stepId: "WELCOME_MODAL",
    type: "modal",
    title: "星間の塔へようこそ！",
    content: "このガイドでは、星間の塔の基本的な攻略法と、このツールの使い方を解説します。",
  },
  {
    stepId: "REGISTER_MEGIDO_SPOTLIGHT",
    type: "spotlight",
    selector: {
      desktop: "#tab-button-ownership",
      mobile: "#mobile-ownership-tab-button",
    },
    text: "まずは「所持メギド管理」タブを開いて、あなたが持っているメギドを登録しましょう。登録後、別のタブに移動するとガイドが次に進みます。",
    advance_condition: (state) => state.ownedMegidoIds.size > 0 && state.activeTab !== 'ownership',
  },
  {
    stepId: "SUGGEST_TARGET_FLOOR_MODAL",
    type: "modal",
    title: "目標階層の決定",
    content: (state) => `あなたの戦力から、目標として${state.recommendedFloor || 5}階の攻略をおすすめします。この階を目標に設定しますか？`,
    options: ["はい、設定する", "いいえ、やめておく"],
    action: (choice, state) => {
      if (choice === "はい、設定する") {
        state.handleTargetFloorChange(state.recommendedFloor || 5);
        return true; // advance
      }
      return false; // don't advance
    },
  },
  {
    stepId: "INITIAL_BOSS_PLANNING_MODAL",
    type: "modal",
    title: "序盤ボスの予習",
    content: "1階と5階のボスに対する編成を事前に計画しましょう。両方の計画を立ててから「完了」ボタンを押してください。",
    options: ["1階のボス", "5階のボス", "完了"],
    action: (choice, state) => {
      if (choice === "1階のボス") {
        state.openBossPlannerForFloor(1);
        return false;
      }
      if (choice === "5階のボス") {
        state.openBossPlannerForFloor(5);
        return false;
      }
      if (choice === "完了") {
        return true; // advance
      }
    },
  },
  {
    stepId: "EXPLAIN_CONDITION_MODAL",
    type: "modal",
    title: "最重要：コンディション管理",
    content: `星間の塔では、メギドの「コンディション」を管理し、有利な状態を維持することが攻略の鍵です。

コンディションは戦闘や探索で減少します。戦闘では1段階、探索では2段階減少します。

コンディションの状態は、以下のアイコンで表されます。

- ![絶好調](asset/絶好調.png) 絶好調
- ![好調](asset/好調.png) 好調
- ![普通](asset/普通.png) 普通

減少したコンディションは「コンディション回復マス」で回復させることが可能です。コンディション回復は、攻略において非常に価値が高い行動です。`,
  },
  {
    stepId: "GO_TO_MAP_SPOTLIGHT",
    type: "spotlight",
    selector: {
      desktop: "#tab-button-details",
      mobile: "#mobile-details-tab-button",
    },
    text: "それでは、実際にマップを見てみましょう。「マップ」タブをタップしてください。",
    advance_condition: (state) => state.activeTab === 'details',
  },
  {
    stepId: "CHECK_RECOVERY_SQUARE_SPOTLIGHT",
    type: "spotlight",
    selector: '[data-square-id="f1-e2"]',
    text: "これがコンディション回復マスです。どのスタイルのメギドが回復できるかは、挑戦するまで分かりません。まずはタップして確認してみましょう。",
    advance_condition: (state) => state.selectedSquare?.id === 'f1-e2',
  },
  {
    stepId: "RECOVERY_SQUARE_INFO_MODAL",
    type: "modal",
    title: "回復スタイルの確認",
    content: (state) => {
        const recoveryStyle = state.selectedSquare?.square?.style;
        const styleText = STYLE_MAP[recoveryStyle] || '不明';
        let content = `このマスでは【${styleText}】スタイルのメギドが回復できることが分かりましたね。

**【戦略】**
回復できるスタイルが分かっていれば、そのスタイルのメギドで戦闘を行うことで、コンディションの消費を実質ゼロに抑えることができます (戦闘で-1, 回復で+1)。`;

        if (state.ownedMegidoIds.size > 150) {
            content += `

**【上級者向けヒント】**
もし所持メギドが150体を超えているなら、5階のラッシュ回復マスを意識して、1階の回復マスはあえて踏まない選択肢もあります。少人数のラッシュメギドで5階まで攻略し、1階の回復は温存する戦略です。`;
        }
        return content;
    }
  },
  {
    stepId: "GO_TO_TOWER_EFFECT_SPOTLIGHT",
    type: "spotlight",
    selector: '[data-square-id="f1-e1"]',
    text: "次に、この「塔効果マス」を見てみましょう。ここをタップしてください。",
    advance_condition: (state) => state.selectedSquare?.id === 'f1-e1',
  },
  {
    stepId: "EXPLAIN_EXPLORATION_MODAL",
    type: "modal",
    title: "探索の仕組み",
    content: `探索マスでは、最大3体のメギドを選び、メギドごとの「探索力」の合計によって探索の効果が変動します。

探索力 ≒ (攻撃力×素早さ/1000 ＋ HP×防御力/10000) × (1 ＋ 奥義レベル×0.05) × コンディション補正[絶好調=1.3,好調=1.1,普通=1,不調=0.8,絶不調=0.5] × おすすめ補正[合致で1.8]

合計探索力によって期待度および予測効果が事前に表示されます。推奨探索力以上で期待度2、おそらく推奨探索力の1.4倍(3500なら4900、4900なら6300)で期待度3になります。

1階のこの探索マスはラッシュ攻撃力のバフを得られます。探索に出すとメギドのコンディションが2段階減少するので、所持メギドの数に余裕がないうちは期待度3を無理に目指す必要はありません。

**パーティの選択が難しい場合は、「おまかせ探索」ボタンを押すと、手持ちのメギドから最適なパーティを自動で編成してくれます。**`,
  },
  {
    stepId: "SUGGEST_BATTLES_SPOTLIGHT",
    type: "spotlight",
    selector: '[data-square-id="f1-b1"]',
    text: "それでは、最初の戦闘マスに挑戦してみましょう。ここをタップしてください。",
    advance_condition: (state) => state.selectedSquare?.id === 'f1-b1',
  },
  {
    stepId: "EXPLAIN_B1_ENEMY_MODAL",
    type: "modal",
    title: "最初の戦闘：死をあやす者",
    content: `このエネミー（死をあやす者）は、強力な「即死」攻撃を使ってきます。\n\nしかし、前のステップで学んだように、メギドが「絶好調」だと状態異常への耐性が50%上昇します。\n\nこの効果のおかげで、即死攻撃を無効化しやすくなっており、比較的対処しやすくなっています。`,
  },
  {
    stepId: "SPOTLIGHT_RECOMMENDED_MEGIDO",
    type: "spotlight",
    selector: ".recommended-megido-panel",
    text: "ここにおすすめメギドが表示されます。敵の行動への対策や、有効な戦術を持つメギドが提案されるので、編成の参考にしましょう。",
    advance_on_click: true,
  },
  {
    stepId: "SPOTLIGHT_COMMUNITY_FORMATIONS",
    type: "spotlight",
    selector: "#community-formation-button",
    text: "「みんなの編成」ボタンからは、他のユーザーが投稿した編成を参考にできます。手持ちのメギドで組める編成を探すことも可能です。",
    advance_on_click: true,
  },
  {
    stepId: "SPOTLIGHT_CREATE_FORMATION",
    type: "spotlight",
    selector: "#create-formation-button",
    text: "それでは、これらの情報を参考に編成を作成してみましょう。おすすめメギドやみんなの編成をコピーして、あなただけの編成を作ってみてください。",
    advance_condition: (state) => state.formations.length > 0, // 編成が1つ以上作成されたら進む
  },
  {
    stepId: "EXPLAIN_BATTLE_SIMULATION_MODAL",
    type: "modal",
    title: "戦闘結果の記録",
    content: `編成の準備ができましたね！\n\n塔の攻略では、実際に戦闘を行った後、その結果をこのツールに記録します。\nマス詳細画面には3つの選択肢があります。\n\n- **勝利**: コンディションが1段階減少します。\n- **敗北**: コンディションが2段階減少します。\n- **リタイア**: コンディションは変化しません。\n\nこのように、敗北してしまうとコンディションの消耗が激しくなります。勝てないと感じたら、無理せず「リタイア」を選ぶのが賢明です。`,
  },
  {
    stepId: "SPOTLIGHT_SIMULATE_WIN_B1",
    type: "spotlight",
    selector: "#win-button",
    text: "それでは、戦闘結果を記録しましょう。今回は「勝利」ボタンを押してください。",
    advance_condition: (state) => state.runState.history.some(h => h.squareId === 'f1-b1' && h.result === 'win'),
  },
  {
    stepId: "PROMPT_FOR_B2_SPOTLIGHT",
    type: "spotlight",
    selector: '[data-square-id="f1-b2"]',
    text: "素晴らしい！次の戦闘マスに進みましょう。ここをタップしてください。",
    advance_condition: (state) => state.selectedSquare?.id === 'f1-b2',
  },
  {
    stepId: "EXPLAIN_B2_ENEMY_MODAL",
    type: "modal",
    title: "ヒント：ベインチェイサー",
    content: "この敵（ベインチェイサー）も状態異常が厄介ですが、絶好調のメギドは状態異常耐性が50%あることを思い出しましょう。有利に戦いを進められるはずです。",
  },
  {
    stepId: "EXPLAIN_TOWER_POWER_MODAL",
    type: "modal",
    title: "塔破力の回復",
    content: `2回の戦闘で塔破力が減少しましたね。塔破力は、塔の攻略を続けるために必要なリソースです。0になると攻略失敗となります。

「塔効果マス」で回復することができます。`,
  },
  {
    stepId: "GO_TO_TOWER_POWER_RECOVERY_SPOTLIGHT",
    type: "spotlight",
    selector: '[data-square-id="f1-e3"]',
    text: "このマスが塔破力回復マスです。タップして塔破力を回復しましょう。",
    advance_condition: (state) => state.selectedSquare?.id === 'f1-e3',
  },
  {
    stepId: "USE_TOWER_POWER_RECOVERY_SPOTLIGHT",
    type: "spotlight",
    selector: "#resolve-square-button",
    text: "「マスを解決」ボタンを押して、塔破力を回復してください。",
    advance_condition: (state) => state.runState.history.some(h => h.squareId === 'f1-e3'),
  },
  {
    stepId: "GO_TO_CONDITION_RECOVERY_SPOTLIGHT",
    type: "spotlight",
    selector: '[data-square-id="f1-e2"]',
    text: "メギドのコンディションも減少していますね。先ほど確認したコンディション回復マスをタップして、回復しましょう。",
    advance_condition: (state) => state.selectedSquare?.id === 'f1-e2',
  },
  {
    stepId: "USE_CONDITION_RECOVERY_SPOTLIGHT",
    type: "spotlight",
    selector: "#resolve-square-button",
    text: "「マスを解決」ボタンを押して、コンディションを回復してください。",
    advance_condition: (state) => state.runState.history.some(h => h.squareId === 'f1-e2'),
  },
  {
    stepId: "GO_TO_BOSS_SPOTLIGHT",
    type: "spotlight",
    selector: '[data-square-id="f1-o"]',
    text: "これで準備は万端です！1階のボスに挑戦しましょう。ここをタップしてください。",
    advance_condition: (state) => state.selectedSquare?.id === 'f1-o',
  },
  {
    stepId: "EXPLAIN_BOSS_PLANNER_SPOTLIGHT",
    type: "spotlight",
    selector: "#open-boss-planner-button",
    text: "ボスに挑戦する前に、攻略計画を立ててみましょう。このボタンをタップしてください。",
    advance_condition: (state) => state.bossPlannerState.isOpen,
  },
  {
    stepId: "BOSS_PLANNER_GUIDE_TAB_SPOTLIGHT",
    type: "spotlight",
    selector: ".boss-planner-guide-tab",
    text: "ここでは、ボスの詳細な攻略情報や、おすすめメギドを確認できます。まずは「攻略ガイド」タブを見てみましょう。",
    advance_condition: (state) => state.bossPlannerState.activeTab === 'guide',
  },
  {
    stepId: "BOSS_PLANNER_FORMATION_TAB_SPOTLIGHT",
    type: "spotlight",
    selector: ".boss-planner-formation-tab",
    text: "次に、「編成案」タブを見てみましょう。ここでは、おすすめメギドから編成を作成したり、他のユーザーの編成を参考にできます。",
    advance_condition: (state) => state.bossPlannerState.activeTab === 'formation',
  },
  {
    stepId: "BOSS_PLANNER_CLOSE_MODAL",
    type: "spotlight",
    selector: ".boss-planner-close-button",
    text: "攻略計画の確認が終わったら、このボタンでモーダルを閉じてください。",
    advance_condition: (state) => !state.bossPlannerState.isOpen,
  },
  {
    stepId: "CREATE_FORMATION_FOR_BOSS",
    type: "spotlight",
    selector: "#create-formation-button",
    text: "それでは、ボスに合わせた編成を作成しましょう。このボタンをタップしてください。",
    advance_condition: (state) => state.editingFormation,
  },
  {
    stepId: "SAVE_FORMATION_FOR_BOSS",
    type: "spotlight",
    selector: "#save-formation-button",
    text: "編成を保存してください。",
    advance_condition: (state) => !state.editingFormation && state.formations.length >= 3,
  },
  {
    stepId: "SIMULATE_BOSS_WIN",
    type: "spotlight",
    selector: "#win-button",
    text: "ボス戦の結果を「勝利」で記録しましょう。",
    advance_condition: (state) => state.runState.history.some(h => h.squareId === 'f1-o' && h.result === 'win'),
  },
  {
    stepId: "GUIDE_COMPLETE",
    type: "modal",
    title: "1階攻略完了！",
    content: "おめでとうございます！これで1階の攻略が完了しました。基本的な流れは理解できたはずです。2階以降もこの調子で頑張りましょう！",
  },
];