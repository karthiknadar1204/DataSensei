import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useRateLimit() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer;
    if (cooldownTimer > 0) {
      timer = setInterval(() => {
        setCooldownTimer((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTimer]);

  const checkRateLimit = async () => {
    try {
      const response = await fetch('/api/ratelimit', {
        method: 'POST',
      });
      const data = await response.json();

      if (!data.success) {
        setIsRateLimited(true);
        setCooldownTimer(10);
        toast({
          title: "Rate limit exceeded",
          description: "Please wait a few seconds before sending another message",
          variant: "destructive",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Fail open if rate limit check fails
    }
  };

  return {
    isRateLimited,
    cooldownTimer,
    checkRateLimit,
  };
} 