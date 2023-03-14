module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        client: "mongo",
        host: env("DATABASE_HOST", "localhost"),
        port: env.int("DATABASE_PORT", 27017),
        database: env("DATABASE_NAME", "mydb"),
        username: env("DATABASE_USERNAME", null),
        password: env("DATABASE_PASSWORD", null),
      },
      options: {
        socketTimeoutMS: 30000,
        keepAlive: true,
        reconnectTries: 30000,
        autoReconnect: true,
        authenticationDatabase: env("AUTHENTICATION_DATABASE", null),
        ssl: env("DATABASE_SSL", false),
        pool: {
          min: 0,
          max: 10,
          idleTimeoutMillis: 30000,
          createTimeoutMillis: 30000,
          acquireTimeoutMillis: 30000,
        },
      },
    },
  },
});
