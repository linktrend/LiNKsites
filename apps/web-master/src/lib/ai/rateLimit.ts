type RateState = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateState>();

export const checkRateLimit = (key: string, limitPerMinute: number) => {
  const now = Date.now();
  const windowMs = 60_000;
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limitPerMinute - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (existing.count >= limitPerMinute) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  store.set(key, existing);
  return { ok: true, remaining: limitPerMinute - existing.count, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
};
