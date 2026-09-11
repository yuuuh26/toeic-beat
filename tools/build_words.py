"""Build original learning data from independently authored bilingual phrases.
Phrase templates intentionally stay short so learners can inspect collocations.
No textbook text or external vocabulary database is used.
"""
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
POS={'v':'verb','n':'noun','a':'adjective','d':'adverb'}
# Each template preserves the supplied dictionary-form Japanese action.
TEMPLATES=[
 ('We need to {}.','私たちは{}必要がある。'),
 ('Our team will {}.','私たちのチームは{}予定だ。'),
 ('They plan to {}.','彼らは{}計画だ。'),
 ('The manager agreed to {}.','管理者は{}ことに同意した。'),
 ('We decided to {}.','私たちは{}ことを決めた。'),
 ('The company plans to {}.','会社は{}計画だ。'),
 ('Our staff can {}.','私たちの職員は{}ことができる。'),
 ('They are ready to {}.','彼らは{}準備ができている。'),
]
words=[]
for level in range(1,6):
 category='ビジネス'
 rows=[]
 for line in (ROOT/'data'/f'level{level}.txt').read_text().splitlines():
  if not line or line.startswith('#'):continue
  if line.startswith('@'):category=line[1:];continue
  parts=line.split('|');assert len(parts)==8,(level,len(parts),line)
  word,meaning,ipa,pos,p1,j1,p2,j2=parts
  idx=len(rows);t1=TEMPLATES[idx%len(TEMPLATES)];t2=TEMPLATES[(idx+3)%len(TEMPLATES)]
  entry=dict(id='w-'+word.replace(' ','-'),word=word,meaning=meaning,ipa=ipa,partOfSpeech=POS[pos],level=level,difficulty=level,category=category,importance=6-level,example1=t1[0].format(p1),example1Ja=t1[1].format(j1),example2=t2[0].format(p2),example2Ja=t2[1].format(j2),collocations=[p1,p2],note=f'ここでは「{meaning}」の用法を学習します。ほかの意味や品詞を持つ場合もあります。')
  assert word.lower() in p1.lower() and word.lower() in p2.lower(),(word,p1,p2)
  rows.append(entry)
 assert len(rows)==100,(level,len(rows))
 words+=rows
assert len({w['word'] for w in words})==500,'duplicate word'
assert len({w['id'] for w in words})==500
# Synonymous readings must not appear as competing answers. Symmetric exclusions.
groups=[
 ['approve','authorize','endorse','sanction'],['postpone','defer'],['confirm','verify','validate'],
 ['provide','furnish','supply'],['require','necessitate'],['maintain','sustain','retain','preserve'],
 ['reduce','decrease','diminish','curtail'],['improve','enhance','refine','upgrade'],
 ['allocate','assign','designate'],['replace','substitute'],['notify','inform'],
 ['cancel','revoke','annul','rescind'],['resolve','settle'],['negotiate','bargain'],
 ['purchase','procure','acquire'],['hire','recruit'],['renew','extend'],
 ['available','accessible'],['necessary','essential','indispensable','mandatory','compulsory'],
 ['suitable','appropriate','eligible','qualified'],['effective','efficient'],
 ['accurate','precise','exact'],['reliable','dependable','credible'],['temporary','interim','provisional'],
 ['permanent','perpetual'],['competitive','competent'],['promptly','immediately','instantly'],
 ['currently','presently'],['approximately','roughly'],['regularly','periodically'],
 ['previously','formerly'],['carefully','meticulously','diligently'],['substantial','considerable','significant'],
 ['comprehensive','thorough','extensive'],['relevant','pertinent'],['feasible','viable','practical'],
 ['obsolete','outdated'],['defective','faulty'],['consecutive','successive'],
 ['prospective','potential'],['confidential','proprietary'],['lucrative','profitable'],
 ['constraint','restriction','limitation'],['requirement','prerequisite'],['incentive','motivation'],
 ['reimbursement','refund'],['revenue','turnover'],['expense','expenditure','outlay'],
 ['agreement','contract'],['agenda','itinerary','schedule'],['appointment','reservation'],
 ['customer','client'],['employee','personnel','staff'],['supervisor','manager'],
 ['applicant','candidate'],['delivery','shipment','consignment'],['inventory','stock'],
 ['proposal','recommendation'],['estimate','quotation'],['feedback','evaluation','assessment'],
 ['inquiry','query'],['permission','authorization','consent'],['notice','notification','announcement'],
 ['surplus','excess'],['shortage','deficit'],['venue','premises','facility'],
 ['collaborate','cooperate'],['comply','conform','adhere'],['inspect','examine','scrutinize'],
 ['assess','evaluate','appraise'],['expand','enlarge'],['eliminate','remove'],['distribute','disseminate'],
 ['acknowledge','recognize'],['implement','execute','enforce'],['amend','revise','modify'],
 ['facilitate','expedite'],['prohibit','restrict','ban'],['compensate','reimburse','refund'],
 ['disclose','reveal'],['anticipate','expect','foresee'],['deduct','subtract'],['accumulate','accrue'],
 ['terminate','discontinue','cease'],['commence','initiate'],['accommodate','house'],
 ['rectify','resolve','amend','revise','modify'],['substantiate','corroborate','verify'],['stipulate','specify','delineate','articulate'],['mitigate','alleviate','reduce','curtail'],['bolster','reinforce','enhance','augment'],['foster','cultivate'],['spearhead','orchestrate','coordinate'],['commence','launch'],['terminate','cease','suspend'],['allocate','assign','delegate'],['necessary','adequate'],['exceptional','outstanding'],['exclusive','proprietary'],['potential','prospective','tentative'],['predominantly','primarily','exclusively'],['considerably','exceedingly','increasingly'],['promptly','readily'],['acquisition','purchase','procurement'],['provision','stipulation','clause','regulation'],['liability','obligation','commitment'],['appraisal','assessment','evaluation'],['venue','accommodation','premises','facility'],['inquiry','request'],['receipt','invoice'],
 ['attend','participate'],['promote','advertise'],['convenient','accessible'],
]
byword={w['word']:w for w in words}
for w in words:
 exclude={x for g in groups if w['word'] in g for x in g if x!=w['word']}
 w['synonyms']=sorted(exclude)
 w['excludeMeanings']=[byword[x]['meaning'] for x in sorted(exclude) if x in byword]
overrides=json.loads((ROOT/'data'/'example-overrides.json').read_text())
for w in words:
 if w['word'] in overrides:
  for key,value in zip(['example1','example1Ja','example2','example2Ja'],overrides[w['word']]):w[key]=value
 for key in ['example1','example2']:
  assert len(w[key].split())<=20,(w['word'],key,'too long')
text=json.dumps(words,ensure_ascii=False,indent=2)+'\n'
if '--check' in sys.argv:
 assert (ROOT/'words.json').read_text()==text,'words.json is out of date'
else:(ROOT/'words.json').write_text(text)
print(f'Validated {len(words)} unique words, 100 per level, {len(words)*2} bilingual examples.')
