export {};
declare global {
  interface Object {
    isNullOrEmpty(): boolean;
  }

  interface String {
    NoAccentString(): string;
  }
}
