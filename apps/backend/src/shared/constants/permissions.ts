export const PERMISSIONS = {
  PLAYERS: {
    READ: "players.read",
    CREATE: "players.create",
    UPDATE: "players.update",
    DELETE: "players.delete",
    ROLE: {
      CREATE: "players.role.create",
      READ: "players.role.read",
      UPDATE: "players.role.update",
      DELETE: "players.role.delete",
    },
    PERMISSION: {
      CREATE: "players.permission.create",
      READ: "players.permission.read",
      UPDATE: "players.permission.update",
      DELETE: "players.permission.delete",
    },
    RESTRICT: {
      CREATE: "players.restrict.create",
      READ: "players.restrict.read",
      DELETE: "players.restrict.delete",
    },
  },
  EVENTS: {
    CREATE: "events.create",
    READ: "events.read",
    UPDATE: "events.update",
    DELETE: "events.delete",
  },
  STORE: {
    ITEM: {
      CREATE: "store.item.create",
      READ: "store.item.read",
      UPDATE: "store.item.update",
      DELETE: "store.item.delete",
    },
    METHODS: {
      CREATE: "store.methods.create",
      READ: "store.methods.read",
      UPDATE: "store.methods.update",
      DELETE: "store.methods.delete",
    },
  },
  CONFIG: {
    PANEL: {
      READ: "config.panel.read",
    },
  },
  ROLES: {
    CREATE: "roles.create",
    READ: "roles.read",
    UPDATE: "roles.update",
    DELETE: "roles.delete",
  },
  PERMISSIONS: {
    READ: "permissions.read"
  },
  ANALYTICS: {
    READ: "analytics.read",
  },
  OPTIONS: {
    UPDATE: "options.update",
    READ: "options.read"
  },
  MODPACKS: {
    CREATE: "modpacks.create",
    DELETE: "modpacks.delete"
  },
  NEWS: {
    CREATE: "news.create",
    DELETE: "news.delete",
    UPDATE: "news.update"
  },
  BANNERS: {
    CREATE: "banners.create",
    DELETE: "banners.delete",
    UPDATE: "banners.update"
  },
  HISTORY: {
    READ: "history.read"
  }
} as const;