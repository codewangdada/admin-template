<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      v-show="showSearch"
      :inline="true"
    >
      <el-form-item label="用户名称" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nick_name">
        <el-input
          v-model="queryParams.nick_name"
          placeholder="请输入用户昵称"
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
      :data="userList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="用户编号"
        prop="id"
        width="120"
        v-if="columns[0].visible"
      />
      <el-table-column
        label="用户名称"
        prop="username"
        :show-overflow-tooltip="true"
        width="150"
        v-if="columns[1].visible"
      />
      <el-table-column
        label="用户昵称"
        prop="nick_name"
        :show-overflow-tooltip="true"
        width="150"
        v-if="columns[2].visible"
      />
      <el-table-column label="头像" prop="avatar" v-if="columns[3].visible">
        <template #default="scope">
          <el-image
            style="width: 20px; height: 20px"
            :src="scope.row.avatar"
            fit="contain"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="帖子数量"
        prop="post_num"
        width="100"
        v-if="columns[4].visible"
      ></el-table-column>
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
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nick_name">
          <el-input v-model="form.nick_name" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item
          v-if="form.id == undefined"
          label="用户密码"
          prop="password"
        >
          <el-input v-model="form.password" placeholder="请输入用户密码" />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.role_id"
              :label="item.role_name"
              :value="item.role_id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm(userRef)">
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
  reqListUser,
  reqAddUser,
  reqDetailUser,
  reqUpdateUser,
  reqDeleteUser,
} from '@/api/system/user'
import { reqListRole } from '@/api/system/role'
import { UserData, RoleData } from '@/api/system/type'
import { FormInstance, ElMessage, ElMessageBox } from 'element-plus'
const userList = ref<UserData[]>([])
const open = ref(false)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const loading = ref(false)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const roleOptions = ref<RoleData[]>([])

interface IData {
  form: {
    id?: number
    username?: string
    nick_name?: string
    password?: string
    roleIds?: []
  }
  queryParams: {
    currentPage: number
    pageSize: number
    username: string
    nick_name: string
  }
}
const data = reactive<IData>({
  form: {},
  queryParams: {
    currentPage: 1,
    pageSize: 10,
    username: '',
    nick_name: '',
  },
})

const rules = {
  username: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  nick_name: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const queryRef = ref()
const userRef = ref<FormInstance>()

const columns = ref([
  { key: 0, label: `用户编号`, visible: true },
  { key: 1, label: `用户名称`, visible: true },
  { key: 2, label: `用户昵称`, visible: true },
  { key: 3, label: `头像`, visible: true },
  { key: 4, label: `帖子数量`, visible: true },
  { key: 5, label: `操作`, visible: true },
])
const { queryParams, form } = toRefs(data)

function getList() {
  loading.value = true
  reqListUser(queryParams.value).then((response) => {
    userList.value = response.data
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

function handleSelectionChange(selection: UserData[]) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 添加用户 */
function handleAdd() {
  reset()
  reqListRole().then((res) => {
    roleOptions.value = res.data
    open.value = true
    title.value = '添加用户'
  })
}

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      if (form.value.id) {
        reqUpdateUser(form.value).then((res) => {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        })
      } else {
        reqAddUser(form.value).then((res) => {
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

function handleUpdate(row: UserData) {
  reset()
  const userId = row.id
  reqDetailUser({ userId }).then((res) => {
    const { data, roles, roleIds } = res
    form.value = data
    roleOptions.value = roles
    form.value.roleIds = roleIds
    open.value = true
    title.value = '修改角色'
  })
}

function reset() {
  form.value = {
    username: undefined,
    nick_name: undefined,
    password: undefined,
    roleIds: [],
  }
  userRef.value && userRef.value.resetFields()
}
function handleDelete(row: UserData) {
  const userIds = row.id || ids.value
  ElMessageBox.confirm('是否确认删除用户编号为"' + userIds + '"的数据项?')
    .then(function () {
      return reqDeleteUser({ userIds })
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
