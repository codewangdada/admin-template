//创建用户相关的小仓库
import { defineStore } from 'pinia'
//引入接口
import { reqLogin, reqUserInfo, reqLogout } from '@/api/user'
import type {
  loginFormData,
  loginResponseData,
  userInfoReponseData,
} from '@/api/user/type'
import type { UserState } from './types/type'
//引入操作本地存储的工具方法
import { SET_TOKEN, GET_TOKEN, REMOVE_TOKEN } from '@/utils/token'
//引入路由(常量路由)
import { constantRoute, anyRoute } from '@/router/routes'
import { generateTree } from '@/utils'

const modules = import.meta.glob('../../views/**/*.vue')

import router from '@/router'

//创建用户小仓库
const useUserStore = defineStore('User', {
  //小仓库存储数据地方
  state: (): UserState => {
    return {
      token: GET_TOKEN(), //用户唯一标识token
      menuRoutes: constantRoute, //仓库存储生成菜单需要数组(路由)
      username: '',
      avatar: '',
      //存储当前用户是否包含某一个按钮
      buttons: [],
    }
  },
  //异步|逻辑的地方
  actions: {
    //用户登录的方法
    async userLogin(data: loginFormData) {
      //登录请求
      const result: loginResponseData = await reqLogin(data)
      //登录请求:成功200->token
      //登录请求:失败201->登录失败错误的信息
      if (result.code == 200) {
        //pinia仓库存储一下token
        //由于pinia|vuex存储数据其实利用js对象
        this.token = result.data as string
        //本地存储持久化存储一份
        SET_TOKEN(result.data as string)
        //能保证当前async函数返回一个成功的promise
        return 'ok'
      } else {
        return Promise.reject(new Error(result.data))
      }
    },
    //获取用户信息方法
    async userInfo() {
      //获取用户信息进行存储仓库当中[用户头像、名字]
      const result: userInfoReponseData = await reqUserInfo()
      //如果获取用户信息成功，存储一下用户信息
      const treeData = generateTree(result.data.routes, 'menu_id', 'parent_id')

      const data = generator(treeData)

      if (result.code == 200) {
        this.username = result.data.username
        this.avatar = result.data.avatar
        this.buttons = result.data.buttons

        //菜单需要的数据整理完毕
        this.menuRoutes = [...constantRoute, ...data, anyRoute]

        //目前路由器管理的只有常量路由:用户计算完毕异步路由、任意路由动态追加
        ;[...data, anyRoute].forEach((route: any) => {
          router.addRoute(route)
        })
        return 'ok'
      } else {
        return Promise.reject(new Error(result.message))
      }
    },
    //退出登录
    async userLogout() {
      this.token = ''
      this.username = ''
      this.avatar = ''
      REMOVE_TOKEN()
      return 'ok'
      // //退出登录请求
      // const result: any = await reqLogout()
      // if (result.code == 200) {
      //   //目前没有mock接口:退出登录接口(通知服务器本地用户唯一标识失效)
      //   this.token = ''
      //   this.username = ''
      //   this.avatar = ''
      //   REMOVE_TOKEN()
      //   return 'ok'
      // } else {
      //   return Promise.reject(new Error(result.message))
      // }
    },
  },
  getters: {},
})
//对外暴露获取小仓库方法
export default useUserStore

function generator(arr: Array<any>) {
  return arr.map((item) => {
    const { path, component, menu_name, icon, children, visible, is_cache } =
      item
    const currentRouter = {
      path,
      name: path,
      meta: {
        title: menu_name,
        icon,
        hidden: visible === 1,
        noCache: is_cache === 1,
      },
    }
    currentRouter.component = loadView(component)
    if (children && children.length) {
      currentRouter.children = generator(item.children)
    }
    return currentRouter
  })
}

function loadView(view: string) {
  let res
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0]
    if (dir === view) {
      res = modules[path]
    }
  }

  return res || (() => import(`@/layout/index.vue`))
}
