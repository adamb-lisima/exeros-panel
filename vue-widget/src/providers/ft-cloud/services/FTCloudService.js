class FTCloudService {
  constructor() {
    this.isInitialized = false
    this.StPlayer = null
    this.sdkLoading = null
  }

  async loadSDK() {
    if (this.StPlayer) {
      return this.StPlayer
    }

    if (this.sdkLoading) {
      return this.sdkLoading
    }

    this.sdkLoading = new Promise((resolve, reject) => {
      if (window.playerjs) {
        resolve(window.playerjs)
        return
      }

      const script = document.createElement('script')
      script.src = '/assets/h5-player.js'
      script.onload = () => {
        if (window.playerjs) {
          resolve(window.playerjs)
        } else {
          reject(new Error('h5-player.js loaded but playerjs not found'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load h5-player.js'))
      document.head.appendChild(script)
    })

    return this.sdkLoading
  }

  async initialize(config = {}, headers = {}) {

    try {
      this.StPlayer = await this.loadSDK()

      this.StPlayer.config = {
        baseURL: `${config.baseURL}`,
        decoderType: config.decoderType || 1,
        logLevel: config.logLevel !== undefined ? config.logLevel : 4,
        bufferTime: config.bufferTime || 0.5
      }

      this.StPlayer.defaultHeaders = {
        _appId: headers._appId,
        _tenantId: headers._tenantId,
        _token: headers._token,
      }

      this.isInitialized = true
      return this.StPlayer

    } catch (error) {
      console.error('Error initialize FT player:', error)
      throw error
    }
  }

  createLivePlayer(container, options) {

    if (!this.isInitialized || !this.StPlayer) {
      throw new Error('FT Cloud service not initialized')
    }

    const player = this.StPlayer.createLivePlayer(container, options)
    return player
  }

  createHistoryPlayer(container, options) {

    if (!this.isInitialized || !this.StPlayer) {
      throw new Error('FT Cloud service not initialized')
    }

    const player = this.StPlayer.createHistoryPlayer(container, options)

    return player
  }

  getSDK() {
    return this.StPlayer
  }
}

export default new FTCloudService()
