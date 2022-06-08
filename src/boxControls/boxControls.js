import * as dat from 'dat.gui'

const noop = () => {}

//TODO: handle placement of controls in dice-box dom element - createElement wrapper and appendChild using constructor options
class BoxControls {
	constructor(options){
		this.gui = new dat.GUI({
			autoPlace: true
		})
		this.gui.domElement.parentElement.style.zIndex = 2
		this.config = {
			enableShadows: true,
			shadowTransparency: .8,
			lightIntensity: 1,
			suspendSimulation: false,
			delay: 10,
			gravity: 1,
			mass: 1,
			friction: .8,
			restitution: 0,
			linearDamping: .5,
			angularDamping: .4,
			startingHeight: 8,
			settleTimeout: 5000,
			spinForce: 6,
			throwForce: 5,
			scale: 5,
			themeColor: options.themeColor || '#0974E6',
			theme: options.themes || ['default']
		}
		// callback
		this.onUpdate = options?.onUpdate || noop

		this.init()
	}
	init(){
		const f1 = this.gui.addFolder('Physics')
		f1.add(this.config,'gravity',0,10,1).onChange(this.handleUpdate.bind(this))
		f1.add(this.config,'mass',1,20,1).onChange(this.handleUpdate.bind(this))
		f1.add(this.config,'friction',0,1,.1).onChange(this.handleUpdate.bind(this))
		f1.add(this.config,'restitution',0,1,.1).onChange(this.handleUpdate.bind(this))
		f1.add(this.config,'linearDamping',0,1,.1).onChange(this.handleUpdate.bind(this))
		f1.add(this.config,'angularDamping',0,1,.1).onChange(this.handleUpdate.bind(this))
		f1.add(this.config,'spinForce',0,15,1).onChange(this.handleUpdate.bind(this))
		f1.add(this.config,'throwForce',0,15,1).onChange(this.handleUpdate.bind(this))
		f1.add(this.config,'startingHeight',1,65,1).onChange(this.handleUpdate.bind(this))
		f1.add(this.config,'settleTimeout',1000,20000,1000).onChange(this.handleUpdate.bind(this))
		f1.open()
		
		const f2 = this.gui.addFolder('Rendering')
		f2.add(this.config,'delay',10,500,10).onChange(this.handleUpdate.bind(this))
		f2.add(this.config,'scale',1,10,.1).onChange(this.handleUpdate.bind(this))
		this.themeSelect = f2.add(this.config,'theme', this.config.theme).onChange(this.handleUpdate.bind(this))
		this.themeColorPicker = f2.addColor(this.config, 'themeColor').onChange(this.handleUpdate.bind(this))
		f2.add(this.config,'enableShadows').onChange(this.handleUpdate.bind(this))
		f2.add(this.config,'shadowTransparency',0,1,.01).onChange(this.handleUpdate.bind(this))
		f2.add(this.config,'lightIntensity',0,5,.1).onChange(this.handleUpdate.bind(this))
		f2.add(this.config,'suspendSimulation').onChange(this.handleUpdate.bind(this))
		f2.open()

		this.gui.close()

	}
	handleUpdate(e){
		this.onUpdate(this.config)
	}
}

export default BoxControls