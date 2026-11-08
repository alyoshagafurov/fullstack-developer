import {z} from 'zod';
import {route,body,json,login,owner} from '@/lib/mobile/server';
import {prisma} from '@/lib/prisma';
export const runtime='nodejs';
export async function POST(req:Request){return route(async()=>{
 const input=z.object({email:z.string().email().max(254),password:z.string().min(1).max(256),device:z.string().min(1).max(100)}).safeParse(await body(req,4096));
 if(!input.success)return json({error:'Проверьте поля входа'},400);
 return json(await login(input.data.email,input.data.password,input.data.device));
});}
export async function DELETE(req:Request){return route(async()=>{const auth=await owner(req);await prisma.$executeRaw`DELETE FROM aly_mobile_session WHERE token_hash=${auth.tokenHash}`;return json({ok:true});});}
