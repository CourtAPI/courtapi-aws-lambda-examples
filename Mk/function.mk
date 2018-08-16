MK_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
TOP_DIR := $(patsubst %/Mk/,%,$(MK_DIR))

CLIENT_DIR       := $(TOP_DIR)/../../client/javascript
INC_DIR          := $(TOP_DIR)/inc
NODE_MODULES_DIR := $(TOP_DIR)/node_modules

# You must set these to deploy code
# FUNCTION_NAME

AWS_ROLE    ?= arn:aws:iam::691092241560:role/service-role/courtapi_examples
AWS_RUNTIME ?= nodejs8.10
AWS_TIMEOUT ?= 60
AWS_HANDLER ?= index.handler

DIST_EXCLUDE += yarn.lock package.json .gitignore

# Default name for the dist.  You should override this
NAME ?= function

.PHONY: link
link:
	@echo linking inc
	@[ -f yarn.lock ] && yarn install || true
	@[ -e inc ] || ln -s $(INC_DIR) inc
	@echo linking node_modules
	@npm link $(CLIENT_DIR)

.PHONY: dist
dist: $(NAME).zip

$(NAME).zip: link
	@echo creating $(NAME).zip
	@zip $(NAME).zip -r . -x Makefile $(DIST_EXCLUDE)

.PHONY: clean
clean:
	@rm -f $(NAME).zip $(CLEAN_FILES)
	@rm -f inc
	@rm -rf node_modules

.PHONY: deploy
deploy: $(NAME).zip
	@aws lambda create-function \
		--region us-east-1 \
		--profile area69 \
		--function-name $(FUNCTION_NAME) \
		--runtime $(AWS_RUNTIME) \
		--role $(AWS_ROLE) \
		--handler $(AWS_HANDLER) \
		--timeout $(AWS_TIMEOUT) \
		--zip-file fileb://$(NAME).zip

.PHONY: undeploy
undeploy:
	@aws lambda delete-function \
		--region us-east-1 \
		--profile area69 \
		--function-name $(FUNCTION_NAME)

.PHONY: redeploy
redeploy:
	-@$(MAKE) undeploy >/dev/null 2>&1
	@$(MAKE) deploy

