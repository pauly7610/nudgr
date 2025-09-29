import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10, // 10 requests
  windowMs: 60000, // per minute
};

export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get existing rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching rate limit:', fetchError);
      // Fail open - allow request if we can't check
      return { allowed: true, remaining: config.maxRequests - 1, resetAt: new Date(Date.now() + config.windowMs) };
    }

    const now = new Date();
    
    // If no existing record, create one
    if (!existing) {
      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          identifier,
          endpoint,
          request_count: 1,
          window_start: now.toISOString(),
        });

      if (insertError) {
        console.error('Error creating rate limit:', insertError);
      }

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now.getTime() + config.windowMs),
      };
    }

    const windowStart = new Date(existing.window_start);
    const windowEnd = new Date(windowStart.getTime() + config.windowMs);

    // If window has expired, reset the counter
    if (now >= windowEnd) {
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({
          request_count: 1,
          window_start: now.toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error resetting rate limit:', updateError);
      }

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now.getTime() + config.windowMs),
      };
    }

    // Check if limit exceeded
    if (existing.request_count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: windowEnd,
      };
    }

    // Increment counter
    const { error: updateError } = await supabase
      .from('rate_limits')
      .update({
        request_count: existing.request_count + 1,
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Error updating rate limit:', updateError);
    }

    return {
      allowed: true,
      remaining: config.maxRequests - existing.request_count - 1,
      resetAt: windowEnd,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open on errors
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: new Date(Date.now() + config.windowMs) };
  }
}

export function getRateLimitHeaders(result: { remaining: number; resetAt: Date }) {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}
