import {prisma} from '@/lib/prisma';
import {route,owner,json,body} from '@/lib/mobile/server';
import {emptySnapshot,pushSchema} from '@/lib/mobile/core';
export const runtime='nodejs';
export async function GET(req:Request){return route(async()=>{
 const user=await owner(req);
 const rows=await prisma.$queryRaw<{revision:number,snapshot:unknown}[]>`SELECT revision,snapshot FROM aly_mobile_workspace WHERE owner_id=${user.id}`;
 return json(rows[0]??{revision:0,snapshot:emptySnapshot});
});}
export async function PUT(req:Request){return route(async()=>{
 const user=await owner(req);const parsed=pushSchema.safeParse(await body(req));
 if(!parsed.success)return json({error:'Некорректные данные рабочей области'},400);
 const {revision,snapshot}=parsed.data;
 // Initial creation also uses compare-and-swap. Never an unconditional overwrite.
 if(revision===0){
  const rows=await prisma.$queryRaw<{revision:number}[]>`INSERT INTO aly_mobile_workspace(owner_id,revision,snapshot) VALUES(${user.id},1,${JSON.stringify(snapshot)}::jsonb) ON CONFLICT(owner_id) DO NOTHING RETURNING revision`;
  if(rows[0])return json({revision:1,snapshot});
 }else{
  const rows=await prisma.$queryRaw<{revision:number}[]>`UPDATE aly_mobile_workspace SET revision=revision+1,snapshot=${JSON.stringify(snapshot)}::jsonb,updated_at=now() WHERE owner_id=${user.id} AND revision=${revision} RETURNING revision`;
  if(rows[0])return json({revision:rows[0].revision,snapshot});
 }
 return json({error:'Данные изменились на другом устройстве. Повторите синхронизацию.'},409);
});}
