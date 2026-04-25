import { NextResponse } from 'next/server';
import { calculateIndicators, RawData } from '@/utils/financeMath';
import YahooFinance from 'yahoo-finance2';

export async function GET() {
  try {
    const query = '^GSPC'; // S&P 500 Index
    const queryOptions = {
      period1: '2006-01-01',
      period2: '2008-12-31',
      interval: '1d' as const
    };
    const yf = new YahooFinance();
    const result = await yf.historical(query, queryOptions);

    const rawData: RawData[] = result.map(quote => ({
      date: quote.date.toISOString().split('T')[0],
      price: quote.close
    }));

    const computedData = calculateIndicators(rawData);

    return NextResponse.json(computedData);
  } catch (error: any) {
    console.error("Error fetching Yahoo Finance data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
