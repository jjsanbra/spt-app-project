import { defineConfig } from 'orval';

export default defineConfig({
  sptApi: {
    input: {
      target: '../backend/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './projects/spt-app/src/app/core/api/endpoints',
      schemas: './projects/spt-app/src/app/core/api/model',
      client: 'angular',
      mock: true,
      clean: true,
      prettier: false,
    },
  },
});
