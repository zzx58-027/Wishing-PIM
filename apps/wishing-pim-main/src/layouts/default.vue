<template>
  <main
    px-4
    py-10
    text="center gray-700 dark:gray-200"
    :class="
      cn([
        'mx-auto',
        'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12',
        // 'min-w-[320px] max-w-[1440px]',
        'min-w-[420px] max-w-[1440px]',
        // 'transition-all duration-300 ease-in-out',
        // 'will-change-auto',
        // 'transform-gpu',
        // 'backface-hidden'
      ])
    "
  >
    <RouterView />
    <TheFooter />
  </main>
</template>
