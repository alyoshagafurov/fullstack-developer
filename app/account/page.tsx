import {redirect} from 'next/navigation';
import {neonAuth} from '@/lib/neon/server';
import SignOut from './sign-out';
export const dynamic='force-dynamic';
export default async function Account(){
 if(!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET)return <main><h1>Аккаунт пока не настроен</h1></main>;
 const {data:session}=await neonAuth().getSession();
 if(!session?.user)redirect('/auth/sign-in');
 return <main style={{maxWidth:560,margin:'10vh auto',padding:28}}><h1>Привет, {session.user.name}</h1><p>{session.user.email}</p><p>Вы вошли в личный аккаунт ALY OS. Для подключения CRM используйте существующий вход владельца в приложении.</p><SignOut/></main>;
}
