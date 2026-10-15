<script setup>
const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:modelValue"]);

function onChange(event, item) {
  const next = [...props.modelValue];
  if (event.target.checked) {
    if (!next.includes(item)) next.push(item);
  } else {
    const i = next.indexOf(item);
    if (i !== -1) next.splice(i, 1);
  }
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="customCheckBoxHolder">
    <template v-for="(item, index) in options" :key="index">
      <input
          class="customCheckBoxInput"
          :id="`cCB${index}`"
          type="checkbox"
          :value="item"
          :checked="modelValue.includes(item)"
          @change="onChange($event, item)"
      />
      <label class="customCheckBoxWrapper" :for="`cCB${index}`">
        <div class="customCheckBox">
          <div class="inner">{{ item }}</div>
        </div>
      </label>
    </template>
  </div>
</template>


<style scoped>
.customCheckBoxHolder {
  margin: 5px;
  display: flex;
  flex-direction: row;     /* 横向排列 */
  flex-wrap: wrap;         /* 一行放不下就换行 */
  align-items: center;
  gap: 8px;                /* 按钮之间留间距（现代浏览器） */
}

/* 若需兼容不支持 gap 的环境，可给 wrapper 加 margin：
.customCheckBoxWrapper { margin: 4px; }
*/

.customCheckBoxWrapper {
  display: inline-block;
  /* 横排时不需要占满整行 */
}

.customCheckBox {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  padding: 2px 12px;
  background-color: hsl(0, 0%, 10%);
  border-radius: 8px;        /* 改成统一的圆角 */
  color: rgba(255, 255, 255, 0.7);
  transition: color 300ms cubic-bezier(0.25, 0.8, 0.25, 1),
  background-color 300ms cubic-bezier(0.25, 0.8, 0.25, 1),
  box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  height: 32px;
  align-items: center;
  justify-content: center;
  box-shadow:
      rgba(0, 0, 0, 0.15) 0px 2px 1px 0px inset,
      rgba(255, 255, 255, 0.17) 0px 1px 1px 0px;
  outline: none;
  min-width: 55px;
  /* 关键：让按钮随内容自适应宽度 */
  width: auto;
}

.customCheckBox:hover {
  background-color: #2c2c2c;
  color: #fff;
  box-shadow:
      rgba(0, 0, 0, 0.23) 0px -4px 1px 0px inset,
      rgba(255, 255, 255, 0.17) 0px -1px 1px 0px,
      rgba(0, 0, 0, 0.17) 0px 2px 4px 1px;
}

.customCheckBox .inner {
  font-size: 16px;
  font-weight: 700;
  pointer-events: none;
  transition: transform 300ms cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateY(0);
}

.customCheckBox:hover .inner {
  transform: translateY(-2px);
}

.customCheckBoxInput {
  display: none;
}

.customCheckBoxInput:checked + .customCheckBoxWrapper .customCheckBox {
  background-color: #2d6737;
  color: #fff;
  box-shadow:
      rgba(0, 0, 0, 0.23) 0px -4px 1px 0px inset,
      rgba(255, 255, 255, 0.17) 0px -1px 1px 0px,
      rgba(0, 0, 0, 0.17) 0px 2px 4px 1px;
}

.customCheckBoxInput:checked + .customCheckBoxWrapper .customCheckBox .inner,
.customCheckBoxWrapper .customCheckBox:hover .inner {
  transform: translateY(-2px);
}

.customCheckBoxInput:checked + .customCheckBoxWrapper .customCheckBox:hover {
  background-color: #34723f;
  box-shadow:
      rgba(0, 0, 0, 0.26) 0px -4px 1px 0px inset,
      rgba(255, 255, 255, 0.17) 0px -1px 1px 0px,
      rgba(0, 0, 0, 0.15) 0px 3px 6px 2px;
}

</style>
