// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export async function POST(req: Request) {
  const { siteURL } = await req.json();
  await chromium.font(
    "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
  );

  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  const browser = await puppeteer.launch({
    args: isLocal
      ? puppeteer.defaultArgs()
      : [...chromium.args, "--hide-scrollbars", "--incognito", "--no-sandbox"],
    defaultViewport: chromium.defaultViewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://2198e11761fa42120f3039fdf3054915.r2.cloudflarestorage.com/chromium-v131-pack"
      )),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto(siteURL);
  const pageTitle = await page.title();
  const screenshot = await page.screenshot();
  await browser.close();

  console.log("screenshot", screenshot);
  return Response.json({
    pageTitle,
  });
}

try {
} catch (error) {}
