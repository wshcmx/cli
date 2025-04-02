localVersion=$(cat package.json | jq -r '.version')
masterVersion=$(git show origin/main:package.json | jq -r '.version')
if [ "${localVersion}" = "`echo -e "${localVersion}\n${masterVersion}" | sort -V | head -n1`" ]; then
    echo '::error::Package version should be upgraded'
    exit 1
fi