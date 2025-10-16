module.exports = {
  apps: [{
    name: 'kirana-store-api',    // Your app's name
    script: 'server.js',        // The main file to start
    instances: 'max',           // Automatically create as many processes as there are CPU cores
    exec_mode: 'cluster',       // Enable the cluster mode for load balancing
  }]
};