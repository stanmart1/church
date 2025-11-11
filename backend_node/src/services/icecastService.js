



class IcecastService {
  getStreamUrl() {
    return process.env.ICECAST_STREAM_URL || '';
  }
}

export default new IcecastService();
