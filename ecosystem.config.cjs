module.exports = {
  apps: [
    {
      name: "utn-messager-bot",
      script: "./dist/index.js",
      instances: 1,
      autorestart: false, // Don't restart immediately on exit, wait for the cron schedule
      cron_restart: "*/20 * * * *", // Run every 10 minutes
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
