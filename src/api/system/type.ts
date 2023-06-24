export interface ResponseData {
  code: number
  msg: string
}

export interface selectRoleFormData {
  currentPage: number
  pageSize: number
  roleName: string
  roleKey: string
}

export interface RoleData {
  role_id: number
  role_name: string
  status: number
}

//定义获取用户信息返回数据类型
export interface roleListReponseData extends ResponseData {
  data: RoleData[]
  total: number
}

export interface selectUserFormData {
  currentPage: number
  pageSize: number
  username: string
  nick_name: string
}

export interface UserData {
  id: number
  username: string
  password: string
  nick_name: string
  vip_name?: any
  city?: any
  avatar: string
  collect_num: number
  look_num: number
  attention_num: number
  fans_num: number
  post_num: number
  credit?: any
  del_flag: number
}

export interface userListReponseData extends ResponseData {
  data: UserData[]
  total: number
}

export interface MenuData {
  menu_id: number
  menu_name?: string
  parent_id?: number
  order_num?: number
  path?: string
  component?: string
  is_cache?: number
  menu_type?: string
  visible?: number
  status?: number
  perms?: string
  icon?: string
}
