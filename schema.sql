CREATE TABLE users(
    email varchar(100),
    first_name varchar(50),
    last_name varchar(50),
    password_hash varchar(100),
    gender varchar(50),
    city varchar(50),
    country varchar(50));


CREATE TABLE loggedin_users(
    token varchar(100),
    email varchar(100),
    first_name varchar(50),
    last_name varchar(50),
    password varchar(100),
    gender varchar(50),
    city varchar(50),
    country varchar(50));

CREATE TABLE messages(
    recepient varchar(100),
    sender varchar(100),
    msg varchar(140),
    location varchar(100));
