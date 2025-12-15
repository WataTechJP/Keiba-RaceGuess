# Keiba Battle (競馬予想バトル)※仮称

競馬の予想を投稿し、ユーザー同士でバトルできるWebアプリケーションです。Django REST Frameworkで構築されたバックエンドAPIと、React Native (Expo)で構築されたモバイルアプリケーションで構成されています。

## 📋 目次

- [使用技術スタック](#使用技術スタック)
- [プロジェクト構造](#プロジェクト構造)
- [セットアップ](#セットアップ)
- [開発サーバーの起動](#開発サーバーの起動)
- [データベース](#データベース)
- [APIエンドポイント](#apiエンドポイント)

## 🛠 使用技術スタック

### バックエンド
- **Python 3.11+**
- **Django 5.2.1** - Webフレームワーク
- **Django REST Framework 3.16.1** - RESTful API構築
- **django-cors-headers** - CORS設定
- **django-tailwind 4.2.0** - Tailwind CSS統合
- **django-extensions 4.1** - 開発支援ツール
- **SQLite3** - データベース（開発環境）

### フロントエンド（モバイルアプリ）
- **React Native 0.81.5**
- **Expo ~54.0.25** - React Native開発プラットフォーム
- **Expo Router 6.0.15** - ファイルベースルーティング
- **TypeScript 5.9.2**
- **Axios 1.13.2** - HTTPクライアント
- **React Navigation 7.x** - ナビゲーション
- **@react-native-async-storage/async-storage 2.2.0** - ローカルストレージ

### その他
- **Tailwind CSS 3.4.17** - CSSフレームワーク

## 📁 プロジェクト構造

```
keiba_battle/
├── api/                          # REST APIアプリケーション
│   ├── models.py                 # API用モデル
│   ├── serializers.py            # DRFシリアライザー
│   ├── views.py                  # APIビュー
│   └── urls.py                   # APIルーティング
│
├── keiba_battle/                 # Djangoプロジェクト設定
│   ├── settings.py               # プロジェクト設定
│   ├── urls.py                   # メインURL設定
│   ├── wsgi.py                   # WSGI設定
│   └── asgi.py                   # ASGI設定
│
├── prediction/                   # 予想機能アプリ
│   ├── models.py                 # データモデル（Race, Horse, Prediction等）
│   ├── views.py                  # ビュー関数
│   ├── forms.py                  # フォーム
│   ├── urls.py                   # URLルーティング
│   ├── signals.py                # Djangoシグナル
│   ├── utils.py                  # ユーティリティ関数
│   └── management/
│       └── commands/
│           └── import_horses.py  # カスタム管理コマンド
│
├── theme/                        # テーマ/UIアプリ
│   ├── templates/                # HTMLテンプレート
│   │   ├── home.html
│   │   ├── submit.html
│   │   ├── timeline.html
│   │   └── ...
│   ├── static/                   # 静的ファイル（CSS, 画像）
│   └── views.py                  # テンプレートビュー
│
├── mobile/                       # React Nativeモバイルアプリ
│   ├── app/                      # Expo Routerアプリ構造
│   │   ├── (auth)/               # 認証関連画面
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── (tabs)/               # タブナビゲーション画面
│   │       ├── home.tsx
│   │       ├── predictions.tsx
│   │       ├── submit.tsx
│   │       ├── timeline.tsx
│   │       └── friends.tsx
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts         # APIクライアント設定
│   │   ├── components/           # 再利用可能コンポーネント
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # 認証コンテキスト
│   │   ├── types/                # TypeScript型定義
│   │   └── constants/
│   │       └── colors.ts         # カラーパレット
│   ├── android/                  # Androidネイティブコード
│   ├── ios/                      # iOSネイティブコード
│   ├── package.json              # 依存関係
│   └── app.json                  # Expo設定
│
├── media/                        # アップロードされたメディアファイル
│   └── profile_images/           # ユーザープロフィール画像
│
├── db.sqlite3                    # SQLiteデータベースファイル
├── manage.py                     # Django管理スクリプト
├── requirements.txt              # Python依存関係（要作成）
├── package.json                  # ルートパッケージ（Tailwind用）
└── README.md                     # このファイル
```

## 🚀 セットアップ

### 前提条件

- Python 3.11以上
- Node.js 18以上
- npm または yarn
- Expo CLI（グローバルインストール推奨）

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd keiba_battle
```

### 2. バックエンドのセットアップ

#### 2.1 仮想環境の作成と有効化

```bash
# 仮想環境を作成
python3 -m venv venv

# 仮想環境を有効化
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate
```

#### 2.2 依存関係のインストール

```bash
pip install django==5.2.1
pip install djangorestframework==3.16.1
pip install django-cors-headers
pip install django-tailwind==4.2.0
pip install django-extensions==4.1

# または、requirements.txtがある場合
pip install -r requirements.txt
```

#### 2.3 データベースのセットアップ

```bash
# マイグレーションファイルを作成
python manage.py makemigrations

# マイグレーションを実行（データベースを作成）
python manage.py migrate

# スーパーユーザーを作成（管理画面用）
python manage.py createsuperuser
```

### 3. フロントエンド（モバイルアプリ）のセットアップ

#### 3.1 依存関係のインストール

```bash
cd mobile
npm install
# または
yarn install
```

#### 3.2 iOS依存関係のインストール（iOS開発者のみ）

```bash
cd ios
pod install
cd ..
```

## 🖥 開発サーバーの起動

### バックエンドサーバーの起動

```bash
# 仮想環境を有効化していることを確認
source venv/bin/activate  # macOS/Linux
# または
# venv\Scripts\activate  # Windows

# 開発サーバーを起動
python manage.py runserver

# 特定のポートで起動する場合
python manage.py runserver 8000

# すべてのネットワークインターフェースで起動（モバイルデバイスからアクセス可能）
python manage.py runserver 0.0.0.0:8000
```

サーバーが起動すると、以下のURLでアクセスできます：
- **API**: http://127.0.0.1:8000/api/
- **管理画面**: http://127.0.0.1:8000/admin/
- **Web UI**: http://127.0.0.1:8000/

### React Native（Expo）開発サーバーの起動

```bash
cd mobile

# 開発サーバーを起動
npm start
# または
yarn start
# または
expo start

# iOSシミュレーターで起動
npm run ios
# または
expo start --ios

# Androidエミュレーターで起動
npm run android
# または
expo start --android

# Webブラウザで起動
npm run web
# または
expo start --web
```

**注意**: モバイルアプリからバックエンドAPIにアクセスする場合、`mobile/app.json`の`extra.apiUrl`を適切に設定してください。また、`keiba_battle/settings.py`の`CORS_ALLOWED_ORIGINS`にモバイルアプリのURLを追加する必要があります。

## 💾 データベース

### データベースの種類

このプロジェクトは**SQLite3**を使用しています（開発環境）。データベースファイルは`db.sqlite3`に保存されます。

### データベースの操作

#### マイグレーション

```bash
# モデル変更後にマイグレーションファイルを作成
python manage.py makemigrations

# マイグレーションを実行
python manage.py migrate

# 特定のアプリのみマイグレーション
python manage.py makemigrations prediction
python manage.py migrate prediction
```

#### データベースのリセット（開発時）

```bash
# データベースファイルを削除
rm db.sqlite3

# マイグレーションを再実行
python manage.py migrate
```

#### データベースの確認

```bash
# Djangoシェルでデータベースにアクセス
python manage.py shell

# 管理画面で確認
# http://127.0.0.1:8000/admin/ にアクセス
```

### データモデル

主要なモデル：
- **User** - Django標準のユーザーモデル
- **UserProfile** - ユーザープロフィール（画像等）
- **Race** - レース情報
- **Horse** - 馬情報
- **Prediction** - ユーザーの予想
- **Follow** - ユーザー間のフォロー関係
- **PredictionGroup** - 予想グループ
- **GroupPrediction** - グループ内の予想
- **GroupMessage** - グループメッセージ
- **RaceResult** - レース結果
- **UserPoint** - ユーザーのポイント

## 🔌 APIエンドポイント

### 認証

- `POST /api/auth/signup/` - ユーザー登録
- `POST /api/auth/login/` - ログイン（Token認証）
- `POST /api/auth/logout/` - ログアウト

### リソース

- `GET/POST /api/races/` - レース一覧・作成
- `GET/POST /api/predictions/` - 予想一覧・作成
- `GET/POST /api/follows/` - フォロー関係
- `GET/PUT /api/profiles/` - ユーザープロフィール
- `GET/POST /api/groups/` - 予想グループ
- `GET/POST /api/group-predictions/` - グループ予想
- `GET/POST /api/group-messages/` - グループメッセージ
- `GET/POST /api/race-results/` - レース結果
- `GET /api/user-points/` - ユーザーポイント

### 認証方法

APIリクエストにはToken認証を使用します：

```bash
# ログインしてトークンを取得
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'

# トークンを使用してAPIリクエスト
curl -X GET http://127.0.0.1:8000/api/predictions/ \
  -H "Authorization: Token your_token_here"
```

## 🔧 その他のコマンド

### Django管理コマンド

```bash
# カスタムコマンド（馬データのインポート）
python manage.py import_horses <csv_file>

# シェルを起動
python manage.py shell

# 静的ファイルを収集（本番環境用）
python manage.py collectstatic
```

### 開発ツール

```bash
# Django Extensionsのシェルプラス
python manage.py shell_plus

# データベースのER図を生成（Graphvizが必要）
python manage.py graph_models -a -o models.png
```

## 📝 注意事項

1. **CORS設定**: モバイルアプリからAPIにアクセスする場合、`keiba_battle/settings.py`の`CORS_ALLOWED_ORIGINS`を適切に設定してください。

2. **API URL設定**: モバイルアプリの`mobile/app.json`の`extra.apiUrl`をバックエンドサーバーのURLに合わせて設定してください。

3. **デバッグモード**: 本番環境では`settings.py`の`DEBUG = False`に設定し、`SECRET_KEY`を適切に管理してください。

4. **メディアファイル**: アップロードされたファイルは`media/`ディレクトリに保存されます。本番環境では適切なストレージサービス（AWS S3等）の使用を推奨します。

## 📚 参考リンク

- [Django公式ドキュメント](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Expo公式ドキュメント](https://docs.expo.dev/)
- [React Native公式ドキュメント](https://reactnative.dev/)

## 📄 ライセンス

（ライセンス情報を記載）
