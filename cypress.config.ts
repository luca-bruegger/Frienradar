import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      config.baseUrl = 'http://localhost:8100';
      config.browsers.forEach(browser => {
        if (browser.name === 'chrome') {
          config.browser = browser;
        }
      });
    },
  },
});
