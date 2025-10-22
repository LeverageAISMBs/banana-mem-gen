
export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
