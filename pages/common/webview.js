const { toast } = require('../../library/ui');

Page({
  data: {
    url: '',
  },
  onLoad(options) {
    this.setData({
      url: decodeURIComponent(options.url)
    });
  },
  onShareAppMessage() {
    return {
      success() {
        toast('εδΊ«ζε', 'success');
      }
    };
  }
})