# base image
FROM python:latest

ENV PRODUCTION=true
ENV AUTHLIB_INSECURE_TRANSPORT=1

# set working directory
RUN mkdir /usr/src/backend
WORKDIR /usr/src/backend


COPY src /usr/src/backend/src
COPY main.py /usr/src/backend
COPY dependencies /usr/src/backend
RUN pip3 install -r ./dependencies

EXPOSE 80

ENTRYPOINT ["python"]
CMD ["main.py"]
