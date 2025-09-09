<template>
  <main px-4 py-10 text="center gray-700 dark:gray-200"
    :class="'min-w-[320px] max-w-[1440px] mx-auto sm:px-6 md:px-8 lg:px-10 xl:px-12'">
    <RouterView />
    <TheFooter />
  </main>
</template>