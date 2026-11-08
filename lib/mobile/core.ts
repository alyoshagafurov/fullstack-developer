import { z } from 'zod';
export const emptySnapshot = { customers: [], tasks: [], notes: [], ledger: [], messages: [] };
const id = z.string().uuid();
const title = z.string().trim().min(1).max(10000);
const date = z.number().finite().min(-10000000000).max(10000000000);
const amount = z.number().finite().nonnegative().lt(1e10).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.001);
const currency = z.enum(['TJS','USD','RUB']);
const link = id.nullish();
export const snapshotSchema = z.object({
 customers: z.array(z.object({id, name:title, company:z.string(),project:z.string(),email:z.string(),phone:z.string(),telegram:z.string(),status:z.enum(['Новый','Переговоры','В работе','Завершён','Пауза']),currency,deal:amount,detail:z.string(),createdAt:date})).max(20000),
 tasks: z.array(z.object({id,title,detail:z.string(),date,hasTime:z.boolean(),finished:z.boolean(),reminder:z.boolean(),customerId:link,recurrence:z.enum(['Ежедневно','Еженедельно','Ежемесячно']).nullish(),completedDays:z.array(z.string().max(32)).max(20000).nullish(),timeZoneID:z.string().max(100).nullish()})).max(20000),
 notes:z.array(z.object({id,title,content:z.string().max(1000000),category:z.string(),pinned:z.boolean(),customerId:link,updatedAt:date})).max(20000),
 ledger:z.array(z.object({id,title,amount:amount.refine(v=>v>0),currency,type:z.enum(['Доход','Расход','Ожидается']),category:z.string(),date,customerId:link,detail:z.string()})).max(50000),
 messages:z.array(z.object({id,customerId:id,text:z.string(),direction:z.enum(['incoming','outgoing']),date})).max(50000)
}).strict().superRefine((s,ctx)=>{
 const clients=new Set(s.customers.map(c=>c.id));
 for(const records of [s.customers,s.tasks,s.notes,s.ledger,s.messages]) {
   if(new Set(records.map(r=>r.id)).size!==records.length) ctx.addIssue({code:'custom',message:'Duplicate ID'});
 }
 for(const r of [...s.tasks,...s.notes,...s.ledger,...s.messages]) {
   if(r.customerId && !clients.has(r.customerId)) ctx.addIssue({code:'custom',message:'Missing client'});
 }
});
export const pushSchema=z.object({revision:z.number().int().min(0).max(2147483646),snapshot:snapshotSchema}).strict();
