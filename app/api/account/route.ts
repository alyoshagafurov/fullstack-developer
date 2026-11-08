import {neonAuth} from '@/lib/neon/server';
export async function GET(){
 const headers={'Cache-Control':'no-store'};
 if(!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET)return Response.json({error:'Auth unavailable'},{status:503,headers});
 const {data:session}=await neonAuth().getSession();
 if(!session?.user)return Response.json({error:'Unauthorized'},{status:401,headers});
 return Response.json({user:{id:session.user.id,name:session.user.name,email:session.user.email}},{headers});
}
