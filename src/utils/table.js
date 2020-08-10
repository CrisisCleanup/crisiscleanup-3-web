// @flow
/**
 * Table Helpers
 */

import _ from 'lodash';

export type ColumnT = {|
  dataIndex: string,
  key: string,
  title: string,
  width?: string,
|};

/**
 * Create a singular column item while providing
 * reasonable default values.
 * @param name - general name of column.
 * @param width - width of column.
 * @param title - Rendered title of column.
 * @returns {{dataIndex: string, width: *, title: (*|string), key: string}}
 */
const makeColumn = ([name, width = '1fr', title]): ColumnT => ({
  dataIndex: _.snakeCase(name),
  key: _.snakeCase(name),
  title: title || _.startCase(_.replace(name, '_t', '')),
  width,
});

/**
 * Generates columns for Table component.
 * @param cols - Array of columns to make.
 * @returns {Array<ColumnT>}
 */
const makeTableColumns = (cols: string[]): ColumnT[] =>
  cols.map((c) => makeColumn(c));

export { makeTableColumns };
