module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "570028f54473d1453ed62581e5afd6f7"),
    },
  },
  cron: {
    enabled: true,
  },
});
