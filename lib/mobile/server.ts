import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
export class MobileError extends Error { constructor(public status:number, message:string){super(message);} }
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export function enabled(){if(process.env.ALYOS_MOBILE_ENABLED!=='true')throw new MobileError(503,'Интеграция ALY OS ещё не включена на сервере');}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export async function route(action:()=>Promise<Response>){try{enabled();return await action();}catch(e){if(e instanceof MobileError)return json({error:e.message},e.status); console.error('[mobile] request failed');return json({error:'Сервис временно недоступен'},503);}}
export async function body(req:Request,max=4_000_000):Promise<unknown>{
 const reader=req.body?.getReader();if(!reader)throw new MobileError(400,'Пустой запрос');
 let total=0;const chunks:Uint8Array[]=[];
 for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>max){await reader.cancel();throw new MobileError(413,'Запрос слишком большой');}chunks.push(value);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new MobileError(400,'Некорректный JSON');}
}
export async function owner(req:Request){
 const raw=req.headers.get('authorization')??'';
 if(!/^Bearer [a-f0-9]{64}$/.test(raw))throw new MobileError(401,'Войдите в аккаунт');
 const tokenHash=digest(raw.slice(7));
 const rows=await prisma.$queryRaw<{owner_id:string}[]>`SELECT owner_id FROM aly_mobile_session WHERE token_hash=${tokenHash} AND expires_at>now()`;
 if(!rows[0])throw new MobileError(401,'Сессия истекла. Войдите снова');
 return {id:rows[0].owner_id, tokenHash};
}
export async function login(email:string,password:string,device:string){
 const key=digest(email.toLowerCase());
 const rows=await prisma.$queryRaw<{count:number}[]>`INSERT INTO aly_mobile_login_limit(key,count,started_at) VALUES(${key},1,now()) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN aly_mobile_login_limit.started_at<now()-interval '15 minutes' THEN 1 ELSE aly_mobile_login_limit.count+1 END, started_at=CASE WHEN aly_mobile_login_limit.started_at<now()-interval '15 minutes' THEN now() ELSE aly_mobile_login_limit.started_at END RETURNING count`;
 if(rows[0].count>10)throw new MobileError(429,'Слишком много попыток. Повторите через 15 минут');
 const user=await prisma.adminUser.findUnique({where:{email}});
 // Cost-12 dummy hash preserves password-check cost for unknown accounts.
 const hash=user?.passwordHash??'$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
 const valid=await verifyPassword(password,hash);
 if(!user||!valid)throw new MobileError(401,'Неверный email или пароль');
 const token=randomBytes(32).toString('hex');const expires=new Date(Date.now()+7*86400000);
 await prisma.$executeRaw`INSERT INTO aly_mobile_session(token_hash,owner_id,device,expires_at) VALUES(${digest(token)},${user.id},${device},${expires})`;
 return {token,ownerID:user.id,expiresAt:expires.toISOString()};
}
