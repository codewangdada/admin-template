<template>
  <div class="top-right-btn">
    <el-row>
      <el-tooltip
        class="item"
        effect="dark"
        :content="showSearch ? '隐藏搜索' : '显示搜索'"
        placement="top"
        v-if="search"
      >
        <el-button circle icon="Search" @click="toggleSearch()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button circle icon="Refresh" @click="refresh()" />
      </el-tooltip>
      <el-popover placement="bottom" :width="100" trigger="click">
        <template #reference>
          <!-- <el-tooltip
            class="item"
            effect="dark"
            content="显隐列"
            placement="top"
            v-if="columns"
          > -->
          <el-button circle icon="Menu" />
          <!-- </el-tooltip> -->
        </template>
        <el-checkbox-group v-model="checkList" @change="dataChange">
          <el-checkbox
            v-for="item in columns"
            :key="item.key"
            :label="item.key"
          >
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-popover>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick } from 'vue'
const props = defineProps({
  showSearch: {
    type: Boolean,
    default: true,
  },
  search: {
    type: Boolean,
    default: true,
  },
  columns: {
    type: Array,
  },
})

const checkList = ref([])

nextTick(() => {
  checkList.value = props.columns.map((item) => item.key)
})

const emits = defineEmits(['update:showSearch', 'queryTable'])

function toggleSearch() {
  emits('update:showSearch', !props.showSearch)
}

function refresh() {
  emits('queryTable')
}
function dataChange(data) {
  for (let item in props.columns) {
    const key = props.columns[item].key
    props.columns[item].visible = data.includes(key)
  }
}
</script>
<style lang="scss" scoped>
.top-right-btn {
  margin-left: auto;
}
</style>
