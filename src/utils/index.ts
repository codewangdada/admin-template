export function generateTree(
  arr: any[],
  idKey = 'id',
  parentIdKey = 'parentId',
  childrenKey = 'children',
) {
  const tree = []
  const map = {}

  for (let i = 0; i < arr.length; i++) {
    const node = arr[i] // 每一项node节点
    const id = node[idKey] // 菜单id
    const parentId = node[parentIdKey] // 菜单父级id

    node[childrenKey] = [] // 每一项的children先置为空数组

    map[id] = node

    if (parentId) {
      map[parentId][childrenKey].push(node)
    } else {
      tree.push(node)
    }
  }

  return tree
}
