declare global {
  interface Window {
    __APP_CONFIG__?: {
      apiUrl?: string;
    };
  }
}

export const environment = {
  apiUrl: window.__APP_CONFIG__?.apiUrl ?? 'http://localhost:8081/api',
  clienteTesteId: 2
};
