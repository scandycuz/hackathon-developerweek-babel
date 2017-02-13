DROP DATABASE IF EXISTS babeldb;
CREATE DATABASE babeldb;

\c babeldb;

CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  userid VARCHAR,
  token VARCHAR
);

INSERT INTO users (userid, token)
  VALUES ('test_id', 'test_token');
