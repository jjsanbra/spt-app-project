import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: false,
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault || branch.name === "pre" || branch.name === "staging") {
      // Ramas principales y de preproducción: permanentes
      return {};
    }
    if (!branch.exists) {
      // Nuevas ramas efímeras de desarrollo/test: auto-expiración a los 7 días
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
