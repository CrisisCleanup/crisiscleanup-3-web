import moment from 'moment';

export interface ReportWidgetDefinition<T extends Record<string, any>> {
  type: string;
  cumsum?: string[];
  sum?: string[];
  filters?: Record<string, any>;
  group_by: Array<keyof T> | string[];
}

export type ReportWidgetInput = Record<string, any> & {
  type: string;
  field: string;
  filter: string;
  exclude?: boolean;
};

export type ReportWidgetDisplayOptions = Record<string, any> & {
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
  return conversions.reduce<Record<T[K], T[]>>((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(obj);
    return acc;
  }, {});
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
  const props = [...properties];
  if (props.length === 1) {
    return groupBy(arr, [...props][0]);
  }

  const property = props.shift()!;
  const grouped = groupBy(arr, property);
  for (const key of Object.keys(grouped) as Array<T[K]>) {
    grouped[key] = nestGroupsBy(grouped[key], [...props]) as Array<T[K]>;
  }

  return grouped;
}

export function transformWidgetData<T extends Record<string, any>>(
  graphValue: ReportWidgetGraphData<T>,
) {
  let data = {};
  switch (graphValue.definition.type) {
    case 'pie': {
      const value1 = nestGroupsBy(
        graphValue.data,
        graphValue.definition.group_by,
      );
      const result = {} as Record<string, any>;
      if (graphValue.data.length > 0) {
        for (const [wt, d] of Object.entries(value1)) {
          result[wt] = [];
          Object.entries(d as any).forEach(([key, state_value]: any) => {
            const obj = state_value[0];

            for (const k of Object.keys(obj)) {
              if (!graphValue.definition.group_by.includes(k)) {
                result[wt].push({
                  name: `${key}_${k}`,
                  value: obj[k],
                });
              }
            }
          });
        }
      }

      data = {
        data: result,
        group_by: graphValue.definition.group_by[0],
        type: graphValue.definition.type,
        display_options: graphValue.display_options,
      };

      break;
    }

    case 'multiline': {
      data = {
        data: graphValue.data,
        group_by: graphValue.definition.group_by[0],
        display_options: graphValue.display_options,
        type: graphValue.definition.type,
      };

      break;
    }

    case 'barstack': {
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

      break;
    }
    // No default
  }

  return data;
}

export function transformGraphData<T extends Record<string, any>>(
  rawGraphData: Array<[string, ReportWidgetGraphData<T>]>,
) {
  const transformedGraphData = {} as Record<string, any>;
  if (rawGraphData) {
    for (const [graphKey, graphValue] of rawGraphData) {
      transformedGraphData[graphKey] = transformWidgetData(graphValue);
    }
  }

  return transformedGraphData;
}
