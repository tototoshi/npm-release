.PHONY: all run build fmt install

all: install fmt build run

build:
	@npx tsc
fmt:
	@npx prettier . --write
install:
	@npm install
