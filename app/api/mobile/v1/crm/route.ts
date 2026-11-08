import {prisma} from '@/lib/prisma';
import {route,owner,json} from '@/lib/mobile/server';
export const runtime='nodejs';
export async function GET(req:Request){return route(async()=>{
 await owner(req);
 const after=new URL(req.url).searchParams.get('after');
 const rows=await prisma.lead.findMany({orderBy:{id:'asc'},take:101,...(after?{cursor:{id:after},skip:1}:{}),select:{id:true,ref:true,name:true,email:true,company:true,contact:true,projectType:true,status:true,dealAmount:true,dealCurrency:true,telegramChatId:true,description:true,payments:{select:{id:true,amount:true,currency:true,paidAt:true,dueAt:true,note:true}},notes:{orderBy:{createdAt:'desc'},select:{id:true,body:true,createdAt:true}}}});
 const page=rows.slice(0,100);
 return json({clients:page.map(c=>({...c,dealAmount:c.dealAmount?.toString()??null,payments:c.payments.map(p=>({...p,amount:p.amount.toString()}))})),nextCursor:rows.length>100?page.at(-1)!.id:null});
});}
