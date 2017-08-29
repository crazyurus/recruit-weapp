var app = getApp();
Page({
  data: {
    article: {}
  },
  onLoad(options) {
    app.getApiData('https://api.wutnews.net/recruit/haitou/mjfx/view?client=m&encrypt=0&id=' + options.id, {}, false).then((result) => {
      let position = [];

      for (let category of result.workCategorys) {
        position.push(category.name);
      }

      result.position = position.join(' ');
      result.info = result.info.replace(/(&ldquo;|&rdquo)/g, '"').replace(/&times;/g, '×').replace(/(&lsquo;|&rsquo;)/g, "'").replace('/&(.[2,6]);', '');
    
      this.setData({
        article: result
      });
    });
  },
  onShareAppMessage(res) {
    return {
      title: this.data.article.title,
      path: '/pages/interview/detail?id=' + this.data.article.id,
      imageUrl: this.data.article.image,
      success(res) {
        wx.showToast({
          title: '分享成功'
        });
      }
    }
  }
});