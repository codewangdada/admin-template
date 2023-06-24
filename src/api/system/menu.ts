import request from '@/utils/request'
import type {} from './type'

enum API {
  ROLE_MENU_TREE = '/system/menu/roleMenuTreeselect',
  TREE_SELECT = '/system/menu/treeselect',
  LIST = '/system/menu/list',
  ADD = '/system/menu/add',
  UPDATE = '/system/menu/update',
  DELETE = '/system/menu/delete',
}
// 根据角色ID查询菜单下拉树结构
export const reqRoleMeunTree = (params: any) =>
  request.get<any, any>(API.ROLE_MENU_TREE, { params })

// 查询菜单下拉树结构
export const reqTreeSelect = () => request.get<any, any>(API.TREE_SELECT)

export const reqListMenu = (params?: any) =>
  request.get<any, any>(API.LIST, { params })

export const reqAddMenu = (data: any) => request.post<any, any>(API.ADD, data)

export const reqUpdateMenu = (data: any) =>
  request.post<any, any>(API.UPDATE, data)

export const reqDeleteMenu = (data: any) =>
  request.post<any, any>(API.DELETE, data)
