import { NextResponse } from 'next/server';
import { calculateIndicators, RawData } from '@/utils/financeMath';
import YahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker') || '^GSPC';

  const period1 = searchParams.get('period1') || ('2018-01-01');
  const period2 = searchParams.get('period2') || (new Date().toISOString().split('T')[0]);

  try {
    const queryOptions = {
      period1,
      period2,
      interval: '1d' as const
    };
    const yf = new YahooFinance();
    const result = await yf.historical(ticker, queryOptions);

    const rawData: RawData[] = result.map(quote => ({
      date: quote.date.toISOString().split('T')[0],
      price: quote.close
    }));

    const computedData = calculateIndicators(rawData);

    return NextResponse.json(computedData);
  } catch (error: any) {
    console.error("Error fetching Yahoo Finance data:", error);
    return NextResponse.json({ error: "Failed to fetch data." }, { status: 500 });
  }
}
