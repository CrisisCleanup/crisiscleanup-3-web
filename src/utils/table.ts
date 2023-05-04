/**
 * Table Helpers
 */

import _ from 'lodash';

interface ColumnT {
  titleClass: string;
  class: string;
  style: { border: number };
  headerStyle: { border: number };
  dataIndex: string;
  key: string;
  title: string;
  width?: string;
  transformer?: (field: string, item: any) => string;
}

/**
 * Create a singular column item while providing
 * reasonable default values.
 * @param name - general name of column.
 * @param width - width of column.
 * @param title - Rendered title of column.
 * @param options - Additional table options
 * @returns {{dataIndex: string, width: *, title: (*|string), key: string}}
 */
const makeColumn = ([
  name,
  width = '1fr',
  title,
  options = {},
]: any): ColumnT => ({
  dataIndex: _.snakeCase(name),
  key: _.snakeCase(name),
  title: title || _.startCase(_.replace(name, '_t', '')),
  width,
  ...options,
});

/**
 * Generates columns for Table component.
 * @param cols - Array of columns to make.
 * @returns {Array<ColumnT>}
 */
const makeTableColumns = (cols: any[][]): ColumnT[] =>
  cols.map((c) => makeColumn(c));

export { makeTableColumns };
