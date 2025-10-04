// 导出一个总的注册函数
export function registerAllIpcHandlers(): void {
  console.log('Registering all IPC handlers...')

  // 在这里调用所有模块的注册函数
  // registerSettingsHandlers();
  // registerTagsHandlers();

  console.log('All IPC handlers registered.')
}
