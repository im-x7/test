import { defineComponent, h } from 'vue';

// 纹身图标组件 - 更现代化的设计
export const TattooIcon = defineComponent({
  name: 'TattooIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor',
    }, [
      // 更艺术化的纹身机图标
      h('path', {
        d: 'M19.5,8h-1V7c0-1.1-0.9-2-2-2h-2.5V3.5C14,2.12,12.88,1,11.5,1S9,2.12,9,3.5V5H6.5C5.4,5,4.5,5.9,4.5,7v1h-1C2.12,8,1,9.12,1,10.5 S2.12,13,3.5,13h1v1c0,1.1,0.9,2,2,2h2.5v1.5c0,1.38,1.12,2.5,2.5,2.5s2.5-1.12,2.5-2.5V16H17c1.1,0,2-0.9,2-2v-1h0.5 c1.38,0,2.5-1.12,2.5-2.5S20.88,8,19.5,8z M11.5,3C11.78,3,12,3.22,12,3.5S11.78,4,11.5,4S11,3.78,11,3.5S11.22,3,11.5,3z'
      }),
      // 添加纹身针细节
      h('path', {
        d: 'M8,10.5C8,9.67,8.67,9,9.5,9S11,9.67,11,10.5S10.33,12,9.5,12S8,11.33,8,10.5z M13,10.5c0-0.83,0.67-1.5,1.5-1.5 s1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5S13,11.33,13,10.5z M11.5,19c-0.28,0-0.5-0.22-0.5-0.5s0.22-0.5,0.5-0.5s0.5,0.22,0.5,0.5 S11.78,19,11.5,19z'
      }),
      // 添加墨水滴效果
      h('circle', {
        cx: '7',
        cy: '14',
        r: '1'
      }),
      h('circle', {
        cx: '16',
        cy: '14',
        r: '1'
      })
    ]);
  }
});

// 穿孔图标组件 - 更简洁明了的设计
export const PiercingIcon = defineComponent({
  name: 'PiercingIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor',
    }, [
      // 外圈
      h('path', {
        d: 'M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z'
      }),
      // 内圈
      h('path', {
        d: 'M12,6c-3.31,0-6,2.69-6,6s2.69,6,6,6s6-2.69,6-6S15.31,6,12,6z M12,16c-2.21,0-4-1.79-4-4s1.79-4,4-4s4,1.79,4,4 S14.21,16,12,16z'
      }),
      // 中心点
      h('circle', {
        cx: '12',
        cy: '12',
        r: '2'
      }),
      // 穿刺线
      h('line', {
        x1: '12',
        y1: '4',
        x2: '12',
        y2: '6',
        stroke: 'currentColor',
        'stroke-width': '1.5'
      }),
      h('line', {
        x1: '12',
        y1: '18',
        x2: '12',
        y2: '20',
        stroke: 'currentColor',
        'stroke-width': '1.5'
      }),
      h('line', {
        x1: '4',
        y1: '12',
        x2: '6',
        y2: '12',
        stroke: 'currentColor',
        'stroke-width': '1.5'
      }),
      h('line', {
        x1: '18',
        y1: '12',
        x2: '20',
        y2: '12',
        stroke: 'currentColor',
        'stroke-width': '1.5'
      })
    ]);
  }
});

export default {
  TattooIcon,
  PiercingIcon
};