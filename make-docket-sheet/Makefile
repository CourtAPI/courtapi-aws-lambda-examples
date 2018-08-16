FUNCTION_NAME = makeDocketSheet
NAME = make-docket-sheet
CLEAN_FILES += templates.js
DIST_EXCLUDE += payloads/index.json \
	extract-html.js \
	css/index.css

all: link

$(NAME).zip: templates.js

templates.js:
	./node_modules/.bin/handlebars -f templates.js ./templates/ -c handlebars/runtime

include ../Mk/function.mk
