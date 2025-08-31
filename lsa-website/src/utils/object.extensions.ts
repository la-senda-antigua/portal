export {};

Object.prototype.isNullOrEmpty = function (): boolean {
  return this === null || this === undefined || Object.keys(this).length === 0;
}