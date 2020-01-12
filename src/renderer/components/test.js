let test1 = "1. 正则2. ```javascript   function isUrl(url) {       const a = document.createElement('a')       a.href = url       return [           /^(http|https):$/.test(a.protocol),           a.host,           a.pathname !== url,           a.pathname !== `/${url}`,       ].find(x => !x) === undefined   }   ```"

let test2 = "1. 正则2. ```javascript   function isUrl(url) {   	const a = document.createElement('a')   	a.href = url   	return [   		/^(http|https):$/.test(a.protocol),   		a.host,   		a.pathname !== url,   		a.pathname !== `/${url}`,   	].find(x => !x) === undefined   }   ```"
