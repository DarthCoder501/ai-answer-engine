// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import Groq from "groq-sdk";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export async function POST(req: Request): Promise<Response> {
  try {
    // Parse the request payload
    const { siteURL, userQuery } = await req.json();

    if (!siteURL || !userQuery) {
      return new Response(
        JSON.stringify({
          error: "Missing siteURL or userQuery in the request.",
        }),
        { status: 400 }
      );
    }

    // Configure Puppeteer for web scraping
    await chromium.font(
      "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
    );

    const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;
    const browser = await puppeteer.launch({
      args: isLocal
        ? puppeteer.defaultArgs()
        : [
            ...chromium.args,
            "--hide-scrollbars",
            "--incognito",
            "--no-sandbox",
          ],
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath()),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(siteURL);

    // Extract content with Cheerio or Puppeteer APIs
    const pageTitle = await page.title();
    const pageContent = await page.content();
    await browser.close();

    // Process content with Groq
    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY, // Ensure this is set in your environment variables
    });

    const chatCompletion = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are an AI assistant." },
        {
          role: "user",
          content: `Analyze the following content: ${pageContent}`,
        },
        { role: "user", content: userQuery },
      ],
      model: "llama3-8b-8192", // Use the appropriate model
    });

    // Respond with the scraped data and Groq's response
    return new Response(
      JSON.stringify({
        pageTitle,
        groqResponse: chatCompletion.choices[0].message.content,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in POST /route:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing the request.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
