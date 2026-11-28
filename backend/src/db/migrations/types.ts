export interface Migration {
  readonly version: number;
  readonly filename: string;
  readonly sql: string;
  readonly checksum: string;
}
