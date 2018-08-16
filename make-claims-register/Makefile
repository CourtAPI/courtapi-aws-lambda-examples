FUNCTION_NAME = makeClaimsRegister
NAME = make-claims-register
CLEAN_FILES += templates.js
DIST_EXCLUDE += payloads/index.json \
	extract-html.js \
	css/index.css

all: link templates.js

$(NAME).zip: templates.js

templates.js:
	./node_modules/.bin/handlebars -f templates.js ./templates/ -c handlebars/runtime

include ../Mk/function.mk
