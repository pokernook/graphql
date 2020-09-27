ref=$1
echo "pr-${ref##*/}" | tr -dc "[:alnum:]-\n\r" | head -c 25
