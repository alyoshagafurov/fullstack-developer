'use client';
import {useState} from 'react';
import {neonClient} from '@/lib/neon/client';
export default function SignOut(){const [error,setError]=useState('');const [busy,setBusy]=useState(false);return <><button disabled={busy} onClick={async()=>{setBusy(true);try{const result=await neonClient.signOut();if(result.error)throw new Error();window.location.assign('/auth/sign-in');}catch{setError('Не удалось выйти. Повторите.');setBusy(false);}}}>Выйти</button><p role="alert">{error}</p></>;}
