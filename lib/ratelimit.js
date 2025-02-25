import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});


export const messageRateLimiter = {
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 s"),
    analytics: true,
    prefix: "@upstash/chat/strict",
  }),
  
  moderate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "30 s"),
    analytics: true,
    prefix: "@upstash/chat/moderate",
  }),


  local: {
    remaining: 5,
    reset: Date.now() + 10000,
  }
}; 