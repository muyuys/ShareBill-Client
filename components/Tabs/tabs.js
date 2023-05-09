Component({
  data: {},
  /* 组件的属性列表 */
  properties: {
    /* 获取父标签的属性 */
    tabs: {
      type: Array,
      value: [],
    },
  },
  methods: {
    /* 点击事件 */
    handleItemTap(e) {
      /*  */
      const { index } = e.currentTarget.dataset;
      /* 2. 出发父组件中的事件 */
      this.triggerEvent("tabsItemChange", { index });
    },
  },
});
