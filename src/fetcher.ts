import { XMLParser } from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedUrl: string): Promise<RSSFeed> {
    const response = await fetch(feedUrl, {
        headers: {
            "User-Agent": "gator_ts"
        }
    })
    const res = await response.text();
    const parser = new XMLParser();

    const xml = parser.parse(res)
    const rss = xml.rss;
    if(!rss?.channel) {
        throw new Error("response does not contain proper RSS structure") 
    }
    const channel = rss.channel;
    if(!channel.title || !channel.link || !channel.description) {
        throw new Error("response channel does not contain proper fields");
    }
    const title = channel.title;
    const link = channel.link;
    const description = channel.description;
    let items = channel.item || []
    if(!Array.isArray(items)) {
        items = [items]
    }
    return {
        channel: {
            title,
            link,
            description,
            item: items.filter((element: RSSItem) => {
                if (element?.title && element?.link && element?.description && element?.pubDate) {
                    return true;
                }
                return false;
            })
        }
    } as RSSFeed
}