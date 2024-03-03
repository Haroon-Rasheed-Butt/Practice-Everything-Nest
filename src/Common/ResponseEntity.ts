export class ResponseEntity<T> {
  body: T;
  code: number;
  headers: Record<string, string>;
  message: string;
  count: number;

  constructor(body: T, code: number,message: string, count?: number) {
    this.body = body;
    this.code = code;
    this.headers = {};
    this.message = message;
    this.count = count;

  }

  setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }
}