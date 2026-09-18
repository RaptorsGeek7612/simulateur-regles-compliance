#!/bin/sh
set -e

PORT="${PORT:-8545}"

npx hardhat node --hostname 0.0.0.0 --port "$PORT" &
NODE_PID=$!

echo "Waiting for the RPC node on port $PORT..."
until node -e "fetch('http://127.0.0.1:$PORT',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',method:'eth_chainId',params:[],id:1})}).then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))" ; do
  sleep 1
done
echo "RPC node is up."

npx hardhat run scripts/deploy-for-diagnose-test.ts --network localhost

echo "Demo T-REX token deployed. Serving RPC on $PORT."
wait "$NODE_PID"
