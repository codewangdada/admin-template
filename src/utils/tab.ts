import useTagsStore from '@/store/modules/tags'
import router from '@/router'

export default {
  refreshPage(obj: any) {
    return useTagsStore()
      .delCachedView(obj)
      .then(() => {
        const { path, query } = obj
        router.replace({
          path: '/redirect' + path,
          query: query,
        })
      })
  },
  closePage(view: any) {
    return useTagsStore().delView(view)
  },
  closeAllPage() {
    return useTagsStore().delAllViews()
  },
  closeLeftPage(obj: any) {
    return useTagsStore().delLeftTags(obj)
  },
  closeRightPage(obj: any) {
    return useTagsStore().delRightTags(obj)
  },
  closeOtherPage(obj: any) {
    return useTagsStore().delOthersViews(obj)
  },
}
