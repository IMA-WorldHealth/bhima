const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Chemin vers votre installation de Chrome
    headless: true, // Mode sans tête
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Arguments supplémentaires pour Puppeteer
    defaultViewport: null, // Utiliser la taille de la fenêtre par défaut
    timeout: 120000, // Augmenter le délai d'attente à 2 minutes
  });

  const page = await browser.newPage();
  await page.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 120000 });
  await page.pdf({ path: 'output.pdf', format: 'A4' });

  await browser.close();
})();
