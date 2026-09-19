// Local MP3s selected from the user's Pokémon music collection.
export const COLLECTION_TRACKS=[
 ['viridian-forest','常青森林 · 微光林间'],['slateport-city','凯那市 · 潮汐港口'],
 ['white-forest','白色森林 · 保育湿地'],['celadon-city','玉虹市 · 星灯街'],
 ['lavender-town','紫苑镇 · 回响遗迹'],['mt-moon','月见山洞窟 · 石窟深处'],
 ['route-to-cerulean','通往华蓝之路 · 山野行旅'],['hauoli-day','好奥乐市（白天）· 归帆海岸'],
 ['driftveil-city','帆巴市 · 接力码头'],['fallarbor-town','秋叶镇 · 避雨内院'],
 ['ever-grande','彩幽市 · 月露花谷'],['black-city','黑色城市 · 夜间广播街区']
].map(([id,name])=>({id,name}));
export const COLLECTION_AUDIO=Object.fromEntries(COLLECTION_TRACKS.map(t=>[t.id,'assets/music/'+t.id+'.mp3']));
export const SCENE_AUDIO={forest:COLLECTION_AUDIO['viridian-forest'],coast:COLLECTION_AUDIO['slateport-city'],safari:COLLECTION_AUDIO['white-forest'],arcade:COLLECTION_AUDIO['celadon-city'],ruin:COLLECTION_AUDIO['lavender-town']};
export const ROUTE_MUSIC=['town','white-forest','route-to-cerulean','viridian-forest','hauoli-day','ever-grande'];
