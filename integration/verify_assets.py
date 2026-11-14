from pathlib import Path
import json, hashlib
BASE=Path(__file__).resolve().parents[1]
items=json.loads((BASE/'integration'/'asset_checksums.json').read_text(encoding='utf8'))
failed=[]
for x in items:
    p=BASE/x['file']
    if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=x['sha256']:
        failed.append(x['file'])
print(f'Validated {len(items)-len(failed)}/{len(items)} bundled media assets')
if failed:
    for f in failed: print('MISSING/CHANGED:',f)
    raise SystemExit(1)
