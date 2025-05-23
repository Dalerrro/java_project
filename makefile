.PHONY: all compile run clean

SRC_DIR := back/src
BUILD_DIR := back/build
JAR := postgresql-42.3.6.jar

SRC_FILES := $(shell find $(SRC_DIR) -name '*.java')

all: compile

compile:
	mkdir -p $(BUILD_DIR)
	javac -d $(BUILD_DIR) -cp $(BUILD_DIR):$(JAR) $(SRC_FILES)

run: compile
	java -cp $(BUILD_DIR):$(JAR) App

clean:
	rm -rf $(BUILD_DIR)
