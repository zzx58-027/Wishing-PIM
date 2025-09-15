export interface FileWithPath extends File {
  webkitRelativePath: string;
  fullPath?: string;
}

// 格式化文件大小
export function formatFileSize(bytes: number): [number, string] {
  if (bytes === 0) return [0, "B"];
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  return [parseFloat((bytes / Math.pow(k, i)).toFixed(2)), sizes[i]];
}

// 递归读取文件夹中的所有文件
export async function readDirectoryEntry(
  directoryEntry: FileSystemDirectoryEntry
): Promise<FileWithPath[]> {
  const reader = directoryEntry.createReader();
  const files: FileWithPath[] = [];

  return new Promise((resolve) => {
    const readEntries = () => {
      reader.readEntries(async (entries) => {
        if (entries.length === 0) {
          resolve(files);
          return;
        }

        for (const entry of entries) {
          if (entry.isFile) {
            const file = await readFileEntry(entry as FileSystemFileEntry);
            if (file) {
              files.push(file);
            }
          } else if (entry.isDirectory) {
            const subFiles = await readDirectoryEntry(
              entry as FileSystemDirectoryEntry
            );
            files.push(...subFiles);
          }
        }

        // 浏览器兼容性描述
        // 在 Chrome 77 上，readEntries() 只会返回前 100 个 FileSystemEntry 实例。为了获取所有的实例，请多次调用 readEntries()。
        readEntries();
      });
    };
    readEntries();
  });
}

// 读取单个文件
export function readFileEntry(
  fileEntry: FileSystemFileEntry
): Promise<FileWithPath | null> {
  return new Promise((resolve) => {
    fileEntry.file(
      (file) => {
        // File 对象的属性是 不可枚举 的（non-enumerable），所以 ...file 或 Object.assign 都无法复制它们。!!!
        // 创建一个新对象，直接扩展原始 File 对象
        const { name, size, type, lastModified } = file;
        const fileWithPath = {
          ...file,
          name,
          size,
          type,
          lastModified,
          webkitRelativePath: fileEntry.fullPath.substring(1), // 移除开头的 '/'
          fullPath: fileEntry.fullPath,
          // 保持 File 对象的方法
          arrayBuffer: file.arrayBuffer.bind(file),
          slice: file.slice.bind(file),
          stream: file.stream.bind(file),
          text: file.text.bind(file),
        } as FileWithPath;

        resolve(fileWithPath);
      },
      () => {
        resolve(null);
      }
    );
  });
}
