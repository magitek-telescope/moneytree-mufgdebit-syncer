# MUFG Debit to MoneyTree sync program

MUFG デビットの利用ログをうまい具合に MoneyTree に同期する怒られたら消えるプログラムです。

必要な環境変数

```
export MONEYTREE_TOKEN=Authヘッダーのトークン
export MONEYTREE_APIKEY=HeaderにAPIキーとしてついている方
export MUFG_ID=UFGのWebサイトのID
export MUFG_PASSWORD=UFGのWebサイトのパスワード
export TARGET_YEAR=同期したい年
export TARGET_MONTH=同期したい月
```
