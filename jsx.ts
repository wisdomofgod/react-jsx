export function wisJsx(parts: any, ...params: any[]): any {
	let template = parts[0];
	let reg = /\<([^\s|^\/][\s\S]*?)\>/;
	let reg2 = /\<[\/][\s\S]+?\>/;
	let doc = Object();
	if (reg.test(template)) {
		template.replace(reg, function(...args: any[]) {
			let tag = args[1];
			let tags = tag.split(' ');
			doc.tag = tags[0] ? tags[0] : args[1];

			let pros = getPros(tags);
			doc.options = pros;
			doc.props = {};

			let newTemplate = template.substr(args[2] + args[0].length)
			let startDiv = -1, startChild = -1;
			let children: any;
			let childrens = Object();

			newTemplate.replace(reg, function(...g: any[]) {
				startDiv = g[2];
			})
			newTemplate.replace(reg2, function(...g: any[]) {
				startChild = g[1];
			})
			if (startDiv !== -1 && startDiv < startChild) {
				children = wisJsx([newTemplate]);
				children = Array.prototype.concat.call(children, wisJsx([newTemplate.substr(startChild)]));
			} else {
				children = getChildren(newTemplate.substr(0, startChild));
			}
			doc.props.children = children; 

		});
	}
	return doc;
}

function getChildren(template: string): any {
	let reg3 = /([\s\S]*)\{([\s\S]*?)\}([\s\S]*)/;
	let children = Object();
	if (reg3.test(template)) {
		template.replace(reg3, function(...args: any[]) : any {
			children = args.splice(1,3);
		});
	} else {
		children = [template];
	}
	return children;
}

function getPros(pros: any): any{
	let reg = /\{([\s\S]*)\}/;
	let reg2 = /\t*([\s\S]+)\=([\s\S]+)/;
	let props = pros;

	props.shift();
	props.forEach((s: any, index: number) => {
		if (reg2.test(s)) {
			s.replace(reg2, function(r: string, r1: string, r2: string,...args: any[]) {
				let obj = Object();
				r2 = r2.replace(reg, function(a: string,b: string) {
					return b;
				});
				obj[r1] = r2;
				props[index] = obj;
			});
		} else if (reg.test(s)) {
			props[index] = s.replace(reg, `$1`);
		}
	});
	return props;
}

function getOptions(options?: any): any{
	if (!options || typeof options === "undefined" || options.length === 0) {
		return null;
	}
	if (options.length === 1) {
		let key = Object.keys(options[0]);
		return `\{${key[0]}: ${options[0][key[0]]}\}`;
	}

	let string = "extend({}";

	options.forEach((option: any) => {
		if (typeof option === "object") {
			let key = Object.keys(option);
			string += `, \{${key[0]}: ${option[key[0]]}\}`;
		} else if(typeof option === "string") {
			if (option.indexOf("...") > -1) {
				option = option.replace("...", "");
			}
			string += `, ${option}`;
		}
	})
	string += ")";

	console.log(string);
	return string;
}

var stringFunc = (str: string, node: any): any => {
        str = `React.createElement("${node.tag}", ${getOptions(node.options)}`;
        if (node.props.children.length > 0) {
            node.props.children.forEach((item: any) => {
                if (typeof item === 'string') {
                	if (item.indexOf('this') > -1) {
                		var args = item.split('.');
                		str += ', ' + item;
                		//str += ', "' + item + '"';
                	}else{
                		str += ', "' + item + '"';
                	}
                }else if(typeof item === 'object') {
                    str += ', ' + stringFunc('', item);
                }
            });
        }
        str += ")";
        return str;
    }


export var newJsx = function(parts: any, ...params: any[]): any{
		var react   = wisJsx(parts, params);
        var test = Object();
        var s = `test = function()\{
            return function() \{
                return ${stringFunc('', react)}; \};
            \};`;
        eval(s);
        return test;
}