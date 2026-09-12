# Form-LP-sekokan

施工管理経験者向け、メーカー特化型転職支援サービスのステップフォームLP（GIVE CREATION）。

## 構成

```
dist/
  index.html      LP本体（5ステップのフォーム）
  styles.css
  app.js          ステップ遷移・企業ロゴスライダー
  background.svg  図面のトンボ（フォーム背景のワンポイント装飾）
  kv.webp         FVの人物写真（透過・8228x5485／可逆WebP）
  bg.webp         FVの背景写真（空が透過・6120x4084／可逆WebP）
  kv.png/bg.png   上記の元PNG（配信では未使用）
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

## FVの画像

配信しているのは可逆WebPの `kv.webp` / `bg.webp`。元PNGから**解像度は変えていない**。
可逆圧縮なので、アルファと「見える画素（alpha>0）」のRGBは元PNGと完全に一致する。
差分が出るのは完全透明（alpha=0）な箇所の見えないRGB値のみで、表示結果は変わらない。

| | 元PNG | WebP |
| --- | --- | --- |
| bg | 21.6MB | 8.1MB |
| kv | 12.6MB | 4.1MB |
| 合計 | 34.2MB | **12.1MB** |

元PNG（`kv.png` / `bg.png`）は差し替え用に残してあるが、配信では参照していない。

### 人物の窓抜きについて

`kv` は 8228x5485 のキャンバスに対し被写体が `(1753,1249)-(5222,5485)` の 3469x4236 しかなく、
周囲は透明の余白。そのまま置くと被写体が小さくなるため、画像には手を加えず
`.stage-kv` 側で窓抜きして被写体だけを表示している。

**画像を差し替えたら** `.stage-kv` と `.stage-kv img` の4つの数値
（`aspect-ratio` / `width` / `left` / `top`）を新しい被写体の bbox で計算し直すこと。

## リポジトリに含めていないもの

調査・作業用のため、以下は `.gitignore` で除外しています。

- `competition/` — 競合5社サイトのローカルミラー（他社著作物のため非公開）
- `outputs/` — 社内向け成果物
- `kyujin/*.txt` — 求人票の原文
- `kyujin/seibu.png` — LPで未使用
