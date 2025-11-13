export function useApi() {
  const invoke = async (channel: string, data?: any) => {
    if (!window.electronAPI) {
      throw new Error("Electron API not available")
    }
    return window.electronAPI.invoke(channel, data)
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
