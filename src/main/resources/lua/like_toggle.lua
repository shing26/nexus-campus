-- 原子化点赞/取消点赞操作
-- KEYS[1] = post:like:{postId} (Set)
-- KEYS[2] = post:like:delta:{postId} (Hash, field = "delta")
-- KEYS[3] = post:like:dirty (Set)
-- KEYS[4] = post:ranking:likes (ZSet)
-- ARGV[1] = userId
-- ARGV[2] = postId
-- ARGV[3] = weight (衰减权重, 默认 "3")
-- return: 当前点赞总数 (SCARD)

if redis.call("SISMEMBER", KEYS[1], ARGV[1]) == 1 then
    -- 取消点赞
    redis.call("SREM", KEYS[1], ARGV[1])
    redis.call("HINCRBY", KEYS[2], "delta", -1)
    redis.call("ZINCRBY", KEYS[4], -tonumber(ARGV[3]), ARGV[2])
else
    -- 点赞
    redis.call("SADD", KEYS[1], ARGV[1])
    redis.call("HINCRBY", KEYS[2], "delta", 1)
    redis.call("ZINCRBY", KEYS[4], tonumber(ARGV[3]), ARGV[2])
end
redis.call("SADD", KEYS[3], ARGV[2])
return redis.call("SCARD", KEYS[1])
