import moment from 'moment';

export interface ReportWidgetDefinition<T extends Record<string, any>> {
  type: string;
  cumsum?: string[];
  sum?: string[];
  filters: Record<string, string>;
  group_by: (keyof T)[];
}

export type ReportWidgetInput = {
  [key: string]: string;
} & {
  type: string;
  field: string;
  filter: string;
};

export type ReportWidgetDisplayOptions = {
  [key: string]: any;
} & {
  number_format?: string;
  axes?: {
    x: { name: string };
    y: { name: string };
  };
  colors?: Record<string, any>;
};

export interface ReportWidgetGraphData<T extends Record<string, any>> {
  key: string;
  inputs: ReportWidgetInput[];
  definition: ReportWidgetDefinition<T>;
  data: T[];
  display_options: ReportWidgetDisplayOptions;
}

/**
 * Group objects by property.
 * `nestGroupsBy` helper method.
 *
 * @param {Object[]} conversions
 * @param {String} property
 * @returns {Object}
 */
function groupBy<T extends Record<string, any>, K extends keyof T>(
  conversions: T[],
  property: K,
): Record<T[K], T[]> {
  return conversions.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {} as Record<T[K], T[]>);
}

/**
 * Nest groups by properties.
 * @param arr
 * @param properties
 *
 * @example
 * ```ts
 * const data = [
 *   { id: 1, name: 'John', age: 24 },
 *   { id: 2, name: 'Jane', age: 24 },
 *   { id: 3, name: 'John', age: 26 },
 * ];
 * const result = nestGroupsBy(data, ['name', 'age']);
 * expect(result).toMatchInlineSnapshot(`
 *   {
 *     "Jane": {
 *       "24": [
 *         {
 *           "age": 24,
 *           "id": 2,
 *           "name": "Jane",
 *         },
 *       ],
 *     },
 *     "John": {
 *       "24": [
 *         {
 *           "age": 24,
 *           "id": 1,
 *           "name": "John",
 *         },
 *       ],
 *       "26": [
 *         {
 *           "age": 26,
 *           "id": 3,
 *           "name": "John",
 *         },
 *       ],
 *     },
 *   }
 * `);
 * ```
 */
export function nestGroupsBy<T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  properties: K[],
): Record<T[K], T[]> {
  const props = Array.from(properties);
  if (props.length === 1) {
    return groupBy(arr, Array.from(props)[0]);
  }
  const property = props.shift() as K;
  const grouped = groupBy(arr, property);
  for (const key of Object.keys(grouped) as T[K][]) {
    grouped[key] = nestGroupsBy(grouped[key], Array.from(props)) as T[K][];
  }
  return grouped;
}

export function transformWidgetData<T extends Record<string, any>>(
  graphValue: ReportWidgetGraphData<T>,
) {
  let data = {};
  if (graphValue.definition.type === 'pie') {
    const value1 = nestGroupsBy(
      graphValue.data,
      graphValue.definition.group_by,
    );
    const result = {} as Record<string, any>;
    if (graphValue.data.length > 0) {
      Object.entries(value1).forEach(([wt, d]) => {
        result[wt] = [];
        Object.entries(d as any).forEach(([key, state_value]: any) => {
          const obj = state_value[0];

          Object.keys(obj).forEach((k) => {
            if (!graphValue.definition.group_by.includes(k)) {
              result[wt].push({
                name: `${key}_${k}`,
                value: obj[k],
              });
            }
          });
        });
      });
    }

    data = {
      data: result,
      group_by: graphValue.definition.group_by[0],
      type: graphValue.definition.type,
      display_options: graphValue.display_options,
    };
  } else if (graphValue.definition.type === 'multiline') {
    data = {
      data: graphValue.data,
      group_by: graphValue.definition.group_by[0],
      display_options: graphValue.display_options,
      type: graphValue.definition.type,
    };
  } else if (graphValue.definition.type === 'barstack') {
    data = {
      data: graphValue.data.map((entry) => {
        return {
          ...entry,
          [graphValue.definition.group_by[0]]: moment(
            entry[graphValue.definition.group_by[0]],
          ).toDate(),
        };
      }),
      group_by: graphValue.definition.group_by[0],
      type: graphValue.definition.type,
      display_options: graphValue.display_options,
    };
  }
  return data;
}

export function transformGraphData<T extends Record<string, any>>(
  rawGraphData: [string, ReportWidgetGraphData<T>][],
) {
  const transformedGraphData = {} as Record<string, any>;
  if (rawGraphData) {
    rawGraphData.forEach(([graphKey, graphValue]) => {
      transformedGraphData[graphKey] = transformWidgetData(graphValue);
    });
  }
  return transformedGraphData;
}
