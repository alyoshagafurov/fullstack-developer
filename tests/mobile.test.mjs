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
