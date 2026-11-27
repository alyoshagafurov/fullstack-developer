import {prisma} from '@/lib/prisma';
import {route,owner,json,body,db} from '@/lib/mobile/server';
import {emptySnapshot,pushSchema,pushWorkspace} from '@/lib/mobile/core';
export const runtime='nodejs';
export async function GET(req:Request){return route(async()=>{
 const user=await owner(req);
 const rows=await prisma.$queryRaw<{revision:number,snapshot:unknown}[]>`SELECT revision,snapshot FROM aly_mobile_workspace WHERE owner_id=${user.id}`;
 return json(rows[0]??{revision:0,snapshot:emptySnapshot});
});}
export async function PUT(req:Request){return route(async()=>{
 const user=await owner(req);const parsed=pushSchema.safeParse(await body(req));
 if(!parsed.success)return json({error:'Некорректные данные рабочей области'},400);
 // Compare-and-swap, initial creation included; never an unconditional overwrite. Data an older
 // app does not know (projects, time, debts, ledger conversion) is carried forward; the reply is what is stored.
 const stored=await pushWorkspace(db,user.id,parsed.data.revision,parsed.data.snapshot);
 if(stored)return json(stored);
 return json({error:'Данные изменились на другом устройстве. Повторите синхронизацию.'},409);
});}
