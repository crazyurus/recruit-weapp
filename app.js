const dayjs = require('dayjs');
const { promisifyAll } = require('miniprogram-api-promise');

wx.promises = {};
promisifyAll(wx, wx.promises);

App({
  globalData: {},
  onLaunch() {
    const updateManager = wx.getUpdateManager();
    this.logger = wx.getRealtimeLogManager();

    updateManager.onUpdateReady(async () => {
      const result = await this.confirm('新版本已经准备好，是否重启应用？');

      if (result.confirm) {
        updateManager.applyUpdate()
      }
    });
  },
  request(url, data = {}, loading = true) {
    if (loading) wx.showNavigationBarLoading();
    return wx.promises.request({
      url: 'https://a.jiuyeb.cn/mobile.php' + url,
      method: 'POST',
      dataType: 'json',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Auth: 'Baisc MTAyNDY6MTAyNDY=',
      },
      data: {
        school_id: 'b525083d-b83c-4c7e-892f-29909421d961',
        login_user_id: 1,
        login_admin_school_code: '',
        login_admin_school_id: 'b525083d-b83c-4c7e-892f-29909421d961',
        ...data,
      }
    }).then(result => {
      if (result.statusCode !== 200) return Promise.reject('服务器错误 ' + result.statusCode);
      else if (result.data.code === 0) return result.data.data;
      else Promise.reject(result.msg);
    }, result => {
      return Promise.reject(result.errMsg);
    }).catch(error => {
      this.logger.error('[Request] scc', url, error);
      this.toast('网络错误');
    }).finally(() => {
      if (loading) wx.hideNavigationBarLoading();
    });
  },
  alert(params) {
    if (typeof params === 'string') {
      params = {
        content: params
      };
    }

    return wx.promises.showModal({
      title: params.title || '就业招聘',
      content: params.content,
      showCancel: params.showCancel || false,
      confirmColor: '#45c8dc',
      confirmText: params.confirmText || '确定',
    });
  },
  confirm(params) {
    if (typeof params === 'string') {
      params = {
        content: params,
      };
    }

    params.showCancel = true;

    return this.alert(params);
  },
  toast(title, icon = 'none') {
    wx.showToast({
      title: title,
      icon,
      duration: 1500,
    });
  },
  loading(title) {
    wx.showLoading({ title });

    return wx.hideLoading;
  },
  about() {
    this.alert('Token团队出品');
  },
  async address(options) {
    const { address, name, description, latitude, longitude } = options;
    let location;

    if (latitude && longitude) {
      location = {
        latitude,
        longitude,
      };
    } else {
      const QQMap = require('./library/qqmap/jssdk.js');
      const SDK = new QQMap({
        key: 'BP7BZ-6FXRV-6CNP3-UDXK2-GJ36S-VFBN7',
      });
      const hideLoading = this.loading('获取地理位置中');

      location = await new Promise((resolve, reject) => {
        SDK.geocoder({
          address,
          success(res) {
            resolve({
              latitude: res.result.location.lat,
              longitude: res.result.location.lng,
            });
          },
          fail(res) {
            reject(res.message);
          },
          complete() {
            hideLoading();
          }
        });
      }).catch(errMsg => {
        this.alert(errMsg);
      });
    }

    this.openLocation({
      ...location,
      name,
      address: description || address,
    });
  },
  openLocation(options) {
    if (this.isQQ) {
      wx.navigateTo({
        url: this.sharePath({
          route: 'pages/common/map',
          options,
        }),
      });
    } else {
      wx.openLocation(options);
    }
  },
  get isQQ() {
    return typeof qq !== 'undefined';
  },
  sharePath(page) {
    const query = Object.entries(page.options).map(([key, value]) => {
      return `${key}=${value}`;
    });

    return '/' + page.route + '?' + query.join('&');
  },
  formatTimestamp(timestamp) {
    return dayjs(timestamp * 1000).format('YYYY-M-D');
  },
  logger() {
    return this.logger;
  },
  openURL(url) {
    wx.navigateTo({
      url: '/pages/common/webview?url=' + encodeURIComponent(url),
    });
  },
});
