"""Explicitly regenerate editable projection content from the workshop specification."""
import re,json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
s=(root/'Agile_Sprint_Lab_HTML_Spec_v1.md').read_text()
rows=re.findall(r'^\| (P\d{2}) \| (\d+) \| [^|]+ \| (\d+) \|',s,re.M)
meta={r[0]:(int(r[1]),int(r[2])*60) for r in rows}
names=[('Welcome and purpose','歡迎與目的'),('Meet and form teams','交流與組隊'),('Roles and agreements','角色與約定'),('Challenge and readiness','挑戰與就緒'),('Share and clarify','分享與釐清'),('Definition of Done','共同完成標準'),('Map and prioritize','投票與排序'),('Goal and approach','目標與做法'),('Work one at a time','逐題實作'),('Prepare for review','準備成果交流'),('Gallery walk and feedback','成果交流與回應'),('Reflect and improve','反思與改善'),('Take a practice with you','帶走一項實務')]
def loc(t):
 t=t.strip().rstrip('。')
 a=t.split(' / ',1)
 return {'en':a[0].rstrip('.'),'zhTW':a[1].rstrip('。') if len(a)>1 else ''}
slides=[]
for m in re.finditer(r'^### (P\d{2})｜([^\n]+)\n(.*?)(?=\n### P\d|\n## 7\.|\Z)',s,re.M|re.S):
 id,title,block=m.groups()
 step,sec=meta.get(id,(None,0))
 if id=='P01': title='Agile Sprint Lab / 敏捷實作工作坊'
 if id=='P25': title='What will you try next? / 下一次，您想嘗試什麼？'
 def field(key):
  f=re.search(r'^- '+key+r'：(.+)$',block,re.M)
  return loc(f[1]) if f else None
 actions=[loc(t) for t in re.findall(r'^  \d\. (.+)$',block,re.M)]
 if not actions and field('行動'): actions=[field('行動')]
 sub=re.search(r'子活動 (\d) / (\d)',block)
 template=re.search(r'\bT[0-3]\b',block)[0]
 tools=field('工具')
 slide={'id':id,'stepId':step,'template':template,'title':loc(title),'durationSec':sec,'actions':actions,'why':field('原理'),'output':field('產出'),'tools':[tools] if tools else [],'supportingText':[],'facilitatorNotes':[]}
 if step: slide['stepTitle']=dict(zip(['en','zhTW'],names[step-1]))
 if sub: slide.update(substepIndex=int(sub[1]),substepCount=int(sub[2]))
 for key in ['範例','範例一行','輔助','固定提醒','語言註記']:
  val=field(key)
  if val: slide['supportingText'].append(val)
 for key in ['完成條件','視覺','條件區塊']:
  val=re.search(r'^- '+key+r'：(.+)$',block,re.M)
  if val:slide['facilitatorNotes'].append(val[1])
 slides.append(slide)
assert len(slides)==26
(root/'projection/src/slides.json').write_text(json.dumps(slides,ensure_ascii=False,indent=2)+'\n')
print('Synced 26 slides,',sum(s['durationSec'] for s in slides),'seconds')
