import { describe, expect, test } from 'vitest';
import reportsGraphData from '../fixtures/getReportsGraphData.json';
import { transformGraphData, transformWidgetData } from '@/utils/reports';

describe('utils > reports', () => {
  const d = Object.entries(reportsGraphData);

  for (const [graphName, graphValue] of d) {
    test(`transformWidgetData: ${graphName}`, () => {
      const result = transformWidgetData(graphValue);
      expect(result).toMatchSnapshot();
    });
  }

  test('transformGraphData', () => {
    const result = transformGraphData(d);
    expect(result).toMatchSnapshot();
  });
});
