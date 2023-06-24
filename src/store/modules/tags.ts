import { defineStore } from 'pinia'

const useTagsStore = defineStore('Tags', {
  state: () => {
    return {
      visitedViews: [], // 访问的页面
      cachedViews: [], // keep-alive 页面
    }
  },
  actions: {
    addView(view: any) {
      this.addVisitedView(view)
      this.addCachedView(view)
    },
    addVisitedView(view: any) {
      if (this.visitedViews.some((v) => v.path === view.path)) return
      this.visitedViews.push(
        Object.assign({}, view, {
          title: view.meta.title || 'no-name',
        }),
      )
    },
    addCachedView(view: any) {
      if (this.cachedViews.includes(view.name)) return
      if (!view.meta.noCache) {
        this.cachedViews.push(view.name)
      }
    },
    delView(view: any) {
      return new Promise((resolve) => {
        this.delVisitedView(view)
        this.delCachedView(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews],
        })
      })
    },
    delVisitedView(view: any) {
      return new Promise((resolve) => {
        for (const [i, v] of this.visitedViews.entries()) {
          if (v.path === view.path) {
            this.visitedViews.splice(i, 1)
            break
          }
        }
        resolve([...this.visitedViews])
      })
    },
    delCachedView(view: any) {
      return new Promise((reslove) => {
        const index = this.cachedViews.indexOf(view.name)
        index > -1 && this.cachedViews.splice(index, 1)
        reslove([...this.cachedViews])
      })
    },
    delOthersViews(view) {
      return new Promise((reslove) => {
        this.delOthersVisitedViews(view)
        this.delOthersCachedViews(view)
        reslove({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews],
        })
      })
    },
    delOthersVisitedViews(view) {
      return new Promise((reslove) => {
        this.visitedViews = this.visitedViews.filter((v) => {
          return v.meta.affix || v.path === view.path
        })
        reslove([...this.visitedViews])
      })
    },
    delOthersCachedViews(view) {
      return new Promise((reslove) => {
        const index = this.cachedViews.indexOf(view.name)
        if (index > -1) {
          // 留下当前的
          this.cachedViews = this.cachedViews.slice(index, index + 1)
        } else {
          this.cachedViews = []
        }
        reslove([...this.cachedViews])
      })
    },
    delAllViews() {
      return new Promise((reslove) => {
        this.delAllVisitedViews()
        this.delAllCachedViews()
        reslove({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews],
        })
      })
    },
    delAllVisitedViews() {
      return new Promise((reslove) => {
        const affixTags = this.visitedViews.filter((item) => item.meta.affix)
        this.visitedViews = affixTags
        reslove([...this.cachedViews])
      })
    },
    delAllCachedViews() {
      return new Promise((resolve) => {
        this.cachedViews = []
        resolve([...this.cachedViews])
      })
    },
    updateVisitedView(view: any) {
      for (let v of this.visitedViews) {
        if (v.path === view.path) {
          v = Object.assign(v, view)
          break
        }
      }
    },
    delRightTags(view) {
      return new Promise((reslove) => {
        const index = this.visitedViews.findIndex((v) => v.path === view.path)
        if (index === -1) {
          return
        }
        this.visitedViews = this.visitedViews.filter((item, idx) => {
          if (idx <= index || (item.meta && item.meta.affix)) {
            return true
          }
          const i = this.cachedViews.indexOf(item.name)
          if (i > -1) {
            this.cachedViews.splice(i, 1)
          }
          return false
        })
        reslove([...this.visitedViews])
      })
    },
    delLeftTags(view) {
      return new Promise((reslove) => {
        const index = this.visitedViews.findIndex((v) => v.path === view.path)
        if (index === -1) {
          return
        }
        this.visitedViews = this.visitedViews.filter((item, idx) => {
          if (idx >= index || (item.meta && item.meta.affix)) {
            return true
          }
          const i = this.cachedViews.indexOf(item.name)
          if (i > -1) {
            this.cachedViews.splice(i, 1)
          }
          return false
        })
        reslove([...this.visitedViews])
      })
    },
  },
})
export default useTagsStore
