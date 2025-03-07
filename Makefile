#!make
.ONESHELL:
.EXPORT_ALL_VARIABLES:
.PHONY: all $(MAKECMDGOALS)

UNAME := $(shell uname)
BASH_PATH:=$(shell which bash)
ROOT_DIR:=${CURDIR}

# Global .env
ifneq ("$(wildcard ${ROOT_DIR}/.env)","")
include ${ROOT_DIR}/.env
endif

VENV_DIR_PATH:=${ROOT_DIR}/.VENV

ifndef REQUIREMENTS_FILE_PATH
REQUIREMENTS_FILE_PATH:=${ROOT_DIR}/requirements.txt
endif

# --- OS Settings --- START ------------------------------------------------------------
# Windows
ifneq (,$(findstring NT, $(UNAME)))
_OS:=windows
VENV_BIN_ACTIVATE:=${VENV_DIR_PATH}/Scripts/activate.bat
endif
# macOS
ifneq (,$(findstring Darwin, $(UNAME)))
_OS:=macos
VENV_BIN_ACTIVATE:=${VENV_DIR_PATH}/bin/activate
endif

ifneq (,$(findstring Linux, $(UNAME)))
_OS:=linux
VENV_BIN_ACTIVATE:=${VENV_DIR_PATH}/bin/activate
endif
# --- OS Settings --- END --------------------------------------------------------------

SHELL:=${BASH_PATH}

# Automatically activate virtual environment if it exists
ifneq (,$(wildcard ${VENV_BIN_ACTIVATE}))
ifeq (${_OS},macos)
SHELL:=source ${VENV_BIN_ACTIVATE} && ${SHELL}
endif
ifeq (${_OS},windows)
SHELL:=${VENV_BIN_ACTIVATE} && ${SHELL}
endif
ifeq (${_OS},linux)
SHELL:=source ${VENV_BIN_ACTIVATE} && ${SHELL}
endif
endif

# --- Pulumi Provider Settings --- START -----------------------------------------------
VERSION         := 0.0.1

ifndef PACKAGE_VERSION
PACKAGE_VERSION:=${VERSION}
endif

PACK            := openai
PROJECT         := github.com/pulumi/pulumi-${PACK}

PROVIDER        := pulumi-resource-${PACK}
CODEGEN         := pulumi-gen-${PACK}
VERSION_PATH    := provider/pkg/version.Version

WORKING_DIR     := $(shell pwd)
SCHEMA_PATH     := ${WORKING_DIR}/schema.json

ifndef DOCKER_IMAGE_TAG
DOCKER_IMAGE_TAG:=${PROJECT_NAME}:${PACKAGE_VERSION}
endif

ifndef SRC_DIR
SRC_DIR:=${ROOT_DIR}/src
endif
# --- Pulumi Provider Settings --- END -------------------------------------------------

# Removes blank rows - fgrep -v fgrep
# Replace ":" with "" (nothing)
# Print a beautiful table with column
help: ## Print this menu
	@echo
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's~:.* #~~' | column -t -s'#'
	@echo
usage: help

# To validate env vars, add "validate-MY_ENV_VAR"
# as a prerequisite to the relevant target/step
validate-%:
	@if [[ -z '${${*}}' ]]; then \
		echo 'ERROR: Environment variable $* not set' && \
		exit 1 ; \
	fi

print-vars: ## Print env vars
	@echo "VENV_BIN_ACTIVATE=${VENV_BIN_ACTIVATE}"
	@echo "REQUIREMENTS_FILE_PATH=${REQUIREMENTS_FILE_PATH}"
	@echo "VENV_DIR_PATH=${VENV_DIR_PATH}"
	@echo "CI=${CI}"
	@echo "PACK=${PACK}"
	@echo "VERSION=${VERSION}"
	@echo "WORKING_DIR=${WORKING_DIR}"

# --- VENV --- START ------------------------------------------------------------
## 
##VENV
##----
prepare: ## Create a Python virtual environment with venv
	python -m venv ${VENV_DIR_PATH} && \
	python -m pip install -U pip wheel setuptools build twine flake8 && \
	ls ${VENV_DIR_PATH}

install-python: ## Install Python packages
## Provide PACKAGE_NAME=<package_name> to install a specific package
## Example: make venv-install PACKAGE_NAME=requests
	@cd ${ROOT_DIR} && \
	if [[ -f "${REQUIREMENTS_FILE_PATH}" ]]; then \
		echo "Installing packages from ${REQUIREMENTS_FILE_PATH}" && \
		ls ${REQUIREMENTS_FILE_PATH} && \
		pip install -r "${REQUIREMENTS_FILE_PATH}" ${PACKAGE_NAME} ; \
	elif [[ -n "${PACKAGE_NAME}" ]]; then \
		echo "Installing package ${PACKAGE_NAME}" ; \
		pip install -U ${PACKAGE_NAME} ; \
	else \
		echo "ERROR: No requirements.txt file found and no package name provided" ; \
		exit 1 ; \
	fi

install-edit: ## Install CLI in editable mode
	cd ${ROOT_DIR} && \
	pip install -e .

requirements-update: ## Update requirements.txt with current packages
	cd ${ROOT_DIR} && \
	pip freeze | grep -v '\-e' > ${REQUIREMENTS_FILE_PATH} && \
	cat ${REQUIREMENTS_FILE_PATH}

venv-freeze: ## List installed packages
	cd ${ROOT_DIR} && \
	pip freeze

venv-test-unittests: ## Run unit tests
	cd ${ROOT_DIR} && \
	python -m unittest discover -s tests -p 'test_*.py'

venv-test: venv-test-unittests

venv-test-clean:
	rm -f ${ROOT_DIR}/tests/data/input/*.output.*

.venv-build: 
	cd ${ROOT_DIR} && \
	rm -rf dist && python -m build --no-isolation .

.venv-publish: 
	cd ${ROOT_DIR} && \
	twine upload dist/* 

.venv-validate-release-package:
	cd ${ROOT_DIR} && \
	twine check ${ROOT_DIR}/dist/*

lint:
	flake8 --ignore=E501 ${SRC_DIR}

run:
	cd ${ROOT_DIR} && \
		python main.py ${RUN_ARGS}
# --- VENV --- END --------------------------------------------------------------

# --- Release --- START ------------------------------------------------------------
##
###Release
##---
validate-release-version: validate-PACKAGE_VERSION 
	cd ${ROOT_DIR} && \
	echo ${PACKAGE_VERSION} > version && \
	scripts/version_validation.sh ${PACKAGE_VERSION}

build-python: .venv-build ## Build the Python package

validate-release-package: .venv-validate-release-package ## Validate the package with twine

publish-python: .venv-publish ## Publish the Python package
# --- Release --- END --------------------------------------------------------------

# --- Docker --- START ------------------------------------------------------------
##
###Docker
##---
docker-build: ## Build the Docker image
	cd ${ROOT_DIR} && \
	docker build -t ${DOCKER_IMAGE_TAG} .

docker-run: ## Run the Docker container
	cd ${ROOT_DIR} && \
	docker run --env-file .env -t -p 5001:5001 -v ${ROOT_DIR}:/app --rm ${DOCKER_IMAGE_TAG} ${RUN_ARGS}
# --- Docker --- END --------------------------------------------------------------

# --- Pulumi Provider --- START ------------------------------------------------------------
##
###Pulumi Provider
##---

dependencies-install: ## Install all provider and SDK dependencies
	@echo "Installing provider dependencies..."
	cd provider/cmd/${PROVIDER} && yarn install
	@echo "Installing code generator dependencies..."
	cd provider/cmd/pulumi-gen-openai && go mod tidy
	@echo "Dependencies installed successfully."

# Ensure all dependencies are installed
ensure:: dependencies-install ## Install Node.js dependencies

generate:: gen_go_sdk gen_dotnet_sdk gen_nodejs_sdk gen_python_sdk ## Generate SDKs for all supported languages

build:: build_provider build_dotnet_sdk build_nodejs_sdk build_python_sdk ## Build provider and SDKs

install:: install_provider install_dotnet_sdk install_nodejs_sdk ## Install provider and SDKs

# Pulumi operations
pulumi-login: ## Login to Pulumi
	pulumi login

example-simple-install: install_provider ## Install dependencies for the simple example and link the provider
	cd ${WORKING_DIR}/provider/cmd/${PROVIDER}/bin && yarn link && \
	cd ${WORKING_DIR}/examples/simple && \
		yarn install && \
		yarn link "@pulumi/openai" && \
		yarn tsc --version

pulumi-stack-init: ## Initialize a new Pulumi stack
	cd examples/simple && pulumi stack init dev

pulumi-preview: ## Preview Pulumi changes
	@echo "Running Pulumi preview..."
	@cd examples/simple && pulumi preview --diff

preview: pulumi-preview

pulumi-up: ## Apply Pulumi changes
	cd examples/simple && pulumi up --diff

up: pulumi-up

pulumi-destroy: ## Destroy Pulumi resources
	cd examples/simple && pulumi destroy

# Provider
build_provider:: ensure ## Build the provider
	cp ${SCHEMA_PATH} provider/cmd/${PROVIDER}/
	cd provider/cmd/${PROVIDER}/ && \
       		yarn install && \
       		yarn tsc && \
       		cp package.json schema.json ./bin && \
       		sed -i.bak -e "s/\$${VERSION}/$(VERSION)/g" bin/package.json

install_provider:: PKG_ARGS := --no-bytecode --public-packages "*" --public
install_provider:: build_provider ## Install the provider
	cd provider/cmd/${PROVIDER}/ && \
		yarn run pkg . ${PKG_ARGS} --target node18 --output ../../../bin/${PROVIDER}

# builds all providers required for publishing
dist:: PKG_ARGS := --no-bytecode --public-packages "*" --public
dist:: build_provider ## Build distribution packages for all platforms
	cd provider/cmd/${PROVIDER}/ && \
 		yarn run pkg . ${PKG_ARGS} --target node18-macos-x64 --output ../../../bin/darwin-amd64/${PROVIDER} && \
 		yarn run pkg . ${PKG_ARGS} --target node18-macos-arm64 --output ../../../bin/darwin-arm64/${PROVIDER} && \
 		yarn run pkg . ${PKG_ARGS} --target node18-linuxstatic-x64 --output ../../../bin/linux-amd64/${PROVIDER} && \
 		yarn run pkg . ${PKG_ARGS} --target node18-linuxstatic-arm64 --output ../../../bin/linux-arm64/${PROVIDER} && \
 		yarn run pkg . ${PKG_ARGS} --target node18-win-x64 --output ../../../bin/windows-amd64/${PROVIDER}.exe
	mkdir -p dist
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-linux-amd64.tar.gz README.md LICENSE -C bin/linux-amd64/ .
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-linux-arm64.tar.gz README.md LICENSE -C bin/linux-arm64/ .
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-darwin-amd64.tar.gz README.md LICENSE -C bin/darwin-amd64/ .
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-darwin-arm64.tar.gz README.md LICENSE -C bin/darwin-arm64/ .
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-windows-amd64.tar.gz README.md LICENSE -C bin/windows-amd64/ .

# Go SDK
gen_go_sdk:: ## Generate Go SDK
	rm -rf sdk/go
	cd provider/cmd/${CODEGEN} && go run . go ../../../sdk/go ${SCHEMA_PATH}

## Empty build target for Go
build_go_sdk:: ## Build Go SDK (empty target)


# .NET SDK
gen_dotnet_sdk:: ## Generate .NET SDK
	rm -rf sdk/dotnet
	cd provider/cmd/${CODEGEN} && go run . dotnet ../../../sdk/dotnet ${SCHEMA_PATH}

build_dotnet_sdk:: DOTNET_VERSION := ${VERSION}
build_dotnet_sdk:: gen_dotnet_sdk ## Build .NET SDK
	cd sdk/dotnet/ && \
		echo "${DOTNET_VERSION}" >version.txt && \
		dotnet build /p:Version=${DOTNET_VERSION}

install_dotnet_sdk:: build_dotnet_sdk ## Install .NET SDK
	rm -rf ${WORKING_DIR}/nuget
	mkdir -p ${WORKING_DIR}/nuget
	find . -name '*.nupkg' -print -exec cp -p {} ${WORKING_DIR}/nuget \;


# Node.js SDK
gen_nodejs_sdk:: ## Generate Node.js SDK
	rm -rf sdk/nodejs
	cd provider/cmd/${CODEGEN} && go run . nodejs ../../../sdk/nodejs ${SCHEMA_PATH}
	# Remove the main field from package.json if it exists
	cd sdk/nodejs && node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); delete pkg.main; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));"
	# Fix the SDK types for VectorStore.expiresAfter
	node ${WORKING_DIR}/fix-sdk-types.js

build_nodejs_sdk:: gen_nodejs_sdk ## Build Node.js SDK
	cd sdk/nodejs/ && \
		yarn install && \
		yarn run tsc --version && \
		yarn run tsc && \
		cp ../../README.md ../../LICENSE yarn.lock ./bin/ && \
		sed -i.bak -e "s/\$${VERSION}/$(VERSION)/g" ./bin/package.json && \
		rm ./bin/package.json.bak

install_nodejs_sdk:: build_nodejs_sdk ## Install Node.js SDK
	yarn link --cwd ${WORKING_DIR}/sdk/nodejs/bin


# Python SDK
gen_python_sdk:: ## Generate Python SDK
	rm -rf sdk/python
	cd provider/cmd/${CODEGEN} && go run . python ../../../sdk/python ${SCHEMA_PATH}
	cp ${WORKING_DIR}/README.md sdk/python

build_python_sdk:: PYPI_VERSION := ${VERSION}
build_python_sdk:: gen_python_sdk ## Build Python SDK
	cd sdk/python/ && \
		python3 setup.py clean --all 2>/dev/null && \
		rm -rf ./bin/ ../python.bin/ && cp -R . ../python.bin && mv ../python.bin ./bin && \
		sed -i.bak -e 's/^VERSION = .*/VERSION = "$(PYPI_VERSION)"/g' -e 's/^PLUGIN_VERSION = .*/PLUGIN_VERSION = "$(VERSION)"/g' ./bin/setup.py && \
		rm ./bin/setup.py.bak && \
		cd ./bin && python3 setup.py build sdist
# --- Pulumi Provider --- END --------------------------------------------------------------

list-assistants: ## List all OpenAI assistants
	@echo "Listing OpenAI assistants..."
	@curl -s   -H "Content-Type: application/json" \
			  -H "OpenAI-Beta: assistants=v2" \
			 -H "Authorization: Bearer ${OPENAI_API_KEY}" https://api.openai.com/v1/assistants | \
		jq -r 'if .data then (.data[] | "ID: \(.id)\tName: \(.name)\tModel: \(.model)") else "No assistants found" end'
