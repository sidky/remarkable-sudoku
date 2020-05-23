create table remarkable_config
(
    id         serial not null
        constraint remarkable_config_pk
            primary key,
    token      varchar(1000),
    device_id  varchar(50),
    created_at timestamp with time zone default now()
);

create table sudoku_hash
(
    id         serial                                 not null
        constraint sudoku_hash_pk
            primary key,
    md5        varchar(40)                            not null,
    created_at timestamp with time zone default now() not null
);
