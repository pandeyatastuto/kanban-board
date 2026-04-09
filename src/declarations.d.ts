/* Allow importing CSS and JSON files in TypeScript */
declare module '*.css';
declare module '*.svg' {
  const content: string;
  export default content;
}
