import {z} from 'zod';
import {prisma} from '@/lib/prisma';
import {route,owner,body,json} from '@/lib/mobile/server';
import {transitionLead} from '@/lib/telegram/leads';
export const runtime='nodejs';
const input=z.discriminatedUnion('action',[
 z.object({action:z.literal('status'),clientID:z.string().min(1).max(100),status:z.enum(['NEW','CONTACTED','DISCOVERY','PROPOSAL','IN_PROGRESS','COMPLETED','ON_HOLD','DECLINED','CANCELLED'])}),
 z.object({action:z.literal('payment'),clientID:z.string().min(1).max(100),operationID:z.string().uuid(),amount:z.string().regex(/^\d{1,9}(\.\d{1,2})?$/).refine(v=>Number(v)>0),currency:z.enum(['TJS','USD','RUB','EUR']),received:z.boolean(),note:z.string().trim().max(1000)})
]);
export async function POST(req:Request){return route(async()=>{
 await owner(req);
 const parsed=input.safeParse(await body(req,8000));
 if(!parsed.success)return json({error:'Проверьте введённые данные'},400);
 const value=parsed.data;
 if(value.action==='status'){
  const result=await transitionLead(value.clientID,value.status);
  if(result.status==='missing'||result.status==='invalid')return json({error:'Не удалось изменить статус'},400);
 }else{
  const lead=await prisma.lead.findUnique({where:{id:value.clientID},select:{id:true}});
  if(!lead)return json({error:'Заявка не найдена'},404);
  // An operation UUID is also the payment ID: retrying never adds a second payment.
  const row=await prisma.payment.upsert({where:{id:value.operationID},update:{},create:{id:value.operationID,leadId:value.clientID,amount:value.amount,currency:value.currency,paidAt:value.received?new Date():null,note:value.note||null}});
  if(row.leadId!==value.clientID||row.amount.toString()!==Number(value.amount).toString()||row.currency!==value.currency)return json({error:'Конфликт операции'},409);
 }
 return json({status:'ok'});
});}
