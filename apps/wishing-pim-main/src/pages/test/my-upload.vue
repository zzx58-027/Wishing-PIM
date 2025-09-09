<script setup lang="ts">
const fileList = ref<FileWithPath[]>([]);
const isProcessing = ref(false);
const dropZoneRef = ref<HTMLDivElement>();

const { open: openFileUploadDialog, onChange: onSelectedFolderChange } =
  useFileDialog({
    directory: true, // Select directories instead of files if set true
  });
onSelectedFolderChange((files) => {
  fileList.value = files
    ? Array.from(files).map((file) => {
        const { name, size, type, lastModified } = file;
        return {
          ...file,
          name,
          size,
          type,
          lastModified,
          webkitRelativePath: file.webkitRelativePath || "",
          fullPath: file.webkitRelativePath || "",
        };
      })
    : [];
});
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (_, event) => {
    // 在 dragover / dragenter / dragleave 等过程中，浏览器把内容“锁”起来，读不到真实文件列表（items 为空，files 也是空）。
    // 你在控制台展开事件对象时，往往已经错过了 drop 时机，看到的只是事后快照，于是数组就是空的。
    // 自定义拖拽处理函数，支持文件夹
    handleDrop(event);
  },
  multiple: true,
  preventDefaultForUnhandled: false,
});
async function handleDrop(event: DragEvent) {
  event.preventDefault();
  isProcessing.value = true;

  const items = event.dataTransfer?.items;
  if (!items) {
    isProcessing.value = false;
    return;
  }

  const allFiles: FileWithPath[] = [];

  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        // 使用 webkitGetAsEntry 来支持文件夹
        const entry = item.webkitGetAsEntry();
        if (entry) {
          if (entry.isFile) {
            const file = await readFileEntry(entry as FileSystemFileEntry);
            if (file) {
              allFiles.push(file);
            }
          } else if (entry.isDirectory) {
            const files = await readDirectoryEntry(
              entry as FileSystemDirectoryEntry
            );
            allFiles.push(...files);
          }
        }
      }
    }

    fileList.value = allFiles;
    console.log(fileList.value);
    console.log("处理完成，共", allFiles.length, "个文件");
  } catch (error) {
    console.error("处理文件时出错:", error);
  } finally {
    isProcessing.value = false;
  }
}

// const { list, containerProps, wrapperProps } = useVirtualList(fileList, {
//   itemHeight: 22,
// });
</script>

<template>
  <div class="upload-container">
    <!-- 拖拽区域 -->
    <div
      ref="dropZoneRef"
      @click="openFileUploadDialog()"
      :class="
        cn([
          'aspect-4/3 w-full max-w-md mx-auto p-8 border-2 border-dashed rounded-lg transition-colors',
          'flex items-center justify-center text-center',
          isOverDropZone ? 'border-green-500 bg-green-50' : 'border-gray-300',
          isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ])
      "
    >
      <div>
        <div v-if="isProcessing" class="text-blue-600">
          <div
            class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"
          ></div>
          正在处理文件...
        </div>
        <div v-else class="text-gray-600">
          <div class="text-4xl mb-2">📁</div>
          <p>拖拽文件或文件夹到这里</p>
          <p class="text-sm mt-1">支持单个文件、多个文件或整个文件夹</p>
        </div>
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-3">
        已选择的文件 ({{ fileList.length }} 个)
      </h3>
      <UseVirtualList
        v-if="fileList.length > 0"
        :options="{ itemHeight: 80 }"
        :list="fileList"
        height="400px"
      >
        <template #default="{ data: file, index }">
          <div
            :key="`${file.name}-${index}`"
            :class="[
              'p-3',
              'hover:bg-gray-50',
              'flex justify-between items-center',
              'border-b border-gray-200',
              'h-80px box-border'
            ]"
          >
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm truncate">
                {{ file.name }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                路径: {{ file.webkitRelativePath || file.fullPath || "根目录" }}
              </div>
              <div class="text-xs text-gray-400">
                大小: {{ formatFileSize(file.size) }}
              </div>
            </div>
            <div class="ml-4 text-xs text-gray-400">
              {{ file.type || "未知类型" }}
            </div>
          </div>
        </template>
      </UseVirtualList>
    </div>
  </div>
</template>

<style scoped lang="css"></style>
