'use client';
import {useState, type FormEvent} from 'react';
import {neonClient} from '@/lib/neon/client';
export default function SignIn() {
 const [mode,setMode]=useState<'login'|'signup'>('login'); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>) {
  e.preventDefault();setBusy(true);setError(''); const form=new FormData(e.currentTarget);
  try {
   const input={email:String(form.get('email')),password:String(form.get('password'))};
   const result=mode==='signup'?await neonClient.signUp.email({...input,name:String(form.get('name'))}):await neonClient.signIn.email(input);
   if(result.error){setError(result.error.message || 'Не удалось войти');return;}
   window.location.assign('/account');
  } catch {setError('Не удалось связаться с сервером. Попробуйте снова.');} finally {setBusy(false);}
 }
 const field={display:'block',width:'100%',boxSizing:'border-box' as const,padding:14,borderRadius:14,border:'1px solid #aaa',marginTop:12,font:'inherit'};
 return <main style={{maxWidth:380,margin:'10vh auto',padding:28,borderRadius:32,background:'#ffffffa8',boxShadow:'0 20px 70px #0001'}}><p style={{fontWeight:800,fontSize:32}}>aly</p><h1>{mode==='login'?'Вход в ALY OS':'Создать аккаунт'}</h1><p>Личный аккаунт Neon. Доступ к CRM требует отдельного входа владельца.</p><form onSubmit={submit}>
 {mode==='signup'&&<input aria-label="Имя" name="name" placeholder="Имя" required maxLength={120} autoComplete="name" style={field}/>}
 <input aria-label="Email" name="email" type="email" placeholder="Email" required autoComplete="email" style={field}/>
 <input aria-label="Пароль" name="password" type="password" placeholder="Пароль" required minLength={8} autoComplete={mode==='login'?'current-password':'new-password'} style={field}/>
 <button disabled={busy} style={{...field,background:'#171717',color:'white',cursor:'pointer'}}>{busy?'Подождите…':mode==='login'?'Войти':'Зарегистрироваться'}</button>
 </form><p role="alert" aria-live="polite">{error}</p><button disabled={busy} onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');}}>{mode==='login'?'Создать аккаунт':'Уже есть аккаунт'}</button><p><a href="/auth/reset-password">Забыли пароль?</a></p></main>;
}
