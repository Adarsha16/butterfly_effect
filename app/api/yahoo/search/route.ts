import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) return NextResponse.json([]);

  try {
    const yf = new YahooFinance();
    const results = await yf.search(q);
    // Filter out quotes without symbols and limit to top 5
    const suggestions = results.quotes
      .filter((quote: any) => quote.symbol && quote.shortname)
      .slice(0, 5)
      .map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.shortname || quote.longname || quote.symbol
      }));

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Yahoo Search Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
