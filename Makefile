# SETUP

NODE_ENV := development

export NODE_ENV

NO_TARGET:
	@echo Make was called without any arguments.
	@echo Please call make with a target

# BUILD

build: compile
	@true

compile: prebuild
	yarn run tsc
	cp src/ct-decoder build/

compile-production: install prebuild
	yarn run tsc -p tsconfig.production.json

prebuild:: install
	@true

install: node_modules
	@true

node_modules: package.json
	@yarn install
	@touch node_modules

dist-clean:
	rm -rf build/ coverage/

lint:
	yarn run tslint --project tsconfig.lint.json -c tslint.json

lint-fix:
	yarn run tslint --project tsconfig.lint.json -c tslint.json --fix

test-jenkins:
	@echo "No tests"
