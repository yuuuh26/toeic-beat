# TOEIC BEAT

音楽に合わせて英単語を見て・聞いて・選ぶ、個人用PWA。

- 500語、100語ずつ5段階。品詞・IPA・日本語訳・例文2個・訳・コロケーション。
- オリジナルの短い例文。公式出題頻度に基づくランクではなく、独自の学習順序。
- Web Audioによる5曲のオリジナルBGM。発音・BGM・SEの音量は独立。
- EASY 4秒 / NORMAL 3秒 / HARD 2秒 / EXPERT 1.5秒。10・20・30・50問。
- PERFECTは猶予35%以内、GREATは70%以内、GOODは期限内。境界到達時はMISS。
- 不正解後600ms、正解後300msを基本に、近い半拍へ最大180ms調整。
- 回答ごとのIndexedDB保存。一時停止・非表示タブへの切り替えでタイマーを停止。
- 未学習・苦手の重み付け出題。同一プレイ内で重複なし。苦手が不足すると問題数を縮小。
- PWA、オフラインキャッシュ、専用アイコン、noindex/nofollow。

## 使い方

Chromeでページを開いてSTART。ホーム画面追加はChromeメニューから。
WORDSで単語詳細を開き、HISTORYで過去の結果を確認できます。
PCでは1〜4キーで回答、Escapeで一時停止できます。

発音は端末・ブラウザの英語音声に依存します。ローカル英語音声を優先し、利用できなければ他の英語音声を使います。音声によっては単語文字列が音声提供元へ送られます。学習履歴は送信しません。発音の開始時刻・品質・オフライン可否は端末依存です。

初回STARTで永続保存を申請し、設定画面で再申請できます。許可はブラウザが判断します。ブラウザのデータ削除や機種変更には耐えません。バックアップ出力は初期版の範囲外です。

## GitHub Pages

Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save。
ビルド不要の静的ファイルです。`.nojekyll`を含みます。

## 開発・検証

```sh
python3 -m http.server 8765
node --test tests/core.test.js
python3 tools/build_words.py --check
```

`data/level*.txt`はオリジナルの日英コロケーション原稿です。`tools/build_words.py`で独立した`words.json`を生成します。短文テンプレートに合わない用法は`data/example-overrides.json`で完全な例文を定義しています。単語追加時は収録数の検証と学習範囲の表示を調整してください。

- `app.js`: 画面とゲーム状態
- `core.js`: 判定・出題・統計（DOM非依存）
- `db.js`: バージョン1のIndexedDB、`yuu-toeic-beat`
- `audio.js` / `tracks.js`: 音響制御 / 楽曲定義
- `sw.js`: アプリ専用キャッシュ。更新時はVERSIONを増やします。プレイ中に強制更新しません。

IndexedDBを削除するコードはありません。将来のDB変更はバージョンを増やして移行してください。他のGitHub Pagesアプリと同一オリジンでもDB名とキャッシュ接頭辞は固有です。

## 検証範囲

`tests/core.test.js`は語数・例文・選択肢・判定境界・出題・統計・曲定義を検証します。実機のスピーカー、Bluetooth遅延、音声合成の発声開始は自動テストでは保証できません。

## 参照したAPI仕様

- [永続保存](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)
- [ローカル音声の判別](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService)

TOEICの公式教材ではなく、スコア達成を保証するものではありません。既存教材や市販音源の転載はありません。
