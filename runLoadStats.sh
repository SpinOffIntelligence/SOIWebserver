for ((i=1;i<=100;i++));
do
   # your-unix-command-here
   echo $i
   node loadStats.js $i
done
