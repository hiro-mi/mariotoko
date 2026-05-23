# docs

このディレクトリには、「スーパーマリ漢＜OTOKO＞」の詳細仕様を置きます。`AGENTS.md` は作業方針と憲章に集中し、ゲーム内容や技術仕様の詳細はここで管理します。

## ドキュメント一覧

- [game-design.md](game-design.md): ゲーム全体のコンセプト、画面遷移、初期完成版の範囲。
- [gameplay-rules.md](gameplay-rules.md): 操作、移動、ジャンプ、敵踏み、パワーアップ、漢ボール、被弾、落下、残機などのプレイルール。
- [content-spec.md](content-spec.md): スタート画面、足跡3行、ステージ1、敵、アイテム、クリア演出、UI文言の内容方針。
- [technical-design.md](technical-design.md): HTML/CSS/JavaScript、Canvas 2D、ディレクトリ構成、依存関係、オフライン方針。
- [verification.md](verification.md): 手動確認チェックリストと初期完成版の受け入れ条件。
- [plans/README.md](plans/README.md): 実装前の計画と実装後の記録の運用ルール。

## 恒久仕様と実装計画

`docs/` 直下の仕様書は、ゲームや技術方針として継続的に参照する内容を扱います。

一方、`docs/plans/` は作業単位ごとの実装計画を扱います。これから実装する計画は `docs/plans/active/` に置き、実装が完了したら `docs/plans/completed/` に移動して、実装結果と確認内容を追記します。

## 更新ルール

- ゲーム全体の流れや完成条件を変える場合は `game-design.md` を更新する。
- 操作、移動、ジャンプ、漢ボール、被弾、落下、残機の扱いを変える場合は `gameplay-rules.md` を更新する。
- スタート画面、足跡3行、ステージ、敵、アイテム、クリア演出の内容を変える場合は `content-spec.md` を更新する。
- ファイル構成、実装方式、依存関係、起動方法を変える場合は `technical-design.md` を更新する。
- 動作確認項目や受け入れ条件を変える場合は `verification.md` を更新する。
- 実装に入る前の作業計画は `plans/active/` に追加する。
- 実装が完了した計画は `plans/completed/` に移動し、結果と確認内容を追記する。
- 作業者向けの恒久的な方針を変える場合は `AGENTS.md` も更新する。

仕様と実装が食い違った場合は、実装時点の判断をドキュメントに反映して、次の作業者が同じ判断を繰り返さなくてよい状態にします。
