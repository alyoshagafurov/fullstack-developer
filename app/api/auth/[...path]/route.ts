import { neonAuth } from '@/lib/neon/server';
async function handler(req: Request, context: {params: Promise<{path: string[]}>}) {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) return Response.json({error: 'Neon Auth is not configured'}, {status: 503, headers: {'Cache-Control':'no-store'}});
  const handlers = neonAuth().handler();
  return handlers[req.method as keyof typeof handlers](req, context);
}
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
