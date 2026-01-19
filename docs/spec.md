# 設計書・実装計画書: Sonar

## 1. 概要
ユーザーが「明確にしたいこと／言語化したいこと／スタンスを整理したいこと」を入力し、段階的な質問（5問ずつ）に答えることで、最終的に詳細な診断レポートを生成するシステム。Next.js + Supabase + OpenRouter (gemini-3-flash) を採用する。

## 2. 目的とゴール
- 目的: ユーザーの内省を支援し、思考の構造化とスタンスの明確化を促進する。
- ゴール: 100問で最終レポートを生成。

## 3. 機能要件
### 3.1 入力
- 目的 (短文)
- 背景情報 (長文)
- 参考資料アップロード (PDFはフロントエンドでテキスト化し、背景情報に追記)
- PDFテキストは「文字をペーストする」のと同等の扱いとする

### 3.2 質問フロー
- 5問ずつ生成 → 5問回答 → 分析生成と次の5問生成を並列実行
- 100問で最終レポート生成
- 途中で中断可能、任意タイミングで再開可能
- 100問後も追加質問を選べる

### 3.3 回答形式
- 1問につき3択
- 3択は「YES/分からない/NO」ではなく、微妙な立場を表現する選択肢をAIが生成
- 選択肢は文章で明示 (例: 「嫌いではないが最近距離を取りたい」)

### 3.4 分析とレポート
- 5問回答ごとに500文字程度の分析
- 最終レポートは詳細で、共感的かつ洞察的
- 最終レポート内で質問番号を引用表記 (例: [56])
- 印刷用ページに遷移可能

### 3.5 セッション管理
- セッションIDをCookie or LocalStorageに保存
- 同一デバイスから再開可能
- DB側にセッション/回答/分析/レポートを保存
- 一覧から再開できるUI
- レポート生成後も「追加質問を続ける」選択肢を保持

## 4. 非機能要件
- スマホファースト (縦1列フロー)
- 表示パフォーマンス: 1画面内の質問は最大で直近20件程度
- セキュリティ: APIキーはサーバー側のみ保持
- PDFの生ファイルはサーバーに保存しない

## 5. UX/UI設計
### 5.1 レイアウト
- 1列フロー型 (Googleフォームに近い)
- 5問ごとに「分析ブロック」が挿入される
- 質問は上から積み上がる形式

### 5.1.1 画面構成 (想定ルート)
- / : 目的/背景入力 + セッション一覧 (再開)
- /session/:id : 質問フロー画面
- /report/:id : レポート閲覧
- /report/:id/print : 印刷用

### 5.2 操作性
- 回答はタップ一発
- 回答修正可能 (過去の回答は変更可。ただし後続質問の再生成はしない)
- 次の質問生成時は「空ボックス（モック）」が表示され、生成感を演出
- 5問回答後、分析ブロックは直近の回答群の直下に挿入
- 進捗は「現在の質問番号/100」として常時表示

### 5.3 レポート
- セッション完了後に「レポート画面」へ遷移
- 印刷用専用ページ (/report/:id/print)

### 5.4 体験設計の指針
- 雑な装飾は避け、情報構造に沿った余白・階層・タイポグラフィで品質を出す
- フォームの進行状況が視覚的に分かるよう、進捗バーと「今いる区間」を明示
- 「次の質問が生成中」であることを、空のカードや薄いプレースホルダーで示す

## 6. システム構成
### 6.1 フロントエンド
- Next.js (App Router)
- Tailwind CSS または CSS Modules (デザイン要件に合わせて調整)
- 状態管理: React state + server actions (必要に応じて軽量ストア)

### 6.2 バックエンド
- Next.js Route Handlers
- OpenRouter APIで gemini-3-flash を利用

### 6.3 データベース
- Supabase Postgres

### 6.4 アクセス方針
- クライアントはDBへ直接アクセスしない
- 全てNext.js API経由で読み書きし、サーバー側で認可と検証を行う
- session_id を基準にアクセスを制御

### 6.5 ファイル処理
- PDFはフロントエンドでテキスト抽出し、背景情報に追記
- サーバーにはPDF/抽出テキストの保存を行わない
- 抽出されたテキストは background_text に統合して保存

## 7. データモデル (案)
### sessions
- id (uuid)
- title (text)
- purpose (text)
- background_text (text)
- phase_profile (jsonb)
- created_at, updated_at

### questions
- id (uuid)
- session_id (uuid)
- question_index (int)
- statement (text)
- detail (text)
- options (jsonb)
- phase (text)
- created_at

### answers
- id (uuid)
- question_id (uuid)
- session_id (uuid)
- selected_option (text)
- created_at

### analyses
- id (uuid)
- session_id (uuid)
- batch_index (int)
- start_index (int)
- end_index (int)
- analysis_text (text)
- created_at

### reports
- id (uuid)
- session_id (uuid)
- version (int)
- report_text (text)
- created_at

### 7.1 インデックス/制約
- questions: unique(session_id, question_index)
- answers: unique(session_id, question_id)
- analyses: unique(session_id, batch_index)
- reports: unique(session_id, version)

## 8. 質問生成ロジック
### 8.1 フェーズ制御
- 探索フェーズ: 幅広く問題領域をカバー
- 深掘りフェーズ: 重要領域を掘り下げる

### 8.2 例: 100問のフェーズ割り当て
- Q1-15: 探索
- Q16-30: 深掘り
- Q31-45: 探索
- Q46-60: 深掘り
- Q61-75: 探索
- Q76-90: 深掘り
- Q91-100: 探索

※ phase_profile をJSONで持ち、後からチューニング可能にする。

### 8.3 生成タイミング
- セッション開始時に最初の5問を生成
- 5問すべて回答されたら、分析生成と次の5問生成を並列で開始
- UIは分析ブロックを先に表示し、質問は到着次第表示
- 100問完了でレポート生成 (以降は「追加質問」モード)

### 8.4 追加質問モード
- report.version を上げて再生成
- 追加質問は同様に5問ずつ

### 8.5 コンテキスト制御
- 目的/背景は常に全文を送る
- 過去の質問/回答は全量を送る

## 9. プロンプト設計
- 以下はイメージを共有するための仮であり、本実装ではよりプロンプトを精緻に設計する！

### 9.1 質問生成プロンプト (骨子)
- 目的と背景情報を常に含める
- 全体目的に対するカバレッジを意識するよう指示
- 「今は探索フェーズ/深掘りフェーズ」であることを明示
- 5問セットで生成
- 1問あたり: statement 30-50文字 / detail 80-120文字 / 選択肢3つ
- 回答選択肢はニュアンスの違いを出し、YES/NOに直結しない設計

### 9.2 出力フォーマット
```
{
  "questions": [
    {
      "statement": "...",
      "detail": "...",
      "options": ["...", "...", "..."]
    }
  ]
}
```

### 9.3 質問生成プロンプト (サンプル)
```
あなたは内省支援の質問設計者です。
目的: {{purpose}}
背景情報: {{background_text}}
これまでの質問/回答: {{qa_full}}
現在のフェーズ: {{phase}} (探索/深掘り)
今生成する質問番号の範囲: {{start_index}}-{{end_index}}

指針:
- 常に全体目的を俯瞰し、カバレッジの欠落を埋める
- 直近の回答に引っ張られすぎない
- 探索フェーズは広い切り口、深掘りフェーズは具体性重視
- statementは30-50文字、detailは80-120文字
- 3つの選択肢は「YES/NO/不明」ではなく、スタンスの幅を表現

出力は次のJSON形式のみ:
{ \"questions\": [ {\"statement\": \"...\", \"detail\": \"...\", \"options\": [\"...\",\"...\",\"...\"] } ] }
```

### 9.4 分析プロンプト
```
目的: {{purpose}}
背景情報: {{background_text}}
対象質問: {{start_index}}-{{end_index}}
質問と回答: {{qa_block}}

指針:
- 500文字程度
- 共感的で、矛盾や揺らぎも丁寧に扱う
- 次の探索/深掘り方向を1-2文で示す
```

### 9.5 最終レポートプロンプト
```
目的: {{purpose}}
背景情報: {{background_text}}
質問と回答の全文: {{qa_full}}
全文の引用元質問番号を参照しながら書く

構成:
1) 概観 (現在のスタンスを短く言語化)
2) 価値観/関心の軸 (引用付き)
3) 迷い・葛藤 (引用付き)
4) 一貫性のある選択肢 (具体的アクション)
5) まとめ (励ましと次の一歩)

引用形式: [56] のように質問番号を付ける
```

## 10. API設計 (案)
- POST /api/sessions : セッション作成
- POST /api/questions/generate : 次の5問生成
- POST /api/answers : 回答保存
- POST /api/analysis/generate : 5問分析生成
- POST /api/report/generate : 最終レポート生成
- GET /api/sessions/:id : セッション状態取得

### 10.1 代表的なAPIペイロード (例)
- POST /api/sessions
  - request: { purpose, background_text }
  - response: { session_id }
- POST /api/questions/generate
  - request: { session_id, start_index, end_index }
  - response: { questions }

## 11. 実装計画
### Phase 1: 基盤構築
- Next.js プロジェクト初期化
- Supabase プロジェクト作成
- DBスキーマ作成
- ローカルでAPIキー管理

### Phase 2: セッション作成フロー
- 目的/背景入力UI
- PDFアップロード + フロントエンドでテキスト抽出
- セッションID保存

### Phase 3: 質問生成・回答UI
- 質問カードUI
- 5問生成 API
- 回答保存

### Phase 4: 分析生成
- 5問回答後に分析生成
- 分析ブロック表示

### Phase 5: 最終レポート
- 100問完了時にレポート生成
- レポート画面/印刷ページ

### Phase 6: 継続・中断機能
- セッション再開UI
- 追加質問のオプション

### Phase 7: 仕上げ
- 印刷レイアウト調整
- エラー時のUX改善
- 診断レポートの品質調整
- リトライ/タイムアウト設計 (OpenRouter)

## 12. テスト計画
- 質問生成APIの出力形式テスト
- セッション再開のE2E
- レポート生成の整合性チェック
- PDFテキスト抽出 (フロントエンド) の再現性確認
