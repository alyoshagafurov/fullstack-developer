import {z} from 'zod';
import {route,owner,body,json} from '@/lib/mobile/server';
import {adminGrant} from '@/lib/auth';
import {writeNote} from '@/lib/admin/ops';
export async function POST(req:Request){return route(async()=>{
 await owner(req);
 const value=z.object({clientID:z.string().min(1).max(100),body:z.string().trim().min(1).max(5000)}).safeParse(await body(req,25000));
 if(!value.success)return json({error:'Проверьте заметку'},400);
 const result=await writeNote(adminGrant(),value.data.clientID,value.data.body);
 return result.status==='ok'?json(result):json({error:result.message},400);
});}
