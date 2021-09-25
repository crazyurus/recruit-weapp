const app = getApp();
Page({
  data: {
    list: [],
    page: 1,
    loading: false,
    left: 0,
    calendar: {},
  },
  onLoad() {
    this.calcCalendar();
    this.loadNoticeList();
  },
  onReachBottom() {
    this.loadNoticeList();
  },
  onPullDownRefresh() {
    this.reset();
    this.loadNoticeList();
  },
  calcCalendar() {
    const now = new Date();
    const weekday = now.getDay();
    const timestamp = now.getTime();
    const weekCount = 12;
    const dates = new Array(weekCount * 2 - 1);
    let group = 0;

    for (let i = 0; i < dates.length; i++) {
      dates[i] = [];
    }

    for(let i = (weekCount - 1) * -7; i < weekCount * 7; i++) {
      const isToday = i - (weekday + 6) % 7;
      const day = new Date(timestamp + 24 * 60 * 60 * 1000 * isToday);

      if (dates[group].length === 7) {
        group++;
      }

      dates[group].push({
        display: isToday === 0 ? '今' : day.getDate(),
        value: day.getTime(),
      });
    }

    this.setData({
      calendar: {
        list: dates,
        current: now.getDay() - 1,
        group: weekCount - 1,
      },
    });
  },
  loadNoticeList() {
    if (this.data.loading) return;

    this.data.loading = true;
    app.request('https://a.jiuyeb.cn/mobile.php/preach/getlist', {
      page: this.data.page,
      size: 10,
      isunion: 2,
      laiyuan: 0,
      isair: 3,
      keywords: '',
      hold_date: new Date(this.data.calendar.list[this.data.calendar.group][this.data.calendar.current].value).toLocaleDateString(),
    }).then(result => {
      const colorArray = ['ed9d81', 'a7d59a', '8c88ff', '56b8a4', '60bfd8', 'c9759d'];

      wx.stopPullDownRefresh();
      if (result.length === 0) return;

      const list = result.list.map((item, i) => {
        return {
          id: item.id,
          title: item.title,
          company: item.com_id_name,
          backgroundColor: colorArray[(i + this.data.left) % colorArray.length],
          universityName: item.school_id_name,
          place: item.address || item.tmp_field_name,
          view: item.viewcount,
          time: item.hold_date + ' ' + item.hold_starttime + '-' + item.hold_endtime,
          isExpired: item.timestatus === 3,
          isCancel: item.publish_status === 2,
          isOfficial: item.istop === 1,
          isInProgress: item.timestatus === 1,
        };
      });

      this.data.loading = false;
      this.data.left += list.length % colorArray.length;
      this.data.page++;

      this.setData({
        list: this.data.list.concat(list)
      });
    });
  },
  reset() {
    this.data.list = [];
    this.setData({
      page: 1,
      loading: false,
      left: 0
    });
    wx.pageScrollTo({
      scrollTop: 0,
    });
  },
  changeDay(e) {
    const { index, group } = e.currentTarget.dataset;

    this.setData({
      'calendar.current': index,
      'calendar.group': group,
    });

    this.reset();
    this.loadNoticeList();
  },
  onCalendarChange(e) {
    const { current } = e.detail;
    const day = this.data.calendar.list[current][0].value;
    const month = new Date(day).getMonth() + 1;

    wx.setNavigationBarTitle({
      title: month + ' 月',
    })
  },
});
