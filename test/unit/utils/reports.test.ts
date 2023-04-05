import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import reportsGraphData from '../fixtures/getReportsGraphData.json';
import { MOCK_DATE } from '../../helpers';
import { transformGraphData, transformWidgetData } from '@/utils/reports';
import type { ReportWidgetGraphData } from '@/utils/reports';

describe('utils > reports', () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  const d = Object.entries(reportsGraphData) as unknown as Array<
    [string, ReportWidgetGraphData<Record<string, any>>]
  >;

  for (const [graphName, graphValue] of d) {
    test(`transformWidgetData: ${graphName}`, () => {
      vi.setSystemTime(MOCK_DATE);
      const result = transformWidgetData(graphValue);
      expect(result).toMatchSnapshot();
    });
  }

  test('transformGraphData', () => {
    vi.setSystemTime(MOCK_DATE);
    const result = transformGraphData(d);
    expect(result).toMatchSnapshot();
  });
});
