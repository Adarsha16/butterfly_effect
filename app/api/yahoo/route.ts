import { NextResponse } from 'next/server';
import { calculateIndicators, MarketContextByDate, RawData } from '@/utils/financeMath';
import YahooFinance from 'yahoo-finance2';

const AUX_TICKERS = {
  vix: ['^VIX'],
  vxv: ['^VXV'],
  hyg: ['HYG'],
  lqd: ['LQD'],
  ief: ['IEF'],
  xlf: ['XLF'],
  rut: ['^RUT'],
  tnx: ['^TNX'],
  irx: ['^IRX'],
  dxy: ['DX-Y.NYB', 'UUP'],
  cl: ['CL=F', 'USO'],
  hg: ['HG=F', 'CPER'],
} as const;

type AuxPoint = { date: string; close: number };

const toDateKey = (value: Date | string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
};

type YahooFinanceClient = InstanceType<typeof YahooFinance>;

const fetchHistoricalWithRetry = async (
  yf: YahooFinanceClient,
  ticker: string,
  queryOptions: { period1: string; period2: string; interval: '1d' },
  attempts = 3
) => {
  for (let i = 0; i < attempts; i++) {
    try {
      const quotes = await yf.historical(ticker, queryOptions);
      if (Array.isArray(quotes) && quotes.length > 0) return quotes;
    } catch {
      // Retry alternative requests before giving up.
    }
  }
  return [];
};

const fetchAuxSeries = async (
  yf: YahooFinanceClient,
  candidates: readonly string[],
  queryOptions: { period1: string; period2: string; interval: '1d' }
) => {
  for (const ticker of candidates) {
    const quotes = await fetchHistoricalWithRetry(yf, ticker, queryOptions);
    if (quotes.length > 0) return quotes;
  }
  return [];
};

const buildCarryForwardMap = (series: AuxPoint[], targetDates: string[]) => {
  const sortedSeries = [...series].sort((a, b) => a.date.localeCompare(b.date));
  const sortedTargets = [...targetDates].sort((a, b) => a.localeCompare(b));

  const out: Record<string, number | undefined> = {};
  let seriesIdx = 0;
  let lastValue: number | undefined;

  for (const date of sortedTargets) {
    while (seriesIdx < sortedSeries.length && sortedSeries[seriesIdx].date <= date) {
      lastValue = sortedSeries[seriesIdx].close;
      seriesIdx += 1;
    }
    out[date] = lastValue;
  }

  return out;
};

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
    const auxKeys = Object.keys(AUX_TICKERS) as Array<keyof typeof AUX_TICKERS>;
    const [mainResult, ...auxResults] = await Promise.all([
      fetchHistoricalWithRetry(yf, ticker, queryOptions),
      ...auxKeys.map((auxKey) => fetchAuxSeries(yf, AUX_TICKERS[auxKey], queryOptions)),
    ]);

    if (!Array.isArray(mainResult) || mainResult.length === 0) {
      return NextResponse.json({ error: 'No primary price data returned.' }, { status: 502 });
    }

    const rawData: RawData[] = mainResult
      .filter((quote) => typeof quote.close === 'number' && Number.isFinite(quote.close))
      .map(quote => ({
        date: toDateKey(quote.date),
        price: quote.close
      }));

    const auxPriceMaps: Partial<Record<keyof typeof AUX_TICKERS, Record<string, number | undefined>>> = {};
    const targetDates = rawData.map((point) => point.date);

    auxResults.forEach((quotes, index) => {
      const auxKey = auxKeys[index];
      const series: AuxPoint[] = (quotes as any[])
        .filter((quote) => typeof quote.close === 'number' && Number.isFinite(quote.close))
        .map((quote) => ({
          date: toDateKey(quote.date),
          close: quote.close,
        }));

      auxPriceMaps[auxKey] = buildCarryForwardMap(series, targetDates);

      if (series.length === 0) {
        console.warn(`[yahoo] Missing aux series for ${String(auxKey)} across ${period1}..${period2}`);
      }
    });

    const marketContextByDate: MarketContextByDate = {};
    rawData.forEach(({ date }) => {
      marketContextByDate[date] = {
        vix: auxPriceMaps.vix?.[date],
        vxv: auxPriceMaps.vxv?.[date],
        hyg: auxPriceMaps.hyg?.[date],
        lqd: auxPriceMaps.lqd?.[date],
        ief: auxPriceMaps.ief?.[date],
        xlf: auxPriceMaps.xlf?.[date],
        rut: auxPriceMaps.rut?.[date],
        tnx: auxPriceMaps.tnx?.[date],
        irx: auxPriceMaps.irx?.[date],
        dxy: auxPriceMaps.dxy?.[date],
        cl: auxPriceMaps.cl?.[date],
        hg: auxPriceMaps.hg?.[date],
      };
    });

    const computedData = calculateIndicators(rawData, marketContextByDate);

    return NextResponse.json(computedData);
  } catch (error: any) {
    console.error("Error fetching Yahoo Finance data:", error);
    return NextResponse.json({ error: "Failed to fetch data." }, { status: 500 });
  }
}
