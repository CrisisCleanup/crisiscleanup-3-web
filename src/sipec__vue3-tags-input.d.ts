/**
 * Shims for @sipec/vue3-tags-input
 *
 * For more documentation,
 * @see https://github.com/sipec/vue-tags-input
 */
declare module '@sipec/vue3-tags-input' {
  export type TagInputData = {
    text: string;
    tiClasses: string[];
  } & Record<string, unknown>;
  export function createTag(tag: TagInputData, ...rest: any[]): TagInputData;
  export function createTags(
    tags: TagInputData[],
    ...rest: any[]
  ): TagInputData[];
}
