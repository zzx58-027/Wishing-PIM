```ts
// Naive Loading Bar usage demo.
const FileActionsTrigger = defineComponent(
  (props) => {
    const loadingBar = useLoadingBar();
    return () => {
      return h(
        "div",
        {
          class: props.class,
        },
        {
          default: () => [
            h(
              NButton,
              {
                secondary: true,
                type: "primary",
                onClick: () => {
                  loadingBar.start()
                  setTimeout(() => {
                    loadingBar.finish()
                  }, 2000)
                },
              },
              "上传所有文件"
            ),
            h(
              NButton,
              {
                type: "primary",
                disabled: true,
              },
              {
                default: () => "开始文件解析任务",
              }
            ),
          ],
        }
      );
    };
  },
  {
    props: {
      class: {
        type: String,
        default: "",
      },
    },
  }
);
```