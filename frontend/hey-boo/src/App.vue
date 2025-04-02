<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
};
export function resizeExtensionWindow(width = 800, height = 600) {
  if (chrome && chrome.windows && chrome.windows.getCurrent && chrome.windows.update) {
    chrome.windows.getCurrent(window => {
      chrome.windows.update(window.id, { width, height });
    });
  }
}
</script>
