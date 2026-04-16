module.exports = {
  apps: [
    {
      name: "rezervasyon",
      script: "npm",
      args: "start",
      cwd: "/var/www/html/rezervasyon",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};
