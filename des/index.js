/**
 * Created by yidong.wen on 2016/2/22.
 */
(function () {

  var template = $.Tpl;

  template.helper('number', function (v) {
    v = parseFloat(v);
    return isNaN(v) ? 0 : v;
  });

  template.helper('price', function (v) {
    if (v == null) return '';
    return '￥' + parseFloat(v);
  });


  /**
   * 自动渲染template方法
   * @param dataTree  所有数据组成的对象
   * @returns 所有请求完成后的promise对象
   */
  var renderAll = (function (template) {
    return function (dataTree) {
      var name, el, promises = [];
      for (name in dataTree) {
        if (
          Object.prototype.hasOwnProperty.call(dataTree, name)
          && (el = document.getElementById(name + '_html'))
        ) {
          var data = dataTree[name];
          var callback = (function (el, name) {
            return function (d) {
              el.innerHTML = template(name + '_tpl', d);
            }
          })(el, name);
          promises.push(typeof data !== 'function' ? callback(data) : data(callback));
        }
      }

      return $.when.apply($, promises);
    };
  })(template);


  // 渲染模版
  renderAll({
    kmod_nav: {
      list: new Array(3)
    },
    kmod_sel: function (callback) {
      return getSelectionList().pipe(callback);
    },
    // 文具图书
    kmod1_brand: function (callback) {
      return getBrandList().pipe(callback);
    },
    // 儿童玩具
    kmod2_brand: function (callback) {
      return getBrandList().pipe(callback);
    },
    // TOP
    kmod31_prod: function (callback) {
      return getProductList().pipe(callback);
    },
    kmod32_prod: function (callback) {
      return getProductList().pipe(callback);
    }
  }).then(function () {
    addNavEffect();
  });


  // 获取精选列表
  function getSelectionList(params, options) {
    return $.ajax({
      url: 'selection.json',
      type: 'GET',
      dataType: 'json'
    });
  }

  // 获取品牌列表
  function getBrandList(params, options) {
    options = options || {};
    return getWH().pipe(function (wh) {
      return $.ajax({
        //url: 'http://resys.vip.com/',
        url: 'brand.json',
        type: 'GET',
        data: $.extend({
          method: 'search.brand.base',
          page: 190101,
          fields: 'name,link,img,agio,index_image',
          ps: options.size || 120,
          pg: 1,
          channel: 'kid',
          sort: 'boom-desc',
          warehouse: wh
        }, params),
        //dataType: 'jsonp'
        dataType: 'json'
      });
    });
  }

  // 获取产品列表
  function getProductList(params, options) {
    options = options || {};
    return getWH().pipe(function (wh) {
      return $.ajax({
        //url: 'http://resys.vip.com/',
        url: 'product.json',
        type: 'GET',
        data: $.extend({
          method: 'search.product.base',
          page: 190101,
          fields: 'name,link,img,vipshop_price,market_price,agio',  // { agio: 折扣 }
          ps: options.size || 120,
          pg: 1,
          channel: 'kid',
          sort: 'boom-desc',
          warehouse: wh
        }, params),
        //dataType: 'jsonp'
        dataType: 'json'
      });
    });
  }

  // 获取WH
  function getWH() {
    return $.when($.Cookie.get('vip_wh') || 'VIP_NH');

    //var wh = $.Cookie.get('vip_wh')
    //if (wh) return $.when(wh);
    //return $.ajax({
    //  url: 'http://www.vip.com/ajax/warehouse.php',
    //  type: 'GET',
    //  data: {
    //    //callback: 'setWarehouse',
    //    writecookie: 1
    //  },
    //  dataType: 'jsonp'
    //}).pipe(function (res) {
    //  if (res.code == 200) {
    //    //(name, value, domain, path, hour)
    //    $.Cookie.set('vip_wh', wh = res.data.vip_wh, '.vip.com', '/', 240);
    //    return wh;
    //  }
    //  else {
    //    VIPSHOP.log('获取vip_wh失败, [msg]: ', res.msg);
    //  }
    //});
  }

  // 添加导航效果
  function addNavEffect(){
    var $nav = $('.kmod-nav');
    var offset = $nav.offset();

    var $win = $(window);
    var $doc = $(document);

    var $navTarget = $('.kmod-target');

    var $navTargetNew = $navTarget.map(function () {
      var $this = $(this);
      return {
        top: $this.offset().top,
        $el: $this,
        $ctrl: $('[data-id=' + $this.attr('id') + ']')
      };
    });

    $navTargetNew.sort(function (a, b) {
      return a.top - b.top;
    });

    $win.on({
      'scroll.kmodNav': function () {
        var scrollTop = $doc.scrollTop();

        // 控制导航悬浮
        $nav[scrollTop > offset.top ? 'addClass' : 'removeClass']('kmod-fixed');

        // 控制导航focus效果
        var len = $navTargetNew.length;
        var index = 0;
        do {
          len -= 1;
          index = len;
        }
        while (index >= 0 && scrollTop < $navTargetNew[index].top);

        $navTargetNew.each(function (i, v) {
          v.$ctrl && v.$ctrl.removeClass('kmod-hover');
        });
        index >= 0 && $navTargetNew[index].$ctrl.addClass('kmod-hover');

        // 控制导航focus时底边线左右滑动
        var lastIndex = $nav.data('index');
        $nav.addClass('kmod-hover' + (index + 1));
        if(!isNaN(lastIndex) && index !== lastIndex){
          $nav.removeClass('kmod-hover' + (lastIndex + 1));
        }
        $nav.data('index', index);

      }
    });

    //$doc.delegate('.kmod-nav a', {
    //  'click.kmodNav': function () {
    //
    //    //$('html, body').scrollTop(200);
    //  }
    //});
  }

})();
