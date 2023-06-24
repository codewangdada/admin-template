<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      v-show="showSearch"
      :inline="true"
    >
      <el-form-item label="菜单名称" prop="menuName">
        <el-input
          v-model="queryParams.menuName"
          placeholder="请输入菜单名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="菜单状态"
          clearable
        >
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-has="`system:role:add`"
        >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll">
          展开/折叠
        </el-button>
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
        :columns="columns"
      ></right-toolbar>
    </el-row>

    <!-- 表格数据 -->
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="menu_id"
      :default-expand-all="isExpandAll"
    >
      <el-table-column
        label="菜单名称"
        prop="menu_name"
        width="160"
        v-if="columns[0].visible"
      />
      <el-table-column
        label="图标"
        prop="icon"
        :show-overflow-tooltip="true"
        width="150"
        v-if="columns[1].visible"
      />
      <el-table-column
        label="排序"
        prop="order_num"
        :show-overflow-tooltip="true"
        width="60"
        v-if="columns[2].visible"
      />
      <el-table-column
        label="权限标识"
        prop="perms"
        v-if="columns[3].visible"
      />
      <el-table-column
        label="组件路径"
        prop="component"
        v-if="columns[4].visible"
      ></el-table-column>
      <el-table-column prop="status" label="状态" width="80"></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        v-if="columns[5].visible"
      >
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button
              text
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-has="`system:role:edit`"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
              text
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-has="`system:role:remove`"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parent_id">
              <el-tree-select
                v-model="form.parent_id"
                :data="menuOptions"
                :props="{
                  value: 'menu_id',
                  label: 'menu_name',
                  children: 'children',
                }"
                value-key="menu_id"
                placeholder="请选择上级菜单"
                check-strictly
              ></el-tree-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menu_type">
              <el-radio-group v-model="form.menu_type">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menu_name">
              <el-input v-model="form.menu_name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="order_num">
              <el-input-number
                v-model="form.order_num"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menu_type != 'F'">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由地址
                </span>
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menu_type == 'C'">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menu_type != 'M'">
            <el-form-item prop="perms">
              <template #label>
                <span>
                  <el-tooltip
                    content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  权限字符
                </span>
              </template>
              <el-input v-model="form.perms" placeholder="请输入权限标识" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menu_type == 'C'">
            <el-form-item prop="is_cache">
              <template #label>
                <span>
                  <el-tooltip
                    content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  是否缓存
                </span>
              </template>
              <el-radio-group v-model="form.is_cache">
                <el-radio :label="0">缓存</el-radio>
                <el-radio :label="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menu_type != 'F'">
            <el-form-item prop="visible">
              <template #label>
                <span>
                  <el-tooltip
                    content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  显示状态
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio :label="0">显示</el-radio>
                <el-radio :label="1">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menu_type != 'F'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择停用则路由将不会出现在侧边栏，也不能被访问"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  菜单状态
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio :label="0">正常</el-radio>
                <el-radio :label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm(menuRef)">
            确 定
          </el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Role">
import { ref, reactive, toRefs, nextTick } from 'vue'
import { generateTree } from '@/utils'
import {
  reqListMenu,
  reqAddMenu,
  reqUpdateMenu,
  reqDeleteMenu,
} from '@/api/system/menu'
import { MenuData } from '@/api/system/type'
import { FormInstance, ElMessage, ElMessageBox } from 'element-plus'
const menuList = ref<MenuData[]>([])
const open = ref(false)
const showSearch = ref(true)
const loading = ref(false)
const title = ref('')
const isExpandAll = ref(false)
const refreshTable = ref(true)
const sys_normal_disable = [
  {
    label: '正常',
    value: 0,
  },
  {
    label: '停用',
    value: 1,
  },
]
const menuOptions = ref<MenuData[]>([])

interface IData {
  form: {
    menu_id?: number
    parent_id?: number
    menu_type?: string
    icon?: string
    menu_name?: string
    order_num?: number
    path?: string
    component?: string
    perms?: string
    is_cache?: number
    visible?: number
    status?: number
  }
  queryParams: {
    currentPage: number
    pageSize: number
    menuName: string
    status: number | undefined
  }
}
const data = reactive<IData>({
  form: {},
  queryParams: {
    currentPage: 1,
    pageSize: 10,
    menuName: '',
    status: undefined,
  },
})

const rules = {
  menu_name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  order_num: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
  path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
}

const queryRef = ref()
const menuRef = ref<FormInstance>()

const columns = ref([
  { key: 0, label: `菜单名称`, visible: true },
  { key: 1, label: `图标`, visible: true },
  { key: 2, label: `排序`, visible: true },
  { key: 3, label: `权限标识`, visible: true },
  { key: 4, label: `组件路径`, visible: true },
  { key: 4, label: `状态`, visible: true },
  { key: 5, label: `操作`, visible: true },
])
const { queryParams, form } = toRefs(data)

function getList() {
  loading.value = true
  reqListMenu(queryParams.value).then((response) => {
    menuList.value =
      response.data.length === 1
        ? response.data
        : generateTree(response.data, 'menu_id', 'parent_id')
    loading.value = false
  })
}

function getTreeselect() {
  menuOptions.value = []
  reqListMenu().then((res) => {
    const menu = { menu_id: 0, menu_name: '主类目', children: [] }
    menu.children = generateTree(res.data, 'menu_id', 'parent_id')
    menuOptions.value.push(menu)
  })
}

function handleQuery() {
  queryParams.value.currentPage = 1
  getList()
}

function resetQuery() {
  queryRef.value && queryRef.value.resetFields()
  handleQuery()
}

/** 添加用户 */
function handleAdd() {
  reset()
  getTreeselect()
  open.value = true
  title.value = '添加菜单'
}

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      if (form.value.menu_id) {
        delete form.value.children
        reqUpdateMenu(form.value).then((res) => {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        })
      } else {
        reqAddMenu(form.value).then((res) => {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        })
      }
    }
  })
}

function cancel() {
  open.value = false
}

function handleUpdate(row: any) {
  reset()
  getTreeselect()
  form.value = { ...row }
  open.value = true
  title.value = '修改菜单'
}

function reset() {
  form.value = {
    menu_id: undefined,
    parent_id: 0,
    menu_name: undefined,
    icon: undefined,
    menu_type: 'M',
    order_num: undefined,
    is_cache: 0,
    visible: 0,
    status: 0,
  }
  menuRef.value && menuRef.value.resetFields()
}
function handleDelete(row: any) {
  ElMessageBox.confirm('是否确认删除名称为"' + row.menu_name + '"的数据项?')
    .then(function () {
      return reqDeleteMenu({ menuId: row.menu_id })
    })
    .then(() => {
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value

  nextTick(() => {
    refreshTable.value = true
  })
}

getList()
</script>
<style>
.mb8 {
  margin-bottom: 8px;
}
.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7;
  background: #ffffff none;
  border-radius: 4px;
  width: 100%;
}
</style>
