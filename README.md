# Form-LP-sekokan

施工管理経験者向け、メーカー特化型転職支援サービスのステップフォームLP（GIVE CREATION）。

## 構成

```
dist/
  index.html      LP本体（5ステップのフォーム）
  styles.css
  app.js          ステップ遷移・企業ロゴスライダー
  background.svg  図面のトンボ（フォーム背景のワンポイント装飾）
  kv.webp         FVの人物写真（透過・900x1099 / 85KB）
kyujin/        取引企業ロゴ（LPから参照）
logo-transparent.png  GIVE CREATION ロゴ（透過PNG／LPから参照）
logo.jpg              ロゴ原本（白背景JPEG・LPからは未参照）
```

## ローカルで確認する

`dist/index.html` はリポジトリルートの `logo-transparent.png` と `kyujin/` を `../` で参照しているため、
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

## FVの人物写真

`dist/kv.webp` は原本 `kv-original.png`（8228x5485 / 13MB・透過PNG）を
被写体でトリミングし、900px幅のWebPへ変換したもの（85KB）。
原本はリポジトリに含めていない。差し替える場合は同じ手順で軽量化すること。

## リポジトリに含めていないもの

調査・作業用のため、以下は `.gitignore` で除外しています。

- `competition/` — 競合5社サイトのローカルミラー（他社著作物のため非公開）
- `outputs/` — 社内向け成果物
- `kyujin/*.txt` — 求人票の原文
- `kyujin/seibu.png` — LPで未使用
