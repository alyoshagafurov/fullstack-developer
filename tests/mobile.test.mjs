import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { snapshotSchema, pushSchema, emptySnapshot } from '../lib/mobile/core.ts';
const id='c97f71fe-7f43-4d7b-8bcf-2d30eea9aabc';
const client={id,name:'Test',company:'',project:'',email:'',phone:'',telegram:'',status:'Новый',currency:'TJS',deal:5000,detail:'',createdAt:0};
test('snapshot validates money, duplicate IDs, references, enum values and revision',()=>{
 assert.equal(snapshotSchema.safeParse(emptySnapshot).success,true);
 assert.equal(snapshotSchema.safeParse({...emptySnapshot,customers:[client,client]}).success,false);
 assert.equal(snapshotSchema.safeParse({...emptySnapshot,customers:[{...client,deal:1.234}]}).success,false);
 assert.equal(snapshotSchema.safeParse({...emptySnapshot,customers:[{...client,currency:'EUR'}]}).success,false);
 const task={id,title:'Task',detail:'',date:0,hasTime:true,finished:false,reminder:false,customerId:id};
 assert.equal(snapshotSchema.safeParse({...emptySnapshot,tasks:[task]}).success,false);
 assert.equal(snapshotSchema.safeParse({...emptySnapshot,customers:[client],tasks:[task]}).success,true);
 assert.equal(pushSchema.safeParse({revision:-1,snapshot:emptySnapshot}).success,false);
 assert.equal(snapshotSchema.safeParse({...emptySnapshot,checkpoint:{token:'no'}}).success,false);
});
test('additive migration, atomic CAS, session expiry/revocation, message deduplication',async()=>{
 const db=new PGlite();
 try {
  await db.exec("CREATE TABLE aly_admin_user(id TEXT PRIMARY KEY); INSERT INTO aly_admin_user VALUES ('owner'), ('other'); CREATE TABLE legacy_data(value TEXT); INSERT INTO legacy_data VALUES ('keep');");
  const sql=await readFile(new URL('../prisma/manual/alyos-mobile.sql',import.meta.url),'utf8');
  await db.exec(sql);await db.exec(sql);
  assert.equal((await db.query('SELECT value FROM legacy_data')).rows[0].value,'keep');
  await db.query('INSERT INTO aly_mobile_workspace(owner_id,revision,snapshot) VALUES ($1,1,$2)', ['owner',JSON.stringify(emptySnapshot)]);
  const update=()=>db.query('UPDATE aly_mobile_workspace SET revision=revision+1 WHERE owner_id=$1 AND revision=1 RETURNING revision',['owner']);
  const results=await Promise.all([update(),update()]);assert.equal(results.reduce((n,r)=>n+r.rows.length,0),1);
  assert.equal((await db.query('SELECT * FROM aly_mobile_workspace WHERE owner_id=$1',['other'])).rows.length,0);
  await db.exec("INSERT INTO aly_mobile_session VALUES ('expired','owner','test',now()-interval '1 second',now()), ('valid','owner','test',now()+interval '1 day',now());");
  assert.equal((await db.query('SELECT * FROM aly_mobile_session WHERE token_hash=$1 AND expires_at>now()',['expired'])).rows.length,0);
  await db.query('DELETE FROM aly_mobile_session WHERE token_hash=$1',['valid']);
  assert.equal((await db.query('SELECT * FROM aly_mobile_session WHERE token_hash=$1',['valid'])).rows.length,0);
  const insert=()=>db.query("INSERT INTO aly_mobile_message(operation_id,chat_id,direction,text,status) VALUES('op','chat','outgoing','hello','pending') ON CONFLICT(operation_id) DO NOTHING RETURNING id");
  const sent=await Promise.all([insert(),insert()]);assert.equal(sent.reduce((n,r)=>n+r.rows.length,0),1);
 } finally { await db.close(); }
});

// Shared database for projects, time, debts and converted money (ALY OS 2026-11-27).
import { randomUUID } from 'node:crypto';
import { carryForward, pushWorkspace, SESSION_SQL, SESSION_DAYS, SESSION_RENEW_BELOW_DAYS } from '../lib/mobile/core.ts';
// Swift's JSONEncoder: uppercase UUIDs, Date as seconds since 2001, Decimal as a number, nil optionals omitted.
const U=()=>randomUUID().toUpperCase();
const converted={id:U(),title:'Сайт',amount:925.75,currency:'TJS',type:'Доход',category:'Другое',date:786000000.25,detail:'',originalAmount:100,originalCurrency:'USD',rate:9.2575};
const legacy=({originalAmount,originalCurrency,rate,...rest})=>rest; // what an app without conversion pushes
const projects=[{id:U(),name:'ALY',taskIDs:[U()]},{id:U(),name:'Магазин',customerID:id,taskIDs:[],deadline:786500000,stage:'Дизайн'}];
const sessions=[{id:U(),projectID:projects[0].id,startedAt:786000000,seconds:0,resumedAt:786000000},{id:U(),projectID:projects[1].id,startedAt:785000000.5,seconds:3600.25,endedAt:785003600.75}];
const debts=[{id:U(),person:'Иван',amount:500,currency:'USD',owedToMe:true,payments:[100,50.5]},{id:U(),person:'Карим',amount:1200,currency:'TJS',owedToMe:false,due:786900000,payments:[]}];
const full={...emptySnapshot,customers:[client],ledger:[converted],projects,sessions,debts};
const clone=v=>structuredClone(v);
const ok=s=>snapshotSchema.safeParse(s).success;

test('snapshot accepts conversion fields and projects, sessions, debts as Swift encodes them',()=>{
 const parsed=snapshotSchema.safeParse(full);
 assert.equal(parsed.success,true);
 assert.deepEqual(parsed.data,full);
 assert.equal(ok({...emptySnapshot,ledger:[{...converted,originalAmount:null,originalCurrency:null,rate:null}]}),true);
 assert.equal(ok({...emptySnapshot,ledger:[{...converted,originalCurrency:'EUR',rate:1/0.0981}]}),true,'any code, any rate precision');
 assert.equal(ok({...emptySnapshot,projects:[],sessions:[],debts:[]}),true);
 // Old apps: no arrays and no conversion fields; nothing appears that they did not send.
 const old=snapshotSchema.safeParse({...emptySnapshot,ledger:[legacy(converted)]});
 assert.equal(old.success,true);
 for(const key of ['projects','sessions','debts'])assert.equal(key in old.data,false);
 assert.equal('originalCurrency' in old.data.ledger[0],false);
 assert.equal(pushSchema.safeParse({revision:3,snapshot:full}).success,true);
});

test('snapshot rejects bad conversion fields, records and duplicate IDs',()=>{
 const entry=p=>({...emptySnapshot,ledger:[{...converted,...p}]});
 for(const p of [{originalAmount:1.234},{originalAmount:0},{originalAmount:-5},{originalAmount:'100'},{originalCurrency:'usd'},{originalCurrency:'US'},{originalCurrency:'USDT'},{originalCurrency:840},{rate:0},{rate:-1},{rate:1e9},{rate:'9.2'}])
  assert.equal(ok(entry(p)),false,JSON.stringify(p));
 const with_=(key,record)=>({...emptySnapshot,[key]:[record]});
 for(const p of [{name:'  '},{name:'x'.repeat(501)},{id:'not-a-uuid'},{customerID:'x'},{taskIDs:['x']},{taskIDs:undefined},{deadline:'2026'},{stage:'x'.repeat(201)}])
  assert.equal(ok(with_('projects',{...projects[0],...p})),false,'project '+JSON.stringify(p));
 for(const p of [{seconds:-1},{projectID:undefined},{projectID:'x'},{startedAt:'now'},{endedAt:1e11}])
  assert.equal(ok(with_('sessions',{...sessions[0],...p})),false,'session '+JSON.stringify(p));
 for(const p of [{currency:'EUR'},{amount:-1},{amount:1e10},{payments:[-1]},{payments:['5']},{owedToMe:'yes'},{person:''},{payments:undefined}])
  assert.equal(ok(with_('debts',{...debts[0],...p})),false,'debt '+JSON.stringify(p));
 assert.equal(ok({...emptySnapshot,projects:[projects[0],projects[0]]}),false);
 assert.equal(ok({...emptySnapshot,sessions:[sessions[0],{...sessions[1],id:sessions[0].id}]}),false);
 assert.equal(ok({...emptySnapshot,debts:[debts[0],debts[0]]}),false);
 assert.equal(ok({...emptySnapshot,projects:null}),false,'absent, not null, means not part of the snapshot');
 assert.equal(ok({...emptySnapshot,projects:{}}),false);
 assert.equal(ok({...full,vault:[]}),false,'top level stays strict');
});

test('carry-forward keeps what an older app cannot see and respects explicit changes',()=>{
 const stored=clone(full);
 const push=snapshotSchema.parse({...emptySnapshot,customers:[client],ledger:[{...legacy(converted),title:'Сайт (правка)'}]});
 const before=clone(push);
 const next=carryForward(stored,push);
 assert.deepEqual(push,before,'incoming not modified');assert.deepEqual(stored,full,'stored not modified');
 assert.deepEqual(next.projects,projects);assert.deepEqual(next.sessions,sessions);assert.deepEqual(next.debts,debts);
 assert.deepEqual(next.ledger,[{...converted,title:'Сайт (правка)'}],'conversion copied, the edit kept');
 // Explicit arrays, empty included, replace the stored ones.
 const cleared=carryForward(stored,{...push,projects:[],debts:[debts[1]]});
 assert.deepEqual(cleared.projects,[]);assert.deepEqual(cleared.debts,[debts[1]]);assert.deepEqual(cleared.sessions,sessions);
 // Conversion fields are copied only while amount, currency and type are unchanged.
 for(const p of [{amount:1000},{currency:'USD'},{type:'Расход'}])
  assert.deepEqual(carryForward(stored,{...push,ledger:[{...legacy(converted),...p}]}).ledger,[{...legacy(converted),...p}],JSON.stringify(p));
 // What the push sends itself wins; a new entry is untouched.
 const own={...converted,originalAmount:10000,originalCurrency:'RUB',rate:0.09258};
 assert.deepEqual(carryForward(stored,{...push,ledger:[own]}).ledger,[own]);
 const fresh={...legacy(converted),id:U()};
 assert.deepEqual(carryForward(stored,{...push,ledger:[fresh]}).ledger,[fresh]);
 // Nothing to carry: an old row without arrays, no row, a stored JSON string.
 const plain=carryForward(clone(emptySnapshot),push);
 for(const key of ['projects','sessions','debts'])assert.equal(key in plain,false);
 assert.deepEqual(carryForward(undefined,push),push);assert.deepEqual(carryForward(null,push),push);
 assert.deepEqual(carryForward(JSON.stringify(stored),push).projects,projects);
 // A stored entry without conversion gives nothing.
 assert.deepEqual(carryForward({...stored,ledger:[legacy(converted)]},push).ledger,push.ledger);
});

test('workspace push: CAS on the stored row, carry-forward, reply equals what is stored',async()=>{
 const pg=new PGlite();
 const db={query:async(text,params)=>(await pg.query(text,params)).rows};
 const row=async owner=>(await pg.query('SELECT revision,snapshot FROM aly_mobile_workspace WHERE owner_id=$1',[owner])).rows[0];
 try {
  await pg.exec("CREATE TABLE aly_admin_user(id TEXT PRIMARY KEY); INSERT INTO aly_admin_user VALUES ('owner'), ('other');");
  await pg.exec(await readFile(new URL('../prisma/manual/alyos-mobile.sql',import.meta.url),'utf8'));
  const first=await pushWorkspace(db,'owner',0,snapshotSchema.parse(full));
  assert.deepEqual(first,{revision:1,snapshot:full});
  assert.deepEqual(await row('owner'),first);
  assert.equal(await pushWorkspace(db,'owner',0,snapshotSchema.parse(emptySnapshot)),null,'creation never overwrites');
  // An older app pushes an edit plus a new entry, without arrays or conversion fields.
  const added={...legacy(converted),id:U(),amount:50,title:'Обед',type:'Расход'};
  const old=snapshotSchema.parse({...emptySnapshot,customers:[client],ledger:[{...legacy(converted),title:'Сайт v2'},added]});
  const second=await pushWorkspace(db,'owner',1,old);
  assert.equal(second.revision,2);
  assert.deepEqual(second.snapshot,{...full,ledger:[{...converted,title:'Сайт v2'},added]});
  assert.deepEqual(await row('owner'),second,'reply is exactly the stored row');
  // Stale and future revisions conflict and change nothing.
  assert.equal(await pushWorkspace(db,'owner',1,old),null);
  assert.equal(await pushWorkspace(db,'owner',7,old),null);
  assert.deepEqual(await row('owner'),second);
  assert.equal(await pushWorkspace(db,'other',1,old),null,'no row for another owner');
  assert.equal(await row('other'),undefined);
  // Two pushes read the same revision; only one write lands.
  const race=await Promise.all([pushWorkspace(db,'owner',2,old),pushWorkspace(db,'owner',2,snapshotSchema.parse({...full,projects:[]}))]);
  assert.equal(race.filter(Boolean).length,1);
  const winner=race.find(Boolean);assert.equal(winner.revision,3);assert.deepEqual(await row('owner'),winner);
  // An explicit deletion by a new app is not undone by a later old-app push.
  const third=await pushWorkspace(db,'owner',3,snapshotSchema.parse({...full,projects:[],sessions:[]}));
  const fourth=await pushWorkspace(db,'owner',4,old);
  assert.deepEqual(fourth.snapshot.projects,[]);assert.deepEqual(fourth.snapshot.sessions,[]);assert.deepEqual(fourth.snapshot.debts,debts);
  assert.equal(third.revision+1,fourth.revision);
  // A push claiming a revision the server has not reached is refused, even when another write
  // reaches that revision before it writes: nothing merged from an older row is ever stored.
  let open;const gate=new Promise(r=>open=r);
  const slow={query:async(text,params)=>{const rows=await db.query(text,params);if(text.startsWith('SELECT'))await gate;return rows;}};
  const ahead=pushWorkspace(slow,'owner',6,old);
  const sixth=await pushWorkspace(db,'owner',5,snapshotSchema.parse({...full,debts:[]}));
  open();
  assert.equal(await ahead,null);assert.deepEqual(await row('owner'),sixth);
  // A row altered by hand into invalid data is refused, never stored or spread further.
  await pg.query("UPDATE aly_mobile_workspace SET snapshot=jsonb_set(snapshot,'{debts}','[{\"id\":\"bad\"}]') WHERE owner_id='owner'");
  await assert.rejects(pushWorkspace(db,'owner',6,old));
  assert.equal((await row('owner')).revision,6);
 } finally { await pg.close(); }
});

test('device sessions slide to 90 days, renew at most weekly, never revive',async()=>{
 assert.equal(SESSION_DAYS,90);assert.equal(SESSION_DAYS-SESSION_RENEW_BELOW_DAYS,7);
 const pg=new PGlite();
 const expiry=async t=>(await pg.query('SELECT expires_at FROM aly_mobile_session WHERE token_hash=$1',[t])).rows[0]?.expires_at?.getTime();
 const lookup=async t=>(await pg.query(SESSION_SQL,[t])).rows;
 try {
  await pg.exec("CREATE TABLE aly_admin_user(id TEXT PRIMARY KEY); INSERT INTO aly_admin_user VALUES ('owner');");
  await pg.exec(await readFile(new URL('../prisma/manual/alyos-mobile.sql',import.meta.url),'utf8'));
  await pg.exec(`INSERT INTO aly_mobile_session VALUES
   ('fresh','owner','phone',now()+interval '90 days',now()),
   ('boundary','owner','mac',now()+interval '84 days',now()),
   ('week','owner','mac',now()+interval '82 days',now()),
   ('old7day','owner','phone',now()+interval '1 hour',now()),
   ('expired','owner','phone',now()-interval '1 second',now());`);
  const before={fresh:await expiry('fresh'),boundary:await expiry('boundary'),expired:await expiry('expired')};
  const day=86400000;
  assert.deepEqual(await lookup('fresh'),[{owner_id:'owner'}]);assert.equal(await expiry('fresh'),before.fresh,'no write in the first week');
  assert.deepEqual(await lookup('boundary'),[{owner_id:'owner'}]);assert.equal(await expiry('boundary'),before.boundary);
  for(const t of ['week','old7day']){
   assert.deepEqual(await lookup(t),[{owner_id:'owner'}]);
   const left=(await expiry(t))-Date.now();assert.ok(left>89*day&&left<=90*day+60000,t+' renewed to 90 days');
  }
  const renewed=await expiry('week');await lookup('week');assert.equal(await expiry('week'),renewed,'renewed once, not on every request');
  assert.deepEqual(await lookup('expired'),[]);assert.equal(await expiry('expired'),before.expired,'expired stays expired');
  assert.deepEqual(await lookup('unknown'),[]);
  await pg.query('DELETE FROM aly_mobile_session WHERE token_hash=$1',['week']);
  assert.deepEqual(await lookup('week'),[],'logout still revokes');
 } finally { await pg.close(); }
});
