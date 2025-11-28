# Keiba-RaceGuess

# 初回起動時にマイグレーションが必要な場合
python manage.py migrate

#　開発サーバーの起動
python manage.py runserver
正常に動作すれば、通常は http://127.0.0.1:8000/ でアクセスできます。



# 1. マイグレーションファイルを作成（設計図を作る）
python manage.py makemigrations

# 2. マイグレーションを実行（実際にデータベースに反映）
python manage.py migrate
