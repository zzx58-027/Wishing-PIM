<script setup lang="ts">
import { NButton, NCollapse } from "naive-ui";

// Logic Start
// 文件上传浏览器处理逻辑
const fileList = ref<FileWithPath[]>([]);
const uploadedFilesCount = ref(0);
const handledFilesCount = ref(0);

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

async function handleDrop(event: DragEvent) {
  event.preventDefault();

  const items = event.dataTransfer?.items;
  if (!items) {
    return;
  }

  const allFiles: FileWithPath[] = [];

  try {
    // for 循环配合 await 串行处理每个拖拽项，在处理多个文件时可能出现异步操作的竞态条件
    // 浏览器的 dataTransfer.items 在拖拽事件结束后会被"锁定"，如果处理时间过长，可能导致后续文件无法正确读取
    // 方法1: 使用 Promise.all 并行处理所有文件
    const filePromises: Promise<FileWithPath[]>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        // 使用 webkitGetAsEntry 来支持文件夹
        const entry = item.webkitGetAsEntry();
        if (entry) {
          if (entry.isFile) {
            // 将单个文件包装成数组以统一处理
            filePromises.push(
              readFileEntry(entry as FileSystemFileEntry).then((file) =>
                file ? [file] : []
              )
            );
          } else if (entry.isDirectory) {
            filePromises.push(
              readDirectoryEntry(entry as FileSystemDirectoryEntry)
            );
          }
        }
      }
    }

    // 等待所有文件处理完成
    const fileArrays = await Promise.all(filePromises);

    // 合并所有文件数组
    fileArrays.forEach((files) => {
      allFiles.push(...files);
    });

    fileList.value = allFiles.map((file) => ({
      ...file,
      webkitRelativePath: file.webkitRelativePath || "",
      fullPath: file.webkitRelativePath || "",
    }));
  } catch (error) {
    console.error("处理文件时出错:", error);
  }
}

// 文件上传云端处理逻辑
const filesForUpload = ref<
  { fileKey: string; uploadUrl: string; fileFullPath: string }[]
>([]);

// 向 http://localhost:5174/s3/get-presigned-url 发起请求
async function getPresignedUrls() {
  if (fileList.value.length === 0) return "No files provided.";
  const resp = await fetch("http://localhost:5174/s3/get-presigned-url", {
    method: "POST",
    body: JSON.stringify({
      files: fileList.value.map((fileItem) => ({
        fileKey: crypto.randomUUID(),
        fileFullPath: fileItem.fullPath,
      })),
    }),
  });
  return resp.json();
}

// UX Start
const uploadZoneRef = ref<HTMLDivElement>();
const dropZoneRef = ref<HTMLDivElement>();
const fileActionsZoneRef = ref<HTMLDivElement>();
const uploadZoneElBoundingObj = useElementBounding(uploadZoneRef);
const dropZoneElBoundingObj = useElementBounding(dropZoneRef);
const { isOverDropZone: isOverUploadZone } = useDropZone(uploadZoneRef, {
  onDrop: (_, event) => {
    // 在 dragover / dragenter / dragleave 等过程中，浏览器把内容“锁”起来，读不到真实文件列表（items 为空，files 也是空）。
    // 你在控制台展开事件对象时，往往已经错过了 drop 时机，看到的只是事后快照，于是数组就是空的。
    // 自定义拖拽处理函数，支持文件夹
    handleDrop(event);
  },
  multiple: true,
  preventDefaultForUnhandled: false,
});
// 元素属性变化过渡动画
const tempDropZoneWidth = ref();
watch([isOverUploadZone], () => {
  // 进入上传区域, 区域变大, 并记录进入上传区域前的 dropZone 宽度.
  if (isOverUploadZone.value) {
    tempDropZoneWidth.value = toRaw(dropZoneElBoundingObj.width.value);
    animate(dropZoneRef.value!, {
      duration: 300,
      height: uploadZoneElBoundingObj.height.value,
      width: uploadZoneElBoundingObj.width.value,
      easing: "easeInOutQuad",
    });
  } else {
    // 离开上传区域, 宽度缩小回复
    animate(dropZoneRef.value!, {
      // 已触发有文件状态时, 宽度没有原始需求那么宽, 时间应缩短.
      duration: fileList.value.length === 0 ? 600 : 300,
      height: uploadZoneElBoundingObj.height.value,
      // 回复状态需要在 animate 中状态设置, 这样 anime 才知道需要针对此属性做变化.
      // 默认 Tailwind 配置里，md = 28rem = 448px
      "max-width": "28rem",
      "aspect-ratio": "4/3",
      width: tempDropZoneWidth.value,
      easing: "easeInOutQuad",
    });
    // animeUtils.remove(dropZoneRef.value!)
  }
});
// 格式化总大小显示
const formattedTotalSize = computed(() => {
  return formatFileSize(
    fileList.value.reduce((total, file) => total + file.size, 0)
  );
});
// 文件处理与信息展示
const displayCollapseItemsRef = ref();
// 数值补间动画
watch(
  [fileList, formattedTotalSize],
  ([newFileList, newFilesTotalSize], [oldFileList, oldFilesTotalSize]) => {
    const temp = {
      count: oldFileList.length || 0,
      size: oldFilesTotalSize[0] || 0,
    };
    const $counter = animeUtils.$(".counter");
    const [
      $totalFileCount,
      $totalFileSize,
      $uploadedFilesCount,
      $totalFileCount1,
      $handledFilesCount,
      $totalFileCount2,
    ] = $counter;
    animate(temp, {
      count: newFileList.length,
      size: newFilesTotalSize[0],
      duration: 1000,
      onUpdate: () => {
        if ($counter.length === 6) {
          $totalFileCount.textContent = temp.count.toFixed(0) + "";
          $totalFileSize.textContent = temp.size.toFixed(2);
          $totalFileCount1.textContent = temp.count.toFixed(0) + "";
          $totalFileCount2.textContent = temp.count.toFixed(0) + "";
        }
      },
    });
    // 文件处理与信息展示
    displayCollapseItemsRef.value =
      fileList.value.length === 0 ? "" : "selectedFiles";
  }
);
const testLog = ref(
  "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20\n21\n22\n23\n24\n25\n26\n27\n28\n29\n30"
);
</script>

<template>
  <div class="@container mx-auto">
    <h1
      :class="
        cn([
          'text-xl font-bold py-1 px-4 mb-8 mt-24',
          'border-l-12 border-green',
        ])
      "
    >
      Poole-FTP SPEC 文件解析上传
    </h1>

    <section
      :class="
        cn([
          'w-full',
          'flex gap-6',
          'flex-col items-center sm:flex-row sm:items-stretch ',
        ])
      "
      v-auto-animate
      ref="uploadZoneRef"
    >
      <!-- 拖拽区域 -->
      <div
        @click="openFileUploadDialog()"
        ref="dropZoneRef"
        :class="
          cn([
            'flex items-center justify-center text-center',
            // 'mx-auto',
            'p-8 rounded-lg',
            'cursor-pointer',
            'border-2 border-dashed',
            fileList.length > 0 ? '' : 'mx-auto',
            // 这里的宽度设置用于设置元素的初始形态.
            isOverUploadZone ? '' : 'aspect-4/3 max-w-md w-full',
            isOverUploadZone
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300',
          ])
        "
      >
        <!-- 不在把统计信息放于内, 职责分离, 否则还要解决上传重置等操作, 增加了复杂度 -->
        <div>
          <div class="text-gray-600">
            <div class="text-4xl mb-2">📁</div>
            <p>拖拽文件或文件夹到这里 /</p>
            <p class="text-sm mt-1">可点击选择单个文件夹上传</p>
          </div>
        </div>
      </div>

      <!-- 文件处理区域 -->
      <div
        ref="fileActionsZoneRef"
        v-if="!isOverUploadZone && fileList.length > 0"
        :class="
          cn([
            'flex flex-col w-md sm:w-full',
            'border border-green-500',
            'p-4 rounded-lg',
            'relative overflow-hidden',
          ])
        "
      >
        <div class="flex flex-col gap-2">
          <h1 class="text-lg font-medium">文件统计 | File Statistics</h1>
          <p class="text-sm text-gray-600">
            Total Files:
            <span class="font-mono">
              <span class="counter underline">{{ fileList.length }}</span>
              Items
            </span>
          </p>
          <p class="text-sm text-gray-600">
            Total Size:
            <span class="underline font-mono">
              <span class="counter">{{ formattedTotalSize[0] }}</span>
              {{ formattedTotalSize[1] }}
            </span>
          </p>
          <p class="text-sm text-gray-600">
            Uploaded Files Status:
            <span class="font-mono">
              <span class="counter underline">{{ uploadedFilesCount }} </span>
              /
              <span class="counter underline">{{ fileList.length }} </span>
              Items
            </span>
          </p>
          <p class="text-sm text-gray-600">
            Handled Files Status:
            <span class="font-mono">
              <span class="counter underline">{{ handledFilesCount }} </span>
              /
              <span class="counter underline">{{ fileList.length }} </span>
              Items
            </span>
          </p>
        </div>
        <div class="flex flex-col gap-2 w-full self-end mt-auto pt-2">
          <NButton
            type="primary"
            @click="
              () => {
                displayCollapseItemsRef = 'processLog';
              }
            "
            >上传所有文件</NButton
          >
          <NButton type="primary" :disabled="true">开始文件解析任务</NButton>
        </div>
      </div>
    </section>

    <!-- 信息列表 -->
    <section class="mt-6 w-md sm:w-full mx-auto" v-auto-animate>
      <NCollapse
        accordion
        display-directive="show"
        :expanded-names="displayCollapseItemsRef"
        :on-item-header-click="
          ({ name, expanded }) => {
            if (expanded) displayCollapseItemsRef = name;
            if (!expanded) displayCollapseItemsRef = '';
          }
        "
      >
        <NCollapseItem name="selectedFiles">
          <template #header>
            <h3 class="text-lg font-semibold">
              已选择的文件 ({{ fileList.length }} 个)
            </h3>
          </template>
          <UseVirtualList
            v-if="fileList.length > 0"
            :options="{ itemHeight: 80 }"
            :list="fileList"
            height="400px"
            :class="cn(['*:divide-y *:divide-gray-200 border border-gray-200'])"
          >
            <template #default="{ data: file, index }">
              <div
                :key="`${file.name}-${index}`"
                :class="[
                  'p-3',
                  'hover:bg-gray-50',
                  'flex justify-between items-center',
                  'h-80px box-border',
                  'text-nowrap',
                ]"
              >
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate">
                    <n-ellipsis style="max-width: 258px">
                      {{ file.name }}
                    </n-ellipsis>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    <n-ellipsis style="max-width: 258px">
                      路径:
                      {{ file.webkitRelativePath || file.fullPath || "根目录" }}
                    </n-ellipsis>
                  </div>
                  <div class="text-xs text-gray-400">
                    大小: {{ formatFileSize(file.size).join(" ") }}
                  </div>
                </div>
                <div class="ml-4 text-xs text-gray-400">
                  <n-ellipsis style="max-width: 127px; min-width: 85px">
                    {{ file.type || "未知类型" }}
                  </n-ellipsis>
                </div>
              </div>
            </template>
          </UseVirtualList>
        </NCollapseItem>
        <NCollapseItem name="processLog">
          <template #header>
            <h3 class="text-lg font-semibold">处理日志</h3>
          </template>

          <NLog
            :rows="27"
            :class="cn([' bg-black text-white font-mono'])"
            :log="testLog"
          >
          </NLog>
        </NCollapseItem>
      </NCollapse>
    </section>
  </div>
  <div class="h-42"></div>
</template>

<style scoped lang="css"></style>
