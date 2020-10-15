INSERT INTO friendships(id, user_id, friend_id, pending, approved)
VALUES 
 (1, 1, 2, 'false', 'true'),
 (2, 1, 3, 'true', 'true'),
 (3, 2, 1, 'false', 'true'),
 (4, 2, 3, 'false', 'true'),
 (5, 3, 1, 'true', 'false'),
 (6, 3, 2, 'false', 'true'),
 (7, 4, 5, 'false', 'true'),
 (8, 5, 4, 'false', 'true');
