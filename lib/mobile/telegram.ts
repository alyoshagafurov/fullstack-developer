import 'server-only';
import {prisma} from '@/lib/prisma';
export async function recordIncoming(updateID:number,chatID:string,text:string,messageID:number){
 if(process.env.ALYOS_MOBILE_ENABLED!=='true')return;
 await prisma.$executeRaw`INSERT INTO aly_mobile_message(operation_id,chat_id,direction,text,status,telegram_id) VALUES(${'tg:'+updateID},${chatID},'incoming',${text},'received',${messageID}) ON CONFLICT(operation_id) DO NOTHING`;
}

export async function recordOwnerReply(updateID:number,chatID:string,text:string,sent:boolean){
 if(process.env.ALYOS_MOBILE_ENABLED!=='true')return;
 await prisma.$executeRaw`INSERT INTO aly_mobile_message(operation_id,chat_id,direction,text,status) VALUES(${'owner:'+updateID},${chatID},'outgoing',${text},${sent?'sent':'unknown'}) ON CONFLICT(operation_id) DO NOTHING`;
}
