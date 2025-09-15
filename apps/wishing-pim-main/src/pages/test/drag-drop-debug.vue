<script setup lang="ts">
const fileList = ref<FileWithPath[]>([]);
const isProcessing = ref(false);
const dropZoneRef = ref<HTMLDivElement>();
const debugInfo = ref<string[]>([]);

function addDebugInfo(info: string) {
  debugInfo.value.push(`[${new Date().toLocaleTimeString()}] ${info}`);
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (_, event) => {
    handleDrop(event);
  },
  multiple: true,
  preventDefaultForUnhandled: false,
});

async function handleDrop(event: DragEvent) {
  event.preventDefault();
  isProcessing.value = true;
  debugInfo.value = []; // 清空调试信息
  
  addDebugInfo('开始处理拖拽事件');
  
  const items = event.dataTransfer?.items;
  if (!items) {
    addDebugInfo('错误: 无法获取 dataTransfer.items');
    isProcessing.value = false;
    return;
  }
  
  addDebugInfo(`检测到 ${items.length} 个拖拽项`);
  
  const allFiles: FileWithPath[] = [];
  
  try {
    // 方法1: 使用 Promise.all 并行处理
    const filePromises: Promise<FileWithPath[]>[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      addDebugInfo(`处理第 ${i + 1} 个项目: kind=${item.kind}, type=${item.type}`);
      
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          addDebugInfo(`Entry: name=${entry.name}, isFile=${entry.isFile}, isDirectory=${entry.isDirectory}`);
          
          if (entry.isFile) {
            filePromises.push(
              readFileEntry(entry as FileSystemFileEntry).then(file => 
                file ? [file] : []
              )
            );
          } else if (entry.isDirectory) {
            filePromises.push(
              readDirectoryEntry(entry as FileSystemDirectoryEntry)
            );
          }
        } else {
          addDebugInfo(`警告: 无法获取 entry for item ${i + 1}`);
        }
      }
    }
    
    addDebugInfo(`创建了 ${filePromises.length} 个文件处理 Promise`);
    
    // 等待所有文件处理完成
    const fileArrays = await Promise.all(filePromises);
    
    // 合并所有文件数组
    fileArrays.forEach((files, index) => {
      addDebugInfo(`Promise ${index + 1} 返回了 ${files.length} 个文件`);
      allFiles.push(...files);
    });
    
    fileList.value = allFiles;
    addDebugInfo(`处理完成，总共 ${allFiles.length} 个文件`);
    
  } catch (error) {
    addDebugInfo(`错误: ${error}`);
    console.error("处理文件时出错:", error);
  } finally {
    isProcessing.value = false;
  }
}

// 方法2: 修复原有的串行处理方式
async function handleDropSerial(event: DragEvent) {
  event.preventDefault();
  isProcessing.value = true;
  debugInfo.value = [];
  
  addDebugInfo('开始处理拖拽事件 (串行方式)');
  
  const items = event.dataTransfer?.items;
  if (!items) {
    addDebugInfo('错误: 无法获取 dataTransfer.items');
    isProcessing.value = false;
    return;
  }
  
  addDebugInfo(`检测到 ${items.length} 个拖拽项`);
  
  const allFiles: FileWithPath[] = [];
  
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      addDebugInfo(`处理第 ${i + 1} 个项目: kind=${item.kind}, type=${item.type}`);
      
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          addDebugInfo(`Entry: name=${entry.name}, isFile=${entry.isFile}, isDirectory=${entry.isDirectory}`);
          
          if (entry.isFile) {
            const file = await readFileEntry(entry as FileSystemFileEntry);
            if (file) {
              allFiles.push(file);
              addDebugInfo(`添加文件: ${file.name}`);
            }
          } else if (entry.isDirectory) {
            const files = await readDirectoryEntry(entry as FileSystemDirectoryEntry);
            allFiles.push(...files);
            addDebugInfo(`添加目录中的 ${files.length} 个文件`);
          }
        } else {
          addDebugInfo(`警告: 无法获取 entry for item ${i + 1}`);
        }
      }
    }
    
    fileList.value = allFiles;
    addDebugInfo(`处理完成，总共 ${allFiles.length} 个文件`);
    
  } catch (error) {
    addDebugInfo(`错误: ${error}`);
    console.error("处理文件时出错:", error);
  } finally {
    isProcessing.value = false;
  }
}

function clearFiles() {
  fileList.value = [];
  debugInfo.value = [];
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">拖拽上传调试页面</h1>
    
    <!-- 拖拽区域 -->
    <div
      ref="dropZoneRef"
      :class="[
        'w-full h-48 border-2 border-dashed rounded-lg transition-colors',
        'flex items-center justify-center text-center mb-6',
        isOverDropZone ? 'border-green-500 bg-green-50' : 'border-gray-300',
        isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
    >
      <div>
        <div v-if="isProcessing" class="text-blue-600">
          <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          正在处理文件...
        </div>
        <div v-else class="text-gray-600">
          <div class="text-4xl mb-2">📁</div>
          <p>拖拽多个文件到这里测试</p>
          <p class="text-sm mt-1">支持单个文件、多个文件或整个文件夹</p>
        </div>
      </div>
    </div>
    
    <!-- 控制按钮 -->
    <div class="mb-6 space-x-4">
      <button 
        @click="clearFiles" 
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        清空文件列表
      </button>
    </div>
    
    <!-- 调试信息 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-3">调试信息</h3>
      <div class="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
        <div v-if="debugInfo.length === 0" class="text-gray-500">暂无调试信息</div>
        <div v-for="(info, index) in debugInfo" :key="index" class="text-sm font-mono mb-1">
          {{ info }}
        </div>
      </div>
    </div>
    
    <!-- 文件列表 -->
    <div>
      <h3 class="text-lg font-semibold mb-3">
        已选择的文件 ({{ fileList.length }} 个)
      </h3>
      <div v-if="fileList.length > 0" class="space-y-2">
        <div 
          v-for="(file, index) in fileList" 
          :key="`${file.name}-${index}`"
          class="p-3 border border-gray-200 rounded-lg"
        >
          <div class="font-medium text-sm">{{ file.name }}</div>
          <div class="text-xs text-gray-500 mt-1">
            路径: {{ file.webkitRelativePath || file.fullPath || "根目录" }}
          </div>
          <div class="text-xs text-gray-400">
            大小: {{ formatFileSize(file.size) }} | 类型: {{ file.type || "未知类型" }}
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500 text-center py-8">
        暂无文件
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 添加一些基础样式 */
</style>