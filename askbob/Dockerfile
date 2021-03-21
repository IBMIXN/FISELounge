FROM python:3.7-slim

ARG DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y build-essential git wget

WORKDIR /askbob

RUN python -m pip install -U pip setuptools wheel askbob[voice]
RUN python -m spacy download en_core_web_md

RUN mkdir data

RUN wget -O data/deepspeech-0.9.1-models.pbmm https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm
RUN wget -O data/deepspeech-0.9.1-models.scorer https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer

COPY ./plugins plugins
COPY ./config.ini config.ini

RUN python -m askbob --setup

ENTRYPOINT python -m askbob -s -v

EXPOSE 8000
