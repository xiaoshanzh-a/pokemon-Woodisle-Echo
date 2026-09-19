from pathlib import Path
from PIL import Image
import json
ROOT=Path(__file__).resolve().parents[2]
SRC=Path(r'D:\实习、找工作记录\宝可梦火红网页复刻\pokefirered-master')
OUT=ROOT/'emerald-echo/assets'
entries=[]
def export(src,name,key=False,first_frame=False):
 im=Image.open(src)
 if im.mode=='P':
  mask=im.point(lambda p:0 if p==0 else 255,mode='L');im=im.convert('RGBA');im.putalpha(mask)
 else: im=im.convert('RGBA')
 if key:
  px=im.load()
  for y in range(im.height):
   for x in range(im.width):
    r,g,b,a=px[x,y]
    if b>r*1.13 and b>g*1.2 and r<100 and g<100: px[x,y]=(r,g,b,0)
  box=im.getbbox()
  if box:im=im.crop(box)
  im.thumbnail((512,512))
 if first_frame: im=im.crop((0,0,16,32))
 im.save(OUT/(name+'.png'))
 entries.append({'asset':name+'.png','source':str(src),'size':list(im.size)})
names='bulbasaur ivysaur venusaur charmander charmeleon charizard squirtle wartortle blastoise pikachu raichu eevee vaporeon jolteon flareon pidgey rattata caterpie weedle nidoran_f nidoran_m clefairy vulpix psyduck growlithe abra gastly onix dratini snorlax lapras magikarp gyarados scyther chansey kangaskhan tauros mew mewtwo articuno zapdos moltres'.split()
for n in names:
 for side in ['front','back']: export(SRC/'graphics/pokemon'/n/(side+'.png'),n+'-'+side)
for n in ['red_normal','prof_oak','woman_1','youngster','fisher','ranger_m']:
 p=SRC/'graphics/object_events/pics/people'/(n+'.png')
 if p.exists(): export(p,n)
people='mom little_girl little_boy boy man woman_1 woman_2 woman_3 fat_man old_man_1 old_woman daisy youngster lass bug_catcher hiker black_belt cooltrainer_m cooltrainer_f picnicker beauty rich_boy gentleman sailor swimmer_m_land swimmer_f_land tuber_m_land tuber_f scientist rocker rocket_m rocket_f policeman worker_m worker_f nurse clerk fisher gym_guy brock misty erika lt_surge koga sabrina blaine giovanni lorelei bruno agatha lance blue bill mr_fuji celio'.split()
for n in people:
 p=SRC/'graphics/object_events/pics/people'/(n+'.png')
 if p.exists(): export(p,'npc-'+n,first_frame=True)
local={'tree':'vegetation/pallet_oak_tree.png','tree2':'vegetation/viridian_forest_tree.png','flowers':'vegetation/pallet_wildflower_patch.png','grass':'vegetation/route1_grass_tuft.png','bush':'vegetation/viridian_shrub_cluster.png','professor':'npcs/pallet_elder_researcher.png','woman':'npcs/pallet_woman.png','house':'architecture/towns/pallet_players_house.png','house2':'architecture/towns/blue_roof_small_house.png','center':'architecture/facilities/pokemon_center.png','lab':'architecture/facilities/research_lab.png','arcade':'architecture/facilities/game_corner.png','safari':'architecture/facilities/fuchsia_safari_gatehouse.png'}
for n,p in local.items():export(ROOT/'assets/fire_red'/p,n,True)
for n,p in {'room-bed':'interiors/celadon_hotel_bed.png','room-shelf':'interiors/celadon_department_store_display_shelf.png','room-healer':'interiors/vermilion_center_healing_terminal.png','room-pc':'interiors/cinnabar_lab_computer.png','room-sofa':'interiors/cinnabar_lab_lounge_sofa.png','room-arcade':'props/two_island_arcade_machine.png'}.items():
 export(ROOT/'assets/fire_red'/p,n,True)
for n in names:
 export(SRC/'graphics/pokemon'/n/'icon.png',n+'-walk')
for n in ['nurse','clerk']:
 export(SRC/'graphics/object_events/pics/people'/(n+'.png'),'room-'+n,first_frame=True)
(OUT/'manifest.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Imported {len(entries)} assets; originals unchanged.')

