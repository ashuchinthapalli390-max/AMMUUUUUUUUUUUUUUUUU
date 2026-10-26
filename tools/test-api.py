import subprocess, os, time, urllib.request, urllib.error, http.cookiejar, json, pathlib, signal
p=pathlib.Path(__file__).resolve().parents[1]; db=p/'data/db.json';backup=db.read_bytes()
env=os.environ.copy();env.update({'HOST':'127.0.0.1','PORT':'4193','DEMO_MODE':'0','ADMIN_PASSWORD':'TEST-ONLY-admin-password','SESSION_SECRET':'this-is-an-ephemeral-testing-secret-more-than-32-bytes','REMINDERS_ENABLED':'0'})
server=subprocess.Popen(['node','server.mjs'],cwd=p,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
jar=http.cookiejar.CookieJar();op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar));base='http://127.0.0.1:4193'
def ask(route,method='GET',payload=None,headers=None):
 req=urllib.request.Request(base+route,method=method,headers=headers or {})
 if payload is not None:req.add_header('Content-Type','application/json');req.data=json.dumps(payload).encode()
 try:
  with op.open(req,timeout=5) as r:return r.status,json.loads(r.read().decode())
 except urllib.error.HTTPError as e:
  return e.code,json.loads(e.read().decode())
try:
 for i in range(25):
  try:ask('/api/checkin/status');break
  except Exception:time.sleep(.2)
 s,x=ask('/api/checkin/status');assert s==200,(s,x)
 first,info=ask('/api/checkin','POST',{});assert first in (200,201),(first,info)
 second,again=ask('/api/checkin','POST',{});assert second==200 and again.get('alreadyCollected'),(second,again)
 check,info2=ask('/api/checkin/status');assert check==200 and info2['checkedToday']
 code,result=ask('/api/bootstrap');assert code==200 and not result['open']
 preview,result=ask('/api/preview','POST',{'code':'anything'});assert preview==404
 with urllib.request.urlopen(base+'/api/checkin/status') as r: assert r.status==200
 try:
  urllib.request.urlopen(base+'/assets/photos/original_black.jpg')
  raise AssertionError('Photo should be locked')
 except urllib.error.HTTPError as e:assert e.code==403,e.code
 otp,result=ask('/api/admin/orders/example/otp/request','POST',{});assert otp==401
 auth,result=ask('/api/admin/login','POST',{'password':'TEST-ONLY-admin-password'});assert auth==200,(auth,result)
 otpadmin,result=ask('/api/admin/orders/example/otp/request','POST',{});assert otpadmin==404,(otpadmin,result)
 print('PASS check-in first submission, duplicate, persistent status, locked bootstrap, no public preview, admin-only OTP, protected photos; admin auth works')
finally:
 server.terminate()
 try:server.communicate(timeout=3)
 except subprocess.TimeoutExpired:server.kill();server.communicate()
 db.write_bytes(backup)
