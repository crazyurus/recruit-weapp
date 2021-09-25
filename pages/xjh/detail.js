const dayjs = require('dayjs');
const app = getApp();

Page({
  data: {
    article: {},
    company: {},
    positions: [],
    title: false,
    isExpired: true,
    isQQ: false,
    contentStyle: {
      a: 'color: #45c8dc',
    },
  },
  onLoad(options) {
    wx.setNavigationBarColor({
      backgroundColor: '#45c8dc',
      frontColor: '#ffffff'
    });
    wx.setNavigationBarTitle({
      title: ' '
    });

    app.request('https://a.jiuyeb.cn/mobile.php/preach/detail', {
      id: options.id,
    }, false).then(result => {
      this.setData({
        article: {
          title: result.title,
          source: '武汉理工大学学生就业指导中心',
          time: result.hold_date + ' ' + result.hold_starttime + '-' + result.hold_endtime,
          startTime: dayjs(result.hold_date + ' ' + result.hold_starttime + ':00').unix(),
          endTime: dayjs(result.hold_date + ' ' + result.hold_endtime + ':00').unix(),
          universityName: result.school_id_name,
          place: result.address || result.tmp_field_name,
          view: result.viewcount,
          content: result.remarks,
          tips: result.schoolwarn,
          poster: result.haibao_id_src ? 'https:' + result.haibao_id_src.linkpath + '!y' : '',
        },
        positions: result.ProfessionalList.map(item => item.professional_id_name),
        company: {
          id: result.comInfo.id,
          name: result.comInfo.name,
          logo: result.comInfo.logo_src + '!y',
          description: (!result.comInfo.city_name || result.comInfo.city_name === '市辖区' ? result.comInfo.province_name : result.comInfo.city_name) + ' ' + result.comInfo.xingzhi_id_name + ' ' + result.comInfo.business_name,
          email: result.email,
        },
        isExpired: result.timestatus === 3,
        isQQ: app.isQQ(),
      });
    });
  },
  onShareAppMessage() {
    return {
      title: this.data.article.title,
      path: app.sharePath(this),
      success() {
        app.toast('分享成功');
      }
    };
  },
  onShareTimeline() {
    return {
      title: this.data.article.title,
      imageUrl: this.data.company.logo,
    };
  },
  onPageScroll(e) {
    if (e.scrollTop <= 60 && this.data.title) {
      this.data.title = false;
      wx.setNavigationBarTitle({
        title: ' '
      });
    }
    if (e.scrollTop > 60 && !this.data.title) {
      this.data.title = true;
      wx.setNavigationBarTitle({
        title: this.data.article.title
      });
    }
  },
  showAddressMap() {
    app.address(this.data.article.universityName + ',' + this.data.article.place, this.data.article.universityName, this.data.article.place);
  },
  addToCalendar() {
    wx.addPhoneCalendar({
      title: this.data.article.title,
      description: '来自武汉理工大学就业招聘小程序',
      location: this.data.article.universityName + this.data.article.place,
      startTime: this.data.article.startTime,
      endTime: this.data.article.endTime,
      success() {
        app.toast('添加成功');
      },
    });
  },
  openPoster() {
    wx.previewImage({
      urls: [this.data.article.poster],
    })
  }
});
