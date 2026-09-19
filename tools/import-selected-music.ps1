$ErrorActionPreference='Stop'
$musicSource='D:\CloudMusic\宝可梦游戏音乐部分集'
$musicTarget=Join-Path (Split-Path $PSScriptRoot -Parent) 'assets\music'
$tracks=@{
 'viridian-forest'='一之瀬剛 - トキワの森.mp3'
 'slateport-city'='景山将太 - カイナシティ.mp3'
 'white-forest'='景山将太 - ホワイトフォレスト.mp3'
 'celadon-city'='景山将太 - タマムシシティのテーマ.mp3'
 'lavender-town'='景山将太 - シオンタウンのテーマ.mp3'
 'mt-moon'='一之瀬剛 - オツキミ山のどうくつ.mp3'
 'route-to-cerulean'='一之瀬剛 - ハナダへの道-オツキミ山より.mp3'
 'hauoli-day'='足立美奈子 - ハウオリシティ(昼).mp3'
 'driftveil-city'='佐藤仁美 - ホドモエシティ.mp3'
 'fallarbor-town'='足立美奈子 - ハジツゲタウン.mp3'
 'ever-grande'='足立美奈子 - サイユウシティ.mp3'
 'black-city'='景山将太 - ブラックシティ.mp3'
}
foreach($id in $tracks.Keys){Copy-Item -LiteralPath (Join-Path $musicSource $tracks[$id]) -Destination (Join-Path $musicTarget ($id+'.mp3'))}
Write-Output ('Imported '+$tracks.Count+' selected MP3 tracks.')
