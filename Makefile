DATA_SOURCE ?= "https://github.com/google/libphonenumber/raw/master/resources/PhoneNumberMetadata.xml"
NODE ?= node



all: 
	$(NODE) parseXML.mjs $(DATA_SOURCE) ./data/

PhoneNumberMetadata.xml:
	curl -L $(DATA_SOURCE) > $@
