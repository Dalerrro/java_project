.PHONY: all compile run clean

SRC_DIR   := back/src
BUILD_DIR := back/build
LIB_DIR   := back/lib

SRC_FILES := $(shell find $(SRC_DIR) -name '*.java')
CP_COMPILE := $(LIB_DIR)/*
CP_RUN     := $(BUILD_DIR):$(LIB_DIR)/*

all: compile

compile:
	mkdir -p $(BUILD_DIR)
	javac -cp "$(CP_COMPILE)" -d $(BUILD_DIR) $(SRC_FILES)

test-oshi: compile
	java -cp "$(CP_RUN)" TestOSHI

run: compile
	java -cp "$(CP_RUN)" App

clean:
	rm -rf $(BUILD_DIR)
