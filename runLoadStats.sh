OUTPUT="$(node loadStats.js -1)"
echo "${OUTPUT}"

for ((i=1;i<=${OUTPUT};i++));
do
   # your-unix-command-here
   echo $i
   node loadStats.js $i
done
