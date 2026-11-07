import {z} from 'zod';
import {prisma} from '@/lib/prisma';
import {route,owner,json,body,MobileError} from '@/lib/mobile/server';
export const runtime='nodejs';
async function client(id:string){const c=await prisma.lead.findUnique({where:{id},select:{telegramChatId:true}});if(!c?.telegramChatId)throw new MobileError(400,'У заявки нет подключённого Telegram');return c.telegramChatId;}
export async function GET(req:Request){return route(async()=>{
 await owner(req);const u=new URL(req.url);const chat=await client(u.searchParams.get('clientID')??'');
 const cursor=z.string().regex(/^\d{1,16}$/).safeParse(u.searchParams.get('after')??'0');if(!cursor.success)return json({error:'Некорректный курсор'},400);
 const rows=await prisma.$queryRaw<{id:string,text:string,direction:string,status:string,date:string}[]>`SELECT id::text,text,direction,status,created_at::text AS date FROM aly_mobile_message WHERE chat_id=${chat} AND id>${BigInt(cursor.data)} ORDER BY id ASC LIMIT 101`;
 const messages=rows.slice(0,100);return json({messages,nextCursor:rows.length>100?messages.at(-1)!.id:null});
});}
export async function POST(req:Request){return route(async()=>{
 const user=await owner(req);const parsed=z.object({clientID:z.string().max(100),text:z.string().trim().min(1).max(4096),operationID:z.string().uuid()}).safeParse(await body(req,20000));
 if(!parsed.success)return json({error:'Проверьте сообщение'},400);
 const input=parsed.data;const chat=await client(input.clientID);const operation=user.id+':'+input.operationID;
 const token=process.env.TELEGRAM_BOT_TOKEN;if(!token)throw new MobileError(503,'Telegram не настроен');
 const inserted=await prisma.$queryRaw<{id:string}[]>`INSERT INTO aly_mobile_message(operation_id,chat_id,direction,text,status) VALUES(${operation},${chat},'outgoing',${input.text},'pending') ON CONFLICT(operation_id) DO NOTHING RETURNING id::text`;
 if(!inserted[0]){
   const old=await prisma.$queryRaw<{chat_id:string,text:string,status:string}[]>`SELECT chat_id,text,status FROM aly_mobile_message WHERE operation_id=${operation}`;
   if(old[0]?.chat_id!==chat||old[0]?.text!==input.text)return json({error:'Идентификатор уже использован для другого сообщения'},409);
   return json({status:old[0].status});
 }
 let status='unknown';let messageID:number|null=null;
 try{
  // No automatic retry: Telegram Bot API has no sendMessage idempotency key.
  const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chat,text:input.text}),signal:AbortSignal.timeout(12000)});
  const result=await response.json();
  if(result.ok===true&&Number.isSafeInteger(result.result?.message_id)){status='sent';messageID=result.result.message_id;}
  else if(result.ok===false){status='failed';}
 }catch{ /* uncertain delivery stays unknown, never report success */ }
 await prisma.$executeRaw`UPDATE aly_mobile_message SET status=${status},telegram_id=${messageID} WHERE operation_id=${operation}`;
 return json({status});
});}
