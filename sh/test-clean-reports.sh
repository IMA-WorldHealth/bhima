#!/bin/bash

if [[ -d results ]]; then
  rm -rf ./results/playwright-report
  rm -f ./results/*
fi
