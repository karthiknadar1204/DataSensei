import { messageRateLimiter } from '@/lib/ratelimit';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const user = await currentUser();
    const identifier = user?.id || 'anonymous';
    

    try {
      const { success, limit, remaining, reset } = await messageRateLimiter.strict.limit(identifier);
      
      return NextResponse.json({ 
        success,
        limit,
        remaining,
        reset,
        type: 'redis'
      });
    } catch (redisError) {

      console.warn('Redis rate limit failed, using local fallback:', redisError);
      
      const now = Date.now();
      if (now > messageRateLimiter.local.reset) {
        messageRateLimiter.local.remaining = 5;
        messageRateLimiter.local.reset = now + 10000;
      }
      
      const success = messageRateLimiter.local.remaining > 0;
      if (success) {
        messageRateLimiter.local.remaining--;
      }
      
      return NextResponse.json({
        success,
        remaining: messageRateLimiter.local.remaining,
        reset: messageRateLimiter.local.reset,
        type: 'local'
      });
    }
  } catch (error) {
    console.error('Rate limit error:', error);

    return NextResponse.json({ 
      success: false, 
      error: 'Rate limit check failed',
      type: 'error'
    });
  }
} 