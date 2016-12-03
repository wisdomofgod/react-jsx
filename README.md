A simple jsx-react loader
###

###How to Use
	import { newJsx } from "./jsx";

	newJsx`<div className="test" {...this.props}>
			<p>{this.props.count}</p>
			<button onClick={this.props.onIncreaseClick}>点击</button>
			<p>This is a simple jsx-react loader</p>
		</div>`

###What does it work
	this loader just take the jsx string and return React.createElement()