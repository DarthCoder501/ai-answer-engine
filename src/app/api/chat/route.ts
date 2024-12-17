import { NextResponse } from "next/server";
import { getGroqResponse } from "@/app/utils/groqClient";
import { scrapeURL, urlPattern } from "@/app/utils/scraper";

export async function POST(req: Request) {
  try {
    const { message, messages } = await req.json();

    console.log("message received:", message);
    console.log("messages", messages);

    /*
    const url = message.match(urlPattern);

    let scrapedContent = "";
    if (url) {
      console.log("URL found", url);
      const scraperResponse = await scrapeURL(url);
      console.log("Scraped content", scrapedContent);
      if (scraperResponse) {
        scrapedContent = scraperResponse.content;
      }
    }
    */

    const url = message.match(urlPattern);
    let scrapedContent = "";
    if (url) {
      console.log("Url found: ", url[0]);
      const scraperResponse = await scrapeURL(url[0]);
      console.log("scrapedContent: ", scrapedContent);
      if (scraperResponse) {
        scrapedContent = scraperResponse.content;
      }
    }

    const userQuery = message.replace(url ? url[0] : " ", " ").trim();

    const userprompt = `
    Answer my question: "${userQuery}"

    Based on the following content: 
    <content> 
    ${scrapedContent}
    <content>
    `;

    const llmMessages = [
      ...messages,
      {
        role: "user",
        content: userprompt,
      },
    ];

    const response = await getGroqResponse(llmMessages);

    return NextResponse.json({ message: response });
  } catch (error) {
    return NextResponse.json({ message: "Error" });
  }
}
