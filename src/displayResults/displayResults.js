import './displayResults.css'
import cancelIcon from './icons/cancel.svg'
import checkIcon from './icons/checkmark.svg'
import minusIcon from './icons/minus.svg'

class DisplayResults {
	constructor(selector) {
		this.target = document.querySelector(selector) || document.body
		this.timeout = 500
		this.elem = document.createElement('div');
		this.elem.className = 'displayResults'
		this.resultsElem1 = document.createElement('div')
		this.resultsElem1.className = 'results hidden'
		this.resultsElem1.style.transition = `all ${this.timeout}ms`
		this.resultsElem2 = document.createElement('div')
		this.resultsElem2.className = 'results hidden'
		this.resultsElem2.style.transition = `all ${this.timeout}ms`
		this.init()
	}

	async init(){
		this.elem.append(this.resultsElem1)
		this.elem.append(this.resultsElem2)
		this.target.prepend(this.elem)
		this.resultsElem1.addEventListener('click', () => this.clear())
		this.resultsElem2.addEventListener('click', () => this.clear())
		this.even = false
	}

	showResults(data){
		this.clear(this[`resultsElem${this.even ? 1 : 2}`])
		let rolls
		if(data.rolls && !Array.isArray(data.rolls)){
			rolls = Object.values(data.rolls).map(roll => roll)
		} else {
			// rolls = this.recursiveSearch(data,'rolls').flat()
			rolls = Object.values(this.recursiveSearch(data,'rolls')).map(group => {
				return Object.values(group)
			}).flat()
		}

		let total = 0
		if(data.hasOwnProperty('value')) {
			total = data.value
		} else { 
			total = rolls.reduce((val,roll) => val + roll.value,0)
			let modifier = data.reduce((val,roll) => val + roll.modifier,0)
			total += modifier
		}

		total = isNaN(total) ? '...' : total

		if(typeof total === 'string'){
			const counter = {}
			
			// count up values
			function logValue(value) {
				if(value && typeof value === 'string'){
					if(counter[value]){
						counter[value] = counter[value] + 1
					} else {
						counter[value] = 1
					}
				}
			}
			rolls.forEach(roll => {
				// if value is a string
				if(typeof roll.value === 'string'){
					logValue(roll.value)
				}

				// if value is an array, then loop and count
				if(Array.isArray(roll.value)){
					roll.value.forEach(val => {
						logValue(val)
					})
				}
			})

			// clear total
			total = ''

			// sort the keys by alpha
			const sortedCounter = Object.fromEntries(Object.entries(counter).sort())

			// build the result
			Object.entries(sortedCounter).forEach(([key,val],i) => {
				if(i!==0){
					total += ', '
				}
				total += key + ": " + val
			})

		}


		let resultString = ''

		rolls.forEach((roll,i) => {
			let val
			let sides = roll.die || roll.sides || 'fate'

			if(i !== 0 && resultString.length) {
				if(typeof roll.value !== 'undefined' && (roll.value.length || typeof roll.value === 'number')) {
					resultString += ', '
				}
			}

			if(roll.success !== undefined && roll.success !== null){
				val = roll.success ? `<svg class="success"><use href="${checkIcon}#checkmark"></use></svg>` : roll.failures > 0 ? `<svg class="failure"><use href="${cancelIcon}#cancel"></use></svg>` : `<svg class="null"><use href="${minusIcon}#minus"></use></svg>`
			} else {
				// convert to string in case value is 0 which would be evaluated as falsy
				val = roll.hasOwnProperty('value') ? roll.value.toString() : '...'
				// space comma separated values from arrays
				if(val.includes(',')){
					val = val.replace(',', ', ')
				}
			}

			let classes = `d${sides}`

			if(roll.critical === "success" || (roll.hasOwnProperty('value') && sides == roll.value)) {
				classes += ' crit-success'
			}
			if(roll.critical === "failure" || (roll.success === null && roll.hasOwnProperty('value') && roll.value <= 1 && sides !== 'fate')) {
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
			if(sides === 'fate'){
				if(roll.value === 1){
					classes += ' crit-success'
				}
				if(roll.value === -1){
					classes += ' crit-failure'
				}
			}

			if(val && classes !== ''){
				val = `<span class='${classes.trim()}'>${val}</span>`
			}

			resultString += val
		})
		resultString += ` = <strong>${total}</strong>`

		const currentElem = this[`resultsElem${this.even ? 2 : 1}`]
		currentElem.innerHTML = resultString
		// this.resultsElem.classList.remove('hideEffect')
		clearTimeout(currentElem.hideTimer)
		currentElem.classList.add('showEffect')
		currentElem.classList.remove('hidden')
		currentElem.classList.remove('hideEffect')
		this.even = !this.even

	}
	clear(elem){
		const currentElem = elem || this[`resultsElem${this.even ? 1 : 2}`]
		currentElem.classList.replace('showEffect','hideEffect')
		this.even = !this.even
		currentElem.hideTimer = setTimeout(()=>currentElem.classList.replace('hideEffect', 'hidden'),this.timeout)
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