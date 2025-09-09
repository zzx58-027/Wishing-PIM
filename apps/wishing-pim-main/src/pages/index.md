# Hello

<RouterLink to="/test">Test</RouterLink>

# Radash 所有函数获取
<pre>{{radashFunctions}}</pre>

<script setup lang="ts">
import * as radash from 'radash'

// 自动扫描 radash 所有函数导出
const radashFunctions = Object.keys(radash).filter(
  key => typeof (radash as any)[key] === 'function'
)
</script>

<style lang="css" scoped>
  h1 {
      font-size: 2rem
  }
</style>