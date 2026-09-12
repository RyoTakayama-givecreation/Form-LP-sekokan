# Form-LP-sekokan

施工管理経験者向け、メーカー特化型転職支援サービスのステップフォームLP（GIVE CREATION）。

## 構成

```
dist/
  index.html   LP本体（5ステップのフォーム）
  styles.css
  app.js       ステップ遷移・企業ロゴスライダー
kyujin/        取引企業ロゴ（LPから参照）
logo.jpg       GIVE CREATION ロゴ（LPから参照）
```

## ローカルで確認する

`dist/index.html` はリポジトリルートの `logo.jpg` と `kyujin/` を `../` で参照しているため、
**`dist/` 単体ではなくリポジトリルートから配信する**必要があります。

```sh
python3 -m http.server 8000
```

→ <http://localhost:8000/dist/>

`dist/index.html` をファイルとして直接開いても動きますが、配信して確認するのが確実です。

## フォームのステップ

| STEP | 設問 |
| --- | --- |
| 1 | まずは保有資格を教えてください |
| 2 | 直近のご経験を教えてください |
| 3 | いつ頃の転職をお考えですか？ |
| 4 | お住まいの地域と年代を教えてください |
| 5 | 求人のご案内先を入力してください |

現状フロントエンドのみで、送信先は未接続です。

## リポジトリに含めていないもの

調査・作業用のため、以下は `.gitignore` で除外しています。

- `competition/` — 競合5社サイトのローカルミラー（他社著作物のため非公開）
- `outputs/` — 社内向け成果物
- `kyujin/*.txt` — 求人票の原文
- `kyujin/seibu.png` — LPで未使用
