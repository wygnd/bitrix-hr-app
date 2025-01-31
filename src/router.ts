import { createRouter, createWebHistory, RouterView, RouteRecordRaw } from 'vue-router'
import { Component } from 'vue'

function buildRoutes(): RouteRecordRaw[] {
  const alreadyAdded = new Set()
  let routes: RouteRecordRaw[] = []
  let routesByPath = new Map()
  
  function titleCase(str: string): string {
    return str
      .toLocaleLowerCase()
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  /**
   * 1. Get all the pages in the src/pages directory
   */
  let files = Object.entries(
    import.meta.glob('./pages/**/*.vue', {
      eager: true,
      import: 'default',
    })
  ) as [string, Component][]
  
  /**
   * 2.a. Swap the file names for route urls
   * 2.b. Resolve the default import for each page
   */
  files = files.map(([file, page]) => [
    file
      .replace('./pages/', '/')
      .replace(/\.vue$/, '')
      .toLocaleLowerCase()
      .replace(/^\/home$/g, '/'),
    page,
  ])
  
  /**
   * 3. Add a route for each directory (if not already added)
   */
  files = files.flatMap((entry) => {
    const dirs = entry[0].split('/').slice(1, -1)
    
    const paths: [string, Component][] = []
    
    for (const [idx] of dirs.entries()) {
      let path = `/` + dirs.slice(0, idx + 1).join('/')
      if (alreadyAdded.has(path)) {
        continue
      }
      
      paths.push([path, RouterView])
      alreadyAdded.add(path)
    }
    
    return [...paths, entry]
  })
  
  /**
   * 4. Sort the routes alphabetically and by length
   */
  files.sort((a, b) => a[0].localeCompare(b[0]))
  
  /**
   * 5. Create the nested routes
   */
  for (let [path, page] of files) {
    const prefix = path.split('/').slice(0, -1).join('/')
    const parent: RouteRecordRaw[] = routesByPath.has(prefix)
      ? routesByPath.get(prefix).children
      : routes
    
    const route = {
      path,
      component: page,
      children: [],
      meta: {
        name: titleCase(path.match(/[^/]+$/)?.[0] ?? 'Home'),
        isRoot: parent === routes
      }
    }
    
    routesByPath.set(path, route)
    
    parent.push(route)
  }
  
  return routes
}

export default createRouter({
	routes: buildRoutes(),
	history: createWebHistory()
})