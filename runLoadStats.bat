@echo off

set NODE_ENV=development

setlocal enableextensions 
for /f "tokens=*" %%a in ( 
'node loadStats.js -1' 
) do ( 
set myvar=%%a 
) 
echo/%%myvar%%=%myvar% 

for /L %%n in (1,1,%myvar%) do "G:\Program Files\nodejs\node" loadStats.js %%n