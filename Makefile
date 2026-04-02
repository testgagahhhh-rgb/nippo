PROJECT_ID := potent-poetry-491707-r8
REGION     := asia-northeast1
SERVICE    := nippo
REGISTRY   := $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(SERVICE)
IMAGE      := $(REGISTRY)/$(SERVICE)
IMAGE_TAG  := $(IMAGE):$(shell git rev-parse --short HEAD)

.PHONY: help build push deploy all dev lint test fmt

help: ## コマンド一覧を表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ── ローカル開発 ──────────────────────────────────────────
dev: ## 開発サーバーを起動
	npm run dev

lint: ## ESLint を実行
	npm run lint

fmt: ## Prettier でフォーマット
	npm run format

test: ## テストを実行
	npm run test

# ── Docker ───────────────────────────────────────────────
build: ## Docker イメージをビルド
	docker build -t $(IMAGE_TAG) -t $(IMAGE):latest .

push: ## Artifact Registry にプッシュ
	docker push $(IMAGE_TAG)
	docker push $(IMAGE):latest

# ── Cloud Run ────────────────────────────────────────────
deploy: ## Cloud Run にデプロイ（IMAGE_TAG を指定してデプロイ）
	gcloud run deploy $(SERVICE) \
		--image $(IMAGE_TAG) \
		--region $(REGION) \
		--project $(PROJECT_ID) \
		--platform managed \
		--allow-unauthenticated

all: build push deploy ## ビルド → プッシュ → デプロイを一括実行

# ── GCP セットアップ ──────────────────────────────────────
setup-gcp: ## Artifact Registry リポジトリを作成
	gcloud artifacts repositories create $(SERVICE) \
		--repository-format=docker \
		--location=$(REGION) \
		--project=$(PROJECT_ID)
	gcloud auth configure-docker $(REGION)-docker.pkg.dev --quiet

logs: ## Cloud Run のログを表示
	gcloud run services logs read $(SERVICE) \
		--region $(REGION) \
		--project $(PROJECT_ID) \
		--limit 100
