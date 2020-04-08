interface Window {
	ReactNativeWebView: {
		postMessage(data: string): void;
	};
	[key: string]: unknown;
}

declare const window: Window;

/**
 * 调用原生响应
 */
export default function fire<T>(action: string, message: unknown, timeout: number) {
	if (!window.ReactNativeWebView) {
		// console.error('Make sure you are in App');
		return Promise.resolve(null as unknown as T);	// 只是为了保证不在原生应用中调用时不出错
	}
	const content = JSON.stringify(message === undefined ? null : message);
	const id = uuid();
	const msg = {
		action,	// a001
		content,
		id,
		type: 1 	// MessageType.web2native
	};
	const fun_name = `m${id}`;
	window.ReactNativeWebView.postMessage(JSON.stringify(msg));
	return new Promise<T>((res, rej) => {
		window[fun_name] = (result: string) => {
			res(JSON.parse(result === undefined ? 'null' : result) as T);
			delete window[fun_name];
		};
		setTimeout(() => {
			delete window[fun_name];
			rej(new Error('Timeout'));
		}, timeout);
	});
}

function uuid() {
	return Math.random().toString().substr(2);
}
