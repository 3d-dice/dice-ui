import './displayResults.css'
import cancelIcon from './icons/cancel.svg'
import checkIcon from './icons/checkmark.svg'
import minusIcon from './icons/minus.svg'

class DisplayResults {
	constructor(selector) {
		this.elem = document.createElement('div');
		this.resultsElem = document.createElement('div')
		this.elem.className = 'displayResults'
		this.resultsElem.className = 'results'
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
		console.log(`data`, data)
		let rolls
		if(data.rolls && !Array.isArray(data.rolls)){
			rolls = Object.values(data.rolls).map(roll => roll)
		} else {
			// rolls = this.recursiveSearch(data,'rolls').flat()
			rolls = Object.values(this.recursiveSearch(data,'rolls')).map(group => {
				return Object.values(group)
			}).flat()
		}

		let total = data.hasOwnProperty('value') ? data.value : rolls.reduce((val,roll) => val + roll.result,0)
		let resultString = ''

		rolls.forEach((roll,i) => {
			let val
			if(i !== 0) {
				resultString += ', '
			}
			
			if(roll.success !== null){
				val = roll.success ? `<svg class="success"><use href="${checkIcon}#checkmark"></use></svg>` : roll.failures > 0 ? `<svg class="failure"><use href="${cancelIcon}#cancel"></use></svg>` : `<svg class="null"><use href="${minusIcon}#minus"></use></svg>`
			} else {
				val = roll.value || roll.result
			}
			let classes = ''

			if(roll.critical === "success" || (roll.result && roll.sides == roll.result)) {
				classes = 'crit-success'
			}
			if(roll.critical === "failure" || (roll.result && roll.result === 1)) {
				classes = 'crit-failure'
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
		this.resultsElem.classList.remove('hideEffect')
		this.resultsElem.classList.add('showEffect')
	}
	clear(){
		this.resultsElem.classList.replace('showEffect','hideEffect')
		setTimeout(()=>this.resultsElem.classList.remove('hideEffect'),this.timeout)
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