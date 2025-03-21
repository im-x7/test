/**
 * 性能优化工具函数
 * 提供requestAnimationFrame、任务分割和Web Worker相关的工具函数
 */

/**
 * 使用requestAnimationFrame处理视觉更新
 * @param callback 需要执行的回调函数
 */
export const scheduleVisualUpdate = (callback: () => void): void => {
  requestAnimationFrame(() => {
    callback();
  });
};

/**
 * 将大型任务分割成小块执行，避免长时间阻塞主线程
 * @param items 需要处理的数据项数组
 * @param processItem 处理单个数据项的函数
 * @param chunkSize 每次处理的数据项数量
 * @param onComplete 所有数据处理完成后的回调函数
 */
export const processInChunks = <T>(
  items: T[],
  processItem: (item: T) => void,
  chunkSize: number = 10,
  onComplete?: () => void
): void => {
  if (!items.length) {
    onComplete?.();
    return;
  }

  let index = 0;

  const processChunk = () => {
    const start = performance.now();
    
    while (index < items.length) {
      processItem(items[index]);
      index++;
      
      // 如果处理时间超过5ms，则暂停并在下一帧继续
      if (performance.now() - start > 5) {
        break;
      }
      
      // 如果已处理的数量达到chunkSize，则暂停
      if (index % chunkSize === 0) {
        break;
      }
    }

    if (index < items.length) {
      requestAnimationFrame(processChunk);
    } else {
      onComplete?.();
    }
  };

  requestAnimationFrame(processChunk);
};

/**
 * 创建并使用Web Worker处理复杂计算
 * @param workerFunction 要在Worker中执行的函数代码（字符串形式）
 * @param data 传递给Worker的数据
 * @returns Promise，解析为Worker返回的结果
 */
export const runInWorker = <T, R>(
  workerFunction: string,
  data: T
): Promise<R> => {
  return new Promise((resolve, reject) => {
    // 创建一个包含worker代码的Blob
    const blob = new Blob(
      [
        `self.onmessage = function(e) {
          const result = (${workerFunction})(e.data);
          self.postMessage(result);
          self.close();
        }`
      ],
      { type: 'application/javascript' }
    );

    // 从Blob创建Worker
    const worker = new Worker(URL.createObjectURL(blob));

    // 设置消息处理程序
    worker.onmessage = (e) => {
      resolve(e.data as R);
      worker.terminate();
    };

    worker.onerror = (e) => {
      reject(new Error(`Worker error: ${e.message}`));
      worker.terminate();
    };

    // 发送数据到Worker
    worker.postMessage(data);
  });
};

/**
 * 延迟执行函数，但如果在延迟期间有新的调用，则取消之前的调用
 * @param fn 需要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
};

/**
 * 使用requestIdleCallback在浏览器空闲时执行任务
 * 如果浏览器不支持requestIdleCallback，则降级为setTimeout
 * @param callback 需要执行的回调函数
 * @param options 配置选项
 */
export const runWhenIdle = (
  callback: () => void,
  options?: { timeout?: number }
): void => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, options);
  } else {
    // 降级处理，使用setTimeout
    setTimeout(callback, options?.timeout || 1);
  }
};