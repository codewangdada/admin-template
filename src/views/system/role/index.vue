<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      v-show="showSearch"
      :inline="true"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="queryParams.roleName"
          placeholder="请输入角色名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="queryParams.roleKey"
          placeholder="请输入权限字符"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
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
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-has="`system:role:edit`"
        >
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-has="`system:role:remove`"
        >
          删除
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
      v-loading="loading"
      :data="roleList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="角色编号"
        prop="role_id"
        width="120"
        v-if="columns[0].visible"
      />
      <el-table-column
        label="角色名称"
        prop="role_name"
        :show-overflow-tooltip="true"
        width="150"
        v-if="columns[1].visible"
      />
      <el-table-column
        label="权限字符"
        prop="role_key"
        :show-overflow-tooltip="true"
        width="150"
        v-if="columns[2].visible"
      />
      <el-table-column
        label="显示顺序"
        prop="role_sort"
        width="100"
        v-if="columns[3].visible"
      />
      <el-table-column
        label="状态"
        align="center"
        width="100"
        v-if="columns[4].visible"
      >
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
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

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.currentPage"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="form.role_name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="role_key">
          <template #label>
            <span>
              <el-tooltip
                content="控制器中定义的权限字符，如：system:role:list"
                placement="top"
              >
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
          <el-input v-model="form.role_key" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="role_sort">
          <el-input-number
            v-model="form.role_sort"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand">
            展开/折叠
          </el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll">
            全选/全不选
          </el-checkbox>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menuRef"
            node-key="menu_id"
            :default-checked-keys="defaultCheckedKeys"
            empty-text="加载中，请稍候"
            :props="{ label: 'menu_name', children: 'children' }"
          ></el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm(roleRef)">
            确 定
          </el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Role">
import { ref, reactive, toRefs } from 'vue'
import {
  reqListRole,
  reqUpdateRole,
  reqAddRole,
  reqDeleteRole,
  reqDetailRole,
} from '@/api/system/role'
import { reqRoleMeunTree, reqTreeSelect } from '@/api/system/menu'
import { RoleData } from '@/api/system/type'
import { generateTree } from '@/utils'
import { FormInstance, ElMessage, ElMessageBox } from 'element-plus'
const roleList = ref<RoleData[]>([])
const open = ref(false)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const loading = ref(false)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const menuOptions = ref<any[]>([])
const defaultCheckedKeys = ref([])
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const queryRef = ref()
interface IData {
  form: {
    role_id?: number
    role_name?: string
    role_key?: string
    role_sort?: number
    status?: number
    menuIds?: number[]
  }
  queryParams: {
    currentPage: number
    pageSize: number
    roleName: string
    roleKey: string
  }
}
const data = reactive<IData>({
  form: {},
  queryParams: {
    currentPage: 1,
    pageSize: 10,
    roleName: '',
    roleKey: '',
  },
})

const rules = {
  role_name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  role_key: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
  role_sort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }],
}

const sys_normal_disable = [
  {
    value: 0,
    label: '正常',
  },
  {
    value: 1,
    label: '停用',
  },
]
const menuRef = ref()
const roleRef = ref<FormInstance>()

const columns = ref([
  { key: 0, label: `角色编号`, visible: true },
  { key: 1, label: `角色名称`, visible: true },
  { key: 2, label: `权限字符`, visible: true },
  { key: 3, label: `显示顺序`, visible: true },
  { key: 4, label: `状态`, visible: true },
  { key: 5, label: `操作`, visible: true },
])
const { queryParams, form } = toRefs(data)

function getList() {
  loading.value = true
  reqListRole(queryParams.value).then((response) => {
    roleList.value = response.data
    total.value = response.total
    loading.value = false
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

function handleSelectionChange(selection: RoleData[]) {
  ids.value = selection.map((item) => item.role_id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 角色状态修改 */
function handleStatusChange(row: RoleData) {
  // let text = row.status === "0" ? "启用" : "停用";
  // proxy.$modal.confirm('确认要"' + text + '""' + row.roleName + '"角色吗?').then(function () {
  //   return changeRoleStatus(row.roleId, row.status);
  // }).then(() => {
  //   proxy.$modal.msgSuccess(text + "成功");
  // }).catch(function () {
  //   row.status = row.status === "0" ? "1" : "0";
  // });
}
/** 查询菜单树结构 */
function getMenuTreeselect() {
  reqTreeSelect().then((response) => {
    menuOptions.value = generateTree(response.data, 'menu_id', 'parent_id')
  })
}

/** 添加角色 */
function handleAdd() {
  reset()
  getMenuTreeselect()
  open.value = true
  title.value = '添加角色'
}

function handleCheckedTreeExpand(value: boolean) {
  let treeList = menuOptions.value
  for (let i = 0; i < treeList.length; i++) {
    menuRef.value.store.nodesMap[treeList[i].menu_id].expanded = value
  }
}

function handleCheckedTreeNodeAll(value: boolean) {
  menuRef.value.setCheckedNodes(value ? menuOptions.value : [])
}

function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys()
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys
}

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      if (form.value.role_id) {
        form.value.menuIds = getMenuAllCheckedKeys()
        reqUpdateRole(form.value).then((res) => {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        })
      } else {
        form.value.menuIds = getMenuAllCheckedKeys()
        reqAddRole(form.value).then((res) => {
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

function handleUpdate(row: RoleData) {
  reset()
  const roleId = row.role_id || ids.value
  reqDetailRole({ roleId }).then((res) => {
    form.value = res.data
    open.value = true
    title.value = '修改角色'
    reqRoleMeunTree({ roleId }).then((res) => {
      const arr = generateTree(res.menus, 'menu_id', 'parent_id')
      menuOptions.value = arr
      defaultCheckedKeys.value = res.checkedKeys
    })
  })
}

function reset() {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([])
  }
  menuExpand.value = false
  menuNodeAll.value = false
  form.value = {
    role_id: undefined,
    role_name: undefined,
    role_key: undefined,
    role_sort: 0,
    status: 0,
    menuIds: [],
  }
  if (roleRef.value) {
    roleRef.value.resetFields()
  }
}
function handleDelete(row: RoleData) {
  const roleIds = row.role_id || ids.value
  ElMessageBox.confirm('是否确认删除角色编号为"' + roleIds + '"的数据项?')
    .then(function () {
      return reqDeleteRole({ roleIds })
    })
    .then(() => {
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
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
