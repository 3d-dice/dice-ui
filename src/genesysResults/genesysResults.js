import './genesysResults.css'
import icons from "./icons/icons.svg"

class GenesysResults {
	constructor(selector) {
		this.target = document.querySelector(selector) || document.body
		this.timeout = 500
		this.elem = document.createElement('div');
		this.elem.className = 'genesysResults'
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
		let rolls = Object.values(this.recursiveSearch(data,'rolls')).map(group => {
			return Object.values(group)
		}).flat()


		let total = data.hasOwnProperty('value') ? data.value : rolls.reduce((val,roll) => val + roll.value,0)
		total = isNaN(total) ? '...' : total

		let resultString = '<div class="values">'
		let totals

		if(typeof total === 'string'){
			total = {}
			
			// count up values
			function logValue(value, dieType) {
				if(value && typeof value === 'string'){
					if(total[value]){
						total[value] = total[value] + 1
					} else {
						total[value] = 1
					}
					const icon = `<svg class="symbol"><use xlink:href="${icons}#${value}" /></svg>`
					resultString += `<span class='die-${dieType}'>${icon}</span>`
				}
			}

			rolls.forEach(roll => {
				const dieType = roll.sides
				// if value is a string
				if(typeof roll.value === 'string'){
					logValue(roll.value, dieType)
				}

				// if value is an array, then loop and count
				if(Array.isArray(roll.value)){
					roll.value.forEach(val => {
						logValue(val, dieType)
					})
				}
			})

			// sort the keys by alpha
			const sortedTotals = Object.fromEntries(Object.entries(total).sort())

			totals = Object.entries(sortedTotals).map(([key,val]) => {
				const icon = `<svg class="symbol"><use xlink:href="${icons}#${key}" /></svg>`
				return `<span><span class="tooltip">${icon}<span class="tooltiptext">${key}</span></span><span class="total">:${val}</span></span>`
			})
			// square options ■ ⬛
			if(!totals.length) {
				totals.push(`<span><span class="tooltip die-blank">⬛<span class="tooltiptext">blank</span></span></span>`)
			}
		}

		resultString += '</div>'

		const totalResults = document.createRange().createContextualFragment(`<div class="totals">${totals.join('')}</div>`)

		const currentElem = this[`resultsElem${this.even ? 2 : 1}`]
		currentElem.innerHTML = resultString
		currentElem.append(totalResults)
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
	recursiveSearch(obj, searchKey, results = [], callback) {
		const r = results;
		Object.keys(obj).forEach(key => {
			const value = obj[key];
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

export default GenesysResults