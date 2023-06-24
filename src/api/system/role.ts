import request from '@/utils/request'
import type { selectRoleFormData, roleListReponseData } from './type'

enum API {
  LIST_URL = '/system/role/list',
  UPDATE_ROLE = '/system/role',
  ADD_ROLE = '/system/role/add',
  DELETE_ROLE = 'system/role/delete',
  DETAIL = 'system/role/detail',
}

export const reqListRole = (params?: selectRoleFormData) =>
  request.get<any, roleListReponseData>(API.LIST_URL, { params })

export const reqUpdateRole = (data: any) =>
  request.post<any, any>(API.UPDATE_ROLE, data)

export const reqAddRole = (data: any) =>
  request.post<any, any>(API.ADD_ROLE, data)

export const reqDeleteRole = (data: any) =>
  request.post<any, any>(API.DELETE_ROLE, data)

export const reqDetailRole = (params: any) =>
  request.get<any, any>(API.DETAIL, { params })
