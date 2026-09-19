$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$project=Split-Path $PSScriptRoot -Parent
$source='D:\实习、找工作记录\宝可梦火红网页复刻'
$manifest=@()
foreach($name in @('pokeemerald-master','pokeemerald-expansion-master','Complete-Fire-Red-Upgrade-master')){
 $zip=[IO.Compression.ZipFile]::OpenRead((Join-Path $source ($name+'.zip')))
 try {
  $patterns=if($name -eq 'pokeemerald-master'){@('^README.md$','^data/maps/(FortreeCity|SlateportCity|Route119|LilycoveCity)/map.json$','^graphics/object_events/pics/people/(scientist_1|woman_3|man_3|boy_1|girl_1).png$','^graphics/tilesets/(primary/general|secondary/(fortree|slateport|lilycove))/','^data/tilesets/(primary/general|secondary/(fortree|slateport|lilycove))/')}
  elseif($name -eq 'pokeemerald-expansion-master'){@('^README.md$','^src/data/pokemon/base_stats.h$','^src/data/battle_moves.h$','^src/battle_ai_util.c$','^graphics/pokemon/(ralts|swablu|aron|litwick|chandelure|aggron|ampharos|quagsire|timburr|emolga|buizel|lillipup|minccino)/(front.png|back.png|icon.png|normal.pal)$')}
  else {@('^README.md$','^src/battle_ai.*\.c$','^src/config.h$','^include/constants/battle.h$')}
  foreach($entry in $zip.Entries){$relative=$entry.FullName.Substring(($name+'/').Length);if(!$entry.Name -or !($patterns|Where-Object {$relative -match $_})){continue}
   $destination=Join-Path $project ('assets\sources\'+$name+'\'+$relative.Replace('/','\'))
   $resolved=[IO.Path]::GetFullPath($destination);$allowed=[IO.Path]::GetFullPath((Join-Path $project 'assets\sources'))+'\'
   if(!$resolved.StartsWith($allowed,[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe archive path'}
   [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($resolved))|Out-Null
   [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$resolved,$true)
   $manifest+=@{archive=$name;entry=$entry.FullName;path=$resolved.Substring($project.Length+1).Replace('\','/');sha256=(Get-FileHash -LiteralPath $resolved -Algorithm SHA256).Hash}
  }
 }finally{$zip.Dispose()}
}
$manifest|ConvertTo-Json -Depth 4|Set-Content -LiteralPath (Join-Path $project 'assets\sources\manifest.json') -Encoding utf8
Write-Output "Imported $($manifest.Count) allowlisted source files."
