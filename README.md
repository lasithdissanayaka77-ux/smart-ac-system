# Smart AC System (simulation)

Setup:      cp .env.example .env   (then fill it in)   ->   npm install
Run (each in its own terminal):
  node ingestion/index.js
  node decision/index.js
  node control/index.js
  node dashboard/index.js        -> http://localhost:3000
  node sensor-sim.js 10 5000     (10 zones, one reading every 5 s)
Tests:      npm test
Docker:     docker compose up --build
Scale up:   docker compose up --build --scale decision=3 --scale ingestion=2
Node-RED:   paste nodered/filter-function.js into a function node
