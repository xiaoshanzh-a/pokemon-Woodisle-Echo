// Screen/world axes: east +x, south +z. Maps form a finite 3-by-2 region.
export const TOWN_GRID=[[2,1],[2,0],[1,1],[1,0],[0,1],[0,0]];
export const DIRS={west:{name:'西',x:-19,z:5,dx:1,dz:0},east:{name:'东',x:19,z:5,dx:-1,dz:0},north:{name:'北',x:0,z:-16,dx:0,dz:1},south:{name:'南',x:0,z:18,dx:0,dz:-1}};
export const OPPOSITE={west:'east',east:'west',north:'south',south:'north'};
export const CONNECTIONS=[
 {towns:[0,2],sides:['west','east']},
 {towns:[1,3],sides:['west','east']},
 {towns:[2,4],sides:['west','east']},
 {towns:[3,5],sides:['west','east']},
 {towns:[4,0],sides:['south','south']}, // Southern coastal arc.
 {towns:[5,1],sides:['north','north']}  // Northern mountain arc.
];
export function townEndpoint(route,town){const link=CONNECTIONS[route],n=link.towns.indexOf(town);if(n<0)return null;return {...DIRS[link.sides[n]],side:link.sides[n]};}
export function routeEndpoint(route,town){const g=townEndpoint(route,town);if(!g)return null;
 if(route<4)return {...DIRS[OPPOSITE[g.side]],side:OPPOSITE[g.side]};
 const n=CONNECTIONS[route].towns.indexOf(town),side=OPPOSITE[g.side];return {...DIRS[side],x:n===0?-13:13,side};
}
export function placeAtEntrance(w,g){w.pos.set(g.x+g.dx*2.6,0,g.z+g.dz*2.6);w.fpos.set(w.pos.x-g.dx*.8,0,w.pos.z-g.dz*.8);w.trail=[w.fpos.clone(),w.pos.clone()];w.playerDir=g.dx?2:g.dz<0?1:0;w.facingRight=g.dx>0;w.look.set(w.pos.x*.22,0,w.pos.z*.28);w.camera.position.set(w.look.x,32,w.look.z+38);w.camera.lookAt(w.look.x,0,w.look.z);}
export function mainConnection(town){return {to:town%2===0?town+1:town-1,side:town%2===0?'north':'south'};}
