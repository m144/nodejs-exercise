CREATE USER 'node'@'%' IDENTIFIED WITH mysql_native_password BY '12345678';
GRANT ALL ON *.* TO 'node'@'%';
