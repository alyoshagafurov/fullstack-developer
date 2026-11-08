'use client';
import {useState,useEffect,type FormEvent} from 'react';
import {neonClient} from '@/lib/neon/client';
export default function Reset(){
 const [token,setToken]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 useEffect(()=>{setToken(new URLSearchParams(window.location.search).get('token') || '');},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('');const form=new FormData(e.currentTarget);try{
 const result=token?await neonClient.resetPassword({token,newPassword:String(form.get('password'))}):await neonClient.requestPasswordReset({email:String(form.get('email')),redirectTo:window.location.origin+'/auth/reset-password'});
 setMessage(result.error?(result.error.message || 'Не удалось выполнить запрос'):token?'Пароль обновлён. Теперь войдите.':'Если аккаунт существует, письмо для восстановления будет отправлено.');
 }catch{setMessage('Ошибка соединения. Попробуйте снова.');}finally{setBusy(false);}}
 return <main style={{maxWidth:400,margin:'10vh auto',padding:24}}><h1>Восстановление пароля</h1><form onSubmit={submit}>{token?<input aria-label="Новый пароль" name="password" type="password" required minLength={8} autoComplete="new-password"/>:<input aria-label="Email" name="email" type="email" required autoComplete="email"/>}<button disabled={busy}>{busy?'Подождите…':token?'Обновить пароль':'Отправить ссылку'}</button></form><p role="status">{message}</p><a href="/auth/sign-in">Войти</a></main>;
}
