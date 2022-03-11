import './displayResults.css'
import cancelIcon from './icons/cancel.svg'
import checkIcon from './icons/checkmark.svg'
import minusIcon from './icons/minus.svg'

class DisplayResults {
	constructor(selector) {
		this.elem = document.createElement('div');
		this.resultsElem = document.createElement('div')
		this.elem.className = 'displayResults'
		this.resultsElem.className = 'results hidden'
		this.timeout = 500
		this.target = document.querySelector(selector) || document.body
		this.init()
	}

	async init(){
		this.elem.append(this.resultsElem)
		this.target.prepend(this.elem)
		this.resultsElem.addEventListener('click', () => this.clear())
	}

	showResults(data){
		// console.log(`data`, data)
		let rolls
		if(data.rolls && !Array.isArray(data.rolls)){
			rolls = Object.values(data.rolls).map(roll => roll)
		} else {
			// rolls = this.recursiveSearch(data,'rolls').flat()
			rolls = Object.values(this.recursiveSearch(data,'rolls')).map(group => {
				return Object.values(group)
			}).flat()
		}

		let total = data.hasOwnProperty('value') ? data.value : rolls.reduce((val,roll) => val + roll.value,0)
		let resultString = ''

		rolls.forEach((roll,i) => {
			let val
			if(i !== 0) {
				resultString += ', '
			}

			if(roll.success !== undefined && roll.success !== null){
				val = roll.success ? `<svg class="success"><use href="${checkIcon}#checkmark"></use></svg>` : roll.failures > 0 ? `<svg class="failure"><use href="${cancelIcon}#cancel"></use></svg>` : `<svg class="null"><use href="${minusIcon}#minus"></use></svg>`
			} else {
				// convert to string in case value is 0 which would be evaluated as falsy
				val = roll.value.toString()
			}
			let classes = `d${roll.die}`

			if(roll.critical === "success" || (roll.hasOwnProperty('value') && roll.sides == roll.value)) {
				classes += ' crit-success'
			}
			if(roll.critical === "failure" || (roll.hasOwnProperty('value') && roll.value <= 1)) {
				classes += ' crit-failure'
			}
			if(roll.drop) {
				classes += ' die-dropped'
			}
			if(roll.reroll) {
				classes += ' die-rerolled'
			}
			if(roll.explode) {
				classes += ' die-exploded'
			}

			if(classes !== ''){
				val = `<span class='${classes.trim()}'>${val}</span>`
			}

			resultString += val
		})
		resultString += ` = <strong>${total}</strong>`

		this.resultsElem.innerHTML = resultString
		if(!this.resultsElem.style.transition) {
			this.resultsElem.style.transition = `all ${this.timeout}ms`
		}
		// this.resultsElem.classList.remove('hideEffect')
		this.resultsElem.classList.replace('hidden','showEffect')
	}
	clear(){
		this.resultsElem.classList.replace('showEffect','hideEffect')
		setTimeout(()=>this.resultsElem.classList.replace('hideEffect', 'hidden'),this.timeout)
	}
	// make this static for use by other systems?
	recursiveSearch(obj, searchKey, results = [], callback) {
		const r = results;
		Object.keys(obj).forEach(key => {
			const value = obj[key];
			// if(key === searchKey && typeof value !== 'object'){
			if(key === searchKey){
				r.push(value);
				if(callback && typeof callback === 'function') {
					callback(obj)
				}
			} else if(value && typeof value === 'object'){
				this.recursiveSearch(value, searchKey, r, callback);
			}
		});
		return r;
	}
}

export default DisplayResults