export const ftCloudUtils = {
  formatDeviceInfo(devices) {
    return devices.map(device => ({
      devId: device.deviceId || device.devId || device.stream,
      channels: Array.isArray(device.channels)
          ? device.channels.join(',')
          : (device.channels || device.channel).toString()
    }))
  },

  createPlayerOptions(devices, streamType = 'MAJOR') {
    return {
      deviceInfos: this.formatDeviceInfo(devices),
      streamType
    }
  },

  handlePlayerError(error) {
    return {
      state: 'error',
      message: error?.message || 'Unknown player error',
      code: error?.code || 'UNKNOWN_ERROR'
    }
  },

  createGridContainer(containerElement, cameraCount) {
    containerElement.style.width = '100%'
    containerElement.style.height = '100%'
    containerElement.style.display = 'grid'
    containerElement.style.gridTemplateColumns = cameraCount === 1 ? '1fr' : '1fr 1fr'
    containerElement.style.gap = '4px'

    const containers = []
    for (let i = 0; i < cameraCount; i++) {
      const div = document.createElement('div')
      div.style.width = '100%'
      div.style.height = '100%'
      div.style.minHeight = '400px'
      div.id = `ft-cloud-camera-${i}`
      containerElement.appendChild(div)
      containers.push(div)
    }

    return containers
  }
}
