const API_BASE_URL = import.meta.env.PROD 
  ? 'https://poe2htc.com/api' 
  : 'http://localhost:8080';

export function useApi() {
  const invoke = async (endpoint: string, data?: any) => {
    // Try Electron API first (for desktop app)
    if (window.electronAPI) {
      return window.electronAPI.invoke(endpoint, data);
    }
    
    // Fall back to HTTP API (for web app)
    const url = `${API_BASE_URL}${endpoint.replace('api:', '/')}`;
    const options: RequestInit = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }

  const getCrafting = async (data: any) => {
    return invoke("api:crafting", data)
  }

  const getItems = async () => {
    return invoke("api:items")
  }

  const getCurrencies = async () => {
    return invoke("api:currencies")
  }

  return { getCrafting, getItems, getCurrencies }
}
